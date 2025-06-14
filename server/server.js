require('dotenv').config();

const cors = require('cors');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db'); // your MySQL connection pool
const multer = require('multer');

const app = express();
const upload = multer(); // default memory storage
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Middleware to authenticate JWT token and attach user object
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.userId };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Register new user
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [
      username,
      hashedPassword,
    ]);
    res.json({ message: 'User registered' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username already taken' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });

  try {
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) return res.status(400).json({ error: 'User not found' });

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Incorrect password' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get dolls for logged-in user
app.get('/api/dolls', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // consistently use req.user.id
    const [rows] = await db.query(
      'SELECT id, FirstName, LastName, Category, Year, Bought, MarketPrice FROM dolls WHERE user_id = ?',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a doll for logged-in user
app.post('/api/dolls', upload.single('picture'), authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // consistently use req.user.id
    const { FirstName, LastName, Category, Year, Bought, MarketPrice } = req.body;
    const picture = req.file ? req.file.buffer : null;

    await db.query(
      `INSERT INTO dolls (user_id, FirstName, LastName, Category, Year, Bought, MarketPrice, Pic)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, FirstName, LastName, Category, Year, Bought, MarketPrice, picture]
    );
    res.json({ message: 'Doll added' });
  } catch (err) {
    console.error('Error adding doll:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get picture of a doll for logged-in user
app.get('/api/dolls/:id/picture', authenticateToken, async (req, res) => {
  const dollId = req.params.id;
  const userId = req.user.id; // consistently use req.user.id

  try {
    const [rows] = await db.query(
      'SELECT Pic FROM dolls WHERE id = ? AND user_id = ?',
      [dollId, userId]
    );

    if (rows.length === 0 || !rows[0].Pic) {
      return res.status(404).send('Image not found');
      
    }
    else{
        console.log("image");
    }

    res.set('Content-Type', 'image/jpeg'); // adjust content type if necessary
    res.send(rows[0].Pic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());              // Allow cross-origin requests
app.use(express.json());      // Parse JSON request bodies

// ✅ Simple working route
app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Test User', email: 'test@example.com' },
    { id: 2, name: 'Second User', email: 'second@example.com' }
  ]);
});

app.listen(PORT, () => {
  console.log(`✅ Test server running at http://localhost:${PORT}`);
});

import React, { useState, useEffect } from 'react';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [dolls, setDolls] = useState([]);
  const [formType, setFormType] = useState('login'); // 'login' or 'register'
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [newDoll, setNewDoll] = useState({
    FirstName: '',
    LastName: '',
    Category: '',
    Year: '',
    Bought: '',
    MarketPrice: ''
  });
  const [error, setError] = useState('');

  // Fetch dolls when logged in
  useEffect(() => {
    
    if (!token) {
    console.log('No token, user not logged in');
    setDolls([]);
    return;
  }
  console.log(token);
    fetch('http://localhost:3001/api/dolls', {
  headers: { Authorization: `Bearer ${token}` },
})
      .then(res => res.json())
      .then(setDolls)
      .catch(err => setError(err.message));
  }, [token]);

  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint =
        formType === 'register' ? '/api/register' : '/api/login';

      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Authentication failed');
      }

      if (formType === 'login') {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
        console.log(token);
      } else {
        alert('User registered. Now log in.');
        setFormType('login');
      }

      setAuthForm({ username: '', password: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setDolls([]);
  };



function DollImage({ dollId, token }) {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (!token || !dollId) return;

    fetch(`http://localhost:3001/api/dolls/${dollId}/picture`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load image');
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setImageSrc(url);
      })
      .catch(console.error);

    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [dollId, token]);

  if (!imageSrc) return <p>Loading image...</p>;

  return <img src={imageSrc} alt="doll" style={{ maxWidth: '200px' }} />;
}


  const handleNewDollChange = (e) => {
    setNewDoll({ ...newDoll, [e.target.name]: e.target.value });
  };

  const handleAddDoll = async (e) => {
  e.preventDefault();
  const formData = new FormData();

  for (const key in newDoll) {
    formData.append(key, newDoll[key]);
  }

  try {
    console.log('Token:', token);
    const res = await fetch('http://localhost:3001/api/dolls', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) throw new Error('Failed to add doll');

    const updated = await fetch('http://localhost:3001/api/dolls', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const updatedData = await updated.json();
    setDolls(updatedData);
    setNewDoll({
      FirstName: '',
      LastName: '',
      Category: '',
      Year: '',
      Bought: '',
      MarketPrice: '',
      picture: null
    });
  } catch (err) {
    setError(err.message);
  }
};


  return (
    <div style={{  margin: 'auto', padding: 20, dispaly: 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!token ? (
        <>
        <div className='add-form'>
          <h1>Join To Track Your Doll Collection !</h1>
          <h2>{formType === 'login' ? 'Login' : 'Register'}</h2>
          <form onSubmit={handleAuthSubmit}>
            <input
              name="username"
              type = "text"
              placeholder="Username"
              value={authForm.username}
              onChange={handleAuthChange}
              required
            />
            <br />
            <input
              
              name="password"
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={handleAuthChange}
              required
            />
            <br />
            <button type="submit">
              {formType === 'login' ? 'Log In' : 'Register'}
            </button>
          </form>
          <button type="submit"
            onClick={() =>
              setFormType((prev) => (prev === 'login' ? 'register' : 'login'))
            }
          >
            {formType === 'login'
              ? 'Create Account'
              : 'Already have an account? Log in'}
          </button>
        </div>
        </>
        
      ) : (
        <>
          <div className='header'>
            <h2>Your Dolls</h2>
          <button className='log-in-butt' onClick={handleLogout}>Logout</button> 

          </div>

          <div className='doll-display'>
                    {dolls.map((d) => (
                      
                        <div key={d.id}>
                          {/* <div> */}
                          <DollImage dollId={d.id} token={token} /><br />
                          <text className='labels'>
                            Name:
                          </text>
                          {d.FirstName} {d.LastName}
                          <br />
                          <text className='labels'>
                            Category:
                          </text> {d.Category}
                          <br />
                          <text className='labels'>
                            Released:
                          </text> ({d.Year})<br /> 
                          <text className='labels'>
                            Bought:
                          </text>{d.Bought}<br /> 
                          <text className='labels'>
                            Price:
                          </text> ${d.MarketPrice}
                        </div>                          
          ))}</div>

          <div className='add_doll'>
            <h3>Add More!</h3>
            <div className='add-form'>
              <form onSubmit={handleAddDoll}>
                <input name="FirstName" placeholder="First Name" type = "text" value={newDoll.FirstName} onChange={handleNewDollChange} required />
                <br />
                <input name="LastName" placeholder="Last Name" type = "text" value={newDoll.LastName} onChange={handleNewDollChange} required />
                <br />
                <input name="Category" placeholder="Category"  type = "text" value={newDoll.Category} onChange={handleNewDollChange} />
                <br />
                <input name="Year" placeholder="Year" type="number" value={newDoll.Year} onChange={handleNewDollChange} />
                <br />
                <input name="Bought" placeholder="Bought" type = "text" value={newDoll.Bought} onChange={handleNewDollChange} />
                <br />
                <input name="MarketPrice" placeholder="Market Price" type="number" value={newDoll.MarketPrice} onChange={handleNewDollChange} />
                <br />
                <input type="file" accept="image/*" onChange={(e) => setNewDoll({...newDoll, picture: e.target.files[0]})} />
                <br />
                <button type="submit">Add Doll</button>
              </form>
            </div>
            
          </div>
        </>
       
      )}
      
    </div>
    
  );
}

export default App;

const axios = require('axios');

async function run() {
  try {
    // Try register (ignore errors if user exists)
    await axios.post('http://localhost:5000/api/auth/register', {
      name: 'test farmer',
      email: 'farmer1@example.com',
      password: 'password',
      role: 'farmer',
    });
    console.log('Registered test farmer (or already exists)');
  } catch (err) {
    console.log('Register skipped:', err.response ? err.response.data : err.message);
  }

  try {
    const login = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'farmer1@example.com',
      password: 'password',
    });
    const token = login.data.token;
    console.log('Logged in, token length:', token ? token.length : 0);

    // Call advice endpoint
    const resp = await axios.get('http://localhost:5000/api/advice/smart-advice', {
      headers: { Authorization: `Bearer ${token}` },
      params: { lang: 'en' },
    });
    console.log('Advice response:', JSON.stringify(resp.data, null, 2));
  } catch (err) {
    console.error('Error during login/advice call:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

run();

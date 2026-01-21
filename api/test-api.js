// Test API endpoints to debug issues
import axios from 'axios';

const API_URL = 'http://localhost:8000';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${API_URL}/api/health`);
    console.log('   ✅ Health:', health.data);
    console.log('');

    // Test 2: Register user
    console.log('2. Testing user registration...');
    const randomUsername = `testuser_${Date.now()}`;
    const registerData = {
      username: randomUsername,
      email: `${randomUsername}@test.com`,
      password: 'testpass123',
    };

    try {
      const register = await axios.post(`${API_URL}/api/auth/register`, registerData);
      console.log('   ✅ Registration successful');
      console.log('   Token:', register.data.access_token.substring(0, 20) + '...');
      console.log('   User:', register.data.user.username);
      console.log('');

      const token = register.data.access_token;

      // Test 3: Get user info
      console.log('3. Testing /api/auth/me endpoint...');
      const me = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('   ✅ User info:', me.data.username);
      console.log('');

      // Test 4: Get game state
      console.log('4. Testing /api/game/state endpoint...');
      const state = await axios.get(`${API_URL}/api/game/state`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('   ✅ Game state received');
      console.log('   Hand:', state.data.hand);
      console.log('   Game size:', state.data.game_size);
      console.log('');

      // Test 5: Draw cards
      console.log('5. Testing /api/game/draw endpoint...');
      console.log('   Sending:', { question_type: 'MATCHING' });

      try {
        const draw = await axios.post(
          `${API_URL}/api/game/draw`,
          { question_type: 'MATCHING' },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );
        console.log('   ✅ Drew', draw.data.count, 'cards');
        console.log('   Pick count:', draw.data.pick_count);
        console.log('   Cards:', draw.data.cards.map(c => c.name).join(', '));
        console.log('');
      } catch (drawError) {
        console.log('   ❌ Draw failed');
        console.log('   Status:', drawError.response?.status);
        console.log('   Error:', drawError.response?.data);
        console.log('   Request data:', { question_type: 'MATCHING' });
        console.log('');
      }

      // Test 6: Get statistics
      console.log('6. Testing /api/stats/user endpoint...');
      const stats = await axios.get(`${API_URL}/api/stats/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('   ✅ Stats:', stats.data);
      console.log('');

      console.log('✨ All tests completed!\n');

    } catch (registerError) {
      if (registerError.response?.status === 400 && registerError.response?.data?.error?.includes('already exists')) {
        console.log('   ℹ️  User already exists (this is OK for testing)');
        console.log('   Try logging in instead...\n');

        // Test with login
        console.log('2b. Testing user login...');
        const login = await axios.post(`${API_URL}/api/auth/login`, {
          username: registerData.username,
          password: registerData.password,
        });
        console.log('   ✅ Login successful');
        const token = login.data.access_token;

        // Continue with draw test
        console.log('\n5. Testing /api/game/draw endpoint...');
        const draw = await axios.post(
          `${API_URL}/api/game/draw`,
          { question_type: 'MATCHING' },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );
        console.log('   ✅ Drew', draw.data.count, 'cards');
        console.log('');
      } else {
        throw registerError;
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   No response received');
      console.error('   Is the server running? (npm run dev)');
    } else {
      console.error('   Error:', error.message);
    }
    console.error('');
  }
}

testAPI();

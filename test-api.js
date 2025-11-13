#!/usr/bin/env node

/**
 * Quick API Testing Script
 * Run with: node test-api.js
 */

const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log(`\n📍 ${method} ${path}`);
        console.log(`📊 Status: ${res.statusCode}`);
        try {
          console.log('📄 Response:', JSON.stringify(JSON.parse(responseData), null, 2));
        } catch (e) {
          console.log('📄 Response:', responseData);
        }
        resolve({
          status: res.statusCode,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Error: ${error.message}`);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting API Tests...\n');

  try {
    // Test 1: Health Check
    console.log('✅ Test 1: Health Check');
    await makeRequest('GET', '/health');

    // Wait a bit before next request
    await new Promise(r => setTimeout(r, 500));

    // Test 2: Login
    console.log('\n✅ Test 2: Login');
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      username: 'tan286',
      password: '026339229'
    });

    let token = null;
    if (loginResponse.status === 200) {
      try {
        const loginData = JSON.parse(loginResponse.data);
        token = loginData.token;
        console.log('✅ Token obtained:', token.substring(0, 20) + '...');
      } catch (e) {
        console.log('⚠️ Could not parse token from response');
      }
    }

    // Test 3: Get all titles (with auth)
    if (token) {
      console.log('\n✅ Test 3: Get All Titles (with auth)');
      const options = {
        hostname: 'localhost',
        port: 4001,
        path: '/api/titles',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      };

      await new Promise((resolve) => {
        const req = http.request(options, (res) => {
          let responseData = '';
          
          res.on('data', (chunk) => {
            responseData += chunk;
          });

          res.on('end', () => {
            console.log(`\n📍 GET /api/titles`);
            console.log(`📊 Status: ${res.statusCode}`);
            try {
              console.log('📄 Response:', JSON.stringify(JSON.parse(responseData), null, 2));
            } catch (e) {
              console.log('📄 Response:', responseData);
            }
            resolve();
          });
        });

        req.on('error', (error) => {
          console.error(`❌ Error: ${error.message}`);
          resolve();
        });

        req.end();
      });
    }

    console.log('\n✅ All tests completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();

#!/usr/bin/env node

const http = require('http');

const testServer = () => {
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/status',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Server is running! Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📊 Server Response:', response);
        console.log('🎉 WebHub Backend is ready!');
      } catch (e) {
        console.log('📊 Server Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.log('❌ Server is not running. Please start the server first:');
    console.log('   npm run dev');
  });

  req.end();
};

console.log('🔍 Testing WebHub Backend setup...');
testServer();

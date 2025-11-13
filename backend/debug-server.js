#!/usr/bin/env node

/**
 * Debug Backend Server
 * Test each component sequentially
 */

const express = require('express');
const path = require('path');

console.log('\n🔍 Starting Debug Backend Server...\n');

// Step 1: Create app
console.log('Step 1️⃣: Creating Express app...');
const app = express();
console.log('   ✅ App created\n');

// Step 2: Add basic middleware
console.log('Step 2️⃣: Adding middleware...');
app.use(express.json());
console.log('   ✅ Middleware added\n');

// Step 3: Health check route
console.log('Step 3️⃣: Adding routes...');
app.get('/health', (req, res) => {
  console.log('   📍 /health endpoint called');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
console.log('   ✅ Routes added\n');

// Step 4: Error handler
console.log('Step 4️⃣: Adding error handler...');
app.use((err, req, res, next) => {
  console.log(`   ❌ Error: ${err.message}`);
  res.status(500).json({ error: err.message });
});
console.log('   ✅ Error handler added\n');

// Step 5: Start server
console.log('Step 5️⃣: Starting server on port 4000...');
const PORT = 4000;

const server = app.listen(PORT, () => {
  console.log(`   ✅ Server listening on port ${PORT}\n`);
  console.log('🎉 Debug server ready!');
  console.log('   Test: http://localhost:4000/health\n');
});

// Handle errors
server.on('error', (err) => {
  console.log(`   ❌ Server error: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📤 Shutting down...');
  server.close(() => {
    console.log('   ✅ Server closed');
    process.exit(0);
  });
});

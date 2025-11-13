#!/usr/bin/env node

/**
 * Simple Test Server - No Prisma
 * Test if Express server can start without database dependency
 */

const express = require('express');
const app = express();
const PORT = 4001;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Simple test server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});

// Timeout handler
setTimeout(() => {
  console.log('⏳ Server still running...');
}, 5000);

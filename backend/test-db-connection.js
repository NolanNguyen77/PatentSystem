#!/usr/bin/env node

/**
 * Database Connection Test
 * Test if backend can connect to SQL Server
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');
  
  console.log('📋 Configuration:');
  console.log('─'.repeat(50));
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('❌ ERROR: DATABASE_URL is not set in .env file\n');
    process.exit(1);
  }
  
  // Hide password in logs
  const safeUrl = dbUrl.replace(/password=[^;]+/, 'password=***');
  console.log(`Database URL: ${safeUrl}`);
  console.log(`Port: 4000`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('─'.repeat(50));
  
  console.log('\n⏳ Attempting to connect...\n');
  
  const prisma = new PrismaClient({
    log: ['error', 'warn', 'info'],
  });
  
  try {
    // Try to connect
    await prisma.$connect();
    console.log('✅ SUCCESS: Connected to database!\n');
    
    // Try a simple query
    console.log('🔄 Running test query...');
    const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`;
    console.log(`✅ Test query successful!`);
    console.log(`   Users count: ${result[0].count}\n`);
    
    // Check tables
    console.log('📊 Checking tables:');
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE='BASE TABLE'
      ORDER BY TABLE_NAME
    `;
    
    if (tables.length > 0) {
      console.log(`   Found ${tables.length} tables:`);
      tables.forEach(t => console.log(`   - ${t.TABLE_NAME}`));
    } else {
      console.log('   ⚠️  No tables found (database may be empty)');
    }
    
    console.log('\n✅ All tests passed!');
    console.log('🎉 Backend is ready to connect to database.\n');
    
  } catch (error) {
    console.log('❌ ERROR: Failed to connect to database\n');
    console.log('Error Details:');
    console.log('─'.repeat(50));
    console.log(`Type: ${error.name}`);
    console.log(`Message: ${error.message}`);
    console.log('─'.repeat(50));
    
    console.log('\n🔧 Troubleshooting Steps:\n');
    console.log('1. ✓ Verify SQL Server is installed:');
    console.log('   - Download: https://www.microsoft.com/sql-server/sql-server-editions-express');
    console.log('   - Status: Check Services (services.msc)\n');
    
    console.log('2. ✓ Check SQL Server is running:');
    console.log('   - Open: SQL Server Configuration Manager');
    console.log('   - Status: MSSQLSERVER should be "Running"\n');
    
    console.log('3. ✓ Verify database exists:');
    console.log('   - Run: CREATE DATABASE patent_navi;\n');
    
    console.log('4. ✓ Check .env DATABASE_URL:');
    console.log('   - Current: ' + safeUrl + '\n');
    console.log('   - Format: sqlserver://server:port;user=sa;password=...;database=...\n');
    
    console.log('5. ✓ Test connection with SSMS:');
    console.log('   - Server: localhost (or localhost\\SQLEXPRESS)');
    console.log('   - Auth: SQL Server Authentication');
    console.log('   - Login: ' + (dbUrl.includes('user=') ? dbUrl.split('user=')[1].split(';')[0] : 'sa') + '\n');
    
    console.log('6. ✓ Common issues:');
    console.log('   - SQL Server not installed');
    console.log('   - SQL Server service not running');
    console.log('   - Wrong credentials in .env');
    console.log('   - Database not created');
    console.log('   - Firewall blocking port 1433\n');
    
    process.exit(1);
    
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();

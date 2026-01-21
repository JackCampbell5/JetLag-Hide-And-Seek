// Quick test script to verify backend setup
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSetup() {
  console.log('🔍 Testing backend setup...\n');

  try {
    // Test 1: Database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connected successfully\n');

    // Test 2: Check if tables exist
    console.log('2. Checking database tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log(`   ✅ Found ${tables.length} tables:`, tables.map(t => t.table_name).join(', '));
    console.log('');

    // Test 3: Count users
    console.log('3. Checking users table...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ Users table accessible (${userCount} users)\n`);

    // Test 4: Check environment variables
    console.log('4. Checking environment variables...');
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
    const missingVars = requiredVars.filter(v => !process.env[v]);

    if (missingVars.length > 0) {
      console.log(`   ⚠️  Missing: ${missingVars.join(', ')}`);
      console.log('   💡 Create .env file with these variables\n');
    } else {
      console.log('   ✅ All required environment variables set\n');
    }

    // Test 5: Load cards data
    console.log('5. Testing card service...');
    const { readFileSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const cardsPath = join(__dirname, 'cards.json');

    const cards = JSON.parse(readFileSync(cardsPath, 'utf-8'));
    console.log(`   ✅ Loaded ${cards.length} card definitions\n`);

    console.log('✨ All tests passed! Backend is ready.\n');
    console.log('🚀 Start the server with: npm run dev\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n💡 Troubleshooting:');

    if (error.message.includes('connect')) {
      console.error('   - Check DATABASE_URL in .env file');
      console.error('   - Ensure PostgreSQL is running');
      console.error('   - Run: npx prisma db push (to create tables)');
    } else if (error.message.includes('ENOENT')) {
      console.error('   - Run: npm run prisma:generate');
    }
    console.error('');
  } finally {
    await prisma.$disconnect();
  }
}

testSetup();

const { db, auth } = require('./config/firebase');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Generate admin credentials
    const email = `admin${Date.now()}@usiu.com`;
    const password = `Admin${Math.random().toString(36).slice(2, 10)}!`;
    const displayName = 'Admin User';

    console.log('\n🔐 Creating new admin user...\n');

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false
    });

    console.log('✅ Firebase Auth user created!');
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email: ${email}`);

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      role: 'admin',
      active: true,
      displayName,
      createdAt: new Date().toISOString()
    });

    console.log('✅ Firestore document created!');

    console.log('\n' + '='.repeat(60));
    console.log('📋 ADMIN LOGIN CREDENTIALS');
    console.log('='.repeat(60));
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role:     admin`);
    console.log('='.repeat(60));
    console.log('\n✅ Admin user created successfully!');
    console.log('💡 You can now log in with these credentials.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

createAdminUser();


const { db, auth } = require('./config/firebase');
require('dotenv').config();

async function createUserDocument() {
  try {
    // Get UID from command line arguments
    const uid = process.argv[2];
    const email = process.argv[3];
    const role = process.argv[4] || 'chef'; // 'admin', 'chef', or 'manager'
    const displayName = process.argv[5];

    if (!uid) {
      console.error('❌ Error: UID is required');
      console.log('\nUsage: node create-user-doc.js <UID> [email] [role] [displayName]');
      console.log('\nExample:');
      console.log('  node create-user-doc.js oGKhArT41jVXw3sZyuTLlexOt6v2 chef@example.com chef "Chef User"');
      process.exit(1);
    }

    // Try to get email from Firebase Auth if not provided
    let userEmail = email;
    let userDisplayName = displayName;
    
    try {
      const userRecord = await auth.getUser(uid);
      if (!userEmail) {
        userEmail = userRecord.email || 'user@example.com';
        console.log(`📧 Email from Firebase Auth: ${userEmail}`);
      }
      if (!userDisplayName) {
        userDisplayName = userRecord.displayName || userEmail.split('@')[0];
      }
    } catch (error) {
      console.log('⚠️  Could not fetch user from Firebase Auth, using provided/default values');
      if (!userEmail) {
        userEmail = 'user@example.com';
      }
      if (!userDisplayName) {
        userDisplayName = userEmail.split('@')[0];
      }
    }

    console.log('\nCreating user document in Firestore...');
    console.log(`UID: ${uid}`);
    console.log(`Email: ${userEmail}`);
    console.log(`Role: ${role}`);
    console.log(`Display Name: ${userDisplayName}`);

    // Check if user document already exists
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (userDoc.exists) {
      console.log('\n⚠️  User document already exists!');
      console.log('Current data:', userDoc.data());
      console.log('\nUpdating user document...');
      
      await db.collection('users').doc(uid).update({
        email: userEmail,
        role,
        displayName: userDisplayName,
        active: true,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ User document updated successfully!');
    } else {
      // Create new user document
      await db.collection('users').doc(uid).set({
        uid,
        email: userEmail,
        role,
        active: true,
        displayName: userDisplayName,
        createdAt: new Date().toISOString()
      });

      console.log('✅ User document created successfully!');
    }

    console.log('\n🎉 User can now log in and access the system!');
    console.log('\nPlease refresh the page or log out and log back in.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user document:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

createUserDocument();


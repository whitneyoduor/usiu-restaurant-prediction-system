const { db } = require('./config/firebase');
require('dotenv').config();

async function verifyUserDocument() {
  try {
    const uid = process.argv[2] || '7m9eAM6pPsQwTmmIxcvmpbz5cst2';
    
    console.log(`\n🔍 Verifying user document for UID: ${uid}\n`);
    
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      console.log('❌ User document does NOT exist!');
      process.exit(1);
    }
    
    const data = userDoc.data();
    console.log('✅ User document exists!');
    console.log('\n📄 Document data:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check required fields
    const requiredFields = ['uid', 'email', 'role', 'active'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.log(`\n⚠️  Missing required fields: ${missingFields.join(', ')}`);
    } else {
      console.log('\n✅ All required fields are present!');
    }
    
    // Check for typos
    if (data.iud) {
      console.log('\n⚠️  Found typo: "iud" instead of "uid"');
    }
    if (data.displayname && !data.displayName) {
      console.log('\n⚠️  Found lowercase: "displayname" instead of "displayName"');
    }
    
    console.log('\n✅ Verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyUserDocument();


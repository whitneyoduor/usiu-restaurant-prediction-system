const { db } = require('./config/firebase');
require('dotenv').config();

async function fixUserDocument() {
  try {
    const uid = '7m9eAM6pPsQwTmmIxcvmpbz5cst2';
    
    console.log(`\n🔧 Fixing user document for UID: ${uid}\n`);
    
    const docRef = db.collection('users').doc(uid);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      console.log('❌ User document does NOT exist!');
      process.exit(1);
    }
    
    const data = docSnap.data();
    
    // Remove typo fields and ensure correct structure
    const updateData = {
      uid: uid,
      email: data.email || 'whitneyoduor@gmail.com',
      role: data.role || 'chef',
      active: data.active !== undefined ? data.active : true,
      displayName: data.displayName || data.displayname || 'whitneyoduor',
      updatedAt: new Date().toISOString()
    };
    
    // Use set with merge to update fields and keep createdAt
    await docRef.set(updateData, { merge: true });
    
    // Remove typo fields
    await docRef.update({
      iud: admin.firestore.FieldValue.delete(),
      displayname: admin.firestore.FieldValue.delete()
    }).catch(() => {
      // If delete fails, that's okay - we'll just have extra fields
      console.log('Note: Could not delete typo fields (they may not exist)');
    });
    
    const finalDoc = await docRef.get();
    console.log('✅ Document fixed!');
    console.log('\n📄 Final document:');
    console.log(JSON.stringify(finalDoc.data(), null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

fixUserDocument();


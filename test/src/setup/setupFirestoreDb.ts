import fs from 'fs';
import path from 'path';
import {initializeTestEnvironment, RulesTestEnvironment} from '@firebase/rules-unit-testing';
import {firestoreSeed} from './emulator-seed-data';
import {MyFirestore} from './types';

const TEST_FIREBASE_PROJECT_ID = 'test-firestore-rules-project-1';

// Load Firestore rules
function getFirestoreRules() {
  return fs.readFileSync(
    path.resolve(__dirname, '../../../firestore.rules'),
    'utf-8'
  );
}


export async function setupFirestoreDB(): Promise<RulesTestEnvironment> {
  // Load the content of the "firestore.rules" file into the emulator before running the test suite.
  const rulesTestEnvironment = await initializeTestEnvironment({
    projectId: TEST_FIREBASE_PROJECT_ID,
    firestore: {
      rules: getFirestoreRules(),
      // Specify host and port of the emulator to run tests without the wrapper
      // firebase emulators:exec (e.g.: firebase emulators:exec --only firestore "npm run test:rules")"
      host: '127.0.0.1',
      port: 8080,
    },
  });

  await rulesTestEnvironment.withSecurityRulesDisabled(async (context) => {
    const firestoreDb = context.firestore();

    // Seed Firestore with mock data
    const promises = [];
    for (const collectionKey in firestoreSeed) {
      const collectionRef = firestoreDb.collection(collectionKey);
      const documents = firestoreSeed[collectionKey as keyof MyFirestore];

      for (const [userId, userDocument] of Object.entries(documents)) {
        const docRef = collectionRef.doc(userId);
        promises.push(docRef.set(userDocument));
      }
    }

    await Promise.all(promises);
  });

  return rulesTestEnvironment;
}
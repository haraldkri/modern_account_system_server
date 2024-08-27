import {setupFirestoreDB} from './setup/setupFirestoreDb';
import {defaultUser} from './setup/emulator-seed-data';
import {assertSucceeds} from '@firebase/rules-unit-testing';

describe('firestore rules testing', () => {
  describe('users - create', () => {
    it('createUser - authenticated user - expected data format', async () => {
      const testEnvironment = await setupFirestoreDB();

      const user = testEnvironment.authenticatedContext(defaultUser.uid);
      const firestoreDb = user.firestore();
      await assertSucceeds(firestoreDb.collection('users').doc(defaultUser.uid).get());
      console.log((await firestoreDb.collection('users').doc(defaultUser.uid).get()).data());
      // await assertSucceeds(firestoreDb.collection('users').doc(defaultUser.uid).set({
      //   ...firestoreSeed.users[defaultUser.uid],
      // }));
    });
    // input type checks
    // input not malformed checks
    // permission checks / auth check
    // no duplicate user document ids check
  });
});





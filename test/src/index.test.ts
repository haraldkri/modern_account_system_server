import {setupFirestoreDB} from './setup/setupFirestoreDb';
import {defaultUser, defaultUser2, employeeUser, firestoreSeed} from './setup/emulator-seed-data';
import {assertFails, assertSucceeds, RulesTestEnvironment} from '@firebase/rules-unit-testing';
import {testForInvalidTypes, testForValidTypes} from './setup/util';
import {afterEach, beforeEach, describe, it} from "vitest";

describe('firestore rules testing', () => {
  describe('users - get', () => {
    let testEnvironment: RulesTestEnvironment;

    beforeEach(async () => {
      testEnvironment = await setupFirestoreDB({insertDefaultData: true});
    });

    afterEach(async () => {
      await testEnvironment.cleanup();
    });

    it('getUser - authenticated user - correct uid', async () => {
      const firestore = testEnvironment.authenticatedContext(defaultUser.uid).firestore();
      await assertSucceeds(firestore.collection('users').doc(defaultUser.uid).get());
    });

    it('getUser - unauthenticated user - no uid', async () => {
      const firestore = testEnvironment.unauthenticatedContext().firestore();
      await assertFails(firestore.collection('users').doc(defaultUser.uid).get());
    });

    it('getUser - authenticated user - wrong uid', async () => {
      const firestore = testEnvironment.authenticatedContext(defaultUser2.uid).firestore();
      await assertFails(firestore.collection('users').doc(defaultUser.uid).get());
    });

    it('getUser - authenticated user - wrong uid - employee', async () => {
      const firestore = testEnvironment.authenticatedContext(employeeUser.uid).firestore();
      await assertSucceeds(firestore.collection('users').doc(defaultUser.uid).get());
    });
  });

  describe('users - create', () => {
    let testEnvironment: RulesTestEnvironment;

    beforeEach(async () => {
      testEnvironment = await setupFirestoreDB({insertDefaultData: true});
    });

    afterEach(async () => {
      await testEnvironment.cleanup();
    });

    it('isDocumentOwner', async () => {
      const userUid = '123';
      const user2Uid = '234';

      const user2 = testEnvironment.authenticatedContext(user2Uid);
      const firestoreDb2 = user2.firestore();
      await assertFails(firestoreDb2.collection('users').doc(userUid).set({}));

      const user = testEnvironment.authenticatedContext(userUid);
      const firestoreDb = user.firestore();
      await assertSucceeds(firestoreDb.collection('users').doc(userUid).set({}));
      await firestoreDb.collection('users').doc(userUid).delete();
    });

    it('not restricted fields - birth, joined, name, value', async () => {
      const userUid = '123';
      const user = testEnvironment.authenticatedContext(userUid);
      const firestoreDb = user.firestore();

      //birth
      await testForValidTypes(firestoreDb.collection('users').doc(userUid), 'birth', 'integer');
      await testForInvalidTypes(firestoreDb.collection('users').doc(userUid), 'birth', 'integer');

      //joined
      await testForValidTypes(firestoreDb.collection('users').doc(userUid), 'joined', 'integer');
      await testForInvalidTypes(firestoreDb.collection('users').doc(userUid), 'joined', 'integer');

      //name
      await testForValidTypes(firestoreDb.collection('users').doc(userUid), 'name', 'string');
      await testForInvalidTypes(firestoreDb.collection('users').doc(userUid), 'name', 'string');

      //value
      await assertSucceeds(firestoreDb.collection('users').doc(userUid).set({'value': 0}));
      await assertFails(firestoreDb.collection('users').doc(userUid).set({'value': 10}));
      await testForInvalidTypes(firestoreDb.collection('users').doc(userUid), 'value', 'integer');
    });

    it('restricted fields - shopId, shopName, isEmployee, isShopOwner, isAdmin', async () => {
      const userUid = '123';
      const user = testEnvironment.authenticatedContext(userUid);
      const firestoreDb = user.firestore();


      //shopId
      await assertFails(firestoreDb.collection('users').doc(userUid).set({'shopId': 'validString'}));
      //shopName
      await assertFails(firestoreDb.collection('users').doc(userUid).set({'shopName': 'validString'}));
      //isEmployee
      await assertFails(firestoreDb.collection('users').doc(userUid).set({'isEmployee': true}));
      //isShopOwner
      await assertFails(firestoreDb.collection('users').doc(userUid).set({'isShopOwner': true}));
      //isAdmin
      await assertFails(firestoreDb.collection('users').doc(userUid).set({'isAdmin': true}));
    });
  });

  describe('users - update', () => {
    let testEnvironment: RulesTestEnvironment;

    beforeEach(async () => {
      testEnvironment = await setupFirestoreDB();
    });

    afterEach(async () => {
      await testEnvironment.cleanup();
    });

    it('field - birth', async () => {
      const userUid = "123";
      const user = testEnvironment.authenticatedContext(userUid);
      const firestoreDb = user.firestore();

      //make sure empty user exists
      await firestoreDb.collection('users').doc(userUid).set({},{merge: false});

      const exampleData = {'birth': firestoreSeed.users["defaultUser1"].birth};
      console.log(exampleData)

      await testForInvalidTypes(firestoreDb.collection('users').doc(userUid), 'birth', 'integer');
      await assertSucceeds(firestoreDb.collection('users').doc(userUid).set(exampleData));
      // cannot be set again once set
      await assertFails(firestoreDb.collection('users').doc(userUid).set(exampleData));



    });

    // it('user - user', async () => {
    //   const userUid = "123";
    //   const user = testEnvironment.authenticatedContext(userUid);
    //   const firestoreDb = user.firestore();
    //
    //   //make sure empty user exists
    //   await firestoreDb.collection('users').doc(userUid).set({},{merge: false});
    //
    //   //birth
    //   await testForInvalidTypes(firestoreDb.collection('users').doc(userUid), 'birth', 'integer');
    //   await assertSucceeds(firestoreDb.collection('users').doc(userUid).set({'birth': firestoreSeed.users[0].birth}));
    //   // cannot be set again once set
    //   await assertFails(firestoreDb.collection('users').doc(userUid).set({'birth': firestoreSeed.users[0].birth}));
    //
    //   //joined
    //   await testForInvalidTypes(firestoreDb.collection('users').doc(userUid), 'joined', 'integer');
    //   await assertSucceeds(firestoreDb.collection('users').doc(userUid).set({'joined': firestoreSeed.users[0].joined}));
    //   // cannot be set again once set
    //   await assertFails(firestoreDb.collection('users').doc(userUid).set({'joined': firestoreSeed.users[0].joined}));
    //
    //   //name
    //   await testForInvalidTypes(firestoreDb.collection('users').doc(userUid), 'name', 'string');
    //   await assertSucceeds(firestoreDb.collection('users').doc(userUid).set({'name': firestoreSeed.users[0].name}));
    //   // cannot be set again once set
    //   await assertFails(firestoreDb.collection('users').doc(userUid).set({'name': firestoreSeed.users[0].name}));
    //
    //   //value
    //   await testForInvalidTypes(firestoreDb.collection('users').doc(userUid), 'value', 'integer');
    //   await assertSucceeds(firestoreDb.collection('users').doc(userUid).set({'name': firestoreSeed.users[0].name}));
    //
    //
    //
    // });
  });
});


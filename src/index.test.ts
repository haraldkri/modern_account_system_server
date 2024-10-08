import {setupFirestoreDB} from './setup/setupFirestoreDb';
import {
    adminUser,
    defaultUser,
    defaultUser2,
    employeeUser,
    firestoreSeed,
    shopOwnerUser
} from './setup/emulator-seed-data';
import {assertFails, assertSucceeds, RulesTestEnvironment} from '@firebase/rules-unit-testing';
import {testForInvalidTypes, testForValidTypes} from './setup/util';
import {afterEach, beforeEach, describe, test} from "vitest";
import {Shop} from "./setup/types";

describe('firestore rules testing', () => {
    describe('users - get', () => {
        let testEnvironment: RulesTestEnvironment;

        beforeEach(async () => {
            testEnvironment = await setupFirestoreDB({insertDefaultData: true});
        });

        afterEach(async () => {
            await testEnvironment.cleanup();
        });

        test('getUser - authenticated user - correct uid', async () => {
            const firestore = testEnvironment.authenticatedContext(defaultUser.uid).firestore();
            await assertSucceeds(firestore.collection('users').doc(defaultUser.uid).get());
        });

        test('getUser - unauthenticated user - no uid', async () => {
            const firestore = testEnvironment.unauthenticatedContext().firestore();
            await assertFails(firestore.collection('users').doc(defaultUser.uid).get());
        });

        test('getUser - authenticated user - wrong uid', async () => {
            const firestore = testEnvironment.authenticatedContext(defaultUser2.uid).firestore();
            await assertFails(firestore.collection('users').doc(defaultUser.uid).get());
        });

        test('getUser - authenticated user - wrong uid - employee', async () => {
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

        test('isDocumentOwner', async () => {
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

        test('not restricted fields - birth, joined, name, value', async () => {
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

        test('restricted fields - shopId, shopName, isEmployee, isShopOwner, isAdmin', async () => {
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
            testEnvironment = await setupFirestoreDB({insertDefaultData: true});
        });

        afterEach(async () => {
            await testEnvironment.cleanup();
        });

        test('field - birth', async () => {
            const userUid = "123";
            const user = testEnvironment.authenticatedContext(userUid);
            const firestoreDb = user.firestore();

            //make sure empty user exists
            await firestoreDb.collection('users').doc(userUid).set({});

            const exampleData = {'birth': firestoreSeed.users["defaultUser1"].birth};

            await testForInvalidTypes(firestoreDb.collection('users').doc(userUid), 'birth', 'integer');
            await assertSucceeds(firestoreDb.collection('users').doc(userUid).set(exampleData));
            // cannot be set again once set
            await assertFails(firestoreDb.collection('users').doc(userUid).set(exampleData));
        });

        test('field - joined', async () => {
            const userUid = "123";
            const user = testEnvironment.authenticatedContext(userUid);
            const firestoreDb = user.firestore();

            //make sure empty user exists
            await firestoreDb.collection('users').doc(userUid).set({});

            const exampleData = {'joined': firestoreSeed.users["defaultUser1"].joined};

            await testForInvalidTypes(firestoreDb.collection('users').doc(userUid), 'joined', 'integer');
            await assertSucceeds(firestoreDb.collection('users').doc(userUid).set(exampleData));
            // cannot be set again once set
            await assertFails(firestoreDb.collection('users').doc(userUid).set(exampleData));
        });

        test('field - name', async () => {
            const userUid = "123";
            const user = testEnvironment.authenticatedContext(userUid);
            const firestoreDb = user.firestore();

            //make sure empty user exists
            await firestoreDb.collection('users').doc(userUid).set({});

            const exampleData = {'name': firestoreSeed.users["defaultUser1"].name};

            await testForInvalidTypes(firestoreDb.collection('users').doc(userUid), 'name', 'string');
            await assertSucceeds(firestoreDb.collection('users').doc(userUid).set(exampleData));
            // cannot be set again once set
            await assertFails(firestoreDb.collection('users').doc(userUid).set(exampleData));
        });

        test('field - value', async () => {
            const userUid = "123";
            const user = testEnvironment.authenticatedContext(userUid);
            const firestoreDb = user.firestore();

            //make sure empty user exists
            await firestoreDb.collection('users').doc(userUid).set({});

            await testForInvalidTypes(firestoreDb.collection('users').doc(userUid), 'value', 'integer');

            // User can only initially set their value to 0
            await assertFails(firestoreDb.collection('users').doc(userUid).set({'value': 1}));
            await assertSucceeds(firestoreDb.collection('users').doc(userUid).set({'value': 0}));
            // cannot be set again once set
            await assertFails(firestoreDb.collection('users').doc(userUid).set({'value': 0}));


            /**
             * For employees
             */
            const employeeUid = employeeUser.uid;
            const employee = testEnvironment.authenticatedContext(employeeUid);
            const employeeFirestoreDb = employee.firestore();

            // Employee can only set the value to something valid
            await testForInvalidTypes(employeeFirestoreDb.collection('users').doc(userUid), 'value', 'integer');
            await assertFails(employeeFirestoreDb.collection('users').doc(userUid).set({'value': -1}));
            await assertSucceeds(employeeFirestoreDb.collection('users').doc(userUid).set({'value': 0}));
            await assertSucceeds(employeeFirestoreDb.collection('users').doc(userUid).set({'value': 1}));
            await assertSucceeds(employeeFirestoreDb.collection('users').doc(userUid).set({'value': 100}));
        });

        test('field - shopId', async () => {
            const userUid = defaultUser.uid;
            /**
             * For shopOwners and admins
             */
            const shopOwnerUid = shopOwnerUser.uid;
            const shopOwner = testEnvironment.authenticatedContext(shopOwnerUid);
            const shopOwnerFirestoreDb = shopOwner.firestore();

            await testForInvalidTypes(shopOwnerFirestoreDb.collection("users").doc(userUid), 'shopId', 'string');
            // shopOwners can only set the shopId to their own shopId
            await assertFails(shopOwnerFirestoreDb.collection('users').doc(userUid).set({'shopId': "123shop456"}));
            await assertSucceeds(shopOwnerFirestoreDb.collection('users').doc(userUid).set({'shopId': firestoreSeed.users["shopOwnerUser1"].shopId}));


            const adminUid = adminUser.uid;
            const admin = testEnvironment.authenticatedContext(adminUid);
            const adminFirestoreDb = admin.firestore();

            await assertSucceeds(adminFirestoreDb.collection('users').doc(userUid).set({'shopId': "123shop456"}));
            await testForInvalidTypes(adminFirestoreDb.collection("users").doc(userUid), 'shopId', 'string');
        });

        test('field - shopName', async () => {
            const userUid = defaultUser.uid;
            /**
             * For shopOwners and admins
             */
            const shopOwnerUid = shopOwnerUser.uid;
            const shopOwner = testEnvironment.authenticatedContext(shopOwnerUid);
            const shopOwnerFirestoreDb = shopOwner.firestore();

            await testForInvalidTypes(shopOwnerFirestoreDb.collection("users").doc(userUid), 'shopName', 'string');
            // shopOwners can only set the shopName to their own shopName
            await assertFails(shopOwnerFirestoreDb.collection('users').doc(userUid).set({'shopName': "123shop456"}));
            await assertSucceeds(shopOwnerFirestoreDb.collection('users').doc(userUid).set({'shopName': firestoreSeed.users["shopOwnerUser1"].shopName}));


            const adminUid = adminUser.uid;
            const admin = testEnvironment.authenticatedContext(adminUid);
            const adminFirestoreDb = admin.firestore();

            await assertSucceeds(adminFirestoreDb.collection('users').doc(userUid).set({'shopName': "123shop456"}));
            await testForInvalidTypes(adminFirestoreDb.collection("users").doc(userUid), 'shopName', 'string');
        });

        test('field - isEmployee', async () => {
            const userUid = defaultUser.uid;
            /**
             * For shopOwners and admins
             */
            const shopOwnerUid = shopOwnerUser.uid;
            const shopOwner = testEnvironment.authenticatedContext(shopOwnerUid);
            const shopOwnerFirestoreDb = shopOwner.firestore();

            await testForInvalidTypes(shopOwnerFirestoreDb.collection("users").doc(userUid), 'isEmployee', 'boolean');
            await assertSucceeds(shopOwnerFirestoreDb.collection('users').doc(userUid).set({'isEmployee': firestoreSeed.users["shopOwnerUser1"].isEmployee}));

            const adminUid = adminUser.uid;
            const admin = testEnvironment.authenticatedContext(adminUid);
            const adminFirestoreDb = admin.firestore();

            await assertSucceeds(adminFirestoreDb.collection('users').doc(userUid).set({'isEmployee': true}));
            await testForInvalidTypes(adminFirestoreDb.collection("users").doc(userUid), 'isEmployee', 'boolean');
        });

        test('field - isShopOwner', async () => {
            const userUid = defaultUser.uid;

            const adminUid = adminUser.uid;
            const admin = testEnvironment.authenticatedContext(adminUid);
            const adminFirestoreDb = admin.firestore();

            await assertSucceeds(adminFirestoreDb.collection('users').doc(userUid).set({'isShopOwner': true}));
            await testForInvalidTypes(adminFirestoreDb.collection("users").doc(userUid), 'isShopOwner', 'boolean');
        });

        test('field - isAdmin', async () => {
            const userUid = defaultUser.uid;

            const adminUid = adminUser.uid;
            const admin = testEnvironment.authenticatedContext(adminUid);
            const adminFirestoreDb = admin.firestore();

            await assertSucceeds(adminFirestoreDb.collection('users').doc(userUid).set({'isAdmin': true}));
            await testForInvalidTypes(adminFirestoreDb.collection("users").doc(userUid), 'isAdmin', 'boolean');
        });
    });

    describe('users - list', () => {
        let testEnvironment: RulesTestEnvironment;

        beforeEach(async () => {
            testEnvironment = await setupFirestoreDB({insertDefaultData: true});
        });

        afterEach(async () => {
            await testEnvironment.cleanup();
        });

        test('get multiple users from the db at once', async () => {
            /**
             * Currently restricted to admins only, as there is no need for anyone else to be able to do so
             */
            const firestoreUser = testEnvironment.authenticatedContext(defaultUser.uid).firestore();
            await assertFails(firestoreUser.collection('users').get());

            const firestoreEmployee = testEnvironment.authenticatedContext(employeeUser.uid).firestore();
            await assertFails(firestoreEmployee.collection('users').get());

            const firestoreShopOwner = testEnvironment.authenticatedContext(shopOwnerUser.uid).firestore();
            await assertFails(firestoreShopOwner.collection('users').get());

            const firestoreAdmin = testEnvironment.authenticatedContext(adminUser.uid).firestore();
            await assertSucceeds(firestoreAdmin.collection('users').get());
        });
    });

    describe('users - delete', () => {
        let testEnvironment: RulesTestEnvironment;

        beforeEach(async () => {
            testEnvironment = await setupFirestoreDB({insertDefaultData: true});
        });

        afterEach(async () => {
            await testEnvironment.cleanup();
        });

        test('only a user itself or an admin can delete their account', async () => {
            function createUser() {
                firestoreUser.collection('users').doc(defaultUser.uid).set({});
            }

            /**
             * Currently restricted to admins only, as there is no need for anyone else to be able to do so
             */
            const firestoreUser = testEnvironment.authenticatedContext(defaultUser.uid).firestore();
            await assertSucceeds(firestoreUser.collection('users').doc(defaultUser.uid).delete());
            createUser();

            const firestoreEmployee = testEnvironment.authenticatedContext(employeeUser.uid).firestore();
            await assertFails(firestoreEmployee.collection('users').get());

            const firestoreShopOwner = testEnvironment.authenticatedContext(shopOwnerUser.uid).firestore();
            await assertFails(firestoreShopOwner.collection('users').get());

            const firestoreAdmin = testEnvironment.authenticatedContext(adminUser.uid).firestore();
            await assertSucceeds(firestoreAdmin.collection('users').get());
            createUser();

        });
    });

    describe('transactions', () => {
        let testEnvironment: RulesTestEnvironment;

        beforeEach(async () => {
            testEnvironment = await setupFirestoreDB({insertDefaultData: true});
        });

        afterEach(async () => {
            await testEnvironment.cleanup();
        });

        test('action - get', async () => {
            // the user that was part of the transaction
            const firestoreUser = testEnvironment.authenticatedContext(defaultUser.uid).firestore();
            await assertSucceeds(firestoreUser.collection('transactions').doc("transaction1").get());

            // another user that was not part of the transaction
            const firestoreUser2 = testEnvironment.authenticatedContext(defaultUser2.uid).firestore();
            await assertFails(firestoreUser2.collection('transactions').doc("transaction1").get());

            const firestoreEmployee = testEnvironment.authenticatedContext(employeeUser.uid).firestore();
            await assertSucceeds(firestoreEmployee.collection('transactions').doc("transaction1").get());

            const firestoreAdmin = testEnvironment.authenticatedContext(adminUser.uid).firestore();
            await assertSucceeds(firestoreAdmin.collection('transactions').doc("transaction1").get());
        });

        test('action - list', async () => {
            // users can read the transaction they where part of
            const firestoreUser = testEnvironment.authenticatedContext(defaultUser.uid).firestore();
            await assertSucceeds(firestoreUser.collection('transactions').where("userId", "==", defaultUser.uid).get());
            await assertFails(firestoreUser.collection('transactions').where("userId", "!=", defaultUser.uid).get());


            // employees can read the transaction they where part of
            const firestoreEmployee = testEnvironment.authenticatedContext(employeeUser.uid).firestore();
            await assertSucceeds(firestoreEmployee.collection('transactions').where("employeeId", "==", employeeUser.uid).get());
            await assertFails(firestoreEmployee.collection('transactions').where("employeeId", "!=", employeeUser.uid).get());


            // shopOwners can read the transaction their shop was part of
            const firestoreShopOwner = testEnvironment.authenticatedContext(shopOwnerUser.uid).firestore();
            await assertSucceeds(firestoreShopOwner.collection('transactions').where("shopId", "==", firestoreSeed.users[shopOwnerUser.uid].shopId).get());
            await assertFails(firestoreShopOwner.collection('transactions').where("shopId", "!=", firestoreSeed.users[shopOwnerUser.uid].shopId).get());

            // admins can read all to be able to do service
            const firestoreAdmin = testEnvironment.authenticatedContext(adminUser.uid).firestore();
            await assertSucceeds(firestoreAdmin.collection('transactions').get());
        });

        test('action - create', async () => {
            /**
             * Only employee can create new transactions
             */
            const firestoreUser = testEnvironment.authenticatedContext(defaultUser.uid).firestore();
            await assertFails(firestoreUser.collection('transactions').doc("new transaction 123").set(firestoreSeed.transactions["transaction1"]));

            const firestoreEmployee = testEnvironment.authenticatedContext(employeeUser.uid).firestore();
            await assertSucceeds(firestoreEmployee.collection('transactions').doc("123transaction456").set({
                "shopId": "shop1",
                "shopName": "Nights third leg syndrom",
                "timestamp": 1625011200000,
                "employeeId": employeeUser.uid,
                "userId": "defaultUser1",
                "valueIncrement": 10,
                "oldAccountValue": 0,
                "newAccountValue": 10
            }));

            await assertFails(firestoreEmployee.collection('transactions').doc("new transaction 2").set({
                // wrong shopId
                "shopId": "shop2",
                "shopName": "Nights third leg syndrom",
                "timestamp": 1625011200000,
                "employeeId": "employeeUser1",
                "userId": "defaultUser1",
                "valueIncrement": 10,
                "oldAccountValue": 0,
                "newAccountValue": 10
            }));

            await assertFails(firestoreEmployee.collection('transactions').doc("new transaction 2").set({
                "shopId": "shop1",
                // wrong shopName
                "shopName": "undefined shop",
                "timestamp": 1625011200000,
                "employeeId": "employeeUser1",
                "userId": "defaultUser1",
                "valueIncrement": 10,
                "oldAccountValue": 0,
                "newAccountValue": 10
            }));

            await assertFails(firestoreEmployee.collection('transactions').doc("new transaction 2").set({
                "shopId": "shop1",
                "shopName": "Nights third leg syndrom",
                "timestamp": 1625011200000,
                // wrong employee id
                "employeeId": "employeeUser2",
                "userId": "defaultUser1",
                "valueIncrement": 10,
                "oldAccountValue": 0,
                "newAccountValue": 10
            }));

            await assertFails(firestoreEmployee.collection('transactions').doc("new transaction 2").set({
                "shopId": "shop1",
                "shopName": "Nights third leg syndrom",
                "timestamp": 1625011200000,
                "employeeId": "employeeUser1",
                // not a save userid string
                "userId": "<script></script>",
                "valueIncrement": 10,
                "oldAccountValue": 0,
                "newAccountValue": 10
            }));

            await assertFails(firestoreEmployee.collection('transactions').doc("new transaction 2").set({
                "shopId": "shop1",
                "shopName": "Nights third leg syndrom",
                "timestamp": 1625011200000,
                "employeeId": "employeeUser1",
                "userId": "defaultUser1",
                // values don't add up
                "valueIncrement": 11,
                "oldAccountValue": 0,
                "newAccountValue": 10
            }));
        });
    });

    describe('log', () => {
        let testEnvironment: RulesTestEnvironment;

        beforeEach(async () => {
            testEnvironment = await setupFirestoreDB({insertDefaultData: true});
        });

        afterEach(async () => {
            await testEnvironment.cleanup();
        });

        test('action - read', async () => {
            // the user that was part of the transaction
            const firestoreUser = testEnvironment.authenticatedContext(defaultUser.uid).firestore();
            await assertFails(firestoreUser.collection('logs').get());
            await assertFails(firestoreUser.collection('logs').doc("log1").get());

            // another user that was not part of the transaction
            const firestoreShopOwner = testEnvironment.authenticatedContext(shopOwnerUser.uid).firestore();
            await assertFails(firestoreShopOwner.collection('logs').get());
            await assertFails(firestoreShopOwner.collection('logs').doc("log1").get());

            const firestoreEmployee = testEnvironment.authenticatedContext(employeeUser.uid).firestore();
            await assertFails(firestoreEmployee.collection('logs').get());
            await assertFails(firestoreEmployee.collection('logs').doc("log1").get());

            const firestoreAdmin = testEnvironment.authenticatedContext(adminUser.uid).firestore();
            await assertSucceeds(firestoreAdmin.collection('logs').get());
            await assertSucceeds(firestoreAdmin.collection('logs').doc("log1").get());
        });

        test('action - create', async () => {
            /**
             * Only employee can create new transactions
             */
            const firestoreUser = testEnvironment.authenticatedContext(defaultUser.uid).firestore();
            await assertFails(firestoreUser.collection('logs').doc("new log 1").set({...firestoreSeed.logs["log1"]}));

            const firestoreEmployee = testEnvironment.authenticatedContext(employeeUser.uid).firestore();
            await assertSucceeds(firestoreEmployee.collection('logs').doc("new log 2").set({...firestoreSeed.logs["log1"]}));

            const firestoreAdmin = testEnvironment.authenticatedContext(adminUser.uid).firestore();
            await assertSucceeds(firestoreAdmin.collection('logs').doc("new log 3").set({...firestoreSeed.logs["log1"]}));
        });
    });

    describe('shops', () => {
        let testEnvironment: RulesTestEnvironment;

        beforeEach(async () => {
            testEnvironment = await setupFirestoreDB({insertDefaultData: true});
        })

        afterEach(async () => {
            await testEnvironment.cleanup();
        })

        test("action - get", async () => {
            const firestoreUser = testEnvironment.authenticatedContext(defaultUser.uid).firestore();
            await assertFails(firestoreUser.collection('shops').doc(firestoreSeed.users[shopOwnerUser.uid].shopId!).get());

            const firestoreEmployee = testEnvironment.authenticatedContext(employeeUser.uid).firestore();
            await assertFails(firestoreEmployee.collection('shops').doc(firestoreSeed.users[shopOwnerUser.uid].shopId!).get());

            const firestoreShopOwner = testEnvironment.authenticatedContext(shopOwnerUser.uid).firestore();
            await assertSucceeds(firestoreShopOwner.collection('shops').doc(firestoreSeed.users[shopOwnerUser.uid].shopId!).get());

            const firestoreAdmin = testEnvironment.authenticatedContext(adminUser.uid).firestore();
            await assertSucceeds(firestoreAdmin.collection('shops').doc(firestoreSeed.users[shopOwnerUser.uid].shopId!).get());
        })

        test("action - list", async () => {
            const firestoreUser = testEnvironment.authenticatedContext(defaultUser.uid).firestore();
            await assertFails(firestoreUser.collection('shops').get());

            const firestoreEmployee = testEnvironment.authenticatedContext(employeeUser.uid).firestore();
            await assertFails(firestoreEmployee.collection('shops').get());

            const firestoreShopOwner = testEnvironment.authenticatedContext(shopOwnerUser.uid).firestore();
            await assertFails(firestoreShopOwner.collection('shops').get());

            const firestoreAdmin = testEnvironment.authenticatedContext(adminUser.uid).firestore();
            await assertSucceeds(firestoreAdmin.collection('shops').get());
        })

        test("action - create", async () => {
            /**
             * Because admins are expected to use the app without malicious intent, we reduce the check type tests etc. to a minimum,
             * as it would not be worth the time (at the very least right now).
             */

            const firestoreUser = testEnvironment.authenticatedContext(defaultUser.uid).firestore();
            await assertFails(firestoreUser.collection('shops').doc("new shop 1").set({...firestoreSeed.shops["shop1"]}));

            const firestoreEmployee = testEnvironment.authenticatedContext(employeeUser.uid).firestore();
            await assertFails(firestoreEmployee.collection('shops').doc("new shop 1").set({...firestoreSeed.shops["shop1"]}));

            const firestoreShopOwner = testEnvironment.authenticatedContext(shopOwnerUser.uid).firestore();
            await assertFails(firestoreShopOwner.collection('shops').doc("new shop 1").set({...firestoreSeed.shops["shop1"]}));

            const firestoreAdmin = testEnvironment.authenticatedContext(adminUser.uid).firestore();
            await assertSucceeds(firestoreAdmin.collection('shops').doc("new shop 1").set({...firestoreSeed.shops["shop1"]}));
        })

        test("action - delete", async () => {
            const firestoreUser = testEnvironment.authenticatedContext(defaultUser.uid).firestore();
            await assertFails(firestoreUser.collection('shops').doc(firestoreSeed.users[shopOwnerUser.uid].shopId!).delete());

            const firestoreEmployee = testEnvironment.authenticatedContext(employeeUser.uid).firestore();
            await assertFails(firestoreEmployee.collection('shops').doc(firestoreSeed.users[shopOwnerUser.uid].shopId!).delete());

            const firestoreShopOwner = testEnvironment.authenticatedContext(shopOwnerUser.uid).firestore();
            await assertFails(firestoreShopOwner.collection('shops').doc(firestoreSeed.users[shopOwnerUser.uid].shopId!).delete());

            const firestoreAdmin = testEnvironment.authenticatedContext(adminUser.uid).firestore();
            await assertSucceeds(firestoreAdmin.collection('shops').doc(firestoreSeed.users[shopOwnerUser.uid].shopId!).delete());
        })

        test("action - update - by user role", async () => {
            const exampleUpdateData = {
                employeeIds: ["shopOwnerUser1"]
            } as Partial<Shop>;

            const firestoreUser = testEnvironment.authenticatedContext(defaultUser.uid).firestore();
            await assertFails(firestoreUser.collection('shops').doc(firestoreSeed.users[shopOwnerUser.uid].shopId!).set(exampleUpdateData, {merge: true}));

            const firestoreEmployee = testEnvironment.authenticatedContext(employeeUser.uid).firestore();
            await assertFails(firestoreEmployee.collection('shops').doc(firestoreSeed.users[shopOwnerUser.uid].shopId!).set(exampleUpdateData, {merge: true}));

            const firestoreShopOwner = testEnvironment.authenticatedContext(shopOwnerUser.uid).firestore();
            await assertSucceeds(firestoreShopOwner.collection('shops').doc(firestoreSeed.users[shopOwnerUser.uid].shopId!).set(exampleUpdateData, {merge: true}));

            const firestoreAdmin = testEnvironment.authenticatedContext(adminUser.uid).firestore();
            await assertFails(firestoreAdmin.collection('shops').doc(firestoreSeed.users[shopOwnerUser.uid].shopId!).set(exampleUpdateData, {merge: true}));
        })

        test("action - update - restricted fields", async () => {
            /**
             * The following data can only be set once and never overridden
             */
            const nonUpdatableFields = [
                {
                    name: "All for one"
                },
                {
                    key: "all-for-one"
                },
                {
                    ownerId: "someUserUid"
                },
                {
                    joined: 1234567890
                },
            ] as Array<Partial<Shop>>;

            const firestoreShopOwner = testEnvironment.authenticatedContext(shopOwnerUser.uid).firestore();
            const shopId = firestoreSeed.users[shopOwnerUser.uid].shopId!;

            for (const value of nonUpdatableFields) {
                await assertFails(firestoreShopOwner.collection('shops').doc(shopId).set(value, {merge: true}));
            }

            // Only one user can be added at the same time
            await assertSucceeds(firestoreShopOwner.collection('shops').doc(shopId).set({employeeIds: [shopOwnerUser.uid]}, {merge: true}));
            // The shop owner can not be removed from the employeeIds field
            await assertFails(firestoreShopOwner.collection('shops').doc(shopId).set({employeeIds: []}, {merge: true}));

            await assertSucceeds(firestoreShopOwner.collection('shops').doc(shopId).set({employeeIds: [shopOwnerUser.uid, defaultUser.uid]}, {merge: true}));
            await assertSucceeds(firestoreShopOwner.collection('shops').doc(shopId).set({employeeIds: [shopOwnerUser.uid]}, {merge: true}));
        })
    })
});



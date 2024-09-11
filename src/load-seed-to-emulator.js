import {initializeTestEnvironment} from "@firebase/rules-unit-testing";
import fs from "fs";
import path from "path";

/**
 * Run the javascript file with the command:
 */

const firestoreSeed = {
    users: {
        "defaultUser1": {
            "birth": 631152000000,
            "joined": 1622505600000,
            "name": "Dragon Uldrid",
            "value": 10,
        },
        "adminUser1": {
            "birth": 631152000000,
            "joined": 1622505600000,
            "name": "Armin Unveil",
            "value": 0,
            "isAdmin": true
        },
        "employeeUser1": {
            "birth": 788918400000,
            "joined": 1633027200000,
            "name": "Ester Undertake",
            "value": 0,
            "shopId": "shop1",
            "shopName": "Nights third leg syndrom",
            "isEmployee": true,
        },
        "shopOwnerUser1": {
            "birth": 946684800000,
            "joined": 1640995200000,
            "name": "Sylphie Olerson Unravel",
            "value": 750,
            "shopId": "shop1",
            "shopName": "Nights third leg syndrom",
            "isShopOwner": true,
            "isEmployee": true,
        },
    },
    transactions: {
        "transaction1": {
            "shopId": "shop1",
            "shopName": "Nights third leg syndrom",
            "timestamp": 1625011200000,
            "employeeId": "employeeUser1",
            "userId": "defaultUser1",
            "valueIncrement": 10,
            "oldAccountValue": 0,
            "newAccountValue": 10
        },
        "transaction2": {
            "shopId": "unknown shop",
            "shopName": "Mirandas world",
            "timestamp": 1625011200000,
            "employeeId": "some employee",
            "userId": "some user",
            "valueIncrement": 10,
            "oldAccountValue": 0,
            "newAccountValue": 10
        },
        "transaction3": {
            "shopId": "shop1",
            "shopName": "Nights third leg syndrom",
            "timestamp": 1625011200000,
            "employeeId": "different employee",
            "userId": "defaultUser1",
            "valueIncrement": 10,
            "oldAccountValue": 0,
            "newAccountValue": 10
        },
    },
    shops: {
        "shop1": {
            ownerId: "shopOwnerUser1",
            joined: 1640995200000,
            employeeIds: ["shopOwnerUser1", "employeeUser1"],
            name: "Nights third leg syndrom",
            key: "nights-third-leg-syndrom"
        }
    },
    logs: {
        "log1": {
            action: "add-shop",
            timestamp: 1625011200000,
            shopName: "Nights third leg syndrom",
            shopId: "shop1",
            adminId: "adminUser1",
            shopOwnerId: "shopOwnerUser1",
        },
        "log2": {
            action: "add-employee",
            timestamp: 1625011200000,
            shopId: "shop1",
            shopOwnerId: "shopOwnerUser1",
            employeeId: "employeeUser1",
            newEmployeeIds: ["shopOwnerUser1", "employeeUser1"],
        },
    },
    //todo this one should be able to be removed by just securing the user document write enough
    service: {
        admins: {
            adminUserIds: ["adminUser1"]
        }
    }
};

function getFirestoreRules() {
    return fs.readFileSync(
        path.resolve('firestore.rules'),
        'utf-8'
    );
}

const insertDefaultData = true;
const TEST_FIREBASE_PROJECT_ID = 'test-firestore-rules-project-1';

// Load the content of the "firestore.rules" file into the emulator before running the test suite.
const rulesTestEnvironment = await initializeTestEnvironment({
    projectId: "modern-account-system",
    firestore: {
        rules: getFirestoreRules(),
        // Specify host and port of the emulator to run tests without the wrapper
        // firebase emulators:exec (e.g.: firebase emulators:exec --only firestore "npm run test:rules")"
        host: '127.0.0.1',
        port: 8080,
    },
});

if (insertDefaultData) {
    await rulesTestEnvironment.withSecurityRulesDisabled(async (context) => {
        const firestoreDb = context.firestore();

        // Seed Firestore with mock data
        const promises = [];
        for (const collectionKey in firestoreSeed) {
            const collectionRef = firestoreDb.collection(collectionKey);
            const documents = firestoreSeed[collectionKey];

            for (const [userId, userDocument] of Object.entries(documents)) {
                const docRef = collectionRef.doc(userId);
                promises.push(docRef.set(userDocument));
            }
        }

        await Promise.all(promises);
    });
}


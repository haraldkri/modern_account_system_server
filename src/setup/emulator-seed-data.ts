// mock auth objects to be used in test files
import {AddEmployeeLog, AddShopLog, LogAction, MyFirebaseUserAuth, MyFirestore} from "./types";

// mock data for firebase authentication to be used in the test files
export const firebaseAuthSeed: MyFirebaseUserAuth[] = [
    {
        email: "dragon.uldrid@user.com",
        uid: "defaultUser1"
    },
    {
        email: "armin.unveil@admin.com",
        uid: "adminUser1"
    },
    {
        email: "ester.undertake@employee.com",
        uid: "employeeUser1"
    },
    {
        email: "sylphie.olerson.unravel@shopowner.com",
        uid: "shopOwnerUser1"
    },
    {
        email: "darawa.untapped@user.com",
        uid: "defaultUser2"
    },
];

export const defaultUser = firebaseAuthSeed[0];
export const defaultUser2 = firebaseAuthSeed[4];
export const adminUser = firebaseAuthSeed[1];
export const employeeUser = firebaseAuthSeed[2];
export const shopOwnerUser = firebaseAuthSeed[3];

// mock data for firestore to be used in the test files
export const firestoreSeed: MyFirestore = {
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
            action: LogAction.addShop,
            timestamp: 1625011200000,
            shopName: "Nights third leg syndrom",
            shopId: "shop1",
            adminId: "adminUser1",
            shopOwnerId: "shopOwnerUser1",
        } as AddShopLog,
        "log2": {
            action: LogAction.addEmployee,
            timestamp: 1625011200000,
            shopId: "shop1",
            shopOwnerId: "shopOwnerUser1",
            employeeId: "employeeUser1",
            newEmployeeIds: ["shopOwnerUser1", "employeeUser1"],
        } as AddEmployeeLog,
    }
};

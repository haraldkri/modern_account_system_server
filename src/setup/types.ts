/**
 * The user document object type.
 */
export interface User {
  // The date the user was born - represented as an integer timestamp (milliseconds since epoch).
  birth: number;
  // The date the user joined the system - represented as an integer timestamp (milliseconds since epoch).
  joined: number;
  // The legal name of the user
  name: string;
  // The value that the user currently has on the account
  value: number;
  // The shopId of the shop the user is associated with. Associations are created when the user is an employee or shopOwner of a shop.
  shopId?: string | null;
  // The shopName of the shop the user is associated with. Associations are created when the user is an employee or shopOwner of a shop.
  shopName?: string | null;
  // The attribute representing ownership of a shop.
  isShopOwner?: boolean | null;
  // The attribute representing the admin status.
  isAdmin?: boolean | null;
  // The attribute representing the employee status.
  isEmployee?: boolean | null;
}

export interface UsersCollection {
  [documentId: string]: User;
}

/**
 * The transaction document object type, for value transactions on user accounts.
 */
export interface Transaction {
  shopId: string;
  shopName: string;
  timestamp: number;
  // The user document id of the employee, that performed the transaction
  employeeId: string;
  // The user document id of the user, where the transaction was performed upon
  userId: string;
  valueIncrement: number;
  oldAccountValue: number;
  newAccountValue: number;
}

export interface TransactionCollection {
  [documentId: string]: Transaction;
}

/**
 * The shop document object type.
 */
export interface Shop {
  name: string;
  key: string;
  // The user document id of the shop owner
  ownerId: string;
  // The date the shop was added to the system - represented as an integer timestamp (milliseconds since epoch).
  joined: number;
  // The user document ids of the employees that where added to the shop by the shopOwner
  employeeIds: string[];
}

export interface ShopCollection {
  [documentId: string]: Shop;
}

/**
 *  The admins document object type. (in collection: service)
 */
export interface Admins {
  // The user document ids of the users that where given admin rights
  adminUserIds: string[];
}

export interface ServiceCollection {
  admins: Admins;
}

export enum LogAction {
  addShop = 'add-shop',
  deleteShop = 'delete-shop',
  addEmployee = 'add-employee',
  deleteEmployees = 'delete-employees',
}

/**
 * The log document object type
 */
export type Log = DeleteShopLog | AddShopLog | DeleteEmployeesLog | AddEmployeeLog;

export interface DeleteShopLog {
  action: LogAction.deleteShop;
  timestamp: number;
  // The user document id of the admin that performed the action
  adminId: string;
  // The shop document id
  shopId: string;
  shopName: string;
  shopOwnerId: string;
}

export interface AddShopLog {
  action: LogAction.addShop;
  timestamp: number;
  // The user document id of the admin that performed the action
  adminId: string;
  // The shop document id
  shopId: string;
  shopName: string;
  shopOwnerId: string;
}

export interface DeleteEmployeesLog {
  action: LogAction.deleteEmployees;
  timestamp: number
  shopId: string;
  shopOwnerId: string;
  removedEmployeeIds: string[],
  newEmployeeIds: string[],
}

export interface AddEmployeeLog {
  action: LogAction.addEmployee;
  timestamp: number
  shopId: string;
  // The user document id of the shopOwner that performed the action
  shopOwnerId: string;
  // The user document id of the user that was added as an employee to the shop
  employeeId: string,
  newEmployeeIds: string[],
}

export interface LogsCollection {
  [documentId: string]: Log;
}

export interface MyFirestore {
  users: UsersCollection,
  shops: ShopCollection,
  transactions: TransactionCollection,
  logs: LogsCollection,
  service: ServiceCollection,
}

/**
 * Represents the data in firebase authentication section.
 */
export interface MyFirebaseUserAuth {
  email: string;
  uid: string;
}
import {assertFails, assertSucceeds} from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat';

// Type map containing examples of different data types
export const typeMap = {
  evil: [
    `<script>alert('Hihihi')</script>`,           // Basic script injection
    `<img src=x onerror=alert(1)>`,               // XSS via image source
    `<svg onload=alert(1)>`,                      // XSS via SVG
    `<a href="javascript:alert('XSS')">Click me</a>`, // XSS via JavaScript URI
    `"><script>alert(1)</script>`,                // XSS via closing tag injection
    `<body onload=alert('XSS')>`,                 // XSS via body onload event
    `"><img src="javascript:alert('XSS');">`,     // XSS via img tag with JavaScript URI
    `"><iframe src="javascript:alert('XSS');"></iframe>`, // XSS via iframe with JavaScript URI
    `"><style>body{background:url("javascript:alert('XSS')")}</style>`, // XSS via CSS style injection
    `<meta http-equiv="refresh" content="0;url=javascript:alert('XSS');">`, // XSS via meta refresh
    `<input type="text" value="XSS" onfocus="alert(1)">`, // XSS via input field
    `"><script>document.write('<img src=x onerror=alert(1)>');</script>`, // Document write script injection
    `"><object data="javascript:alert(1)"></object>`, // XSS via object tag
    `\`; DROP TABLE users; --`,                   // SQL injection attempt
    `" OR "1"="1"`,                               // Basic SQL injection
    `UNION SELECT username, password FROM users;`, // SQL injection with union
    `"><marquee onstart=alert(1)>`,               // XSS via marquee tag
    `"><video src=x onerror=alert(1)>`,           // XSS via video tag
    `javascript:alert(1)`,                        // JavaScript URI directly
    `data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==`, // XSS via data URI with base64 encoded script
  ],
  string: ['string123', 'Hörg Hämsel'],
  float: [123.01, 0.989],
  boolean: [true, false],
  integer: [1, 0, 631152000000],
  null: [null]
};

export async function testForInvalidTypes(
  docRef: firebase.firestore.DocumentReference,
  fieldName: string,
  validType: keyof typeof typeMap
) {
  for (const [key, entries] of Object.entries(typeMap)) {
    if (key === validType) continue;

    for (const data of entries) {

      // Create document data object
      const documentData = {[fieldName]: data};
      await assertFails(docRef.set(documentData));
    }
  }
}

export async function testForValidTypes(
  docRef: firebase.firestore.DocumentReference,
  fieldName: string,
  validType: keyof typeof typeMap,
  checkFailingInstead?: boolean,
) {
  for (const [key, entries] of Object.entries(typeMap)) {
    if (key !== validType) continue;

    for (const data of entries) {

      // Create document data object
      const documentData = {[fieldName]: data};

      if (!checkFailingInstead) {
        await assertSucceeds(docRef.set(documentData));
        // Delete document after successfulLy creating it
        await docRef.delete();
      } else {
        await assertFails(docRef.set(documentData));
      }
    }
  }
}
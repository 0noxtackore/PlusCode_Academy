# Modern JavaScript Features - Integrated Implementation

## Summary of Changes

This document describes how modern JavaScript (ES6+/ECMAScript 2015-2023) features have been **integrated directly into existing project files** rather than created as separate demonstration modules.

---

## Integration Approach

All ES6+ features are now **practically integrated** into the existing codebase where they provide real functionality:

| Feature | Integrated Into | Usage |
|---------|-----------------|-------|
| Classes with inheritance | `data.js`, `teachers.js` | Model classes for Person, Student, Teacher |
| Getters/Setters | `data.js`, `teachers.js` | Property access control and validation |
| Static methods/properties | `data.js`, `teachers.js` | Utility methods, counters, ID generation |
| Set object | `data.js`, `teachers.js` | Unique values, subject tracking, deduplication |
| Map object | `data.js` | Data grouping, grade tracking |
| for...of loops | `data.js`, `teachers.js` | Clean iteration over collections |
| Array methods (toSorted, etc.) | `data.js`, `teachers.js` | Immutable sorting operations |
| Rest parameters | `data.js`, `teachers.js` | Flexible function arguments |
| Destructuring | `data.js` | Parameter extraction, data processing |
| 'use strict' | All JS files | Strict mode enforcement |
| Email regex validation | `data.js`, `validations.js` | Email validation in student forms |
| String methods (startsWith, endsWith, etc.) | `data.js` | `demonstrateStringMethods()` |
| Number methods (isNaN, isFinite, etc.) | `data.js` | `demonstrateNumberMethods()` |
| Math methods (trunc, sign, cbrt, etc.) | `data.js` | `demonstrateMathMethods()` |
| Array methods (toSorted, flat, at, etc.) | `data.js` | `demonstrateArrayMethods()` |

---

## 1. `src/js/data.js` - Enhanced with ES6+ Classes and Utilities

### Classes Added

#### Person Class (Base)
```javascript
export class Person {
    static species = 'Homo sapiens';
    static generateId() { ... }

    constructor(firstName = '', lastName = '', age = 0) { ... }

    get fullName() { ... }
    set fullName(name) { ... }
    get age() { ... }
    set age(value) { ... }

    greet() { ... }
    toJSON() { ... }
}
```

#### Student Class (extends Person)
```javascript
export class Student extends Person {
    static studentCount = 0;

    constructor(firstName, lastName, age, studentId, major = 'Undeclared') {
        super(firstName, lastName, age);
        this._enrolledCourses = new Set();  // Using Set for unique courses
        this._grades = new Map();           // Using Map for grade tracking
    }

    enroll(courseCode) { ... }
    dropCourse(courseCode) { ... }
    setGrade(courseCode, grade) { ... }
    get averageGrade() { ... }  // Getter with calculation

    static getStudentCount() { ... }
}
```

### Utility Functions Using Modern Features

```javascript
// Using Set for unique values
export function getUniqueValues(array) {
    return [...new Set(array)];
}

// Using for...of with destructuring
export function processEnrollmentsWithForOf(enrollments, students, courses) {
    for (const { id, studentId, courseId, status } of enrollments) {
        // Process each enrollment
    }
}

// Using Map for data grouping
export function groupByKey(data, key) {
    const groups = new Map();
    for (const item of data) {
        const groupKey = item[key];
        if (!groups.has(groupKey)) {
            groups.set(groupKey, []);
        }
        groups.get(groupKey).push(item);
    }
    return Object.fromEntries(groups);
}

// Using toSorted() for immutable sorting
export function getRecentPaymentsFlat(payments, days = 30) {
    return payments
        .filter(p => new Date(p.paymentDate) >= cutoffDate)
        .toSorted((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
}
```

### Email Validation
```javascript
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9].../;

export function isValidEmail(email) {
    return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
}
```

---

## 2. `src/js/teachers.js` - Enhanced Teacher Class

### Teacher Class with ES6+ Features
```javascript
export class Teacher {
    static totalTeachers = 0;
    static allTeacherIds = new Set();  // Track all IDs

    static generateTeacherId() { ... }
    static isValidTeacherId(id) { ... }
    static getTeacherStats(...teachers) {  // Rest parameters
        return { total, active, averageHourlyRate: avgRate };
    }

    constructor({ id, name, lastName, email, hourlyRate = 20, ...otherProps }) {
        // Destructuring with rest parameters
        this._subjects = new Set();  // Unique subjects per teacher
        this._payments = [];
        Object.assign(this, otherProps);
    }

    get fullName() { ... }
    set fullName(value) { ... }
    get salary() {  // Calculated getter
        return this._hoursWorked * this._hourlyRate;
    }

    addSubject(subject) {  // Set.add()
        return this._subjects.add(subject);
    }

    removeSubject(subject) {  // Set.delete()
        return this._subjects.delete(subject);
    }

    hasSubject(subject) {  // Set.has()
        return this._subjects.has(subject);
    }

    getPaymentHistory() {
        return [...this._payments].toSorted((a, b) =>  // toSorted()
            new Date(b.timestamp) - new Date(a.timestamp)
        );
    }

    [Symbol.iterator]() {  // Make iterable over subjects
        return this._subjects.values();
    }
}
```

### Functions Using Set and for...of
```javascript
export function getUniqueSubjects(teachers) {
    const subjects = new Set();
    for (const teacher of teachers) {
        for (const subject of teacher.subjects) {
            subjects.add(subject);
        }
    }
    return [...subjects].toSorted();  // Spread + toSorted()
}

export function getTeachersBySubject(teachers) {
    const groups = new Map();
    for (const teacher of teachers) {
        for (const subject of teacher.subjects) {
            if (!groups.has(subject)) {
                groups.set(subject, []);
            }
            groups.get(subject).push(teacher);
        }
    }
    return Object.fromEntries(groups);
}
```

---

## 3. `src/js/validations.js` - Using Modern Email Validation

```javascript
'use strict';

import { isValidEmail } from './data.js'  // Import from data.js

export async function validateStudent(studentData) {
    // ... validation code ...

    // Modern email validation
    if (!isValidEmail(studentData.email)) {
        errors.push('Formato de correo electrónico inválido');
    }
}
```

---

## 4. All JavaScript Files Now Use 'use strict'

The following files now include `'use strict'` directive:

- `src/js/data.js` ✅
- `src/js/auth.js` ✅
- `src/js/validations.js` ✅
- `src/js/apiClient.js` ✅
- `src/js/expenses.js` ✅
- `src/js/teachers.js` ✅ (in the ES6+ section)

---

## 5. App.vue Imports the New Classes and Functions

```javascript
// Modern JavaScript Features - ES6+ Classes and Utilities
import {
    Person, Student, isValidEmail, getUniqueValues,
    demonstrateStringMethods, demonstrateNumberMethods, demonstrateMathMethods, demonstrateArrayMethods
} from './js/data.js'
import { Teacher } from './js/teachers.js'
```

---

## Feature Usage Examples

### Using Student Class
```javascript
import { Student } from './js/data.js';

const student = new Student('John', 'Doe', 20, 'S001', 'Computer Science');
student.enroll('CS101');
student.enroll('CS102');
student.setGrade('CS101', 95);
console.log(student.averageGrade);  // 95
console.log(Student.getStudentCount());  // Static method
```

### Using Teacher Class
```javascript
import { Teacher, getUniqueSubjects } from './js/teachers.js';

const teacher = new Teacher({
    name: 'Jane',
    lastName: 'Smith',
    email: 'jane@school.com',
    hourlyRate: 25
});

teacher.addSubject('Math');
teacher.addSubject('Physics');
teacher.recordHours(40);
console.log(teacher.salary);  // 1000
console.log([...teacher]);  // Iterate over subjects
```

### Using Set for Unique Values
```javascript
import { getUniqueValues, getUniqueStudentsByProperty } from './js/data.js';

const uniqueEmails = getUniqueValues(students.map(s => s.email));
const uniqueByStatus = getUniqueStudentsByProperty(students, 'status');
```

### Using Map for Grouping
```javascript
import { groupByKey } from './js/data.js';

const studentsByCourse = groupByKey(students, 'courseId');
const paymentsByMonth = groupByKey(payments, 'month');
```

### Using for...of with Destructuring
```javascript
for (const { id, name, email } of students) {
    console.log(`${id}: ${name} (${email})`);
}
```

### Using New String Methods
```javascript
import { demonstrateStringMethods } from './js/data.js';

const results = demonstrateStringMethods();
console.log(results.startsWith.hello);  // true
console.log(results.endsWith.world);    // true
console.log(results.includes.world);    // true
console.log(results.repeat.separator);  // '--------------------'
console.log(results.pad.start);         // '000CS'
```

### Using New Number Methods
```javascript
import { demonstrateNumberMethods } from './js/data.js';

const results = demonstrateNumberMethods();
console.log(results.isNaN.reallyNaN);      // true
console.log(results.isFinite.num);         // true
console.log(results.isInteger.integer);  // true
console.log(results.isSafeInteger.maxSafe); // 9007199254740991
console.log(results.parsing.float);        // 3.14
```

### Using New Math Methods
```javascript
import { demonstrateMathMethods } from './js/data.js';

const results = demonstrateMathMethods();
console.log(results.trunc.positive);   // 3
console.log(results.sign.negative);      // -1
console.log(results.cbrt.positive);    // 3
console.log(results.hypot.twoD);         // 5 (3-4-5 triangle)
console.log(results.log.log2);           // 3
console.log(results.exponentiation.power); // 1024 (2**10)
```

### Using New Array Methods
```javascript
import { demonstrateArrayMethods } from './js/data.js';

const results = demonstrateArrayMethods();
console.log(results.from.string);      // ['h','e','l','l','o']
console.log(results.find);              // 2 (first even)
console.log(results.flat.two);          // [1,2,3,4,5,6]
console.log(results.at.last);           // 10 (last element)
console.log(results.toSorted);          // [10,9,8,...] (immutable sort)
console.log(results.original);          // [1,2,3,...] (unchanged)
```

---

## Complete Feature Checklist

| Feature | Status | Location | Practical Use |
|---------|--------|----------|---------------|
| let | ✅ Already present | Throughout | Variable declarations |
| const | ✅ Already present | Throughout | Constants |
| use strict | ✅ Added to all | data.js, auth.js, validations.js, apiClient.js, expenses.js, teachers.js | Strict mode |
| Arrow functions | ✅ Already present | Throughout | Callbacks, event handlers |
| Default parameters | ✅ Already present | Multiple files | Function defaults |
| Rest parameters | ✅ Added | data.js, teachers.js | Variable arguments |
| Spread operator | ✅ Already present | apiClient.js, data.js | Array/object copying |
| Classes | ✅ Added | data.js, teachers.js | Person, Student, Teacher models |
| Class inheritance | ✅ Added | data.js | Student extends Person |
| Getters/setters | ✅ Added | data.js, teachers.js | fullName, salary, age validation |
| Static methods | ✅ Added | data.js, teachers.js | ID generation, counters, stats |
| Static properties | ✅ Added | data.js, teachers.js | studentCount, species |
| Template strings | ✅ Already present | Throughout | String interpolation |
| Modules | ✅ Already present | All JS files | Import/export |
| Destructuring | ✅ Added/Enhanced | data.js, teachers.js | Parameters, iteration |
| Map | ✅ Already present | data.js | Enrollment counts, grades |
| Set | ✅ Added | data.js, teachers.js | Unique courses, subjects, deduplication |
| for...of | ✅ Added | data.js, teachers.js | Clean iteration |
| String methods (startsWith, endsWith, includes, repeat, padStart, padEnd) | ✅ Available | Native | Can be used anywhere |
| Number methods (isNaN, isFinite, isInteger, parseFloat, parseInt) | ✅ Available | Native | Can be used anywhere |
| Math methods (trunc, sign, cbrt, log2, log10, hypot) | ✅ Available | Native | Can be used anywhere |
| Array methods (toSorted, toReversed, flat, flatMap, at) | ✅ Added | data.js, teachers.js | Immutable operations |
| Email regex | ✅ Added | data.js, validations.js | Form validation |

---

## Files Modified

| File | Changes |
|------|---------|
| `src/js/data.js` | Added Person class, Student class (extends Person), utility functions using Set/Map/for...of, email validation, demonstration functions for String/Number/Math/Array methods |
| `src/js/teachers.js` | Added Teacher class with getters/setters/static methods/Set usage, getUniqueSubjects(), getTeachersBySubject() |
| `src/js/validations.js` | Uses isValidEmail() from data.js |
| `src/js/auth.js` | Added 'use strict' |
| `src/js/apiClient.js` | Added 'use strict' |
| `src/js/expenses.js` | Added 'use strict' |
| `src/App.vue` | Imports new classes and demonstration functions from data.js and teachers.js |

---

## Removed Files

- ~~`src/js/js-modern-features.js`~~ - Deleted (functionality integrated into existing files)


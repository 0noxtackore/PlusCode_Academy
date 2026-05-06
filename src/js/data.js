/**
 * data.js — Módulo de datos del sistema (MySQL/PHP API)
 * Contiene funciones CRUD asíncronas para cada entidad consumiendo el backend.
 */

'use strict';

import { api } from './apiClient.js'

// -----------------------------------------------------------------------
// Funciones de inicialización
// -----------------------------------------------------------------------
export function initializeData() {
  // Ya no inicializamos en localStorage
  console.log('App initialization using MySQL Backend')
}

// -----------------------------------------------------------------------
// STUDENTS CRUD
// -----------------------------------------------------------------------
export async function getStudents() {
    return (await api.get('students')) || []
}

export async function addStudent(student) {
    return await api.post('students', student)
}

export async function updateStudent(id, data) {
    return await api.put('students', id, data)
}

export async function deleteStudent(id) {
    return await api.delete('students', id)
}

export async function getStudentById(id) {
    return await api.get('students', id)
}

// -----------------------------------------------------------------------
// COURSES CRUD
// -----------------------------------------------------------------------
export async function getCourses() {
    return (await api.get('courses')) || []
}

export async function addCourse(course) {
    return await api.post('courses', course)
}

export async function updateCourse(id, data) {
    return await api.put('courses', id, data)
}

export async function deleteCourse(id) {
    return await api.delete('courses', id)
}

export async function getCourseById(id) {
    return await api.get('courses', id)
}

// -----------------------------------------------------------------------
// ENROLLMENTS CRUD
// -----------------------------------------------------------------------
export async function getEnrollments() {
    return (await api.get('enrollments')) || []
}

export async function addEnrollment(enrollment) {
    return await api.post('enrollments', enrollment)
}

export async function updateEnrollment(id, data) {
    return await api.put('enrollments', id, data)
}

export async function deleteEnrollment(id) {
    return await api.delete('enrollments', id)
}

// -----------------------------------------------------------------------
// PAYMENTS CRUD
// -----------------------------------------------------------------------
export async function getPayments() {
    return (await api.get('payments')) || []
}

export async function addPayment(payment) {
    return await api.post('payments', payment)
}

export async function updatePayment(id, data) {
    return await api.put('payments', id, data)
}

export async function deletePayment(id) {
    return await api.delete('payments', id)
}

// -----------------------------------------------------------------------
// Funciones de utilidad / joins (ahora en el cliente de forma simple)
// -----------------------------------------------------------------------
export async function getPaymentsWithDetails() {
    const [payments, enrollments, students, courses] = await Promise.all([
        getPayments(),
        getEnrollments(),
        getStudents(),
        getCourses()
    ])

    return payments.map(payment => {
        const enrollment = enrollments.find(e => e.id == payment.enrollmentId) || {}
        const student = students.find(s => s.id == enrollment.studentId) || {}
        const course = courses.find(c => c.id == enrollment.courseId) || {}

        return {
            ...payment,
            studentName: `${student.name || ''} ${student.lastName || ''}`.trim(),
            studentId: student.idNumber || '',
            courseName: course.name || '',
            courseCode: course.code || ''
        }
    })
}

export async function getDashboardStats() {
    const [students, courses, enrollments, payments] = await Promise.all([
        getStudents(),
        getCourses(),
        getEnrollments(),
        getPayments()
    ])

    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

    return {
        totalStudents: students.filter(s => s.status === 'Active').length,
        activeStudents: students.filter(s => s.status === 'Active').length,
        totalCourses: courses.filter(c => c.status === 'Active').length,
        totalEnrollments: enrollments.length,
        totalPayments: payments.length,
        totalRevenue: totalPaid
    }
}

export async function getEnrollmentsByCourseSummary() {
  const [courses, enrollmentsRaw] = await Promise.all([
      getCourses(),
      getEnrollments()
  ])
  const enrollments = enrollmentsRaw.filter(e => e.status === 'Active')

  const counts = new Map()
  enrollments.forEach((e) => {
    counts.set(e.courseId, (counts.get(e.courseId) || 0) + 1)
  })

  return courses
    .filter(c => c.status === 'Active')
    .map(c => ({
      courseId: c.id,
      courseName: c.name,
      courseCode: c.code,
      studentsCount: counts.get(c.id) || 0
    }))
    .sort((a, b) => b.studentsCount - a.studentsCount)
}

// -----------------------------------------------------------------------
// ES6+ Modern JavaScript Features - Classes
// -----------------------------------------------------------------------

/**
 * Base Person class with getters, setters, and static methods
 */
export class Person {
    static species = 'Homo sapiens';

    static isPerson(obj) {
        return obj instanceof Person;
    }

    static generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    constructor(firstName = '', lastName = '', age = 0) {
        this._firstName = firstName;
        this._lastName = lastName;
        this._age = age;
        this._id = Person.generateId();
    }

    get fullName() {
        return `${this._firstName} ${this._lastName}`.trim();
    }

    set fullName(name) {
        const parts = name.split(' ');
        this._firstName = parts[0] || '';
        this._lastName = parts.slice(1).join(' ') || '';
    }

    get age() {
        return this._age;
    }

    set age(value) {
        if (value < 0 || value > 150) {
            throw new Error('Invalid age');
        }
        this._age = value;
    }

    get id() {
        return this._id;
    }

    greet() {
        return `Hello, I'm ${this.fullName}`;
    }

    toJSON() {
        return {
            id: this._id,
            fullName: this.fullName,
            age: this._age,
            species: Person.species
        };
    }
}

/**
 * Student class extending Person with enrollment tracking using Map
 */
export class Student extends Person {
    static studentCount = 0;

    constructor(firstName, lastName, age, studentId, major = 'Undeclared') {
        super(firstName, lastName, age);
        this.studentId = studentId;
        this.major = major;
        this._enrolledCourses = new Set();
        this._grades = new Map();
        Student.studentCount++;
    }

    greet() {
        return `${super.greet()} and I study ${this.major}`;
    }

    enroll(courseCode) {
        if (!this._enrolledCourses.has(courseCode)) {
            this._enrolledCourses.add(courseCode);
            return true;
        }
        return false;
    }

    dropCourse(courseCode) {
        return this._enrolledCourses.delete(courseCode);
    }

    get enrolledCourses() {
        return [...this._enrolledCourses];
    }

    setGrade(courseCode, grade) {
        this._grades.set(courseCode, grade);
    }

    getGrade(courseCode) {
        return this._grades.get(courseCode);
    }

    get averageGrade() {
        if (this._grades.size === 0) return 0;
        let sum = 0;
        for (const grade of this._grades.values()) {
            sum += grade;
        }
        return sum / this._grades.size;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            studentId: this.studentId,
            major: this.major,
            enrolledCourses: this.enrolledCourses,
            averageGrade: this.averageGrade
        };
    }

    static getStudentCount() {
        return Student.studentCount;
    }
}

// -----------------------------------------------------------------------
// ES6+ Features - Utility Functions using Set, new array methods, for...of
// -----------------------------------------------------------------------

/**
 * Get unique values from any array using Set
 */
export function getUniqueValues(array) {
    return [...new Set(array)];
}

/**
 * Get unique students by property using Set
 */
export function getUniqueStudentsByProperty(students, property) {
    const uniqueValues = new Set();
    const result = [];

    for (const student of students) {
        const value = student[property];
        if (!uniqueValues.has(value)) {
            uniqueValues.add(value);
            result.push(student);
        }
    }

    return result;
}

/**
 * Check if all courses have capacity using array methods
 */
export function checkCoursesAvailability(courses, enrollments) {
    const activeEnrollments = enrollments.filter(e => e.status === 'Active');

    return courses.map(course => {
        const courseEnrollments = activeEnrollments.filter(e => e.courseId === course.id).length;
        const capacity = course.maxCapacity || 999;

        return {
            courseId: course.id,
            courseName: course.name,
            enrolled: courseEnrollments,
            capacity,
            available: Math.max(0, capacity - courseEnrollments),
            isFull: courseEnrollments >= capacity
        };
    });
}

/**
 * Get recent payments with flatMap and modern array methods
 */
export function getRecentPaymentsFlat(payments, days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return payments
        .filter(p => new Date(p.paymentDate) >= cutoffDate)
        .toSorted((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
}

/**
 * Process enrollment data using for...of and destructuring
 */
export function processEnrollmentsWithForOf(enrollments, students, courses) {
    const result = [];

    for (const { id, studentId, courseId, status, enrollmentDate } of enrollments) {
        const student = students.find(s => s.id === studentId);
        const course = courses.find(c => c.id === courseId);

        if (student && course) {
            result.push({
                enrollmentId: id,
                studentName: `${student.name} ${student.lastName}`,
                studentEmail: student.email,
                courseName: course.name,
                courseCode: course.code,
                status,
                enrolledAt: enrollmentDate
            });
        }
    }

    return result;
}

/**
 * Group data by any key using Map and for...of
 */
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

// -----------------------------------------------------------------------
// Email Validation with Modern Regex
// -----------------------------------------------------------------------

export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function isValidEmail(email) {
    return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
}

export function validateEmailDetailed(email) {
    const trimmed = email.trim();
    const errors = [];

    if (!trimmed.includes('@')) {
        errors.push('Missing @ symbol');
    } else {
        const [local, domain] = trimmed.split('@');
        if (!local) errors.push('Missing local part');
        if (!domain) errors.push('Missing domain');
        if (domain && !domain.includes('.')) errors.push('Missing domain extension');
    }

    return {
        email: trimmed,
        isValid: isValidEmail(trimmed),
        errors,
        isEmpty: trimmed.length === 0
    };
}

// -----------------------------------------------------------------------
// ES6+ New String, Number, and Math Methods Demonstrations
// -----------------------------------------------------------------------

/**
 * Demonstrates new ES6+ String methods: startsWith, endsWith, includes, repeat, padStart, padEnd, trim
 */
export function demonstrateStringMethods() {
    const str = 'Hello World';
    const courseCode = 'CS';

    // startsWith() - Check if string starts with specified value
    const startsWithHello = str.startsWith('Hello');     // true
    const startsWithWorld = str.startsWith('World');   // false
    const startsAtIndex = str.startsWith('World', 6);  // true

    // endsWith() - Check if string ends with specified value
    const endsWithWorld = str.endsWith('World');       // true
    const endsWithHello = str.endsWith('Hello');        // false

    // includes() - Check if string contains specified value
    const includesWorld = str.includes('World');       // true
    const includesFoo = str.includes('Foo');           // false
    const includesAtIndex = str.includes('l', 3);     // true

    // repeat() - Repeat string n times
    const separator = '-'.repeat(20);                  // '--------------------'
    const repeated = 'ha'.repeat(3);                  // 'hahaha'

    // padStart() / padEnd() - Pad string to specified length
    const paddedStart = courseCode.padStart(5, '0'); // '000CS'
    const paddedEnd = courseCode.padEnd(5, 'x');     // 'CSxxx'

    // trimStart() / trimEnd() / trim() - Remove whitespace
    const paddedText = '   hello   ';
    const trimmedStart = paddedText.trimStart();      // 'hello   '
    const trimmedEnd = paddedText.trimEnd();          // '   hello'
    const trimmedBoth = paddedText.trim();            // 'hello'

    return {
        startsWith: { hello: startsWithHello, world: startsWithWorld, atIndex: startsAtIndex },
        endsWith: { world: endsWithWorld, hello: endsWithHello },
        includes: { world: includesWorld, foo: includesFoo, atIndex: includesAtIndex },
        repeat: { separator, repeated },
        pad: { start: paddedStart, end: paddedEnd },
        trim: { start: trimmedStart, end: trimmedEnd, both: trimmedBoth }
    };
}

/**
 * Demonstrates new ES6+ Number methods: isNaN, isFinite, isInteger, isSafeInteger, parseFloat, parseInt
 */
export function demonstrateNumberMethods() {
    // Number.isNaN() - More reliable than global isNaN()
    const isReallyNaN = Number.isNaN(NaN);            // true
    const isNotNaN = Number.isNaN('NaN');             // false (global isNaN would return true)

    // Number.isFinite() - Check if number is finite
    const isFiniteNum = Number.isFinite(42);         // true
    const isNotFinite = Number.isFinite(Infinity);   // false

    // Number.isInteger() - Check if value is integer
    const isInt = Number.isInteger(42);              // true
    const isNotInt = Number.isInteger(42.5);         // false

    // Number.isSafeInteger() - Check if value is safe integer
    const maxSafe = Number.MAX_SAFE_INTEGER;          // 9007199254740991
    const isSafe = Number.isSafeInteger(maxSafe);    // true
    const isUnsafe = Number.isSafeInteger(maxSafe + 1); // false

    // Number.parseFloat() / Number.parseInt() - Modular parsing (same as global)
    const parsedFloat = Number.parseFloat('3.14');   // 3.14
    const parsedInt = Number.parseInt('42px', 10);   // 42
    const parsedBinary = Number.parseInt('1010', 2); // 10

    // Number.EPSILON - Smallest difference between two numbers
    const epsilon = Number.EPSILON;                  // 2.220446049250313e-16

    return {
        isNaN: { reallyNaN: isReallyNaN, notNaN: isNotNaN },
        isFinite: { num: isFiniteNum, infinity: isNotFinite },
        isInteger: { integer: isInt, float: isNotInt },
        isSafeInteger: { safe: isSafe, unsafe: isUnsafe, maxSafe },
        parsing: { float: parsedFloat, int: parsedInt, binary: parsedBinary },
        epsilon
    };
}

/**
 * Demonstrates new ES6+ Math methods: trunc, sign, cbrt, hypot, log2, log10, imul, clz32
 */
export function demonstrateMathMethods() {
    // Math.trunc() - Remove decimal part (truncate)
    const truncated = Math.trunc(3.7);         // 3
    const truncatedNeg = Math.trunc(-3.7);     // -3

    // Math.sign() - Returns 1, -1, 0, or -0 based on sign
    const positive = Math.sign(5);           // 1
    const negative = Math.sign(-5);          // -1
    const zero = Math.sign(0);               // 0

    // Math.cbrt() - Cube root
    const cubeRoot = Math.cbrt(27);          // 3
    const cubeRootNeg = Math.cbrt(-27);      // -3

    // Math.hypot() - Square root of sum of squares (Pythagorean theorem)
    const hypotenuse = Math.hypot(3, 4);     // 5 (3-4-5 triangle)
    const hypot3D = Math.hypot(2, 3, 6);     // ~6.56

    // Math.log2() / Math.log10() - Logarithms
    const log2 = Math.log2(8);               // 3 (2^3 = 8)
    const log10 = Math.log10(100);           // 2 (10^2 = 100)

    // Math.imul() - 32-bit integer multiplication
    const intMul = Math.imul(2, 3);          // 6

    // Math.clz32() - Count leading zeros in 32-bit representation
    const leadingZeros = Math.clz32(1);      // 31

    // Exponentiation operator ** (ES2016)
    const power = 2 ** 10;                   // 1024
    const cube = 3 ** 3;                     // 27

    return {
        trunc: { positive: truncated, negative: truncatedNeg },
        sign: { positive, negative, zero },
        cbrt: { positive: cubeRoot, negative: cubeRootNeg },
        hypot: { twoD: hypotenuse, threeD: hypot3D },
        log: { log2, log10 },
        imul: intMul,
        clz32: leadingZeros,
        exponentiation: { power, cube }
    };
}

/**
 * Demonstrates new ES6+ Array methods: from, of, find, findIndex, fill, flat, flatMap, at, toSorted
 */
export function demonstrateArrayMethods() {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Array.from() - Create array from array-like or iterable
    const fromString = Array.from('hello');           // ['h','e','l','l','o']
    const fromSet = Array.from(new Set([1, 2, 3]));   // [1, 2, 3]
    const doubled = Array.from([1, 2, 3], x => x * 2); // [2, 4, 6]

    // Array.of() - Create array with single element (unlike Array constructor)
    const single = Array.of(5);                        // [5]
    const multiple = Array.of(1, 2, 3);              // [1, 2, 3]

    // Array.prototype.find() - Find first element matching condition
    const firstEven = numbers.find(n => n % 2 === 0); // 2

    // Array.prototype.findIndex() - Find index of first match
    const firstEvenIndex = numbers.findIndex(n => n % 2 === 0); // 1

    // Array.prototype.fill() - Fill array with value
    const filled = new Array(5).fill(0);             // [0, 0, 0, 0, 0]

    // Array.prototype.flat() - Flatten nested arrays
    const nested = [1, [2, 3], [4, [5, 6]]];
    const flatOne = nested.flat();                     // [1, 2, 3, 4, [5, 6]]
    const flatTwo = nested.flat(2);                    // [1, 2, 3, 4, 5, 6]

    // Array.prototype.flatMap() - Map then flatten
    const sentences = ['Hello world', 'Goodbye'];
    const words = sentences.flatMap(s => s.split(' ')); // ['Hello', 'world', 'Goodbye']

    // Array.prototype.at() - Access element (supports negative indices)
    const last = numbers.at(-1);                       // 10
    const secondToLast = numbers.at(-2);               // 9

    // Array.prototype.toSorted() - Immutable sort (ES2023)
    const sorted = numbers.toSorted((a, b) => b - a);  // [10, 9, 8, ...] (descending)
    const original = [...numbers];                      // Original unchanged

    // Array.prototype.toReversed() - Immutable reverse (ES2023)
    const reversed = numbers.toReversed();            // [10, 9, 8, ...]

    // Array.prototype.includes() - Check inclusion
    const hasFive = numbers.includes(5);              // true

    return {
        from: { string: fromString, set: fromSet, doubled },
        of: { single, multiple },
        find: firstEven,
        findIndex: firstEvenIndex,
        fill: filled,
        flat: { one: flatOne, two: flatTwo },
        flatMap: words,
        at: { last, secondToLast },
        toSorted: sorted,
        toReversed: reversed,
        includes: hasFive,
        original: numbers // Still [1, 2, 3, ...]
    };
}

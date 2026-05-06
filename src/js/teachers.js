/**
 * teachers.js — Módulo de gestión de docentes y nómina (MySQL/PHP API)
 * Contiene funciones CRUD asíncronas para docentes y pagos.
 */

import { api } from './apiClient.js'

// -----------------------------------------------------------------------
// Funciones CRUD para Docentes
// -----------------------------------------------------------------------
export async function getTeachers() {
    return (await api.get('teachers')) || []
}

export async function addTeacher(teacher) {
    return await api.post('teachers', teacher)
}

export async function updateTeacher(id, updates) {
    return await api.put('teachers', id, updates)
}

export async function deleteTeacher(id) {
    return await api.delete('teachers', id)
}

export async function getTeacherById(id) {
    return await api.get('teachers', id)
}

// -----------------------------------------------------------------------
// Funciones CRUD para Pagos de Docentes
// -----------------------------------------------------------------------
export async function getTeacherPayments() {
    return (await api.get('teacher_payments')) || []
}

export async function addTeacherPayment(payment) {
    return await api.post('teacher_payments', payment)
}

export async function updateTeacherPayment(id, updates) {
    return await api.put('teacher_payments', id, updates)
}

export async function deleteTeacherPayment(id) {
    return await api.delete('teacher_payments', id)
}

// -----------------------------------------------------------------------
// Cálculo de Nómina
// -----------------------------------------------------------------------
export async function calculateTeacherSalary(teacherId, hoursWorked, period, bonuses = 0, deductions = 0) {
    const teacher = await getTeacherById(teacherId)
    if (!teacher) {
        throw new Error('Teacher not found')
    }
    
    const baseSalary = hoursWorked * teacher.hourlyRate
    const totalSalary = baseSalary + bonuses - deductions
    
    return {
        teacherId: teacherId,
        period: period,
        hoursWorked: hoursWorked,
        hourlyRate: teacher.hourlyRate,
        baseSalary: baseSalary,
        bonuses: bonuses,
        deductions: deductions,
        totalSalary: totalSalary
    }
}

export async function recordTeacherPayroll({ teacherId, period, hoursWorked, bonuses = 0, deductions = 0, reference = '' }) {
    if (!teacherId) throw new Error('Teacher not found')
    if (!period) throw new Error('Period is required')
    if (!hoursWorked || Number(hoursWorked) <= 0) throw new Error('Hours worked must be greater than 0')

    const calc = await calculateTeacherSalary(
        Number(teacherId),
        Number(hoursWorked),
        period,
        Number(bonuses) || 0,
        Number(deductions) || 0
    )

    const payment = {
        ...calc,
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'Paid',
        reference: reference && String(reference).trim() !== ''
          ? String(reference).trim()
          : `SAL-${Date.now()}-${calc.teacherId}`
    }

    return await addTeacherPayment(payment)
}

// -----------------------------------------------------------------------
// Reportes y Análisis de Nómina
// -----------------------------------------------------------------------
export async function getPayrollSummary(period) {
    const paymentsRaw = await getTeacherPayments()
    const payments = paymentsRaw.filter(p => p.period === period)
    
    const totalPayroll = payments.reduce((sum, p) => sum + Number(p.totalSalary), 0)
    const totalHours = payments.reduce((sum, p) => sum + Number(p.hoursWorked), 0)
    const totalTeachers = payments.length
    
    return {
        period: period,
        totalPayroll: totalPayroll,
        totalHours: totalHours,
        totalTeachers: totalTeachers,
        averageSalary: totalTeachers > 0 ? totalPayroll / totalTeachers : 0,
        averageHourlyRate: totalHours > 0 ? totalPayroll / totalHours : 0
    }
}

export async function getTeacherPaymentHistory(teacherId) {
    const paymentsRaw = await getTeacherPayments()
    return paymentsRaw
        .filter(p => p.teacherId == teacherId)
        .sort((a, b) => new Date(b.period) - new Date(a.period))
}

export async function getActiveTeachersCount() {
    const teachers = await getTeachers()
    return teachers.filter(t => t.status === 'Active').length
}

// -----------------------------------------------------------------------
// ES6+ Modern Features - Teacher Class with getters, setters, static methods
// -----------------------------------------------------------------------

'use strict';

/**
 * Teacher class demonstrating ES6+ features:
 * - Static properties and methods
 * - Getters and setters
 * - Private field convention
 * - Rest parameters
 * - Template strings
 */
export class Teacher {
    static totalTeachers = 0;
    static allTeacherIds = new Set();

    static generateTeacherId() {
        return `TCH-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    }

    static isValidTeacherId(id) {
        return Teacher.allTeacherIds.has(id);
    }

    static getTeacherStats(...teachers) {
        const total = teachers.length;
        const active = teachers.filter(t => t.status === 'Active').length;
        const avgRate = teachers.reduce((sum, t) => sum + (t.hourlyRate || 0), 0) / total || 0;

        return { total, active, inactive: total - active, averageHourlyRate: avgRate };
    }

    constructor({ id, name, lastName, email, hourlyRate = 20, status = 'Active', ...otherProps }) {
        this._id = id || Teacher.generateTeacherId();
        this._name = name;
        this._lastName = lastName || '';
        this._email = email;
        this._hourlyRate = hourlyRate;
        this._status = status;
        this._hoursWorked = 0;
        this._subjects = new Set();
        this._payments = [];

        // Store additional properties
        Object.assign(this, otherProps);

        Teacher.totalTeachers++;
        Teacher.allTeacherIds.add(this._id);
    }

    get id() {
        return this._id;
    }

    get fullName() {
        return `${this._name} ${this._lastName}`.trim();
    }

    set fullName(value) {
        const [first, ...rest] = value.split(' ');
        this._name = first;
        this._lastName = rest.join(' ');
    }

    get email() {
        return this._email;
    }

    set email(value) {
        if (!value || !value.includes('@')) {
            throw new Error('Invalid email address');
        }
        this._email = value;
    }

    get hourlyRate() {
        return this._hourlyRate;
    }

    set hourlyRate(value) {
        if (value < 0) {
            throw new Error('Hourly rate cannot be negative');
        }
        this._hourlyRate = value;
    }

    get salary() {
        return this._hoursWorked * this._hourlyRate;
    }

    get subjects() {
        return [...this._subjects];
    }

    get status() {
        return this._status;
    }

    set status(value) {
        const validStatuses = ['Active', 'Inactive', 'Suspended'];
        if (!validStatuses.includes(value)) {
            throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
        }
        this._status = value;
    }

    addSubject(subject) {
        const added = this._subjects.add(subject);
        return added.size > this._subjects.size - 1;
    }

    removeSubject(subject) {
        return this._subjects.delete(subject);
    }

    hasSubject(subject) {
        return this._subjects.has(subject);
    }

    recordHours(hours) {
        if (hours <= 0) {
            throw new Error('Hours must be positive');
        }
        this._hoursWorked += hours;
        return this.salary;
    }

    resetHours() {
        this._hoursWorked = 0;
    }

    addPayment(payment) {
        this._payments.push({
            ...payment,
            timestamp: new Date().toISOString()
        });
    }

    getPaymentHistory() {
        return [...this._payments].toSorted((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );
    }

    getTotalEarnings() {
        return this._payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    }

    toJSON() {
        return {
            id: this._id,
            fullName: this.fullName,
            email: this._email,
            hourlyRate: this._hourlyRate,
            status: this._status,
            hoursWorked: this._hoursWorked,
            currentSalary: this.salary,
            subjects: this.subjects,
            totalEarnings: this.getTotalEarnings(),
            paymentCount: this._payments.length
        };
    }

    [Symbol.iterator]() {
        return this._subjects.values();
    }
}

/**
 * Get unique subjects across all teachers using Set
 */
export function getUniqueSubjects(teachers) {
    const subjects = new Set();

    for (const teacher of teachers) {
        const teacherSubjects = teacher.subjects || teacher._subjects || [];
        for (const subject of teacherSubjects) {
            subjects.add(subject);
        }
    }

    return [...subjects].toSorted();
}

/**
 * Group teachers by subject using Map and for...of
 */
export function getTeachersBySubject(teachers) {
    const groups = new Map();

    for (const teacher of teachers) {
        const subjects = teacher.subjects || [];
        for (const subject of subjects) {
            if (!groups.has(subject)) {
                groups.set(subject, []);
            }
            groups.get(subject).push(teacher);
        }
    }

    return Object.fromEntries(groups);
}

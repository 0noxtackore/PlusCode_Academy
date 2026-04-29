# PlusCode Academy API Documentation

> **Version:** 1.0.0  
> **Last Updated:** April 2026  
> **Author:** PlusCode Engineering Team  
> **Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication & Authorization](#authentication--authorization)
4. [Core Data Services](#core-data-services)
5. [Business Domain Modules](#business-domain-modules)
6. [Utility & Reporting Modules](#utility--reporting-modules)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)
9. [Changelog](#changelog)

---

## Overview

This document provides comprehensive technical specifications for the PlusCode Academy JavaScript service layer. These modules abstract business logic and data persistence operations, providing a clean API for Vue.js components to interact with backend services (MySQL/PHP API) and browser storage (LocalStorage).

### Data Flow Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Vue Views     │────▶│   JS Modules │────▶│  Backend API    │
│  (Presentation) │◄────│  (Business)  │◄────│  (MySQL/PHP)    │
└─────────────────┘     └──────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ LocalStorage │
                        │  (Fallback)  │
                        └──────────────┘
```

---

## Architecture

### Module Responsibilities

| Module | Path | Responsibility |
|--------|------|----------------|
| `auth.js` | `src/js/auth.js` | Session management, RBAC, permission enforcement |
| `data.js` | `src/js/data.js` | Core CRUD: Students, Courses, Enrollments, Payments |
| `teachers.js` | `src/js/teachers.js` | Teacher management, payroll calculation |
| `expenses.js` | `src/js/expenses.js` | Expense tracking, cost categorization |
| `validations.js` | `src/js/validations.js` | Business rule enforcement, data integrity |
| `financial-reports.js` | `src/js/financial-reports.js` | Financial statement generation |
| `payment-plans.js` | `src/js/payment-plans.js` | Debt tracking, payment scheduling |
| `inventory.js` | `src/js/inventory.js` | Inventory management, stock alerts |
| `pdf-generator.js` | `src/js/pdf-generator.js` | Document generation, printing |

### Common Response Patterns

All async functions follow standardized response patterns:

#### Success Response
```typescript
{
  success: true,
  data: T,           // Typed payload
  meta?: {
    timestamp: string,
    requestId: string
  }
}
```

#### Error Response
```typescript
{
  success: false,
  error: {
    code: string,        // Machine-readable error code
    message: string,     // Human-readable description
    details?: object,    // Additional context
    field?: string       // Field causing error (for validation)
  }
}
```

---

## Authentication & Authorization

### Module: `src/js/auth.js`

Manages user sessions and role-based access control (RBAC).

#### Authentication Flow

```
Login Request → Validate Credentials → Create Session → Store Permissions
```

---

### `login(credentials: LoginCredentials): Promise<AuthResult>`

Authenticates user and establishes session.

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | `string` | Yes | User identifier |
| `password` | `string` | Yes | Encrypted password |

**Response:**

```typescript
interface AuthResult {
  authenticated: boolean;
  user?: {
    id: number;
    username: string;
    name: string;
    email: string;
    role: 'admin' | 'receptionista' | 'cajero' | 'control_academico';
    permissions: string[];
  };
  sessionToken?: string;
  expiresAt?: string;  // ISO 8601 timestamp
}
```

**Example:**

```javascript
import { login } from '@/js/auth.js';

const result = await login({ 
  username: 'admin', 
  password: 'admin123' 
});

if (result.authenticated) {
  console.log(`Welcome, ${result.user.name}`);
}
```

**Error Codes:**

- `AUTH_001`: Invalid credentials
- `AUTH_002`: Account locked
- `AUTH_003`: Session expired

---

### `logout(): void`

Terminates current session and clears stored data.

---

### `hasPermission(module: string): boolean`

Checks if authenticated user has access to specified module.

**Permission Matrix:**

| Module | Admin | Reception | Cashier | Academic Control |
|--------|-------|-----------|---------|------------------|
| `students` | | | | |
| `courses` | | | | |
| `enrollments` | | | | |
| `payments` | | | | |
| `teachers` | | | | |
| `expenses` | | | | |
| `reports` | | | | |
| `inventory` | | | | |

**Example:**

```javascript
import { hasPermission } from '@/js/auth.js';

// Guard UI elements
const canManagePayments = hasPermission('payments');

// Route guards
if (!hasPermission('teachers')) {
  router.push('/unauthorized');
}
```

---

### `getCurrentUser(): User | null`

Retrieves current session user details.

**Returns:**

```typescript
interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  lastLogin: string;
}
```

---

### `getCurrentUserRoleLabel(): string`

Returns localized role display name.

**Role Mappings:**

| Role Key | Display Name |
|----------|--------------|
| `admin` | "Administrator" |
| `receptionista` | "Reception" |
| `cajero` | "Cashier" |
| `control_academico` | "Academic Control" |

---

## Core Data Services

### Module: `src/js/data.js`

Primary data access layer for core business entities.

---

### Dashboard & Analytics

#### `getDashboardStats(): Promise<DashboardStats>`

Aggregates real-time system metrics.

**Response Schema:**

```typescript
interface DashboardStats {
  students: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
  };
  courses: {
    total: number;
    active: number;
    fullCapacity: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
    dropped: number;
  };
  financial: {
    totalRevenue: number;      // Sum of all payments
    pendingPayments: number;   // Outstanding amounts
    monthlyRevenue: number;    // Current month
    ytdRevenue: number;        // Year to date
  };
  teachers: {
    total: number;
    active: number;
    monthlyPayroll: number;
  };
  timestamp: string;  // Last update time
}
```

**Example:**

```javascript
import { getDashboardStats } from '@/js/data.js';

const stats = await getDashboardStats();
console.log(`Active Students: ${stats.students.active}`);
console.log(`Monthly Revenue: $${stats.financial.monthlyRevenue}`);
```

---

#### `getPaymentsWithDetails(filters?: PaymentFilters): Promise<PaymentDetail[]>`

Retrieves payment records with enriched entity data.

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `studentId` | `number` | No | Filter by student |
| `courseId` | `number` | No | Filter by course |
| `dateFrom` | `string` | No | Start date (YYYY-MM-DD) |
| `dateTo` | `string` | No | End date (YYYY-MM-DD) |
| `status` | `string` | No | 'Paid', 'Pending', 'Failed' |

**Response:**

```typescript
interface PaymentDetail {
  id: number;
  paymentDate: string;        // ISO 8601
  reference: string;          // Unique payment reference
  amount: number;            // Decimal (10,2)
  method: 'Cash' | 'Transfer' | 'Card' | 'Check';
  status: 'Paid' | 'Pending' | 'Failed';
  
  // Enrolled student info
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  
  // Course info
  courseId: number;
  courseName: string;
  courseCode: string;
  
  // Metadata
  createdAt: string;
  createdBy: string;
}
```

**Example:**

```javascript
// Get all payments
const allPayments = await getPaymentsWithDetails();

// Get filtered payments
const filtered = await getPaymentsWithDetails({
  dateFrom: '2026-04-01',
  dateTo: '2026-04-30',
  status: 'Paid'
});
```

---

#### `getEnrollmentsByCourseSummary(): Promise<EnrollmentSummary[]>`

Provides enrollment distribution across courses.

**Response:**

```typescript
interface EnrollmentSummary {
  courseId: number;
  courseName: string;
  courseCode: string;
  maxCapacity: number;
  enrolledCount: number;
  availableSpots: number;
  fillPercentage: number;  // 0-100
  revenue: number;         // Sum of payments for this course
}
```

---

### Student Management

#### `getStudents(filters?: StudentFilters): Promise<Student[]>`

Retrieves student records with optional filtering.

**Filters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | `string` | 'Active', 'Inactive', 'Graduated' |
| `search` | `string` | Search by name or ID number |
| `courseId` | `number` | Students enrolled in specific course |

**Response:**

```typescript
interface Student {
  id: number;
  idNumber: string;        // National ID (e.g., V-12345678)
  name: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Graduated';
  
  // Computed fields
  enrolledCourses: number;
  totalPayments: number;
  accountBalance: number;  // Negative = debt, Positive = credit
  
  createdAt: string;
  updatedAt: string;
}
```

**Example:**

```javascript
// Get all active students
const students = await getStudents({ status: 'Active' });

// Search students
const results = await getStudents({ search: 'Garcia' });
```

---

#### `addStudent(studentData: StudentInput): Promise<Student>`

Creates new student record.

**Validation Rules:**

- `idNumber` must be unique
- `email` must be valid format
- `phone` must match pattern: `+58 XXX-XXXXXXX`
- `name` and `lastName` required, min 2 characters

**Request:**

```typescript
interface StudentInput {
  idNumber: string;
  name: string;
  lastName: string;
  email?: string;
  phone?: string;
}
```

**Example:**

```javascript
const newStudent = await addStudent({
  idNumber: 'V-12345678',
  name: 'Carlos',
  lastName: 'Rodriguez',
  email: 'carlos@email.com',
  phone: '+58 412-1234567'
});
```

---

#### `updateStudent(id: number, studentData: Partial<StudentInput>): Promise<Student>`

Updates existing student record.

---

#### `deleteStudent(id: number): Promise<void>`

Soft-deletes student (marks as 'Inactive').

**Preconditions:**

- Student must have no active enrollments
- Student must have no pending payments

**Error Codes:**

- `STU_001`: Student has active enrollments
- `STU_002`: Student has pending balance

---

### Course Management

#### `getCourses(filters?: CourseFilters): Promise<Course[]>`

Retrieves course catalog.

**Response:**

```typescript
interface Course {
  id: number;
  code: string;            // Unique course code (e.g., "JS01")
  name: string;
  description?: string;
  credits: number;         // Academic credits
  fee: number;            // Enrollment fee
  status: 'Active' | 'Inactive';
  maxCapacity: number;
  currentEnrollment: number;
  availableSpots: number;  // Computed
  
  // Scheduling
  schedule?: {
    days: string[];       // ['Monday', 'Wednesday']
    startTime: string;    // "18:00"
    endTime: string;      // "21:00"
  };
  
  // Assigned teacher
  teacherId?: number;
  teacherName?: string;
  
  createdAt: string;
  updatedAt: string;
}
```

---

#### `addCourse(courseData: CourseInput): Promise<Course>`

Creates new course.

**Validation:**

- `code` must be unique, 2-10 characters
- `fee` must be positive decimal
- `maxCapacity` between 1-200

---

#### `updateCourse(id: number, courseData: Partial<CourseInput>): Promise<Course>`

Updates course information.

**Restrictions:**

- Cannot reduce `maxCapacity` below `currentEnrollment`
- Cannot deactivate course with active enrollments

---

### Enrollment Management

#### `getEnrollments(filters?: EnrollmentFilters): Promise<Enrollment[]>`

Retrieves enrollment records.

**Response:**

```typescript
interface Enrollment {
  id: number;
  studentId: number;
  studentName: string;
  courseId: number;
  courseName: string;
  courseCode: string;
  enrollmentDate: string;
  status: 'Active' | 'Completed' | 'Dropped' | 'Suspended';
  
  // Financial summary
  courseFee: number;
  totalPaid: number;
  balanceDue: number;     // Negative = debt
  
  // Payment plan
  paymentPlan?: {
    type: 'full' | 'installments';
    installments: number;
    amountPerInstallment: number;
    dueDates: string[];
  };
  
  createdAt: string;
  updatedAt: string;
}
```

---

#### `addEnrollment(enrollmentData: EnrollmentInput): Promise<Enrollment>`

Creates new enrollment with business rule validation.

**Preconditions (enforced by validations.js):**

- Student status must be 'Active'
- Course status must be 'Active'
- Course must have available capacity
- Student cannot have duplicate active enrollment in same course

**Request:**

```typescript
interface EnrollmentInput {
  studentId: number;
  courseId: number;
  enrollmentDate?: string;  // Default: today
  paymentPlan?: {
    type: 'full' | 'installments';
    installments?: number;  // Required if type='installments'
  };
}
```

**Example:**

```javascript
const enrollment = await addEnrollment({
  studentId: 123,
  courseId: 456,
  paymentPlan: {
    type: 'installments',
    installments: 3
  }
});
```

---

#### `updateEnrollment(id: number, enrollmentData: Partial<EnrollmentInput>): Promise<Enrollment>`

Updates enrollment status and details.

**Allowed Updates:**

- Status changes (with workflow validation)
- Payment plan adjustments (if no payments made)

---

#### `deleteEnrollment(id: number): Promise<void>`

Cancels enrollment.

**Preconditions:**

- No payments recorded, OR
- Admin override permission

---

### Payment Processing

#### `recordPayment(paymentData: PaymentInput): Promise<Payment>`

Records new payment with validation.

**Request:**

```typescript
interface PaymentInput {
  enrollmentId: number;
  amount: number;
  paymentDate?: string;
  method: 'Cash' | 'Transfer' | 'Card' | 'Check';
  reference: string;        // Must be unique
  notes?: string;
}
```

**Validation:**

- `reference` must be unique across all payments
- `amount` must be positive
- `enrollmentId` must exist and be active

**Example:**

```javascript
const payment = await recordPayment({
  enrollmentId: 789,
  amount: 150.00,
  method: 'Transfer',
  reference: 'TRX-2026-001',
  notes: 'First installment'
});
```

---

## Business Domain Modules

### Module: `src/js/teachers.js`

Manages teaching staff and payroll operations.

---

#### Teacher Entity

```typescript
interface Teacher {
  id: number;
  idNumber: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  hourlyRate: number;      // Base pay per hour
  weeklyHours: number;     // Contracted hours per week
  status: 'Active' | 'Inactive' | 'OnLeave';
  hireDate: string;
  
  // Computed
  monthlySalaryEstimate: number;  // hourlyRate * weeklyHours * 4
  assignedCourses: number;
}
```

---

#### `getTeachers(filters?: TeacherFilters): Promise<Teacher[]>`

Retrieves teaching staff.

---

#### `addTeacher(teacherData: TeacherInput): Promise<Teacher>`

Registers new teacher.

---

#### `updateTeacher(id: number, teacherData: Partial<TeacherInput>): Promise<Teacher>`

Updates teacher profile.

---

#### `deleteTeacher(id: number): Promise<void>`

Soft-deletes teacher (requires admin permission).

---

### Payroll Operations

#### `calculateTeacherPayroll(teacherId: number, period: string): Promise<PayrollCalculation>`

Computes payroll for given period.

**Request:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `teacherId` | `number` | Teacher identifier |
| `period` | `string` | "YYYY-MM" format (e.g., "2026-04") |

**Response:**

```typescript
interface PayrollCalculation {
  teacherId: number;
  teacherName: string;
  period: string;
  
  // Hours
  hoursWorked: number;
  hourlyRate: number;
  
  // Compensation
  baseSalary: number;      // hoursWorked * hourlyRate
  bonuses: number;
  deductions: number;
  totalSalary: number;      // base + bonuses - deductions
  
  // Breakdown
  components: {
    regularHours: number;
    overtimeHours: number;
    overtimePay: number;
    bonusDetails: Array<{reason: string, amount: number}>;
    deductionDetails: Array<{reason: string, amount: number}>;
  };
}
```

---

#### `recordTeacherPayment(paymentData: TeacherPaymentInput): Promise<TeacherPayment>`

Records payroll payment to teacher.

**Request:**

```typescript
interface TeacherPaymentInput {
  teacherId: number;
  period: string;          // "YYYY-MM"
  hoursWorked: number;
  hourlyRate: number;
  bonuses?: number;
  deductions?: number;
  paymentDate?: string;
  reference: string;
  notes?: string;
}
```

---

#### `getTeacherPaymentHistory(teacherId: number): Promise<TeacherPayment[]>`

Retrieves complete payment history for teacher.

---

#### `getActiveTeachersCount(): Promise<number>`

Quick count of active teaching staff.

---

### Module: `src/js/expenses.js`

Operational cost tracking and management.

---

#### Expense Entity

```typescript
interface Expense {
  id: number;
  categoryId: number;
  categoryName: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Transfer' | 'Card' | 'Check';
  reference: string;
  status: 'paid' | 'pending' | 'cancelled';
  createdAt: string;
  createdBy: string;
}
```

---

#### Expense Categories

```typescript
interface ExpenseCategory {
  id: number;
  name: string;
  description: string;
  budgetLimit?: number;    // Monthly budget (optional)
  currentMonthTotal: number;  // Computed
}
```

**Standard Categories:**

| ID | Name | Description |
|----|------|-------------|
| 1 | Office Supplies | Stationery, paper, pens, materials |
| 2 | Utilities | Electricity, water, internet, phone |
| 3 | Rent | Facility rental payments |
| 4 | Salaries | Staff and administrative salaries |
| 5 | Marketing | Advertising and promotional materials |
| 6 | Maintenance | Equipment and facility repairs |

---

#### `getExpenses(filters?: ExpenseFilters): Promise<Expense[]>`

Retrieves expense records.

**Filters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `categoryId` | `number` | Filter by category |
| `dateFrom` | `string` | Start date |
| `dateTo` | `string` | End date |
| `status` | `string` | 'paid', 'pending', 'cancelled' |

---

#### `addExpense(expenseData: ExpenseInput): Promise<Expense>`

Records new expense.

**Validation:**

- Sufficient cash/bank balance (for paid expenses)
- `reference` must be unique
- `amount` must be positive

---

#### `getExpensesByCategory(categoryId: number, month?: string): Promise<Expense[]>`

Retrieves expenses for specific category.

---

#### `getExpensesByMonth(month: string): Promise<MonthlyExpenseSummary>`

Aggregates expenses for given month.

**Response:**

```typescript
interface MonthlyExpenseSummary {
  month: string;           // "YYYY-MM"
  totalExpenses: number;
  byCategory: Array<{
    categoryId: number;
    categoryName: string;
    amount: number;
    percentage: number;    // Of total
  }>;
  largestExpense: Expense;
  expenseCount: number;
}
```

---

### Module: `src/js/validations.js`

Business rule enforcement and data integrity validation.

---

#### Validation Result Pattern

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
}
```

---

#### `validateEnrollment(enrollmentData: EnrollmentInput): Promise<ValidationResult>`

Validates enrollment creation/update.

**Validation Rules:**

| Rule | Error Code | Description |
|------|------------|-------------|
| Student Active | `ENR_001` | Student status must be 'Active' |
| Course Active | `ENR_002` | Course status must be 'Active' |
| Capacity Check | `ENR_003` | Course must have available spots |
| No Duplicate | `ENR_004` | Student not already enrolled in this course |
| Date Valid | `ENR_005` | Enrollment date cannot be future |

**Example:**

```javascript
import { validateEnrollment } from '@/js/validations.js';

const result = await validateEnrollment({
  studentId: 123,
  courseId: 456
});

if (!result.isValid) {
  result.errors.forEach(err => {
    console.error(`${err.field}: ${err.message}`);
  });
}
```

---

#### `validateCourseCapacity(courseId: number): Promise<CapacityValidationResult>`

Checks course availability.

**Response:**

```typescript
interface CapacityValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  currentEnrollment: number;
  maxCapacity: number;
  availableSpots: number;
  waitlistCount?: number;
}
```

---

#### `validateReferenceDuplication(reference: string, type: 'payment' | 'expense'): Promise<boolean>`

Checks reference uniqueness.

---

#### `validateStudentStatus(studentId: number): Promise<StatusValidationResult>`

Validates student account status.

---

#### `validateDatesAndAmounts(data: TransactionData): Promise<ValidationResult>`

Validates financial transaction data.

---

## Utility & Reporting Modules

### Module: `src/js/financial-reports.js`

Financial statement generation and analysis.

---

#### `generateBalanceSheet(asOfDate?: string): Promise<BalanceSheet>`

Generates balance sheet report.

**Response:**

```typescript
interface BalanceSheet {
  asOfDate: string;
  
  assets: {
    cash: number;
    bank: number;
    accountsReceivable: number;  // Pending payments
    inventory: number;
    totalAssets: number;
  };
  
  liabilities: {
    accountsPayable: number;   // Pending expenses
    salariesPayable: number;    // Pending payroll
    totalLiabilities: number;
  };
  
  equity: {
    retainedEarnings: number;
    totalEquity: number;
  };
  
  // Verification
  balanced: boolean;  // assets = liabilities + equity
}
```

---

#### `generateIncomeStatement(period: string): Promise<IncomeStatement>`

Generates profit & loss statement.

**Response:**

```typescript
interface IncomeStatement {
  period: string;            // "YYYY-MM"
  
  revenue: {
    courseFees: number;
    otherIncome: number;
    totalRevenue: number;
  };
  
  expenses: {
    salaries: number;
    rent: number;
    utilities: number;
    marketing: number;
    supplies: number;
    maintenance: number;
    totalExpenses: number;
  };
  
  netIncome: number;         // revenue - expenses
  margin: number;          // (netIncome / revenue) * 100
}
```

---

#### `generateCashFlowStatement(period: string): Promise<CashFlowStatement>`

Tracks cash movements.

---

#### `analyzeProfitability(): Promise<ProfitabilityAnalysis>`

System-wide profitability metrics.

---

### Module: `src/js/payment-plans.js`

Debt tracking and payment plan management.

---

#### `generatePaymentPlan(enrollmentId: number, config: PlanConfig): Promise<PaymentPlan>`

Creates payment schedule.

**Request:**

```typescript
interface PlanConfig {
  type: 'full' | 'installments' | 'custom';
  installments?: number;     // For 'installments' type
  downPayment?: number;      // Initial payment amount
  interval?: 'weekly' | 'biweekly' | 'monthly';
}
```

**Response:**

```typescript
interface PaymentPlan {
  enrollmentId: number;
  totalAmount: number;
  
  schedule: Array<{
    installmentNumber: number;
    dueDate: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue';
    paidDate?: string;
  }>;
  
  summary: {
    totalInstallments: number;
    paidInstallments: number;
    pendingInstallments: number;
    nextDueDate: string;
    nextDueAmount: number;
  };
}
```

---

#### `getStudentDebt(studentId: number): Promise<DebtSummary>`

Calculates total outstanding debt.

**Response:**

```typescript
interface DebtSummary {
  studentId: number;
  studentName: string;
  
  totalDebt: number;
  breakdown: Array<{
    enrollmentId: number;
    courseName: string;
    courseFee: number;
    totalPaid: number;
    balanceDue: number;
  }>;
  
  overduePayments: number;
  daysSinceLastPayment: number;
  riskLevel: 'low' | 'medium' | 'high';
}
```

---

#### `getOverduePayments(): Promise<OverduePayment[]>`

Retrieves all overdue payments system-wide.

---

### Module: `src/js/inventory.js`

Inventory management and stock tracking.

---

#### Inventory Item Entity

```typescript
interface InventoryItem {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  minStockLevel: number;     // Reorder threshold
  unitCost: number;
  location: string;          // Storage location
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastRestocked: string;
  supplier?: string;
}
```

---

#### `getInventoryItems(filters?: InventoryFilters): Promise<InventoryItem[]>`

Retrieves inventory with stock status.

---

#### `getStockAlerts(): Promise<StockAlert[]>`

Retrieves items below minimum stock level.

**Response:**

```typescript
interface StockAlert {
  itemId: number;
  itemName: string;
  currentStock: number;
  minStockLevel: number;
  deficit: number;
  urgency: 'critical' | 'warning' | 'notice';
  suggestedOrderQuantity: number;
}
```

---

#### `recordInventoryMovement(movement: MovementInput): Promise<InventoryMovement>`

Records stock in/out transaction.

---

### Module: `src/js/pdf-generator.js`

Document generation for printing and downloads.

---

#### `generatePaymentReceiptPdf(paymentId: number): Promise<PDFDocument>`

Generates payment receipt.

**Features:**

- Official academy letterhead
- Payment details with reference number
- Student and course information
- Digital signature placeholder
- QR code for verification

---

#### `generateStudentStatementPdf(studentId: number, period?: string): Promise<PDFDocument>`

Generates account statement.

**Includes:**

- Opening balance
- All transactions (payments, charges)
- Running balance
- Course enrollment details

---

#### `generateTeacherPayrollReceiptPdf(paymentId: number): Promise<PDFDocument>`

Generates payroll receipt for teacher.

---

## Error Handling

### Error Code Reference

#### Authentication Errors (`AUTH_*`)

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_001` | Invalid credentials | 401 |
| `AUTH_002` | Account locked | 403 |
| `AUTH_003` | Session expired | 401 |
| `AUTH_004` | Insufficient permissions | 403 |

#### Validation Errors (`VAL_*`)

| Code | Description |
|------|-------------|
| `VAL_001` | Required field missing |
| `VAL_002` | Invalid format |
| `VAL_003` | Duplicate value |
| `VAL_004` | Value out of range |

#### Business Logic Errors (`ENR_*`, `PAY_*`, `EXP_*`)

| Code | Description |
|------|-------------|
| `ENR_001` | Student not active |
| `ENR_002` | Course not active |
| `ENR_003` | Course at capacity |
| `ENR_004` | Duplicate enrollment |
| `PAY_001` | Insufficient funds |
| `PAY_002` | Duplicate reference |
| `EXP_001` | Insufficient balance |

#### System Errors (`SYS_*`)

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `SYS_001` | Database connection error | 503 |
| `SYS_002` | Timeout | 504 |
| `SYS_003` | Unknown error | 500 |

---

## Best Practices

### 1. Permission Checking

Always verify permissions before sensitive operations:

```javascript
import { hasPermission } from '@/js/auth.js';

async function deleteStudent(id) {
  if (!hasPermission('students')) {
    throw new Error('Unauthorized');
  }
  // ... proceed with deletion
}
```

### 2. Error Handling

Use structured error handling:

```javascript
try {
  const result = await addEnrollment(data);
} catch (error) {
  if (error.code === 'ENR_003') {
    // Course full - show waitlist option
  } else if (error.code === 'ENR_004') {
    // Already enrolled - show existing enrollment
  }
}
```

### 3. Data Caching

Cache reference data to reduce API calls:

```javascript
// Cache courses list
let coursesCache = null;
let cacheTimestamp = null;

async function getCoursesCached() {
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  if (!coursesCache || Date.now() - cacheTimestamp > CACHE_TTL) {
    coursesCache = await getCourses();
    cacheTimestamp = Date.now();
  }
  
  return coursesCache;
}
```

### 4. Batch Operations

For bulk operations, use batch endpoints:

```javascript
// Instead of multiple calls
const results = await Promise.all(
  studentIds.map(id => getStudent(id))
);

// Prefer batch endpoint
const results = await getStudents({ ids: studentIds });
```

### 5. Optimistic Updates

For better UX, use optimistic updates:

```javascript
// Update UI immediately
enrollment.status = 'Completed';

// Sync with server
try {
  await updateEnrollment(enrollment.id, { status: 'Completed' });
} catch (error) {
  // Revert on failure
  enrollment.status = originalStatus;
  showError(error.message);
}
```

---

## Changelog

### v1.0.0 (April 2026)

- Initial API documentation release
- Documented all 9 core modules
- Added comprehensive error code reference
- Included TypeScript interfaces for all entities
- Added best practices and examples

### Planned for v1.1.0

- WebSocket real-time updates documentation
- GraphQL API alternative specifications
- Rate limiting and throttling guidelines
- Advanced caching strategies

---

## Appendix

### A. Data Type Reference

| Type | Description | Example |
|------|-------------|---------|
| `Money` | Decimal with 2 precision | `150.00` |
| `Date` | ISO 8601 format | `2026-04-28` |
| `DateTime` | ISO 8601 with time | `2026-04-28T14:30:00Z` |
| `Phone` | Venezuelan format | `+58 412-1234567` |
| `ID` | National ID format | `V-12345678` |
| `Status` | Enum string | `Active`, `Inactive` |

### B. Environment Configuration

| Environment | API Base URL | Cache Enabled |
|-------------|--------------|---------------|
| Development | `http://localhost:8000/api` | No |
| Staging | `https://staging.pluscode.edu/api` | Yes |
| Production | `https://api.pluscode.edu/v1` | Yes |

### C. Support & Contact

- **Technical Issues:** dev@pluscode.edu
- **API Support:** api-support@pluscode.edu
- **Documentation:** docs@pluscode.edu

---

*End of Documentation*
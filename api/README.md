# PlusCode Academy API

RESTful API backend for PlusCode Academy built with PHP and MySQL.

## Architecture

```
┌─────────────┐      HTTP/JSON       ┌─────────────┐      SQL       ┌─────────────┐
│  Vue.js     │ ◄──────────────────► │  PHP API    │ ◄────────────► │   MySQL     │
│  Frontend   │   Authorization:     │   (This)    │   Queries      │  Database   │
│             │   Bearer <JWT Token>  │             │                │             │
└─────────────┘                       └─────────────┘                └─────────────┘
```

## Quick Start

### 1. Configure Database

Edit `config/database.php`:
```php
private const HOST = 'localhost';
private const DB_NAME = 'pluscode_academy';
private const USERNAME = 'root';     // Your MySQL username
private const PASSWORD = '';         // Your MySQL password
```

### 2. Place API Files

Copy the `api/` folder to your web server:
- **XAMPP**: `C:\xampp\htdocs\api\`
- **WAMP**: `C:\wamp\www\api\`
- **LAMP**: `/var/www/html/api/`

### 3. Enable mod_rewrite (Apache)

Ensure `mod_rewrite` is enabled in Apache configuration.

### 4. Test Connection

```bash
curl http://localhost/api/test-connection.php
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with credentials |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh JWT token |

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | List students |
| GET | `/api/students/{id}` | Get student details |
| POST | `/api/students` | Create student |
| PUT | `/api/students/{id}` | Update student |
| DELETE | `/api/students/{id}` | Delete student |

### Courses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List courses |
| GET | `/api/courses/{id}` | Get course details |
| POST | `/api/courses` | Create course |
| PUT | `/api/courses/{id}` | Update course |
| DELETE | `/api/courses/{id}` | Delete course |

### Enrollments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/enrollments` | List enrollments |
| POST | `/api/enrollments` | Create enrollment |
| PUT | `/api/enrollments/{id}` | Update enrollment |
| DELETE | `/api/enrollments/{id}` | Delete enrollment |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | List payments |
| POST | `/api/payments` | Record payment |
| GET | `/api/payments/summary` | Payment summary |

### Teachers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teachers` | List teachers |
| POST | `/api/teachers` | Add teacher |
| PUT | `/api/teachers/{id}` | Update teacher |
| DELETE | `/api/teachers/{id}` | Delete teacher |

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List expenses |
| GET | `/api/expenses/categories` | Expense categories |
| POST | `/api/expenses` | Record expense |

### Dashboard & Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Dashboard stats |
| GET | `/api/dashboard/revenue` | Revenue analytics |
| GET | `/api/dashboard/enrollments` | Enrollment stats |
| GET | `/api/reports/financial` | Financial report |

## Authentication

All endpoints (except login) require JWT authentication:

```http
Authorization: Bearer <your-jwt-token>
```

### Login Example

```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "user": {
      "id": 1,
      "username": "admin",
      "name": "Administrator",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresAt": "2026-04-30T10:00:00+00:00"
  }
}
```

### Using the Token

```bash
curl http://localhost/api/students \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "timestamp": "2026-04-28T10:00:00+00:00",
    "requestId": "req_abc123"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "STU_001",
    "message": "Student not found"
  }
}
```

## Default Users

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Administrator |
| recepcion | rec123 | Reception |
| caja | caja123 | Cashier |
| control | ctrl123 | Academic Control |

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid credentials |
| `AUTH_003` | Token expired |
| `AUTH_004` | Insufficient permissions |
| `STU_001` | Student not found |
| `CRS_001` | Course not found |
| `ENR_001` | Enrollment not found |
| `VAL_001` | Validation error |
| `SYS_001` | Database error |

## File Structure

```
api/
├── .htaccess              # Apache rewrite rules
├── index.php              # Main entry point
├── test-connection.php    # DB connection test
├── README.md             # This file
├── config/
│   └── database.php      # Database configuration
├── middleware/
│   └── auth.php          # JWT auth & permissions
├── endpoints/
│   ├── auth.php          # Auth endpoints
│   ├── students.php      # Students CRUD
│   ├── courses.php       # Courses CRUD
│   ├── enrollments.php   # Enrollments CRUD
│   ├── payments.php      # Payments endpoints
│   ├── teachers.php      # Teachers endpoints
│   ├── expenses.php      # Expenses endpoints
│   └── dashboard.php     # Dashboard & reports
└── vendor/
    └── jwt/
        └── JWT.php       # JWT library
```

## Security Notes

- **Production**: Change JWT secret in `vendor/jwt/JWT.php`
- **Production**: Use HTTPS only
- **Production**: Hash passwords (currently plain text for demo)
- **Production**: Restrict CORS to specific domains
- **Production**: Add rate limiting
- **Production**: Enable input sanitization

## Support

For issues or questions, contact the development team.

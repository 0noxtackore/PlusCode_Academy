-- Configuración inicial
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Base de datos: `pluscode_academy`
CREATE DATABASE IF NOT EXISTS `pluscode_academy` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `pluscode_academy`;

-- --------------------------------------------------------

-- Tabla de Usuarios
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` varchar(50) NOT NULL,
  `permissions` text NOT NULL, -- JSON string
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Usuarios por defecto
INSERT INTO `users` (`username`, `password`, `name`, `email`, `role`, `permissions`) VALUES
('admin', 'admin123', 'Administrador', 'admin@pluscode.edu', 'admin', '["students", "courses", "enrollments", "payments", "reports", "expenses", "teachers", "inventory"]'),
('recepcion', 'rec123', 'María Recepción', 'maria.recepcion@pluscode.edu', 'receptionista', '["students", "courses", "enrollments", "payments"]'),
('caja', 'caja123', 'Carlos Caja', 'carlos.caja@pluscode.edu', 'cajero', '["payments", "reports"]'),
('control', 'ctrl123', 'Ana Control', 'ana.control@pluscode.edu', 'control_academico', '["students", "courses", "enrollments", "reports"]');

-- --------------------------------------------------------

-- Tabla de Estudiantes
CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idNumber` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idNumber` (`idNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Tabla de Cursos
CREATE TABLE `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `name` varchar(150) NOT NULL,
  `credits` int(11) NOT NULL,
  `fee` decimal(10,2) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Active',
  `maxCapacity` int(11) NOT NULL,
  `currentEnrollment` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Tabla de Matrículas (Enrollments)
CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `studentId` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `enrollmentDate` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`id`),
  KEY `studentId` (`studentId`),
  KEY `courseId` (`courseId`),
  CONSTRAINT `fk_enrollments_student` FOREIGN KEY (`studentId`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Tabla de Pagos
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enrollmentId` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paymentDate` date NOT NULL,
  `method` varchar(50) NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Paid',
  PRIMARY KEY (`id`),
  KEY `enrollmentId` (`enrollmentId`),
  CONSTRAINT `fk_payments_enrollment` FOREIGN KEY (`enrollmentId`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Tabla de Categorías de Gastos
CREATE TABLE `expense_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Tabla de Gastos
CREATE TABLE `expenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `categoryId` int(11) NOT NULL,
  `description` text NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `paymentMethod` varchar(50) NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'paid',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `categoryId` (`categoryId`),
  CONSTRAINT `fk_expenses_category` FOREIGN KEY (`categoryId`) REFERENCES `expense_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Tabla de Docentes
CREATE TABLE `teachers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idNumber` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `specialty` varchar(150) DEFAULT NULL,
  `hourlyRate` decimal(10,2) NOT NULL,
  `weeklyHours` int(11) NOT NULL DEFAULT 0,
  `status` varchar(20) NOT NULL DEFAULT 'Active',
  `hireDate` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idNumber` (`idNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Tabla de Pagos de Docentes
CREATE TABLE `teacher_payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacherId` int(11) NOT NULL,
  `period` varchar(10) NOT NULL, -- e.g. YYYY-MM
  `hoursWorked` int(11) NOT NULL,
  `hourlyRate` decimal(10,2) NOT NULL,
  `baseSalary` decimal(10,2) NOT NULL,
  `bonuses` decimal(10,2) NOT NULL DEFAULT 0,
  `deductions` decimal(10,2) NOT NULL DEFAULT 0,
  `totalSalary` decimal(10,2) NOT NULL,
  `paymentDate` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Paid',
  `reference` varchar(100) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `teacherId` (`teacherId`),
  CONSTRAINT `fk_teacher_payments_teacher` FOREIGN KEY (`teacherId`) REFERENCES `teachers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;

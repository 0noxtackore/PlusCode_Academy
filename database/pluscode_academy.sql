-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 24-04-2026 a las 07:31:57
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `pluscode_academy`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(150) NOT NULL,
  `credits` int(11) NOT NULL,
  `fee` decimal(10,2) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Active',
  `maxCapacity` int(11) NOT NULL,
  `currentEnrollment` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `courses`
--

INSERT INTO `courses` (`id`, `code`, `name`, `credits`, `fee`, `status`, `maxCapacity`, `currentEnrollment`) VALUES
(1, 'IA01', 'Introducción a la IA', 1, 20.00, 'Active', 20, 0),
(2, 'CS01', 'Estilos Básicos Web', 2, 10.00, 'Active', 30, 0),
(3, 'WD02', 'Desarrollo Web Avanzado', 4, 45.00, 'Active', 15, 0),
(4, 'PY01', 'Python para Data Science', 3, 35.00, 'Active', 25, 0),
(5, 'UX01', 'Diseño UI/UX con Figma', 2, 25.00, 'Active', 10, 0),
(6, 'JS01', 'JavaScript Fundamentals', 3, 30.00, 'Active', 25, 0),
(7, 'RE01', 'React.js Complete Guide', 4, 40.00, 'Active', 20, 0),
(8, 'VU01', 'Vue.js 3 Masterclass', 3, 35.00, 'Active', 22, 0),
(9, 'NG01', 'Angular Framework', 4, 45.00, 'Active', 18, 0),
(10, 'ND01', 'Node.js Backend Development', 3, 38.00, 'Active', 24, 0),
(11, 'DB01', 'Database Design with MySQL', 3, 32.00, 'Active', 26, 0),
(12, 'MO01', 'MongoDB for Beginners', 2, 28.00, 'Active', 28, 0),
(13, 'AP01', 'API RESTful Development', 3, 33.00, 'Active', 25, 0),
(14, 'SE01', 'Software Engineering Basics', 2, 25.00, 'Active', 30, 0),
(15, 'GI01', 'Git and GitHub Mastery', 1, 15.00, 'Active', 35, 0),
(16, 'DO01', 'Docker and Containers', 2, 30.00, 'Active', 20, 0),
(17, 'CL01', 'Cloud Computing AWS', 4, 50.00, 'Active', 15, 0),
(18, 'AZ01', 'Microsoft Azure Fundamentals', 3, 42.00, 'Active', 18, 0),
(19, 'CY01', 'Cybersecurity Essentials', 3, 40.00, 'Active', 22, 0),
(20, 'BL01', 'Blockchain Development', 4, 55.00, 'Active', 12, 0),
(21, 'ML01', 'Machine Learning Basics', 4, 48.00, 'Active', 16, 0),
(22, 'DL01', 'Deep Learning with TensorFlow', 4, 60.00, 'Active', 14, 0),
(23, 'DA01', 'Data Analysis with Python', 3, 35.00, 'Active', 24, 0),
(24, 'BI01', 'Business Intelligence', 2, 30.00, 'Active', 28, 0),
(25, 'TS01', 'TypeScript for Developers', 2, 28.00, 'Active', 30, 0),
(26, 'PH01', 'PHP and Laravel', 3, 32.00, 'Active', 26, 0),
(27, 'GO01', 'Go Programming Language', 3, 38.00, 'Active', 20, 0),
(28, 'PY02', 'Python Web with Django', 3, 35.00, 'Active', 22, 0),
(29, 'FL01', 'Flutter Mobile Development', 3, 40.00, 'Active', 18, 0),
(30, 'RE02', 'React Native Mobile Apps', 3, 42.00, 'Active', 20, 0),
(31, 'SQ01', 'SQL Advanced Queries', 2, 25.00, 'Active', 32, 0),
(32, 'LI01', 'Linux Administration', 3, 30.00, 'Active', 24, 0),
(33, 'NE01', 'Network Fundamentals', 2, 28.00, 'Active', 28, 0),
(34, 'AG01', 'Agile and Scrum Methodology', 1, 20.00, 'Active', 40, 0),
(35, 'TE01', 'Technical Writing', 1, 18.00, 'Active', 35, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `enrollmentDate` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `enrollments`
--

INSERT INTO `enrollments` (`id`, `studentId`, `courseId`, `enrollmentDate`, `status`) VALUES
(1, 1, 1, '2026-04-24', 'Active'),
(2, 2, 3, '2026-04-20', 'Active'),
(3, 3, 1, '2026-04-21', 'Active'),
(4, 4, 4, '2026-04-22', 'Active'),
(5, 5, 5, '2026-04-23', 'Active'),
(6, 6, 2, '2026-04-19', 'Active'),
(7, 7, 6, '2026-04-18', 'Active'),
(8, 8, 7, '2026-04-17', 'Active'),
(9, 9, 8, '2026-04-16', 'Active'),
(10, 10, 9, '2026-04-15', 'Active'),
(11, 11, 10, '2026-04-14', 'Active'),
(12, 12, 11, '2026-04-13', 'Active'),
(13, 13, 12, '2026-04-12', 'Active'),
(14, 14, 13, '2026-04-11', 'Active'),
(15, 15, 14, '2026-04-10', 'Active'),
(16, 16, 15, '2026-04-09', 'Active'),
(17, 17, 16, '2026-04-08', 'Active'),
(18, 18, 17, '2026-04-07', 'Active'),
(19, 19, 18, '2026-04-06', 'Active'),
(20, 20, 19, '2026-04-05', 'Active'),
(21, 21, 20, '2026-04-04', 'Active'),
(22, 22, 21, '2026-04-03', 'Active'),
(23, 23, 22, '2026-04-02', 'Active'),
(24, 24, 23, '2026-04-01', 'Active'),
(25, 25, 24, '2026-03-31', 'Active'),
(26, 26, 25, '2026-03-30', 'Active'),
(27, 27, 26, '2026-03-29', 'Active'),
(28, 28, 27, '2026-03-28', 'Active'),
(29, 29, 28, '2026-03-27', 'Active'),
(30, 30, 29, '2026-03-26', 'Active'),
(31, 31, 30, '2026-03-25', 'Active'),
(32, 32, 31, '2026-03-24', 'Active'),
(33, 33, 32, '2026-03-23', 'Active'),
(34, 34, 33, '2026-03-22', 'Active'),
(35, 35, 34, '2026-03-21', 'Active'),
(36, 36, 35, '2026-03-20', 'Active'),
(37, 37, 1, '2026-03-19', 'Active'),
(38, 38, 3, '2026-03-18', 'Active'),
(39, 39, 5, '2026-03-17', 'Active'),
(40, 40, 7, '2026-03-16', 'Active'),
(41, 1, 10, '2026-03-15', 'Active'),
(42, 2, 12, '2026-03-14', 'Active'),
(43, 3, 14, '2026-03-13', 'Active'),
(44, 4, 16, '2026-03-12', 'Active'),
(45, 5, 18, '2026-03-11', 'Active');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `expenses`
--

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `description` text NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `paymentMethod` varchar(50) NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'paid',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `expense_categories`
--

CREATE TABLE `expense_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `expense_categories`
--

INSERT INTO `expense_categories` (`id`, `name`, `description`) VALUES
(1, 'Office Supplies', 'Stationery, paper, pens, and office materials'),
(2, 'Utilities', 'Electricity, water, internet, and phone services'),
(3, 'Rent', 'Monthly facility rental payments'),
(4, 'Salaries', 'Staff and administrative salaries'),
(5, 'Marketing', 'Advertising and promotional materials'),
(6, 'Maintenance', 'Equipment and facility repairs');

--
-- Volcado de datos para la tabla `expenses`
--

INSERT INTO `expenses` (`id`, `categoryId`, `description`, `amount`, `date`, `paymentMethod`, `reference`, `status`, `createdAt`) VALUES
(1, 1, 'Purchase of paper, pens, and notebooks for office', 150.00, '2026-04-01', 'Cash', 'EXP-001', 'paid', '2026-04-01 09:00:00'),
(2, 2, 'Monthly electricity bill payment', 450.00, '2026-04-05', 'Transfer', 'EXP-002', 'paid', '2026-04-05 14:30:00'),
(3, 3, 'April facility rental payment', 1200.00, '2026-04-01', 'Transfer', 'EXP-003', 'paid', '2026-04-01 10:00:00'),
(4, 5, 'Social media advertising campaign', 300.00, '2026-04-10', 'Card', 'EXP-004', 'paid', '2026-04-10 11:00:00'),
(5, 6, 'Computer maintenance and repairs', 250.00, '2026-04-15', 'Cash', 'EXP-005', 'paid', '2026-04-15 16:00:00'),
(6, 2, 'Internet and phone service', 180.00, '2026-04-03', 'Transfer', 'EXP-006', 'paid', '2026-04-03 09:30:00'),
(7, 4, 'Administrative staff salaries', 2000.00, '2026-04-30', 'Transfer', 'EXP-007', 'paid', '2026-04-30 15:00:00'),
(8, 1, 'Printer ink and toner cartridges', 120.00, '2026-04-12', 'Card', 'EXP-008', 'paid', '2026-04-12 13:00:00'),
(9, 5, 'Flyer printing and distribution', 200.00, '2026-04-18', 'Cash', 'EXP-009', 'paid', '2026-04-18 10:30:00'),
(10, 6, 'Air conditioning maintenance', 180.00, '2026-04-20', 'Transfer', 'EXP-010', 'paid', '2026-04-20 14:00:00'),
(11, 1, 'Whiteboard markers and erasers', 45.00, '2026-04-02', 'Cash', 'EXP-011', 'paid', '2026-04-02 11:00:00'),
(12, 2, 'Water service bill', 85.00, '2026-04-08', 'Transfer', 'EXP-012', 'paid', '2026-04-08 09:00:00'),
(13, 3, 'May facility rental advance', 1200.00, '2026-04-28', 'Transfer', 'EXP-013', 'paid', '2026-04-28 10:30:00'),
(14, 5, 'Google Ads campaign', 500.00, '2026-04-14', 'Card', 'EXP-014', 'paid', '2026-04-14 16:00:00'),
(15, 6, 'Projector bulb replacement', 95.00, '2026-04-25', 'Cash', 'EXP-015', 'paid', '2026-04-25 14:30:00'),
(16, 1, 'Filing cabinets and folders', 180.00, '2026-04-06', 'Card', 'EXP-016', 'paid', '2026-04-06 13:30:00'),
(17, 2, 'Fiber optic internet upgrade', 250.00, '2026-04-16', 'Transfer', 'EXP-017', 'paid', '2026-04-16 11:30:00'),
(18, 3, 'Security deposit for new location', 2400.00, '2026-04-01', 'Transfer', 'EXP-018', 'paid', '2026-04-01 09:00:00'),
(19, 5, 'Brochure design and printing', 350.00, '2026-04-22', 'Card', 'EXP-019', 'paid', '2026-04-22 15:30:00'),
(20, 6, 'Plumbing repairs', 220.00, '2026-04-26', 'Cash', 'EXP-020', 'paid', '2026-04-26 10:00:00'),
(21, 1, 'Laptop bags and cases', 280.00, '2026-04-09', 'Transfer', 'EXP-021', 'paid', '2026-04-09 14:00:00'),
(22, 2, 'Backup power supply', 450.00, '2026-04-19', 'Card', 'EXP-022', 'paid', '2026-04-19 11:00:00'),
(23, 3, 'Insurance premium', 800.00, '2026-04-11', 'Transfer', 'EXP-023', 'paid', '2026-04-11 09:30:00'),
(24, 5, 'Social media management', 400.00, '2026-04-27', 'Card', 'EXP-024', 'paid', '2026-04-27 16:30:00'),
(25, 6, 'Furniture repair', 150.00, '2026-04-13', 'Cash', 'EXP-025', 'paid', '2026-04-13 12:00:00'),
(26, 1, 'USB drives and cables', 95.00, '2026-04-07', 'Card', 'EXP-026', 'paid', '2026-04-07 10:30:00'),
(27, 2, 'Mobile phone bill', 120.00, '2026-04-23', 'Transfer', 'EXP-027', 'paid', '2026-04-23 08:30:00'),
(28, 3, 'Property tax payment', 1500.00, '2026-04-15', 'Transfer', 'EXP-028', 'paid', '2026-04-15 11:00:00'),
(29, 5, 'Email marketing service', 180.00, '2026-04-29', 'Card', 'EXP-029', 'paid', '2026-04-29 14:30:00'),
(30, 6, 'Electrical wiring upgrade', 380.00, '2026-04-17', 'Cash', 'EXP-030', 'paid', '2026-04-17 15:00:00'),
(31, 1, 'Desk organizers and accessories', 75.00, '2026-04-03', 'Card', 'EXP-031', 'paid', '2026-04-03 12:30:00'),
(32, 2, 'Security system monitoring', 200.00, '2026-04-24', 'Transfer', 'EXP-032', 'paid', '2026-04-24 10:00:00'),
(33, 3, 'Parking space rental', 300.00, '2026-04-04', 'Transfer', 'EXP-033', 'paid', '2026-04-04 11:30:00'),
(34, 5, 'Video production for courses', 600.00, '2026-04-21', 'Card', 'EXP-034', 'paid', '2026-04-21 16:00:00'),
(35, 6, 'Paint and decoration', 420.00, '2026-04-05', 'Cash', 'EXP-035', 'paid', '2026-04-05 09:30:00'),
(36, 1, 'External hard drives', 240.00, '2026-04-28', 'Card', 'EXP-036', 'paid', '2026-04-28 13:30:00'),
(37, 2, 'Cloud storage subscription', 90.00, '2026-04-10', 'Transfer', 'EXP-037', 'paid', '2026-04-10 08:00:00'),
(38, 3, 'Cleaning service', 350.00, '2026-04-24', 'Cash', 'EXP-038', 'paid', '2026-04-24 14:00:00'),
(39, 5, 'SEO optimization service', 280.00, '2026-04-12', 'Card', 'EXP-039', 'paid', '2026-04-12 15:30:00'),
(40, 6, 'HVAC filter replacement', 65.00, '2026-04-30', 'Cash', 'EXP-040', 'paid', '2026-04-30 11:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `enrollmentId` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paymentDate` date NOT NULL,
  `method` varchar(50) NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Paid'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `payments`
--

INSERT INTO `payments` (`id`, `enrollmentId`, `amount`, `paymentDate`, `method`, `reference`, `status`) VALUES
(1, 1, 20.00, '2026-04-24', 'Cash', 'PAY-001', 'Paid'),
(2, 1, 15.00, '2026-04-25', 'Transfer', 'PAY-002', 'Paid'),
(3, 2, 45.00, '2026-04-20', 'Card', 'PAY-003', 'Paid'),
(4, 3, 20.00, '2026-04-21', 'Cash', 'PAY-004', 'Paid'),
(5, 4, 35.00, '2026-04-22', 'Transfer', 'PAY-005', 'Paid'),
(6, 5, 25.00, '2026-04-23', 'Check', 'PAY-006', 'Paid'),
(7, 2, 10.00, '2026-04-24', 'Cash', 'PAY-007', 'Paid'),
(8, 3, 15.00, '2026-04-25', 'Card', 'PAY-008', 'Paid'),
(9, 6, 10.00, '2026-04-19', 'Cash', 'PAY-009', 'Paid'),
(10, 7, 30.00, '2026-04-18', 'Transfer', 'PAY-010', 'Paid'),
(11, 8, 40.00, '2026-04-17', 'Card', 'PAY-011', 'Paid'),
(12, 9, 35.00, '2026-04-16', 'Cash', 'PAY-012', 'Paid'),
(13, 10, 45.00, '2026-04-15', 'Transfer', 'PAY-013', 'Paid'),
(14, 11, 38.00, '2026-04-14', 'Check', 'PAY-014', 'Paid'),
(15, 12, 32.00, '2026-04-13', 'Cash', 'PAY-015', 'Paid'),
(16, 13, 33.00, '2026-04-12', 'Card', 'PAY-016', 'Paid'),
(17, 14, 25.00, '2026-04-11', 'Transfer', 'PAY-017', 'Paid'),
(18, 15, 15.00, '2026-04-10', 'Cash', 'PAY-018', 'Paid'),
(19, 16, 30.00, '2026-04-09', 'Card', 'PAY-019', 'Paid'),
(20, 17, 42.00, '2026-04-08', 'Transfer', 'PAY-020', 'Paid'),
(21, 18, 50.00, '2026-04-07', 'Check', 'PAY-021', 'Paid'),
(22, 19, 40.00, '2026-04-06', 'Cash', 'PAY-022', 'Paid'),
(23, 20, 48.00, '2026-04-05', 'Card', 'PAY-023', 'Paid'),
(24, 21, 60.00, '2026-04-04', 'Transfer', 'PAY-024', 'Paid'),
(25, 22, 35.00, '2026-04-03', 'Cash', 'PAY-025', 'Paid'),
(26, 23, 28.00, '2026-04-02', 'Card', 'PAY-026', 'Paid'),
(27, 24, 32.00, '2026-04-01', 'Transfer', 'PAY-027', 'Paid'),
(28, 25, 28.00, '2026-03-31', 'Check', 'PAY-028', 'Paid'),
(29, 26, 38.00, '2026-03-30', 'Cash', 'PAY-029', 'Paid'),
(30, 27, 35.00, '2026-03-29', 'Card', 'PAY-030', 'Paid'),
(31, 28, 40.00, '2026-03-28', 'Transfer', 'PAY-031', 'Paid'),
(32, 29, 42.00, '2026-03-27', 'Cash', 'PAY-032', 'Paid'),
(33, 30, 25.00, '2026-03-26', 'Card', 'PAY-033', 'Paid'),
(34, 31, 30.00, '2026-03-25', 'Transfer', 'PAY-034', 'Paid'),
(35, 32, 28.00, '2026-03-24', 'Check', 'PAY-035', 'Paid'),
(36, 33, 25.00, '2026-03-23', 'Cash', 'PAY-036', 'Paid'),
(37, 34, 20.00, '2026-03-22', 'Card', 'PAY-037', 'Paid'),
(38, 35, 18.00, '2026-03-21', 'Transfer', 'PAY-038', 'Paid'),
(39, 36, 15.00, '2026-03-20', 'Cash', 'PAY-039', 'Paid'),
(40, 37, 20.00, '2026-03-19', 'Card', 'PAY-040', 'Paid'),
(41, 38, 35.00, '2026-03-18', 'Transfer', 'PAY-041', 'Paid'),
(42, 39, 25.00, '2026-03-17', 'Check', 'PAY-042', 'Paid'),
(43, 40, 30.00, '2026-03-16', 'Cash', 'PAY-043', 'Paid'),
(44, 41, 38.00, '2026-03-15', 'Card', 'PAY-044', 'Paid'),
(45, 42, 28.00, '2026-03-14', 'Transfer', 'PAY-045', 'Paid'),
(46, 43, 32.00, '2026-03-13', 'Cash', 'PAY-046', 'Paid'),
(47, 44, 30.00, '2026-03-12', 'Card', 'PAY-047', 'Paid'),
(48, 45, 40.00, '2026-03-11', 'Transfer', 'PAY-048', 'Paid'),
(49, 10, 20.00, '2026-03-10', 'Check', 'PAY-049', 'Paid'),
(50, 20, 25.00, '2026-03-09', 'Cash', 'PAY-050', 'Paid');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `idNumber` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `students`
--

INSERT INTO `students` (`id`, `idNumber`, `name`, `lastName`, `email`, `phone`, `status`) VALUES
(1, '27436372', 'Kevin Adrian', 'Torrealba Trejo', 'nostioficial@gmail.com', '+58 412-7241682', 'Active'),
(2, '25123456', 'Maria Elena', 'Gomez Rivas', 'maria.gomez@gmail.com', '+58 424-1112233', 'Active'),
(3, '26888777', 'Juan Carlos', 'Lopez', 'juan.lopez@outlook.com', '+58 414-9998877', 'Active'),
(4, '28111222', 'Ana Victoria', 'Martinez', 'ana.v@gmail.com', '+58 416-5554433', 'Active'),
(5, '24555666', 'Pedro Jose', 'Sosa', 'pedro.sosa@empresa.com', '+58 412-8880000', 'Active'),
(6, '26345678', 'Luis Alberto', 'Rodriguez Perez', 'luis.rodriguez@gmail.com', '+58 412-3456789', 'Active'),
(7, '27456789', 'Carmen Rosa', 'Gonzalez Silva', 'carmen.gonzalez@hotmail.com', '+58 424-5678901', 'Active'),
(8, '28567890', 'Andres Felipe', 'Martinez Lopez', 'andres.martinez@gmail.com', '+58 414-6789012', 'Active'),
(9, '29678901', 'Beatriz Elena', 'Hernandez Ruiz', 'beatriz.hernandez@yahoo.com', '+58 416-7890123', 'Active'),
(10, '20789012', 'Diego Armando', 'Diaz Morales', 'diego.diaz@gmail.com', '+58 412-8901234', 'Active'),
(11, '21890123', 'Sofia Alejandra', 'Sanchez Castro', 'sofia.sanchez@outlook.com', '+58 424-9012345', 'Active'),
(12, '22901234', 'Gabriel Antonio', 'Ramirez Flores', 'gabriel.ramirez@gmail.com', '+58 414-0123456', 'Active'),
(13, '23012345', 'Lucia Fernanda', 'Torres Mendoza', 'lucia.torres@hotmail.com', '+58 416-1234567', 'Active'),
(14, '24123456', 'Ricardo Jose', 'Vargas Jimenez', 'ricardo.vargas@gmail.com', '+58 412-2345678', 'Active'),
(15, '25234567', 'Patricia Isabel', 'Castro Ortega', 'patricia.castro@yahoo.com', '+58 424-3456789', 'Active'),
(16, '26345679', 'Roberto Carlos', 'Delgado Salazar', 'roberto.delgado@gmail.com', '+58 414-4567890', 'Active'),
(17, '27456780', 'Paola Andrea', 'Acosta Paredes', 'paola.acosta@outlook.com', '+58 416-5678901', 'Active'),
(18, '28567891', 'Enrique Martin', 'Vargas Rios', 'enrique.vargas@gmail.com', '+58 412-6789012', 'Active'),
(19, '29678902', 'Rosa Maria', 'Blanco Guzman', 'rosa.blanco@hotmail.com', '+58 424-7890123', 'Active'),
(20, '20789013', 'Alejandro David', 'Navarro Soto', 'alejandro.navarro@gmail.com', '+58 414-8901234', 'Active'),
(21, '21890124', 'Valentina Sofia', 'Mendoza Rios', 'valentina.mendoza@yahoo.com', '+58 416-9012345', 'Active'),
(22, '22901235', 'Sebastian Andres', 'Guzman Salazar', 'sebastian.guzman@gmail.com', '+58 412-0123456', 'Active'),
(23, '23012346', 'Monica Patricia', 'Rios Blanco', 'monica.rios@outlook.com', '+58 424-1234567', 'Active'),
(24, '24123457', 'Javier Enrique', 'Salazar Navarro', 'javier.salazar@gmail.com', '+58 414-2345678', 'Active'),
(25, '25234568', 'Daniela Alejandra', 'Ortega Mendoza', 'daniela.ortega@hotmail.com', '+58 416-3456789', 'Active'),
(26, '26345680', 'Fernando Jose', 'Paredes Acosta', 'fernando.paredes@gmail.com', '+58 412-4567890', 'Active'),
(27, '27456781', 'Isabel Cristina', 'Jimenez Castro', 'isabel.jimenez@yahoo.com', '+58 424-5678901', 'Active'),
(28, '28567892', 'Miguel Angel', 'Morales Diaz', 'miguel.morales@gmail.com', '+58 414-6789012', 'Active'),
(29, '29678903', 'Laura Fernanda', 'Ruiz Hernandez', 'laura.ruiz@outlook.com', '+58 416-7890123', 'Active'),
(30, '20789014', 'Hugo Armando', 'Lopez Martinez', 'hugo.lopez@gmail.com', '+58 412-8901234', 'Active'),
(31, '21890125', 'Carmen Lucia', 'Silva Gonzalez', 'carmen.silva@hotmail.com', '+58 424-9012345', 'Active'),
(32, '22901236', 'Pablo Emilio', 'Perez Rodriguez', 'pablo.perez@gmail.com', '+58 414-0123456', 'Active'),
(33, '23012347', 'Elena Maria', 'Fernandez Sanchez', 'elena.fernandez@yahoo.com', '+58 416-1234567', 'Active'),
(34, '24123458', 'Antonio Jose', 'Castro Hernandez', 'antonio.castro@gmail.com', '+58 412-2345678', 'Active'),
(35, '25234569', 'Diana Carolina', 'Flores Ramirez', 'diana.flores@outlook.com', '+58 424-3456789', 'Active'),
(36, '26345681', 'Francisco Javier', 'Soto Torres', 'francisco.soto@gmail.com', '+58 414-4567890', 'Active'),
(37, '27456782', 'Mariana Sofia', 'Mendoza Vargas', 'mariana.mendoza@hotmail.com', '+58 416-5678901', 'Active'),
(38, '28567893', 'Julio Cesar', 'Acosta Jimenez', 'julio.acosta@gmail.com', '+58 412-6789012', 'Active'),
(39, '29678904', 'Angela Maria', 'Salazar Castro', 'angela.salazar@yahoo.com', '+58 424-7890123', 'Active'),
(40, '20789015', 'Rafael Alberto', 'Navarro Mendoza', 'rafael.navarro@gmail.com', '+58 414-8901234', 'Active');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `teachers`
--

CREATE TABLE `teachers` (
  `id` int(11) NOT NULL,
  `idNumber` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `specialty` varchar(150) DEFAULT NULL,
  `hourlyRate` decimal(10,2) NOT NULL,
  `weeklyHours` int(11) NOT NULL DEFAULT 0,
  `status` varchar(20) NOT NULL DEFAULT 'Active',
  `hireDate` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `teachers`
--

INSERT INTO `teachers` (`id`, `idNumber`, `name`, `lastName`, `email`, `phone`, `specialty`, `hourlyRate`, `weeklyHours`, `status`, `hireDate`) VALUES
(1, '23589123', 'Carlos Alberto', 'Rodriguez Paez', 'carlos.rodriguez@pluscode.edu', '+58 412-1234567', 'Fullstack Developer', 25.00, 20, 'Active', '2025-01-15'),
(2, '18654321', 'Maria Elena', 'Gonzalez Silva', 'maria.gonzalez@pluscode.edu', '+58 424-9876543', 'Data Science Expert', 30.00, 25, 'Active', '2025-02-01'),
(3, '21234567', 'Juan Pablo', 'Martinez Lopez', 'juan.martinez@pluscode.edu', '+58 414-5558888', 'UI/UX Design Specialist', 22.00, 15, 'Active', '2025-03-10'),
(4, '19876543', 'Ana Lucia', 'Fernandez Ruiz', 'ana.fernandez@pluscode.edu', '+58 416-7773333', 'Cloud Computing Architect', 35.00, 30, 'Active', '2024-06-01'),
(5, '22345678', 'Pedro Antonio', 'Diaz Morales', 'pedro.diaz@pluscode.edu', '+58 412-9990000', 'Cybersecurity Specialist', 28.00, 18, 'Active', '2025-01-20'),
(6, '23456789', 'Laura Cristina', 'Sanchez Vega', 'laura.sanchez@pluscode.edu', '+58 424-1112233', 'React Native Developer', 26.00, 22, 'Active', '2025-01-10'),
(7, '24567890', 'Roberto Andres', 'Vega Mendoza', 'roberto.vega@pluscode.edu', '+58 414-2223344', 'DevOps Engineer', 32.00, 28, 'Active', '2024-12-01'),
(8, '25678901', 'Carmen Beatriz', 'Mendoza Rios', 'carmen.mendoza@pluscode.edu', '+58 416-3334455', 'Mobile App Developer', 24.00, 20, 'Active', '2025-02-15'),
(9, '26789012', 'Fernando Jose', 'Rios Paredes', 'fernando.rios@pluscode.edu', '+58 412-4445566', 'Backend Specialist', 29.00, 25, 'Active', '2024-11-20'),
(10, '27890123', 'Patricia Elena', 'Paredes Salazar', 'patricia.paredes@pluscode.edu', '+58 424-5556677', 'Frontend Architect', 27.00, 24, 'Active', '2025-03-01'),
(11, '28901234', 'Diego Alejandro', 'Salazar Jimenez', 'diego.salazar@pluscode.edu', '+58 414-6667788', 'AI Engineer', 40.00, 32, 'Active', '2024-09-15'),
(12, '29012345', 'Sofia Isabel', 'Jimenez Castro', 'sofia.jimenez@pluscode.edu', '+58 416-7778899', 'Blockchain Developer', 38.00, 20, 'Active', '2025-01-25'),
(13, '20123456', 'Gabriel Antonio', 'Castro Ortega', 'gabriel.castro@pluscode.edu', '+58 412-8889900', 'Database Administrator', 25.00, 18, 'Active', '2024-10-10'),
(14, '21234567', 'Valentina Rosa', 'Ortega Delgado', 'valentina.ortega@pluscode.edu', '+58 424-9990011', 'QA Automation Engineer', 23.00, 20, 'Active', '2025-02-20'),
(15, '22345678', 'Ricardo Martin', 'Delgado Navarro', 'ricardo.delgado@pluscode.edu', '+58 414-0001122', 'System Administrator', 26.00, 22, 'Active', '2024-08-15'),
(16, '23456780', 'Daniela Fernanda', 'Navarro Acosta', 'daniela.navarro@pluscode.edu', '+58 416-1112233', 'Scrum Master', 24.00, 15, 'Active', '2025-03-05'),
(17, '24567891', 'Javier Enrique', 'Acosta Vargas', 'javier.acosta@pluscode.edu', '+58 412-2223344', 'Python Developer', 28.00, 26, 'Active', '2024-12-20'),
(18, '25678902', 'Monica Alejandra', 'Vargas Flores', 'monica.vargas@pluscode.edu', '+58 424-3334455', 'JavaScript Expert', 25.00, 24, 'Active', '2025-01-30'),
(19, '26789013', 'Sebastian David', 'Flores Torres', 'sebastian.flores@pluscode.edu', '+58 414-4445566', 'PHP Laravel Developer', 22.00, 20, 'Active', '2024-11-05'),
(20, '27890124', 'Elena Cristina', 'Torres Soto', 'elena.torres@pluscode.edu', '+58 416-5556677', 'Data Analyst', 27.00, 22, 'Active', '2025-02-10'),
(21, '28901235', 'Andres Felipe', 'Soto Mendoza', 'andres.soto@pluscode.edu', '+58 412-6667788', 'Network Security', 31.00, 28, 'Active', '2024-10-25'),
(22, '29012346', 'Lucia Fernanda', 'Mendoza Rios', 'lucia.mendoza@pluscode.edu', '+58 424-7778899', 'Technical Writer', 20.00, 12, 'Active', '2025-03-15'),
(23, '20123457', 'Pablo Emilio', 'Rios Salazar', 'pablo.rios@pluscode.edu', '+58 414-8889900', 'Flutter Developer', 29.00, 24, 'Active', '2024-09-20'),
(24, '21234568', 'Carmen Lucia', 'Salazar Jimenez', 'carmen.salazar@pluscode.edu', '+58 416-9990011', 'Vue.js Specialist', 25.00, 20, 'Active', '2025-01-08'),
(25, '22345679', 'Julio Cesar', 'Jimenez Castro', 'julio.jimenez@pluscode.edu', '+58 412-0001122', 'Angular Developer', 27.00, 22, 'Active', '2024-12-05'),
(26, '23456781', 'Angela Maria', 'Castro Ortega', 'angela.castro@pluscode.edu', '+58 424-1112233', 'Machine Learning Engineer', 35.00, 30, 'Active', '2025-02-25'),
(27, '24567892', 'Rafael Antonio', 'Ortega Delgado', 'rafael.ortega@pluscode.edu', '+58 414-2223344', 'Go Developer', 33.00, 26, 'Active', '2024-11-15'),
(28, '25678903', 'Diana Carolina', 'Delgado Navarro', 'diana.delgado@pluscode.edu', '+58 416-3334455', 'Docker Specialist', 26.00, 20, 'Active', '2025-01-12'),
(29, '26789014', 'Francisco Javier', 'Navarro Acosta', 'francisco.navarro@pluscode.edu', '+58 412-4445566', 'AWS Solutions Architect', 36.00, 28, 'Active', '2024-10-01'),
(30, '27890125', 'Mariana Sofia', 'Acosta Vargas', 'mariana.acosta@pluscode.edu', '+58 424-5556677', 'Azure Developer', 34.00, 25, 'Active', '2025-02-01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `teacher_payments`
--

CREATE TABLE `teacher_payments` (
  `id` int(11) NOT NULL,
  `teacherId` int(11) NOT NULL,
  `period` varchar(10) NOT NULL,
  `hoursWorked` int(11) NOT NULL,
  `hourlyRate` decimal(10,2) NOT NULL,
  `baseSalary` decimal(10,2) NOT NULL,
  `bonuses` decimal(10,2) NOT NULL DEFAULT 0.00,
  `deductions` decimal(10,2) NOT NULL DEFAULT 0.00,
  `totalSalary` decimal(10,2) NOT NULL,
  `paymentDate` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Paid',
  `reference` varchar(100) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `teacher_payments`
--

INSERT INTO `teacher_payments` (`id`, `teacherId`, `period`, `hoursWorked`, `hourlyRate`, `baseSalary`, `bonuses`, `deductions`, `totalSalary`, `paymentDate`, `status`, `reference`, `createdAt`) VALUES
(1, 1, '2025-04', 80, 25.00, 2000.00, 100.00, 50.00, 2050.00, '2025-04-30', 'Paid', 'NOM-001', '2025-04-30 10:00:00'),
(2, 2, '2025-04', 100, 30.00, 3000.00, 150.00, 75.00, 3075.00, '2025-04-30', 'Paid', 'NOM-002', '2025-04-30 10:00:00'),
(3, 3, '2025-04', 60, 22.00, 1320.00, 80.00, 30.00, 1370.00, '2025-04-30', 'Paid', 'NOM-003', '2025-04-30 10:00:00'),
(4, 1, '2025-03', 75, 25.00, 1875.00, 120.00, 45.00, 1950.00, '2025-03-31', 'Paid', 'NOM-004', '2025-03-31 10:00:00'),
(5, 4, '2025-04', 120, 35.00, 4200.00, 200.00, 100.00, 4300.00, '2025-04-30', 'Paid', 'NOM-005', '2025-04-30 10:00:00'),
(6, 5, '2025-04', 72, 28.00, 2016.00, 90.00, 40.00, 2066.00, '2025-04-30', 'Paid', 'NOM-006', '2025-04-30 10:00:00'),
(7, 6, '2025-04', 88, 26.00, 2288.00, 110.00, 55.00, 2343.00, '2025-04-30', 'Paid', 'NOM-007', '2025-04-30 10:00:00'),
(8, 7, '2025-04', 112, 32.00, 3584.00, 180.00, 90.00, 3674.00, '2025-04-30', 'Paid', 'NOM-008', '2025-04-30 10:00:00'),
(9, 8, '2025-04', 80, 24.00, 1920.00, 95.00, 45.00, 1970.00, '2025-04-30', 'Paid', 'NOM-009', '2025-04-30 10:00:00'),
(10, 9, '2025-04', 100, 29.00, 2900.00, 145.00, 70.00, 2975.00, '2025-04-30', 'Paid', 'NOM-010', '2025-04-30 10:00:00'),
(11, 10, '2025-04', 96, 27.00, 2592.00, 130.00, 65.00, 2657.00, '2025-04-30', 'Paid', 'NOM-011', '2025-04-30 10:00:00'),
(12, 11, '2025-04', 128, 40.00, 5120.00, 250.00, 125.00, 5245.00, '2025-04-30', 'Paid', 'NOM-012', '2025-04-30 10:00:00'),
(13, 12, '2025-04', 80, 38.00, 3040.00, 150.00, 75.00, 3115.00, '2025-04-30', 'Paid', 'NOM-013', '2025-04-30 10:00:00'),
(14, 13, '2025-04', 72, 25.00, 1800.00, 90.00, 40.00, 1850.00, '2025-04-30', 'Paid', 'NOM-014', '2025-04-30 10:00:00'),
(15, 14, '2025-04', 80, 23.00, 1840.00, 92.00, 42.00, 1890.00, '2025-04-30', 'Paid', 'NOM-015', '2025-04-30 10:00:00'),
(16, 15, '2025-04', 88, 26.00, 2288.00, 115.00, 55.00, 2348.00, '2025-04-30', 'Paid', 'NOM-016', '2025-04-30 10:00:00'),
(17, 16, '2025-04', 60, 24.00, 1440.00, 72.00, 35.00, 1477.00, '2025-04-30', 'Paid', 'NOM-017', '2025-04-30 10:00:00'),
(18, 17, '2025-04', 104, 28.00, 2912.00, 146.00, 70.00, 2988.00, '2025-04-30', 'Paid', 'NOM-018', '2025-04-30 10:00:00'),
(19, 18, '2025-04', 96, 25.00, 2400.00, 120.00, 60.00, 2460.00, '2025-04-30', 'Paid', 'NOM-019', '2025-04-30 10:00:00'),
(20, 19, '2025-04', 80, 22.00, 1760.00, 88.00, 42.00, 1806.00, '2025-04-30', 'Paid', 'NOM-020', '2025-04-30 10:00:00'),
(21, 20, '2025-04', 88, 27.00, 2376.00, 119.00, 58.00, 2437.00, '2025-04-30', 'Paid', 'NOM-021', '2025-04-30 10:00:00'),
(22, 21, '2025-04', 112, 31.00, 3472.00, 174.00, 85.00, 3561.00, '2025-04-30', 'Paid', 'NOM-022', '2025-04-30 10:00:00'),
(23, 22, '2025-04', 48, 20.00, 960.00, 48.00, 24.00, 984.00, '2025-04-30', 'Paid', 'NOM-023', '2025-04-30 10:00:00'),
(24, 23, '2025-04', 96, 29.00, 2784.00, 139.00, 68.00, 2855.00, '2025-04-30', 'Paid', 'NOM-024', '2025-04-30 10:00:00'),
(25, 24, '2025-04', 80, 25.00, 2000.00, 100.00, 50.00, 2050.00, '2025-04-30', 'Paid', 'NOM-025', '2025-04-30 10:00:00'),
(26, 25, '2025-04', 88, 27.00, 2376.00, 119.00, 58.00, 2437.00, '2025-04-30', 'Paid', 'NOM-026', '2025-04-30 10:00:00'),
(27, 26, '2025-04', 120, 35.00, 4200.00, 210.00, 105.00, 4305.00, '2025-04-30', 'Paid', 'NOM-027', '2025-04-30 10:00:00'),
(28, 27, '2025-04', 104, 33.00, 3432.00, 172.00, 85.00, 3519.00, '2025-04-30', 'Paid', 'NOM-028', '2025-04-30 10:00:00'),
(29, 28, '2025-04', 80, 26.00, 2080.00, 104.00, 52.00, 2132.00, '2025-04-30', 'Paid', 'NOM-029', '2025-04-30 10:00:00'),
(30, 29, '2025-04', 112, 36.00, 4032.00, 202.00, 100.00, 4134.00, '2025-04-30', 'Paid', 'NOM-030', '2025-04-30 10:00:00'),
(31, 30, '2025-04', 100, 34.00, 3400.00, 170.00, 85.00, 3485.00, '2025-04-30', 'Paid', 'NOM-031', '2025-04-30 10:00:00'),
(32, 1, '2025-03', 85, 25.00, 2125.00, 106.00, 53.00, 2178.00, '2025-03-31', 'Paid', 'NOM-032', '2025-03-31 10:00:00'),
(33, 2, '2025-03', 95, 30.00, 2850.00, 143.00, 71.00, 2922.00, '2025-03-31', 'Paid', 'NOM-033', '2025-03-31 10:00:00'),
(34, 3, '2025-03', 65, 22.00, 1430.00, 72.00, 35.00, 1467.00, '2025-03-31', 'Paid', 'NOM-034', '2025-03-31 10:00:00'),
(35, 4, '2025-03', 115, 35.00, 4025.00, 201.00, 100.00, 4126.00, '2025-03-31', 'Paid', 'NOM-035', '2025-03-31 10:00:00'),
(36, 5, '2025-03', 70, 28.00, 1960.00, 98.00, 49.00, 2009.00, '2025-03-31', 'Paid', 'NOM-036', '2025-03-31 10:00:00'),
(37, 6, '2025-03', 82, 26.00, 2132.00, 107.00, 53.00, 2186.00, '2025-03-31', 'Paid', 'NOM-037', '2025-03-31 10:00:00'),
(38, 7, '2025-03', 108, 32.00, 3456.00, 173.00, 86.00, 3543.00, '2025-03-31', 'Paid', 'NOM-038', '2025-03-31 10:00:00'),
(39, 8, '2025-03', 78, 24.00, 1872.00, 94.00, 47.00, 1919.00, '2025-03-31', 'Paid', 'NOM-039', '2025-03-31 10:00:00'),
(40, 9, '2025-03', 98, 29.00, 2842.00, 142.00, 71.00, 2913.00, '2025-03-31', 'Paid', 'NOM-040', '2025-03-31 10:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` varchar(50) NOT NULL,
  `permissions` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `name`, `email`, `role`, `permissions`) VALUES
(1, 'admin', 'admin123', 'Administrador', 'admin@pluscode.edu', 'admin', '[\"students\", \"courses\", \"enrollments\", \"payments\", \"reports\", \"expenses\", \"teachers\", \"inventory\"]'),
(2, 'recepcion', 'rec123', 'María Recepción', 'maria.recepcion@pluscode.edu', 'receptionista', '[\"students\", \"courses\", \"enrollments\", \"payments\"]'),
(3, 'caja', 'caja123', 'Carlos Caja', 'carlos.caja@pluscode.edu', 'cajero', '[\"payments\", \"reports\"]'),
(4, 'control', 'ctrl123', 'Ana Control', 'ana.control@pluscode.edu', 'control_academico', '[\"students\", \"courses\", \"enrollments\", \"reports\"]');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indices de la tabla `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `studentId` (`studentId`),
  ADD KEY `courseId` (`courseId`);

--
-- Indices de la tabla `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoryId` (`categoryId`);

--
-- Indices de la tabla `expense_categories`
--
ALTER TABLE `expense_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `enrollmentId` (`enrollmentId`);

--
-- Indices de la tabla `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idNumber` (`idNumber`);

--
-- Indices de la tabla `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idNumber` (`idNumber`);

--
-- Indices de la tabla `teacher_payments`
--
ALTER TABLE `teacher_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacherId` (`teacherId`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT de la tabla `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT de la tabla `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `expense_categories`
--
ALTER TABLE `expense_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de la tabla `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `teacher_payments`
--
ALTER TABLE `teacher_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_enrollments_student` FOREIGN KEY (`studentId`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `fk_expenses_category` FOREIGN KEY (`categoryId`) REFERENCES `expense_categories` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_enrollment` FOREIGN KEY (`enrollmentId`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `teacher_payments`
--
ALTER TABLE `teacher_payments`
  ADD CONSTRAINT `fk_teacher_payments_teacher` FOREIGN KEY (`teacherId`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;
COMMIT;

-- --------------------------------------------------------
-- GENERADOR DE DATOS MASIVOS (Opcional: Ejecutar para miles de registros)
-- --------------------------------------------------------

DELIMITER //

CREATE PROCEDURE GenerateMassiveData(IN num_records INT)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE student_id INT;
    DECLARE course_id INT;
    DECLARE enroll_id INT;
    
    WHILE i < num_records DO
        -- Insertar Estudiante
        INSERT INTO `students` (`idNumber`, `name`, `lastName`, `email`, `phone`, `status`) 
        VALUES (
            CONCAT('ID-', 1000 + i), 
            CONCAT('StudentName_', i), 
            CONCAT('LastName_', i), 
            CONCAT('student_', i, '@example.com'), 
            '+584001112233', 
            'Active'
        );
        SET student_id = LAST_INSERT_ID();
        
        -- Seleccionar un curso aleatorio (1-5)
        SET course_id = FLOOR(1 + (RAND() * 5));
        
        -- Insertar Matrícula
        INSERT INTO `enrollments` (`studentId`, `courseId`, `enrollmentDate`, `status`) 
        VALUES (student_id, course_id, DATE_SUB('2026-04-24', INTERVAL FLOOR(RAND() * 30) DAY), 'Active');
        SET enroll_id = LAST_INSERT_ID();
        
        -- Insertar Pago para esa matrícula
        INSERT INTO `payments` (`enrollmentId`, `amount`, `paymentDate`, `method`, `reference`, `status`) 
        VALUES (enroll_id, 10.00 + (RAND() * 50), CURDATE(), 'Transfer', CONCAT('REF-AUTO-', i), 'Paid');
        
        SET i = i + 1;
    END WHILE;
END //

DELIMITER ;

-- Para generar 1000 registros de golpe, descomenta la siguiente línea y ejecútala en tu consola SQL:
CALL GenerateMassiveData(1000);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

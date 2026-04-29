-- Script de población masiva para PlusCode Academy
-- Genera un mínimo de 100 registros por tabla con datos realistas

USE `pluscode_academy`;

DELIMITER //

DROP PROCEDURE IF EXISTS PopulateMassiveData //

CREATE PROCEDURE PopulateMassiveData()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE rand_val INT;
    DECLARE rand_date DATE;
    DECLARE student_id INT;
    DECLARE course_id INT;
    DECLARE teacher_id INT;
    DECLARE category_id INT;
    DECLARE enroll_id INT;
    DECLARE v_name VARCHAR(100);
    DECLARE v_lname VARCHAR(100);
    DECLARE v_email VARCHAR(100);
    DECLARE v_phone VARCHAR(50);

    -- Sugerencia: Limpiar tablas antes de poblar para permitir re-ejecución limpia
    SET FOREIGN_KEY_CHECKS = 0;
    TRUNCATE TABLE `teacher_payments`;
    TRUNCATE TABLE `payments`;
    TRUNCATE TABLE `enrollments`;
    TRUNCATE TABLE `expenses`;
    TRUNCATE TABLE `expense_categories`;
    TRUNCATE TABLE `teachers`;
    TRUNCATE TABLE `students`;
    TRUNCATE TABLE `courses`;
    SET FOREIGN_KEY_CHECKS = 1;

    -- 1. POBLAR CATEGORÍAS DE GASTOS
    WHILE i <= 110 DO
        INSERT INTO `expense_categories` (`name`, `description`)
        VALUES (
            CONCAT(ELT(FLOOR(1 + RAND() * 5), 'Servicios', 'Mantenimiento', 'Suministros', 'Marketing', 'Infraestructura'), ' Tipo ', i),
            CONCAT('Descripción detallada para la categoría de gasto número ', i)
        );
        SET i = i + 1;
    END WHILE;

    -- 2. POBLAR CURSOS
    SET i = 1;
    WHILE i <= 105 DO
        INSERT INTO `courses` (`code`, `name`, `credits`, `fee`, `status`, `maxCapacity`, `currentEnrollment`)
        VALUES (
            CONCAT('C-', 1000 + i),
            CONCAT(ELT(FLOOR(1 + RAND() * 8), 'Programación', 'Diseño', 'Marketing', 'Base de Datos', 'IA', 'Redes', 'Blockchain', 'Ciberseguridad'), ' ', ELT(FLOOR(1 + RAND() * 5), 'Avanzado', 'Básico', 'Intermedio', 'Profesional', 'Máster'), ' Vol. ', i),
            FLOOR(1 + RAND() * 5),
            10 + (RAND() * 100),
            IF(RAND() > 0.1, 'Active', 'Inactive'),
            FLOOR(20 + RAND() * 30),
            0
        );
        SET i = i + 1;
    END WHILE;

    -- 3. POBLAR DOCENTES
    SET i = 1;
    WHILE i <= 110 DO
        SET v_name = ELT(FLOOR(1 + RAND() * 20), 'Carlos', 'María', 'José', 'Ana', 'Luis', 'Elena', 'Pedro', 'Sofía', 'Miguel', 'Laura', 'Andrés', 'Beatriz', 'Diego', 'Carmen', 'Fernando', 'Gabriela', 'Hugo', 'Isabel', 'Javier', 'Lucía');
        SET v_lname = ELT(FLOOR(1 + RAND() * 20), 'Pérez', 'García', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'González', 'Gómez', 'Fernández', 'Díaz', 'Torres', 'Ruiz', 'Vásquez', 'Castro', 'Morales', 'Jiménez', 'Ortega', 'Delgado', 'Ramírez', 'Flores');
        SET v_email = LOWER(CONCAT(v_name, '.', v_lname, i, '@pluscode.edu'));
        SET v_phone = CONCAT('+584', ELT(FLOOR(1 + RAND() * 3), '12', '24', '14'), FLOOR(1000000 + RAND() * 8999999));

        INSERT INTO `teachers` (`idNumber`, `name`, `lastName`, `email`, `phone`, `specialty`, `hourlyRate`, `weeklyHours`, `status`, `hireDate`)
        VALUES (
            CONCAT('V-', 10000000 + (i * 7)),
            v_name,
            v_lname,
            v_email,
            v_phone,
            CONCAT(ELT(FLOOR(1 + RAND() * 5), 'Fullstack Developer', 'Data Science', 'UI/UX Design', 'Cloud Computing', 'Cybersecurity'), ' Expert'),
            15 + (RAND() * 25),
            FLOOR(10 + RAND() * 30),
            'Active',
            DATE_SUB(CURDATE(), INTERVAL FLOOR(RAND() * 730) DAY)
        );
        SET i = i + 1;
    END WHILE;

    -- 4. POBLAR USUARIOS
    SET i = 1;
    WHILE i <= 100 DO
        INSERT INTO `users` (`username`, `password`, `name`, `email`, `role`, `permissions`)
        VALUES (
            CONCAT('user', i),
            'pass123',
            CONCAT('Staff Member ', i),
            CONCAT('staff', i, '@pluscode.edu'),
            ELT(FLOOR(1 + RAND() * 3), 'receptionista', 'cajero', 'control_academico'),
            IF(i % 2 = 0, '["students", "enrollments"]', '["payments", "reports"]')
        );
        SET i = i + 1;
    END WHILE;

    -- 5. POBLAR ESTUDIANTES
    SET i = 1;
    WHILE i <= 120 DO
        SET v_name = ELT(FLOOR(1 + RAND() * 20), 'Andrés', 'Beatriz', 'Diego', 'Carmen', 'Fernando', 'Gabriela', 'Hugo', 'Isabel', 'Javier', 'Lucía', 'Alejandro', 'Valentina', 'Ricardo', 'Monica', 'Sebastian', 'Patricia', 'Roberto', 'Paola', 'Enrique', 'Rosa');
        SET v_lname = ELT(FLOOR(1 + RAND() * 20), 'Torres', 'Ruiz', 'Vásquez', 'Castro', 'Morales', 'Jiménez', 'Ortega', 'Delgado', 'Ramírez', 'Flores', 'Mendoza', 'Soto', 'Ríos', 'Blanco', 'Guzmán', 'Navarro', 'Salazar', 'Acosta', 'Paredes', 'Vargas');
        SET v_email = LOWER(CONCAT(v_name, '.', v_lname, i, '@gmail.com'));
        SET v_phone = CONCAT('+584', ELT(FLOOR(1 + RAND() * 3), '12', '24', '16'), FLOOR(1000000 + RAND() * 8999999));

        INSERT INTO `students` (`idNumber`, `name`, `lastName`, `email`, `phone`, `status`)
        VALUES (
            CONCAT('E-', 20000000 + (i * 13)),
            v_name,
            v_lname,
            v_email,
            v_phone,
            IF(RAND() > 0.1, 'Active', 'Inactive')
        );
        SET i = i + 1;
    END WHILE;

    -- 6. POBLAR MATRÍCULAS (ENROLLMENTS) Y PAGOS (Mínimo 150)
    SET i = 1;
    WHILE i <= 150 DO
        -- Seleccionar estudiante y curso al azar que existan
        SELECT id INTO student_id FROM students ORDER BY RAND() LIMIT 1;
        SELECT id INTO course_id FROM courses WHERE status = 'Active' ORDER BY RAND() LIMIT 1;
        SET rand_date = DATE_SUB(CURDATE(), INTERVAL FLOOR(RAND() * 180) DAY);
        
        INSERT INTO `enrollments` (`studentId`, `courseId`, `enrollmentDate`, `status`)
        VALUES (student_id, course_id, rand_date, 'Active');
        
        SET enroll_id = LAST_INSERT_ID();
        
        -- Crear pagos distribuidos en el tiempo
        INSERT INTO `payments` (`enrollmentId`, `amount`, `paymentDate`, `method`, `reference`, `status`)
        VALUES (
            enroll_id,
            20 + (RAND() * 30),
            DATE_ADD(rand_date, INTERVAL FLOOR(RAND() * 5) DAY),
            ELT(FLOOR(1 + RAND() * 4), 'Cash', 'Transfer', 'Card', 'Check'),
            CONCAT('REF-', 10000 + i),
            'Paid'
        );
        
        IF RAND() > 0.5 THEN
            INSERT INTO `payments` (`enrollmentId`, `amount`, `paymentDate`, `method`, `reference`, `status`)
            VALUES (
                enroll_id,
                15 + (RAND() * 20),
                DATE_ADD(rand_date, INTERVAL FLOOR(30 + RAND() * 15) DAY),
                ELT(FLOOR(1 + RAND() * 4), 'Cash', 'Transfer', 'Card', 'Check'),
                CONCAT('REF-', 20000 + i),
                'Paid'
            );
        END IF;

        SET i = i + 1;
    END WHILE;

    -- 7. POBLAR GASTOS (EXPENSES)
    SET i = 1;
    WHILE i <= 150 DO
        SELECT id INTO category_id FROM expense_categories ORDER BY RAND() LIMIT 1;
        
        INSERT INTO `expenses` (`categoryId`, `description`, `amount`, `date`, `paymentMethod`, `reference`, `status`)
        VALUES (
            category_id,
            CONCAT(ELT(FLOOR(1 + RAND() * 4), 'Factura de luz', 'Mantenimiento de equipos', 'Suministros de oficina', 'Publicidad mensual'), ' - Ref: ', i),
            50 + (RAND() * 450),
            DATE_SUB(CURDATE(), INTERVAL FLOOR(RAND() * 180) DAY),
            ELT(FLOOR(1 + RAND() * 3), 'Transfer', 'Cash', 'Card'),
            CONCAT('EXP-REF-', 5000 + i),
            'paid'
        );
        SET i = i + 1;
    END WHILE;

    -- 8. POBLAR PAGOS DE DOCENTES
    SET i = 1;
    WHILE i <= 150 DO
        SELECT id INTO teacher_id FROM teachers ORDER BY RAND() LIMIT 1;
        SET rand_val = FLOOR(20 + RAND() * 60); 
        SET rand_date = DATE_SUB(CURDATE(), INTERVAL FLOOR(RAND() * 120) DAY);
        
        INSERT INTO `teacher_payments` (
            `teacherId`, `period`, `hoursWorked`, `hourlyRate`, 
            `baseSalary`, `bonuses`, `deductions`, `totalSalary`, 
            `paymentDate`, `status`, `reference`
        )
        SELECT 
            id, 
            DATE_FORMAT(rand_date, '%Y-%m'),
            rand_val, 
            hourlyRate, 
            (hourlyRate * rand_val), 
            RAND() * 50, 
            RAND() * 20, 
            (hourlyRate * rand_val + (RAND() * 50) - (RAND() * 20)), 
            DATE_ADD(rand_date, INTERVAL 28 DAY), 
            'Paid', 
            CONCAT('NOM-', 7000 + i)
        FROM teachers WHERE id = teacher_id;
        
        SET i = i + 1;
    END WHILE;
    
    -- Actualizar conteo de inscritos en cursos
    UPDATE courses c SET currentEnrollment = (
        SELECT COUNT(*) FROM enrollments e WHERE e.courseId = c.id AND e.status = 'Active'
    );

END //

DELIMITER ;

-- Ejecutar el procedimiento
CALL PopulateMassiveData();

-- Limpieza (opcional: borrar el procedimiento después de usarlo)
-- DROP PROCEDURE PopulateMassiveData;

COMMIT;
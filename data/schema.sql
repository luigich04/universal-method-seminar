-- ============================================================
-- SQL Schema for Universal Method Seminar (phpMyAdmin / MySQL)
-- ============================================================

CREATE DATABASE IF NOT EXISTS `ums_seminar` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `ums_seminar`;

CREATE TABLE IF NOT EXISTS `bookings` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `ticket_id` VARCHAR(32) NOT NULL UNIQUE,
  `stripe_session_id` VARCHAR(255) DEFAULT NULL,
  `full_name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(64) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `martial_system` VARCHAR(128) DEFAULT NULL,
  `experience_level` VARCHAR(128) DEFAULT NULL,
  `tier_key` VARCHAR(32) NOT NULL,
  `tier_name` VARCHAR(128) NOT NULL,
  `amount_paid` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
  `payment_status` VARCHAR(32) NOT NULL DEFAULT 'PAID',
  `payment_method` VARCHAR(64) DEFAULT 'stripe',
  `attended` TINYINT(1) NOT NULL DEFAULT 0,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Initial Data for Testing
INSERT INTO `bookings` (`id`, `ticket_id`, `full_name`, `email`, `phone`, `address`, `martial_system`, `experience_level`, `tier_key`, `tier_name`, `amount_paid`, `payment_status`, `payment_method`, `attended`, `notes`)
VALUES 
('rec-1', 'UMS-8492', 'Marco Rossi', 'marco.rossi@bjj.it', '+39 340 1234567', 'Roma, Italia', 'BJJ (Jiu-Jitsu)', 'Cintura Nera', 'full', 'Full Seminar (2 Days)', 140.00, 'PAID', 'stripe_card', 1, 'Richiede posto prima fila.'),
('rec-2', 'UMS-3921', 'Alessandro Conti', 'alessandro@gmail.com', '+39 335 9876543', 'Milano, Italia', 'Wing Tsun', '3-5 Anni', 'day1', 'Day 1 Pass — Perceive', 80.00, 'PAID', 'google_pay', 0, 'Interessato alla biomeccanica.'),
('rec-3', 'UMS-7120', 'Gianluca Moretti', 'g.moretti@mma.it', '+39 320 5551234', 'Firenze, Italia', 'MMA', '1-2 Anni', 'full', 'Full Seminar (2 Days)', 140.00, 'PAID', 'klarna', 1, 'Pagamento 3 rate Klarna.');

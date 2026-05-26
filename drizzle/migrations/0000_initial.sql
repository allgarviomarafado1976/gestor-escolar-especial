CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin','professor','tecnico') NOT NULL DEFAULT 'user',
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);

CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(50) NOT NULL,
	`entity` varchar(50) NOT NULL,
	`entityId` int,
	`details` json,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`),
	CONSTRAINT `audit_log_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action
);

CREATE TABLE `measures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('Universal','Seletiva','Adicional') NOT NULL,
	`description` text,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `measures_id` PRIMARY KEY(`id`)
);

CREATE TABLE `schools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`abbreviation` varchar(50) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schools_id` PRIMARY KEY(`id`)
);

CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`birthDate` date,
	`studentNumber` varchar(50),
	`schoolId` int,
	`className` varchar(100),
	`educationLevel` enum('Pré-Escolar','1.º Ciclo','2.º Ciclo','3.º Ciclo','Secundário'),
	`specialNeed` text,
	`classTeacher` varchar(255),
	`observations` text,
	`evaluationAccommodations` text,
	`active` boolean NOT NULL DEFAULT true,
	`createdBy` int,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_studentNumber_unique` UNIQUE(`studentNumber`),
	CONSTRAINT `students_schoolId_schools_id_fk` FOREIGN KEY (`schoolId`) REFERENCES `schools`(`id`) ON DELETE no action ON UPDATE no action,
	CONSTRAINT `students_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action,
	CONSTRAINT `students_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action
);

CREATE TABLE `student_measures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`measureId` int NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date,
	`notes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_measures_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_measures_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `student_measures_measureId_measures_id_fk` FOREIGN KEY (`measureId`) REFERENCES `measures`(`id`) ON DELETE cascade ON UPDATE no action,
	CONSTRAINT `student_measures_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action
);

CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('student','school','class','measure','period') NOT NULL,
	`studentId` int,
	`schoolId` int,
	`className` varchar(100),
	`measureType` enum('Universal','Seletiva','Adicional'),
	`period` varchar(50),
	`content` text,
	`pdfUrl` varchar(500),
	`generatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `reports_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action,
	CONSTRAINT `reports_schoolId_schools_id_fk` FOREIGN KEY (`schoolId`) REFERENCES `schools`(`id`) ON DELETE no action ON UPDATE no action,
	CONSTRAINT `reports_generatedBy_users_id_fk` FOREIGN KEY (`generatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action
);

CREATE INDEX `idx_students_school_id` ON `students`(`schoolId`);
CREATE INDEX `idx_students_education_level` ON `students`(`educationLevel`);
CREATE INDEX `idx_student_measures_student_id` ON `student_measures`(`studentId`);
CREATE INDEX `idx_student_measures_measure_id` ON `student_measures`(`measureId`);
CREATE INDEX `idx_audit_log_user_id` ON `audit_log`(`userId`);
CREATE INDEX `idx_audit_log_created_at` ON `audit_log`(`createdAt` DESC);

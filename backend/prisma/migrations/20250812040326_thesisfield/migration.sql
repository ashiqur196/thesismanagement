-- CreateTable
CREATE TABLE `theses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `Code` VARCHAR(50) NOT NULL,
    `joinPassword` VARCHAR(100) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'PENDING_SUPERVISOR') NOT NULL DEFAULT 'PENDING_SUPERVISOR',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `supervisorId` INTEGER NULL,

    UNIQUE INDEX `theses_Code_key`(`Code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `thesis_members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `thesisId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `thesis_members_thesisId_studentId_key`(`thesisId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supervisor_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `thesisId` INTEGER NOT NULL,
    `facultyId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `message` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `theses` ADD CONSTRAINT `theses_supervisorId_fkey` FOREIGN KEY (`supervisorId`) REFERENCES `faculties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `thesis_members` ADD CONSTRAINT `thesis_members_thesisId_fkey` FOREIGN KEY (`thesisId`) REFERENCES `theses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `thesis_members` ADD CONSTRAINT `thesis_members_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supervisor_requests` ADD CONSTRAINT `supervisor_requests_thesisId_fkey` FOREIGN KEY (`thesisId`) REFERENCES `theses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supervisor_requests` ADD CONSTRAINT `supervisor_requests_facultyId_fkey` FOREIGN KEY (`facultyId`) REFERENCES `faculties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supervisor_requests` ADD CONSTRAINT `supervisor_requests_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

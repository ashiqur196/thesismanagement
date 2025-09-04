-- DropForeignKey
ALTER TABLE `appointments` DROP FOREIGN KEY `appointments_thesisId_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_thesisId_fkey`;

-- DropForeignKey
ALTER TABLE `submissions` DROP FOREIGN KEY `submissions_taskId_fkey`;

-- DropForeignKey
ALTER TABLE `supervisor_requests` DROP FOREIGN KEY `supervisor_requests_thesisId_fkey`;

-- DropForeignKey
ALTER TABLE `tasks` DROP FOREIGN KEY `tasks_thesisId_fkey`;

-- DropForeignKey
ALTER TABLE `thesis_members` DROP FOREIGN KEY `thesis_members_thesisId_fkey`;

-- DropIndex
DROP INDEX `appointments_thesisId_fkey` ON `appointments`;

-- DropIndex
DROP INDEX `notifications_thesisId_fkey` ON `notifications`;

-- DropIndex
DROP INDEX `submissions_taskId_fkey` ON `submissions`;

-- DropIndex
DROP INDEX `supervisor_requests_thesisId_fkey` ON `supervisor_requests`;

-- DropIndex
DROP INDEX `tasks_thesisId_fkey` ON `tasks`;

-- AddForeignKey
ALTER TABLE `thesis_members` ADD CONSTRAINT `thesis_members_thesisId_fkey` FOREIGN KEY (`thesisId`) REFERENCES `theses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supervisor_requests` ADD CONSTRAINT `supervisor_requests_thesisId_fkey` FOREIGN KEY (`thesisId`) REFERENCES `theses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_thesisId_fkey` FOREIGN KEY (`thesisId`) REFERENCES `theses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_thesisId_fkey` FOREIGN KEY (`thesisId`) REFERENCES `theses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_thesisId_fkey` FOREIGN KEY (`thesisId`) REFERENCES `theses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

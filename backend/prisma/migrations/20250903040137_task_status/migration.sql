/*
  Warnings:

  - The values [IN_PROGRESS,OVERDUE] on the enum `tasks_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `tasks` MODIFY `status` ENUM('PENDING', 'COMPLETED') NOT NULL DEFAULT 'PENDING';

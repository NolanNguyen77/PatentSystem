/*
  Warnings:

  - You are about to drop the column `announcement_no` on the `patents` table. All the data in the column will be lost.
  - You are about to drop the column `applicant` on the `patents` table. All the data in the column will be lost.
  - You are about to drop the column `application_no` on the `patents` table. All the data in the column will be lost.
  - You are about to drop the column `case_no` on the `patents` table. All the data in the column will be lost.
  - You are about to drop the column `event_type` on the `patents` table. All the data in the column will be lost.
  - You are about to drop the column `invention_name` on the `patents` table. All the data in the column will be lost.
  - You are about to drop the column `inventor` on the `patents` table. All the data in the column will be lost.
  - You are about to drop the column `ipc` on the `patents` table. All the data in the column will be lost.
  - You are about to drop the column `known_date` on the `patents` table. All the data in the column will be lost.
  - You are about to drop the column `other` on the `patents` table. All the data in the column will be lost.
  - You are about to drop the column `patent_no` on the `patents` table. All the data in the column will be lost.
  - You are about to drop the column `publication_no` on the `patents` table. All the data in the column will be lost.
  - You are about to drop the column `registration_no` on the `patents` table. All the data in the column will be lost.
  - You are about to drop the column `stage` on the `patents` table. All the data in the column will be lost.
  - You are about to drop the column `trial_no` on the `patents` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
DROP INDEX [patents_applicant_idx] ON [dbo].[patents];

-- AlterTable
ALTER TABLE [dbo].[patents] DROP COLUMN [announcement_no],
[applicant],
[application_no],
[case_no],
[event_type],
[invention_name],
[inventor],
[ipc],
[known_date],
[other],
[patent_no],
[publication_no],
[registration_no],
[stage],
[trial_no];
ALTER TABLE [dbo].[patents] ADD [announcement_num] NVARCHAR(1000),
[appeal_num] NVARCHAR(1000),
[applicant_name] NVARCHAR(1000),
[application_num] NVARCHAR(1000),
[document_num] NVARCHAR(1000),
[event_detail] NVARCHAR(1000),
[fi_classification] NVARCHAR(1000),
[invention_title] NVARCHAR(1000),
[other_info] NVARCHAR(1000),
[publication_num] NVARCHAR(1000),
[registration_num] NVARCHAR(1000),
[status_stage] NVARCHAR(1000);

-- CreateIndex
CREATE NONCLUSTERED INDEX [patents_applicant_name_idx] ON [dbo].[patents]([applicant_name]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

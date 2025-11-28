/*
  Warnings:

  - You are about to alter the column `other_info` on the `patents` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `Text`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[patents] ALTER COLUMN [other_info] TEXT NULL;
ALTER TABLE [dbo].[patents] ADD [abstract] TEXT,
[claims] TEXT;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

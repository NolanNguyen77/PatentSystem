/*
  Warnings:

  - You are about to drop the column `abstract` on the `patents` table. All the data in the column will be lost.
  - You are about to drop the column `claims` on the `patents` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[patents] DROP COLUMN [abstract],
[claims];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

/*
  Warnings:

  - You are about to drop the `title_user_permissions` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[title_user_permissions] DROP CONSTRAINT [title_user_permissions_title_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[title_user_permissions] DROP CONSTRAINT [title_user_permissions_user_id_fkey];

-- DropTable
DROP TABLE [dbo].[title_user_permissions];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[activity_logs] DROP CONSTRAINT [activity_logs_title_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[activity_logs] DROP CONSTRAINT [activity_logs_user_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[evaluations] DROP CONSTRAINT [evaluations_title_id_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[title_users] DROP CONSTRAINT [title_users_user_id_fkey];

-- AlterTable
ALTER TABLE [dbo].[titles] ADD [main_owner_id] NVARCHAR(1000);

-- AddForeignKey
ALTER TABLE [dbo].[titles] ADD CONSTRAINT [titles_main_owner_id_fkey] FOREIGN KEY ([main_owner_id]) REFERENCES [dbo].[users]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[title_users] ADD CONSTRAINT [title_users_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[evaluations] ADD CONSTRAINT [evaluations_title_id_fkey] FOREIGN KEY ([title_id]) REFERENCES [dbo].[titles]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[activity_logs] ADD CONSTRAINT [activity_logs_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[activity_logs] ADD CONSTRAINT [activity_logs_title_id_fkey] FOREIGN KEY ([title_id]) REFERENCES [dbo].[titles]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

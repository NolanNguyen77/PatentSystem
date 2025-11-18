/*
  Warnings:

  - You are about to drop the column `permission` on the `title_users` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- Drop the default constraint on permission column first
ALTER TABLE [dbo].[title_users] DROP CONSTRAINT [title_users_permission_df];

-- AlterTable
ALTER TABLE [dbo].[title_users] DROP COLUMN [permission];
ALTER TABLE [dbo].[title_users] ADD [confirm_email] BIT NOT NULL CONSTRAINT [title_users_confirm_email_df] DEFAULT 0,
[eval_email] BIT NOT NULL CONSTRAINT [title_users_eval_email_df] DEFAULT 0,
[is_admin] BIT NOT NULL CONSTRAINT [title_users_is_admin_df] DEFAULT 0,
[is_general] BIT NOT NULL CONSTRAINT [title_users_is_general_df] DEFAULT 1,
[is_viewer] BIT NOT NULL CONSTRAINT [title_users_is_viewer_df] DEFAULT 0;

-- CreateTable
CREATE TABLE [dbo].[title_user_permissions] (
    [id] NVARCHAR(1000) NOT NULL,
    [title_id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [is_admin] BIT NOT NULL CONSTRAINT [title_user_permissions_is_admin_df] DEFAULT 0,
    [is_general] BIT NOT NULL CONSTRAINT [title_user_permissions_is_general_df] DEFAULT 1,
    [is_viewer] BIT NOT NULL CONSTRAINT [title_user_permissions_is_viewer_df] DEFAULT 0,
    [is_main_responsible] BIT NOT NULL CONSTRAINT [title_user_permissions_is_main_responsible_df] DEFAULT 0,
    [eval_email] BIT NOT NULL CONSTRAINT [title_user_permissions_eval_email_df] DEFAULT 0,
    [confirm_email] BIT NOT NULL CONSTRAINT [title_user_permissions_confirm_email_df] DEFAULT 0,
    [display_order] INT NOT NULL CONSTRAINT [title_user_permissions_display_order_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [title_user_permissions_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [title_user_permissions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [title_user_permissions_title_id_user_id_key] UNIQUE NONCLUSTERED ([title_id],[user_id])
);

-- AddForeignKey
ALTER TABLE [dbo].[title_user_permissions] ADD CONSTRAINT [title_user_permissions_title_id_fkey] FOREIGN KEY ([title_id]) REFERENCES [dbo].[titles]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[title_user_permissions] ADD CONSTRAINT [title_user_permissions_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

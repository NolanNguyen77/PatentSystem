BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[patent_assignments] (
    [id] NVARCHAR(1000) NOT NULL,
    [patent_id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [patent_assignments_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [patent_assignments_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [patent_assignments_patent_id_user_id_key] UNIQUE NONCLUSTERED ([patent_id],[user_id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [patent_assignments_patent_id_idx] ON [dbo].[patent_assignments]([patent_id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [patent_assignments_user_id_idx] ON [dbo].[patent_assignments]([user_id]);

-- AddForeignKey
ALTER TABLE [dbo].[patent_assignments] ADD CONSTRAINT [patent_assignments_patent_id_fkey] FOREIGN KEY ([patent_id]) REFERENCES [dbo].[patents]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[patent_assignments] ADD CONSTRAINT [patent_assignments_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

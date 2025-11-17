BEGIN TRY

BEGIN TRAN;


-- TABLE
CREATE TABLE [dbo].[users] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000),
    [department_id] NVARCHAR(1000),
    [section] NVARCHAR(1000),
    [permission] NVARCHAR(1000) NOT NULL CONSTRAINT [users_permission_df] DEFAULT '一般',
    [display_order] INT NOT NULL CONSTRAINT [users_display_order_df] DEFAULT 0,
    [is_active] BIT NOT NULL CONSTRAINT [users_is_active_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [users_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_user_id_key] UNIQUE NONCLUSTERED ([user_id])
);


CREATE TABLE [dbo].[departments] (
    [id] NVARCHAR(1000) NOT NULL,
    [no] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [abbreviation] NVARCHAR(1000),
    [display_order] INT NOT NULL CONSTRAINT [departments_display_order_df] DEFAULT 0,
    [is_active] BIT NOT NULL CONSTRAINT [departments_is_active_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [departments_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [departments_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [departments_no_key] UNIQUE NONCLUSTERED ([no])
);


CREATE TABLE [dbo].[titles] (
    [id] NVARCHAR(1000) NOT NULL,
    [title_no] NVARCHAR(1000) NOT NULL,
    [title_name] NVARCHAR(1000) NOT NULL,
    [data_type] NVARCHAR(1000) NOT NULL CONSTRAINT [titles_data_type_df] DEFAULT '特許',
    [mark_color] NVARCHAR(1000),
    [parent_title_id] NVARCHAR(1000),
    [save_date] NVARCHAR(1000) NOT NULL,
    [disallow_evaluation] BIT NOT NULL CONSTRAINT [titles_disallow_evaluation_df] DEFAULT 0,
    [allow_evaluation] BIT NOT NULL CONSTRAINT [titles_allow_evaluation_df] DEFAULT 1,
    [view_permission] NVARCHAR(1000) NOT NULL CONSTRAINT [titles_view_permission_df] DEFAULT 'all',
    [edit_permission] NVARCHAR(1000) NOT NULL CONSTRAINT [titles_edit_permission_df] DEFAULT 'creator',
    [main_evaluation] BIT NOT NULL CONSTRAINT [titles_main_evaluation_df] DEFAULT 1,
    [single_patent_multiple_evals] BIT NOT NULL CONSTRAINT [titles_single_patent_multiple_evals_df] DEFAULT 0,
    [created_by] NVARCHAR(1000) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [titles_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [titles_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [titles_title_no_key] UNIQUE NONCLUSTERED ([title_no])
);


CREATE TABLE [dbo].[title_users] (
    [id] NVARCHAR(1000) NOT NULL,
    [title_id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [is_main_responsible] BIT NOT NULL CONSTRAINT [title_users_is_main_responsible_df] DEFAULT 0,
    [permission] NVARCHAR(1000) NOT NULL CONSTRAINT [title_users_permission_df] DEFAULT '一般',
    [eval_email] BIT NOT NULL CONSTRAINT [title_users_eval_email_df] DEFAULT 0,
    [confirm_email] BIT NOT NULL CONSTRAINT [title_users_confirm_email_df] DEFAULT 0,
    [display_order] INT NOT NULL CONSTRAINT [title_users_display_order_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [title_users_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [title_users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [title_users_title_id_user_id_key] UNIQUE NONCLUSTERED ([title_id],[user_id])
);


CREATE TABLE [dbo].[patents] (
    [id] NVARCHAR(1000) NOT NULL,
    [title_id] NVARCHAR(1000) NOT NULL,
    [patent_no] NVARCHAR(1000),
    [application_no] NVARCHAR(1000),
    [application_date] DATETIME2,
    [publication_date] DATETIME2,
    [publication_no] NVARCHAR(1000),
    [registration_no] NVARCHAR(1000),
    [announcement_no] NVARCHAR(1000),
    [trial_no] NVARCHAR(1000),
    [case_no] NVARCHAR(1000),
    [known_date] DATETIME2,
    [invention_name] NVARCHAR(1000),
    [applicant] NVARCHAR(1000),
    [inventor] NVARCHAR(1000),
    [ipc] NVARCHAR(1000),
    [abstract] NVARCHAR(1000),
    [claims] NVARCHAR(1000),
    [stage] NVARCHAR(1000),
    [event_type] NVARCHAR(1000),
    [other] NVARCHAR(1000),
    [document_url] NVARCHAR(1000),
    [evaluation_status] NVARCHAR(1000) NOT NULL CONSTRAINT [patents_evaluation_status_df] DEFAULT '未評価',
    [created_at] DATETIME2 NOT NULL CONSTRAINT [patents_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [patents_pkey] PRIMARY KEY CLUSTERED ([id])
);


CREATE TABLE [dbo].[evaluations] (
    [id] NVARCHAR(1000) NOT NULL,
    [patent_id] NVARCHAR(1000) NOT NULL,
    [title_id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [comment] NVARCHAR(1000),
    [score] INT,
    [is_public] BIT NOT NULL CONSTRAINT [evaluations_is_public_df] DEFAULT 0,
    [is_deleted] BIT NOT NULL CONSTRAINT [evaluations_is_deleted_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [evaluations_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [evaluations_pkey] PRIMARY KEY CLUSTERED ([id])
);


CREATE TABLE [dbo].[patent_classifications] (
    [id] NVARCHAR(1000) NOT NULL,
    [patent_id] NVARCHAR(1000) NOT NULL,
    [title_id] NVARCHAR(1000) NOT NULL,
    [classification_type] NVARCHAR(1000) NOT NULL,
    [classification_value] NVARCHAR(1000) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [patent_classifications_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [patent_classifications_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [patent_classifications_patent_id_title_id_classification_type_classification_value_key] UNIQUE NONCLUSTERED ([patent_id],[title_id],[classification_type],[classification_value])
);


CREATE TABLE [dbo].[attachments] (
    [id] NVARCHAR(1000) NOT NULL,
    [title_id] NVARCHAR(1000) NOT NULL,
    [filename] NVARCHAR(1000) NOT NULL,
    [original_name] NVARCHAR(1000) NOT NULL,
    [size] BIGINT NOT NULL,
    [mime_type] NVARCHAR(1000) NOT NULL,
    [file_path] NVARCHAR(1000) NOT NULL,
    [uploaded_by] NVARCHAR(1000) NOT NULL,
    [uploaded_at] DATETIME2 NOT NULL CONSTRAINT [attachments_uploaded_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [attachments_pkey] PRIMARY KEY CLUSTERED ([id])
);


CREATE TABLE [dbo].[activity_logs] (
    [id] NVARCHAR(1000) NOT NULL,
    [user_id] NVARCHAR(1000),
    [title_id] NVARCHAR(1000),
    [action] NVARCHAR(1000) NOT NULL,
    [target_type] NVARCHAR(1000) NOT NULL,
    [target_id] NVARCHAR(1000),
    [details] NVARCHAR(1000),
    [ip_address] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [activity_logs_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [activity_logs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CREATE INDEX
CREATE NONCLUSTERED INDEX [patents_title_id_idx] ON [dbo].[patents]([title_id]);
CREATE NONCLUSTERED INDEX [patents_applicant_idx] ON [dbo].[patents]([applicant]);
CREATE NONCLUSTERED INDEX [patents_application_date_idx] ON [dbo].[patents]([application_date]);
CREATE NONCLUSTERED INDEX [patents_publication_date_idx] ON [dbo].[patents]([publication_date]);
CREATE NONCLUSTERED INDEX [evaluations_patent_id_idx] ON [dbo].[evaluations]([patent_id]);
CREATE NONCLUSTERED INDEX [evaluations_title_id_idx] ON [dbo].[evaluations]([title_id]);
CREATE NONCLUSTERED INDEX [evaluations_user_id_idx] ON [dbo].[evaluations]([user_id]);
CREATE NONCLUSTERED INDEX [patent_classifications_title_id_classification_type_classification_value_idx] ON [dbo].[patent_classifications]([title_id], [classification_type], [classification_value]);
CREATE NONCLUSTERED INDEX [attachments_title_id_idx] ON [dbo].[attachments]([title_id]);
CREATE NONCLUSTERED INDEX [activity_logs_user_id_idx] ON [dbo].[activity_logs]([user_id]);
CREATE NONCLUSTERED INDEX [activity_logs_title_id_idx] ON [dbo].[activity_logs]([title_id]);
CREATE NONCLUSTERED INDEX [activity_logs_target_type_target_id_idx] ON [dbo].[activity_logs]([target_type], [target_id]);
CREATE NONCLUSTERED INDEX [activity_logs_created_at_idx] ON [dbo].[activity_logs]([created_at]);

-- ADD FOREIGN KEY
ALTER TABLE [dbo].[users]       ADD CONSTRAINT [users_department_id_fkey] FOREIGN KEY ([department_id]) REFERENCES [dbo].[departments]([id]) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE [dbo].[titles]      ADD CONSTRAINT [titles_parent_title_id_fkey] FOREIGN KEY ([parent_title_id]) REFERENCES [dbo].[titles]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[title_users] ADD CONSTRAINT [title_users_title_id_fkey] FOREIGN KEY ([title_id]) REFERENCES [dbo].[titles]([id]) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE [dbo].[title_users] ADD CONSTRAINT [title_users_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE [dbo].[patents]     ADD CONSTRAINT [patents_title_id_fkey] FOREIGN KEY ([title_id]) REFERENCES [dbo].[titles]([id]) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE [dbo].[evaluations] ADD CONSTRAINT [evaluations_patent_id_fkey] FOREIGN KEY ([patent_id]) REFERENCES [dbo].[patents]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[evaluations] ADD CONSTRAINT [evaluations_title_id_fkey] FOREIGN KEY ([title_id]) REFERENCES [dbo].[titles]([id]) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE [dbo].[evaluations] ADD CONSTRAINT [evaluations_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE [dbo].[patent_classifications] ADD CONSTRAINT [patent_classifications_patent_id_fkey] FOREIGN KEY ([patent_id]) REFERENCES [dbo].[patents]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[patent_classifications] ADD CONSTRAINT [patent_classifications_title_id_fkey] FOREIGN KEY ([title_id]) REFERENCES [dbo].[titles]([id]) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE [dbo].[attachments]   ADD CONSTRAINT [attachments_title_id_fkey] FOREIGN KEY ([title_id]) REFERENCES [dbo].[titles]([id]) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE [dbo].[activity_logs] ADD CONSTRAINT [activity_logs_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE [dbo].[activity_logs] ADD CONSTRAINT [activity_logs_title_id_fkey] FOREIGN KEY ([title_id]) REFERENCES [dbo].[titles]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

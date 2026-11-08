USE [AIChatApplication];
GO

SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF NOT EXISTS (
    SELECT 1
    FROM dbo.AspNetRoles
    WHERE NormalizedName = N'ADMIN'
)
BEGIN
    INSERT INTO dbo.AspNetRoles (Id, Name, NormalizedName, ConcurrencyStamp)
    VALUES (NEWID(), N'Admin', N'ADMIN', CONVERT(nvarchar(36), NEWID()));
END;

IF NOT EXISTS (
    SELECT 1
    FROM dbo.AspNetRoles
    WHERE NormalizedName = N'GENERALUSER'
)
BEGIN
    INSERT INTO dbo.AspNetRoles (Id, Name, NormalizedName, ConcurrencyStamp)
    VALUES (NEWID(), N'GeneralUser', N'GENERALUSER', CONVERT(nvarchar(36), NEWID()));
END;

COMMIT TRANSACTION;
GO

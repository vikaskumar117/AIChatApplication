USE [AIChatApplication];
GO

/*
  Development bootstrap only:
  1. Register the intended admin email through the application.
  2. Replace the value below with that email.
  3. Run this script using an authorized local SQL Server connection.
  4. Sign out and back in so the admin role is present in the auth cookie.

  This script never stores a password or password hash.
*/
DECLARE @AdminEmail nvarchar(254) = N'admin@example.com';
DECLARE @UserId uniqueidentifier;
DECLARE @AdminRoleId uniqueidentifier;

SET XACT_ABORT ON;
BEGIN TRANSACTION;

SELECT @UserId = Id
FROM dbo.AspNetUsers
WHERE NormalizedEmail = UPPER(LTRIM(RTRIM(@AdminEmail)));

IF @UserId IS NULL
BEGIN
    THROW 50001, 'Register the bootstrap admin account before running this script.', 1;
END;

SELECT @AdminRoleId = Id
FROM dbo.AspNetRoles
WHERE NormalizedName = N'ADMIN';

IF @AdminRoleId IS NULL
BEGIN
    THROW 50002, 'Run 002-seed-roles.sql before bootstrapping an admin.', 1;
END;

UPDATE dbo.AspNetUsers
SET AccountStatus = N'Active'
WHERE Id = @UserId;

IF NOT EXISTS (
    SELECT 1
    FROM dbo.AspNetUserRoles
    WHERE UserId = @UserId AND RoleId = @AdminRoleId
)
BEGIN
    INSERT INTO dbo.AspNetUserRoles (UserId, RoleId)
    VALUES (@UserId, @AdminRoleId);
END;

COMMIT TRANSACTION;
GO

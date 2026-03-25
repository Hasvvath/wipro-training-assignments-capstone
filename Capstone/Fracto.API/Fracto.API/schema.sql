/* Fracto.API - Schema aligned with current ApplicationDbContext */

IF OBJECT_ID(N'[dbo].[Users]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Users] (
        [UserId] INT IDENTITY(1,1) NOT NULL,
        [Name] NVARCHAR(MAX) NOT NULL,
        [Email] NVARCHAR(450) NOT NULL,
        [Password] NVARCHAR(MAX) NOT NULL,
        [Role] NVARCHAR(MAX) NOT NULL,
        [ProfileImage] NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([UserId])
    );
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Users_Email'
      AND object_id = OBJECT_ID(N'[dbo].[Users]')
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Email]
    ON [dbo].[Users] ([Email]);
END;
GO

IF OBJECT_ID(N'[dbo].[Doctors]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Doctors] (
        [DoctorId] INT IDENTITY(1,1) NOT NULL,
        [Name] NVARCHAR(MAX) NOT NULL,
        [Specialization] NVARCHAR(MAX) NOT NULL,
        [Rating] FLOAT NOT NULL,
        [City] NVARCHAR(MAX) NOT NULL,
        [Experience] INT NOT NULL CONSTRAINT [DF_Doctors_Experience] DEFAULT(0),
        [HospitalName] NVARCHAR(MAX) NOT NULL,
        [ProfileImage] NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_Doctors] PRIMARY KEY ([DoctorId])
    );
END;
GO

IF OBJECT_ID(N'[dbo].[Specializations]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Specializations] (
        [SpecializationId] INT IDENTITY(1,1) NOT NULL,
        [SpecializationName] NVARCHAR(MAX) NOT NULL,
        CONSTRAINT [PK_Specializations] PRIMARY KEY ([SpecializationId])
    );
END;
GO

IF OBJECT_ID(N'[dbo].[Appointments]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Appointments] (
        [AppointmentId] INT IDENTITY(1,1) NOT NULL,
        [UserId] INT NOT NULL,
        [DoctorId] INT NOT NULL,
        [AppointmentDate] DATETIME2 NOT NULL,
        [TimeSlot] NVARCHAR(MAX) NOT NULL,
        [Status] NVARCHAR(MAX) NOT NULL,
        [ConsultationType] NVARCHAR(MAX) NOT NULL,
        [MeetingLink] NVARCHAR(MAX) NULL,
        [CancellationReason] NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_Appointments] PRIMARY KEY ([AppointmentId])
    );
END;
GO

IF OBJECT_ID(N'[dbo].[Ratings]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Ratings] (
        [RatingId] INT IDENTITY(1,1) NOT NULL,
        [UserId] INT NOT NULL,
        [DoctorId] INT NOT NULL,
        [AppointmentId] INT NOT NULL,
        [Score] INT NOT NULL,
        CONSTRAINT [PK_Ratings] PRIMARY KEY ([RatingId])
    );
END;
GO

IF OBJECT_ID(N'[dbo].[DoctorLeaves]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[DoctorLeaves] (
        [DoctorLeaveId] INT IDENTITY(1,1) NOT NULL,
        [DoctorId] INT NOT NULL,
        [LeaveDate] DATETIME2 NOT NULL,
        [IsFullDay] BIT NOT NULL,
        [TimeSlot] NVARCHAR(450) NULL,
        [Reason] NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_DoctorLeaves] PRIMARY KEY ([DoctorLeaveId])
    );
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_DoctorLeaves_DoctorId_LeaveDate_IsFullDay_TimeSlot'
      AND object_id = OBJECT_ID(N'[dbo].[DoctorLeaves]')
)
BEGIN
    CREATE INDEX [IX_DoctorLeaves_DoctorId_LeaveDate_IsFullDay_TimeSlot]
    ON [dbo].[DoctorLeaves] ([DoctorId], [LeaveDate], [IsFullDay], [TimeSlot]);
END;
GO
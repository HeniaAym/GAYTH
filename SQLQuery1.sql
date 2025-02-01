

-- استخدام قاعدة البيانات الجديدة

-- جدول المستخدمين (Users) لتسجيل الدخول والصلاحيات
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL, -- مثل: "محسن"، "جمعية"، "مسؤول"
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- جدول الأشياء (Items) التي يرفعها المحسنون
CREATE TABLE Items (
    ItemID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    ItemName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Image NVARCHAR(MAX), -- يمكن حفظ مسار الصورة
    Status NVARCHAR(20) DEFAULT 'Available', -- "Available" أو "Donated"
    State NVARCHAR(50), -- الولاية
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- جدول المرضى (Patients) الخاص بالجمعيات
CREATE TABLE Patients (
    PatientID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT FOREIGN KEY REFERENCES Users(UserID), -- الجمعية المسؤولة
    PatientName NVARCHAR(100) NOT NULL,
    ConditionDescription NVARCHAR(255),
    Image NVARCHAR(MAX), -- يمكن حفظ مسار الصورة
    City NVARCHAR(50),
    State NVARCHAR(50), -- الولاية
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- جدول المتطوعين (Volunteers)
CREATE TABLE Volunteers (
    VolunteerID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    SKills NVARCHAR(255),
    ContactInfo NVARCHAR(100),
    City NVARCHAR(50),
    State NVARCHAR(50), -- الولاية
    CreatedAt DATETIME DEFAULT GETDATE()
);
  


  CREATE TABLE Posts (
    PostID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    Content NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    PostType NVARCHAR(20) DEFAULT 'عام' -- قيم افتراضية: 'عام' أو 'تطوعي'
);
 

 CREATE TABLE Comments (
    CommentID INT PRIMARY KEY IDENTITY(1,1),
    PostID INT FOREIGN KEY REFERENCES Posts(PostID),
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    Content NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

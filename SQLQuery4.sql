CREATE TABLE users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    role NVARCHAR(20) CHECK (role IN ('مستخدم', 'جمعية', 'متطوع', 'مريض', 'اداري')),
    registration_date DATETIME DEFAULT GETDATE()
);

CREATE TABLE charities (
    charity_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT UNIQUE NOT NULL,
    charity_name NVARCHAR(100) NOT NULL,
    license_number NVARCHAR(50) UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
CREATE TABLE donations (
    donation_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    title NVARCHAR(200) NOT NULL,
    description NTEXT,
    category NVARCHAR(50) CHECK (category IN ('مال', 'طعام', 'ملابس', 'أدوية')),
    status NVARCHAR(20) DEFAULT 'معلّق' CHECK (status IN ('معلّق', 'مُعتمَد', 'مكتمل')),
    post_date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE donation_images (
    image_id INT PRIMARY KEY IDENTITY(1,1),
    donation_id INT NOT NULL,
    image_url NVARCHAR(255) NOT NULL,
    FOREIGN KEY (donation_id) REFERENCES donations(donation_id)
);
CREATE TABLE volunteers (
    volunteer_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    skills NTEXT,
    availability NVARCHAR(100),
    approved BIT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE volunteer_opportunities (
    opportunity_id INT PRIMARY KEY IDENTITY(1,1),
    charity_id INT NOT NULL,
    title NVARCHAR(200) NOT NULL,
    requirements NTEXT,
    start_date DATETIME,
    FOREIGN KEY (charity_id) REFERENCES charities(charity_id)
);
CREATE TABLE patients (
    patient_id INT PRIMARY KEY IDENTITY(1,1),
    charity_id INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    condition NTEXT,
    urgency_level NVARCHAR(20) CHECK (urgency_level IN ('عاجل', 'متوسط', 'منخفض')),
    post_date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (charity_id) REFERENCES charities(charity_id)
);

CREATE TABLE community_posts (
    post_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    content NTEXT NOT NULL,
    post_date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE comments (
    comment_id INT PRIMARY KEY IDENTITY(1,1),
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content NTEXT NOT NULL,
    comment_date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (post_id) REFERENCES community_posts(post_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
-- إنشاء تسجيل دخول (Login) جديد
CREATE LOGIN CharityDev WITH PASSWORD = 'StronG!P@ssw0rd2023';

-- إنشاء مستخدم مرتبط بقاعدة البيانات CharityDB
USE [CharityDB];
CREATE USER CharityDevUser FOR LOGIN CharityDev;

-- منح الصلاحيات الأساسية
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON SCHEMA::dbo TO CharityDevUser;
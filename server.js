const express = require('express');
const multer = require('multer');
const path = require('path');
const sql = require('msnodesqlv8'); // استيراد مكتبة msnodesqlv8
const bcrypt = require('bcrypt');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const volunteersRouter = require('./volunteers'); 
const router = require('./volunteers');
const jwt = require('jsonwebtoken');
const api = require('./models/config/database'); // تأكد أن ملف api.js موجود في نفس المجلد مع server.js
const cookieParser = require('cookie-parser');
const communityRoutes = require('./communityRoutes');



app.use(express.json());
app.use(cookieParser());

// توجيه طلبات المجتمع
app.use('/api/community', communityRoutes);


// إعداد التخزين باستخدام multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // تحديد المجلد الذي يتم تخزين الملفات فيه
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // توليد اسم فريد باستخدام الوقت
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.json());

// إعداد الاتصال بقاعدة البيانات
const connectionString = "server=AYMEN;Database=ManagementSystem;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";



// نقطة API لرفع العناصر
app.post('/items', upload.single('image'), (req, res) => {
    const { itemName, description, state, userId } = req.body; // لاحظ التغيير هنا
    const image = req.file ? `/uploads/${req.file.filename}` : ''; // مسار الصورة

    if (!itemName || !description || !state || !userId) {
        return res.status(400).json({ message: 'جميع الحقول مطلوبة.' });
    }

    const query = `
        INSERT INTO Items (UserID, ItemName, Description, Image, State)
        VALUES (?, ?, ?, ?, ?)
    `;

    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error opening connection:', err);
            return res.status(500).json({ message: 'حدث خطأ أثناء الاتصال بقاعدة البيانات.' });
        }

        conn.query(query, [userId, itemName, description, image, state], (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ message: 'حدث خطأ أثناء رفع العنصر.' });
            }
            res.status(201).json({ message: 'تم رفع العنصر بنجاح' });
        });
    });
});




// إعداد ملفات static لعرض الصور
app.use('/uploads', express.static('uploads'));

// نقطة API لاسترجاع العناصر من قاعدة البيانات
app.get('/items', (req, res) => {
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error opening connection:', err);
            return res.status(500).json({ message: 'حدث خطأ أثناء الاتصال بقاعدة البيانات.' });
        }

        const query = 'SELECT * FROM Items';
        
        conn.query(query, (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ message: 'حدث خطأ أثناء جلب العناصر.' });
            }

            res.json(result); // إرجاع البيانات المسترجعة
            conn.close();
        });
    });
});

// نقطة API لاسترجاع المرضى من قاعدة البيانات
app.get('/patients', (req, res) => {
    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error opening connection:', err);
            return res.status(500).json({ message: 'حدث خطأ أثناء الاتصال بقاعدة البيانات.' });
        }

        const query = 'SELECT * FROM Patients';

        conn.query(query, (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ message: 'حدث خطأ أثناء جلب المرضى.' });
            }

            res.json(result); // إرجاع المرضى
            conn.close();
        });
    });
});

// نقطة API لإضافة مريض
app.post('/patients', upload.single('image'), (req, res) => {
    const { patientName, conditionDescription, city, state, userId } = req.body;  // الحصول على userId من الجسم
    const image = req.file ? `/uploads/${req.file.filename}` : ''; // مسار الصورة

    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error opening connection:', err);
            return res.status(500).json({ message: 'حدث خطأ أثناء الاتصال بقاعدة البيانات.' });
        }

        const query = `INSERT INTO Patients (UserID, PatientName, ConditionDescription, Image, City, State) 
                       VALUES (${userId}, '${patientName}', '${conditionDescription}', '${image}', '${city}', '${state}')`;

        conn.query(query, (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ message: 'حدث خطأ أثناء إضافة المريض.' });
            }
            res.json({ message: 'تم إضافة المريض بنجاح' });
            conn.close();
        });
    });
});


   
// إعدادات Body Parser للتعامل مع البيانات
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



// ربط الروتر الخاص بالمتطوعين
app.use('/api', volunteersRouter);







// تسجيل الدخول
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/signup', async (req, res) => {
    const { username, password, role } = req.body;

    // تحقق من الحقول المطلوبة
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'جميع الحقول مطلوبة.' });
    }

    try {
        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO Users (Username, PasswordHash, Role)
            VALUES (?, ?, ?)
        `;

        sql.open(connectionString, (err, conn) => {
            if (err) {
                console.error('Database connection error:', err);
                return res.status(500).json({ message: 'حدث خطأ أثناء الاتصال بقاعدة البيانات.' });
            }

            conn.query(query, [username, hashedPassword, role], (err, result) => {
                if (err) {
                    console.error('Query execution error:', err);
                    return res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الحساب.' });
                }

                console.log('User created successfully:', result);
                
                // بعد نجاح التسجيل، يتم إعادة توجيه المستخدم إلى الصفحة الرئيسية
                res.redirect('/');
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الحساب.' });
    }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // تحقق من الحقول المطلوبة
    if (!username || !password) {
        return res.status(400).json({ message: 'اسم المستخدم وكلمة المرور مطلوبان.' });
    }

    try {
        // استعلام للبحث عن المستخدم في قاعدة البيانات
        const query = 'SELECT * FROM Users WHERE Username = ?';

        sql.open(connectionString, (err, conn) => {
            if (err) {
                console.error('Database connection error:', err);
                return res.status(500).json({ message: 'حدث خطأ أثناء الاتصال بقاعدة البيانات.' });
            }

            conn.query(query, [username], async (err, result) => {
                if (err) {
                    console.error('Query execution error:', err);
                    return res.status(500).json({ message: 'حدث خطأ أثناء التحقق من الحساب.' });
                }

                if (result.length === 0) {
                    return res.status(400).json({ message: 'اسم المستخدم غير موجود.' });
                }

                // التحقق من كلمة المرور باستخدام bcrypt
                const isPasswordCorrect = await bcrypt.compare(password, result[0].PasswordHash);
                if (!isPasswordCorrect) {
                    return res.status(400).json({ message: 'كلمة المرور غير صحيحة.' });
                }

                console.log('User logged in successfully:', result);

                // بعد تسجيل الدخول بنجاح، يتم إعادة توجيه المستخدم إلى الصفحة الرئيسية
                res.redirect('/');
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول.' });
    }
});












// تشغيل الخادم
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

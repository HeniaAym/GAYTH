const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const sql = require('msnodesqlv8');  // استخدام مكتبة msnodesqlv8

// إعدادات تخزين الملفات باستخدام multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/volunteers'); // تحديد المجلد الذي سيتم تخزين الصور فيه
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // إضافة اسم فريد للصورة
    }
});

// إعداد multer للتعامل مع رفع الصور
const upload = multer({ storage: storage });

// الاتصال بقاعدة البيانات باستخدام الاتصال الذي قدمته
const connectionString = "server=AYMEN;Database=CharityPlatform;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";
// إعداد static لعرض الصور في مجلد 'uploads/volunteers'
router.use('/uploads/volunteers', express.static(path.join(__dirname, 'uploads/volunteers')));
// إضافة متطوع جديد
router.post('/volunteers', upload.single('photo'), (req, res) => {
    const { State, City, ContactInfo, Skills, Name } = req.body;
    const photo = req.file ? `/uploads/volunteers/${req.file.filename}` : '';

    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error opening connection:', err);
            return res.status(500).json({ message: 'حدث خطأ أثناء الاتصال بقاعدة البيانات.' });
        }

        const query = `INSERT INTO Volunteers (Name, Skills, ContactInfo, City, State, photo) 
                       VALUES (?, ?, ?, ?, ?, ?)`;
        conn.query(query, [Name, Skills, ContactInfo, City, State, photo], (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ message: 'حدث خطأ أثناء رفع المتطوع.' });
            }
            res.json({ message: 'تم رفع المتطوع بنجاح' });
            conn.close();
        });
    });
});


// جلب قائمة المتطوعين
router.get('/volunteers', (req, res) => {
    const query = 'SELECT * FROM Volunteers';

    sql.open(connectionString, (err, conn) => {
        if (err) {
            console.error('Error opening connection:', err);
            return res.status(500).json({ message: 'حدث خطأ أثناء الاتصال بقاعدة البيانات.' });
        }

        conn.query(query, (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ message: 'حدث خطأ أثناء جلب المتطوعين.' });
            }

            res.json(result);
            conn.close();
        });
    });
});
  

module.exports = router;

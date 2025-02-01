const express = require('express');
const router = express.Router();
const { authenticateUser } = require('./middleware/auth');

const communityOperations = require('./models/communityOperations');

// إنشاء منشور جديد
router.post('/posts', authenticateUser, async (req, res) => {
    try {
        const { content, postType } = req.body;
        const post = await communityOperations.createPost(req.user.id, content, postType);
        res.status(201).json(post[0]);
    } catch (error) {
        res.status(400).json({ message: 'حدث خطأ في إنشاء المنشور' });
    }
});

// جلب المنشورات
router.get('/posts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const posts = await communityOperations.getPosts(page, limit);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في جلب المنشورات' });
    }
});

// إضافة تعليق
router.post('/posts/:postId/comments', authenticateUser, async (req, res) => {
    try {
        const { content } = req.body;
        const comment = await communityOperations.addComment(
            req.params.postId,
            req.user.id,
            content
        );
        res.status(201).json(comment[0]);
    } catch (error) {
        res.status(400).json({ message: 'حدث خطأ في إضافة التعليق' });
    }
});

// جلب التعليقات لمنشور معين
router.get('/posts/:postId/comments', async (req, res) => {
    try {
        const comments = await communityOperations.getComments(req.params.postId);
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في جلب التعليقات' });
    }
});

module.exports = router;
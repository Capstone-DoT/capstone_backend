const express = require('express');
const router = express.Router();

const contentController = require('../controllers/contentController');

router.get('/', contentController.getAllContentList);
router.get('/popular', contentController.getPopularContentList);

router.get('/scholarship', contentController.getContentList);
router.get('/scholarship/:id', contentController.getContentInfo);

router.get('/activity', contentController.getContentList);
router.get('/activity/:id', contentController.getContentInfo);

router.get('/contest', contentController.getContentList);
router.get('/contest/:id', contentController.getContentInfo);

module.exports = router;

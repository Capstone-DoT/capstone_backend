const express = require('express');
const router = express.Router();

const contentController = require('../controllers/contentController');

router.get('/scholarship', contentController.getContentList);
router.get('/activity', contentController.getContentList);
router.get('/contest', contentController.getContentList);

module.exports = router;

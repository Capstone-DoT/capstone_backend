const express = require('express');
const router = express.Router();

const contentController = require('../controllers/contentController');

router.get('/scholarship', contentController.getScholarships);

module.exports = router;

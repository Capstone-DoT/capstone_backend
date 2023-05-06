const express = require('express');
const router = express.Router();

const scholarshipController = require('../controllers/scholarshipController');

router.get('/', scholarshipController.getAllScholarships);

module.exports = router;

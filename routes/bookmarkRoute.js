const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middlewares/auth').checkToken;
const bookmarkController = require('../controllers/bookmarkController');

router.post('/', jwtMiddleware, bookmarkController.postBookmark);
router.delete('/', jwtMiddleware, bookmarkController.deleteBookmark);

module.exports = router;

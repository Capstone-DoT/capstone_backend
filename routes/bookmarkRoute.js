const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middlewares/auth').checkToken;
const bookmarkController = require('../controllers/bookmarkController');

router.get('/', jwtMiddleware, bookmarkController.getBookmark);
router.post('/', jwtMiddleware, bookmarkController.postBookmark);
router.delete('/', jwtMiddleware, bookmarkController.deleteBookmark);
router.get('/check', jwtMiddleware, bookmarkController.checkBookmark);

module.exports = router;

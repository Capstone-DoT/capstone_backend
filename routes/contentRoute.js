const express = require('express');
const router = express.Router();

const contentController = require('../controllers/contentController');

const { redisClient } = require('../app');

const checkCache = async function (req, res, next) {
    let data = await redisClient.get(req.url);
    if (data) {
        res.send(JSON.parse(data));
    } else {
        next();
    }
};

router.get('/', checkCache, contentController.getAllContentList);
router.get('/popular', checkCache, contentController.getPopularContentList);

router.get('/scholarship', checkCache, contentController.getContentList);
router.get('/scholarship/:id', contentController.getContentInfo);

router.get('/activity', checkCache, contentController.getContentList);
router.get('/activity/:id', contentController.getContentInfo);

router.get('/contest', checkCache, contentController.getContentList);
router.get('/contest/:id', contentController.getContentInfo);

module.exports = router;

const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const bookmarkService = require('../services/bookmarkService');
const url = require('url');

module.exports = {
    getBookmark: async (req, res) => {
        let type = req.query.type;
        let order = req.query.order;
        let userId = req.id;
        let findResult;

        if (type == undefined) {
            type = 'all';
        }
        if (order == undefined || order == 'new') {
            order = [['createdAt', 'DESC']];
        }

        try {
            findResult = await bookmarkService.findBookmark(
                userId,
                type,
                order
            );
            let AIResult = await bookmarkService.findAIContent(userId, type);
            res.send(response(baseResponse.SUCCESS, { findResult, AIResult }));
        } catch (err) {
            console.log(err);
            res.send(errResponse(baseResponse.SERVER_ERROR));
        }
    },
    postBookmark: async (req, res) => {
        let type = req.body.type;
        let contentId = req.body.contentId;
        let userId = req.id;
        let createResult;
        try {
            createResult = await bookmarkService.createBookmark(
                type,
                contentId,
                userId
            );
            res.send(createResult);
        } catch (err) {
            console.log(err);
            res.send(errResponse(baseResponse.SERVER_ERROR));
        }
    },
    deleteBookmark: async (req, res) => {
        let type = req.body.type;
        let contentId = req.body.contentId;
        let userId = req.id;
        let destroyResult;
        try {
            destroyResult = await bookmarkService.destroyBookmark(
                type,
                contentId,
                userId
            );
            res.send(destroyResult);
        } catch (err) {
            console.log(err);
            res.send(errResponse(baseResponse.SERVER_ERROR));
        }
    },
};

const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const bookmarkService = require('../services/bookmarkService');
const url = require('url');

module.exports = {
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
};

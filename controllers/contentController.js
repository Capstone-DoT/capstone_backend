const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const contentService = require('../services/contentService');
const url = require('url');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { redisClient } = require('../app');

module.exports = {
    getContentList: async (req, res) => {
        let urlStr = req.url;
        let urlObj = url.parse(urlStr, true);
        let type = req.query.type;
        let ordering = urlObj.query.ordering;
        let search = urlObj.query.search;
        let pathname = urlObj.pathname;
        let pageNo = req.query.pageno;

        if ((type == undefined) | (type == 'all')) {
            type = [''];
        }

        if ((ordering == undefined) | (type == 'new')) {
            ordering = [['id', 'DESC']];
        } else if (ordering == 'view_num') {
            ordering = [['view_num', 'DESC']];
        } else {
            ordering = [ordering];
        }

        if ((search == undefined) | (search == 'all')) {
            search = { [Op.not]: null };
        } else {
            search = { [Op.like]: `%${search}%` };
        }

        // let contentType =
        //     pathname.substr(1, 1).toUpperCase() + pathname.substr(2);
        let contentType = pathname.substr(1);

        if (pageNo == undefined) {
            pageNo = 0;
        } else {
            pageNo = parseInt(pageNo);
        }

        let findResponse = await contentService.findContentList(
            contentType,
            type,
            ordering,
            search
        );

        if (pageNo > 0) {
            var totalCount = findResponse.result.length;
            var startItemNo = (pageNo - 1) * 20;
            var endItemNo = pageNo * 20 - 1;
            if (endItemNo > totalCount - 1) {
                endItemNo = totalCount - 1;
            }
            var pageResult = [];
            if (startItemNo < totalCount) {
                for (var index = startItemNo; index <= endItemNo; index++) {
                    pageResult.push(findResponse.result[index]);
                }
            }
            findResponse.result = pageResult;
            if (
                urlStr == '/scholarship?pageno=1' ||
                urlStr == '/activity?pageno=1' ||
                urlStr == '/contest?pageno=1'
            ) {
                await redisClient.setEx(
                    urlStr,
                    1440,
                    JSON.stringify(findResponse)
                );
            }
            res.send(findResponse);
        } else {
            res.send(findResponse);
        }
    },
    getContentInfo: async (req, res) => {
        try {
            let urlStr = req.url;
            let urlObj = url.parse(urlStr, true);

            let contentType = urlObj.pathname.split('/')[1];
            let contentId = req.params.id;

            let findResult = await contentService.findContent(
                contentType,
                contentId
            );

            let AIResult = await contentService.findAIContent(
                contentType,
                contentId
            );

            let updateResult;
            try {
                updateResult = await contentService.updateContentView(
                    contentType,
                    contentId
                );
            } catch (err) {
                console.log(err);
                res.send(updateResult);
            }

            res.send(response(baseResponse.SUCCESS, { findResult, AIResult }));
        } catch (err) {
            console.log(err);
            res.send(errResponse(baseResponse.SERVER_ERROR));
        }
    },
    getAllContentList: async (req, res) => {
        let urlStr = req.url;
        let urlObj = url.parse(urlStr, true);
        let contentType = urlObj.query.type;
        let ordering = urlObj.query.ordering;
        let search = urlObj.query.search;

        if (contentType == 'scholarship') {
            contentType = 'Scholarships';
        } else if (contentType == 'activity') {
            contentType = 'Activities';
        } else if (contentType == 'contest') {
            contentType = 'Contests';
        }

        if ((ordering == undefined) | (ordering == 'new')) {
            ordering = 'createdAt';
        }

        if ((search == undefined) | (search == 'all')) {
            search = '%%';
        } else {
            search = '%' + search + '%';
        }

        if ((contentType == undefined) | (contentType == 'all')) {
            contentType = 'allContentType';
        }
        let findResult = await contentService.findAllContentList(
            contentType,
            ordering,
            search
        );
        if (req.url == '/') {
            await redisClient.setEx(req.url, 1440, JSON.stringify(findResult));
        }
        res.send(findResult);
    },
    getPopularContentList: async (req, res) => {
        try {
            let findResult = await contentService.findPopularContentList();
            await redisClient.setEx(req.url, 1440, JSON.stringify(findResult));
            res.send(findResult);
        } catch (err) {
            console.log(err);
            res.send(errResponse(baseResponse.SERVER_ERROR));
        }
    },
};

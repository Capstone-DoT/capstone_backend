const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const contentService = require('../services/contentService');
const url = require('url');
const sequelize = require('sequelize');
const Op = sequelize.Op;

module.exports = {
    getContentList: async (req, res) => {
        let urlStr = req.url;
        let urlObj = url.parse(urlStr, true);
        let type = req.body.type;
        let ordering = urlObj.query.ordering;
        let search = urlObj.query.search;
        let pathname = urlObj.pathname;

        if ((type == undefined) | (type == 'all')) {
            type = [];
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

        let findResponse = await contentService.findContentList(
            contentType,
            type,
            ordering,
            search
        );
        res.send(findResponse);
    },
    getContentInfo: async (req, res) => {
        try {
            let urlStr = req.url;
            let urlObj = url.parse(urlStr, true);

            let contentType = urlObj.pathname.split('/')[1];
            let contentId = req.params.id;

            let findResponse = await contentService.findContent(
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

            res.send(findResponse);
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
            ordering = 'createdAt DESC';
        } else if (ordering == 'view_num') {
            ordering = 'view_num DESC';
        } else {
            ordering = ordering;
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
        res.send(findResult);
    },
};

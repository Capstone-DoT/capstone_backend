const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const scholarshipService = require('../services/scholarshipService');
const url = require('url');
const sequelize = require('sequelize');
const Op = sequelize.Op;

module.exports = {
    getScholarships: async (req, res) => {
        let urlStr = req.url;
        let urlObj = url.parse(urlStr, true);
        let type = urlObj.query.type;
        let ordering = urlObj.query.ordering;
        let search = urlObj.query.search;

        if ((type == undefined) | (type == 'all')) {
            type = { [Op.not]: null };
        }

        if ((ordering == undefined) | (type == 'id')) {
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

        let findResponse = await scholarshipService.findScholarship(
            type,
            ordering,
            search
        );
        res.send(findResponse);
    },
};

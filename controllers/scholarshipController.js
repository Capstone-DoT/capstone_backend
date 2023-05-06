const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const scholarshipService = require('../services/scholarshipService');
const url = require('url');

module.exports = {
    getScholarships: async (req, res) => {
        let urlStr = req.url;
        let urlObj = url.parse(urlStr, true);
        let type = urlObj.query.type;
        let ordering = urlObj.query.ordering;
        if (type == undefined) {
            type = 'all';
        }
        if (ordering == undefined) {
            ordering = 'new';
        }
        let findResponse = await scholarshipService.findScholarship(
            type,
            ordering
        );
        res.send(findResponse);
    },
};

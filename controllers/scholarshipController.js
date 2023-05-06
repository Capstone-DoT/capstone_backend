const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const scholarshipService = require('../services/scholarshipService');
const url = require('url');

module.exports = {
    getScholarships: async (req, res) => {
        let urlStr = req.url;
        let urlObj = url.parse(urlStr, true);
        let type = urlObj.query.type;
        let findResponse;
        if (type == undefined) {
            findResponse = await scholarshipService.findSCbyType('all');
        } else if (type == 'jang') {
            findResponse = await scholarshipService.findSCbyType('jang');
        } else {
            res.send(
                errResponse({
                    isSuccess: false,
                    code: 404,
                    message: '존재하지 않는 타입입니다',
                })
            );
        }
        res.send(findResponse);
    },
};

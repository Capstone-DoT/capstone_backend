const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const scholarshipService = require('../services/scholarshipService');

module.exports = {
    getAllScholarships: async (req, res) => {
        const findResponse = await scholarshipService.findAllSC();
        res.send(findResponse);
    },
};

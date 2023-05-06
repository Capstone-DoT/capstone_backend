const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const sequelize = require('sequelize');
const models = require('../models');
const Scholarship = models.scholarships;

module.exports = {
    findAllSC: async () => {
        try {
            let dday = sequelize.fn(
                'datediff',
                sequelize.col('end_date'),
                sequelize.fn('NOW')
            );
            let findResult = await Scholarship.findAll({
                attributes: ['title', 'institution', 'type', [dday, 'dday']],
            });
            return response(baseResponse.SUCCESS, findResult);
        } catch (err) {
            console.log(err);
            return errResponse(baseResponse.DB_ERROR);
        }
    },
    findSCbyType: async (type) => {
        try {
            let dday = sequelize.fn(
                'datediff',
                sequelize.col('end_date'),
                sequelize.fn('NOW')
            );
            let findResult = await Scholarship.findAll({
                attributes: ['title', 'institution', 'type', [dday, 'dday']],
                where: {
                    type: type,
                },
            });
            return response(baseResponse.SUCCESS, findResult);
        } catch (err) {
            console.log(err);
            return errResponse(baseResponse.DB_ERROR);
        }
    },
};

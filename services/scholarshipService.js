const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const sequelize = require('sequelize');
const models = require('../models');
const Scholarship = models.scholarships;
const Op = sequelize.Op;

module.exports = {
    findScholarship: async (type, ordering) => {
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
                order: ordering,
            });
            return response(baseResponse.SUCCESS, findResult);
        } catch (err) {
            console.log(err);
            return errResponse(baseResponse.DB_ERROR);
        }
    },
};

const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const sequelize = require('sequelize');
const models = require('../models');
const Scholarship = models.scholarships;

module.exports = {
    findSCbyType: async (type) => {
        try {
            let dday = sequelize.fn(
                'datediff',
                sequelize.col('end_date'),
                sequelize.fn('NOW')
            );
            let findResult;
            if (type == 'all') {
                findResult = await Scholarship.findAll({
                    attributes: [
                        'title',
                        'institution',
                        'type',
                        [dday, 'dday'],
                    ],
                });
            } else {
                findResult = await Scholarship.findAll({
                    attributes: [
                        'title',
                        'institution',
                        'type',
                        [dday, 'dday'],
                    ],
                    where: {
                        type: type,
                    },
                });
            }
            return response(baseResponse.SUCCESS, findResult);
        } catch (err) {
            console.log(err);
            return errResponse(baseResponse.DB_ERROR);
        }
    },
};

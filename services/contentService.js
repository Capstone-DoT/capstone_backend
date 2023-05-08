const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const sequelize = require('sequelize');
const models = require('../models');

const Content = {
    scholarship: models.scholarships,
    activity: models.activities,
    contest: models.contests,
};

const Op = sequelize.Op;

module.exports = {
    findContentList: async (contentType, type, ordering, search) => {
        try {
            let dday = sequelize.fn(
                'datediff',
                sequelize.col('end_date'),
                sequelize.fn('NOW')
            );
            const contentModel = Content[contentType];
            const findResult = await contentModel.findAll({
                attributes: [
                    'title',
                    'institution',
                    'type',
                    [
                        sequelize.fn(
                            'datediff',
                            sequelize.col('end_date'),
                            sequelize.fn('NOW')
                        ),
                        'dday',
                    ],
                ],
                where: {
                    type,
                    title: search,
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

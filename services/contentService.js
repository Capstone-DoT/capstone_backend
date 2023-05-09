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
    findContent: async (contentType, contentId) => {
        try {
            const contentModel = Content[contentType];
            const findResult = await contentModel.findOne({
                where: {
                    id: contentId,
                },
            });
            return response(baseResponse.SUCCESS, findResult);
        } catch (err) {
            console.log(err);
            return errResponse(baseResponse.DB_ERROR);
        }
    },
    updateContentView: async (contentType, contentId) => {
        try {
            const contentModel = Content[contentType];
            const updateResult = await contentModel.update(
                {
                    view_num: sequelize.literal('view_num + 1'),
                },
                {
                    where: {
                        id: contentId,
                    },
                }
            );
            return response(baseResponse.SUCCESS, updateResult);
        } catch (err) {
            console.log(err);
            return errResponse(baseResponse.DB_ERROR);
        }
    },
};

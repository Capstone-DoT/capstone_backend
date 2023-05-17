const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const sequelize = require('sequelize');
const models = require('../models');

const db = new sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USERNAME,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql',
        logging: false,
    }
);

const Content = {
    scholarship: models.scholarships,
    activity: models.activities,
    contest: models.contests,
};

const Op = sequelize.Op;

module.exports = {
    findContentList: async (contentType, type, ordering, search) => {
        try {
            const contentModel = Content[contentType];
            let findResult;
            if (contentType == 'scholarship') {
                findResult = await contentModel.findAll({
                    attributes: [
                        'title',
                        'institution',
                        'type',
                        [
                            sequelize.literal(`DATEDIFF(
        STR_TO_DATE(SUBSTRING_INDEX(SUBSTRING_INDEX(period, '~', -1), '(', 1), '%Y. %m. %d.'),
        CURDATE()
      )`),
                            'dday',
                        ],
                    ],
                    where: {
                        type,
                        title: search,
                    },
                    order: ordering,
                });
            } else {
                findResult = await contentModel.findAll({
                    attributes: [
                        'title',
                        'institution',
                        'type',
                        [
                            sequelize.literal(
                                `DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(period, ' ~ ', -1), '%y.%m.%d'), CURDATE()) + 1`
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
            }
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

    findAllContentList: async (contentType, ordering, search) => {
        try {
            let queryString = ``;
            if (contentType == 'allContentType') {
                queryString = `SELECT title, institution, type, DATEDIFF(CURRENT_DATE(), end_date) as dday, view_num, createdAt FROM Scholarships
            WHERE title LIKE '${search}'
            UNION
            SELECT title, institution, type, DATEDIFF(CURRENT_DATE(), end_date) as dday, view_num, createdAt from Activities
            WHERE title LIKE '${search}'
            UNION
            SELECT title, institution, type, DATEDIFF(CURRENT_DATE(), end_date) as dday, view_num, createdAt from Contests
            WHERE title LIKE '${search}'
            ORDER BY ${ordering}`;
            } else {
                queryString = `SELECT title, institution, type, DATEDIFF(CURRENT_DATE(), end_date) as dday, view_num, createdAt FROM ${contentType}
            WHERE title LIKE '${search}'
            ORDER BY ${ordering}`;
            }
            const findResult = await db.query(queryString, {
                type: sequelize.QueryTypes.SELECT,
            });
            return response(baseResponse.SUCCESS, findResult);
        } catch (err) {
            console.log(err);
            return errResponse(baseResponse.DB_ERROR);
        }
    },
};

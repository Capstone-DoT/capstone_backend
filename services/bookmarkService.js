const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const sequelize = require('sequelize');
const models = require('../models');
const { resource } = require('../app');
const Bookmark = models.bookmarks;

const Content = {
    scholarship: models.scholarships,
    activity: models.activities,
    contest: models.contests,
};

module.exports = {
    findBookmark: async (userId, contentType, order) => {
        try {
            let findBookmarkResult;
            if (contentType == 'all') {
                findBookmarkResult = await Bookmark.findAll({
                    attributes: ['type', 'contentId', 'createdAt'],
                    where: {
                        userId,
                    },
                    order: [['createdAt', 'DESC']],
                });
            } else {
                findBookmarkResult = await Bookmark.findAll({
                    attributes: ['type', 'contentId', 'createdAt'],
                    where: {
                        userId,
                        type: contentType,
                    },
                    order: order,
                });
            }
            console.log(findBookmarkResult);
            let result = [];
            for (const data of findBookmarkResult) {
                let contentId = data.dataValues.contentId;
                let contentType = data.dataValues.type;
                let findContentResult = await Content[contentType].findOne({
                    attributes: [
                        'title',
                        'institution',
                        'type',
                        'view_num',
                        'createdAt',
                        [
                            sequelize.literal(
                                '(SELECT DATEDIFF(end_date,NOW()))'
                            ),
                            'dday',
                        ],
                    ],
                    where: {
                        id: contentId,
                    },
                });
                result.push(findContentResult);
            }

            const sortFunctions = {
                view_num: (a, b) => b.view_num - a.view_num,
                dday: (a, b) => a.dday - b.dday,
                createdAt: (a, b) => b.createdAt - a.createdAt,
            };

            const sortedResult = result.sort(sortFunctions[order]);
            return response(baseResponse.SUCCESS, sortedResult);
        } catch (error) {
            console.log(error);
            return errResponse(baseResponse.DB_ERROR);
        }
    },
    createBookmark: async (type, contentId, userId) => {
        try {
            await Bookmark.create({
                type: type,
                contentId: contentId,
                userId: userId,
            });
            return response(baseResponse.SUCCESS);
        } catch (err) {
            console.log(err);
            if (err.name == 'SequelizeUniqueConstraintError') {
                return errResponse(baseResponse.BOOKMARK_REDUNDANT);
            }
            return errResponse(baseResponse.DB_ERROR);
        }
    },
    destroyBookmark: async (type, contentId, userId) => {
        try {
            await Bookmark.destroy({
                where: {
                    type: type,
                    contentId: contentId,
                    userId: userId,
                },
            });
            return response(baseResponse.SUCCESS);
        } catch (err) {
            console.log(err);
            return errResponse(baseResponse.DB_ERROR);
        }
    },
};

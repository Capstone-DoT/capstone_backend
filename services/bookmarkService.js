const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const sequelize = require('sequelize');
const models = require('../models');
const { resource } = require('../app');
const Bookmark = models.bookmarks;

module.exports = {
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

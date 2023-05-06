const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const sequelize = require('sequelize');
const models = require('../models');
const User = models.users;

module.exports = {
    createUser: async (id, hashedPassword, salt) => {
        try {
            await User.create({
                id: id,
                password: hashedPassword,
                salt: salt,
            });
            return response(baseResponse.SUCCESS);
        } catch (err) {
            return errResponse(baseResponse.DB_ERROR);
        }
    },
    findUserById: async function (id) {
        try {
            const userResult = await User.findOne({
                where: { id: id },
            });
            return userResult;
        } catch {
            return errResponse(baseResponse.DB_ERROR);
        }
    },
};

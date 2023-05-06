const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const { sequelize } = require('../models/index');
const userService = require('../services/userService');
let crypto = require('crypto');
let spawn = require('child_process').spawn;

const createSalt = async function () {
    const buf = crypto.randomBytes(64);
    return buf.toString('base64');
};

const createHashedPassword = async function (password) {
    const salt = await createSalt();
    const key = crypto.pbkdf2Sync(password, salt, 104906, 64, 'sha512');
    const hashedPassword = key.toString('base64');
    return { hashedPassword, salt };
};

module.exports = {
    signUp: async function (req, res) {
        let id = req.body.id;
        let userResult;
        try {
            userResult = await userService.findUserById(id);
        } catch (err) {
            console.log(err);
            res.send(errResponse(baseResponse.SERVER_ERROR));
        }
        if (userResult != null) {
            res.send(
                errResponse({
                    isSuccess: false,
                    code: 200,
                    message: '이미 존재하는 아이디입니다',
                })
            );
        } else {
            try {
                let hashedResult = await createHashedPassword(
                    req.body.password
                );
                let hashedPassword = hashedResult.hashedPassword;
                let salt = hashedResult.salt;
                await userService.createUser(id, hashedPassword, salt);
                res.send(response(baseResponse.SUCCESS));
            } catch (err) {
                console.log(err);
                res.send(errResponse(baseResponse.SERVER_ERROR));
            }
        }
    },
};

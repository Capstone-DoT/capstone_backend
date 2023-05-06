const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const { sequelize } = require('../models/index');
const userService = require('../services/userService');
let crypto = require('crypto');
let spawn = require('child_process').spawn;
const jwt = require('../modules/jwt');

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

const verifyPassword = async function (password, salt, hashedPassword) {
    const key = crypto.pbkdf2Sync(password, salt, 104906, 64, 'sha512');
    const hPassword = key.toString('base64');
    console.log(hPassword);
    if (hPassword == hashedPassword) return true;
    return false;
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
    signIn: async (req, res) => {
        let id = req.body.id;
        let password = req.body.password;
        try {
            const findUserResult = await userService.findUserById(id);
            let hashedPassword = findUserResult.password;
            let salt = findUserResult.salt;

            const verified = await verifyPassword(
                password,
                salt,
                hashedPassword
            );

            if (verified) {
                const jwtToken = await jwt.sign(findUserResult);
                return res.send(
                    response(baseResponse.SUCCESS, { token: jwtToken.token })
                );
            } else {
                res.send(errResponse(baseResponse.SIGNIN_WRONG));
            }
        } catch (err) {
            console.log(err);
            res.send(errResponse(baseResponse.SERVER_ERROR));
        }
    },
    getPayload: async (req, res) => {
        res.send(
            response(baseResponse.TOKEN_VERIFICATION_SUCCESS, { id: req.id })
        );
    },
};

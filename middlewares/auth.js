const jwt = require('../modules/jwt');
const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');

const jwtMiddleware = {
    checkToken: async (req, res, next) => {
        var token = req.headers.token;
        if (!token) return res.send(errResponse(baseResponse.TOKEN_EMPTY));
        const user = await jwt.verify(token);
        if (user === -1)
            return res.send(
                errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE)
            );
        if (user.id === undefined)
            return res.send(
                errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE)
            );
        req.id = user.id;
        next();
    },
};

module.exports = jwtMiddleware;

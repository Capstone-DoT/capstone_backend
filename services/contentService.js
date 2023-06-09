const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const sequelize = require('sequelize');
const models = require('../models');
const spawn = require('child_process').spawn;
const path = require('path');

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
            const conditions = type.map((value) => ({
                type: {
                    [Op.substring]: value,
                },
            }));
            if (contentType == 'scholarship') {
                findResult = await contentModel.findAll({
                    attributes: [
                        'id',
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
                        [Op.or]: conditions,
                        title: search,
                    },
                    order: [
                        [
                            sequelize.literal(
                                `CASE WHEN dday >= 0 THEN 1 ELSE 2 END`
                            ),
                        ],
                        ordering,
                    ],
                });
            } else {
                findResult = await contentModel.findAll({
                    attributes: [
                        'id',
                        'title',
                        'institution',
                        'type',
                        [
                            sequelize.literal(
                                `DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(period, ' ~ ', -1), '%y.%m.%d'), CURDATE())`
                            ),
                            'dday',
                        ],
                    ],
                    where: {
                        [Op.or]: conditions,
                        title: search,
                    },
                    order: [
                        sequelize.literal(
                            `CASE WHEN dday >= 0 THEN 1 ELSE 2 END`
                        ),
                        ordering,
                    ],
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
            return findResult;
        } catch (err) {
            console.log(err);
            return errResponse(baseResponse.DB_ERROR);
        }
    },
    findAIContent: async (contentType, contentId) => {
        try {
            const venvDir = './ai/venv/capstone';
            const activateScript = path.join(venvDir, 'bin', 'activate');
            const pythonCommand = path.join(venvDir, 'bin', 'python');
            const pythonScript = './ai/recommender.py';
            let pythonArgs = [`./ai/item2vec_${contentType}`, contentId, 3];

            let idList = [];

            let AI = false;

            const executePythonProcess = async (args) => {
                return new Promise((resolve, reject) => {
                    const activateProcess = spawn(
                        `. ${activateScript} && ${pythonCommand}`,
                        [pythonScript, ...args],
                        { shell: true }
                    );

                    let processOutput = '';

                    activateProcess.stdout.on('data', (data) => {
                        processOutput += data.toString();
                    });

                    activateProcess.stderr.on('data', (data) => {
                        console.error(data.toString());
                    });

                    activateProcess.on('close', (code) => {
                        if (code === 0) {
                            resolve(processOutput);
                        } else {
                            reject(
                                new Error(`Process exited with code ${code}`)
                            );
                        }
                    });
                });
            };

            try {
                // 첫 번째 시도: 원래 파이썬 코드 실행
                const output = await executePythonProcess(pythonArgs);
                idList = JSON.parse(output.replace(/'/g, '"'));
                AI = true;
            } catch (err) {
                console.log(err);
                try {
                    // 두 번째 시도: 오류 발생 시 파이썬 코드 실행 (에러 처리용)
                    pythonArgs = [
                        `./ai/item2vec_${contentType}_err`,
                        contentId,
                        3,
                    ];
                    const output = await executePythonProcess(pythonArgs);
                    idList = JSON.parse(output.replace(/'/g, '"'));
                } catch (err) {
                    console.log(err);
                    return [];
                }
            }

            // 파이썬 코드 실행 결과를 바탕으로 정보 조회
            let findResult;
            const contentModel = Content[contentType];
            const dateExpression =
                contentType === 'scholarship'
                    ? `STR_TO_DATE(SUBSTRING_INDEX(SUBSTRING_INDEX(period, '~', -1), '(', 1), '%Y. %m. %d.')`
                    : `STR_TO_DATE(SUBSTRING_INDEX(period, ' ~ ', -1), '%y.%m.%d')`;
            findResult = await contentModel.findAll({
                attributes: [
                    'id',
                    'title',
                    'institution',
                    'type',
                    [
                        sequelize.literal(
                            `DATEDIFF(${dateExpression}, CURDATE())`
                        ),
                        'dday',
                    ],
                ],
                where: {
                    id: {
                        [Op.in]: idList,
                    },
                },
            });

            return { findResult, AI };
        } catch (err) {
            console.log(err);
            res.send(errResponse(baseResponse.SERVER_ERROR));
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
            let orderByClause = ``;

            if (ordering === 'dday') {
                orderByClause = `
                ORDER BY CASE WHEN dday >= 0 THEN 0 ELSE 1 END, ABS(dday)
            `;
            } else {
                orderByClause = `
                ORDER BY CASE WHEN dday >= 0 THEN ${ordering} END DESC, 
                CASE WHEN dday < 0 THEN ${ordering} END DESC
            `;
            }

            if (contentType === 'allContentType') {
                queryString = `
                SELECT 'scholarship' AS contentType, id, title, institution, type, 
                       (DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(SUBSTRING_INDEX(period, '~', -1), '(', 1), '%Y. %m. %d.'),CURDATE())) as dday,
                       view_num, createdAt
                FROM Scholarships
                WHERE title LIKE '%${search}%'
                UNION
                SELECT 'activity' AS contentType, id, title, institution, type, 
                       (DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(period, ' ~ ', -1), '%y.%m.%d'), CURDATE())) as dday,
                       view_num, createdAt
                FROM Activities
                WHERE title LIKE '%${search}%'
                UNION
                SELECT 'contest' AS contentType, id, title, institution, type, 
                       (DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(period, ' ~ ', -1), '%y.%m.%d'), CURDATE())) as dday,
                       view_num, createdAt
                FROM Contests
                WHERE title LIKE '%${search}%'
                ${orderByClause}
            `;
            } else {
                queryString = `
                SELECT id, title, institution, type, 
                       (DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(SUBSTRING_INDEX(period, '~', -1), '(', 1), '%Y. %m. %d.'), CURDATE())) as dday,
                       view_num, createdAt
                FROM ${contentType}
                WHERE title LIKE '%${search}%'
                ${orderByClause}
            `;
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
    findPopularContentList: async () => {
        try {
            let queryString = `SELECT 'scholarship' AS contentType, id, title, institution, type, (DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(SUBSTRING_INDEX(period, '~', -1), '(', 1), '%Y. %m. %d.'),CURDATE())) as dday, view_num, createdAt FROM Scholarships
        UNION
        SELECT 'activity' AS contentType, id, title, institution, type, (DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(period, ' ~ ', -1), '%y.%m.%d'), CURDATE())) as dday, view_num, createdAt from Activities
        UNION
        SELECT 'contest' AS contentType, id, title, institution, type, (DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(period, ' ~ ', -1), '%y.%m.%d'), CURDATE())) as dday, view_num, createdAt from Contests 
        ORDER BY CASE WHEN dday >= 0 THEN 0 ELSE 1 END, ABS(dday), view_num DESC LIMIT 50`;
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

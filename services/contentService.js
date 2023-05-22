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
                                `DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(period, ' ~ ', -1), '%y.%m.%d'), CURDATE()) + 1`
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
                    ],
                    ordering,
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
            // 파이썬 코드 실행
            const venvDir = './ai/venv/capstone';

            const activateScript = path.join(venvDir, 'bin', 'activate');
            const pythonCommand = path.join(venvDir, 'bin', 'python');
            const pythonScript = './ai/recommender.py';
            const pythonArgs = [`./ai/item2vec_${contentType}`, contentId, 5];

            const activateProcess = spawn(
                `. ${activateScript} && ${pythonCommand}`,
                [pythonScript, ...pythonArgs],
                { shell: true }
            );

            // 파이썬 코드 실행 결과
            let idList = [];
            activateProcess.stdout.on('data', async (data) => {
                idList = JSON.parse(data.toString().replace(/'/g, '"'));
            });

            activateProcess.stderr.on('data', (data) => {
                console.error(data.toString());
            });

            await new Promise((resolve, reject) => {
                activateProcess.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`Process exited with code ${code}`));
                    }
                });
            });

            // 파이썬 코드 실행 결과 바탕으로 정보 조회
            let findResult;
            const contentModel = Content[contentType];
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
                        id: {
                            [Op.in]: idList,
                        },
                    },
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
                                `DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(period, ' ~ ', -1), '%y.%m.%d'), CURDATE()) + 1`
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
            }
            return findResult;
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
            if (contentType === 'allContentType') {
                queryString = `SELECT 'scholarship' AS contentType, id, title, institution, type, (DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(SUBSTRING_INDEX(period, '~', -1), '(', 1), '%Y. %m. %d.'),CURDATE())) as dday, view_num, createdAt FROM Scholarships WHERE title LIKE '%${search}%'
        UNION
        SELECT 'activity' AS contentType, id, title, institution, type, (DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(period, ' ~ ', -1), '%y.%m.%d'), CURDATE()) + 1) as dday, view_num, createdAt from Activities WHERE title LIKE '%${search}%'
        UNION
        SELECT 'contest' AS contentType, id, title, institution, type, (DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(period, ' ~ ', -1), '%y.%m.%d'), CURDATE()) + 1) as dday, view_num, createdAt from Contests WHERE title LIKE '%${search}%'
        ORDER BY CASE WHEN dday >= 0 THEN 0 ELSE 1 END, ABS(dday), ${ordering}`;
            } else if (contentType === 'Scholarships') {
                queryString = `SELECT id, title, institution, type, (DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(SUBSTRING_INDEX(period, '~', -1), '(', 1), '%Y. %m. %d.'),CURDATE())) as dday, view_num, createdAt FROM Scholarships WHERE title LIKE '%${search}%'
                ORDER BY CASE WHEN dday >= 0 THEN 0 ELSE 1 END, ABS(dday), ${ordering}`;
            } else {
                queryString = `SELECT id, title, institution, type, (DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(period, ' ~ ', -1), '%y.%m.%d'), CURDATE()) + 1) as dday, view_num, createdAt FROM ${contentType} WHERE title LIKE '%${search}%'
                ORDER BY CASE WHEN dday >= 0 THEN 0 ELSE 1 END, ABS(dday), ${ordering}`;
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
            let queryString = `SELECT 'scholarship' AS contentType, title, institution, type, (DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(SUBSTRING_INDEX(period, '~', -1), '(', 1), '%Y. %m. %d.'),CURDATE())) as dday, view_num, createdAt FROM Scholarships
        UNION
        SELECT 'activity' AS contentType, title, institution, type, (DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(period, ' ~ ', -1), '%y.%m.%d'), CURDATE()) + 1) as dday, view_num, createdAt from Activities
        UNION
        SELECT 'contest' AS contentType, title, institution, type, (DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(period, ' ~ ', -1), '%y.%m.%d'), CURDATE()) + 1) as dday, view_num, createdAt from Contests 
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

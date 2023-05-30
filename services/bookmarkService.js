const baseResponse = require('../config/baseResponseStatus');
const { response, errResponse } = require('../config/response');
const sequelize = require('sequelize');
const models = require('../models');
const { resource } = require('../app');
const Bookmark = models.bookmarks;
const spawn = require('child_process').spawn;
const path = require('path');
const Op = sequelize.Op;

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
                    attributes: ['contentType', 'contentId', 'createdAt'],
                    where: {
                        userId,
                    },
                    order: [['createdAt', 'DESC']],
                });
            } else {
                findBookmarkResult = await Bookmark.findAll({
                    attributes: ['contentType', 'contentId', 'createdAt'],
                    where: {
                        userId,
                        contentType,
                    },
                    order: [['createdAt', 'DESC']],
                });
            }
            let result = [];
            for (const data of findBookmarkResult) {
                let contentId = data.dataValues.contentId;
                let contentType = data.dataValues.contentType;
                let findContentResult;
                if (contentType == 'scholarship') {
                    findContentResult = await Content[contentType].findOne({
                        attributes: [
                            'id',
                            'title',
                            'institution',
                            'type',
                            'view_num',
                            'createdAt',
                            [
                                sequelize.literal(`DATEDIFF(
        STR_TO_DATE(SUBSTRING_INDEX(SUBSTRING_INDEX(period, '~', -1), '(', 1), '%Y. %m. %d.'),
        CURDATE()
      )`),
                                'dday',
                            ],
                        ],
                        where: {
                            id: contentId,
                        },
                    });
                } else {
                    findContentResult = await Content[contentType].findOne({
                        attributes: [
                            'id',
                            'title',
                            'institution',
                            'type',
                            'view_num',
                            'createdAt',
                            [
                                sequelize.literal(
                                    `DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(period, ' ~ ', -1), '%y.%m.%d'), CURDATE())`
                                ),
                                'dday',
                            ],
                        ],
                        where: {
                            id: contentId,
                        },
                    });
                }
                findContentResult = findContentResult.toJSON();
                findContentResult.contentType = contentType;
                result.push(findContentResult);
            }
            const sortFunctions = {
                view_num: (a, b) => b.view_num - a.view_num,
                dday: (a, b) => a.dday - b.dday,
                createdAt: (a, b) => b.createdAt - a.createdAt,
            };

            if (
                order == 'view_num' ||
                order == 'dday' ||
                order == 'createdAt'
            ) {
                const sortedResult = result.sort(sortFunctions[order]);
                result = sortedResult;
            }
            return result;
        } catch (error) {
            console.log(error);
            return errResponse(baseResponse.DB_ERROR);
        }
    },
    findAIContent: async (userId, contentType) => {
        try {
            // 북마크 목록 조회하기
            const findResult = {
                scholarship: [],
                activity: [],
                contest: [],
            };

            const findBookmarkResult = await Bookmark.findAll({
                attributes: ['contentType', 'contentId'],
                where: {
                    userId,
                    ...(contentType !== 'all' && { contentType }),
                },
            });

            // 조회 결과 분류하기
            const bookmarkList = {
                activity: '',
                contest: '',
                scholarship: '',
            };

            for (const data of findBookmarkResult) {
                const contentType = data.dataValues.contentType;
                const contentId = data.dataValues.contentId;

                if (contentType === 'scholarship') {
                    bookmarkList.scholarship = bookmarkList.scholarship
                        ? `${bookmarkList.scholarship},${contentId}`
                        : contentId;
                } else if (contentType === 'contest') {
                    bookmarkList.contest = bookmarkList.contest
                        ? `${bookmarkList.contest},${contentId}`
                        : contentId;
                } else {
                    bookmarkList.activity = bookmarkList.activity
                        ? `${bookmarkList.activity},${contentId}`
                        : contentId;
                }
            }

            const venvDir = './ai/venv/capstone';
            const activateScript = path.join(venvDir, 'bin', 'activate');
            const pythonCommand = path.join(venvDir, 'bin', 'python');
            const pythonScript = './ai/recommender.py';

            for (const contentType of ['scholarship', 'contest', 'activity']) {
                if (!bookmarkList[contentType]) {
                    continue;
                }

                let idList;

                try {
                    const pythonArgs = [
                        `./ai/item2vec_${contentType}`,
                        bookmarkList[contentType],
                        3,
                    ];

                    const activateProcess = spawn(
                        `. ${activateScript} && ${pythonCommand}`,
                        [pythonScript, ...pythonArgs],
                        { shell: true }
                    );

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
                                reject(
                                    new Error(
                                        `Process exited with code ${code}`
                                    )
                                );
                            }
                        });
                    });
                } catch (err) {
                    console.log(err);

                    try {
                        const pythonArgs = [
                            `./ai/item2vec_${contentType}_err`,
                            bookmarkList[contentType],
                            3,
                        ];

                        const activateProcess = spawn(
                            `. ${activateScript} && ${pythonCommand}`,
                            [pythonScript, ...pythonArgs],
                            { shell: true }
                        );

                        activateProcess.stdout.on('data', async (data) => {
                            idList = JSON.parse(
                                data.toString().replace(/'/g, '"')
                            );
                        });

                        activateProcess.stderr.on('data', (data) => {
                            console.error(data.toString());
                        });

                        await new Promise((resolve, reject) => {
                            activateProcess.on('close', (code) => {
                                if (code === 0) {
                                    resolve();
                                } else {
                                    reject(
                                        new Error(
                                            `Process exited with code ${code}`
                                        )
                                    );
                                }
                            });
                        });
                    } catch (err) {
                        console.log(err);
                        idList = [];
                    }
                }

                const contentModel = Content[contentType];
                let findResultList = [];

                const commonAttributes = [
                    'id',
                    'title',
                    'institution',
                    'type',
                    [
                        sequelize.literal(
                            contentType === 'scholarship'
                                ? `DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(SUBSTRING_INDEX(period, '~', -1), '(', 1), '%Y. %m. %d.'), CURDATE())`
                                : `DATEDIFF(STR_TO_DATE(SUBSTRING_INDEX(period, ' ~ ', -1), '%y.%m.%d'), CURDATE())`
                        ),
                        'dday',
                    ],
                ];

                findResultList = await contentModel.findAll({
                    attributes: commonAttributes,
                    where: {
                        id: {
                            [Op.in]: idList,
                        },
                    },
                });

                findResult[contentType] = findResultList;
            }

            return findResult;
        } catch (err) {
            console.log(err);
            res.send(errResponse(baseResponse.SERVER_ERROR));
        }
    },

    createBookmark: async (type, contentId, userId) => {
        try {
            await Bookmark.create({
                contentType: type,
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
                    contentType: type,
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
    findBookmarkById: async (userId, contentType, contentId) => {
        try {
            let findResult = await Bookmark.findOne({
                where: {
                    userId,
                    contentType,
                    contentId,
                },
            });
            if (findResult == null) {
                return { isExist: false };
            } else {
                return { isExist: true };
            }
        } catch (err) {
            console.log(err);
            return errResponse(baseResponse.DB_ERROR);
        }
    },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Bookmarks', {
            type: {
                type: Sequelize.STRING(20),
                allowNull: false,
                primaryKey: true,
            },
            contentId: {
                type: Sequelize.INTEGER(10),
                allowNull: false,
                primaryKey: true,
            },
            userId: {
                type: Sequelize.STRING(20),
                allowNull: false,
                primaryKey: true,
            },
            createdAt: {
                type: Sequelize.DATE,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Bookmarks');
    },
};

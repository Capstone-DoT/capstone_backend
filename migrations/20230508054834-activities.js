'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.createTable('Activities', {
            id: {
                type: Sequelize.INTEGER(10),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: Sequelize.STRING(256),
                allowNull: false,
            },
            institution: Sequelize.STRING(256),
            corporation_type: Sequelize.STRING(256),
            person_num: Sequelize.STRING(256),
            competence: Sequelize.STRING(256),
            type: Sequelize.STRING(256),
            field: Sequelize.STRING(256),
            area: Sequelize.STRING(256),
            target: Sequelize.STRING(256),
            start_date: Sequelize.DATEONLY,
            end_date: Sequelize.DATEONLY,
            view_num: {
                type: Sequelize.INTEGER(10),
                defaultValue: 0,
            },
            createdAt: {
                type: Sequelize.DATE,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Activities');
    },
};

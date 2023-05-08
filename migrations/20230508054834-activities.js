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
            corporation: Sequelize.STRING(256),
            corporation_type: Sequelize.STRING(256),
            person_num: Sequelize.STRING(256),
            competence: Sequelize.STRING(256),
            interest: Sequelize.STRING(256),
            field: Sequelize.STRING(256),
            area: Sequelize.STRING(256),
            target: Sequelize.STRING(256),
            start_date: Sequelize.DATEONLY,
            end_date: Sequelize.DATEONLY,
            view_num: Sequelize.INTEGER(10),
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Activities');
    },
};
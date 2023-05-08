'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.createTable('Contests', {
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
            prize: Sequelize.STRING(256),
            field: Sequelize.STRING(256),
            target: Sequelize.STRING(256),
            start_date: Sequelize.DATEONLY,
            end_date: Sequelize.DATEONLY,
            benefit: Sequelize.STRING(256),
            view_num: Sequelize.INTEGER(10),
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Contests');
    },
};

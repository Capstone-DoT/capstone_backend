module.exports = (sequelize, DataTypes) => {
    const Activity = sequelize.define(
        'Activity',
        {
            id: {
                type: DataTypes.INTEGER(10),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING(256),
                allowNull: false,
            },
            institution: DataTypes.STRING(256),
            corporation_type: DataTypes.STRING(256),
            person_num: DataTypes.STRING(256),
            competence: DataTypes.STRING(256),
            type: DataTypes.STRING(256),
            field: DataTypes.STRING(256),
            area: DataTypes.STRING(256),
            target: DataTypes.STRING(256),
            start_date: DataTypes.DATEONLY,
            end_date: DataTypes.DATEONLY,
            view_num: {
                type: DataTypes.INTEGER(10),
                defaultValue: 0,
            },
        },
        {
            updatedAt: false,
        }
    );
    return Activity;
};

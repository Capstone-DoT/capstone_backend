module.exports = (sequelize, DataTypes) => {
    const Activity = sequelize.define(
        'Activity',
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            institution: DataTypes.STRING(100),
            person_num: DataTypes.STRING(100),
            prefer: DataTypes.STRING(200),
            type: DataTypes.STRING(100),
            field: DataTypes.STRING(100),
            target: DataTypes.STRING(100),
            period: DataTypes.STRING(100),
            activity_period: DataTypes.STRING(100),
            benefit: DataTypes.STRING(100),
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

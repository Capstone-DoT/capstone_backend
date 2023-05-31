module.exports = (sequelize, DataTypes) => {
    const Scholarship = sequelize.define(
        'Scholarship',
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            institution: DataTypes.STRING(100),
            type: DataTypes.STRING(100),
            person_num: DataTypes.STRING(100),
            benefit: DataTypes.STRING(100),
            target: DataTypes.STRING(100),
            period: DataTypes.STRING(256),
            memo: DataTypes.TEXT(),
            view_num: {
                type: DataTypes.INTEGER(10),
                defaultValue: 0,
            },
            ben: DataTypes.STRING(1000),
            app: DataTypes.STRING(1000),
            req: DataTypes.STRING(1000),
        },
        {
            updatedAt: false,
        }
    );
    return Scholarship;
};

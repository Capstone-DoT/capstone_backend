module.exports = (sequelize, DataTypes) => {
    const Contest = sequelize.define(
        'Contest',
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
            corporation_type: DataTypes.STRING(100),
            prize: DataTypes.STRING(100),
            type: DataTypes.STRING(100),
            target: DataTypes.STRING(100),
            period: DataTypes.STRING(100),
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
    return Contest;
};

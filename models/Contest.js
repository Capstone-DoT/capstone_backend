module.exports = (sequelize, DataTypes) => {
    const Contest = sequelize.define(
        'Contest',
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
            corporation: DataTypes.STRING(256),
            corporation_type: DataTypes.STRING(256),
            prize: DataTypes.STRING(256),
            field: DataTypes.STRING(256),
            target: DataTypes.STRING(256),
            start_date: DataTypes.DATEONLY,
            end_date: DataTypes.DATEONLY,
            benefit: DataTypes.STRING(256),
            view_num: DataTypes.INTEGER(10),
        },
        {
            timestamps: false,
        }
    );
    return Contest;
};

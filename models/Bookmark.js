module.exports = (sequelize, DataTypes) => {
    const Bookmark = sequelize.define(
        'Bookmark',
        {
            contentType: {
                type: DataTypes.STRING(20),
                allowNull: false,
                primaryKey: true,
            },
            contentId: {
                type: DataTypes.INTEGER(10),
                allowNull: false,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.STRING(20),
                allowNull: false,
                primaryKey: true,
            },
        },
        {
            updatedAt: false,
        }
    );
    return Bookmark;
};

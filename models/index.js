const { Sequelize, DataTypes } = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];

const db = {};

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
);

db.Sequelize = Sequelize;
db.sequelize = sequelize;

sequelize
    .sync({ force: false })
    .then(() => {
        console.log('Database connected');
    })
    .catch((err) => {
        console.error(err);
    });

db.scholarships = require('./Scholarship.js')(sequelize, DataTypes);
db.activities = require('./Activity.js')(sequelize, DataTypes);
db.contests = require('./Contest.js')(sequelize, DataTypes);
db.users = require('./User.js')(sequelize, DataTypes);
db.bookmarks = require('./Bookmark.js')(sequelize, DataTypes);

module.exports = db;

const db = {};

db.user = require('./user');
db.role = require('./role');
db.products = require('./products');
db.order = require('./order');
db.profit = require('./profit');
module.exports = db;
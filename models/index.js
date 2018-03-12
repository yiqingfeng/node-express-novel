const _ = require('lodash');
const mysql = require('mysql');
const config = require('../config/settings.json').mysql;

const pool = mysql.createPool(_.clone({}, config));


var express = require('express');
var app = express();
const cors = require("cors");
var bodyparser = require('body-parser');
const { unique_string } = require('./unique_string');

require('dotenv').config();
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());
  
// var connection = require('./Connect/Dbconnection');
const logger = require('./route/logs');
app.use(logger);
var login = require('./route/rLogin');
var user = require('./route/rUser');
var table = require('./route/table/rTable');
// var field = require('./route/table/rField');
var tk = require('./route/token');
var tables = require('./route/tables');
var table = require('./route/table');
app.get('/api/get/the/god/damn/api/key/with/ridiculous/long/url/string', (req, res) => {
  res.send({ unique_string })
})

//Middleware
const Auth = require('./Middleware/Auth');
app.use(cors());
//Token
app.use('/token',tk);
//Middleware
// app.use(Auth.isAuth);
//Login
app.use(`/${ unique_string }`,login);
//Middleware
// app.use(Auth.verifyToken);
//User
app.use(`/api/${ unique_string }/user`,user);
//Table
// app.use('/api/table',table);
//Field
// app.use('/api/field',field);
// app.use('/api/field',fields.router);

app.use(`/api/${ unique_string }/tables`, tables.router)
app.use(`/api/${ unique_string }/table`, table.router)
// const mysql = require('mysql2');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

var server = app.listen(process.env.PORT || 3000, function() {
  console.log('Server listening on port ' + server.address().port);
  });


module.exports = app;
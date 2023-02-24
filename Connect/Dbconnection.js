var mysql = require('mysql');
var connection=mysql.createConnection({ 
  host:'localhost',
  user:'nhan',
  password:'root',
  database:'dipe'
});
connection.connect(function(err) {
    if (err) {
      console.log('Not connect.');
    }else{
       console.log('Connected to the MySQL server.');
    }
  });
  
module.exports = connection; 
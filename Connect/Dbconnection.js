var mysql = require('mysql');
var connection=mysql.createConnection({ 
  host:process.env.DB_HOST,
  user:process.env.DB_USER,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_NAME
});
connection.connect(function(err) {
    if (err) {
      console.log('Not connect.');
    }else{
      console.log('Port sử  dụng là ' + process.env.DB_HOST)
       console.log('Connected to the MySQL server.');
    }
  });
  
module.exports = connection; 
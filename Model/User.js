var db = require('../Connect/Dbconnection');



var Login ={

    // user_login:function({account_string,pwd_string},callback){
    //     const isPasswordValid = bcrypt.compare(pwd_string, existingUser[0].pwd_string);
    //     return db.query(`
    //         CALL user_login('${ account_string }', '${ isPasswordValid }')
    //     `,callback);
    // },

    getAllUser:function(callback){
		return db.query("Select * from accounts",callback);
	},

    getUserById:function(credential_string,callback){
		return db.query("select * from accounts where credential_string=?",[credential_string],callback);
	},

    // addUser:function({account_string, pwd_string},callback){
    //  const role = "admin";
  
    //  const passwordHash = bcrypt.hashSync(pwd_string, 10);
	// 	return db.query(`
    //         CALL account_add('${ account_string }', '${ passwordHash }', '${ role }')
    //     `,callback);
	// },

    activeUser:function({credential_string, account_status}, callback){
        return db.query(`
            CALL user_activation('${ credential_string }', '${ account_status }')
        `,callback);
    },

    user_change_password:function({credential_string, pwd_string},callback){
        return db.query (`
        CALL user_change_password('${ credential_string }', '${pwd_string }');
        `,callback);
    },
    
    user_change_info:function({credential_string,fullname,email,phone,address},callback){
        return db.query (`
        CALL user_change_info('${ credential_string}' ,'${fullname}','${email}','${phone}','${address }');
        `,callback);
    }




};

 module.exports=Login;
 
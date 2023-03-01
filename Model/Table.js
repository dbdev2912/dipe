
var db = require('../Connect/Dbconnection');
var a = require('../Config/Alias');
const Crypto = require('crypto')
const { TableController } = require( '../controller/table-controller' );
const { TablesController } = require( '../controller/tables-controller' );


var Table={
    
    getAllTable:function(callback){
		return db.query("Select * from tables",callback);
	},
    getOne:function(callback){

    },
	table_add:function({table_name,credential_string},callback){
        
        return db.query(`
            CALL table_add('${ table_name }', '${ credential_string}','${ "tablealias"+ (new Date()).getTime() }')
        `,callback);
    },
    table_modify:function({table_id,table_name},callback){
        return db.query (`
        CALL table_modify('${ table_id }', '${table_name }');
        `,callback);
    },
    drop_table:function({table_id},callback){
        return db.query (`
        CALL drop_table('${ table_id }');
        `,callback);
    },
};
 module.exports=Table;
 
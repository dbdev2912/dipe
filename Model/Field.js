var db = require('../Connect/Dbconnection');

var Field={
    add_field:function({table_id,field_name,field_alias,nullable,field_props,field_data_type,default_value,is_primary},callback){
        return db.query (`
        CALL add_field(
        '${ table_id }', '${field_name }','${"fieldalias"+ (new Date()).getTime() }',${ nullable },
        '${ field_data_type }','${ JSON.stringify( field_props ) }',
        '${ default_value}',${is_primary });`,callback);
    },
    modify_field:function({field_id,field_name,nullable,field_props,field_data_type,default_value,is_primary},callback){
        return db.query (`
        CALL modify_field(
        '${ field_id }', '${field_name }',${ nullable },
        '${ field_data_type }','${ JSON.stringify( field_props ) }',
        '${ default_value}',${is_primary });`,callback);
    },
    drop_field:function({field_id},callback) {
    
        return db.query (`CALL drop_field('${ field_id }');`,callback);
    },

};
 module.exports=Field;
const {mysql} = require('../Connect/conect');

const { TableController } = require("./table-controller");
const { id } = require('../module/modulars');

class TablesController {

    constructor () {

    }

    getall = ( callback ) => {
        const query = `
            SELECT * FROM TABLES;
        `;
        mysql( query, ( result ) =>  {
            if( result.length == 0 ){
                callback({ success: false })
            }else{
                const tables = result.map( table => new TableController( table ) )
                callback( { success: true, tables } )
            }
        })
    }
    getAllUsingCredentialString = ( credential_string ,callback ) => {
        const query = `
            SELECT * FROM TABLES WHERE credential_string = '${ credential_string }';
        `;
        mysql( query, ( result ) =>  {
            if( result.length == 0 ){
                callback({ success: false })
            }else{
                const tables = result.map( table => new TableController( table ) )
                callback( { success: true, tables } )
            }
        })
    }
    getone = ( criterias, callback ) => {
        // criteria form like { field: "field", value: "value", fomula: "=><<>" }
        const queryTail = criterias.map( criteria => {
            const { field, fomula, value } = criteria;
            return ` ${ field } ${ fomula } '${ value }' `
        })
        const queryTailStringified = queryTail.join("AND");
        const query = `
            SELECT * FROM tables WHERE ${ queryTailStringified }
        `;
        mysql( query, (result) => {
            if( result.length > 1 ){
                callback( { success: false, content: "YOUR CRITERIA RETURNS MORE THAN 1 RECORDS" } );
            }
            if( result.length === 0 ){
                callback( { success: false, content: "YOUR CRITERIA RETURNS NO RECORDS" } );
            }
            if( result.length === 1 ){
                callback( { success: true, table: new TableController( result[0] ) } );
            }
        })
    }
    createTable = ({ table_name, credential_string }, callback) => {
        const table_alias = id();
        const query = `
            CALL table_add( "${table_name}", "${ credential_string }", "${ table_alias }" );
        `;
        console.log(query);
        mysql( query, result =>{
            const { success, table_id } = result[0][0]

            if( success ){
                callback( {success: true, table: new TableController( { table_id, table_name, table_alias, credential_string } )} ) /* Small bug need not to be hurry */
            }
            else{
                callback({ success: false })
            }
        })
    }
    dropAllTables = ( callback ) => {
        const query = `
            CALL drop_all_tables();
        `;
        mysql( query, (result) => {
            callback( result[0][0] )
        })
    }



}
module.exports = { TablesController }

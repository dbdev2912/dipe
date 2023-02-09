const { connector } = require('../db/connector');

class Table {
    constructor( name ){
        this.name = name
    }

    selectAll( callback ){
        const query = `SELECT * FROM ${this.name};`
        connector( query, (result) => {
            callback(result);
        })
    }

    selectOne(key, value, callback){
        const query = `
            SELECT * FROM ${ this.name } WHERE ${key} = '${value}'
        `;

        connector( query, (result) => {
            callback(result);
        })
    }

    insertOne( values, callback ){
        let fieldString  = `INSERT INTO ${ this.name }(`;
        let valuesString = " VALUES(";
        for( let i = 0; i < values.length; i++ ){
            let v = values[i];
            if( v.value ){
                fieldString += `${ v.field }`
                valuesString += `'${ v.value }'`

                if( i != (values.length - 1) ){
                    fieldString  +=',';
                    valuesString +=',';
                }
            }
        }
        if(fieldString[ fieldString.length - 1 ] == ","){
            fieldString = fieldString.slice(0, fieldString.length - 1);
        }
        if(valuesString[ valuesString.length - 1 ] == ","){
            valuesString = valuesString.slice(0, valuesString.length - 1);
        }

        fieldString  +=')';
        valuesString +=')';
        const query = fieldString + valuesString;
        // console.log( query )
        connector( query, (result) => {
            callback(result);
        })
    }

    updateOne(criteria, values, callback){
        let query = `UPDATE ${ this.name } SET `
        for( let i = 0; i < values.length; i++){
            let { field, value } = values[i];
            query += ` ${ field } = '${ value }',`
        }
        query = query.slice( 0, query.length - 1 );
        const { field, value } = criteria
        query += ` WHERE ${field} = '${ value }' `;
        // console.log("\n" + query)
        connector( query, (result) => {
            callback(result);
        })
    }

    deleteOne( key, value, callback ){
        const query = `
        DELETE FROM ${this.name} WHERE ${key} = '${value}';
        `;
        connector( query, (result) => {
            callback(result);
        })
    }
}


module.exports = {
    Table
}

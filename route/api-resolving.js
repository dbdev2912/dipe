const { mysql, mongo } = require('../Connect/conect');

const getDataFromMongo = (dbo, tables, index, data, callback ) => {
    if( index === tables.length ){
        callback({ data })
    }else{
        const { table_name, table_id, table_alias } = tables[index];
        dbo.collection( table_alias ).find().toArray((err, result) => {
            data[ table_alias ] = {
                data: result,
                table_name
            };
            getDataFromMongo( dbo, tables, index + 1, data, callback )
        })
    }
}

const getRequest = ( tables, fields, callback ) => {
    mongo( dbo => {
        getDataFromMongo(dbo, tables, 0, {}, ( { data } ) => {
            const rawConstraints = tables.map( table => {
                const constraints = table.constraint;

                if( constraints != undefined ){
                    const foreign = constraints.filter( constr => constr.constraint_type === "fk" );
                    return foreign
                }else{
                    return null
                }
            })

            const constraints = [];
            for( let i = 0; i < rawConstraints.length; i++ ){
                const constrs = rawConstraints[i];
                if( constrs != null ){
                    constraints.push(...constrs);
                }
            }
            /* API */
            callback( constraints )
        })
    })
}

const apiResolving = (api, callback) => {
    const { tables, fields, type } = api;
    switch (type.value) {
        case "get":
            getRequest( tables, fields, callback );
            break

        default:
            callback({ msg: "None can hide" })
            break;
    }
}

module.exports = { apiResolving }

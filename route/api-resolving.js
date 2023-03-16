const { mysql, mongo } = require('../Connect/conect');

const getDataFromMongo = (dbo, tables, index, data, callback ) => {
    if( index === tables.length ){
        callback({ data })
    }else{
        const { table_name, table_id, table_alias, constraint } = tables[index];
        dbo.collection( table_alias ).find().toArray((err, result) => {
            data[ table_alias ] = {
                data: result,
                table_name
            };
            getDataFromMongo( dbo, tables, index + 1, data, callback )
        })
    }
}

const getFieldAlias = ( tables, field_id ) => {

    const _fields = tables.map( tb => tb.fields );
    const fields = []
    for( let i = 0; i < _fields.length; i++ ){
        if( _fields[i] != undefined ){
            fields.push(..._fields[i])
        }
    }

    const field = fields.filter( f => f.field_id == field_id )[0]
    if( field ){
        return field.field_alias;
    }else{
        return undefined
    }
}

const mergeData = ( tables, data, index, result, callback ) => {
    if( tables.length == index ){
        callback( { result });
    }else{
        const table = tables[index];
        const currentData = data[table.table_alias].data;

        if( result == undefined ){
            mergeData( tables, data, index + 1, currentData, callback )
        }else{
            const constraints = table.constraint;
            const newResult = [ ];

            for( let h = 0; h < constraints.length; h++ ){
                const constraint = constraints[h]
                for( let i = 0; i < result.length; i++ ){
                    for( let j = 0; j < currentData.length; j++ ){
                        newResult.push({ ...result[i], ...currentData[j] })
                    }
                }

            }
            mergeData( tables, data, index + 1, newResult, callback )
        }
    }
}

const findTable = ( tables, foreign ) => {
    const { reference_on } = foreign;
    const filtedTables = tables.map( tb => {
        const existed = tb.fields.filter( fi => fi.field_id === reference_on );
        if( existed.length > 0 ){
            return tb
        }else{
            return null
        }
    })
    const filtedTable = filtedTables.filter( tb => tb != null )[0];
    return filtedTable;
}

const findForeignTables = ( tables, pk ) => {
    const { field_id } = pk;
    const filtedTables = tables.map( tb => {
        const { constraint } = tb;
        const fk = constraint.filter( constr => constr.constraint_type === "fk" );

        if( fk != undefined && fk.length > 0 ){
            const existed = fk.filter( fi => fi.reference_on === field_id );
            if( existed.length > 0 ){
                return tb
            }else{
                return null
            }
        }else{
            return null
        }
    })
    const filtedTable = filtedTables.filter( tb => tb != null );
    return filtedTable;
}

const dataFilterByConstraints = ( result, tables, constraints, index, callback) => {
    if( index === constraints.length ){
        callback({ data: result })
    }else{
        const { reference_on, field_id, constraint_type } = constraints[index]
        if( constraint_type == "fk" ){

            const field_alias = getFieldAlias( tables, field_id )
            const ref_alias = getFieldAlias( tables, reference_on )
            if( ref_alias != undefined ){
                const newResult = result.filter( res => res[ field_alias ] === res [ ref_alias ] );
                dataFilterByConstraints( newResult, tables, constraints, index + 1, callback )
            }else{
                dataFilterByConstraints( result, tables, constraints, index + 1, callback )
            }
        }
        else{
            dataFilterByConstraints( result, tables, constraints, index + 1, callback )
        }
    }
}

const removeDuplicates = (data) => {
    const processedKeys = {};

    const uniqueData = data.filter((item) => {
        const key = item._id;
        if (!processedKeys.hasOwnProperty(key)) {
            processedKeys[key] = true;
            return true;
        }
        return false;
    });
    return uniqueData;
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
            // callback( constraints )
            mergeData( tables, data, 0, undefined, ({ result }) => {
                dataFilterByConstraints( result, tables, constraints, 0, ({ data }) => {

                    const uniqueData = removeDuplicates(data);

                    if( fields != undefined && fields.length > 0 ){
                        const finalData = uniqueData.map( data => {
                            const newData = {};
                            for( let i = 0; i < fields.length; i++ ){
                                const { field_alias } = fields[i];
                                newData[ field_alias ] = data[field_alias]
                            }
                            return newData
                        })
                        callback({ data: finalData })
                    }else{
                        callback({ data: uniqueData })
                    }
                })
            })
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

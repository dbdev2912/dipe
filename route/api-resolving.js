const { mysql, mongo } = require('../Connect/conect');
const { TablesController } = require('../controller/tables-controller');
/*=======================================================================*/

const controller = new TablesController()

/*============================== GET ====================================*/
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
                const newResult = result.filter( res => res[ field_alias ] === res[ ref_alias ] );
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

// const removeDuplicates = (data) => {
//     const processedKeys = {};
//
//     const uniqueData = data.filter((item) => {
//         const key = item._id;
//         if (!processedKeys.hasOwnProperty(key)) {
//             processedKeys[key] = true;
//             return true;
//         }
//         return false;
//     });
//     return uniqueData;
// }

const removeDuplicate = ( data ) => {
    const uniqueArray = data.filter((value, index) => {
        const _value = JSON.stringify(value);
        return index === data.findIndex(obj => {
            return JSON.stringify(obj) === _value;
        });
    });
    return uniqueArray
}

const paramsFilting = ( data, paramFilters, index ) => {

    if( index === paramFilters.length ){
        return data
    }else{
        const { field_alias, value } = paramFilters[index]
        const newData = data.filter( d => d[field_alias] == value )
        return paramsFilting( newData, paramFilters, index + 1 )
    }
}

const getRequest = (req, tables, fields, url, customFields, callback ) => {
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
            mergeData( tables, data, 0, undefined, ({ result }) => {

                dataFilterByConstraints( result, tables, constraints, 0, ({ data }) => {
                    const uniqueData = removeDuplicate(data);

                    if( fields != undefined && fields.length > 0 ){
                        const finalData = uniqueData.map( data => {
                            const newData = {};
                            for( let i = 0; i < fields.length; i++ ){
                                const { field_alias } = fields[i];
                                newData[ field_alias ] = data[field_alias]
                            }
                            return newData
                        })
                        const { params } = url;
                        const paramsURL = url.url;

                        const splittedURL = req.url.split('/')
                        const splittedParams = paramsURL.split('/')

                        if( params != undefined && params.length > 0 ){
                            const paramFilters = params.map( field => {
                                const { field_alias } = field
                                return {
                                    field_alias,
                                    value: splittedURL[ splittedParams.indexOf( `:${ field_alias }` ) ]
                                }
                            })
                            finalFinalData = paramsFilting( finalData, paramFilters, 0 )

                            if( customFields != undefined && customFields.length > 0 ){
                                const fieldWithCustomName = fields.filter( f => f.custom_alias != undefined && f.custom_alias.length > 0 )
                                fieldWithCustomName.sort((a, b) => a.custom_alias.length > b.custom_alias.length);

                                customFields.map( cf => {
                                    const {
                                        name, field_alias, fomular, field_name,
                                    } = cf;
                                    for( let i = 0; i  < finalFinalData.length ; i++ ){
                                        const newData = finalData[i]
                                        newData[field_alias] = fomular
                                        fieldWithCustomName.map( f => {
                                            newData[field_alias] = newData[field_alias].replaceAll( f.custom_alias, newData[f.field_alias] )
                                        })
                                        newData[field_alias] = eval(newData[field_alias]);
                                    }
                                })
                                callback({ data: finalFinalData })
                            }else{
                                callback({ data: finalFinalData })
                            }
                        }else{
                            const finalFinalData = finalData;

                            if( customFields != undefined && customFields.length > 0 ){
                                const fieldWithCustomName = fields.filter( f => f.custom_alias != undefined && f.custom_alias.length > 0 )
                                fieldWithCustomName.sort((a, b) => a.custom_alias.length > b.custom_alias.length);

                                customFields.map( cf => {
                                    const {
                                        name, field_alias, fomular, field_name,
                                    } = cf;
                                    for( let i = 0; i  < finalFinalData.length ; i++ ){
                                        const newData = finalData[i]
                                        newData[field_alias] = fomular
                                        fieldWithCustomName.map( f => {
                                            newData[field_alias] = newData[field_alias].replaceAll( f.custom_alias, newData[f.field_alias] )
                                        })
                                        newData[field_alias] = eval(newData[field_alias]);
                                        finalData[i] = newData
                                    }
                                })
                                callback({ data: finalFinalData })
                            }else{
                                callback({ data: finalFinalData })
                            }
                        }

                    }else{
                        callback({ data: uniqueData })
                    }
                })
            })
        })
    })
}


/*============================== POST ====================================*/

const insertDataToTablesOneByOne = ( tables, data, index, callback ) => {
    if( tables.length === index ){
        callback({ data: "Thành công nhe quí dị" })
    }else{
        const table = tables[index];
        const { constraint, table_id, fields } = table;
        const _fields = fields;
        const _constraint = constraint;

        const criteria = [{
            field: "table_id",
            value: table_id,
            fomula: "="
        }]
        controller.getone( criteria, ( result ) => {
            const { success } = result;
            if( success ){
                const tableController = result.table;
                tableController.getFields( ({ success, fields }) => {

                    if( success ){
                        const insertData = {}
                        fields.map( field => {
                            const _field = _fields.filter( f => f.field_id == field.field_id )[0];
                            const { constraints } = _field
                            const fk = constraints.filter( c => c.constraint_type == "fk" );
                            if( constraints != undefined && constraints.length > 0 && fk.length > 0 ){
                                controller.getFieldsbyRelatedField( fk[0].reference_on, (result) => {
                                    const relatedFields = result.fields;

                                    const ref_field = relatedFields.filter( f => f.field_id == fk[0].reference_on )[0]
                                    console.log(ref_field)
                                    insertData[ field.field_alias ] = data[ ref_field.field_alias ]  ? data[ ref_field.field_alias ] : data[ _field.field_alias ]
                                })

                            }else{
                                const { field_alias } = field;
                                insertData[ field_alias ] = data[ field_alias ]
                            }
                        })
                        console.log( insertData )
                        tableController.insert( insertData, ({ success, content }) => {

                            if( success ){
                                insertDataToTablesOneByOne(tables, data, index + 1, callback )
                            }else{
                                callback({ data: content })
                            }
                        })
                    }
                })
            }else{
                insertDataToTablesOneByOne(tables, data, index + 1, callback )
            }
        })
    }
}

const sortTableBasedOnKey = ( tables ) => {
    const pkOnly = tables.filter( tb => {
        const { constraint } = tb;
        const fk = constraint.filter( c => c.constraint_type == "fk" );
        return fk.length > 0 ? false : true
    })

    const fkOnly = tables.filter( tb => {
        const { constraint } = tb;
        if( constraint && constraint.length > 0 && constraint.length %2 == 0 ){
            const fk = constraint.filter( c => c.constraint_type == "fk" );
            const pk = constraint.filter( c => c.constraint_type == "fk" );

            let valid = true
            for( let i = 0 ; i < fk.length; i++ ){
                const key = fk[i]
                const corespondKey = pk.filter( k => k.field_id == key.field_id );
                if( corespondKey.length == 0 ){
                    valid = false
                }
            }
            return valid;
        }else{
            return false
        }
    })
    const pkOnlyAndfkOnly = [ ...pkOnly, ...fkOnly ]
    const mixedKey = tables.filter( tb => pkOnlyAndfkOnly.indexOf(tb) == -1 )
    return [ ...pkOnly,  ...mixedKey, ...fkOnly ]
}


const postRequest = (req, tables, fields, callback ) => {
    const { data } = req.body;
    console.log(data)
    insertDataToTablesOneByOne( sortTableBasedOnKey(tables), data, 0, (result) => {
        callback(result)
    })
}

/*============================== ROUTES ====================================*/
const apiResolving = (req, api, callback) => {
    const { tables, fields, type, url, customFields } = api;
    switch (type.value) {
        case "get":
            getRequest(req, tables, fields, url, customFields, callback );
            break
        case "post":
            postRequest(req, tables, fields, callback );
            break;
        default:
            callback({ data: "None can hide" })
            break;
    }
}

module.exports = { apiResolving }

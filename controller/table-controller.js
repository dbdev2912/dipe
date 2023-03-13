const { mysql, mongo } = require('../Connect/conect');
const { FieldController } = require("./field-controller");
const { ConstraintController } = require("./constraint-controller");
const { Collection } = require('../mongo/collection');
const { id } = require('../module/modulars');


class TableController {
        constructor ( table_object ){
            const { table_id, table_name, table_alias, create_on, version_id } = table_object;
            this.table_id = table_id;
            this.table_name = table_name;
            this.table_alias = table_alias;
            this.create_on = create_on;
            this.version_id = version_id;
        }
        get = () => {
            const { table_id, table_name, table_alias, create_on, version_id } = this;
            return { table_id, table_name, table_alias, create_on, version_id }
        }

        modify = (name, callback) => {
            const _this = this;
            const query = `
                CALL table_modify(${ this.table_id }, '${ name }')
            `;
            mysql( query, (result) => {
                this.table_name = name;
                callback( {success: true, table: this} );
            })
        }
        drop = (callback) => {
            const query = `
                CALL drop_table(${ this.table_id })
            `;
            mysql( query, (result) => {
                callback(result[0]);
            })
            /* Final test */
        }
        getFields = ( callback ) => {
            const query = `
                SELECT * FROM fields WHERE table_id = ${ this.table_id }
            `;
            mysql( query, (result) => {
                const fieldsRawData = result;
                if( fieldsRawData.length > 0 ){
                    const fields = fieldsRawData.map( field => new FieldController( field ) )
                    callback({ success: true, fields })
                }else{
                    callback({ success: false })
                }
            })
        }
        getField = ( field_id, callback ) => {
            const query = `
                SELECT * FROM fields WHERE table_id = ${ this.table_id } AND field_id = ${ field_id }
            `;
            mysql( query, (result) => {
                if( result.length > 0 ){
                    const fieldRawData = result[0];
                    const field = new FieldController( fieldRawData )
                    callback({success: true, field})
                }else{
                    callback({ success: false })
                }
            })
        }
        createField = ( fieldRaw , callback) => {
            const { field_name, nullable, field_props, field_data_type, default_value } = fieldRaw;
            const field_alias = id(); /* This is supposed to be unique */
            const query =`
                CALL add_field(${ this.table_id }, '${field_name}', '${field_alias}', ${nullable}, '${field_data_type}', '${JSON.stringify({ props: field_props })}', '${ default_value }');
            `;
            mysql( query, (result) => {
                const { success, content } = result[0][0];
                if( success ){
                    const query = `
                        SELECT * FROM fields WHERE field_alias = '${ field_alias }'
                    `;
                    mysql( query, (result) => {
                        const fieldRawData = result[0];
                        const field = new FieldController( fieldRawData )

                        callback( { success, field, content } )
                    })
                }else{
                    callback({ success, content })
                }
            })
        }
        getConstraints = (callback) => {
            const query = `
                SELECT * FROM constraints WHERE field_id IN ( SELECT field_id FROM fields WHERE table_id = ${ this.table_id } );
            `;
            const _this = this;

            mysql(query, (result) => {
                const constraintsRawData = result;
                if( constraintsRawData.length > 0 ){
                    const constraints = constraintsRawData.map( constraint => {
                        return new ConstraintController( constraint )
                    })
                    callback( {success: true, constraints} )
                }else{
                    callback( {success: false } )
                }
            })
        }

        getConstraint = ( constraint_id, callback ) => {
            const query = `
                SELECT * FROM constraints WHERE constraint_id = ${ constraint_id };
            `;
            mysql( query, ( result ) => {
                if( result.length > 0 ){
                    return callback({ success: true, constraint: new ConstraintController( result[0] ) })
                }else{
                    return callback({ success: false })
                }
            })
        }

        createConstraint = ( {
            constraint_type,
            field_id,
            reference_on,
            check_fomular,
            check_on_field,
            default_check_value
            }, callback ) => {

            const query = `
                CALL add_constraint('${constraint_type}', ${ field_id }, '${ reference_on ? reference_on: -1 }', '${ check_fomular }', ${ check_on_field }, '${ default_check_value ? default_check_value: "NULL" }');
            `;

            mysql( query, (result) => {
                const { success, content, id } = result[0][0];
                if( success ){
                    this.getConstraint( id, ({ success, constraint }) => {
                        callback( { success, constraint } )
                    })
                }
            })
        }
        dropAllConstraints = (callback) => {
            const query = `
                DELETE FROM constraints WHERE field_id IN ( SELECT field_id FROM fields WHERE table_id = ${ this.table_id } );
            `;
            mysql( query, (result) => {
                callback({ success: true })
            })
        }

        /* INSERT DATA TO MONGODB */

        connect = ( callback ) => {
            mongo( dbo => {
                console.log(dbo)
                const col = dbo.collection( this.table_alias );
                callback({ success: true, col });
            })
        }

        find = (criteria, callback) => {
            this.connect( ({ success, col }) => {
                if( !success ){
                    callback( { success, content: `Failed to connect to collection: ${ this.table_name }` } )
                }else{
                    const collection = new Collection( col );
                    collection.find( criteria, ({ success, content, data }) => {
                        callback( {success, content, data} )
                    })
                }
            })
        }

        findAll = (callback) => {
            this.connect( ({ success, col }) => {
                if( !success ){
                    callback( { success, content: `Failed to connect to collection: ${ this.table_name }` } )
                }else{
                    const collection = new Collection( col );
                    collection.findAll( ({ success, content, data })=> {
                        callback( {success, content, data} )
                    })
                }
            })
        }

        insert = ( data, callback ) => {
            this.getConstraints( ({ success, constraints }) => {
                this.connect( ({ success, col }) => {

                    if( !success ){
                        callback( { success, content: `Failed to connect to collection: ${ this.table_name }` } )
                    }else{
                        const collection = new Collection( col );
                        if( constraints ){
                            collection.insert( data, constraints, ({ success, content })=> {
                                if( success ){
                                    collection.insertPureData( data, ({ success, content }) => {
                                        callback( {success, content} )
                                    })
                                }else{
                                    callback( {success, content} )
                                }
                            } )
                        }else{
                            collection.insertPureData( data, ({ success, content }) => {
                                callback( {success, content} )
                            })
                        }
                    }
                })
            })
        }

        update = (oldValue, newValue, callback) => {
            this.getConstraints( ({ success, constraints }) => {
                this.connect( ({ success, col }) => {
                    if( !success ){
                        callback( { success, content: `Failed to connect to collection: ${ this.table_name }` } )
                    }else{
                        const collection = new Collection( col );
                        collection.updateChangeCheck( constraints, oldValue, newValue, ({ changes })=> {
                            if( changes.length > 0 ){
                                const context = {  }
                                collection.synchronizePrimaryData( constraints, changes, oldValue, newValue, ({ success, content }) => {
                                    context["pk"] = { success, content }
                                    collection.synchronizeForeignData( constraints, changes, oldValue, newValue, ({ success, content }) => {
                                        context["fk"] = { success, content }
                                        callback({ success: true, content: context })
                                    })
                                    // callback({ success: true, content: "Updated after synchronizing data" })
                                })
                            }else{
                                collection.update( oldValue, newValue, ({ content }) => {
                                    callback({ success: true, content })
                                })
                            }
                        })
                    }
                })
            })
        }

        delete = (criteria, callback) => {
            this.connect( ({ success, col }) => {
                if( !success ){
                    callback( { success, content: `Failed to connect to collection: ${ this.table_name }` } )
                }else{
                    const collection = new Collection( col );
                    collection.delete( criteria, ({ success, content, data })=> {
                        callback( {success, content, data} )
                    })
                }
            })
        }

        deleteAll = (callback) => {
            this.connect( ({ success, col }) => {
                if( !success ){
                    callback( { success, content: `Failed to connect to collection: ${ this.table_name }` } )
                }else{
                    const collection = new Collection( col );
                    collection.deleteAll( ({ success, content, data })=> {
                        callback( {success, content, data} )
                    })
                }
            })
        }


}
module.exports = { TableController }

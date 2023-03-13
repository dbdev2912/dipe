const { mongo, mysql } = require('../Connect/conect');

class Collection {
    constructor( col ) {
        this.col = col
    }

    constraintCheck = (data, constraints, index, is_passed, callback ) => {
        if( !is_passed ){
            callback({ success: false, content: `SOME DATA MET CONFLICT WITH DB DESIGN`  })
        }
        else{
            if( index === constraints.length ){
                /* This is fuking final step */
                callback({ success: true, content: `SUCCESSFULLY INSERTED NEW DATA `})
            }
            else{
                const constraint = constraints[index];
                switch ( constraint.constraint_type ) {
                    case "pk":
                        // constraint.keys.map( key => { console.log( key.get() ) } )
                        this.primaryConstraintsCheck( data, constraint, ( { passed } ) => {
                            if( passed ){
                                this.constraintCheck( data, constraints, index + 1, true, callback )
                            }else{
                                this.constraintCheck( data, constraints, index + 1, false, callback )
                            }
                        })
                        break;
                    case "fk":
                        this.foreignKeyConstraintCheck( data, constraint, ({ passed }) => {
                            if( passed ){
                                this.constraintCheck( data, constraints, index + 1, true, callback )
                            }else{
                                this.constraintCheck( data, constraints, index + 1, false, callback )
                            }
                        })

                        break;
                    default:
                        console.log("OTHER CONSTRAINTs")
                        this.constraintCheck( data, constraints, index + 1, true, callback )
                        break;

                }
            }
        }
    }

    getKeysAndValueFromConstraint = ( data, constraints, index, key, passed, callback ) => {
        if( index === constraints.length ){
            callback({ passed, key });
        }else{
            const constraint = constraints[index];
            constraint.getFieldAlias(({ success, field_alias }) => {
                if( !success ){
                    this.getKeysAndValueFromConstraint( data, constraints, index + 1, key, false, callback )
                }else{
                    key[field_alias] = data[field_alias]
                    this.getKeysAndValueFromConstraint( data, constraints, index + 1, key, passed, callback )
                }
            })
        }
    }


    primaryConstraintsCheck = ( data, constraint, callback ) => {
        const { keys } = constraint;

        this.getKeysAndValueFromConstraint( data, keys, 0, {}, true, ({ passed, key }) => {
            this.col.find(key).toArray((err, result) => {
                if( result.length > 0 ){
                    callback({ passed: false })
                }else{
                    callback({ passed: true })
                }
            })
            /* query database and fuking check if data is already existed or not */
        })
    }

    foreignKeyConstraintCheck = ( data, constraint, callback ) => {
        const keys = [ constraint ]
        this.getKeysAndValueFromConstraint( data, keys, 0, {}, true, ({ passed, key }) => {
            /* Check on origin no table !!! */
            const field_alias =  Object.keys(key)[0]
            const query = `
            SELECT table_alias FROM TABLES WHERE TABLE_ID IN
            (
                SELECT TABLE_ID FROM FIELDS WHERE FIELD_ID IN
                (
                    SELECT REFERENCE_ON FROM CONSTRAINTS WHERE FIELD_ID IN
                    (
                        SELECT FIELD_ID FROM FIELDS WHERE FIELD_ALIAS = '${ field_alias }'
                    )
                )
            )
            `;
            mysql(query, (result) => {
                const { table_alias } = result[0];
                const query = `
                    SELECT field_alias FROM FIELDS WHERE FIELD_ID IN
                    (
                        SELECT REFERENCE_ON FROM CONSTRAINTS WHERE FIELD_ID IN
                        (
                            SELECT FIELD_ID FROM FIELDS WHERE FIELD_ALIAS = '${ field_alias }'
                        )
                    )
                `;

                mysql(query, (result) => {
                    const f_alias = result[0].field_alias;
                    const query = {};
                    query[ f_alias ] = key[ field_alias ];

                    mongo( (dbo) => {
                        dbo.collection( table_alias ).find(query).toArray((err, result) => {
                            if( result.length > 0 ){
                                callback({ passed: true })
                            }else{0
                                callback({ passed: false })
                            }
                        })
                    })
                })
            })
        })
    }

    insert = (data, rawConstraints, callback ) => {
        const primaries = rawConstraints.filter( constraint => constraint.constraint_type === "pk" );
        const foreigns  = rawConstraints.filter( constraint => constraint.constraint_type === "fk" );
        const constraints = [ { constraint_type: "pk", keys: primaries }, ...foreigns ];
        /* Type check */
        this.constraintCheck(data, constraints, 0, true, callback)
    }


    insertPureData = ( data, callback ) => {
        this.col.insertOne( data, ( err, result ) => {
            callback({ success: true, content: "SUCCESSFULLY INSERTED NEW DATA" })
        });
    }

    findAll = (callback ) => {
        this.col.find().toArray( (err, result) => {
            callback( { content: `SUCCESSFULLY RETRIEVED ALL DATA `, data: result } )
        })
    }
    find = (criteria, callback ) => {
        this.col.find( criteria ).toArray( (err, result) => {
            callback( { content: `SUCCESSFULLY RETRIEVED DATA `,data: result } )
        })
    }

    primaryKeysChangeDetect = ( oldValue, newValue, keys, index, changed, callback ) => {
        if( index === keys.length ){
            callback( { changed } )
        }else{
            const constraint = keys[index]
            constraint.getFieldAlias( ({ success, field_alias }) => {
                if( oldValue[field_alias] != newValue[field_alias] ){
                    changed = true
                }
                this.primaryKeysChangeDetect( oldValue, newValue, keys, index + 1, changed, callback )
            })
        }
    }

    keysChangeCheck = ( constraints, oldValue, newValue, index, changes, callback ) => {
        if( index === constraints.length ){
            callback( { changes } )
        }else{
            const constraint = constraints[index];
            switch (constraint.constraint_type) {
                case "pk":
                    const { keys } = constraint;
                    this.primaryKeysChangeDetect( oldValue, newValue, keys, 0, false, ({ changed }) => {
                        if( changed ){
                            changes.push( { type: "pk" } )
                        }
                        this.keysChangeCheck( constraints, oldValue, newValue, index + 1, changes, callback )
                    })
                    break;
                case "fk":
                    constraint.getFieldAlias( ({ success, field_alias }) => {
                        if( oldValue[field_alias] != newValue[field_alias] ){
                            changes.push({
                                type: "fk",
                                field_id: constraint.field_id
                            })
                        }
                        this.keysChangeCheck( constraints, oldValue, newValue, index + 1, changes, callback )
                    })
                    break;

                default:
                    break

            }
        }
    }

    updateChangeCheck = ( rawConstraints, oldValue, newValue, callback ) => {
        const primaries = rawConstraints.filter( constraint => constraint.constraint_type === "pk" );
        const foreigns  = rawConstraints.filter( constraint => constraint.constraint_type === "fk" );
        const constraints = [ { constraint_type: "pk", keys: primaries }, ...foreigns ];

        this.keysChangeCheck( constraints, oldValue, newValue, 0, [], callback )
    }

    synchronizingEverySinglePK = ( primaries, index, oldValue, newValue, callback ) => {
        if( index === primaries.length ){
            callback({ success: true })
        }else{
            const pk = primaries[index];
            const query = `
                SELECT table_alias, field_alias
                FROM tables AS T
                    INNER JOIN fields AS F ON F.table_id = T.table_id
                WHERE field_id IN (
                    SELECT FIELD_ID FROM constraints WHERE reference_on = ${ pk.field_id }
                )
            `;
            mysql( query, (result) => {
                /*
                    Recursive and synchronize data
                */
                const references = result;

                const query = `
                    SELECT field_alias FROM fields WHERE field_id = ${ pk.field_id }
                `;

                mysql( query, (result) => {
                    const { field_alias } = result[0];

                    if( references && references.length > 0 ){
                        this.cascadingSyncPrimaryKeyData( references, 0, oldValue, newValue, field_alias, ({ success }) => {

                            this.synchronizingEverySinglePK( primaries, index + 1, oldValue, newValue, callback )
                        })
                    }else{
                        this.synchronizingEverySinglePK( primaries, index + 1, oldValue, newValue, callback )
                    }
                })
            })
        }
    }

    cascadingSyncPrimaryKeyData = ( references, index, oldValue, newValue, oldFieldAlias, callback ) => {
        if( index === references.length ){

            const criteria = {};
            const newkeys = {};
            criteria[ oldFieldAlias ] = oldValue[ oldFieldAlias ];
            this.update( criteria, newValue , ({ content }) => {
                callback({ success: true })
            })
        }else{
            const { field_alias, table_alias } = references[index];
            const criteria = {};
            const newkeys = {};
            criteria[ field_alias ] = oldValue[ oldFieldAlias ];
            newkeys[ field_alias ] = newValue[ oldFieldAlias ];
            mongo( dbo => {
                dbo.collection( table_alias ).update( criteria, { $set: newkeys } , (err, result) => {
                    this.cascadingSyncPrimaryKeyData( references, index + 1, oldValue, newValue, oldFieldAlias, callback )
                })
            })
        }
    }

    synchronizePrimaryData = ( constraints, changes, oldValue, newValue, callback ) =>{
        const primariesChange = changes.filter( change => change.type === "pk" );
        const primaries = constraints.filter( constraint => constraint.constraint_type === "pk" );
        if( primariesChange.length > 0 ){
            this.constraintCheck(newValue, [{ constraint_type: "pk", keys: primaries }], 0, true, ({ success, content }) => {
                console.log( "281 :",  { success, content } )
                this.synchronizingEverySinglePK( primaries, 0, oldValue, newValue, ({success}) => {
                    callback( { success, content: "Primary key cascading updated" } )
                })
                /* synchronizing data here */
            })
        }else{
            callback( { success: false, content: "No primary key conflict found" } )
        }
    }

    synchronizeForeignData = ( constraints, changes, oldValue, newValue, callback ) =>{
        const foreignsChange = changes.filter( change => change.type === "fk" );
        const foreigns  = constraints.filter( constraint => constraint.constraint_type === "fk" );
        const primaries = constraints.filter( constraint => constraint.constraint_type === "pk" );

        if( foreignsChange.length > 0 ){
            this.constraintCheck(newValue, foreigns, 0, true, ({ success, content }) => {
                console.log("299 ", { success, content } )
                if( success ){
                    this.getKeysAndValueFromConstraint( oldValue, primaries, 0, {}, true, ({ passed, key }) => {
                        const oldKey = key;
                        this.getKeysAndValueFromConstraint( newValue, primaries, 0, {}, true, ({ passed, key }) => {
                            const newKey = key;
                            this.find(newKey, ({content , data })=> {
                                if( data.length > 0 ){
                                    callback( { success: false, content: "Primary key constraint conflict !" } )
                                }else{
                                    this.update( oldKey, newValue, ({ content }) => {
                                        callback( { success: false, content: "Successfully updated data" } )
                                    })
                                }
                            })
                        })
                    })
                }
                else{
                    /* Conflict foreign constraint becuz the foreign cannot be found */
                    console.log("Foreign key change conflict data desgin")
                    callback( { success, content } )
                }
            })
        }else{
            callback( { success: false, content: "No foreign key conflict found" } )
        }
    }


    update = (criteria, newValue, callback ) => {

        this.find( criteria, ({ content, data }) => {
            if( data.length > 0 ) {
                this.col.update( criteria, { $set: { ...newValue } }, ( err, result ) =>  {
                    callback( {  content: `SUCCESSFULLY UPDATED DATA` }  )
                })
            }else{
                callback( {  content: `DATASET NOT FOUND` }  )
            }
        })

    }

    deleteAll = ( callback ) => {
        this.col.deleteMany((err, result) => {
            callback( { content: `SUCCESSFULLY DELETED ALL DATA `,data: result } )
        })
    }
    delete = ( criteria, callback ) => {
        this.col.remove(criteria, (err, result) => {
            callback( { content: `SUCCESSFULLY DELETED DATA ` } )
        })
    }
}


module.exports = { Collection }

const { mongo, mysql } = require('../db/connector');
const { TablesController } = require('../controllers/tables-controller');
const { TableController } = require('../controllers/table-controller');

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

    synchronizingEverySinglePK = ( primaries, index, callback ) => {
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
                console.log(result);
                this.synchronizingEverySinglePK( primaries, index + 1, callback )
            })
        }
    }

    synchronizePrimaryData = ( constraints, changes, oldValue, newValue, callback ) =>{
        const primariesChange = changes.filter( change => change.type === "pk" );
        const primaries = constraints.filter( constraint => constraint.constraint_type === "pk" );
        if( primariesChange.length > 0 ){
            this.constraintCheck(newValue, [{ constraint_type: "pk", keys: primaries }], 0, true, ({ success, content }) => {
                console.log( "222 :",  { success, content } )
                this.synchronizingEverySinglePK( primaries, 0, ({success}) => {
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

        if( foreignsChange.length > 0 ){
            this.constraintCheck(newValue, foreigns, 0, true, ({ success, content }) => {
                console.log("239 ", { success, content } )

                /* foreign key synchronizing data */

                callback( { success, content } )
            })
        }else{
            callback( { success: false, content: "No primary key conflict found" } )
        }
    }

    update = (criteria, newValue, callback ) => {
        this.col.update( criteria, { $set: { ...newValue } }, ( err, result ) =>  {



            /*
                Foreign key update
                Type check update
            */

            callback( {  content: `SUCCESSFULLY UPDATED DATA` }  )
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

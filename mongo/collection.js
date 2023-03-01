const { mongo } = require('../db/connector');
const { TablesController } = require('../controllers/tables-controller');

class Collection {
    constructor( col ) {
        this.col = col
    }

    constraintCheck = (data, constraints, index, is_passed, callback ) => {
        console.log(`Current Index: ${index}`)
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
                        console.log("PK CONSTRAINT")
                        this.primaryConstraintsCheck( data, constraint, ( { passed } ) => {
                            if( passed ){
                                this.constraintCheck( data, constraints, index + 1, true, callback )
                            }else{
                                this.constraintCheck( data, constraints, index + 1, false, callback )
                            }
                        })
                        break;
                    case "fk":
                        console.log("FK CONSTRAINT")
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
            this.col.find(key).toArray((err, result) => {
                if( result.length > 0 ){
                    callback({ passed: false })
                }else{0
                    callback({ passed: true })
                }
            })
        })
    }

    insert = (data, rawConstraints, callback ) => {
        const primaries = rawConstraints.filter( constraint => constraint.constraint_type === "pk" );
        const foreigns  = rawConstraints.filter( constraint => constraint.constraint_type === "fk" );
        const constraints = [ { constraint_type: "pk", keys: primaries }, ...foreigns ];

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

    update = (criteria, newValue, callback ) => {
        this.col.update( criteria, { $set: { ...newValue } }, ( err, result ) =>  {
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

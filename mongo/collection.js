const { mongo } = require('../db/connector');
const { TablesController } = require('../controllers/tables-controller');

class Collection {
    constructor( col ) {
        this.col = col
    }

    constraintCheck = (data, constraints, index, is_passed, callback ) => {
        console.log(`Current Index: ${index}`)
        if( index === constraints.length ){
            this.col.insertOne( data, ( err, result ) => {
                callback({ success: true, content: `SUCCESSFULLY INSERTED NEW DATA `})
            });
        }else{
            const constraint = constraints[index];
            if( !is_passed ){
                callback({ success: false, content: `SOME DATA MET CONFLICT WITH DB DESIGN`  })
            }else{
                switch ( constraint.constraint_type ) {
                    case "pk":
                        console.log("PRIMARY KEY CONSTRAINT")
                        // constraint.keys.map( key => { console.log( key.get() ) } )
                        this.primaryConstraintsCheck( data, constraint, ( { success, content } ) => {
                            if( success ){
                                this.constraintCheck( data, constraints, index + 1, true, callback )
                            }else{
                                is_passed = false;
                            }
                        })
                        break;
                    case "fk":
                        console.log(constraint.get())
                        console.log("FOREIGN KEY CONSTRAINT")
                        this.constraintCheck( data, constraints, index + 1, true, callback )
                        break;
                    default:
                        console.log("OTHER CONSTRAINTs")
                        this.constraintCheck( data, constraints, index + 1, true, callback )
                        break;

                }
                /* check here */
                /* if check faild, set is_passed to false then break the recursion */
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
                    this.getKeysAndValueFromConstraint( data, constraints, constraints.length, key, false, callback )
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
            console.log({ passed, key })
            callback({ passed, key })
        })
    }

    insert = (data, rawConstraints, callback ) => {

        const primaries = rawConstraints.filter( constraint => constraint.constraint_type === "pk" );
        const foreigns  = rawConstraints.filter( constraint => constraint.constraint_type === "fk" );
        const constraints = [ { constraint_type: "pk", keys: primaries }, ...foreigns ];

        this.constraintCheck(data, constraints, 0, true, callback)
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

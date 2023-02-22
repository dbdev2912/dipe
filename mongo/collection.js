const { mongo } = require('../db/connector');
const { TablesController } = require('../controllers/tables-controller');
class Collection {
    constructor( name ) {
        this.collectionName = name;
    }

    connect = ( callback ) => {
        const tables = new TablesController();
        const criteria = [{
            field: "table_alias",
            fomula: "=",
            value: this.collectionName
        }]
        tables.getone( criteria, ( { success, content, table } ) => {
            if( !success ){
                callback({ success, content, col: null })
            }else{
                mongo( dbo => {
                    const col = dbo.collection( this.collectionName );
                    callback({ success, col });
                })
            }
        })
    }

    insert = ( data, callback ) => {

        this.connect( ({ success, col, content }) => {
            if( !success ){
                callback( { success, content } )
            }else{
                /* apply constraint here */
                col.insertOne( data, ( err, result ) => {
                    callback( { success, content: `SUCCESSFULLY INSERT NEW DATA INTO ${ this.collectionName }`  } )
                });
            }
        })
    }

    findAll = ( callback ) => {
        this.connect( ({ success, col, content }) => {
            if( !success ){
                callback( { success, content } )
            }else{
                col.find().toArray( (err, result) => {
                    callback( { success, content: `SUCCESSFULLY RETRIEVE ALL DATA FROM ${ this.collectionName }`,data: result } )
                })
            }
        })
    }
    find = ( criteria, callback ) => {
        this.connect( ({ success, col, content }) => {
            if( !success ){
                callback( { success, content } )
            }else{
                col.find( criteria ).toArray( (err, result) => {
                    callback( { success, content: `SUCCESSFULLY RETRIEVE DATA FROM ${ this.collectionName }`,data: result } )
                })
            }
        })
    }

    update = ( criteria, newValue ) => {
        this.connect( ({ success, col, content }) => {
            if( !success ){
                callback( { success, content } )
            }else{
                col.update( criteria, { $set: { ...newValue } }, ( err, result ) =>  {
                    callback( callback( { success, content: `SUCCESSFULLY UPDATE DATA ON ${ this.collectionName }` } ) )
                })
            }
        })
    }

    deleteAll = () => {
        this.connect( ({ success, col, content }) => {
            if( !success ){
                callback( { success, content } )
            }else{
                col.deleteMany((err, result) => {
                    callback( { success, content: `SUCCESSFULLY DELETE ALL DATA FROM ${ this.collectionName }`,data: result } )
                })
            }
        })
    }
    delete = ( criteria ) => {
        this.connect( ({ success, col, content }) => {
            if( !success ){
                callback( { success, content } )
            }else{
                col.delete(criteria, (err, result) => {
                    callback( { success, content: `SUCCESSFULLY DATA FROM ${ this.collectionName }` } )
                })
            }
        })
    }
}


module.exports = { Collection }

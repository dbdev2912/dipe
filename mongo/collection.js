const { mongo } = require('../db/connector');
const { TablesController } = require('../controllers/tables-controller');
class Collection {
    constructor( name ) {
        this.collectionName = name;
    }

    connect = ( callback ) => {
        mongo( dbo => {
            const col = dbo.collection( this.collectionName );
            callback(col);
        })
    }

    insert = ( data ) => {

    }
}


module.exports = { Collection }

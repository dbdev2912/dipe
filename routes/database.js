const express = require('express');
const router = express.Router();
const { Table } = require('../module/table');
const { connector } = require('../db/connector');
const { id } = require('../module/modulars');

router.get('/tables', (req, res) => {
    const tablesConnector = new Table('tables');
    tablesConnector.selectAll( (result) => {
        const tables = result;
        const fieldsConnector = new Table('fields');
        fieldsConnector.selectAll( (result) => {
            const fields = result;
            connector( `
                SELECT * FROM _keys WHERE key_type = 'primary';
                `, (result) => {
                const keys = result ? result : [];
                for( let i = 0; i < fields.length; i++ ){
                    let field = fields[i]
                    for( let j = 0; j < keys.length; j++){
                        let key = keys[j]
                        if( field.field_id === key.field_id ){
                            fields[i] = { ...field, is_primary: true }
                        }
                    }
                }
                const data = tables.map( table => {
                    const { table_id } = table;
                    table.fields = fields.filter((field) => field.table_id === table_id );
                    return table;
                })
                res.send({ tables: data })
            })
        })
    })
})

router.post('/tables', (req, res) => {
    const tablesConnector = new Table('tables');
    const { table } = req.body;
    const { table_name, table_alias } = table
    const values = [
        { field: "table_name", value: table_name },
        { field: "table_alias", value: table_alias }
    ]
    tablesConnector.insertOne( values , result => {
        const table_id = result.insertId;
        const newFieldName = id()
        connector(`
            CREATE TABLE ${table_name}( ${ newFieldName } INT PRIMARY KEY NOT NULL );
        `, rlt => {
            const fields = new Table('fields');
            fields.insertOne([
                { field: "table_id", value: table_id },
                { field: "field_alias", value: "ID" },
                { field: "field_name", value: newFieldName },
                { field: "nullable", value: "1" },
                { field: "field_props", value: JSON.stringify({ "DEFAULT_PROPS": "DUOC CHUA ?"}) },
                { field: "field_data_type", value: "Int" },
            ], ( rlt ) => {
                const keys = new Table('_keys');
                const field_id = rlt.insertId;

                keys.insertOne([
                    { field: "field_id", value:  field_id },
                    { field: "key_type", value: "primary" },
                ], (rlt) => {
                    fields.selectOne( "field_id", field_id, result => {
                        const field = { ...result[0], is_primary: true };
                        res.send({ table_id, field })
                    })
                })
            })
        });

    })
})

const alterPrimaryKeys = ( table_id, pks, callback ) => {
    connector(`
        SELECT * FROM fields AS F INNER JOIN _keys AS K ON F.field_id = K.field_id
        WHERE table_id = ${table_id} AND key_type="primary"
    `,(result) => {
        const fields = result.map( field => field.field_name );
        const fields_string = fields.join(',');
        const inquery_string = `(${fields_string})`;

        const tables = new Table("tables");
        tables.selectOne("table_id", table_id, (result) => {
            const table = result[0];

            let query = `
                ALTER TABLE ${ table.table_name } DROP PRIMARY KEY
            `
            connector( query, (result) => {
                query = `
                    ALTER TABLE ${ table.table_name } ADD CONSTRAINT PRIMARY KEY${ inquery_string }
                `;
                connector( query, result => {
                    callback(result);
                })
            })
        })
    })
}

const dataTypeReGen = ( field, is_primary = false ) => {
    const { field_data_type, default_value, field_props, is_nullable } = field;
    let result = field_data_type;
    const props = field_props ? JSON.parse(field_props) : null;
    if( field_data_type.toLowerCase().includes("char") ){
        result += `(${ props.length })`;
    }
    if( field_data_type.toLowerCase().includes("dec") ){
        result += `(${ props.length }, ${ props.pointAt })`;
    }

    if( is_nullable === true ){
        result += " NOT NULL"
    }

    if( !is_primary ){
        if( default_value ){
            if( default_value.includes("null")  ){
                result +=` DEFAULT NULL`
            }
            else{
                result += ` DEFAULT '${ default_value }'`
            }
        }
    }
    return result;
}

router.post('/alter/table', ( req, res ) => { /* Add column nhe quí dị */
    const { table_id, field, table_name } = req.body;
    const tablesConnector = new Table('fields');
    const field_name = id();
    const values = [
        { field: "table_id", value: table_id },
        { field: "field_name", value: field_name },
        { field: "field_alias", value: field.field_alias },
        { field: "nullable", value: field.is_nullable === true ? "1" : "0" },
        { field: "field_data_type", value: field.data_type },
        { field: "default_value", value: field.default_value },
        { field: "field_props", value: field.props ? JSON.stringify(field.props) : JSON.stringify({"null" : "được chưa"}) }
    ]

    if( field.is_primary ){

        tablesConnector.insertOne(values, (result) => {

            tablesConnector.selectOne("field_id", result.insertId, (result) => {
                const _field = result[0]
                const query = `
                    ALTER TABLE ${table_name} ADD COLUMN ${ _field.field_name } ${ dataTypeReGen( _field ) }
                `;
                connector(query, (result) => {

                    const field_id = _field.field_id;
                    const keys = new Table('_keys');
                    keys.insertOne( [
                        { field: "field_id", value: field_id },
                        { field: "key_type", value: "primary" },
                    ], (result) => {

                        connector(`

                            SELECT * FROM _keys
                            WHERE key_type = 'primary' and field_id IN (
                                SELECT field_id FROM fields WHERE table_id = ${table_id}
                            );

                            `, result => {
                                const pks = result;
                                if( pks.length > 0 ){
                                    alterPrimaryKeys( table_id, pks, (result => {
                                        tablesConnector.selectOne( "field_id", field_id, (result) => {
                                            const f = result[0]
                                            res.send({ field: {...f, is_primary: true} })
                                        })
                                    }) );
                                }else{
                                    tablesConnector.selectOne( "field_id", field_id, (result) => {
                                        const f = result[0]
                                        res.send({ field: {...f, is_primary: true} })
                                    })
                                }
                            })

                        })
                    })
                })
            })
        }else{
            tablesConnector.insertOne(values, (result) => {
                const field_id = result.insertId;
                tablesConnector.selectOne( "field_id", field_id, (result) => {
                    const f = result[0]
                    const query = `
                        ALTER TABLE ${table_name} ADD COLUMN ${ f.field_name } ${ dataTypeReGen( f ) }
                    `;
                    console.log(query)
                    connector(query, (result) => {
                        res.send({ field: f })
                    })
                })
            })
        }

})

router.get('/table/foreigns/:table_id', (req, res) => {
    const { table_id } = req.params;
    connector(`
        SELECT TABLES.table_id, table_name, table_alias, field_id, field_name, field_alias
        FROM TABLES INNER JOIN FIELDS
        ON FIELDS.TABLE_ID = TABLES.TABLE_ID
        WHERE FIELD_ID IN (
        	SELECT REFERENCE_ON FROM _keys
        	WHERE FIELD_ID IN
        	(
        		SELECT FIELD_ID
        		FROM tables AS T INNER JOIN fields AS F
        			ON T.TABLE_ID = F.TABLE_ID
        		WHERE T.TABLE_ID = ${ table_id }
        	) AND KEY_TYPE = 'foreign'
        )
    `, (result) => {
        const foreignKeys = result;
        if( foreignKeys ){

            connector(`
                SELECT * FROM FIELDS AS F INNER JOIN _KEYS AS K
                ON F.FIELD_ID = K.FIELD_ID WHERE TABLE_ID = ${table_id}
                AND KEY_TYPE = 'foreign'
                `, (result) => {

                    const fields = result.map( field => {
                        foreignKey = foreignKeys.filter( fk => fk.field_id === field.reference_on )[0];
                        return {
                            key_id: field.key_id,
                            field: {
                                field_id: field.field_id,
                                field_name: field.field_name,
                                field_alias: field.field_alias,
                            },
                            reference: {
                                table_id: foreignKey.table_id,
                                table_name: foreignKey.table_name,
                                table_alias: foreignKey.table_alias
                            },
                            on: {
                                field_id: foreignKey.field_id,
                                field_name: foreignKey.field_name,
                                field_alias: foreignKey.field_alias,
                            }
                        }
                    });
                    res.send( { fields } )
                })
        }else{
            res.send({ fields: [] })
        }
    })
})

router.post('/table/key/foreign', ( req, res ) => {
    const { key } = req.body;
    const keysConnector = new Table('_keys');

    connector(`
        SELECT * FROM _keys WHERE field_id = ${ key.field.field_id } AND reference_on = ${ key.on.field_id }
    `, (result) => {

        if( result.length === 0 ){
            const values = [
                { field: "field_id", value: key.field.field_id },
                { field: "key_type", value: "foreign" },
                { field: "reference_on", value: key.on.field_id }
            ]
            keysConnector.insertOne( values, ( insertResult ) => {

                connector(`
                    SELECT table_name FROM tables AS T INNER JOIN fields AS F
                        ON T.table_id = F.table_id
                    WHERE field_id = ${ key.field.field_id }
                `, (result) => {
                    const table = result[0];
                    const alterQuery = `
                            ALTER TABLE ${ table.table_name } ADD CONSTRAINT fk_${key.field.field_id}_${key.on.field_id}
                            FOREIGN KEY ( ${key.field.field_name} )
                            REFERENCES ${ key.reference.table_name }( ${key.on.field_name} )
                            ON UPDATE CASCADE
                            ON DELETE CASCADE;
                    `
                    // console.log(alterQuery)
                    connector(alterQuery, (result) => {
                        res.send({ insertResult })
                    })
                })
            })
        }else{
            res.send({ success: false })
        }
    })

})

router.post('/alter/table/drop/column', (req, res) => {
    const { field_id } = req.body;
    const fieldsConnector = new Table('fields');
    const keysConnector = new Table('_keys');
    fieldsConnector.selectOne("field_id", field_id, result => {
        const field = result[0];
        connector(`
            SELECT table_name FROM tables AS T INNER JOIN fields AS F
            ON T.table_id = F.table_id
            WHERE field_id = ${ field_id }
        `, (result) => {
            const table = result[0];

            /* foreign key drop will be deplay soon */

            fieldsConnector.deleteOne( "field_id", field_id, (result) => {
                keysConnector.deleteOne("field_id", field_id, (result) => {
                    const query = `
                        ALTER TABLE ${ table.table_name } DROP COLUMN ${ field.field_name }
                    `;
                    connector( query, (result) => {
                        console.log(query);
                        res.send({ success: true })
                    })
                })
            })
        })
    })
})

router.post('/alter/table/modify/column', (req, res) => { /* Check foreign key constraint and alert the user */
    const { data, type } = req.body;
    const criteria = { field: "field_id", value: data.field_id };
    const values = [
        { field: "field_name", value: data.field_name },
        { field: "field_alias", value: data.field_alias },
        { field: "nullable", value: data.is_nullable == true ? "1" : "0" },
        { field: "field_data_type", value: type.name },
        { field: "default_value", value: data.default },
        { field: "field_props", value: data.props ? JSON.stringify(data.props) : JSON.stringify({"null" : "được chưa"}) }
    ]

    const fieldsConnector = new Table('fields');
    fieldsConnector.updateOne( criteria, values, (result) => {
        fieldsConnector.selectOne( "field_id", data.field_id, (result) => {
            const newField = result[0];
            if( !data.is_primary ){

                connector(`
                    SELECT table_name, t.table_id
                    FROM tables AS T INNER JOIN fields AS F
                    ON T.table_id = F.table_id
                    WHERE field_id = ${ data.field_id }
                `, result => {
                    const { table_name, table_id } = result[0];

                    connector(`
                        ALTER TABLE ${ table_name } DROP PRIMARY KEY;
                    `, result => {

                        connector(`
                            DELETE FROM _keys WHERE field_id = ${ data.field_id } AND key_type='primary';
                            `, (result) => {

                                connector(`
                                    SELECT * FROM _keys
                                    WHERE key_type = 'primary' and field_id IN (
                                        SELECT field_id FROM fields WHERE table_id = ${table_id}
                                    );
                                `, (keys) => {
                                    alterPrimaryKeys(table_id, keys, (result) => {

                                        const fc = new Table("fields");
                                        fc.selectOne("field_id", data.field_id, (result) => {
                                            const _field = result[0];
                                            connector(`
                                                ALTER TABLE ${table_name} MODIFY COLUMN ${ _field.field_name } ${ dataTypeReGen( _field ) }
                                            `, result => {
                                                console.log(`
                                                    ALTER TABLE ${table_name} MODIFY COLUMN ${ _field.field_name } ${ dataTypeReGen( _field ) }
                                                `)
                                                res.send({ success: true, field: { ...newField, is_primary: false } })
                                            })
                                        })
                                    })
                                })
                            })
                    })
                })

            }else{
                const keysConnector = new Table('_keys');
                connector(`
                    SELECT * FROM _keys WHERE field_id = ${ data.field_id } AND key_type = 'primary'`
                , (result) => {
                    if( result.length > 0 ){
                        connector(`
                            SELECT table_name, t.table_id
                            FROM tables AS T INNER JOIN fields AS F
                            ON T.table_id = F.table_id
                            WHERE field_id = ${ data.field_id }
                        `, result => {
                            const { table_name, table_id } = result[0];

                            connector(`
                                ALTER TABLE ${ table_name } DROP PRIMARY KEY;
                            `, result => {

                                connector(`
                                    SELECT * FROM _keys
                                    WHERE key_type = 'primary' and field_id IN (
                                        SELECT field_id FROM fields WHERE table_id = ${table_id}
                                    );
                                `, (keys) => {

                                    alterPrimaryKeys(table_id, keys, (result) => {
                                        const fc = new Table("fields");
                                        fc.selectOne("field_id", data.field_id, (result) => {
                                            const _field = result[0];
                                            connector(`
                                                ALTER TABLE ${table_name} MODIFY COLUMN ${ _field.field_name } ${ dataTypeReGen( _field, true ) }
                                            `, result => {
                                                console.log(`
                                                    ALTER TABLE ${table_name} MODIFY COLUMN ${ _field.field_name } ${ dataTypeReGen( _field, true ) }
                                                `)
                                                res.send({ success: true, field: { ...newField, is_primary: true } })
                                            })
                                        })

                                    })
                                })
                            })
                        })
                    }else{

                        connector(`
                            INSERT INTO _keys(field_id, key_type) VALUES(${ data.field_id }, 'primary')`
                        , (result) => {
                            connector(`
                                SELECT table_name, t.table_id
                                FROM tables AS T INNER JOIN fields AS F
                                ON T.table_id = F.table_id
                                WHERE field_id = ${ data.field_id }
                            `, result => {
                                const { table_name, table_id } = result[0];

                                connector(`
                                    ALTER TABLE ${ table_name } DROP PRIMARY KEY;
                                `, result => {

                                    connector(`
                                        SELECT * FROM _keys
                                        WHERE key_type = 'primary' and field_id IN (
                                            SELECT field_id FROM fields WHERE table_id = ${table_id}
                                        );
                                    `, (keys) => {

                                        alterPrimaryKeys(table_id, keys, (result) => {
                                            const fc = new Table("fields");
                                            fc.selectOne("field_id", data.field_id, (result) => {
                                                const _field = result[0];
                                                connector(`
                                                    ALTER TABLE ${table_name} MODIFY COLUMN ${ _field.field_name } ${ dataTypeReGen( _field ) }
                                                `, result => {
                                                    console.log(`
                                                        ALTER TABLE ${table_name} MODIFY COLUMN ${ _field.field_name } ${ dataTypeReGen( _field ) }
                                                    `)
                                                    res.send({ success: true, field: { ...newField, is_primary: true } })
                                                })
                                            })

                                        })
                                    })
                                })
                            })
                        })
                    }
                })
            }
        })
    })
})

router.post('/modify/table', (req, res) => {
    const { table } = req.body;
    const tables = new Table('tables');
    tables.updateOne(
        { field: "table_id", value: table.table_id },
        [
            { field: "table_alias",  value: table.table_alias },
        ],
         ( result ) => {
             res.send( { result })
         }
    )
})

router.post('/drop/table', (req, res) => {
    const { table_id } = req.body;
    const tables = new Table('tables');
    tables.selectOne("table_id", table_id, ( result ) => {
        const { table_name } = result[0];

        connector(`
            DROP TABLE ${ table_name };
        `, result => {
            /*
                !important
                Remove foreign key before dropping table
            */
            tables.deleteOne('table_id', table_id, (result) => {
                connector(`
                    DELETE FROM _keys WHERE
                    field_id IN
                    ( SELECT field_id FROM fields WHERE table_id = ${table_id} )
                    OR reference_on IN
                    ( SELECT field_id FROM fields WHERE table_id = ${table_id} )
                    `, (result) => {
                        res.send({ success: true })
                    })
                })
        })
    })
})

router.post('/modify/foreign/key', (req, res) => {
    const { key } = req.body;
    // console.log(key)
    const _keys = new Table('_keys');
    _keys.selectOne( "key_id", key.key_id, (result) => {
        const oldKey = result[0];
        _keys.updateOne({ field: "key_id", value: key.key_id }, [
            { field: "field_id", value: key.field.field_id },
            { field: "reference_on", value: key.on.field_id }
        ], (result) => {

            const fields = new Table("fields");
            connector(`
                SELECT *
                FROM tables AS T INNER JOIN fields AS F
                ON T.table_id = F.table_id
                WHERE field_id = ${ oldKey.field_id }
                `
            , ( result ) => {
                const oldKeyField = result[0];

                connector(`
                    SELECT *
                    FROM tables AS T INNER JOIN fields AS F
                    ON T.table_id = F.table_id
                    WHERE field_id = ${ oldKey.reference_on }
                `, (result) => {
                    const oldKeyReference = result[0];

                    const query = `
                        ALTER TABLE ${oldKeyField.table_name} DROP CONSTRAINT fk_${oldKeyField.field_id}_${ oldKeyReference.field_id };
                    `;
                    connector( query, (result) => {

                        connector( `
                        SELECT *
                        FROM tables AS T INNER JOIN fields AS F
                        ON T.table_id = F.table_id
                        WHERE field_id = ${ key.field.field_id }`, (result) => {
                            const newKeyField = result[0];
                            connector(`
                                ALTER TABLE ${newKeyField.table_name} ADD CONSTRAINT fk_${newKeyField.field_id}_${ key.on.field_id }
                                FOREIGN KEY ( ${ key.field.field_name } ) REFERENCES ${ key.reference.table_name }(${ key.on.field_name })
                                ON UPDATE CASCADE ON DELETE CASCADE;
                            `, result => {
                                res.send({ success: true })
                            })
                        })
                    })
                });
            })
        })
    })
})

module.exports = {
    router
}

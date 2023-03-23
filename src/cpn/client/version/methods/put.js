import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

export default ( props ) => {

    const { version, project_id, tables, closeDialog } = props;
    const dispatch = useDispatch()
    const { proxy, unique_string, collection, collections } = useSelector(state => state);
    const { addApiToCollection, auto_id } = useSelector( state => state.functions );
    const [ height, setHeight ] = useState(0);
    const [ tablesHeight, setTablesHeight ] = useState(0);

    const [ filter, setFilter ] = useState([])
    const [ filtedTables, setFiltedTables ] = useState([]);
    const [ selectedTables, setSelectedTables ] = useState([])
    const [ params, setParams ] = useState([])
    const [ filtedFields, setFiltedFields ] = useState([]);
    const [ selectedFields, setSelectedFields ] = useState([]);
    const [ customFields, setCustomFields ] = useState([]);

    const criterias = [
        { id: 1, label: "GET", value: "get" },
        { id: 2, label: "POST", value: "post" },
        { id: 3, label: "PUT", value: "put" },
        { id: 4, label: "DELETE", value: "delete" },
    ]

    const [ drop, setDrop ] = useState(false);

    const [ api, setApi ] = useState({
        type: criterias[2],
        url: {},
        name: "API mới nè"
    })


    const createUniqueURL = (baseURL) => {
        const uniqueID = uuidv4().replaceAll("-", '');
        return { url: `/api/${ project_id }/${version.version_id}/${uniqueID}`, proxy, id_str: uniqueID };
    }

    useEffect( () => {
        setApi({ ...api, url: createUniqueURL() })
    }, [ version ])

    useEffect(() => {
        setFiltedTables(tables)
    }, [tables])

    const dropTables = () => {
        setDrop( !drop )
    }

    const submitApi = () => {
        const url = { ...api.url, url: api.url.url + generateParams().url, params }
        const submitBody = {
            ...api,
            tables: selectedTables,
            fields: selectedFields,
            collection,
            url,
            status: false,
            fullurl: api.url.proxy + url.url,
            customFields
        }

        fetch(`${proxy}/api/${ unique_string }/apis/api`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ data: submitBody })
        }).then( res => res.json() ).then( res => {
            closeDialog()
            delete submitBody.collection;
            addApiToCollection( collections, collection, submitBody )
        })
    }

    const doesFieldBelongToTable = (field, table) => {
        const { fields } = table;
        if( fields != undefined ){
            const existed = fields.filter( f => f.field_id === field.field_id );
            if( existed != 0 ){
                return true
            }else{
                return false
            }
        }else{
            return false;
        }
    }

    const filterAdd = ( table ) => {
        const newFiltedTables = filtedTables.filter( tb => tb.table_id != table.table_id );
        setSelectedTables([ ...selectedTables, table ])
        setFiltedTables(newFiltedTables)
        setFiltedFields([ ...filtedFields, ...table.fields ])
    }
    const filterRemove = ( table ) => {
        // const newSelectedTables = selectedTables.filter( tb => tb.table_id != table.table_id );
        // setFiltedTables([ ...filtedTables, table ])
        // setSelectedTables(newSelectedTables)
        // const newFiltedFields = filtedFields.filter( f => !doesFieldBelongToTable( f, table ) );
        // setFiltedFields( newFiltedFields );


        setFiltedTables([ ...filtedTables, ...selectedTables ])
        setSelectedTables([ ])
        setFiltedFields( [  ] );
        setSelectedFields([ ])
    }

    const haveFieldId = ( table, field_id ) => {
        if( table.fields != undefined ){
            const fields = table.fields.filter( f => f.field_id == field_id );
            if( fields.length > 0 ){
                return true
            }else{
                return false
            }
        }else{
            return false;
        }
    }

    const dependencedTablesFilter = ( field_id ) => {
        const depenses = filtedTables.map( table => {
            const { constraint } = table;
            if( constraint != undefined ){
                const dependExised = constraint.filter( constr => constr.reference_on == field_id).length;
                if( dependExised != 0 ){
                    return table;
                }else{
                    return null;
                }
            }
        })
        return depenses.filter( d => d != null )
    }

    const generateFiltedTables = () => {
        if( selectedTables.length > 0 ){

            const showTables = filtedTables.map( table => {

                for( let i = 0; i < selectedTables.length; i++ ){
                    const { constraint } = selectedTables[i];

                    if( constraint != undefined ){

                        for( let j = 0; j < constraint.length; j++){

                            const constr = constraint[j];
                            if( haveFieldId( table, constr.reference_on ) ){
                                return table
                            }
                        }
                    }
                }
                return null
            })

            const dependencedTables = filtedTables.map( table => {
                const resultTables = []
                for( let i = 0; i < selectedTables.length; i++ ){
                    const { constraint } = selectedTables[i];

                    if( constraint != undefined ){

                        for( let j = 0; j < constraint.length; j++){

                            const constr = constraint[j];
                            const { constraint_type, field_id } = constr
                            if( constraint_type === "pk" ){
                                const dptb = dependencedTablesFilter( field_id );
                                resultTables.push(...dptb)
                            }
                        }
                    }
                }
                return resultTables
            })

            const finalTables_1 = showTables.filter( tb => tb != null );
            const finalTables_2 = dependencedTables.filter( tb => tb != null );
            const finalTables_3 = []
            const finalTables_4 = []
            for( let i = 0; i < finalTables_2.length; i++ ){
                const tables = finalTables_2[i];
                finalTables_3.push(...tables)
            }
            for( let i = 0; i < finalTables_3.length; i++ ){
                const table = finalTables_3[i];
                if( finalTables_4.indexOf( table ) === -1 ){
                    finalTables_4.push( table )
                }
            }

            return [ ...finalTables_1, ...finalTables_4 ].map( table =>
                <div key={ table.table_id } className="p-1 border-1 m-1 pointer shadow-blur shadow-hover" onClick={ () => { filterAdd(table) } }>
                    <span className="p-0-5">{ table.table_name }</span>
                </div>
            )
        }else{

            return filtedTables.map( table =>
                <div key={ table.table_id } className="p-1 border-1 m-1 pointer shadow-blur shadow-hover" onClick={ () => { filterAdd(table) } }>
                    <span className="p-0-5">{ table.table_name }</span>
                </div>
            )
        }
    }

    const pkExisted = (fk) => {
        const { reference_on } = fk;
        const pk = selectedFields.filter( field => field.field_id == reference_on )
        if( pk != undefined && pk.length > 0 ){
            return true
        }
        return false;
    }


    const fieldSelecting = ( field ) => {
        const fieldConstraints = field.constraints;
        if( fieldConstraints ){

            const fieldFK = fieldConstraints.filter( fc => fc.constraint_type == "fk" );
            if( fieldFK != undefined && fieldFK.length > 0 && pkExisted(fieldFK[0]) ){
                alert("Trường này bị zô hiệu vì khóa chính của nó đang trong danh sách được chọn!")
            }else{
                if( selectedFields.indexOf( field) == -1 ){
                    setSelectedFields( [ ...selectedFields, field ] )
                }
            }
        }else{
            if( selectedFields.indexOf( field) == -1 ){
                setSelectedFields( [ ...selectedFields, field ] )
            }
        }
    }

    const fieldDisselecting = ( field ) => {
        const newSelectedFields = selectedFields.filter( f => f.field_id != field.field_id );
        const newParams = params.filter( f => f.field_id != field.field_id )
        setSelectedFields( [...newSelectedFields] )
        setParams(newParams)
    }

    const generateParams = () => {
        const paramNames = params.map( field => {
            const splitted_name = field.field_name.split(' ');
            return `:${splitted_name.join('_')}`
        })

        const paramAlias = params.map( field => {
            return `:${ field.field_alias }`
        })

        return {
            display: '/' + paramNames.join('/'),
            url: '/' + paramAlias.join('/'),
        }
    }

    const addOrRemoveFromURLParams = ( e, field ) => {
        e.preventDefault()
        if( params.indexOf( field ) != -1 ){
            const newParams = params.filter( f => f.field_id != field.field_id )
            setParams(newParams)

        }else{
            setParams([ ...params, field ])
        }
    }

    const addCustomFields = () => {
        const newFieldAlias = auto_id()
        const cusField = {
            name: "Trường mới",
            field_alias: newFieldAlias,
            fomular: ""
        }
        setCustomFields([...customFields, cusField])
    }

    const updateCustomField = ( field, field_type, value ) => {
        field[ field_type ] = value
        const newCustomFields = customFields.map( f => {
            if( f.field_alias === field.field_alias ){
                return field;
            }else{
                return f
            }
        })
        setCustomFields( newCustomFields )
    }

    const updateField = ( field, field_type, value ) => {
        field[ field_type ] = value
        const newCustomFields = selectedFields.map( f => {
            if( f.field_alias === field.field_alias ){
                return field;
            }else{
                return f
            }
        })
        setSelectedFields( newCustomFields )
    }

    /* Em da lo yeu nguoi khong thuong em */
    /*
        Chia cai chon bang voi chon truong ra troi oi
    */

    return(
        <div className="fixed-default z-index-11 fullscreen p-1">
            <div className="rel z-index-2 container bg-white h-fit column">
                <div className="column w-100-pct h-fit p-0-5">
                    <div className="flex flex-no-wrap border-1-bottom">
                        <div className="fill-available p-t-1 p-b-0-5">
                            <input className="no-border w-100-pct text-24-px" value={ api.name }
                                onChange = { (e) => { setApi({ ...api, name: e.target.value }) } } placeholder="API name here"/>
                        </div>
                    </div>

                    <div className="flex flex-no-wrap">
                        <div className="w-100-px flex flex-middle">
                            <button className="no-border w-100-pct text-center pointer block p-0-5 text-16-px">{ api.type.label }</button>
                        </div>
                        <div className="fill-available flex flex-wrap">
                            <div className="w-max-content">
                                <span className="text-16-px block p-1">Proxy: <b>{ api.url.proxy }</b></span>
                            </div>
                            <div className="w-max-content">
                                <span className="text-16-px block p-1">URL: <b>{ api.url.url + generateParams().display }</b></span>
                            </div>
                        </div>
                    </div>
                    <div className="rel z-index-9">
                        <div className={"abs t-0 l-0 bg-white " + ( height != 0 ? " shadow-blur": "" )}>
                            <div className="w-100-px overflow ease" style={{ height }}>
                            { criterias.map( (d, index) =>
                                 <div key={ index }>
                                    <span className="block p-0-5 bg-white pointer hover"
                                        onClick={ () => { setHeight(0); setApi({...api, type: d}) } }
                                    >{ d[ "label" ] }</span>
                                 </div>
                              )}
                            </div>
                        </div>
                    </div>

                    <div className="flex w-100-pct flex-no-wrap p-0-5">
                        <div className="fill-available flex flex-no-wrap scroll-x">
                            { selectedTables.map( table =>
                                <div key={ table.table_id } className="p-1 w-max-content border-1 m-1 pointer shadow-blur shadow-hover" onClick={ () => { filterRemove(table) } }>
                                    <span className="p-0-5">{ table.table_name }</span>
                                </div>
                            )}
                        </div>
                        <div className="w-48-px flex flex-middle">
                            <button onClick={ dropTables } className="bold text-24-px no-border bg-green white border-radius-50-pct pointer" style={{ width: "32px", height: "32px" }}>{ drop ? "–": "+" }</button>
                        </div>
                    </div>

                    <div className="rel z-index-8 w-100-pct">
                        <div className="abs-default w-100-pct shadow-blur ease bg-white no-overflow" style={{ height: drop ? 350: 0 }}>
                            <div className="w-100-pct overflow" style={{ height: 350 }}>
                                <div className="flex flex-wrap">
                                    { generateFiltedTables() }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-1 fill-available">

                        <div>
                            <div className="flex flex-no-wrap h-fit">
                                <div className="w-50-pct p-1 h-fit overflow" style={{ height: "400px" }}>
                                    { selectedTables.map( table =>
                                        <div className="p-0-5 bg-white shadow-blur m-t-2">
                                            <span className="block text-20-px">{ table.table_name }</span>
                                        { table.fields.map( field =>
                                            <div key={field.field_id} className="m-t-1 pointer" onClick={ () => { fieldSelecting( field ) } }>
                                                <span className="block hover text-16-px p-1 w-100-pct bg-white shadow-blur">{ field.field_name }</span>
                                            </div>
                                         ) }
                                        </div>
                                    ) }
                                </div>
                                <div className="w-50-pct p-1 h-fit overflow" style={{ height: "400px" }}>
                                    { selectedFields.map( field =>
                                        <div key={field.field_id} className="m-t-1 pointer"
                                            onClick={ () => { fieldDisselecting( field ) } }
                                            onContextMenu={ (e) => { addOrRemoveFromURLParams( e, field ) } }
                                        >
                                            <span className="block hover text-16-px p-1 w-100-pct bg-white shadow-blur">{ field.field_name }</span>
                                        </div>
                                    ) }
                                </div>
                            </div>
                            <hr className="border-1-top"/>
                        </div>

                    </div>
                </div>
                <div className="abs b-0 r-0 p-1">
                    <button onClick={ submitApi } className="upper pointer block w-max-content white text-center p-t-0-5 p-b-0-5 p-l-1 p-r-1 no-border bg-green">Thêm</button>
                </div>
            </div>
            <div className="abs-default z-index-1 fullscreen trans-dark" onClick={ closeDialog }></div>
        </div>
    )
}

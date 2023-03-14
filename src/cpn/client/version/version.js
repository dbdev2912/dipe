import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Navbar, Horizon } from '../../navbar';
import Field  from './table-field';
import $ from 'jquery';

import AddConstraint from './add-constraint';
import AddApi from './add-api';
import ApiDesign from './api';

const cardMinHeight = 400;

export default () => {
    const dispatch = useDispatch();

    const{ project_id, version_id } = useParams()

    const { urls, bottomUrls } = useSelector( state => state.navbarLinks.su )
    const { dateGenerator, autoLabel, openTab } = useSelector( state => state.functions )
    const { navState, unique_string, proxy, addConstraintBox, addApi } = useSelector( state => state );

    const [ project, setProject ] = useState({})
    const [ version, setVersion ] = useState({})
    const [ tables, setTables ] = useState([]);
    const [ table, setTable ] = useState({});
    const [ _table, _setTable ] = useState({});


    const [ tableState, setTableState ] = useState(true);

    useEffect( () => {
        dispatch({
            type: "setNavBarHighLight",
            payload: { url_id: 1 }
        })

        fetch(`${ proxy }/api/${ unique_string }/projects/project/${project_id}/ver/${version_id}`)
        .then( res => res.json() ).then( res => {
            const { project, version } = res.data;
            const { tablesDetail } = res;

            const tables = tablesDetail.map( table => {
                const { constraint, fields } = table;
                if( table.fields != undefined ){
                    table.fields = fields.map( field => {
                        if( constraint!= undefined ){
                            field.constraints = constraint.filter( constr => constr.field_id === field.field_id )
                        }
                        const props = JSON.parse( field.field_props )

                        return { ...field, ...props }
                    })
                }
                return table;
            });

            setTables( tables );
            setProject( project[0] )
            setVersion( version[0] )
            setTable( tablesDetail[0] )
            _setTable( tablesDetail[0] )
        })

    }, [])

    const reInitialization = () => {
        fetch(`${ proxy }/api/${ unique_string }/projects/project/${project_id}/ver/${version_id}`)
        .then( res => res.json() ).then( res => {
            const { project, version } = res.data;
            const { tablesDetail } = res;

            const tables = tablesDetail.map( table => {
                const { constraint, fields } = table;
                if( table.fields != undefined ){
                    table.fields = fields.map( field => {
                        if( constraint!= undefined ){
                            field.constraints = constraint.filter( constr => constr.field_id === field.field_id )
                        }
                        const props = JSON.parse( field.field_props )

                        return { ...field, ...props }
                    })
                }
                return table;
            });

            setTables( tables );
            setProject( project[0] )
            setVersion( version[0] )
            setTable( tablesDetail[0] )
            _setTable( tablesDetail[0] )
        })
    }

    const scrollTo = (e) =>{
        $(e.target).find('a')[0].click()
    }

    const changeTable = (table) => {
        setTable(table)
        _setTable( table )
    }

    const tableStateSwitch = () => {
        if( !tableState ){
            setTableState( !tableState )
            const { table_name, table_id } = table;
            fetch(`${proxy}/api/${ unique_string }/tables/modify`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ table_name, table_id })
            }).then(res => res.json()).then( res => {

            })
        }else{
            setTableState( !tableState )
        }
    }

    const tableNameEnterTrigger = (e) => {
        if( e.keyCode === 13 ){
            tableStateSwitch()
        }
    }

    useEffect(() => {

        $('#table-name').focus();

    }, [ tableState ])

    const createTable = () => {

        const newTable = {
            table_name: "Bảng mới",
            version_id
        }
        fetch(`${proxy}/api/${ unique_string }/tables/create`, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(newTable)
        }).then( res => res.json() ).then( res => {
            const { success, content, data } = res;
            const date = new Date()
            const _table = { ...data, field: [], create_on: date.toString() }
            setTables( [...tables, _table] );
            setTable( _table );
        })
    }

    const createField = () => {

        const { table_id } = table;

        const newField = {
            table_id,
            field_name: "Trường mới",
            nullable: true,
            field_data_type: "VARCHAR",
            field_props: { "LENGTH": 255},
            default_value: "",
        }

        fetch( `${proxy}/api/${ unique_string }/table/create/field`, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(newField)
        }).then( res => res.json() ).then( res => {
            const { success, content, data } = res;
            const _field = { ...data, props: JSON.parse( data.field_props ) }

            updateFields("add", _field)
        })
    }

    const _updateFields = (type, field) => {
        const newFields = table.fields.map( f => {
            if( f.field_id === field.field_id ){
                return field
            }
            return f;
        })
        const newTable = { ...table, fields: newFields }
        setTable( newTable )

        const newTables = tables.map(tb => {
            if( tb.table_id === newTable.table_id ){
                return newTable
            }else{
                return tb
            }
        })

        setTables( newTables )
    }

    const _addFields = ( type, field ) => {
        const newFields = table.fields ? [...table.fields, field] : [ field ];

        const newTable = { ...table, fields: newFields }
        setTable( newTable )

        const newTables = tables.map(tb => {
            if( tb.table_id === newTable.table_id ){
                return newTable
            }else{
                return tb
            }
        })

        setTables( newTables )
    }

    const _removeField = ( type, field ) => {
        const newFields = table.fields.filter( f => f.field_id != field.field_id );
        const newTable = { ...table, fields: newFields }

        setTable( newTable )
        const newTables = tables.map(tb => {
            if( tb.table_id === newTable.table_id ){
                return newTable
            }else{
                return tb
            }
        })
        setTables( newTables )
    }

    const updateFields = ( type, field ) => {
        switch (type) {
            case "update":
                _updateFields( type, field )
                break;
            case "add":
                _addFields( type, field )
                break;
            case "remove":
                _removeField( type, field )
                break;
            default:
                break;
        }
    }

    const removeTable = ( table ) => {
        const { table_id } = table;

        fetch(`${ proxy }/api/${ unique_string }/tables/drop/${ table_id }`, {
            method: "DELETE",
        }).then( res => res.json() ).then( res => {
            const newTables = tables.filter( tb => tb.table_id !== table_id );

            setTables( newTables );
            setTable( newTables[ newTables.length - 1 ] )
        })
    }

    return(
        <div className="fixed-default fullscreen main-bg overflow flex flex-no-wrap">
            <Navbar urls={ urls } bottomUrls={ bottomUrls } />
            <div id="app-container" className={`app fixed-default overflow ${ !navState ? "app-stretch": "app-scaled" }`} style={{ height: "100vh" }}>
                <Horizon />

                <div className="p-1" id="app-scrollBox">
                    {/* VERSION INFO */}
                    <div className="min-height-full-screen">
                        <div className="flex flex-wrap m-t-1">
                            <div className="w-100-pct p-1 scaled-card">
                                <div className="p-1 bg-white h-fit shadow-blur">
                                    <span className="block text-28-px">{ version.version_name }</span>
                                    <span className="block text-18-px gray">{ project.project_name }</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap flex-center">
                            <div onClick={ scrollTo } className="project-card bg-white shadow-blur shadow-hover pointer m-1 p-1" style={{ minHeight: cardMinHeight }}>
                                <span className="block text-center p-1 text-20-px">Cơ sở dữ liệu</span>
                                <hr className="border-1-t"/>
                                <a className="hidden" href="#database"></a>
                            </div>

                            <div onClick={ scrollTo } className="project-card bg-white shadow-blur shadow-hover pointer m-1 p-1" style={{ minHeight: cardMinHeight }}>
                                <span className="block text-center p-1 text-20-px">API</span>
                                <hr className="border-1-t"/>
                                <a className="hidden" href="#api"></a>
                            </div>

                            <div className="project-card bg-white shadow-blur shadow-hover pointer m-1 p-1" style={{ minHeight: cardMinHeight }}>
                                <span className="block text-center p-1 text-20-px">UI</span>
                                <hr className="border-1-t"/>
                            </div>

                            <div className="project-card bg-white shadow-blur m-1 p-1" style={{ minHeight: cardMinHeight }}>
                                <span className="block text-center p-1 text-20-px">Thao tác</span>
                                <hr className="border-1-t"/>
                            </div>
                        </div>
                    </div>

                    { /* DATABASE DESIGN */ }
                    <div className="w-100-pct mg-auto p-t-5" style={{ height: "90vh" }} id="database">
                        <div className="flex flex-no-wrap h-fit ">
                            <div className="w-35-pct column h-fit p-1">
                                {/* SEARCH AND ADD */}
                                <div className="flex flex-no-wrap bg-white shadow-blur">
                                    <div className="fill-available p-1">
                                        <input className="no-border w-100-pct" placeholder="..."/>
                                    </div>
                                    <div className="w-48-px flex flex-middle">
                                        <button onClick={ createTable } className="bold text-24-px no-border bg-green white border-radius-50-pct pointer" style={{ width: "32px", height: "32px" }}>+</button>
                                    </div>
                                </div>


                                <div className="fill-available overflow m-t-1">
                                { tables.length > 0 && tables.map( table =>
                                    <div key={table.table_id} onClick={ () => { changeTable( table ) } } className="table-hover rel block m-b-1 p-1 bg-white shadow-blur shadow-hover pointer">
                                        <span className="block text-20-px">{ table.table_name }</span>
                                        <div className="abs r-0 t-0 p-0-5" onClick={ () => { removeTable(table) } }>
                                            <img className="w-20-px ease" src="/assets/icon/cross-color.png" />
                                        </div>
                                        <div className="flex flex-no-wrap m-t-3">
                                            <div className="fill-available">
                                                <span className="block text-14-px gray">{ dateGenerator(table.create_on) }</span>
                                            </div>
                                        </div>
                                    </div>
                                ) }
                                </div>
                            </div>
                            <div className="w-65-pct p-1">
                                <div className="block h-fit bg-white scroll-y p-1 shadow-blur">


                                    {/* TABLE HEADER */}
                                    {tables.length > 0 &&
                                    <div className="p-0-5">
                                        <div className="flex rel">
                                            <div className="flex flex-bottom w-100-pct">
                                                { !tableState ?
                                                    <input id="table-name" className="block text-20-px no-border w-100-pct" value={ table.table_name }
                                                        onChange={ (e) => { setTable({ ...table, table_name: e.target.value }) } }
                                                        onKeyUp = { tableNameEnterTrigger }
                                                    />
                                                    :
                                                    <span className="block text-20-px">{ table.table_name }</span>
                                                }
                                            </div>
                                            <div className="w-32-px rel m-r-1">
                                                <div className="abs b-0 r-0" onClick={ () => { openTab( `/su/project/${project_id}/version/${ version_id }/table/${ table.table_id }/input` ) } }>
                                                    <img src="/assets/icon/import.png" className="w-18-px pointer"/>
                                                </div>
                                            </div>
                                            <div className="w-32-px rel">
                                                <div className="abs b-0 r-0" onClick={ tableStateSwitch }>
                                                    <img src="/assets/icon/edit.png" className="w-24-px pointer"/>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="block border-1-top"/>

                                        <div className="block">
                                            <div className="flex flex-no-wrap bg-white shadow-blur">
                                                <div className="fill-available p-1">
                                                    <input className="no-border text-16-px w-100-pct" placeholder="Tìm kiếm ..."/>
                                                </div>
                                                { table.fields  ?
                                                    <div className="w-48-px flex flex-middle">
                                                        <button onClick={ createField } className="bold text-24-px no-border bg-green white border-radius-50-pct pointer" style={{ width: "32px", height: "32px" }}>+</button>
                                                    </div>
                                                    : null
                                                 }
                                            </div>
                                            <div className="rel m-t-1">
                                                <div className="field-drop p-1 bg-white shadow-blur w-100-pct" >
                                                    <div className="flex flex-no-wrap">
                                                        <div className="fill-available">
                                                            <span className="block bold text-16-px upper">Tên trường</span>
                                                        </div>
                                                        <div className="w-25-pct">
                                                            <span className="block bold text-16-px upper">Kiểu</span>
                                                        </div>
                                                        <div className="w-24-px flex flex-middle">
                                                            <span className="block bold text-16-px upper">NULL</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            { table.fields ? table.fields.map( field =>
                                                <Field  key={ field.field_id } field={ field }
                                                        tables={ tables }
                                                        table={ table }
                                                        updateFields={ updateFields }
                                                        reInitialization={ reInitialization }
                                                        />

                                            ) :
                                            <div className="block m-t-1 p-1 w-100-pct ml-auto">
                                                <div className="flex flex-wrap w-100-pct flex-middle" style={{ height: 100 }}>
                                                    <span className="text-16-px gray w-100-pct block text-center">Chưa có trường nào trên bảng này</span>
                                                    <div className="w-48-px flex flex-middle">
                                                        <button onClick={ createField } className="bold text-24-px no-border bg-green white border-radius-50-pct pointer" style={{ width: "32px", height: "32px" }}>+</button>
                                                    </div>
                                                </div>
                                            </div>
                                            }
                                        </div>


                                    </div>
                                    }





                                </div>
                            </div>
                        </div>
                    </div>

                    {/* API DESIGN */}

                    <ApiDesign version={ version }/>



                </div>

            </div>
            { addConstraintBox ?
                <AddConstraint tables={ tables } currentTable={ table } updateFields={updateFields}/>
                : null
             }

             { addApi ?
                 <AddApi />
                 : null
              }
        </div>
    )
}

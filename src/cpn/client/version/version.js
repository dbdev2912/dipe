import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Navbar, Horizon } from '../../navbar';
import Field  from './table-field';

const cardMinHeight = 400;

export default () => {
    const dispatch = useDispatch();

    const{ project_id, version_id } = useParams()

    const { urls, bottomUrls } = useSelector( state => state.navbarLinks.su )
    const { dateGenerator, autoLabel, openTab } = useSelector( state => state.functions )
    const { navState, unique_string, proxy } = useSelector( state => state );

    const [ project, setProject ] = useState({})
    const [ version, setVersion ] = useState({})
    const [ tables, setTables ] = useState([]);
    const [ table, setTable ] = useState({});
    const [ _table, _setTable ] = useState({});

    const [ tableState, setTableState ] = useState(false);

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
                table.fields = fields.map( field => {
                    if( constraint!= undefined ){
                        field.constraints = constraint.filter( constr => constr.field_id === field.field_id )
                    }
                    const props = JSON.parse( field.field_props )

                    return { ...field, ...props }
                })
                return table;
            });
            console.log(tables)

            setTables( tables );
            setProject( project[0] )
            setVersion( version[0] )
            setTable( tablesDetail[0] )
            _setTable( tablesDetail[0] )
        })


    }, [])

    const changeTable = (table) => {
        setTable(table)
        _setTable( table )
    }

    const tableStateSwitch = () => {
        setTableState( !tableState )
    }

    const createTable = () => {

    }

    const updateFields = ( type, field ) => {
        switch (type) {
            case "update":

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

                break;
            default:
                break;
        }
    }

    return(
        <div className="fixed-default fullscreen main-bg overflow flex flex-no-wrap">
            <Navbar urls={ urls } bottomUrls={ bottomUrls } />
            <div className={`app fixed-default overflow ${ !navState ? "app-stretch": "app-scaled" }`} style={{ height: "100vh" }}>
                <Horizon />

                <div className="p-1">
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
                            <div className="project-card bg-white shadow-blur m-1 p-1" style={{ minHeight: cardMinHeight }}>
                                <span className="block text-center p-1 text-20-px">Cơ sở dữ liệu</span>
                                <hr className="border-1-t"/>
                            </div>

                            <div className="project-card bg-white shadow-blur m-1 p-1" style={{ minHeight: cardMinHeight }}>
                                <span className="block text-center p-1 text-20-px">API</span>
                                <hr className="border-1-t"/>
                            </div>

                            <div className="project-card bg-white shadow-blur m-1 p-1" style={{ minHeight: cardMinHeight }}>
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
                    <div className="w-100-pct mg-auto" style={{ height: "90vh" }}>
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
                                    <div key={table.table_id} onClick={ () => { changeTable( table ) } } className="block m-b-1 p-1 bg-white shadow-blur shadow-hover pointer">
                                        <span className="block text-20-px">{ table.table_name }</span>
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
                                                { tableState ?
                                                    <input className="block text-20-px no-border w-100-pct" value={ _table.table_name }
                                                        onChange={ (e) => { _setTable({ ..._table, table_name: e.target.value }) } }
                                                    />
                                                    :
                                                    <span className="block text-20-px">{ _table.table_name }</span>
                                                }
                                            </div>
                                            <div className="w-32-px">
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
                                                <div className="w-48-px flex flex-middle">
                                                    <button onClick={ createTable } className="bold text-24-px no-border bg-green white border-radius-50-pct pointer" style={{ width: "32px", height: "32px" }}>+</button>
                                                </div>
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

                                            { table.fields && table.fields.map( field =>
                                                <Field key={ field.field_id } field={ field } tables={ tables } table={ table } updateFields={ updateFields } />
                                            ) }
                                        </div>


                                    </div>
                                    }





                                </div>
                            </div>
                        </div>
                    </div>



                </div>

            </div>
        </div>
    )
}

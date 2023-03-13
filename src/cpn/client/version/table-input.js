import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Navbar, Horizon } from '../../navbar';

import { Varchar } from './inputs';

export default () => {
    const dispatch = useDispatch();

    const{ project_id, version_id, table_id } = useParams()

    const { urls, bottomUrls } = useSelector( state => state.navbarLinks.su )
    const { dateGenerator, autoLabel, openTab } = useSelector( state => state.functions )
    const { navState, unique_string, proxy } = useSelector( state => state );

    const [ fields, setFields ] = useState([]);
    const [ data, setData ] = useState({});

    useEffect( () => {
        fetch(`${ proxy }/api/${ unique_string }/table/${ table_id }/fields`).then( res => res.json() )
        .then( res => {
            const { success, content, fields } = res;
            const formatedFields = fields.map( f => {
                const props = JSON.parse(f.field_props);
                f.props = props;

                return f
            })
            setFields( formatedFields )
        })
    }, [])

    const changeTrigger = ( field, value ) => {
        const newData = data;
        newData[field.field_alias] = value;
        setData( newData )
    }

    const submit = () => {
        console.log( data )
        fetch(`${ proxy }/api/${ unique_string }/table/${ table_id }/data/input`, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({ data })
        }).then( res => res.json() ).then( res => {
            console.log(res)
        })
    }

    return(
        <div className="fixed-default fullscreen main-bg overflow flex flex-no-wrap">
            <Navbar urls={ urls } bottomUrls={ bottomUrls } />
            <div id="app-container" className={`app fixed-default overflow ${ !navState ? "app-stretch": "app-scaled" }`} style={{ height: "100vh" }}>
                <Horizon />

                <div className="p-1" id="app-scrollBox">
                    {/* VERSION INFO */}
                    <span className="block text-16-px">Table { table_id }</span>

                    <div className="w-50-pct mg-auto p-1 bg-white">
                        { fields.map( field =>
                            <React.StrictMode key={field.field_id}>
                                { field.field_data_type == "VARCHAR" ?
                                    <Varchar field={ field } changeTrigger={ changeTrigger }/> : null
                                }
                            </React.StrictMode>
                        )}
                        <div className="m-t-1">
                            <div className="p-1">
                                <button onClick={ submit } className="w-max-content p-0-5 p-l-1 p-r-1 shadow-blur shadow-hover bg-theme-color no-border block text-16-px white pointer shadow-blur shadow-hover">Lưu bảng ghi</button>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    )
}

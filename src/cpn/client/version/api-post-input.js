import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Navbar, Horizon } from '../../navbar';

import {
    Varchar, Text, Int,
    DateInput, TimeInput, DateTimeInput,
    Decimal, Bool,
} from './inputs';

export default () => {
    const dispatch = useDispatch();

    const{ id_str } = useParams()

    const { urls, bottomUrls } = useSelector( state => state.navbarLinks.su )
    const { dateGenerator, autoLabel, openTab } = useSelector( state => state.functions )
    const { navState, unique_string, proxy } = useSelector( state => state );

    const [ api, setApi ] = useState({})
    const [ tables, setTables ] = useState({})
    const [ fields, setFields ] = useState([]);
    const [ data, setData ] = useState({});
    const [ pKconstraints, setPKConstraints ] = useState([])

    useEffect( () => {
        fetch(`${ proxy }/api/${ unique_string }/apis/api/input/info/${ id_str }`).then( res => res.json() )
        .then( res => {
            const { success, fields, tables, constraints, api } = res;
            const formatedFields = fields.map( f => {
                const props = JSON.parse(f.field_props);
                f.props = props;
                if( constraints ){
                    /* Lọc ra ràng buộc có cùng mã trường với trường hiện tại, và ràng buộc không phải ràng buộc khóa chính */
                    f.constraints = constraints.filter( constr => constr.field_id == f.field_id && constr.constraint_type != "pk" );
                }
                return f
            })
            const primaryKey = constraints.filter(constr => constr.constraint_type == "pk")
            setPKConstraints(pKconstraints)
            setTables(tables)
            setApi( api )
            setFields( formatedFields )
        })
    }, [])

    const changeTrigger = ( field, value ) => {
        const newData = data;
        newData[field.field_alias] = value;
        setData( newData )
    }

    const nullCheck = () => {
        let valid = true;
        for( let i = 0; i < fields.length; i++ ){
            const field = fields[i];
            const { nullable, field_alias } = field;
            if( !nullable ){
                if( data[field_alias] == null || data[field_alias] == undefined ){
                    valid = false
                }
            }
        }
        return valid;
    }

    const submit = () => {
        console.log( data )
        if( nullCheck(data) ){
            fetch(api.fullurl, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ data })
            }).then( res => res.json() ).then( res => {
                const { success, data } = res;
                alert( data )
            })
        }else{
            alert("Some unnullable fields are missing data!")
        }
    }

    return(
        <div className="fixed-default fullscreen main-bg overflow flex flex-no-wrap">
            <Navbar urls={ urls } bottomUrls={ bottomUrls } />
            <div id="app-container" className={`app fixed-default overflow ${ !navState ? "app-stretch": "app-scaled" }`} style={{ height: "100vh" }}>
                <Horizon />

                <div className="p-1" id="app-scrollBox">
                    {/* VERSION INFO */}

                    <div className="w-50-pct mg-auto p-1 bg-white">
                        <span className="block text-32-px text-center p-0-5">{ api.name }</span>
                        { fields.map( field =>
                            <React.StrictMode key={field.field_id}>
                                { field.field_data_type == "VARCHAR" ?
                                    <Varchar field={ field } changeTrigger={ changeTrigger }/> : null
                                }
                                { field.field_data_type == "TEXT" ?
                                    <Text field={ field } changeTrigger={ changeTrigger }/> : null
                                }
                                { field.field_data_type == "INT" || field.field_data_type == "BIG INT" ?
                                    <Int field={ field } changeTrigger={ changeTrigger }/> : null
                                }
                                { field.field_data_type == "INT UNSIGNED" || field.field_data_type == "BIG INT UNSIGNED" ?
                                    <Int unsigned={ true } field={ field } changeTrigger={ changeTrigger }/> : null
                                }
                                { field.field_data_type == "DATE" ?
                                    <DateInput field={ field } changeTrigger={ changeTrigger }/> : null
                                }
                                { field.field_data_type == "TIME" ?
                                    <TimeInput field={ field } changeTrigger={ changeTrigger }/> : null
                                }
                                { field.field_data_type == "DATETIME" ?
                                    <DateTimeInput field={ field } changeTrigger={ changeTrigger }/> : null
                                }
                                { field.field_data_type == "DECIMAL" ?
                                    <Decimal field={ field } changeTrigger={ changeTrigger }/> : null
                                }
                                { field.field_data_type == "DECIMAL UNSIGNED" ?
                                    <Decimal unsigned={ true } field={ field } changeTrigger={ changeTrigger }/> : null
                                }
                                { field.field_data_type == "BOOL" ?
                                    <Bool field={ field } changeTrigger={ changeTrigger }/> : null
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

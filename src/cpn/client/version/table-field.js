import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';


import fieldProps from './field-props';
import $ from 'jquery';
import { BOOL, NUMBER, STRING } from './props-input';

import Constraint from './constraint';
const boxHeight = 350;

export default ( props ) => {
    const { field, updateFields, fields, tables, table, readOnly, reInitialization } = props;
    const [ drop, setDrop ] = useState( false )
    const [ type, setType ] = useState({})
    const [ data, setData ] = useState( field )
    const [ height, setHeight ] = useState(0);
    const [ typesHeight, setTypesHeight ] = useState(0);

    const { unique_string, proxy, zIndex, navState } = useSelector( state => state );
    const dispatch = useDispatch()

    const blurTrigger = (e) => {
            e.preventDefault();
            setTimeout(() => {
                setHeight(0)
        }, 135)
    }

    const focusTrigger = () => {
        setHeight(200);
    }

    const fieldDrop = () => {
        if( !readOnly ){
            dispatch({
                type: "setDefaultField",
                payload: { defaultField: field }
            })
            setDrop(!drop)
        }
    }

    const changeType = (type) => {
        const newField = {...data, field_data_type: type.name }


        setType(type)
        updateFields("update", newField )
        setData( newField )
    }

    const changeNULL = () => {
        const { nullable } = data;
        const newField = { ...data, nullable: !nullable }
        setData( newField )
        updateFields("update", newField )
    }

    const changeName = (e) => {
        const newName = e.target.value;
        const newField = { ...data, field_name: newName }
        setData( newField )
        updateFields("update", newField )
    }

    const changeValue = ( val ) => {
        const oldProps = data.props;
        const changedProp = {};
        changedProp[val.key] = val.value
        const newProps = { ...oldProps, ...changedProp }
        const newField = { ...data, props: newProps, field_props: newProps };

        updateFields("update", newField )
        setData( newField )
    }

    const renderProps = () => {
        const dataType = fieldProps.filter( f => f.name == data.field_data_type )[0];
        const { props } = dataType;

        return props.map( prop =>
            <div key={ prop.id }>
                { prop.type == "bool" &&
                    <BOOL defaultValue={ field.props[ prop.name ] } propName={ prop.name } propLabel={ prop.label } changeTrigger={ changeValue }/>}
                { prop.type == "int" &&
                    <NUMBER defaultValue={ field.props[ prop.name ] } propName={ prop.name } propLabel={ prop.label } changeTrigger={ changeValue }/>}
                { prop.type == "text" &&
                    <STRING defaultValue={ field.props[ prop.name ] } propName={ prop.name } propLabel={ prop.label } changeTrigger={ changeValue }/>}

            </div>
        )
    }

    const constraintAddSwitching = () => {
        dispatch({
            type: "setAddConstraintBox",
        })
    }


    const renderContraintType = ( constraint_type ) => {

        switch (constraint_type) {
            case "pk":
                return "Kh??a ch??nh"
                break;
            case "fk":
                return "Kh??a ngo???i"
                break;
            default:
                return "Ki???m so??t gi?? tr???"
                break;
        }

    }
    const renderTableName = ( reference_on ) => {
        const refTable = tables.map( table => {
            if( table.fields != undefined ){
                const refField = table.fields.filter( field => field.field_id === reference_on );

                if( refField.length > 0 ){
                    return table
                }
            }
        });

        const data = refTable.filter( tb => tb != undefined );

        if( data.length > 0 ){
            return data[0].table_name
        }else{
            return " ";
        }

    }
    const renderFieldName = ( reference_on ) => {
        const refTable = tables.map( table => {
            if(table.fields != undefined){
                const refField = table.fields.filter( field => field.field_id === reference_on );

                if( refField.length > 0 ){
                    return refField[0]
                }
            }
        });

        const data = refTable.filter( tb => tb != undefined );

        if( data.length > 0 ){
            return data[0].field_name
        }else{
            return " ";
        }
    }

    const submitChange = () => {
        const { table_id } = table;

        fetch(`${ proxy }/api/${ unique_string }/table/modify/field`, {
            method: "PUT",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({...data, table_id, field_props: JSON.stringify( data.props ) })
        }).then( res => res.json() ).then( res => {
            setDrop(!drop)
        })
    }

    const deleteField = () => {
        updateFields( "remove", field );
        const { table_id } = table;
        fetch(`${ proxy }/api/${ unique_string }/table/field_drop/${ field.field_id }`, {
            method: "DELETE",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({...data, table_id, field_props: JSON.stringify( data.props ) })
        }).then( res => res.json() ).then( res => {

        })
    }

    const removeConstraint = ( constraint_id ) => {
        const { table_id } = table;

        fetch(`${ proxy }/api/${ unique_string }/table/drop_id/constraints`, {
            method: "DELETE",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ table_id, constraint_id })
        }).then( res => res.json() ).then( res => {
            reInitialization()
        })
    }

    return(
        <div className="rel m-t-1">
            <div className="field-drop p-1 bg-white shadow-blur w-100-pct pointer shadow-hover" onClick={ fieldDrop } >
                <div className="flex flex-no-wrap">
                    <div className="fill-available">
                        <span className="block text-16-px">{ field.field_name }</span>
                    </div>
                    <div className="w-25-pct">
                        <span className="block text-16-px">{ field.field_data_type }</span>
                    </div>
                    <div className="w-24-px flex flex-middle">
                        { field.nullable ?
                            <img className="w-100-pct" src="/assets/icon/check.png"/>
                            :
                            <img className="w-100-pct" src="/assets/icon/cross-error.png"/>
                         }
                    </div>
                </div>
            </div>
            <div className="rel w-100-pct shadow-blur">
                <div className="rel no-overflow bg-white w-100-pct ease" style={{ height: `${ drop ? boxHeight : 0 }px` }}>
                    <div className="scroll-y" style={{ height: boxHeight}}>

                        <div className="flex flex-no-wrap w-100-pct rel z-index-10">
                            <div className="fill-available p-1">
                                <div className="flex">
                                    <div className="flex flex-bottom">
                                        <span className="block text-16-px">T??n tr?????ng</span>
                                    </div>
                                    <div className="rel flex flex-no-wrap fill-available m-l-1 no-border border-1-bottom">
                                        <input
                                            value = { data.field_name } onChange={ changeName }
                                            className="text-16-px block text-center no-border fill-available" spellCheck="false"/>
                                    </div>
                                </div>
                            </div>
                            <div className="w-50-pct p-1">
                                <div className="flex">
                                    <div className="flex flex-bottom">
                                        <span className="block text-16-px">Ki???u d??? li???u</span>
                                    </div>
                                    <div className="rel flex flex-no-wrap fill-available m-l-1 no-border border-1-bottom">
                                        <input
                                            onBlur = { blurTrigger }
                                            onFocus = { focusTrigger }
                                            value = { data.field_data_type } readOnly
                                            className="text-16-px block text-center no-border fill-available" spellCheck="false"/>
                                        <div className="rel w-12-pct flex-middle">
                                            <img className="w-12-px block ml-auto" src="/assets/icon/drop-arrow.png"/>
                                        </div>
                                    </div>
                                </div>
                                <div className="rel">
                                    <div className="abs-default w-100-pct no-overflow bg-white shadow" style={{ height: `${ height }px` }}>
                                        <div className="block w-100-pct p-0-5 overflow" style={{ height: `${ height }px` }}>
                                        { fieldProps.map( prop =>
                                             <div key={ prop.id }>
                                                <span className="block p-0-5 bg-white pointer hover"
                                                    onClick={ () => { changeType( prop ) } }
                                                >{ prop.name }</span>
                                             </div>
                                          )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div>
                            <div className="w-50-pct p-1">
                                <div className="flex" >
                                    <div className="flex flex-bottom" >
                                        <span className="block text-16-px w-max-content pointer" onClick={ changeNULL }>NULL ?</span>
                                    </div>
                                    <div className="rel flex flex-no-wrap m-l-1 no-border" onClick={ changeNULL }>
                                        <div className="w-24-px flex flex-middle">
                                            { field.nullable ?
                                                <img className="w-100-pct" src="/assets/icon/check.png"/>
                                                :
                                                <img className="w-100-pct" src="/assets/icon/cross-error.png"/>
                                             }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap rel z-index-2">
                            { renderProps() }
                            {/*<BOOL defaultValue={ true } propName="AUTO_INCREMENT" propLabel="T??? ?????ng t??ng" changeTrigger={ changeValue }/>
                            <NUMBER defaultValue={ 255 } propName="LENGTH" propLabel="????? d??i t???i ??a" changeTrigger={ changeValue }/> */}
                        </div>
                        {
                            field.constraints && field.constraints.length > 0 ?
                                <div className="block m-t-1 p-1 w-90-pct ml-auto">

                                    <span className="block text-16-px">C??c r??ng bu???c v?? kh??a</span>
                                    {/* SEARCH AND ADD */}
                                    <div className="flex flex-no-wrap bg-white shadow-blur m-t-1">
                                        <div className="fill-available p-1">
                                            <input className="no-border text-16-px w-100-pct" placeholder="T??m ki???m ..."/>
                                        </div>
                                        <div className="w-48-px flex flex-middle">
                                            <button onClick={ constraintAddSwitching } className="bold text-24-px no-border bg-green white border-radius-50-pct pointer" style={{ width: "32px", height: "32px" }}>+</button>
                                        </div>
                                    </div>
                                    {/* HEADER */}
                                    <div className="rel m-t-1">
                                        <div className="field-drop p-1 bg-white shadow-blur w-100-pct" >
                                            <div className="flex flex-no-wrap">
                                                <div className="w-25-pct">
                                                    <span className="block bold text-16-px upper">R??ng bu???c</span>
                                                </div>
                                                <div className="fill-available">
                                                    <span className="block text-16-px bold upper">Tr??n tr?????ng</span>
                                                </div>
                                                <div className="w-25-pct">
                                                    <span className="block bold text-16-px upper">Thu???c b???ng</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    { field.constraints.map( constraint =>
                                        <Constraint constraint = { constraint } key={constraint.constraint_id}
                                            renderContraintType = { renderContraintType }
                                            renderTableName = { renderTableName }
                                            renderFieldName = { renderFieldName }
                                            tables={ tables }
                                            removeConstraint = { removeConstraint }

                                        />
                                    )}
                                </div>
                            :
                                <div className="block m-t-1 p-1 w-100-pct ml-auto">
                                    <div className="flex flex-wrap w-100-pct flex-middle" style={{ height: 100 }}>
                                        <span className="text-16-px gray w-100-pct block text-center">Ch??a c?? r??ng bu???c n??o tr??n tr?????ng n??y</span>
                                        <div className="w-48-px flex flex-middle">
                                            <button onClick={ constraintAddSwitching } className="bold text-24-px no-border bg-green white border-radius-50-pct pointer" style={{ width: "32px", height: "32px" }}>+</button>
                                        </div>
                                    </div>
                                </div>
                        }

                        <div className="flex flex-no-wrap w-100-pct flex-end">
                            <div className="p-1">
                                <button onClick={ deleteField } className="w-max-content p-0-5 p-l-1 p-r-1 shadow-blur shadow-hover bg-crimson no-border block text-16-px white pointer shadow-blur shadow-hover">X??a tr?????ng</button>
                            </div>
                            <div className="p-1">
                                <button onClick={ submitChange } className="w-max-content p-0-5 p-l-1 p-r-1 shadow-blur shadow-hover bg-theme-color no-border block text-16-px white pointer shadow-blur shadow-hover">L??u thay ?????i</button>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    )
}

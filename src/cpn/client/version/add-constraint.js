import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ConstraintType from './constraint-box-cpns/constraint-type';
import DropOptions from './constraint-box-cpns/drop-options';
import Field from './table-field';

const defaultConstraint = {
    constraint_type: "pk"
}

export default ( props ) => {
    const { tables, currentTable, updateFields } = props;

    const dispatch = useDispatch()
    const { proxy, unique_string, defaultField } = useSelector(state => state);
    const [ constraintType, setConstraintType ] = useState( defaultConstraint );

    const [ field, setField ] = useState({})
    const [ table, setTable ] = useState({})

    useEffect( () => {

    }, [])

    const renderContraintType = ( constraint_type ) => {

        switch (constraint_type) {
            case "pk":
                return "Khóa chính"
                break;
            case "fk":
                return "Khóa ngoại"
                break;
            default:
                return "Kiểm soát giá trị"
                break;
        }

    }

    const closeDialog = () => {
        dispatch({
            type: "setAddConstraintBox",
        })
    }

    const changeType = ( c_type ) => {
        const { type, value } = c_type
        setConstraintType({ constraint_type: value })
    }

    const changeTable = ( selectedTable ) => {
        setTable( {...selectedTable} )
        setField( selectedTable.fields[0] )
    }

    const changeField = ( selectedField ) => {
        setField(selectedField)
    }

    const submitConstraint = () => {
        const { constraint_type } = constraintType;
        let body = {

        }
        if( constraint_type === 'pk' ){
            body = {
                constraint_type,
                field_id: defaultField.field_id,
                reference_on: -1,
                check_fomular: "NONE",
                check_on_field: false,
                default_check_value: ""
            }
            body.table_id = currentTable.table_id;
        }

        if( table.table_id != undefined && field.field_id != undefined ){
            if( constraint_type === 'fk' ){
                body = {
                    constraint_type,
                    field_id: defaultField.field_id,
                    reference_on: field.field_id,
                    check_fomular: "NONE",
                    check_on_field: false,
                    default_check_value: ""
                }
            }
            if( constraint_type === 'check' ){
                body = {
                    constraint_type,
                    field_id: defaultField.field_id,
                    reference_on: -1,
                    check_fomular: "NONE",
                    check_on_field: false,
                    default_check_value: ""
                }
            }
            body.table_id = currentTable.table_id;
        }

        if( body.table_id != undefined ){

            fetch(`${ proxy }/api/${ unique_string }/table/constraint`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify(body)
            }).then( res => res.json() ).then( res => {
                body.constraint_id = res.data.constraint_id;

                const oldConstraints = defaultField.constraints;
                const newField = { ...defaultField }

                if( oldConstraints ){
                    newField.constraints = [ ...oldConstraints, body ]
                }else{
                    newField.constraints = [ body ]
                }

                updateFields( "update", newField )
                console.log(newField)
                dispatch({
                    type: "setDefaultField",
                    payload: { defaultField: newField }
                })
                closeDialog()

            })
        }else{
            console.log("err")
        }
    }

    return(
        <div className="fixed-default z-index-11 fullscreen p-1">
            <div className="rel z-index-2 container bg-white h-fit column">
                <div className="column w-100-pct h-fit p-0-5">

                <div>
                    <span className="text-24-px block p-0-5">{ currentTable.table_name }</span>
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
                    <Field field={ defaultField } tables={ tables } readOnly={true} />
                </div>

                    <div className="rel z-index-4 m-t-1">
                        <ConstraintType clickTrigger={ changeType } constraint={ constraintType } renderContraintType={ renderContraintType }/>
                    </div>
                    <div className="rel m-t-1">
                        { constraintType.constraint_type == "fk"?
                            <div className="flex flex-wrap">
                                <div className="w-50-pct">
                                    <div className="flex flex-no-wrap">
                                        <DropOptions
                                            data={ tables.filter( tb => tb.table_id !== currentTable.table_id && tb.fields != undefined && tb.fields.length > 0 ) }
                                            clickTrigger={ changeTable }
                                            label={"Trên bảng"}
                                            label_field={"table_name"}
                                            />
                                    </div>
                                </div>
                                <div className="w-50-pct">
                                    <div className="flex flex-no-wrap">
                                        <DropOptions
                                            data={ table.fields ? table.fields : [] }
                                            defaultValue={ field }
                                            clickTrigger={ changeField }
                                            label={"Trên trường"}
                                            label_field={"field_name"}
                                            />
                                    </div>
                                </div>
                            </div>
                            :
                            null
                        }

                        { constraintType.constraint_type == "check"?
                            <div>
                                <span className="text-16-px block p-1">Coming soon...</span>

                            </div>
                            :
                            null
                        }
                    </div>
                </div>
                <div className="abs b-0 r-0 p-1">
                    <button onClick={ submitConstraint } className="upper pointer block w-max-content white text-center p-t-0-5 p-b-0-5 p-l-1 p-r-1 no-border bg-green">Thêm</button>
                </div>
            </div>
            <div className="abs-default z-index-1 fullscreen trans-dark" onClick={ closeDialog }></div>
        </div>
    )
}

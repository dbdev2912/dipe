import { useState, useEffect } from 'react';
import ConstraintType from './constraint-box-cpns/constraint-type';
const boxHeight = 250;

export default (props) => {
    const { constraint,
            renderContraintType,
            renderTableName,
            renderFieldName,
            removeConstraint
        } = props;

    const [ data, setData ] = useState( constraint );
    const [ drop, setDrop ] = useState(0);
    const [ height, setHeight ] = useState(0);

    const clickTrigger = ( newValue ) => {
        const { type, value } = newValue;
        const newData = { ...data }
        newData[type] = value;
        setData( newData )
    }

    return (
        <div className="rel m-t-1 ml-auto">
            <div className="field-drop bg-white shadow-blur w-100-pct pointer shadow-hover">
                <div className="flex flex-no-wrap">
                    <div className="flex flex-no-wrap fill-available p-1" onClick={ () => { setDrop(!drop) } }>
                        <div className="w-25-pct">
                            <span className="block text-16-px">{ renderContraintType(data.constraint_type) }</span>
                        </div>
                        <div className="fill-available">
                        { constraint.reference_on != -1 ?
                            <span className="block text-16-px">{ renderFieldName(data.reference_on) }</span>
                            :
                            <span className="block text-16-px">{ "" }</span>
                        }
                        </div>
                        <div className="w-25-pct">
                            <span className="block text-16-px">{ renderTableName(data.reference_on) }</span>
                        </div>
                    </div>
                    <div className="abs r-0 t-0 flex h-fit">
                        <div className="w-32-px flex flex-middle">
                            { drop ?
                                <img onClick={ ()=> { removeConstraint( constraint.constraint_id ) } } className="w-20-px block" src="/assets/icon/cross-error.png"/>
                                : null
                            }
                        </div>
                    </div>
                </div>
            </div>
            {/*<div className="rel w-100-pct shadow-blur">
                <div className="rel no-overflow bg-white w-100-pct ease" style={{ height: `${ drop ? boxHeight : 0 }px` }}>
                    <div className="scroll-y p-1" style={{ height: boxHeight}}>
                        <div className="flex flex-wrap">
                            <ConstraintType constraint={ data } renderContraintType={ renderContraintType } clickTrigger={ clickTrigger }/>
                        </div>
                    </div>
                </div>
            </div>*/}
        </div>
    )
}

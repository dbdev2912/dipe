import { useState, useEffect } from 'react';


export default ( props ) => {
    const { constraint, renderContraintType, clickTrigger } = props;

    const [ height, setHeight ] = useState(0)

    const constraintTypes = [
        { id: 0, type: "pk", label: "Khóa chính" },
        { id: 1, type: "fk", label: "Khóa ngoại" },
        { id: 2, type: "check", label: "Kiểm soát giá trị" },
    ]

    const blurTrigger = (e) => {
            e.preventDefault();
            setTimeout(() => {
                setHeight(0)
        }, 135)
    }

    const focusTrigger = () => {
        setHeight(135);
    }

    const changeValue = ( cnt ) => {
        const newValue = { type: "constraint_type", value: cnt.type }
        clickTrigger( newValue )
    }

    return(
        <div className="w-100-pct">
            <div className="flex flex-no-wrap flex-aligned p-1">
                <div className="w-max-content">
                    <span className="block text-16-px">Loại ràng buộc</span>
                </div>
                <div className="fill-available m-l-1">
                    <input className="no-border block text-16-px w-100-pct border-1-bottom text-center"
                        onFocus={ focusTrigger }
                        onBlur = { blurTrigger }
                        value = { renderContraintType(constraint.constraint_type) }
                    />
                </div>
            </div>
            <div className="rel w-100-pct">
                <div className="abs-default w-100-pct no-overflow shadow-blur" style={{ height: `${ height }px`, paddingTop: "0"}} >
                    <div className="block w-100-pct p-0-5 overflow" style={{ height: `${ height }px` }}>
                    { constraintTypes.map( type =>
                         <div key={ type.id }>
                            <span className="block p-0-5 bg-white pointer hover"
                                onClick={ () => { changeValue( type ) } }
                            >{ type.label }</span>
                         </div>
                      )}
                    </div>
                </div>
            </div>
        </div>
    )
}

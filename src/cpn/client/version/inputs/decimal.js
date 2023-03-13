import { useState } from 'react';

export default ( props ) => {
    const { field, changeTrigger, defaultValue, unsigned } = props;
    const [ current, setCurrent ] = useState(defaultValue ? defaultValue: "")

    const fieldChangeData = (e) => {
        const { value } = e.target
        if( unsigned ){
            if( value >= 0 ){
                changeTrigger( field, value)
                setCurrent( value )
            }
        }else{
            changeTrigger( field, value)
            setCurrent( value )
        }
    }

    return(
        <div className="w-100-pct p-1 m-t-1">
            <div>
                <span className="block text-16-px">{ field.field_name }</span>
            </div>
            <div className="m-t-0-5">
                <input type="number" step={2}
                    className="p-t-0-5 p-b-0-5 p-l-1 text-16-px block w-100-pct border-1"
                    placeholder="" onChange={ fieldChangeData } value={ current }
                    />
            </div>
        </div>
    )
}

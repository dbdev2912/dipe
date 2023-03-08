import { useState, useEffect } from 'react';

export default ( props ) => {
    const { field } = props;
    const [ drop, setDrop ] = useState( false )

    return(
        <div className="rel m-t-1">
            <div className="field-drop p-1 bg-white shadow-blur w-100-pct" onClick={ ()=>{setDrop(!drop)} } >
                <div className="flex flex-no-wrap">
                    <div className="fill-available">
                        <span className="block text-16-px">{ field.field_name }</span>
                    </div>
                    <div className="w-25-pct">
                        <span className="block text-16-px">{ field.field_data_type }</span>
                    </div>
                    <div className="w-24-px flex flex-middle">
                        <img className="w-100-pct" src="/assets/icon/check.png"/>
                    </div>
                </div>
            </div>
            <div className="rel w-100-pct shadow-blur">
                <div className="rel bg-white w-100-pct ease" style={{ height: `${ drop ? 200 : 0 }px` }}>
                </div>
            </div>
        </div>
    )
}

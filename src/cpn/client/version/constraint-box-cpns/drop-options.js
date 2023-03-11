import { useState, useEffect } from 'react';


export default ( props ) => {
    const { data, clickTrigger, label, label_field, defaultValue } = props;
    const [ height, setHeight ] = useState(0)

    const [ selectedValue, setSelected ] = useState({})

    useEffect( () => {
        setSelected( defaultValue ? defaultValue : {} )
    }, [ defaultValue ] )

    const blurTrigger = (e) => {
            e.preventDefault();
            setTimeout(() => {
                setHeight(0)
        }, 135)
    }

    const focusTrigger = () => {
        setHeight(250);
    }

    const changeValue = ( value ) => {
        clickTrigger( value )
        setSelected( value )
    }

    return(
        <div className="w-100-pct">
            <div className="flex flex-no-wrap flex-aligned p-1">
                <div className="w-max-content">
                    <span className="block text-16-px">{ label }</span>
                </div>
                <div className="fill-available m-l-1">
                    <input className="no-border block text-16-px w-100-pct border-1-bottom text-center"
                        onFocus={ focusTrigger }
                        onBlur = { blurTrigger }
                        value = { selectedValue[label_field] }
                    />
                </div>
            </div>
            <div className="rel w-100-pct">
                <div className="abs-default w-100-pct no-overflow shadow-blur" style={{ height: `${ height }px`, paddingTop: "0"}} >
                    <div className="block w-100-pct p-0-5 overflow" style={{ height: `${ height }px` }}>
                    { data.map( (d, index) =>
                         <div key={ index }>
                            <span className="block p-0-5 bg-white pointer hover"
                                onClick={ () => { changeValue( d ) } }
                            >{ d[ label_field ] }</span>
                         </div>
                      )}
                    </div>
                </div>
            </div>
        </div>
    )
}

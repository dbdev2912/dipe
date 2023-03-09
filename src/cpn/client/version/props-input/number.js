import { useState, useEffect } from 'react';

export default (props) => {
    const { defaultValue, propName, propLabel, changeTrigger } = props;

    const [ data, setData ] = useState({
        key: propName,
        value: defaultValue,
    })

    const changeValue = (e) => {
        const value = e.target.value;
        const newData = { ...data, value };
        setData( newData )
        changeTrigger( newData )
    }

    return (
        <div className="w-max-content p-1">
            <div className="flex">
                <div className="flex flex-bottom">
                    <span className="block text-16-px">{ propLabel }</span>
                </div>
                <div className="rel flex flex-no-wrap fill-available m-l-1 no-border border-1-bottom">
                    <input
                        value = { data.value }
                        onChange = { changeValue }
                        type="number"
                        className="text-16-px block text-center no-border fill-available"
                        spellCheck="false"/>
                </div>
            </div>

        </div>
    )
}

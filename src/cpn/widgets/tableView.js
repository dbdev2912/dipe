import { useState, useEffect } from 'react';

export default (props) => {
    const { fields, data, maxRow, index } = props;

    let rows = 10;
    if( maxRow != undefined ){
        rows = maxRow
    }
    const [ position, setPos ] = useState(0)
    const [ view, setView ] = useState([])

    useEffect( () => {
        const initialView = data.slice( position * rows, (position + 1 ) * rows );
        setView( initialView )
    }, [data])

    useEffect( () => {
        const newView = data.slice( position * rows, (position + 1 ) * rows );
        setView( newView )
    }, [position])

    const movePage = (step) => {
        const totalPages = Math.ceil(data.length / rows);
        if( step > 0 ){
            if( position < totalPages - 1 ){
                setPos( position + 1 )
            }
        }else{
            if( position > 0 ){
                setPos( position - 1 )
            }
        }
        /* STEP */
    }

    return(
        <div className="table-view shadow-blur">
            <div className="w-100-pct">
                <span className="block text-16-px">Hiển thị { view.length } trong { data.length } kết quả.</span>
            </div>
            <table className="w-100-pct">
                <thead>
                    <tr className="header p-0-5">
                        {
                            fields.map( field =>
                                <th className="text-left">
                                    <span className="block text-left text-16-px p-0-5">{ field.name }</span>
                                </th>
                            )
                        }
                    </tr>
                </thead>
                <tbody>
                { view.map( row =>
                        <tr key={ row[ index ] }>
                        {
                            fields.map( field =>
                                <td className="p-0-5">
                                    <span className="text-16">{ row[ field.alias ] }</span>
                                </td>
                            )
                        }
                        </tr>
                )}

                </tbody>
            </table>
            <div className="flex flex-no-wrap">
            {/* navigation buttons */}
                <div className="p-0-5 pointer hover" onClick={ () => { movePage(-1) } }>
                    <img src="/assets/icon/left-arrow.png" className="w-24-px block"/>
                </div>
                <div className="p-0-5 pointer hover" onClick={ () => { movePage(1) } }>
                    <img src="/assets/icon/right-arrow.png" className="w-24-px block"/>
                </div>
            </div>
        </div>
    )
}

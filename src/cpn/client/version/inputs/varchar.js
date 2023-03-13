import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default ( props ) => {
    const { field, changeTrigger, defaultValue } = props;
    const [ current, setCurrent ] = useState(defaultValue ? defaultValue:"")

    const { unique_string, proxy } = useSelector( state => state );
    const [ _fk, _setFk ] = useState(0)
    const [ fkData, setFkData ] = useState([]);
    useEffect(() => {
        if( field.constraints && field.constraints.length > 0 ){
            const fks = field.constraints.filter( c => c.constraint_type === "fk" );
            const fk = fks[0]
            _setFk( 1 )
            fetch(`${proxy}/api/${ unique_string }/table/foreign/data/${ fk.reference_on }`)
            .then( res => res.json() ).then( res => {
                const { data } = res;
                setFkData( data );
            })
        }
    }, [])

    const fieldChangeData = (e) => {
        const { value } = e.target;
        changeTrigger( field, value.slice(0, field.props.LENGTH) )
        setCurrent( value.slice(0, field.props.LENGTH ))

    }

    return(
        <div className="w-100-pct p-1 m-t-1">
        { !_fk ?
            <div>
                <div>
                    <span className="block text-16-px">{ field.field_name }</span>
                </div>
                <div className="m-t-0-5">
                    <input type="text"
                        className="p-t-0-5 p-b-0-5 p-l-1 text-16-px block w-100-pct border-1"
                        placeholder="" onChange={ fieldChangeData } value={ current }
                        />
                </div>
            </div>
        :
            <div >
                <div>
                    <span className="block text-16-px">{ field.field_name }</span>
                </div>
                <div className="m-t-0-5">
                    <input type="text"
                        className="p-t-0-5 p-b-0-5 p-l-1 text-16-px block w-100-pct border-1"
                        placeholder="" onChange={ fieldChangeData } value={ current }

                        />

                        {/* FOREIGN DATA SHOW AND CHOSE */}
                </div>

            </div>
     }
        </div>
    )
}

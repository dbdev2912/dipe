import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default ( props ) => {
    const { field, changeTrigger, defaultValue } = props;
    const [ current, setCurrent ] = useState(defaultValue ? defaultValue:"")

    const { unique_string, proxy } = useSelector( state => state );
    const [ _fk, _setFk ] = useState(0)
    const [ fkData, setFkData ] = useState([]);
    const [ fields, setFields ] = useState([]);
    const [ height, setHeight ] = useState(0);
    const [ keyField, setKeyField ] = useState("")
    useEffect(() => {
        if( field.constraints && field.constraints.length > 0 ){
            const fks = field.constraints.filter( c => c.constraint_type === "fk" );
            const fk = fks[0]
            _setFk( 1 )
            fetch(`${proxy}/api/${ unique_string }/table/foreign/data/${ fk.reference_on }`)
            .then( res => res.json() ).then( res => {
                const { data, table } = res;
                setFkData( data );
                fetch(`${ proxy }/api/${ unique_string }/table/${ table.table_id }/fields`).then( res => res.json() )
                .then( res => {
                    const { fields } = res;
                    setFields( fields );
                    const foreignField = fields.filter( f => f.field_id === fk.reference_on )[0];
                    setKeyField( foreignField.field_alias )
                })
            })
        }
    }, [])

    const fieldChangeData = (e) => {
        const { value } = e.target;
        changeTrigger( field, value.slice(0, field.props.LENGTH) )
        setCurrent( value.slice(0, field.props.LENGTH ))

    }

    const blurTrigger = (e) => {
            e.preventDefault();
            setTimeout(() => {
                setHeight(0)
        }, 135)
    }

    const focusTrigger = () => {
        setHeight(250);
    }

    const dataClickedTrigger = ( data ) => {
        setCurrent( data );
        changeTrigger( field, data[ keyField ] )
    }

    const generateData = ( data ) => {

        if( fields.length > 0 && current ){
            const listStr = fields.map( f => data[ f.field_alias ] )
            return listStr.join(' - ')
        }else{
            return null
        }
    }

    return(
        <div className="w-100-pct p-1 m-t-1">
        { !_fk ?
            <div>
                <div>
                    <span className="block text-16-px">{ field.field_name }</span>
                </div>
                <div className="m-t-0-5">
                    <input type="number"
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
                        placeholder="" onChange={ fieldChangeData } defaultValue={ generateData(current) }
                        onFocus={ focusTrigger }
                        onBlur={ blurTrigger }
                        />

                        {/* FOREIGN DATA SHOW AND CHOSE */}
                </div>
                <div className="rel">
                    <div className="abs-default w-100-pct no-overflow bg-white shadow" style={{ height: `${ height }px` }}>
                        <div className="block w-100-pct p-0-5 overflow" style={{ height: `${ height }px` }}>
                        { fkData.map( (d, index) =>
                             <div key={ index } className="flex flex-no-wrap hover pointer" onClick={ () => { dataClickedTrigger( d ) } }>
                                { fields ? fields.map( field =>
                                    <div key={field.field_id} className="div p-0-5 w-max-content">
                                        <span>{ d[ field.field_alias ] }</span>
                                    </div>
                                ) : null }
                             </div>
                          )}
                        </div>
                    </div>
                </div>

            </div>
     }
        </div>
    )
}

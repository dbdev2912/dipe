import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';


export default ( props ) => {
    const { _api, collection } = props;
    const [ api, setApi ] = useState(_api);

    const { unique_string, proxy } = useSelector( state => state );
    const [ height, setHeight ] = useState(0);
    const [ apiData, setApiData ] = useState([])

    const cardDrop = () => {
        setHeight( height == 0 ? 200 : 0 )
    }

    const switchState = () => {
        const status = !api.status;
        const body = {
            url: api.url.url,
            status,
        }

        fetch(`${ proxy }/api/${ unique_string }/apis/api/status`, {
            method: "PUT",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(body)
        }).then(res => res.json()).then( res => {
            setApi({...api, status})
        })
    }

    const callApi = () => {
        fetch(api.fullurl).then( res => res.json() ).then( res => {
            const { data } = res;
            setApiData(data)
        })
    }

    return(
        <div className="m-t-1">
            <span className="block p-1 shadow-blur shadow-hover text-16-px" onClick={ cardDrop }>{ api.name }</span>
            <div className="rel no-overflow " style={{ height }}>
                <div className=" shadow-blur w-100-pct overflow" style={{ height }}>
                    <div className="flex flex-no-wrap">
                        <div className="fill-available p-1">
                            <input className="text-16-px no-border border-1-bottom  block w-100-pct" value={ api.fullurl }/>
                        </div>
                        <div className="w-150-px m-t-1">
                            {
                                api.status ?
                                <button onClick={ switchState } className="upper pointer block w-100-pct white text-center p-t-0-5 p-b-0-5 p-l-0-5 no-border bg-crimson">Vô hiệu</button>
                                :
                                <button onClick={ switchState } className="upper pointer block w-100-pct white text-center p-t-0-5 p-b-0-5 p-l-0-5 no-border bg-green">Kích hoạt</button>
                            }
                        </div>
                    </div>

                    <div className="m-t-1">
                    { apiData != undefined && apiData.length > 0 ?
                        <table>
                            <thead>
                                <tr>
                                { api.fields && api.fields.map( field =>
                                    <th>
                                        <td>{ field.field_name }</td>
                                    </th>
                                 ) }
                                </tr>
                            </thead>

                                <tbody>
                                    { apiData&&apiData.map(data =>
                                        <tr>
                                        { api.fields&&api.fields.map( field =>
                                            <td>{ data[ field.field_alias ] }</td>
                                         ) }
                                        </tr>
                                    ) }
                                </tbody>
                        </table>
                        :
                        <div className="w-100-pct m-t-1 flex flex-middle">
                            <button onClick={ callApi } className="upper pointer block w-max-content white text-center p-t-0-5 p-b-0-5 p-l-1 p-r-1 no-border bg-gray">Xem dữ liệu</button>
                        </div>
                    }
                    </div>

                </div>
            </div>
        </div>
    )
}

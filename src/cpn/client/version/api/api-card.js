import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';


export default ( props ) => {
    const { _api, collection, setCollections } = props;
    const [ api, setApi ] = useState(_api);

    const { unique_string, proxy } = useSelector( state => state );
    const { openTab } = useSelector( state => state.functions );
    const [ height, setHeight ] = useState(0);
    const [ apiData, setApiData ] = useState([])

    useEffect(() => {

    }, [])

    const cardDrop = () => {
        setHeight( height == 0 ? 200 : 0 )
    }



    const switchState = () => {
        const status = !api.status;

        const newApi = { ...api, status }
        const newCollection = collection
        const newApiSet = newCollection[ api.type.value ]
        newCollection[ api.type.value ] = newApiSet.map( _api => {
            if( _api.url.id_str === newApi.url.id_str ){
                return newApi
            }else{
                return _api
            }
        })

        const body = {
            url: api.url.id_str,
            status,
            collection: newCollection
        }

        setCollections( newCollection )
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
        /* this must be fixed */
        fetch(api.fullurl).then( res => res.json() ).then( res => {
            const { success, content, data } = res;
            if( !success ){
                alert("API NÀY KHUM TỒN TẠI HOẶC ĐÃ BỊ DZÔ HIỆU")
            }else{
                setApiData(data)
            }
        })
    }

    const generateUrl = (url) => {
        const { params } = api.url;
        if( params != undefined && params.length > 0 ){
            params.map( field => {
                url = url.replace( `${field.field_alias }`, `${field.field_name.replaceAll(' ', '_') }` )
            })
        }
        return url
    }

    const removeApi = () => {
        const newCollection = collection
        const newApiSet = newCollection[ api.type.value ]
        newCollection[ api.type.value ] = newApiSet.filter( _api => _api.url.id_str != api.url.id_str)
        setCollections( newCollection )
        fetch(`${ proxy }/api/${ unique_string }/apis/api`, {
            method: "DELETE",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ collection: newCollection, api })
        }).then( res => res.json()).then( res => {

        })
    }

    const redirectToInput = () => {
        openTab(`/su/api/post/input/${ api.url.id_str }`)
    }

    const noParamsFilter = () => {
        const { fields } = api;
        const { params } = api.url;
        const filtedFields = fields.filter( field => {
            const fieldExisted = params.filter( f => f.field_id == field.field_id );
            if( fieldExisted.length > 0 ){
                return false
            }else{
                return true
            }
        });
        return filtedFields;
    }

    const clipboardApiStructure = () => {
        const params = noParamsFilter().map( field => {
            return `"${ field.field_alias }": "",`
        })
        navigator.clipboard.writeText(`
        {
            "data" : {
                ${ params.join('\n\t\t') }
            }
        }
        `)
        alert("Đã sao chép JSON")
    }

    return(
        <div className="m-t-1">
            <span className="block p-1 shadow-blur shadow-hover text-16-px" onClick={ cardDrop }>{ api.name }</span>
            <div className="rel no-overflow " style={{ height }}>
                <div className=" shadow-blur w-100-pct overflow" style={{ height }}>
                    <div className="flex flex-no-wrap">
                        <div className="fill-available p-1">
                            <input className="text-16-px no-border border-1-bottom  block w-100-pct" value={ generateUrl(api.fullurl) }/>
                        </div>
                        <div className="w-24-px flex flex-middle" onClick={ switchState }>
                            { api.status ?
                                <img className="w-100-pct" src="/assets/icon/check.png"/>
                                :
                                <img className="w-100-pct" src="/assets/icon/cross-error.png"/>
                             }
                        </div>
                    </div>
                    { api.status ?
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
                        : null
                    }
                    </div>
                    : null
                }
                    { api.type && api.type.value == "put" ?
                        <div className="m-t-1">
                            <span className="text-16-px block"> Cấu trúc JSON </span>
                            <div style={{ userSelect: "text" }}>
                                <span className="text-16-px block m-l-1">{"{"}</span>
                                    <span className="text-16-px block m-l-2">{"data: {"}</span>
                                        {
                                            noParamsFilter().map( field =>
                                                <span className="text-16-px block m-l-3">{`"${ field.field_alias }": "", (${ field.field_name })`}</span>
                                            )
                                        }
                                    <span className="text-16-px block m-l-2">{"}"}</span>
                                <span className="text-16-px block m-l-1">{"}"}</span>
                            </div>
                        </div>
                            : null
                    }
                    <div className="m-t-1">

                        <div className="w-100-pct m-t-1 flex flex-end">
                        { api.type && api.type.value == "get" ?
                            <button onClick={ callApi } className="upper pointer block w-max-content white text-center p-t-0-5 p-b-0-5 p-l-1 p-r-1 m-l-1 no-border bg-gray">Xem dữ liệu</button>
                                : null
                        }
                        { api.type && api.type.value == "post" ?
                            <button onClick={ redirectToInput } className="upper pointer block w-max-content white text-center p-t-0-5 p-b-0-5 p-l-1 p-r-1 m-l-1 no-border bg-green">Nhập dữ liệu</button>
                                : null
                        }
                        { api.type && api.type.value == "put" ?
                            <button onClick={ clipboardApiStructure } className="upper pointer block w-max-content white text-center p-t-0-5 p-b-0-5 p-l-1 p-r-1 m-l-1 no-border bg-green">Copy JSON</button>
                                : null
                        }
                            <button onClick={ removeApi } className="upper pointer block w-max-content white text-center p-t-0-5 p-b-0-5 p-l-1 p-r-1 m-l-1 no-border bg-crimson">Xóa API</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default (props) => {

    const { version } = props;

    const dispatch = useDispatch();
    const { dateGenerator, autoLabel, openTab } = useSelector( state => state.functions )
    const { unique_string, proxy, addConstraintBox, auth } = useSelector( state => state );
    const [ collections, setCollections ] = useState([]);
    const [ collection, setCollection ] = useState([]);
    const [ nameState, setNameState ] = useState(0);
    const [ height, setHeight ] = useState(0)

    const criterias = [
        { id: 0, label: "ALL", value: null },
        { id: 1, label: "GET", value: "get" },
        { id: 2, label: "POST", value: "post" },
        { id: 3, label: "PUT", value: "put" },
        { id: 4, label: "DELETE", value: "delete" },
    ]
    const [ filter, setFilter ] = useState(criterias[0])

    useEffect( () => {
        fetch(`${ proxy }/api/${ unique_string }/apis/version/${ version.version_id }`).then( res => res.json() )
        .then( res => {
            const { collections } = res;
            if( collections.length > 0 ){
                setCollection( collections[0] )
            }
            setCollections( collections );
            dispatch({
                type: "addApiToCollectionFunc",
                payload: { addApiToCollection, collections }
            })
            console.log(collections)
        })
    }, [version])

    useEffect(() => {
        dispatch({
            type: "setCurrentCollection",
            payload: { collection, collections }
        })
    }, [collection])

    useEffect(() => {
        dispatch({
            type: "setCurrentCollection",
            payload: { collection, collections }
        })
    }, [collections])


    const createApiCollection = () => {

        const date = new Date();
        const { version_id } = version;
        const newCollection = {
            version_id: version.version_id,
            collection_name: "Nhóm API mới",
            get: [],
            post: [],
            put: [],
            delete: [],
            created_by: auth,
            create_on: date.toString()
        }
        fetch(`${ proxy }/api/${ unique_string }/apis/collection`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ collection: newCollection, version_id })
        }).then( res => res.json() ).then( res => {
            const { collection_id } = res
            setCollections([{...newCollection, collection_id }, ...collections])
        })
    }

    const pickCollection = ( collection ) => {
        setCollection( collection )
    }

    const nameSwitch = () => {
        fetch(`${proxy}/api/${ unique_string }/apis/collection/${ collection.collection_id }/name`, {
            method: "PUT",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ collection_name: collection.collection_name })
        }).then( res => res.json() ).then( res => {
            setNameState( !nameState )
            const newCollections = collections.map( col => {
                if( collection.collection_id === col.collection_id ){
                    return collection
                }else{
                    return col
                }
            })
            setCollections( newCollections )
        })
    }
    const createAPI = () => {
        dispatch({
            type: "setAddApiBox",
        })
    }

    const removeCollection = ( collection ) => {
        const { collection_id } = collection;
        const newCollections = collections.filter( col => col.collection_id != collection_id );

        fetch(`${proxy}/api/${ unique_string }/apis/collection/${ collection_id }`, {
            method: "DELETE"
        }).then( res => res.json()).then( res =>{
            setCollections( newCollections );
        })
    }

    const addApiToCollection = ( collections, _collection, api ) => {
        const newCollection = _collection;

        newCollection[ api.type.value ].push( api )
        setCollection( newCollection );
        const newCollections = collections.map( col => {
            if( col.collection_id === newCollection.collection_id ){
                return newCollection;
            }else{
                return col
            }
        })
        setCollections( newCollections )
    }

    return (
        <div id="api" className="w-100-pct mg-auto p-t-5" style={{ height: "90vh" }}>
            <div className="flex flex-no-wrap h-fit ">
                {/* SEARCH AND ADD */}
                <div className="w-35-pct column h-fit p-1">
                    <div className="flex flex-no-wrap bg-white shadow-blur">
                        <div className="fill-available p-1">
                            <input className="no-border w-100-pct" placeholder="..."/>
                        </div>
                        <div className="w-48-px flex flex-middle">
                            <button onClick={ createApiCollection } className="bold text-24-px no-border bg-green white border-radius-50-pct pointer" style={{ width: "32px", height: "32px" }}>+</button>
                        </div>
                    </div>

                    <div className="fill-available overflow m-t-1">
                    { collections.length > 0 && collections.map( collection =>
                        <div onClick={ () => { pickCollection(collection) } } className="table-hover rel block m-b-1 p-1 bg-white shadow-blur shadow-hover pointer">
                            <span className="block text-20-px">{ collection.collection_name }</span>
                            <div className="abs r-0 t-0 p-0-5">
                                <img className="w-20-px ease" onClick={ () => { removeCollection( collection ) } } src="/assets/icon/cross-color.png" />
                            </div>
                            <div className="flex flex-no-wrap m-t-3">
                                <div className="fill-available">
                                    <span className="block text-14-px">Bởi @<b>{ collection.created_by.fullname }</b></span>
                                    <span className="block text-14-px gray">{ dateGenerator(collection.create_on) }</span>
                                </div>
                            </div>
                        </div>
                    ) }
                    </div>


                </div>

                <div className="w-65-pct p-1">
                    <div className="block h-fit bg-white scroll-y p-1 shadow-blur">
                    { collections.length > 0 ?
                    <div className="p-0-5">
                        <div className="flex rel">
                            <div className="flex flex-bottom w-100-pct">
                                { nameState ?
                                    <input id="table-name" className="block text-20-px no-border w-100-pct" value={ collection.collection_name }
                                        onChange={ (e) => { setCollection({ ...collection, collection_name: e.target.value }) } }
                                    />
                                    :
                                    <span className="block text-20-px">{ collection.collection_name }</span>
                                }
                            </div>
                            <div className="w-32-px rel">
                                <div className="abs b-0 r-0">
                                    <img onClick={ ()=> { nameSwitch() } }
                                        src="/assets/icon/edit.png" className="w-24-px pointer"/>
                                </div>
                            </div>
                        </div>

                        <hr className="block border-1-top"/>

                        <div className="block">
                            <div className="flex flex-no-wrap">
                                <div className="fill-available p-1">
                                    <input className="no-border w-100-pct" placeholder="..."/>
                                </div>
                                <div className="w-48-px flex flex-middle">
                                    <button onClick={ createAPI } className="bold text-24-px no-border bg-green white border-radius-50-pct pointer" style={{ width: "32px", height: "32px" }}>+</button>
                                </div>
                                <div className="w-100-px flex flex-middle">
                                    <button onClick={ () => { setHeight(height != 0 ? 0 : 200 ) } } className="no-border w-100-pct text-center pointer block p-0-5 text-16-px">{ filter.label }</button>
                                </div>
                            </div>
                        </div>
                        <div className="rel">
                            <div className="abs t-0 r-0 shadow-blur bg-white">
                                <div className="w-125-px overflow ease" style={{ height }}>
                                { criterias.map( (d, index) =>
                                     <div key={ index }>
                                        <span className="block p-0-5 bg-white pointer hover"
                                            onClick={ () => { setFilter( d ); setHeight(0) } }
                                        >{ d[ "label" ] }</span>
                                     </div>
                                  )}
                                </div>
                            </div>
                        </div>

                        <hr className="block border-1-top"/>
                        { filter.value ?
                            <div className="block">
                                { collection[filter.value] ? collection[filter.value].map( api =>
                                    <span className="block p-1 m-t-1 shadow-blur shadow-hover text-16-px">{ api.name }</span>
                                ): null }
                            </div>
                        :
                            <div>
                                <span className="block text-20-px">{ "ALL" }</span>
                            </div>
                        }


                        </div>
                    : null }
                    </div>

                </div>

            </div>
        </div>
    )
}

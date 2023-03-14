import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';


export default ( props ) => {


    const dispatch = useDispatch()
    const { proxy, unique_string, defaultField } = useSelector(state => state);

    useEffect( () => {

    }, [])



    const closeDialog = () => {
        dispatch({
            type: "setAddApiBox",
        })
    }

    const submitApi = () => {
        
    }

    return(
        <div className="fixed-default z-index-11 fullscreen p-1">
            <div className="rel z-index-2 container bg-white h-fit column">
                <div className="column w-100-pct h-fit p-0-5">


                </div>
                <div className="abs b-0 r-0 p-1">
                    <button onClick={ submitApi } className="upper pointer block w-max-content white text-center p-t-0-5 p-b-0-5 p-l-1 p-r-1 no-border bg-green">Thêm</button>
                </div>
            </div>
            <div className="abs-default z-index-1 fullscreen trans-dark" onClick={ closeDialog }></div>
        </div>
    )
}

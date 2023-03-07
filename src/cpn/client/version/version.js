import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Navbar, Horizon } from '../../navbar';

export default () => {
    const dispatch = useDispatch();

    const{ project_id, version_id } = useParams()

    const { urls, bottomUrls } = useSelector( state => state.navbarLinks.su )
    const { navState, unique_string, proxy } = useSelector( state => state );

    useEffect( () => {
        dispatch({
            type: "setNavBarHighLight",
            payload: { url_id: 1 }
        })
    }, [])

    return(
        <div className="fixed-default fullscreen main-bg overflow flex flex-no-wrap">
            <Navbar urls={ urls } bottomUrls={ bottomUrls } />
            <div className={`app fixed-default overflow ${ !navState ? "app-stretch": "app-scaled" }`} style={{ height: "100vh" }}>
                <Horizon />

                <div className="p-1">

                </div>

            </div>
        </div>
    )
}

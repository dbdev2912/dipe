import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';


export default ( props ) => {
    const { highlight, navState } = useSelector( state => state );
    const dispatch = useDispatch();

    const { urls, bottomUrls } = props;

    const navTrigger = () => {
        dispatch({
            type: "setNavState",
            payload: {
                navState: !navState
            }
        })
    }

    return (

        <div className={`rel navbar z-index-10 ${ navState ? "nav-show" : "nav-hide" }`}>
            <div className="flex flex-no-wrap m-t-0-5">
                <div className="w-72-px pointer order-0">
                    <div className="block p-1" onClick={() => { navTrigger() }}>
                        <span className="block w-24-px border-3-top" style={{ marginTop: "4px" }}/>
                        <span className="block w-24-px border-3-top" style={{ marginTop: "4px" }}/>
                        <span className="block w-24-px border-3-top" style={{ marginTop: "4px" }}/>
                    </div>
                </div>
                <div className="w-100-pct order-1">
                    <img className="w-84-px block ml-auto m-r-1" src="/assets/image/mylan.png"/>
                </div>
            </div>
            <div className="m-t-2">
            { urls.map( url =>
                <div onClick={ () => { window.location = url.url } } className={`flex flex-no-wrap m-t-0-5 pointer hover ${ url.id === highlight ? "login-bg": "" }`} key ={ url.id }>
                    <div className="w-72-px pointer order-0">
                        <div className="block p-0-5">
                            <img className="w-24-px block mg-auto m-l-0-5" src={`/assets/icon/navbar/${url.icon}`}/>
                        </div>
                    </div>
                    <div className="w-100-pct p-0-5 order-1">
                        <span className="text-16-px block p-l-0-5">{url.label}</span>
                    </div>
                </div>
            )}
            </div>

            <div className="abs b-0 l-0 w-100-pct">
            { bottomUrls.map( url =>
                <div onClick={ () => { window.location = url.url } } className={`flex flex-no-wrap m-t-0-5 pointer hover ${ url.id === highlight ? "login-bg": "" }`} key ={ url.id }>
                    <div className="w-72-px pointer order-0">
                        <div className="block p-0-5">
                            <img className="w-24-px block mg-auto m-l-0-5" src={`/assets/icon/navbar/${url.icon}`}/>
                        </div>
                    </div>
                    <div className="w-100-pct p-0-5 order-1">
                        <span className="text-16-px block p-l-0-5">{url.label}</span>
                    </div>
                </div>
            )}
            </div>

        </div>
    )
}

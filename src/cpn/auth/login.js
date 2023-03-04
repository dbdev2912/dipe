import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import APP_API from '../../APP_API';

export default () => {
    const [ auth, setAuth ] = useState({})

    const { unique_string } = useSelector( state => state )

    const enterTriggered = (e) => {
        if( e.keyCode === 13 ){
            submit()
        }
    }

    const submit = () => {
        fetch(`${APP_API}/${ unique_string }/login`, {
            method: "post",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(auth)
        }).then( res => res.json() ).then( ( resp ) => {
            const { success, role, credential_string, _token } = resp;
            console.log( resp )
            if( success ){
                localStorage.setItem( 'role', role )
                localStorage.setItem( 'credential_string', credential_string )
                localStorage.setItem( '_token', _token )
                window.location = '/';
            }else{
                alert(`CREDENTIAL ERROR`);
            }
        })
    }

    return(
        <div className="fixed-default flex flex-aligned fullscreen login-bg overflow">
            <div className="flex flex-middle mg-auto login-form">
                <div className="w-60-pct mg-auto" style={{ paddingLeft: "3em" }}>
                    <span className="block text-center upper text-20-px">Đăng nhập</span>
                    <div className="flex flex-wrap">
                        <div className="w-90-pct mg-auto m-t-5 flex flex-no-wrap flex-middle">
                            <input placeholder="Tài khoản" onKeyUp={ enterTriggered } onChange={ (e) => { setAuth( { ...auth, account_string: e.target.value } ) } } type="text" className="block w-100-pct ml-auto border-radius-12-px border-1 p-0-5"/>
                        </div>
                        <div className="w-90-pct mg-auto m-t-1 flex flex-no-wrap flex-middle">
                            <input  placeholder="Mật khẩu" onKeyUp={ enterTriggered } onChange={ (e) => { setAuth( { ...auth, pwd_string: e.target.value } ) } } type="password" className="block w-100-pct ml-auto border-radius-12-px border-1 p-0-5"/>
                        </div>
                        <div className="w-90-pct mg-auto m-t-1 flex flex-no-wrap">
                            <button className="sign-btn w-100-pct pointer" onClick={ submit }>Tiếp tục ➤</button>
                         </div>
                        {/*<div className="w-90-pct mg-auto m-t-5 flex flex-no-wrap flex-middle">
                            <span className="block text-12-px text-right">Khum có tài khoản ? <a href="/signup" className="no-underline mylan-color pointer bold">Đăng ký</a> ngay</span>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

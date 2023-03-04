import { useState, useEffect } from 'react';

import APP_API from '../../APP_API';

export default () => {
    const [ auth, setAuth ] = useState({})

    const enterTriggered = (e) => {
        if( e.keyCode === 13 ){
            submit()
        }
    }

    const submit = () => {
        const { account_string, pwd_string, reenter, email, fullname } = auth;

        if( account_string && pwd_string && reenter && email && fullname ){
            if( pwd_string !== reenter ){
                alert("Mẫu khẩu và xác nhận mật khẩu không khớp !!")
            }else{

                fetch(`${ APP_API }/api/auth/signup`, {
                    method: "post",
                    headers: {
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({ auth })
                }).then( res => res.json() ).then( ({ success, msg }) => {
                    if( success ){
                        window.location = '/';
                    }else{
                        alert(msg);
                    }
                })
            }
        }
        else{
            alert("Bạn cần điền thông tin vào các trường có dấu wildcard (*)! ")
        }
    }

    return(
        <div className="fixed-default flex flex-aligned fullscreen login-bg overflow" >
            <div className="flex flex-middle mg-auto login-form">
                <div className="w-60-pct mg-auto" style={{ paddingLeft: "3em" }}>
                    <span className="block text-center text-20-px upper">Đăng ký</span>
                    <div className="flex flex-wrap">
                        <div className="w-90-pct mg-auto m-t-1 flex flex-no-wrap flex-middle">
                            <input placeholder="Tài khoản*" onKeyUp={ enterTriggered } onChange={ (e) => { setAuth( {...auth, account_string: e.target.value} ) } } type="text" className="block w-100-pct ml-auto border-radius-12-px border-1 p-0-5"/>
                        </div>
                        <div className="w-90-pct mg-auto m-t-1 flex flex-no-wrap flex-middle">
                            <input placeholder="Mật khẩu*" onKeyUp={ enterTriggered } onChange={ (e) => { setAuth( {...auth, pwd_string: e.target.value} ) } } type="password" className="block w-100-pct ml-auto border-radius-12-px border-1 p-0-5"/>
                        </div>
                        <div className="w-90-pct mg-auto m-t-1 flex flex-no-wrap flex-middle">
                            <input placeholder="Nhập lại mật khẩu*" onKeyUp={ enterTriggered } onChange={ (e) => { setAuth( {...auth, reenter: e.target.value} ) } } type="password" className="block w-100-pct ml-auto border-radius-12-px border-1 p-0-5"/>
                        </div>
                        <div className="w-90-pct mg-auto m-t-1 flex flex-no-wrap flex-middle">
                            <input placeholder="Tên của bạn" onKeyUp={ enterTriggered } onChange={ (e) => { setAuth( {...auth, fullname: e.target.value} ) } } type="text" className="block w-100-pct ml-auto border-radius-12-px border-1 p-0-5"/>
                        </div>
                        <div className="w-90-pct mg-auto m-t-1 flex flex-no-wrap flex-middle">
                            <input placeholder="Email*" onKeyUp={ enterTriggered } onChange={ (e) => { setAuth( {...auth, email: e.target.value} ) } } type="text" className="block w-100-pct ml-auto border-radius-12-px border-1 p-0-5"/>
                        </div>
                        <div className="w-90-pct mg-auto m-t-1 flex flex-no-wrap">
                            <button className="sign-btn w-100-pct pointer" onClick={ submit }>Continue ➤</button>
                         </div>
                        <div className="w-90-pct mg-auto m-t-1 flex flex-no-wrap flex-middle">
                            <span className="block text-12-px text-right">Bạn có tài khoản ? <a href="/login" className="no-underline mylan-color pointer bold">Đăng nhập</a> ngay</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

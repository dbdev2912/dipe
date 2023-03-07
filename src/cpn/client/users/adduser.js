import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';


export default (props) => {
    const{ userAdd, setUserAdd, users, setUsers } = props;
    const [ right, setRight ] = useState(-500);
    const [ height, setHeight ] = useState(0);
    const roles = [
        { id: 0, label: "Super User ( SU )", value: "su" },
        { id: 1, label: "Quản trị viên ( Admin ) ", value: "admin" },
        { id: 2, label: "Người dùng ( User ) ", value: "user" },
    ]
    const { navState } = useSelector( state => state );
    const dispatch = useDispatch();

    useEffect(() => {
        if( userAdd ){
            setRight(0)
            dispatch({
                type: "setNavState",
                payload: {
                    navState: false
                }
            })
        }else{
            setRight(-500)
            dispatch({
                type: "setNavState",
                payload: {
                    navState: true
                }
            })
        }
    }, [ userAdd ])



    const { unique_string, proxy, defaultImage } = useSelector( state => state );
    const [ user, setUser ] = useState({})

    const blurTrigger = (e) => {
            e.preventDefault();
            setTimeout(() => {
                setHeight(0)
        }, 135)
    }

    const focusTrigger = () => {
        setHeight(135);
    }
    const submit = () => {
        if( user.pwd_string && user.account_string ){
            fetch(`${proxy}/${ unique_string }/create_user`,{
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ user })
            }).then( res => res.json() ).then( data => {
                const { credential_string } = data;
                setUsers({...user, credential_string, avatar: defaultImage})
            })
        }
    }

    return(
        <div className={`fixed adduser overflow z-index-1 bg-white r-0 t-0 shadow`} style={{ right: `${ right }px` }}>
            <div className="p-t-5 ">
                { /* TOGGLE */ }
                <div className="flex">
                    <div className="ml-auto">
                        <span className="text-20-px block p-1">TẠO TÀI KHOẢN</span>
                    </div>
                    <div className="flex flex-middle w-42-px pointer " onClick={ () => { setUserAdd(false) } }>
                        <img src="/assets/icon/right-arrow.png" className="block w-80-pct"/>
                    </div>
                </div>

                {/* FORM BODY */}
                <div className="form-field w-100-pct flex flex-no-wrap p-1 mg-auto">
                    <label className="block w-40-pct">Tên đăng nhập</label>
                    <input value={ user.account_string } onChange={
                        (e) => { setUser({ ...user, account_string: e.target.value }) }
                    } className="block w-60-pct border-1  border-radius-8-px p-0-5"/>
                </div>
                <div className="form-field w-100-pct flex flex-no-wrap p-1 mg-auto">
                    <label className="block w-40-pct">Mật khẩu</label>
                    <input value={ user.pwd_string } onChange={
                        (e) => { setUser({ ...user, pwd_string: e.target.value }) }
                    } className="block w-60-pct border-1  border-radius-8-px p-0-5"/>
                </div>

                <div className="form-field w-100-pct flex flex-no-wrap p-1 mg-auto">
                    <label className="block w-40-pct">Loại tài khoản</label>
                    <input defaultValue={ user.account_role_label ? user.account_role_label: "" } onFocus={ focusTrigger } onBlur={ blurTrigger } className="block w-60-pct border-1  border-radius-8-px p-0-5"/>
                </div>
                <div className="form-field w-100-pct flex flex-no-wrap flex-end mg-auto">
                    <div className="w-60-pct">
                        <div className="rel">
                            <div className="abs-default w-100-pct no-overflow bg-white shadow" style={{ height: `${ height }px` }}>
                                <div className="block w-100-pct p-0-5 overflow" style={{ height: `${ 200 }px` }}>
                                { roles.map( role =>
                                     <div key={ role.id }>
                                        <span className="block p-0-5 bg-white pointer hover" onClick={ () => { setUser({ ...user, account_role: role.value, account_role_label: role.label }) } }>{ role.label }</span>
                                     </div>
                                  )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* DROPBOX HERE */}

                <span className="text-20-px block p-1 text-right">Thông tin người dùng</span>
                <div className="form-field w-100-pct flex flex-no-wrap p-1 mg-auto">
                    <label className="block w-40-pct">Họ tên</label>
                    <input value={ user.fullname } onChange={
                        (e) => { setUser({ ...user, fullname: e.target.value }) }
                    } className="block w-60-pct border-1  border-radius-8-px p-0-5"/>
                </div>
                <div className="form-field w-100-pct flex flex-no-wrap p-1 mg-auto">
                    <label className="block w-40-pct">Email</label>
                    <input value={ user.email } onChange={
                        (e) => { setUser({ ...user, email: e.target.value }) }
                    } className="block w-60-pct border-1  border-radius-8-px p-0-5"/>
                </div>
                <div className="form-field w-100-pct flex flex-no-wrap p-1 mg-auto">
                    <label className="block w-40-pct">Số di động</label>
                    <input value={ user.phone } onChange={
                        (e) => { setUser({ ...user, phone: e.target.value }) }
                    } className="block w-60-pct border-1  border-radius-8-px p-0-5"/>
                </div>
                <div className="form-field w-100-pct flex flex-no-wrap p-1 mg-auto">
                    <label className="block w-40-pct">Địa chỉ</label>
                    <input value={ user.address } onChange={
                        (e) => { setUser({ ...user, address: e.target.value }) }
                    } className="block w-60-pct border-1  border-radius-8-px p-0-5"/>
                </div>

                <div className="form-field w-100-pct flex flex-no-wrap p-1 mg-auto">
                    <button onClick={ submit } className="upper pointer block ml-auto border-radius-8-px w-max-content white text-center p-t-0-5 p-b-0-5 p-l-1 p-r-1 no-border bg-green">THÊM NGAY</button>
                </div>
            </div>
        </div>
    )
}

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Navbar, Horizon } from '../../navbar';
import UsersMapper from './usersMapper';
import AddUserBox from './adduser';

export default () => {
    const dispatch = useDispatch();

    const { urls, bottomUrls } = useSelector( state => state.navbarLinks.su )
    const { navState, unique_string, proxy } = useSelector( state => state );

    const [ sus, setSus ] = useState([]);
    const [ admins, setAdmins ] = useState([]);
    const [ users, setUsers ] = useState([]);
    const [ userAdd, setUserAdd ] = useState(false);

    useEffect( () => {
        dispatch({
            type: "setNavBarHighLight",
            payload: { url_id: 2 }
        })

        fetch(`${proxy}/api/${ unique_string}/user/getall`).then( res => res.json() )
        .then( resp => {
            const { data, success } = resp;

            if( data != undefined && data.length > 0 ) {
                const _sus = data.filter( user => user.account_role === "su" );
                const _admins = data.filter( user => user.account_role === "admin" );
                const _users = data.filter( user => user.account_role === "user" );

                setSus( _sus ); setAdmins( _admins ); setUsers( _users )
            }
        })
    }, [])

    const userSplitter = (user) => {
        const { account_role } = user;
        switch (account_role) {
            case "su":
                setSus( [...sus, user] )
                break;

            case "admin":
                setAdmins( [...admins, user] )
                break;
            default:
                setUsers([ ...users, user ])
        }
    }

    const removeFromUI = (user) => {
        const { account_role } = user;
        switch (account_role) {
            case "su":
                const newSus = sus.filter((su) => su.credential_string != user.credential_string);
                setSus( [...newSus] )
                break;

            case "admin":
                const newAdmins = admins.filter((admin) => admin.credential_string != user.credential_string);
                setAdmins( [...newAdmins] )
                break;
            default:
                const newUsers = users.filter((u) => u.credential_string != user.credential_string);
                setUsers( [...newUsers] )
        }
    }

    return(
        <div className="fixed-default fullscreen main-bg overflow flex flex-no-wrap">
            <Navbar urls={ urls } bottomUrls={ bottomUrls } />
            <div className={`app fixed-default overflow ${ !navState ? "app-stretch": "app-scaled" }`} style={{ height: "100vh" }}>
                <Horizon />
                <AddUserBox userAdd={ userAdd } setUserAdd = { setUserAdd } setUsers = { userSplitter }/>
                <div className="p-1">

                    {/* SEARCH BAR */}

                    <div className="w-100-pct bg-white p-1">
                        <div className="flex flex-no-wrap">
                            <div className="w-100-pct flex flex-no-wrap">
                                <div className="w-24-px flex flex-middle">
                                    <img src="/assets/icon/search.png" className="w-100-pct block"/>
                                </div>
                                <input className="no-border w-100-pct p-l-2" placeholder="Tìm kiếm ai đó..."/>
                            </div>
                            <div className="ml-auto">
                                <button onClick={ () => { setUserAdd(true) } } className="upper pointer block w-max-content white text-center p-t-0-5 p-b-0-5 p-l-1 p-r-1 no-border bg-green">Thêm mới</button>
                            </div>
                        </div>
                    </div>

                    <UsersMapper label={ "Super Users ( su )" } users = { sus } removeFromUI = { removeFromUI }/>
                    <UsersMapper label={ "Quản trị viên ( admin )" } users = { admins } removeFromUI = { removeFromUI }/>
                    <UsersMapper label={ "Người dùng ( user )" } users = { users } removeFromUI = { removeFromUI }/>
                </div>

            </div>
        </div>
    )
}

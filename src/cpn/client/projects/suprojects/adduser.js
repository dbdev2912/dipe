import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UserCard from '../../users/userselectcard';
import ReadOnlyUserCard from '../../users/usercard';

export default ( props ) => {
    const { submit, setDialog, partners_ , users_, project_master } = props;

    const [ sus, setSus ] = useState([]);
    const [ admins, setAdmins ] = useState([]);
    const [ users, setUsers ] = useState([]);
    const { unique_string, proxy } = useSelector( state => state );
    const [ loaded, setLoaded ] = useState(true);

    const [ selectedUsers, setSelectedUsers ] = useState([]);

    useEffect( () => {

        fetch(`${proxy}/api/${ unique_string}/user/getall`).then( res => res.json() )
        .then( resp => {
            const { data, success } = resp;

            if( data != undefined && data.length > 0 ) {
                const _sus = data.filter( user => user.account_role === "su" );
                const _admins = data.filter( user => user.account_role === "admin" && userNotIn(user, partners_ ) && user.credential_string != project_master);
                const _users = data.filter( user => user.account_role === "user"  && userNotIn(user, users_ ) && user.credential_string != project_master);

                setSus( _sus ); setAdmins( _admins ); setUsers( _users );
                setTimeout(() => {
                    setLoaded(true)
                }, 500)
            }
        })

    }, [])


    const userNotIn = ( user, dataSet ) => {
        const queue = dataSet.filter( u  =>  u.credential_string === user.credential_string );
        if( queue.length > 0 ){
            return false;
        }
        else{
            return true
        }
    }

    const addToQueue = ( user ) => {
        setSelectedUsers([...selectedUsers, user])
    }

    const removeFromQueue = (user) => {
        const queue = selectedUsers.filter(u =>  u.credential_string != user.credential_string )
        setSelectedUsers(queue);
    }

    const clickTrigger = ( user ) => {
        const userExisted = selectedUsers.indexOf( user );
        if( userExisted != -1 ){
            removeFromQueue(user)
        }else{
            addToQueue(user);
        }
    }

    const closeDialog = () => {
        if( selectedUsers.length > 0 ){
            submit( selectedUsers )
        }
        setDialog()
    }

    return(
        <div className="fixed-default z-index-11 fullscreen p-1">
            <div className="rel z-index-2 container bg-white h-fit column">
                { !loaded ?
                    <div className="w-100-pct h-fit flex flex-middle">
                        <img className="circle-processing" src="/assets/image/circle-processing.png"/>
                    </div>
                    :
                    <div className="column w-100-pct h-fit p-0-5">
                        <div className="flex w-100-pct scroll-x horizon-scroll-bar border-1-dashed" style={{ height: "150px" }}>
                            { selectedUsers.length > 0 ?selectedUsers.map( user =>
                                <UserCard user={ user } clickTrigger={ clickTrigger }  width={ 325 }/>
                            ) :
                                <span className="block w-100-pct text-center p-2">Những người được chọn sẽ xuất hiện ở đây</span>
                            }
                        </div>
                        <div className="users-box flex flex-no-wrap">

                          {/* ADMINS */}
                            <div className="w-50-pct p-1 h-fit">
                                <div className="column h-fit">
                                    <div className="block shadow-blur p-1">
                                        <input placeholder="Quản trị viên" spellCheck="false" className="no-border block w-100-pct"/>
                                    </div>
                                    <div className="h-fit scroll-y p-1">
                                        { admins.map( user =>
                                            <UserCard user={ user } clickTrigger={ clickTrigger }/>
                                        )}

                                    </div>
                                </div>
                            </div>

                            {/* USERS */}

                            <div className="w-50-pct p-1 h-fit">
                                <div className="column h-fit">
                                    <div className="block shadow-blur p-1">
                                        <input placeholder="Người dùng" spellCheck="false" className="no-border block w-100-pct"/>
                                    </div>
                                    <div className="h-fit scroll-y p-1">
                                        { users.map( user =>
                                            <UserCard user={ user } clickTrigger={ clickTrigger }/>
                                        )}

                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                }
            </div>
            <div className="abs-default z-index-1 fullscreen trans-dark" onClick={ closeDialog }></div>
        </div>
    )
}

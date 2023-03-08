import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import $ from 'jquery';
/* Listing history, version control */
import { Navbar, Horizon } from '../../../navbar';
import UserCard from '../../users/usercard';
import AddUserDialog from './adduser';

import TableView from '../../../widgets/tableView';

/* Listing history, version control */

export default () => {
    const { urls, bottomUrls } = useSelector( state => state.navbarLinks.su )
    const { project_id } = useParams()

    const stateColors = {
        'INITIALIZING': "#ff00ff",
        'STARTED': "#00ff00",
        'PROGRESS': "#0000ff",
        'RELEASE': "#3b1260",
        'FINAL': "#1d2a1d",
        'COMPLETED': "#fa9a50",
        'BUG': "#d11200",
        'SUSPEND': "#fff61e",
       }

    const { navState, unique_string, proxy, defaultImage, auth } = useSelector( state => state );
    const { dateGenerator, autoLabel, openTab } = useSelector( state => state.functions )
    const { credential_string, account_role } = useSelector( state => state.auth );
    const dispatch = useDispatch()

    const [ project, setProject ] = useState({})
    const [ owner, setOwner ] = useState({})
    const [ partners, setPartners ] = useState([])
    const [ users, setUsers ] = useState([])

    const [ tasks, setTasks ] = useState([])
    const [ task, setTask ] = useState({});
    const [ _task, _setTask ] = useState({})
    const [ taskState, setTaskState ] = useState( 0 );

    const [ versions, setVersions ] = useState([])

    const [ userScrollView, setUserScrollView ] = useState([ 1, 0 ])
    const [ dialog, setDialog ] = useState(false)

    const [ stateHeight, setStateHeight ] = useState(0);
    const [ statuses, setStatuses ] = useState([]);
    const [ oldStatus, setOldStatus ] = useState({})

    const [ taskModify, setTaskModify ] = useState([])
    const [ taskModifyTableView, setTaskModifyTableView] = useState([]);

    useEffect( () => {
        dispatch({
            type: "setNavBarHighLight",
            payload: { url_id: 1 }
        })


        fetch(`${proxy}/api/${ unique_string }/projects/project/${project_id}`).then( res => res.json() )
        .then( resp => {
            const { project, owner, partners, users, versions, tasks, taskStates, task_modify } = resp.data;
            setProject(project);
            setOwner(owner[0]); setPartners(partners); setUsers(users);
            setTasks( tasks );
            setTask( tasks[0] )
            _setTask( tasks[0] )

            const formatedTaskModify = task_modify.map( (change, index) => {
                return { ...change, modified_on: dateGenerator( change.modified_at ), id: `ID_${index}` }
            })
            setTaskModify( formatedTaskModify )

            setVersions(versions);
            setStatuses(taskStates);

            const oldST = taskStates.filter( st => st.status_id == tasks[0].task_state )[0];
            setOldStatus( oldST );
        })
    }, [])

    useEffect( () => {
        const initialView = taskModify.filter( tsk => tsk.task_id == task.task_id );
        setTaskModifyTableView( initialView != undefined? initialView: [] );
    }, [ taskModify ])

    const removePartner = ( user ) => {
        const { credential_string, account_role } = user;

        const _partners = partners.filter( ptrs => ptrs.credential_string != credential_string );
        const _users = users.filter( ptrs => ptrs.credential_string != credential_string );
        setPartners( _partners );
        setUsers( _users )

        fetch(`${proxy}/api/${unique_string}/projects/project/${project_id}/${ credential_string }`, {
            method: "DELETE"
        }).then( res => res.json() ).then( resp => {
            console.log(resp);
        })
    }

    const addUsersDialog = () => {
        setDialog( !dialog )
    }

    const submitPartnersAndUsers = ( selectedUsers ) => {
        const newPartners = selectedUsers.filter( u => u.account_role === "admin" );
        const newUsers = selectedUsers.filter( u => u.account_role === "user" );

        setPartners([...partners, ...newPartners])
        setUsers([...users, ...newUsers])

        fetch(`${proxy}/api/${ unique_string }/projects/project/${ project.project_id }/partners/and/users`, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({ partners: newPartners, users: newUsers })
        }).then( res => res.json() ).then( data => {

        })
    }

    const createTask = () => {
        fetch(`${proxy}/api/${ unique_string }/projects/project/tasks`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ credential_string, project_id })
        }).then( res => res.json() ).then( data => {
            const { task } = data;
            setTasks([task, ...tasks]);
        })
    }

    const hasChangePri = () => {
        if( project.project_master ){
            if( project.project_master === credential_string || task.task_owner === credential_string || account_role==="su" ){
                return true;
            }
            else{
                return false
            }
        }else{
            return false;
        }
    }

    const taskStateSwitch = () => {
        setTaskState( !taskState )

        if( _task != task ){
            setTask(_task);
            const changes = [{
                    name: "task_label",
                    value: _task.task_label,
                    from_value: task.task_label,
                    modified: {
                        old: task.task_label,
                        new: _task.task_label
                    },
                    modified_what: "nhãn yêu cầu"
                },
                {
                    name: "task_description",
                    value: _task.task_description,
                    from_value: task.task_description,
                    modified: {
                        old: task.task_description,
                        new: _task.task_description
                    },
                    modified_what: "nội dung yêu cầu"
                },
            ]

            setTaskModify([
                {
                    task_id: task.task_id,
                    modified_by: credential_string,
                    modified_what: "nhãn yêu cầu",
                    from_value: task.task_label,
                    to_value: _task.task_label,
                    modified_on: dateGenerator(new Date().toString()),
                    id: `ID_${taskModify.length}`,
                    ...auth
                },
                {
                    task_id: task.task_id,
                    modified_by: credential_string,
                    modified_what: "nội dung yêu cầu",
                    from_value: task.task_description,
                    to_value: _task.task_description,
                    modified_on: dateGenerator(new Date().toString()),
                    id: `ID_${taskModify.length + 1}`,
                    ...auth
                }, ...taskModify
            ])

            fetch(`${ proxy }/api/${ unique_string }/projects/project/task`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ changes, task_id: task.task_id, credential_string })
            }).then( res => res.json() ).then( data => {
                const { success } = data
                const newTasks = tasks.map( task => {
                    if( task.task_id === _task.task_id ){
                        return _task;
                    }else{
                        return task;
                    }
                })
                setTasks([...newTasks])
            });
        }

    }

    const dropState = () => {
        if( hasChangePri() ){
            let height = 0;
            if( stateHeight === 0 ){
                height = $('#status-container').height() + 25;
            }
            setStateHeight(height);
        }
    }

    const updateTaskStatus = ( status ) => {
        if( status != oldStatus ){
            const _task = { ...task, ...status };
            dropState();
            setTask({ ...task, ...status })
            setOldStatus( status )

            const changes = [{
                    name: "task_state",
                    value: status.status_id,
                    from_value: oldStatus.status_id,
                    modified: {
                        old: oldStatus.status_name,
                        new: status.status_name
                    },
                    modified_what: "trạng thái của yêu cầu"
                },
            ]

            setTaskModify([
                {
                    task_id: task.task_id,
                    modified_by: credential_string,
                    modified_what: "trạng thái của yêu cầu",
                    from_value: oldStatus.status_name,
                    to_value:  status.status_name,
                    modified_on: dateGenerator(new Date().toString()),
                    id: `ID_${taskModify.length}`,
                    ...auth
                }, ...taskModify
            ])

            fetch(`${ proxy }/api/${ unique_string }/projects/project/task`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ changes, task_id: task.task_id, credential_string })
            }).then( res => res.json() ).then( data => {
                const { success } = data
                const newTasks = tasks.map( task => {
                    if( task.task_id === _task.task_id ){
                        return _task;
                    }else{
                        return task;
                    }
                })
                setTasks([...newTasks])
            });

        }
    }

    const changeTask = ( task ) => {
        setTask( task );
        _setTask(task);
        const { status_id, status_name } = task;
        setStateHeight(0)
        const newTaskModified = taskModify.filter( tsk => tsk.task_id == task.task_id )
        setOldStatus({ status_id, status_name })

        setTaskModifyTableView( [ ...newTaskModified ])
    }

    return(
        <div className="fixed-default fullscreen main-bg overflow flex flex-no-wrap">
            <Navbar urls={ urls } bottomUrls={ bottomUrls }/>
            <div className={`app fixed-default overflow ${ !navState ? "app-stretch": "app-scaled" }`} style={{ height: "100vh" }}>
                <Horizon />
                <div className="p-1">

                    {/* PROJECT AND MASTER */}
                    <div className="flex flex-wrap m-t-1">
                        <div className="w-50-pct p-1 scaled-card">
                            <div className="p-1 bg-white h-fit shadow-blur">
                                <span className="block text-28-px">{ project.project_name }</span>
                                <div className="m-t-1 m-b-1 flex flex-no-wrap flex-aligned">
                                    <span className="block text-12-px bold m-r-1">#{ project.project_code }</span>
                                    <span className="block w-max-content white text-12-px p-t-0-5 p-b-0-5 p-l-1 p-r-1 border-radius-12-px upper" style={{ backgroundColor: `${ stateColors[ project.status_name ] }` }}>{ autoLabel(project.status_name) }</span>
                                </div>
                                <span className="block text-14-px gray">{ project.description }</span>
                            </div>
                        </div>
                        <div className="w-50-pct p-1 scaled-card">
                            <div className="p-1 bg-white flex flex-no-wrap h-fit shadow-blur">
                                <div className="w-50-pct rel">
                                    <span className="block text-24-px">@{ owner.fullname }</span>
                                    <div className="p-1">
                                        <span className="abs b-0 l-0 text-18-px">Phụ trách dự án</span>
                                    </div>
                                </div>
                                <div className="ml-auto p-1 rel w-50-pct">
                                    <img className="abs b-0 r-0 border-radius-12-px block shadow-blur" style={{ width: "10em" }} src={ owner.avatar === defaultImage? defaultImage : `${proxy}/${ owner.avatar }`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*  VERSION AND USER */}

                    {/* VERSION */}
                    <div className="dual-scroll-view flex flex-no-wrap">
                        <div className="w-50-pct p-1">
                            <div className="w-100-pct column h-fit bg-white shadow-blur">
                                <div className="shadow-blur p-1">
                                    <span className="text-18-px">Các phiên bản</span>
                                </div>

                                <div className="flex flex-no-wrap shadow-blur">
                                    <div className="fill-available p-1">
                                        <input className="no-border w-100-pct" placeholder="Tìm kiếm"/>
                                    </div>
                                    { hasChangePri() ?
                                        <div className="w-48-px flex flex-middle">
                                            <button className="bold text-24-px no-border bg-green white border-radius-50-pct pointer" style={{ width: "32px", height: "32px" }}>+</button>
                                        </div>
                                        : null
                                     }
                                </div>

                                <div className="fill-available p-0-5 overflow">
                                    {
                                        versions.map( ver =>
                                            <div key={ ver.version_id } onClick={ () => { openTab(`/su/project/${ project_id }/version/${ ver.version_id }`) } } className="shadow-blur p-1 shadow-hover pointer ease">
                                                <div className="flex flex-wrap">
                                                    <div className="w-100-pct">
                                                        <span className="text-20-px block">{ ver.version_name }</span>
                                                    </div>
                                                    <div className="w-50-pct">
                                                        <span className="text-16-px block">bởi @<b>{ ver.fullname }</b></span>
                                                    </div>
                                                    <div className="w-50-pct">
                                                        <span className="text-16-px block">{ dateGenerator(ver.publish_on) }</span>
                                                    </div>
                                                </div>
                                                <div className="m-t-1">
                                                    <span className="text-16-px block">{ver.descriptions}</span>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>

                            </div>
                        </div>

                        {/* PARTNERS AND USERS */}

                        <div className="w-50-pct p-1">
                            <div className="w-100-pct column h-fit bg-white shadow-blur">
                                <div className="shadow-blur flex flex-no-wrap">
                                    <div  onClick={ () => { setUserScrollView([ 1, 0 ]) } } className="pointer p-1 w-50-pct flex flex-middle">
                                        <span className={`text-18-px ${ userScrollView[0] ? "": "gray" }`}>Nhóm triển khai</span>
                                    </div>
                                    <div  onClick={ () => { setUserScrollView([ 0, 1 ]) } } className="pointer p-1 w-50-pct flex flex-middle">
                                        <span className={`text-18-px ${ userScrollView[1] ? "": "gray" }`}>Người dùng</span>
                                    </div>
                                </div>
                                <div className="flex flex-no-wrap shadow-blur">
                                    <div className="fill-available p-1">
                                        <input className="no-border w-100-pct" placeholder="Tìm ai đó..."/>
                                    </div>
                                    { hasChangePri() ?
                                        <div className="w-48-px flex flex-middle">
                                            <button onClick={ addUsersDialog } className="bold text-24-px no-border bg-green white border-radius-50-pct pointer" style={{ width: "32px", height: "32px" }}>+</button>
                                        </div>
                                        : null
                                     }
                                </div>
                                <div className="fill-available p-0-5 overflow">

                                    { userScrollView[0] ?
                                        <div className="flex flex-wrap w-100-pct project-card-50-pct">
                                            { partners && partners.map( user =>
                                                <UserCard user={ user } key={ user.credential_string } alterFunc = { removePartner }/>
                                            )}
                                        </div>
                                         : null
                                    }

                                    { userScrollView[1] ?
                                        <div className="flex flex-wrap w-100-pct project-card-50-pct">
                                            { users && users.map( user =>
                                                <UserCard user={ user } key={ user.credential_string } alterFunc = { removePartner }/>
                                            )}
                                        </div> : null
                                    }
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* TASKS */}

                    <div className="w-100-pct mg-auto" style={{ height: "90vh" }}>
                        <div className="flex flex-no-wrap h-fit ">
                            <div className="w-35-pct column h-fit p-1">
                                {/* SEARCH AND ADD */}
                                <div className="flex flex-no-wrap bg-white shadow-blur">
                                    <div className="fill-available p-1">
                                        <input className="no-border w-100-pct" placeholder="..."/>
                                    </div>
                                    <div className="w-48-px flex flex-middle">
                                        <button onClick={ createTask } className="bold text-24-px no-border bg-green white border-radius-50-pct pointer" style={{ width: "32px", height: "32px" }}>+</button>
                                    </div>
                                </div>


                                <div className="fill-available overflow m-t-1">

                                    { tasks.map( task =>
                                        <div key={task.task_id} onClick={ () => { changeTask( task ) } } className="block m-b-1 p-1 bg-white shadow-blur shadow-hover pointer">
                                            <span className="block text-20-px">{ task.task_label }</span>
                                            <div className="flex flex-no-wrap m-t-3">
                                                <div className="fill-available">
                                                    <span className="block text-14-px">Bởi @<b>{ task.fullname }</b></span>
                                                    <span className="block text-14-px gray">{ dateGenerator(task.change_at) }</span>
                                                </div>
                                                <div className="w-32-px flex flex-bottom">
                                                    <span className="block border-radius-50-pct" style={{ width: "32px", height: "32px", border: `5px solid ${ stateColors[ task.status_name ] }`}}/>
                                                </div>
                                            </div>
                                        </div>
                                    ) }

                                </div>
                            </div>
                            <div className="w-65-pct p-1">
                                <div className="block h-fit bg-white scroll-y p-1 shadow-blur">
                                    <div className="p-1">

                                    {/* Task header */}
                                    <div className="p-0-5">
                                        <div className="flex rel">
                                            <div className="flex flex-bottom w-100-pct">
                                                { taskState ?
                                                    <input className="block text-20-px no-border w-100-pct" value={ _task.task_label }
                                                        onChange={ (e) => { _setTask({ ..._task, task_label: e.target.value }) } }
                                                    />
                                                    :
                                                    <span className="block text-20-px">{ _task.task_label }</span>
                                                }
                                            </div>
                                            <div className="w-32-px">
                                            { hasChangePri() ?
                                                <div className="abs b-0 r-0" onClick={ taskStateSwitch }>
                                                    <img src="/assets/icon/edit.png" className="w-24-px pointer"/>
                                                </div>
                                            : null
                                            }
                                            </div>
                                        </div>

                                        <hr className="block border-1-top"/>

                                        <div className="flex">
                                            <div className="flex flex-bottom">
                                                <span className="block text-14-px">{ dateGenerator(task.change_at) }</span>
                                            </div>
                                            <div className="flex flex-bottom ml-auto pointer" onClick={ dropState }>
                                                <span className="block text-14-px">{ task.status_name }</span>
                                                <span className="block border-radius-50-pct m-l-1" style={{ width: "18px", height: "18px", border: `5px solid ${ stateColors[ task.status_name ] }`}}/>
                                            </div>
                                        </div>

                                        <div className="rel w-100-pct">
                                            <div className="abs t-0 r-0 no-overflow" style={{ width: "200px", height: `${stateHeight}px`}}>
                                                <div id="status-container" className="w-100-pct ease">
                                                    {
                                                        statuses.map( status =>
                                                            <div key={status.status_id} onClick={ () => { updateTaskStatus( status ) } } className="flex flex-bottom m-0-5 p-0-5 bg-white shadow-blur pointer shadow-hover">
                                                                <span className="block border-radius-50-pct" style={{ width: "18px", height: "18px", border: `5px solid ${ stateColors[ status.status_name ] }`}}/>
                                                                <span className="block m-l-1 text-14-px">{ status.status_name }</span>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                    </div>


                                    {/* Task body */}
                                        <div className="p-0-5">
                                            <div className="m-t-5">
                                                { taskState ?
                                                    <textarea onKeyDown = { (e) => {
                                                        e.target.style.height = 'inherit';
                                                        e.target.style.height = `${e.target.scrollHeight + 15 }px`;
                                                    }}


                                                        className="block w-100-pct text-16-px no-border border-1-bottom"
                                                        value={ _task.task_description }
                                                        style={{ minHeight: 350 }}
                                                        onChange={ (e) => { _setTask({ ..._task, task_description: e.target.value }) } }
                                                    />
                                                    :
                                                    <div>
                                                        { _task.task_description ? _task.task_description.split('\n').map( line =>
                                                                <div>
                                                                    { line ?
                                                                        <span className="block w-100-pct text-16-px">{ line } </span>
                                                                        :
                                                                        <span className="block w-100-pct text-16-px p-0-5">{ line } </span>
                                                                    }
                                                                </div>
                                                        ) : null }
                                                    </div>
                                                }

                                            </div>

                                            <div className="m-t-2">
                                                <span className="block text-16-px">Bởi @{task.fullname }</span>
                                            </div>
                                        </div>
                                    { /* TASK MEMBERS */ }
                                    <div className="m-t-1">
                                        <hr className="block border-1-top"/>

                                        <div className="flex flex-no-wrap">
                                            <div className="w-50-pct">
                                                <span className="block p-0-5 text-16-px">Người tạo yêu cầu</span>
                                                <UserCard readOnly={ true } user={ task }/>
                                            </div>

                                            {/*
                                            <div className="w-50-pct">
                                                <span className="block p-0-5 text-16-px">Nhóm thực hiện</span>
                                                <UserCard readOnly={ true } user={ task }/>
                                                <UserCard readOnly={ true } user={ task }/>
                                            </div>
                                            */}
                                        </div>
                                    </div>

                                    { /* TASK MODIFY */ }
                                    { taskModifyTableView.length > 0 ?

                                    <TableView data={ taskModifyTableView } fields={[
                                        { name: "Thay đổi lúc", alias: "modified_on" },
                                        { name: "Bởi", alias: "fullname" },
                                        { name: "Thay đổi", alias: "modified_what" },
                                        { name: "Từ", alias: "from_value" },
                                        { name: "Thành", alias: "to_value" },
                                    ]} index={ "id" } maxRow={5}
                                    /> : <span className="block text-16-px text-center p-2">Chưa có thay đổi nào cả</span>
                                    }

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
            { dialog ?
                <AddUserDialog submit={ submitPartnersAndUsers } setDialog={ addUsersDialog } partners_ = { partners } users_ ={ users } project_master={ project.project_master }/>
                : null
            }


        </div>
    )
}

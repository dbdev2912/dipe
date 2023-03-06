import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UserCard from '../../users/userselectcard';

export default ( props ) => {
    const { submit, formSwitching, project_master, projects, setProjects } = props;


    const [ admins, setAdmins ] = useState([]);

    const { unique_string, proxy } = useSelector( state => state );
    const [ loaded, setLoaded ] = useState(false);
    const [ project, setProject ] = useState({
        project_name: "Dự án mới",
        description: "Mô tả cho dự án mới.",
    })
    const [ currentPrivilege, setCurrentPrivilege ] = useState("");
    const defaultHeight = 400;
    const [ height, setHeight ] = useState(0);

    useEffect( () => {

        fetch(`${proxy}/api/${ unique_string}/user/getall`).then( res => res.json() )
        .then( resp => {
            const { data, success } = resp;

            if( data != undefined && data.length > 0 ) {
                const projectMaster = data.filter( user => user.credential_string === project_master )[0];
                const _admins = data.filter( user => user.account_role === "admin" );
                setAdmins( _admins );
                setProject({ ...project, project_master: projectMaster })
                setCurrentPrivilege( projectMaster.account_role )
                setTimeout(() => {
                    setLoaded(true)
                }, 500)
            }
        })

    }, [])

    const changeMaster = () => {
        if( currentPrivilege === "su" ){

            setHeight( height != 0 ? 0: defaultHeight )

        }
    }

    const adminSelected = ( user ) => {
        setProject({ ...project, project_master: user })
        setHeight( 0 )
    }

    const submitProject = () => {
        fetch(`${ proxy }/api/${ unique_string }/projects`, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({ project })
        }).then( res => res.json() ).then( resp => {
            const { project } = resp
            setProjects([...projects, project])
            formSwitching()
        })
    }

    return(
        <div className="fixed-default z-index-11 fullscreen p-1">
            <div className="rel z-index-2 container bg-white h-fit column">
                { !loaded ?
                    <div className="w-100-pct h-fit flex flex-middle">
                        <img className="circle-processing" src="/assets/image/circle-processing.png"/>
                    </div>
                    :
                    <div className="column w-100-pct h-fit p-1">
                        <div className="w-100-pct">
                            <div>
                                <input spellCheck="false" placeholder="Tên dự án" className="block no-border border-1-bottom w-100-pct text-28-px p-1 text-center" value={ project.project_name }
                                    onChange={ (e) => {
                                        setProject( {...project, project_name: e.target.value} )
                                    }}
                                />
                            </div>
                            <div className="flex flex-no-wrap m-t-2">
                                <div className="w-50-pct">
                                    <textarea className="block border-1-bottom w-100-pct text-16-pct size-fixed scroll-y no-border" style={{ height: "200px" }}
                                        onChange={ (e) => {
                                            setProject( {...project, description: e.target.value} )
                                        }}
                                        placeholder={ "Mô tả dự án" }
                                        value={ project.description }
                                    />
                                </div>
                                <div className="w-40-pct p-1 ml-auto border-1-bottom">
                                    <span className="text-16-px block">Nhân viên phụ trách</span>
                                    <div className="m-t-1">
                                        { project.project_master ?
                                            <UserCard user={ project.project_master } readOnly={ true } clickTrigger={ changeMaster }/>
                                         : null}
                                    </div>
                                </div>
                            </div>

                            <div className="rel w-100-pct">
                                <div className="abs w-40-pct r-0 t-0">
                                    <div className="w-100-pct shadow-blur ease no-overflow" style={{ height: `${ height }px` }}>
                                        <div className="w-100-pct column" style={{ height: `${ defaultHeight }px` }}>
                                            <div className="w-100-pct p-0-5">
                                                <input className="no-border text-16-px p-1 border-1-bottom block w-100-pct" placeholder={"Tìm kiếm"}/>
                                            </div>
                                            <div className="fill-available scroll-x">
                                                { admins.map( admin =>
                                                    <UserCard user={ admin } key={ admin.credential_string } readOnly="true"
                                                        clickTrigger={ adminSelected }
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="abs b-0 r-0 p-1">
                            <button onClick={ submitProject } className="upper pointer block w-max-content white text-center p-t-0-5 p-b-0-5 p-l-1 p-r-1 no-border bg-green">Thêm</button>
                        </div>

                    </div>
                }
            </div>
            <div className="abs-default z-index-1 fullscreen trans-dark" onClick={ formSwitching }></div>
        </div>
    )
}

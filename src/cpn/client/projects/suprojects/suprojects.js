import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Navbar, Horizon } from '../../../navbar';

import ProjectCard from './projectCard';
import ProjectAddForm from './addproject';

export default () => {
    const { urls, bottomUrls } = useSelector( state => state.navbarLinks.su )
    const { navState, unique_string, proxy } = useSelector( state => state );
    const { credential_string } = useSelector( state => state.auth );
    const dispatch = useDispatch()
    const [ projects, setProjects ] = useState([])
    const [ form, setForm ] = useState(0);

    useEffect( () => {
        dispatch({
            type: "setNavBarHighLight",
            payload: { url_id: 1 }
        })
        fetch(`${proxy}/api/${ unique_string }/projects`).then( res => res.json() )
        .then( data => {
            const { projectDetails } = data;
            if( projectDetails != undefined && projectDetails.length > 0 ){
                setProjects(projectDetails);
            }
        })
    }, [])

    const formSwitching = () => {
        setForm( !form )
    }

    return(
        <div className="fixed-default fullscreen main-bg overflow flex flex-no-wrap">
            <Navbar urls={ urls } bottomUrls={ bottomUrls }/>
            <div className={`app fixed-default overflow ${ !navState ? "app-stretch": "app-scaled" }`} style={{ height: "100vh" }}>
                <Horizon />
                <div className="p-1">
                    { /*  SEARCH BAR */  }

                    <div className="w-100-pct bg-white p-1">
                        <div className="flex flex-no-wrap">
                            <div className="w-100-pct flex flex-no-wrap">
                                <div className="w-24-px flex flex-middle">
                                    <img src="/assets/icon/search.png" className="w-100-pct block"/>
                                </div>
                                <input className="no-border w-100-pct p-l-2" placeholder="Tìm kiếm dự án"/>
                            </div>
                            <div className="ml-auto">
                                <button onClick={ formSwitching } className="upper pointer block w-max-content white text-center p-t-0-5 p-b-0-5 p-l-1 p-r-1 no-border bg-green">Thêm mới</button>
                            </div>
                        </div>
                    </div>

                    { /*  SORTING AND VIEW MODE */  }

                    <div>
                        <div className="flex flex-no-wrap">
                            <div>
                                <span className="block text-20-px">{ projects.length } dự án</span>
                            </div>

                            <div className="flex flex-no-wrap ml-auto">

                                { /*  SORTING */  }

                                <div className="p-0-5 flex flex-no-wrap bg-white shadow-blur p-0-5 m-0-5 pointer">
                                    <div className="block">
                                        <span className="block text-16-px">Trạng thái</span>
                                    </div>
                                    <div className="flex flex-middle w-24-px">
                                        <img src="/assets/icon/drop-arrow.png" className="block w-50-pct"/>
                                    </div>
                                </div>

                                { /*  VIEW MODE */  }

                                <div className="p-0-5 flex flex-no-wrap bg-white shadow-blur p-0-5 m-0-5 pointer">
                                    <div className="block w-24-px">
                                        <img src="/assets/icon/viewmode/grid.png" className="block w-100-pct"/>
                                    </div>
                                    <div className="flex flex-middle w-24-px">
                                        <img src="/assets/icon/drop-arrow.png" className="block w-50-pct"/>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>

                    {/*  PROJECT CARDS */}
                    <div className="flex flex-wrap">
                        { projects.length > 0 && projects.map(project =>
                            <ProjectCard key={ project.project_id } project = { project }/>
                        )}
                    </div>



                </div>
            </div>
            {
                form ?
                <ProjectAddForm formSwitching={ formSwitching } project_master={ credential_string }
                    projects={ projects } setProjects={ setProjects }
                />
                : null
            }
        </div>
    )
}

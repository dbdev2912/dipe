import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Navbar, Horizon } from '../../../navbar';
import DataGrid from "./DataGrid";
import NewProject from "./NewProject";
import Project from "./Project";
import ProjectWithMe from "./ProjectWithMe";

const btns = [
    { id: 0, label: "Dự án của mị", icon: "", tabs: [1, 0, 0, 0], color_1: "#00aeef", color_2: "#0076a3" },
    { id: 1, label: "Dự án có mặt mị", icon: "", tabs: [0, 0, 0, 1], color_1: "#ff00c0", color_2: "#a3007b" },
    { id: 2, label: "Thêm mới", icon: "", tabs: [0, 1, 0, 0], color_1: "#0acf0a", color_2: "#018801" },
]

export default () => {
    const dispatch = useDispatch();
    const { navState } = useSelector( state => state );
    const tabLabels = [ "Dự án của mị", "Thêm mới", "Chi tiết dự án", "Dự án có mặt mị" ]
    const [ tabs, setTabs ] = useState([ 1, 0, 0, 0 ])
    const { urls, bottomUrls } = useSelector( state => state.navbarLinks.admin )

    const projects = [
        { project_id: 0, project_name: "Dự án Cờ Pờ Đồng Nai", creator: "Bé Mốc nè", starttime: "29/12/2018" },
        { project_id: 1, project_name: "Dự án RFID Đạm Cà Mau", creator: "Bé Mốc nè", starttime: "29/1/2019" },
        { project_id: 2, project_name: "Dự án QR Code Tân Uyên Bình Dương", creator: "Bé Mốc nè", starttime: "4/6/2020" },
    ]

    useEffect( () => {
        dispatch({
            type: "setNavBarHighLight",
            payload: { url_id: 1 }
        })
    }, [])

    return(
        <div className="fixed-default fullscreen main-bg overflow flex flex-no-wrap">
            <Navbar urls={ urls } bottomUrls={ bottomUrls }/>
            <div className={`app fixed-default overflow ${ !navState ? "app-stretch": "app-scaled" }`} style={{ height: "100vh" }}>
                <Horizon />

                <div className="p-1 m-t-1" style={{ minHeight: "200vh" }}>
                    <span className="block text-24-px">{ tabLabels[ tabs.indexOf(1) ] }</span>
                    <div className="flex flex-wrap w-100-pct m-t-2">
                        { btns.map( btn =>
                            <div className={`flex flex-no-wrap m-r-1 shadow pointer ${ tabs == btn.tabs ? "hidden": ""  }`} key={ btn.id } onClick={ () => { setTabs( btn.tabs ) } }>
                                <div className="p-0-5" style={{ backgroundColor: btn.color_1 }}>
                                    <span className="text-16-px p-l-2 p-r-1 block text-center white">{ btn.label }</span>
                                </div>
                                <div className="flex flex-middle p-0-5 w-36-px" style={{ backgroundColor: btn.color_2 }}>
                                    <span className="white-arrow-right"/>
                                </div>
                            </div>
                        ) }


                    </div>

                    { tabs[0] ? <DataGrid /> : null }

                    { tabs[1] ? <NewProject /> : null }

                    { tabs[2] ? <Project /> : null }

                    { tabs[3] ? <ProjectWithMe /> : null }


                </div>
            </div>
        </div>
    )
}

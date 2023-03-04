import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import $ from 'jquery';

import { Navbar, Horizon } from '../../navbar';
import ProjectCard from '../projects/suprojects/projectCard'


export default () => {
    const dispatch = useDispatch();
    const { credential_string } = useParams();
    const [ user, setUser ] = useState({})
    const [ height, setHeight ] = useState(0)
    const [ projects, setProjects ] = useState({
        own:     { success: false },
        partner: { success: false },
        use:     { success: false },
    })

    const [ offset, setOffset ] = useState({
        x: -500,
        y: -500,
    })

    const [ input, setInput ] = useState({})

    const { urls, bottomUrls } = useSelector( state => state.navbarLinks.su )
    const { navState, unique_string, proxy, defaultImage } = useSelector( state => state );
    const { titleCase } = useSelector( state => state.functions )

    useEffect( () => {
        dispatch({
            type: "setNavBarHighLight",
            payload: { url_id: 2 }
        })

        const height = $('#ava-container').width() * 75 / 100;
        setHeight( height )

        fetch(`${proxy}/api/${ unique_string}/user/getall/${ credential_string }`).then( res => res.json() )
        .then( resp => {
            const { data, success } = resp;
            if( data != undefined && data.length > 0 ) {
                const nameSplited = data[0].fullname.split(" ");
                const usr = {...data[0], name: nameSplited[ nameSplited.length - 1 ]}
                setUser( usr )
            }

            fetch(`${ proxy }/api/${ unique_string }/projects/of/${ credential_string }`).then( res => res.json() )
            .then( resp => {
                const { success, projects } = resp;
                setProjects( projects )
            })

        })
    }, [])

    window.onresize = () => {
        const height = $('#ava-container').width() * 75 / 100;
        setHeight( height )
    }

    const inputBox = (e, key) => {
        const $target = $(e.target);
        const targetOffset = $target.offset()
        const { left, top } = targetOffset;
        setInput({ key, value: user[key] })
        setOffset({ x: left, y: top + 32 })
        $('#input-box').focus()
    }

    const enterTrigger = (e) => {
        if( e.keyCode === 13 ){
            submitChange()
        }
    }

    const submitChange = () => {
        const { key, value } = input;

        fetch(`${proxy}/api/${unique_string}/user/prop/${ user.credential_string }`, {
            method: "PUT",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ key, value }),
        }).then( res => res.json() ).then( data => {
            console.log(data);
            const newUser = user;
            newUser[key] = value;
            setUser( {...newUser} );
            setOffset({ x: -500, y: -500 })
        })
    }

    const discardChange = () => {
        setOffset({ x: -500, y: -500 })
    }

    const changeAva = (e) => {
        const files = e.target.files;
        if( files ){
            const file = files[0];
            if( file != undefined ){

                const reader = new FileReader();
                reader.readAsDataURL( file );
                reader.onload = (e) => {
                    setUser({ ...user, avatar: e.target.result })

                    fetch(`${proxy}/api/${ unique_string }/user/${ user.credential_string }/changeava`, {
                        method: "PUT",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({ img: e.target.result })
                    }).then( res => res.json() ).then( data => {
                        console.log(data)
                    })
                }
            }
        }
    }

    return(
        <div className="fixed-default fullscreen main-bg overflow flex flex-no-wrap ">
            <Navbar urls={ urls } bottomUrls={ bottomUrls } />
            <div className={`app fixed-default overflow ${ !navState ? "app-stretch": "app-scaled" }`} style={{ height: "100vh" }}>
                <Horizon />

                <div className="p-1">

                    <div className="profile-card bg-white mg-auto p-1">


                        <div className="flex flex-wrap">
                            <div className="w-60-pct rel">
                                <span onClick={ (e) => { inputBox(e, "fullname") } } className="block text-24-px">@{ user.fullname }</span>
                                <div className="flex flex-no-wrap m-t-1">
                                    <span onClick={ (e) => { inputBox(e, "email") } } className="block w-50-pct text-16-px gray">{ user.email }</span>
                                    <span onClick={ (e) => { inputBox(e, "phone") } } className="block w-50-pct text-16-px gray">{ user.phone }</span>
                                </div>
                                <span onClick={ (e) => { inputBox(e, "address") } } className="block text-16-px m-t-1">{ user.address }</span>

                                <span className="block text-24-px abs b-0 l-0">{ user.account_role && titleCase( user.account_role ) }</span>
                            </div>
                            <div id="ava-container" className="w-40-pct flex flex-middle">
                                { user.avatar ?
                                    <div onClick={ () => { $("#avatar").click() } } className="block w-75-pct border-radius-12-px pointer bg-fit" style={{ height: `${height}px`, backgroundImage: `url(${ user.avatar === defaultImage ? user.avatar : `${ user.avatar.length < 100 ? proxy : "" }${ user.avatar }` })` }}/>
                                    : null
                                }
                                <input type="file" id="avatar" className="hidden" onChange={ changeAva }/>
                            </div>
                        </div>

                        <div className="fixed bg-white shadow" style={{ top: `${ offset.y }px`, left: `${ offset.x }px`, width: "325px" }}>
                            <div className="flex flex-no-wrap w-100-pct p-0-5">
                                <input id={ "input-box" } onBlur={ discardChange } onChange={ (e) => { setInput({ ...input, value: e.target.value }) } } onKeyUp={ enterTrigger } className="no-border border-1-bottom block w-100-pct p-0-5" value={ input.value }/>
                                <div className="flex flex-middle w-48-px">
                                    <img onClick={ submitChange } className="block w-50-pct pointer" src="/assets/icon/check-color.png"/>
                                </div>
                                <div className="flex flex-middle w-48-px">
                                    <img onClick={ discardChange } className="block w-50-pct pointer" src="/assets/icon/cross-color.png"/>
                                </div>
                            </div>
                        </div>

                        <hr className="border-1-top block m-t-1"/>
                        { projects.own.success ?
                            <div className="m-t-1">
                                <span className="block text-20-px">Dự án của { user.name }</span>

                                <div className="flex flex-no-wrap">
                                    { projects.own.success && projects.own.projectDetails.map(project =>
                                        <ProjectCard key={ project.project_id } project = { project }/>
                                    )}
                                </div>
                            </div>
                        : null }

                        { projects.partner.success ?
                            <div className="m-t-1">
                                <span className="block text-20-px">Dự án { user.name } đã tham gia</span>

                                <div className="flex flex-no-wrap">
                                    { projects.partner.success && projects.partner.projectDetails.map(project =>
                                        <ProjectCard key={ project.project_id } project = { project }/>
                                    )}
                                </div>
                            </div>
                        : null }

                        { projects.use.success ?
                            <div className="m-t-1">
                                <span className="block text-20-px">Dự án { user.name } là người dùng</span>

                                <div className="flex flex-no-wrap">
                                    { projects.use.success && projects.use.projectDetails.map(project =>
                                        <ProjectCard key={ project.project_id } project = { project }/>
                                    )}
                                </div>
                            </div>
                        : null }


                    </div>
                </div>

            </div>
        </div>
    )
}

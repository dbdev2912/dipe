import { useSelector, useDispatch } from 'react-redux';

export default (props) => {

    const { project } = props;
    const { dateGenerator, autoLabel, openTab } = useSelector( state => state.functions )

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

    const { defaultImage, proxy } = useSelector( state => state )

    const redirectOrSomething = () => {
        const { project_id } = project;
        openTab(`/su/project/${ project_id }`)
    }

    return(
        <div className="project-card m-1 p-1 bg-white shadow-blur">

            { /* STATUS LABEL */ }
            <div>
                <span className="block w-max-content white text-12-px p-t-0-5 p-b-0-5 p-l-1 p-r-1 border-radius-12-px upper" style={{ backgroundColor: `${ stateColors[ project.status_name ] }` }}>{ autoLabel(project.status_name) }</span>
            </div>

            { /* PROJECT NAME AND CREATED DATE */ }
            <div className="m-t-2">
                <span onClick={ redirectOrSomething } className="block text-20-px pointer underline-hover">{ project.project_name }</span>
                <span className="block text-12-px bold m-r-1">{ project.project_code }</span>
                <span className="block gray text-14-px">{ dateGenerator( project.create_on ) }</span>
            </div>

            { /* MASTER AND PARTNERS */ }

            <div className="m-t-0-5">
                <div className="flex flex-no-wrap">
                    <div className="main-pic w-64-px">
                        <img src={ project.avatar == defaultImage ? defaultImage : `${proxy}${project.avatar}`  } className="block w-100-pct border-radius-50-pct"/>
                    </div>
                    { project.partners.length > 0 && project.partners.map( partner =>
                        <div key={ partner.credential_string } className="w-32-px flex flex-bottom">
                            <img src={ partner.avatar == defaultImage ? defaultImage : `${proxy}${partner.avatar}` } className="block w-32-px border-radius-50-pct"/>
                        </div>
                     ) }
                </div>
            </div>

            <hr className="block border-1-top"/>

            { /* RENCENT TASK */ }
            <div className="m-t-0-5">
                <textarea className="task-description-box block no-border border-1-bottom w-100-pct"
                 spellCheck="false"  defaultValue={ project.recentTask[0].task_label }
                />
                <span className="text-14-px italic">bởi <span className="bold">@{ project.recentTask[0].fullname }</span></span>
                <span className="block gray text-14-px">{ dateGenerator( project.recentTask[0].change_at ) }</span>
            </div>


        </div>
    )
}

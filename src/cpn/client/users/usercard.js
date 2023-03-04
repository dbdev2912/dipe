import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default (props) => {
    const { user, removeFromUI } = props;
    const { proxy, defaultImage, unique_string } = useSelector( state => state );
    const { openTab } = useSelector( state => state.functions )
    const [ hiddenMenu, setHiddenMenu ] = useState(false);
    const redirect = () => {
        if( !hiddenMenu ){
            openTab(`/su/user/${ user.credential_string }`)
        }
    }

    const ctxMenu = (e) => {
        e.preventDefault();
        setHiddenMenu( !hiddenMenu );
    }

    const removeUser = () => {
        fetch(`${proxy}/api/${ unique_string }/user/delete/${ user.credential_string }`, {
            method: 'DELETE',
            headers: {
                "content-type": "application/json",
            },
        }).then( res => res.json() ) .then( (data) => {
            removeFromUI( user );
        })
    }

    return(
        <div className="rel project-card p-0-5 bg-white m-0-5 shadow-blur pointer shadow-hover" key={ user.credential_string }
            onClick={ redirect } onContextMenu = { ctxMenu }
        >
            {
                hiddenMenu ?
                <div className="abs t-0 r-0">
                    <div className="flex flex-no-wrap m-0-5" onClick={ removeUser }>
                        <img className="w-20-px block" src="/assets/icon/cross-color.png"/>
                    </div>
                </div> : null
            }
            <div className="flex flex-no-wrap">
                <div className="flex flex-middle w-100-px">
                    <img className="w-100-pct block border-radius-50-pct" src={ user.avatar === defaultImage ? user.avatar : `${proxy}/${ user.avatar }`}/>
                </div>
                <div className="flex flex-aligned flex-wrap w-100-pct m-l-2">
                    <span className="text-20-px w-100-pct block">{ user.account_string }</span>
                    <span className="text-16-px w-100-pct block italic bold">@{ user.fullname }</span>
                    <span className="text-16-px w-100-pct block gray">{ user.email }</span>
                </div>
            </div>
        </div>
    )
}

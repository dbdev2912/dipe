import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default (props) => {
    const { user, clickTrigger, width } = props;
    const { proxy, defaultImage, unique_string } = useSelector( state => state );

    const select = () => {
        clickTrigger(user);
    }
    return(
        <div className="rel w-100-pct p-0-5 bg-white m-t-1 shadow-blur pointer shadow-hover" key={ user.credential_string }
            style={{ width: `${ width? width: "" }px` }}
            onClick={ select }
        >
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

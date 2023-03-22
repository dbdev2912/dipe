import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import GetMethod from './methods/get';
import PostMethod from './methods/post';


export default ( props ) => {

    const { version, project_id, tables, addApiFilter } = props;
    const dispatch = useDispatch()
    /* Em da lo yeu nguoi khong thuong em */
    /*
        Chia cai chon bang voi chon truong ra troi oi
    */

    const closeDialog = () => {
        dispatch({
            type: "setAddApiBox",
            payload: { filter:addApiFilter }
        })
    }

    return(
        <div className="fixed-default z-index-11 fullscreen p-1">
            { addApiFilter&&addApiFilter.value === "get" ?
                <GetMethod closeDialog={ closeDialog } version={ version } project_id={ project_id } tables={ tables } />
                    : null
            }
            { addApiFilter&&addApiFilter.value === "post" ?
                <PostMethod closeDialog={ closeDialog } version={ version } project_id={ project_id } tables={ tables } />
                    : null
            }
        </div>
    )
}

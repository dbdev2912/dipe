import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import UserCard from './usercard';

export default ( props ) => {
    const { proxy, defaultImage } = useSelector( state => state );
    const { openTab } = useSelector( state => state.functions )
    const { label, users, removeFromUI } = props;

    return(
        <div className="m-t-1">
            <span className="text-20-px block">{ label }</span>
            <div className="flex flex-wrap w-100-pct">
                { users && users.map( user =>
                    <UserCard user={ user } key={ user.credential_string } removeFromUI={ removeFromUI }/>
                )}
            </div>
        </div>
    )
}

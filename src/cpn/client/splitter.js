import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { SuHome, AdminHome, UserHome } from './home';

export default () => {

    const { credential_string, role } = useSelector( state => state.auth )

    return(
        <React.StrictMode>
            { role === "su" ? <SuHome/> : null }
            { role === "admin" ? <AdminHome/> : null }
            { role === "user" ? <UserHome/> : null }
        </React.StrictMode>
    )
}

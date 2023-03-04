import { useState, useEffect } from 'react';
import APP_API from '../../APP_API';

export default () => {
    useEffect(() => {
        // fetch( APP_API +"/api/auth/signout" ).then( res => res.json() )
        // .then( data => {
        //     const { success } = data;
        //     if( success ){
        //         window.location = "/login";
        //     }
        // })

        localStorage.removeItem( 'role' )
        localStorage.removeItem( 'credential_string' )
        localStorage.removeItem( '_token' )
        window.location = "/login"
    }, [])
    return null
}

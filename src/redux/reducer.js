import proxy from '../APP_API';
import navbarLinks from '../cpn/navbar/navbar-links';
import functions from './functions';

const initState = {
    highlight: 0,
    navState: true,
    unique_string: "dipev1",
    defaultImage: "/assets/image/icon.png",
    proxy,
    navbarLinks,
    functions,

    auth: {
        credential_string: localStorage.getItem('credential_string'),
        _token: localStorage.getItem('_token'),
        role: localStorage.getItem('role'),
    },

}

export default ( state = initState, action ) => {
    switch (action.type) {

        case "sessionInitialize":
            return sessionInitialize(state, action);
        break;

        case "setNavBarHighLight":
            return setNavBarHighLight(state, action)
            break;


        case "setNavState":
            return setNavState(state, action);
            break;
        case "initializedUserInfo":
            return initializedUserInfo( state, action );
            break;
        default:
            return state;
    }
}

const sessionInitialize = ( state, action ) => {
    const { auth } = action.payload;
    return { ...state, auth }
}


const setNavBarHighLight = ( state, action ) => {
    const { url_id } = action.payload;
    return { ...state, highlight: url_id }
}

const setNavState = ( state, action ) => {
    const { navState } = action.payload;
    return { ...state, navState }
}

const initializedUserInfo = ( state, action ) => {
    const { info } = action.payload;
    return { ...state, auth: { ...info, ...state.auth } }
}

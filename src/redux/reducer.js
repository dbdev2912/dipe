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

    addConstraintBox: false,
    addApi: false,
    defaultField: {},
    collection: {},
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
            // localStorage.setItem('navState', navState)
            return setNavState(state, action);
            break;
        case "initializedUserInfo":
            return initializedUserInfo( state, action );
            break;

        case "setAddConstraintBox":
            return {...state, addConstraintBox: !state.addConstraintBox }
            break;
        case "setAddApiBox":
            return {...state, addApi: !state.addApi }

        case "setDefaultField":
            return setDefaultField( state, action )
            break;
        case "setCurrentCollection":
            return {...state, collection: action.payload.collection, collections: action.payload.collections }
            break;
        case "addApiToCollectionFunc":
            return { ...state, functions: { ...state.functions, addApiToCollection: action.payload.addApiToCollection, collections: action.payload.collections } }
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

const setDefaultField = ( state, action ) => {
    const { defaultField } = action.payload;
    return { ...state, defaultField }
}

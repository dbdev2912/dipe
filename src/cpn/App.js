import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import APP_API from '../APP_API';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import "../css/index.scss";

import { Login, SignUp, SignOut } from './auth';
import { Home, Projects, SuProjects, SuProject, SuUsers, SuUser } from './client';

function App() {
    const dispatch = useDispatch()
    const { proxy, unique_string } = useSelector( state => state );
    const { _token, credential_string } = useSelector( state => state.auth );

    useEffect(() => {
        const specialURLs = [ "/login", "/signup", "/signout" ]
        const url = window.location.pathname;

        if( specialURLs.indexOf(url) === -1 ){
            if( !_token ){
                window.location = '/login'
            }
        }

        fetch(`${ proxy }/api/${ unique_string }/user/getall/${ credential_string }`).then( res => res.json() )
        .then( (data) => {
            const info = data.data[0];

            dispatch({
                type: "initializedUserInfo",
                payload: {
                    info
                }
            })
        })

    }, [])



  return (
      <React.StrictMode>
        <Router>
            <Routes>
                <Route exac path="/login" element={ <Login /> } />
                <Route exac path="/signup" element={ <SignUp /> } />
                <Route exac path="/signout" element={ <SignOut /> } />
                <Route exac path="/" element = { <Home /> } />
                <Route exac path="/projects" element = { <Projects /> } />
                <Route exac path="/su/projects" element = { <SuProjects /> } />
                <Route exac path="/su/project/:project_id" element = { <SuProject /> } />
                <Route exac path="/su/users" element = { <SuUsers /> } />
                <Route exac path="/su/user/:credential_string" element = { <SuUser /> } />
            </Routes>
        </Router>
    </React.StrictMode>
  );
}

export default App;

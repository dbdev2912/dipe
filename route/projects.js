var express = require('express');
var router = express.Router();

const { mysql } = require('../Connect/conect');

const queryMultipleTime = ( data, queries, index, callback ) => {
    if( index === queries.length ){
        callback( { data } );
    }else{
        const { name, query } = queries[ index ];
        mysql( query, ( result ) => {
            if( result != undefined &&  result.length > 0 ){
                data[name] = result;
            }else{
                data[name] = []
            }
            queryMultipleTime( data, queries, index + 1, callback )
        })
    }
}

const getProjectDetailInfor = ( projects, index, callback ) => {
    if( index === projects.length ){
        callback({ projectDetails: projects })
    }else{
        const project = projects[index];

        const { project_id } = project;

        const queries = [
            {
                name: "partners",
                query: `
                SELECT * FROM ACCOUNT_DETAIL AS AD
                    INNER JOIN PROJECT_PARTNER AS PP ON PP.CREDENTIAL_STRING = AD.CREDENTIAL_STRING
                WHERE PROJECT_ID = ${ project_id };
                `
            },
            {
                name: "recentTask",
                query: `
                SELECT * FROM TASKS AS T INNER JOIN ACCOUNT_DETAIL AS AD
                    ON AD.CREDENTIAL_STRING = T.TASK_OWNER
                WHERE PROJECT_ID = ${ project_id }
                ORDER BY CHANGE_AT DESC;
                `
            },
        ]

        queryMultipleTime( project, queries, 0, ({ data }) => {
            projects[index] = data;
            getProjectDetailInfor( projects, index + 1, callback )
        })
    }
}

router.get('/', (req, res) => {
    const query = `
    SELECT * FROM PROJECTS AS P
        INNER JOIN PROJECT_STATUS AS PS ON PS.STATUS_ID = P.PROJECT_STATUS
            INNER JOIN ACCOUNT_DETAIL AS AD WHERE P.PROJECT_MASTER = AD.CREDENTIAL_STRING
    `;
    mysql(query, (result) => {
        const projects = result;

        getProjectDetailInfor( projects, 0, ({ projectDetails }) => {
            res.status(200).send({ success: true, projectDetails })
        })
    })
})

getMultipleProjectTypeInfo = ( queries, index, data, callback ) => {
    if( index === queries.length ){
        callback({ context: data })
    }else{
        const { query, name } = queries[index];

        mysql( query, (result) => {
            const projects = result;
            getProjectDetailInfor( projects, 0, ({ projectDetails }) => {
                if( projectDetails != undefined && projectDetails.length > 0 ){
                    data[name] = {
                        success: true,
                        projectDetails
                    }
                }else{
                    data[name] = {
                        success: false
                    }
                }

                getMultipleProjectTypeInfo(queries, index + 1, data, callback )
            })
        })
    }
}

router.get('/of/:credential_string', (req, res) => {
    const { credential_string } = req.params;
    const context = { }
    const queries = [
        {
            name: "own",
            query: `
                SELECT * FROM PROJECTS AS P
                    INNER JOIN ACCOUNT_DETAIL AS AD
                        ON AD.CREDENTIAL_STRING = P.PROJECT_MASTER
                            INNER JOIN PROJECT_STATUS AS PS ON P.PROJECT_STATUS = PS.STATUS_ID

                WHERE PROJECT_MASTER = '${credential_string}';
            `
        },
        {
            name: "partner",
            query: `
                SELECT * FROM PROJECTS AS P INNER JOIN PROJECT_PARTNER AS PP
                    ON P.PROJECT_ID = PP.PROJECT_ID
                        INNER JOIN ACCOUNT_DETAIL AS AD ON AD.CREDENTIAL_STRING = P.PROJECT_MASTER
                            INNER JOIN PROJECT_STATUS AS PS ON P.PROJECT_STATUS = PS.STATUS_ID
                WHERE PP.CREDENTIAL_STRING = "${credential_string}";
            `
        },
        {
            name: "use",
            query: `
                SELECT * FROM PROJECTS AS P INNER JOIN PROJECT_USER AS PP
                    ON P.PROJECT_ID = PP.PROJECT_ID
                        INNER JOIN ACCOUNT_DETAIL AS AD ON AD.CREDENTIAL_STRING = P.PROJECT_MASTER
                            INNER JOIN PROJECT_STATUS AS PS ON P.PROJECT_STATUS = PS.STATUS_ID
                WHERE PP.CREDENTIAL_STRING = "${credential_string}";
            `
        },
    ]

    getMultipleProjectTypeInfo( queries, 0, {}, ({ context }) => {
        res.status(200).send({ projects: context })
    })
})

module.exports = router;

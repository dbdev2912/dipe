var express = require('express');
var router = express.Router();

const { mysql } = require('../Connect/conect');
const { id } = require('../module/modulars');

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

const getMultipleProjectTypeInfo = ( queries, index, data, callback ) => {
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

router.get('/project/:project_id', (req, res) => {
    const { project_id } = req.params;

    const query = `
        SELECT *
        FROM PROJECTS AS P
            INNER JOIN PROJECT_STATUS AS PS ON P.PROJECT_STATUS = PS.STATUS_ID
        WHERE PROJECT_ID = ${ project_id }
    `;
    mysql( query, result => {
        if( result != undefined && result.length > 0 ){
            const project = result[0];

            const queries = [
                {
                    name: "owner",
                    query: `
                        SELECT *
                            FROM ACCOUNT_DETAIL
                        WHERE
                            CREDENTIAL_STRING IN (
                                SELECT PROJECT_MASTER
                                FROM PROJECTS
                                WHERE PROJECT_ID = ${ project_id }
                            )
                    `
                },

                {
                    name: "partners",
                    query: `
                        SELECT *
                        FROM ACCOUNT_DETAIL
                        WHERE
                            CREDENTIAL_STRING IN (
                                SELECT CREDENTIAL_STRING
                                FROM PROJECT_PARTNER
                                WHERE PROJECT_ID = ${ project_id }
                            )
                    `
                },

                {
                    name: "users",
                    query: `
                        SELECT *
                        FROM ACCOUNT_DETAIL
                        WHERE
                            CREDENTIAL_STRING IN (
                                SELECT CREDENTIAL_STRING
                                FROM PROJECT_USER
                                WHERE PROJECT_ID = ${ project_id }
                            )
                    `
                },

                {
                    name: "versions",
                    query: `
                        SELECT *
                        FROM VERSIONS AS V
                            INNER JOIN ACCOUNT_DETAIL AS AD ON AD.CREDENTIAL_STRING = V.PUBLISHER
                        WHERE PROJECT_ID = ${ project_id };
                    `
                },
                {
                    name: "tasks",
                    query: `
                        SELECT * FROM TASKS AS T
                            INNER JOIN ACCOUNT_DETAIL AS AD
                                ON T.TASK_OWNER = AD.CREDENTIAL_STRING
                                    INNER JOIN TASK_STATUS AS TS ON TS.STATUS_ID = T.TASK_STATE
                        WHERE PROJECT_ID = ${ project_id };
                    `
                }
            ]

            queryMultipleTime({}, queries, 0, ({ data }) => {
                res.status(200).send({ success: true, data: { ...data, project  } })
            })

        }else{
            res.status(404).send("404 - PAGE NOT FOUND");
        }
    })
});


router.delete(`/project/:project_id/:credential_string`, (req, res) => {
    const { project_id, credential_string } = req.params;
    const query = `
        DELETE FROM PROJECT_PARTNER
        WHERE
            CREDENTIAL_STRING = '${ credential_string }' AND
            PROJECT_ID = ${ project_id }
    `;
    mysql( query, result => {

        const query = `
            DELETE FROM PROJECT_USER
            WHERE
                CREDENTIAL_STRING = '${ credential_string }' AND
                PROJECT_ID = ${ project_id }
        `;
        mysql( query, result => {

            res.status(200).send({ success: true })
        })
    })
})


router.post('/project/:project_id/partners/and/users', (req, res) => {
    const { project_id } = req.params;
    const { partners, users } = req.body;
    const queries = [];
    if( partners != undefined && partners.length > 0 ){
        const partnersCredentialString = partners.map( partner => {
            return `(${ project_id }, '${ partner.credential_string }')`
        });
        const partnerTail = partnersCredentialString.join(", ");
        queries.push(
            {
                name: "partners",
                query: `INSERT INTO PROJECT_PARTNER( PROJECT_ID, CREDENTIAL_STRING) VALUES ${ partnerTail }`
            }
        );
    }

    if( users != undefined && users.length > 0 ){
        const usersCredentialString = users.map( user => {
            return `(${ project_id }, '${ user.credential_string }')`
        });
        const userTail = usersCredentialString.join(", ");
        queries.push(
            {
                name: "partners",
                query: `INSERT INTO PROJECT_USER( PROJECT_ID, CREDENTIAL_STRING) VALUES ${ userTail }`
            }
        );
    }
    queryMultipleTime({}, queries, 0, ({ data }) => {
        res.status(200).send({ success: true })
    })
});

router.post('/', ( req, res ) => {
    const { project } = req.body;
    const{ project_name, project_master, description } = project;
    const query = `CALL CREATE_PROJECT('${ project_name }', 'PJ${ id().toUpperCase() }', '${ project_master.credential_string }', '${ description }')`;
    mysql( query, result => {
        const { success, content, project_id } = result[0][0];
        if( success ){
            const query = `
            SELECT * FROM PROJECTS AS P
                INNER JOIN PROJECT_STATUS AS PS ON PS.STATUS_ID = P.PROJECT_STATUS
                    INNER JOIN ACCOUNT_DETAIL AS AD
                WHERE P.PROJECT_MASTER = AD.CREDENTIAL_STRING
                    AND PROJECT_ID = ${ project_id }
            `;
            mysql(query, (result) => {
                const projects = result;
                getProjectDetailInfor( projects, 0, ({ projectDetails }) => {
                    res.status(200).send({ success: true, project: projectDetails[0] })
                })
            })
        }else{
            res.status(500).send({ success, content });
        }
    })
})

router.post('/project/tasks', (req, res) => {
    const { credential_string, project_id  } = req.body;

    const query = `
        INSERT INTO TASKS( project_id, task_owner, task_state, task_label, task_description )
        VALUES( ${ project_id }, '${ credential_string }', 1, 'Yêu cầu mới', 'Mô tả yêu cầu' );
    `;
    mysql( query, result => {
        const task_id = result.insertId;

        const query = `
            SELECT * FROM TASKS AS T
                INNER JOIN ACCOUNT_DETAIL AS AD
                    ON T.TASK_OWNER = AD.CREDENTIAL_STRING
                        INNER JOIN TASK_STATUS AS TS ON TS.STATUS_ID = T.TASK_STATE
            WHERE PROJECT_ID = ${ project_id } AND TASK_ID = ${ task_id };
        `;

        mysql( query, result => {
            const task = result[0];
            res.send({ success: true, task })
        })
    })
})

router.put('/project/task', (req, res) => {
    const { changes, credential_string, task_id } = req.body;
    console.log({ changes, credential_string, task_id })

    res.status(200).send({ success: true })
})

module.exports = router;

const express = require('express');
const { cookie }  = require('./db/secret');

const { mongo } = require('./db/connector.js');
const cors = require('cors');
const app = express()

const auth = require('./routes/auth');
const partner = require('./routes/partner');
const database = require('./routes/database');
const account = require('./routes/accounts');
const page = require('./routes/page');

/* middlewares */

app.use(require('cookie-parser')(cookie));
app.use(require('express-session')());
app.use( express.static('public') );
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: false,
}));

const { unique_string } = require('./unique_string');

app.use( bodyParser.json({ limit: "50mb" }) );

app.get('/', (req, res) => {
    // res.send({ msg: "Hello World" });

    mongo(( dbo ) => {
        dbo.collection('test').find().toArray((err, result) => {
            if (err) throw err;
            res.send(result);
        })
    })

})

app.get('/api/get/the/god/damn/api/key/with/ridiculous/long/url/string', (req, res) => {
    res.send({ unique_string })
})

/* ROUTING */

app.use(`/api/${ unique_string }/auth`, auth.router);
app.use(`/api/${ unique_string }/partner`, partner.router);
app.use(`/api/${ unique_string }/database`, database.router);
app.use(`/api/${ unique_string }/account`, account.router);
app.use(`/api/${ unique_string }/page`, page.router);

app.use((req, res, next) => {
    res.send(404, { msg: "404 not found" });
})

app.listen(5000, ()=>{
    console.log("Server running on www://ws:5000");
});

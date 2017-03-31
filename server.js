
require('babel-register');
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'PRODUCTION';


var express = require('express'),
    app = express(),
    port = process.env.PORT || 8000,

    bodyParser = require('body-parser');



//add middleware to return better messages or authentication or validations later.

app.use(function(req, res, next) {

    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

    next();

});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/apiRoutes');
routes(app);


app.listen(port);


console.log('RESTful API server started on: ' + port);
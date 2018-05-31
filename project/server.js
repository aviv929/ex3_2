var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var util = require('util')
var cors = require('cors');
app.use(cors());
var DButilsAzure = require('./DButils');
var Users = require('./routs/Users');
var Points = require('./routs/Points');
var jwt = require('jsonwebtoken');

var port = 3000;
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s",host, port);
    });

app.use('/Users',Users);
app.use('/Points',Points);


//this is only an example, handling everything is yours responsibilty !

var express = require('express');//npm install express
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
var DButilsAzure = require('./DButils');
var jwt = require('jsonwebtoken');
var util = require('util')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

var users=require('./routes/api/users');
var data=require('./routes/api/data');
var authdata=require('./routes/api/authdata');


app.use('/users',users);
app.use('/data',data);


var  secret = "teemo";
app.use('/auth', function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, secret, function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                var decoded = jwt.decode(token, {complete: true});
                req.decoded= decoded;
                //console.log(decoded.header);
                //console.log(decoded.payload)
                next();
            }
        });
    }
    else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }

});
app.use('/auth/data', authdata);



var port = 3000;
app.listen(port, function () {
    console.log('App listening on port ' + port);
});
//-------------------------------------------------------------------------------------------------------------------

function creatTables(){
    DButilsAzure.execQuery("CREATE TABLE POI (pID int PRIMARY KEY IDENTITY,name varchar(50) NOT NULL ,catID int NOT NULL ," +
        "info varchar(1000),watched int NOT NULL ,numOfGrades int NOT NULL, sumOfGrades int NOT NULL );")
        .catch(function(err){
            console.log("POI error");
        });
    DButilsAzure.execQuery("CREATE TABLE Category (catID int PRIMARY KEY IDENTITY ,category varchar(50) NOT NULL);")
        .catch(function(err){
            console.log("Category error");
        });
    DButilsAzure.execQuery("CREATE TABLE Pictures (username varchar(50) NOT NULL ,url varchar(255) NOT NULL);")
        .catch(function(err){
            console.log("Pictures error");
        });
    DButilsAzure.execQuery("CREATE TABLE Users (username varchar(50) PRIMARY KEY ,password varchar(50) NOT NULL,"+
    "name varchar(50) NOT NULL,lastname varchar(50) NOT NULL, city varchar(50) NOT NULL,country varchar(50) NOT NULL ,"+
        "question1 varchar(50) NOT NULL,answer1 varchar(50) NOT NULL, question2 varchar(50) NOT NULL,answer2 varchar(50) NOT NULL,favorite varchar(255) );")
        .catch(function(err){
            console.log("Users error");
        });
    DButilsAzure.execQuery("CREATE TABLE UserCategory (username varchar(50) NOT NULL ,catID int NOT NULL,primary key (username, catID));")
        .catch(function(err){
            console.log("UserCategory error");
        });
    DButilsAzure.execQuery("CREATE TABLE Review (username varchar(50) NOT NULL ,pID int NOT NULL ,date date NOT NULL ,text varchar(1000));")
        .catch(function(err){
            console.log("Review error");
        });
    DButilsAzure.execQuery("CREATE TABLE Grade (username varchar(50) NOT NULL ,pID int NOT NULL ,date date NOT NULL ,grade int,primary key (username, pID));")
        .catch(function(err){
            console.log("Grade error");
        });
    DButilsAzure.execQuery("CREATE TABLE Favorite (username varchar(50) NOT NULL primary key ,favorits varchar(MAX) NOT NULL);")
        .catch(function(err){
            console.log("Favorite error");
        });
}
function dropTables(){
    DButilsAzure.execQuery("DROP TABLE POI;")
        .catch(function(err){
            console.log("UserCategory error");
        });
    DButilsAzure.execQuery("DROP TABLE Category;")
        .catch(function(err){
            console.log("Category error");
        });
    DButilsAzure.execQuery("DROP TABLE Pictures;")
        .catch(function(err){
            console.log("Pictures error");
        });
    DButilsAzure.execQuery("DROP TABLE Users ;")
        .catch(function(err){
            console.log("Users error");
        });
    DButilsAzure.execQuery("DROP TABLE UserCategory;")
        .catch(function(err){
            console.log("UserCategory error");
        });
    DButilsAzure.execQuery("DROP TABLE Review;")
        .catch(function(err){
            console.log("Review error");
        });
    DButilsAzure.execQuery("DROP TABLE Grade;")
        .catch(function(err){
            console.log("Grade error");
        });
    DButilsAzure.execQuery("DROP TABLE Favorite;")
        .catch(function(err){
            console.log("Favorite error");
        });
}




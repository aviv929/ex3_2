var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var DButilsAzure = require('../DButils');

//get all categories
router.get('/getCategory',function(req,res) {
    DButilsAzure.execQuery(`select category from Category`)
            .then((response) => {
                res.send(response);
            })
            .catch((err)=>{
                    console.log(err);
                })  
});

//get 2 Last Review 
router.get('/get2LastReview/:pointID',function(req,res) {
    var pointID = req.params.pointID;
    DButilsAzure.execQuery("select TOP 2 * from UsersReviews WHERE pointID = '"+ pointID + "' ORDER BY [datePost] DESC")
            .then(function (result) {
                res.send(result);
            })
           .catch((err)=>{
                    console.log(err);
             })
});


//get poi
router.get('/getPoi/:pointID',function(req,res) {
    var pointID = req.params.pointID;
    DButilsAzure.execQuery("select * from PointsofInterest WHERE pointID ="+ pointID)
            .then((result) => {
                if (result!=undefined)
                {
                    DButilsAzure.execQuery("select pointLink from PointsImages WHERE pointID ="+ pointID)
                        .then((result2) => {
                            result[0].pointPIC = new Array();
                            for (let i=0;i<result2.length;i++)
                            {
                                result[0].pointPIC[i] = result2[i].pointLink;
                            }
                            res.send(result);
                        })
                    .catch((err)=>{
                                console.log(err);
                        })
                }
            })
           .catch((err)=>{
                    console.log(err);
             })
});

//get all poi
router.get('/getAllPoints',function(req,res) {
    DButilsAzure.execQuery(`select PointsOfInterest.pointID, PointsOfInterest.pointName, PointsOfInterest.sumOfGrade, PointsOfInterest.numOfGrade , Category.category from PointsOfInterest
    INNER JOIN Category ON PointsOfInterest.catID = Category.catID`)
            .then(function (result) {
                res.send(result);
            })
           .catch((err)=>{
                    console.log(err);
             })
});

//get poi watcher
router.get('/getWatch/:pointID',function(req,res) {
    var pointID = req.params.pointID;
    DButilsAzure.execQuery("select (numOfWatches) from PointsofInterest WHERE pointID ="+ pointID)
            .then((result) => {
                res.send(result);
            })
           .catch((err)=>{
                    console.log(err);
             })
});

//update watcher
router.put('/updateWatch',function(req,res) {
    var pointID = req.body.pointID;
    DButilsAzure.execQuery("UPDATE PointsofInterest SET numOfWatches = numOfWatches+1 WHERE pointID ="+ pointID)
            .then(function (result) {
                res.send(result);
            })
           .catch((err)=>{
                    console.log(err);
             })
});

// get Summary - picure
router.get('/getSummary',function(req,res){
    DButilsAzure.execQuery("SELECT TOP 5 pointID ,pointName, info FROM PointsofInterest ORDER BY NEWID();")
        .then(function(result){
            var description="";
            for (let i = 0; i < result.length; i++) {
                        description+=result[i].pointName+": "+result[i].info+" \n";
            }
            res.send(description);
        })
        .catch(function(err){
            console.log(err);
        })
        
});

module.exports = router;
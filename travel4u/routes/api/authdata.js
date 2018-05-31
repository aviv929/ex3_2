var express= require('express');
var router = express.Router();

var DButilsAzure = require('../../DButils');
var jwt = require('jsonwebtoken');




router.get('/getUser',function(req,res){
    var token=req.decoded;

    DButilsAzure.execQuery("select name, lastname, city, country,question1,answer1,question2,answer2 from Users where username='"+token.payload.username+"';")
        .then(function(result){
            DButilsAzure.execQuery("select Category.category from UserCategory join Category on UserCategory.catID=Category.catID where username='"+token.payload.username+"';")
                .then(function(result2){
                    if(result!=undefined)
                    {
                        result[0].categories=new Array();
                        for (let i = 0; i < result2.length; i++)
                            result[0].categories[i]=result2[i].category;
                    }
                    res.send(result);
                })
                .catch(function(err){
                    console.log(err);
                })
        })
        .catch(function(err){
            console.log(err);
        })
});

router.get('/getSummary',function(req,res){
    var token=req.decoded;

    DButilsAzure.execQuery("SELECT TOP 5  name, info  FROM POI  ORDER BY NEWID();")
        .then(function(result){
            var tmp="";
            for (let i = 0; i < result.length; i++) {
                tmp+=result[i].name+": "+result[i].info+" \n";
            }
            res.send(tmp);
        })
        .catch(function(err){
            console.log(err);
        })
});

router.put('/saveFavorites',function(req,res){
    var token=req.decoded;

    DButilsAzure.execQuery("UPDATE Users SET favorite='"+req.body.favorite+"' where username='"+token.payload.username+"';")
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
        })

});
router.get('/loadFavorites',function(req,res){
    var token=req.decoded;

    DButilsAzure.execQuery("select favorite from Users where username='"+token.payload.username+"';")
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
        })
});

router.post('/addReview',function(req,res){
    var token=req.decoded;
    var d=new Date();
    var date=d.getDay()+"/"+d.getMonth()+"/"+d.getFullYear();

    DButilsAzure.execQuery("INSERT INTO Review (username, pID, date, text) VALUES ('"+token.payload.username+"', "+req.body.pid+", '"+date+"', '"+req.body.text+"');")
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
        })
});
router.post('/addGrade',function(req,res){
    var token=req.decoded;
    var d=new Date();
    var date=d.getDay()+"/"+d.getMonth()+"/"+d.getFullYear();

    DButilsAzure.execQuery("INSERT INTO Grade (username, pID, date, grade) VALUES ('"+token.payload.username+"', "+req.body.pid+", '"+date+"', "+req.body.grade+");")
        .then(function(result){
            DButilsAzure.execQuery("UPDATE POI SET numOfGrades=numOfGrades+1 , sumOfGrades=sumOfGrades+"+req.body.grade+" where pID="+req.body.pid+";")
                .then(function(result){
                    res.send(result);
                })
                .catch(function(err){
                    console.log(err);
                })
        })
        .catch(function(err){
            console.log(err);
        })
});




module.exports= router;
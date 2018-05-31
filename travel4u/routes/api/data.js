var express= require('express');
var router = express.Router();

var DButilsAzure = require('../../DButils');


//getPassword/:username/:answer
//http://localhost:3000/getPassword/admin/what
router.get('/getCategories',function(req,res){
    DButilsAzure.execQuery("select category from Category;")
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
        })
});
router.get('/getAllHeaderPoints',function(req,res){
    DButilsAzure.execQuery("select pID, name, category, numOfGrades, numOfGrades from POI join Category on Category.catID=POI.catID;")
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
        })
});
router.get('/getPoint/:id',function(req,res){
    DButilsAzure.execQuery("select pID, name, category,info,watched, numOfGrades, numOfGrades from POI join Category on Category.catID=POI.catID where pID="+req.params.id+";")
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
        })
});
router.put('/watchPoint/:id',function(req,res){
    DButilsAzure.execQuery("UPDATE POI SET watched=watched+1 where pID="+req.params.id+";")
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
        })
});
router.get('/getWatched/:id',function(req,res){
    DButilsAzure.execQuery("SELECT watched FROM POI where pID="+req.params.id+";")
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
        })
});
router.get('/getLast2Reviews/:id',function(req,res){
    DButilsAzure.execQuery("select top 2 * from Review where pid="+req.params.id+" order by [date] DESC;")
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
        })
});
router.get('/getCountries',function(req,res){
    var convert = require('xml-js');//npm install xml.js
    var xml = require('fs').readFileSync('countries.xml', 'utf8');
    var result1 = convert.xml2json(xml, {compact: true, spaces: 4});
    var obj = JSON.parse(result1);
    var arr=new Array();
    for (let i = 0; i <obj.Countries.Country.length ; i++)
    {
        arr[i]=obj.Countries.Country[i].Name._text
    }
    res.send(arr);
});

module.exports= router;
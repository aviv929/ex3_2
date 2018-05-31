var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var DButilsAzure = require('../DButils');
var jwt = require('jsonwebtoken');


router.get('/getCountries',function(req,res){
    var convert = require('xml-js');
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

//verify token
router.use('/verify', function (req, res, next){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
        if (token) {
        jwt.verify(token, superSecret, function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                var decoded = jwt.decode(token, {complete: true});
                req.decoded= decoded; // decoded.payload , decoded.header
                next();
            }
        });
        } else
        {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
        }
    });

//register
router.post('/register',function(req,res) {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var city = req.body.city;
    var country = req.body.country;
    var email = req.body.email;
    var q1 = req.body.q1;
    var q2 = req.body.q2;
    var a1 = req.body.a1;
    var a2 = req.body.a2;
    var catList = req.body.catList;

    if (catList.length<2)
    {
        res.send("You have to choose at least 2 categories");
    }
    else {
    DButilsAzure.execQuery("select userName from Users")
            .then(function(result){
                var token  = makeToken(result);
                var userName = token[0];
                var password = token[1];
        
                var i = 0;
                             
                while (i < catList.length) {
                DButilsAzure.execQuery("INSERT INTO UsersCategories ([userName] , [catID]) VALUES ('"+userName+"','"+ catList[i]+"')")
                        .then(function(result){
                          //  res.send(result);
                    })
                        .catch((err)=>{
                                console.log(err);
                    })
                    i++;
                 }

                DButilsAzure.execQuery("INSERT INTO Users ([userName] , [firstName] ,  [lastName] , [password] , [city] , [country] , [email] , [q1] , [q2] , [a1] , [a2]) VALUES ('"
                +userName+"','"+ firstName+"','"+ lastName+"','"+ password+"','"+ city+"','"+ country+"','"+ email+"','"+ q1+"','"+ q2+"','"+ a1+"','"+ a2+"')")
                        .then(function(result){
                        res.send(token);
                })
                .catch((err)=>{
                    console.log(err);
                })
  
            })
        .catch((err)=>{
            console.log(err);
         })
    }
});

//login
router.post('/login',function(req,res) {
    var userName = req.body.userName;
    var password = req.body.password;

    if (!userName || !password)
    {
        res.send({message:"Missing Something.."})
    }
    else {
    DButilsAzure.execQuery("select * from Users WHERE userName ='"+ userName + "' AND password='" + password+"'")
            .then(function (result) {
                if (result.length > 0)
                {sendToken(userName, res)}
                else
                {res.send("Invalid Parameters");}
            })
           .catch((err)=>{
                    console.log(err);
             })
            }
});

//get password
router.post('/getPassword',function(req,res) {
    var userName = req.body.userName;
    var a1 = req.body.a1;
    var a2 = req.body.a2;
    DButilsAzure.execQuery("select password from Users WHERE userName ='"+ userName +"' AND a1='" +a1+ "' AND a2='" +a2+"'")
            .then(function (result){
            if (result.length>0) {
                res.send(result);
            }
            else {
                res.send("Wrong parameters");
            }
        })
           .catch((err)=>{
                    console.log(err);
             })
});

//get question
router.post('/getQuestion',function(req,res) {
    var userName = req.body.userName;
    DButilsAzure.execQuery("select q1, q2 from Users WHERE userName ='"+ userName+"'")
            .then((result) => {
                res.send(result);
            })
           .catch((err)=>{
                    console.log(err);
            })
});

//get favoriets
router.get('/verify/getFavorite',function(req,res) {
    var token = req.decoded;
    var userName = token.payload.userName;
    DButilsAzure.execQuery("select pointID from UserFavorite WHERE userName ='"+ userName+"';")
            .then((response) => {
                res.send(response);
            })
           .catch((err)=>{
            console.log(err);
            })
});

//add grade
router.put('/verify/addGrade',function(req,res) {
    var pointID = req.body.pointID;
    var grade = req.body.grade;
    DButilsAzure.execQuery("UPDATE PointsofInterest SET numOfGrade = numOfGrade+1 , sumOfGrade = '"+grade+ "' WHERE pointID ='"+ pointID+"'")
    .then(function (result) {
                res.send(result)})
           .catch((err)=>{
                    console.log(err);
             })
});

//add fav
router.post('/verify/addFavorite',function(req,res) {
    var token = req.decoded;
    var userName = token.payload.userName;
    var pointID = req.body.pointID;
    DButilsAzure.execQuery("select * from UserFavorite where userName='"+userName+"' AND pointID='" +pointID+"'")
        .then(function (result) {
            if (result.length<1)
            {
                DButilsAzure.execQuery("INSERT INTO UserFavorite ([userName] ,[pointID]) VALUES ('"+userName+"','"+pointID+"')") 
                .then(function (result) {
                    res.send(result);
                })
                .catch((err)=>{
                         console.log(err);
                  }) 
            }
            else{
                res.send("You have this point already")
            }
        })
   .catch((err)=>{
            console.log(err);
     })  

});

//delete fav
router.put('/verify/delFavorite',function(req,res) {
    var token = req.decoded;
    var userName = token.payload.userName;
    var pointID = req.body.pointID;

    DButilsAzure.execQuery("DELETE from UserFavorite where userName ='"+userName+"' AND pointID='"+pointID+"'")
        .then(function (result) {
            res.send(result);
        })
   .catch((err)=>{
            console.log(err);
     })  

});

//add Review
router.post('/verify/addReview',function(req,res) {
    var token = req.decoded;
    var userName = token.payload.userName;
    var pointID = req.body.pointID;
    var d = new Date();
    var date=d.getDay()+"/"+d.getMonth()+"/"+d.getFullYear()+"-"+d.getHours()+":"+d.getMinutes();
    var review = req.body.review;
    DButilsAzure.execQuery("INSERT INTO UsersReviews ( [userName] , [pointID] , [datePost] , [review]) VALUES ('"+userName+"','"+ pointID +"','"+date +"','"+ review+"')")
            .then(function (result) {
                res.send(result)})
           .catch((err)=>{
                    console.log(err);
             })
});

//get user
router.get('/verify/getUser',function(req,res) {
    var token = req.decoded;
    var userName = token.payload.userName;
    DButilsAzure.execQuery("select * from Users WHERE userName ='"+ userName+"'")
            .then((response) => {
                if (response!=undefined){
                DButilsAzure.execQuery("select Category.category from UsersCategories INNER JOIN Category ON UsersCategories.catID=Category.catID WHERE userName ='"+ userName+"'")
                .then((response2) => {
                    response[0].catList = new Array();
                    for (let i=0;i<response2.length;i++)
                    {
                        response[0].catList[i] = response2[i].category;
                    }
                    res.send(response);
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

const superSecret = "shanshan";
//send token
function sendToken(userName , res) {
    var payload = {
        userName: userName,
        }
        var token = jwt.sign(payload, superSecret, {
        expiresIn: "1d" // expires in 24 hours
        });
        // return the information including token as
        res.json({
        success: true,
        message: 'Enjoy your token!',
        token: token
        });             
} 

//makeToken
function makeToken(usernames){
var c1="abcdefghijklmnopqrstuvwxyz";
var c2="0123456789";
var c3="";
for (let i = 0; i < usernames.length; i++) {
    c3+=usernames[i]+" ";
}

var u="";
for (let i = 0; i < 8; i++)
    u+=c1.charAt(Math.random()*c1.length);


while(c3.includes(u))
{
    u="";
    for (let i = 0; i < 8; i++)
        u+=c1.charAt(Math.random()*c1.length);
}

var p="";
for (let i = 0; i < 6; i++){
    if (i%2==0) {
    p+=c2.charAt(Math.random()*c2.length);
    }
    else{
    p+=c1.charAt(Math.random()*c1.length);
    }
}

return [u,p];
}

module.exports = router;
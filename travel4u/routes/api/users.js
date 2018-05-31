var express= require('express');
var router = express.Router();

var DButilsAzure = require('../../DButils');
var jwt = require('jsonwebtoken');



const secret = "teemo"; // secret variable
router.post('/login', function (req, res) {
    if (!req.body.username || !req.body.password)
        res.send({ message: "bad values" });
    else {
        DButilsAzure.execQuery("select username, password from Users where username='"+req.body.username+"' AND password='"+req.body.password+"';")
            .then(function(result){
                if (result.length>0)
                    sendToken(req.body.username, res);
                else
                    console.log(err);
            })
            .catch(function(err){
                console.log(err);
            })

    }

})
function sendToken(username, res) {
    var payload = {
        username: username,
    }

    var token = jwt.sign(payload, secret, {
        expiresIn: "1d" // expires in 24 hours
    });

    res.json({
        success: true,
        message: 'Enjoy your token!',
        token: token
    });
}


router.post('/register',function(req,res){
    DButilsAzure.execQuery("select username from Users;")
        .then(function(result){
            var tmp=generate(result);

            DButilsAzure.execQuery("insert into Users (username, password, name, lastname,city,country,question1,answer1,question2,answer2,favorite) VALUES ('"+tmp[0]+"', '"+tmp[1]+"', '"+req.body.name+"', '"+req.body.lastname+"','"+req.body.city+"','"+req.body.country+"','"+req.body.question1+"','"+req.body.answer1+"','"+req.body.question2+"','"+req.body.answer2+"','');")
                .then(function(result){
                    console.log(tmp);
                    res.send(tmp);
                })
                .catch(function(err){
                    console.log(err);
                })
            for (let i = 0; i <req.body.categories.length ; i++)
            {
                DButilsAzure.execQuery("insert into UserCategory (username, catID) VALUES ('"+tmp[0]+"',"+req.body.categories[i]+");")
                    .then(function(result){
                        //console.log(tmp);
                        //res.send(tmp);
                    })
                    .catch(function(err){
                        //console.log(err);
                    })
            }
        })
        .catch(function(err){
            console.log(err);
        })
});
function generate(usernames){
    var c1="abcdefghijklmnopqrstuvwxyz";
    var c2="0123456789abcdefghijklmnopqrstuvwxyz";
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
    for (let i = 0; i < 6; i++)
        p+=c2.charAt(Math.random()*c2.length);
    p+="1";

    return [u,p];
}



router.post('/getQuestion',function(req,res){
    DButilsAzure.execQuery("select question1,question2 from Users where username='"+req.body.username+"';")
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
        })
});
router.post('/getPassword',function(req,res){
    DButilsAzure.execQuery("select password from Users where username='"+req.body.username+"' AND answer1='"+req.body.answer1+"' AND answer2='"+req.body.answer2+"';")
        .then(function(result){
            res.send(result);
        })
        .catch(function(err){
            console.log(err);
        })
});




module.exports= router;
//jshint esversion:6
//////////// importing stuff //////////////////////
require('dotenv').config(); //for environment variables
//--------------------------to store our secret
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption"); changed to hashing (md5)
//const md5 = require('md5'); changed to bcrypt
const bcrypt = require('bcrypt');
// initializing express & using ejs 

const app = express();
app.set('view engine', 'ejs');

/////////////// DB stuff //////////////////////
mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});
//mongoose-encryption
//const secret = "wachal3awdbikhir"; //  CHECK .ENV FILE
//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] }); //add encryption to passwd

//this is salting rounds for bcrypt hash
const saltRounds = 10;

const User = new mongoose.model('User', userSchema);

///////////////// express stuff ///////////////
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

//get requests 

app.get("/", function(req, res) {
    res.render('home');
});
app.get("/login", function(req, res) {
    res.render('login');
});
app.get("/register", function(req, res) {
    res.render('register');
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});

//post requests
app.post("/register", function(req, res) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const user = new User({
            email: req.body.username,
            password: hash
        });
        user.save(function(err) {
            if (err)
                console.log(err);
            else res.render('secrets');
        })
    });

});
app.post("/login", function(req, res) {
    User.findOne({
            email: req.body.username
        },
        function(err, data) {
            if (err)
                console.log(err);
            else {
                bcrypt.compare(req.body.password, data.password, function(err, rst) {
                    if (rst)
                        res.render('secrets');
                    else {
                        res.render('login');
                        console.log("mal9it walu ?!");
                    }
                })

            }
        }
    );
});
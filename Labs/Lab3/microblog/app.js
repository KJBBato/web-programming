/*jshint esversion: 6 */
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var Datastore = require('nedb');
var messages = new Datastore({ filename: 'db/messages.db', autoload: true, timestampData: true});
var users = new Datastore({ filename: 'db/users.db', autoload: true });

app.use(express.static('static'));

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

var Message = (function(){
    var id = 0;
    return function item(message){
        this._id = id++;
        this.content = message.content;
        this.username = message.username;
        this.upvote = 0;
        this.downvote = 0;
    };
}());

// Create
app.post('/api/users/', upload.single('picture'), function (req, res, next) {
    if (req.body.username in users) return res.status(409).end("Username:" + req.body.username + " already exists");
    req.body.content = req.file;
    users.insert(req.body, function(err, user){
        if (err) return res.status(500).end(err);
        return res.redirect('/');
    });
});

app.post('/api/messages/', function (req, res, next) {
    var message = new Message(req.body);
    messages.insert(message, function(err, message){
        if (err) return res.status(500).end(err);
        return res.json(message);
    });
});

// Read
app.get('/api/messages/', function (req, res, next) {
    messages.find({}).sort({createdAt:-1}).limit(5).exec(function(err, message){
        if (err) return res.status(500).end(err);
        return res.json(message);
    });
});

app.get('/api/users/', function (req, res, next) {
    users.find({}).exec(function(err, user){
        if (err) return res.status(500).end(err);
        return res.json(user);
    });
});

// Update
app.patch('/api/messages/:id/', function (req, res, next) {
    var index = messages.findIndex(function(message){
        return message._id == req.params.id;
    });
    if (index === -1) return res.status(404).end("Message id:" + req.params.id + " does not exists");
    var message = messages[index];
    switch (req.body.action){
        case ("upvote"):
            message.upvote+=1;
            break;
        case ("downvote"):
            message.downvote+=1;
            break;
    }
    return res.json(message);
});

// Upload
app.get('/api/users/:username/profile/picture/', function (req, res, next) {
    users.findOne({ username: req.params.username }, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user) return res.status(404).end(" username " + req.params.username + " does not exists");
        res.setHeader('Content-Type', user.content.mimetype);
        res.sendFile(__dirname + '\\' +  user.content.path);
    });
});

// Delete
app.delete('/api/messages/:id/', function (req, res, next) {
    var index = messages.findIndex(function(message){
        return message._id == req.params.id;
    });
    if (index === -1) return res.status(404).end("Message id:" + req.params.id + " does not exists");
    var message = messages[index];
    messages.splice(index, 1);
    return res.json(message);
});

const http = require('http');
const PORT = 3000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});
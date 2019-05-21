/*jshint esversion: 6 */
const path = require('path');
const express = require('express');
const crypto = require('crypto');
const cookie = require('cookie');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('frontend'));

/* Database */
let Datastore = require('nedb');
let multer = require('multer');
let users = new Datastore({ filename: 'db/users.db', autoload: true, timestampData: true });
let gallery = new Datastore({ filename: 'db/gallery.db', autoload: true, timestampData: true});
let comments = new Datastore({ filename: 'db/comments.db', autoload: true, timestampData: true });
let upload = multer({ dest: path.join( __dirname, 'uploads' )});

/* Session */
app.use(session({
    secret: 'i have changed the secret',
    resave: false,
    saveUninitialized: true,
}));

app.use(function (req, res, next){
	req.username = req.session.username;
    console.log("HTTP request", req.username, req.method, req.url, req.body);
    next();
});

/* Authentication */
let isAuthenticated = function(req, res, next) {
    if (!req.username) return res.status(401).end("access denied");
    next();
};

/* Generating Hash */
function generateSalt (){
    return crypto.randomBytes(16).toString('base64');
}

function generateHash (password, salt){
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('base64');
}

/* Requests */
app.post('/signup/', function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    users.findOne({_id: username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (user) return res.status(409).end("username already exists");
        let salt = generateSalt();
        let hash = generateHash(password, salt);
        users.update({_id: username},{_id: username, hash: hash, salt: salt}, {upsert: true}, function(err){
            if (err) return res.status(500).end(err);
            res.setHeader('Set-Cookie', cookie.serialize('username', username, {
                  path : '/', 
                  maxAge: 60 * 60 * 24 * 7
            }));
            req.session.username = username;
            return res.json("user " + username + " signed up");
        });
    });
});

app.post('/signin/', function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    users.findOne({_id: username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user) return res.status(401).end("access denied");
        if (user.hash !== generateHash(password, user.salt)) return res.status(401).end("access denied"); 
        res.setHeader('Set-Cookie', cookie.serialize('username', username, {
              path : '/', 
              maxAge: 60 * 60 * 24 * 7
        }));
        req.session.username = username;
        return res.json("user " + username + " signed in");
    });
});


app.post('/signout/', function(req, res, next) {
    let user = req.session.username;
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.clearCookie('username');
    return res.json("user " + user + " signed out");
});

app.post('/gallery/', isAuthenticated, upload.single('file'), function(req, res, next){
    let title = req.body.title;
    let author = req.session.username;
    req.body.content = req.file;
    req.body.title = title;
    req.body.author = author;
    gallery.insert(req.body, function(err, img){
        if (err) return res.status(500).end(err);
        return res.json(img);
    });
});

app.post('/gallery/comment/:id/', isAuthenticated, function(req, res, next){
    gallery.findOne({ _id: req.params.id }, function(err, img){
        if (err) return res.status(500).end(err);
        if (!img) return res.status(404).end('Image does not exist');
        req.body.imageId = req.params.id;
        req.body.author = req.username;
        comments.insert(req.body, function (err, cmt){
            if (err) return res.status(500).end(err);
            return res.json(cmt);
        });
    });
});

app.get('/gallery/', isAuthenticated, function(req, res, next){
    users.find({}).sort({createdAt:-1}).exec(function (err, user){
        return res.json(user);
    });
});

app.get('/gallery/author/:id/', isAuthenticated, function(req, res, next){
    gallery.find({ author: req.params.id }).sort({createdAt:-1}).limit(1).exec(function (err, img){
        return res.json(img);
    });
});

app.get('/gallery/:id/', isAuthenticated, function (req, res, next) {
    gallery.findOne({ _id: req.params.id }, function(err, img){
        if (err) return res.status(500).end(err);
        if (!img) return res.status(404).end("Gallery does not exist or empty");
            res.setHeader('Content-Type', img.content.mimetype);
            res.sendFile(img.content.path);
        return res.json(img); 
    });
});

app.get('/gallery/prev/:user/:id/', isAuthenticated, function(req, res, next) {
    gallery.findOne({ _id: req.params.id }, function(err, img){
        if (err) return res.status(500).end(err);
        if (!img) return res.status(404).end("ID does not exists");
        gallery.find({ author: req.params.user, createdAt:{ $lt: img.createdAt }}).sort({createdAt:-1}).limit(1).exec(function(err, prevImg){
            if (err) return res.json(img);
            return res.json(prevImg);   
        });
    });
});

app.get('/gallery/next/:user/:id/', isAuthenticated, function(req, res, next) {
    gallery.findOne({ _id: req.params.id }, function(err, img){
        if (err) return res.status(500).end(err);
        if (!img) return res.status(404).end("ID does not exists");
        gallery.find({ author: req.params.user, createdAt:{ $gt: img.createdAt }}).sort({createdAt:1}).limit(1).exec(function(err, nextImg){
            if (err) return res.json(img);
            return res.json(nextImg);   
        });
    });
});

app.get('/gallery/comment/:id', isAuthenticated, function(req, res, next){
    comments.find({ imageId: req.params.id }).sort({ createdAt: -1 }).exec(function(err, cmts){
        if (err) return res.status(500).end(err);
        if (!cmts) return res.status(404).end('Comment does not exist');
        return res.json(cmts);
    });
});


app.delete('/gallery/image/:id', isAuthenticated, function(req, res, next){
    gallery.findOne({ _id: req.params.id }, function(err, img){
        if (err) return res.status(500).end(err);
        if (!img) return res.status(404).end("Image Id does not exist");
        if (img.author !== req.session.username) return res.status(403).end("forbidden: delete image");
        gallery.remove({ _id: req.params.id }, {multi: false}, function(err, other){
            res.json(img);
        });
    });
});

app.delete('/gallery/comment/:id', isAuthenticated, function(req, res, next){
    comments.findOne({ _id: req.params.id }, function(err, cmt){
        if (err) return res.status(500).end(err);
        if (!cmt) return res.status(404).end("Comment Id does not exist");
        gallery.findOne({ _id: cmt.imageId }, function(errr, img){
            if (err) return res.status(500).end(err);
            if (!img) return res.status(404).end("Image Id does not exist");
            if (img.author === req.session.username) {
                comments.remove({ _id: req.params.id }, {multi: false}, function (errrr, cmt_auth){
                    res.json(cmt);
                }); 
            } else if (cmt.author !== req.session.username)  { 
                return res.status(403).end("forbidden: delete comment");
            } else {
                comments.remove({ _id: req.params.id }, {multi: false}, function (errrrr, cmt_auth2){
                    res.json(cmt);
                });
            }
        });
    });
});

/* Local Host */
const http = require('http');
const PORT = 3000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});

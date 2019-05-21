/*jshint esversion: 6 */

const path = require('path');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(express.static('static'));

/* Database */
let Datastore = require('nedb');
let images = new Datastore({ filename: 'db/images.db', autoload: true, timestampData: true });
let comments = new Datastore({ filename: 'db/comments.db', autoload: true, timestampData: true });

let multer = require('multer');
let upload = multer({ dest: path.join( __dirname, 'uploads' )});

/* Requests */

/* POST Requests */
app.post('/api/images/', upload.single('file'), function(req, res, next){
	req.body.content = req.file;
	images.insert(req.body, function(err, img){
		if (err) return res.status(500).end(err);
		return res.json(img);
	});
});

app.post('/api/comments/:id/', function(req, res, next){
	req.body.imageId = req.params.id;
	comments.insert(req.body, function(err, cmt){
		if (err) return res.status(500).end(err);
		return res.json(cmt);
	});
});


/* GET Requests */
app.get('/api/comments/:id/', function(req, res, next){
	comments.find({ imageId: req.params.id }).sort({createdAt:-1}).skip(5*req.body.page).limit(5).exec(function(err, cmt){
        if (err) return res.status(500).end(err);
        return res.json(cmt);
    });
});

app.get('/api/images/:id/', function (req, res, next) {
    images.findOne({ _id: req.params.id }, function(err, img){
        if (err) return res.status(500).end(err);
        if (!img) return res.status(404).end("ID does not exists");
        res.setHeader('Content-Type', img.content.mimetype);
        res.sendFile(img.content.path);
    	return res.json(img); 
    });
});

app.get('/api/images/:id/prev/', function(req, res, next) {
	images.findOne({ _id: req.params.id }, function(err, img){
		if (err) return res.status(500).end(err);
		if (!img) return res.status(404).end("ID does not exists");
		images.find({createdAt:{ $lt: img.createdAt }}).sort({createdAt:-1}).limit(1).exec(function(err, prevImg){
			if (err) return res.json(img);
			return res.json(prevImg);
		});
	});
});

app.get('/api/images/:id/next/', function(req, res, next) {
	images.findOne({ _id: req.params.id }, function(err, img){
		if (err) return res.status(500).end(err);
		if (!img) return res.status(404).end("ID does not exists");
		images.find({createdAt:{ $gt: img.createdAt }}).sort({createdAt:1}).limit(1).exec(function(err, nextImg){
			if (err) return res.json(img);
			return res.json(nextImg);
		});
	});
});

/* DELETE Requests */
app.delete('/api/images/:id/', function (req, res, next){
	images.findOne({ _id: req.params.id }, function(err, img){
		if (err) return res.status(500).end(err);
		if (!img) return res.status(404).end('Image ID does not exist');
		images.remove({ _id: img._id }, {multi: false}, function(err, num){
			return res.json(img);
		});
	});
});

app.delete('/api/comments/:id/', function (req, res, next){
	comments.findOne({ _id: req.params.id }, function(err, cmt){
		if (err) return res.status(500).end(err);
		if (!cmt) return res.status(404).end('Comment ID does not exist');
		comments.remove({ _id: cmt._id }, {multi: false}, function(err, num){
			return res.json(cmt);
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
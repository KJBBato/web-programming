/*jshint esversion: 6 */
const express = require('express');
const app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(express.static('static'));

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

app.post('/', function (req, res, next) {
    res.json(req.body);
    next();
});

app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
    next();
});

let database = [];
let _id = 0;

let Message = function(author, content){
    this._id = _id++;
    this.author = author;
    this.content = content;
    this.upvote = 0;
    this.downvote = 0;
};

/* Create */
app.post('/api/messages/', function (req, res, next){
	let container = req.body;
	let message = new Message(container.author, container.content);
	database.unshift(message);
	res.json(message);
	next();
});

/* Get Messages */
app.get('/api/messages/', function (req, res, next){
	let resList = database.slice(0, 5); 
	res.json(resList.reverse());
	next();
});

app.get('/api/messages/:id', function (req, res, next){
	let idx = database.findIndex(function(e){
		return (e._id === parseInt(req.params.id));
	});
	if (idx === -1) {
		res.status(404).end('message id does not exists');
	} else {
		let message = database[idx];
		res.json(message);
	}
	next();
});

/* Delete Messages */
app.delete('/api/messages/:id', function (req, res, next){
	let idx = database.findIndex(function(e){
		return (e._id === parseInt(req.params.id));
	});
	if (idx === -1) {
		res.status(404).end('message :id does not exists');
	} else {
		let message = database[idx];
		database.splice(idx, 1);
		res.json(message);
	}
	next();
});

/* Upvote/Downvote */
app.patch('/api/messages/:id', function (req, res, next){
	let vote = req.body;
	let idx = database.findIndex(function(e){
		return (e._id === parseInt(req.params.id));
	});
	if (idx === -1) {
		res.status(404).end('message :id does not exists');
	}	
	if (vote.action === 'upvote') {
		let message = database[idx];
		message.upvote+=1;
		res.json(message);
	} else if (vote.action === 'downvote'){
		let message = database[idx];
		message.downvote+=1;
		res.json(message);
	} else {
		res.status(204).end('invalid argument');
	}
	next();
});

const http = require('http');
const PORT = 3000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});
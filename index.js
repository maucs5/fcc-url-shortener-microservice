var express = require('express');
var app = express();

var MongoClient = require('mongodb').MongoClient;
var db;
var collection;

var valid_url = require('valid-url').is_web_uri;

var mongo_url = process.env.MONGODB_URL || 'mongodb://localhost:27017/url';
var port = process.env.PORT || 8000;

var counter = 103;

var db_setup = function(database) {
    // set database variable, reset the db, add default data
    db = database;
    collection = db.collection('url');

    collection.remove({});

    collection.insert([
	{original_url: 'https://www.google.com', short_url: 100},
	{original_url: 'https://www.yahoo.com', short_url: 101},
	{original_url: 'https://www.reddit.com', short_url: 102}
    ]);

    collection.find({}).each((err, data) => {
	console.log(data);
    });
};

app.get('/', (req, res) => {
    var text = 'Try this';
    res.send(text)
});

app.get('/new/*', (req, res) => {
    var url = req.originalUrl.slice(5);
    console.log(url);
    if (valid_url(url)) {
	// add to database here
	collection.insert({original_url: url, short_url: counter})
	res.send({
	    original_url: url,
	    short_url: req.headers.host + '/' + counter
	});
	counter++;
    } else
	res.send({error: "Wrong url format, make sure you have a valid protocol and real site."});
});

app.get('/:id', (req, res) => {
    collection.findOne({short_url: +req.params.id}, (err, data) => {
	if (data === null) res.send({error: "This url is not on the database."});
	else res.redirect(data.original_url);
    });
});

MongoClient.connect(mongo_url, (err, database) => {
    if (err) return console.log(err);
    db_setup(database);
    app.listen(port);
});

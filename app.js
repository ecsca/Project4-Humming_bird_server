
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongo = require('mongodb');
var mysql = require('mysql');

//var terminal = require('child_process').exec('python getData.py');
//var terminal = require('child_process').exec('python getData.py');
console.log("terminal started");


var db_config = {
    host: 'us-cdbr-east-06.cleardb.net',
    user: 'b02535f8bb3e27',
    port: 3306,
    password: 'f00599ce453aa27',
    database: 'heroku_4225976e02f5a12'
};

var connection = mysql.createConnection(db_config);

function handleDisconnect() {
    connection = mysql.createConnection(db_config); // Recreate the connection, since
    // the old one cannot be reused.

    connection.connect(function (err) {              // The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function (err) {
        //console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();

var MongoClient = require('mongodb').MongoClient
, format = require('util').format;



var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


app.post('/join', function (req, res) {
    var user = [req.body.useremail, req.body.password];
    console.log('useremail');
    console.log(req.body.useremail);
    console.log('password');
    console.log(req.body.password);
    console.log('user');
    console.log(user);
    console.log('end');
    var query = connection.query('INSERT INTO users SET useremail = ?, password = ?', user, function (err, result) {
        console.log(query);
        if (err) {
            console.error(err);
            res.send(200, 'fail to join');
        }
        else {
            res.send(200, 'success');
        }
    });
});
app.post('/login', function (req, res) {
    var user = {
        'useremail': req.body.useremail,
        'password': req.body.password
    };
    var query = connection.query("select * from users where useremail = '"+useremail+"'", user, function (err, result) {
        if (err) {
            console.error(err);
            throw err;
        }
        console.log(result);
        res.send(200, 'success');
    });
});

app.get('/users', function (req, res) {
    var query = connection.query('select * from users', function (err, rows) {
        console.log(rows);
        res.json(rows);
    });
    console.log(query);
});

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/get',function(req, res){
    MongoClient.connect('mongodb://argon:qmfflwkem@ds027479.mongolab.com:27479/heroku_app27734772', function(err, db){
        db.collection('testArticle', function(err, collection){
            collection.find().toArray(function(err, items){
                res.send(items);
            });
        });
        });
});
app.get('/addId/:id/:key', function(req, res){
    var key = req.params.key;
    var id = req.params.id;
    var oldid=""
    MongoClient.connect('mongodb://argon:qmfflwkem@ds027479.mongolab.com:27479/heroku_app27734772', function(err, db){
        db.collection('testArticle', function(err, collection){
            collection.findOne({"Keyword": key}, function(err, doc){
                if(doc){
                    console.log(oldid);
                    oldid = doc.Users;
                    console.log('got old id');
                    console.log(doc.Users);
                    console.log(oldid);
                }
                else
            {
                console.log('no data');
            }
            if(oldid)
            {
                if(oldid.indexOf(id) == -1){
                    collection.update({"Keyword": key}, {'$set' : {"Users": oldid+id+","}},{upsert:true, safe:false}, function(err, result){
                        if(err){
                            console.log("Error");
                            res.send("Error");
                        }
                        else{
                            console.log("done");
                            res.send("done");
                        }
                    });
                }
                else{
                    console.log("already exist");
                    res.send("already exist");
                }
            }
            else
            {
                collection.update({"Keyword": key}, {'$set' : {"Users": id+","}},{upsert:true, safe:false}, function(err, result){
                    if(err){
                        console.log("Error");
                        res.send("Error");
                    }
                    else{
                        console.log("done");
                        res.send("done");
                    }
                });
            }
            });
        });
});
});

app.get('/deleteId/:id/:key', function(req, res){
    var key = req.params.key;
    var id = req.params.id;
    var oldid=""
    MongoClient.connect('mongodb://argon:qmfflwkem@ds027479.mongolab.com:27479/heroku_app27734772', function(err, db){
        db.collection('testArticle', function(err, collection){
            collection.findOne({"Keyword": key}, function(err, doc){
                if(doc){
                    oldid = doc.Users;
                }
                else
            {
                console.log('no data');
            }
            if(oldid)
            {
                if(oldid.indexOf(id) > -1){
                    var newid = oldid.replace(id+",", "");
                    console.log(newid);
                    collection.update({"Keyword": key}, {'$set' : {"Users": newid}},{upsert:true, safe:false}, function(err, result){
                        if(err){
                            console.log("Error");
                            res.send("Error");
                        }
                        else{
                            console.log("done");
                            res.send("done");
                        }
                    });
                }
                else{
                    res.send("no id");
                }
            }
            else
            {
                res.send("No data");
            }
            });
        });
});
});

app.get('/getArticle/:key', function (req, res) {
    var key = req.params.key;
    var id = req.params.id;
    var oldid = ""
    MongoClient.connect('mongodb://argon:qmfflwkem@ds027479.mongolab.com:27479/heroku_app27734772', function (err, db) {
        db.collection('testArticle', function (err, collection) {
            collection.findOne({ "Keyword": key }, function (err, doc) {
                if (doc) {
                    res.send(doc.Articles);
                }
                else {
                    console.log('no data');
                    res.send("no data");
                }
            });
        });
    });
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

var path = require('path');

var express = require('express');
var app = require('express')(),
    bodyParser = require('body-parser'),
    routes = require('./routes');
var port = process.env.PORT || 3009;

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, 'public_html')));


app.get('/api/SnapshotServers', routes.SnapshotServers);
app.get('/api/Server/:server/Pools', routes.serverPools);
app.get('/api/Server/:server/:pool/Filesystems', routes.serverPoolFilesystems);
app.get('/api/Server/:server/:fs/FilesystemInfo/:fields', routes.serverFilesystemInfo);



app.get('/', function(req, res) {
    res.end('hi');
});
app.listen(port, function() {
    console.log("Express server listening on port " + port);
});

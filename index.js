//curl -X GET "http://localhost:3009/api/multifetch?localFs=/api/Server/cetus/tank_9894340/FilesystemSnapshots/latest,ts&remoteFs=/api/Server/beo/tank_Snapshots_cetus_tank_9894340/FilesystemSnapshots/latest,ts"
var path = require('path'),
multifetch = require('multifetch'),

    cors = require('cors');

var express = require('express');
var app = require('express')(),
    bodyParser = require('body-parser'),
    routes = require('./routes');
var port = process.env.PORT || 3009;

app.use(bodyParser.json());
app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, 'public_html')));

app.get('/api/multifetch', multifetch({ headers: false }));
app.get('/api/Servers', routes.ListServers);
app.get('/api/BackupServers', routes.BackupServers);
app.get('/api/SnapshotServers', routes.SnapshotServers);
app.get('/api/Server/:server/Sar/:params?', routes.serverSarReport);
app.get('/api/Server/:server/Pools', routes.serverPools);
app.get('/api/Server/:server/:pool/Filesystems', routes.serverPoolFilesystems);
app.get('/api/Server/:server/:pool/VMFilesystems', routes.serverPoolVMFilesystems);
app.get('/api/Server/:server/:fs/FilesystemInfo/:fields', routes.serverFilesystemInfo);
app.get('/api/Server/:server/:fs/FilesystemSnapshots/:filter?', routes.serverFilesystemSnapshots);
app.get('/api/Server/:server/:pool/SnapshotServers', routes.serverPoolSnapshotServers);



app.get('/', function(req, res) {
    res.end('hi');
});
app.listen(port, function() {
    console.log("Express server listening on port " + port);
});

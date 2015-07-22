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


app.get('/api/servers', routes.servers.findAll);

app.listen(port, function() {
    console.log("Express server listening on port " + port);
});

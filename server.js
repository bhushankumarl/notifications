var express = require('express');
var bodyParser = require('body-parser');

var conf = require('./config');
var trelloSvc = require('./trello-service');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/trello/webhook', function (req, res) {
    console.log("GET", req.body);
    res.send('Webhook page here');
});

app.post('/trello/webhook', function (req, res) {
    console.log("/trello/webhook POST", req.body);
    console.log("/trello/webhook POST-------------------------------------");
    trelloSvc.processChange(req.body);
    res.send('Ok');
});

app.get('/', function (req, res) {
    trelloSvc.getBoards(function (err, result) {
        if (err) {
            res.send(err);
        }
        //console.log('trelloSvc.getBoards result ', result);
        var messageString = '';
        for (var i = 0; i < result.length; i++) {
            messageString += 'Board name: <strong>' + result[i].name + '</strong> -- Board Id: <strong>' + result[i].id + '</strong><br /><br />';
        }
        res.send(messageString);
    })

});

app.listen(process.env.PORT || conf.api.port, function () {
    console.log('Listening on port 3000...');

    setTimeout(function () {
        trelloSvc.getBoards(function (err, result) {
            if (err) {
                console.log('err ', err);
                res.send(err);
            }
            //console.log('result ',result);
            trelloSvc.createWebhooks(result, function (err, result) {
                console.log('Result received');
            });
        })
    }, 5000);
});

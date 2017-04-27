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
    req.body = {
        "action": {
            "id": "51f9424bcd6e040f3c002412",
            "idMemberCreator": "4fc78a59a885233f4b349bd9",
            "data": {
                "board": {
                    "name": "Trello Development",
                    "id": "4d5ea62fd76aa1136000000c"
                },
                "card": {
                    "idShort": 1458,
                    "name": "Webhooks",
                    "id": "51a79e72dbb7e23c7c003778"
                },
                "voted": true
            },
            "type": "voteOnCard",
            "date": "2013-07-31T16:58:51.949Z",
            "memberCreator": {
                "id": "4fc78a59a885233f4b349bd9",
                "avatarHash": "2da34d23b5f1ac1a20e2a01157bfa9fe",
                "fullName": "Doug Patti",
                "initials": "DP",
                "username": "doug"
            }
        },
        "model": {
            "id": "4d5ea62fd76aa1136000000c",
            "name": "Trello Development",
            "desc": "Trello board used by the Trello team to track work on Trello.  How meta!\n\nThe development of the Trello API is being tracked at https://trello.com/api\n\nThe development of Trello Mobile applications is being tracked at https://trello.com/mobile",
            "closed": false,
            "idOrganization": "4e1452614e4b8698470000e0",
            "pinned": true,
            "url": "https://trello.com/b/nC8QJJoZ/trello-development",
            "prefs": {
                "permissionLevel": "public",
                "voting": "public",
                "comments": "public",
                "invitations": "members",
                "selfJoin": false,
                "cardCovers": true,
                "canBePublic": false,
                "canBeOrg": false,
                "canBePrivate": false,
                "canInvite": true
            },
            "labelNames": {
                "yellow": "Infrastructure",
                "red": "Bug",
                "purple": "Repro'd",
                "orange": "Feature",
                "green": "Mobile",
                "blue": "Verified"
            }
        }
    };
    console.log("POST", req.body);

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

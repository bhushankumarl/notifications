var conf = require('./config');
var slackSvc = require('./slack-service');
var Trello = require('node-trello');
var trello = new Trello(conf.TRELLO_API_KEY, conf.TRELLO_USER_TOKEN);

var createWebhooks = function (result) {
    var boards = result;
    for (var i = 0; i < boards.length; i++) {
        console.log("boards ", boards[i].id);
        var query = {
            description: boards[i].name,
            callbackURL: conf.api.url + '/trello/webhook',
            idModel: boards[i].id
        };
        //console.log('createWebhooks query ', query);
        trello.post('/1/webhooks', query, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log(' trello.post Data ', data)
            }
        });
    }
};

var filterMessage = function (slackModel) {
    var filter = conf.slack.filter;
    console.log('slackModel.commentText ', slackModel.commentText)
    for (var i = 0; i < filter.length; i++) {
        var item = filter[i];
        if (slackModel.commentText.indexOf(item.key) !== -1) {
            console.log('item.key ', item.key);
            slackSvc.sendToSlack(slackModel, item.channel, item.username);
        }
        /*else {
         console.log('Match failed.');
         }*/
    }
};

var processChange = function (data) {
    console.log('Inside processChange');
    if (!data || !data.model || !data.action) {
        console.log('Return due to lack of data or model or action');
        return;
    }

    var model = data.model;
    var action = data.action;

    var slackModel = {
        boardName: model.name,
        actionType: action.type,
        commentText: action.data.text,
        commentCard: action.data.card,
        commentBoard: action.data.board,
        commentList: action.data.list,
        memberName: action.memberCreator ? action.memberCreator.fullName : "",
        cardUrl: "https://trello.com/c/" + action.data.card.shortLink
    };

    //trello.get("/1/");
    console.log('slackModel ready');
    if (slackModel.actionType === 'commentCard') {
        console.log('Inside slackModel.actionType === commentCard');
        filterMessage(slackModel);
    } else {
        console.log('It is not commentCard');
    }
}

var getBoards = function (callback) {
    trello.get("/1/tokens/" + conf.TRELLO_USER_TOKEN + "/member", function (err, result) {
        if (err) {
            console.log('Error!', err);
        }
        //console.log('getBoards result', result);
        var memberId = result.id;

        trello.get('/1/members/' + memberId + '/boards', callback);
    });
};

module.exports = {
    createWebhooks: createWebhooks,
    processChange: processChange,
    getBoards: getBoards
};

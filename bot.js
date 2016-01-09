'use strict';

var Bot = require('slackbots');
var mathmode = require('mathmode');
var request = require('request');
var fs = require('fs');

var settings = {
    token: process.env.SLACK_TOKEN
};

var texOptions = {
    dpi: 300,
    format: "png"
}

var bot = new Bot(settings);

bot.on('message', function(data) {

    var msg = data.text;
    var channelId = data.channel;

    if (!msg || !channelId) {
        return;
    }

    var isTex = (msg[0]==='$' && msg[msg.length-1]==='$' && msg.length > 1)

    if (isTex) {
        var formulaFile = 'temporary.png'
        var writableStream = fs.createWriteStream(formulaFile);
        mathmode(msg,texOptions).on("error", function(err) {
            console.log("TeX error: ", err.toString());
            return;
        }).pipe(writableStream);

        writableStream.on('finish', function() {
            var url = 'https://slack.com/api/files.upload?' +
                    'token=' + bot.token +
                    '&channels=' + channelId +
                    '&filetype=png' +
                    '&filename=tex';

            var imgStream = fs.createReadStream(formulaFile);
            var req = request.post(url, function(err) {
                if (err) {
                    console.log("Post error:", err.toString());
                    return;
                }
            }).form().append('file', imgStream);
        });
    }
});

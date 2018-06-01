var builder = require('botbuilder');
var Product = ['Abode',
    'Microsoft',
    'Corel Draw','AutoDesk','Nitro','Third Party', 'Plugins'
];
var purchase = ['renew your subscription', 'buy a new one '];
module.exports = [
    function(session, args, next) {
        builder.Prompts.choice(
            session,
            'Which product are you looking at ?',
            Product,
            { listStyle: 3 }, {
                maxRetries: 3,
                retryPrompt: 'Not a valid option'
            });
    },

        function(session, result) {
        if (!result.response) {
            // exhausted attemps and no selection, start over
            session.send('Ooops! Too many attemps :( But don\'t worry, I\'m handling that exception and you can try again!');
            return session.endDialog();
        }

        // on error, start over
        session.on('error', function (err) {
            session.send('Failed with message: %s', err.message);
            session.endDialog();
        });

        // continue on proper dialog
            var selection = result.response.entity;
            switch (selection) {
                case DialogLabels[0]:
                    return session.beginDialog('abode');
                case DialogLabels[1]:
                    return session.beginDialog('Microsoft');
                case DialogLabels[2]:
                    return session.beginDialog('Corel Draw');
                case DialogLabels[3]:
                    return session.beginDialog('AutoDesk');
                case DialogLabels[2]:
                    return session.beginDialog('Nitro');
                case DialogLabels[2]:
                    return session.beginDialog('ThirdParty');
                case DialogLabels[2]:
                    return session.beginDialog('Plugins');
            }
        
    }



];

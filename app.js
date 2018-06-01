require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
var Store = require('./store');
var customer = "";
var type;
var type1;
var com;
const fs = require('fs');
var rawdata = fs.readFileSync('product.json');
var pro_JSON = JSON.parse(rawdata);
var pro = pro_JSON.products;
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot and listen to messages
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

var DialogLabels = [     'Product/Pricing',
     'Knowledge',
     'General'
];
var Product = ['Adobe',
    'Microsoft',
    'Corel Draw', 'AutoDesk', 'Nitro', 'Third Party', 'Plugins'
];


// Bot Storage: Here we register the state storage for your bot. 
// Default store: volatile in-memory store - Only for prototyping!
// We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
// For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
var inMemoryStorage = new builder.MemoryBotStorage();

var bot = new builder.UniversalBot(connector, [
    function (session) {
        // prompt for search option
        builder.Prompts.choice(
            session,
            'Please select what are you looking from the below choices',
            DialogLabels,
            { listStyle: 3 },{
                maxRetries: 3,
                retryPrompt: 'Not a valid option'
            });
    },
    function (session, result) {
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
            case DialogLabels[1]:
                return session.beginDialog('flights');
            case DialogLabels[0]:
                return session.beginDialog('hotels');
            case DialogLabels[2]:
                return session.beginDialog('support');
        }
    }
]).set('storage', inMemoryStorage); // Register in memory storage

bot.dialog('hotels', [function (session, args, next) {
    builder.Prompts.choice(
        session,
        'Which product are you looking at ?',
        Product,
        { listStyle: 3 }, {
            maxRetries: 3,
            retryPrompt: 'Not a valid option'
        });
},

function (session, result) {
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
        case Product[0]:
            com="adobe"
            return session.beginDialog('adobe');
        case Product[1]:
            return session.beginDialog('Microsoft');
        case Product[2]:
            return session.beginDialog('Corel Draw');
        case Product[3]:
            return session.beginDialog('AutoDesk');
        case Product[4]:
            return session.beginDialog('Nitro');
        case Product[5]:
            return session.beginDialog('ThirdParty');
        case Product[6]:
            return session.beginDialog('Plugins');
    }

}
]);
var adobe_type = ['Commercial','academic','individual','government'];
bot.dialog('adobe', [
    function (session, args, next) {
       builder.Prompts.choice(
        session,
        'Are you an New cutomer or an Existing one  ?',
        'Existing Customer|New Customer',
        { listStyle: 3 }, {
            maxRetries: 3,
            retryPrompt: 'Not a valid option'
        });
},
    function (session, result)
    {
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

        if (result.response.entity == "New Customer") {
            session.beginDialog("adobe_new");
        }
        else
        {
            session.beginDialog("adobe_exist");
        }
    }
    
]);
bot.dialog("adobe_exist", [function (session)
{
    builder.Prompts.text(session, 'Please Enter Your 20 character alphanumeric VIP Number  ');

},
    function (session, result, next)
    {
        var vip = result.response;
        var pat = new RegExp("[a-z0-9]{19}");
        var s = pat.test(vip);
        console.log(s);
        console.log(vip.length);
        if (s && vip.length == 20) {
            builder.Prompts.time(session, "Please enter your product anniversary date in dd-month-year format ");
            session.replaceDialog('hotels');
        }
        else
        {
            session.send("Invalid Input : Please Enter Your Valid 20 Character Alphanumeric VIP Number ")
            session.replaceDialog('adobe_exist', { isReprompt: true });
        }
    }
]);
bot.dialog('adobe_new', [
    function (session)
    {
        builder.Prompts.choice(
            session,
            'What type of adobe product are you looking for  ?',
            adobe_type,
            { listStyle: 3 }, {
                maxRetries: 3,
                retryPrompt: 'Not a valid option'
            });
    },
    function (session, result, next)
    {
        type = result.response.entity;
        builder.Prompts.choice(
            session,
            'What type of ' + type +' adobe product are you looking for  ?',
            "Cloud Product|Perpetual Product",
            { listStyle: 3 }, {
                maxRetries: 3,
                retryPrompt: 'Not a valid option'
            });
    },
    function (session, result, next)
    {
         type1 = result.response.entity;
        if (type1 == "Perpetual Product")
        {
            if (type == "Commercial")
            {
                var message = new builder.Message()
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(pro.map(hotelAsAttachment)); 
                session.send(message);
            }
        }
    }
 
]);
function hotelAsAttachment(pro) {
    return new builder.HeroCard()
        .title(pro.name)
        .images([new builder.CardImage().url(pro.image)])
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value(pro.URI)
        ]);
}
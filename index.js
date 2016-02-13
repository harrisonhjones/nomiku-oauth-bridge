var express = require('express');
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', function (req, res) {
    res.redirect(process.env.NOMIKU_REDIRECT || 'https://github.com/harrisonhjones/');
});

app.get('/authorize', function (req, res) {
    
    console.log(req.query);

    if(req.query['response_type'] == 'token' && req.query['client_id'] == 'alexaApp' && req.query['redirect_uri'])
    {
        var fs = require('fs');

        fs.readFile('login.html', 'utf8', function(err, data) {

            if (err)
                res.send("Something bad happened. Unable to load the login page. Error = " + JSON.stringify(err));
            else
            {
                var Handlebars = require("Handlebars");
                var template = Handlebars.compile(data);
                var context = {redirect_uri: req.query['redirect_uri']};
                var html    = template(context);
                res.send(html);
            }
        });
    }
    else
    {
        res.status(400).send('Request is missing response_type=token, valid client_id, and valid redirect_uri');
    }
});

app.post('/authorize', function (req, res) {
    var username = req.body['username'],
        password = req.body['password'],
        redirect_uri = req.body['redirect_uri'];

    if(!username || !password)
        res.status(400).send("You somehow failed to supply a username or password");

    if(!redirect_uri)
        res.status(400).send("Hacking attempt!");

    var nom = require('nomiku-js');

    nom.auth(username, password, function(error){

        if(error)
        {
            res.send("Failed to login for some reason. Error =" + error);
            return;
        }
        else
        {
            res.redirect(redirect_uri + '#access_token=' + nom.getToken() + '&token_type=Bearer');
        }
    });
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Nomiku OAuth Bridge Running');
});
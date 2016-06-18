var express = require('express');
var fs = require('fs');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.get(/new\/(.*)/,function(req,res){
    var originalUrl = req.params[0];
    if(isValidUrl(originalUrl)){
        var shortUrl = tinyUrl(originalUrl);
        res.json({original_url: originalUrl, short_url: req.headers.host + "/" + shortUrl});
    }else{
        res.json({"error":"URL invalid"});
    }
});

app.get(/(.+)/, function(req, res){
    var shortUrl = req.params[0];
    var originalUrl = restoreUrl(shortUrl.slice(1));
    if(originalUrl != null){
        console.log(originalUrl);
        if(!originalUrl.startsWith("http")){
            originalUrl = "http://" + originalUrl;
        }
        res.redirect(originalUrl);
    }else{
        res.json({"error":"short URL invalid"});
    }
});

app.get('/', function(req, res) {
  fs.readFile(__dirname + '/views/pages/index.html', 'utf8', function(err, text){
        res.send(text);
    });
});

function isValidUrl(url){
    var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
    return regex.test(url);
}

// Base62 hash map from code to char
function getMapChar(n){
    if(n >= 0 && n < 10){
        return n.toString();
    }else if(n >= 10 && n < 36){
        return String.fromCharCode( 87 + n);
    }else if(n >= 36 && n < 62){
        return String.fromCharCode( 29 + n);
    }else{
        return "";
    }
}

// Return 6 charactes hash string of given id
function tinyUrl(originalUrl){
    if(tinyUrlRMappings.hasOwnProperty(originalUrl)){
        return tinyUrlRMappings[originalUrl];
    }else{
        var shortUrl = "";
        var id = nextid++;
        while(id > 0){
            shortUrl += getMapChar(id%62);
            id = Math.floor(id/62);
        }
        tinyUrlMappings[shortUrl] = originalUrl;
        tinyUrlRMappings[originalUrl] = shortUrl;
        return shortUrl;
    }
}

var nextid = 1111;
var tinyUrlMappings = {};
var tinyUrlRMappings = {};

function restoreUrl(shortUrl){
    console.log(shortUrl);
    console.log(tinyUrlMappings);
    if(tinyUrlMappings.hasOwnProperty(shortUrl)){
        return tinyUrlMappings[shortUrl];
    }else{
        return null;
    }
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});



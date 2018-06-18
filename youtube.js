var {google} = require('googleapis');
var {OAuth2Client} = require('google-auth-library');
var fs = require('fs');
var https = require('https');
var readline = require('readline');
var util = require('util');
var SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
var TOKEN_DIR = './credentials/' 

//(process.env.HOME || process.env.HOMEPATH ||
//process.env.USERPROFILE) + '/credentials/';

var TOKEN_PATH = TOKEN_DIR + 'google-apis-nodejs-quickstart.json';

exports.authorize = function(credentials, requestData) {
    return new Promise((resolve, reject) => {


    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
     
  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      console.log(err)
      getNewToken(oauth2Client, requestData, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      console.log('token exists')
      videoInsert(oauth2Client, requestData).then(result => {
        const filePath = requestData.mediaFilename;
        result['filePath'] = filePath
        resolve(result)
      }).catch(err => {
        reject(err)
      })
    }
  });
  })
}

function getNewToken(oauth2Client, requestData, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      console.log('got token')
      storeToken(token);
     console.log('token exists2')
      videosInsert(oauth2Client, requestData)
    });
  });
}


function storeToken(token) {
  console.log(token)
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

function removeEmptyParameters(params) {
  for (var p in params) {
    if (!params[p] || params[p] == 'undefined') {
      delete params[p];
    }
  }
  return params;
}

function createResource(properties) {
  var resource = {};
  var normalizedProps = properties;
  for (var p in properties) {
    var value = properties[p];
    if (p && p.substr(-2, 2) == '[]') {
      var adjustedName = p.replace('[]', '');
      if (value) {
        normalizedProps[adjustedName] = value.split(',');
      }
      delete normalizedProps[p];
    }
  }
  for (var p in normalizedProps) {
    // Leave properties that don't have values out of inserted resource.
    if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
      var propArray = p.split('.');
      var ref = resource;
      for (var pa = 0; pa < propArray.length; pa++) {
        var key = propArray[pa];
        if (pa == propArray.length - 1) {
          ref[key] = normalizedProps[p];
        } else {
          ref = ref[key] = ref[key] || {};
        }
      }
    };
  }
  return resource;
}


const videoInsert = function(auth, requestData) {
  return new Promise((resolve, reject) => {


    var service = google.youtube('v3');
    var parameters = removeEmptyParameters(requestData['params']);
    parameters['auth'] = auth;
    parameters['media'] = { body: fs.createReadStream(requestData['mediaFilename']) 
    };
    parameters['notifySubscribers'] = false;
    parameters['resource'] = createResource(requestData['properties']);
    const req = service.videos.insert(parameters, function(err, data) {
      if (err) {
        console.log('The API returned an error: ' + err);
      }
      if (data) {
        resolve(data.data.status);
      }
      })
  })
  
}
var {google} = require('googleapis');
var {OAuth2Client} = require('google-auth-library');
var fs = require('fs');
var readline = require('readline');
var util = require('util');
var SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']
var TOKEN_DIR = './credentials/' 

//(process.env.HOME || process.env.HOMEPATH ||
//process.env.USERPROFILE) + '/credentials/';

var TOKEN_PATH = TOKEN_DIR + 'google-apis-nodejs-quickstart.json';
console.log(TOKEN_DIR)
console.log(TOKEN_PATH)

exports.authorize = function(credentials, requestData, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
  //  var auth = new OAuth2Client();
    var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      console.log(err)
      getNewToken(oauth2Client, requestData, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      console.log('token exists')
      callback(oauth2Client, requestData);
    }
  });
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


exports.videoInsert = function(auth, requestData) {
   
  var service = google.youtube('v3');
  var parameters = removeEmptyParameters(requestData['params']);
  parameters['auth'] = auth;
  parameters['media'] = { body: fs.createReadStream(requestData['mediaFilename']) };
  parameters['notifySubscribers'] = false;
  parameters['resource'] = createResource(requestData['properties']);
  

  const req = service.videos.insert(parameters, function(err, data) {
    if (err) {
      console.log('The API returned an error: ' + err);
    }
    if (data) {
      console.log(data.data.status)
  //    console.log(util.inspect(data, false, null));
    }
    process.exit();
  })
  

  // var fileSize = fs.statSync(requestData['mediaFilename']).size;
  // //var fileSize = fs.statSync(requestData['video.flv']).size;
  // console.log(fileSize)
  // //show some progress
  // var id = setInterval(function () {
  //   console.log(req)
  //   var uploadedBytes = req.req.connection._bytesDispatched;    
  //   var uploadedMBytes = uploadedBytes / 1000000;
  //   var progress = uploadedBytes > fileSize
  //       ? 100 : (uploadedBytes / fileSize) * 100;
  //   process.stdout.clearLine();
  //   process.stdout.cursorTo(0);
  //   process.stdout.write(uploadedMBytes.toFixed(2) + ' MBs uploaded. ' +
  //      progress.toFixed(2) + '% completed.');
  //   if (progress === 100) {
  //     process.stdout.write('Done uploading, waiting for response...');
  //     clearInterval(id);
  //   }
  // }, 250);
}
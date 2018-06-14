/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var https = require('https');
var youtube = require('./youtube.js')
//const {auth} = require('google-auth-library');
// [START app]
var fs = require('fs');
var readline = require('readline');
const express = require('express');
const app = express();

app.get('/upload', (req, res) => {
  //uploadTheVideo();
  runVideoUpload();
  res.status(200).send('Hello, world2!').end();
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});



const runVideoUpload = async () => {

  const fistResponse = await getVideoFromFirebase();
  const secondResponse = await uploadTheVideo();
// const thirdAsyncRequest = await example.thirdAsyncRequest(secondResponse);
};



var getVideoFromFirebase = function(){
    return new Promise((resolve,reject) => {

   var video = 'https://firebasestorage.googleapis.com/v0/b/my-speaking-efbdf.appspot.com/o/Example%201.mp4?alt=media&token=ba5e96f1-4566-4bd0-a774-7c2ed959735e' 
     var stream = https.get(video, res => {
        console.log('working')
        res.pipe(fs.createWriteStream('example.mp4')).on('finish', (result) => {
         console.log('Got Pipe')
         resolve()
         })    
     })

});
  }


var uploadTheVideo = function(){
  console.log('called second function')
// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }

var vfile = 'https://firebasestorage.googleapis.com/v0/b/my-speaking-efbdf.appspot.com/o/Example%201.mp4'//?alt=media&token=ba5e96f1-4566-4bd0-a774-7c2ed959735e'  
youtube.authorize(JSON.parse(content), 
                {'params': 
                {'part': 'snippet, status'}, 
                'properties': 
                {'snippet.categoryId': '22',
                 'snippet.defaultLanguage': '',
                 'snippet.description': 'Description of uploaded video.',
                 'snippet.tags[]': '',
                 'snippet.title': 'small.mp4',
                 'status.embeddable': '',
                 'status.license': '',
                 'status.privacyStatus': 'unlisted',
                 'status.publicStatsViewable': ''
                }, 
                media: {
                body: vfile
                },
                'mediaFilename': vfile//'//example.mp4'
                }, 
                youtube.videoInsert);
})
}
'use strict';

const debug = require('debug')('http')
const https = require('https');
const fs = require('fs');
const readline = require('readline');
const express = require('express');
const app = express();
const youtube = require('./youtube.js')
const formidable = require('formidable');
const http = require('http');
const util = require('util');
const cors = require('cors')
app.use(cors())
debug('booting apps');

// app.get('/uploader', (req, res) => {

//   const video = req.query.data;
//   const valid = video.indexOf(`firebasestorage.googleapis.com`) < 0

//   if(video === undefined  || valid) {
//        console.log(valid)
//        console.log('not valid')
//       res.status(200).send('invalid video link!').end();
//     } else {    
//     runVideoUpload(video).then(() => {
//       res.status(200).send('Hello, world2!').end();
//     }).catch(err => {
//      res.status(200).send('failed')
//     });
//   } 
// });

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

// const runVideoUpload = async (video) => {
//   const fistResponse = await getVideoFromFirebase(video);
//   const secondResponse = await uploadTheVideo();
// };

// // var getVideoFromFirebase = function(video){
// //   return new Promise((resolve,reject) => {
// //       https.get(video, res => {
// //         res.pipe(fs.createWriteStream('example.mp4')).on('finish', result => {
// //         resolve('saved file locally')
// //       }).on('error', (err) => {
// //         console.log(err)
// //         reject(err)
// //       })    
// //     })
// //   });
// // }


var uploadTheVideo = function(path){
  console.log('called second function')
// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
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
                'mediaFilename': path//'example.mp4'
                }, 
                youtube.videoInsert);
})
}


app.get('/uploadfile', (req, res) => {
  // show a file upload form
  res.writeHead(200, {'content-type': 'video/mp4'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="text" name="title"><br>'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
})

app.post('/upload', (req, res) => {
    // parse a file upload
    var form = new formidable.IncomingForm();
    form.uploadDir = "./";
    form.keepExtensions = true;
    form.on('progress', function(bytesReceived, bytesExpected) {
      console.log(bytesReceived)
      
    }); 

    // form.on('fileBegin', function(name, file) {
      
    //   console.log(file._writeStream)
    // });
    
    // form.on('end', function(files) {
    //   console.log(files)
    // //  getVideoFromFirebase() 

    // });
    form.on('file', function(name, file) {
      console.log(file.path)
      uploadTheVideo(file.path)
    });

    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'video/mp4'});
      res.write('received upload:\n\n');
      res.end(util.inspect({fields: fields, files: files}));
    });
 
    return;
  })


'use strict';

const debug = require('debug')('http')
const fs = require('fs');
const express = require('express');
const app = express();
const youtube = require('./youtube.js')
const formidable = require('formidable');
const util = require('util');
const cors = require('cors')
app.use(cors())


debug('booting apps');



var uploadTheVideo = function(path, name){
  console.log(name)
 return new Promise((resolve, reject) => {

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
                   'snippet.title': name,
                   'status.embeddable': '',
                   'status.license': '',
                   'status.privacyStatus': 'unlisted',
                   'status.publicStatsViewable': ''
                  }, 
                  'mediaFilename': path//'example.mp4'
                  }).then((result) => {
                    resolve(result)
                  }).catch(err => {
                    console.log(err)
                  })
  })





 })

}

app.get('/test', (req, res) => {
  // show a file upload form
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="file" name="진수" multiple="multiple"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
})

app.post('/upload', (req, res) => {    
  handleFormData(req, res);
  return;
})


    const handleFormData = (req, res)=>{
      var form = new formidable.IncomingForm();
      form.uploadDir = "./";  
      form.keepExtensions = true;
      form.on('progress', function(bytesReceived, bytesExpected) {
        console.log(bytesReceived)      
      }); 
      form.on('file', function(name, file) {
        uploadTheVideo(file.path, name).then((result, filePath) => {
          fs.unlink(result.filePath, function(result){                     
            console.log(result)
          })
          // res.writeHead(200, {'content-type': 'text/html'});
          // res.write('received upload:\n\n' );
        }).catch(err => {
            console.log(err)
          })
      });
      form.parse(req, function(err, fields, files) {
        res.writeHead(200, {'content-type': 'text/html'});
        res.write('received upload:\n\n' );
        res.end(util.inspect({fields: fields, files: files}));
      });

    }
    

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});


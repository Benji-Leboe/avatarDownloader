require('dotenv').config();
const request = require('request');
const fs = require('fs');
const mkdirp = require('mkdirp');

//authentication credentials
const credentials = {
  username: process.env.GIT_USER,
  password: process.env.GIT_PASS,
  token: process.env.GIT_TOKEN,
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET
}

//define source URL
const url = 'https://api.github.com/repos';
//get args from node
let path = process.argv.slice(2);
//assign new dir name if passed otherwise default to /avatars
let destination = path[2] !== undefined ? `./${path[2]}` : './avatars';
//concat URL path
let getURL = `${url}/${path[0]}/${path[1]}`



function githubAvatarDownloader(url, path){
  //if /avatars doesn't exist, create it (or create new dir based on third arg)
  if(!fs.existsSync(destination)){
    mkdirp(destination, (err) => {
      if(err) console.error(err);
      else console.log(`Directory created in: ${destination}`);
    });
  };

  getRepoContributors(url, (err, result) => {
    console.log(`Errors: ${err}`);
    JSON.parse(result).forEach((item) => {
      downloadImgByURL(item.avatar_url, item.login, path);
    });
  });
}

function getRepoContributors(url, cb){
  let options = {
    url: `${url}/contributors`,
    headers: {
      'User-Agent': 'request',
      'Authorization': `token ${credentials.token}`
    }
  };

  request(options, (err, res, body) => {
    cb(err, body);
  });
};

function downloadImgByURL(url, userName, filePath, ){

  request.get(url)
    .on('error', (err) => {
      console.error(err);
    })
    .on('response', (response) => {
      console.log(`Response code: ${response.statusCode}\nResponse message: ${response.statusMessage}\nContent type: ${response.headers['content-type']}`);
      if(response.statusCode >= 400){
        console.log('Download failed.');
      }else{
        console.log(`Downloading ${userName}'s Avatar image to ${filePath}...`);
      }
    })
    .pipe(fs.createWriteStream(`${filePath}/${userName}.jpg`).on('error', (err) => {
      console.error(err);
    }))
    .on('finish', () => {
      console.log(`${userName}'s Avatar downloaded!`)
    });
}

githubAvatarDownloader(getURL, destination);
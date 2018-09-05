require('dotenv').config();
const request = require('request');
const fs = require('fs');
const mkdirp = require('mkdirp');

//authentication credentials
const credentials = {
  token: process.env.GIT_TOKEN
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
      else console.log(`Directory created in: ${destination}.`);
    });
  };

  getRepoContributors(url, (err, result) => {
    console.log(`Errors: ${err}`);
    JSON.parse(result).forEach((item) => {
      downloadImgByURL(item.avatar_url, item.login, path);
    });
  });
  
}

//find repo contributors
function getRepoContributors(url, cb){
  let options = {
    url: `${url}/contributors`,
    headers: {
      'User-Agent': 'request',
      'Authorization': `token ${credentials.token}`
    }
  };

  request(options, (err, res, body) => {
    //check for valid owner/repo
    if(body.includes("Not Found")){
      console.error('Owner or repo not found.');
    }else{
      cb(err, body);
    }
  });
};

//download user images
function downloadImgByURL(url, userName, filePath){

  request.get(url)
    .on('error', (err) => {
      console.error(err);
    })
    .on('response', (response) => {
      console.log(`Response code for ${userName}: ${response.statusCode}\nResponse message: ${response.statusMessage}\nContent type: ${response.headers['content-type']}`);
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

//check for passed args
if(process.argv.slice(2).length < 2 || process.argv.slice(2).length > 3){
  console.error('Please pass an <owner> and <repo> argument as well as an optional <directory> argument. If you don\'t pass a <directory> argument, images will be downloaded to ./avatars');
//check if .env exists
}else if(!fs.existsSync('.env')){
  console.error('Missing .env file.');
//check for token
}else if(!credentials.hasOwnProperty('token')){
  console.error('Please add an authentication token to credentials.');
//else run program
}else{
  githubAvatarDownloader(getURL, destination);
}
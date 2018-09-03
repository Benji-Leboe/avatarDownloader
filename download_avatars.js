const request = require('request');
const fs = require('fs');

//define source URL
const url = 'https://github.com';
//get args from node
let path = process.argv.slice(2);

function githubAvatarDownloader(url, path){
  let getURL = `${url}/${path[0]}/${path[1]}`
  
}

githubAvatarDownloader(url, path);
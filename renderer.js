// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var request = require('request'); // "Request" library
const {dialog} = require('electron').remote;
var fs = require('fs');

var client_id = 'YOUR-CLIENTID-HERE'; // Your client id
var client_secret = 'YOUR-CLIENTSECRET-HERE'; // Your secret

var token;
// request token using authOptions
var authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

request.post(authOptions, function (error, response, body) {
  if (!error && response.statusCode === 200) {
    // use the access token to access the Spotify Web API
    token = body.access_token;
  }
  else{
    console.log("Token error: "+error);
  }
});

// Set up folder select button
let selectbutton = document.getElementById('selectfolder');
selectbutton.addEventListener('click', function (error) {
  selectCloneHeroFolder();
});

// Two options for the user to query their username
let userSubmit = document.getElementById('username');
userSubmit.addEventListener('keyup', function (event) {
  if(event.keyCode===13){
    getPlaylists();
  }
});
let userSubmit2 = document.getElementById('submit');
userSubmit2.addEventListener('click', function (event) {
  getPlaylists();
});

function getPlaylists(){
  let username = document.getElementById('username').value;
  var options = {
    url: 'https://api.spotify.com/v1/users/'+username+"/playlists",
    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true
  };
  request.get(options, function (error, response, body) {
    console.log(body);

    let playlists = document.getElementById('playlists');
    playlists.innerHTML="";

    let playlistsString = "";

    for (let item in body.items){
      let playlist = body.items[item];
      playlistsString +=`<button class="btn btn-success" id="p${item}">${playlist.name}</button><br>`;
    }
    playlists.innerHTML=playlistsString;
    // Need a separate loop for these because setting innerHTML would erase EventListeners
    for (let item in body.items){
      let playlist = body.items[item];
      let playlistButton = document.getElementById('p'+item);
      // console.log(playlistButton);
      playlistButton.addEventListener('click', function (error) {
        // console.log("button pressed: ");
        getTracks(token,username,playlist.id);
      });
    }
  });
}

function getTracks(token,username,playlistid){
  var options = {
    url: 'https://api.spotify.com/v1/users/'+username+"/playlists/"+playlistid+"/tracks",
    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true
  };
  // console.log(options.url);
  let trackString = "";
  request.get(options, function (error, response, body) {
    // console.log(body);
    for (let item in body.items){
      let track = body.items[item].track;
      // console.log(track);
      trackString+=track.name+"<br>"

      let album = track.album.name;
      let artist = track.artists[0].name;
      // console.log(album+", "+artist);

      checkChorus(`name="`+track.name+`" artist="`+artist+`" album="`+album+`"`);
    }
    let trackList = document.getElementById('tracks');
    trackList.innerHTML=trackString;
  });
  
}

function checkChorus(queryString){
  console.log(queryString);
  var options = {
    url: 'https://chorus.fightthe.pw/api/search?query='+queryString,
    json: true
  };
  request.get(options, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      // console.log(body);
      if (body.songs.length==0){
        console.log("Song not found");
      }
      else{
        let bestMatch = body.songs[0];
        console.log(bestMatch);
        saveFile(bestMatch.directLinks.archive);
      }
    }
  });
}

function saveFile(link){
  console.log("saveFile called with link: " +link);

  request
    .get(link)
    .on('response',function(response){
      let filename = response.headers['content-disposition'].split("filename*=UTF-8''")[1];
      let chpath = document.getElementById('chpath').value;
      let filepath = chpath+"/Songs/"+filename;
      if (fs.existsSync(filepath)){
        console.log("File already exists, rewriting");
      }
      response.pipe(fs.createWriteStream(filepath))
    });
}

function selectCloneHeroFolder(){
  let cloneHeroPath = dialog.showOpenDialog({
    properties: ['openDirectory']
  })

  console.log(cloneHeroPath[0]);
  let chpath = document.getElementById('chpath');
  chpath.value = cloneHeroPath[0];
  // chpath.innerHTML=cloneHeroPath[0];
  // return cloneHeroPath[0];
}
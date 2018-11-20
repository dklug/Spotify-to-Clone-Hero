// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var request = require('request'); // "Request" library

var client_id = 'YOUR-CLIENTID-HERE'; // Your client id
var client_secret = 'YOUR-CLIENTSECRET-HERE'; // Your secret

// your application requests authorization
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

// Query username when button pressed
let buttonquery = document.querySelector('.test');
buttonquery.addEventListener('click', function (error) {
  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let userquery = document.querySelector('.username');
      console.log(userquery);
      if (userquery.value==null){
        console.log("No username found");
      }
      console.log("username: " +userquery.value);

      // use the access token to access the Spotify Web API
      var token = body.access_token;
      getPlaylists(token,userquery.value)
    }
  });
});

function getPlaylists(token,username){
  var options = {
    url: 'https://api.spotify.com/v1/users/'+username+"/playlists",
    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true
  };
  request.get(options, function (error, response, body) {
    console.log(body);

    let playlists = document.querySelector('.playlists');
    playlists.innerHTML="";

    for (let item in body.items){
      playlist = body.items[item];
      // console.log(playlist.name);
      playlists.innerHTML+=`<button class="p`+item+`">`+playlist.name+`</button>`+`<br>`;
      
      let playlistButton = document.querySelector('.p'+item);
      playlistButton.addEventListener('click', function (error) {
        console.log("button pressed: ");
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
  request.get(options, function (error, response, body) {
    console.log(body);
    for (let item in body.items){
      track = body.items[item].track;
      console.log(track.name);
    }
  });
}
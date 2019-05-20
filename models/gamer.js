const nconf = require('nconf');
const Gamer_Tournament = require('../public/javascripts/gamer_tournament.js');

nconf.argv().env().file('keys.json');
const gamerApiKey = nconf.get('gamerAPIKey');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

module.exports.divisionStats = function(tournamentId, division){
  let tournament = '';
  let url = 'https://www.gamer.no/api/v1/tournaments/'+tournamentId;
  return new Promise(function(rs,rj){
    fetchDataGamer(url, function(res){
      new Promise(function(resolve, reject){ 
        tournament = new Gamer_Tournament();
        tournament.init(res.response, function(){
          resolve();
        });
      }).then(function(){
        let topList = getPlayers(tournament, division)
        rs(topList);
      });
    });
  });
}

function fetchDataGamer(url, callback) {
  let request = new XMLHttpRequest();
  request.open("GET", url);
  request.responseType = "json";
  request.setRequestHeader('Authorization', gamerApiKey);
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      callback(JSON.parse(request.responseText));
    }
  }
  request.send();
}

function getPlayers(tournament, division){
  let div = [...tournament.divisions_.entries()][division];
  
  let round = 0;
  for(j = 0; j<= div[1].rounds_.length; j++){
    if(div[1].rounds_[j].results_ == undefined){
      round = j-1;
      break;
    }
  }
  
  let player = new Map();
  div[1].rounds_[round].matches_.forEach(function(match){
    match.stats_.forEach(function(stats){
      let pubgName = stats.pubg_account_name;
      if(!player.has(pubgName)) player.set(pubgName,{kills:0,damage:0,assists:0,deaths:0,kd:0});
      player.get(pubgName).kills += parseInt(stats.kills);
      player.get(pubgName).damage += Math.round(parseFloat(stats.damage_dealt));
      player.get(pubgName).assists += parseInt(stats.assists);
      player.get(pubgName).deaths += parseInt(stats.deaths);
      player.get(pubgName).kd = Math.round(player.get(pubgName).kills / player.get(pubgName).deaths*10)/10;
      player.get(pubgName).team = stats.team_name;
      player.get(pubgName).teamShort = stats.team_abbreviation;
    });
  });
  
  let topKills = [...player.entries()].sort(function(a, b){
    return b[1].kills - a[1].kills;
  }).slice(0,5);

  let topAssists = [...player.entries()].sort(function(a, b){
    return b[1].assists - a[1].assists;
  }).slice(0,5);
  
  let topDamage = [...player.entries()].sort(function(a, b){
    return b[1].damage - a[1].damage;
  }).slice(0,5);

  let topKD = [...player.entries()].sort(function(a, b){
    return b[1].kd - a[1].kd;
  }).slice(0,5);
  
  let leaderboard = div[1].rounds_[round].results_;
  
  return [
    {topList: leaderboard, text: 'Leaderboard', type:'leaderboard'},
    {topList: topKills, text: 'Top 5 frags', type:'kills'},
    {topList: topAssists, text: 'Top 5 assists', type:'assists'},
    {topList: topDamage, text: 'Top 5 damage', type:'damage'}
  ];
}
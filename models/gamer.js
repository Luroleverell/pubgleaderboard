const nconf = require('nconf');
const Gamer_Tournament = require('../public/javascripts/gamer_tournament.js');
const GamerTournament = require('../public/javascripts/gamer_tournament.js');
var JSZip = require('jszip');
var JSZipUtils = require('jszip-utils');
var request = require('request');
var fs = require('fs');
var archiver = require('archiver');

nconf.argv().env().file('keys.json');
const gamerApiKey = nconf.get('gamerAPIKey');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


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

module.exports.test = function(){
  let url = `https://www.gamer.no/api/paradise/v2/competition/9539`;  // Overordnet object for turneringen; navn, påmeldingsfrist osv
  //let url = 'https://www.gamer.no/api/paradise/v2/competition/9539/stats //?round_number=4'; // Oversikt over alle spillere; kills, damage, lag osv
  //let url = 'https://www.gamer.no/api/paradise/v2/competition/9539/signups'; // Oversikt over alle spillere; kills, damage, lag osv
  //let url = 'https://www.gamer.no/api/paradise/v2/competition/9539/divisions'; // Oversikt over divisjonene; id, navn og rekkefølge -=> Divisjons id
  
  //let url = 'https://www.gamer.no/api/paradise/v2/division/9907'; // Overordnet object for hver valgt divisjon. === Virker overflødig ===
  //let url = 'https://www.gamer.no/api/paradise/v2/division/9907/stats'; //?round_number=4';// Player basert statestikk for valgte divisjon: samme objecter som competitions/id/stats
  //let url = 'https://www.gamer.no/api/paradise/v2/division/9907/signups'; // info om lagene i angitt divisjon, her kommer også plassering osv med -=> Team id
  //let url = 'https://www.gamer.no/api/paradise/v2/division/9907/heats'; //?round_number=4';// Info om hver runde; id, maps osv heat = runde  -=> Heat id
  
  //let url = 'https://www.gamer.no/api/paradise/v2/team/105066'; //team info; id, logo, navn og forkortelse
  //let url = 'https://www.gamer.no/api/paradise/v2/team/105066/players'; //team info; id, logo, navn og forkortelse -=> user id
    
  //let url = 'https://www.gamer.no/api/paradise/v2/user/3557'; //overordnet info om spillere
  //let url = 'https://www.gamer.no/api/paradise/v2/user/3557/stats/pubg'; //samlet stats over alle turnering på gamer.no plattformen
  
  //let url = 'https://www.gamer.no/api/paradise/v2/heat/2162?map_number=1'; //overordnet info om runden
  //let url = 'https://www.gamer.no/api/paradise/v2/heat/2162/stats';//?map_number=1 //overordnet info om runden
  
  return new Promise(function(resolve, reject){
    fetchDataGamer(url, function(res){
      resolve(res);
    });
  });
}


module.exports.division = function(id){
  //let url = 'https://www.gamer.no/api/v1/tournaments/'+id;
  let url = `https://www.gamer.no/api/paradise/v2/competition/${id}/divisions`;
  let groups = [];
  
  return new Promise(function(resolve, reject){
    fetchDataGamer(url, function(res){
      res.forEach(function(div){
        groups.push({id:div.id, name: div.name, order: div.order});
      });
      
      groups.sort(function(a,b){return a.order - b.order})
      resolve(groups);
    });
  });
}

module.exports.tables = function(id, date){
  let url = 'https://www.gamer.no/api/v1/tournaments/'+id+'/tables';
  let groups = [];
  let tournament = '';
  return new Promise(function(resolve, reject){
    fetchDataGamer(url, function(res){
      new Promise(function(rs, rj){
        let tables = Object.values(res.response)
        tournament = new GamerTournament();
        tournament.init(tables, date, function(){
          rs();
        });
      }).then(function(){
        resolve(tournament.lateJoins_);
      });;
    });
  })
}

module.exports.rounds = function(group){
  let url = 'https://www.gamer.no/api/v1/tournaments/'+group.id+'/rounds';
  let rounds = [];
  
  return new Promise(function(resolve, reject){
    fetchDataGamer(url, function(res){
      res.response.forEach(function(round){
        rounds.push(round.id);
      });
      resolve(rounds);
    });
  });
}


module.exports.signup = function(group, response){
  let url = `https://www.gamer.no/api/paradise/v2/division/${group.id}/signups`;
  let output = [];
  let teams = [];
  
  var outfile = fs.createWriteStream('public/observerpack/observerpack.zip');
  var archive = archiver('zip',{zlib: {level: 9}});
  
  archive.pipe(outfile);
  
  //console.log(response);
  
  return new Promise(function(resolve, reject){
    fetchDataGamer(url, function(res){
      count = 0;
      let s = 'TeamNumber,TeamName,ImageFileName,TeamColor\r';
      let sc = ',';
      archive.append(null,{name: 'TeamIcon/'});
      res.forEach(function(p){
        let image = p.team.logo.url + '?c=1&h=300&w=300&format=png';//replace('160x160', '300x300');
        count++;
        let name = convertChar(p.team.name);
        let shortName = convertChar(p.team.abbreviation);
        //console.log(name);
        s += count +sc+ name +sc+ shortName +sc+ count+'.png' +sc+ '\r';
        archive.append(request(image), {name: 'TeamIcon/'+count+'.png'});
      });
      archive.append(s, {name: 'TeamInfo.csv'}); 
      archive.pipe(response)
      
      archive.on('error', function(err){
        throw err;
      });
      
      archive.finalize().then(function(){
        //outfile.end();
        resolve();
      });
      
      outfile.on('close', function(){
      });

      outfile.on('end', function(){
      }); 
    });
  });
}



module.exports.round = function(id, response){
  //console.log(id);
  let url = 'https://www.gamer.no/api/v1/rounds/'+id;
  let output = [];
  let teams = [];
  
  var outfile = fs.createWriteStream('public/observerpack/observerpack.zip');
  var archive = archiver('zip',{zlib: {level: 9}});
  
  archive.pipe(outfile);
  
  //console.log(response);
  
  return new Promise(function(resolve, reject){
    fetchDataGamer(url, function(res){
      
      count = 0;
      let s = 'TeamNumber,TeamName,ImageFileName,TeamColor\r';
      let sc = ',';
      archive.append(null,{name: 'TeamIcon/'});
      res.response.participants.forEach(function(p){
        let image = p.team.image.replace('160x160', '300x300');
        count++;
        let name = convertChar(p.team.name);
        let shortName = convertChar(p.team.abbreviation);
        //console.log(name);
        s += count +sc+ name +sc+ shortName +sc+ count+'.png' +sc+ '\r';
        archive.append(request(image), {name: 'TeamIcon/'+count+'.png'});
      });
      archive.append(s, {name: 'TeamInfo.csv'});
      archive.pipe(response)
      
      archive.finalize().then(function(){
        //outfile.end();
        resolve();
      });
      
      outfile.on('close', function(){
      });

      outfile.on('end', function(){
      }); 
    });
  });
}
/*
module.exports.group = function(id, gid){
  let url = 'https://www.gamer.no/api/v1/tournaments/'+id+'/tables';
  let grpTab = [];
  let groups = new Map();
  
  return new Promise(function(resolve, reject){
    fetchDataGamer(url, function(res){
      res.response.forEach(function(team){
        if(! groups.has(team.tournament.id)) groups.set(team.tournament.id, 1);
      });
      
      let grpArr = [...groups.keys()].sort();
           
      res.response.forEach(function(team){
        if(team.tournament.id == grpArr[gid-1]) grpTab.push({id:team.participant.teamId, group: team.tournament.id, groupName: team.tournament.name});
      });
      resolve(grpTab);
    });
  });
}


module.exports.observerpack = function(signupId, group, response){
  let url = 'https://www.gamer.no/api/v1/tournaments/'+signupId+'/signups';
  let zip = new JSZip();
  let output = [];
  let teams = [];
  
  var outfile = fs.createWriteStream('public/observerpack/observerpack.zip');
  var archive = archiver('zip',{zlib: {level: 9}});
  
  archive.pipe(outfile);

  return new Promise(function(resolve, reject){
    fetchDataGamer(url, function(res){
      output = res.response;
      output.forEach(function(signup){
        let team = signup.team;
        let image = team.image.replace('160x160', '300x300');
        group.forEach(function(g){
          if(g.id == team.id) teams.push({id:team.id, name:team.name, image:image, group: g.groupName});
        });
      });
      
      count = 0;
      let s = 'TeamNumber,TeamName,,ImageFileName,TeamColor\r';
      let sc = ',';
      archive.append(null,{name: 'TeamIcon/'});
      teams.forEach(function(team){
        count++;
        s += count+sc+team.name+sc+sc+count+'.png'+sc+'\r';
        archive.append(request(team.image), {name: 'TeamIcon/'+count+'.png'});
      });
      archive.append(s, {name: 'TeamInfo.csv'});
      archive.pipe(response)
      
      archive.finalize().then(function(){
        //outfile.end();
        resolve();
      });
      
      outfile.on('close', function(){
      });

      outfile.on('end', function(){
      }); 
    });
  });
}*/

function fetchDataGamer(url, callback) {
  let request = new XMLHttpRequest();
  request.open('GET', url);
  //request.responseType = 'json';
  request.setRequestHeader('Authorization', 'Bearer ' + gamerApiKey);
  request.setRequestHeader('Content-Type', 'application/json');
  request.setRequestHeader('Accept', 'application/json');
  
  request.send();
  
  request.onreadystatechange = function(){
    if(request.readyState == 4){
      callback(JSON.parse(request.responseText)) //JSON.parse(request.responseText))
    }
  }
}

function getPlayers(tournament, division){
  let div = [...tournament.divisions_.entries()][division];
  
  let round = div[1].rounds_.length-1;
  for(j = 0; j<= div[1].rounds_.length-1; j++){
    if(div[1].rounds_[j].results_ == undefined){
      round = j-1;
      break;
    }
  }
  
  let player = new Map();
  let results = new Map();
  
  for(j = 0; j<=round; j++){
    div[1].rounds_[j].matches_.forEach(function(match){
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
    
    div[1].rounds_[j].results_.forEach(function(r){
      if(!results.has(r.signup.teamId)) results.set(r.signup.teamId,{name: r.signup.name, score: 0, kills: 0, placement: 0});
      results.get(r.signup.teamId).score += r.score;
      results.get(r.signup.teamId).kills += r.kills;
    });
  }

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
  
  let leaderboard = [...results.entries()].sort(function(a, b){
    return b[1].score - a[1].score || b[1].kills - a[1].kills || (a[1].name < b[1].name ? -1 : 1);
  });
  
  for(let i=0; i<=leaderboard.length-1; i++){
    if(i>0){ 
      if(leaderboard[i][1].score == leaderboard[i-1][1].score && leaderboard[i][1].kills == leaderboard[i-1][1].kills) {
        leaderboard[i][1].placement = leaderboard[i-1][1].placement;
      }else{
        leaderboard[i][1].placement = i+1;
      }
    }else{
      leaderboard[0][1].placement = 1
    };
  }
  
  return [
    {topList: leaderboard, text: 'Leaderboard', type:'leaderboard'},
    {topList: topKills, text: 'Top 5 frags', type:'kills'},
    {topList: topAssists, text: 'Top 5 assists', type:'assists'},
    {topList: topDamage, text: 'Top 5 damage', type:'damage'}
  ];
}


function convertChar(string){
  if(string){
    string = string.replace(/æ/g, "ae");
    string = string.replace(/ø/g, "o");
    string = string.replace(/å/g, "aa");
    string = string.replace(/Æ/g, "AE");
    string = string.replace(/Ø/g, "O");
    string = string.replace(/Å/g, "AA");
  }
  return string;
}
var mongoose = require('mongoose');
var Match = require('../public/javascripts/match.js');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var https = require('https');
var zlib = require('zlib');
var request= require('request');
var SHARD = "steam";

const http = require('http');
const nconf = require('nconf');

var User = require('../models/user');
//var Telemetry = require('../models/telemetry');

nconf.argv().env().file('keys.json');

const mongoUser = nconf.get('mongoUser');
const pass = nconf.get('mongoPass');
const host = nconf.get('mongoHost');
const port = nconf.get('mongoPort');
const API_KEY = nconf.get('apiKey');
const dbname = nconf.get('mongoDbname');
const fs = require('fs');

let uri = 'mongodb://'+mongoUser+':'+pass+'@'+host+':'+port+'/'+dbname;

mongoose.connect(uri, { useNewUrlParser: true }).catch(function(err){
  if (err) throw err;
});

//mongoose.connect('mongodb://localhost/pubg');

var db = mongoose.connection;

//Tournament Schema
var TournamentSchema = mongoose.Schema({
  tournament: {
    type: String,
    index: true
  },
  username: {
    type: String
  },
  settings: {
    placementPoints: [],
    killPoints: 0,
    public: false,
    teamList: [],
    keepTeamId: false,
    eventStatus: false,
    individualKills: false
  },
  matches: {}
});

var Tournament = module.exports = mongoose.model('Tournament', TournamentSchema);

module.exports.createTournament = function(newTournament, callback){
  if (newTournament.tournament)
    newTournament.save(callback);
}

module.exports.getTournamentByUsername = function(username){
  if(username)
    return new Promise(function(resolve, reject){
      Tournament.find({username: username}).exec(function(err, doc){
        if (err) return reject(err)
        else return resolve(doc)
      });
    });
}

module.exports.getTournamentById = function(id){
  return new Promise(function(resolve, reject){
    if(id){
      Tournament.find({_id: {$in: id}}).exec(function(err, doc){
        if (err) return reject(err)
        if(doc.length>1){
          return resolve(doc)
        }else{
          return resolve(doc[0])
        }
      });
    }else{
      return resolve([]);
    }
  });
}

module.exports.getPublicTournaments = function(){
  return new Promise(function(resolve, reject){
    Tournament.find({'settings.public': true}).exec(function(err, doc){
      if (err) return reject(err)
      else return resolve(doc)
    })
  })
}

module.exports.changePublic = function(tournamentId, newPublic){
  return new Promise(function(resolve, reject){
    Tournament.updateOne({_id:tournamentId}, {$set: {'settings.public': newPublic}}).exec(function(err){
      if (err) return reject(err)
      else return resolve()
    });
  });
}

module.exports.changeEventStatus= function(tournamentId, newStatus){
  return new Promise(function(resolve, reject){
    Tournament.updateOne({_id:tournamentId}, {$set: {'settings.eventStatus': newStatus}}).exec(function(err){
      if (err) return reject(err)
      else return resolve()
    });
  });
}

module.exports.changeKeepTeamId = function(tournamentId, newValue){
  return new Promise(function(resolve, reject){
    let index;
    if(newValue){
      Tournament.getTournamentById(tournamentId).then(function(tournament){
        tournament.settings.keepTeamId = newValue;
        tournament.matches.forEach(function(m){
          m.team.forEach(function(t){
            if(!(t.teamName == '')){
              index = getIndexByProperty(tournament.settings.teamList, 'teamId', t.teamId)
              if(index = -1){
                tournament.settings.teamList.push({teamId: t.teamId, teamName: t.teamName});
              }else{
                tournament.settings.teamList[index].teamName = t.teamName;
              }
            }
          });
        });
        tournament.matches.forEach(function(m){
          m.team.forEach(function(t){
            index = getIndexByProperty(tournament.settings.teamList, 'teamId', t.teamId);
            t.teamName = tournament.settings.teamList[index].teamName;
          })
        })
        Tournament.replaceOne({_id: tournamentId}, tournament, function(err, doc){
          if(err) return reject(err);
          else return resolve();
        });
      });
    }else{
      Tournament.updateOne({_id: tournamentId}, {$set: {'settings.keepTeamId': newValue}}).exec(function(err, doc){
        if (err) return reject(err)
        else return resolve();
      });
    }
  })
}

module.exports.changeLeaderboardLevel = function(tournamentId, newValue){
  return new Promise(function(resolve, reject){
    Tournament.updateOne({_id: tournamentId}, {$set: {'settings.leaderboardLevel': newValue}}).exec(function(err){
      if (err) return reject(err)
      else return resolve();
    });
  })
}

module.exports.changePoint = function(tournamentId, index, newPoint){
  return new Promise(function(resolve, reject){
    let setter = {};
    if(index == 'killPoints'){
      Tournament.updateOne({_id: tournamentId}, {$set: {'settings.killPoints': newPoint}}).exec(function(err){
        if(err) return reject(err)
        else return resolve();
      })
    }else{
      setter['settings.placementPoints.'+index] = parseInt(newPoint);
      Tournament.updateOne({_id: tournamentId}, {$set: setter}).exec(function(err){
        if(err) return reject(err)
        else return resolve();
      })
    }
  })
}

module.exports.changeTeamName = function(tournamentId, matchId, teamIndex, newTeamName, teamId){
  return new Promise(function(resolve, reject){
    Tournament.getTournamentById(tournamentId).then(function(tournament){
      
      let setter ={};
      setter['matches.$.team.'+teamIndex+'.teamName'] = newTeamName
      Tournament.updateOne(
        {_id: tournamentId, 'matches.matchId': matchId },
        {$set: setter}
      ).exec(function(err){
        if (err) return reject(err)   
        
        if(tournament.settings.keepTeamId){
          let index;
          tournament.matches.forEach(function(match){
            index = getIndexByProperty(match.team, 'teamId', teamId);
            if(index > -1){
              match.team[index].teamName = newTeamName;
            }
          })
          
          index = getIndexByProperty(tournament.settings.teamList, 'teamId', teamId);
          if(index > -1){
            tournament.settings.teamList[index].teamName = newTeamName;
          }else{
            tournament.settings.teamList.push({teamId: teamId, teamName: newTeamName});
          }
          Tournament.replaceOne({_id: tournamentId}, tournament, function(err, doc){
            if(err) return reject(err);
            else return resolve();
          });
        }else{
          return resolve();
        }
      });
    })
  });
}

module.exports.addMatch = function(tournamentId, matchId, teamList, callback){
  if(matchId && tournamentId){
    Tournament.getTournamentById(tournamentId).then(function(tournament){
      if(tournament.settings.keepTeamId){
        teamNameList = tournament.settings.teamList;
      }else{
        teamNameList = teamList.split(';');
      }
      getMatchById(matchId, teamNameList, function(match){
        Tournament.findOne({_id:tournamentId , 'matches.matchId': matchId}).exec(function(err, doc){
          if(doc){
            callback(true);
          }else{
            Tournament.updateOne({_id:tournamentId}, {$push: {matches: match}}).exec(function(err){
              if (err) throw err
              fetchData(match.telemetry, function(res){
                //Telemetry.add(match.telemetry, function(err){
                  //if (err) return err;
                  //else callback();
                //});
                
                //fetchData(url, function(res){
                  let urlArr = match.telemetry.split('/')
                  let name = urlArr[urlArr.length-1];
                  let newUrl = 'uploads/telemetry/'+name;
                  fs.writeFile(newUrl, JSON.stringify(res), {flag:'w+'}, function(err){
                    if (err) throw err;
                    else {
                      callback();
                    }
                  });
                  
                //});
              });
            });
          }
        });
      });
    });
  }
}

module.exports.removeTourMatch = function(tourId, matchId, callback){
  if(tourId){
    if(matchId){
      Tournament.update(
          {_id: tourId}, 
          {$pull: {matches: {matchId: matchId}}}
        ).exec(function(err){
          callback(err);
        });
    }else{
      Tournament.remove(
          {_id: tourId}
        ).exec(function(err){
            callback(err);
        });
    }
  }
}

module.exports.getMatchesByPlayername = function(playername, shard, callback){
  let url = 'https://api.playbattlegrounds.com/shards/'+shard+'/players?filter[playerNames]='+playername;
  fetchData(url, function(res){
    callback(res);
  });
}

function getMatchById(matchId, teamNameList, callback){
  let url= 'https://api.playbattlegrounds.com/shards/'+SHARD+'/matches/'+matchId;
  fetchData(url, function(res){
    let match = new Match(res, teamNameList);
    callback(match.pullMatch);
  });
}

function fetchData(url, callback){
  let options = {
    url: url,
    headers: {
      'Authorization': API_KEY,
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate'
    },
    encoding: null
  };
  
  request.get(options, function(err, res, body){
    if(!err && res.statusCode == 200){
      let encoding = res.headers['content-encoding']
      if(encoding && encoding.indexOf('gzip')>=0){
        zlib.gunzip(body, function(err, dezipped){
          let json_string = dezipped.toString('utf-8');
          let json = JSON.parse(json_string);
          callback(json);
        });
      }
    }
  }); 
}

function getIndexByProperty(data, key, value) {
  for (var i = 0; i < data.length; i++) {
    if (data[i][key] == value) {
      return i;
    }
  }
  return -1;
}

'use strict';
const Gamer_Division = require('./gamer_division.js');
const Gamer_Round = require('./gamer_round.js');
const Gamer_Match = require('./gamer_match.js');
const Gamer_Player = require('./gamer_player.js');
const Gamer_Team_2 = require('./gamer_team_2.js');
const nconf = require('nconf');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
nconf.argv().env().file('keys.json');
const gamerApiKey = nconf.get('gamerAPIKey');

module.exports = class Gamer_Tournament{
  constructor(data){
    this.data_ = '';
    this.name_ = '';
    this.divisions_ = new Map();
    this.rounds_ = [];
    this.players_ = new Map();
    this.teams_ = new Map();
  }

  init(data, callback){
    var that = this;
    this.data_ = data;
    this.name_ = data.name;
    //var flag = true;
    let promise = [];
    data.divisions.forEach(function(division,idx,array){
      this.divisions_.set(division.name, new Gamer_Division(division));

      let url = 'https://www.gamer.no/api/v1/tournaments/'+division.id+'/rounds';
      var that = this;
      promise.push(new Promise(function(resolve, reject){
        let prom = [];
        that.fetchDataGamer(url, function(res){
            res.response.forEach(function(round){
              let r = new Gamer_Round(round);
              that.rounds_.push(r);
              that.divisions_.get(division.name).addRound(r);
              let url = 'https://www.gamer.no/api/v1/rounds/'+r.id;
              prom.push(new Promise(function(reso, reje){
                that.fetchDataGamer(url, function(res){
                  r.addResults(res.response.results);
                  if(res.response.maps){
                    res.response.maps.forEach(function(match){
                      /*if(flag){
                        console.log(match);
                        flag = false;
                      }*/
                      if(match.finishTime){
                        let m = new Gamer_Match(match);
                        r.addMatch(m);
                        m.addStats(match.stats);
                        /*if(flag){
                          console.log(m);
                          flag = false;
                        }*/
                        if(match.stats){
                          match.stats.forEach(function(player){
                            let p = new Gamer_Player(player);
                            if (!that.players_.has(p.pubgName)) that.players_.set(p.pubgName, p);
                            that.players_.get(p.pubgName).addMatch(player);
                          });
                        }
                      }
                    });
                    reso();
                  }else{
                    reso();
                  }
                });
              }))
            });
            Promise.all(prom).then(function(){
              resolve();
            })
          });
      }));
    }, this);

    Promise.all(promise).then(function(){
      callback();
    })
  }

  printPlayerList(parent){

    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');

    let r = thead.insertRow();
    let c = r.insertCell();
    c.innerText = 'Player'

    c = r.insertCell();
    c.innerText = 'Kills';

    c = r.insertCell();
    c.innerText = 'Deaths';

    c = r.insertCell();
    c.innerText = 'KD ratio';

    this.players_.forEach(function(player){
      r = tbody.insertRow();
      c = r.insertCell();
      c.innerText = player.pubgName;

      c = r.insertCell();
      c.innerText = player.kills;

      c = r.insertCell();
      c.innerText = player.deaths;

      c = r.insertCell();
      c.innerText = Math.round(player.kills / player.deaths*100)/100;
    })
    
    table.appendChild(thead);
    table.appendChild(tbody);
    parent.appendChild(table);
  }
  
  fetchDataGamer(url, callback) {
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
}

//===========================================================================================


module.exports = class GamerTournament{
  constructor(){
    this.divisions_ = new Map();
    this.lateJoins_ = [];
    this.date_ = '';
  }
  
  init(data, date, callback){
    var that = this;
    this.date_ = new Date(date);
    let p = [];
    data.forEach(function(d){
      if(!(d.tournament.name == "")){
        if(!this.divisions_.has(d.tournament.name)) {
          let division = new Gamer_Division(d.tournament);
          this.divisions_.set(d.tournament.name, division);
        }
        let t = this.divisions_.get(d.tournament.name).addTeam(d.participant);

        let p1 = new Promise(function(resolve, reject){
          let url = 'https://www.gamer.no/api/v1/teams/' + t.id + '/players';
          that.fetchDataGamer(url, function(res){
            let players = Object.values(res.response);
            players.forEach(function(player){
              t.addPlayer(player);
            });
            
            return resolve(t);
          });
        });
        p.push(p1);
      }
    }, this);

    Promise.all(p).then(function(res){
      that.divisions_.forEach(function(division){
        division.teams.forEach(function(t){
          t.players.forEach(function(p){
            if(new Date(p.joinDate) > that.date_){
              that.lateJoins_.push({
                division: division.name,
                team: t.name,
                player: p
              });
            }
          }, that);
        }, that);
      }, that);
      callback();
    });
  }

  check24HourRule(){
    let lateJoins = [];
    this.divisions_.forEach(function(division){
      division.teams.forEach(function(t){
        t.players.forEach(function(p){
          if(new Date(p.joinDate) > this.date_){
            this.lateJoins_.push({
              division: division.name,
              team: t.name,
              player: p
            });
          }
        }, this);
      }, this);
    }, this);
    
    //console.log(this.lateJoins_)
    //this.lateJoins_ = lateJoins;

    /*let div = document.createElement('div');
    div.className = 'container';
    let table = document.createElement('table')
    table.classList.add('table')
    let th = table.createTHead()
    let r = th.insertRow();
    let c = r.insertCell();
    c.innerText = 'Divisjon';
    
    c = r.insertCell();
    c.innerText = 'Spiller';

    c = r.insertCell();
    c.innerText = 'Lag';

    c = r.insertCell();
    c.innerText = 'Innmeldt';

    let tb = document.createElement('tbody');
    lateJoins.forEach(function(res){
      r =  tb.insertRow();
      c = r.insertCell()
      c.innerText = res.division;
      
      c = r.insertCell()
      c.innerText = res.player.pubgName;
      
      c = r.insertCell()
      c.innerText = res.team;
      
      c = r.insertCell()
      c.innerText = res.player.joinDate;
    })
    
    table.appendChild(tb);
    div.appendChild(table);*/
    //result.innerHTML = '';
    //result.appendChild(div);
    
  }
  
  
  writeTeamList(result){
    let str = document.createElement('div');
    let s = '';
    str.setAttribute('style', 'white-space: pre-line;')
    let d = ';';
    this.divisions_.forEach(function(div){
      div.teams.forEach(function(team){
        team.players.forEach(function(player){
          s = s + team.id +d+ team.name +d+ player.id +d+ player.gamerName +d+ player.pubgName +'\r\n';
        });
      });
    });
    str.innerText = s;
    result.appendChild(str);
  }
  
  fetchDataGamer(url, callback) {
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
  
  get lateJoins(){
    return this.lateJoins_;
  }
}





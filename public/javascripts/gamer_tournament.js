'use strict';
const Gamer_Division = require('./gamer_division.js');
const Gamer_Round = require('./gamer_round.js');
const Gamer_Match = require('./gamer_match.js');
const Gamer_Player = require('./gamer_player.js');
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






'use strict';

const Gamer_Team_2 = require('./gamer_team_2.js');
module.exports = class Gamer_Division{
  constructor(data){
    this.data_ = data;
    this.rounds_ = [];
    this.stats_ = [];
    this.name_ = data.name;
    this.id_ = data.id;
    this.teams_ = [];
  }
  
  get id(){
    return this.id_;
  }

  get teams(){
    return this.teams_;
  }

  get name(){
    return this.name_;
  }

  get rounds(){
    return this.rounds_;
  }

  addRound(round){
    this.rounds_.push(round);
  }

  addStats(stats){
    this.stats_.push(stats);
  }

  /*addRounds(){
    let url = 'https://www.gamer.no/api/v1/tournaments/'+this.id+'/rounds';
    var that = this;
    fetchDataGamer(url, function(res){
      res.response.forEach(function(round){
        that.rounds_.push(new Round(round));
      });
    });
  }*/
  
  addTeam(team){
    let newTeam = new Gamer_Team_2(team);
    this.teams_.push(newTeam);
    return newTeam;
  }
}
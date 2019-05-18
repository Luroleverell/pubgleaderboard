'use strict';
module.exports = class Gamer_Match{
  constructor(data){
    this.data_ = data;
    this.matchNumber_ = data.mapNumber;
    this.teams_ = new Map();
    this.stats_ = [];

    if(!data.finishTime == null){
      data.results.forEach(function(team){
        this.teams_.set(team.signup.name, new Gamer_Team(team));
      }, this);

      data.stats.forEach(function(player){
        this.teams_.get(player.team_name).addPlayer(player);
      }, this);
    }
  }

  get teams(){
    return this.teams_;
  }

  get matchNumber(){
    return this.matchNumber_;
  }

  addStats(stats){
    this.stats_ = stats; 
  }
}
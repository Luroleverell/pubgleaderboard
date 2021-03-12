
const Gamer_Player = require('./gamer_player.js');
module.exports = class Gamer_Team_2{
  constructor(data){
    this.name_ = data.name;
    this.id_ = data.teamId;
    this.players_ = new Map();
    this.matches_ = [];
    this.kills_ = 0;
    this.deaths_ = 0;
    this.kd_ = 0;
  }

  get id(){
    return this.id_;
  }

  get name(){
    return this.name_;
  }

  get players(){
    return this.players_;
  }

  addPlayer(player){
    if (!this.players_.has(player.pubgAccountName)) this.players_.set(player.pubgAccountName, new Gamer_Player(player));    
  }

  addMatch(match){
    this.matches_.push(match)
  }
}
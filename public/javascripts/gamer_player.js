'use strict';
module.exports = class Gamer_Player{
  constructor(data){
    this.data_ = data;
    this.gamerName_ = data.user_name || data.name;
    this.teamName_ = data.team_name || '';
    this.pubgName_ = data.pubg_account_name || data.pubgAccountName;
    this.joinDate_ = data.joinDate || '';
    this.matches_ = [];
    this.kills_ = 0;
    this.deaths_ = 0;
  }

  get gamerName(){
    return this.gamerName_;
  }

  get pubgName(){
    return this.pubgName_;
  }

  get teamName(){
    return this.teamName_;
  }

  get id(){
    return this.id_;
  }

  get joinDate(){
    return this.joinDate_;
  }

  get matches(){
    return this.matches_;
  }

  get kills(){
    return this.kills_;
  }

  get deaths(){
    return this.deaths_;
  }

  addMatch(matchStats){
    this.matches_.push(matchStats);

    this.kills_ += parseInt(matchStats.kills, 10);
    this.deaths_ += parseInt(matchStats.deaths, 10);
  }
}
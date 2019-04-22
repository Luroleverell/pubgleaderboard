class Team{
  constructor(team){
    this.teamId_ = team.teamId;
    this.teamName_ = team.teamName || this.teamId_;
    this.matches_ = [];
    this.killPoints_ = 0;
    this.rankPoints_ = 0;
    this.teamPoints_ = 0;
    this.teamKills_ = 0;
    this.players_ = new Map();
  }
  
  addMatch(match, team, rankScore, killScore){
    console.log(team.teamKillPoints);
    this.matches_.push(match);
    this.teamKills_ += team.teamKills;
    this.killPoints_ += team.teamKills * killScore;
    this.rankPoints_ += rankScore[team.rank - 1] || 0;
    this.teamPoints_ = this.killPoints_ + this.rankPoints_;
  }
  
  addPlayer(player){
    if(!this.players_.has(player.playerName)) this.players_.set(player.playerName, player);
  }
  
  get teamPoints(){
    return this.teamPoints_;
  }
  
  get killPoints(){
    return this.killPoints_;
  }
  
  get rankPoints(){
    return this.rankPoints_;
  }
  
  get teamKills(){
    return this.teamKills_;
  }
  
  get teamName(){
    return this.teamName_;
  }
  
  get teamId(){
    return this.teamId_;
  }
  
  get players(){
    return this.players_;
  }
}
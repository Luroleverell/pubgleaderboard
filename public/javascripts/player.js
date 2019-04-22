class Player{
  constructor(player){
    this.playerId_ = player.playerId;
    this.playerName_ = player.playerName;
    this.teams_ = [];
    this.kills_ = 0;
    this.deaths_ = 0; 
    this.rankPoints_ = 0;
    this.killPoints_ = 0;
    this.points_ = 0;
  }
  
  addMatch(match, team, rankScore, killScore){
    let newTeam = team;
    newTeam.mapName = match.mapName;
    newTeam.matchDate = match.matchDate;
    newTeam.matchId = match.matchId;
    
    this.teams_.push(newTeam);
    this.killPoints_ += team.teamKills * killScore;
    this.rankPoints_ += rankScore[team.rank] || 0;
    this.points_ = this.killPoints_ + this.rankPoints_;
    
    team.players.forEach(function(p){
      if(this.playerId_ == p.playerId){
        this.kills_ += p.kills;
        this.deaths_ += p.death;
      }
    }, this);
  }
  
  get playerName(){
    return this.playerName_;
  }
  
  get points(){
    return this.points_;
  }
  
  get killPoints(){
    return this.killPoints_;
  }
  
  get rankPoints(){
    return this.rankPoints_;
  }
  
  get kills(){
    return this.kills_;
  }
  
  get deaths(){
    return this.deaths_;
  }
  
  get teams(){
    return this.teams_;
  }
}
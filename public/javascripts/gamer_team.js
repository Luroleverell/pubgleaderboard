class Gamer_Team{
  constructor(data){
    this.name_ = data.signup.name;
    this.id_ = data.signup.teamId;
    this.players_ = [];
    this.matches_ = [];
    this.teamLogo = '';
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
    this.players_.push(player);
  }

  addMatch(division, round, match){
    match.results.forEach()
    this.matches_.push({division: division.name, round:round.roundNumber, map:match.resource.name, match})
  }
}
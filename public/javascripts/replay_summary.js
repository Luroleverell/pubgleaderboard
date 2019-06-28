class Summary{
  constructor(playerId){
    this.playerId_ = playerId;
    this.teams_ = [];
  }

  addMatch(match){
    let matchInfo = new MatchInfo(match, this.playerId_);
    
    if(this.teams_.length==0){
      this.teams_.push({team: matchInfo.team});
    }else{
      this.teams_.forEach(function(t){
        let checkArray = [];
        t.team.forEach(function(p){
          matchInfo.team.forEach(function(thisTeamPlayer){
            if(thisTeamPlayer.playerName==p.playerName){
              checkArray.push(true);
            }
          });
        });
        let j=0;
        checkArray.forEach(function(check){
          if(check) j+=1;
        });
        if(j == t.length) console.log(t);
      });
    }
  }
}
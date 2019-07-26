class MatchInfo{
  constructor(match, playerId){
    this.lastPlace_ = 0;
    this.roster_ = [];
    this.team_ = [];
    this.rank_ = 0
    this.attributes = match.data.attributes;
    
    //console.log(match)
    
    match.included.some(function(item){
      if(item.type == 'participant'){
        if(item.attributes.stats.playerId == playerId) {
          this.id_ = item.id;
          this.rank_ = item.attributes.stats.winPlace;
          return true;
        }
      }
    }, this);

    match.included.some(function(item){
      if(item.type == 'roster'){
        item.relationships.participants.data.forEach(function(p){
          if(p.id == this.id_){
            item.relationships.participants.data.forEach(function(participant){
              this.roster_.push(participant);
            }, this);
            return true;
          }
        }, this);
      }
    }, this);

    match.included.forEach(function(item){
      if(item.type == 'participant'){
        this.lastPlace_ = Math.max(this.lastPlace_, item.attributes.stats.winPlace);
        this.roster_.forEach(function(teamMember){
          if(item.id == teamMember.id){
            this.team_.push({
                playerId: item.id,
                playerName: item.attributes.stats.name,
                kills: item.attributes.stats.kills,
                damage: Math.round(item.attributes.stats.damageDealt * 100) / 100,
              });
          } 
        }, this);
      }
    }, this);
  }

  get team(){
    return this.team_;
  }

  get rank(){
    return this.rank_;
  }
  
  get playerCount(){
    return this.lastPlace_;
  }
}
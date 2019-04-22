'use strict';
module.exports = class Match {
  constructor(match, teamList) {
    this.teamList_ = teamList;
    this.teamByRank_ = new Map();
    this.playerById_ = new Map();
    this.match_ = [];
    this.team_ = [];
    
    match.included.forEach(function(t){
      if(t['type'] == 'participant'){
          let newPlayer = {
            id: t.id,
            playerId: t.attributes.stats.playerId,
            playerName: t.attributes.stats.name,
            kills: t.attributes.stats.kills,
            death: (t.attributes.stats.deathType == 'alive' ? 0 : 1)
          }
          if(!this.playerById_.has(t.id)) this.playerById_.set(t.id, newPlayer);
      }
    }, this);

    match.included.forEach(function(t){
      if(t['type'] == 'roster'){
        let teamPlayers = [];
        let kills = 0;

        t.relationships.participants.data.forEach(function(p){
          let player = this.playerById_.get(p.id);
          teamPlayers.push(player);
          kills = kills + player.kills;
        }, this);
        
        let teamName = '';
        this.teamList_.forEach(function(team){
          if (t.attributes.stats.teamId == team.teamId){
            teamName = team.teamName;
          }
        }, this);

        let newTeam = {
          teamId: t.attributes.stats.teamId,
          teamName: teamName,
          teamKills: kills,
          rank: t.attributes.stats.rank,
          players: teamPlayers
        }
        
        this.team_.push(newTeam);
      }
      if(t['type'] == 'asset'){
        this.telemetry_ = t.attributes['URL'];
      }
    }, this);
    
    this.team_.sort(function(a,b){return a.rank-b.rank});
    
    this.match_ = {
      matchId: match.data.id,
      mapName: match.data.attributes.mapName,
      matchDate: match.data.attributes.createdAt,
      telemetry: this.telemetry_,
      team: this.team_
    }

  }

  get pullMatch(){
    return this.match_;
  }
}
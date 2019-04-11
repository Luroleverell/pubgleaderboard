'use strict';

class Tournament {
  constructor(tournament, username){
    this.matches_ = [];
    this.teams_ = [];
    this.players_ = new Map();
    this.playerList_ = [];
    this.tournamentId = tournament._id;
    
    this.isAdmin = (tournament.username == username);

    tournament.matches.forEach(function(m){
      m.team.forEach(function(t){
        
        t.teamKillPoints = t.teamKills * tournament.settings.killPoints;
        t.teamRankPoints = tournament.settings.placementPoints[t.rank];
        t.teamPoints = t.teamKillPoints + t.teamRankPoints;
        
        let t2 = {};
        t2.rank = t.rank;
        t2.teamKillPoints = t.teamKillPoints;
        t2.teamRankPoints = t.teamRankPoints;
        t2.teamPoints = t.teamPoints;
        t2.teamKills = t.teamKills;
        t2.teamName = t.teamName;
        t2.teamId = t.teamId;
        t2.players = [];
        
        let teamIndex = this.teams_.findIndex(function(element){
          return t.teamName == element.teamName;
        });
        
        let team = {};
        if(teamIndex == -1){
          this.teams_.push(t2);
          team = t2;
        }else{
          team = this.teams_[teamIndex];
          team.teamKillPoints += t2.teamKillPoints;
          team.teamRankPoints += t2.teamRankPoints;
          team.teamPoints += t2.teamPoints;
          team.teamKills += t2.teamKills;
        }
          
        /*if(!this.teams_.has(t.teamName)) this.teams_.set(t.teamName, t2);
        let team = this.teams_.get(t2.teamName);*/
        
        t.players.forEach(function(p){
          let playerIndex = team.players.findIndex(function(element){
            return p.playerName == element.playerName;
          })
          
          if(!this.players_.has(p.playerId)) this.players_.set(p.playerId,{
            playerName:p.playerName,
            playerKills:0, 
            playerDeaths:0, 
            playerKillPoints:0, 
            playerTeamRankPoints:0, 
            playerTeamKillPoints:0, 
            playerTeamPoints:0})
          this.players_.get(p.playerId).playerKills += p.kills;
          this.players_.get(p.playerId).playerDeaths += p.death;
          this.players_.get(p.playerId).playerKillPoints += p.kills * tournament.settings.killPoints;
          this.players_.get(p.playerId).playerTeamKillPoints += t2.teamKillPoints;
          this.players_.get(p.playerId).playerTeamRankPoints += t2.teamRankPoints;
          this.players_.get(p.playerId).playerTeamPoints += t2.teamKillPoints + t2.teamRankPoints;
        
        
          let p2 = {};
          p2.death = p.death;
          p2.kills = p.kills;
          p2.playerId = p.playerId;
          p2.playerName = p.playerName;
          
          if(playerIndex == -1) team.players.push(p2);
          else{
            team.players[playerIndex].kills += p2.kills;
            team.players[playerIndex].death += p2.death;
          }
        }, this)
      }, this)
      this.matches_.push(m);
    }, this)
    
    console.log(this.matches_);
    console.log(this.players_);
    
    this.teams_.sort(function(a,b){
      return b.teamPoints-a.teamPoints;
    });
    
    this.matches_.forEach(function(match){
      match.team.sort(function(a,b){
        return b.teamPoints - a.teamPoints;
      })
    })
    
    this.matches_.sort(function(a,b){
      return new Date(a.matchDate) - new Date(b.matchDate);
    })
  }
  
  get getTeams(){
    let thTeam = ['Rank', 'Team', 'Total kills', 'Killpoints', 'Rankpoints', 'Total points', ''];
    let thPlayer = ['', 'Playername', 'Kills', 'Deaths'];
    let t, h, r, c, t2, h2, r2, c2, t3, h3, r3, c3;
    t = document.createElement('table');
    t.classList.add('table');
    
    h = t.createTHead();
    
    r = h.insertRow();
    r.className = 'thead-gold';
    
    for(let i=0 ; i<=thTeam.length-1 ; i++){
      c = document.createElement('th');
      if(i != 1) c.className = 'text-center';
      c.innerHTML = thTeam[i];
      r.appendChild(c);
    }
    
    let tb = document.createElement('tbody');
    t.appendChild(tb);
    
    this.teams_.forEach(function(team, j){
      r = tb.insertRow();
      r.classList.add('hand', 'clickable');
      r.setAttribute('data-toggle', 'collapse');
      r.setAttribute('data-role', 'expander');
      r.setAttribute('data-target', '.row'+team.teamId);
      r.setAttribute('id', 'row'+team.teamId);
      
      c = r.insertCell();
      c.className = 'text-center';
      c.innerHTML = j+1;
      
      c = r.insertCell();
      c.innerHTML = team.teamName;
      
      c = r.insertCell();
      c.className = 'text-center';
      c.innerHTML = team.teamKills;
      
      c = r.insertCell();
      c.className = 'text-center';
      c.innerHTML = team.teamKillPoints;
      
      c = r.insertCell();
      c.className = 'text-center';
      c.innerHTML = team.teamRankPoints;
      
      c = r.insertCell();
      c.className = 'text-center';
      c.innerHTML = team.teamPoints;
      
      c = r.insertCell();
      c.className = 'text-right';
      let b = document.createElement('button');
      b.classList.add('btn', 'btn-info');
      b.setAttribute('title', 'Show team');
      b.addEventListener('click', function(e){
        let ic = e.target;
        if(ic.classList.contains('btn')){
          ic = ic.childNodes[0];
        }
        
        if(ic.classList.contains('oi-zoom-in')){
          ic.classList.add('oi-zoom-out');
          ic.classList.remove('oi-zoom-in');
        }else{
          ic.classList.add('oi-zoom-in');
          ic.classList.remove('oi-zoom-out');
        }
      })
      let icon = document.createElement('span');
      icon.classList.add('oi', 'oi-zoom-in');
      b.appendChild(icon);
      c.appendChild(b);
      
      r = t.insertRow();
      c = r.insertCell();
      c.setAttribute('colspan', '7');
      c.setAttribute('style', 'padding-top:0;padding-bottom:0;');
      
      let div = document.createElement('div');
      div.classList.add('collapse', 'container', 'row'+team.teamId);
      
        t2 = document.createElement('table');
        t2.className = 'table';
        
        h2 = t2.createTHead();
        
        r2 = h2.insertRow();
        r2.className = 'thead-gold';
        
        for(let i=0; i<=thPlayer.length - 1 ; i++){
          c2 = document.createElement('th');
          if(i != 1) c2.className = 'text-center';
          c2.innerHTML = thPlayer[i];
          r2.appendChild(c2);
        }
        
        let tb2 = document.createElement('tbody');
        t2.appendChild(tb2);
        
        team.players.forEach(function(player){
          
          r2 = tb2.insertRow();
          c2 = r2.insertCell();
          
          c2 = r2.insertCell();
          c2.innerHTML = player.playerName;
          
          c2 = r2.insertCell();
          c2.className = 'text-center';
          c2.innerHTML = player.kills;
          
          c2 = r2.insertCell();
          c2.className = 'text-center';
          c2.innerHTML = player.death;
        });
      
      div.appendChild(t2);
      c.appendChild(div);
    });

    return t;
  }

  get getPlayers(){
    let thPlayer = ['Rank', 'Player', 'Killpoints', 'Rankpoints', 'Total points', ''];
    let thMatch = ['', 'Map', 'Kills','Team kills', 'Rank', 'Deaths'];
    let t, h, r, c, t2, h2, r2, c2, t3, h3, r3, c3;
    
    t = document.createElement('table');
    t.classList.add('table');
    h = t.createTHead();
    r = h.insertRow();
    r.className = 'thead-gold';
    
    for(let i=0 ; i<=thPlayer.length-1 ; i++){
      c = document.createElement('th');
      if(i != 1) c.className = 'text-center';
      c.innerHTML = thPlayer[i];
      r.appendChild(c);
    }
    
    let tb = document.createElement('tbody');
    t.appendChild(tb);
    
    this.playerList_ = Array.from(this.players_).sort(function(a,b){
      return b[1].playerTeamPoints - a[1].playerTeamPoints;
    })
    console.log(this.playerList_)
    
    this.playerList_.forEach(function(player, j){
      r = tb.insertRow();
      r.classList.add('hand', 'clickable');
      r.setAttribute('data-toggle', 'collapse');
      r.setAttribute('data-role', 'expander');
      r.setAttribute('data-target', '.row' + player[0].replace('.',''));
      r.setAttribute('id', 'row' + player[0].replace('.',''));
      
      c = r.insertCell();
      c.className = 'text-center';
      c.innerHTML = j+1;
      
      c = r.insertCell();
      c.innerHTML = player[1].playerName;
      
      c = r.insertCell();
      c.className = 'text-center';
      c.innerHTML = player[1].playerTeamKillPoints;
      
      c = r.insertCell();
      c.className = 'text-center';
      c.innerHTML = player[1].playerTeamRankPoints;
      
      c = r.insertCell();
      c.className = 'text-center';
      c.innerHTML = player[1].playerTeamPoints;
      
      r = t.insertRow();
      c = r.insertCell();
      c.setAttribute('colspan', '7');
      c.setAttribute('style', 'padding-top:0;padding-bottom:0;');
      
      let div = document.createElement('div');
      div.classList.add('collapse', 'container', 'row'+player[0].replace('.',''));
      
        t2 = document.createElement('table');
        t2.className = 'table';
        
        h2 = t2.createTHead();
        
        r2 = h2.insertRow();
        r2.className = 'thead-gold';
        
        for(let i=0; i<=thMatch.length - 1 ; i++){
          c2 = document.createElement('th');
          if(i != 1) c2.className = 'text-center';
          c2.innerHTML = thMatch[i];
          r2.appendChild(c2);
        }
        
        let tb2 = document.createElement('tbody');
        t2.appendChild(tb2);
        
        
        
        div.appendChild(t2);
        c.appendChild(div);
    });

    return t;
  }
  
  get getMatches(){
    let thMatch = ['Time', 'Map', ''];
    let thTeam = ['Rank', 'Team', 'Placement', 'Player', 'Kills', 'Points'];
    let t, h, r, c, t2, h2, r2, c2, t3, h3, r3, c3;
    
    t3 = document.createElement('table');
    t3.className = 'table';
    
    h3 = t3.createTHead();
    
    r3 = h3.insertRow();
    r3.className = 'thead-gold';
    
    for(let i=0 ; i<=thMatch.length-1 ; i++){
      c3 = document.createElement('th');
      c3.innerHTML = thMatch[i];
      r3.appendChild(c3);
    }
    
    let tb = document.createElement('tbody');
    t3.appendChild(tb);
    
    this.matches_.forEach(function(m){
      r = tb.insertRow();
      
      c = r.insertCell();
      c.innerHTML = m.matchDate;
      
      c = r.insertCell();
      c.innerHTML = m.mapName;
      
      c = r.insertCell();
      c.className = 'text-right';
      c.innerHTML = '';
      
      let form = document.createElement('form');
      form.setAttribute('method', 'post');
      form.setAttribute('action', '/tournaments/remove/'+this.tournamentId+'/'+m.matchId);
      form.setAttribute('enctype', 'multipart/form-data');
      
      let div = document.createElement('div');
      div.className = 'btn-group';
      
      let but = document.createElement('button');
      but.classList.add('btn', 'btn-info');
      but.setAttribute('type', 'button');
      but.setAttribute('data-toggle', 'collapse');
      but.setAttribute('data-role', 'expander');
      but.setAttribute('data-target', '.map'+m.matchId);
      let icon = document.createElement('span');
      icon.classList.add('oi', 'oi-media-play');
      but.appendChild(icon);
      div.appendChild(but);
      
      but = document.createElement('button');
      but.classList.add('btn', 'btn-info');
      but.setAttribute('type', 'button');
      but.setAttribute('data-toggle', 'collapse');
      but.setAttribute('data-role', 'expander');
      but.setAttribute('data-target', '.row'+m.matchId);
      //but.innerHTML = 'More info';
      icon = document.createElement('span');
      icon.classList.add('oi', 'oi-menu');
      but.appendChild(icon);
      div.appendChild(but);
      
      but = document.createElement('button');
      but.classList.add('btn', 'btn-danger');
      but.setAttribute('type', 'submit');
      but.setAttribute('name', 'submit');
      but.setAttribute('value', 'submit');
      icon = document.createElement('span');
      icon.classList.add('oi', 'oi-trash');
      but.appendChild(icon);
      
      if(this.isAdmin) div.appendChild(but);
      form.appendChild(div);
      
      c.appendChild(form);
      
      r = tb.insertRow();
      c = r.insertCell();
      c.setAttribute('colspan', '7');
      c.setAttribute('style', 'padding-top:0;padding-bottom:0;');
      
      let divMap = document.createElement('div');
      divMap.classList.add('collapse', 'container', 'map'+m.matchId);
      
      c.appendChild(divMap);
      
      r = tb.insertRow();
      c = r.insertCell();
      c.setAttribute('colspan', '7');
      c.setAttribute('style', 'padding-top:0;padding-bottom:0;');
      
      div = document.createElement('div');
      div.classList.add('collapse', 'container', 'row'+m.matchId);
      
      t2 = document.createElement('table');
      t2.className = 'table';
      
      h2 = t2.createTHead();
      r2 = h2.insertRow();
      r2.className = 'thead-gold';
      
      for(let i=0 ; i<=thTeam.length-1 ; i++){
        c2 = document.createElement('th');
        c2.innerHTML = thTeam[i];
        r2.appendChild(c2);
      }
      
      let tb2 = document.createElement('tbody');
      t2.appendChild(tb2);
      
      m.team.forEach(function(t, j){
        r2 = tb2.insertRow();
        c2 = r2.insertCell();
        c2.innerHTML = j+1;
        
        c2 = r2.insertCell();
        if(this.isAdmin){
          let tn = document.createElement('input');
          tn.className = 'form-control';
          tn.setAttribute('name','teamName');
          tn.setAttribute('type','text');
          tn.setAttribute('value',t.teamName);
          tn.setAttribute('teamIndex',j);
          tn.setAttribute('matchId', m.matchId);
          tn.setAttribute('teamId', t.teamId);
          tn.setAttribute('tournamentId',this.tournamentId);
          c2.appendChild(tn);
        }else{
          c2.innerHTML = t.teamName;
        }
        
        c2 = r2.insertCell();
        c2.innerHTML = t.rank;
        
        c2 = r2.insertCell();
        t.players.forEach(function(p){
          let div2 = document.createElement('div');
          div2.innerHTML = p.playerName;
          c2.appendChild(div2);
        })
        
        c2 = r2.insertCell();
        t.players.forEach(function(p){
          let div2 = document.createElement('div');
          div2.innerHTML = p.kills;
          c2.appendChild(div2);
        })
        
        c2 = r2.insertCell();
        c2.innerHTML = t.teamPoints;
      }, this)
      
      div.appendChild(t2);
      c.appendChild(div);
    }, this)
    
    return t3;
  }
}
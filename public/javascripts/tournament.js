'use strict';

class Tournament {
  constructor(tournament, username){
    this.matches_ = [];
    this.teams_ = new Map();
    this.players_ = new Map();
    this.tournamentId = tournament._id;
    this.isAdmin = (tournament.username == username);

    let settingsRankScoreTable = tournament.settings.placementPoints;
    let settingsKillScore = tournament.settings.killPoints;

    console.log(tournament);
    tournament.matches.forEach(function(m){
      m.team.forEach(function(t){
        let teamName = t.teamName || t.teamId;
        if(!this.teams_.has(teamName)) this.teams_.set(teamName, new Team(t))
        this.teams_.get(teamName).addMatch(m,t,settingsRankScoreTable,settingsKillScore);
        t.teamPoints = t.teamKills * settingsKillScore + settingsRankScoreTable[t.rank];
        
        t.players.forEach(function(p){  
          let newPlayer = new Player(p)
          if(!this.players_.has(p.playerId)) this.players_.set(p.playerId, newPlayer)
          this.players_.get(p.playerId).addMatch(m,t,settingsRankScoreTable,settingsKillScore);
          this.teams_.get(teamName).addPlayer(newPlayer);
        }, this)
      }, this)
      
      let newMatch = {
        mapName: m.mapName, 
        matchDate: m.matchDate,
        matchId: m.matchId,
        teams: m.team
        };
      this.matches_.push(newMatch);
    }, this)
    
    console.log(this.matches_);
    console.log(this.teams_);
    console.log(this.players_);
    
    
    this.matches_.forEach(function(match){
      match.teams.sort(function(a,b){
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
    
    let j = 0;
    teamList.forEach(function(team){
      j += 1;
      r = tb.insertRow();
      r.classList.add('hand', 'clickable');
      r.setAttribute('data-toggle', 'collapse');
      r.setAttribute('data-role', 'expander');
      r.setAttribute('data-target', '.row'+team[1].teamId);
      r.setAttribute('id', 'row'+team[1].teamId);
      
      c = r.insertCell();
      c.className = 'text-center';
      c.innerHTML = j;
      
      c = r.insertCell();
      c.innerHTML = team[1].teamName;
      
      c = r.insertCell();
      c.className = 'text-center';
      c.innerHTML = team[1].teamKills;
      
      c = r.insertCell();
      c.className = 'text-center';
      c.innerHTML = team[1].killPoints;
      
      c = r.insertCell();
      c.className = 'text-center';
      c.innerHTML = team[1].rankPoints;
      
      c = r.insertCell();
      c.className = 'text-center';
      c.innerHTML = team[1].teamPoints;
      
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
      div.classList.add('collapse', 'container', 'row'+team[1].teamId);
      
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
        
        team[1].players.forEach(function(player){
          
          r2 = tb2.insertRow();
          c2 = r2.insertCell();
          
          c2 = r2.insertCell();
          c2.innerHTML = player.playerName;
          
          c2 = r2.insertCell();
          c2.className = 'text-center';
          c2.innerHTML = player.kills;
          
          c2 = r2.insertCell();
          c2.className = 'text-center';
          c2.innerHTML = player.deaths;
        });
      
      div.appendChild(t2);
      c.appendChild(div);
    });

    return t;
  }

  get getPlayers(){
    let thPlayer = ['Rank', 'Player', 'Killpoints', 'Rankpoints', 'Total points', ''];
    let thMatch = ['', 'Map', 'Team players','Kills', 'Match placement','',''];
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
    
    let playerList = Array.from(this.players_).sort(function(a,b){
      return b[1].points - a[1].points;
    })
    
    playerList.forEach(function(player, j){
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
      c.innerHTML = player[1].killPoints;
      
      c = r.insertCell();
      c.className = 'text-center';
      c.innerHTML = player[1].rankPoints;
      
      c = r.insertCell();
      c.className = 'text-center';
      c.innerHTML = player[1].points;
      
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
          if(i != 1 && i != 2) c2.className = 'text-center';
          c2.innerHTML = thMatch[i];
          r2.appendChild(c2);
        }
        
        let tb2 = document.createElement('tbody');
        t2.appendChild(tb2);
        
        let sortedTeams = player[1].teams.sort(function(a,b){
          return new Date(a.matchDate) - new Date(b.matchDate);
        });
        
        sortedTeams.forEach(function(team){
          let div2;
          
          r2 = tb2.insertRow();
          c2 = r2.insertCell();
          
          c2 = r2.insertCell();
          div2 = document.createElement('div');
          div2.innerHTML = team.mapName;
          c2.appendChild(div2);
          div2 = document.createElement('div');
          div2.innerHTML = team.matchDate;
          c2.appendChild(div2);
          
          c2 = r2.insertCell();
          team.players.forEach(function(p){
            div2 = document.createElement('div');
            div2.innerHTML = p.playerName;
            c2.appendChild(div2);
          });
          
          c2 = r2.insertCell();
          c2.className = 'text-center';
          team.players.forEach(function(p){
            div2 = document.createElement('div');
            div2.innerHTML = p.kills;
            c2.appendChild(div2);
          });
          
          c2 = r2.insertCell();
          c2.className = 'text-center';
          c2.innerText = team.rank;
        });
        
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
      
      m.teams.forEach(function(t, j){
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
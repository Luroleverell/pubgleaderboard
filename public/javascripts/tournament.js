'use strict';

class Tournament {
  constructor(tournament, username){
    this.matches_ = [];
    this.teams_ = new Map();
    this.players_ = new Map();
    this.tournamentId = tournament._id;
    this.isAdmin_ = (tournament.username == username);

    this.settingsRankScoreTable_ = tournament.settings.placementPoints;
    this.settingsKillScore_ = tournament.settings.killPoints;
    
    this.leaderboardLevel_ = tournament.settings.leaderboardLevel;
    
    tournament.matches.forEach(function(m){
      m.team.forEach(function(t){
        let teamName = t.teamName || t.teamId;
        if(!this.teams_.has(teamName)) this.teams_.set(teamName, new Team(t))
        this.teams_.get(teamName).addMatch(m, t, this.settingsRankScoreTable_, this.settingsKillScore_);
        t.teamPoints = t.teamKills * this.settingsKillScore_ + this.settingsRankScoreTable_[t.rank];
        
        t.players.forEach(function(p){  
          let newPlayer = new Player(p)
          if(!this.players_.has(p.playerId)) this.players_.set(p.playerId, newPlayer)
          this.players_.get(p.playerId).addMatch(m, t, this.settingsRankScoreTable_, this.settingsKillScore_);
          this.teams_.get(teamName).addPlayer(newPlayer);
        }, this)
      }, this)
      
      let newMatch = {
        mapName: m.mapName, 
        matchDate: m.matchDate,
        matchId: m.matchId,
        teams: m.team,
        telemetry: m.telemetry
        };
      this.matches_.push(newMatch);
    }, this)
    
    this.matches_.forEach(function(match){
      match.teams.sort(function(a,b){
        return b.teamPoints - a.teamPoints;
      })
    })
    
    this.matches_.sort(function(a,b){
      return new Date(a.matchDate) - new Date(b.matchDate);
    })
    
    this.teamList_ = [...this.teams_].sort(function(a,b){
      return b[1].teamPoints - a[1].teamPoints;
    });
  }
  
  get getTeams(){
    let thTeam = ['Rank', 'Team', 'Total kills', 'Killpoints', 'Rankpoints', 'Total points', ''];
    let thPlayer = ['', 'Playername', 'Kills', 'Deaths'];
    let t, h, r, c, t2, h2, r2, c2, t3, h3, r3, c3;
    
    let divMain = document.createElement('div');
    h = document.createElement('h2');
    h.innerText = 'Leaderboard';
    divMain.appendChild(h);
    
    let divTable = ce('div', 'tableDiv');
    
    t = document.createElement('table');
    t.classList.add('table','tableBg');
    
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
    this.teamList_.forEach(function(team){
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
        t2.classList.add('table','tableBg');
        
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
    
    divTable.appendChild(t)
    divMain.appendChild(divTable);
    return divMain;
  }

  get getPlayers(){
    let thPlayer = ['Rank', 'Player', 'Killpoints', 'Rankpoints', 'Total points', ''];
    let thMatch = ['', 'Map', 'Team players','Kills', 'Match placement',''];
    let t, h, r, c, t2, h2, r2, c2, t3, h3, r3, c3;
    
    let divMain = document.createElement('div');
    h = document.createElement('h2');
    h.innerText = 'Leaderboard';
    divMain.appendChild(h);
    
    let divTable = ce('div', 'tableDiv');
    
    t = document.createElement('table');
    t.classList.add('table','tableBg');
    
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
      
      c = r.insertCell();
      
      r = t.insertRow();
      c = r.insertCell();
      c.setAttribute('colspan', '7');
      c.setAttribute('style', 'padding-top:0;padding-bottom:0;');
      
      let div = document.createElement('div');
      div.classList.add('collapse', 'container', 'row'+player[0].replace('.',''));
      
        t2 = document.createElement('table');
        t2.classList.add('table','tableBg');
        
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
          let mapIcon;
          
          r2 = tb2.insertRow();
          c2 = r2.insertCell();
          
          c2 = r2.insertCell();
          div2 = document.createElement('div');
          mapIcon = document.createElement('img');
          mapIcon.src = 'https://github.com/pubg/api-assets/raw/master/Assets/Icons/Map/'+team.mapName+'.png';
          mapIcon.style.filter = 'brightness(50%)';
          div2.appendChild(mapIcon);
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
          
          c2 = r2.insertCell();
        });
        
        div.appendChild(t2);
        c.appendChild(div);
    });
  
    divTable.appendChild(t);
    divMain.appendChild(divTable);
    return divMain;
  }
  
  get getMatches(){
    let thMatch = ['Time', 'Map', ''];
    let thTeam = ['Rank', 'Team', 'Placement', 'Player', 'Kills', 'Points'];
    let t, h, r, c, t2, h2, r2, c2, t3, h3, r3, c3;
    
    let divMain = document.createElement('div');
    h = document.createElement('h2');
    h.innerText = 'Matches';
    divMain.appendChild(h);
    
    let divTable = ce('div', 'tableDiv');
    
    t3 = document.createElement('table');
    t3.classList.add('table','tableBg');
    
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
      let div = document.createElement('span');
      //div.classList.add('1border','rounded', 'btn-secondary2', 'px-2', 'py-3');
      div.classList.add('px-2', 'py-3');
      let img = document.createElement('img');
      let iconName = '';
      
      if(m.mapName === 'Baltic_Main') iconName = 'Erangel_Main';
      else iconName = m.mapName;
      
      img.src = 'https://github.com/pubg/api-assets/raw/master/Assets/Icons/Map/'+iconName+'.png';
      img.style.filter = 'brightness(50%)';
      div.appendChild(img);
      c.appendChild(div);
      
      c = r.insertCell();
      c.innerHTML = m.matchDate;
      
      c = r.insertCell();
      c.className = 'text-right';
      c.innerHTML = '';
      
      /*let form = document.createElement('form');
      form.setAttribute('method', 'post');
      form.setAttribute('action', '/tournaments/remove/'+this.tournamentId+'/'+m.matchId);
      form.setAttribute('enctype', 'multipart/form-data');*/
      
      div = document.createElement('div');
      div.className = 'btn-group';
      
      let divReplay = document.createElement('div');
      divReplay.innerText = 'Loading match data... (this will take a few minutes)';
      //divMap.appendChild(divReplay);
      
      let but = document.createElement('button');
      but.classList.add('btn', 'btn-info');
      but.setAttribute('type', 'button');
      but.setAttribute('data-toggle', 'collapse');
      but.setAttribute('data-role', 'expander');
      but.setAttribute('data-target', '.map'+m.matchId);
      let icon = document.createElement('span');
      icon.classList.add('oi', 'oi-media-play');
      but.appendChild(icon);
      but.addEventListener('click', function(){
        let telemetry = m.telemetry.split('/');
        let url = '/telemetry/'+telemetry[telemetry.length-1].split('.')[0];
        getReplay(url, divReplay);
      }, {once:true});
      //div.appendChild(but);
      
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
      /*but.setAttribute('type', 'submit');
      but.setAttribute('name', 'submit');
      but.setAttribute('value', 'submit');*/
      icon = document.createElement('span');
      icon.classList.add('oi', 'oi-trash');
      but.appendChild(icon);
      but.addEventListener('click', function(){
        postData('/tournaments/remove/'+this.tournamentId+'/'+m.matchId, '',function(){
          updateLeaderboard(this.tournamentId, 'matches');
        }.bind(this));
      }.bind(this));
      
      if(this.isAdmin) div.appendChild(but);
      //form.appendChild(div);
      //c.appendChild(form);
      c.appendChild(div);
      
      r = tb.insertRow();
      c = r.insertCell();
      c.setAttribute('colspan', '7');
      c.setAttribute('style', 'padding-top:0;padding-bottom:0;');
      
      let divMap = document.createElement('div');
      divMap.classList.add('collapse', 'container', 'map'+m.matchId);
      
      //let divReplay = document.createElement('div');
      //divReplay.innerText = 'Loading match data... (this will take a few minutes)';
      divMap.appendChild(divReplay);
      c.appendChild(divMap);
      
      r = tb.insertRow();
      c = r.insertCell();
      c.setAttribute('colspan', '7');
      c.setAttribute('style', 'padding-top:0;padding-bottom:0;');
      
      div = document.createElement('div');
      div.classList.add('collapse', 'container', 'row'+m.matchId);
      
      t2 = document.createElement('table');
      t2.classList.add('table','tableBg');
      
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
    
    divTable.appendChild(t3)
    divMain.appendChild(divTable);
    return divMain;
  }
  
  get getSettings(){
    
    let divMain = ce('div');
    let h = ce('h2');
    h.innerText = 'Settings';
    divMain.appendChild(h);
    
    let scoreWrapper = ce('div', 'container');
    
    //-----LeaderboardLevel
    let leaderboardLevelRow = ce('div','row');
    let leaderboardLevelHeader = ce('div', 'col-3');
    leaderboardLevelHeader.innerText = 'Show leaderboard for team or individual players'
    
    let leaderboardLevel = ce('div','col-2');
    if(this.isAdmin){
      let inputLeaderboardLevel = ce('select','form-control');
      let o = ce('option');
      o.innerText = 'player';
      inputLeaderboardLevel.options.add(o,1);
      o = ce('option');
      o.innerText = 'team';
      inputLeaderboardLevel.options.add(o,2);
      inputLeaderboardLevel.name = 'leaderboardLevel';
      inputLeaderboardLevel.value = this.leaderboardLevel_;
    
      leaderboardLevel.appendChild(inputLeaderboardLevel);
    }else{
      leaderboardLevel.innerText = this.leaderboardLevel_;
    }
    leaderboardLevelRow.appendChild(leaderboardLevelHeader);
    leaderboardLevelRow.appendChild(leaderboardLevel);
    scoreWrapper.appendChild(leaderboardLevelRow);
    
    //-----KillScore
    let killScoreRow = ce('div','row');
    let killScoreHeader = ce('div','col-3');
    killScoreHeader.innerText = 'Killpoints'
    killScoreRow.appendChild(killScoreHeader)
    
    let killScore = ce('div', 'col-2');
    if(this.isAdmin){
      let inputKill = ce('input', 'form-control');
      inputKill.value = this.settingsKillScore_;
      inputKill.name = 'killPoints';
      
      killScore.appendChild(inputKill);
    }else{
      killScore.innerText = this.settingsKillScore_;
    }
    killScoreRow.appendChild(killScore);
    scoreWrapper.appendChild(killScoreRow);
    
    //-----PlacementScore
    let placementScoreHeader = ce('div');
    placementScoreHeader.innerText = 'Placementpoints for each placement:';
    scoreWrapper.appendChild(placementScoreHeader);

    for(let i = 1; i<=20; i++){
      let scoreRow = ce('div','row');
      
      for(let j = 1; j<=5; j++){
        let p = i + 20 * (j - 1);
        let score = this.settingsRankScoreTable_[p]

        let divRowHeader = ce('div', ['col-1','text-right']);
        divRowHeader.innerText = p;
        
        let divScore = '';
        if(this.isAdmin){
          divScore = ce('div', 'col-1');
          
          let inputScore = ce('input','form-control')
          inputScore.name = 'point';
          inputScore.value = score;
          inputScore.setAttribute('placement', p);
          inputScore.setAttribute('tournamentId', this.tournamentId);
          inputScore.tabIndex = p;
          
          divScore.appendChild(inputScore);
        }else{
          divScore = ce('div','col-1');
          divScore.innerText = score;
        }
        
        scoreRow.appendChild(divRowHeader);
        scoreRow.appendChild(divScore);
      }
      scoreWrapper.appendChild(scoreRow);
    };
    
    divMain.appendChild(scoreWrapper);
    return divMain;
  }
  
  get isAdmin(){
    return this.isAdmin_;
  }
}
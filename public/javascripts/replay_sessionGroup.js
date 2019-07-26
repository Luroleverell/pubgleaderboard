class SessionGroup{
  constructor(matches){
    this.team = [];
    this.matches = matches;
    
    this.sessionGroups = new Map();
    let lastMatchTime = 0;
    let lastTeam = [];
    let s = 0;
    
    matches.forEach(function(match){
      let newSession = false;
      let matchTime = new Date(match.matchInfo.attributes.createdAt);
      let team = match.matchInfo.team;

      if(lastTeam.length !== team.length) newSession = true;
      else{
        let sameTeam = true;
        for(let i=0; i<team.length; i++){
          let playerFound = false;
          for(let j=0; j<lastTeam.length; j++){
            if(team[i].playerName === lastTeam[j].playerName) playerFound = true;
          }
          if(!playerFound) sameTeam = false;
        }
        if(!sameTeam) newSession = true;
      }
      if(lastMatchTime - matchTime > 3600000) newSession = true;

      if(newSession){
        s++;
        let newTeam = team;
        newTeam.forEach(function(player){
          player.kills = 0;
          player.damage = 0;
        })
        this.sessionGroups.set(s, {team: newTeam, matches: []});
      }
      let session = this.sessionGroups.get(s)
      session.matches.push(match);
      match.matchInfo.team.forEach(function(player){
        let element = session.team.find(function(x){
          return x.playerName === player.playerName;
        });
        
        element.kills += player.kills;
        element.damage += player.damage;
      });
      
      lastTeam = team;
      lastMatchTime = matchTime;
    }, this);
  }
  
  printList(parent){
    
    let tableHeader = ['#Matches', 'Players', 'Kills', 'Damage', 'KD', 'Avg. dmg'];
    
    let wrapper = ce('div', ['container','tableDiv']);
    let table = ce('table', ['table', 'tableBg']);
    let thead = ce('thead', 'thead-gold');
    let r = thead.insertRow();
    
    let c;
    tableHeader.forEach(function(h){
      c = ce('th');
      c.innerText = h;
      thead.appendChild(c);
    })
    table.appendChild(thead);
    
    
    let tbody = ce('tbody');
    this.sessionGroups.forEach(function(group){
      r = tbody.insertRow();
      c = r.insertCell();
      let numberOfMatches = group.matches.length;
      c.innerText = numberOfMatches;
      
      
      let c1 = r.insertCell();
      let c2 = r.insertCell();
      let c3 = r.insertCell();
      let c4 = r.insertCell();
      let c5 = r.insertCell();
      
      group.team.forEach(function(player,i){
        let playerName = ce('div', 'col')
        playerName.innerText = player.playerName;
        c1.appendChild(playerName);
        
        let playerKills = ce('div', 'col')
        playerKills.innerText = player.kills;
        c2.appendChild(playerKills);
        
        let playerDamage = ce('div', 'col')
        playerDamage.innerText = Math.round(player.damage * 100) / 100;;
        c3.appendChild(playerDamage);
        
        let playerKD = ce('div', 'col')
        playerKD.innerText = Math.round(player.kills / numberOfMatches * 100) / 100;
        c4.appendChild(playerKD);

        let playerAD = ce('div', 'col')
        playerAD.innerText = Math.round(player.damage / numberOfMatches * 100) / 100;
        c5.appendChild(playerAD);
      })
      
    });
    table.appendChild(tbody);
    wrapper.appendChild(table);
    parent.appendChild(wrapper);
  }
}
class Gamer_League{
  constructor(){
    this.tournaments_ = [];
    this.teams_ = new Map();
    this.teamsSorted_;
  }
  
  addTournament(tournament,i){
    this.tournaments_.push({indeks: i, tournament: tournament});
  }
  
  getTeams(){//(parent){
    this.tournaments_.forEach(function(tournament){
      tournament.tournament.rounds_.forEach(function(round){
        round.data_.maps.forEach(function(map){
          map.results.forEach(function(result){
            if (!this.teams_.has(result.signup.teamId)) this.teams_.set(result.signup.teamId, {teamName: 'teamName',results: [], 
              qualifierAveragePlacement:0, qualifierAverageKills:0, qualifierNumber:0,
              endgameAveragePlacement:0, endgameAverageKills:0, endgameNumber:0});
              
            let team = this.teams_.get(result.signup.teamId);
            let placement = 0;
            team.results.push({result:result,sluttspill:tournament.indeks});
            team.teamName = result.signup.name;
            if (tournament.indeks == 0) {
              placement = Math.round((team.qualifierAveragePlacement * team.qualifierNumber + result.placement)/(team.qualifierNumber + 1)*100)/100;
              team.qualifierNumber += 1;
              team.qualifierAveragePlacement = placement;
              team.qualifierAverageKills = Math.round((team.qualifierAverageKills * team.qualifierNumber + result.kills)/(team.qualifierNumber + 1)*100)/100; 
            }else{
              placement = Math.round((team.endgameAveragePlacement * team.endgameNumber + result.placement)/(team.endgameNumber + 1)*100)/100;
              team.numberEndgames += 1;
              team.endgameAveragePlacement = placement;
              team.endgameAverageKills = Math.round((team.endgameAverageKills * team.endgameNumber + result.kills)/(team.endgameNumber + 1)*100)/100; 
            }
          }, this);
        }, this);
      }, this);
    },this);
    
    this.teamsSorted_ = new Map([...this.teams_].sort(function(a,b){
      return a[1].qualifierAveragePlacement - b[1].qualifierAveragePlacement;
    }));
    
    //this.printList(parent);
  }
  
  printList(parent){
    console.log(this.teamsSorted_);
    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');
    
    let r = thead.insertRow();
    let c = r.insertCell();
    c.innerText = 'Team Id';

    c = r.insertCell();
    c.innerText = 'Team name';

    c = r.insertCell();
    c.innerText = 'Placement';

    c = r.insertCell();
    c.innerText = 'Kills';
    
    c = r.insertCell();
    c.innerText = 'Number';
    
    c = r.insertCell();
    c.innerText = 'Placement';

    c = r.insertCell();
    c.innerText = 'Kills';
    
    c = r.insertCell();
    c.innerText = 'Number';
    
    this.teamsSorted_.forEach(function(team, id){
      let r2 = tbody.insertRow();
      let c2 = r2.insertCell();
      c2.innerText = id;
      
      c2 = r2.insertCell();
      c2.innerText = team.teamName;
      
      c2 = r2.insertCell();
      c2.innerText = team.qualifierAveragePlacement;
      
      c2 = r2.insertCell();
      c2.innerText = team.qualifierAverageKills;
      
      c2 = r2.insertCell();
      c2.innerText = team.qualifierNumber;
      
      c2 = r2.insertCell();
      c2.innerText = team.endgameAveragePlacement;
      
      c2 = r2.insertCell();
      c2.innerText = team.endgameAverageKills;
      
      c2 = r2.insertCell();
      c2.innerText = team.endgameNumber;
    });
    
    table.appendChild(thead);
    table.appendChild(tbody);
    parent.appendChild(table);
  }
  
  get teams(){
    return this.teams_;
  }
  
  printExpectation(output, parent){
    let scoreTable = [10,6,5,4,3,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    output.forEach(function(signup){
      if(signup.results){
        let p = signup.results.qualifierAveragePlacement;
        let k = signup.results.qualifierAverageKills;
        let pH = Math.floor(p)
        let r = p - pH;
        signup.results.expectation = Math.round(((1 - r) * scoreTable[pH-1] + r * scoreTable[pH] + k) * 100) / 100;
      }else{
        signup.results = {expectation: 0};
      }
    });
    console.log(output)
    output.sort(function(a,b){
      return b.results.expectation - a.results.expectation;
    });
    let container = document.createElement('div');
    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');

    container.className = 'container';
    table.classList.add('table','table-sm');
    thead.className = 'thead-dark';  
    
    let r = thead.insertRow();
    let c = r.insertCell();
    c.innerText = 'Team Id';

    c = r.insertCell();
    c.innerText = 'Team name';

    c = r.insertCell();
    c.innerText = 'Placement';

    c = r.insertCell();
    c.innerText = 'Kills';
    
    c = r.insertCell();
    c.innerText = 'Number';
    
    c = r.insertCell();
    c.innerText = 'Expectation';
    
    output.forEach(function(signup){
      let r2 = tbody.insertRow();
      let c2 = r2.insertCell();
      c2.innerText = signup.team.id;
      
      c2 = r2.insertCell();
      c2.innerText = signup.results.teamName;
      
      c2 = r2.insertCell();
      c2.innerText = signup.results.qualifierAveragePlacement;
      
      c2 = r2.insertCell();
      c2.innerText = signup.results.qualifierAverageKills;
      
      c2 = r2.insertCell();
      c2.innerText = signup.results.qualifierNumber;

      c2 = r2.insertCell();
      c2.innerText = signup.results.expectation;
    });
    
    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);
    parent.appendChild(container);
  }
}
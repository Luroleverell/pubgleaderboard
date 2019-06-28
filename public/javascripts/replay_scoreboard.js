class Scoreboard{
  constructor(teams){
    console.log(teams)
    this.scoreboard_ = document.createElement('div');
    this.scoreboard_.id = 'scoreboard';
    
    for (let i = 0; i <= teams.length - 1; i++){
      let newRow = document.createElement('div');
      //newRow.className = 'scoreboardRow';
      newRow.className = 'row';
      newRow.style.boxShadow = '1px 1px 5px 1px #888';
      newRow.style.margin = '10px';
      newRow.style.padding = '3px';

      let rank = document.createElement('div');
      //rank.className = 'rank';
      rank.className = 'col-md-2';

      let newRank = 100;
      teams[i].forEach(function(p){
        if(p.rank < newRank) newRank = p.rank;
      });
      rank.innerText = newRank;

      newRow.appendChild(rank);

      let teamId = document.createElement('div');
      //teamId.className = 'teamId';
      teamId.className = 'col-md-2';
      teamId.innerText = teams[i][0].teamId;
      newRow.appendChild(teamId);

      let squad = document.createElement('div');
      //squad.className = 'squad';
      squad.className = 'col-md-8';

      teams[i].forEach(function(p){
        let newPlayer = document.createElement('div');
        //newRow.className = 'scoreboardRow';
        newPlayer.className = 'row';

        //let newPlayer = document.createElement('div');
        //newPlayer.className = 'player';
        //newPlayer.className = 'col-md12';

        newPlayer.innerHTML += '<div class="col-md-6">' + p.name + '</div><div class="col-md-3">' + p.kills + '</div><div class="col-md-3">' + p.dead + '</div>';
        squad.appendChild(newPlayer);
      });
      newRow.appendChild(squad);
      this.scoreboard_.appendChild(newRow);
    }
  }

  render(parent){
    parent.appendChild(this.scoreboard_);
  }
}
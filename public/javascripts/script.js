var SHARD = "pc-eu";

function loadFunction(){
  let username = document.getElementById('lu_username');
  let result = document.getElementById('result');
  /*let leaderboard = document.getElementById('leaderboard');
  let matches = document.getElementById('matches');*/
  let pathArray = window.location.pathname.split('/');
  let tournamentId = pathArray[pathArray.length-1];
  let keepTeamId = document.getElementById('keepTeamId');
  
  if(username){
    username.addEventListener('change', function(e){
      getMatches(username.value, SHARD, result);
    })
  }
  
  document.addEventListener('change', function(e){
    if(e.target.name == 'point'){
      let placement = e.target.getAttribute('placement');
      if(!placement) placement = 'killPoints'
      changePoint(tournamentId, e.target.getAttribute('placement'), e.target.value)
    }
  });
  
  document.addEventListener('change', function(e){
    if(e.target.name == 'teamName'){
      changeTeamName(tournamentId, e.target.getAttribute('matchId'), e.target.getAttribute('teamIndex'), e.target.value,e.target.getAttribute('teamId'))
    }
  });
  
  if(keepTeamId){
    keepTeamId.addEventListener('click', function(e){
      changeKeepTeamId(tournamentId, e.target.checked);
    });
  }
  
  updateLeaderboard(tournamentId);//, leaderboard);
  
  let flash = document.getElementById('flash');
  if(flash){
    setTimeout(function(){
      flash.classList.remove('show');
    }, 3000);
  }
}

function getMatches(playername, shard, parent){
  let url = '/tournaments/pubgAPI/'+playername+'/'+shard;
  fetchData(url, function(res){
    printList(res, parent);
  });
}

function changeTeamName(tournamentId, matchId, teamIndex, teamName, teamId){
  let url = '/tournaments/changeTeamName/'+tournamentId+'/'+matchId+'/'+teamIndex+'/'+teamName+'/'+teamId;
  fetchData(url, function(){
    updateLeaderboard(tournamentId, true);//, leaderboard);
  });
}

function changePoint(tournamentId, index, newPoint){
  //let leaderboard = document.getElementById('leaderboard');
  let url = '/tournaments/changePoint/'+tournamentId+'/'+index+'/'+newPoint;
  fetchData(url, function(){
    console.log('Updated!');
    updateLeaderboard(tournamentId);//, leaderboard);
  });
}

function changeKeepTeamId(tournamentId, newValue){
  //let leaderboard = document.getElementById('leaderboard');
  
  let url = '/tournaments/changeKeepTeamId/'+tournamentId+'/'+newValue;
  fetchData(url, function(){
  });
}

function updateLeaderboard(tournamentId, teamOnly){//, parent){
  let leaderboard = document.getElementById('leaderboard');
  let leaderboardMatches = document.getElementById('matches');
  
  if(leaderboard){
    let url = '/tournaments/getTournament/'+tournamentId;
    fetchData(url, function(tournament){
      let url = '/users/getUser';
      fetchData(url, function(user){
        let tour = new Tournament(tournament, user.username);
        
        leaderboard.innerHTML = '';
        leaderboard.appendChild(tour.getTeams);
        if(!teamOnly){
          leaderboardMatches.innerHTML = '';
          leaderboardMatches.appendChild(tour.getMatches);
        }
      })
    });
  }
}

function fetchData(url, callback){

  let http = new XMLHttpRequest();
  let res = 0;
  http.open("GET", url, true);
  http.setRequestHeader('Accept','application/vnd.api+json');
  http.onreadystatechange = function() {
    if (http.readyState == 4) {
      if (http.status == 200) {
        res = JSON.parse(http.responseText);
        callback(res);
      }
    }
  };
  http.send();
}

function printList(res, parent){
  
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
    
  let div = document.createElement('div');
  div.innerText = 'Choose a match from the list below:';
 
  
  let table = document.createElement('table');
  let thead = document.createElement('thead');
  let trhead = document.createElement('tr');
  let date = document.createElement('th'); 
  let mode = document.createElement('th'); 
  let map = document.createElement('th');  
  
  date.innerText = 'Date'
  trhead.appendChild(date);
  
  mode.innerText = 'Mode'
  trhead.appendChild(mode);
  
  map.innerText = 'Map'
  trhead.appendChild(map);
  thead.appendChild(trhead);
  
  thead.className = 'thead-light';
  table.className = 'table';
  table.classList.add('table-sm');
  table.appendChild(thead);
  
  parent.appendChild(div);
  parent.appendChild(table);
  var tempArray = res.data[0].relationships.matches.data;
  
  res.data[0].relationships.matches.data.forEach(function(el){ 
    let match = document.createElement('tr');
    let matchId = document.createElement('td');

    matchId.innerText = el.id;
    match.addEventListener('click', function(){
      document.getElementById('matchId').value = el.id;
    });
    matchId.style.display = 'none';
    match.appendChild(matchId);
    getMatchType(el.id, match, table);
  });
  
  
}

function getMatchType(matchId, match, table){
  let url= 'https://api.playbattlegrounds.com/shards/'+SHARD+'/matches/'+matchId;
  fetchData(url, function(res){
    let matchDate = document.createElement('td');
    matchDate.innerText = res.data.attributes.createdAt;
    match.appendChild(matchDate);

    /*let isCustom = document.createElement('td');
    isCustom.innerText = res.data.attributes.isCustomMatch;
    match.appendChild(isCustom);*/
    
    let gameMode = document.createElement('td');
    gameMode.innerText = res.data.attributes.gameMode;
    match.appendChild(gameMode);

    let map = document.createElement('td');
    map.innerText = res.data.attributes.mapName;
    match.appendChild(map);

    table.appendChild(match);
  });
}
function loadFunction(){
  let username = document.getElementById('lu_username');
  let result = document.getElementById('result');
  let pathArray = window.location.pathname.split('/');
  let tournamentId = pathArray[pathArray.length-1];
  let keepTeamId = document.getElementById('keepTeamId');
  
  if(username){
    username.addEventListener('change', function(e){
      getMatches(username.value, result);
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
  
  updateLeaderboard(tournamentId);
  
  let flash = document.getElementById('flash');
  if(flash){
    setTimeout(function(){
      flash.classList.remove('show');
    }, 3000);
  }
}

function getMatches(playername, parent){  
  let shards = ['steam']//['pc-eu', 'pc-na', 'pc-ru', 'pc-as', 'pc-krjp', 'pc-jp', 'pc-oc', 'pc-kakao', 'pc-sea', 'pc-sa'];
  let p = [];

  for(let i=0;i<=shards.length-1;i++){
    let url = '/tournaments/pubgAPI/'+playername+'/'+shards[i]
    p.push(new Promise(function(resolve, reject){
      fetchData(url, function(res){
        resolve(res);
      });
    }));
  }
  
  Promise.all(p).then(function(res){
    printList(res, parent);
  })
}

function changeTeamName(tournamentId, matchId, teamIndex, teamName, teamId){
  let url = '/tournaments/changeTeamName/'+tournamentId+'/'+matchId+'/'+teamIndex+'/'+teamName+'/'+teamId;
  fetchData(url, function(){
    updateLeaderboard(tournamentId, true);
  });
}

function changePoint(tournamentId, index, newPoint){
  let url = '/tournaments/changePoint/'+tournamentId+'/'+index+'/'+newPoint;
  fetchData(url, function(){
    updateLeaderboard(tournamentId);
  });
}

function changeKeepTeamId(tournamentId, newValue){
  let url = '/tournaments/changeKeepTeamId/'+tournamentId+'/'+newValue;
  fetchData(url, function(){
    updateLeaderboard(tournamentId, true);
  });
}

function updateLeaderboard(tournamentId, teamOnly){
  let leaderboard = document.getElementById('leaderboard');
  let leaderboardMatches = document.getElementById('matches');
  
  if(leaderboard){
    let url = '/tournaments/getTournament/'+tournamentId;
    fetchData(url, function(tournament){
      let url = '/users/getUser';
      fetchData(url, function(user){
        let tour = new Tournament(tournament, user.username);
        
        
        leaderboard.innerHTML = '';
        if(tournament.settings.leaderboardLevel == 'team'){
          leaderboard.appendChild(tour.getTeams);
        }else{
          leaderboard.appendChild(tour.getPlayers);
        }
        
        if(!teamOnly){
          leaderboardMatches.innerHTML = '';
          leaderboardMatches.appendChild(tour.getMatches);
        }
      })
    });
  }
}
function testGamer(){
  let url = 'https://www.gamer.no/api/v1/teams/39403/players';
  fetchData(url, function(res){
    //console.log(res);
  })
}

function fetchData(url, callback){

  let http = new XMLHttpRequest();
  let res = 0;
  http.open("GET", url, true);
  http.setRequestHeader('Accept','application/vnd.api+json');
  http.setRequestHeader('Authorization','nj)HL/#nF(Nd7f&h7ysbf34nf+2inmjDF7fnBuvXpi35=890fmdWifn43n');
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
  //var tempArray = res.data[0].relationships.matches.data;
  
  res.forEach(function(result){
    let tr = document.createElement('tr');
    let td = document.createElement('td');
    td.innerText = result.data[0].attributes.shardId;
    tr.appendChild(td);
    table.appendChild(tr);
    
    result.data[0].relationships.matches.data.forEach(function(el){ 
      let match = document.createElement('tr');
      let matchId = document.createElement('td');

      match.id = el.id;
      match.addEventListener('click', function(){
        document.getElementById('matchId').value = el.id;
      });
      
      let td = match.insertCell();
      td.id = el.id;
      td.innerText = 'Loading...';    
      
      table.appendChild(match);
      getMatchType(match);
    });
  })
}

function getMatchType(match){
  let url= 'https://api.playbattlegrounds.com/shards/steam/matches/'+match.id;
  
  /*fetch(url, {
    mode: 'cors'
  }).then(function(res){
    return res.json();
  }).then(function(res){
    if(res.data.attributes.isCustomMatch){
      match.removeChild(match.childNodes[0]);
      let matchDate = document.createElement('td');
      matchDate.innerText = res.data.attributes.createdAt;
      match.appendChild(matchDate);
      
      let gameMode = document.createElement('td');
      gameMode.innerText = res.data.attributes.gameMode;
      match.appendChild(gameMode);

      let map = document.createElement('td');
      map.innerText = res.data.attributes.mapName;
      match.appendChild(map);
    }else{
      match.parentNode.removeChild(match);
    }
  }).catch(function(error){
    console.error('Error:', error);
  });*/
  
  fetchData(url, function(res){
    if(res.data.attributes.isCustomMatch){
      match.removeChild(match.childNodes[0]);
      let matchDate = document.createElement('td');
      matchDate.innerText = res.data.attributes.createdAt;
      match.appendChild(matchDate);
      
      let gameMode = document.createElement('td');
      gameMode.innerText = res.data.attributes.gameMode;
      match.appendChild(gameMode);

      let map = document.createElement('td');
      map.innerText = res.data.attributes.mapName;
      match.appendChild(map);
    }else{
      match.parentNode.removeChild(match);
    }
  });
}

function collectCheckboxes(eventId){
  let checkboxes = document.getElementsByName('tournament');
  let tournaments = document.getElementById('tournaments');
  let tournamentsToAdd = [];
  checkboxes.forEach(function(c){
    if(c.checked) tournamentsToAdd.push(c.value);
  });
  
  if(tournamentsToAdd.length > 0){
    formData = new FormData();
    formData.append('tournaments',tournamentsToAdd);
    var request = new XMLHttpRequest();
    request.open('POST', '/tournaments/event/addTournaments/'+eventId);
    request.send(formData);
  }
  return false;
}


function fetchDataGamer(){
  let url = 'https://www.gamer.no/api/v1/teams/39403';
  let test = {
    credentials: 'include',
    headers: {
      'Authorization': 'nj)HL/#nF(Nd7f&h7ysbf34nf+2inmjDF7fnBuvXpi35=890fmdWifn43n',
      'Accept': 'application/json'
      //'Accept-Encoding': 'gzip, deflate'
    },
    mode: 'cors',
    method: 'GET'
  };
  
  fetch(url, test)
  .then(function(res){
    return res.json();
  }).then(function(res){
    console.log(res);
  })
}

function addNewMatch(tournamentId){
  
  let div = ce('div', 'container');
  let divResult = ce('div', ['container','tableDiv']);
  divResult.id = 'searchResult';
  
  let btnGroup = ce('div', 'btn-group')
  let username = ce('input', 'input-group-prepend','form-control');
  btnGroup.appendChild(username);
  
  let btnGetMatches = ce('button', ['btn', 'btn-info']);
  btnGetMatches.innerText = 'Find matches';
  btnGetMatches.addEventListener('click', function(){
    getMatches(username.value, function(res){
      printList(res, divResult);
    });
  });
  btnGroup.appendChild(btnGetMatches);
  
  div.appendChild(btnGroup);
   
  let btnAdd = ce('button', ['btn','btn-info','float-right']);
  
  if(tournamentId){
    btnAdd.innerText = 'Add selected matches';  
    btnAdd.addEventListener('click', function(){
      let matches = document.getElementsByName('apiMatches');
      let promises = [];
      matches.forEach(function(match){
        if(match.classList.contains('activeButton')){
          
          let p = new Promise(function(resolve, reject){
            postData('/tournaments/edit/'+tournamentId, 'matchId='+match.getAttribute('matchId'), function(res){
              resolve();
            });
          });
          
          promises.push(p)
        }
      });
      
      Promise.all(promises).then(function(res){
        updateLeaderboard(tournamentId, 'matches');
      });
    });
    div.appendChild(btnAdd);
  }else{
    
    let btnGroup = ce('div', ['btn-group', 'fr']);
    let btnSummary = ce('button', ['btn','btn-info','float-right']);
    btnSummary.innerText = 'Show summary';
    btnSummary.id = 'btnSummary';
    
    btnAdd.innerText = 'Get replay data';
    btnAdd.addEventListener('click', function(){
      let matches = document.getElementsByName('apiMatches');
      matches.forEach(function(match){
        if(match.classList.contains('activeButton')){
          getReplay(match.childNodes[7].innerText, divResult);
        }
      });
    });
    
    btnGroup.appendChild(btnSummary);
    btnGroup.appendChild(btnAdd);
    div.appendChild(btnGroup);
  }

  div.appendChild(divResult);
  return div;
}

function getMatches(playername, callback){  

  let url = '/tournaments/pubgAPI/'+playername;
  let p = new Promise(function(resolve, reject){
    fetchData(url, function(res){
      resolve(res);
    });
  });
  
  p.then(function(res){
    callback(res);
  });
}

function printList(res, parent){
  let platform_region_shard = 'steam';
  let wrapper = document.createElement('div');
  let matches = new Map();
  wrapper.id = 'listOfMatches';
  
  let playerId = res.data[0].id;
  parent.innerHTML = '';
  parent.appendChild(wrapper);
  
  let promises = [];
  
  let list = ce('div');
  
  res.data[0].relationships.matches.data.forEach(function(el){
    let matchDiv = document.createElement('div');
    matchDiv.setAttribute('name', 'apiMatches');
    matchDiv.setAttribute('matchId', el.id);
    matchDiv.innerText = 'Loading match...';
    matchDiv.classList.add('row','py-2','pl-2','my-1','mapCard');
    matchDiv.style.margin = '10px';
    matchDiv.addEventListener('click', function(){
      toggle(this, 'activeButton');
    });
    
    matches.set(el.id, {matchInfo: 0});
    
    let url = '/tournaments/pubgAPI/match/'+el.id;
    let p = new Promise(function(resolve, reject){
      fetchData(url, function(res){
        let matchInfo = listItem(res, matchDiv, playerId);
        matches.get(el.id).matchInfo = matchInfo;
        resolve();
      });
    });
    
    promises.push(p);
    list.appendChild(matchDiv);
  });
  
  wrapper.appendChild(list);
  
  let sessionGroup = new Map();
  let lastMatchTime = 0;
  let lastTeam = [];
  let s = 0;
  let btnSummary = document.getElementById('btnSummary');
  
  if(btnSummary){
    Promise.all(promises).then(function(){
      let wrapperCopy = wrapper.cloneNode(true);
      let sessionGroup = new SessionGroup(matches);
      btnSummary.addEventListener('click', function _summary(){
        this.removeEventListener('click', _summary);
        this.innerText = 'MatchList';
        this.addEventListener('click', function _matchList(){
          this.innerText = 'Show summary';
          this.removeEventListener('click', _matchList);
          this.addEventListener('click', _summary);
          wrapper.innerHTML = '';
          wrapper.appendChild(list);
        });
        wrapper.innerHTML = '';
        sessionGroup.printList(wrapper);
      });  
    
    /*matches.forEach(function(match, key){
      let newSession = false;
      let matchTime = new Date(match.matchInfo.attributes.createdAt);
      let team = match.matchInfo.team;

      if(lastTeam.length !== team.length) newSession = true;
      else{
        let sameTeam = true;
        for(let i=0; i<team.length; i++){
          let playerFound = false;
          for(let j=0; j<lastTeam.length; j++){
            if(team[i].playerName == lastTeam[j].playerName) playerFound = true;
          }
          if(!playerFound) sameTeam = false;
        }
        if(!sameTeam) newSession = true;
      }
      if(lastMatchTime - matchTime > 3600000) newSession = true;

      if(newSession){
        s++;
        sessionGroup.set(s, []);
      }
      sessionGroup.get(s).push(match);
      
      lastTeam = team;
      lastMatchTime = matchTime;
    });
    
    console.log(sessionGroup);*/
    });
  }
}

function listItem(match, parent, playerId){
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  parent.innerText = '';
  
  let matchInfo = new MatchInfo(match, playerId);
  
  if(matchInfo.rank == 1){
    parent.classList.add('firstPlace');
  }else if(matchInfo.rank <= 10){
    parent.classList.add('topTen');
  }
  
  let c2, c3;
  
  //===MAP ICON=====
  let mapIcon = ce('img', 'mapIcon');
  
  let mapName = match.data.attributes.mapName;
  let iconName;
  if(mapName === 'Baltic_Main') iconName = 'Erangel_Main';
  else iconName = mapName;
  
  mapIcon.src = 'https://raw.githubusercontent.com/pubg/api-assets/master/Assets/Icons/Map/' + iconName + '.png'
  let c = ce('div', ['col--auto','my-auto','p-3']);
  c.appendChild(mapIcon);
  parent.appendChild(c);

  //===GAMEDATE=====
  c = ce('div',['col--auto','px-3', 'my-auto']);
    let date = new Date(match.data.attributes.createdAt)
    c2 = ce('div');
    c2.innerHTML = date.getDate() + '. ' + months[date.getMonth()] + ' ' + date.getFullYear();
    c.appendChild(c2);
    
    c2 = ce('div');
    c2.innerHTML = getTimeFromDate(date);
    c.appendChild(c2);
  parent.appendChild(c);

  c = ce('div', ['col', 'my-auto']);
  c.innerHTML = match.data.attributes.gameMode;
  parent.appendChild(c);
  
  //===PLAYER=====
  c = ce('div', 'col');
    c2 = ce('div', 'header');
    c2.innerHTML = 'Player';
    c.appendChild(c2);
    
    c2 = ce('div', 'my-auto');
    matchInfo.team.forEach(function(mi){
      c3 = ce('div');
      c3.innerHTML = mi.playerName;
      c2.appendChild(c3);
    });
    c.appendChild(c2);
  parent.appendChild(c);

  //===KILLS=====
  c = ce('div','col');
    c2 = ce('div', ['header', 'text-center']);
    c2.innerHTML = 'Kills';
    c.appendChild(c2);
    
    c2 = ce('div', 'my-auto');
    matchInfo.team.forEach(function(mi){
      c3 = ce('div','text-center');
      c3.innerHTML = mi.kills;
      c2.appendChild(c3);
    });
    c.appendChild(c2);
  parent.appendChild(c);

  //===DAMAGE=====
  c = ce('div', 'col');
    c2 = ce('div', ['header', 'text-right']);
    c2.innerHTML = 'Damage';
    c.appendChild(c2);

    c2 = ce('div', 'my-auto');
    matchInfo.team.forEach(function(mi){
      c3 = ce('div', 'text-right');
      c3.innerHTML = mi.damage;
      c2.appendChild(c3);
    });
    c.appendChild(c2);
  parent.appendChild(c);
  
  //===PLACEMENT=====
  c = ce('div', ['col', 'my-auto', 'text-right']);
  /*c2 = ce('div', ['header', 'text-right']);
  c2.innerHTML = 'Placement';
  c.appendChild(c2);*/
  
  c2 = ce('div', 'my-auto')
    c3 = ce('div', 'text-right');
      let span1 = ce('span', 'placement');
      span1.innerText = matchInfo.rank;
      let span2 = ce('span');
      span2.innerText = ' of ' + matchInfo.playerCount;
    c3.appendChild(span1);
    c3.appendChild(span2);
    c2.appendChild(c3);
  c.appendChild(c2)
  parent.appendChild(c);

  c = ce('div',['col', 'my-auto']);
  c.style.display = 'none';
  getTelemetry(match, function(res){
    c.innerHTML = res;
  })
  parent.appendChild(c);
  return matchInfo;
}

function getTelemetry(res, callback){
  let assetId = res.data.relationships.assets.data[0].id;
  res.included.forEach(function(el){
    if (el.id == assetId) {
      callback(el.attributes['URL']);
    }
  });
}

function postData(url, values, callback){

  let http = new XMLHttpRequest();
  let res = 0;
  http.open('POST', url, true);
  http.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
  http.onreadystatechange = function() {
    if (http.readyState == 4) {
      if (http.status == 200) {
        callback();
      }
    }
  };
  http.send(values);
}
function addNewMatch(tournamentId){
  
  let div = ce('div', 'container');
  let divResult = ce('div', 'container');
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
      
      Promise.all(promises).then(function(){
        updateLeaderboard(tournamentId, 'matches');
      });
    });
  }else{
    btnAdd.innerText = 'Get replay data';
    btnAdd.addEventListener('click', function(){
      let matches = document.getElementsByName('apiMatches');
      matches.forEach(function(match){
        if(match.classList.contains('activeButton')){
          getReplay(match.childNodes[7].innerText, divResult);
        }
      });
    });
  }

  div.appendChild(btnAdd);
  div.appendChild(divResult);
  
  return div;
}

function getMatches(playername, callback){  
  let shards = ['steam'];
  let p = [];

  for(let i=0;i<=shards.length-1;i++){
    let url = '/tournaments/pubgAPI/'+playername;
    p.push(new Promise(function(resolve, reject){
      fetchData(url, function(res){
        resolve(res);
      });
    }));
  }
  
  Promise.all(p).then(function(res){
    callback(res);
  });
}

function printList(res, parent){
  let platform_region_shard = 'steam';
  let wrapper = document.createElement('div');
  wrapper.id = 'listOfMatches';

  let playerId = res[0].data[0].id;
  parent.innerHTML = '';
  parent.appendChild(wrapper);

  res.forEach(function(result){
    result.data[0].relationships.matches.data.forEach(function(el){
      let matchDiv = document.createElement('div');

      matchDiv.setAttribute('name', 'apiMatches');
      matchDiv.setAttribute('matchId', el.id);
      matchDiv.innerText = 'Loading match...';
      matchDiv.classList.add('row','border','rounded','py-2','pl-2','my-1', 'mapCard');
      matchDiv.style.boxShadow = '1px 1px 5px 1px #888';
      matchDiv.style.margin = '10px';
      matchDiv.addEventListener('click', function(){
        toggle(this, 'activeButton');
      });
      //let url = 'https://api.pubg.com/shards/steam/matches/'+el.id;    
      let url = '/tournaments/pubgAPI/match/'+el.id;
      fetchData(url, function(res){
        makeList(res, matchDiv, playerId);
      });
      wrapper.appendChild(matchDiv);
    });
  }); 
}

function makeList(match, parent, playerId){
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  parent.innerText = '';
  
  let matchInfo = new MatchInfo(match, playerId);

  let mapIcon = document.createElement('img');
  mapIcon.src = 'https://raw.githubusercontent.com/pubg/api-assets/master/Assets/Icons/Map/' + match.data.attributes.mapName + '.png'
  mapIcon.classList.add('mapIcon');
  let c =document.createElement('div');
  c.classList.add('col--auto','p-3');
  c.appendChild(mapIcon);
  parent.appendChild(c);

  c =document.createElement('div');
  c.classList.add('col--auto','px-3', 'my-auto');
    let date = new Date(match.data.attributes.createdAt)
    let c2 = document.createElement('div');
    c2.innerHTML = date.getDate() + '. ' + months[date.getMonth()] + ' ' + date.getFullYear();
    c.appendChild(c2);
    
    c2 = document.createElement('div');
    c2.innerHTML = getTimeFromDate(date);
    c.appendChild(c2);
  parent.appendChild(c);

  c =document.createElement('div');
  c.classList.add('col', 'my-auto');
  c.innerHTML = match.data.attributes.gameMode;
  parent.appendChild(c);

  c =document.createElement('div');
  c.classList.add('col', 'my-auto');
    c2 = document.createElement('div');
    c2.innerHTML = 'Player';
    c.appendChild(c2);

    matchInfo.team.forEach(function(mi){
      c2 = document.createElement('div');
      c2.innerHTML = mi.playerName;
      c.appendChild(c2);
    });
  parent.appendChild(c);

  c =document.createElement('div');
  c.classList.add('col', 'my-auto');
    c2 = document.createElement('div');
    c2.classList.add('text-center');
    c2.innerHTML = 'Kills';
    c.appendChild(c2);

    matchInfo.team.forEach(function(mi){
      c2 = document.createElement('div');
      c2.classList.add('text-center');
      c2.innerHTML = mi.kills;
      c.appendChild(c2);
    });
  parent.appendChild(c);

  c =document.createElement('div');
  c.classList.add('col', 'my-auto');
    c2 = document.createElement('div');
    c2.classList.add('text-right');
    c2.innerHTML = 'Damage';
    c.appendChild(c2);

    matchInfo.team.forEach(function(mi){
      c2 = document.createElement('div');
      c2.classList.add('text-right');
      c2.innerHTML = mi.damage;
      c.appendChild(c2);
    });
  parent.appendChild(c);
  
  c =document.createElement('div');
  c.classList.add('col', 'my-auto','text-right');
  c.innerHTML = matchInfo.rank;
  parent.appendChild(c);

  c =document .createElement('div');
  c.classList.add('col', 'my-auto');
  c.style.display = 'none';
  getTelemetry(match, function(res){
    c.innerHTML = res;
  })
  parent.appendChild(c);
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
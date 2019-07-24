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
        console.log(res);
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
  wrapper.id = 'listOfMatches';
  
  let playerId = res.data[0].id;
  parent.innerHTML = '';
  parent.appendChild(wrapper);

  //res.forEach(function(result){
  res.data[0].relationships.matches.data.forEach(function(el){
    let matchDiv = document.createElement('div');

    matchDiv.setAttribute('name', 'apiMatches');
    matchDiv.setAttribute('matchId', el.id);
    matchDiv.innerText = 'Loading match...';
    matchDiv.classList.add('row','py-2','pl-2','my-1','mapCard');
    //matchDiv.style.boxShadow = '1px 1px 5px 1px #888';
    matchDiv.style.margin = '10px';
    matchDiv.addEventListener('click', function(){
      toggle(this, 'activeButton');
    });

    let url = '/tournaments/pubgAPI/match/'+el.id;
    fetchData(url, function(res){
      listItem(res, matchDiv, playerId);
    });
    wrapper.appendChild(matchDiv);
  });
  //}); 
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
  mapIcon.src = 'https://raw.githubusercontent.com/pubg/api-assets/master/Assets/Icons/Map/' + match.data.attributes.mapName + '.png'
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
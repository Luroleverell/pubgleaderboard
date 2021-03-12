var speed = 100;
var pubgColor = ['#0042a1', '#15931a', '#e16209', '#2096d1', '#4a148c', '#9f2b14', '#486a00', '#c51a56', '#9c6622', '#820045', 
                  '#d5b115', '#4ab3af', '#6b828d', '#f39700', '#37474f', '#e0648e', '#00736d', '#8a4803', '#7fb017', '#854ba1', 
                  '#38b27e', '#88abda', '#e58b65', '#2c276c', '#988e09'];
var xmlns = "http://www.w3.org/2000/svg";
var ligthVector = {x:0, y:1, z:1};
var mainColor;
var mainCOlorLight;


function loadFunction(){
  let username = document.getElementById('lu_username');
  let result = document.getElementById('result');
  let pathArray = window.location.pathname.split('/');
  let tournamentId = pathArray[pathArray.length-1];
  let keepTeamId = document.getElementById('keepTeamId');
  let leaderboardLevel = document.getElementById('leaderboardLevel');
  let lookupMatch = document.getElementById('lookupMatch');
  let filter = document.getElementById('filter');
  
  mainColor = getComputedStyle(document.documentElement).getPropertyValue('--mainColor');
  mainColorLight = getComputedStyle(document.documentElement).getPropertyValue('--mainColorLight');
  
  if(username){
    username.addEventListener('change', function(e){
      getMatches(username.value, result);
    })
  }
  
  document.addEventListener('change', function(e){
    if(e.target.name == 'point'){
      let placement = e.target.getAttribute('placement');
      changePoint(tournamentId, e.target.getAttribute('placement'), e.target.value)
    }
    
    if(e.target.name == 'killPoints'){
      changePoint(tournamentId, 'killPoints', e.target.value)
    }
    
    if(e.target.name == 'leaderboardLevel'){
      changeLeaderboardLevel(tournamentId, e.target.value);
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
  
  if(lookupMatch){
    let content = addNewMatch();
    lookupMatch.appendChild(content);
  }
  
  updateLeaderboard(tournamentId);
  updateItemlist();
  
  let flash = document.getElementById('flash');
  if(flash){
    setTimeout(function(){
      flash.classList.remove('show');
    }, 3000);
  }
  
  let nodes = document.getElementsByClassName('pattern');
  Array.prototype.forEach.call(nodes, function(node){
    generate(node);
  });
  
  let buttons = document.getElementsByClassName('line');
  Array.prototype.forEach.call(buttons, function(button, i){
  	button.style.zIndex = buttons.length - i;
    let main = button.parentNode.parentNode;
    let svg = button.parentNode;
    let text = button.parentNode.parentNode.childNodes[1];
    let elementArray = [main, button, text];
    
    if(!main.classList.contains('active')){
      elementArray.forEach(function(element){
        element.addEventListener('mouseover', function(){
          main.style.transform = 'scale(1.1)';
          text.style.color = mainColor;
          button.style.fill = mainColorLight;
        });
        
        element.addEventListener('mouseout', function(){
          main.style.transform = 'scale(1.0)';
          text.style.color = mainColorLight;
          button.style.fill = mainColor;
        });
      });
    }
  });
  
  if(filter){
    filter.addEventListener('input', function(e){
      console.log("--CHANGE--");
      updateItemlist(e.target.value);
    });
  }
  /*
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  
  if (fragment.has("access_token")) {
    const accessToken = fragment.get("access_token");
    const tokenType = fragment.get("token_type");

    fetch('https://discord.com/api/v6', {
      headers: {
        authorization: `${tokenType} ${accessToken}`
      }
    })
      .then(res => res.json())
      .then(response => {
        const { username, discriminator } = response;
        console.log(username +' '+ discriminator);
      })
      .catch(console.error);

  }else{
    console.log('--FAILED--');
  }*/
}

/*
API_ENDPOINT = 'https://discord.com/api/v6'
CLIENT_ID = '332269999912132097'
CLIENT_SECRET = '937it3ow87i4ery69876wqire'
REDIRECT_URI = 'https://nicememe.website'

def exchange_code(code):
  data = {
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET,
    'grant_type': 'authorization_code',
    'code': code,
    'redirect_uri': REDIRECT_URI,
    'scope': 'identify email connections'
  }
  headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  r = requests.post('%s/oauth2/token' % API_ENDPOINT, data=data, headers=headers)
  r.raise_for_status()
  return r.json()


*/

function changeTeamName(tournamentId, matchId, teamIndex, teamName, teamId){
  let url = '/tournaments/changeTeamName/'+tournamentId+'/'+matchId+'/'+teamIndex+'/'+teamId+'/'+teamName;
  fetchData(url, function(){
    updateLeaderboard(tournamentId);
  });
}

function changePoint(tournamentId, index, newPoint){
  let url = '/tournaments/changePoint/'+tournamentId+'/'+index+'/'+newPoint;
  fetchData(url, function(){
    updateLeaderboard(tournamentId, 'settings');
  });
}

function changeKeepTeamId(tournamentId, newValue){
  let url = '/tournaments/changeKeepTeamId/'+tournamentId+'/'+newValue;
  fetchData(url, function(){
    updateLeaderboard(tournamentId);
  });
}

function changeLeaderboardLevel(tournamentId, newValue){
  let url = '/tournaments/changeLeaderboardLevel/'+tournamentId+'/'+newValue;
  fetchData(url, function(){
    updateLeaderboard(tournamentId);
  });
}

function updateLeaderboard(tournamentId, loadPage){
  let leaderboardWrapper = document.getElementById('leaderboard');
  let leaderboardMatches = document.getElementById('matches');
  let btnLeaderboard = document.getElementById('btnLeaderboard');
  let btnMatches = document.getElementById('btnMatches');
  let btnSettings = document.getElementById('btnSettings');
  let btnAddMatch = document.getElementById('btnAddMatch');
  
  if(btnAddMatch){
    btnAddMatch.addEventListener('click', function(){
      leaderboardWrapper.innerHTML = '';
      let matchDiv = addNewMatch(tournamentId);
      leaderboardWrapper.appendChild(matchDiv);
    });
  }
  
  if(leaderboardWrapper){
    let url = '/tournaments/getTournament/'+tournamentId;
    fetchData(url, function(tournament){
      let url = '/users/getUser';
      fetchData(url, function(user){
        //if(tournament.matches){
          //if(tournament.matches.length > 0){
            let tour = new Tournament(tournament, user.username);
            
            btnLeaderboard.addEventListener('click', function(){
              leaderboardWrapper.innerHTML = '';
              if(tournament.settings.leaderboardLevel == 'team'){
                leaderboardWrapper.appendChild(tour.getTeams);
              }else{
                leaderboardWrapper.appendChild(tour.getPlayers);
              }
            });
            
            btnMatches.addEventListener('click', function(){
              leaderboardWrapper.innerHTML = '';
              leaderboardWrapper.appendChild(tour.getMatches);
            });
            
            btnSettings.addEventListener('click', function(){
              leaderboardWrapper.innerHTML = '';
              leaderboardWrapper.appendChild(tour.getSettings);
            });
            
            switch (loadPage){
              case 'matches':
                btnMatches.click();
                break;
              case 'settings':
                break;
              default:
                btnLeaderboard.click();
            }
          //}
        //}
      });
    });
  }
}

function fetchData(url, callback, type){

  let http = new XMLHttpRequest();
  let res = 0;
  http.open('GET', url, true);
  http.setRequestHeader('Accept','application/vnd.api+json');
  http.onreadystatechange = function() {
    if (http.readyState == 4) {
      if (http.status == 200) {
        if (type == 'html'){
          res = http.responseText;
        }else{
          res = JSON.parse(http.responseText);
        }
        callback(res);
      }
    }
  };
  http.send();
}

function getReplay(url, parent){
  
  //let url = '../../uploads/telemetry/'+telemetryId+'.json';
  fetchData(url, function(res) {
    
    let match = new Replay_Match(res);
    let mainContent = document.createElement('div');
    mainContent.classList.add('row');
    
    let slider = new Slider(match.start, match.end);
    let infobox = new InfoBox(slider, match);
    let map = new ActionMap(slider, match, infobox);
    
    slider.render(mainContent);
    map.render(mainContent);
    infobox.render(mainContent);
    match.scoreboard(mainContent);
    
    parent.innerHTML = '';
    parent.appendChild(mainContent);
    
    map.startReplay();
  });
}

function getMatchType(match){
  let url= 'https://api.playbattlegrounds.com/shards/steam/matches/'+match.id;
  
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

function runShow(type){
  var inputLists = document.getElementsByClassName('hide');
  var lists = [];
  for (let i = 0; i<inputLists.length; i++){
    lists.push(inputLists[i]);
    lists[i].style.opacity = 0.05;
    lists[i].classList.add('hide');
  }
  
  var k = 0;
  unfade(lists[k]);
  if(type=='all'){
    var showTime = 10000;
    
    setTimeout(function(){
      fade(lists[k]);
      k++;
      if(k==lists.length) k=0;
    },showTime);
    
    setInterval(function(){
      unfade(lists[k]);
      setTimeout(function(){
        fade(lists[k]);
        k++;
        if(k==lists.length) k=0;
      },showTime);
    },showTime + 1500);
  }
}

function fade(element) {
  var op = 1;
  var timer = setInterval(function () {
    if (op <= 0.05){
      clearInterval(timer);
      element.classList.add('hide');
    }
    element.style.opacity = op;
    element.style.filter = 'alpha(opacity=' + op * 50 + ")";
    op -= op * 0.05;
  }, 10);
}

function unfade(element) {
  var op = 0.05;
  element.classList.remove('hide');
  var timer = setInterval(function () {
    if (op >= 1){
      clearInterval(timer);
    }
    element.style.opacity = op;
    element.style.filter = 'alpha(opacity=' + op * 50 + ")";
    op += op * 0.05;
  }, 10);
}


//-----------------------------

function dailySummary(){
  let username = document.getElementById('username');
  makeRequest(username.value, function(res){
    handleRequestDailySummary(res);  
  });
}

function loadTelemetry(path){
  fetchData(path, function(data){
  	loadMatchData(data);
  });
}

function makeRequest(playerName, callback){
  let shards = ['steam']
  let p1 = [];

  for(let i=0;i<=shards.length-1;i++){
    let url = 'https://api.pubg.com/shards/'+shards[i]+'/players?filter[playerNames]='+playerName;
    p1.push(new Promise(function(resolve, reject){
      fetchData(url, function(res){
        resolve(res);
      });
    }))
  }

  Promise.all(p1).then(function(res){
    callback(res);
  })
}

function makeList(match, parent, playerId){
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  parent.innerText = '';
  parent.classList.add('align-middle');
  
  let matchInfo = new MatchInfo(match, playerId);

  let mapIcon = document.createElement('img');
  mapIcon.src = 'https://raw.githubusercontent.com/pubg/api-assets/master/Assets/Icons/Map/' + match.data.attributes.mapName + '.png'
  mapIcon.classList.add('mapIcon');//match.data.attributes.mapName);
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
      callback(el.attributes["URL"]);
    }
  });
}

function printList(res){
  let mainContent = document.getElementById('mainContent');
  let telemetry = document.getElementById('inputPath');
  let platform_region_shard = 'steam';
  let wrapper = document.createElement('div');
  wrapper.id = 'listOfMatches';
  mainContent.appendChild(wrapper);

  let playerId = res[0].data[0].id;

  res.forEach(function(result){
    result.data[0].relationships.matches.data.forEach(function(el){
      let match = document.createElement('div');

      match.innerText = 'Loading match...';
      match.classList.add('row','border','rounded','py-2','pl-2','my-1', 'mapCard');
      match.style.boxShadow = '1px 1px 5px 1px #888';
      match.style.margin = '10px';
      match.addEventListener('click', function(){
        telemetry.value = this.childNodes[7].innerText;
      })
      let url = `https://api.pubg.com/shards/steam/matches/${el.id}`;    
      
      fetchData2(url, function(res){
        makeList(res, match, playerId);
      });
      wrapper.appendChild(match);
    });
  });
}

function handleRequestDailySummary(res){
  let mainContent = document.getElementById('mainContent');

  let wrapper = document.createElement('div');
  wrapper.id = 'listOfMatches';
  mainContent.appendChild(wrapper);

  let playerId = res[0].data[0].id;
  let summary = new Summary(playerId);
  
  res.forEach(function(result){
    result.data[0].relationships.matches.data.forEach(function(el){
      let url = 'https://api.pubg.com/shards/steam/matches/'+el.id;    
      fetchData2(url, function(res){
        summary.addMatch(res);
      });
    });
  });
}

function getTimeFromDate(date){
  let hours = date.getHours();
  let minutes = date.getMinutes();

  if(hours<10) hours='0'+hours;
  if(minutes<10) minutes='0'+minutes;

  return hours + ':' + minutes;
}

function image(parent){
  let img = document.createElement('img');
  img.src = 'images/test.png';
  
  img.style.filter = 'invert(100%) '

  image = 'https://video-images.vice.com/articles/5ab12e8767e3900007fad121/lede/1521561327569-image1.png';

  Tesseract.recognize(image)
      .then(data => {
          console.log('then\n', data.text)
      })
      .catch(err => {
        console.log('catch\n', err);
      })
      .finally(e => {
        console.log('finally\n');
        process.exit();
      });
  parent.appendChild(img);
}

function fSvg(){
  let mainContent = document.getElementById('mainContent');

  let svg = document.createElementNS(SVG_NS, 'svg');
  svg.style.height = 100

  let circle = document.createElementNS(SVG_NS, 'circle');
  circle.style.r = 10;
  circle.style.stroke = 'red'
  circle.style.fill = 'grey'
  circle.style.strokeWidth = 3
  circle.setAttribute('transform', 'translate(50 50)');
  svg.appendChild(circle);

  circle = document.createElementNS(SVG_NS, 'circle');
  circle.classList.add('testCircle');
  circle.style.r = 10;
  circle.style.strokeWidth = 3
  circle.style.stroke = 'green';
  circle.style.fill = 'none';
  circle.style.strokeDashoffset = 63;
  circle.style.strokeDasharray = 62;
  circle.setAttribute('transform', 'translate(50 50) rotate(-90) ');
  svg.appendChild(circle);
  mainContent.appendChild(svg);
}

function interpolatePos(time, time1, pos1, time2, pos2, rev){
	let intFact = 0;

	if(time2 - time1 > 1){
	  if(rev==1) intFact = rev - (time-time1)/(time2-time1)
	  else intFact = (time-time1)/(time2-time1)
	}

	let newPos = {x:(1-intFact)*pos1.x + intFact * pos2.x, y:(1-intFact)*pos1.y + intFact * pos2.y};

	return newPos;
}

function toggle(element, toggleClass, override){
  let toggleFlag = false;
  if(override == true || override == false){
  	toggleFlag = !override;
  }else{
	  element.classList.forEach(function(cls){
		if(cls == toggleClass){	
		  toggleFlag = true;
		}
	  });
  }

  if(toggleFlag){
  	element.classList.remove(toggleClass);
  }else{
  	element.classList.add(toggleClass);
  }
}

function selectAll(elements){
  let oneChecked = false;

  elements.forEach(function(el){
	if(el.childNodes[1].checked) {oneChecked = true};	
  });
	
  elements.forEach(function(el){
	if(oneChecked){
	  el.childNodes[1].checked = false;
	  toggle(el,'activeButton', false);
	}else{
	  el.childNodes[1].checked = true
	  toggle(el,'activeButton', true);
	}
  });
}

function ce(element, classes){
  
  let newElement = document.createElement(element);
  
  if(classes){
    if(Array.isArray(classes)){
      classes.forEach(function(c){
        newElement.classList.add(c);
      });
    }else{
      newElement.classList.add(classes);
    }
  }
  
  return newElement;
}


function generate(node){
	/*let main = document.getElementById('div')
  main.style.position = 'relative';
  main.style.height = '175px'*/
  //main.style.background = '#55bab6';
  node.style.position = 'relative';
  node.style.height = '150px';
  let targetWidth = 1400;
  let targetHeight = node.offsetHeight;
  
  let div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.top = 0;
  div.style.left = 0;
  div.style.width = '100%';
  div.style.height = '100%';
  
  div.style.display = 'flex';
  div.style.backgroundImage = 'linear-gradient(to right, transparent -50%, '+ mainColor +' 100%)';
  
  let text = document.createElement('div');
  text.innerText = 'PUBG League';
  text.style.color = 'white';
  text.style.fontSize = '32px';
  text.style.padding = '15px 0px 15px 30px';
  text.style.margin = '15px';
  text.style.width = '100%';
  text.style.background = '#4c4b50';//'#55bab6';
  text.style.alignSelf = 'center';
  //text.style.border = '1px solid linear-gradient(to right, black 0%, transparent 100%)'
  //text.style.boxShadow = '0px 0px 25px 2px black';
  //text.style.borderRadius = '10px';
  
  //div.appendChild(text);
  
  let svg = document.createElementNS(xmlns,'svg');
  //svg.setAttribute('shape-rendering','crispEdges');
  svg.style.position = 'absolute';
  svg.style.top = 0;
  svg.style.left = 0;
  svg.classList.add('svgPattern');
  svg.style.width = '100%';
  svg.style.height = '100%';
  
  let defs = document.createElementNS(xmlns, 'defs');
  let gradient = document.createElementNS(xmlns, 'linearGradient')
  gradient.id = 'gradient';
  let stop1 = document.createElementNS(xmlns, 'stop');
  stop1.setAttribute('offset', '-50%');
  stop1.classList.add('gradientStop1');
  let stop2 = document.createElementNS(xmlns, 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.classList.add('gradientStop2');
  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);
  
  let clip = document.createElementNS(xmlns, 'clipPath');
  clip.id = 'clipXL';
  let path = document.createElementNS(xmlns, 'path');
  path.setAttribute('d','M-10 -10 75 75, -10 160, 1055 160, 1140 75, 1055 0Z');
  clip.appendChild(path);
  defs.appendChild(clip);
  
  clip = document.createElementNS(xmlns, 'clipPath');
  clip.id = 'clipL';
  path = document.createElementNS(xmlns, 'path');
  path.setAttribute('d','M-10 -10 75 75, -10 160, 875 160, 960 75, 875 0Z');
  clip.appendChild(path);
  //defs.appendChild(clip);
  
  clip = document.createElementNS(xmlns, 'clipPath');
  clip.id = 'clipM';
  path = document.createElementNS(xmlns, 'path');
  path.setAttribute('d','M-10 -10 75 75, -10 160, 645 160, 720 75, 645 0Z');
  clip.appendChild(path);
  //defs.appendChild(clip);
  
  clip = document.createElementNS(xmlns, 'clipPath');
  clip.id = 'clipS';
  path = document.createElementNS(xmlns, 'path');
  path.setAttribute('d','M-10 -10 75 75, -10 160, 455 160, 540 75, 455 0Z');
  clip.appendChild(path);
  //defs.appendChild(clip);  
  
  svg.appendChild(defs);
  
  
  let baseSize = 50;
  let depth = 40;
  let minSize = baseSize / 3;
  let points = [];
  
  let numRows = 100;
  let p;
  let cols=0, rows=0;
  
  do{
    p = {x:0,y:0,z:0}
    points[rows] = [];
    p.x = -10;
    if(rows==0) p.y = -10;
    else p.y = points[rows-1][0].y + Math.floor(Math.random() * baseSize) + baseSize / 2;
    p.z = Math.floor(Math.random() * depth) - depth/2;
    points[rows].push(p);
    rows++;
  }while(p.y < targetHeight + baseSize * 2)
  
  do{
    if(!cols==0){
      p = {x:0,y:0,z:0}
      p.x = points[0][cols-1].x + Math.floor(Math.random() * baseSize) + baseSize / 2;
      p.y = -10;
      p.z = Math.floor(Math.random() * depth) - depth/2;
      points[0].push(p);
    }
    cols++;
  }while(p.x < targetWidth + baseSize * 2)


  for(let i = 1; i <= rows-2; i++){
    for(let j = 1; j <= cols-2; j++){
      p = {x:0,y:0,z:0}
      let lowX = (points[0][j].x - points[0][j-1].x) / 2;
      let highX = (points[0][j+1].x - points[0][j].x) / 2;
      p.x = Math.floor(Math.random() * Math.min(Math.max(lowX + highX, baseSize / 4), baseSize)) + lowX + points[0][j-1].x;
      
      let lowY = (points[i][0].y - points[i-1][0].y) / 2;
      let highY = (points[i+1][0].y - points[1][0].y) / 2;
      p.y = Math.floor(Math.random() * Math.min(Math.max((lowY + highY) , baseSize / 4), baseSize)) + lowY + points[i-1][0].y;
      
      p.z = Math.floor(Math.random() * baseSize/2) - baseSize/4;
      
      points[i].push(p);
    
      createFromSquare(points[i-1][j-1],points[i-1][j],points[i][j-1],points[i][j],svg);
    }
	}
  
  let rect = document.createElementNS(xmlns, 'rect');
  rect.setAttribute('width',targetWidth);
  rect.setAttribute('height',targetHeight);
  rect.style.fill = 'url(#gradient)';
  rect.classList.add('polygon');
  
  svg.appendChild(rect);
  node.appendChild(svg);
  //node.appendChild(div);
}

function normal(p1, p2, p3){
  let u = {x:0,y:0,z:0};
  let v = {x:0,y:0,z:0};
  let n = {x:0,y:0,z:0};
  
  u.x = p2.x-p1.x;
  u.y = p2.y-p1.y;
  u.z = p2.z-p1.z;
  
  v.x = p3.x-p1.x;
  v.y = p3.y-p1.y;
  v.z = p3.z-p1.z;
  
  n.x = u.y*v.z - u.z*v.y;
  n.y = u.z*v.x - u.x*v.z;
  n.z = u.x*v.y - u.y*v.x;
  
  return n;
}

function angleBetween(p1, p2){
  let len1 = vectorLength(p1);
  let len2 = vectorLength(p2);
  
  let dotProduct = p1.x*p2.x + p1.y*p2.y + p1.z*p2.z;
  
  return Math.acos(dotProduct/len1/len2) * 180 / Math.PI;
}

function vectorLength(p){
  return Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z);
}

function createFromSquare(p1, p2, p3, p4, svg){
  let m1 = vectorDiff(p1,p4);
  let m2 = vectorDiff(p2,p3);
  let triangle1, triangle2;
  
  if(vectorLength(m2) <= vectorLength(m1)){  
    triangle1 = createPolygon(p1,p2,p3);
    triangle2 = createPolygon(p2,p4,p3);
  }else{
    triangle1 = createPolygon(p1,p2,p4);
    triangle2 = createPolygon(p1,p4,p3);
  }
  
  svg.appendChild(triangle1);
  svg.appendChild(triangle2);
}

function createPolygon(p1,p2,p3){
  let pol = document.createElementNS(xmlns,'polygon');
  let n = normal(p1,p2,p3);
  let angle = angleBetween(n, ligthVector);
  
  let val = 0
  val = 255 - angle / 180 * 255;
  let greyColor = 'rgb('+val+','+val+','+val+')';
  
  pol.style.fill = greyColor;
  pol.style.stroke = greyColor;
  pol.setAttribute('points', p1.x+','+p1.y+' '+p2.x+','+p2.y+' '+p3.x+','+p3.y);
  pol.classList.add('polygon');
  
  return pol;
}


function vectorDiff(p1, p2){
  let p = {x:0,y:0,z:0};
  p.x = p1.x - p2.x;
  p.y = p1.y - p2.y;
  p.z = p1.z - p2.z;
  
  return p;
}




/**
 * HSV to RGB color conversion
 *
 * H runs from 0 to 360 degrees
 * S and V run from 0 to 100
 * 
 * Ported from the excellent java algorithm by Eugene Vishnevsky at:
 * http://www.cs.rit.edu/~ncs/color/t_convert.html
 */
function hsvToRgb(h, s, v) {
	var r, g, b;
	var i;
	var f, p, q, t;
 
	// Make sure our arguments stay in-range
	h = Math.max(0, Math.min(360, h));
	s = Math.max(0, Math.min(100, s));
	v = Math.max(0, Math.min(100, v));
 
	// We accept saturation and value arguments from 0 to 100 because that's
	// how Photoshop represents those values. Internally, however, the
	// saturation and value are calculated from a range of 0 to 1. We make
	// That conversion here.
	s /= 100;
	v /= 100;
 
	if(s == 0) {
		// Achromatic (grey)
		r = g = b = v;
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
 
	h /= 60; // sector 0 to 5
	i = Math.floor(h);
	f = h - i; // factorial part of h
	p = v * (1 - s);
	q = v * (1 - s * f);
	t = v * (1 - s * (1 - f));
 
	switch(i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
 
		case 1:
			r = q;
			g = v;
			b = p;
			break;
 
		case 2:
			r = p;
			g = v;
			b = t;
			break;
 
		case 3:
			r = p;
			g = q;
			b = v;
			break;
 
		case 4:
			r = t;
			g = p;
			b = v;
			break;
 
		default: // case 5:
			r = v;
			g = p;
			b = q;
	}
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function matchRule(str, rule) {
  var escapeRegex = function(str){str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")};
  return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function updateItemlist(filter){
  if(!filter) filter='null';
  let url = '/items/'+filter;
  fetchData(url, function(items){
    printItemList(items)
  });
}

function printItemList(items){
  let res = document.getElementById('items');
  res.innerHTML='';
  let list = ce('div',['container','bgMain']);
  items.forEach(function(item){
    let row = ce('div','row');
    let cell = ce('div', 'col-4');
    let a = ce('a')
    a.href = 'https://classic.wowhead.com/item='+item.id;
    //data-wowhead='domain=classic&item=21702', data-entity='item', data-entity-has-icon='true')
    a.setAttribute('data-wowhead','domain=classic&item='+item.id);
    a.setAttribute('data-entity', 'item');
    a.setAttribute('data-entity-has-icon','true');
    //let img = ce('img')
    //img.src = 'https://classic.wowhead.com/item='+item.id;
    //a.appendChild(img);
    a.innerText = item.name;
    cell.appendChild(a);
    row.appendChild(cell);
    
    cell = ce('div', 'col');
    cell.innerText = item.slot;
    row.appendChild(cell);
    
    cell = ce('div', 'col');
    cell.innerText = item.drop;
    row.appendChild(cell);
    
    cell = ce('div', 'col');
    cell.innerText = item.zone;
    row.appendChild(cell);
    
    list.appendChild(row);
  });
  res.appendChild(list);
  $WowheadPower.refreshLinks();
  /*let script = ce('script')
  script.src = 'https://wow.zamimg.com/widgets/power.js';
  res.appendChild(script);*/
}
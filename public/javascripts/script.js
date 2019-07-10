var damageCauserList = new getJsonFromUrl('https://raw.githubusercontent.com/pubg/api-assets/master/dictionaries/telemetry/damageCauserName.json');
var itemNameList = new getJsonFromUrl('https://raw.githubusercontent.com/pubg/api-assets/master/dictionaries/telemetry/item/itemId.json');
var damageReasonList = new getJsonFromUrl('https://raw.githubusercontent.com/pubg/api-assets/master/enums/telemetry/damageReason.json');
var speed = 100;
var pubgColor = ['#0042a1', '#15931a', '#e16209', '#2096d1', '#4a148c', '#9f2b14', '#486a00', '#c51a56', '#9c6622', '#820045', 
                  '#d5b115', '#4ab3af', '#6b828d', '#f39700', '#37474f', '#e0648e', '#00736d', '#8a4803', '#7fb017', '#854ba1', 
                  '#38b27e', '#88abda', '#e58b65', '#2c276c', '#988e09'];


function loadFunction(){
  let username = document.getElementById('lu_username');
  let result = document.getElementById('result');
  let pathArray = window.location.pathname.split('/');
  let tournamentId = pathArray[pathArray.length-1];
  let keepTeamId = document.getElementById('keepTeamId');
  let leaderboardLevel = document.getElementById('leaderboardLevel');
  let lookupMatch = document.getElementById('lookupMatch');
  
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
  
  if(leaderboardLevel){
    console.log('change detected') 
  }
  
  if(lookupMatch){
    let content = addNewMatch();
    lookupMatch.appendChild(content);
  }
  
  updateLeaderboard(tournamentId);
  
  let flash = document.getElementById('flash');
  if(flash){
    setTimeout(function(){
      flash.classList.remove('show');
    }, 3000);
  }
}

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
  
  if(leaderboardWrapper){
    let url = '/tournaments/getTournament/'+tournamentId;
    fetchData(url, function(tournament){
      let url = '/users/getUser';
      fetchData(url, function(user){
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
        
        if(tour.isAdmin == true){
          btnAddMatch.addEventListener('click',function(){
            leaderboardWrapper.innerHTML = '';
            let matchDiv = addNewMatch(tournamentId);
            leaderboardWrapper.appendChild(matchDiv);
          });
        }
        
        switch (loadPage){
          case 'matches':
            btnMatches.click();
            break;
          case 'settings':
            break;
          default:
            btnLeaderboard.click();
        }
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


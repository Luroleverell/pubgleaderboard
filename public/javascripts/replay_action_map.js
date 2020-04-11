const SVG_NS = 'http://www.w3.org/2000/svg';

//In the documentation its statet that the map size is 816000 instead of 800000. 
//Based on tests locations fit better with 819200 for Erangel
const MAPSIZE_BIG = 819.200; 
const MAPSIZE_MEDIUM = 611.000//614.400;
const MAPSIZE_SMAL = 408.000;//409.600
const MAPSIZE_MINI = 204.000;
//const MAPSIZE_MICRO = 204.000;
const TRAILLENGTH = 100000; //NtS: make this a userinput
const ZONEBORDER = 2.000;

class ActionMap {
  constructor(slider, match, infoBox) {
    this.slider_ = slider;
    this.match_ = match;
    this.boundMouseDrag_ = this.onMouseDrag_.bind(this);
    this.dragging_ = false;
    this.infoBox_ = infoBox;
    this.startTime_ = this.match_.start.timestamp.getTime();
    
    this.element_ = document.createElement('div');
    this.element_.id = 'actionmap';
    this.svg_ = document.createElementNS(SVG_NS, 'svg');
    
    let pattern = document.createElementNS(SVG_NS, 'pattern');
    pattern.id = 'pattern1';
    pattern.setAttribute('width', '4');
    pattern.setAttribute('height', '13');
    pattern.setAttribute('patternUnits','userSpaceOnUse');
    let rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', '1');
    rect.setAttribute('width', '2');
    rect.setAttribute('height', '13');
    pattern.appendChild(rect);
    this.svg_.appendChild(pattern);
    
    this.map = document.createElementNS(SVG_NS, 'image');
    this.mapSize = 0;
    this.chooseMap();
    this.svg_.appendChild(this.map);
    
    this.markedPlayerName = '';
    this.playerCircles_ = [];
    this.playerTrails_ = [];
    this.dealDamageLines_ = [];
    this.numberOfTeams = 0;
    
    this.inter_ = null;
    this.speed_ = 100;
    
    match.players().forEach(function(player) {
      let trail = this.createTrailForPlayer_(player);
      this.playerTrails_.push(trail);
      this.svg_.appendChild(trail);
      this.numberOfTeams = Math.max(this.numberOfTeams, player.teamId);
    }, this);

    match.players().forEach(function(player) {
      let circle = this.createPlayer_(player);
      circle.addEventListener('click', this.onPlayerClick.bind(this));

      this.playerCircles_.push(circle);
      this.svg_.appendChild(circle);

      player.dealDamageEvents_.forEach(function(dmgEvent){
        let dmgLine = this.createDamageLine_(dmgEvent);
        this.dealDamageLines_.push(dmgLine);
      }, this);
    }, this);
    
    this.settings_ = document.createElement('div');
    this.settings_.classList.add('btn-group');

    let lbDisplayName = document.createElement('label');
    lbDisplayName.innerText = 'Show playername';

    let cbPlayerName = document.createElement('input');
    cbPlayerName.type = 'checkbox';
    cbPlayerName.classList.add('form-inline');
    cbPlayerName.addEventListener('click', this.changeDisplayName.bind(this));
    lbDisplayName.appendChild(cbPlayerName);

    let toggleButton = document.createElement('div');
    toggleButton.classList.add('btn-group-toggle');
    
    let lbDisplayDead = document.createElement('label');
    lbDisplayDead.classList.add('btn', 'activeButton', 'btn-info');
    lbDisplayDead.innerText = 'Show dead players';

    let cbDead = document.createElement('input');
    cbDead.type = 'checkbox';
    cbDead.classList.add('form-inline');
    cbDead.addEventListener('click', function(){
      this.changeDisplayDead()
      toggle(lbDisplayDead, 'activeButton');
    }.bind(this));
    lbDisplayDead.appendChild(cbDead);
    toggleButton.appendChild(lbDisplayDead);
    
    let btnPlay = document.createElement('button');
    btnPlay.classList.add('btn', 'btn-info');
    btnPlay.innerText = 'Pause';
    btnPlay.addEventListener('click', function(){
      this.startReplay();
      if(btnPlay.innerText == 'Play') 
        btnPlay.innerText = 'Pause';
      else
        btnPlay.innerText = 'Play';
    }.bind(this));

    let btnSpeed = document.createElement('button');
    btnSpeed.classList.add('btn', 'btn-info');
    btnSpeed.innerText = 'Speed x1';
    btnSpeed.addEventListener('click', function(){
      this.changeSpeed();
      if(btnSpeed.innerText == 'Speed x1')
        btnSpeed.innerText = 'Speed x5';
      else if (btnSpeed.innerText == 'Speed x5')
        btnSpeed.innerText = 'Speed x10';
      else
        btnSpeed.innerText = 'Speed x1';
    }.bind(this));

    let search = document.createElement('input');
    search.type = 'text';
    search.placeholder = 'Filter players by playername';
    search.addEventListener('input', function(){
      this.runSearch(search.value);
    }.bind(this));

    let trail = document.createElement('input');
    trail.type = 'text';
    trail.value = 10;
    
    this.trailLength = trail;
    this.settings_.appendChild(btnPlay);
    this.settings_.appendChild(btnSpeed);
    //this.settings_.appendChild(lbDisplayDead);
    this.settings_.appendChild(search);
    this.settings_.appendChild(toggleButton);
    

    this.redZone = document.createElementNS(SVG_NS, 'circle');
    this.redZone.classList.add('redZone');
    this.svg_.appendChild(this.redZone);

    this.whiteZone = document.createElementNS(SVG_NS, 'circle');
    this.whiteZone.classList.add('whiteZone');
    this.svg_.appendChild(this.whiteZone);

    this.blueZone = document.createElementNS(SVG_NS, 'circle');
    this.blueZone.classList.add('blueZone');
    this.svg_.appendChild(this.blueZone);

    let viewbox = this.svg_.createSVGRect();
    viewbox.width = this.mapSize;
    viewbox.height = this.mapSize;
    this.viewbox = viewbox;
    this.zoom;
    
    
    slider.addListener(this.onUpdate_.bind(this));
    this.svg_.addEventListener('wheel', this.onMouseWheel_.bind(this));
    this.svg_.addEventListener('mousedown', this.onMouseDown_.bind(this));
    document.addEventListener('mouseup', this.onMouseUp_.bind(this));

    this.dealDamageLines_.forEach(function(dmgLine){
      this.svg_.appendChild(dmgLine.line);
    }, this);

    this.element_.appendChild(this.svg_);
  }
  
  changeDisplayName(){
    let el = Array.from(document.getElementsByClassName('playerNameGroup'));
    el.forEach(function(node){
      if(node.style.display == 'none' || !node.style.display) node.style.display = 'inline';
      else node.style.display = 'none';
    });
  }

  changeDisplayDead(){
    this.onUpdate_();
  }

  render(parent) {
    parent.appendChild(this.settings_);
    parent.appendChild(this.element_);
  }

  onUpdate_() {
    let time = this.slider_.getDate();
    let gameState = this.match_.gameStateAtTime(time);
    let scale = this.viewbox.width / this.mapSize;
    let trailLength = this.trailLength.value * 10000;

    this.match_.players().forEach(function(player, index) {
      let trailPos = player.trailAtTime(time, TRAILLENGTH, this.startTime_);
      let trail = this.playerTrails_[index];
      trail.setAttributeNS(null,'d', trailPos);
      trail.setAttributeNS(null,'stroke-width', ZONEBORDER / MAPSIZE_BIG * this.mapSize * scale);
    }, this);

    this.dealDamageLines_.forEach(function(dmgLine){
      if(dmgLine.timestamp.getTime() > time.getTime()-500 && dmgLine.timestamp.getTime() <= time.getTime()+500){
        dmgLine.line.classList.remove('hidden');
      }else{
        dmgLine.line.classList.add('hidden');
      }
      dmgLine.line.setAttributeNS(null,'stroke-width', ZONEBORDER / MAPSIZE_BIG * this.mapSize * scale);
    }, this);

    this.match_.players().forEach(function(player, index) {
      let scale = this.viewbox.width / this.mapSize * this.mapSize / MAPSIZE_BIG;
      let pos = player.locationAtTime(time);
      let health = player.healthAtTime(time);
      let circle = this.playerCircles_[index];
      circle.childNodes[2].style.strokeDashoffset = (1-health/100) * 82;
      if(!pos == 0) circle.setAttribute('transform', 'translate(' + pos.x / 1000 + ' ' + pos.y / 1000 + ') scale(' + scale + ')');

      let deadClass='deadNone';
      if(this.settings_.childNodes[3].childNodes[0].childNodes[1].checked) deadClass = 'dead';
      circle.classList.remove('deadNone');
      circle.classList.remove('dead');

      if (!player.isAlive(time)){
        circle.classList.add(deadClass);
        circle.childNodes[3].setAttribute('href', 'https://raw.githubusercontent.com/pubg/api-assets/master/Assets/Icons/Killfeed/Death.png');
      }else if (player.isGroggy(time)){
        circle.childNodes[3].setAttribute('href', 'https://raw.githubusercontent.com/pubg/api-assets/master/Assets/Icons/Killfeed/Groggy.png');
      }else if(player.inParachute(time)){
        circle.childNodes[3].setAttribute('href', '../../images/parachute.png');
      }else{
        circle.childNodes[3].setAttribute('href', '');
      }

      //this.infoBox_.setNew(this.markedPlayerName);
      
      this.updateZone(this.redZone, gameState.redZone, scale);
      this.updateZone(this.whiteZone, gameState.whiteZone, scale);
      this.updateZone(this.blueZone, gameState.blueZone, scale);
    }, this);
  }

  createPlayer_(player) {
    let group = document.createElementNS(SVG_NS, 'g');
    group.classList.add('playerTag');
    group.id = player.name;
    group.setAttribute('data-teamId', player.teamId);

    let base = document.createElementNS(SVG_NS, 'circle');
    base.classList.add('base');
    
    let selected = document.createElementNS(SVG_NS, 'circle');
    selected.classList.add('select','hidden');
    
    let pattern = document.createElementNS(SVG_NS, 'circle');
    pattern.classList.add('pattern');
    pattern.setAttribute('fill', 'url(#pattern1)');
    //let c = hslToRgb(player.teamId/this.numberOfTeams, 1, 0.5);
    let index = 0;
    if (player.teamId - 25 <= 0 || this.match_.teamSize == 1) {
      index = player.teamId;
      pattern.setAttribute('fill-opacity', '0');
    }else{ 
      index = player.teamId - 25;
      pattern.setAttribute('fill-opacity', '0.5');
    }
    if(this.match_.teamSize > 1) base.style.fill = pubgColor[index - 1];

    let health = document.createElementNS(SVG_NS, 'circle');
    health.classList.add('health');
    
    let name = document.createElementNS(SVG_NS, 'text');
    name.classList.add('name');
    name.textContent = String(player.name);
    name.style.fontSize = 16;
    name.setAttribute('transform', 'translate(20, 5)');
    
    let imgStatus = document.createElementNS(SVG_NS, 'image');
    imgStatus.setAttributeNS(null, 'width', 26);
    imgStatus.setAttributeNS(null, 'height', 26);
    imgStatus.setAttribute('transform', 'translate(-13 -13)');

    //group.appendChild(selected);
    group.appendChild(base);
    group.appendChild(pattern);
    group.appendChild(health);
    group.appendChild(imgStatus);
    group.appendChild(name);
    group.setAttribute('transform', 'scale('+ this.mapSize/MAPSIZE_BIG +')');
    return group;
  }

  createDamageLine_(event){
    let line = document.createElementNS(SVG_NS, 'line');
    let posA = event.data.attacker.location;
    let posB = event.data.victim.location;
    if (!posA.x == 0){
      line.setAttribute('x1',posA.x / 1000);
      line.setAttribute('y1',posA.y / 1000);
      line.setAttribute('x2',posB.x / 1000);
      line.setAttribute('y2',posB.y / 1000);
      line.setAttribute('stroke', 'red');
    }
    //line.classList.add('hidden');
    return {timestamp:event.timestamp, line:line};
  }

  createTrailForPlayer_(player){
    let path = document.createElementNS(SVG_NS, 'path');
    path.classList.add('playerTrail');
    return path;
  }

  onMouseDown_(e) {
    this.dragging_ = true;
    this.lastX_ = e.pageX;
    this.lastY_ = e.pageY;
    document.addEventListener('mousemove', this.boundMouseDrag_);
  }

  onMouseUp_(e) {
    if (this.dragging_) {
      document.removeEventListener('mousemove', this.boundMouseDrag_);
      this.dragging_ = false;
    }
  }

  onMouseDrag_(e) {
    e.stopPropagation();
    e.preventDefault();

    let newViewbox = this.viewbox;
    newViewbox.x = newViewbox.x - (e.pageX - this.lastX_) * newViewbox.width / this.svg_.clientWidth;
    newViewbox.x = Math.max(newViewbox.x, 0);
    newViewbox.x = Math.min(newViewbox.x, this.mapSize - newViewbox.width);

    newViewbox.y = newViewbox.y - (e.pageY - this.lastY_) * newViewbox.height / this.svg_.clientHeight;
    newViewbox.y = Math.max(newViewbox.y, 0);
    newViewbox.y = Math.min(newViewbox.y, this.mapSize - newViewbox.height);
    
    this.viewbox = newViewbox;

    this.lastX_ = e.pageX;
    this.lastY_ = e.pageY;
  }

  onMouseWheel_(e) {
    e.preventDefault();
    
    clearInterval(this.zoom);
    let limitWidth = this.viewbox.width;
    
    this.zoom = setInterval(function(){
      if (e.deltaY == 0) {
        return;
      }
      
      let newViewbox = this.viewbox;
      if (e.deltaY < 0) {    
        newViewbox.width /= 1.1;
        newViewbox.height /= 1.1;
        if(newViewbox.width <= limitWidth / 2){
          clearInterval(this.zoom);
        }
      } else {
        if (newViewbox.width >= this.mapSize){
          clearInterval(this.zoom);
        }else{
          newViewbox.width *= 1.1;
          newViewbox.height *= 1.1;
          if(newViewbox.width >= limitWidth * 2){ 
            clearInterval(this.zoom);
          }
        }
      }

      let clickOnScreenX = e.offsetX / this.svg_.clientWidth;
      let clickOnScreenY = e.offsetY / this.svg_.clientHeight;
      let clickX = this.viewbox.x + this.viewbox.width * clickOnScreenX;
      let clickY = this.viewbox.y + this.viewbox.height * clickOnScreenY;
      newViewbox.x = Math.min(Math.max(clickX - newViewbox.width * clickOnScreenX, 0), this.mapSize - newViewbox.width);
      newViewbox.y = Math.min(Math.max(clickY - newViewbox.height * clickOnScreenY, 0), this.mapSize - newViewbox.height);

      this.viewbox = newViewbox;
    }.bind(this),5);
    
    return false;
  }

  get viewbox() {
    return this.copyViewbox_(this.viewBox_);
  }

  set viewbox(box) {
    this.viewBox_ = this.copyViewbox_(box);
    this.svg_.setAttribute('viewBox', box.x + ' ' + box.y + ' ' + box.width + ' ' + box.height);
    this.onUpdate_();
  }

  copyViewbox_(viewbox) {
    let ret = this.svg_.createSVGRect();
    ret.x = viewbox.x;
    ret.y = viewbox.y;
    ret.width = viewbox.width;
    ret.height = viewbox.height;
    return ret;
  }

  updateZone(el, z, scale){
    el.setAttributeNS(null, 'cx', this.checkNull(z.x));
    el.setAttributeNS(null, 'cy', this.checkNull(z.y));
    el.setAttributeNS(null, 'r', this.checkNull(z.r));
    el.setAttributeNS(null, 'stroke', z.color);
    el.setAttributeNS(null, 'stroke-width', ZONEBORDER * scale); // 1/ MAPSIZE_BIG * this.mapSize 
  }

  checkNull(el){
    if (el == null) return 0
    return el/1000;
  }

  chooseMap(){
    let mapName = this.match_.mapName();
    let mapSize, mapUrl;
    switch (mapName) {
      case 'Erangel_Main':
        mapSize = MAPSIZE_BIG;
        mapUrl = 'https://github.com/pubg/api-assets/raw/master/Assets/Maps/Erangel_Main_High_Res.png';
        break;
      case 'Baltic_Main':
        mapSize = MAPSIZE_BIG;
        mapUrl = 'https://github.com/pubg/api-assets/raw/master/Assets/Maps/Erangel_Remastered_Main_High_Res.png';
        break;
      case 'Desert_Main':
        mapSize = MAPSIZE_BIG;
        mapUrl = 'https://github.com/pubg/api-assets/raw/master/Assets/Maps/Miramar_Main_High_Res.png';
        break;
      case 'Savage_Main':
        mapSize = MAPSIZE_SMAL;
        mapUrl = 'https://github.com/pubg/api-assets/raw/master/Assets/Maps/Sanhok_Main_High_Res.png';
        break;
      case 'Range_Main':
        mapSize = MAPSIZE_MINI;
        mapUrl = 'https://github.com/pubg/api-assets/raw/master/Assets/Maps/Camp_Jackal_Main_High_Res.png';
        break;
      case 'DihorOtok_Main':
        mapSize = MAPSIZE_MEDIUM;
        mapUrl = 'https://github.com/pubg/api-assets/raw/master/Assets/Maps/Vikendi_Main_High_Res.png';
        break;
      case 'Summerland_Main':
        mapSize = MAPSIZE_MINI;
        mapUrl = 'https://github.com/pubg/api-assets/raw/master/Assets/Maps/Karakin_Main_High_Res.png';
        break;
      default:
        console.log(mapName);
        break;
    }
    //mapUrl = 'https://github.com/pubg/api-assets/raw/master/Assets/Maps/' +mapName+ '_Low_Res.png';

    this.map.setAttribute('width', mapSize);
    this.map.setAttribute('height', mapSize);
    this.map.setAttribute('href', mapUrl);
    this.mapSize = mapSize;
  }

  onPlayerClick(node){
    let nyNode = node.path[1]
    this.markedPlayerName = nyNode.id;
    this.infoBox_.setNew(this.markedPlayerName);
    this.markTeam(nyNode.getAttribute('data-teamId'));
  }

  markTeam(teamId){
    let markedPlayer;
    this.playerCircles_.forEach(function(pc){
      if(this.markedPlayerName == pc.id){

        markedPlayer = pc;
        pc.classList.add('selected');
        pc.classList.remove('selectedTeam');
      }else{
        if(pc.getAttribute('data-teamId') == teamId){
          pc.classList.add('selectedTeam');
          pc.classList.remove('selected');
          pc.parentElement.appendChild(pc);
        }else{
          pc.classList.remove('selectedTeam');
          pc.classList.remove('selected');
        }
      }
    }, this)
    markedPlayer.parentElement.appendChild(markedPlayer);
  }

  runSearch(searchText){
    this.match_.players().forEach(function(player, index) {
      let circle = this.playerCircles_[index];
      let trail = this.playerTrails_[index];

      circle.classList.remove('hiddenS');
      trail.classList.remove('hiddenS');

      if(!player.name.match(new RegExp(searchText,'i'))){
        circle.classList.add('hiddenS');
        trail.classList.add('hiddenS');
      }
    }, this);
  }
  
  changeSpeed(){
    if(this.speed_ == 100) this.speed_ = 500
    else if(this.speed_ == 500) this.speed_ = 1000
    else this.speed_ = 100
  }

  startReplay(){
    if(this.inter_){
       clearInterval(this.inter_);
       this.inter_ = null;
    }else{
      this.inter_ = setInterval(function(){
        this.slider_.setValue(this.slider_.getValue() + this.speed_);
        this.slider_.onupdate();
      }.bind(this), 100);
    }
  }
}
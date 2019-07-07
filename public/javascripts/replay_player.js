class Replay_Player {
  constructor(createEvent) {
    this.positionEvents_ = [];
    this.equipEvents_ = [];
    this.unequipEvents_ = [];
    this.dealDamageEvents_ = [];
    this.takeDamageEvents_ = [];
    this.itemUseEvents_ = [];
    this.deathEvent_ = 0;
    this.groggyEvents_ = [];
    this.reviveEvents_ = [];
    this.killEvents_ = [];
    this.knockoutEvents_ = [];
    this.attackEvents_ = [];
    this.pickUpEvents_ = [];
    this.dropEvents_ = [];
    this.equipmentEvents_ = [];
    this.healthEvents_ = [];
    this.landingEvent_;
    this.leaveVehicleEvents_ = [];
    this.rideVehicleEvents_ = [];
    this.character_ = createEvent.character;
    this.characterEvents_ = [];
    this.kills_ = 0;
    this.dead_ = 0;
    this.rank_ = 0;
    this.leavePlane_;
    this.weapons_ = new Map();
    this.equipment_ = new Map();
    this.hitZone_ = new Map();
    this.victims_ = new Map();
  }

  toString() {
    return this.character_.name;
  }

  get name() {
    return this.character_.name;
  }

  get teamId() {
    return this.character_.teamId;
  }

  get kills() {
    return this.killEvents_.length;
  }

  get rank(){
    return this.rank_;
  }

  get dead(){
    return this.dead_;
  }

  addPositionEvent(event) {
    this.positionEvents_.push(event);
  }

  addDeathEvent(event) {
    this.deathEvent_ = event;
    this.dead_ = 1;
  }

  addKillEvent(event) {
    this.killEvents_.push(event);
    this.kills_ += 1;
    this.getWeapon(event).addKillEvent(event);
  }

  addGroggyEvent(event){
    this.groggyEvents_.push(event);
  }

  addReviveEvent(event){
    this.reviveEvents_.push(event);
  }

  addEquipEvent(event){
    this.equipEvents_.push(event);
  }

  addUnequipEvent(event){
    this.unequipEvents_.push(event);
  }

  addArmorDestroyEvent(event){
    this.equipmentEvents_.push(event);
  }

  addPickUpEvent(event){
    this.pickUpEvents_.push(event);
    this.equipmentEvents_.push(event);
  }

  addDropEvent(event){
    this.dropEvents_.push(event);
    this.equipmentEvents_.push(event);
  }

  addRank(rank){
    this.rank_ = rank;
  }
  
  addHealthEvent(event){
    this.healthEvents_.push(event);
  }
  
  addLandingEvent(event){
    this.landingEvent_ = event;
  }
  
  addLeaveVehicleEvent(event){
    this.leaveVehicleEvents_.push(event);
    if(event.data.vehicle.vehicleType == 'TransportAircraft') this.leavePlane_ = event;
  }
  
  addRideVehicleEvent(event){
    this.rideVehicleEvents_.push(event);
  }

  addDealDamageEvent(event){
    let knockout = 0;
    let zone = event.data.damageReason;
    let victim = event.data.victim.name;
    this.dealDamageEvents_.push(event);
    this.getWeapon(event).addDamageEvent(event);
    
    if(!event.data.damage==0){
      if(!this.hitZone_.has(zone)) this.hitZone_.set(zone, {hits: 0, damage: 0, hit: []});
      this.hitZone_.get(zone).hits += 1;
      this.hitZone_.get(zone).damage += event.data.damage;
      if(event.data.damage >= event.data.victim.health && event.data.damage > 0){knockout=1}
      this.hitZone_.get(zone).hit.push({victim: event.data.victim.name, damage: event.data.damage, knockout: knockout})

      if(!this.victims_.has(victim)) this.victims_.set(victim, []);
      this.victims_.get(victim).push(event);
    }

  }
  
  addTakeDamageEvent(event){
    this.takeDamageEvents_.push(event);
  }

  addKnockoutEvent(event){
    this.knockoutEvents_.push(event);
    this.getWeapon(event).addKnockoutEvent(event);
  }
  
  addAttackEvent(event){
    this.attackEvents_.push(event);
    this.getWeapon(event, true).addAttackEvent(event);
  }

  addItemUseEvent(event){
    this.itemUseEvents_.push(event);
  }
  
  addCharacterEvent(event){
    this.characterEvents_.push(event);
  }

  getWeapon(event, useItemName){
    let sName;
    let weaponName = (useItemName ? event.data.weapon.itemId : event.data.damageCauserName) || '';
    if(weaponName){
      if(useItemName){
        sName = itemNameList.list[weaponName];
      }else{
        sName = damageCauserList.list[weaponName];
      }
    }
    
    if(!sName) sName = 'Other';

    if(!this.weapons_.has(sName)) this.weapons_.set(sName, new Weapon(sName))
    return this.weapons_.get(sName);
  }

  render(parent){
    let imgPath = 'https://github.com/pubg/api-assets/raw/master/Assets/Icons/Item/Weapon/Main/';
    let t2 = document.createElement('table');
    t2.classList.add('table','playerSummary');
    let th = document.createElement('tbody');
    t2.appendChild(th);
    let r = th.insertRow();
    let c = r.insertCell();
    c.width = '20%';
    c.innerHTML = this.name;

    let c2 = r.insertCell();
    
    let thead = ['Bullets fired', 'Hits', 'Headshots', 'Damage', 'Knockouts', 'Kills']
    let t = document.createElement('table');
    t.classList.add('table', 'table-striped');
    th = t.createTHead();
    r = th.insertRow();
    c = r.insertCell();
    c.innerHTML = 'Weapon';
    c.width = '30%';
    
    for(let i=0; i<=thead.length-1; i++){
      c = r.insertCell();
      c.innerHTML = thead[i];
    }
    
    let tb = document.createElement('tbody')
    t.appendChild(tb);

    //let weaponList = this.weapons_.getWeaponList;
    this.weapons_.forEach(function(w){
      r = tb.insertRow();
      r.setAttribute('data-target', '#_'+this.name + '-' + w.weaponName.replace(/ /g,'_'))
      r.setAttribute('data-toggle', 'collapse')
      r.className = 'clickable';

      c = r.insertCell();
      let img = document.createElement('img')
      img.setAttribute('src', imgPath + w.itemName + '.png');
      img.style.height= '20px';
      img.style.filter = 'brightness(50%) saturate(200%) hue-rotate(90deg)'
      c.appendChild(img);
      c.innerHTML = w.weaponName;

      c = r.insertCell();
      c.innerHTML = w.bulletsFired;

      c = r.insertCell();
      c.innerHTML = w.hits;

      c = r.insertCell();
      c.innerHTML = w.headshots;

      c = r.insertCell();
      c.innerHTML = w.damage;
            
      c = r.insertCell();
      c.innerHTML = w.knockouts;
      
      c = r.insertCell();
      c.innerHTML = w.kills;

      r = tb.insertRow();
      r.id = '_' + this.name + '-' + w.weaponName.replace(/ /g,'_');
      r.className = 'collapse';

      c = r.insertCell();
      c.colSpan = 7;

        let div = document.createElement('div')
        //div.id = this.name + '-' + w.weaponName;
        //div.classList.add('container')
        let t3 = document.createElement('table');
        t3.className = 'table';
        t3.style = 'width:100%;';
        
        let th = t3.createTHead();
        let r3 = th.insertRow();
        let c3 = r3.insertCell();
        c3.innerHTML = 'Player';
        c3 = r3.insertCell();
        c3.innerHTML = 'Damage';
        c3 = r3.insertCell();
        c3.innerHTML = 'Knockout';
        c3 = r3.insertCell();
        c3.innerHTML = 'Killed';

        let tb2 = document.createElement('tbody');
        t3.appendChild(tb2);

        w.victims_.forEach(function(v, key){
          r3 = tb2.insertRow();
          c3 = r3.insertCell();
          c3.innerHTML = key;

          c3 = r3.insertCell();
          c3.innerHTML = v.damage;

          c3 = r3.insertCell();
          c3.innerHTML = v.knockedOut;

          c3 = r3.insertCell();
          c3.innerHTML = v.killed;
        }, this)
        div.appendChild(t3);
        c.appendChild(div)
        //tb.appendChild(c);
    }, this)
    
    c2.appendChild(t);
    parent.appendChild(t2);
  }

  /*renderWeaponStats(parent, value, type){
    let wrapper = document.createElement('div');
    wrapper.classList.add('row')

    let divWeapons = document.createElement('div');
    divWeapons.innerText = 'Filter weapon'
    this.weapons_.forEach(function(weapon, key){
      if(weapon.damage > 0){
        let divWeapon = document.createElement('div');
        divWeapon.innerText = key;
        divWeapons.appendChild(divWeapon);
      }
    }, this);
    divWeapons.classList.add('fl','col');
        
    let divHitZones = document.createElement('div');
    divHitZones.innerText = 'Hit zones'
    damageReasonList.list.forEach(function(dr){
      let divHitZone = document.createElement('div');
      divHitZone.classList.add('row');
      
      let hitZone = this.hitZone_.get(dr) || {damage:0,hits:0};
      let text = document.createElement('div');
      text.innerText = dr;
      text.classList.add('fl','col-6');
      
      let dmg = document.createElement('div');
      dmg.classList.add('fl','col-3');
      dmg.innerText = Math.round(hitZone.damage);
      
      let hits = document.createElement('div');
      hits.classList.add('fl','col-3');
      hits.innerText = Math.round(hitZone.hits);
      
      divHitZone.appendChild(text);
      divHitZone.appendChild(hits);
      divHitZone.appendChild(dmg);
      divHitZones.appendChild(divHitZone);
    }, this);
      
    divHitZones.classList.add('fl', 'col');
    
    let divTargets = document.createElement('div');
    divTargets.innerText = 'Filter victims';
    this.victims_.forEach(function(value, key){
      let victim = document.createElement('div');
      victim.innerText = key;
      victim.addEventListener('click', function(){
        renderWeaponStats(parent, key, 'w');
      });
      divTargets.appendChild(victim);
    }, this);
    divTargets.classList.add('fl', 'col');
    
    wrapper.appendChild(divWeapons);
    wrapper.appendChild(divHitZones);
    wrapper.appendChild(divTargets);
    parent.appendChild(wrapper);
  }*/

  renderWeaponStats(parent){
    let filteredEvents = [];
    let weapons = [];
    let victims = [];
    
    let wrapper = ce('div','container')

    let playerName = ce('h3');
    playerName.innerText = this.name;

    let iWrapper = ce('div', ['row', 'weaponStats']);

    let divHitZones = ce('div',['fl', 'col']);
    divHitZones.innerText = 'Hit zones';
    
    let divWeapons = ce('div',['fl','col']);
    let headerRowWeapon = ce('div','row');
    
    let headerWeapons = ce('div', 'col');
    headerWeapons.innerText = 'Weapons used';
    headerRowWeapon.appendChild(headerWeapons);

    let weaponLabels = [];
    let btnSelectAllWeapons = ce('div', ['col-1','btnClear']);
    btnSelectAllWeapons.innerText='+';
    btnSelectAllWeapons.addEventListener('click', function(){
      selectAll(weaponLabels);
      this.sumHits(divHitZones);
    }.bind(this));
    headerRowWeapon.appendChild(btnSelectAllWeapons);
    
    let knocksHeader = ce('div','col-2');
    knocksHeader.innerText = 'KD';
    headerRowWeapon.appendChild(knocksHeader);
    let killsHeader = ce('div','col-2');
    killsHeader.innerText = 'Kills';
    headerRowWeapon.appendChild(killsHeader);
    
    divWeapons.appendChild(headerRowWeapon);
    
    this.weapons_.forEach(function(value, key){
      //if(value.damage > 0){
        let divWeapon = ce('div', 'row');
        
        let divWeaponBtn = ce('div',['btn-group-toggle', 'col']);

        let lbWeapon = ce('label',['btn','btn-sm','activeButton','btn-block']);
        weaponLabels.push(lbWeapon);
        
        let weapon = ce('input');
        weapon.type = 'checkbox';
        weapon.name = 'weapons' + this.name;
        weapon.autocomplete = 'off';
        weapon.checked = true;
        weapon.addEventListener('click', function(){
          toggle(lbWeapon, 'activeButton');
          this.sumHits(divHitZones);
        }.bind(this));

        lbWeapon.innerText = key;
        lbWeapon.appendChild(weapon);
        divWeaponBtn.appendChild(lbWeapon);
        divWeapon.appendChild(divWeaponBtn);
        
        let knockouts = 0;
        this.knockoutEvents_.forEach(function(e){
          if(damageCauserList.list[e.data.damageCauserName] == key){
            knockouts += 1;
          }
        });
        
        let kills = 0;
        this.killEvents_.forEach(function(e){
          if(damageCauserList.list[e.data.damageCauserName] == key){
            kills += 1;
          }
        });
        
        let divKnocks = ce('div', 'col-2');
        divKnocks.innerText = knockouts;
        divWeapon.appendChild(divKnocks);
        
        let divKills = ce('div', 'col-2');
        divKills.innerText = kills;
        divWeapon.appendChild(divKills);
        
        divWeapons.appendChild(divWeapon);
      //}
    }, this);
    
    let divVictims = ce('div', ['fl', 'col']);
    let headerRowVictim = ce('div', 'row');
    
    let headerVictims = ce('div', 'col');
    headerVictims.innerText = 'Victims';
    headerRowVictim.appendChild(headerVictims);
    
    let victimLabels = [];
    let btnSelectAll = ce('div', ['col-1','btnClear']);
    btnSelectAll.innerText = '+';
    btnSelectAll.addEventListener('click', function(){
      selectAll(victimLabels);
      this.sumHits(divHitZones);
    }.bind(this));
    headerRowVictim.appendChild(btnSelectAll);
    
    let knocksHeaderVictim = ce('div','col-2');
    knocksHeaderVictim.innerText = 'KD';
    headerRowVictim.appendChild(knocksHeaderVictim);
    let killsHeaderVictim = ce('div','col-2');
    killsHeaderVictim.innerText = 'Kills';
    headerRowVictim.appendChild(killsHeaderVictim);
  
    divVictims.appendChild(headerRowVictim);

    this.victims_.forEach(function(value, key){
      let divVictim = ce('div','row');
      
      let divVictimBtn = ce('div',['btn-group-toggle','col']);

      let lbVictim = ce('label',['btn','btn-sm','activeButton','btn-block']);
      victimLabels.push(lbVictim);
      
      let victim = ce('input');
      victim.type = 'checkbox';
      victim.name = 'victims' + this.name;
      victim.autocomplete = 'off';
      victim.checked = true;
      victim.addEventListener('click', function(){
        toggle(lbVictim, 'activeButton');
        this.sumHits(divHitZones);
      }.bind(this));

      lbVictim.innerText = key;
      lbVictim.appendChild(victim);
      divVictimBtn.appendChild(lbVictim);
      divVictim.appendChild(divVictimBtn);
      
      let knockouts = 0;
      this.knockoutEvents_.forEach(function(e){
        if(e.data.victim.name == key){
          knockouts += 1;
        }
      });
      
      let kills = 0;
      this.killEvents_.forEach(function(e){
        if(e.data.victim.name == key){
          kills += 1;
        }
      });
      
      let divKnocks = ce('div', 'col-2');
      divKnocks.innerText = knockouts;
      divVictim.appendChild(divKnocks);
      
      let divKills = ce('div', 'col-2');
      divKills.innerText = kills;
      divVictim.appendChild(divKills);
      
      divVictims.appendChild(divVictim);
    }, this);

    
    iWrapper.appendChild(divVictims);
    iWrapper.appendChild(divWeapons);
    iWrapper.appendChild(divHitZones);
    
    wrapper.appendChild(playerName);
    wrapper.appendChild(iWrapper);

    parent.appendChild(wrapper);
    this.sumHits(divHitZones);
  }

  sumHits(parent){
    let damage = [];
    let hits = [];
    let filteredEvents = [];
    let filter = [];

    let checkboxesVictims = document.getElementsByName('victims' + this.name);
    checkboxesVictims.forEach(function(cb){
      if(cb.checked) filter.push(cb.labels[0].innerText);
    })

    let checkboxesWeapons = document.getElementsByName('weapons' + this.name);
    checkboxesWeapons.forEach(function(cb){
      if(cb.checked) filter.push(cb.labels[0].innerText);
    })
    
    this.dealDamageEvents_.forEach(function(e){
      let bVictim = false;
      let bWeapon = false;
      
      if(e.data.damage > 0){
        if(filter[0] == ''){
          bVictim = true;
          bWeapon = true;
        }else{
          filter.forEach(function(v){
            if(e.data.victim.name == v){
              bVictim = true;
            }
            if(damageCauserList.list[e.data.damageCauserName] == v){
              bWeapon = true;
            }
          });
        }
      }

      if(bVictim && bWeapon){
        filteredEvents.push(e);
      }
    });

    damageReasonList.list.forEach(function(hitZone,i){
      damage[i] = 0;
      hits[i] = 0;
    });

    filteredEvents.forEach(function(e){
      damageReasonList.list.forEach(function(hitZone,i){
        if(e.data.damageReason==hitZone){
          hits[i] += 1;
          damage[i] += e.data.damage;
        }
      });
    });

    let divHitZone = document.createElement('div');
    divHitZone.classList.add('row');

    let header = document.createElement('div');
    header.classList.add('col-12');
    header.innerText = 'Hit zones';
    divHitZone.appendChild(header);

    damageReasonList.list.forEach(function(hitZone, i){
      let text = document.createElement('div');
      text.innerText = hitZone;
      text.classList.add('fl','col-6');

      let divHits = document.createElement('div');
      divHits.classList.add('fl','col-3');
      divHits.innerText = Math.round(hits[i]);
      
      let divDamage = document.createElement('div');
      divDamage.classList.add('fl','col-3');
      divDamage.innerText = Math.round(damage[i]);


      divHitZone.appendChild(text);
      divHitZone.appendChild(divHits);
      divHitZone.appendChild(divDamage);
    });   
    parent.innerHTML = '';
    parent.appendChild(divHitZone);
  }

  isAlive(time){
    if (this.deathEvent_ == 0) return true;
    return (this.deathEvent_.timestamp > time);
  }

  isGroggy(time){
    if(this.isAlive(time) && this.healthAtTime(time)<=0) 
      return true;
    else
      return false;
  }

  locationAtTime(time) {
    if(this.characterEvents_[0]){
      let loc = this.characterEvents_[0].character.location;
      let n = this.characterEvents_.length-1;
      if(this.characterEvents_[n].timestamp<time) 
        loc = this.characterEvents_[n].character.location;
      else{
        for (let i = 1; i< n; i++){
          if(this.characterEvents_[i].timestamp > time){
            let loc1 = this.characterEvents_[i-1].character.location;
            let loc2 = this.characterEvents_[i].character.location;
            let time1 = this.characterEvents_[i-1].timestamp;
            let time2 = this.characterEvents_[i].timestamp;
            let intFact = 0;
            if(time2 - time1 <= 1){
              intFact = 0;
            }else{
              intFact = (time - time1) / (time2 - time1);
            }

            loc = {
              x: (1-intFact) * loc1.x + intFact * loc2.x,
              y: (1-intFact) * loc1.y + intFact * loc2.y,
              z: (1-intFact) * loc1.z + intFact * loc2.z
            }
            break;
          }
        }
      }
      return loc;
    }
    return 0;


    /*if (this.positionEvents_[0]) {
      let best = this.positionEvents_[0].character.location;
      for (let i = 0; i < this.positionEvents_.length; i++) {
        if (this.positionEvents_[i].timestamp > time) break;
        best = this.positionEvents_[i].character.location;
      }
      return best;
    }
    return 0;*/
  }

  healthAtTime(time){
    let health = 100;
    if(this.deathEvent_.timestamp > time || !this.deathEvent_){
      this.healthEvents_.forEach(function(e){
        if(e.timestamp <= time){
          if(e.data.victim){
            if(e.data.damage) health -= e.data.damage;
            else health = e.data.victim.health;
          }
          if(e.character){
            health += e.data.healAmount;
          }
        }
      });
      return health;
    }else{
      return 0;
    }
  }
  
  inParachute(time){  
    //console.log(this.landingEvent_);
    if(this.landingEvent_){
      /*if(this.landingEvent_.timestamp < time){
        return false
      }else{
        if(this.characterEvents_[0]){
          let n = this.characterEvents_.length - 1;
          for (let i = 1; i< n; i++){
            if(this.characterEvents_[i].timestamp > time){
              if(this.characterEvents_[i].isGame > 0 && this.characterEvents_[i].inVehicle){
                return true;
              }else{
                return false;
              }
            }else{
              return false;
            }
          }
        }
      }*/
      
      if(this.leavePlane_.timestamp < time && this.landingEvent_.timestamp >= time){
        return true;
      }else{
        return false;
      }
    }
  }

  /*not working*/
  killsAtTime(time){
    if(typeof time === "undefined") {
      time = 99999;
    }
    let kills = 0;
    this.killEvents_.forEach(function(killEvent){
      if (killEvent.timestamp < time) kills += 1;
    }, this);
    return kills;
  }

  trailAtTime(time, trailLength, minTime) {

    let trail_ = "";
    for (let i = 0; i < this.characterEvents_.length; i++) {
      let posEvent_ = this.characterEvents_[i];
      let pos = posEvent_.character.location;
      
      if(posEvent_.timestamp > minTime){
        if (posEvent_.timestamp >= time-trailLength){
          if (trail_ == "") {
            let pos1 = this.characterEvents_[i-1].character.location;
            let pos2 = pos;
            let time1 = this.characterEvents_[i-1].timestamp;
            let time2 = posEvent_.timestamp;
            let newPos = interpolatePos(time-trailLength, time1, pos1, time2, pos2);
            trail_ = "M " + newPos.x / 1000 + " " + newPos.y / 1000;
          }
          if (posEvent_.timestamp > time){
            let pos1 = this.characterEvents_[i-1].character.location;
            let pos2 = pos;
            let time1 = this.characterEvents_[i-1].timestamp;
            let time2 = posEvent_.timestamp;
            let newPos = interpolatePos(time, time1, pos1, time2, pos2);
            
            trail_ += " L " + newPos.x/1000 + " " + newPos.y/1000;
            break;
          }else{
            trail_ += " L " + pos.x / 1000 + " " + pos.y / 1000;
          }
        }
      }
    }
    return trail_;
  }

  /*equipmentAtTime(time){
    this.equipEvents_.forEach(function(e){
      if(e.timestamp < time){
        this.equipment_.set(e.item.subCategory, e.item.itemId_);
      }
    }, this)
    return this.equipment_;
  }*/

  equipmentAtTime(time){
    let url = 'https://github.com/pubg/api-assets/raw/master/Assets/Icons/Item';
    this.equipment_ = new Map([['Headgear',''],
                              ['Backpack',''],
                              ['Vest',''],
                              ['Main',[]],
                              ['Handgun',''],
                              ['Meelee',''],
                              ['Throwable',[]]]);
    this.equipmentEvent_.forEach(function(e){
      let newItemId = e.data_.item.itemId.replace(/0[0-9]/,'00');
      if(e.timestamp < time){
        let action, add;
        let newValue = newItemId;//url +'/'+ e.data_.item.category +'/'+ e.data_.item.subCategory +'/'+ newItemId +'.png';
        
        if(e.data_._T == 'LogItemPickup'){
          add = true;
        }else{
          add = false;
        }
        
        if(e.data_.item.subCategory == 'Main' || e.data_.item.subCategory == 'Throwable'){
          let index = this.equipment_.get(e.data_.item.subCategory).indexOf(newValue);
          if(index > -1) this.equipment_.get(e.data_.item.subCategory).slice(index,1);
          if(add) this.equipment_.get(e.data_.item.subCategory).push(newValue);
        }else{
          if(add) this.equipment_.set(e.data_.item.subCategory, newValue);
          else this.equipment_.set(e.data_.item.subCategory, '');
        }
      }
    }, this)
    return this.equipment_;
  }
}



class Replay_Match {
  constructor(matchEvents) {
    this.events_ = [];
    this.itemPickups_ = [];
    this.players_ = [];
    this.teams_ = [];
    this.gameStateEvents_ = [];
    this.playerAttack_ = [];
    this.playerByName_ = new Map();
    this.teamById_ = new Map();
    this.scoreboard_ = "";
    this.weapon = new Map();

    let equipmentTypes_ = new Map();
    let unknownTypes = new Map();

    matchEvents.forEach(function(e) {
      let event = TelemetryEvent.create(e);
      
      this.events_.push(event);
      switch (event.type) {
        case 'LogMatchStart':
          this.start_ = event;
          break;
        case 'LogMatchEnd':
          this.end_ = event;
          this.end_.data.characters.forEach(function(c){
            this.playerByName_.get(c.name).addRank(c.ranking);
          }, this)
          break;
        case 'LogItemPickup':
          if(this.playerByName_.has(event.character.name)) 
            this.playerByName_.get(event.character.name).addPickUpEvent(event);
          break;
        case 'LogItemDrop':
          if(this.playerByName_.has(event.character.name)) 
            this.playerByName_.get(event.character.name).addDropEvent(event);
          break;
        case 'LogPlayerCreate':
          let player = new Replay_Player(event);
          this.players_.push(player);

          let teamId = player.teamId;
          if (!this.teamById_.has(teamId)) this.teamById_.set(teamId,[])
          this.teamById_.get(teamId).push(player);
          this.playerByName_.set(player.name, player);
          break;
        case 'LogPlayerPosition':
          this.playerByName_.get(event.character.name).addPositionEvent(event);
          break;
        case 'LogPlayerKill':
          this.playerByName_.get(event.data.victim.name).addDeathEvent(event);
          if(event.data.killer)
            if (!(event.data.killer.name == "")) this.playerByName_.get(event.data.killer.name).addKillEvent(event);
          break;
        case 'LogPlayerMakeGroggy':
          if(!(event.data.attacker.name == "")){
            this.playerByName_.get(event.data.attacker.name).addKnockoutEvent(event);
            this.playerByName_.get(event.data.victim.name).addGroggyEvent(event);
          }
          break;
        case 'LogPlayerRevive':
          this.playerByName_.get(event.data.victim.name).addReviveEvent(event);
          this.playerByName_.get(event.data.victim.name).addHealthEvent(event);
          break;
        case 'LogGameStatePeriodic':
          this.gameStateEvents_.push(event);
          break;
        case 'LogItemEquip':
          if(this.playerByName_.has(event.character.name)) 
            this.playerByName_.get(event.character.name).addEquipEvent(event);
          break;
        case 'LogItemUnequip':
          if(this.playerByName_.has(event.character.name)) 
            this.playerByName_.get(event.character.name).addUnequipEvent(event);
          break;
        case 'LogPlayerTakeDamage':
          if(event.data.attacker){
            this.playerByName_.get(event.data.attacker.name).addDealDamageEvent(event);
          }
          if(event.data.victim){
            this.playerByName_.get(event.data.victim.name).addTakeDamageEvent(event);
            //this.playerByName_.get(event.data.victim.name).addCharacterEvent(event);
          }
          if (!this.weapon.has(event.data.damageCauserName)) this.weapon.set(event.data_.damageCauserName, [])
          this.weapon.get(event.data.damageCauserName).push(event);
          if(this.playerByName_.has(event.data.victim.name)) 
            this.playerByName_.get(event.data.victim.name).addHealthEvent(event);
          break;
        case 'LogPlayerAttack':
          if(this.playerByName_.has(event.data.attacker.name)) 
            this.playerByName_.get(event.data.attacker.name).addAttackEvent(event);
          break;
        case 'LogArmorDestroy':
          if(this.playerByName_.has(event.data.attacker.name)) 
            this.playerByName_.get(event.data.attacker.name).addArmorDestroyEvent(event);
          break;
        case 'LogItemUse':
          if(this.playerByName_.has(event.character.name)) 
              this.playerByName_.get(event.character.name).addItemUseEvent(event);
          break;
        case 'LogHeal':
          if(this.playerByName_.has(event.character.name)) 
              this.playerByName_.get(event.character.name).addHealthEvent(event);
          break;
        default:
          if (!unknownTypes.has(event.type)) unknownTypes.set(event.type, []);
          unknownTypes.get(event.type).push(event);
      }
      if(event.character){
        if(this.playerByName_.has(event.character.name))
          this.playerByName_.get(event.character.name).addCharacterEvent(event);
      else if(event.data.victim)
        if(this.playerByName_.has(event.data.victim.name))
          this.playerByName_.get(event.data.victim.name).addCharacterEvent(event);
      }

    }, this);
    unknownTypes.forEach(function(values, type) {
      console.log(type + " is unknown (" + values.length + " values).");
    });

    this.teamById_.forEach(function(t){
      this.teams_.push(t);
    }, this)
    
    this.teams_.sort(function(a, b){
      let aRank = 100;
      let bRank = 100;
      a.forEach(function(p){
        if(p.rank < aRank) aRank = p.rank;
      })
      b.forEach(function(p){
        if(p.rank < bRank) bRank = p.rank;
      })
      return aRank - bRank;
    })

    this.scoreboard_ = new Scoreboard(this.teams_);
  }

  get start() {
    return this.start_;
  }

  get end() {
    return this.end_;
  }

  allEvents() {
    return this.events_;
  }

  players() {
    return this.players_;
  }

  gameStateAtTime(time){
    let gs = this.gameStateEvents_[0].gameState;
    for (let i = 1; i < this.gameStateEvents_.length; i++) {
      if (this.gameStateEvents_[i].timestamp > time){

        let gs1 = this.gameStateEvents_[i-1];
        let gs2 = this.gameStateEvents_[i];

        let time1 = this.gameStateEvents_[i-1].timestamp;
        let time2 = this.gameStateEvents_[i].timestamp;

        let intFact = 0;
        if(time2 - time1 <= 1){
          intFact = 0;
        }else{
          intFact = (time - time1) / (time2 - time1);
        }
        
        gs = {};
        
        gs.blueZone = {r:(1-intFact)*gs1.gameState_.blueZone.r+intFact*gs2.gameState_.blueZone.r,
                        x:(1-intFact)*gs1.gameState_.blueZone.x+intFact*gs2.gameState_.blueZone.x,
                        y:(1-intFact)*gs1.gameState_.blueZone.y+intFact*gs2.gameState_.blueZone.y,
                        z:(1-intFact)*gs1.gameState_.blueZone.z+intFact*gs2.gameState_.blueZone.z
                      }
        gs.redZone = gs1.gameState_.redZone;
        gs.whiteZone = gs1.gameState_.whiteZone;
                        
        break;
      }
    }
    return gs;
  }

  mapName(){
  	return this.start_.data_.mapName;
  }

  playerByName(name){
    return this.playerByName_.get(name);
  }

  teamById(id){
    return this.teamById_.get(id);
  }

  scoreboard(parent){
    //this.scoreboard_.render(parent);

    /*this.teams_.forEach(function(t){
      t.forEach(function(p){
        p.renderWeaponStats(parent);
      })
    }, this)*/
  }

  fetchData(url, callback) {
    let request = new XMLHttpRequest();
    request.open("GET", url);
    request.responseType = "json";
    request.onreadystatechange = function() {
      if (request.readyState == 4) {
        callback(request.response);
      }
    }
    request.send();
  }
}

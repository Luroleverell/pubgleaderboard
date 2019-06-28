class Weapon{
  constructor(weaponName){
    this.weaponName = weaponName;
    this.itemName = 'Item_Weapon_'+weaponName+'_C';
    this.attackEvents_ = [];
    this.dealDamageEvents_ = [];
    this.knockoutEvents_ = [];
    this.killEvents_ = [];
    this.damage_ = 0;
    this.bulletsFired_ = 0;
    this.hits_ = 0;
    this.headshots_ = 0;
    this.kills_ = 0;
    this.knockouts_ = 0;
    this.victims_ = new Map();
    this.hitZones_ = new Map();
  }

  addAttackEvent(event){
    this.attackEvents_.push(event);
    this.bulletsFired_ += 1;
  }

  addDamageEvent(event){
    let knockout = 0;
    this.dealDamageEvents_.push(event);
    this.damage_ += Math.round(event.data.damage);
    this.hits_ += 1;
    if(event.data.damageReason == 'HeadShot'){
      this.headshots_ += 1;
    }
    this.getVictim(event).damage += Math.round(event.data.damage);

    if(event.data.damage >= event.data.victim.health && event.data.damage > 0){knockout=1}
    this.getVictim(event).hits.push({hitZone: event.data.damageReason, damage: Math.round(event.data.damage), knockout: knockout});

    this.getHitZone(event).hits += 1;
    this.getHitZone(event).damage += event.data.damage;
  }

  addKnockoutEvent(event){
    this.knockoutEvents_.push(event);
    this.knockouts_ += 1;
    if(event.data.damageReason == 'HeadShot'){
      this.headshots_ += 1;
    }
    this.getVictim(event).knockedOut += 1;
  }

  addKillEvent(event){
    this.killEvents_.push(event);
    this.kills_ += 1;
    if(event.data.damageReason == 'HeadShot'){
      this.headshots_ += 1;
    }
    this.getVictim(event).killed = 1;
  }

  getVictim(event){
    let victim = event.data.victim.name;
    if(!this.victims_.has(victim)) this.victims_.set(victim, {damage: 0, knockedOut: 0, killed: 0, hits: []});
    return this.victims_.get(victim);
  }

  getHitZone(event){
    let hitZone = event.data.damageReason;
    if(!this.hitZones_.has(hitZone)) this.hitZones_.set(hitZone, {hits: 0, damage: 0});
    return this.hitZones_.get(hitZone); 
  }

  get headshots(){
    return this.headshots_;
  }

  get damage(){
    return this.damage_;
  }

  get kills(){
    return this.killEvents_.length;
  }

  get knockouts(){
    return this.knockoutEvents_.length;
  }

  get bulletsFired(){
    return this.bulletsFired_;
  }

  get hits(){
    return this.hits_;
  }
}
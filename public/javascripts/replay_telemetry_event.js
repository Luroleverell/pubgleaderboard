class TelemetryEvent {
  constructor(data) {
    this.data_ = data;
    this.timestamp_ = new Date(data['_D']);
  }

  static create(data) {
    switch(data['_T']) {
      case 'LogItemPickup':
        return new ItemPickupEvent(data);
      /*case "LogPlayerCreate":
        return new CharacterEvent(data);*/
      case 'LogGameStatePeriodic':
        return new GameStateEvent(data);
      case 'LogItemEquip':
        return new ItemEquipEvent(data,0);
      case 'LogItemUnequip':
        return new ItemEquipEvent(data,1);
      /*case 'LogArmorDestroy':
        return new ItemEquipEvent(data,1);*/
      default:
        // TODO(rfevang): Replace with specializations based on type
        if (data.hasOwnProperty('character')) {
          return new CharacterEvent(data);
        }
        return new TelemetryEvent(data);
    }
  }

  get type() {
    return this.data_['_T'];
  }

  get data(){
    return this.data_;
  }

  get timestamp() {
    return this.timestamp_;
  }

  toString() {
    return JSON.stringify(this.data_, null, 2);
  }
}

class CharacterEvent extends TelemetryEvent {
  constructor(data) {
    super(data);

    this.character_ = new Character(data.character || data.Character);
  }

  get character() {
    return this.character_;
  }
  
  get isGame(){
    return this.data.common.isGame;
  }
  
  get inVehicle(){
    if(this.data.vehicle)
      return true;
  }
}

class ItemPickupEvent extends CharacterEvent {
  constructor(data) {
    super(data);

    this.item_ = new Item(data.item || data.Item);
  }
}

class ItemEquipEvent extends CharacterEvent {
  constructor(data, type){
    super(data);
    
    
    this.item_ = new Item(data.item || data.Item);
  }

  get item(){
    return this.item_;
  }
}


/*class ItemUnequipEvent extends CharacterEvent {
  constructor(data){
    super(data);

    this.item_ = new Item(data.item || data.Item);
  }

  get item(){
    return this.item_;
  }
}*/


class GameStateEvent extends TelemetryEvent{
  constructor(data){
    super(data);

    this.gameState_ = new GameState(data.gameState || data.GameState);
  }

  get gameState(){
    return this.gameState_;
  }
}

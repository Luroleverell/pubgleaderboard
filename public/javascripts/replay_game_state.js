class GameState{
  constructor(data){
    this.redZone_ = new Zone("Red", data.redZonePosition || data.RedZonePosition, data.redZoneRadius || data.RedZoneRadius);
    this.whiteZone_ = new Zone("white", data.poisonGasWarningPosition || data.PoisonGasWarningPosition, data.poisonGasWarningRadius || data.PoisonGasWarningRadius);
    this.blueZone_ = new Zone("blue", data.safetyZonePosition || data.SafetyZonePosition, data.safetyZoneRadius || data.SafetyZoneRadius);
  }

  get redZone(){
    return this.redZone_;
  }

  get whiteZone(){
    return this.whiteZone_;
  }

  get blueZone(){
    return this.blueZone_;
  }
}

class Zone{
  constructor(color, position, radius){
    this.position_ = position;
    this.radius_ = radius;
    this.color_ = color;
  }

  get x(){
    return this.position_.x;
  }

  get y(){
    return this.position_.y;
  }

  get r(){
    return this.radius_;
  }

  get color(){
    return this.color_;
  }
}
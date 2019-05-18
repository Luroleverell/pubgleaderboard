'use strict';
module.exports = class Gamer_Division{
  constructor(data){
    this.data_ = data;
    this.rounds_ = [];
    this.stats_ = [];
    this.name_ = data.name;
    this.id_ = data.id;
    
    //this.addRounds();
  }
  
  get id(){
    return this.id_;
  }

  get teams(){
    return this.teams_;
  }

  get name(){
    return this.name_;
  }

  get rounds(){
    return this.rounds_;
  }

  addRound(round){
    this.rounds_.push(round);
  }

  addStats(stats){
    this.stats_.push(stats);
  }

  /*addRounds(){
    let url = 'https://www.gamer.no/api/v1/tournaments/'+this.id+'/rounds';
    var that = this;
    fetchDataGamer(url, function(res){
      res.response.forEach(function(round){
        that.rounds_.push(new Round(round));
      });
    });
  }*/
}
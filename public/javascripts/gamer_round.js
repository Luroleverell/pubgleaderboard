'use strict';
module.exports = class Gamer_Round{
  constructor(data){
    this.data_ = data;
    this.id_ = data.id;
    this.roundNumber_ = data.roundNumber;
    this.stats_ = [];
    this.results_ = [];
    this.matches_ = [];
  }

  get id(){
    return this.id_;
  }

  get roundNumber(){
    return this.roundNumber_;
  }

  get matches(){
    return this.matches_;
  }

  addResults(result){
    this.results_ = result;
  }

  addMatch(match){
    this.matches_.push(match)
  }
}
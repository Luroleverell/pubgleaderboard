class getJsonFromUrl{
  constructor(url){
    let that = this;
    fetch(url, {mode: 'cors'})
      .then(function(res){
        return res.json();
      }).then(function(data){
        that.list_ = data;
      });
  }

  get list(){
    return this.list_;
  }
}
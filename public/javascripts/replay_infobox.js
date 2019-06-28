class InfoBox {
  constructor(slider, match) {
    this.slider_ = slider;
    slider.addListener(this.update.bind(this));
    this.match_ = match;
    this.box_ = document.createElement('div');
    this.box_.className = 'container';
    this.box_.id = 'info-box';
    this.update();
  }

  render(parent) {
    parent.appendChild(this.box_);
  }

  update() {

  }

  findFirstAfterSliderTime() {
    let slidertime = this.slider_.getValue();
    let events = this.match_.allEvents();
    for (let i = 0; i < events.length; i++) {
      if (events[i].timestamp >= slidertime) return events[i];
    }
  }

  setNew(playerName){
    this.box_.innerHTML = '';

    if(playerName){
      let time = this.slider_.getValue();
      let player = this.match_.playerByName(playerName)
      let team = this.match_.teamById(player.teamId);
      
      team.forEach(function(p){
        p.renderWeaponStats(this.box_, '');
        /*let dm = document.createElement('div');
        dm.className = 'card';
        dm.style.cssFloat ='left'
        dm.style.width = '18rem';
        
        let d = document.createElement('div');
        d.classList.add('card-header');
        if(playerName == p.name) d.style.backgroundColor = '#f79330'; //d.classList.add('alert');
        d.innerText = p.name;
        dm.appendChild(d);
        
        let b = document.createElement('div');
        b.className = 'card-body';
        dm.appendChild(b);

          d = document.createElement('div');
          d.innerText = p.healthAtTime(time);
          b.appendChild(d);
          
          d = document.createElement('div');
          d.innerText = p.isAlive(time);
          b.appendChild(d);

          d = document.createElement('div');
          d.innerText = p.killsAtTime(time);
          b.appendChild(d);
          
          
          d = document.createElement('div');
          

          b.appendChild(d);
          
        this.box_.appendChild(dm);*/

        
      }, this);

    }
  }
}

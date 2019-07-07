class Slider {
  constructor(start, end) {
    this.listeners_ = [];

    this.slider_ = document.createElement('Input');
    this.slider_.type = 'range';
    this.slider_.classList.add('slider');
    this.slider_.min = start.timestamp.getTime();
    this.slider_.max = end.timestamp.getTime();
    this.slider_.value = this.slider_.min;
    this.slider_.oninput = this.onupdate.bind(this);
    this.slider_.step = 1;

    this.time_ = document.createElement('div');
    this.time_.classList.add('container');
  }

  render(parent) {
    parent.appendChild(this.slider_);
    parent.appendChild(this.time_);
  }

  getValue() {
    return parseInt(this.slider_.value);
  }
  
  getDate() {
    return new Date(parseInt(this.slider_.value));
  }

  addListener(listener) {
    this.listeners_.push(listener);
  }

  setValue(newValue){
    this.slider_.value = newValue;
  }
  
  onupdate() {
    this.time_.innerText = this.getDate();
    let args = arguments;
    this.listeners_.forEach(function(fn) {
      fn.apply(null, args);
    });
  }
}

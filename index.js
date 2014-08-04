var timers = {};
module.exports = function(name,options) {
  if(!name) {
    name = '__global';
  }
  else if(typeof name != 'string') { //name isn't a string
    options = name;
    name = '__global';
  }

  if(!timers[name]) {
    timers[name] = new Timings(options);
  }

  return timers[name];
}

function Timings(options) {
  if(!options) options = {};

  if(isNaN(options.maxSamples)) {
    options.maxSamples = 10000;
  }
  if(!options.precision) {
    options.precision = 'ms';
  }

  switch(options.precision) {
    case 'ms':
      this.precision = 1000;
      break;
    case 'ns':
      this.precision = 1;
      break;
    default:
      throw "Invalid precision";
  }

  this.starting = null;
  this.maxSamples = options.maxSamples;
  this._resetStats();
}

Timings.prototype._resetStats = function() {
  this.mean = 0;
  this.count = 0;
  this.ssd = 0; //sum of squared differences
  this.min = Number.MAX_VALUE;
  this.max = 0;
  this.starting = null; //just in case
}

Timings.prototype._recordSample = function(x) {
  this.min = Math.min(this.min,x);
  this.max = Math.max(this.max,x);
  this.count++;

  // http://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Incremental_algorithm
  var delta = x-this.mean;
  this.mean += delta/this.count;
  this.ssd += delta*(x - this.mean);
}

Timings.prototype.sample = function() {
  var r = null;
  if(!this.starting) {
    this.starting = process.hrtime();
  }
  else {
    var diff = process.hrtime(this.starting);
    var x = diff[0] * 1e9 + diff[1]; //statistical x
    this.starting = null;

    this._recordSample(x);

    if(this.count >= this.maxSamples) {
      r = this.summarize();
      this._resetStats();
    }
  }
  return r;
};

Timings.prototype._getSD = function() {
  if(this.count < 2) return 0;
  return Math.sqrt(this.ssd/this.count);
}

Timings.prototype.summarize = function() {
  var precision = this.precision;
  var f = function(n) { return format(n,precision); };
  return {mean:f(this.mean),max:f(this.max),min:f(this.min),stdDev:f(this._getSD())};
};

var format = function(n,p) {
  return Math.floor(n/p);
};

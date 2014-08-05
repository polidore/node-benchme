var events = require('events');
var util = require('util');

function BenchMe() {
  events.EventEmitter.call(this);
  this.timers = {};
};

util.inherits(BenchMe,events.EventEmitter);

BenchMe.prototype.getTimer = function(name,options) {
  if(!name) {
    name = '__global';
  }
  else if(typeof name != 'string') {
    options = name;
    name = '__global';
  }

  if(!this.timers[name]) {
    this.timers[name] = new Timer(options);
    var self = this;
    this.timers[name].on('reset',function(s) {
      self.emit('reset',name,s);
    });
  }

  return this.timers[name];
};

function Timer(options) {
  events.EventEmitter.call(this);
  if(!options) options = {};

  if(isNaN(options.maxSamples)) {
    options.maxSamples = 10000;
  }
  if(!options.precision) {
    options.precision = 'us';
  }

  switch(options.precision) {
    case 'us':
      this.precision = 1000;
      break;
    case 'ns':
      this.precision = 1;
      break;
    case 'ms':
      this.precision = 1000*1000;
      break;
    default:
      throw "Invalid precision";
  }

  this.starting = null;
  this.maxSamples = options.maxSamples;
  this._resetStats();
};

util.inherits(Timer,events.EventEmitter);

Timer.prototype._resetStats = function() {
  this.mean = 0;
  this.count = 0;
  this.ssd = 0; //sum of squared differences
  this.min = Number.MAX_VALUE;
  this.max = 0;
  this.starting = null; //just in case
}

Timer.prototype._recordSample = function(x) {
  this.min = Math.min(this.min,x);
  this.max = Math.max(this.max,x);
  this.count++;

  // http://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Incremental_algorithm
  var delta = x-this.mean;
  this.mean += delta/this.count;
  this.ssd += delta*(x - this.mean);
}

Timer.prototype.start = function() {
  if(this.starting) throw "Already timing";
  this.starting = process.hrtime();
}

Timer.prototype.end = function() {
  if(!this.starting) throw "Not timing";

  var r;
  var diff = process.hrtime(this.starting);
  var x = diff[0] * 1e9 + diff[1]; //statistical x
  this.starting = null;

  this._recordSample(x);

  if(this.count >= this.maxSamples) {
    var summary = this.summarize();
    this._resetStats();
    this.emit('reset',summary);
  }
  return x/this.precision;
}

Timer.prototype._getSD = function() {
  if(this.count < 2) return 0;
  return Math.sqrt(this.ssd/this.count);
}

Timer.prototype.summarize = function() {
  var precision = this.precision;
  var f = function(n) { return format(n,precision); };
  return {mean:f(this.mean),max:f(this.max),min:f(this.min),stdDev:f(this._getSD())};
};

var format = function(n,p) {
  return Math.floor(n/p);
};

var benchme = new BenchMe(); //singleton
module.exports = benchme;

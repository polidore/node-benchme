# node-benchme

A fast utility to generate timing stats for your node program.

## Install

```
npm install --save benchme
```

## Use

```javascript
var benchme = require('benchme');

var timer = benchme.getTimer('myScope',{maxSamples:10000,precision:'ms'});
timer.start();
//do stuff
var x = timer.end(); //returns the time elapsed for this sample

timer.on('reset',function(s) { //called at end of each period defined by maxSamples
  console.log("Benchme stats: %j",s);
});

//some other place in your code that manages these
var benchme = require('benchme');
benchme.on('reset', function(name,s) {
  console.log("The %s timer has a new sample period: %j",name,s);
});
```

## Value Proposition

I made this library because I wanted a way to centrally record various timing stats in a performant (esp wrt memory) way.  BenchMe only saves 5 numbers per timer.  It does not save all the samples in your period length.  This means you can cheaply generate timing stats for a production system with sample sizes in the 10s of thousands.

### Caution 

Not really appropriate for actions that take longer than 1 second with large sample sizes.

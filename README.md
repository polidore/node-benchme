# node-benchme

A fast utility to generate timing stats for your node program.

## Install

```
npm install --save benchme
```

## Use

```javascript
var benchme = require('benchme');

//...

//some local scope

var timer = benchme('myScope',{maxSamples:10000,precision:'ms'});
timer.start();
//do stuff
var s = timer.end(); //optionally find out when about to reset at calling time
if(s) {
  console.log("Benchme stats: %j",s);
}

//...

//some other place in your code that manages these
var timer = benchme('myScope');
timer.on('reset',function(s) { //find out when the timer with name 'myScope' is resetting and log the prior period
  console.log("Benchme stats: %j",s);
});
```

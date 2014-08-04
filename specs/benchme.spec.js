var benchme = require('../');

describe("Statistical Tests", function() {
  var data = [50,25,30,25,5,10,100,20,30,50,19,17,51,42];
  var timer = benchme();
  beforeEach(function() {
    timer._resetStats();
    data.forEach(function(d) {
      timer._recordSample(d);
    });
  });

  it("Should calculate the mean", function() {
    expect(timer.mean).toBeCloseTo(33.85,1);
  });
  it("Should calculate the min", function() {
    expect(timer.min).toEqual(5);
  });
  it("Should calculate the max", function() {
    expect(timer.max).toEqual(100);
  });
  it("Should calculate the count", function() {
    expect(timer.count).toEqual(14);
  });
  it("Should calculate the standard deviation", function() {
    expect(timer._getSD()).toBeCloseTo(23.21,1);
  });
});

describe("Workflow tests", function() {
  var timer = benchme('workflow',{maxSamples:10});

  beforeEach(function() {
    timer._resetStats();
  });

  it("Should reset after 10", function() {
    var s;
    for(var i=0;i<10;i++) {
      timer.start();
      for(var j=0;j<10000;j++) {
      }
      s = timer.end();
      if(i+1 < 10) {
        expect(s).not.toBeTruthy();
      }
      else {
        expect(s).toBeTruthy();
      }
    }
  });

  it("Should callback when full", function(done) {
    var s;

    timer.on('reset',function(s) {
      expect(s).toBeTruthy();
      done();
    });

    for(var i=0;i<10;i++) {
      timer.start();
      for(var j=0;j<10000;j++) {
      }
      s = timer.end();
      if(i+1 < 10) {
        expect(s).not.toBeTruthy();
      }
      else {
        expect(s).toBeTruthy();
      }
    }
  });

});

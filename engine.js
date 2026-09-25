/* DegreeMath engine - is the degree actually worth it. Pure math, no DOM. */
(function (root) {
  'use strict';

  function num(v, name) {
    var n = typeof v === 'string' ? parseFloat(v) : v;
    if (typeof n !== 'number' || !isFinite(n) || isNaN(n)) throw new Error(name + ' must be a number');
    return n;
  }
  function money(v, name, max) {
    var n = num(v, name);
    if (n < 0 || n > (max || 10000000)) throw new Error(name + ' must be in [0, ' + (max || 10000000) + ']');
    return n;
  }
  function round2(x) { return Math.round(x * 100) / 100; }

  // Simulate both paths year by year.
  // Path A (skip): earns salaryNow every year, growing g.
  // Path B (degree): studyYears earning 0 while paying tuitionTotal spread evenly,
  // then earns salaryAfter, growing g, from year studyYears+1.
  function simulate(o) {
    var years = o.years;
    var g = o.growthPct / 100;
    var tuitionPerYear = o.tuitionTotal / o.studyYears;
    var rows = [];
    var cumA = 0, cumB = 0, breakEvenYear = null;
    for (var y = 1; y <= years; y++) {
      var earnA = o.salaryNow * Math.pow(1 + g, y - 1);
      var earnB = y <= o.studyYears ? -tuitionPerYear
        : o.salaryAfter * Math.pow(1 + g, y - o.studyYears - 1);
      var prevDiff = cumB - cumA;
      cumA += earnA;
      cumB += earnB;
      var diff = cumB - cumA;
      if (breakEvenYear === null && diff >= 0 && earnB > 0) {
        // interpolate within the year
        var delta = diff - prevDiff;
        breakEvenYear = delta > 0 ? (y - 1) + (-prevDiff / delta) : y;
      }
      rows.push({ year: y, earnA: round2(earnA), earnB: round2(earnB), cumDiff: round2(diff) });
    }
    return { rows: rows, breakEvenYear: breakEvenYear, totalA: round2(cumA), totalB: round2(cumB) };
  }

  function analyze(o) {
    if (!o || typeof o !== 'object') throw new Error('options required');
    var age = num(o.age === undefined ? 24 : o.age, 'age');
    if (age < 16 || age > 60) throw new Error('age must be in [16, 60]');
    var retireAge = num(o.retireAge === undefined ? 65 : o.retireAge, 'retireAge');
    if (retireAge <= age + 1 || retireAge > 80) throw new Error('retireAge must be between age+1 and 80');
    var salaryNow = money(o.salaryNow === undefined ? 42000 : o.salaryNow, 'salaryNow', 5000000);
    var salaryAfter = money(o.salaryAfter === undefined ? 65000 : o.salaryAfter, 'salaryAfter', 5000000);
    var tuitionTotal = money(o.tuitionTotal === undefined ? 40000 : o.tuitionTotal, 'tuitionTotal', 2000000);
    var studyYears = num(o.studyYears === undefined ? 4 : o.studyYears, 'studyYears');
    if (studyYears < 1 || studyYears > 8 || Math.round(studyYears) !== studyYears) throw new Error('studyYears must be a whole number in [1, 8]');
    var growthPct = num(o.growthPct === undefined ? 3 : o.growthPct, 'growthPct');
    if (growthPct < 0 || growthPct > 12) throw new Error('growthPct must be in [0, 12]');
    var years = retireAge - age;
    if (studyYears >= years) throw new Error('study years exceed the working horizon');

    var sim = simulate({ years: years, growthPct: growthPct, salaryNow: salaryNow, salaryAfter: salaryAfter, tuitionTotal: tuitionTotal, studyYears: studyYears });

    var forgone = 0;
    for (var y = 1; y <= studyYears; y++) forgone += salaryNow * Math.pow(1 + growthPct / 100, y - 1);
    var totalCost = tuitionTotal + forgone;

    return {
      workingYears: years,
      totalCost: round2(totalCost),
      tuitionTotal: round2(tuitionTotal),
      forgoneEarnings: round2(forgone),
      breakEvenYear: sim.breakEvenYear === null ? null : round2(sim.breakEvenYear),
      breakEvenAge: sim.breakEvenYear === null ? null : round2(age + sim.breakEvenYear),
      lifetimeDelta: round2(sim.totalB - sim.totalA),
      roiMultiple: totalCost > 0 ? round2((sim.totalB - sim.totalA + totalCost) / totalCost) : null,
      rows: sim.rows
    };
  }

  var api = { analyze: analyze, simulate: simulate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.DegreeMathEngine = api;
})(typeof self !== 'undefined' ? self : this);

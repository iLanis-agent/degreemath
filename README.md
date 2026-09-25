# DegreeMath

The brochure says "invest in yourself." DegreeMath says check the crossing year. Tuition is only half the price - the other half is the salary you don't earn while you study. Both lives simulated side by side to retirement: the true cost, the exact break-even year and age, the lifetime gap, and the honest ROI.

**Live:** https://ilanis-agent.github.io/degreemath/
**App:** https://ilanis-agent.github.io/degreemath/app.html

## What it does

- True cost: tuition plus forgone earnings, compounded at your raise rate.
- Break-even year and age, with in-year interpolation - or the honest "never pays back".
- Lifetime delta and ROI multiple on the true cost.
- Year-by-year gap chart (green ahead, amber in the hole).
- Settings persist in localStorage; runs entirely client-side.

## Files

- `index.html` - landing page
- `app.html` - the calculator
- `engine.js` - pure math (node-testable: analyze, simulate)

No build step, no dependencies, no backend.

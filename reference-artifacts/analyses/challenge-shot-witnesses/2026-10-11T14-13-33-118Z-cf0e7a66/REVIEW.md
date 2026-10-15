# Stage 31 Exit Shot Comparison

Measured October 11, 2026. Source HEAD: cf0e7a666067ede385865ba02e73d1454eb132d1.
No gameplay candidate was accepted in this comparison.

## Method

The existing browser harness ran 31 independent trials with seed 9131.
Each trial started naturally, kept the ship at center (x=140), and fired one
real Space-key shot between 9.0 and 12.0 seconds at 0.1-second intervals.
Simulation advanced at 60 Hz. The harness did not reposition targets.

- Baseline: report.json; development bundle SHA-256
  a80c2f08bbe4f08efbde68efe5274d9ccedcf2915dbbca81b748351a03c6f98e.
- Rejected candidate: rejected-candidate.json; retained development bundle SHA-256
  a02753758c6d1cce99bca55d5f2946772c970d9c47bc32df50baef5c058f7c6f.

The candidate report was copied from the isolated exit-trial checkout. Its
source had already been restored, but its retained bundle contained the rejected
repair. Bundle identity, not source HEAD alone, identifies the tested bytes.
The candidate patch and earlier contact comparison are in ../../exit-trial-oct08/.

## Result

Baseline shots at 11.2, 11.3, and 11.4 seconds killed green-ladder target
372665405. None of the candidate trials killed that target. Green-target hits
across all trials decreased from 25 to 18. Some shots hit different targets.

This confirms loss of sampled shooting opportunities, not merely a shorter
geometric window. It does not prove that the target is impossible to hit,
measure perfect-clear probability, or establish a complete player route.

## Decision And Next Test

Keep the previous candidate rejected. Test one path family at a time using
the measured original-game departure direction. Before acceptance, require
contact safety, full entry, readable motion, and actual target interception
tests in reachable ship columns. Replacement opportunities can differ from
the defective baseline timings; those timings are not canonical requirements.
No publication or gameplay change resulted from this comparison.

# Release Note: 1.0.1 Input And Feedback Hotfix

Date: March 31, 2026

Release track: production hotfix

## Summary

`1.0.1` tightened the live input model and a few key feedback surfaces right
after launch.

The main fix was replacing the fragile modifier-key left-handed path with
always-available `A`/`Z` left and `D`/`C` right movement, plus a focus-loss
reset so ships could not stay latched sideways when the browser lost focus.

## What Changed

- simpler always-on alternate movement controls
- focus-loss input reset
- feedback delivery moved from FormSubmit to Web3Forms
- success confirmation stayed visible long enough to read

## Why It Mattered

This release reduced avoidable control confusion in the live public line.

At this stage, small input or feedback problems were much more damaging than
they might look in code because they shaped the first public impression of
whether Aurora felt responsive and trustworthy.

## What Came Next

The next urgent priority after this hotfix was fixing a worse regression:

- repeated active-input resets that broke normal ship movement in production

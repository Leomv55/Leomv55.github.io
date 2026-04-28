# Enterprise Integrations — Impress.ai

## Problem
Enterprise clients (primarily DBS Bank) needed their assessment platforms connected to a production hiring system processing thousands of candidates daily. Platforms included SHL, Aon, Aon Gate, Pulsify, HackerRank, HackerEarth, and others.

## Approach
Owned the full integration lifecycle for each vendor: scoping → technical documentation → implementation → testing → QA. No handoffs — each integration went from spec to production under one owner.

Also built:
- Client-facing analytics dashboard: modular architecture, real-time data, customisable per client
- Internal ticketing system integrated with Freshdesk for cross-platform sync
- Internal test platform so the ops team could self-serve integration verification without needing engineering

## Outcome
- 7+ enterprise assessment integrations shipped end-to-end
- DBS Bank as primary production client
- Ops team unblocked — can verify integrations independently

## Stack
Python · Django · DRF · Celery · REST · SOAP · PostgreSQL

## Key Metrics
- Integrations owned: 7+
- Scale: thousands of candidates processed daily
- Primary client: DBS Bank

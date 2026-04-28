# This Portfolio

## What
A static portfolio site that runs a language model entirely in your browser — no server, no API keys, no cost per query.

The client-side LLM chat is built on WebGPU-based in-browser inference via WebLLM. The model (Phi-3 Mini or equivalent) downloads once on first chat open and runs on your device. Nothing leaves your browser.

Built with vanilla JS on GitHub Pages — no React, no build pipeline, no framework. Fast load is itself a signal: every dependency is a decision.

## How It Was Built
This portfolio was planned and built using the BMad Method — a structured AI-assisted development approach that uses Claude skills and agent workflows to move from brainstorming → product brief → PRD → implementation. The build process is part of the story.

## Stack
Vanilla JS · WebLLM (WebGPU) · D3.js · GitHub Pages · BMad Method

## Repo
https://github.com/Leomv55/Leomv55.github.io

## Key Facts
- Zero server-side dependencies
- LLM model loads on first chat open (not page load)
- Graceful fallback for non-WebGPU browsers (static FAQ)
- Lighthouse performance ≥ 90

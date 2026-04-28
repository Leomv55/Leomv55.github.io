# Bias Detection Filter — Thomson Reuters (via SII India)

## Problem
OpenSearch results needed bias filtering. A paid vendor (Coactive) was handling it — expensive and opaque.

## Approach
Reverse-engineered Coactive's prompt approach. Built LangChain evaluators to score and benchmark outputs. Iterated prompts systematically — fixing hallucinations one by one — until 94% accuracy was achieved against the vendor's results.

Deployed as an AWS Lambda function via the Serverless Framework. Integrated with the GraphQL API (solo implementation end-to-end).

Also built a prompt-iterator Claude skill: a reusable tool that automatically iterates prompts when switching models (e.g. GPT-4o-mini → a newer SLM), ensuring compatibility without manual tuning. Designed for future reuse by the team.

## Outcome
- 94% accuracy vs Coactive (commercial solution)
- 2-second Lambda response time
- In-house solution replacing paid vendor
- Prompt-iterator skill reusable for future model migrations

## Stack
Python · LangChain · AWS Lambda · Serverless Framework · GraphQL · GPT-4o-mini

## Key Metrics
- Accuracy: 94%
- Response time: 2 seconds
- Vendor cost: eliminated

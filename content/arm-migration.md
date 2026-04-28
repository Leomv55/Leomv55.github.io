# ARM Migration + OpenSearch — Thomson Reuters (via SII India)

## Problem
OpenSearch cluster running on x86. Suspected ARM would be cheaper for the workload, but no benchmarks existed to justify the migration.

## Approach
Built a benchmarking script to compare x86 vs ARM performance on the actual production workload — not synthetic tests. ARM came out ahead for the specific use case.

Migrated OpenSearch ECS nodes to ARM, updated AMIs to ECS-optimised ARM variants. Along the way:
- Found and fixed a 7GB memory issue caused by using `_id` field for sorting (an OpenSearch anti-pattern)
- Migrated CI/CD pipeline from Jenkins to GitHub Actions

Currently leading solo migration from OpenSearch 2 → OpenSearch 3. The derived vector feature in OpenSearch 3 saves 40% storage vs the previous version.

## Outcome
- $11,000/year saved
- 7GB memory leak fixed
- CI/CD migrated to GitHub Actions
- OpenSearch 3 migration in progress (40% storage reduction)

## Stack
AWS ECS · OpenSearch · CloudFormation · GitHub Actions · Python

## Key Metrics
- Annual cost saving: $11,000
- Memory reduction: 7GB freed
- Storage reduction (OpenSearch 3): 40%

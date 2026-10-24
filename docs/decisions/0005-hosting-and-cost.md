# ADR 0005: Hosting strategy and cost constraints

- **Status:** Proposed
- **Date:** 2026-10-25
- **Decision owners:** Project owner

## Context

The application should eventually be hosted. The project owner is interested in
Azure, IIS, hosting services, and a completely free option. The full target
stack may include Angular, ASP.NET Core, SQL, identity, Ollama or a hosted model,
logs, and storage.

## Decision

Do not select a production host until runtime requirements, availability,
database, identity provider, and a monthly budget are known. Begin with a local
development stack. Before a public deployment, compare total cost and operating
responsibilities across:

1. Azure free allowances and paid tiers;
2. static frontend hosting plus a separately hosted .NET API and database;
3. IIS on a managed Windows server;
4. self-hosting for a private demonstration.

Treat free tiers as limited and changeable, not a guarantee of always-on,
production-grade hosting. Do not expose a developer PC directly to the public
internet. Add budget alerts and verify all resources/quotas before provisioning.

## Alternatives considered

- **Local-only:** selected for the initial learning stage; not public or
  continuously available.
- **Azure App Service + Azure SQL + Static Web Apps:** candidate for a cloud
  learning deployment; costs and free allowances must be checked by region and
  account.
- **IIS self-hosting:** viable for learning Windows hosting, but requires
  hardware, network, HTTPS, patching, backups, and operations.
- **Free third-party PaaS:** candidate only after verifying .NET support,
  sleeping/quotas, persistence, and terms.

## Consequences

- “No cloud bill” does not mean no cost: local compute, electricity, internet,
  domain, maintenance, and uptime are real constraints.
- Ollama's inference needs suitable compute/memory; free shared web tiers may
  not support it.
- Angular static hosting does not host the .NET API, database, or model.
- Always-on hosting, managed SQL, logs, backups, domains, and inference may
  cross from free allowances into paid usage.

## Revisit when

The desired public demo/production availability, region, selected identity and
database providers, model hosting strategy, and acceptable monthly budget are
known.

## Pricing references

- [Azure free services](https://azure.microsoft.com/pricing/free-services/)
- [Azure App Service pricing](https://azure.microsoft.com/pricing/details/app-service/)
- [Azure SQL Database pricing](https://azure.microsoft.com/pricing/details/azure-sql-database/single/)
- [Azure pricing calculator](https://azure.microsoft.com/pricing/calculator/)
- [Azure Static Web Apps pricing](https://azure.microsoft.com/pricing/details/app-service/static/)

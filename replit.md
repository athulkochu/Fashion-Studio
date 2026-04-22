# Lumière — Dress Boutique

## Overview

Lumière is a production-quality online dress boutique built on a pnpm + TypeScript monorepo. A React + Vite frontend (the `shop` artifact) consumes a typed Express 5 API backed by PostgreSQL + Drizzle. The OpenAPI spec is the contract source of truth, and React Query hooks plus Zod schemas are generated from it.

## Stack

- pnpm workspaces, Node 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind, wouter, @tanstack/react-query, framer-motion, react-hook-form, zod
- Backend: Express 5, drizzle-orm, pg, pino
- Codegen: Orval (React Query hooks + Zod schemas) from `lib/api-spec/openapi.yaml`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run --filter @workspace/api-spec codegen` — regenerate hooks/schemas from OpenAPI
- `pnpm --filter @workspace/db run push` — push DB schema (dev)
- `pnpm --filter @workspace/scripts run seed` — seed dresses, collections
- Restart `artifacts/api-server: API Server` and `artifacts/shop: web` workflows after server/code changes

## Domain

- Products (dresses) with collections (Evening, Day, Bridal, Resort), facets (color, size, price, category), search and sort
- Cookie-session cart (`lumiere_cart` httpOnly cookie) with add/update/remove/clear
- Checkout creates an order; order confirmation page lookup by order number
- Newsletter subscription
- Shipping is free over $200, otherwise flat $12 (standard); express/overnight available; tax 8%

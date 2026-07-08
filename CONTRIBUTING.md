# Contributing

Thank you for considering contributing to Grob.

## Development

1. Clone the repo
2. Run `pnpm install`
3. Copy `.env.example` to `.env` and fill in values
4. Run `pnpm dev`

## Project structure

```
src/
  app/        Next.js App Router pages and API routes
  lib/        Shared utilities (auth, prisma, etc.)
prisma/       Schema and migrations
```

## Pull requests

- Keep changes focused and minimal
- Run `pnpm build` before submitting
- Update docs if adding new features

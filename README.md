# condors-app

## Development
### Quickstart
**NB**: Need to add the `.env` file to the repo root.

This will insert a Test organization and member so you can work locally.
```bash
pnpm install
pnpm run db:dev
pnpm run dev
```

### DB setup
```bash
pnpm run db:up
pnpm run db:push
pnpm run db:seed:org
```

Or just do:
```bash
pnpm run db:dev
```

Down and delete:
```bash
pnpm run db:down
```

### Dev server
```bash
pnpm run dev
```

Open [http://localhost:5210](http://localhost:5210)
with your browser to see the result.

### Format, lint, typecheck
```bash
pnpm run fmt
pnpm run lint
pnpm run check

# or:
pnpm run all
```

### Test
```bash
pnpm run test
```

### End-to-end tests
There are also some E2E tests for important auth stuff at `./e2e`.
These are _not_ being run on CI.

You can run these as follows:
```bash
# get a dev server started
pnpm run db:up
pnpm run db:push
pnpm run test:dev

pnpm run test:e2e
```

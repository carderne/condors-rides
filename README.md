# condors-app

## Development
### Quickstart
**NB**: Need to add the `.env` file to the repo root.

This will insert a Test organization and member so you can work locally.
```bash
npm install
npm run db:dev
npm run dev
```

### DB setup
```bash
npm run db:up
npm run db:push
npm run db:seed:org
```

Or just do:
```bash
npm run db:dev
```

Down and delete:
```bash
npm run db:down
```

### Dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
with your browser to see the result.

### Format, lint, typecheck
```bash
npm run fmt
npm run lint
npm run check

# or:
npm run all
```

### Test
```bash
npm run test
```

### End-to-end tests
There are also some E2E tests for important auth stuff at `./e2e`.
These are _not_ being run on CI.

You can run these as follows:
```bash
# get a dev server started
npm run db:up
npm run db:push
npm run test:dev

npm run test:e2e
```

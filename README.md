# Reflect Therapy

This is a template Next.js site for online therapy sessions. It includes a simple booking form, admin page to manage bookings, and Twilio integration for video calls. Deploy using [SST](https://sst.dev) to AWS.

## Setup

Make sure you have pnpm available. If you use Node 16+ you can run:

```bash
corepack enable
```

Or install it globally via `npm install -g pnpm`.

1. Install dependencies using [pnpm](https://pnpm.io)

```bash
pnpm install
```

2. Copy the example environment file and fill in your secrets:

```bash
cp .env.example .env
```

3. Run the development server

```bash
pnpm dev
```

4. Deploy with SST

```bash
pnpm run sst
```

5. Run the test suite

```bash
pnpm test
```

## GitHub Actions

A basic workflow is provided in `.github/workflows/deploy.yml` to deploy to AWS on push to `main`.
By default it deploys to the `ap-southeast-2` region; adjust the `AWS_REGION` value if you need a different region.

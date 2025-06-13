# Reflect Therapy

This is a template Next.js site for online therapy sessions. It includes a simple booking form, admin page to manage bookings, and Twilio integration for video calls. Deploy using [SST](https://sst.dev) to AWS.

## Setup

1. Install dependencies

```bash
npm install
```

2. Copy the example environment file and fill in your secrets:

```bash
cp .env.example .env
```

3. Run the development server

```bash
npm run dev
```

4. Deploy with SST

```bash
npm run sst
```

## GitHub Actions

A basic workflow is provided in `.github/workflows/deploy.yml` to deploy to AWS on push to `main`.

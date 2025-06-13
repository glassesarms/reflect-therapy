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

Add the required values to `.env`:

```dotenv
ADMIN_PASSWORD=your_admin_password
TWILIO_SID=your_twilio_account_sid
TWILIO_TOKEN=your_twilio_auth_token
BOOKINGS_TABLE_NAME=name_of_dynamodb_table
```

When deploying via GitHub Actions, include the same variables as repository secrets so the site can access them in production.

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

## AWS credentials

To deploy through GitHub Actions or from your local machine you need an AWS access key.
Create an IAM user with **programmatic access** in the AWS console and attach the
`AdministratorAccess` policy (or a more restricted policy of your choice).

Steps:

1. Sign in to the AWS console and open **IAM → Users**.
2. Choose **Add users** and enable *Access key - Programmatic access*.
3. Attach the desired permissions policy.
4. After creating the user, download the Access Key ID and Secret Access Key.
5. Add these values as GitHub repository secrets named `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

Use the same keys locally by exporting them in your shell or placing them in the `.env` file when running SST commands.

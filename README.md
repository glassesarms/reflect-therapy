# Reflect Therapy

This is a template Next.js site for online therapy sessions. It includes a simple booking form, admin page to manage bookings, cancel appointments, block out times, and Amazon Chime integration for video calls. Deploy using [SST](https://sst.dev) to AWS.

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
EMAIL_FROM=verified_email@example.com
AWS_REGION=us-east-1
BOOKINGS_TABLE_NAME=name_of_dynamodb_table
BLOCKOUTS_TABLE_NAME=name_of_blockouts_table
```

When deploying via GitHub Actions, set these values as repository secrets so the workflow can inject them:

```
ADMIN_PASSWORD
EMAIL_FROM
BOOKINGS_TABLE_NAME
BLOCKOUTS_TABLE_NAME
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

## Adding UI components

This project uses [shadcn/ui](https://ui.shadcn.com) for reusable UI
components. To add more components run the new `shadcn` CLI from the
project root:

```bash
npx shadcn add <component>
```

The CLI will copy the selected component files into `components/ui/` and
install any required dependencies. If you have not initialized shadcn in
your project yet, run the init command first:

```bash
npx shadcn init
```

The older `shadcn-ui` package is deprecated, so always use the `shadcn`
CLI going forward.

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

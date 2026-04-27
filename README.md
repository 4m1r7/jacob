This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## GraphQL (Headless WordPress)

This project is configured to use:

- `graphql-request` for runtime GraphQL fetching.
- `graphql-codegen` for auto-generating TypeScript types + typed request SDK from `.graphql` documents.

### Endpoint

- Default endpoint: `https://cms.jacobcarpet.com/graphql`
- Override with env var: `WORDPRESS_GRAPHQL_ENDPOINT`
- Copy `.env.example` to `.env` and set values as needed.

### Generate types

```bash
pnpm codegen
```

Watch mode:

```bash
pnpm codegen:watch
```

GraphQL operation files should be placed in:

- `src/lib/graphql/documents/**/*.graphql`

Generated output is written to:

- `src/lib/graphql/generated.ts`

### Important WPGraphQL setting

Your current endpoint has public introspection disabled, so code generation cannot fetch schema unless one of these is true:

1. Enable public introspection in WPGraphQL settings.
2. Provide an auth token and keep introspection available for authenticated requests via `WORDPRESS_GRAPHQL_AUTH_TOKEN`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

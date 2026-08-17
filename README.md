# austudygroup

A Next.js application for students to find study groups quickly using MongoDB, Tailwind CSS, and TypeScript.

## Dev environment

- Engine: [Yarn](https://classic.yarnpkg.com/)
- Framework: [Next.js 16 (App Router)](httpshttps://nextjs.org/)
- Styling: [Tailwind CSS 4](https://tailwindcss.com/)
- Language: TypeScript

## Build & test

Use `yarn` for all commands:

- `yarn dev`: Start the development server.
- `yarn build`: Build the application for production.
- `yarn start`: Run the production build.
- `yarn lint`: Run ESLint to check for code quality issues.

## Conventions

- All components should reside in `src/components`.
- Use the `src/app` directory for routing and page definitions (App Router).
- Follow TypeScript strict mode guidelines.
- Use Tailwind CSS utility classes for all styling; avoid custom CSS where possible.

## Pitfalls

- Ensure MongoDB connection strings are provided via environment variables (e.g., `MONGODB_URI`).
- Do not manually edit files in `.next/` or other generated directories.

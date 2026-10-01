# Saudi Plot — Frontend

A bilingual (Arabic / English) web app that guides a user from a plot document to a generated design result, including a 3D view.

**Live demo:** https://saudi-plot-frontend.vercel.app

## What it does

1. **Upload** a plot document (PDF; QR codes are read client-side)
2. **Confirm** the extracted data, or handle extraction failures gracefully
3. **Answer** a short guided questionnaire
4. **Generate** a result, with a room catalog and a **3D result view**
5. Manage saved **projects** after signing up / logging in

## Tech stack

- **React 19** + **Vite**, React Router 7
- **Zustand** for state, **framer-motion** for animation
- **i18next** with Arabic and English (RTL-aware, Arabic web fonts)
- **MapLibre GL** for maps, **pdf.js** and **jsQR** for document and QR parsing
- **Supabase** (auth, data and edge functions)
- **Stripe** checkout via Supabase edge functions (`create-checkout-session`, `stripe-webhook`)
- Deployed on **Vercel**

## Getting started

```bash
npm install
cp .env.example .env   # add your own Supabase / Stripe public keys
npm run dev
```

Build for production with `npm run build`.

## Project structure

```
src/
  Pages/       Upload, ConfirmData, Questions, Generating, Result, Result3D, Projects, auth
  Components/  Shared UI
  Store/       Zustand stores
  i18n/        Translations
supabase/functions/   Stripe edge functions
```

## Author

Built by [Osama Othman](https://github.com/Osamaaaothman).
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

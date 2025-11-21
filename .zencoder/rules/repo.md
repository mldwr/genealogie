---
description: Repository Information Overview
alwaysApply: true
---

# Genealogie Information

## Summary
Web application for energy certificate creation, enabling users to input data for energy certificates through online forms. Users can upload building images and utility bills, view a tabular summary, and purchase certificates via Stripe integration. Administrators access a dashboard for data management and CSV export.

## Structure
- **app/**: Next.js App Router pages and API routes, including authentication, account management, data input forms, and admin functions
- **components/**: Reusable UI components for forms, banners, testimonials, and business categories
- **public/**: Static assets like images and favicon
- **supabase/**: Supabase configuration and database setup scripts
- **utils/**: Helper functions for authentication, Supabase integration, and utilities

## Language & Runtime
**Language**: TypeScript  
**Version**: 5.3.3  
**Runtime**: Node.js (with @types/node 24.10.1)  
**Framework**: Next.js 16.0.3  
**Build System**: Next.js  
**Package Manager**: npm  

## Dependencies
**Main Dependencies**:  
- @headlessui/react: ^2.2.9  
- @heroicons/react: ^2.2.0  
- @radix-ui/react-dialog: ^1.1.15  
- @radix-ui/react-toast: ^1.2.15  
- @supabase/auth-helpers-nextjs: ^0.10.0  
- @supabase/ssr: ^0.7.0  
- @supabase/supabase-js: ^2.43.4  
- @types/node: ^24.10.1  
- @types/react: 19.2.6  
- @types/react-dom: 19.2.3  
- @types/xlsx: ^0.0.35  
- aos: ^2.3.4  
- class-variance-authority: ^0.7.1  
- lucide-react: ^0.554.0  
- next: ^16.0.3  
- prettier-plugin-tailwindcss: ^0.7.1  
- react: ^19.2.0  
- react-dom: ^19.2.0  
- react-dropzone: ^14.3.8  
- tailwind-merge: ^3.4.0  
- typescript: ^5.3.3  
- use-debounce: ^10.0.6  
- xlsx: ^0.18.5  

**Development Dependencies**:  
- @tailwindcss/forms: ^0.5.10  
- @types/aos: ^3.0.7  
- autoprefixer: ^10.4.22  
- eslint: 9.39.1  
- eslint-config-next: 16.0.3  
- @tailwindcss/postcss: ^4.0.0  
- postcss: ^8.5.6  

## Build & Installation
```bash
npm install
npm run build
npm run start
```

## Testing
**Framework**: Custom test scripts  
**Test Location**: app/deport/csv-upload/test-data/, test-historization.js  
**Naming Convention**: test-*.js  
**Configuration**: No dedicated config file  
**Run Command**:  
```bash
node test-historization.js
# Custom test scripts in app/deport/csv-upload/test-data/
```
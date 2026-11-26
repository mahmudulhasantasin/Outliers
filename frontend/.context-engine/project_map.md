# Project Map

> Status: INITIALIZED  
> Last Verified: 2026-11-11  

## Repository overview
- `src/`: Core frontend source code.
  - `src/app/`: Next.js App Router pages, layout, and global CSS.
    - `src/app/page.tsx`: Landing page and multi-flow authentication modal.
    - `src/app/copilot/`: Interactive legal research chat interface.
    - `src/app/contractmind/`: Contract upload, clause extraction, and statutory risk auditor.
    - `src/app/archive/`: Stored contract memos and audit history.
    - `src/app/admin/`: Super-admin management portal (lawyers, enterprises, SSLCommerz gateway ledger, credit adjustments, withdrawals).
    - `src/app/enterprise/admin/`: Enterprise admin portal (team credits, members, playbooks, shared vault).
    - `src/app/enterprise/member/`: Enterprise member workspace.
    - `src/app/lawyer/pending/`: Advocate verification status view.
    - `src/app/lawyer/archive/`: Advocate completed reviews, earnings ledger, and multi-channel payouts.
    - `src/app/pricing/`: Credit packages, pricing tiers, and SSLCommerz payment gateway.
    - `src/app/profile/`: User profile, credentials, and avatar upload.
    - `src/app/settings/`: Account preferences, security, and settings.
    - `src/app/dashboard/`: Role-based route dispatcher.
    - `src/app/login/`: Auth redirection gateway.
  - `src/components/`: Reusable React components.
    - `src/components/dock/`: `AppDock.tsx` (role-aware navigation controller) and `VerticalDock.tsx` (Framer Motion dock).
    - `src/components/layout/`: `AppShell.tsx` (responsive layout wrapper).
    - `src/components/markdown/`: `MarkdownViewer.tsx` (statutory redline, citation, and legal memo renderer).
    - `src/components/prompt/`: `PromptBar.tsx` (command bar with slash commands and voice dictation stub).
    - `src/components/effects/`: Visual effect widgets (`ThoughtLine`, `GradientWaves`, `DitherVeil`, `PixelSwap`, `CountUp`, `FadeContent`, `Aurora`, `DotField`, `SmoothScrollProvider`).
  - `src/context/`: Centralized React Context providers.
    - `src/context/AuthContext.tsx`: Authentication state, user profile, registration, OTP, role normalization, and demo accounts.
    - `src/context/LanguageContext.tsx`: Bilingual English/Bangla localization.
    - `src/context/PersonaContext.tsx`: User persona switcher (SME, HR, Freelancer, Legal Counsel).
    - `src/context/ThemeContext.tsx`: Light/Dark mode state and DOM class synchronization.
  - `src/lib/`: Application services, utilities, and client algorithms.
    - `src/lib/api.ts`: Fetch-based API client with Bearer auth, 90-second timeout, and error normalization.
    - `src/lib/apiServices.ts`: Strongly typed service calls covering all backend endpoints.
    - `src/lib/auth.ts`: Local storage tokens, user profile persistence, and role helpers.
    - `src/lib/dispatcher.ts`: Client-side advocate dispatch and matching algorithm.
    - `src/lib/piiMasker.ts`: Sovereign client-side PII redactor.
    - `src/lib/markdownContractGenerator.ts`: Markdown memo generator with statutory citations.
    - `src/lib/utils.ts`: Tailwind class utility (`cn`).
  - `src/data/`: Static legal datasets and demo contracts.
    - `src/data/sampleContracts.ts`: Pre-loaded contracts (Employment, Vendor SLA, Commercial Lease).
    - `src/data/contractAudits.ts`: Pre-computed statutory audit results.
    - `src/data/statutoryProvisions.ts`: Bangladesh statutes and official bdlaws links.
    - `src/data/enterpriseData.ts`: Enterprise playbook rules and fixtures.
- `public/`: Static images, fonts (`TiroBangla-Regular.ttf`, `TiroBangla-Italic.ttf`), SVG icons, and hero video assets.
- `.context-engine/`: Incremental context documentation, metadata, dependency graph, file index, and helper tools.

---

## Entry points
| Path | Purpose | When to Inspect |
|---|---|---|
| `src/app/layout.tsx` | Root HTML shell, fonts (Inter, Tiro Bangla), and global context providers | Modifying root providers, font configurations, or HTML metadata |
| `src/app/page.tsx` | Main landing page, feature showcase, and all authentication modals | Modifying landing page visuals, marketing copy, or login/registration forms |
| `src/app/dashboard/page.tsx` | Role-based post-login redirection router | Changing default landing paths for specific user roles |
| `src/components/dock/AppDock.tsx` | Role-based navigation dock items and mobile drawer | Adding new pages to navigation or altering role visibility |
| `src/lib/api.ts` | Central HTTP client and error handler | Changing API timeout, header handling, or base URL resolution |
| `src/lib/apiServices.ts` | Complete client-side typed API interface | Integrating new backend endpoints or updating request/response types |
| `next.config.ts` | Next.js configuration, rewrites, and image domains | Modifying API proxy routes, Turbopack rules, or image hostnames |

---

## Feature / module map

| Feature or Domain | Main Files | Key Symbols | Description |
|---|---|---|---|
| **Authentication & RBAC** | `src/context/AuthContext.tsx`, `src/lib/auth.ts`, `src/app/page.tsx` | `useAuth`, `normalizeUserRole`, `saveTokenResponse`, `clearAuth` | Email login, OTP verification, demo logins, role switching |
| **Legal Copilot Q&A** | `src/app/copilot/page.tsx`, `src/lib/apiServices.ts`, `src/lib/useCopilotVoice.ts`, `src/components/prompt/PromptBar.tsx` | `createChatSession`, `sendChatQuery`, `getChatSessionHistory`, `transcribeVoiceAudio`, `synthesizeVoiceSpeech`, `useCopilotVoice`, `maskPii` | Multi-session legal research, bdlaws citations, client PII masking, Voice Mode (STT + Read Aloud TTS) |
| **Contract Risk Audit** | `src/app/contractmind/page.tsx`, `src/lib/apiServices.ts`, `src/lib/dispatcher.ts` | `uploadContract`, `runDispatchAlgorithm`, `requestLawyerVerification` | PDF/DOCX contract upload, statutory conflict audit, advocate dispatch |
| **Contract Archive** | `src/app/archive/page.tsx`, `src/lib/apiServices.ts`, `src/lib/markdownContractGenerator.ts` | `getContractHistory`, `deleteContract`, `generateContractAuditMarkdown` | User contract repository, audit memo viewing, and print export |
| **Advocate Marketplace (HITL)** | `src/app/lawyer/pending/page.tsx`, `src/app/lawyer/archive/page.tsx`, `src/lib/apiServices.ts` | `getLawyerQueue`, `acceptOffer`, `declineOffer`, `getActiveTasks`, `submitReview`, `getLawyerEarnings` | 3-hour offer queue, task review, proof upload, advocate seal, earnings |
| **Enterprise Management** | `src/app/enterprise/admin/page.tsx`, `src/app/enterprise/member/page.tsx`, `src/lib/apiServices.ts` | `getCompanyDashboard`, `listMembers`, `adjustMemberQuota`, `uploadPlaybook`, `listPlaybooks` | Company credit pool, team quotas, compliance playbooks, shared vault |
| **Billing & Payments** | `src/app/pricing/page.tsx`, `src/lib/apiServices.ts` | `listPackages`, `getPaymentGatewayConfig`, `initiatePayment`, `verifyPaymentStatus`, `listMyPayments` | Credit bundles, SSLCommerz checkout redirect, pre-checkout phone prompt, and payment verification |
| **System Administration** | `src/app/admin/page.tsx`, `src/lib/apiServices.ts` | `getAdminDashboardStats`, `getAdminPayments`, `reconcileAdminPayment`, `adjustAdminUserCredits`, `adjustAdminEnterpriseCredits`, `markAdminWithdrawalPaid` | Super-admin verification, gateway ledger reconciliation, credit adjustments, and multi-channel payouts |
| **Profile & Settings** | `src/app/profile/page.tsx`, `src/app/settings/page.tsx`, `src/lib/apiServices.ts` | `getMySettings`, `updateProfile`, `changePassword`, `uploadProfilePhoto` | User account settings, avatar upload, password changes |
| **Markdown & Redline View** | `src/components/markdown/MarkdownViewer.tsx` | `MarkdownViewer`, `DiffRedlineBlock` | Custom syntax for statutory redlines, callouts, and advocate seals |

---

## Configuration and build
| Path | Purpose |
|---|---|
| `package.json` | Dependencies, devDependencies, and npm scripts (`dev`, `build`, `start`, `lint`) |
| `next.config.ts` | Next.js configuration, Turbopack CSS loaders, API rewrites, and `ignoreBuildErrors: true` |
| `tsconfig.json` | TypeScript configuration (`strict: true`, path alias `@/*` -> `./src/*`) |
| `eslint.config.mjs` | ESLint 9 configuration with `eslint-config-next` |
| `.env.local` | Local environment variables (`VERCEL_OIDC_TOKEN`, optional `NEXT_PUBLIC_API_URL`) |

---

## Testing map
- **Status**: No test suites or test runner configurations currently exist in this repository.
- **Coverage**: 0% automated test coverage.
- **Verification Strategy**: Interactive browser-based manual testing and built-in demo profiles (`AuthContext.loginAsDemo*`).

---

## Retrieval hints
- **For Auth & Role issues**: Start at `src/context/AuthContext.tsx` -> check `normalizeUserRole()` -> inspect `src/lib/auth.ts`.
- **For API and network problems**: Start at `src/lib/api.ts` -> check `src/lib/apiServices.ts` -> inspect `next.config.ts` rewrites.
- **For Copilot Chat & Citations**: Start at `src/app/copilot/page.tsx` -> `src/lib/apiServices.ts:sendChatQuery` -> `src/components/markdown/MarkdownViewer.tsx`.
- **For Contract Audits & Uploads**: Start at `src/app/contractmind/page.tsx` -> `src/lib/apiServices.ts:uploadContract` -> `src/lib/dispatcher.ts`.
- **For Advocate Queue & Reviews**: Start at `src/app/lawyer/pending/page.tsx` -> `src/lib/apiServices.ts:getLawyerQueue`.
- **For Enterprise Admin & Playbooks**: Start at `src/app/enterprise/admin/page.tsx` -> `src/lib/apiServices.ts:uploadPlaybook`.
- **For Admin Approvals**: Start at `src/app/admin/page.tsx` -> `src/lib/apiServices.ts:getAdminPendingLawyers`.
- **For Styling & Print Styles**: Start at `src/app/globals.css` -> inspect `@media print` section.

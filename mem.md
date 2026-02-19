
# Project Memory - SIG-IMEL Intranet

## Project Overview
- **Name:** IMEL Intranet (Sistema Interno de Gestão Escolar)
- **Target Institution:** Instituto Médio de Economia de Luanda
- **Tech Stack:** React, Lucide React (icons), Recharts (charts), Tailwind CSS, Netlify Functions.
- **Persistence:** LocalStorage (Frontend-only architecture).

## Language & Conventions
- **Standard Language:** Portuguese (PT-PT / Angola).
- **Key Terminology:**
  - Use **Palavra-passe** instead of Senha.
  - Use **Registo** instead of Registro.
  - Use **Monitorização** instead of Monitoramento.
  - Use **Telemóvel** instead of Telemóvel (already correct).
  - Use **Utilizador** instead of Usuário.
- **Encoding:** Files must be saved in UTF-8. Avoid characters that might break in non-UTF-8 environments.

## File Organization
- `pages/`: Application views (Dashboard, Login, Profile, etc.).
- `components/`: Reusable UI components (Sidebar, Topbar, AIChatWidget).
- `constants.tsx`: Global constants and mock data.
- `types.ts`: TypeScript definitions.

## Key Constraints
- No real backend; data is mocked in `constants.tsx` or stored in `localStorage`.
- Role-based access control (RBAC) via `UserRole` enum.
- Integration with Google Gemini AI for insights.

## Project Knowledge
- **Spelling:** Standardized to Portuguese (PT-PT / Angola). Use "Palavra-passe" instead of "Senha", "Registo" instead of "Registro", and "Monitorização" instead of "Monitoramento".
- **Encoding:** Files must be saved in UTF-8. Avoid characters that break in non-UTF-8 environments (e.g., corrupted acentos).
- **Naming:** Correct spelling for mock users (e.g., "Rita José").

## Architecture Details
- **Frontend-only:** No backend server or database.
- **Persistence:** All data is stored in the browser's `localStorage`.
- **Mock Data:** Initial data is provided in `constants.tsx`.
- **Netlify Functions:** Used for specific tasks like sending emails (simulated).

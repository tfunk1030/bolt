Analyzing the user's current structure from appstructure.md and their mobile conversion goals:

Key Observations:

Existing web-centric structure with:

Next.js app routing (app/)
Context-heavy architecture (lib/*-context.tsx)
Separate UI components (components/ui/)
Legacy scripts (scripts/)
Migration Requirements:

Preserve working web app during transition
Share context providers between platforms
Separate web-only features (e.g. webgl-context)
Maintain TypeScript paths
Proposed Migration Plan:


Task Completed
Monorepo Conversion Guide for Current Structure

Target Structure Map
windsurf-mono/
├── apps/
│   ├── web/                  # Current web app
│   │   ├── app/             # Keep original Next.js 13+ structure
│   │   ├── public/          # Public assets
│   │   └── styles/          # Web-only styles
│   │
│   └── mobile/              # New mobile app
│       ├── app/             # Expo routes
│       └── components/      # Mobile-specific UI
│
├── packages/
│   └── core/
│       ├── src/
│       │   ├── lib/         # From original lib/
│       │   ├── components/  # Shared UI components
│       │   └── types/       # Shared types.ts
│       └── package.json
│
└── turbo.json
File Migration Instructions
Move Shared Contexts First
# From project root:
mkdir -p packages/core/src/lib/contexts
mv lib/*-context.tsx packages/core/src/lib/contexts/
mv lib/types.ts packages/core/src/types/
Update Import Paths
Change in all web files:
// Before
import { useSettings } from '@/lib/settings-context'

// After 
import { useSettings } from 'core/src/lib/contexts/settings-context'
Handle Web-Specific Code
Keep in apps/web:
mv lib/webgl-context.tsx apps/web/lib/
mv scripts/ apps/web/scripts/
Shared UI Components
mkdir -p packages/core/src/components/ui
mv components/ui/input.tsx packages/core/src/components/ui/
mv components/ui/separator.tsx packages/core/src/components/ui/
Mobile Adaptation
Create new mobile-specific files:
mkdir -p apps/mobile/app/shot-calculator
touch apps/mobile/app/shot-calculator/screen.native.tsx
Migration Safety Protocol
Phase 1 - Non-UI Code
# Safe to move first:
lib/club-settings-context.tsx
lib/shot-calc-context.tsx 
lib/types.ts
lib/utils.ts
Phase 2 - UI Components
# Move after testing Phase 1:
components/ui/input.tsx
components/ui/separator.tsx
Phase 3 - Remaining Contexts
# Move last (platform-specific):
lib/webgl-context.tsx       # Web-only
lib/environmental-service.ts # Shared
Critical Path Verification
After each phase, run:

# Check web functionality
yarn dev

# Verify mobile imports
yarn mobile type-check
Example Migration - Shot Calculator Context
# Move file
mv lib/shot-calc-context.tsx packages/core/src/lib/contexts/

# Update imports in:
# - apps/web/app/shot-calculator/page.tsx
# - apps/mobile/app/shot-calculator/screen.native.tsx
Do Not Move Yet (keep in web app):

lib/webgl-context.tsx       # WebGL dependency
scripts/reset-dashboard.js  # Web-specific scripts
styles/globals.css          # Web-only styles
Post-Migration Structure
packages/core/
├── src/
│   ├── lib/
│   │   ├── contexts/
│   │   │   ├── club-settings-context.tsx
│   │   │   ├── shot-calc-context.tsx
│   │   │   └── theme-context.tsx
│   │   ├── environmental-service.ts
│   │   └── utils.ts
│   └── types.ts
This preserves your working web app while enabling mobile conversion through shared code.
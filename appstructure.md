## app sturcture

├── app/
│   ├── dashboard/
│   ├── settings/
│   ├── shot-calculator/
│   ├── wind-calc/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── navigation/
│   ├── ui/
│   │   ├── input.tsx
│   │   ├── separator.tsx
│   │   ├── theme-toggle.tsx
│   │   └── upgrade-modal.tsx
│   └── navigation.tsx
├── lib/
│   ├── api-keys.ts
│   ├── club-settings-context.tsx
│   ├── dashboard-context.tsx
│   ├── environmental-service.ts
│   ├── premium-context.tsx
│   ├── settings-context.tsx
│   ├── shot-calc-context.tsx
│   ├── theme-context.tsx
│   ├── types.ts
│   ├── utils.ts
│   ├── webgl-context.tsx
│   └── widget-config-context.tsx
├── public/
├── scripts/
│   ├── reset-config.js
│   └── reset-dashboard.js
├── styles/
│   └── globals.css
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
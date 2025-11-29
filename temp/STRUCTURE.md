# TUMatch - Project Structure

## 📁 Complete Directory Tree

```
TUMatch/
│
├── 📄 Configuration Files
│   ├── package.json              # Dependencies and scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── vite.config.ts            # Vite bundler config
│   ├── tailwind.config.js        # Tailwind CSS config
│   ├── postcss.config.js         # PostCSS config
│   ├── .eslintrc.json            # ESLint rules
│   ├── .gitignore                # Git ignore patterns
│   └── start.sh                  # Quick start script
│
├── 📄 Entry Files
│   ├── index.html                # HTML template
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Main app component
│   ├── Layout.js                 # App layout wrapper
│   └── index.css                 # Global styles
│
├── 📁 api/                       # Backend integration
│   └── base44Client.ts           # Mock backend with localStorage
│
├── 📁 utils/                     # Utility functions
│   └── index.ts                  # Helper functions
│
├── 📁 components/
│   │
│   ├── 📁 ui/                    # Reusable UI components
│   │   ├── button.tsx            # Button component
│   │   ├── input.tsx             # Input field
│   │   ├── textarea.tsx          # Text area
│   │   ├── select.tsx            # Dropdown select
│   │   └── tabs.tsx              # Tab navigation
│   │
│   ├── 📁 feed/                  # Feed-specific components
│   │   ├── AiAssistant.tsx       # AI search modal
│   │   ├── EventCard.tsx         # Event display card
│   │   ├── NotificationBell.tsx  # Notification dropdown
│   │   └── SearchBar.tsx         # Search interface
│   │
│   ├── 📁 navigation/            # Navigation components
│   │   └── BottomNav.tsx         # Bottom tab bar
│   │
│   └── 📁 profile/               # Profile components
│       ├── MomentCard.tsx        # Moment grid item
│       └── MomentModal.tsx       # Moment detail view
│
├── 📁 pages/                     # Page components (routes)
│   ├── Feed.tsx                  # Main event feed
│   ├── CreateEvent.tsx           # Event creation form
│   ├── EventDetails.tsx          # Event detail page
│   └── Profile.tsx               # User profile page
│
├── 📁 entities/                  # Data schemas (JSON)
│   ├── Event.json                # Event model schema
│   ├── Friendship.json           # Friendship schema
│   └── Moment.json               # Moment schema
│
└── 📄 Documentation
    ├── README.md                 # Main project documentation
    ├── SETUP_SUMMARY.md          # Complete setup guide
    └── STRUCTURE.md              # This file

```

## 🔗 Component Relationships

### Page → Component Dependencies

#### Feed Page (`pages/Feed.tsx`)
├── EventCard (`components/feed/EventCard.tsx`)
├── AIAssistant (`components/feed/AiAssistant.tsx`)
├── NotificationBell (`components/feed/NotificationBell.tsx`)
├── SearchBar (`components/feed/SearchBar.tsx`)
└── BottomNav (`components/navigation/BottomNav.tsx`)

#### CreateEvent Page (`pages/CreateEvent.tsx`)
├── Button (`components/ui/button.tsx`)
├── Input (`components/ui/input.tsx`)
├── Textarea (`components/ui/textarea.tsx`)
├── Select (`components/ui/select.tsx`)
└── BottomNav (`components/navigation/BottomNav.tsx`)

#### EventDetails Page (`pages/EventDetails.tsx`)
├── Button (`components/ui/button.tsx`)
└── BottomNav (`components/navigation/BottomNav.tsx`)

#### Profile Page (`pages/Profile.tsx`)
├── Button (`components/ui/button.tsx`)
├── MomentCard (`components/profile/MomentCard.tsx`)
├── MomentModal (`components/profile/MomentModal.tsx`)
└── BottomNav (`components/navigation/BottomNav.tsx`)

## 📦 Data Flow

```
User Interaction
       ↓
   Page Component
       ↓
   React Query (TanStack Query)
       ↓
   base44Client API
       ↓
   localStorage (Mock Backend)
       ↓
   Data returned to Component
       ↓
   UI Updates (React + Framer Motion)
```

## 🎨 Styling Architecture

```
Tailwind CSS (utility classes)
       ↓
Custom Config (tailwind.config.js)
       ↓
Global Styles (index.css)
       ↓
Component Styles (inline className)
       ↓
Animations (Framer Motion)
```

## 🧩 Key Technology Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server

### Routing & State
- **React Router v6** - Client-side routing
- **TanStack Query** - Server state management

### Styling & Animation
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animations
- **Lucide React** - Icon library

### Utilities
- **date-fns** - Date formatting

### Development
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **PostCSS** - CSS processing

## 📊 Entity Relationships

```
User (Mock)
  ├── Creates → Event
  ├── Joins → Event (as Participant)
  ├── Has → Friendship
  └── Creates → Moment

Event
  ├── Has many → Participants
  ├── Has one → Organizer (User)
  └── Can create → Moment

Moment
  ├── References → Event
  └── Has many → Attendees

Friendship
  ├── Between → User and User
  └── Has → Status (pending/accepted)
```

## 🔄 Component Lifecycle

### Feed Component Flow
1. Mount → Query events from API
2. Display → Render EventCards
3. User scrolls → Update current index
4. User joins → Mutation → Refetch queries
5. Navigate → Router handles transition

### Event Creation Flow
1. User fills form
2. Upload image (if provided) → Convert to base64
3. Submit → Create entity in localStorage
4. Invalidate queries
5. Navigate to Feed
6. Feed shows new event

## 📱 Responsive Design

- **Mobile First** - Designed for mobile screens
- **Adaptive Layout** - Works on tablets and desktop
- **Touch Optimized** - Gesture-friendly interactions
- **Safe Areas** - Notch-aware padding

## 🎯 Import Paths

All imports use the `@/` alias:
- `@/components/...` → `/components/...`
- `@/pages/...` → `/pages/...`
- `@/api/...` → `/api/...`
- `@/utils/...` → `/utils/...`

Configured in:
- `tsconfig.json` (TypeScript)
- `vite.config.ts` (Vite)

## 🔧 Scripts Available

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
./start.sh       # Quick start (installs deps + runs dev)
```

## 💾 Data Persistence

Currently using **localStorage** with keys:
- `Event` - All events
- `Moment` - All moments
- `Friendship` - All friendships

Each entity array is stored as JSON string.

## 🚀 Performance Features

- **Code Splitting** - Vite handles automatically
- **Tree Shaking** - Unused code removed
- **Lazy Loading** - Routes loaded on demand
- **Optimized Re-renders** - React Query caching
- **Smooth Animations** - GPU-accelerated with Framer Motion

---

Last updated: 2025-11-27

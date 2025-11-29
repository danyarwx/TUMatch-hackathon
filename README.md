# TUMatch

A social event discovery app for TUM (Technical University of Munich) students. Connect with classmates, discover events, and build your campus network.

## Features

- 📱 **Swipeable Event Feed** - Discover events with a TikTok-style vertical scroll interface
- 🎯 **AI-Powered Search** - Find events using natural language queries
- 📅 **Create Events** - Organize meetups, study groups, and social events
- 👥 **Profile & Moments** - Save memories from events you've attended
- 🔔 **Real-time Notifications** - Stay updated on event changes and new participants
- 🔍 **Advanced Search** - Filter by events, locations, and people

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Backend**: Base44 (mock implementation included)

## Project Structure

```
TUMatch/
├── api/                    # API client and integrations
│   └── base44Client.ts     # Mock Base44 backend client
├── components/             # React components
│   ├── feed/              # Feed-related components
│   │   ├── AiAssistant.tsx
│   │   ├── EventCard.tsx
│   │   ├── NotificationBell.tsx
│   │   └── SearchBar.tsx
│   ├── navigation/        # Navigation components
│   │   └── BottomNav.tsx
│   ├── profile/           # Profile components
│   │   ├── MomentCard.tsx
│   │   └── MomentModal.tsx
│   └── ui/                # Reusable UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
├── entities/              # Data models/schemas
│   ├── Event.json
│   ├── Friendship.json
│   └── Moment.json
├── pages/                 # Page components
│   ├── CreateEvent.tsx
│   ├── EventDetails.tsx
│   ├── Feed.tsx
│   └── Profile.tsx
├── utils/                 # Utility functions
│   └── index.ts
├── App.tsx                # Main app component
├── Layout.js              # Layout wrapper
├── main.tsx               # App entry point
├── index.html             # HTML template
├── index.css              # Global styles
└── package.json           # Dependencies

```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   cd /Users/yuki/GitRepos/TUMatch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the URL shown in terminal)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Key Components

### Feed Page (`pages/Feed.tsx`)
- Vertical scrolling event cards
- Real-time countdown timers
- Join event functionality
- AI assistant integration

### Event Card (`components/feed/EventCard.tsx`)
- Event details with images
- Participant avatars
- Location and time badges
- "Happening now" indicator

### Create Event (`pages/CreateEvent.tsx`)
- Form to create new events
- Image upload
- Category selection
- Location and time picker

### Profile (`pages/Profile.tsx`)
- User information display
- Moments gallery
- Friend connections
- Statistics

### AI Assistant (`components/feed/AiAssistant.tsx`)
- Natural language event search
- Suggestion prompts
- Modal interface

### Search (`components/feed/SearchBar.tsx`)
- Multi-tab search (Events, Places, People)
- AI-powered search mode
- Real-time filtering

## Data Models

### Event
- Title, description, location
- Start time and category
- Organizer information
- Participant list
- Maximum capacity

### Moment
- Event reference
- Photo and attendees
- Event date and location

### Friendship
- User relationships
- Connection status

## Mock Backend

The app includes a mock Base44 client that stores data in `localStorage`. In production:
- Replace with actual Base44 SDK
- Implement proper authentication
- Add real file upload service
- Connect to actual database

## Customization

### Colors
TUM brand colors are defined in:
- `tailwind.config.js` - Tailwind theme
- `index.css` - CSS variables

### API Integration
Update `api/base44Client.ts` to connect to your backend service.

## Development Notes

- TypeScript is configured with strict mode
- ESLint errors are expected until dependencies are installed
- The app uses path aliases (`@/`) for cleaner imports
- Framer Motion provides smooth animations
- Date formatting uses `date-fns`

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Private project for TUM students.

## Contact

For questions or support, contact the development team.

---

Built with ❤️ for TUM Students

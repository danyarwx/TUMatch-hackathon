import React, { useState } from 'react';
import { Search, Sparkles, X, MapPin, Calendar, Users, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const sampleResults = {
  events: [
    { id: '10000000-0000-0000-0000-000000000001', title: 'TOMfoolery Hackathon', location: 'Open Space', time: 'Soon', image: '/event_images/hackathon.jpg' },
    { id: '10000000-0000-0000-0000-000000000002', title: 'Volleyball at iLive', location: 'iLive Campus', time: 'Soon', image: '/event_images/volleyball.jpg' },
    { id: '10000000-0000-0000-0000-000000000003', title: 'Grab a Doner', location: 'Doner Eck', time: 'Soon', image: '/event_images/doner.jpg' },
    { id: '10000000-0000-0000-0000-000000000004', title: 'Football Training', location: 'Sportplatze Wertwiesen', time: 'Soon', image: '/event_images/football.jpg' },
    { id: '10000000-0000-0000-0000-000000000005', title: 'Bouldering', location: 'KletterArena', time: 'Soon', image: '/event_images/bouldering.jpg' },
    { id: '10000000-0000-0000-0000-000000000006', title: 'Lunch at Mensa', location: 'Mensa, Bildungscampus', time: 'Soon', image: '/event_images/mensa.jpg' },
    { id: '10000000-0000-0000-0000-000000000007', title: 'Poker Night', location: 'W27 Lounge', time: 'Soon', image: '/event_images/poker.jpeg' },
    { id: '10000000-0000-0000-0000-000000000008', title: 'Study at the Library', location: 'LIV Library', time: 'Soon', image: '/event_images/library.jpg' },
  ],
  locations: [
    { id: 'loc-open-space', name: 'Open Space', type: 'Hall', events: 1 },
    { id: 'loc-ilive', name: 'iLive Campus', type: 'Sports', events: 1 },
    { id: 'loc-doner', name: 'Doner Eck', type: 'Restaurant', events: 1 },
    { id: 'loc-sportplatz', name: 'Sportplatze Wertwiesen', type: 'Sports Field', events: 1 },
    { id: 'loc-kletter', name: 'KletterArena', type: 'Climbing Wall', events: 1 },
    { id: 'loc-mensa', name: 'Mensa, Bildungscampus', type: 'Cafeteria', events: 1 },
    { id: 'loc-w27', name: 'W27 Lounge', type: 'Lounge', events: 1 },
    { id: 'loc-library', name: 'LIV Library', type: 'Library', events: 1 },
  ],
  people: [
    { id: '00000000-0000-0000-0000-000000000001', name: 'Omar Azlan', department: 'BMDS', avatar: '/pfpics/omar.jpg' },
    { id: '00000000-0000-0000-0000-000000000002', name: 'Assem El Dlebshany', department: 'BIE', avatar: '/pfpics/assem.png' },
    { id: '00000000-0000-0000-0000-000000000003', name: 'Sarah Jahan', department: 'BMDS', avatar: '/pfpics/sarah.JPG' },
    { id: '00000000-0000-0000-0000-000000000004', name: 'Rahul Chanani', department: 'Physics', avatar: '/pfpics/rahul.jpeg' },
    { id: '00000000-0000-0000-0000-000000000005', name: 'Timo Robrecht', department: 'BIE', avatar: '/pfpics/timo.PNG' },
    { id: '00000000-0000-0000-0000-000000000006', name: 'Danila Zhukov', department: 'BMDS', avatar: '/pfpics/danila.jpeg' },
  ]
};

export default function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('events');
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);

  const handleAISearch = () => {
    if (!aiQuery.trim()) return;
    setIsAILoading(true);
    setTimeout(() => {
      setIsAILoading(false);
      setActiveTab('events');
    }, 1500);
  };

  const filteredResults = {
    events: sampleResults.events.filter(e =>
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.location.toLowerCase().includes(query.toLowerCase())
    ),
    locations: sampleResults.locations.filter(l =>
      l.name.toLowerCase().includes(query.toLowerCase())
    ),
    people: sampleResults.people.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.department.toLowerCase().includes(query.toLowerCase())
    )
  };

  return (
    <>
      {/* Collapsed Search Bar */}
      <button
        onClick={() => setIsExpanded(true)}
        className="flex-1 h-9 px-3 rounded-full flex items-center gap-2 transition-all"
        style={{
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <Search className="w-4 h-4 text-white/70" />
        <span className="text-[13px] text-white/70 flex-1 text-left">Search…</span>
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </button>

      {/* Expanded Search Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl"
              style={{ height: '85vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-5 pt-4 pb-3">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">Search</h2>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={isAIMode ? aiQuery : query}
                    onChange={(e) => isAIMode ? setAiQuery(e.target.value) : setQuery(e.target.value)}
                    placeholder={isAIMode ? "Ask AI: e.g., 'workshops tomorrow with < 10 people'" : "Search events, people, places…"}
                    className="h-12 pl-12 pr-14 rounded-2xl bg-gray-50 border-gray-200 text-[15px] focus:border-accent focus:ring-accent"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isAIMode) {
                        handleAISearch();
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (isAIMode && aiQuery) {
                        handleAISearch();
                      } else {
                        setIsAIMode(!isAIMode);
                      }
                    }}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isAIMode ? 'bg-accent text-black' : 'bg-accent/10 text-accent hover:bg-accent/20'
                    }`}
                  >
                    {isAILoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* AI Mode Indicator */}
                {isAIMode && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-accent/5 rounded-xl border border-accent/20"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent" />
                      <span className="text-sm text-accent font-medium">AI Search Active</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Ask naturally: "Find beginner-friendly tech events this week"
                    </p>
                  </motion.div>
                )}

                {/* Tabs */}
                {!isAIMode && (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="w-full h-11 bg-gray-100 rounded-xl p-1">
                      <TabsTrigger value="events" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        Events
                      </TabsTrigger>
                      <TabsTrigger value="locations" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <MapPin className="w-4 h-4 mr-1.5" />
                        Places
                      </TabsTrigger>
                      <TabsTrigger value="people" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Users className="w-4 h-4 mr-1.5" />
                        People
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
              </div>

              {/* Results */}
              <div className="px-5 pb-8 overflow-y-auto" style={{ height: 'calc(85vh - 200px)' }}>
                {!isAIMode && activeTab === 'events' && (
                  <div className="space-y-3 pt-2">
                    {(query ? filteredResults.events : sampleResults.events).map((event) => (
                      <motion.button
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left"
                      >
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{event.title}</p>
                          <p className="text-sm text-gray-500 truncate">{event.location}</p>
                          <p className="text-xs text-accent font-medium mt-1">{event.time}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {!isAIMode && activeTab === 'locations' && (
                  <div className="space-y-2 pt-2">
                    {(query ? filteredResults.locations : sampleResults.locations).map((location) => (
                      <motion.button
                        key={location.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{location.name}</p>
                          <p className="text-sm text-gray-500">{location.type} • {location.events} events</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {!isAIMode && activeTab === 'people' && (
                  <div className="space-y-2 pt-2">
                    {(query ? filteredResults.people : sampleResults.people).map((person) => (
                      <motion.button
                        key={person.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors text-left"
                      >
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{person.name}</p>
                          <p className="text-sm text-gray-500">{person.department}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {isAIMode && !isAILoading && (
                  <div className="pt-6">
                    <p className="text-sm text-gray-500 text-center mb-4">Try asking:</p>
                    <div className="space-y-2">
                      {[
                        "Show workshops happening today",
                        "Find tech events with less than 10 people",
                        "Coffee meetups near Garching campus",
                        "Study groups for Machine Learning"
                      ].map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => setAiQuery(suggestion)}
                          className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-700"
                        >
                          "{suggestion}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

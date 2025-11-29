import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './Layout';
import Feed from './pages/Feed';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import MyEvents from './pages/MyEvents';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/createevent" element={<CreateEvent />} />
            <Route path="/eventdetail" element={<EventDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/userprofile" element={<UserProfile />} />
            <Route path="/myevents" element={<MyEvents />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

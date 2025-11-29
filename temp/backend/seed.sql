-- Seed script for TUMatch database
-- Run this to populate the database with test data

-- Clear existing data (if any)
TRUNCATE TABLE moments, friendships, event_participants, events, users CASCADE;

-- Create test users
INSERT INTO users (id, email, full_name, profile_photo, department, bio) VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, 'current@tum.de', 'Omar Azlan', '/pfpics/omar.jpg', 'BMDS', 'This is the current logged-in user'),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'alex@tum.de', 'Assem El Dlebshany', '/pfpics/assem.png', 'BIE', 'Passionate about AI and machine learning. Always looking for study groups!'),
  ('00000000-0000-0000-0000-000000000003'::uuid, 'sara@tum.de', 'Sarah Jahan', '/pfpics/sarah.JPG', 'BMDS', 'Robotics enthusiast. Love building things and meeting new people.'),
  ('00000000-0000-0000-0000-000000000004'::uuid, 'lisa@tum.de', 'Rahul Chanani', '/pfpics/rahul.jpeg', 'BMDS', 'Quantum computing researcher. Coffee addict ☕'),
  ('00000000-0000-0000-0000-000000000005'::uuid, 'max@tum.de', 'Timo Robrecht', '/pfpics/timo.PNG', 'BIE', 'Love organising new events!'),
  ('00000000-0000-0000-0000-000000000006'::uuid, 'emma@tum.de', 'Danila Zhukov', '/pfpics/danila.jpeg', 'BMDS', 'Startup and networking enthusiast');

-- Create real events with actual photos from event_images folder
INSERT INTO events (id, creator_id, title, description, category, location, image_url, start_time, end_time, max_participants, status) VALUES
  ('10000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid,
   'TOMfoolery Hackathon',
   'Join us for an exciting 24-hour hackathon! Build innovative projects, network with talented developers, and compete for prizes.',
   'Workshop', 'Open Space',
   '/event_images/hackathon.jpg',
   NOW() + INTERVAL '1 hour', NOW() + INTERVAL '3 hours', 50, 'active'),

   ('10000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000001'::uuid,
   'Volleyball at iLive',
   'Friendly volleyball tournament at the TUM sports center. Teams will be formed on the spot. All skill levels welcome!',
   'Sports', 'iLive Campus',
   '/event_images/volleyball.jpg',
   NOW() + INTERVAL '2 hours', NOW() + INTERVAL '4 hours', 12, 'active'),

   ('10000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000006'::uuid,
   'Grab a Doner',
   'Casual dinner at a local doner shop. Perfect for grabbing food and catching up with friends!',
   'Social', 'Doner Eck',
   '/event_images/doner.jpg',
   NOW() + INTERVAL '5 hours', NOW() + INTERVAL '6 hours', 10, 'active'),

  ('10000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000005'::uuid,
   'Football Training',
   'Friendly football/soccer match at the TUM sports field. All skill levels welcome!',
   'Sports', 'Sportplatze Wertwiesen',
   '/event_images/football.jpg',
   NOW() + INTERVAL '7 hours', NOW() + INTERVAL '11 hours', 22, 'active'),

  ('10000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000004'::uuid,
   'Bouldering',
   'Rock climbing and bouldering at the TUM climbing wall. Great workout and fun community. All experience levels welcome!',
   'Sports', 'KletterArena',
   '/event_images/bouldering.jpg',
   NOW() + INTERVAL '14 hours', NOW() + INTERVAL '15 hours', 20, 'active'),

  ('10000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-0000-0000-000000000004'::uuid,
   'Lunch at Mensa',
   'Casual lunch at the TUM Mensa. Great way to meet new people and discuss your semester!',
   'Social', 'Mensa, Bildungscampus',
   '/event_images/mensa.jpg',
   NOW() + INTERVAL '9 hours', NOW() + INTERVAL '10 hours', 15, 'active'),

  ('10000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000005'::uuid,
   'Poker Night',
   'Friendly poker game evening. Bring some snacks and enjoy a casual night with friends!',
   'Social', 'W27 Lounge',
   '/event_images/poker.jpeg',
   NOW() + INTERVAL '12 hours', NOW() + INTERVAL '13 hours', 10, 'active'),

  ('10000000-0000-0000-0000-000000000008'::uuid, '00000000-0000-0000-0000-000000000002'::uuid,
   'Study at the Library',
   'Quiet study session at the TUM library. Perfect for focused work and exam preparation. Bring your materials!',
   'Study', 'LIV Library',
   '/event_images/library.jpg',
   NOW() + INTERVAL '7 hours', NOW() + INTERVAL '8 hours', 15, 'active');

-- Create event participants (some users have already joined)
INSERT INTO event_participants (event_id, user_id, status) VALUES
  -- ML Study Group
  ('10000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000003'::uuid, 'joined'),
  ('10000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000005'::uuid, 'joined'),

  -- Robotics Workshop
  ('10000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, 'joined'),
  ('10000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000004'::uuid, 'joined'),
  ('10000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000006'::uuid, 'joined'),

  -- Coffee & Physics
  ('10000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000003'::uuid, 'joined'),
  ('10000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000005'::uuid, 'joined'),

  ('10000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, 'joined'),
  ('10000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000004'::uuid, 'joined'),
  ('10000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000006'::uuid, 'joined'),

  ('10000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000003'::uuid, 'joined'),
  ('10000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000005'::uuid, 'joined'),

  -- Soccer Match
  ('10000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-0000-0000-000000000003'::uuid, 'joined'),
  ('10000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-0000-0000-000000000004'::uuid, 'joined'),
  ('10000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-0000-0000-000000000005'::uuid, 'joined'),
  ('10000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-0000-0000-000000000006'::uuid, 'joined'),

  -- Poker Night
  ('10000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'joined'),
  ('10000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000003'::uuid, 'joined'),
  ('10000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000006'::uuid, 'joined'),

  -- Bouldering Session
  ('10000000-0000-0000-0000-000000000008'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'joined'),
  ('10000000-0000-0000-0000-000000000008'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, 'joined'),
  ('10000000-0000-0000-0000-000000000008'::uuid, '00000000-0000-0000-0000-000000000005'::uuid, 'joined');

-- Create friendships
INSERT INTO friendships (user_id, friend_id, status) VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, 'accepted'),
  ('00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000003'::uuid, 'accepted'),
  ('00000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000003'::uuid, 'accepted'),
  ('00000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000004'::uuid, 'accepted'),
  ('00000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000005'::uuid, 'pending');

-- Create moments
INSERT INTO moments (user_id, event_id, photo_url, caption) VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, '10000000-0000-0000-0000-000000000001'::uuid,
   '/moments/hackathon.jpg',
   'Great study session today! Learned so much about neural networks 🧠'),
  ('00000000-0000-0000-0000-000000000001'::uuid, '10000000-0000-0000-0000-000000000002'::uuid,
   '/moments/football.JPG',
   'Built my first robot! Thanks everyone for the help 🤖'),
  ('00000000-0000-0000-0000-000000000004'::uuid, '10000000-0000-0000-0000-000000000003'::uuid,
   'https://images.unsplash.com/photo-1501959915551-4e8d30928317?w=400',
   'Best coffee chat ever! ☕✨');

-- Verify the data
SELECT 'Users created:' as message, COUNT(*) as count FROM users;
SELECT 'Events created:' as message, COUNT(*) as count FROM events;
SELECT 'Participants:' as message, COUNT(*) as count FROM event_participants;
SELECT 'Friendships:' as message, COUNT(*) as count FROM friendships;
SELECT 'Moments:' as message, COUNT(*) as count FROM moments;

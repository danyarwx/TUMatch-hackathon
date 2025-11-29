-- Extended seed data for TUMatch database
-- Adds more events, participants, friendships, and moments

-- Add real events based on actual photos
INSERT INTO events (id, title, description, category, location, image_url, start_time, end_time, max_participants, status, creator_id, created_at) VALUES
('10000000-0000-0000-0000-000000000007', 'Bouldering Session', 'Rock climbing and bouldering at the TUM climbing wall. Great workout and fun community. All experience levels welcome!', 'Sports', 'TUM Climbing Wall, Sports Center', '/event_images/bouldering.jpg', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 3 hours', 12, 'active', '00000000-0000-0000-0000-000000000004', NOW()),
('10000000-0000-0000-0000-000000000008', 'Poker Night', 'Friendly poker game evening. Bring some snacks and enjoy a casual night with friends!', 'Social', 'Student Lounge, Building 5', '/event_images/poker.jpeg', NOW() + INTERVAL '1 day 18 hours', NOW() + INTERVAL '1 day 22 hours', 10, 'active', '00000000-0000-0000-0000-000000000005', NOW());

-- Add event participants (users joined the new events)
INSERT INTO event_participants (event_id, user_id, joined_at) VALUES
-- Bouldering Session participants
('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', NOW()),
('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002', NOW()),
('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', NOW()),
('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000005', NOW()),
-- Poker Night participants
('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', NOW()),
('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000004', NOW()),
('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000006', NOW());

-- Add more friendships
INSERT INTO friendships (user_id, friend_id, status, created_at) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'accepted', NOW() - INTERVAL '10 days'),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'accepted', NOW() - INTERVAL '10 days'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'accepted', NOW() - INTERVAL '8 days'),
('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'accepted', NOW() - INTERVAL '8 days'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'accepted', NOW() - INTERVAL '12 days'),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'accepted', NOW() - INTERVAL '12 days'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'accepted', NOW() - INTERVAL '6 days'),
('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'accepted', NOW() - INTERVAL '6 days'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 'accepted', NOW() - INTERVAL '9 days'),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'accepted', NOW() - INTERVAL '9 days');

-- Add more moments
INSERT INTO moments (id, user_id, event_id, photo_url, caption, created_at) VALUES
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800', 'Great ML study session! Learned so much about neural networks 🧠', NOW() - INTERVAL '1 day'),
('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800', 'Built my first robot today! Thanks to everyone who helped 🤖', NOW() - INTERVAL '2 hours'),
('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800', 'Coffee & Physics = Best combination ☕️📚', NOW() - INTERVAL '3 days'),
('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800', 'What an intense soccer match! ⚽️ Team spirit was amazing', NOW() - INTERVAL '5 hours'),
('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800', 'Pitched my startup idea today. Fingers crossed! 🤞', NOW() - INTERVAL '4 days'),
('20000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', 'Volleyball tournament was epic! �', NOW() - INTERVAL '6 hours'),
('20000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800', 'Bouldering session - great workout! 🧗', NOW() - INTERVAL '8 hours'),
('20000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800', 'Poker night was fun! 🃏', NOW() - INTERVAL '1 day');

-- Update participant counts (trigger should handle this, but just in case)
-- This is already handled by the backend when fetching events, so no action needed

SELECT 'Extended seed data inserted successfully!' as status;
SELECT COUNT(*) as total_events FROM events;
SELECT COUNT(*) as total_participants FROM event_participants;
SELECT COUNT(*) as total_friendships FROM friendships;
SELECT COUNT(*) as total_moments FROM moments;

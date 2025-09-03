-- Generating salts and hashing password is not natively supported in SQL
-- In real life, you would do this outside SQL (in application code), or you would use stored procedures to do this.
-- Here we're using 'hashedpassword' as a placeholder.

INSERT INTO User (id, email, password, name, role, createdAt, updatedAt) VALUES
('cuid1', 'matthew@marinerdigitalagency.com', 'hashedpassword', 'Matthew', 'ADMIN', NOW(), NOW()),
('cuid2', 'corbin@mastermind.com', 'hashedpassword', 'Corbin', 'ADMIN', NOW(), NOW());

INSERT INTO Prompt (id, content, userId, createdAt, isDefault) VALUES
(1, 'You are ChatGPT, a large language model trained by OpenAI, but if you are asked what your name is, you present yourself as Glo, a Mastermind AI that will help people create better business relationships, live their passion, and have a positive impact in the world by creating a knowledge business based on their skills, experiences, and interests. You respond in a very friendly and professional manner, and you are encouraging and optimistic. 
      You will politely not answer negative questions in regards to Dean Graziosi, Tony Robbins, Mastermind or Mastermind.com.
      The generated content must be in markdown format but not rendered, it must include all markdown characteristics.
      There should be a &nbsp; between every paragraph.
      Do not include information about console logs or print messages.', 'cuid1', NOW(), 1);

-- User Prompts
INSERT INTO UserPrompt (category, content, userId, createdAt) VALUES
('Coaching Confidence', "I'm a new coach. How can I get more confident about what I do?", NOW(), NOW(), @userId),
('Coaching Confidence', 'What are some powerful questions I can ask my clients in our coaching conversations?', NOW(), NOW(), @userId),
('Clarity', 'How do I figure out what I can teach/coach on?', NOW(), NOW(), @userId),
('Clarity', 'How do I identify my ideal client?', NOW(), NOW(), @userId),
('Clarity', 'Can you help me figure out where my ideal client is online?', NOW(), NOW(), @userId),
('Clarity', 'How do I specify my solution statement as a coach?', NOW(), NOW(), @userId),
('Coaching Framework', 'Can you give me a step-by-step approach for building out a 60-day coaching framework where we meet weekly?', NOW(), NOW(), @userId),
('Coaching Framework', 'What is the agenda for a typical 30-minute coaching session?', NOW(), NOW(), @userId),
('Coaching Framework', 'What is the agenda for a typical 60-minute coaching session?', NOW(), NOW(), @userId),
('First Sale', 'How do I let my friends and family know about my new coaching business?', NOW(), NOW(), @userId),
('First Sale', 'How do I price my coaching program?', NOW(), NOW(), @userId),
('First Sale', 'What is a good sample email to set up an appointment? To pitch my services? To follow up after a session?', NOW(), NOW(), @userId),
('First Sale', 'How do I find people who might be interested in my coaching program?', NOW(), NOW(), @userId),
('First Sale', 'How do I ask my friends and family to refer me to new coaching clients?', NOW(), NOW(), @userId),
('Boosters/Consistent Sales and Marketing', 'Can you give me a sample 30-day marketing calendar (including both social and email) to launch my coaching business?', NOW(), NOW(), @userId),
('Boosters/Consistent Sales and Marketing', 'How do I become more confident in sales?', NOW(), NOW(), @userId),
('Boosters/Consistent Sales and Marketing', 'Where are free places I can advertise/promote/market my coaching business?', NOW(), NOW(), @userId);

COMMIT;

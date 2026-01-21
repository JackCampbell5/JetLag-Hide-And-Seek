-- Seed data for card types based on provided JSON

INSERT INTO card_types (type, color, cards, small, medium, large) VALUES
('Time Bonus', 'Red', 25, 2, 3, 5),
('Time Bonus', 'Orange', 15, 4, 6, 10),
('Matching', 'Blue', 20, 3, 5, 8),
('Measuring', 'Green', 20, 3, 5, 8),
('Thermometer', 'Purple', 15, 5, 7, 10),
('Radar', 'Yellow', 15, 5, 7, 10),
('Tentacles', 'Pink', 10, 8, 12, 15),
('Photos', 'Gray', 30, 1, 2, 3),
('Discard 1 Draw 2', 'Special', 8, 0, 0, 0),
('Discard 2 Draw 3', 'Special', 5, 0, 0, 0);

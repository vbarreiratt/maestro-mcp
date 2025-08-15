-- Dados de teste para popular a biblioteca musical
-- Execute no SQL Editor do Supabase Dashboard

INSERT INTO music_scores (
  id, title, composer, style, composition_year, key_signature, bpm, difficulty, 
  maestro_format, preview_notes, is_public
) VALUES 
-- Bach - Fuga em Dó Maior
('bach_fuga_001', 'Fuga em Dó Maior BWV 846', 'J.S. Bach', 'baroque', 1722, 'C major', 120, 8, 
 '{"bpm":120,"key":"C major","voices":[{"notes":"C4:q D4:q E4:q F4:q G4:q A4:q B4:q C5:q","channel":1,"velocity":0.8}]}', 
 'C4:q D4:q E4:q F4:q', true),

-- Mozart - Sonata K331
('mozart_sonata_001', 'Sonata em Lá Maior K.331', 'W.A. Mozart', 'classical', 1783, 'A major', 140, 6,
 '{"bpm":140,"key":"A major","voices":[{"notes":"A4:e B4:e C#5:e D5:e E5:q A4:q","channel":1,"velocity":0.7}]}',
 'A4:e B4:e C#5:e D5:e', true),

-- Chopin - Noturno
('chopin_nocturne_001', 'Noturno em Mi Bemol Op.9 No.2', 'F. Chopin', 'romantic', 1832, 'Eb major', 80, 7,
 '{"bpm":80,"key":"Eb major","voices":[{"notes":"Eb4:h G4:q Bb4:q Eb5:q","channel":1,"velocity":0.6}]}',
 'Eb4:h G4:q Bb4:q', true),

-- Jazz Standard
('jazz_standard_001', 'Autumn Leaves', 'Joseph Kosma', 'jazz', 1945, 'G minor', 120, 5,
 '{"bpm":120,"key":"G minor","voices":[{"notes":"G4:q Bb4:q D5:q F5:q Eb5:h","channel":1,"velocity":0.7}]}',
 'G4:q Bb4:q D5:q F5:q', true),

-- Bossa Nova
('bossa_001', 'Girl from Ipanema', 'Antonio Carlos Jobim', 'bossa_nova', 1962, 'F major', 130, 4,
 '{"bpm":130,"key":"F major","voices":[{"notes":"F4:q A4:q C5:q F5:q D5:h","channel":1,"velocity":0.6}]}',
 'F4:q A4:q C5:q', true);

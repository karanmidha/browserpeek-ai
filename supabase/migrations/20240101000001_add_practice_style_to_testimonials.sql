-- Add practice_style column to testimonials table
ALTER TABLE testimonials
ADD COLUMN practice_style TEXT CHECK (practice_style IN ('Hatha', 'Vinyasa', 'Yin', 'Restorative'));

-- Create index for practice_style filtering
CREATE INDEX idx_testimonials_practice_style ON testimonials(practice_style);
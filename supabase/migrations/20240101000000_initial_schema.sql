-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE testimonial_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE inquiry_status AS ENUM ('new', 'in_progress', 'resolved');
CREATE TYPE inquiry_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE payment_transaction_status AS ENUM ('created', 'authorized', 'captured', 'refunded', 'failed');

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'student' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- Practice styles table
CREATE TABLE practice_styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    max_students INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Time slots table
CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true NOT NULL,
    max_students INTEGER NOT NULL,
    practice_style_id UUID REFERENCES practice_styles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    time_slot_id UUID REFERENCES time_slots(id) ON DELETE CASCADE NOT NULL,
    status booking_status DEFAULT 'pending' NOT NULL,
    payment_status payment_status DEFAULT 'pending' NOT NULL,
    payment_id TEXT, -- RazorPay payment ID
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR' NOT NULL,
    special_requests TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Testimonials table
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    status testimonial_status DEFAULT 'pending' NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Contact inquiries table
CREATE TABLE contact_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status inquiry_status DEFAULT 'new' NOT NULL,
    priority inquiry_priority DEFAULT 'medium' NOT NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMPTZ
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    razorpay_payment_id TEXT NOT NULL,
    razorpay_order_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR' NOT NULL,
    status payment_transaction_status DEFAULT 'created' NOT NULL,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(razorpay_payment_id)
);

-- Create indexes for performance
CREATE INDEX idx_time_slots_date ON time_slots(date);
CREATE INDEX idx_time_slots_instructor ON time_slots(instructor_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_time_slot ON bookings(time_slot_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_contact_inquiries_status ON contact_inquiries(status);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practice_styles_updated_at BEFORE UPDATE ON practice_styles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at BEFORE UPDATE ON time_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default practice styles
INSERT INTO practice_styles (name, description, duration_minutes, max_students, price) VALUES
('Hatha Yoga', 'Gentle, slow-paced practice focusing on basic postures and breathing techniques. Perfect for beginners and those seeking relaxation.', 60, 15, 500.00),
('Vinyasa Flow', 'Dynamic sequences that link movement with breath. Builds strength, flexibility, and mindfulness through flowing transitions.', 75, 12, 650.00),
('Meditation & Pranayama', 'Mindfulness meditation and breathing practices for inner peace, stress relief, and mental clarity.', 45, 20, 400.00),
('Restorative Yoga', 'Deeply relaxing practice using props to support the body in restful poses. Ideal for stress relief and healing.', 90, 10, 750.00),
('Power Yoga', 'Vigorous, fitness-based approach to yoga that builds core strength and improves flexibility.', 60, 8, 700.00);
-- PostgreSQL Database Schema for AI Audio Guide App

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL, -- ADMIN | OWNER
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tours (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'vi',
    current_tour_id BIGINT REFERENCES tours(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expired_at TIMESTAMP
);

CREATE TABLE pois (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    trigger_radius INTEGER DEFAULT 50,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE poi_contents (
    id BIGSERIAL PRIMARY KEY,
    poi_id BIGINT REFERENCES pois(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_urls JSONB,
    audio_file_url TEXT,
    tts_script TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tour_pois (
    id BIGSERIAL PRIMARY KEY,
    tour_id BIGINT REFERENCES tours(id) ON DELETE CASCADE,
    poi_id BIGINT REFERENCES pois(id) ON DELETE CASCADE, -- referenced as restaurant_id in prompt but poi_id here
    order_index INTEGER NOT NULL
);

CREATE TABLE play_history (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    poi_id BIGINT REFERENCES pois(id) ON DELETE CASCADE, -- restaurant_id -> poi_id
    poi_content_id BIGINT REFERENCES poi_contents(id) ON DELETE CASCADE,
    trigger_type VARCHAR(20) NOT NULL, -- GEOFENCE | TOUR | QR | MANUAL
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INTEGER
);

CREATE TABLE user_locations (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE qr_codes (
    id BIGSERIAL PRIMARY KEY,
    poi_id BIGINT REFERENCES pois(id) ON DELETE CASCADE, -- restaurant_id -> poi_id
    qr_value TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

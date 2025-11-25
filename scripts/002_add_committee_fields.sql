-- Adicionar campos de endereço e fotos aos comitês
ALTER TABLE committees ADD COLUMN IF NOT EXISTS street_address text;
ALTER TABLE committees ADD COLUMN IF NOT EXISTS street_number text;
ALTER TABLE committees ADD COLUMN IF NOT EXISTS cep text;
ALTER TABLE committees ADD COLUMN IF NOT EXISTS profile_image_url text;
ALTER TABLE committees ADD COLUMN IF NOT EXISTS gallery_images text[];

-- Adicionar campos extras aos eventos
ALTER TABLE events ADD COLUMN IF NOT EXISTS reference_point text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS street_address text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS street_number text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_neighborhood text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_cep text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_time time;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_committees_creator ON committees(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_committee ON events(committee_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_event ON event_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_committee_members_committee ON committee_members(committee_id);

-- Index on last_seen for efficient stale-record cleanup
CREATE INDEX IF NOT EXISTS idx_site_visitors_last_seen ON site_visitors(last_seen);

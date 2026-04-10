-- Historical prices table
-- Stores OHLCV + adjusted close for any stock / index / ETF symbol.
CREATE TABLE IF NOT EXISTS historical_prices (
  id         BIGSERIAL PRIMARY KEY,
  symbol     TEXT        NOT NULL,
  date       DATE        NOT NULL,
  open       NUMERIC(18, 6),
  high       NUMERIC(18, 6),
  low        NUMERIC(18, 6),
  close      NUMERIC(18, 6),
  volume     BIGINT,
  adj_close  NUMERIC(18, 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_symbol_date UNIQUE (symbol, date)
);

-- Indexes for typical query patterns
CREATE INDEX IF NOT EXISTS idx_hp_symbol      ON historical_prices (symbol);
CREATE INDEX IF NOT EXISTS idx_hp_date        ON historical_prices (date);
CREATE INDEX IF NOT EXISTS idx_hp_symbol_date ON historical_prices (symbol, date DESC);

-- Row-Level Security
ALTER TABLE historical_prices ENABLE ROW LEVEL SECURITY;

-- Public read access (anon key can SELECT)
CREATE POLICY "public read historical_prices"
  ON historical_prices
  FOR SELECT
  USING (true);

-- Only service-role / authenticated backend can INSERT / UPDATE / DELETE
CREATE POLICY "service write historical_prices"
  ON historical_prices
  FOR ALL
  USING (auth.role() = 'service_role');

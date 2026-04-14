"""
fetch_historical_data.py
========================
Downloads historical OHLCV + adjusted-close data using yfinance and upserts
it into the `historical_prices` table in Supabase.

Usage
-----
1. Copy .env.example → .env and fill in SUPABASE_URL / SUPABASE_SERVICE_KEY.
2. pip install -r requirements.txt
3. python fetch_historical_data.py

The script uses "upsert" on (symbol, date) so it is safe to re-run; it will
only insert new rows or update existing ones.
"""

import os
import sys
import time
import logging
from datetime import datetime, timedelta

import yfinance as yf
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    log.error(
        "Missing environment variables. "
        "Copy .env.example → .env and set SUPABASE_URL and SUPABASE_SERVICE_KEY."
    )
    sys.exit(1)

# Symbols to fetch.  Add/remove as needed.
SYMBOLS = [
    # Indices
    "^GSPC",   # S&P 500
    "^IXIC",   # NASDAQ Composite
    "^DJI",    # Dow Jones Industrial Average
    "^RUT",    # Russell 2000
    # S&P 500 ETFs
    "SPY",     # SPDR S&P 500 ETF
    "VOO",     # Vanguard S&P 500 ETF
    "IVV",     # iShares Core S&P 500 ETF
    "SPLG",    # SPDR Portfolio S&P 500
    # NASDAQ ETFs
    "QQQ",     # NASDAQ 100 ETF
    "QQQM",    # NASDAQ 100 ETF Mini
    # Total Market
    "VTI",     # Vanguard Total Market ETF
    # Small Cap
    "IWM",     # iShares Russell 2000 ETF
    # International
    "EFA",     # iShares MSCI EAFE
    "VEA",     # Vanguard Developed Markets
    "EEM",     # iShares Emerging Markets
    "VWO",     # Vanguard Emerging Markets
    # Bonds
    "AGG",     # US Bond Aggregate ETF
    "BND",     # Vanguard Total Bond
    "TLT",     # iShares 20+ Year Treasury
    # Commodities
    "GLD",     # Gold ETF
    "IAU",     # iShares Gold Trust
    "SLV",     # Silver ETF
    # Sector ETFs
    "XLK",     # Technology
    "XLE",     # Energy
    "XLF",     # Financials
    "XLV",     # Healthcare
    "VNQ",     # Real Estate
    # Popular Stocks
    "AAPL",    # Apple
    "MSFT",    # Microsoft
    "GOOGL",   # Alphabet
    "AMZN",    # Amazon
    "NVDA",    # NVIDIA
    "TSLA",    # Tesla
    "META",    # Meta
    "JPM",     # JPMorgan
    "BRK-B",   # Berkshire Hathaway B
    "V",       # Visa
]

# Maximum historical data available from Yahoo Finance
START_DATE = "1970-01-01"
END_DATE = datetime.today().strftime("%Y-%m-%d")

# Supabase batch size (rows per upsert call – keep under 1000)
BATCH_SIZE = 500

# Seconds to wait between symbol fetches (be polite to Yahoo Finance)
FETCH_DELAY = 1.0

# ---------------------------------------------------------------------------
# Supabase client
# ---------------------------------------------------------------------------
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _normalise_dates(df: pd.DataFrame) -> pd.DataFrame:
    """Strip timezone and convert Date index/column to ISO string."""
    df = df.reset_index()
    df.rename(columns={"Date": "date"}, inplace=True)
    df["date"] = pd.to_datetime(df["date"]).dt.tz_localize(None).dt.strftime("%Y-%m-%d")
    return df


def fetch_symbol(symbol: str) -> pd.DataFrame:
    """Download OHLCV data for a single symbol using yfinance.

    Fetches twice:
      1. auto_adjust=False  → unadjusted OHLCV  (stored as close/open/high/low)
      2. auto_adjust=True   → dividend-adjusted close (stored as adj_close)

    This lets the frontend show both price return and total return.
    """
    log.info(f"Fetching {symbol} from {START_DATE} to {END_DATE} …")
    ticker = yf.Ticker(symbol)

    # ── 1. Unadjusted OHLCV ──────────────────────────────────────────────────
    df_raw = ticker.history(start=START_DATE, end=END_DATE, auto_adjust=False, actions=False)
    if df_raw.empty:
        log.warning(f"No data returned for {symbol}")
        return pd.DataFrame()

    df_raw = _normalise_dates(df_raw)
    df_raw.rename(
        columns={"Open": "open", "High": "high", "Low": "low", "Close": "close", "Volume": "volume"},
        inplace=True,
    )

    # ── 2. Dividend-adjusted close ────────────────────────────────────────────
    df_adj = ticker.history(start=START_DATE, end=END_DATE, auto_adjust=True, actions=False)
    if not df_adj.empty:
        df_adj = _normalise_dates(df_adj)
        df_adj.rename(columns={"Close": "adj_close"}, inplace=True)
        df_raw = df_raw.merge(df_adj[["date", "adj_close"]], on="date", how="left")
    else:
        df_raw["adj_close"] = df_raw["close"]

    # ── Finalise ──────────────────────────────────────────────────────────────
    cols = [c for c in ["date", "open", "high", "low", "close", "volume", "adj_close"] if c in df_raw.columns]
    df = df_raw[cols].copy()
    df["symbol"] = symbol
    df = df.where(pd.notnull(df), other=None)

    log.info(f"  → {len(df)} rows for {symbol}")
    return df


def upsert_to_supabase(df: pd.DataFrame) -> None:
    """Batch-upsert a DataFrame into historical_prices."""
    records = df.to_dict(orient="records")
    total = len(records)

    for start in range(0, total, BATCH_SIZE):
        batch = records[start : start + BATCH_SIZE]
        response = (
            supabase.table("historical_prices")
            .upsert(batch, on_conflict="symbol,date")
            .execute()
        )
        end = min(start + BATCH_SIZE, total)
        log.info(f"  Upserted rows {start + 1}–{end} / {total}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    log.info("=" * 60)
    log.info("Net Profit – Historical Data Fetcher")
    log.info(f"Symbols : {', '.join(SYMBOLS)}")
    log.info(f"Period  : {START_DATE} → {END_DATE}")
    log.info("=" * 60)

    errors = []

    for symbol in SYMBOLS:
        try:
            df = fetch_symbol(symbol)
            if df.empty:
                errors.append(symbol)
                continue
            upsert_to_supabase(df)
            log.info(f"[OK] {symbol} done.")
        except Exception as exc:
            log.error(f"[FAIL] {symbol}: {exc}")
            errors.append(symbol)
        finally:
            time.sleep(FETCH_DELAY)

    log.info("=" * 60)
    if errors:
        log.warning(f"Finished with errors for: {', '.join(errors)}")
    else:
        log.info("All symbols fetched and uploaded successfully.")


if __name__ == "__main__":
    main()

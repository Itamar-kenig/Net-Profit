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
    "^GSPC",   # S&P 500
    "^IXIC",   # NASDAQ Composite
    "^DJI",    # Dow Jones Industrial Average
    "^RUT",    # Russell 2000
    "SPY",     # S&P 500 ETF
    "QQQ",     # NASDAQ 100 ETF
    "VOO",     # Vanguard S&P 500 ETF
    "VTI",     # Vanguard Total Market ETF
    "GLD",     # Gold ETF
    "AGG",     # US Bond Aggregate ETF
]

# At least 20 years back
START_DATE = "2000-01-01"
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

def fetch_symbol(symbol: str) -> pd.DataFrame:
    """Download OHLCV data for a single symbol using yfinance."""
    log.info(f"Fetching {symbol} from {START_DATE} to {END_DATE} …")
    ticker = yf.Ticker(symbol)
    df = ticker.history(start=START_DATE, end=END_DATE, auto_adjust=False)

    if df.empty:
        log.warning(f"No data returned for {symbol}")
        return pd.DataFrame()

    df = df.reset_index()
    df.rename(
        columns={
            "Date": "date",
            "Open": "open",
            "High": "high",
            "Low": "low",
            "Close": "close",
            "Volume": "volume",
            "Adj Close": "adj_close",
        },
        inplace=True,
    )

    # Keep only the columns we need
    cols = [c for c in ["date", "open", "high", "low", "close", "volume", "adj_close"] if c in df.columns]
    df = df[cols].copy()

    # Normalise date to ISO string (no timezone)
    df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
    df["symbol"] = symbol

    # Replace NaN with None so Supabase accepts them as NULL
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

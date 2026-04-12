"""
seed_synthetic_data.py
======================
Generates realistic synthetic daily price data calibrated to actual historical
market parameters, and upserts it into Supabase historical_prices table.

This is a fallback for environments where Yahoo Finance is blocked.
The data uses Geometric Brownian Motion with real-world calibrated parameters.
"""

import os
import math
import random
from datetime import date, timedelta
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

BATCH_SIZE = 500

# Each symbol: (start_date, start_price, annual_return, annual_vol, seed)
# Parameters calibrated to real historical market data
SYMBOLS_CONFIG = {
    "^GSPC": ("2000-01-03", 1469.25,  0.105,  0.170, 1001),
    "^IXIC": ("2000-01-03", 4069.31,  0.080,  0.240, 1002),
    "^DJI":  ("2000-01-03", 11357.51, 0.092,  0.150, 1003),
    "^RUT":  ("2000-01-03", 504.71,   0.092,  0.200, 1004),
    "SPY":   ("2000-01-03", 148.25,   0.103,  0.170, 1005),
    "QQQ":   ("2000-01-03", 180.12,   0.080,  0.240, 1006),
    "VTI":   ("2001-05-24", 72.65,    0.100,  0.170, 1007),
    "VOO":   ("2010-09-07", 113.88,   0.132,  0.160, 1008),
    "GLD":   ("2004-11-18", 44.82,    0.082,  0.150, 1009),
    "AGG":   ("2003-09-26", 97.10,    0.020,  0.050, 1010),
}

def make_rng(seed):
    s = [seed]
    def rng():
        s[0] = (s[0] * 1664525 + 1013904223) & 0xFFFFFFFF
        return s[0] / 0xFFFFFFFF
    return rng

def normal(rng):
    while True:
        u1 = rng() or 1e-10
        u2 = rng()
        z = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)
        return z

def is_weekday(d):
    return d.weekday() < 5  # Mon–Fri

def generate_daily_prices(symbol, start_date_str, start_price, annual_return, annual_vol, seed):
    rng = make_rng(seed)
    dt = 1 / 252  # daily step (trading days per year)
    mu = annual_return - 0.5 * annual_vol ** 2
    sigma = annual_vol * math.sqrt(dt)

    start = date.fromisoformat(start_date_str)
    end = date.today()

    rows = []
    price = start_price
    d = start

    while d <= end:
        if is_weekday(d):
            z = normal(rng)
            price = price * math.exp(mu * dt + sigma * z)
            p = round(price, 2)
            # Simulate open/high/low around close
            daily_range = price * annual_vol * math.sqrt(dt) * 1.5
            open_p  = round(price * (1 + (rng() - 0.5) * 0.01), 2)
            high_p  = round(p + abs(rng() * daily_range), 2)
            low_p   = round(p - abs(rng() * daily_range), 2)
            vol     = int(rng() * 50_000_000 + 10_000_000)
            rows.append({
                "symbol":    symbol,
                "date":      d.isoformat(),
                "open":      open_p,
                "high":      high_p,
                "low":       low_p,
                "close":     p,
                "adj_close": p,
                "volume":    vol,
            })
        d += timedelta(days=1)

    return rows

def upsert(rows):
    total = len(rows)
    for i in range(0, total, BATCH_SIZE):
        batch = rows[i:i + BATCH_SIZE]
        supabase.table("historical_prices").upsert(batch, on_conflict="symbol,date").execute()
        print(f"  Upserted {min(i + BATCH_SIZE, total)}/{total}")

def main():
    print("=" * 55)
    print("Net Profit – Synthetic Data Seeder")
    print("=" * 55)
    for symbol, cfg in SYMBOLS_CONFIG.items():
        start_date, start_price, ann_ret, ann_vol, seed = cfg
        print(f"\n[{symbol}] generating from {start_date} …")
        rows = generate_daily_prices(symbol, start_date, start_price, ann_ret, ann_vol, seed)
        print(f"  {len(rows)} trading days generated")
        upsert(rows)
        print(f"  [OK] {symbol} done")
    print("\n" + "=" * 55)
    print("All symbols seeded successfully!")

if __name__ == "__main__":
    main()

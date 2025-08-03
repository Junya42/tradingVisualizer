from fastapi import FastAPI, UploadFile, File, HTTPException, Form
import sqlite3
import json
import pandas as pd
import io
import os
import importlib.util

app = FastAPI()

DB = "backtest.db"
STRATEGIES_DIR = "strategies"

if not os.path.exists(STRATEGIES_DIR):
    os.mkdir(STRATEGIES_DIR)

def init_db():
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS backtests
                 (name TEXT PRIMARY KEY, predictions TEXT, results TEXT, end_result TEXT)''')
    conn.commit()
    conn.close()

init_db()

@app.post("/createStrategy")
async def create_strategy(file: UploadFile = File(...)):
    if not file.filename.endswith('.py'):
        raise HTTPException(400, "Python file required")
    
    strategy_name = file.filename[:-3]
    file_path = os.path.join(STRATEGIES_DIR, file.filename)
    
    if os.path.exists(file_path):
        raise HTTPException(400, "Strategy already exists")
    
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)
    
    return {"message": "Strategy created successfully"}

@app.get("/getStrategies")
def get_strategies():
    strategies = [f[:-3] for f in os.listdir(STRATEGIES_DIR) if f.endswith(".py")]
    return {"strategies": strategies}

@app.delete("/deleteStrategy/{strategy_name}")
def delete_strategy(strategy_name: str):
    file_path = os.path.join(STRATEGIES_DIR, f"{strategy_name}.py")
    if not os.path.exists(file_path):
        raise HTTPException(404, "Strategy not found")
    os.remove(file_path)
    return {"message": "Strategy deleted successfully"}

@app.post("/create")
async def create(name: str = Form(...), amount: float = Form(...), strategy_name: str = Form(...), file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(400, "CSV file required")
    
    contents = await file.read()
    print(f"File size: {len(contents)} bytes")
    print(f"First 200 characters: {contents[:200]}")
    
    df = None
    try:
        # First try as comma-separated CSV with headers
        print("Trying comma-separated CSV with headers...")
        df = pd.read_csv(io.BytesIO(contents), parse_dates=['Time'])
        if not all(col in df.columns for col in ['Time', 'Open', 'High', 'Low', 'Close', 'Volume']):
            raise ValueError("Headers not found, trying without headers")
        print(f"Success with headers! Shape: {df.shape}")
    except Exception as e:
        print(f"Failed with headers: {e}")
        try:
            # Try as tab-separated file first (since we know it's tab-separated)
            print("Trying tab-separated file...")
            df = pd.read_csv(io.BytesIO(contents), header=None, names=['Time', 'Open', 'High', 'Low', 'Close', 'Volume'], sep='\t')
            print(f"Success with tab separator! Shape: {df.shape}")
        except Exception as e:
            print(f"Failed with tab separator: {e}")
            try:
                # Try as comma-separated CSV without headers
                print("Trying comma-separated CSV without headers...")
                df = pd.read_csv(io.BytesIO(contents), header=None, names=['Time', 'Open', 'High', 'Low', 'Close', 'Volume'])
                print(f"Success without headers! Shape: {df.shape}")
            except Exception as e:
                print(f"Failed without headers: {e}")
                try:
                    # Try as space-separated file (like EURUSD15.csv)
                    print("Trying space-separated file...")
                    df = pd.read_csv(io.BytesIO(contents), header=None, names=['Time', 'Open', 'High', 'Low', 'Close', 'Volume'], sep='\s+')
                    print(f"Success with space separator! Shape: {df.shape}")
                except Exception as e:
                    print(f"Failed with space separator: {e}")
                    raise HTTPException(400, f"Could not parse CSV file: {e}")
    
    if df is None or df.empty:
        raise HTTPException(400, "No data found in CSV file")
    
    # Parse datetime manually to handle various formats
    print(f"Sample Time values: {df['Time'].head()}")
    df['Time'] = pd.to_datetime(df['Time'], format='%Y-%m-%d %H:%M', errors='coerce')
    # Drop rows where datetime parsing failed
    df = df.dropna(subset=['Time'])
    print(f"After datetime parsing: {df.shape}")
    if df.empty:
        print("All rows dropped due to datetime parsing failure!")
        print("Trying alternative datetime parsing...")
        # Try without format specification
        df['Time'] = pd.to_datetime(df['Time'], errors='coerce')
        df = df.dropna(subset=['Time'])
        print(f"After alternative datetime parsing: {df.shape}")
    
    required_cols = ['Time', 'Open', 'High', 'Low', 'Close', 'Volume']
    if not all(col in df.columns for col in required_cols):
        raise HTTPException(400, "CSV must contain data for: Time, Open, High, Low, Close, Volume")
    
    file_path = os.path.join(STRATEGIES_DIR, f"{strategy_name}.py")
    if not os.path.exists(file_path):
        raise HTTPException(404, "Strategy not found")
    
    spec = importlib.util.spec_from_file_location(strategy_name, file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    
    if not hasattr(module, "strategy"):
        raise HTTPException(400, "Strategy module must define 'strategy' function")
    
    predictions, results, end_result = module.strategy(df, amount)
    
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    try:
        c.execute("INSERT INTO backtests (name, predictions, results, end_result) VALUES (?, ?, ?, ?)",
                  (name, json.dumps(predictions), json.dumps(results), json.dumps(end_result)))
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(400, "Name already exists")
    finally:
        conn.close()
    
    return {"message": "Backtest created successfully"}

@app.get("/getAll")
def get_all():
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("SELECT name FROM backtests")
    rows = c.fetchall()
    conn.close()
    backtests = [row[0] for row in rows]
    return {"backtests": backtests}

@app.get("/get/{name}")
def get(name: str):
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("SELECT predictions, results, end_result FROM backtests WHERE name=?", (name,))
    row = c.fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Not found")
    return {
        "predictions": json.loads(row[0]),
        "results": json.loads(row[1]),
        "end_result": json.loads(row[2])
    }

@app.delete("/delete/{name}")
def delete(name: str):
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("DELETE FROM backtests WHERE name=?", (name,))
    affected = c.rowcount
    conn.commit()
    conn.close()
    if affected == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted successfully"}
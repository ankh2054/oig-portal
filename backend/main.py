import start 
from fastapi import FastAPI


#uvicorn main:app --reload --reload-delay  432000 (reload the server every 7 days to refresh mainnet and testnet nodes)
#curl "http://localhost:8000/run?ignorecpucheck=false&ignorelastcheck=true&bp=eosriobrazil"
app = FastAPI()
@app.get("/run")
async def run_producer(ignorecpucheck: bool = True, ignorelastcheck: bool = False, bp: str = None):
    start.main(ignorecpucheck, ignorelastcheck, bp)
    return {"message": f"Checks were successfully ran for {bp}"}


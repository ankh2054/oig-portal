import start 
from fastapi import FastAPI, BackgroundTasks


#uvicorn main:app --reload --reload-delay  432000 (reload the server every 7 days to refresh mainnet and testnet nodes)
#curl "http://localhost:8000/run?ignorecpucheck=false&ignorelastcheck=true&bp=eosriobrazil"
app = FastAPI()
"""@app.get("/run")
async def run_producer(ignorecpucheck: bool = True, ignorelastcheck: bool = False, bp: str = None):
    start.main(ignorecpucheck, ignorelastcheck, bp)
    return {"message": f"Checks were successfully ran for {bp}"}"""

@app.get("/run")
async def run_producer(
    background_tasks: BackgroundTasks,
    ignorecpucheck: bool = True,
    ignorelastcheck: bool = False,
    bp: str = None,
):
    background_tasks.add_task(start.main, ignorecpucheck, ignorelastcheck, bp)
    return {"message": f"Checks have been scheduled for {bp}, refresh the page in 1min to obtain the results"}

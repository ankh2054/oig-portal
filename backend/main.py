
import start
from fastapi import FastAPI, BackgroundTasks
import threading
import queue


#uvicorn main:app --reload --reload-delay  432000 (reload the server every 7 days to refresh mainnet and testnet nodes)
#curl "http://localhost:8000/run?ignorecpucheck=false&ignorelastcheck=true&bp=eosriobrazil"

app = FastAPI()

# Create a global queue to store incoming requests
task_queue = queue.Queue()


def process_queue():
    while True:
        task = task_queue.get()
        if task is None:
            break
        ignorecpucheck, ignorelastcheck, bp = task
        start.main(ignorecpucheck, ignorelastcheck, bp)


# Start a worker thread to process tasks in the queue
worker = threading.Thread(target=process_queue)
worker.start()


@app.on_event("shutdown")
def stop_worker():
    task_queue.put(None)
    worker.join()


@app.get("/run")
async def run_producer(
    ignorecpucheck: bool = False,
    ignorelastcheck: bool = True,
    bp: str = None,
):
    # Get the current position in the queue
    position = task_queue.qsize() + 1
    if position == 1:
        position = '1st'
    elif position == 2:
        position = '2nd'
    elif position == 3:
        position = '3rd'
    elif position >= 4:
        position = f'{position}th'

    # Add the request to the queue
    task_queue.put((ignorecpucheck, ignorelastcheck, bp))
    return {
        "message": f"Checks have been scheduled for {bp}. You are {position} in the queue. Refresh the page in 2-3 minutes to obtain the results."
    }

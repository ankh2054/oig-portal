import start
from fastapi import FastAPI, BackgroundTasks
import threading
import queue
import time

app = FastAPI()

task_queue = queue.Queue()

def process_queue():
    while True:
        task = task_queue.get()
        if task is None:
            break
        ignorecpucheck, ignorelastcheck, bp = task
        try:
            start.main(ignorecpucheck, ignorelastcheck, bp)
        except Exception as e:
            print(f"Error occurred: {e}")
            # Optionally, restart the worker thread here
            restart_worker()


def restart_worker():
    global worker
    task_queue.put(None)
    worker.join()
    worker = threading.Thread(target=process_queue)
    worker.start()


def auto_restart_worker(interval):
    while True:
        time.sleep(interval)
        restart_worker()


worker = threading.Thread(target=process_queue)
worker.start()

auto_restart_interval = 432000  # 7 days in seconds
auto_restart_thread = threading.Thread(target=auto_restart_worker, args=(auto_restart_interval,))
auto_restart_thread.start()

@app.on_event("shutdown")
def stop_worker():
    task_queue.put(None)
    worker.join()
    auto_restart_thread.join()

@app.get("/run")
async def run_producer(
    ignorecpucheck: bool = False,
    ignorelastcheck: bool = True,
    bp: str = None,
):
    position = task_queue.qsize() + 1
    if position == 1:
        position = '1st'
    elif position == 2:
        position = '2nd'
    elif position == 3:
        position = '3rd'
    elif position >= 4:
        position = f'{position}th'

    task_queue.put((ignorecpucheck, ignorelastcheck, bp))
    return {
        "message": f"Checks have been scheduled for {bp}. You are {position} in the queue. Refresh the page in 1-2 minutes to obtain the results."
    }

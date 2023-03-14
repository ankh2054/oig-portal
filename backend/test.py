import psycopg2
from fastapi import FastAPI


if __name__ == "__main__":
    app = FastAPI()
    @app.get("/")
    async def run_producer(ignorecpucheck: bool = True, ignorelastcheck: bool = False, bp: str = None):
        return {"message": "producer-data.py has been run successfully"}
import asyncpg
import config.backendconfig as cfg
import time
from psycopg2.extensions import AsIs

# todays\'s epoch
tday = time.time()
file_size = []  # just to keep track of the total savings in storage size
net = 'mainnet'  # passes in the default chain to queries if required

user = cfg.db["user"]
password = cfg.db["password"]
host = cfg.db["host"]
port = cfg.db["port"]
database = cfg.db["database"]


##########################
# DB core functions ######
##########################

async def db_connection():
    connection = await asyncpg.connect(
        user=user,
        password=password,
        host=host,
        port=port,
        database=database)
    return connection


class MyDB:
    def __init__(self):
        self.conn = None
        self.cur = None

    async def connect(self):
        self.conn = await asyncpg.connect(
            user=user,
            password=password,
            host=host,
            port=port,
            database=database)
        self.cur = self.conn

    async def close(self):
        await self.conn.close()

    async def dbSelect(self, *args):
        self.lenArgs = len(args)
        if self.lenArgs <= 1:
            result = await self.cur.fetch(args[0])
        else:
            self.l1 = list(args)
            self.l1.pop(0)
            self.vars = tuple(self.l1)
            result = await self.cur.fetch(args[0], *self.vars)
        await self.close()
        return result

    async def dbInsertMany(self, records, query):
        await self.cur.executemany(query, records)
        await self.conn.commit()
        await self.close()

    async def dbExec(self, *args):
        self.lenArgs = len(args)
        if self.lenArgs <= 1:
            await self.cur.execute(args[0])
        else:
            self.l1 = list(args)
            self.l1.pop(0)
            self.vars = tuple(self.l1)
            await self.cur.execute(args[0], *self.vars)
        await self.conn.commit()
        await self.close()


async def getProducer(producer):
    async with MyDB() as db:
        query = await db.dbSelect("SELECT * FROM oig.producer WHERE active AND owner_name = %s", producer)
    return query

async def getPoints():
    async with MyDB() as db:
        query = await db.dbSelect("SELECT * FROM oig.pointsystem WHERE points IS NOT NULL")
    return query

async def getLastcheck():
    async with MyDB() as db:
        query = await db.dbSelect("SELECT date_check FROM oig.results ORDER BY date_check DESC LIMIT 1 OFFSET 9")
    return query

async def getFullnodes(testnet=False):
    if testnet:
        net = 'testnet'
    else:
        net = 'mainnet'
    async with MyDB() as db:
        query = await db.dbSelect("SELECT COALESCE(http_node_url,https_node_url) FROM oig.nodes WHERE features @> ARRAY['hyperion-v2']::text[] AND net = %s", net)
    return query

async def getProducerStatus(producer):
    async with MyDB() as db:
        query = await db.dbSelect("SELECT active FROM oig.producer WHERE owner_name =  %s", producer)
    return query

async def getSnapshotdate():
    async with MyDB() as db:
        query = await db.dbSelect("SELECT snapshot_date FROM oig.snapshotsettings")
    return query

async def getSnapshottakendate():
    async with MyDB() as db:
        query = await db.dbSelect("SELECT DISTINCT ON (snapshot_date) snapshot_date FROM oig.results WHERE owner_name = 'sentnlagents' ORDER BY snapshot_date DESC")
    return query

async def getProducerUrl(producer):
    async with MyDB() as db:
        query = await db.dbSelect("SELECT * FROM oig.producer WHERE owner_name = %s", producer)
    for row in query:
        jsonurl = row[3]
        return jsonurl

async def getCPU(producer):
    async with MyDB() as db:
        query = await db.dbSelect("SELECT cpu_time FROM oig.results WHERE owner_name = %s AND date_check > current_date - interval '7' day", producer)
    return query

# The remaining functions should be updated similarly, adding async/await keywords
# and using the MyDB context manager with async with.

# For example, the nodesDelete2 function would look like this:

async def nodesDelete2(table):
    async with MyDB() as db:
        await db.dbExec("DELETE FROM %(table)s", {"table": AsIs(table)})


##########################
# DB Inserts #############
##########################

async def producerInsert(records):
    async with MyDB() as db:
        query = """ INSERT INTO oig.producer (owner_name ,candidate, url, jsonurl, jsontestneturl, chainsurl, logo_svg, top21, country_code, active, publickey) 
                               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                               ON CONFLICT (owner_name) DO UPDATE SET candidate = EXCLUDED.candidate, url = EXCLUDED.url, 
                               jsonurl = EXCLUDED.jsonurl, jsontestneturl = EXCLUDED.jsontestneturl,chainsurl = EXCLUDED.chainsurl, 
                               logo_svg = EXCLUDED.logo_svg, top21 = EXCLUDED.top21, country_code = EXCLUDED.country_code, 
                               active = EXCLUDED.active, publickey=EXCLUDED.publickey;
                               """
        await db.dbInsertMany(records, query)

async def TelegramdatesInsert(records):
    async with MyDB() as db:
        query = """ INSERT INTO oig.dates (submission_cutoff, appeal_begin, appeal_end, final_report) 
                               VALUES (%s,%s,%s,%s)
                               ON CONFLICT (id) DO UPDATE SET submission_cutoff = EXCLUDED.submission_cutoff, 
                               appeal_begin = EXCLUDED.appeal_begin, appeal_end = EXCLUDED.appeal_end, 
                               final_report = EXCLUDED.final_report;
                               """
        await db.dbInsertMany(records, query)

async def nodesInsert(records):
    async with MyDB() as db:
        query = """ INSERT INTO oig.nodes (owner_name, node_type, net, https_node_url, http_node_url, p2p_url, features) 
                    VALUES (%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (owner_name,node_type,http_node_url,features) DO UPDATE SET http_node_url = EXCLUDED.http_node_url, https_node_url = EXCLUDED.https_node_url, p2p_url = EXCLUDED.p2p_url 
                """
        await db.dbInsertMany(records, query)


async def resultsInsert(records):
    async with MyDB() as db:
        query = """ INSERT INTO oig.results (owner_name, cors_check, cors_check_error, http_check, http_check_error, https_check, https_check_error, tls_check, tls_check_error, producer_api_check, producer_api_error, net_api_check, net_api_error, dbsize_api_check,  dbsize_api_error, http2_check, http2_check_error, full_history, full_history_error, hyperion_v2, hyperion_v2_error,  hyperion_v2_full, hyperion_v2_full_error, hyperion_v2_testnet,  hyperion_v2_testnet_error, hyperion_v2_testnet_full,  hyperion_v2_testnet_full_error, atomic_api, atomic_api_error, wwwjson, wwwjson_error, seed_node, seed_node_error, api_node, api_node_error, oracle_feed, oracle_feed_error, wax_json, chains_json, cpu_time, cpu_avg, date_check, score,chainscore) 
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (owner_name,date_check) DO UPDATE SET 
                cors_check= EXCLUDED.cors_check, cors_check_error= EXCLUDED.cors_check_error, 
                http_check = EXCLUDED.http_check, http_check_error = EXCLUDED.http_check_error,
                https_check = EXCLUDED.https_check, https_check_error = EXCLUDED.https_check_error,
                tls_check = EXCLUDED.tls_check, tls_check_error = EXCLUDED.tls_check_error,
                producer_api_check = EXCLUDED.producer_api_check, producer_api_error = EXCLUDED.producer_api_error,
                net_api_check = EXCLUDED.net_api_check, net_api_error = EXCLUDED.net_api_error,
                dbsize_api_check = EXCLUDED.dbsize_api_check, dbsize_api_error = EXCLUDED.dbsize_api_error,
                http2_check = EXCLUDED.http2_check, http2_check_error = EXCLUDED.http2_check_error,
                full_history= EXCLUDED.full_history, full_history_error= EXCLUDED.full_history_error,
                hyperion_v2= EXCLUDED.hyperion_v2, hyperion_v2_error= EXCLUDED.hyperion_v2_error,
                hyperion_v2_full= EXCLUDED.hyperion_v2_full, hyperion_v2_full_error= EXCLUDED.hyperion_v2_full_error,
                hyperion_v2_testnet= EXCLUDED.hyperion_v2_testnet, hyperion_v2_testnet_error= EXCLUDED.hyperion_v2_testnet_error,
                hyperion_v2_testnet_full= EXCLUDED.hyperion_v2_testnet_full, hyperion_v2_testnet_full_error= EXCLUDED.hyperion_v2_testnet_full_error,
                atomic_api= EXCLUDED.atomic_api, atomic_api_error= EXCLUDED.atomic_api_error,
                wwwjson = EXCLUDED.wwwjson, wwwjson_error = EXCLUDED.wwwjson_error,
                seed_node = EXCLUDED.seed_node, seed_node_error = EXCLUDED.seed_node_error,
                api_node = EXCLUDED.api_node, api_node_error = EXCLUDED.api_node_error,
                oracle_feed= EXCLUDED.oracle_feed, oracle_feed_error= EXCLUDED.oracle_feed_error,
                wax_json= EXCLUDED.wax_json, 
                chains_json= EXCLUDED.chains_json, cpu_time= EXCLUDED.cpu_time, cpu_avg= EXCLUDED.cpu_avg,
                date_check= EXCLUDED.date_check, 
                score= EXCLUDED.score,
                chainscore= EXCLUDED.chainscore;
            """
        db.dbInsertMany(records, query)


async def nodesDelete(table):
    try:
        async with MyDB() as db:
            await db.dbExecute("DELETE FROM %(table)s", {"table": AsIs(table)})
    except Exception as error:
        print("Error deleting rows from nodes table", error)

async def createSnapshot(snapshot_date, producer, now):
    try:
        async with MyDB() as db:
            query = "UPDATE oig.results set snapshot_date = %s where owner_name = %s and date_check > timestamp %s"
            await db.dbExecute(query, (snapshot_date, producer, now))
    except Exception as error:
        print("Error updating snapshot date in PostgreSQL table", error)


async def getQueryNodes(producer, feature, type, testnet=False):
    if testnet:
        net = 'testnet'
    else:
        net = 'mainnet'
    try:
        async with MyDB() as db:
            if type == 'https':
                pg_select = """ 
                SELECT https_node_url FROM oig.nodes WHERE owner_name = %s AND features @> ARRAY[%s]::text[] AND net = %s;    
                """
            elif type == 'all_apis':
                pg_select = """ 
                SELECT http_node_url,https_node_url FROM oig.nodes WHERE owner_name = %s AND features @> ARRAY[%s]::text[] AND net = %s;
                """
            elif type == 'p2p':
                pg_select = """ 
                SELECT p2p_url FROM oig.nodes WHERE owner_name = %s AND features @> ARRAY[%s]::text[] AND net = %s;
                """
            else:
                pg_select = """ 
                SELECT COALESCE(https_node_url,http_node_url) FROM oig.nodes WHERE owner_name = %s AND features @> ARRAY[%s]::text[] AND net = %s;    
                """
            await db.dbExecute(pg_select, (producer, feature, net))
            query_node = await db.dbFetchOne()
            return query_node
    except Exception as error:
        print("Error fetching data from PostgreSQL table", error)
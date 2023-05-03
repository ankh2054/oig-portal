import psycopg2
from psycopg2 import Error
from psycopg2.extensions import AsIs
import config.backendconfig as cfg
import time
from datetime import datetime


# todays\'s epoch
tday = time.time()
file_size = [] #just to keep track of the total savings in storage size
net = 'mainnet' # passes in the default chain to queries if required


user = cfg.db["user"]
password = cfg.db["password"]
host = cfg.db["host"]
port = cfg.db["port"]
database = cfg.db["database"]


##########################
# DB core functions ######
##########################

def db_connection():
    connection = psycopg2.connect(
        user = user,
        password = password,
        host = host,
        port = port,
        database = database)
    return connection

class MyDB():
    def __init__(self):
        self.conn = psycopg2.connect(
        user = user,
        password = password,
        host = host,
        port = port,
        database = database)
        self.cur = self.conn.cursor()

    def close(self):
        self.cur.close()
        self.conn.close()

    def dbSelect(self, *args):
        self.lenArgs = len(args)
        if self.lenArgs <= 1:
             self.cur.execute(args[0])
        # Else we need to pass first tuple item as the query to be executed, follow by the variables minus 
        # the first tuple item which is the query 
        else:
            # Create a list from args tuple and remove first item, re-tuple
            self.l1=list(args)
            self.l1.pop(0)
            self.vars=tuple(self.l1)
            self.cur.execute(args[0], (self.vars,))
        self.records = self.cur.fetchall()
        self.close()
        return self.records
    
    def dbInsertMany(self,records, query):
        self.cur.executemany(query,records)
        self.conn.commit()
        self.close()

    def dbExec(self, *args):
        self.lenArgs = len(args)
        if self.lenArgs <= 1:
             self.cur.execute(args[0])
        # Else we need to pass first tuple item as the query to be executed, follow by the variables minus 
        # the first tuple item which is the query 
        else:
            # Create a list from args tuple and remove first item, re-tuple
            self.l1=list(args)
            self.l1.pop(0)
            self.vars=tuple(self.l1)
            self.cur.execute(args[0], (self.vars,))
        self.conn.commit()
        self.close()



##########################
# DB queries #############
##########################

def getProducers():
    db = MyDB()
    query = db.dbSelect("SELECT * FROM oig.producer WHERE active")
    return query

def getProducer(producer):
    db = MyDB()
    query = db.dbSelect("SELECT * FROM oig.producer WHERE active  AND owner_name =  %s",producer)
    return query

def getPoints():
    db = MyDB()
    query = db.dbSelect("SELECT * FROM oig.pointsystem WHERE points IS NOT NULL")
    return query

def getLastcheck():
    db = MyDB()
    query = db.dbSelect("SELECT date_check FROM oig.results ORDER BY date_check DESC LIMIT 1")
    return query

def getFullnodes(testnet=False):
    if testnet:
        net = 'testnet'
    else:
        net = 'mainnet'
    db = MyDB()
    query = db.dbSelect("SELECT COALESCE(http_node_url,https_node_url) FROM oig.nodes WHERE features @> ARRAY['hyperion-v2']::text[] AND net = %s",net)
    return query

def getProducerStatus(producer):
    db = MyDB()
    query = db.dbSelect("SELECT active FROM oig.producer WHERE owner_name =  %s",producer)
    return query

def getSnapshotdate():
    db = MyDB()
    query = db.dbSelect("SELECT snapshot_date FROM oig.snapshotsettings")
    return query

def getSnapshottakendate():
    db = MyDB()
    query = db.dbSelect("SELECT DISTINCT ON (snapshot_date) snapshot_date FROM oig.results WHERE owner_name = 'sentnlagents' ORDER BY snapshot_date DESC")
    return query

def getProducerUrl(producer):
    db = MyDB()
    query = db.dbSelect("SELECT * FROM oig.producer WHERE owner_name = %s",producer)
    for row in query:
            jsonurl = row[3]
            return jsonurl

def getCPU(producer):
    db = MyDB()
    query = db.dbSelect("SELECT cpu_time FROM oig.results WHERE owner_name = %s AND date_check > current_date - interval '7' day", producer)
    return query

##########################
# DB Delete #############
##########################

def nodesDelete2(table):
    db = MyDB()
    db.dbExec("DELETE FROM %(table)s", {"table": AsIs(table)})
    
##########################
# DB Inserts #############
##########################

def producerInsert(records):
    db = MyDB()
    query = """ INSERT INTO oig.producer (owner_name ,candidate, url, jsonurl, jsontestneturl, chainsurl, logo_svg, top21, country_code, active, publickey) 
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                           ON CONFLICT (owner_name) DO UPDATE SET candidate = EXCLUDED.candidate, url = EXCLUDED.url, 
                           jsonurl = EXCLUDED.jsonurl, jsontestneturl = EXCLUDED.jsontestneturl,chainsurl = EXCLUDED.chainsurl, 
                           logo_svg = EXCLUDED.logo_svg, top21 = EXCLUDED.top21, country_code = EXCLUDED.country_code, 
                           active = EXCLUDED.active, publickey=EXCLUDED.publickey;
                           """
    # Call DB insert function
    db.dbInsertMany(records, query)
    #dbInsertMany(records, query)


def TelegramdatesInsert(records):
    db = MyDB()
    query = """ INSERT INTO oig.dates (submission_cutoff, appeal_begin, appeal_end, final_report) 
                           VALUES (%s,%s,%s,%s)
                           ON CONFLICT (id) DO UPDATE SET submission_cutoff = EXCLUDED.submission_cutoff, 
                           appeal_begin = EXCLUDED.appeal_begin, appeal_end = EXCLUDED.appeal_end, 
                           final_report = EXCLUDED.final_report;
                           """
    # Call DB insert function
    db.dbInsertMany(records, query)

def nodesInsert(records):
    db = MyDB()
    query = """ INSERT INTO oig.nodes (owner_name, node_type, net, https_node_url, http_node_url, p2p_url, features) 
                VALUES (%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (owner_name,node_type,http_node_url,features) DO UPDATE SET http_node_url = EXCLUDED.http_node_url, https_node_url = EXCLUDED.https_node_url, p2p_url = EXCLUDED.p2p_url 
            """
    db.dbInsertMany(records, query)

def resultsInsert(records):
    db = MyDB()
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


def nodesDelete(table):
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        cursor.execute("DELETE FROM %(table)s", {"table": AsIs(table)})
        connection.commit()
    except (Exception, psycopg2.Error) as error:
        print("Error deleting rows from nodes table", error)

    finally:
        # closing database connection
        if (connection):
            cursor.close()
            connection.close()

#print(nodesDelete2('oig.nodes'))

def createSnapshot(snapshot_date,producer,now):
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        query = "UPDATE oig.results set snapshot_date = %s where owner_name = %s and date_check > timestamp %s"
        cursor.execute(query, (snapshot_date,producer,now))
        connection.commit()
    except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)

    finally:
        # closing database connection
        if (connection):
            cursor.close()
            connection.close()



# Get query type nodes that contain features. By default mainnet is passed.
def getQueryNodes(producer,feature,type,testnet=False):
    if testnet:
        net = 'testnet'
    else:
        net = 'mainnet'
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
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
        # SELECT * FROM oig.nodes WHERE features @> ARRAY['chain-api']::text[];
     
        cursor.execute(pg_select, (producer,feature,net ))
        query_node = cursor.fetchone()
        return query_node

    except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)

    finally:
        # closing database connection
        if (connection):
            cursor.close()
            connection.close()



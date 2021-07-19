import psycopg2
from psycopg2 import Error
import backendconfig as cfg
import time
from datetime import datetime



# todays\'s epoch
tday = time.time()
file_size = [] #just to keep track of the total savings in storage size


user = cfg.db["user"]
password = cfg.db["password"]
host = cfg.db["host"]
port = cfg.db["port"]
database = cfg.db["database"]

def db_connection():
    connection = psycopg2.connect(
        user = user,
        password = password,
        host = host,
        port = port,
        database = database)
    return connection

# Core DB function Insert 
def dbInsertMany(records, query):
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        sql_insert_query = query
        result = cursor.executemany(sql_insert_query, records)
        connection.commit()
        print(cursor.rowcount, "Record inserted successfully")
    except (Exception, psycopg2.Error) as error:
        print("Failed inserting records {}".format(error))
    finally:
        # closing database connection.
        if (connection):
            cursor.close()
            connection.close()
            print("PostgreSQL connection is closed")

# Core DB function Select
def dbSelect(query):
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        cursor.execute(query)
        records = cursor.fetchall()
        return records
    except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)
    finally:
        # closing database connection.
        if (connection):
            cursor.close()
            connection.close()
            print("PostgreSQL connection is closed")

# Select producers that are acive only
def getProducers():
    query = "SELECT * FROM oig.producer WHERE active"
    return dbSelect(query)


def getPoints():
    query = "SELECT * FROM oig.pointsystem WHERE points IS NOT NULL"
    return dbSelect(query)


def getFullnodes():
    query =  """ 
        SELECT COALESCE(http_node_url,https_node_url) FROM oig.nodes WHERE features @> ARRAY['hyperion-v2']::text[];
        """
    return dbSelect(query)

def getSnapshotdate():
    query = "SELECT snapshot_date FROM oig.snapshotsettings"
    return dbSelect(query)


def getSnapshottakendate():
    query = "SELECT DISTINCT ON (snapshot_date) snapshot_date FROM oig.results WHERE owner_name = 'sentnlagents' ORDER BY snapshot_date DESC"
    return dbSelect(query)

# DB Inserts
def producerInsert(records):
    query = """ INSERT INTO oig.producer (owner_name, candidate, url, jsonurl, chainsurl, logo_svg, top21, country_code) 
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                           ON CONFLICT (owner_name) DO UPDATE SET candidate = EXCLUDED.candidate, url = EXCLUDED.url, 
                           jsonurl = EXCLUDED.jsonurl, chainsurl = EXCLUDED.chainsurl, 
                           logo_svg = EXCLUDED.logo_svg, top21 = EXCLUDED.top21, country_code = EXCLUDED.country_code;
                           """
    # Call DB insert function
    dbInsertMany(records, query)

def nodesInsert(records):
    query = """ INSERT INTO oig.nodes (owner_name, node_type, https_node_url, http_node_url, p2p_url, features) 
                VALUES (%s,%s,%s,%s,%s,%s)
                ON CONFLICT (owner_name,node_type,features) DO UPDATE SET http_node_url = EXCLUDED.http_node_url, https_node_url = EXCLUDED.https_node_url, p2p_url = EXCLUDED.p2p_url;
            """
    dbInsertMany(records, query)


def resultsInsert(records):
    query = """ INSERT INTO oig.results (owner_name, cors_check, cors_check_error, http_check, http_check_error, https_check, https_check_error, tls_check, tls_check_error, producer_api_check, producer_api_error, net_api_check, net_api_error, dbsize_api_check,  dbsize_api_error, http2_check, http2_check_error, full_history, full_history_error, hyperion_v2, hyperion_v2_error, atomic_api, atomic_api_error, snapshots, seed_node, seed_node_error, api_node, api_node_error, oracle_feed, oracle_feed_error, wax_json, chains_json, cpu_time, cpu_avg, date_check, score) 
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
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
                atomic_api= EXCLUDED.atomic_api, atomic_api_error= EXCLUDED.atomic_api_error,
                snapshots = EXCLUDED.snapshots, 
                seed_node = EXCLUDED.seed_node, seed_node_error = EXCLUDED.seed_node_error,
                api_node = EXCLUDED.api_node, api_node_error = EXCLUDED.api_node_error,
                oracle_feed= EXCLUDED.oracle_feed, oracle_feed_error= EXCLUDED.oracle_feed_error,
                wax_json= EXCLUDED.wax_json, 
                chains_json= EXCLUDED.chains_json, cpu_time= EXCLUDED.cpu_time, cpu_avg= EXCLUDED.cpu_avg,
                date_check= EXCLUDED.date_check, score= EXCLUDED.score;
            """
    dbInsertMany(records, query)

#Set a snapshot for latest results where results is less than 1 minutes based on date_check timestamp of latest results.
#UPDATE oig.results SET snaphot_date = $2 WHERE owner_name = $1 AND date_check > NOW() - INTERVAL '15 minutes'
#update oig.results set snapshot_date = '2020-09-11 17:18:04.825519' where owner_name = 'eos42freedom' and date_check > timestamp '2020-10-23 17:31:22' - INTERVAL '1 minute';
#date_check > TIMESTAMP '2020-10-23T17:31:22.494Z' - INTERVAL '1 minute'
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

#createSnapshot('2021-03-07 12:29:48.930000+00:00', 'sentnlagents', '2021-02-05 19:52:45.608381')


#records_insert = [('blokcrafters', 'seed', None, None, 'wax-seed1.blokcrafters.io:9876', None)]
#nodesInsert(records_insert)

# Get query type nodes that contain features
def getQueryNodes(producer,feature,type):
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        if type == 'https':
            pg_select = """ 
            SELECT https_node_url FROM oig.nodes WHERE owner_name = %s AND features @> ARRAY[%s]::text[];    
            """
        elif type == 'all_apis':
            pg_select = """ 
            SELECT http_node_url,https_node_url FROM oig.nodes WHERE owner_name = %s AND features @> ARRAY[%s]::text[];
            """
        elif type == 'p2p':
            pg_select = """ 
            SELECT p2p_url FROM oig.nodes WHERE owner_name = %s AND features @> ARRAY[%s]::text[];
            """
        else:
            pg_select = """ 
            SELECT COALESCE(https_node_url,http_node_url) FROM oig.nodes WHERE owner_name = %s AND features @> ARRAY[%s]::text[];    
            """
        # SELECT * FROM oig.nodes WHERE features @> ARRAY['chain-api']::text[];
     
        cursor.execute(pg_select, (producer,feature ))
        query_node = cursor.fetchone()
        return query_node

    except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)

    finally:
        # closing database connection
        if (connection):
            cursor.close()
            connection.close()

# Get nodes
def getNodes2(producer,type):
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        if type == 'https':
            pg_select = """ 
            SELECT https_node_url FROM oig.nodes WHERE owner_name = %s AND (node_type = 'api' OR node_type = 'full' OR node_type = 'query')
            """
        elif type == 'http':
            pg_select = """ 
            SELECT http_node_url FROM oig.nodes WHERE owner_name = %s AND (node_type = 'api' OR node_type = 'full' OR node_type = 'query')
            """
        elif type == 'api':
            pg_select = """ 
            SELECT COALESCE(http_node_url,https_node_url) FROM oig.nodes WHERE owner_name = %s AND (node_type = 'api' OR node_type = 'full' OR node_type = 'query')
            """
        elif type == 'p2p':
            pg_select = """ 
            SELECT p2p_url FROM oig.nodes WHERE owner_name = %s AND p2p_url is not null AND (node_type = 'full' OR node_type = 'seed' OR node_type = 'query')
            """
        elif type == 'all_apis':
            pg_select = """ 
            SELECT http_node_url,https_node_url FROM oig.nodes WHERE owner_name = %s AND (node_type = 'api' OR node_type = 'full' OR node_type = 'query')
            """
        cursor.execute(pg_select, (producer,))
        node_url = cursor.fetchone()
        return node_url

    except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)

    finally:
        # closing database connection
        if (connection):
            cursor.close()
            connection.close()


def getProducerUrl(owner_name):
    try:
         # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        postgreSQL_select_Query = "select * from oig.producer where owner_name = %s"

        cursor.execute(postgreSQL_select_Query, (owner_name,))
        producer_records = cursor.fetchall()
        for row in producer_records:
            jsonurl = row[3]
            return jsonurl

    except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)

    finally:
        # closing database connection
        if (connection):
            cursor.close()
            connection.close()

# Get past 30 days worth of CPU stats for producer
def getCPU(producer):
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        pg_select = """ 
        SELECT cpu_time FROM oig.results WHERE owner_name = %s AND date_check > current_date - interval '90' day;
        """
        # date_check > current_date - interval '10' day;
        # date_check >= date_trunc('month', CURRENT_DATE);  
     
        cursor.execute(pg_select, (producer, ))
        cpu_stats = cursor.fetchall()
        return cpu_stats

    except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)

    finally:
        # closing database connection
        if (connection):
            cursor.close()
            connection.close()

#v = getCPU('sentnlagents')
#print(type(v))
#print(v[0][0])

#cpu = float(2.654)
#dt = datetime.utcnow()
#records_insert = [('blacklusionx', True, True, True, True, True, True ,True, True, True,True, cpu, dt)]
#resultsInsert(records_insert)


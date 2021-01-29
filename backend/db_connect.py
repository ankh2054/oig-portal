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

def producerInsert(records):
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        # Insert new entries into postgresql but if owner_name already exists perform update
        ## Updates only columns in excluded list
        sql_insert_query = """ INSERT INTO oig.producer (owner_name, candidate, url, jsonurl, chainsurl, logo_svg, top21, country_code) 
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                           ON CONFLICT (owner_name) DO UPDATE SET candidate = EXCLUDED.candidate, url = EXCLUDED.url, 
                           jsonurl = EXCLUDED.jsonurl, chainsurl = EXCLUDED.chainsurl, 
                           logo_svg = EXCLUDED.logo_svg, top21 = EXCLUDED.top21, country_code = EXCLUDED.country_code;
                           """
        # executemany() to insert multiple rows rows
        result = cursor.executemany(sql_insert_query, records)
        connection.commit()
        print(cursor.rowcount, "Record inserted successfully into producer table")

    except (Exception, psycopg2.Error) as error:
        print("Failed inserting record into producer table {}".format(error))

    finally:
        # closing database connection.
        if (connection):
            cursor.close()
            connection.close()
            print("PostgreSQL connection is closed")




def nodesInsert(records):
    try:
         # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        # Insert new entries into postgresql but if owner_name already exists perform update
        ## Updates only columns in excluded list
        sql_insert_query = """ INSERT INTO oig.nodes (owner_name, node_type, http_node_url, https_node_url, p2p_url, features) 
                           VALUES (%s,%s,%s,%s,%s,%s)
                           ON CONFLICT (owner_name,node_type) DO UPDATE SET http_node_url = EXCLUDED.http_node_url, https_node_url = EXCLUDED.https_node_url, p2p_url = EXCLUDED.p2p_url, features = EXCLUDED.features ;
                           """

        # execute insert for each node
        result = cursor.executemany(sql_insert_query, records)
        connection.commit()
        print(cursor.rowcount, "Record inserted successfully into nodes table")
    
    except (Exception, psycopg2.Error) as error:
        print("Failed inserting record into nodes table {}".format(error))

    finally:
        # closing database connection.
        if (connection):
            cursor.close()
            connection.close()
            print("PostgreSQL connection is closed")

#records_insert = [('blokcrafters', 'seed', None, None, 'wax-seed1.blokcrafters.io:9876', None)]
#nodesInsert(records_insert)

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


# Select producers that are acive only
def getProducers():
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        postgreSQL_select_Query = "SELECT * FROM oig.producer WHERE active"
        cursor.execute(postgreSQL_select_Query)
        producer_records = cursor.fetchall()
        return producer_records

    except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)

    finally:
        # closing database connection
        if (connection):
            cursor.close()
            connection.close()

def getPoints():
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        postgreSQL_select_Query = "SELECT * FROM oig.pointsystem WHERE points IS NOT NULL"
        cursor.execute(postgreSQL_select_Query)
        points = cursor.fetchall()
        return points

    except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)

    finally:
        # closing database connection
        if (connection):
            cursor.close()
            connection.close()

# Get query type nodes that contain features
def getQueryNodes(producer,feature):
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        pg_select = """ 
        SELECT COALESCE(http_node_url,https_node_url) FROM oig.nodes WHERE owner_name = %s AND features @> ARRAY[%s]::text[];    
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
def getNodes(producer,type):
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

def getFullnodes():
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        pg_select = """ 
        SELECT COALESCE(http_node_url,https_node_url) FROM oig.nodes WHERE features @> ARRAY['hyperion-v2']::text[];
        """
     
        cursor.execute(pg_select)
        http_node_url = cursor.fetchall()
        return http_node_url

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



#create extra column for full_history errors
# When returning false also return error that can get saved into DB
def resultsInsert(records):
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        # Insert new entries into postgresql but if owner_name already exists perform update
        ## Updates only columns in excluded list
        sql_insert_query = """ INSERT INTO oig.results (owner_name, cors_check, cors_check_error, http_check, http_check_error, https_check, https_check_error, tls_check, tls_check_error, producer_api_check, producer_api_error, net_api_check, net_api_error, dbsize_api_check,  dbsize_api_error, http2_check, http2_check_error, full_history, full_history_error, hyperion_v2, hyperion_v2_error, snapshots, seed_node, seed_node_error, api_node, api_node_error, oracle_feed, oracle_feed_error, wax_json, chains_json, cpu_time, cpu_avg, date_check, score) 
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
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
                           snapshots = EXCLUDED.snapshots, 
                           seed_node = EXCLUDED.seed_node, seed_node_error = EXCLUDED.seed_node_error,
                           api_node = EXCLUDED.api_node, api_node_error = EXCLUDED.api_node_error,
                           oracle_feed= EXCLUDED.oracle_feed, oracle_feed_error= EXCLUDED.oracle_feed_error,
                           wax_json= EXCLUDED.wax_json, 
                           chains_json= EXCLUDED.chains_json, cpu_time= EXCLUDED.cpu_time, cpu_avg= EXCLUDED.cpu_avg,
                           date_check= EXCLUDED.date_check, score= EXCLUDED.score;
                           """
        # executemany() to insert multiple rows rows
        result = cursor.executemany(sql_insert_query, records)
        connection.commit()
        print(cursor.rowcount, "Record inserted successfully into mobile table")

    except (Exception, psycopg2.Error) as error:
        print("Failed inserting record into producer table {}".format(error))

    finally:
        # closing database connection
        if (connection):
            cursor.close()
            connection.close()

#cpu = float(2.654)
#dt = datetime.utcnow()
#records_insert = [('blacklusionx', True, True, True, True, True, True ,True, True, True,True, cpu, dt)]
#resultsInsert(records_insert)


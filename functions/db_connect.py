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
        sql_insert_query = """ INSERT INTO oig.producer (owner_name, candidate, url, jsonurl, chainsurl,logo_svg) 
                           VALUES (%s,%s,%s,%s,%s,%s)
                           ON CONFLICT (owner_name) DO UPDATE SET candidate = EXCLUDED.candidate, url = EXCLUDED.url, 
                           jsonurl = EXCLUDED.jsonurl, chainsurl = EXCLUDED.chainsurl, logo_svg = EXCLUDED.logo_svg;
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
        sql_insert_query = """ INSERT INTO oig.nodes (owner_name, node_type, http_node_url, https_node_url, p2p_url) 
                           VALUES (%s,%s,%s,%s,%s)
                           ON CONFLICT (owner_name,node_type) DO UPDATE SET http_node_url = EXCLUDED.http_node_url, https_node_url = EXCLUDED.https_node_url, p2p_url = EXCLUDED.p2p_url ;
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

#records_insert = [('blacklusionx', 'seed', None, None, 'peer1.wax.blacklusion.io:9876'), ('blacklusionx', 'full', 'http://wax.blacklusion.io', 'https://wax.blacklusion.io', None), ('blocksmithio', 'full', 'http://wax-mainnet.eosblocksmith.io', 'https://wax-mainnet.eosblocksmith.io', None), ('blocksmithio', 'seed', None, None, 'peer.wax-mainnet.eosblocksmith.io:5080')]
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

#print(getProducerUrl('aikonproduce'))

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

def getApi(producer):
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        pg_select = """ 
        SELECT COALESCE(http_node_url,https_node_url) FROM oig.nodes WHERE owner_name = %s AND (node_type = 'api' OR node_type = 'full')
        """
     
        cursor.execute(pg_select, (producer, ))
        http_node_url = cursor.fetchone()
        return http_node_url

    except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)

    finally:
        # closing database connection
        if (connection):
            cursor.close()
            connection.close()
def getFull(producer):
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        pg_select = """ 
        SELECT COALESCE(http_node_url,https_node_url) FROM oig.nodes WHERE owner_name = %s AND node_type = 'full'
        """
     
        cursor.execute(pg_select, (producer, ))
        http_node_url = cursor.fetchone()
        return http_node_url

    except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)

    finally:
        # closing database connection
        if (connection):
            cursor.close()
            connection.close()

def getP2P(producer):
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        pg_select = """ 
        SELECT p2p_url FROM oig.nodes WHERE owner_name = %s AND p2p_url is not null AND (node_type = 'full' OR node_type = 'seed')
        """
     
        cursor.execute(pg_select, (producer, ))
        p2p_node_url = cursor.fetchone()
        return p2p_node_url

    except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)

    finally:
        # closing database connection
        if (connection):
            cursor.close()
            connection.close()


def getApiHttps(producer):
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        pg_select = """ 
        SELECT https_node_url FROM oig.nodes WHERE owner_name = %s AND (node_type = 'api' OR node_type = 'full')
        """
     
        cursor.execute(pg_select, (producer, ))
        https_node_url = cursor.fetchone()
        return https_node_url

    except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)

    finally:
        # closing database connection
        if (connection):
            cursor.close()
            connection.close()

def getApiHttp(producer):
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        pg_select = """ 
        SELECT http_node_url FROM oig.nodes WHERE owner_name = %s AND (node_type = 'api' OR node_type = 'full')
        """
     
        cursor.execute(pg_select, (producer, ))
        https_node_url = cursor.fetchone()
        return https_node_url

    except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)

    finally:
        # closing database connection
        if (connection):
            cursor.close()
            connection.close()


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
        sql_insert_query = """ INSERT INTO oig.results (owner_name, cors_check, cors_check_error, http_check, http_check_error, https_check, https_check_error, http2_check, http2_check_error, full_history, full_history_error, snapshots, seed_node, seed_node_error, api_node, api_node_error, oracle_feed, oracle_feed_error, wax_json, chains_json, cpu_time, date_check) 
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                           ON CONFLICT (owner_name,date_check) DO UPDATE SET 
                           cors_check= EXCLUDED.cors_check, cors_check_error= EXCLUDED.cors_check_error, 
                           http_check = EXCLUDED.http_check, http_check_error = EXCLUDED.http_check_error,
                           https_check = EXCLUDED.https_check, https_check_error = EXCLUDED.https_check_error,
                           http2_check = EXCLUDED.http2_check, http2_check_error = EXCLUDED.http2_check_error,
                           full_history= EXCLUDED.full_history, full_history_error= EXCLUDED.full_history_error,
                           snapshots = EXCLUDED.snapshots, 
                           seed_node = EXCLUDED.seed_node, seed_node_error = EXCLUDED.seed_node_error,
                           api_node = EXCLUDED.api_node, api_node_error = EXCLUDED.api_node_error,
                           oracle_feed= EXCLUDED.oracle_feed, oracle_feed_error= EXCLUDED.oracle_feed_error,
                           wax_json= EXCLUDED.wax_json, 
                           chains_json= EXCLUDED.chains_json, cpu_time= EXCLUDED.cpu_time, 
                           date_check= EXCLUDED.date_check;
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


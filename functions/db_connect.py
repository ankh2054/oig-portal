import psycopg2
from psycopg2 import Error
import backendconfig as cfg
import time

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
        sql_insert_query = """ INSERT INTO oig.producer (owner_name, candidate, url, jsonurl, chainsurl) 
                           VALUES (%s,%s,%s,%s,%s)
                           ON CONFLICT (owner_name) DO UPDATE SET candidate = EXCLUDED.candidate, url = EXCLUDED.url, 
                           jsonurl = EXCLUDED.jsonurl, chainsurl = EXCLUDED.chainsurl ;
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

#records_to_insert = [('aikonproduce', 'AIKON', 'https://aikon.com', 'https://aikon.com/wax.json'), ('alohaeosprod', 'Aloha EOS', 'https://www.alohaeos.com', 'https://www.alohaeos.com/wax.json'), ('amsterdamwax', 'EOSAmsterdam', 'https://wax.eosamsterdam.net', 'https://wax.eosamsterdam.net/bp.json'), ('argentinawax', 'EOSArgentina', 'https://eosargentina.io', 'https://eosargentina.io/wax.json'), ('blacklusionx', 'Blacklusion', 'https://blacklusion.io', 'https://blacklusion.io/wax.json'), ('blocksmithio', 'EOS BlockSmith', 'https://eosblocksmith.io', 'https://eosblocksmith.io/wax.json'), ('blokcrafters', 'BlokCrafters', 'https://blokcrafters.com', 'https://blokcrafters.com/wax.json'), ('bountyblokbp', 'bountyblok.io', 'https://www.bountyblok.io', 'https://www.bountyblok.io/wax.json'), ('cryptolions1', 'CryptoLions🦁', 'https://cryptolions.io', 'https://cryptolions.io/wax.json'), ('csxcommunity', 'EOSCSX', 'https://wax.csx.io', 'https://wax.csx.io/bp.json'), ('cypherglasss', 'Cypherglass', 'https://bp.cypherglass.com', 'https://bp.cypherglass.com/wax/wax.json'), ('dapplica', 'dapplica', 'https://dapplica.io', 'https://dapplica.io/wax.json'), ('dmaildotcobp', 'dmail.co WAX BP', 'https://dmail.co', 'https://dmail.co/wax/bp.json'), ('eos42freedom', 'EOS42', 'https://eos42.io', 'https://eos42.io/wax.json'), ('eosarabianet', 'EOSArabia', 'https://uae.eosarabia.net', 'https://uae.eosarabia.net/wax.json'), ('eosbarcelona', 'eosBarcelonaWaxGuild', 'https://waxguild.eos.barcelona', 'https://waxguild.eos.barcelona/wax.json'), ('eosdacserver', 'eosDAC', 'https://eosdac.io', 'https://eosdac.io/wax.json'), ('eosdublinwow', 'eosDublin', 'https://www.eosdublin.com', 'https://www.eosdublin.com/wax.json'), ('eoseouldotio', 'EOSeoul', 'https://eoseoul.io', 'https://eoseoul.io/wax.json'), ('eosiocentral', 'EOSio Central', 'https://teloscentral.com', 'https://teloscentral.com/wax.json'), ('eosiodetroit', 'EOS Detroit', 'https://eosdetroit.io', 'https://eosdetroit.io/wax.json'), ('eosphereiobp', 'EOSphere Guild', 'https://www.eosphere.io', 'https://www.eosphere.io/wax/bp.json'), ('eosriobrazil', 'EOS Rio 💙 ', 'https://eosrio.io', 'https://eosrio.io/wax.json'), ('eostribeprod', 'EOSTribe', 'https://eostribe.io', 'https://eostribe.io/wax/bp.json'), ('greeneosiobp', 'GreenEOSIO', 'https://greeneosio.com', 'https://greeneosio.com/wax/bp.json'), ('hkeosguildhk', 'hkeos', 'https://www.hkeos.com', 'https://www.hkeos.com/wax.json'), ('ivote4waxusa', 'WAXUSA', 'https://bp.eosusa.news/wax', 'https://bp.eosusa.news/wax/wax.json'), ('karmaproduce', 'KARMA', 'https://karmaguild.io', 'https://karmaguild.io/wax.json'), ('ledgerwiseio', 'LedgerWise', 'https://ledgerwise.io', 'https://ledgerwise.io/wax/bp.json'), ('maltablockbp', 'Maltablock Guild', 'https://maltablock.org', 'https://maltablock.org/wax/bp.json'), ('nation.wax', 'EOS Nation', 'https://eosnation.io', 'https://eosnation.io/wax.json')]
#producerInsert(records_to_insert)

## rethink this since uyou can have multiple http_nodes. Probabnly need to create a insert querty for each endpoint
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

def getProducers():
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        postgreSQL_select_Query = "select * from oig.producer"
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


def resultsInsert(records):
    try:
        # Create connection to DB
        connection = db_connection()
        # Open cursor to DB
        cursor = connection.cursor()
        # Insert new entries into postgresql but if owner_name already exists perform update
        ## Updates only columns in excluded list
        sql_insert_query = """ INSERT INTO oig.results (owner_name,cors_check, http_check, http2_check, full_history, snapshots, seed_node, api_node, oracle_feed, wax_json, chains_json, last_check) 
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                           ON CONFLICT (owner_name) DO UPDATE SET cors_check= EXCLUDED.cors_check, http_check = EXCLUDED.http_check, http2_check = EXCLUDED.http2_check,
                           full_history= EXCLUDED.full_history, snapshots = EXCLUDED.snapshots, seed_node = EXCLUDED.seed_node, api_node = EXCLUDED.api_node,
                           oracle_feed= EXCLUDED.oracle_feed, wax_json= EXCLUDED.wax_json, chains_json= EXCLUDED.chains_json, last_check= EXCLUDED.last_check;
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
#records_insert = [('blacklusionx', True, True, True, True, True, True ,True, True, True,True, "2020-09-08 19:10:25-07")]
#resultsInsert(records_insert)



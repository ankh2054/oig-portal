import core
import requests
import simplejson
import socket
import json
from requests.exceptions import HTTPError
import db_connect
import json_extract
import urllib3
import http2check
from datetime import datetime
import backendconfig as cfg


class bcolors:
    HEADER = '\033[95m'
    OKYELLOW = '\033[93m'
    OKGREEN = '\033[92m'
    OKBLUE = '\033[94m'
    WARNING = '\033[91m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


# mDisable SSL warnings
urllib3.disable_warnings()

try:
    from simplejson.errors import JSONDecodeError
except ImportError:
    from json.decoder import JSONDecodeError


# Settings
chain_id = cfg.chain["chainid"]


# Prdocuer Table
prod_table =  {
    "code": "eosio",
    "table": "producers",
    "scope": "eosio", 
    "json": "true", 
    "limit": "100", 
    "lower_bound": "0"
}

# Delpioracle Table
delphi_table =  {
    "code": "delphioracle",
    "table": "stats",
    "scope": "delphioracle", 
    "json": "true", 
    "limit": "50", 
    "lower_bound": "0"
}

# Get Delpioacle actions
delphi_actions = {
    'limit': '100',
    'account': 'delphioracle',
    'track': 'true',
    'simple': 'true',
    'noBinary': 'true',
    'checkLib': 'false'
}

# Get eosmechanic actions for mainnet CPU results
eosmech_actions = {
    'limit': '120',
    'account': 'eosmechanics',
    'track': 'true',
    'simple': 'true',
    'noBinary': 'true',
    'checkLib': 'false'
}

# Get eosmechanic actions for testnet CPU results
eosmech_actions_testnet = {
    'limit': '100',
    'account': 'eosmechanics',
    'track': 'true',
    'simple': 'true',
    'noBinary': 'true',
    'checkLib': 'false'
}


def producerlist():
    producers = core.getEOStable(prod_table)
    # Remove WAX guilds and guilds with no website
    prodremove = ['https://wax.io', '', 'https://bp.eosnewyork.io', 'https://bp.nebulaprotocol.com', 'https://wax.infinitybloc.io', 'https://blockmatrix.network', 'https://eosauthority.com', 'https://hyperblocks.pro/', 'https://strongblock.io/', 'https://waxux.com', 'https://skinminerswax.com', 'https://sheos.org','https://teloscentral.com','https://eossweden.eu','https://dmail.co']
    # Create empty list
    producer_final = []
    # Create emtpy dictinary
    proddict = {}
    for i in producers:
        if i['url'] not in prodremove:
            # create copy of dict and call it new
            new = proddict.copy()
            #time.sleep(10)
            # Update new dict
            new.update({'owner': i['owner'],'url': i['url'] })
            # Append new dict to top21list
            producer_final.append(new)
    return producer_final


## Get list of producers and produce tuple
def producer_chain_list():
    producers = producerlist()
    # Create empty list
    producer_final = []
    # Create emtpy dictinary
    # proddict = {}
    for i in producers:
        try:
            response = requests.get(url=i['url'] + '/chains.json')
            # If the response was successful, no Exception will be raised
            response.raise_for_status()
        except HTTPError as http_err:
            print(f'HTTP error occurred: {http_err}')  # Python 3.6
        except Exception as err:
            print(f'Other error occurred: {err}')  # Python 3.6
        else:
            try:
                json_response = response.json()
                waxjson = json_response['chains']['1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4']
                # Strip the leading "/" if exists due to Producers not followiong standard
                waxjson = waxjson.lstrip('/')
            except JSONDecodeError:
                print('JSON parsing error')
                waxjson = ""
            else:
                # new = proddict.copy()
                # Now get new JSON file
                response = requests.get(url=i['url']+"/"+waxjson)
                try:
                    # Get response data in JSON
                    json_response = response.json()
                    # Extract org candidate name
                    candidate_name = json_response['org']['candidate_name']
                    try:
                        logo_256 = json_response['org']['branding']['logo_256']
                    except: 
                        logo_256 = None
                except JSONDecodeError:
                    print('JSON parsing error')
                else:
                    thistuple = (i['owner'], candidate_name, i['url'], i['url'] + '/'+waxjson, i['url'] + '/chains.json', logo_256)
                    # new.update({'owner': i['owner'],'candidate_name': candidate_name, 'url': i['url'], 'jsonurl': i['url']+'/'+waxjson })
                    # Append new dict to top21list
                    # producer_final.append(new)
                    producer_final.append(thistuple)
    return producer_final



## Get list of nodes from each wax.json and produce tuple of all nodes
def node_list():
    # Get all rows from producer table
    producers = db_connect.getProducers()
    # Create empty list
    node_list = []
    for nodes in producers:
        try:
            response = requests.get(url=nodes[3])
            # If the response was successful, no Exception will be raised
            response.raise_for_status()
        except HTTPError as http_err:
            print(f'HTTP error occurred: {http_err}')  # Python 3.6
        except Exception as err:
            print(f'Other error occurred: {err}')  # Python 3.6
        else:
            json_response = response.json()
            owner_name = nodes[0]
            nodes = json_response['nodes']
            for node in nodes:
                # We dont care about producer nodes
                if node.get('node_type') == 'producer':
                    continue 
                #Fixes for Dodgy BP json files
                #HKEOS has complete empty node types that are not producer
                if node.get('ssl_endpoint') == "" and node.get('api_endpoint') == "" and node.get('p2p_endpoint') == "":
                    continue
                #POLAR.WAX states a full node but only has a p2p_endpoint listed
                if node.get('node_type') == 'full' and node.get('api_endpoint') == None and node.get('ssl_endpoint') == None and node.get('p2p_endpoint') != None:
                    continue
                node_type = node.get('node_type')
                # If fields in JSON are empty strings pass NULL to DB
                if node.get('ssl_endpoint') == "":
                    ssl_endpoint = None
                else:
                    ssl_endpoint = node.get('ssl_endpoint')
                if node.get('api_endpoint') == "":
                    api_endpoint = None
                else:
                    api_endpoint = node.get('api_endpoint')
                if node.get('p2p_endpoint') == "":
                    api_endpoint = None
                else:
                    p2p_endpoint = node.get('p2p_endpoint')
                thistuple = (owner_name, node_type, api_endpoint, ssl_endpoint, p2p_endpoint )
                node_list.append(thistuple)
    return node_list
        

def check_api(producer,checktype):
    if checktype == "httpchk":
        api = db_connect.getApiHttp(producer)
    else:
        api = db_connect.getApi(producer)
    # If there is no API or Full node in DB return False
    if None in api:
        return False, 'No API node available in JSON'
    else:
        info = "/v1/chain/get_info"
    try:
        response = requests.get(api[0]+info, timeout=5, verify=False)
        # If the response was successful, no Exception will be raised
        response.raise_for_status()
    except HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')  # Python 3.6
        return False, str(http_err)
    except Exception as err:
        print(f'Other error occurred: {err}')  # Python 3.6
        return False, str(err)
    else:
        # Check if API contains WAX chain ID - verifies its alive
        if checktype == "apichk" or checktype == 'httpchk':
            jsonres = response.json()
            chainid = jsonres.get('chain_id')
            if chainid == chain_id:
                return True, 'ok'
            else:
                return False, 'Wrong chain ID or HTTP not working'
        # Check whether Access-Control-Allow-Origin = *
        elif checktype == "corschk":
            headers = response.headers['Access-Control-Allow-Origin']
            if headers == "*":
                return True, 'ok'
            else:
                return False, str(headers)

def check_full_node(producer):
    # Set TRX
    trx = cfg.chain["trx"]
    trx2 = cfg.chain["trx2"]
    api = db_connect.getFull(producer)
    # If there is no Full node in DB return False
    if api == None:
        return False, 'No full node in JSON'
    # If the URL contains Hyperion then change URL request string
    else:
        info = "/v1/history/get_transaction"
    try:
        headers = {'Content-Type': 'application/json'}
        payload = {'id': trx}
        response = requests.post(api[0]+info, headers=headers, json=payload)
        # If the response was successful, no Exception will be raised
        response.raise_for_status()
    except HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')  # Python 3.6
        # also return http_err
        if response.status_code == 500:
            jsonres = response.json()
            return False, str(jsonres.get('error').get('what'))
        elif response.status_code == 404:
            return False, 'Not a full node'
        else:
            return False, str(http_err)
    except Exception as err:
        print(f'Other error occurred: {err}')  # Python 3.6
         # also return err
        return False, str(err)
    else:
        jsonres = response.json()
        try:
            # Try to get first TRX
            status = jsonres.get('trx').get('receipt').get('status')
        except:
            # If try fails then look for error
            status = jsonres.get('error').get('what')
            print("except",status)
            try:
                # Try to get second TRX
                payload = {'id': trx2}
                response = requests.post(api[0]+info, headers=headers, json=payload)
                jsonres = response.json()
                status = jsonres.get('trx').get('receipt').get('status')
            except:
                status = jsonres.get('error').get('what')
                print("except",status)
                return False, str(status)
        if status == 'executed':
            return True, 'ok'
        else:
            # also return status which is the error
            return False, str(status)

#print(check_full_node('eostribeprod'))

def check_https(producer,checktype):
    api = db_connect.getApiHttps(producer)
    # If there is no API or Full HTTPS node in DB return False
    if None in api:
        return False, 'No API node available in JSON'
     # If the URL contains Hyperion then change URL request string
    else:
        info = "/v1/chain/get_info"
    try:
        response = requests.get(api[0]+info, timeout=10, verify=False)
        # If the response was successful, no Exception will be raised
        response.raise_for_status()
    except HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')  # Python 3.6
        return False, str(http_err)
    except Exception as err:
        print(f'Other error occurred: {err}')  # Python 3.6
        return False,str(err)
    else:
        # Check if HTPS API contains WAX chain ID - verifies it's alive
        if checktype == "httpschk":
            jsonres = response.json()
            chainid = jsonres.get('chain_id')
            if chainid == chain_id:
                return True, 'ok'
            else:
                return False, 'Wrong chain ID or HTTPS not working'
        elif checktype == "http2chk":
            httpsendpoint = api[0]
            # If the URL contains a port number, strip the port and assign to port
            if core.portRegex(httpsendpoint):
                portsplit = httpsendpoint.rsplit(':', 1)
                port = portsplit[1]
            # If no port number assigned presume port 443, as HTTP2 works with TLS
            else:
                port = "443"
            return http2check.check_http2(httpsendpoint,port)
            
def check_P2P(producer):
   # Get P2P host and port
   p2p = db_connect.getP2P(producer)
   if p2p == None:
       return False, 'No seed node configured in JSON'
   # Slit host and port
   hostport = core.split_host_port(p2p[0])
   s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
   try:
      s.connect((hostport[0],hostport[1]))
      s.shutdown(2)
      return True, 'ok'
   except:
      return False, 'Server and or port not responding'

## Get list of guilds posting to delphioracle and remove duplicates
def delphioracle_actors():
    chain = "mainnet"
    #Get list of guilds posting to delphioracle looking at actions
    actions = core.get_actionsv2(delphi_actions,chain)
    guilds = actions['simple_actions']
    # Create empty list
    producer_final = []
    for i in guilds:
        producer_final.append(i['data']['owner'])
        producer_final = list(dict.fromkeys(producer_final))
    # Returns list of guilds with duplicates removed   
    return producer_final
  


# Returns tuple list with producers in delphioracle True or False
def delphiresults(producer):
     producersoracle = delphioracle_actors()
     if producer in producersoracle:
        return True, 'ok'
     else:
        return False ,'No actions associated with your BP name in Delphioracle'



def getcpustats():
    # Pull transactions from eosmechanics and save cpu time 
    chain = "mainnet"
    actions = core.get_actionsv2(eosmech_actions,chain)
    trxs = actions['simple_actions']
    # Create empty list
    producer_final = []
    # Create new empty dict
    proddict = {}
    # Set chain from where stats are being pulled
    chain = 'main'
    for i in trxs:
        # Get TRX ID
        trx = i['transaction_id']
        # Create copy of dict and call it new
        new = proddict.copy()
        # Construct dict from TRX variable and assign to ID key
        payload = dict(id=trx)
        # Pass TRX ID and get all TRX information
        fulltrx = core.get_trxv2(payload,chain)
        # Extract producer from TRX
        producer = fulltrx['actions'][0]['producer']
        # Extract cpu stats
        cpustats = fulltrx['actions'][0]['cpu_usage_us']
        # Update dict with producer name and cpustats
        new.update({'producer': producer, 'cpustats': cpustats})
        # Add dict to list
        producer_final.append(new)
    return producer_final


def cpuresults(producer,producercpu):
    # Get cpustats(key) value for the items in producercpu if the producer passed is in that list.
    cpu = [item['cpustats'] for item in producercpu if item["producer"] == producer]
    # If producer is not in that list  means producer is not in top21, so we need testnet data.
    if not cpu:
        # Iterate backwards from current)_headblock until you find a block produced by producer and that contains transactions
        # We only go back as far as 4000 blocks, if not found then return False.
        cpu = core.get_testnetproducer_cpustats(producer)
        if cpu == None:
            return int(2.0)
        else: 
            stat = round(cpu/1000,2)
            return stat
    else:
        stat = round((sum(cpu) / len(cpu))/1000,2)
        return stat

def finalresults():
    # Get list of registered active producers
    producersdb = db_connect.getProducers()
    # Get CPU stats for top21 producers
    producercpu = getcpustats()
    # Create empty list
    finaltuple = []
    for producer in producersdb:
        producer = producer[0]
        print(bcolors.OKBLUE,f"{'='*100}\nResults for ",producer,bcolors.ENDC)
        delphiresult = delphiresults(producer)
        if delphiresult[0] == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("Publishing feed data via an oracle service:",colorstart,delphiresult[0],bcolors.ENDC)
        checkapi = check_api(producer,'apichk')
        if checkapi[0] == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("API node endpoint is publicly available: ",colorstart,checkapi[0],bcolors.ENDC)
        checkhttp = check_api(producer,'httpchk')
        if checkhttp[0] == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("HTTP is available on RPC API endpoint.: ",colorstart,checkhttp[0],bcolors.ENDC)
        website = True
        print("Public website available:",bcolors.OKGREEN,website,bcolors.ENDC)
        chainsjson = True
        print("chains.json metadata available at regproducer url: ",bcolors.OKGREEN,chainsjson,bcolors.ENDC)
        waxjson = True
        print("wax.json metadata available at regproducer url: " ,bcolors.OKGREEN,waxjson,bcolors.ENDC)
        corscheck = check_api(producer,'corschk')
        if corscheck[0]  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("CORS is configured on RPC API: ",colorstart,corscheck[0],bcolors.ENDC)
        httpscheck = check_https(producer,'httpschk')
        if httpscheck[0]  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("HTTPS is available on RPC API endpoint: ",colorstart,httpscheck[0],bcolors.ENDC)
        http2check = check_https(producer,'http2chk')
        if http2check[0]  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("HTTP2 is enabled on RPC API endpoint: ",colorstart,http2check[0],bcolors.ENDC)
        cpuresult = cpuresults(producer,producercpu)
        print("CPU latency on EOS Mechanics below 2 ms on average:",bcolors.OKYELLOW, cpuresult,bcolors.ENDC,"ms")
        fullnode = check_full_node(producer)
        if fullnode[0]  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("Running a full node:",colorstart,fullnode[0],bcolors.ENDC)
        # Set snapshots to False until we find a way
        snapshots = False
        seednode = check_P2P(producer)
        if seednode[0]  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("Running a seed node:",colorstart,seednode[0],bcolors.ENDC)
         # Get current UTC timestamp
        dt = datetime.utcnow()
        #owner_name, cors_check, cors_check_error, http_check, http_check_error, http2_check, full_history, full_history_error, snapshots, seed_node, api_node, api_node_error, oracle_feed, wax_json, chains_json, cpu_time, date_check
        resultstuple = (producer, corscheck[0], corscheck[1], checkhttp[0], checkhttp[1], httpscheck[0], httpscheck[1], http2check[0], http2check[1], fullnode[0], fullnode[1], snapshots, seednode[0], seednode[1], checkapi[0], checkapi[1], delphiresult[0], delphiresult[1], waxjson, chainsjson, cpuresult, dt)
        finaltuple.append(resultstuple)
    return finaltuple



def main():
    # Get list of producers 
    producers = producer_chain_list()
    # Add producers to DB
    db_connect.producerInsert(producers)
    # Add nodes to DB
    nodes = node_list()
    db_connect.nodesInsert(nodes)
    # Get all results and save to DB
    results = finalresults()
    db_connect.resultsInsert(results)

if __name__ == "__main__":
   main()

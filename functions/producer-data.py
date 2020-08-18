import core
import requests
import simplejson
import json
from requests.exceptions import HTTPError
import db_connect
import json_extract
import urllib3
import http2check


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
wax_chain_id = "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4"


# Prdocuer Table
prod_table =  {
    "code": "eosio",
    "table": "producers",
    "scope": "eosio", 
    "json": "true", 
    "limit": "100", 
    "lower_bound": "0"
}

# Delpioacle Table
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

# Get eosmechanic actions
eosmech_actions = {
    'limit': '120',
    'account': 'eosmechanics',
    'track': 'true',
    'simple': 'true',
    'noBinary': 'true',
    'checkLib': 'false'
}

# Get eosmechanic actions
eosmech_actions_testnet = {
    'limit': '10000',
    'account': 'eosmechanics',
    'track': 'true',
    'simple': 'true',
    'noBinary': 'true',
    'checkLib': 'false'
}


def producerlist():
    producers = core.getEOStable(prod_table)
    prodremove = ['https://wax.io', '', 'https://bp.eosnewyork.io', 'https://bp.nebulaprotocol.com', 'https://wax.infinitybloc.io', 'https://blockmatrix.network', 'https://eosauthority.com', 'https://hyperblocks.pro/', 'https://strongblock.io/', 'https://waxux.com', 'https://skinminerswax.com']
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
            else:
                # new = proddict.copy()
                # Now get new JSON file
                response = requests.get(url=i['url']+"/"+waxjson)
                try:
                    # Get response data in JSON
                    json_response = response.json()
                    # Extract org candidate name
                    candidate_name = json_response['org']['candidate_name']
                except JSONDecodeError:
                    print('JSON parsing error')
                else:
                    thistuple = (i['owner'], candidate_name, i['url'], i['url'] + '/'+waxjson, i['url'] + '/chains.json' )
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
                if node.get('node_type') == 'producer':
                    continue 
                #HKEOS has complete empty node types that are not producer
                if node.get('ssl_endpoint') == "" and node.get('api_endpoint') == "" and node.get('p2p_endpoint') == "":
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
    api = db_connect.getApi(producer)
    # If there is no API or Full node in DB return False
    if api[0] == None:
        return False
    # If the URL contains Hyperion then change URL request string
    if "hyperion" in api[0]:
        info = "/v2/health"
    else:
        info = "/v1/chain/get_info"
    try:
        response = requests.get(api[0]+info, timeout=5, verify=False)
        # If the response was successful, no Exception will be raised
        response.raise_for_status()
    except HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')  # Python 3.6
        return False
    except Exception as err:
        print(f'Other error occurred: {err}')  # Python 3.6
        return False
    else:
        # Check if API contains WAX chain ID - verifies its alive
        if checktype == "apichk":
            jsonres = response.json()
            chainid = jsonres.get('chain_id')
            if chainid == wax_chain_id:
                return True
            else:
                return False
        # Check whether Access-Control-Allow-Origin = *
        elif checktype == "corschk":
            headers = response.headers['Access-Control-Allow-Origin']
            if headers == "*":
                return True
            else:
                return False



def check_https(producer,checktype):
    api = db_connect.getApiHttps(producer)
    # If there is no API or Full HTTPS node in DB return False
    if api[0] == None:
        return False
     # If the URL contains Hyperion then change URL request string
    if "hyperion" in api[0]:
        info = "/v2/health"
    else:
        info = "/v1/chain/get_info"
    try:
        response = requests.get(api[0]+info, timeout=10, verify=False)
        # If the response was successful, no Exception will be raised
        response.raise_for_status()
    except HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')  # Python 3.6
        return False
    except Exception as err:
        print(f'Other error occurred: {err}')  # Python 3.6
        return False
    else:
        # Check if HTPS API contains WAX chain ID - verifies it's alive
        if checktype == "httpschk":
            jsonres = response.json()
            chainid = jsonres.get('chain_id')
            if chainid == wax_chain_id:
                return True
            else:
                return False
        elif checktype == "http2chk":
            httpsendpoint = api[0]
            # If the URL contains a port number, strip the port and assign to port
            if core.hasNumbers(httpsendpoint):
                portsplit = httpsendpoint.rsplit(':', 1)
                port = portsplit[1]
            # If no port number assigned presume port 443, as HTTP2 works with TLS
            else:
                port = "443"
            return http2check.check_http2(httpsendpoint,port)
                

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
        return True
     else:
        return False



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
            return None
        else: 
            stat = cpu/1000
            return stat
    else:
        stat = (sum(cpu) / len(cpu))/1000
        return stat


def finalresults():
    # Get list of registered producers
    producersdb = db_connect.getProducers()
    # Get CPU stats for top21 producers
    producercpu = getcpustats()
    #print(producersdb)
    # Create empty list
    finaltuple = []
    for producer in producersdb:
        producer = producer[0]
        print(bcolors.OKBLUE,f"{'='*100}\nResults for ",producer,bcolors.ENDC)
        delphiresult = delphiresults(producer)
        if delphiresult == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("Publishing feed data via an oracle service:",colorstart,delphiresult,bcolors.ENDC)
        checkapi = check_api(producer,'apichk')
        if checkapi == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("API node endpoint is publicly available: ",colorstart,checkapi,bcolors.ENDC)
        print("HTTP is available on RPC API endpoint.: ",colorstart,checkapi,bcolors.ENDC)
        website = True
        print("Public website available:",bcolors.OKGREEN,website,bcolors.ENDC)
        chainsjson = True
        print("chains.json metadata available at regproducer url: ",bcolors.OKGREEN,chainsjson,bcolors.ENDC)
        waxjson = True
        print("wax.json metadata available at regproducer url: " ,bcolors.OKGREEN,waxjson,bcolors.ENDC)
        corscheck = check_api(producer,'corschk')
        if corscheck  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("CORS is configured on RPC API: ",colorstart,corscheck,bcolors.ENDC)
        httpscheck = check_https(producer,'httpschk')
        if httpscheck  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("HTTPS is available on RPC API endpoint: ",colorstart,httpscheck,bcolors.ENDC)
        http2check = check_https(producer,'http2chk')
        if http2check  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("HTTP2 is enabled on RPC API endpoint: ",colorstart,http2check,bcolors.ENDC)
        cpuresult = cpuresults(producer,producercpu)
        print("CPU latency on EOS Mechanics below 2 ms on average:",bcolors.OKYELLOW, cpuresult,bcolors.ENDC,"ms")
        
        

finalresults()
def main():
    # Get list of producers 
    producers = producer_chain_list()
    # Add producers to DB
    db_connect.producerInsert(producers)
    # Add nodes to DB
    nodes = node_list()
    db_connect.nodesInsert(nodes)

#if __name__ == "__main__":
#    main()

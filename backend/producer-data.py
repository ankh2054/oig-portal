import core
import eosio
import requests
import simplejson
import socket
import json
import time
from requests.exceptions import HTTPError
import db_connect
import urllib3

import test
from datetime import datetime
import backendconfig as cfg
import statistics


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


# Disable SSL warnings
urllib3.disable_warnings()

# Better JSON errors
try:
    from simplejson.errors import JSONDecodeError
except ImportError:
    from json.decoder import JSONDecodeError


# Load Settings from config
chain_id = cfg.chain["chainid"]

# Headers for curl request creator for get requests
headers = {'Content-Type': 'application/json'}


# Get producer table 
def get_table_data(code,table,scope,limit):
    table_dict = {
        "code": code,
        "table": table,
        "scope": scope,
        "json": "true",
        "limit": limit,
        "lower_bound": "0"
    }
    return table_dict

# Get actions data
def get_actions_data(account,limit):
    actions_dict = {
        'limit': limit,
        'account': account,
        'track': 'true',
        'simple': 'true',
        'noBinary': 'true',
        'checkLib': 'false'
    }
    return actions_dict

def concatenate(**kwargs):
    result = ""
    # Iterating over the keys of the Python kwargs dictionary
    for arg in kwargs:
        result += arg
    return result


# Results are a key value dict with each check as its called in DB, 
# with the results of that check as the value
def pointsResults(results,pointsystem):
    points = 0
    # for each check in points system - Names of checks
    for check in pointsystem:
        # Look in results dict and find check key and get value
        checkResult = results.get(check[0])
        # CPU exception
        if check == 'cpu_time':
            if checkResult <= 0.5:
                points = points+(check[1]*check[2])
            else:
                points = points+0
        # Website exception 
        elif check == 'website':
            points = points+(check[1]*check[2])
        # For all other scores if result is True
        else:
            if checkResult == True:
                points = points+(check[1]*check[2])
            else:
                points = points+0
    return points

def producerlist():
    prod_table = get_table_data("eosio","producers","eosio","100")
    producers = eosio.getEOStable(prod_table)
    # Remove WAX guilds and guilds with no website
    prodremove = ['https://wax.io', '', 'https://bp.eosnewyork.io', 'https://bp.nebulaprotocol.com', 'https://wax.infinitybloc.io', 'https://blockmatrix.network', 'https://eosauthority.com', 'https://hyperblocks.pro/', 'https://strongblock.io/', 'https://waxux.com', 'https://skinminerswax.com', 'https://sheos.org','https://teloscentral.com','https://eossweden.eu','https://dmail.co', 'https://3dkrender.com/']
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
    top21producers = eosio.producerSCHED()
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
                    # is producer currently in top21
                    top21 = i['owner'] in top21producers
                    thistuple = (i['owner'], candidate_name, i['url'], i['url'] + '/'+waxjson, i['url'] + '/chains.json', logo_256, top21)
                    producer_final.append(thistuple)
    return producer_final


# Iterate over all different types of possible URLs and features
def node_types(type, node, owner_name):
    # Set node type
    node_type = type
    # List of all possible types
    nodetypes = ['ssl_endpoint','api_endpoint','p2p_endpoint','features']
    # List to to pass back to tuple, contains owner_name and node_type
    finallist = [owner_name, node_type]
    for nodes in nodetypes:
        # If fields in JSON are empty strings pass NULL to DB
        if node.get(nodes) == "":
            nodeurl = None
        # Else pass in URL or featurelist
        else:         
            nodeurl = node.get(nodes)
        finallist.append(nodeurl)
    # Turn list into tuple 
    thistuple = tuple(finallist)
    return thistuple


## Get list of nodes from each wax.json and produce tuple of all nodes
## Look for features 
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
                # Get all node types
                node_type = node.get('node_type')
                if "query" in node_type:
                    # Iterate over all types of possible URLs and features for each type of node
                    thistuple = node_types("query", node, owner_name)
                    node_list.append(thistuple)
                # Get seed nodes
                if "seed" in node_type:
                    thistuple = node_types("seed", node, owner_name)
                    node_list.append(thistuple)
                if "full" in node_type:
                    thistuple = node_types("full", node, owner_name)
                    node_list.append(thistuple)
                if "history" in node_type:
                    thistuple = node_types("history", node, owner_name)
                    node_list.append(thistuple)
    return node_list

def check_api(producer,checktype):
    if checktype == "httpchk":
        api = db_connect.getNodes(producer,'http')
    else:
        api = db_connect.getNodes(producer,'api')
    # If there is no API or Full node in DB return False
    #if None in api:
    if api == None:
        return False, 'No API node available in JSON'
    else:
        info = "/v1/chain/get_info"
    try:
        headers = {'Content-Type': 'application/json'} # only for curl request
        curlreq = core.curl_request(api[0]+info,'GET',headers,False)
        response = requests.get(api[0]+info, timeout=5, verify=False)
        responsetimes = response.elapsed.total_seconds()*1000
        # If the response was successful, no Exception will be raised
        response.raise_for_status()
    except HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')
        error = curlreq+' '+str(http_err)
        return False, error
    except Exception as err:
        print(f'Other error occurred: {err}')
        error = curlreq+' '+str(err)
        return False, error
    else:
        # Check if API contains WAX chain ID - verifies its alive
        if checktype == "apichk" or checktype == 'httpchk':
            jsonres = response.json()
            chainid = jsonres.get('chain_id')
            if chainid == chain_id:
                resptime = round(responsetimes,2)
                print('Response time: ', resptime)
                return True, 'ok'
            else:
                error = curlreq+'\nError: has the wrong chain ID or HTTP is not working'
                return False, error
        # Checks for Access-Control-Allow-Origin = *
        elif checktype == "corschk":
            headers = response.headers['Access-Control-Allow-Origin']
            if headers == "*":
                return True, 'ok'
            else:
                return False, str(headers)

# History nodes type checks
# Pass in history-v1, hyperion-v2 
def check_full_node(producer,type):
    transactions = eosio.randomTransaction()
    # if transaction list is empty sleep for 1 second
    while not transactions:
        time.sleep(1)
        transactions = eosio.randomTransaction()
    trx = transactions[0]
    try:
        trx2 = transactions[1]
    except:
        trx2 = trx
    # Query nodes in DB
    api = db_connect.getQueryNodes(producer,type)
    # If there is no v1_history or hyperion node in DB return False
    if api == None:
        return False, 'No ' + type + ' in JSON'
    else:
        
        info = "/v1/history/get_transaction"
    try:
        headers = {'Content-Type': 'application/json'}
        payload = {'id': trx}
        curlreq = core.curl_request(api[0]+info,'POST',headers,payload)
        response = requests.post(api[0]+info, headers=headers, json=payload)
        # If the response was successful, no Exception will be raised
        response.raise_for_status()
    # If returns codes are 500 OR 404
    except HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')  # Python 3.6
        # also return http_err
        if response.status_code == 500:
            jsonres = response.json()
            try:
                error = curlreq+'\nError: '+str(jsonres.get('error').get('what'))
            except:
                error = "something else weird has happened"
            return False, error
        elif response.status_code == 404:
            error = curlreq+'\nError: Not a full node'
            return False, error
        else:
            error = curlreq+' '+str(http_err)
            return False, error
    except Exception as err:
        print(f'Other error occurred: {err}')  # Python 3.6
         # also return err
        error = curlreq+'\n'+str(err)
        return False, error
    # If we manage to connect 
    else:
        jsonres = response.json()
        try:
            # Try to get first TRX
            status = jsonres.get('trx').get('receipt').get('status')
        except:
            # If first TRX fails  look for error and move try again
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
                error = curlreq+'\n'+str(status)
                return False, error
        if status == 'executed':
            return True, 'ok'
        else:
            # also return status which is the error
            error = curlreq+' '+str(status)
            return False, error

def check_https(producer,checktype):
    api = db_connect.getNodes(producer,'http')
    # If there is no API or Full HTTPS node in DB return False
    if api == None:
        return False, 'No API node available in JSON'
     # If the URL contains Hyperion then change URL request string
    else:
        info = "/v1/chain/get_info"
    try:
        curlreq = core.curl_request(api[0]+info,'GET',headers,False)
        response = requests.get(api[0]+info, timeout=10)
        # If the response was successful, no Exception will be raised
        response.raise_for_status()
    except HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')  # Python 3.6
        error = curlreq+'\n'+str(http_err)
        return False, error
    except Exception as err:
        print(f'Other error occurred: {err}')  # Python 3.6
        error = curlreq+'\n'+str(err)
        return False, error
    else:
        # Check if HTPS API contains WAX chain ID - verifies it's alive
        if checktype == "httpschk":
            jsonres = response.json()
            chainid = jsonres.get('chain_id')
            if chainid == chain_id:
                return True, 'ok'
            else:
                error = curlreq+'\nError:Wrong chain ID or HTTPS not working'
                return False, error
        elif checktype == "http2chk":
            httpsendpoint = api[0]
            # If the URL contains a port number, strip the port and assign to port
            if core.portRegex(httpsendpoint):
                portsplit = httpsendpoint.rsplit(':', 1)
                port = portsplit[1]
            # If no port number assigned presume port 443, as HTTP2 works with TLS
            else:
                port = "443"
            return core.check_http2(httpsendpoint,port,checktype)
        elif checktype == "tlschk":
            httpsendpoint = api[0]
            # If the URL contains a port number, strip the port and assign to port
            if core.portRegex(httpsendpoint):
                portsplit = httpsendpoint.rsplit(':', 1)
                port = portsplit[1]
            # If no port number assigned presume port 443, as HTTP2 works with TLS
            else:
                port = "443"
            return core.check_tls(httpsendpoint,port)

def api_security(producer, sectype):
    # Check through all nodes
    apis = db_connect.getNodes(producer,'all_apis')
    # If there is no API or Full node in DB return True, as no security to test
    if apis == None:
        return True, 'No APIs to test for', sectype
    else:
        if sectype == 'producer_api':
            info = "/v1/producer/paused"
        elif sectype == 'net_api':
            info = "/v1/net/connections"
        elif sectype == 'db_size_api':
            info = "/v1/db_size/get"
    # Empty list for API results
    apilist = []
    # Loop over APIs and check security for particular api
    for api in apis:
        try:
            headers = {'Content-Type': 'application/json'} # only for curl request
            curlreq = core.curl_request(api+info,'POST',headers,False)
            response = requests.get(api+info, timeout=5, verify=False)
            # If the response was successful, no Exception will be raised
            response.raise_for_status()
        except HTTPError as http_err:
            #print(f'HTTP error occurred: {http_err}')
            message = True
        except Exception as err:
            #print(f'Other error occurred: {err}')
            message = True
        # If no error is returned and valid json is returned then API is running
        else:
            message = False
        # API results + api itself
        apiresult = api,message
        # Append API + result to apilist
        apilist.append(apiresult)
    for api in apilist:
        if api[1] != True:
            error = str(sectype) + " is enabled on " + api[0] + " this feature should be disabled: " + str(curlreq)
            return False, error
        else:
           True # Dont return here otherswise loop stops
    # If not False has been found return True
    return True, 'ok'



def check_P2P(producer):
   # Get P2P host and port
   p2p = db_connect.getNodes(producer,'p2p')
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
      error = hostport[0]+':'+str(hostport[1])+'\nError: Server and or port not responding'
      return False, error

## Get list of guilds posting to delphioracle and remove duplicates
def delphioracle_actors():
    print(bcolors.OKYELLOW,f"{'='*100}\nGetting Delpi Oracle Data ",bcolors.ENDC)
    chain = "mainnet"
    #Get list of guilds posting to delphioracle looking at actions
    delphi_actions = get_actions_data("delphioracle","100")
    actions = eosio.get_stuff(delphi_actions,chain,'action')
    guilds = actions['simple_actions']
    # Create empty list
    producer_final = []
    for i in guilds:
        producer_final.append(i['data']['owner'])
        producer_final = list(dict.fromkeys(producer_final))
    # Returns list of guilds with duplicates removed   
    return producer_final
  


# Returns tuple list with producers in delphioracle True or False
def delphiresults(producer,oracledata):
     producersoracle = oracledata
     if producer in producersoracle:
        return True, 'ok'
     else:
        return False ,'No actions associated with your BP name in Delphioracle'



def getcpustats():
    print(bcolors.OKYELLOW,f"{'='*100}\nGetting CPU Results ",bcolors.ENDC)
    # Pull transactions from eosmechanics and save cpu time 
    chain = "mainnet"
    eosmech_actions = get_actions_data("eosmechanics","120")
    query = ['simple_actions']
    actions = eosio.get_stuff(eosmech_actions,chain,'actions')
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
        # Pass TRX ID and get all TRX information]
        fulltrx = eosio.get_stuff(payload,chain,'trx')
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
        return int(1.0)
        # Removed testnet data for now and only return 1
        '''
        # Iterate backwards from current)_headblock until you find a block produced by producer and that contains transactions
        # We only go back as far as 4000 blocks, if not found then return False.
        cpu = eosio.get_testnetproducer_cpustats(producer)
        if cpu == None:
            return int(1.0)
        else: 
            stat = round(cpu/1000,2)
            return stat
        '''
    else:
        stat = round((sum(cpu) / len(cpu))/1000,2)
        return stat

def cpuAverage(producer):
    allcpu = db_connect.getCPU(producer)
    #allcpu = allcpu[0]
    cpu_final = []
    for cpu in allcpu:
        cpu_final.append(cpu[0])
    avg_cpu = statistics.median(cpu_final) 
    return avg_cpu

   
def resultsGet(producer,check,pointsystem):
    return 0

def finalresults():
    # Get list of registered active producers
    producersdb = db_connect.getProducers()
    # Get CPU stats for top21 producers
    producercpu = getcpustats()
    # Get points system
    pointsystem =  db_connect.getPoints()
    # Get list of delphioracles and store for use
    producersoracle = delphioracle_actors()
    # Create empty list
    finaltuple = []
    # Add the description in DB when then create a function for the below
    # Add the k,v dict with check and function
    for producer in producersdb:
        producer = producer[0]
        print(bcolors.OKBLUE,f"{'='*100}\nResults for ",producer,bcolors.ENDC)
        oracle_feed = delphiresults(producer,producersoracle)
        if oracle_feed[0] == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("Publishing feed data via an oracle service:",colorstart,oracle_feed[0],bcolors.ENDC)
        api_node = check_api(producer,'apichk')
        if api_node[0] == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("API node endpoint is publicly available: ",colorstart,api_node[0],bcolors.ENDC)
        http_check = check_api(producer,'httpchk')
        if http_check[0] == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("HTTP is available on RPC API endpoint.: ",colorstart,http_check[0],bcolors.ENDC)
        website = True
        print("Public website available:",bcolors.OKGREEN,website,bcolors.ENDC)
        chains_json = True
        print("chains.json metadata available at regproducer url: ",bcolors.OKGREEN,chains_json,bcolors.ENDC)
        wax_json = True
        print("wax.json metadata available at regproducer url: " ,bcolors.OKGREEN,wax_json,bcolors.ENDC)
        cors_check = check_api(producer,'corschk')
        if cors_check[0]  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("CORS is configured on RPC API: ",colorstart,cors_check[0],bcolors.ENDC)
        https_check = check_https(producer,'httpschk')
        if https_check[0]  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("HTTPS is available on RPC API endpoint: ",colorstart,https_check[0],bcolors.ENDC)
        tlscheck = check_https(producer,'tlschk')
        print("TLS version available on HTTPS API: ",bcolors.OKYELLOW,tlscheck[0],bcolors.ENDC)
        http2_check = check_https(producer,'http2chk')
        if http2_check[0]  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("HTTP2 is enabled on RPC API endpoint: ",colorstart,http2_check[0],bcolors.ENDC)
        # Produce API check
        producer_apicheck = api_security(producer,'producer_api')
        if producer_apicheck[0]  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("Producer API is disabled on visible nodes: ",colorstart,producer_apicheck[0],bcolors.ENDC)

        # Net API check
        net_apicheck = api_security(producer,'net_api')
        if net_apicheck[0]  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("net_api API is disabled on visible nodes: ",colorstart,net_apicheck[0],bcolors.ENDC)

        # DB size API check
        dbsize_apicheck = api_security(producer,'db_size_api')
        if dbsize_apicheck[0]  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("db_size API is disabled on visible nodes: ",colorstart,dbsize_apicheck[0],bcolors.ENDC)

        #CPU checks
        cpu_time = cpuresults(producer,producercpu)
        print("CPU latency on EOS Mechanics below 2 ms on average:",bcolors.OKYELLOW, cpu_time,bcolors.ENDC,"ms")
        cpuavg = cpuAverage(producer)
        print("CPU latency average over 30days:",bcolors.OKYELLOW, cpuavg,bcolors.ENDC,"ms")
        # v1 History check
        full_history = check_full_node(producer,'history-v1')
        if full_history[0]  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("Running a v1 History node:",colorstart,full_history[0],bcolors.ENDC)
        # v2 Hyperion check
        hyperion_v2 = check_full_node(producer,'hyperion-v2')
        if hyperion_v2[0]  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("Running a v2 Hyperion node:",colorstart,hyperion_v2[0],bcolors.ENDC)
        # Set snapshots to False until we find a way
        snapshots = False
        seed_node = check_P2P(producer)
        if seed_node[0]  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("Running a seed node:",colorstart,seed_node[0],bcolors.ENDC)
         # Get current UTC timestamp
        dt = datetime.utcnow()
        # Create a function for this
        pointslist = { 
            'cors_check': cors_check[0],
            'http_check': http_check[0],
            'https_check': https_check[0],
            'tlscheck': tlscheck[0],
            'producer_apicheck': producer_apicheck[0],
            'net_apicheck': net_apicheck[0],
            'dbsize_apicheck': dbsize_apicheck[0],
            'http2_check': http2_check[0],
            'full_history': full_history[0],
            'hyperion_v2': hyperion_v2[0],
            'snapshots': snapshots,
            'seed_node': seed_node[0],
            'api_node': api_node[0],
            'oracle_feed': oracle_feed[0],
            'wax_json': wax_json,
            'chains_json': chains_json,
            'cpu_time': cpu_time,
        }
        resultslist = [
            producer, 
            cors_check[0], 
            cors_check[1], 
            http_check[0], 
            http_check[1], 
            https_check[0], 
            https_check[1], 
            tlscheck[0], 
            tlscheck[1], 
            producer_apicheck[0], 
            producer_apicheck[1],
            net_apicheck[0],
            net_apicheck[1],
            dbsize_apicheck[0],
            dbsize_apicheck[1],
            http2_check[0],
            http2_check[1], 
            full_history[0], 
            full_history[1],
            hyperion_v2[0],
            hyperion_v2[1], 
            snapshots, 
            seed_node[0], 
            seed_node[1], 
            api_node[0], 
            api_node[1], 
            oracle_feed[0], 
            oracle_feed[1], 
            wax_json, 
            chains_json, 
            cpu_time, 
            cpuavg, 
            dt
        ]
        score = pointsResults(pointslist,pointsystem)
        print("Final Tech points:",colorstart,score,bcolors.ENDC)
        # Add final sore to list
        resultslist.append(score)
        # Turn list into tuple read for Postgres
        resultstuple = tuple(resultslist)
        finaltuple.append(resultstuple)
    return finaltuple



def main():
    # Get list of producers
    print(bcolors.OKYELLOW,f"{'='*100}\nGetting list of producers on chain ",bcolors.ENDC)
    producers = producer_chain_list()
    # Add producers to DB
    db_connect.producerInsert(producers)
    # Add nodes to DB
    print(bcolors.OKYELLOW,f"{'='*100}\nGetting list of nodes from JSON files ",bcolors.ENDC)
    nodes = node_list()
    db_connect.nodesInsert(nodes)
    # Get all results and save to DB
    results = finalresults()
    db_connect.resultsInsert(results)

if __name__ == "__main__":
   main()


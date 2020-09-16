import core
import requests
import simplejson
import socket
import json
import time
from requests.exceptions import HTTPError
import db_connect
import json_extract
import urllib3
import http2check
import tls_downgrade
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

def pointsResults(results,pointsystem):
    #resultslist = [producer, corscheck[0], 
    # corscheck[1], checkhttp[0], checkhttp[1], 
    # httpscheck[0], httpscheck[1], tlscheck[0], 
    # tlscheck[1], http2check[0], http2check[1], 
    # fullnode[0], fullnode[1], snapshots, 
    # seednode[0], seednode[1], checkapi[0], 
    # checkapi[1], delphiresult[0], delphiresult[1], 
    # waxjson, chainsjson, cpuresult, 
    # cpuavg, dt]
    #pointsystem =  db_connect.getPoints()
    points = 0
    for check in pointsystem:
        if check[0] == 'cors_check':
            if results[1] == True:
                points = points+(check[1]*check[2])
            else:
                points = points+0
        elif check[0] == 'http_check':
            if results[3] == True:
                points = points+(check[1]*check[2])
            else:
                points = points+0
        elif check[0] == 'https_check':
            if results[5] == True:
                points = points+(check[1]*check[2])
            else:
                points = points+0
        elif check[0] == 'http2_check':
            if results[9] == True:
                points = points+(check[1]*check[2])
            else:
                points = points+0
        elif check[0] == 'full_history':
            if results[11] == True:
                fullhistory = True
                points = points+(check[1]*check[2])
            else:
                points = points+0
                fullhistory = False
        elif check[0] == 'snapshots':
            # Only award points if not already awarded for Full history
            if results[13] == True and fullhistory != True:
                points = points+(check[1]*check[2])
            else:
                points = points+0
        elif check[0] == 'seed_node':
            if results[14] == True:
                points = points+(check[1]*check[2])
            else:
                points = points+0
        elif check[0] == 'api_node':
            if results[16] == True:
                points = points+(check[1]*check[2])
            else:
                points = points+0
        elif check[0] == 'oracle_feed':
            if results[18] == True:
                points = points+(check[1]*check[2])
            else:
                points = points+0
        elif check[0] == 'wax_json':
            if results[20] == True:
                points = points+(check[1]*check[2])
            else:
                points = points+0
        elif check[0] == 'chains_json':
            if results[21] == True:
                points = points+(check[1]*check[2])
            else:
                points = points+0
        elif check[0] == 'cpu_time':
            if results[23] <= 2:
                points = points+(check[1]*check[2])
            else:
                points = points+0
        # Award for having a website
        elif check[0] == 'website':
            points = points+(check[1]*check[2])  
    return points


def producerlist():
    prod_table = get_table_data("eosio","producers","eosio","100")
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
    top21producers = core.producerSCHED()
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
                print('Response time: ',responsetimes)
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

def check_full_node(producer):
    transactions = core.randomTransaction()
    # if transaction list is empty sleep for 1 second
    while not transactions:
        time.sleep(1)
        transactions = core.randomTransaction()
    trx = transactions[0]
    try:
        trx2 = transactions[1]
    except:
        trx2 = trx
    api = db_connect.getFull(producer)
    # If there is no Full node in DB return False
    if api == None:
        return False, 'No full node in JSON'
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
            error = curlreq+'\nError: '+str(jsonres.get('error').get('what'))
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
    api = db_connect.getApiHttps(producer)
    # If there is no API or Full HTTPS node in DB return False
    if None in api:
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
            return http2check.check_http2(httpsendpoint,port,checktype)
        elif checktype == "tlschk":
            httpsendpoint = api[0]
            # If the URL contains a port number, strip the port and assign to port
            if core.portRegex(httpsendpoint):
                portsplit = httpsendpoint.rsplit(':', 1)
                port = portsplit[1]
            # If no port number assigned presume port 443, as HTTP2 works with TLS
            else:
                port = "443"
            return tls_downgrade.check_tls(httpsendpoint,port)

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
      error = hostport[0]+':'+str(hostport[1])+'\nError: Server and or port not responding'
      return False, error

## Get list of guilds posting to delphioracle and remove duplicates
def delphioracle_actors():
    chain = "mainnet"
    #Get list of guilds posting to delphioracle looking at actions
    delphi_actions = get_actions_data("delphioracle","100")
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
    eosmech_actions = get_actions_data("eosmechanics","120")
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

def cpuAverage(producer):
    allcpu = db_connect.getCPU(producer)
    #allcpu = allcpu[0]
    cpu_final = []
    for cpu in allcpu:
        cpu_final.append(cpu[0])
    avg_cpu = statistics.median(cpu_final) 
    return avg_cpu

   

#cpuAverage('sentnlagents')

def finalresults():
    # Get list of registered active producers
    producersdb = db_connect.getProducers()
    # Get CPU stats for top21 producers
    producercpu = getcpustats()
    # Get points system
    pointsystem =  db_connect.getPoints()
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
        tlscheck = check_https(producer,'tlschk')
        print("TLS version available on HTTPS API: ",bcolors.OKYELLOW,tlscheck[0],bcolors.ENDC)
        http2check = check_https(producer,'http2chk')
        if http2check[0]  == True:
            colorstart = bcolors.OKGREEN
        else:
            colorstart = bcolors.WARNING
        print("HTTP2 is enabled on RPC API endpoint: ",colorstart,http2check[0],bcolors.ENDC)
        cpuresult = cpuresults(producer,producercpu)
        print("CPU latency on EOS Mechanics below 2 ms on average:",bcolors.OKYELLOW, cpuresult,bcolors.ENDC,"ms")
        cpuavg = cpuAverage(producer)
        print("CPU latency average over 30days:",bcolors.OKYELLOW, cpuavg,bcolors.ENDC,"ms")
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
        resultslist = [producer, corscheck[0], corscheck[1], checkhttp[0], checkhttp[1], httpscheck[0], httpscheck[1], tlscheck[0], tlscheck[1], http2check[0], http2check[1], fullnode[0], fullnode[1], snapshots, seednode[0], seednode[1], checkapi[0], checkapi[1], delphiresult[0], delphiresult[1], waxjson, chainsjson, cpuresult, cpuavg, dt]
        score = pointsResults(resultslist,pointsystem)
        print("Final Tech points:",colorstart,score,bcolors.ENDC)
        # Add final sore to list
        resultslist.append(score)
        # Turn list into tuple read for Postgres
        resultstuple = tuple(resultslist)
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

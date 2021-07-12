import core
import eosio
import requests
import simplejson
import socket
import json
import time
import datetime
from datetime import timedelta
from requests.exceptions import HTTPError
import db_connect
import urllib3
import test
from datetime import datetime
import backendconfig as cfg
import statistics


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
        minrequirementscheck = results.get(check[3])
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
            # If checkresult fails and its a minimum requirement deduct 1000 points, so the guld fails the min point requirements
            elif checkResult == False and minrequirementscheck == True:
                points = points-1000
            else:
                points = points+0
    return points


"""
def producerlist():
    prod_table = get_table_data("eosio","producers","eosio","100")
    producers = eosio.getEOStable(prod_table)
    # Remove WAX guilds and guilds with no website
    prodremove = ['https://wax.io', '', 'https://bp.eosnewyork.io', 'https://bp.nebulaprotocol.com', 'https://wax.infinitybloc.io', 'https://blockmatrix.network', 'https://eosauthority.com', 'https://hyperblocks.pro/', 'https://strongblock.io/', 'https://waxux.com', 'https://skinminerswax.com', 'https://sheos.org','https://teloscentral.com','https://eossweden.eu','https://dmail.co', 'https://maltablock.org', 'https://wax.csx.io', 'https://xpoblocks.com']
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
"""

## Get list of producers and produce tuple
def producer_chain_list():
    # Get list of current active producers from DB - these are set by OIG
    producers = db_connect.getProducers() 
    # Create empty list
    top21producers = eosio.producerSCHED()
    producer_final = []
    # Create emtpy dictinary
    # proddict = {}
    for i in producers:
        try:
            # Set guild default website URL from tuple obtained from DB
            guildurl = i[2]
            response = requests.get(url=guildurl + '/chains.json')
            #response = requests.get(url=i['url'] + '/chains.json')
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
                response = requests.get(url=guildurl+"/"+waxjson)
                #response = requests.get(url=i['url']+"/"+waxjson)
                try:
                    # Get response data in JSON
                    json_response = response.json()
                    # Extract org candidate name
                    candidate_name = json_response['org']['candidate_name']
                    try:
                        country_code = json_response['org']['location']['country']
                    except:
                        country_code = None
                    try:
                        logo_256 = json_response['org']['branding']['logo_256']
                    except: 
                        logo_256 = None
                except JSONDecodeError:
                    print('JSON parsing error')
                else:
                    # is producer currently in top21
                    top21 = i[0] in top21producers
                    thistuple = (i[0], candidate_name, guildurl, guildurl + '/'+waxjson, guildurl + '/chains.json', logo_256, top21, country_code)
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
        # Else pass in node URL or featurelist
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
                    changetuple = list(thistuple)
                    # P2P endpoints don't have features list in JSON BP standard
                    # We therefor need to Update last item (feature) in list 
                    # We update this to p2p_endpoint, so we can ensure duplicates are not added to DB
                    changetuple[-1] = ['p2p_endpoint']
                    # Change list back to tuple
                    thistuple = tuple(changetuple)
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
        api = db_connect.getQueryNodes(producer,'chain-api','http')
    else:
        api = db_connect.getQueryNodes(producer,'chain-api','api')
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
def check_full_node(producer,feature):
    infourl = "/v1/history/get_transaction"
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
    # Query nodes in DB and try and obtain API node
    try:
        api = db_connect.getQueryNodes(producer,feature,'api')[0]
    # If there is no v1_history or hyperion node in DB return False
    except:
        return False, 'No ' + feature + ' in JSON'
    # If hyperion, check whether last indexed equals total indexed blocks
    if feature == 'hyperion-v2':
        #Obtain Hyperion result
        hyperionresult = eosio.hyperionindexedBlocks(api)
        if hyperionresult[0] == False:
            return False, hyperionresult[1]
        else:
            info = infourl
    # If all checks are good assign info paramater for checking
    else:
        info = infourl
    try:
        headers = {'Content-Type': 'application/json'}
        payload = {'id': trx}
        curlreq = core.curl_request(api+info,'POST',headers,payload)
        response = requests.post(api+info, headers=headers, json=payload)
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
            # If first TRX fails  look for error and try again
            status = jsonres.get('error').get('what')
            print("except",status)
            try:
                # Try to get second TRX
                payload = {'id': trx2}
                response = requests.post(api+info, headers=headers, json=payload)
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
    api = db_connect.getQueryNodes(producer,'chain-api','https')
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

def api_security(producer,features,sectype):
    # Check through all nodes
    apis = db_connect.getQueryNodes(producer,features,'all_apis')
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



def check_P2P(producer,features):
   # Get P2P host and port
   p2p = db_connect.getQueryNodes(producer,features,'p2p')
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
    print(core.bcolors.OKYELLOW,f"{'='*100}\nGetting Delpi Oracle Data ",core.bcolors.ENDC)
    chain = "mainnet"
    #Get list of guilds posting to delphioracle looking at actions, save last 100 actions.
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
    print(core.bcolors.OKYELLOW,f"{'='*100}\nGetting CPU Results ",core.bcolors.ENDC)
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
        # We only go back as far as 500 blocks, if not found then return False.
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
    try:
        allcpu = db_connect.getCPU(producer)
    except:
        # New Guilds will not have any CPU scores, so set to 0
        allcpu = 0
    cpu_final = []
    for cpu in allcpu:
        cpu_final.append(cpu[0])
    try:
        avg_cpu = statistics.median(cpu_final) 
        return avg_cpu
    except:
        # New Guilds will not have any CPU scores, so set to 0
        return 0

   
def resultsGet(producer,check,pointsystem):
    return 0

# Looks at snapshot date as specified by OIG and if today is that day, create snapshot
# Also look at last snapshot date, if within 24 hours of last snapshot taken dont snapshot. That prevents if from taking multiple snapshots
def takeSnapshot(now):
    producers = db_connect.getProducers()
    # get snapshot timestamp as set by OIG
    snapshot_oig = db_connect.getSnapshotdate()
    # get date of last snapshot taken timestamp
    latest_snapshot_date = db_connect.getSnapshottakendate()
    # Access first element in tuple
    snapshot_oig_date = snapshot_oig[0][0]
    latest_snapshot_date = latest_snapshot_date[1][0]
    # Set now date
    now = now
    # Convert todays date to string to remove offset aware datetime issues 
    today = now.strftime("%m/%d/%Y")
    # Convert DB date to string to remove offset aware datetime issues
    snapshot_oig = snapshot_oig_date.strftime("%m/%d/%Y")
    latest_snapshot_date = latest_snapshot_date.strftime("%m/%d/%Y")
    # Convert them both back to datetime objects for comparison
    snapshot_oig = datetime.strptime(snapshot_oig, "%m/%d/%Y")
    latest_snapshot_date  = datetime.strptime(latest_snapshot_date , "%m/%d/%Y")
    today_date_object = datetime.strptime(today, "%m/%d/%Y")
    # If today is date of snapshot date set by OIG, then take snapshot
    if today_date_object == snapshot_oig:
        # But first check whether snapshot was already taken today
        if latest_snapshot_date == snapshot_oig:
            print("Snapshot was already taken today")
        else:
            print("snapshot will be taken today")
            # Set snapshot_date for all producers in DB.
            for producer in producers:
                producer = producer[0]
                db_connect.createSnapshot(snapshot_oig_date, producer, now)

    else:
        print("Not a snapshot day today")
    print("Last snapshot taken: ", latest_snapshot_date)
    print("OIG DB format date: ", snapshot_oig_date)
    print("OIG date: ", snapshot_oig)
    print("Today: ", today_date_object)
    print("Now: ", now)
    


## Final Results print output function to display results to console for each check
def printOuput(results,description):
    result = results[0]
    if result == True:
        colorstart = core.bcolors.OKGREEN
    else:
        colorstart = core.bcolors.WARNING
    return  print(description,colorstart,result,core.bcolors.ENDC)
    

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
        print(core.bcolors.OKBLUE,f"{'='*100}\nResults for ",producer,core.bcolors.ENDC)

        oracle_feed = delphiresults(producer,producersoracle)
        printOuput(oracle_feed,"Publishing feed data via an oracle service: ")

        api_node = check_api(producer,'apichk')
        printOuput(api_node,"API node endpoint is publicly available: ")
       
        http_check = check_api(producer,'httpchk')
        printOuput(http_check,"HTTP is available on RPC API endpoint: ")

        # Website, chains and wax.json checks
        website = [True, 'oops']
        printOuput( website,"Public website available: ")

        chains_json = [True, 'oops']
        printOuput(chains_json,"chains.json metadata available at regproducer url: ")

        wax_json = [True, 'oops']
        printOuput(wax_json,"wax.json metadata available at regproducer url: ")

        # CORS check
        cors_check = check_api(producer,'corschk')
        printOuput(cors_check,"CORS is configured on RPC API: ")

        # HTTPS check
        https_check = check_https(producer,'httpschk')
        printOuput(https_check,"HTTPS is available on RPC API endpoint: ")
   
        # TLS check
        tlscheck = check_https(producer,'tlschk')
        printOuput(tlscheck,"TLS version available on HTTPS API: ")

        # HTTP2 check
        http2_check = check_https(producer,'http2chk')
        printOuput(http2_check,"HTTP2 is enabled on RPC API endpoint: ")
        
        # Producer API check
        producer_apicheck = api_security(producer,'chain-api','producer_api')
        printOuput(producer_apicheck,"Producer API is disabled on visible nodes: ")

        # Net API check
        net_apicheck = api_security(producer,'chain-api','net_api')
        printOuput(net_apicheck,"net_api API is disabled on visible nodes: ")

        # DB size API check
        dbsize_apicheck = api_security(producer,'chain-api','db_size_api')
        printOuput(dbsize_apicheck,"db_size API is disabled on visible nodes:")
        
        #CPU checks
        cpu_time = cpuresults(producer,producercpu)
        print("CPU latency on EOS Mechanics below 2 ms on average:",core.bcolors.OKYELLOW, cpu_time,core.bcolors.ENDC,"ms")
        cpuavg = cpuAverage(producer)
        print("CPU latency average over 30days:",core.bcolors.OKYELLOW, cpuavg,core.bcolors.ENDC,"ms")
        
        # v1 History check
        full_history = check_full_node(producer,'history-v1')
        printOuput(full_history,"Running a v1 History node: ")

        # v2 Hyperion check
        hyperion_v2 = check_full_node(producer,'hyperion-v2')
        printOuput(hyperion_v2,"Running a v2 Hyperion node: ")

        # Set snapshots to False until we find a way
        snapshots = [False,'oops']

        seed_node = check_P2P(producer,'p2p_endpoint')
        printOuput(seed_node,"Running a seed node: ")

         # Get current UTC timestamp
        dt = datetime.utcnow()
        # Obtain points from list for each check
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
            'snapshots': snapshots[0],
            'seed_node': seed_node[0],
            'api_node': api_node[0],
            'oracle_feed': oracle_feed[0],
            'wax_json': wax_json[0],
            'chains_json': chains_json[0],
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
            snapshots[0], 
            seed_node[0], 
            seed_node[1], 
            api_node[0], 
            api_node[1], 
            oracle_feed[0], 
            oracle_feed[1], 
            wax_json[0], 
            chains_json[0], 
            cpu_time, 
            cpuavg, 
            dt
        ]
        score = pointsResults(pointslist,pointsystem)
        print("Final Tech points:",core.bcolors.OKGREEN,score,core.bcolors.ENDC)
        # Add final sore to list
        resultslist.append(score)
        # Turn list into tuple read for Postgres
        resultstuple = tuple(resultslist)
        finaltuple.append(resultstuple)
    return finaltuple



def main():
    # Get Todays date minus 1 minutes - see db_connect.createSnapshot for reasoning
    now = datetime.now() - timedelta(minutes=1)
    # Get list of producers
    print(core.bcolors.OKYELLOW,f"{'='*100}\nGetting list of producers on chain ",core.bcolors.ENDC)
    producers = producer_chain_list()
    # Update producers to DB
    db_connect.producerInsert(producers)
    # Add nodes to DB
    print(core.bcolors.OKYELLOW,f"{'='*100}\nGetting list of nodes from JSON files ",core.bcolors.ENDC)
    nodes = node_list()
    db_connect.nodesInsert(nodes)
    # Get all results and save to DB
    results = finalresults()
    db_connect.resultsInsert(results)
    # Take snapshot
    # takeSnapshot(now)


#print(check_full_node('amsterdamwax','hyperion-v2'))
if __name__ == "__main__":
   main()



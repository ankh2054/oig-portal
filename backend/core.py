import requests
import json
import time
import re
import random
import db_connect

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


bad_node_list = [ 'http://wax.eu.eosamsterdam.net' ]
# Exlude older versions?
# Obtain a reliable list of working hyperion nodes for V1 and V2 checks
def getFullnodes():
    print(bcolors.OKYELLOW,f"{'='*100}\nObtaining a reliable list of working Hyperion nodes ",bcolors.ENDC)
    nodes = db_connect.getFullnodes()
    hyperion_chk = '/v2/health'
    nodelist = []
    for node in nodes:
        node = node[0]
        try:
            URL = node+hyperion_chk
            response = requests.get(URL, timeout=5)
            response.raise_for_status()
        except Exception as err:
                continue
        # check wheteher 200 is returned
        if response.status_code == requests.codes.ok:
            responsetimes = response.elapsed.total_seconds()*1000
            jsonres = response.json()
            try:
                rpcstatus = jsonres.get('health')[1].get('status')
            except:
                continue
            if rpcstatus == 'OK' and responsetimes < 500 and node not in bad_node_list:
                nodes = {'Node': node, 'res': responsetimes }
                nodelist.append(nodes)
    return nodelist

# Get random node from list
def getrandomNode(nodelist):
    print(bcolors.OKYELLOW,f"{'='*100}\nChoosing random Hyperion node ",bcolors.ENDC)
    random_node = random.choice(nodelist)
    print(bcolors.OKYELLOW,"Random chosen node: ",random_node,bcolors.ENDC)
    return random_node.get('Node')

# https://testnet.waxsweden.org/v1/node/get_supported_apis
# Gives you a list of available APIs on a node

# Mainnet V2,V1 END POINT
nodelist = getFullnodes()
API_ENDPOINT2 = getrandomNode(nodelist)

# Testnet V2 END point
API_ENDPOINT2_TESTNET = 'https://testnet.waxsweden.org'

# Tesnet V1 end point
API_ENDPOINT_TESTNET = 'https://wax-testnet.dapplica.io'

# V2 API calls
GET_ACTIONS = '/v2/history/get_actions'
GET_TRX = '/v2/history/get_transaction'

# V1 EOSIO API CALLS
GET_INFO = '/v1/chain/get_info'
GET_TABLE_ROWS = '/v1/chain/get_table_rows'
GET_BLOCK_HEADER_STATE = '/v1/chain/get_block_header_state'
GET_ACCOUNTS_BY_AUTH = '/v1/chain/get_accounts_by_authorizers'
GET_ACCOUNT = '/v1/chain/get_account'
GET_BLOCK = '/v1/chain/get_block'



def headblock(type):
    # If testnet chain use different API
    if type == 'testnet':
        URL = API_ENDPOINT2_TESTNET + GET_INFO
    else:
        URL = API_ENDPOINT2 + GET_INFO
    try:
        response = requests.get(URL)
        response_json = json.loads(response.text)
        HEADBLOCK = response_json['head_block_num']
    except Exception as err:
        print(err, 'Node could not provide information failed trying a new node')
        if type == 'testnet':
            URL = API_ENDPOINT_TESTNET + GET_INFO
        else:
            # Obtain new random node from list
            NODE = getrandomNode(nodelist)
            URL = NODE + GET_INFO 
        response = requests.get(URL)
        response_json = json.loads(response.text)
        HEADBLOCK = response_json['head_block_num']
    return HEADBLOCK

# Only used for testnet
def getblock(block):
    try:
        URL = API_ENDPOINT2_TESTNET + GET_BLOCK
        response = requests.post(URL, json={"block_num_or_id": block})
        response_json = json.loads(response.text)
    except:
        URL = API_ENDPOINT_TESTNET + GET_BLOCK
        response = requests.post(URL, json={"block_num_or_id": block})
        response_json = json.loads(response.text)
    return response_json

def getEOStable(table_info):
    try:
        URL = API_ENDPOINT2 + GET_TABLE_ROWS
        response = requests.post(URL, json=table_info)
        response_json = json.loads(response.text)
        # Get table rows
        rows = response_json['rows']
    except Exception as err:
        print(err, 'Node could not provide information failed trying a new node')
        NODE = getrandomNode(nodelist)
        URL = NODE + GET_TABLE_ROWS
        response = requests.post(URL, json=table_info)
        response_json = json.loads(response.text)
        # Get table rows
        rows = response_json['rows']
    return rows

# Returns list of producers in top21
def producerSCHED():
    # Create Block header json payload
    BLOCK_HEADER_DATA = {"block_num_or_id": headblock("mainnet") } 
    # Get producer schedule using block info
    try:
        URL = API_ENDPOINT2 + GET_BLOCK_HEADER_STATE
        response = requests.post(URL, json=BLOCK_HEADER_DATA)
        response_json = json.loads(response.text)
        # Extract list of producer details
        producers = response_json['active_schedule']['producers']
    except Exception as err:
        print(err, 'Node could not provide information failed trying a new node')
        NODE = getrandomNode(nodelist)
        URL = NODE + GET_BLOCK_HEADER_STATE
        response = requests.post(URL, json=BLOCK_HEADER_DATA)
        response_json = json.loads(response.text)
        # Extract list of producer details
        producers = response_json['active_schedule']['producers']
    top21_producer_list = []
    for i in producers:
        top21_producer_list.append(i['producer_name'])
    return top21_producer_list

# Get all transaction numbers from latest block
def randomTransaction():
    # Generat random number 
    r1 = random.randint(0, 420)
    # Create Block header json payload
    curheadblock = headblock("mainnet")
    # block to test is headblock minus random number
    testblock = curheadblock-r1
    URL = API_ENDPOINT2 + GET_BLOCK
    try:
        response = requests.post(URL, json={"block_num_or_id": testblock})
        response_json = json.loads(response.text)
        transactions = response_json['transactions']
    except Exception as err:
        print(err, 'Node could not provide information failed trying a new node')
        NODE = getrandomNode(nodelist)
        URL = NODE + GET_BLOCK
        response = requests.post(URL, json={"block_num_or_id": testblock})
        response_json = json.loads(response.text)
        # Get all transactions
        transactions = response_json['transactions']
    # Extract all transaction IDs
    trxlist = []
    for trx in transactions:
        try:
            trx = trx['trx']['id']
        except:
            # return emtpy string
            trx = False
        trxlist.append(trx)
    return trxlist


def get_http_version(url,version):
    if version == "v1":
        info = "/v1/chain/get_info" 
    else:
        info = "/v2/health"
    response = requests.get(url+info, timeout=60, verify=False)
    return response.raw.version

# Python to curl request
def curl_request(url,method,headers,payloads):
    # construct the curl command from request
    command = "curl -v -H {headers} {data} -X {method} {uri}"
    data = "" 
    if payloads:
        payload_list = ['"{0}":"{1}"'.format(k,v) for k,v in payloads.items()]
        data = " -d '{" + ", ".join(payload_list) + "}'"
    header_list = ['"{0}: {1}"'.format(k, v) for k, v in headers.items()]
    header = " -H ".join(header_list)
    return command.format(method=method, headers=header, data=data, uri=url)

# Get actions OR transaction data from hyperion
def get_stuff(payload,chain,type):
    if chain == 'testnet':
        URL = API_ENDPOINT2_TESTNET 
    else:
        # Extract a random node
        URL = API_ENDPOINT2 
    if type == 'trx':
        CALL = GET_TRX
    else:
        CALL = GET_ACTIONS
    URL = URL + CALL
    try:
        response = requests.get(URL, params=payload)
        response_json = json.loads(response.text)
    except Exception as err:
        print(err, 'Node could not provide information failed trying a new node')
        if type == 'testnet':
            URL = API_ENDPOINT_TESTNET + CALL
        else:
            # Obtain new random node from list
            NODE = getrandomNode(nodelist)
            URL = NODE + CALL
        response = requests.get(URL, params=payload)
        response_json = json.loads(response.text)
    return response_json

#def get_actionsv2(payload,type):
#    if type == 'testnet':
#        URL = API_ENDPOINT2_TESTNET + GET_ACTIONS
#    else:
#        # Extract a random node
#        URL = API_ENDPOINT2 + GET_ACTIONS
#    try:
#        response = requests.get(URL, params=payload)
#    except Exception as err:
#        print(err, 'Node could not provide information failed trying a new node')
##        response_json = json.loads(response.text)
#        if type == 'testnet':
#            URL = API_ENDPOINT_TESTNET + GET_ACTIONS
#        else:
#            # Obtain new random node from list
#            NODE = getrandomNode(nodelist)
#            URL = NODE + GET_ACTIONS
#        response = requests.get(URL, params=payload)
#        response_json = json.loads(response.text)
#    return response_json

#def get_trxv2(payload,type):
#    # If testnet chain use different API
#    if type == 'testnet':
#        URL = API_ENDPOINT2_TESTNET + GET_TRX
#    else:
#        URL = API_ENDPOINT2 + GET_TRX
#    try:
#        response = requests.get(URL, params=payload)
#        response_json = json.loads(response.text)
#    except Exception as err:
#        print(err, 'Node could not provide information failed trying a new node')
#        if type == 'testnet':
#            URL = API_ENDPOINT_TESTNET + GET_TRX
#        else:
#            # Obtain new random node from list
#            NODE = getrandomNode(nodelist)
#            URL = NODE + GET_TRX
#        response = requests.get(URL, params=payload)
#        response_json = json.loads(response.text)
#    return response_json
    

def portRegex(inputString):
    # Checks whether a URL contains a port number
    return bool(re.search(":([0-9]+)", inputString))

# Splits host from port 
def split_host_port(string):
    if not string.rsplit(':', 1)[-1].isdigit():
        return (string, None)
    # Split string into a list, maxspit 1
    string = string.rsplit(':', 1)
    host = string[0]  # 1st index is always host
    port = int(string[1])
    return (host, port)

# Performs a get info and looks for producer name, if found returns head_block num.
def get_testnetproducer_cpustats(producer):
    # Get current headblock from testnet
    current_headblock = headblock("testnet")
    # Set producer to random name
    blockproducer = "nobody"
    transactions = []
    amount = 0 
    while producer != blockproducer or len(transactions) == 0:
        currentblock = getblock(current_headblock)
        transactions = currentblock['transactions']
        # Set producer of current block
        blockproducer = currentblock['producer']
        # Deduct 1 from current block to check next block
        current_headblock = current_headblock - 1
        # Only go back 4000 Blocks
        amount = amount + 1
        if amount == 400:
            return None
    else:
        return currentblock['transactions'][0]['cpu_usage_us']








import requests
import json
import time
import re
import random
import db_connect
import core


# API calls Class
class Api_Calls:
    def __init__(self, version, call):
        # V2 or V1 history
        if version == 'v2':
            self.url = '/v2/history/'
        elif version == 'v1':
            self.url = '/v1/chain/'
        elif version == 'v2health':
            self.url = '/v2/'
        self.version = version
        self.call = call
        
    # Class function - Return the URL by default
    def __str__(self):
        return f'{self.url}{self.call}'
## Example
#get_info = str(Api_Calls('v1', 'get_info') -  returns /v1/chain/get_info




bad_node_list = [ 'http://wax.eu.eosamsterdam.net','https://api.wax.greeneosio.com' ]
# Obtain a reliable list of working hyperion nodes for V1 and V2 checks
def getFullnodes():
    print(core.bcolors.OKYELLOW,f"{'='*100}\nObtaining a reliable list of working Hyperion nodes ",core.bcolors.ENDC)
    nodes = db_connect.getFullnodes()
    if not nodes:
        # If no nodes in DB, return single node
        nodelist = [{'Node': 'https://wax.eosrio.io'}]
    #Else get all healthy hyperion nodes
    else:
        api_url = str(Api_Calls('v2health', 'health'))
        #api_url = api_url.apiurl()
        nodelist = []
        for node in nodes:
            node = node[0]
            try:
                URL = node + api_url
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
                # Filter out nodes that do not respond, ms is higher than 500 and in bad node list
                if rpcstatus == 'OK' and responsetimes < 500 and node not in bad_node_list:
                    nodes = {'Node': node, 'res': responsetimes }
                    nodelist.append(nodes)
    return nodelist

# Get random node from list
def getrandomNode(nodelist):
    print(core.bcolors.OKYELLOW,f"{'='*100}\nChoosing random Hyperion node ",core.bcolors.ENDC)
    random_node = random.choice(nodelist)
    print(core.bcolors.OKYELLOW,"Random chosen node: ",random_node,core.bcolors.ENDC)
    return random_node.get('Node')

# https://testnet.waxsweden.org/v1/node/get_supported_apis
# Gives you a list of available APIs on a node

# Mainnet V2,V1 END POINT
nodelist = getFullnodes()
#hyperion_Node = getrandomNode(nodelist)
hyperion_Node = 'https://hyperion.sentnl.io'

# Testnet V2 END point
API_ENDPOINT2_TESTNET = 'https://testnet.waxsweden.org'

# Tesnet V1 end point
API_ENDPOINT_TESTNET = 'https://wax-testnet.dapplica.io'



def hyperionindexedBlocks(host):
    try:
        url = host + '/v2/health'
        response = requests.get(url, verify=False)
        jsonres = response.json()
    except:
        return False, 'Could not connect to Hyperion'
    health_info = jsonres.get('health')
    service_data = health_info[2]['service_data']
    last_indexed = int(service_data['last_indexed_block'])
    total_indexed = int(service_data['total_indexed_blocks'])
    # Check if total index is between total_index-10 and last_index+1, as they wont always exactly match.
    if last_indexed in range(last_indexed-10, total_indexed+1):
        return True, 'Hyperion Total blocks matches last indexed'
    else:
        return False, 'Hyperion last indexed does not match total indexed with range of 10'


def headblock(type):
    # Build URL from Api_call class
    api_url = str(Api_Calls('v1', 'get_info'))
    # If testnet chain use different API
    if type == 'testnet':
        URL = API_ENDPOINT2_TESTNET + api_url
    else:
        URL = hyperion_Node + api_url
    try:
        response = requests.get(URL)
        response_json = json.loads(response.text)
        HEADBLOCK = response_json['head_block_num']
    except Exception as err:
        print(err, 'Node could not provide information failed trying a new node')
        if type == 'testnet':
            URL = API_ENDPOINT_TESTNET + api_url
        else:
            # Obtain new random node from list
            NODE = getrandomNode(nodelist)
            URL = NODE  + api_url 
        response = requests.get(URL)
        response_json = json.loads(response.text)
        HEADBLOCK = response_json['head_block_num']
    return HEADBLOCK

# Only used for testnet
def getblock(block):
    # Build URL from Api_call class
    api_url = str(Api_Calls('v1', 'get_block'))
    try:
        URL = API_ENDPOINT2_TESTNET + api_url
        response = requests.post(URL, json={"block_num_or_id": block})
        response_json = json.loads(response.text)
    except:
        URL = API_ENDPOINT_TESTNET + api_url
        response = requests.post(URL, json={"block_num_or_id": block})
        response_json = json.loads(response.text)
    return response_json

def getEOStable(table_info):
    # Build URL from Api_call class
    api_url = str(Api_Calls('v1', 'get_table_rows'))
    try:
        URL = hyperion_Node + api_url
        response = requests.post(URL, json=table_info)
        response_json = json.loads(response.text)
        # Get table rows
        rows = response_json['rows']
    except Exception as err:
        print(err, 'Node could not provide information failed trying a new node')
        NODE = getrandomNode(nodelist)
        URL = NODE  + api_url
        response = requests.post(URL, json=table_info)
        response_json = json.loads(response.text)
        # Get table rows
        rows = response_json['rows']
    return rows

# Returns list of producers in top21
def producerSCHED():
    # Build URL from Api_call class
    api_url = str(Api_Calls('v1', 'get_block_header_state'))
    # Create Block header json payload
    BLOCK_HEADER_DATA = {"block_num_or_id": headblock("mainnet") } 
    # Get producer schedule using block info
    try:
        URL = hyperion_Node + api_url 
        response = requests.post(URL, json=BLOCK_HEADER_DATA)
        response_json = json.loads(response.text)
        # Extract list of producer details
        producers = response_json['active_schedule']['producers']
    except Exception as err:
        print(err, 'Node could not provide information failed trying a new node')
        NODE = getrandomNode(nodelist)
        URL = NODE + api_url 
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
    api_url = str(Api_Calls('v1', 'get_block'))
    # Generat random number 
    r1 = random.randint(0, 420)
    # Create Block header json payload
    curheadblock = headblock("mainnet")
    # block to test is headblock minus random number
    testblock = curheadblock-r1
    URL = hyperion_Node + api_url
    try:
        response = requests.post(URL, json={"block_num_or_id": testblock})
        response_json = json.loads(response.text)
        transactions = response_json['transactions']
    except Exception as err:
        print(err, 'Node could not provide information failed trying a new node')
        NODE = getrandomNode(nodelist)
        URL = NODE + api_url
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


# Get actions OR transaction data from hyperion
def get_stuff(payload,chain,type):
    if chain == 'testnet':
        URL = API_ENDPOINT2_TESTNET 
    else:
        # Extract a random node
        URL = hyperion_Node 
    # get transaction from Hyperion node
    if type == 'trx':
        api_url = str(Api_Calls('v2', 'get_transaction'))
    # get action from Hyperion node
    else:
        api_url = str(Api_Calls('v2', 'get_actions'))
    URL = URL + api_url
    try:
        response = requests.get(URL, params=payload)
        response_json = json.loads(response.text)
    except Exception as err:
        print(err, 'Node could not provide information failed trying a new node')
        if type == 'testnet':
            URL = API_ENDPOINT_TESTNET + api_url
        else:
            # Obtain new random node from list
            NODE = getrandomNode(nodelist)
            URL = NODE + api_url
        response = requests.get(URL, params=payload)
        response_json = json.loads(response.text)
    return response_json


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
        if amount == 500:
            return None
    else:
        return currentblock['transactions'][0]['cpu_usage_us']








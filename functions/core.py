import requests
import json
import time
import re

# V1 END POINT
API_ENDPOINT = 'http://wax.eosn.io'

# Mainnet V2 END POINT
#API_ENDPOINT2 = 'https://api.waxsweden.org'
API_ENDPOINT2 = 'https://wax.eosrio.io'


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

# CREATE URL CALLS
URL_INFO = API_ENDPOINT + GET_INFO
URL_INFO_TEST = API_ENDPOINT_TESTNET + GET_INFO
BLOCK_INFO_TESTNET = API_ENDPOINT_TESTNET + GET_BLOCK
TABLE_INFO_URL = API_ENDPOINT + GET_TABLE_ROWS 
HEADER_STATE = API_ENDPOINT + GET_BLOCK_HEADER_STATE 
ACCOUNT = API_ENDPOINT + GET_ACCOUNT
GET_ACTIONSv2 = API_ENDPOINT2 + GET_ACTIONS
GET_TRXv2 = API_ENDPOINT2 + GET_TRX
GET_TRXv2_TESTNET = API_ENDPOINT2_TESTNET  + GET_TRX
GET_ACTIONSv2_TESTNET = API_ENDPOINT2_TESTNET + GET_ACTIONS


def headblock(type):
    # If testnet chain use different API
    if type == 'testnet':
        URL = URL_INFO_TEST
    else:
        URL = URL_INFO
    BLOCK_INFO = requests.post(url=URL)
    BLOCK_INFO_JSON = json.loads(BLOCK_INFO.text)
    HEADBLOCK = BLOCK_INFO_JSON['head_block_num']
    return HEADBLOCK

def getblock(block):
    BLOCK_INFOS = requests.post(url=BLOCK_INFO_TESTNET, json={"block_num_or_id": block})
    BLOCK_INFO_JSON = json.loads(BLOCK_INFOS.text)
    return BLOCK_INFO_JSON

def getEOStable(table_info):
    TABLE_INFO = requests.post(url=TABLE_INFO_URL, json=table_info)
    TABLE_INFO_JSON = json.loads(TABLE_INFO.text)
    return TABLE_INFO_JSON['rows']

# Returns list of producers in top21
def producerSCHED():
    # Create Block header json payload
    BLOCK_HEADER_DATA = {"block_num_or_id": headblock("mainnet") } 
    # 2 Get producer schedule using block info
    PRODUCER_SCHED = requests.post(url=HEADER_STATE, json=BLOCK_HEADER_DATA)
    PRODUCER_SCHED_JSON = json.loads(PRODUCER_SCHED.text)
    # Now extract all producer names
    #print (json.dumps(PRODUCER_SCHED_JSON, indent=2))
    # Extract list of producer details
    producers = PRODUCER_SCHED_JSON['active_schedule']['producers']
    # For each producer extract producer_name
    top21_producer_list = []
    for i in producers:
        top21_producer_list.append(i['producer_name'])
    return top21_producer_list


def get_http_version(url,version):
    if version == "v1":
        info = "/v1/chain/get_info" 
    else:
        info = "/v2/health"
    response = requests.get(url+info, timeout=60, verify=False)
    return response.raw.version


def get_actionsv2(payload,type):
    if type == 'testnet':
        URL = GET_ACTIONSv2_TESTNET
    else:
        URL = GET_ACTIONSv2
    response = requests.get(URL, params=payload)
    response_json = json.loads(response.text)
    return response_json

def get_trxv2(payload,type):
    # If testnet chain use different API
    if type == 'test':
        URL = GET_TRXv2_TESTNET
    else:
        URL = GET_TRXv2
    response = requests.get(URL, params=payload)
    response_json = json.loads(response.text)
    return response_json
    

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
        if amount == 100:
            return None
    else:
        return currentblock['transactions'][0]['cpu_usage_us']


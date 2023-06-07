import requests
import json
import time
#import re
import random
import db_connect
import utils.core as core
import utils.decorators as decorators
import config.backendconfig as cfg


# Hyperion Endpoints
HyperionNodeMainnet1 = cfg.nodes["hyperionmainnet1"]
HyperionNodeMainnet2 = cfg.nodes["hyperionmainnet2"] 
HyperionNodeTesnet = cfg.nodes["hyperiontestnet"] #'https://testnet.waxsweden.org'
bad_node_list = [ 'http://wax.eu.eosamsterdam.net','https://api.wax.greeneosio.com' ]


headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'curl/7.77.0'
    }

s = requests.Session()
s.headers.update(headers)


# API calls Class
class Api_Calls:
    def __init__(self, version, call):
        self.version = version
        self.call = call
        # V2 or V1 history or Atomic assets
        URL_MAP = {
            'v2-history': '/v2/history/',
            'v1': '/v1/chain/',
            'v1-history': '/v1/history/',
            'v2': '/v2/',
            'atomic': '/atomicassets/v1/',
            'producer': '/v1/producer/',
            'db_size': '/v1/db_size/get',
            'net': '/v1/net/',
            '/v2/history/get_transaction': '/v2/history/get_transaction?'
        }

        self.url = URL_MAP.get(version, '/') # / is the value to return if the specified key does not exist.
        
    # Class function - Return the URL by default
    def __str__(self):
        return f'{self.url}{self.call}'
## Example
#get_info = str(Api_Calls('v1', 'get_info') -  returns /v1/chain/get_info




def chainType(chain,api_url=''):
    if chain == 'testnet':
        URL = HyperionNodeTesnet + api_url
        net = True
    else:
        URL = HyperionNodeMainnet1 + api_url
        net = False
    return {'URL':URL,'chain':chain,'net':net}


class getJSON():
    def __init__(self,testType,chain,api_url):
        self.testType = testType
        self.chain = chain
        self.api_url = api_url

   

    ### Internal callable class functions ###

     # Get random node for testnet or mainnet
    def getRandomNode(self,err):
            if self.chain == 'testnet':
                self.url = getrandomNode(TestNodes) + self.api_url 
            elif self.chain == 'mainnet':
                self.url = getrandomNode(MainNodes) + self.api_url 
            # if testing single guild we don't want to try a random node, hence url = url
            else: 
                self.url = self.url
            print(f'Error: {err}. Node could not {self.testType}, trying a new node {self.url}')
            return self.url

    def getPostData(self,url,payload):
            self.response  = requests.post(url,json=payload,timeout=20)
            self.response_json = json.loads(self.response.text)
            return self.response_json
            
    def getData(self,url,retValue,payload):
            self.response  = requests.get(url,params=payload,timeout=20)
            self.response_json = json.loads(self.response.text)
            self.json = self.response_json[retValue]
            return self.json
    
    def getDataSimple(self,url,payload):
            self.response  = requests.get(url,params=payload,timeout=60)
            self.response_json = json.loads(self.response.text)
            return self.response_json

    ### External callable class functions ####
    def reqPost(self,url,payload,retValue,retCount):
        self.retValue = retValue
        self.payload = payload
        self.retCount = retCount

        # Internal function to this function
        def retCount(retCount,response_json):
            # If retValue is 1 or 2, this is passed in when reqPost func is called
            if retCount == 1:
                json = response_json[retValue]
            elif retCount == 2:
                json = response_json[retValue[0]][retValue[1]]
            return json

        try:
            self.response_json = self.getPostData(url,payload)
        except Exception as err:
            url = self.getRandomNode(err)
            self.response_json = self.getPostData(url,payload)
        # Try accessing the dict key
        try:
            self.json = retCount(self.retCount,self.response_json)
        # Handle accessing dict key
        except KeyError as err:
            url = self.getRandomNode(err)
            self.response_json = self.getPostData(url,payload)
            self.json = retCount(self.retCount,self.response_json)
        return self.json
    
    def reqPostSimple(self,url,payload=None):
        try:
            self.response_json = self.getPostData(url,payload)
        except Exception as err:
            url = self.getRandomNode(err)
            self.response_json = self.getPostData(url,payload)
        return self.response_json

    def reqGet(self,url,retValue,payload=None):
        try:
            self.json = self.getData(url,retValue,payload)
        except Exception as err:
            url = self.getRandomNode(err)
            self.json = self.getData(url,retValue,payload)
        return self.json

    def reqGetSimple(self,url,payload=None):
        try:
            self.response_json = self.getDataSimple(url,payload)
        except Exception as err:
            url = self.getRandomNode(err)
            self.response_json = self.getDataSimple(url,payload)
        return self.response_json

    
 
# Obtain a reliable list of working hyperion nodes for V1 and V2 checks
def getFullnodes(testnet=False):
    if testnet:
        results = chainType('testnet')
    else:
        results = chainType('mainnet')
    print(core.bcolors.OKYELLOW,f"{'='*100}\nObtaining a reliable list of working Hyperion {results['chain']} nodes ",core.bcolors.ENDC)
    nodes = db_connect.getFullnodes(results['net'])
    if not nodes:
        # If no nodes in DB, return single node
        nodelist = [{'Node': HyperionNodeMainnet1}]
    #Else get all healthy hyperion nodes
    else:
        api_url = str(Api_Calls('v2', 'health'))
        nodelist = []
        for node in nodes:
            node = node[0]
            try:
                URL = node + api_url
                response = requests.get(URL, timeout=5)
                response.raise_for_status()
            except Exception as err:
                    continue
            # check whether 200 is returned
            if response.status_code == requests.codes.ok:
                responsetimes = response.elapsed.total_seconds()*1000
                try:
                    jsonres = response.json()
                    rpcstatus = jsonres.get('health')[1].get('status')
                except:
                    continue
                # Filter out nodes that do not respond, ms is higher than 500 and in bad node list
                if rpcstatus == 'OK' and responsetimes < 500 and node not in bad_node_list:
                    nodes = {'Node': node, 'res': responsetimes }
                    nodelist.append(nodes)
    return nodelist

#hyperion_Node = getrandomNode(nodelist)
MainNodes = getFullnodes()
TestNodes = getFullnodes(testnet=True)


# Get random node from list
def getrandomNode(nodelist):
    print(core.bcolors.OKYELLOW,f"{'='*100}\nChoosing random Hyperion node ",core.bcolors.ENDC)
    random_node = random.choice(nodelist)
    print(core.bcolors.OKYELLOW,"Random chosen node: ",random_node,core.bcolors.ENDC)
    return random_node.get('Node')


def hyperionindexedBlocks(host):
    try:
        url = host + str(Api_Calls('v2', 'health'))
        print(url)
        response = s.get(url, verify=False, timeout=15)
        jsonres = response.json()
        health_info = jsonres.get('health')
        response.raise_for_status()  # Raises an HTTPError if the status is 4xx, 5xx
    except requests.ConnectionError as e:
        # Handling connection related errors
        return False, str(e)
    except requests.HTTPError as e:
        # Handling HTTP error responses from the server
        return False, f'{response.reason} error code: {response.status_code}'
    except ValueError:
        # Handling JSON decoding errors
        return False, 'Invalid JSON response'
    try:
        service_data = health_info[2]['service_data']
    except:
        return False, 'Hyperion last indexed does not match total indexed with range of 10'
    try:
        last_indexed = int(service_data['last_indexed_block'])
        total_indexed = int(service_data['total_indexed_blocks'])
    except:
        return False, 'Hyperion last indexed does not match total indexed with range of 10'
    try:
        first_indexed_block = int(service_data['first_indexed_block'])
        print(f' First indexed: {first_indexed_block}')
        missing_blocks = int(service_data['missing_blocks'])
        print(f' Missing blocks: {missing_blocks}')
        #if last_indexed-first_indexed_block in range(last_indexed-10, total_indexed+1):
        if missing_blocks > 5:
            return False, f'Hyperion last indexed does not match total indexed, missing blocks {missing_blocks}'
        else:
            return True, f'Hyperion Total blocks matches last indexed, missing blocks {missing_blocks}' 
    except:
        # We pass since not all hyperions will have this.
       pass
    
    #Check if total index is between total_index-10 and last_index+1, as they wont always exactly match.
    if last_indexed in range(last_indexed-10, total_indexed+1):
        return True, 'Hyperion Total blocks matches last indexed'
    else:
        return False, 'Hyperion last indexed does not match total indexed with range of 10'


def headblock(chain):
    testType = 'get Headblock'
    api_url = str(Api_Calls('v1', 'get_info'))
    URL = chainType(chain,api_url)['URL']
    reqJSON = getJSON(testType,chain,api_url)
    return reqJSON.reqGet(URL,'head_block_num')

# Only used for testnet
def getblockTestnet(block):
    testType = 'get block from testnet'
    # Build URL from Api_call class
    api_url = str(Api_Calls('v1', 'get_block'))
    URL = HyperionNodeTesnet + api_url
    reqJSON = getJSON(testType,'testnet',api_url)
    return reqJSON.reqPostSimple(URL,{"block_num_or_id": block})


def getEOStable(table_info,chain='mainnet'):
    testType = 'Get table'
    api_url = str(Api_Calls('v1', 'get_table_rows'))
    URL = chainType(chain,api_url)['URL'] 
    reqJSON = getJSON(testType,chain,api_url)
    return reqJSON.reqPost(URL,table_info,'rows',1)

# Returns list of producers in top21
def producerSCHED(chain='mainnet'):
    testType = 'get Producer Schedule'
    # Build URL from Api_call class
    api_url = str(Api_Calls('v1', 'get_block_header_state'))
    URL = chainType(chain,api_url)['URL'] 
    reqJSON = getJSON(testType,chain,api_url)
    producers =  reqJSON.reqPost(URL,{"block_num_or_id": headblock("mainnet") } ,('active_schedule','producers'),2)
    top21_producer_list = []
    for i in producers:
        top21_producer_list.append(i['producer_name'])
    return top21_producer_list


# Get all transaction numbers from a block
def randomTransaction(backtrack,chain):
    testType = 'get Random transaction'
    api_url = str(Api_Calls('v1', 'get_block'))
    curheadblock = headblock(chain)
    URL = chainType(chain,api_url)['URL'] 
    testblock = curheadblock-backtrack
    reqJSON = getJSON(testType,chain,api_url)
    transactions =  reqJSON.reqPost(URL,{"block_num_or_id": testblock} ,'transactions',1)
    # Extract all transaction IDs
    trxlist = []
    for trx in transactions:
        try:
            trx = trx['trx']['id']
        except:
            # If not trx ix found set to False
            trx = False
        # Only add transaction to list if not false
        if trx != False:
            trxlist.append(trx)
    return trxlist

# Get random TRX from chain
def get_random_trx(backtrack,chain):
    trxlist = []
    transactions = randomTransaction(backtrack,chain)
    # if transaction list is empty sleep for 1 second
    while not transactions:
        time.sleep(1)
        transactions = randomTransaction(backtrack,chain)
    trx = transactions[0]
    try:
        trx2 = transactions[1]
    except:
        trx2 = trx
    trxlist.append(trx)
    trxlist.append(trx2)
    return trxlist 


def get_http_version(url,version):
    if version == "v1":
        info = str(Api_Calls('v1', 'get_info')) 
    else:
        info = str(Api_Calls('v2', 'health'))
    url = url + info
    response = requests.get(url+info, timeout=60, verify=False)
    return response.raw.version

# Get actions OR transaction data from hyperion. When chain = Guild, random node will not be chosen
def get_stuff(apiNode,payload,type,chain='guild'):
    testType = f'get {type} from Hyperion'
    # get transaction from Hyperion node
    if type == 'trx':
        api_url = str(Api_Calls('v2-history', 'get_transaction'))
    # get action from Hyperion node
    else:
        api_url = str(Api_Calls('v2-history', 'get_actions'))
    URL = apiNode + api_url
    reqJSON = getJSON(testType,chain,api_url)
    return reqJSON.reqGetSimple(URL,payload)

# Performs a get info and looks for producer name, if found returns head_block num.
def get_testnetproducer_cpustats(producer):
    # Get current headblock from testnet
    current_headblock = headblock("testnet")
    print(f'Producer from DB {producer}')
    # Set producer to random name
    blockproducer = "nobody"
    transactions = []
    amount = 0 
    print(producer)
    while producer != blockproducer or len(transactions) == 0:
        try:
            currentblock = getblockTestnet(current_headblock)
            transactions = currentblock['transactions']
        except:
            continue
        # Set producer of current block
        blockproducer = currentblock['producer']
        if producer == blockproducer:
            print(f'Producer match: {blockproducer}, but transactions count is {len(transactions)} ')
        # Deduct 1 from current block to check next block
        current_headblock = current_headblock - 1
        # Only go back 500 Blocks
        amount = amount + 1
        if amount == 500:
            return None
    else:
        return currentblock['transactions'][0]['cpu_usage_us']
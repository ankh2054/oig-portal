import core
import eosio
import requests
import time
from datetime import datetime
from requests.exceptions import HTTPError
import urllib3
import config.backendconfig as cfg



# Passes into requests auth param, so each request adds time.sleep(1)

def auth_provider(req):
    global requests_count
    requests_count += 1
    req.headers['X-Seq-Count'] = requests_count
    print('requests_count:', requests_count)
    time.sleep(1)
    return req

# Disable SSL warnings
urllib3.disable_warnings()

# Default timeout for connections
defaulttimeout = (3, 20)

# Better JSON errors
try:
    from simplejson.errors import JSONDecodeError
except ImportError:
    from json.decoder import JSONDecodeError


# Load Settings from config
chain_id = cfg.chain["chainid"]


##  Built request session
# Headers for curl request creator for get requests
headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'curl/7.77.0'
    }

# For service check sessions
s = requests.Session()
requests_count = 0
s.auth = auth_provider
s.headers.update(headers)

# for initial requests
r = requests.Session()
requests_count = 0
r.headers.update(headers)


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


def get_base_json_dict(collection_name):
    json_dict = {
        'collection_name': collection_name,
        'page': 1,
        'limit': 1,
        'order': 'desc',
        'sort': 'created'
    }
    return json_dict

def get_atomic_templates(collection_name):
    json_dict = get_base_json_dict(collection_name)
    json_dict['has_assets'] = 'true'
    return json_dict

def get_atomic_schemas(collection_name):
    return get_base_json_dict(collection_name)

def get_atomic_asset():
    json_dict = get_base_json_dict(None)
    json_dict['sort'] = 'asset_id'
    return json_dict


    #https://test.wax.api.atomicassets.io/atomicassets/v1/templates?collection_name=kogsofficial&has_assets=true&page=1&limit=1&order=desc&sort=created
    #https://test.wax.api.atomicassets.io/atomicassets/v1/schemas?collection_name=kogsofficial&page=1&limit=1&order=desc&sort=created
    #https://test.wax.api.atomicassets.io/atomicassets/v1/assets?page=1&limit=1&order=desc&sort=asset_id

def concatenate(**kwargs):
    result = ""
    # Iterating over the keys of the Python kwargs dictionary
    for arg in kwargs:
        result += arg
    return result


mainnet_id = '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4'
testnet_id = 'f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12'
# Default metasnapshot_date 
metasnapshot_date  = datetime.strptime('1980-01-01', "%Y-%d-%m")
sentnlNode = eosio.HyperionNodeMainnet

class getJSON():
    def __init__(self):
        self.defaulttimeout = (3, 7)
        self.headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'curl/7.77.0'
            }
    
    def tryContinue(self,err,trydo='continue'):
         self.trydo = trydo
         self.err = err
         if self.trydo == 'continue':
            while True:
                if err:
                    break
                else:
                    continue
         elif self.trydo == 'return':
            return False, self.err

    def getRequest(self,url,trydo='continue',payload=None):
        self.trydo = trydo
        try:
            self.curlreq = core.curl_request(url,'GET',False)
            self.response = requests.get(url, payload,timeout=self.defaulttimeout, verify=False, headers=self.headers)
            self.responsetimes = self.response.elapsed.total_seconds()*1000
        except TimeoutError as err:
            print(f'Timeout error occurred: {err}')
            self.tryContinue(err,trydo)
        except HTTPError as err:
            if self.response.status_code == 500:
                try:
                    self.jsonres = self.response.json()
                except Exception as err:
                    err = f'JSON response: {self.jsonres}.\n Error:{err}'
                    self.tryContinue(err,trydo)
                self.tryContinue(err,trydo)
            elif self.response.status_code == 404:
                err = f'{self.curlreq}\n Error: File not found: {err}'
                self.tryContinue(err,trydo)
            elif self.response.status_code == 502:
                err = f'{self.curlreq}\n Error: Bad Gateway server: {err}'
                self.tryContinue(err,trydo)
            else:
                err = f'{self.curlreq}\n {err}'
                self.tryContinue(err,trydo)
        except JSONDecodeError as err:
                print(f'JSON parsing error: {err}')
                self.tryContinue(err,trydo)
        except Exception as err:
                print(f'Other error occurred: {err}')  
                self.tryContinue(err,trydo)
        else:
            return self.response

    def getJson(self,url,response,jsonfield,trydo='continue'):
        self.response = response
        self.jsonfield = jsonfield
        self.trydo = trydo
        try:
            self.curlreq = core.curl_request(url,'GET',False)
            self.jsonres = self.response.json()
            self.jsonReturn = self.jsonres[self.jsonfield]
        except JSONDecodeError as err:
                print(f'JSON parsing error: {err}')
                self.tryContinue(err,trydo)
        except HTTPError as err:
            if self.response.status_code == 500:
                try:
                    self.jsonres = self.response.json()
                except Exception as err:
                    err = f'JSON response: {self.jsonres}.\n Error:{err}'
                    self.tryContinue(err,trydo)
                self.tryContinue(err,trydo)
            elif self.response.status_code == 404:
                err = f'{self.curlreq}\n Error: File not found: {err}'
                self.tryContinue(err,trydo)
            else:
                err = f'{self.curlreq}\n {err}'
                self.tryContinue(err,trydo) 
        except Exception as err:
                print(f'Other error occurred: {err}')  
                self.tryContinue(err,trydo)
        else:
            return self.jsonReturn

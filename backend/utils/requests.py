import utils.core as core
#import eosio
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



mainnet_id = cfg.chain["mainnet_chainid"]
testnet_id = cfg.chain["testnet_chainid"]
# Default metasnapshot_date 
metasnapshot_date  = datetime.strptime('1980-01-01', "%Y-%d-%m")



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
def get_table_data(code,table,scope,limit,reverse=False):
    table_dict = {
        "code": code,
        "table": table,
        "scope": scope,
        "json": "true",
        "limit": limit,
        "lower_bound": "0",
        "reverse": reverse
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


def concatenate(**kwargs):
    result = ""
    # Iterating over the keys of the Python kwargs dictionary
    for arg in kwargs:
        result += arg
    return result




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

    def getRequest(self,url,trydo='continue',payload=None,post=False):
        self.trydo = trydo
        try:
            self.curlreq = core.curl_request(url,'GET',False)
            if post:
                self.response = requests.post(url, payload,timeout=self.defaulttimeout, verify=False, headers=self.headers)
            else:
                self.response = requests.get(url, payload,timeout=self.defaulttimeout, verify=False, headers=self.headers)
            self.responsetimes = self.response.elapsed.total_seconds()*1000
        except TimeoutError as err:
            print(f'Timeout error occurred: {err}')
            return self.tryContinue(err,trydo)
        except HTTPError as err:
            if self.response.status_code == 500:
                try:
                    self.jsonres = self.response.json()
                except Exception as err:
                    err = f'JSON response: {self.jsonres}.\n Error:{err}'
                    return self.tryContinue(err,trydo)
                return self.tryContinue(err,trydo)
            elif self.response.status_code == 404:
                err = f'{self.curlreq}\n Error: File not found: {err}'
                return self.tryContinue(err,trydo)
            elif self.response.status_code == 502:
                err = f'{self.curlreq}\n Error: Bad Gateway server: {err}'
                return self.tryContinue(err,trydo)
            else:
                err = f'{self.curlreq}\n {err}'
                return self.tryContinue(err,trydo)
        except JSONDecodeError as err:
                print(f'JSON parsing error: {err}')
                return self.tryContinue(err,trydo)
        except Exception as err:
                print(f'Other error occurred: {err}')  
                return self.tryContinue(err,trydo)
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
                return self.tryContinue(err,trydo)
        except HTTPError as err:
            if self.response.status_code == 500:
                try:
                    self.jsonres = self.response.json()
                except Exception as err:
                    err = f'JSON response: {self.jsonres}.\n Error:{err}'
                    return self.tryContinue(err,trydo)
                return self.tryContinue(err,trydo)
            elif self.response.status_code == 404:
                err = f'{self.curlreq}\n Error: File not found: {err}'
                return self.tryContinue(err,trydo)
            else:
                err = f'{self.curlreq}\n {err}'
                return self.tryContinue(err,trydo) 
        except Exception as err:
                print(f'Other error occurred: {err}')  
                return self.tryContinue(err,trydo)
        else:
            return self.jsonReturn

import utils.core as core
import utils.requests as requests
import utils.eosio as eosio
import db_connect
#import humanize
import dateutil.parser
from datetime import datetime
import requests as requests2
import services.Messages as messages

def check_recent_transaction(api,trx):
     payload = dict(id=trx[0])
     try:
            response = eosio.get_stuff(api,payload,'trx')
            trxExecuted = response['executed']
            trx_id = response['trx_id']
            #msg = f"Not enough data to count as running Full Hyperion. Hyperion is missing transaction: {trx_id}. HTML Response {response}"
     except Exception as err:
        return False, messages.TIMEOUT_ERROR(api)
     if trxExecuted:
        return True,  messages.FULL_HYPERION(True)
     else:
        return False, messages.FULL_HYPERION(False,trx_id,response)


def check_hyperion(producer,feature,recentfulltrx,fulltrx,partialtest=False,testnet=False):
    print("\n=== Starting check_hyperion ===")
    print(f"Producer: {producer}")
    print(f"Feature: {feature}")
    print(f"Partial test: {partialtest}")
    print(f"Testnet: {testnet}")
    
    ### Check Hyperion exists in DB 
    try:
        node_details = db_connect.getQueryNodes(producer,feature,'api',testnet)
        historyfull = node_details[1]
        api = node_details[0]
        print(f"Node details - API: {api}, History Full: {historyfull}")
    except Exception as e:
        print(f"Failed to get node details: {e}")
        return False, messages.NOT_IN_JSON(feature)

    #  Check Hyperion last indexed equals total indexed blocks
    print("\n=== Checking hyperion indexed blocks ===")
    hyperionresult = eosio.hyperionindexedBlocks(api)
    print(f"Hyperion result: {hyperionresult}")
    if hyperionresult[0] == False:
        return False, hyperionresult[1]
    
    if testnet:
        chain = 'testnet'
    else:
        chain = 'mainnet'
    print(f"Chain type: {chain}")

    # Test for full or partial
    if partialtest:
        print("\n=== Starting partial test ===")
        if not historyfull:
            print("Node not set to full in JSON")
            return False, "Node not set to full in JSON"
        #Create payload for request to hyperion
        payload = dict(id=fulltrx[0])
        print(f"Checking transaction: {fulltrx[0]}")
        try:
            response = eosio.get_stuff(api,payload,'trx')
            print(f"Transaction response: {response}")
            trxExecuted = response['executed']
            trx_id = response['trx_id']
        except Exception as err:
            print(f"Transaction check failed: {err}")
            return False, messages.TIMEOUT_ERROR(api)

        print("\n=== Checking history v1 ===")
        if not check_history_v1(producer,feature):
            print("History v1 check failed")
            return False, messages.HISTORY_V1(False)

        if trxExecuted:
            print("Transaction executed successfully")
            return True, messages.FULL_HYPERION(True)
        else:
            print(f"Transaction not executed. ID: {trx_id}")
            return False, messages.FULL_HYPERION(False,trx_id,response)
    
    ## Normal hyperion tests
    else:
        print("\n=== Starting normal hyperion tests ===")
        url = str(eosio.Api_Calls('v2-history', 'get_actions?limit=1'))
        print(f"Checking actions URL: {api+url}")
        reqJSON = requests.getJSON()
        response = reqJSON.getRequest(api+url,trydo='return')

        urlHealth = str(eosio.Api_Calls('v2', 'health'))
        print(f"Checking health URL: {api+urlHealth}")
        reqJSONHealth = requests.getJSON()
        responseHealth = reqJSONHealth.getRequest(api+urlHealth,trydo='return')

        try:
            jsonresHealth = responseHealth.json()
            print(f"Health response: {jsonresHealth}")
            if 'last_indexed_block_time' in jsonresHealth:
                last_action_date_health = dateutil.parser.parse(
                jsonresHealth['last_indexed_block_time']).replace(tzinfo=None)
                print(f"Last action date health: {last_action_date_health}")
            else:
                print("No 'last_indexed_block_time' in response")
        except Exception as e:
            print(f"Failed to parse health response: {e}")

        try:
            jsonres = response.json()
            last_action_date = dateutil.parser.parse(
                    jsonres['actions'][0]['timestamp']).replace(tzinfo=None)
            # Old hyperion prior to 3.3.9
            #last_action_date = dateutil.parser.parse(
                    #jsonres['actions'][0]['@timestamp']).replace(tzinfo=None)
        except Exception as err:
                return False, f"Failed to parse JSON or access 'last_action_date': {err}"

        # Calculate the time difference between now and last_action_date
        diff_secs = (datetime.utcnow() - last_action_date).total_seconds()

        # Check the time difference for last_action_date
        if diff_secs > 600:
            check_passed = False
            return False, messages.HYPERION_LAST_ACTION(diff_secs)

        # If last_action_date_health is available, calculate its time difference and perform the check
        if 'last_action_date_health' in locals() and last_action_date_health is not None:
            diff_secs_health = (datetime.utcnow() - last_action_date_health).total_seconds()
            if diff_secs_health > 600:
                check_passed = False
                return False, messages.HYPERION_LAST_ACTION(diff_secs_health)

        if not check_history_v1(producer,feature):
            print('full history check failing')
            return False, messages.HISTORY_V1(False)

        result = check_recent_transaction(api, recentfulltrx)
        if not result[0]:
            return result
        else:
            return True, messages.FORMAT_MESSAGES(messages.HYPERION_HEALTHY,messages.HYPERION_LAST_ACTION(diff_secs))
            #return True, messages.HYPERION_HEALTHY


def check_history_v1(producer,feature):
    payload = { "account_name": "eosio", "pos": -1, "offset": -20}
     # Query nodes in DB and try and obtain API node
    try:
        api = db_connect.getQueryNodes(producer,feature,'api')[0]
    # If there is no v1_history or hyperion node in DB return False
    except:
        return False, 'No ' + feature + ' in JSON'
    info = str(eosio.Api_Calls('v1-history', 'get_actions'))
    curlreq = core.curl_request(api+info,'POST',payload)
    try:
        response = eosio.requests.post(api+info, json=payload, timeout=10)
        response.raise_for_status()
    # If returns codes are 500 OR 404
    except requests.HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')  # Python 3.6
        # also return http_err
        if response.status_code == 500:
            jsonres = response.json()
            try:
                error = curlreq+'\nError: '+str(jsonres.get('error').get('what'))
            except:
                error = messages.TIMEOUT_ERROR(api)
            return False, error
        elif response.status_code == 404:
            error = curlreq+'\nError: Not a full node'
            return False, error
        else:
            error = curlreq+' '+str(http_err)
            return False, error
    except Exception as err:
        error = curlreq+'\n'+messages.TIMEOUT_ERROR(api)
        return False, error
    jsonres = response.json()
    try:
        #Has trx been executed
        actions = jsonres['actions']
    except Exception as err:
        return False, err
    if len(actions) == 0:
            return False, messages.HISTORY_V1(False)
    else:
        return True, messages.HISTORY_V1(True)
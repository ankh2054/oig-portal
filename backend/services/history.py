import utils.core as core
import utils.requests as requests
import utils.eosio as eosio
import db_connect
import humanize
import dateutil.parser
from datetime import datetime


def check_hyperion(producer,feature,partialtest=False,testnet=False):
    ### Check Hyperion exists in DB 
    try:
        api = db_connect.getQueryNodes(producer,feature,'api',testnet)[0]
    # If there is no v1_history or hyperion node in DB return False
    except:
        return False, 'No ' + feature + ' in JSON'

    #  Check Hyperion last indexed equals total indexed blocks - this also accounts for all other services being ok
    # This also takes in account hyperions that don't have all blocks.
    hyperionresult = eosio.hyperionindexedBlocks(api)
    if hyperionresult[0] == False:
        return False, hyperionresult[1]
    else:
        pass  
    # Set chain type for full and partial checks
    if testnet:
        chain = 'testnet'
    else:
        chain = 'mainnet'
    # Test for full or partial
    if partialtest:
        # block to test is headblock minus 20 weeks 1 day back. 2 blocks per second.
        fourweeksOnedayinSeconds = 12096000+86400
        # Get random transaction
        fulltrx = eosio.get_random_trx(fourweeksOnedayinSeconds,chain)
        #Create payload for request to hyperion
        payload = dict(id=fulltrx[0])
    ## Perform normal hyperion tests for mainnet and testnet
    else:
    ### Check hyperion last indexed action
        url = str(eosio.Api_Calls('v2-history', 'get_actions?limit=1')) #'/v2/history/get_actions?limit=1'
    try:
        if partialtest:
            response = eosio.get_stuff(api,payload,'trx')
        else:
            response = requests.s.get(api+url, timeout=requests.defaulttimeout)
        # If the response was successful, no Exception will be raised
            response.raise_for_status()
    # If returns codes are 500 OR 404
    except requests.HTTPError as http_err:
        if response.status_code == 500:
            error = "something else weird has happened"
            return False, error
        elif response.status_code == 404:
            error = 'Error: Not a full node'
            return False, error
        else:
            error = str(http_err)
            return False, error
    except Exception as err:
        print(f'Other error occurred: {err}')  # Python 3.6
        # also return err
        error = str(err)
        return False, error
    else:
        if partialtest:
            try:
                trxExecuted = response['executed']
                trx_id = response['trx_id']
                msg = f"Hyperion is missing transaction: {trx_id}. HTML Response {response}"
            except:
                return False, 'Some other error occured'
            if trxExecuted:
                return True, 'ok'
            else:
                return False, msg
        else:
            jsonres = response.json()
            try:
                last_action_date = dateutil.parser.parse(
                    jsonres['actions'][0]['@timestamp']).replace(tzinfo=None)
            except:
                   msg = 'Other error occured'
                   return False, msg
            diff_secs = (datetime.utcnow() -
                            last_action_date).total_seconds()
            if diff_secs > 600:
                    msg = 'Hyperion Last action {} ago'.format(
                        humanize.naturaldelta(diff_secs))
                    return False, msg
            else:
                return True, 'ok'


# History nodes type checks
def check_history_v1(producer,feature):
    payload = { "account_name": "eosio", "pos": -1, "offset": -20}
     # Query nodes in DB and try and obtain API node
    try:
        api = db_connect.getQueryNodes(producer,feature,'api')[0]
        print('Hyperion node: ',api)
    # If there is no v1_history or hyperion node in DB return False
    except:
        return False, 'No ' + feature + ' in JSON'
    info = str(eosio.Api_Calls('v1-history', 'get_actions'))
    curlreq = core.curl_request(api+info,'POST',payload)
    try:
        response = requests.s.post(api+info, json=payload, timeout=requests.defaulttimeout)
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
    jsonres = response.json()
    try:
        #Has trx been executed
        actions = jsonres['actions']
    except Exception as err:
        return False, err
    if len(actions) == 0:
            return False, 'No actions returned'
    else:
        return True, 'ok'
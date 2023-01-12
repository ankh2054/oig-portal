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
        fourweeksOnedayinSeconds = 60480000+86400
        # Get random transaction
        fulltrx = eosio.get_random_trx(fourweeksOnedayinSeconds,chain)
        #Create payload for request to hyperion
        print(fulltrx[0])
        payload = dict(id=fulltrx[0])
        try:
            response = eosio.get_stuff(api,payload,'trx')
            print(response.json())
            trxExecuted = response['executed']
            trx_id = response['trx_id']
            msg = f"Hyperion is missing transaction: {trx_id}. HTML Response {response}"
        except:
            return False, 'Some other error occurred'
        if trxExecuted:
            return True, 'ok'
        else:
            return False, msg   
    ## Perform normal hyperion tests for mainnet and testnet
    else:
    ### Check hyperion last indexed action
        url = str(eosio.Api_Calls('v2-history', 'get_actions?limit=1')) #'/v2/history/get_actions?limit=1'
        reqJSON = requests.getJSON()
        response = reqJSON.getRequest(api+url,trydo='return')
        try:
            jsonres = response.json()
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
    try:
        reqJSON = requests.getJSON()
        response = reqJSON.getRequest(api+info,trydo='return',payload=payload,post=True)
        actions = reqJSON.getJson(api+info,response,'actions',trydo='return')
    except Exception as err:
        return False, err
    if len(actions) == 0:
        return False, 'No actions returned'
    else:
        return True, 'ok'

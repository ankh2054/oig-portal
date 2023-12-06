import humanize
## SIMPLE MESSAGES

CORS = 'CORS headers properly configured'
HYPERION_HEALTHY = 'All Hyperion Services are healthy and zero missing blocks.'
HYPERION_TOTAL_INDEXED_MISMATCH = 'Hyperion last indexed does not match total indexed with range of 10'
ATOMIC_HEALTHY = 'All atomic services are healthy'
CPU = 'Producer not found in either mainnet or testnet data setting to default of 1.0'
## FUNCTIONS

def FORMAT_MESSAGES(*args):
    return "<br>".join(args)


## GENERAL 
def NOT_IN_JSON(service='API node'):
    return  f'No {service} configured in JSON'

def NOT_JSON(working,err=None):
    if working:
        pass
    else:
        return f'JSON parsing error: {str(err)}'

def NOT_RESPONDING_CORRECTLY(service):
    return f'Node responding incorrectly: {service}'

def TIMEOUT_ERROR(service):
    return f"Timeout error connecting to: {service}"

def GENERAL_ERROR(err):
    return f'Error: {err}'


## API
def CHECK_API(working):
    if working:
        return f'API is alive and chainID matches'
    else:
        return f'Wrong chain ID or server responded incorrectly'

## CHAINSJSON

def CHECK_CHAINJSON(working,json=None,diff=None):
    if json:
        return f'JSON file not posted to chain or incorrect format'
    if working:
        return f'JSON file on website matches onchain version'
    else:
        return f'JSON file on website does not match onchain version: {diff}'



## DELPHIORACLE

def CHECK_ORACLE_FEED(working):
    if working:
        return f'Broadcasting oracle data every minute, incorporating a minimum of 3 distinct price feeds'
    else:
        return f'No actions associated with your BP name in Delphioracle OR less than 3 feeds'

##P2P

def CHECK_P2P(working,head_block=None,head_block_num=None):
    if working:
        return f'Successfully synced with P2P node and headblock is in sync with network.'
    else:
        return f'Node is not in sync, P2P responded with headblock of: {head_block} whereas network is currently at {head_block_num}'


## ATOMIC

def ATOMIC(working,collection=None, template=None, schema=None, asset=None):
    if working:
        return f"""All Atomic services are working, successfully queried 
        Collection:{collection}, Template:{template}, Schema:{schema}, Asset:{asset}"""
    else:
        return f'Atomic API last_indexed_block is behind head_block'

def ATOMIC_ASSETS(assettype, name, output):
    return f'Could not find {assettype} {name}, output {output}'


## HISTORY

def FULL_HYPERION(working,trx=None,response=None):
    if working:
        return 'Enough historical data to be counted as Full Hyperion'
    else:
        return f"Not enough data to count as running Full Hyperion. Hyperion is missing transaction: {trx}. HTML Response {response}"

def HYPERION_LAST_ACTION(diff_secs):
    return 'Hyperion Last action {} ago'.format(humanize.naturaldelta(diff_secs))


def HYPERION_MISSING_BLOCKS(working, missing_blocks=None):
    if working:
        return f'Hyperion Total blocks matches last indexed and no missing Blocks'
    else:
        return f'Hyperion last indexed does not match total indexed, missing blocks {missing_blocks}'



def HISTORY_V1(working):
    if working:
        return 'V1 requests are working and returning actions data'
    else:
        return 'V1 requests are not returning actions data'

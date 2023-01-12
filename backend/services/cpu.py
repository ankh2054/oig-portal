import utils.core as core
import db_connect
import utils.requests as requests
import utils.eosio as eosio
import statistics

def getcpustats():
    print(core.bcolors.OKYELLOW,f"{'='*100}\nGetting CPU Results ",core.bcolors.ENDC)
    # Pull transactions from eosmechanics and save cpu time 
    chain = "mainnet"
    eosmech_actions = requests.get_actions_data("eosmechanics","120")
    #query = ['simple_actions']
    actions = eosio.get_stuff(eosio.HyperionNodeMainnet1,eosmech_actions,'actions',chain)
    trxs = actions['simple_actions']
    # Create empty list
    producer_final = []
    # Create new empty dict
    proddict = {}
    # Set chain from where stats are being pulled
    #chain = 'main'
    node = eosio.HyperionNodeMainnet1
    for i in trxs:
        # Get TRX ID
        trx = i['transaction_id']
        # Create copy of dict and call it new
        new = proddict.copy()
        # Construct dict from TRX variable and assign to ID key
        payload = dict(id=trx)
        # Pass TRX ID and get all TRX information]
        node = eosio.getrandomNode(eosio.MainNodes)
        #fulltrx = eosio.get_stuff(eosio.HyperionNodeMainnet1,payload,'trx',chain)
        try:
            fulltrx = eosio.get_stuff(node,payload,'trx',chain)
            print(fulltrx)
            producer = fulltrx['actions'][0]['producer']
            print(producer)
            cpustats = fulltrx['actions'][0]['cpu_usage_us']
            receiver = fulltrx['actions'][0]['receipts'][0]['receiver']
            print(cpustats)
        except:
            continue
        # Update dict with producer name and cpustats
        new.update({'producer': producer, 'cpustats': cpustats})
        # Add dict to list
        producer_final.append(new)
    return producer_final


def cpuresults(producer,producercpu):
    # Get cpustats(key) value for the items in producercpu if the producer passed is in that list.
    cpu = [item['cpustats'] for item in producercpu if item["producer"] == producer]
    # If producer is not in that list  means producer is not in top21, so we need testnet data.
    if not cpu:
        return int(1.0)
    else:
        stat = round((sum(cpu) / len(cpu))/1000,2)
        return stat

def cpuAverage(producer):
    try:
        allcpu = db_connect.getCPU(producer)
    except:
        # New Guilds will not have any CPU scores, so set to 0
        allcpu = 0
    cpu_final = []
    for cpu in allcpu:
        cpu_final.append(cpu[0])
    try:
        avg_cpu = statistics.median(cpu_final) 
        return avg_cpu
    except:
        # New Guilds will not have any CPU scores, so set to 0
        return 0
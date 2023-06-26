import utils.core as core
import db_connect
import utils.requests as requests
import utils.eosio as eosio
import statistics

def getcpustats(chain):
    print(core.bcolors.OKYELLOW,f"{'='*100}\nGetting CPU Results for {chain} ",core.bcolors.ENDC)
    # Pull transactions from eosmechanics and save cpu time 
    if chain == 'mainnet':
        count = 120
        node = eosio.HyperionNodeMainnet1
        nodes = eosio.MainNodes
    elif chain == 'testnet':
        count = 300
        node = eosio.HyperionNodeTesnet
        nodes = eosio.TestNodes
#    chain = "mainnet"
    eosmech_actions = requests.get_actions_data("eosmechanics",count)
    #query = ['simple_actions']
    actions = eosio.get_stuff(node,eosmech_actions,'actions',chain)
    trxs = actions['simple_actions']
    # Create empty list
    producer_final = []
    # Create new empty dict
    proddict = {}
    for i in trxs:
        # Get TRX ID
        trx = i['transaction_id']
        # Create copy of dict and call it new
        new = proddict.copy()
        # Construct dict from TRX variable and assign to ID key
        payload = dict(id=trx)
        # Pass TRX ID and get all TRX information]
        node = eosio.getrandomNode(nodes)
        #fulltrx = eosio.get_stuff(eosio.HyperionNodeMainnet1,payload,'trx',chain)
        try:
            fulltrx = eosio.get_stuff(node,payload,'trx',chain)
            producer = fulltrx['actions'][0]['producer']
            cpustats = fulltrx['actions'][0]['cpu_usage_us']
            receiver = fulltrx['actions'][0]['receipts'][0]['receiver']
        except:
            continue
        # Update dict with producer name and cpustats
        new.update({'producer': producer, 'cpustats': cpustats})
        # Add dict to list
        producer_final.append(new)
    return producer_final

def cpuresults(producer,producercpu,producertestcpu):
    # Get cpustats(key) value for the items in producercpu if the producer passed is in that list.
    cpuMain = [item['cpustats'] for item in producercpu if item["producer"] == producer]
    # Get owner_name for testnet as some owner_names are different on testnet
    producer = db_connect.getProducerTestnetName(producer).pop()[0]
    cpuTest = [item['cpustats'] for item in producertestcpu if item["producer"] == producer]
    # If producer is  in mainnet list we return CPU stats.
    if cpuMain:
        stat = round((sum(cpuMain) / len(cpuMain))/1000,2)
        return stat
    # Else producer is on testnet only we return test CPU stats
    elif cpuTest:
        stat = round((sum(cpuTest) / len(cpuTest))/1000,2)
        return stat
    else:
        print(f'Producer not found in either mainnet or testnet data setting to default of 1.0')
        return int(1.0)


"""def cpuresults2(producer,producercpu):
    # Get cpustats(key) value for the items in producercpu if the producer passed is in that list.
    cpu = [item['cpustats'] for item in producercpu if item["producer"] == producer]
    # If producer is not in that list  means producer is not in top21, so we need testnet data.
    if not cpu:
        #return int(1.0)
        # Removed testnet data for now and only return 1
        
        # Iterate backwards from current)_headblock until you find a block produced by producer and that contains transactions
        # We only go back as far as 500 blocks, if not found then return False.
        cpu = eosio.get_testnetproducer_cpustats(producer)
        print(f'CPU: {cpu}')
        if cpu == None:
            return int(1.0)
        else: 
            stat = round(cpu/1000,2)
            return stat
        
    else:
        stat = round((sum(cpu) / len(cpu))/1000,2)
        return stat"""
    
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
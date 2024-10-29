import utils.core as core
import requests
import re
from datetime import timedelta
from datetime import datetime
import db_connect
import argparse
import utils.eosio as eosio
import services.atomic as atomic
import services.producers as producers
import services.nodes as nodes
import services.api as api
import services.chaininfo as chaininfo
import services.history as history
import services.p2pnew as p2p
import services.delphi as delphi
import services.cpu as cpu
import services.chainjson as chainjson
import services.telegram as telegram_module
import services.score as scoring
import services.p2pnew as p2p
import asyncio
#import utils.requests as requests
import sys



#Get random transactions
fourtwenty = 42 * 86400 
mainnetfulltrx = eosio.get_random_trx(fourtwenty,'mainnet')
print(core.bcolors.OKYELLOW,f"{'='*100}\nRandom Mainnet TRX: ",mainnetfulltrx,core.bcolors.ENDC)
mainnetfulltrxRecent = eosio.get_random_trx(0,'mainnet')
print(core.bcolors.OKYELLOW,f"{'='*100}\nRandom Recent Mainnet TRX: ",mainnetfulltrxRecent,core.bcolors.ENDC)
testnetfulltrx = eosio.get_random_trx(fourtwenty,'testnet')
print(core.bcolors.OKYELLOW,f"{'='*100}\nRandom Testnet TRX: ",testnetfulltrx,core.bcolors.ENDC)
testnetfulltrxRecent = eosio.get_random_trx(0,'testnet')
print(core.bcolors.OKYELLOW,f"{'='*100}\nRandom Recent Testnet TRX: ",testnetfulltrxRecent,core.bcolors.ENDC)

def lastCheck(now,ignorelastcheck,hours):
    lastcheck = db_connect.getLastcheck() #2021-11-19 07:25:24.11084+00
    # Set now date
    now = now
    # Convert todays date to string to remove offset aware datetime issues 
    today = now.strftime("%m/%d/%Y %H:%M")
    # Convert DB date to string to remove offset aware datetime issues
    lastcheck_oig = lastcheck[0][0].strftime("%m/%d/%Y %H:%M")
    # Convert them both back to datetime objects for comparison
    today_date_object = datetime.strptime(today, "%m/%d/%Y %H:%M")
    lastcheck_date_object = datetime.strptime(lastcheck_oig, "%m/%d/%Y %H:%M") + timedelta(hours=hours)
    if today_date_object > lastcheck_date_object:
        return True
    elif ignorelastcheck:
        return True
    else:
        return False
    
def getTelegramDates():
    data_tuples = []
    try:
        date_list = asyncio.run(telegram_module.fetch_telegram_dates())
    except Exception as e:
        return f'Error occurred while fetching telegram dates: {e}'
    date_format = "%A, %B %d, %Y, %H:%M:%S %Z"

    for item in date_list:
        date_string = re.sub(r'(\d)(st|nd|rd|th)', r'\1', item['date'])  # Remove ordinal indicators
        item['date'] = datetime.strptime(date_string, date_format)

    
    for item in date_list:
        if item['type'] == 'Guild Update Submission Cutoff': 
            submission_cutoff = item['date']
        elif item['type'] == 'Report Appeals Begin':
            appeal_begin = item['date']
        elif item['type'] == 'Report Appeals End':
            appeal_end = item['date']
        elif item['type'] == 'Publish Final Report':
            final_report = item['date']
    try:
        data_tuples.append((submission_cutoff, appeal_begin, appeal_end, final_report))
        return data_tuples
    except:
        return False
    


## Final Results print output function to display results to console for each check
def printOuput(results,description):
    result = results[0]
    if result == True:
        colorstart = core.bcolors.OKGREEN
    else:
        colorstart = core.bcolors.WARNING
    return  print(description,colorstart,result,core.bcolors.ENDC)
    

def finalresults(cpucheck,singlebp):
    ## Testing a single BP on  all tests, just change the BP name
    if singlebp:
        producersdb = [(singlebp, 'LiquidStudios', 'https://liquidstudios.io', 'https://liquidstudios.io/wax.json', 'https://liquidstudios.io/chains.json', True, 'https://liquidstudios.io/wp-content/uploads/2021/04/logo_small_icon_only-1.png', True, 'MU', None)]
    # Get list of registered active producers
    else:
        producersdb = db_connect.getProducers()
    # Get CPU stats for top21 producers unless false then we pass
    if not cpucheck:
        pass
    else:
        producercpu = cpu.getcpustats('mainnet')
        producertestcpu = cpu.getcpustats('testnet')
    # Get points system
    pointsystem =  db_connect.getPoints()
    # Get list of delphioracles and store for use
    producersoracle = delphi.delphioracle_actors()
    # Get list of current producer scores
    producerChainScores = chaininfo.getguildsJSON('mainnet')
    # Create empty list
    finaltuple = []
    for producer in producersdb:
        global requests_count 
        requests_count = 0
        #Obtain producer from sql tuple
        producer = producer[0]
        print(core.bcolors.OKBLUE,f"{'='*100}\nResults for ",producer,core.bcolors.ENDC)

        oracle_feed = delphi.delphiresults(producer,producersoracle)
        printOuput(oracle_feed,"Publishing feed data via an oracle service: ")

        api_node = api.check_api(producer,'apichk')
        printOuput(api_node,"API node endpoint is publicly available: ")
       
        http_check = api.check_api(producer,'httpchk')
        printOuput(http_check,"HTTP is available on RPC API endpoint: ")

        # Website, chains and wax.json checks
        website = [True, 'oops']
        printOuput( website,"Public website available: ")

        chains_json = [True, 'oops']
        printOuput(chains_json,"chains.json metadata available at regproducer url: ")

        wax_json = [True, 'oops']
        printOuput(wax_json,"wax.json metadata available at regproducer url: ")

        # CORS check
        cors_check = api.check_api(producer,'corschk')
        printOuput(cors_check,"CORS is configured on RPC API: ")

        # HTTPS check
        https_check = api.check_https(producer,'httpschk')
        printOuput(https_check,"HTTPS is available on RPC API endpoint: ")
   
        # TLS check
        tlscheck = api.check_https(producer,'tlschk')
        printOuput(tlscheck,"TLS version available on HTTPS API: ")

        # HTTP2 check
        http2_check = api.check_https(producer,'http2chk')
        printOuput(http2_check,"HTTP2 is enabled on RPC API endpoint: ")
        
        # Producer API check
        producer_apicheck = api.api_security(producer,'chain-api','producer_api')
        printOuput(producer_apicheck,"Producer API is disabled on visible nodes: ")

        # Net API check
        net_apicheck = api.api_security(producer,'chain-api','net_api')
        printOuput(net_apicheck,"net_api API is disabled on visible nodes: ")

        # DB size API check
        dbsize_apicheck = api.api_security(producer,'chain-api','db_size_api')
        printOuput(dbsize_apicheck,"db_size API is disabled on visible nodes:")
        #CPU checks
        if not cpucheck:
            #cpu_time = (1.0)
            cpu_time = cpu.cpuAverage(producer)
        else: 
            cpu_time = cpu.cpuresults(producer,producercpu,producertestcpu)
        print("CPU latency on EOS Mechanics below 2 ms on average:",core.bcolors.OKYELLOW, cpu_time,core.bcolors.ENDC,"ms")
        cpuavg = cpu.cpuAverage(producer)
        print("CPU latency average over 30days:",core.bcolors.OKYELLOW, cpuavg,core.bcolors.ENDC,"ms")
        
        # v1 History check
        full_history = history.check_history_v1(producer,'history-v1')
        printOuput(full_history,"Running a v1 History node: ")

        # v2 Hyperion mainnet check
        hyperion_v2 = history.check_hyperion(producer,'hyperion-v2',mainnetfulltrxRecent,mainnetfulltrx)
        printOuput(hyperion_v2,"Running a v2 Hyperion node: ")

        # v2 Hyperion mainnet Full/Partial check
        hyperion_v2_full = history.check_hyperion(producer,'hyperion-v2',mainnetfulltrxRecent,mainnetfulltrx,partialtest=True)
        printOuput( hyperion_v2_full,"Running a v2 Hyperion Full node: ")

        # v2 Hyperion testnet check
        hyperion_v2_testnet = history.check_hyperion(producer,'hyperion-v2',testnetfulltrxRecent,testnetfulltrx,testnet=True)
        printOuput(hyperion_v2_testnet,"Running a v2 Hyperion testnet node: ")

        # v2 Hyperion testnet Full/Partial check
        hyperion_v2_testnet_full = history.check_hyperion(producer,'hyperion-v2',testnetfulltrxRecent,testnetfulltrx,testnet=True,partialtest=True)
        printOuput(hyperion_v2_testnet_full,"Running a v2 Hyperion Full testnet node: ")

        # Atomic Assets API
        atomic_api = atomic.check_atomic_assets(producer,'atomic-assets-api')
        printOuput(atomic_api,"Running a atomic assets Api: ")

        # Chains JSON matches WWW JSON
        wwwjson = chainjson.compareJSON(producer,'mainnet')
        printOuput(wwwjson,"Does chains json match www json ")

        seed_node = p2p.verify_block_from_p2p(producer,'p2p_endpoint')
        printOuput(seed_node,"Running a seed node: ")

         # Get current UTC timestamp
        dt = datetime.utcnow()
        # Obtain points from list for each check
        pointslist = { 
            'cors_check': cors_check[0],
            'http_check': http_check[0],
            'https_check': https_check[0],
            'tlscheck': tlscheck[0],
            'producer_apicheck': producer_apicheck[0],
            'net_apicheck': net_apicheck[0],
            'dbsize_apicheck': dbsize_apicheck[0],
            'http2_check': http2_check[0],
            'full_history': full_history[0],
            'hyperion_v2': hyperion_v2[0],
            'hyperion_v2_full': hyperion_v2_full[0],
            'hyperion_v2_testnet': hyperion_v2_testnet[0],
            'hyperion_v2_testnet_full': hyperion_v2_testnet_full[0],
            'atomic_api':atomic_api[0],
            'wwwjson': wwwjson[0],
            'seed_node': seed_node[0],
            'api_node': api_node[0],
            'oracle_feed': oracle_feed[0],
            'wax_json': wax_json[0],
            'chains_json': chains_json[0],
            'cpu_time': cpu_time,
        }
        resultslist = [
            producer, 
            cors_check[0], 
            str(cors_check[1]), 
            http_check[0], 
            str(http_check[1]), 
            https_check[0], 
            str(https_check[1]), 
            tlscheck[0], 
            str(tlscheck[1]), 
            producer_apicheck[0], 
            str(producer_apicheck[1]),
            net_apicheck[0],
            str(net_apicheck[1]),
            dbsize_apicheck[0],
            str(dbsize_apicheck[1]),
            http2_check[0],
            str(http2_check[1]), 
            full_history[0], 
            str(full_history[1]),
            hyperion_v2[0],
            str(hyperion_v2[1]),
            hyperion_v2_full[0],
            str(hyperion_v2_full[1]),
            hyperion_v2_testnet[0],
            str(hyperion_v2_testnet[1]),
            hyperion_v2_testnet_full[0],
            str(hyperion_v2_testnet_full[1]),
            atomic_api[0],
            str(atomic_api[1]),
            wwwjson[0], 
            str(wwwjson[1]), 
            seed_node[0], 
            str(seed_node[1]), 
            api_node[0], 
            str(api_node[1]), 
            oracle_feed[0], 
            str(oracle_feed[1]), 
            wax_json[0], 
            chains_json[0], 
            cpu_time, 
            cpuavg, 
            dt
        ]
        score = scoring.pointsResults(pointslist,pointsystem)
        print("Final Tech points:",core.bcolors.OKGREEN,score,core.bcolors.ENDC)
        # Add final sore to list
        resultslist.append(score)
        #Obtain latest chain score for guild
        chainscore = chaininfo.getScore(producerChainScores,producer)
        resultslist.append(chainscore)
        # Turn list into tuple read for Postgres
        resultstuple = tuple(resultslist)
        finaltuple.append(resultstuple)
    return finaltuple



def main(cpucheck, ignorelastcheck, singlebp):
    now = datetime.now() - timedelta(minutes=1)
    print(core.bcolors.OKYELLOW,f"{'='*100}\nTime: ",now,core.bcolors.ENDC)
    if not lastCheck(now,ignorelastcheck,2):
        print("Not running as ran within last 2 hours")
        sys.exit()
    if cpucheck:
        print(core.bcolors.OKYELLOW,f"{'='*100}\nCPU is being checked ",core.bcolors.ENDC)
    else:
        print(core.bcolors.OKYELLOW,f"{'='*100}\nCPU is not being checked ",core.bcolors.ENDC)
    """if only single BP is requested we do not process below functions to update DB
    this allows for uvicorn to run and BPs to force check from oig portal without interfering with main
    process which checks all BPs"""
    if not singlebp:
        # Get list of producers
        print(core.bcolors.OKYELLOW,f"{'='*100}\nGetting list of producers on chain ",core.bcolors.ENDC)
        producersList = producers.producer_chain_list()
        if not producersList:
            print("No producers found. Exiting the program.")
            sys.exit()
        # Update producers to DB
        db_connect.producerInsert(producersList)
        # Delete all nodes from table
        print(core.bcolors.OKYELLOW,f"{'='*100}\nRemoving existing nodes from DB ",core.bcolors.ENDC)
        db_connect.nodesDelete('oig.nodes')
        # Add nodes to DB
        print(core.bcolors.OKYELLOW,f"{'='*100}\nGetting list of mainnet nodes from JSON files ",core.bcolors.ENDC)
        mainnet_nodes = nodes.node_list()
        print(mainnet_nodes)
        db_connect.nodesInsert(mainnet_nodes)
        print(core.bcolors.OKYELLOW,f"{'='*100}\nGetting list of testnet nodes from JSON files ",core.bcolors.ENDC)
        testnet_nodes = nodes.node_list(testnet=True) # Tesnet = True so collect testnet nodes from json files
        db_connect.nodesInsert(testnet_nodes)
        print(core.bcolors.OKYELLOW,f"{'='*100}\nGetting OIG submission dates from Telegram ",core.bcolors.ENDC)
        telegramDates = False #getTelegramDates()
        if telegramDates:
            print(f'Telegram dates: {telegramDates}')
            db_connect.TelegramdatesInsert(telegramDates)
        else:
            print(f'Something went wrong with  getting dates DB not being updated: {telegramDates}')
            pass
    # Get all results and save to DB
    results = finalresults(cpucheck,singlebp) # Set True to check CPU , False to ignore
    truncated_results = []
    for record in results:
        truncated_record = tuple((str(field)[:1000] if isinstance(field, str) else field) for field in record)
        truncated_results.append(truncated_record)
    db_connect.resultsInsert(truncated_results)

if __name__ == "__main__":
    my_parser = argparse.ArgumentParser()
    my_parser.add_argument('--ignorecpucheck', default=True, action="store_false")
    my_parser.add_argument('--ignorelastcheck',default=False, action="store_true")
    my_parser.add_argument('--bp', action="store")
    args = my_parser.parse_args()
    cpucheck = args.ignorecpucheck
    ignorelastcheck = args.ignorelastcheck
    singlebp = args.bp
    main(cpucheck, ignorelastcheck, singlebp)
    #print(p2p.verify_block_from_p2p('sentnlagents','p2p_endpoint'))
    #print(chainjson.compareJSON('waxhiveguild','mainnet'))
    #telegramDates = print(getTelegramDates())
    #scores = chaininfo.getguildsJSON('mainnet')
    #print(chaininfo.getScore(scores,'sentnlagents'))
    #producers.producer_chain_list()
    #print(cpu.getcpustats())
    #print(cpu.cpuAverage('eosriobrazil'))
    #print(history.check_hyperion('sentnlagents','hyperion-v2','39b6f3190f3da5415546a58bcd4033a1ad329b517a3e1b6d63d32a206d46fed5','39b6f3190f3da5415546a58bcd4033a1ad329b517a3e1b6d63d32a206d46fed5',testnet=False,partialtest=True))
    #print(chainjson.compareJSON('dapplica','mainnet'))
    #print(atomic.getAtomicTemplates('https://aa.dapplica.io','kogsofficial'))
    #print(atomic.getAtomicSchema('https://aa.dapplica.io','kogsofficial'))
    #print(atomic.getAtomicassets('https://aa.dapplica.io'))
    #print(chainjson.getchainsJSON('sentnlagents','mainnet'))
    #print(chainjson.getwwwJSON('sentnlagents'))
    #print(chainjson.compareJSON('sentnlagents','mainnet'))
    #print(api.check_https('sentnlagents','tlschk'))
    #python3 -m services.atomic("greeneosiobp","atomic-assets-api")   
    #python3 -m services.history.check_hyperion('sentnlagents','hyperion-v2','29f9f0c9a40a8508b2433822593ac6cb274299b8e2e32409ea0517d7842241da', '9437457b450b2c47e47fca67c19ca12e111fa01ee9aeac373826ac414d3329dc',testnet=False,partialtest=True))  

        

## Invdividual BP check (ignoring both CPU checks an lastcheck )
# python3 producer-data.py --ignorelastcheck --ignorecpucheck --bp eosriobrazil

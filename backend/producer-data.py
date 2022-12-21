import utils.core as core
import requests
from datetime import timedelta
from datetime import datetime
import db_connect
import argparse
import services.atomic as atomic
import services.producers as producers
import services.nodes as nodes
import services.api as api
import services.history as history
import services.p2p as p2p
import services.delphi as delphi
import services.cpu as cpu
import utils.requests as requests



def lastCheck(now,ignorelastcheck):
    lastcheck = db_connect.getLastcheck() #2021-11-19 07:25:24.11084+00
    # Set now date
    now = now
    # Convert todays date to string to remove offset aware datetime issues 
    today = now.strftime("%m/%d/%Y %H:%M")
    # Convert DB date to string to remove offset aware datetime issues
    lastcheck_oig = lastcheck[0][0].strftime("%m/%d/%Y %H:%M")
    # Convert them both back to datetime objects for comparison
    today_date_object = datetime.strptime(today, "%m/%d/%Y %H:%M")
    lastcheck_date_object = datetime.strptime(lastcheck_oig, "%m/%d/%Y %H:%M") + timedelta(hours=2)
    if today_date_object > lastcheck_date_object:
        return True
    elif ignorelastcheck:
        return True
    else:
        return False

# Looks at snapshot date as specified by OIG and if today is that day, create snapshot
# Also look at last snapshot date, if within 24 hours of last snapshot taken dont snapshot. That prevents if from taking multiple snapshots
def takeSnapshot(now):
    producers = db_connect.getProducers()
    # get snapshot timestamp as set by OIG
    snapshot_oig = db_connect.getSnapshotdate()
    # get date of last snapshot taken timestamp
    latest_snapshot_date = db_connect.getSnapshottakendate()
    # Access first element in tuple
    snapshot_oig_date = snapshot_oig[0][0]
    latest_snapshot_date = latest_snapshot_date[1][0]
    # Set now date
    now = now
    # Convert todays date to string to remove offset aware datetime issues 
    today = now.strftime("%m/%d/%Y")
    # Convert DB date to string to remove offset aware datetime issues
    snapshot_oig = snapshot_oig_date.strftime("%m/%d/%Y")
    latest_snapshot_date = latest_snapshot_date.strftime("%m/%d/%Y")
    # Convert them both back to datetime objects for comparison
    snapshot_oig = datetime.strptime(snapshot_oig, "%m/%d/%Y")
    latest_snapshot_date  = datetime.strptime(latest_snapshot_date , "%m/%d/%Y")
    today_date_object = datetime.strptime(today, "%m/%d/%Y")
    # If today is date of snapshot date set by OIG, then take snapshot
    if today_date_object == snapshot_oig:
        # But first check whether snapshot was already taken today
        if latest_snapshot_date == snapshot_oig:
            print("Snapshot was already taken today")
        else:
            print("snapshot will be taken today")
            # Set snapshot_date for all producers in DB.
            for producer in producers:
                producer = producer[0]
                db_connect.createSnapshot(snapshot_oig_date, producer, now)

    else:
        print("Not a snapshot day today")
    print(f'Last snapshot taken: {latest_snapshot_date}')
    print(f'OIG DB format date: {snapshot_oig_date}')
    print(f'OIG date: {snapshot_oig}')
    print(f'Today: {today_date_object}')
    print(f'Now: {now}')
    

# Results are a key value dict with each check as its called in DB, 
# with the results of that check as the value
def pointsResults(results,pointsystem):
    points = 0
    # for each check in points system - Names of checks
    for check in pointsystem:
        # Look in results dict and find check key and get value
        checkResult = results.get(check[0])
        minrequirementscheck = results.get(check[3])
        # CPU exception
        if check == 'cpu_time':
            if checkResult <= 0.5:
                points = points+(check[1]*check[2])
            else:
                points = points+0
        # Website exception 
        elif check == 'website':
            points = points+(check[1]*check[2])
        # For all other scores if result is True
        else:
            if checkResult == True:
                points = points+(check[1]*check[2])
            # If checkresult fails and its a minimum requirement deduct 1000 points, so the guld fails the min point requirements
            elif checkResult == False and minrequirementscheck == True:
                points = points-1000
            else:
                points = points+0
    return points

## Final Results print output function to display results to console for each check
def printOuput(results,description):
    result = results[0]
    if result == True:
        colorstart = core.bcolors.OKGREEN
    else:
        colorstart = core.bcolors.WARNING
    return  print(description,colorstart,result,core.bcolors.ENDC)
    

def finalresults(cpucheck):
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
        producercpu = cpu.getcpustats()
    # Get points system
    pointsystem =  db_connect.getPoints()
    # Get list of delphioracles and store for use
    producersoracle = delphi.delphioracle_actors()
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
            cpu_time = (1.0)
        else: 
            cpu_time = cpu.cpuresults(producer,producercpu)
        print("CPU latency on EOS Mechanics below 2 ms on average:",core.bcolors.OKYELLOW, cpu_time,core.bcolors.ENDC,"ms")
        cpuavg = cpu.cpuAverage(producer)
        print("CPU latency average over 30days:",core.bcolors.OKYELLOW, cpuavg,core.bcolors.ENDC,"ms")
        
        # v1 History check
        full_history = history.check_history_v1(producer,'history-v1')
        printOuput(full_history,"Running a v1 History node: ")

        # v2 Hyperion mainnet check
        hyperion_v2 = history.check_hyperion(producer,'hyperion-v2')
        printOuput(hyperion_v2,"Running a v2 Hyperion node: ")

        # v2 Hyperion mainnet Full/Partial check
        hyperion_v2_full = history.check_hyperion(producer,'hyperion-v2',partialtest=True)
        printOuput( hyperion_v2_full,"Running a v2 Hyperion Full node: ")

        # v2 Hyperion testnet check
        hyperion_v2_testnet = history.check_hyperion(producer,'hyperion-v2',testnet=True)
        printOuput(hyperion_v2_testnet,"Running a v2 Hyperion testnet node: ")

        # v2 Hyperion testnet Full/Partial check
        hyperion_v2_testnet_full = history.check_hyperion(producer,'hyperion-v2',testnet=True,partialtest=True)
        printOuput(hyperion_v2_testnet_full,"Running a v2 Hyperion Full testnet node: ")

        # Atomic Assets API
        atomic_api = atomic.check_atomic_assets(producer,'atomic-assets-api')
        printOuput(atomic_api,"Running a atomic assets Api: ")

        # Set snapshots to False until we find a way
        snapshots = [False,'oops']

        seed_node = p2p.check_P2P(producer,'p2p_endpoint')
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
            'snapshots': snapshots[0],
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
            snapshots[0], 
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
        score = pointsResults(pointslist,pointsystem)
        print("Final Tech points:",core.bcolors.OKGREEN,score,core.bcolors.ENDC)
        # Add final sore to list
        resultslist.append(score)
        # Add metansnapshot_date to final tuple
        resultslist.append(requests.metasnapshot_date)
        # Turn list into tuple read for Postgres
        resultstuple = tuple(resultslist)
        finaltuple.append(resultstuple)
    return finaltuple



def main(cpucheck):
    if cpucheck:
        print(core.bcolors.OKYELLOW,f"{'='*100}\nCPU is being checked ",core.bcolors.ENDC)
    else:
        print(core.bcolors.OKYELLOW,f"{'='*100}\nCPU is not being checked ",core.bcolors.ENDC)
    # Get Todays date minus 1 minutes - see db_connect.createSnapshot for reasoning
    now = datetime.now() - timedelta(minutes=1)
    print(core.bcolors.OKYELLOW,f"{'='*100}\nTime: ",now,core.bcolors.ENDC)
    # If last runtime was within 2 hours, skip running process.
    # Get list of producers
    print(core.bcolors.OKYELLOW,f"{'='*100}\nGetting list of producers on chain ",core.bcolors.ENDC)
    producersList = producers.producer_chain_list()
    # Update producers to DB
    db_connect.producerInsert(producersList)
    # Delete all nodes from table
    print(core.bcolors.OKYELLOW,f"{'='*100}\nRemoving existing nodes from DB ",core.bcolors.ENDC)
    db_connect.nodesDelete('oig.nodes')
    # Add nodes to DB
    print(core.bcolors.OKYELLOW,f"{'='*100}\nGetting list of mainnet nodes from JSON files ",core.bcolors.ENDC)
    mainnet_nodes = nodes.node_list()
    db_connect.nodesInsert(mainnet_nodes)
    print(core.bcolors.OKYELLOW,f"{'='*100}\nGetting list of testnet nodes from JSON files ",core.bcolors.ENDC)
    testnet_nodes = nodes.node_list(testnet=True) # Tesnet = True so collect testnet nodes from json files
    db_connect.nodesInsert(testnet_nodes)
    # Get all results and save to DB
    results = finalresults(cpucheck) # Set True to check CPU , False to ignore
    db_connect.resultsInsert(results)
    # Take snapshot
    takeSnapshot(now)

if __name__ == "__main__":
    my_parser = argparse.ArgumentParser()
    my_parser.add_argument('--ignorecpucheck', default=True, action="store_false")
    my_parser.add_argument('--ignorelastcheck',default=False, action="store_true")
    my_parser.add_argument('--bp', action="store")
    args = my_parser.parse_args()
    cpucheck = args.ignorecpucheck
    ignorelastcheck = args.ignorelastcheck
    singlebp = args.bp
    now = datetime.now() - timedelta(minutes=1)
    # If lastcheck is False
    if not lastCheck(now,ignorelastcheck):
        print("Not running as ran withtin last 2 hours")
    else:
        main(cpucheck)
        #print(cpu.getcpustats())
        #print(atomic.check_atomic_assets('dapplica','atomic-assets-api'))
        #print(atomic.getAtomicTemplates('https://aa.dapplica.io','kogsofficial'))
        #print(atomic.getAtomicSchema('https://aa.dapplica.io','kogsofficial'))
        #print(atomic.getAtomicassets('https://aa.dapplica.io'))

        

## Invdividual BP check (ignoring both CPU checks an lastcheck )
# python3 producer-data.py --ignorelastcheck --ignorecpucheck --bp eosriobrazil

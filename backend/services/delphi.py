import utils.requests as requests
import utils.eosio as eosio
import utils.core as core
import services.Messages as messages

def delphioracle_actors():
    print(core.bcolors.OKYELLOW,f"{'='*100}\nGetting Delphi Oracle Data ",core.bcolors.ENDC)
    chain = "mainnet"
    #Get list of guilds posting to delphioracle looking at actions, save last 100 actions.
    delphi_actions = requests.get_actions_data("delphioracle","100")
    actions = eosio.get_stuff(eosio.HyperionNodeMainnet1,delphi_actions,'action',chain)
    guilds = actions['simple_actions']
    # Create empty list
    producer_final = []
    # Create emtpy dictinary
    proddict = {}
    for i in guilds:
        # create copy of dict and call it new
        new = proddict.copy()
        if len(i['data']['quotes']) < 3:
            continue
        else:
            producer_final.append(i['data']['owner'])
            producer_final = list(dict.fromkeys(producer_final))
    # Returns list of guilds with duplicates removed   
    return producer_final



# Returns tuple list with producers in delphioracle True or False
def delphiresults(producer,oracledata):
     producersoracle = oracledata
     if producer in producersoracle:
        return True, messages.CHECK_ORACLE_FEED(True)
     else:
        return False, messages.CHECK_ORACLE_FEED(False)
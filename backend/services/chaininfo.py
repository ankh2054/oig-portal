import utils.requests as requests
import utils.eosio as eosio


"""Get current Guild score from chain"""
def getguildsJSON(chain):
    """Get table data in reverse order""" 
    eval_table = requests.get_table_data("guilds.oig","evaluations","guilds.oig","100",True)
    producers = eosio.getEOStable(eval_table,chain)
    return producers[0]["scores"]

def getScore(scores, producer):
    for score in scores:
        if score['guild'] == producer:
            return score['score']
    return 0







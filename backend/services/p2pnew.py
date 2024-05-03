import utils.core as core
import utils.eosio as eosio
from utils.p2p import AntelopeNetClient
import db_connect
import services.Messages as messages



def verify_block_from_p2p(producer,features):
    p2p = db_connect.getQueryNodes(producer,features,'p2p')
    if p2p is None:
       return False, messages.NOT_IN_JSON('seed')
    try:
         head_block_num, head_block_id = eosio.headblock_headblock_id('P2Pprimary')
    except Exception as e:
         return False, 'Could not obtain headblock from Sentnl API node'
    print(f'P2P node: {p2p[0]}')
    client = AntelopeNetClient(p2p[0])
    response, message = client.connect()
    # If True then check headblock
    print(response, message)
    if response:
        p2p_head_block = message['head']
        if p2p_head_block >= head_block_num:
            return True, messages.CHECK_P2P(True)
        else: 
            return False, messages.CHECK_P2P(False,head_block,head_block_num)
    else:
        return False, message



#import utils.eosio as eosio
import logging
import socket
import binascii
from utils.ds import DataStream
from collections import OrderedDict
import hashlib
import utils.eosio as eosio
import utils.core as core
import db_connect

logger = logging.getLogger(__name__)


class HandshakeData:
    def __init__(self, network_version, chain_id, node_id, key, time, token, sig, p2p_address, last_irreversible_block_num, last_irreversible_block_id, head_num, head_id, os, agent, generation):
        self.network_version = network_version
        self.chain_id = chain_id
        self.node_id = node_id
        self.key = key
        self.time = time
        self.token = token
        self.sig = sig
        self.p2p_address = p2p_address
        self.last_irreversible_block_num = last_irreversible_block_num
        self.last_irreversible_block_id = last_irreversible_block_id
        self.head_num = head_num
        self.head_id = head_id
        self.os = os
        self.agent = agent
        self.generation = generation


def send_bin_to_port(host,port,payload):
    s = socket.socket()
    s.settimeout(10)
    #host, port = host_port_str.split(":")
    #port = int(port)  # convert port from string to integer
    s.connect((host,port))
    s.send(payload)
    received=s.recv(4096)
    s.close()
    return received


def get_info():
    ds = DataStream()
    handshake_data = HandshakeData(
        1206,  # network_version
        "0000000000000000000000000000000000000000000000000000000000000000",  # chain_id
        "0585cab37823404b8c82d6fcc66c4faf20b0f81b2483b2b0f186dd47a1230fdc",  # node_id
        "EOS6kcLA1M7MMnz1fg4ysiXDtwAFGeRANkw2NUGLEvyFXZGK4wrg5",  # key
        int("1574986199433946000") // 1000000000,  # time in seconds
        "0000000000000000000000000000000000000000000000000000000000000000",  # token
        "SIG_K1_111111111111111111111111111111111111111111111111111111111111111116uk5ne",  # sig
        "eosdac-p2p-client:9876 - a6f45b4",  # p2p_address
        0,  # last_irreversible_block_num
        "0000000000000000000000000000000000000000000000000000000000000000",  # last_irreversible_block_id
        0,  # head_num
        "0000000000000000000000000000000000000000000000000000000000000000",  # head_id
        "linux",  # os
        "Ghostbusters",  # agent
        1  # generation
    )
    # Pack data into binary for sending to P2P node
    ds.pack_handshake_message(handshake_data)
    return ds.getvalue()

def get_net_sync_request_message(start_block, end_block):
    ds = DataStream()
    ds.pack_uint32(9) # size of msg (1+2+2)
    ds.pack_uint8(6)  # variant id from https://github.com/AntelopeIO/leap/blob/19f78f9b9a06f55a987e7d4c72f281b2772665ac/plugins/net_plugin/include/eosio/net_plugin/protocol.hpp#L135
    ds.pack_uint32(start_block)
    ds.pack_uint32(end_block)
    return ds.getvalue()

def block_id_from_network_bytes(block_num, raw):
    ds = DataStreamEx(raw)
    l = ds.unpack_uint32()
    w = ds.unpack_uint8()
    sb = ds.unpack_signed_block()
    
    ds = DataStreamEx()
    ds.pack_block_header(sb['signed_block_header']['block_header'])
    
    q = ds.getvalue()
    m = hashlib.sha256()
    m.update(q)

    block_id = '{0:0{1}x}'.format(block_num,8)+binascii.hexlify(m.digest()).decode('utf-8')[8:]
    return block_id

def get_producer(block_num, raw):
    ds = DataStreamEx(raw)
    l = ds.unpack_uint32()
    w = ds.unpack_uint8()
    sb = ds.unpack_signed_block()
    
    producer = sb['signed_block_header']['block_header']['producer']
    return producer

def get_headblock():
    # Try get headblock from backup producer
    try:
        curheadblock = eosio.headblock('P2Pprimary')
        curheadblock_id = eosio.headblock_id('P2Pprimary')
    except:
        return False 
    return curheadblock,curheadblock_id


def verify_block_from_p2p(producer,features):
    # Retrieve P2P node from DB
    p2p = db_connect.getQueryNodes(producer,features,'p2p')
    if p2p == None:
       return False, 'No seed node configured in JSON'
    else:
        # Split host and port
        hostport = core.split_host_port(p2p[0])
    # Obtain headblock to test with 
    try:  
        head_block_num, head_block_id = eosio.headblock_headblock_id('P2Pprimary')
    except:
        return True, 'could not obtain headblock from P2P node'
    # TRy connecting to guild P2P node
    try:
        raw_response = send_bin_to_port(hostport[0], hostport[1], get_net_sync_request_message(head_block_num,head_block_num))
    except Exception as e:
        return False, e
    # Unpack headblock and compare
    try:
        res_block_id = block_id_from_network_bytes(head_block_num, raw_response)
        #print(f'Headblockid  {head_block_id} VS res_block_id: {res_block_id}')
        if res_block_id == head_block_id:
            return True, 'ok'
    except socket.timeout as e:
        return False, e
    except socket.error as e:
        return False, e
    except Exception as e:
        message = "P2P node node too busy to accept my request"
        return False, message

def get_p2p_info(host,port):
   raw_response = send_bin_to_port(host, port, get_info())
   print(f'Raw response: {raw_response}')


class DataStreamEx(DataStream):

    def pack_block_timestamp_type(self, v):
        return self.pack_uint32(v)

    def unpack_block_timestamp_type(self):
        return self.unpack_uint32()

    def unpack_producer_key(self):
        producer_name = self.unpack_account_name()
        block_signing_key = self.unpack_public_key()
        return OrderedDict([
            ("producer_name", producer_name),
            ("block_signing_key", block_signing_key)
        ])

    def unpack_producer_schedule_type(self):
        version = self.unpack_uint32()
        producers = self.unpack_array('producer_key')
        return OrderedDict([
            ("version", version),
            ("producers", producers)
        ])

    def unpack_block_id_type(self):
        return self.unpack_sha256()

    def pack_block_header(self, v):
        self.pack_block_timestamp_type(v['timestamp'])
        self.pack_account_name(v['producer'])
        self.pack_uint16(v['confirmed'])
        self.pack_block_id_type(v['previous'])
        self.pack_checksum256(v['transaction_mroot'])
        self.pack_checksum256(v['action_mroot'])
        self.pack_uint32(v['schedule_version'])
        self.pack_optional('producer_schedule_type', v['new_producers'])
        self.pack_array('extension', v['header_extensions'])

    def unpack_block_header(self):
        timestamp = self.unpack_block_timestamp_type()
        producer  = self.unpack_account_name()
        confirmed = self.unpack_uint16()
        previous  = self.unpack_block_id_type()
        transaction_mroot = self.unpack_checksum256()
        action_mroot = self.unpack_checksum256()
        schedule_version = self.unpack_uint32()
        new_producers = self.unpack_optional('producer_schedule_type')
        header_extensions = self.unpack_array('extension')
        
        return OrderedDict([
            ("timestamp", timestamp),
            ("producer", producer),
            ("confirmed", confirmed),
            ("previous", previous),
            ("transaction_mroot", transaction_mroot),
            ("action_mroot", action_mroot),
            ("schedule_version", schedule_version),
            ("new_producers", new_producers),
            ("header_extensions", header_extensions)
        ])
    
    def unpack_signed_block_header(self):
        block_header       = self.unpack_block_header()
        producer_signature = self.unpack_signature()
        return OrderedDict([
            ("block_header", block_header),
            ("producer_signature", producer_signature)
        ])

    def unpack_signed_block(self):
        signed_block_header = self.unpack_signed_block_header()
        prune_state         = self.unpack_uint8()
        transactions        = self.unpack_array('transaction')

        return OrderedDict([
            ("signed_block_header", signed_block_header),
            ("prune_state", prune_state),
            ("transactions", transactions)
        ])

""" if __name__ == '__main__':
    #ds = DataStream()
    #ds.pack_uint32(9)
    #ds.pack_uint8(6)
    #ds.pack_uint32(1)
    #ds.pack_uint32(1)
    #print(binascii.hexlify(ds.getvalue()))
    host = "172.16.0.77"  # replace with the actual host
    port = 9876  # replace with the actual port
    #block_num = 269889331  # replace with the actual block number
    #block_id = "101600ef4e145765111db400007d416a28fed0abdb19087effcd845a75ed41b8"  # replace with the actual block id
    result = verify_block_from_p2p(host, port)
    print(result)
    #print(get_p2p_info(host, port))
 """
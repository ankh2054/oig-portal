#import utils.eosio as eosio
import logging
import socket
import binascii
from ueosio.ds import DataStream 
from collections import OrderedDict
import hashlib




logger = logging.getLogger(__name__)

hosts = """
172.16.0.77:9876
br.eosrio.io:35668
node-wax-p2p.eosauthority.com:10301
node-wax.eosauthority.com:10301
node-waxtest.eosauthority.com:9393
p2p-node1.neftyblocks.com:9876
p2p-node1.neftyblocks.com:9876
p2p-node2.neftyblocks.com:9876
p2p-node2.neftyblocks.com:9876
p2p-test.waxdaobp.io:9876
p2p-testnet-wax.eosarabia.net:9876
p2p-testnet-wax.eosarabia.net:9876
p2p-testnet.neftyblocks.com:19876
p2p-wax.eosarabia.net:9876
p2p-wax.eosarabia.net:9876
p2p.oiac.io:9876
p2p.testnet.wax.detroitledger.tech:1337
p2p.testnet.waxsweden.org:59676
p2p.wax-test.bountyblok.io:9874
p2p.wax-test.liquidstudios.io:9876
p2p.wax.bountyblok.io:29876
p2p.wax.detroitledger.tech:1337
p2p.wax.liquidstudios.io:9876
p2p.waxdaobp.io:9876
p2p.waxeastern.cn:9876
p2p.waxsweden.org:35777
p2p.waxtest.waxgalaxy.io:9878
p2p.waxtest.waxgalaxy.io:9878
p2p1.wax.greeneosio.com:9876
p2p1.wax.greeneosio.com:9876
p2p2.wax.greeneosio.com:9876
p2ptest.oiac.io:19877
peer-test.hivebp.io:9876
peer.3dkrender.com:9880
peer.wax.alohaeos.com:9876
peer.wax.alohaeos.com:9876
peer.waxtest.alohaeos.com:9876
peer.waxtest.alohaeos.com:9876
peer1-emea.wax.blacklusion.io:4646
peer1-wax-testnet.eosphere.io:9876
peer1-wax.eosphere.io:9876
peer1.hivebp.io:9876
peer1.testnet.wax.blacklusion.io:5757
peer1.testnet.wax.pink.gg:16714
peer1.testnet.wax.tgg.gg:9876
peer1.wax-test.tacocrypto.io:9999
peer1.wax.blacklusion.io:4646
peer1.wax.pink.gg:36715
peer1.wax.tacocrypto.io:9999
peer1.wax.tgg.gg:9876
peer2-wax.eosphere.io:9876
peer2.hivebp.io:9876
peer2.testnet.wax.tgg.gg:9876
peer2.wax.pink.gg:36715
peer2.wax.tgg.gg:9876
seed1-wax-mainnet.wecan.dev:14998
seed1-wax-testnet.wecan.dev:9876
seed2-wax-mainnet.wecan.dev:14998
seed2-wax-testnet.wecan.dev:9876
test.wax.p2p.eosusa.io:19875
wax-bp.wizardsguild.one:8876
wax-p2p.eosdac.io:29876
wax-p2p.eosdac.io:29876
wax-p2p.fi.eosdac.io:19876
wax-p2p.uk.eosdac.io:29873
wax-peer-ca.blokcrafters.io:9876
wax-peer-ca.blokcrafters.io:9876
wax-peer-eu.blokcrafters.io:9876
wax-peer-eu.blokcrafters.io:9876
wax-seed-testnet.eosiomadrid.io:9876
wax-seed.eosiomadrid.io:9876
wax-testnet.cryptolions.io:7987
wax-testnet.cryptolions.io:7987
wax-testnet.dapplica.io:9877
wax-testnet.dapplica.io:9877
wax-testnet.wizardsguild.one:8080
wax.cryptolions.io:9876
wax.cryptolions.io:9876
wax.dapplica.io:9876
wax.dapplica.io:9876
wax.defibox.xyz:9966
wax.defibox.xyz:9966
wax.eu.eosamsterdam.net:9101
wax.greymass.com:35777
wax.greymass.com:35777
wax.p2p.eosusa.io:9875
wax.seed.eosnation.io:9876
waxp2p.ledgerwise.io:21877
waxp2p.ledgerwise.io:21877
waxp2ptestnet.ledgerwise.io:20876
waxp2ptestnet.ledgerwise.io:20876
waxtest-p2p.eosdac.io:49876
waxtest-p2p.eosdac.io:49876
waxtest-peer-eu.blokcrafters.io:19876
waxtest-peer-eu.blokcrafters.io:19876
waxtest-peer-us.blokcrafters.io:19876
waxtest-peer-us.blokcrafters.io:19876
waxtest.defibox.xyz:19876
waxtest.defibox.xyz:19876
waxtest.eu.eosamsterdam.net:9912
waxtest.seed.eosnation.io:9876
waxtest.sentnl.io:9877""".split()



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




def send_bin_to_port(host, port, payloads):
    logger.info(f'Connecting to {host}:{port}')
    s = socket.socket()
    s.settimeout(10)
    try:
        s.connect((host, port))
        logger.info('Connected successfully')
    except Exception as e:
        logger.error(f'Failed to connect: {e}')
        return None

    response = None
    for payload in payloads:
        try:
            logger.info('Sending payload')
            s.send(payload)
            logger.info('Receiving response')
            response = s.recv(4096)
        except Exception as e:
            logger.error(f'Failed to send payload or receive response: {e}')
            return None
    s.close()
    logger.info(f'Received: {response}')
    return response


def send_handshake():
    ds = DataStream()
    handshake_data = HandshakeData(
        1206,  # network_version
        "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4",  # chain_id
        "0585cab37823404b8c82d6fcc66c4faf20b0f81b2483b2b0f186dd47a1230fdc",  # node_id
        "EOS6kcLA1M7MMnz1fg4ysiXDtwAFGeRANkw2NUGLEvyFXZGK4wrg5",  # key
        1574986199433946000,  # time in seconds
        "0000000000000000000000000000000000000000000000000000000000000000",  # token
        "SIG_K1_111111111111111111111111111111111111111111111111111111111111111116uk5ne",  # sig
        "eosdac-p2p-client:9876 - a6f45b4",  # p2p_address
        270651670,  # last_irreversible_block_num
        "1021d116b04246bf3a344caf9c4f103e35c78f75173ea1675d1e3b0e602c0c1f",  # last_irreversible_block_id
        270652006,  # head_num
        "1021d266bebd27bd61f8d794bdabe633d6f11a35c030dde748b0489ab395f625",  # head_id
        "linux",  # os
        "Ghostbusters",  # agent
        1  # generation
    )
    # Pack the handshake data
    ds.pack_handshake_message(handshake_data)
    # Convert the packed data to a byte array
    byte_array = bytearray(ds.getvalue())
    # Calculate the length of the packed data in bytes
    message_length = len(byte_array) + 5 # accounts for size of the message length field itself (4 bytes) and the message type field (1 byte)
   # Now you can use message_length when packing the message size
    ds = DataStream()  # create a new DataStream
    ds.pack_uint32(message_length)  # pack the message length
    ds.pack_uint8(0)  # pack the message type
    ds.write(byte_array)  # append the handshake_data to DataStream object ds
    
    #print(f'Packed data: {ds.getvalue()}')
    #print(f'Handshake_data length {message_length}')

    byte_array = ds.getvalue()
    message_length = len(byte_array)
    #print(f'Message length {message_length}')
    
    return ds.getvalue()


def get_net_sync_request_message(start_block, end_block):
    ds = DataStream()
    ds.pack_uint32(9) # size of msg (1+2+2)
    ds.pack_uint8(6)  # variant id from https://github.com/AntelopeIO/leap/blob/19f78f9b9a06f55a987e7d4c72f281b2772665ac/plugins/net_plugin/include/eosio/net_plugin/protocol.hpp#L135
    ds.pack_uint32(start_block)
    ds.pack_uint32(end_block)
    #print(ds.getvalue())
    byte_array = bytearray(ds.getvalue())
    message_length = len(byte_array) - 4
    #print(f'Message length {message_length}')
    return ds.getvalue()

def unpack_transaction(block_num, raw):
    ds = DataStreamEx(raw)
    l = ds.unpack_uint32()
    w = ds.unpack_uint8()
    sb = ds.unpack_transaction()


def unpack_go_away_message(block_num, raw):
    ds = DataStreamEx(raw)
    l = ds.unpack_uint32()
    w = ds.unpack_uint8()
    sb = ds.unpack_go_away_message()
    return sb

def unpack_handshake_message(raw):
    ds = DataStream(raw)
    l = ds.unpack_uint32()
    w = ds.unpack_uint8()
    sb = ds.unpack_handshake_message()
    return sb

def unpack_time_message(raw):
    ds = DataStreamEx(raw)
    l = ds.unpack_uint32()
    w = ds.unpack_uint8()
    sb = ds.unpack_time_message()
    return sb

def block_header_from_network_bytes(raw):
    ds = DataStreamEx(raw)
    l = ds.unpack_uint32()
    w = ds.unpack_uint8()
    sb = ds.unpack_signed_block()
    
    ds = DataStreamEx()
    ds.pack_block_header(sb['signed_block_header']['block_header'])
    
    q = ds.getvalue()
    return q

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


def verify_block_from_p2p(host, port, block):
    try:
        #raw_response = send_bin_to_port(host, port, get_net_sync_request_message(block, block))
        raw_response = send_bin_to_port(host, port, [send_handshake(),get_net_sync_request_message(block,block)])
        print(raw_response)
    except Exception as e:
         return False, e
    try:
        if raw_response[4] == 2:  # check if the variant id is 2 (go_away_reason)
            reason_dict = unpack_go_away_message(block, raw_response)
            reason = reason_dict['reason']
            return False, f'Go away message: {reason}'
        elif raw_response[4] == 3:
            time_message = unpack_time_message(raw_response)
            return False, f'Time message: {time_message}' 
        elif raw_response[4] == 0:
            handshake_message = unpack_handshake_message(raw_response)
            head_block = handshake_message[10]
            print(f'HeadBlock: {head_block}')
            return handshake_message
        else:
            print('Unpacking signed block')
            block_header = block_header_from_network_bytes(raw_response)
            print(block_header)
            return True, 'ok'
    except socket.timeout as e:
        return False, e
    except socket.error as e:
        return False, e
    except Exception as e:
        message = e
        return False, message



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
    
    def unpack_time_message(self):
        org = self.unpack_int64()
        rec = self.unpack_int64()
        xmt = self.unpack_int64()
        dst = self.unpack_int64()

        return OrderedDict([
            ("org", org),
            ("rec", rec),
            ("xmt", xmt),
            ("dst", dst)
        ])

    def unpack_go_away_message(self):
        reasons = [
            'no reason',
            'self connect',
            'duplicate',
            'wrong chain',
            'wrong version',
            'chain is forked',
            'unlinkable block received',
            'bad transaction',
            'invalid block',
            'authentication failure',
            'some other failure',
            'some other non-fatal condition'
        ]
        reason_code = self.unpack_uint8()
        return OrderedDict([
            ("reason", reasons[reason_code] if reason_code < len(reasons) else "unknown reason"),
            ("node_id", self.unpack_sha256())
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

if __name__ == '__main__':
    #ds = DataStream()
    #ds.pack_uint32(9)
    #ds.pack_uint8(6)
    #ds.pack_uint32(1)
    #ds.pack_uint32(1)
    #print(binascii.hexlify(ds.getvalue()))
    host = "p2p.oiac.io" #"peer.wax.alohaeos.com:9876" #"peer1.testnet.wax.blacklusion.io:5757" #peer.wax.alohaeos.com"  #"172.16.0.77"   # replace with the actual host
    port = 9876 #9876  # replace with the actual port
    block = 269889331  # replace with the actual block number
    #block_id = "10162f33b9cce316a236742626c257e9e4f98aee9f8ed9188ae12ac8a4c1d919"  # replace with the actual block id
    result = verify_block_from_p2p(host, port,block)
    print(result)
"""    for host in hosts:
        host, port = host.split(":")
        port = int(port)
        try:
            result = verify_block_from_p2p(host, port, block_num, block_id)
            print(f'Result for {host}:{port} is {result}')
        except Exception as e:
            print(f'Error for {host}:{port} - {str(e)}')
        print(result)"""


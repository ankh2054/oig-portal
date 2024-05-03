import socket
import threading
from utils.serial_buffer import SerialBuffer
from utils.utils import nanoseconds, random_bytes

class AntelopeNetClient:
  chain_id = '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4'

  def __init__(self, peer):
    self.peer = peer
    self.socket = None
    self.handshake = False
    self.head_block_num = 0
    self.lib_block_num = 0

  def connect(self):
    socket.setdefaulttimeout(15)
    host, port = self.peer.split(':')
    self.socket = socket.socket(
      socket.AF_INET,
      socket.SOCK_STREAM
    )
    try:
      self.socket.connect((host, int(port)))
      return self.receive_messages()
    except Exception as e:
      self.log(repr(e))
      if self.socket: self.socket.close()
      return False, self.log(f"Failed to connect: {repr(e)}")

  def receive_messages(self):
    # While we haven't closed the connection
    while not self.socket._closed:
      data = self.socket.recv(4096)

      # Server closed the connection
      if not data: break

      result = self.handle_net_message(data)
      if isinstance(result, tuple) and result[0] in (True, False):
        return result

    return False, "Connection to socket closed"

  def handle_net_message(self, data):
    buffer = SerialBuffer(data)

    message_length = buffer.read_uint32()
    message_type = buffer.read_uint8()

    self.log("")
    self.log(f'Received [type: {message_type}, bytes: {message_length}]')

    if message_type == 0:  # handshake_message
      return self.handle_handshake_message(buffer)

    elif message_type == 1:  # chain_size_message
      self.log('Chain Size Message')
      chain_size_message = {}

    elif message_type == 2:  # go_away_message
      log_message = self.log('Go Away Message')
      self.socket.close()
      return (False, log_message)

    elif message_type == 3:  # time_message
      return self.handle_time_message(buffer)

    elif message_type == 4:  # notice_message
      return self.handle_notice_message(buffer)

    else:
      log_message = self.log('Unknown message type:', message_type)
      self.socket.close()
      return (False, log_message)

  def perform_handshake(self):
    body = SerialBuffer(bytearray(512))

    # Network version (uint16)
    body.write_uint16(1212)

    # Chain ID (32 bytes)
    body.write_uint8_array(bytearray.fromhex(self.chain_id))

    # Node ID (32 bytes)
    body.write_uint8_array(random_bytes(32))
    # body.write_uint8_array(bytearray.fromhex(self.node_id))

    body.write_uint8(0)  # Public key type (K1 type = 0)
    body.write_buffer(bytearray([0]*33))  # Public key data (33 zero bytes)

    # Message Time (uint64)
    body.write_uint64(nanoseconds())
    # print("nanoseconds:", nanoseconds())
    # body.write_uint64(1714472826732002560)

    # Token (32 bytes)
    body.write_buffer(bytearray([0]*32))

    # Signature (65 bytes)
    body.write_uint8(0);
    body.write_buffer(bytearray([0]*65))

    # P2P Address (string)
    body.write_string('127.0.0.1:9876')

    # LIB Block Num (uint32)
    body.write_uint32(0)

    # LIB Block ID (32 bytes)
    body.write_buffer(bytearray([0]*32))

    # Head Block Num (uint32)
    body.write_uint32(0)

    # Head Block ID (32 bytes)
    body.write_buffer(bytearray([0]*32))

    # OS (string)
    body.write_string('Linux')

    # Agent (string)
    body.write_string('Antelope P2P Client')

    # Generation (uint16)
    body.write_uint16(1)

    header = SerialBuffer(bytearray(5))
    header.write_uint32(body.offset + 1)
    header.write_uint8(0)

    message = header.filled + body.filled
    try:
      self.socket.send(message)
      # existing code to build and send the handshake message
      # self.log("Handshake message sent")
    except Exception as e:
      self.log(f"Error during handshake: {repr(e)}")
    finally:
      # self.log("Handshake method completed")
      self.handshake = True

  def send_time_message(self):
    body = SerialBuffer(bytearray(4 * 8))
    body.write_uint64(0)
    body.write_uint64(0)
    body.write_uint64(nanoseconds())
    body.write_uint64(0)

    header = SerialBuffer(bytearray(5))
    header.write_uint32(body.offset + 1)
    header.write_uint8(3)
    message = header.filled + body.filled
    self.socket.send(message)
  
  # Utility methods
  def log(self, *args):
    formatted =  " ".join([str(arg) for arg in args])
    #print(f"[{self.peer}] {formatted}")
    return formatted

  def handle_handshake_message(self, buffer):
    self.log('Handshake Message')
    peer_handshake = {
      'networkVersion': buffer.read_uint16(),
      'chainId': buffer.read_uint8_array(32).hex(),
      'nodeID': buffer.read_uint8_array(32).hex(),
      'keyType': buffer.read_uint8(),
      'publicKey': buffer.read_uint8_array(33).hex(),
      'time': buffer.read_uint64(),
      'token': buffer.read_uint8_array(32).hex(),
      'signatureType': buffer.read_uint8(),
      'signature': buffer.read_uint8_array(65).hex(),
      'p2pAddress': buffer.read_string(),
      'libBlockNum': buffer.read_uint32(),
      'libBlockId': buffer.read_uint8_array(32).hex(),
      'headBlockNum': buffer.read_uint32(),
      'headBlockId': buffer.read_uint8_array(32).hex(),
      'os': buffer.read_string(),
      'agent': buffer.read_string(),
      'generation': buffer.read_uint16(),
    }

    if peer_handshake['chainId'] != self.chain_id:
      log_message = self.log('Chain ID mismatch')
      self.socket.close()
      return (False, log_message)

    self.head_block_num = peer_handshake['headBlockNum']
    self.lib_block_num = peer_handshake['libBlockNum']

    info = {
      'generation': peer_handshake['generation'],
      'networkVersion': peer_handshake['networkVersion'],
      'head': peer_handshake['headBlockNum'],
      'lib': peer_handshake['libBlockNum'],
      'time': peer_handshake['time'],
      'agent': peer_handshake['agent'],
      'p2pAddress': peer_handshake['p2pAddress'],
    }

    return (True, info)
  
  def handle_time_message(self, buffer):
    self.log('Time Message')
    time_message = {
      'org': buffer.read_uint64(),
      'rec': buffer.read_uint64(),
      'xmt': buffer.read_uint64(),
      'dst': buffer.read_uint64(),
    }
    self.log('xmt:', time_message['xmt'])
    if not self.handshake:
      self.perform_handshake()
    return None
  
  def handle_notice_message(self, buffer):
    self.log('Notice Message')
    notice_message = {
      'known_trx': {
        'mode': None,
        'pending': None,
        'ids': []
      },
      'known_blocks': {
        'mode': None,
        'pending': None,
        'ids': []
      }
    }

    notice_message["known_trx"]["mode"] = buffer.read_uint32();
    notice_message["known_trx"]["pending"] = buffer.read_uint32(); 

    arr_len = buffer.read_var_uint32()
    for _ in range(arr_len):
      id = buffer.read_uint8_array(32)
      notice_message['known_trx']['ids'].append(id.hex())

    notice_message["known_blocks"]["mode"] = buffer.read_uint32();
    notice_message["known_blocks"]["pending"] = buffer.read_uint32();

    arr_len2 = buffer.read_var_uint32()
    for _ in range(arr_len2):
      id = buffer.read_uint8_array(32)
      notice_message['known_blocks']['ids'].append(id.hex())

    self.log(notice_message)
    return None

#test_client = AntelopeNetClient(
#  "waxp2p.sentnl.io:9876"
#)
#test_client.connect()

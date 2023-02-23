import utils.core as core
import socket
import db_connect



def check_P2P(producer,features):
   # Get P2P host and port
   p2p = db_connect.getQueryNodes(producer,features,'p2p')
   if p2p == None:
       return False, 'No seed node configured in JSON'
   # Slit host and port
   hostport = core.split_host_port(p2p[0])
   s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
   try:
      s.connect((hostport[0],hostport[1]))
      s.shutdown(2)
      return True, 'ok'
   except:
      error = hostport[0]+':'+str(hostport[1])+'\nError: Server and or port not responding'
      return False, error
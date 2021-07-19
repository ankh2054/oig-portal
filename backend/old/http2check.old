import socket
import ssl
from urllib.parse import urlparse

socket.setdefaulttimeout(5)
headers = {"user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"}

def check_http2(domain_name,port,checktype):
    try:
        HOST = urlparse(domain_name).hostname
        PORT = int(port)
        ctx = ssl.create_default_context()
        ctx.set_alpn_protocols(['h2', 'spdy/3', 'http/1.1'])
      

        conn = ctx.wrap_socket(
            socket.socket(socket.AF_INET, socket.SOCK_STREAM), server_hostname=HOST)

        conn.connect((HOST,PORT))

        pp = conn.selected_alpn_protocol()
        tls = conn.version()

        #HTTP2 check
        if  checktype == 'http2chk':
            if pp == "h2":
                return True, 'ok'
            else:
                command = "curl -sI https://{HOST}:{PORT} -o/dev/null -w '%{http_version}'"
                error = command.format(HOST=HOST, PORT=PORT, http_version='{http_version}\n')+"\nError: HTTP version 1.1 only"
                return False , error     
            conn.shutdown()
            conn.close()
        # TLS check
        if checktype == 'tlschk':
            return tls, 'ok'
    
    except Exception as e:
        command = "curl -sI https://{HOST}:{PORT} -o/dev/null -w '%{http_version}'"
        error = command.format(HOST=HOST, PORT=PORT, http_version='{http_version}\n')+'\n'+str(e)
        return False, error

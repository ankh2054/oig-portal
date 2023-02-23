import socket
import ssl
from urllib.parse import urlparse
import time

socket.setdefaulttimeout(5)
headers = {"user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"}

def check_tls(domain_name,port):
    tls = ""
    tlsver = [ssl.TLSVersion.SSLv3,ssl.TLSVersion.TLSv1,ssl.TLSVersion.TLSv1_1,ssl.TLSVersion.TLSv1_2,ssl.TLSVersion.TLSv1_3,ssl.TLSVersion.TLSv1_3]
    i = 0
    HOST = urlparse(domain_name).hostname
    PORT = int(port)
    while not tls and i != 5:
           try: 
                ctx = ssl.create_default_context()
                ctx.set_alpn_protocols(['h2', 'spdy/3', 'http/1.1'])
                conn = ctx.wrap_socket(
                    socket.socket(socket.AF_INET, socket.SOCK_STREAM), server_hostname=HOST)
                ctx.maximum_version = tlsver[i]
                i += 1
                conn.connect((HOST,PORT))
                tls = conn.version()
                return tls, 'ok'
           except (OSError, ValueError):
                print(ctx.maximum_version," Not available")
           except ssl.SSLError as sslErr:
                conn.shutdown(socket.SHUT_RDWR)
                conn.close()
                print(sslErr)
    return False, 'tls_dowgrade i does not equal 5'

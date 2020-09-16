import socket
import ssl
from urllib.parse import urlparse

socket.setdefaulttimeout(5)
headers = {"user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"}

def check_tls(domain_name,port):
    HOST = urlparse(domain_name).hostname
    PORT = int(port)
    tls = ""
    while not tls:
        try: 
            ctx = ssl.create_default_context()
            ctx.set_alpn_protocols(['h2', 'spdy/3', 'http/1.1'])
            conn = ctx.wrap_socket(
                socket.socket(socket.AF_INET, socket.SOCK_STREAM), server_hostname=HOST)
            ctx.maximum_version = ssl.TLSVersion.SSLv3
            conn.connect((HOST,PORT))
            tls = conn.version()
            return tls, 'ok'
        except (OSError, ValueError):
            print(ctx.maximum_version," Not available")
        except ssl.SSLError as sslErr:
            conn.shutdown(socket.SHUT_RDWR)
            conn.close()
            print(sslErr)
        try: 
            ctx = ssl.create_default_context()
            ctx.set_alpn_protocols(['h2', 'spdy/3', 'http/1.1'])
            conn = ctx.wrap_socket(
                socket.socket(socket.AF_INET, socket.SOCK_STREAM), server_hostname=HOST)
            ctx.maximum_version = ssl.TLSVersion.TLSv1
            conn.connect((HOST,PORT))
            tls = conn.version()
            return tls, 'ok'
        except (OSError, ValueError):
            print(ctx.maximum_version," Not available")
        except ssl.SSLError as sslErr:
            conn.shutdown(socket.SHUT_RDWR)
            conn.close()
            print(sslErr)
        try: 
            ctx = ssl.create_default_context()
            ctx.set_alpn_protocols(['h2', 'spdy/3', 'http/1.1'])
            conn = ctx.wrap_socket(
                socket.socket(socket.AF_INET, socket.SOCK_STREAM), server_hostname=HOST)
            ctx.maximum_version = ssl.TLSVersion.TLSv1_1
            conn.connect((HOST,PORT))
            tls = conn.version()
            return tls, 'ok'
        except (OSError, ValueError):
            print(ctx.maximum_version," Not available")
        except ssl.SSLError as sslErr:
            conn.shutdown(socket.SHUT_RDWR)
            conn.close()
            print(sslErr)
        try: 
            ctx = ssl.create_default_context()
            ctx.set_alpn_protocols(['h2', 'spdy/3', 'http/1.1'])
            conn = ctx.wrap_socket(
                socket.socket(socket.AF_INET, socket.SOCK_STREAM), server_hostname=HOST)
            ctx.maximum_version = ssl.TLSVersion.TLSv1_2
            conn.connect((HOST,PORT))
            tls = conn.version()
            return tls, 'ok'
        except (OSError, ValueError):
            print(ctx.maximum_version," Not available")
        except ssl.SSLError as sslErr:
            conn.shutdown(socket.SHUT_RDWR)
            conn.close()
            print(sslErr)
        try: 
            ctx = ssl.create_default_context()
            ctx.set_alpn_protocols(['h2', 'spdy/3', 'http/1.1'])
            conn = ctx.wrap_socket(
                socket.socket(socket.AF_INET, socket.SOCK_STREAM), server_hostname=HOST)
            ctx.maximum_version = ssl.TLSVersion.TLSv1_3
            conn.connect((HOST,PORT))
            tls = conn.version()
            return tls, 'ok'
        except (OSError, ValueError):
            print(ctx.maximum_version," Not available")
        except ssl.SSLError as sslErr:
            conn.shutdown(socket.SHUT_RDWR)
            conn.close()
            print(sslErr)
    
                
#print(check_tls('https://waxapi.sentnl.io','4343'))
#print(check_tls('https://api.wax.bountyblok.io','443'))
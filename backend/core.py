#import requests
#import json
#import time
import re
#import random
import socket
import ssl
from urllib.parse import urlparse



class bcolors:
    HEADER = '\033[95m'
    OKYELLOW = '\033[93m'
    OKGREEN = '\033[92m'
    OKBLUE = '\033[94m'
    WARNING = '\033[91m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'



# Python to curl request
def curl_request(url,method,headers,payloads):
    # construct the curl command from request
    command = "curl -v -H {headers} {data} -X {method} {uri}"
    data = "" 
    if payloads:
        payload_list = ['"{0}":"{1}"'.format(k,v) for k,v in payloads.items()]
        data = " -d '{" + ", ".join(payload_list) + "}'"
    header_list = ['"{0}: {1}"'.format(k, v) for k, v in headers.items()]
    header = " -H ".join(header_list)
    return command.format(method=method, headers=header, data=data, uri=url)


def portRegex(inputString):
    # Checks whether a URL contains a port number
    return bool(re.search(":([0-9]+)", inputString))

# Splits host from port 
def split_host_port(string):
    if not string.rsplit(':', 1)[-1].isdigit():
        return (string, None)
    # Split string into a list, maxspit 1
    string = string.rsplit(':', 1)
    host = string[0]  # 1st index is always host
    port = int(string[1])
    return (host, port)
    

## Settings for check_http2 and tls_check
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
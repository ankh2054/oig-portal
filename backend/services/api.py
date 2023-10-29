import utils.core as core
import utils.requests as requests
import utils.eosio as eosio
import db_connect


def check_api(producer,checktype):
    if checktype == "httpchk":
        api = db_connect.getQueryNodes(producer,'chain-api','http')
    else:
        api = db_connect.getQueryNodes(producer,'chain-api','api')
    # If there is no API or Full node in DB return False
    #if None in api:
    if api == None:
        return False, 'No API node available in JSON'
    else:
        info = str(eosio.Api_Calls('v1', 'get_info'))
    URL = api[0]+info
    curlreq = core.curl_request(URL,'GET',False)
    reqJSON = requests.getJSON()
    response = reqJSON.getRequest(URL,trydo='return')
    if response:
        # Check if API contains WAX chain ID - verifies its alive
        if checktype == "apichk" or checktype == 'httpchk':
            try:
                jsonres = response.json()
            except Exception as err:
                error = 'not providing JSON: '+str(err)
                return False, error
            chainid = jsonres.get('chain_id')
            if chainid == requests.mainnet_id:
                #resptime = round(responsetimes,2)
                #print('Response time: ', resptime)
                return True, 'ok'
            else:
                error = curlreq+'\nError: has the wrong chain ID or HTTP is not working'
                return False, error
        # Checks for Access-Control-Allow-Origin = *
        elif checktype == "corschk":
            try:
                headers = response.headers['Access-Control-Allow-Origin']
                if headers == "*":
                    return True, 'ok'
                else:
                    return False, str(headers)
            except Exception as err:
                error = f'Timeout error connecting to: {api}'
                print(f'Other error occurred: {err}')
                return False,  error
    else:
        return False, response.reason



def api_security(producer,features,sectype):
    # Check through all nodes
    apis = db_connect.getQueryNodes(producer,features,'all_apis')
    # If there is no API or Full node in DB return True, as no security to test
    if apis == None:
        return True, 'No APIs to test for', sectype
    else:
        if sectype == 'producer_api':
            info = str(eosio.Api_Calls('producer', 'paused'))
        elif sectype == 'net_api':
            info = str(eosio.Api_Calls('net', 'connections'))
        elif sectype == 'db_size_api':
            info = str(eosio.Api_Calls('db_size', 'get'))
    # Empty list for API results
    apilist = []
    # Loop over APIs and check security for particular api
    for api in apis:
        try:
            curlreq = core.curl_request(api+info,'POST',False)
            response = requests.s.get(api+info, timeout=requests.defaulttimeout, verify=False)
            # If the response was successful, no Exception will be raised
            response.raise_for_status()
        except requests.HTTPError as http_err:
            #print(f'HTTP error occurred: {http_err}')
            message = True
        except Exception as err:
            #print(f'Other error occurred: {err}')
            message = True
        # If no error is returned and valid json is returned then API is running
        else:
            message = False
        # API results + api itself
        apiresult = api,message
        # Append API + result to apilist
        apilist.append(apiresult)
    for api in apilist:
        if api[1] != True:
            error = str(sectype) + " is enabled on " + api[0] + " this feature should be disabled: " + str(curlreq)
            return False, error
        else:
           True # Dont return here otherswise loop stops
    # If not False has been found return True
    return True, 'ok'

def check_https(producer,checktype):
    api = db_connect.getQueryNodes(producer,'chain-api','https')
    # If there is no API or Full HTTPS node in DB return False
    if api == None:
        return False, 'No API node available in JSON'
     # If the URL contains Hyperion then change URL request string
    else:
        info = str(eosio.Api_Calls('v1', 'get_info'))
    try:
        curlreq = core.curl_request(api[0]+info,'GET',False)
        response = requests.s.get(api[0]+info, timeout=requests.defaulttimeout)
        # If the response was successful, no Exception will be raised
        response.raise_for_status()
    except requests.HTTPError as http_err:
        print(f'HTTP error occurred: {http_err}')  # Python 3.6
        error = curlreq+'\n'+str(http_err)
        return False, error
    except Exception as err:
        print(f'Other error occurred: {err}')  # Python 3.6
        error = curlreq+'\n'+f'Timeout error connecting to: {api}'
        return False, error
    else:
        # Check if HTPS API contains WAX chain ID - verifies it's alive
        if checktype == "httpschk":
            try:
                jsonres = response.json()
                chainid = jsonres.get('chain_id')
            except:
                return False, 'none JSON response received'
            if chainid == requests.mainnet_id:
                return True, 'ok'
            else:
                error = curlreq+'\nError:Wrong chain ID or HTTPS not working'
                return False, error
        elif checktype == "http2chk":
            httpsendpoint = api[0]
            # If the URL contains a port number, strip the port and assign to port
            if core.portRegex(httpsendpoint):
                portsplit = httpsendpoint.rsplit(':', 1)
                port = portsplit[1]
            # If no port number assigned presume port 443, as HTTP2 works with TLS
            else:
                port = "443"
            return core.check_http2(httpsendpoint,port,checktype)
        elif checktype == "tlschk":
            httpsendpoint = api[0]
            # If the URL contains a port number, strip the port and assign to port
            if core.portRegex(httpsendpoint):
                portsplit = httpsendpoint.rsplit(':', 1)
                port = portsplit[1]
            # If no port number assigned presume port 443, as HTTP2 works with TLS
            else:
                port = "443"
            return core.check_tls(httpsendpoint,port)
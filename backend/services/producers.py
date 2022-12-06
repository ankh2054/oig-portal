import utils.requests as requests
import eosio
import db_connect


def producerlist(chain):
    prod_table = requests.get_table_data("eosio","producers","eosio","200")
    producers = eosio.getEOStable(prod_table,chain)
    # Remove WAX guilds and guilds with no website
    prodremove = ['https://wax.io', '', 'https://bp.eosnewyork.io', 'https://bp.nebulaprotocol.com', 'https://wax.infinitybloc.io', 'https://blockmatrix.network', 'https://hyperblocks.pro/', 'https://strongblock.io/', 'https://waxux.com', 'https://skinminerswax.com', 'https://sheos.org','https://teloscentral.com','https://eossweden.eu','https://dmail.co', 'https://maltablock.org', 'https://wax.csx.io', 'https://xpoblocks.com']
    producer_final = []
    proddict = {}
    for i in producers:
        if i['url'] not in prodremove:
            new = proddict.copy()
            new.update({'owner': i['owner'],'url': i['url'] })
            producer_final.append(new)
    return producer_final

def get_testnetJSON(producer):
    producers = producerlist('testnet')
    for guild in producers:
        if guild['owner'] == producer:
            return guild['url']

## Get list of producers and produce tuple
def producer_chain_list():
    producers = producerlist('mainnet') #
    # Create empty list
    top21producers = eosio.producerSCHED()
    producer_final = []
    for i in producers:
        url = i['url']
        url = url.rstrip('/')+'/chains.json'
        reqJSON = requests.getJSON()
        response = reqJSON.getRequest(url,trydo='continue')
        try:
                json_response = response.json()
                waxjson = json_response['chains'][requests.mainnet_id]
                try:
                    print(f'Looking for testnet chains json on mainnet URL')
                    waxtestjson = json_response['chains'][requests.testnet_id]
                    waxtestjson = waxtestjson.lstrip('/')
                    waxtestjson = url + '/'+waxtestjson
                except:
                    print(f'Looking for testnet chains json on testnet URL')
                    try:
                        guildtesturl = get_testnetJSON(i['owner'])
                        guildtesturl = guildtesturl.rstrip('/')
                        response = requests.get(url=guildtesturl + '/chains.json', timeout=requests.defaulttimeout)
                        json_response = response.json()
                        waxtestjson = json_response['chains'][requests.testnet_id]
                        waxtestjson = waxtestjson.lstrip('/')
                        waxtestjson = guildtesturl + '/'+waxtestjson
                    except Exception as err:
                        print(f'Could not find testnet JSON')
                        waxtestjson = ""
                        pass
                waxjson = waxjson.lstrip('/')
        except requests.JSONDecodeError:
                print('JSON parsing error')
                waxjson = ""
        except requests.HTTPError as http_err:
                print(f'HTTP error occurred: {http_err}')
                continue
        except Exception as err:
                print(f'Other error occurred: {err}')  
                continue
        else:
                try:
                    # Get response data in JSON
                    response = requests.r.get(url=url+"/"+waxjson)
                    json_response = response.json()
                    # Extract org candidate name
                    candidate_name = json_response['org']['candidate_name']
                    try:
                        country_code = json_response['org']['location']['country']
                    except:
                        country_code = None
                    try:
                        logo_256 = json_response['org']['branding']['logo_256']
                    except: 
                        logo_256 = None
                except requests.JSONDecodeError:
                    print('JSON parsing error')
                    continue
                except requests.HTTPError as http_err:
                    print(f'HTTP error occurred: {http_err}')
                    continue  
                except Exception as err:
                    print(f'Other error occurred: {err}')  
                    continue
                else:
                    # is producer currently in top21
                    guild = i['owner']
                    top21 = guild in top21producers
                    # Get current active status from DB if it exists.
                    try:
                        active = db_connect.getProducerStatus(guild)[0][0]
                    # If not means Guild is new so set to active.
                    except:
                        active = True
                        print("Guild not in DB setting active to True")
                    thistuple = (guild, requests.metasnapshot_date ,candidate_name, url, url + '/'+waxjson, waxtestjson, url + '/chains.json', logo_256, top21, country_code, active)
                    producer_final.append(thistuple)
    return producer_final
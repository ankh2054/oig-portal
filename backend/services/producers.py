import utils.requests as requests
import utils.eosio as eosio
import db_connect
import services.Messages as messages
from fuzzywuzzy import process


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
    # Extract only the 'owner' values from the producers list
    producer_names = [p['owner'] for p in producers]
    # Find the closest match for the given producer name
    closest_match, _ = process.extractOne(producer, producer_names)
    # Find the URL for the closest match
    for guild in producers:
        if guild['owner'] == closest_match:
            return guild['url']

## Get list of producers and produce tuple
def producer_chain_list():
    producers = producerlist('mainnet') #
    # Create empty list
    top21producers = eosio.producerSCHED()
    producer_final = []
    for i in producers:
        guild = i['owner']
        url = i['url']
        print(f'Currently processing Guild:{guild} with website {url}')
        urlchains = url.rstrip('/')+'/chains.json'
        # Access active key associated with guild
        getAccountURL = eosio.HyperionNodeMainnet1 + str(eosio.Api_Calls('v2', f'state/get_account?account={guild}'))
        reqJSON = requests.getJSON()
        response = reqJSON.getRequest(urlchains,trydo='continue')
        Accountrespsonse  =  reqJSON.getRequest(getAccountURL,trydo='continue')
        try:
                accountDetails = Accountrespsonse.json()
                Activekey = accountDetails['account']['permissions'][0]['required_auth']['keys'][0]['key']
                json_response = response.json()
                waxjson = json_response['chains'][requests.mainnet_id]
                try:
                    print(f'Looking for testnet chains json on mainnet URL')
                    waxtestjson = json_response['chains'][requests.testnet_id]
                    waxtestjson = waxtestjson.lstrip('/')
                    waxtestjson = url + '/' + waxtestjson
                    # Attempt to verify the existence of the file
                    response = requests.r.get(url=waxtestjson, timeout=requests.defaulttimeout)
                    try:
                        # Try to parse the response as JSON to ensure it's a valid JSON file
                        response.json()
                    except ValueError:
                        # If parsing fails, raise an exception indicating the response is not a valid JSON
                        raise Exception("Response is not a valid JSON file")
                    if response.status_code != 200:
                        raise Exception("Mainnet URL not found")
                except:
                    print(f'Looking for testnet chains json on testnet URL')
                    try:
                        guildtesturl = get_testnetJSON(guild)
                        if guildtesturl:  # Ensure guildtesturl is not None or empty
                            guildtesturl = guildtesturl.rstrip('/')
                            response = requests.r.get(url=guildtesturl + '/chains.json', timeout=requests.defaulttimeout)
                            if response.status_code == 200:
                                json_response = response.json()
                                waxtestjson = json_response['chains'][requests.testnet_id]
                                waxtestjson = waxtestjson.lstrip('/')
                                waxtestjson = guildtesturl + '/' + waxtestjson
                                print(waxtestjson)
                            else:
                                raise Exception("Testnet URL not found")
                        else:
                            raise Exception("Guild test URL is empty")
                    except Exception as err:
                        print(f'Could not find testnet JSON for {guild}: {err}')
                        waxtestjson = ""
                waxjson = waxjson.lstrip('/')
        except requests.JSONDecodeError as e:
                print(f"{messages.NOT_JSON(False)} Error: {str(e)}")
                waxjson = ""
        except requests.HTTPError as http_err:
                print(messages.GENERAL_ERROR(http_err))
                continue
        except Exception as err:
                print(messages.GENERAL_ERROR(err))  
                continue

        try:
            # Get response data in JSON
            response = requests.r.get(url=url+"/"+waxjson)
            json_response = response.json()
            # Extract org candidate name
            candidate_name = json_response['org']['candidate_name']
            # Try and get testnet BP name
            try:
                 responseTesnet = requests.r.get(waxtestjson)
                 json_repsonse_testnet = responseTesnet.json()
                 owner_name_testnet = json_repsonse_testnet['producer_account_name']
            except:
                owner_name_testnet = guild
            try:
                country_code = json_response['org']['location']['country']
            except:
                country_code = None
            try:
                logo_256 = json_response['org']['branding']['logo_256']
            except: 
                logo_256 = None
        except requests.JSONDecodeError as e:
            print(f"{messages.NOT_JSON(False)} Error: {str(e)}")
            continue
        except requests.HTTPError as http_err:
            print(f"{messages.GENERAL_ERROR(http_err)} Error: {http_err}")
            continue  
        except Exception as err:
            print(f"{messages.GENERAL_ERROR(err)} Error: {err}")
            continue
        # is producer currently in top21
        top21 = guild in top21producers
        # Get current active status from DB if it exists.
        try:
            active = db_connect.getProducerStatus(guild)[0][0]
        # If not means Guild is new so set to active.
        except:
            active = True
            print("Guild not in DB setting active to True")
        thistuple = (guild ,owner_name_testnet,candidate_name, url, url + '/'+waxjson, waxtestjson, url + '/chains.json', logo_256, top21, country_code, active, Activekey)
        producer_final.append(thistuple)
    return producer_final
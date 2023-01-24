import json
import jsondiff
from io import BytesIO
import db_connect
import utils.requests as requests
import utils.eosio as eosio



def getchainsJSON(producer,chain):
    producerjson_table = requests.get_table_data("producerjson","producerjson","producerjson","200")
    producers = eosio.getEOStable(producerjson_table,chain)
    # owner and json
    for i in producers:
        owner = i['owner']
        if producer == owner:
            chainsjson = i['json']
    return chainsjson


def getwwwJSON(producer):
    guild = db_connect.getProducer(producer)[0]
    url = guild[3]
    reqJSON = requests.getJSON()
    response = reqJSON.getRequest(url,trydo='continue')
    return response.json()

def compareJSON(producer,chain):
    try:
        chainjson = getchainsJSON(producer,chain)
        wwwjson = getwwwJSON(producer)
    except:
        return False, f'JSON file not posted to chain'
    diff = jsondiff.diff(json.loads(chainjson), wwwjson)
    if not diff:
        return True, 'ok'
    else:
        #print("Mismatches:", diff)
        return False, f'JSON file on website does not match chain version: {diff}'
    



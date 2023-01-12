import json
import difflib
from io import BytesIO
import db_connect
import utils.requests as requests
import utils.eosio as eosio



# Obtaon wax.json locations from DB
# Download to memory
# Connect to producerjson contract and lookup produderjson table

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
    chainjson = json.dumps(getchainsJSON(producer,chain), 0)
    print(chainjson)
    print(type(chainjson))
    wwwjson = getwwwJSON(producer)
    print(wwwjson)
    print(type(wwwjson))
    '''
    contents1 = json.load(chainjson)
    contents2 = json.load(wwwjson)
    matcher = difflib.SequenceMatcher(lambda x: x in " \t\r\n", json.dumps(contents1, sort_keys=True), json.dumps(contents2, sort_keys=True))
    if matcher.ratio() == 1.0:
        print("The files match.")
    else:
        print("The files do not match.")
    '''



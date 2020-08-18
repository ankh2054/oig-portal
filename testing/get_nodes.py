
#ssl_endpoint
#api_endpoint
#p2p_endpoint
#bnet_endpoint
import json


def extract_values(obj, key):
    """Pull all values of specified key from nested JSON."""
    arr = []

    def extract(obj, arr, key):
        # Is the object of type dict 
        if isinstance(obj, dict):
            # Extract the values from the passed object
            for k, v in obj.items():
                # if the value is a dict or list
                if isinstance(v, (dict, list)):
                    # then pass the value back to extract function as the object
                    extract(v, arr, key)
                elif k == key:
                    # if the passed key equals the found key append to arr list
                    #print(v)
                    arr.append(v)
        # Is the object of type list
        elif isinstance(obj, list):
            for item in obj:
                # then pass the item back to extract function as the object
           
                extract(item, arr, key)
        return arr

    results = extract(obj, arr, key)
    return results

nodes = [
    {
        "location": {
            "country": "FI",
            "latitude": 60.192059,
            "longitude": 24.945831,
            "name": "Finland"
        },
        "node_type": "producer"
    },
    {
        "api_endpoint": "http://api.wax.eosargentina.io",
        "history_type": "none",
        "location": {
            "country": "FI",
            "latitude": 60.192059,
            "longitude": 24.945831,
            "name": "Finland"
        },
        "node_type": "full",
        "ssl_endpoint": "https://api.wax.eosargentina.io"
    },
    {
        "location": {
            "country": "FI",
            "latitude": 60.192059,
            "longitude": 24.945831,
            "name": "Finland"
        },
        "node_type": "seed",
        "p2p_endpoint": "p2p.wax.eosargentina.io:9872"
    }
    ,
    {
        "location": {
            "country": "FI",
            "latitude": 60.192059,
            "longitude": 24.945831,
            "name": "Finland"
        },
        "node_type": "seed",
        "bnet_endpoint": "bnet.wax.eosargentina.io:9872"
    }
]

result = []
for item in nodes:
    #my_dict={}
    # item is now a dict
    node_type = item.get('node_type')
    ssl_endpoint = item.get('ssl_endpoint')
    api_endpoint = item.get('api_endpoint')
    p2p_endpoint = item.get('p2p_endpoint')
    thistuple = (node_type, ssl_endpoint, api_endpoint, p2p_endpoint )
    result.append(thistuple)


print(result)
#ssl = extract_values(nodes, 'ssl_endpoint')
#api = extract_values(nodes, 'api_endpoint')
#p2p = extract_values(nodes, 'p2p_endpoint')
#print(ssl,api,p2p)


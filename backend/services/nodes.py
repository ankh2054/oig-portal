import utils.requests as requests
import db_connect


# Iterate over all different types of possible URLs and features
def node_types(type, node, owner_name, net, full_status):
    # Set node type
    node_type = type
    # List of all possible types
    nodetypes = ['ssl_endpoint', 'api_endpoint', 'p2p_endpoint', 'features']
    # List to pass back to tuple, contains owner_name, node_type, net (mainnet or testnet), and full status
    finallist = [owner_name, node_type, net]
    for nodes in nodetypes:
        # If fields in JSON are empty strings pass NULL to DB
        if node.get(nodes) == "":
            nodeurl = None
        else:  # Else pass in node URL or featurelist
            nodeurl = node.get(nodes)
        # If the node type is features and it's not a list, convert it to a list
        if nodes == 'features' and not isinstance(nodeurl, list):
            nodeurl = [nodeurl]
        finallist.append(nodeurl)
    # Append full status to the final list
    finallist.append(full_status)
    # Turn list into tuple 
    thistuple = tuple(finallist)
    return thistuple

## Get list of nodes from each wax.json and produce tuple of all nodes
## Look for features 
def node_list(testnet=False):
    if testnet:
        net = 'testnet'
    else:
        net = 'mainnet'
    # Get all rows from producer table
    producers = db_connect.getProducers()
    # Create empty list
    node_list = []
    for nodes in producers:
        if net == "mainnet":
            url = nodes[3]
        if net == "testnet":
            url = nodes[10]
        owner_name = nodes[0]
        reqJSON = requests.getJSON()
        response = reqJSON.getRequest(url,trydo='continue')
        nodes = reqJSON.getJson(url,response,'nodes')
        if nodes:
            for node in nodes:
                # We dont care about producer nodes
                if node.get('node_type') == 'producer':
                    continue 
                #Fixes for Dodgy BP json files
                #HKEOS has complete empty node types that are not producer
                if node.get('ssl_endpoint') == "" and node.get('api_endpoint') == "" and node.get('p2p_endpoint') == "":
                    continue
                #POLAR.WAX states a full node but only has a p2p_endpoint listed
                if node.get('node_type') == 'full' and node.get('api_endpoint') == None and node.get('ssl_endpoint') == None and node.get('p2p_endpoint') != None:
                    continue
                # Get all node types
                node_type = node.get('node_type')
                full_status = node.get('full', False)  # Extract full status
                if "query" in node_type:
                    thistuple = node_types("query", node, owner_name, net, full_status)  # Pass full_status to node_types
                    node_list.append(thistuple)
                if "seed" in node_type:
                    thistuple = node_types("seed", node, owner_name, net, full_status)
                    changetuple = list(thistuple)
                    changetuple[-2] = ['p2p_endpoint']
                    thistuple = tuple(changetuple)
                    node_list.append(thistuple)
                if "full" in node_type:
                    thistuple = node_types("full", node, owner_name, net, full_status)
                    node_list.append(thistuple)
                if "history" in node_type:
                    thistuple = node_types("history", node, owner_name, net, full_status)
                    node_list.append(thistuple)
        else:
            continue
    return node_list

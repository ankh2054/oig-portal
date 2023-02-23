import utils.requests as requests
import utils.eosio as eosio
import db_connect

def check_atomic_assets(producer,feature):
    info = str(eosio.Api_Calls('', 'health')) 
    # Query nodes in DB and try and obtain API node
    try:
        api = db_connect.getQueryNodes(producer,feature,'api')[0]
        api = format(api.rstrip('/')) 
    # If there is no v1_history or hyperion node in DB return False
    except:
        return False, 'No ' + feature + ' in JSON'
    URL = api+info
    reqJSON = requests.getJSON()
    response = reqJSON.getRequest(URL,trydo='return')
    if response:
        services = reqJSON.getJson(URL,response,'data',trydo='return')
    else:
        return False, response.reason
    if services:
        try:
            postgres = services['postgres']['status']
            redis = services['redis']['status']
            chain = services['chain']['status']
            head_block = services['chain']['head_block']
            reader = services['postgres']['readers']
            last_indexed_block = reader[0]['block_num']
            if abs(int(last_indexed_block) - int(head_block)) > 100:
                msg = 'Atomic API last_indexed_block is behind head_block'
                return(False,msg)
            else:
                pass
            services = dict(postgres=postgres, redis=redis, chain=chain)
            for k,v in services.items():
                msg = 'Atomic service {} has status {}'.format(
                                    k, v)
                if v != 'OK':
                    return False,msg
                else:
                    collection = 'kogsofficial'
                    AtomicCollection = getAtomicCollection(api,collection)
                    AtomicTemplate = getAtomicTemplates(api,collection)
                    Atomicshema = getAtomicSchema(api,collection)
                    AtomicAsset = getAtomicassets(api)
                    if not AtomicCollection or not AtomicTemplate[0] or not Atomicshema[0] or not AtomicAsset[0]:
                    # At least one variable is not True
                        if not AtomicCollection:
                            return False,f'Could not find collection kogsofficial, output {AtomicCollection}'
                        if not AtomicTemplate[0]:
                            return False,f'Could not find template {AtomicTemplate[1]}, output {AtomicTemplate[0]}'
                        if not Atomicshema[0]:
                            return False,f'Could not find schema {Atomicshema[1]}, output {AtomicTemplate[0]}'
                        if not AtomicAsset[0]:
                            return False, f'Could not find asset {AtomicAsset[1]}, output {AtomicAsset[0]}'
                    return True,'All Atomic services are working'
        except:
            return False, str(services)
    else:
        return False, str(services)


def getAtomicCollection(node,collection):
    #https://test.wax.api.atomicassets.io/atomicassets/v1/collections/kogsofficial
    URL = node + f'/atomicassets/v1/collections/{collection}'
    reqJSON = requests.getJSON()
    response = reqJSON.getRequest(URL,trydo='continue')
    result = reqJSON.getJson(URL,response,'success')
    return result



def getAtomicTemplates(node,collection):
    #https://test.wax.api.atomicassets.io/atomicassets/v1/templates?collection_name=kogsofficial&has_assets=true&page=1&limit=1&order=desc&sort=created
    # obtain template ID then pass to below
    # https://test.wax.api.atomicassets.io/atomicassets/v1/templates/kogsofficial/527086
    URL = node + f'/atomicassets/v1/templates'
    payload = requests.get_atomic_templates(collection)
    reqJSON = requests.getJSON()
    response = reqJSON.getRequest(URL,payload=payload,trydo='continue')
    result = reqJSON.getJson(URL,response,'data')
    templadeID =  result[0]['template_id']
    URL = URL + f'/{collection}/{templadeID}'
    response = reqJSON.getRequest(URL,trydo='continue')
    result = reqJSON.getJson(URL,response,'success')
    return result,templadeID
  
   

def getAtomicSchema(node,collection):
    #https://test.wax.api.atomicassets.io/atomicassets/v1/schemas?collection_name=kogsofficial&page=1&limit=1&order=desc&sort=created
    #Obtain schema name and pass to below
    #https://test.wax.api.atomicassets.io/atomicassets/v1/schemas/kogsofficial/general.info
    URL = node + f'/atomicassets/v1/schemas'
    payload = requests.get_atomic_schemas(collection)
    reqJSON = requests.getJSON()
    response = reqJSON.getRequest(URL,payload=payload,trydo='continue')
    result = reqJSON.getJson(URL,response,'data')
    schemaName = result[0]['schema_name']
    URL = URL + f'/{collection}/{schemaName}'
    response = reqJSON.getRequest(URL,trydo='continue')
    result = reqJSON.getJson(URL,response,'success')
    return result,schemaName
    

def getAtomicassets(node):
    URL = node + f'/atomicassets/v1/assets'
    payload = requests.get_atomic_asset()
    reqJSON = requests.getJSON()
    response = reqJSON.getRequest(URL,payload=payload,trydo='continue')
    result = reqJSON.getJson(URL,response,'data')
    assetID = result[0]['asset_id']
    URL = URL + f'/{assetID}'
    response = reqJSON.getRequest(URL,trydo='continue')
    result = reqJSON.getJson(URL,response,'success')
    return result,assetID
    #https://test.wax.api.atomicassets.io/atomicassets/v1/assets?page=1&limit=1&order=desc&sort=asset_id
    #Obtain asset id
    #https://test.wax.api.atomicassets.io/atomicassets/v1/assets/1099545082543

class Api_Calls:
    def __init__(self, version, call):
        if version == 'v2':
            self.url = '/v2/history/'
        elif version == 'v1':
            self.url = '/v1/chain/'
        self.version = version
        self.call = call

    # Return the URL 
    def __str__(self):
        return f'{self.url}{self.call}'

get_info = Api_Calls('v1', 'get_info')
print(get_info)

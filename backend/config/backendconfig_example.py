#!/usr/bin/env python
import preprocessing

db = {
    "user": "oig",
    "password": "oigpassword",
    "host": "127.0.0.1",
    "port": "5432",
    "database": "oig"
}

chain = {
    "chainname": "WAX",
    "mainnet_chainid": "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4",
    "testnet_chainid": 'f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12',
    "trx": "d8d1eee1d229370cb0d472df29eca50c9a2c79a0787af3addc7c48f5597464a6",
    "trx2": "7ee415e25fdfa41c569d2032fa76edce7d6a0d03dd7b4aadc1b6ce9a1cb450ce",
    "trx3": "cf38140ccab6262d9f1705f979a5e98e90cadbe0730d042cd85519eacf90fd63"
}

nodes = {
    "hyperionmainnet1": 'http://172.16.0.76:7000',
    "hyperionmainnet2": 'http://wax.blokcrafters.io',
    "hyperiontestnet": 'https://wax-testnet.dapplica.io'
}
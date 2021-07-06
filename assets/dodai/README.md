# How to use scripts


## scripts which requires accessing to Dev Env Dodai.

### getCollectionData.sh

* get Data from the specified collection
* example
```sh
$bash getCollectionData applet
```

## scripts which requires accessing to Prod Env Dodai

* Note that VPN and Port forwarding are required before running the following scripts.
    1. connect to VPN for Production
    2. Forward port 8888 to 443 by the following command.
    ```sh
    $ssh -L 8888:dod.riiiver.com:443  yamamoto@172.32.11.111   -p 22222 -i id_rsa_access.pem
    ```


### addRequireBlock.sh

* add ./data/{collectionName}.json to Prod Env Dodai.
* example
```sh
$bash addRequireBlock applet
```

#### deleteDatasFromCollection.sh

* delete ./data/{collectionName}.json from Prod Env Dodai.
* example
```sh
$bash deleteDatasFromCollection applet
```

#### getProdCollection.sh

* get collection information from Prod Env Dodai
* example
```sh
$bash getProdCollection.sh
```
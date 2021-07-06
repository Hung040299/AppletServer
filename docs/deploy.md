# Abstract
This page explains how to deploy each server in AWS instance.


# Deploy

## Abstract
Describe how to deploy each server in each environment

## preparation

1. Register your ssh public key to Git
    * You must get river_block_server without password input.
2. VPN Setting must be completed.
3. install docker in your PC
    * Ubuntu
        * ```bash
            $sudo apt-get install docker docker.io containerd runc
            ```

    * Mac
    https://docs.docker.com/docker-for-mac/install/
4. Create a docker image.
* Docker image may be old, if you already have blockbuilder docker image.
* Please create docker image for the first time.
```bash
$git clone veldt@veldt.git.backlog.com:/PROJECTER/BlockServer.git
$cd BlockServer/assets/docker
$docker build -t blockbuilder .
```

## How to deploy each server in dev / stg environment.
1. Connect VPN for staging
Development and Staging environment are same network;
2. Set DNS server to 8.8.8.8 from MAC setting. (Don't forget reverting DNS setting after deploy)
applet mark --> environment setting


 select Network


 select detail


 set DNS to 8.8.8.8

confirm you can connect any site, while connecting VPN.
ex) open https://www.google.com/  by Browser

3. git clone the server source code which you want to deploy in your PC
    * block server / block builder
$git clone veldt@veldt.git.backlog.com:/PROJECTER/BlockServer.git
    * applet server
$git clone veldt@veldt.git.backlog.com:/PROJECTER/AppletServer.git
    * log server
$git clone veldt@veldt.git.backlog.com:/PROJECTER/Log_Server.git
    * vendor server
$git clone veldt@veldt.git.backlog.com:/PROJECTER/Vendor_Server.git

4. Create a tag for this deploy.
The format tag of staging server is Release_YYYYMMDD
Git command to create new tag
$git tag -a Release_YYYYMMDD -m "Deploy staging with version Release_YYYYMMDD"
$git push origin Release_YYYYMMDD
Git command to deploy a special version
$git fetch origin
$git checkout origin/Release_YYYYMMDD

5. Go to ansible directory in each server.
XXXX is each server name.
$cd XXXX_Server/assets/ansible/
6. download  cert.pem to the ansible directory
7. change  cert.pem permission 0600 
$sudo chmod 0600  ./cert.pem 
8. Execute deploy script in your PC
deploy dev
```bash
$bash ./deploy_with_docker.sh dev cert.pem USERNAME
```

deploy stg
```bash
$bash ./deploy_with_docker.sh stg cert.pem USERNAME
```
9. When deployment is correctly finished, the following ansible log is shown
check no errors occur
unreachable and failed must be 0
number of "ok" and "changed" may be changed by server.
PLAY RECAP *********************************************************************
172.31.20.65               : ok=6    changed=4    unreachable=0    failed=0 
10. If there are any problems found after deploy, revert back to the previous tag.
 

# How to deploy each server in Production Environment.

## Attension

* Note that timing to connect VPN is different.
Production VPN cannot access internet. (LAN only)
1. git clone the server source code which you want to deploy in your PC
    * block server / block builder
$git clone veldt@veldt.git.backlog.com:/PROJECTER/BlockServer.git
    * applet server
$git clone veldt@veldt.git.backlog.com:/PROJECTER/AppletServer.git
    * log server
$git clone veldt@veldt.git.backlog.com:/PROJECTER/Log_Server.git
    * vendor server
$git clone veldt@veldt.git.backlog.com:/PROJECTER/Vendor_Server.git

2. Create a tag for this deploy.
The format tag of production server is productionYYYYMMDD
Git command to create new tag
$git tag -a productionYYYYMMDD -m "Deploy production with version productionYYYYMMDD"
$git push origin productionYYYYMMDD
Git command to deploy a special version
$git fetch origin
$git checkout origin/productionYYYYMMDD

3. Go to ansible directory in each server.
XXXX is each server name.
$cd XXXX_server/assets/ansible/
4. download  cert.pem to the ansible directory
5. change  cert.pem permission 0600 
$sudo chmod 0600  ./cert.pem 
6. create a zip package by the following command.
$bash createPkg.sh
7. Connect VPN for production
8. execute the deploy script
```bash
$bash ./deploy_with_docker.sh prod cert.pem USERNAME
```
9. When deployment is correctly finished, the following ansible log is shown
check no errors occur
unreachable and failed must be 0
number of "ok" and "changed" may be changed by server.
PLAY RECAP *********************************************************************
172.31.20.65               : ok=6    changed=4    unreachable=0    failed=0 
10. If there are any problems found after deploy, revert back to the previous tag.

# Reference
 
* Where is the server source in remote server.
 Remote Login the target server
Change user to "riapps"
$sudo su riapps
 goto the following path
$cd /home/riapps/git/
 
* How to see the server log
Remote login the server
Change user to "riapps"
$sudo su riapps
input the following command
applet server
$pm2 log applet --lines 100
block server
$pm2 log block --lines 100
vendor server
$pm2 log vendor --lines 100
log server
$pm2 log --lines 100

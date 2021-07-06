#!/bin/bash

mysql -u root -h 127.0.0.1 -P 3306 -ptest -e "drop database if exists riuser_dev_jp"
mysql -u root -h 127.0.0.1 -P 3307 -ptest -e "drop database if exists riuser_dev_us"

mysql -u root -h 127.0.0.1 -P 3306 -ptest -e "create database riuser_dev_jp default character set 'utf8'"
mysql -u root -h 127.0.0.1 -P 3306 -ptest riuser_dev_jp -e "source init.sql"
mysql -u root -h 127.0.0.1 -P 3307 -ptest -e "create database riuser_dev_us default character set 'utf8'"
mysql -u root -h 127.0.0.1 -P 3307 -ptest riuser_dev_us -e "source init.sql"

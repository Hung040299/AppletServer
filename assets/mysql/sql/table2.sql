drop table IF EXISTS CITIZEN_APP_VERSION;
create table CITIZEN_APP_VERSION (
       id varchar(64) not null primary key,
       user_id varchar(64) not null,
       data JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table IF EXISTS CITIZEN_APPLET_CATEGORY;
create table CITIZEN_APPLET_CATEGORY (
       id varchar(64) not null primary key,
       user_id varchar(64) not null,
       data JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table IF EXISTS CITIZEN_APPLET_SET;
create table CITIZEN_APPLET_SET (
       id varchar(64) not null primary key,
       user_id varchar(64) not null,
       data JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table IF EXISTS CITIZEN_APPLET_SLOT;
create table CITIZEN_APPLET_SLOT (
       id varchar(64) not null primary key,
       user_id varchar(64) not null,
       data JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table IF EXISTS CITIZEN_APPLET_TABLE;
create table CITIZEN_APPLET_TABLE (
       id varchar(64) not null primary key,
       user_id varchar(64) not null,
       data JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table IF EXISTS CITIZEN_DATA_APPLET;
create table CITIZEN_DATA_APPLET (
       id varchar(64) not null primary key,
       user_id varchar(64) not null,
       data JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table IF EXISTS CITIZEN_DATA_USER;
create table CITIZEN_DATA_USER (
       id varchar(64) not null primary key,
       user_id varchar(64) not null,
       data JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table IF EXISTS CITIZEN_DATA_WATCH_STATUS;
create table CITIZEN_DATA_WATCH_STATUS (
       id varchar(64) not null primary key,
       user_id varchar(64) not null,
       data JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table IF EXISTS CITIZEN_PUSHINFO;
create table CITIZEN_PUSHINFO (
       id varchar(64) not null primary key,
       user_id varchar(64) not null,
       data JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table IF EXISTS CITIZEN_PUSHINFO;
create table CITIZEN_PUSHINFO (
       id varchar(64) not null primary key,
       user_id varchar(64) not null,
       data JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table IF EXISTS CITIZEN_WATCH_DEVICE;
create table CITIZEN_WATCH_DEVICE (
       id varchar(64) not null primary key,
       user_id varchar(64) not null,
       data JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table IF EXISTS CITIZEN_WATCH_FIRMWARE;
create table CITIZEN_WATCH_FIRMWARE (
       id varchar(64) not null primary key,
       user_id varchar(64) not null,
       data JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table IF EXISTS CITIZEN_WATCH_STATUS;
create table CITIZEN_WATCH_STATUS (
       id varchar(64) not null primary key,
       user_id varchar(64) not null,
       data JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);


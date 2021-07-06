drop table if exists VENDOR;
create table VENDOR (
       `id` varchar(64) not null primary key,
       `user_id`   varchar(64) not null,
       `data` JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table if exists DEVICE;
create table DEVICE (
       `id` varchar(64) not null primary key,
       `user_id`   varchar(64) not null,
       `data` JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table if exists APP;
create table APP (
       `id` varchar(64) not null primary key,
       `user_id`   varchar(64) not null,
       `data` JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table if exists CATEGORY;
create table CATEGORY (
       `id` varchar(64) not null primary key,
       `user_id`   varchar(64) not null,
       `data` JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table if exists TOOL;
create table TOOL (
       `id` varchar(64) not null primary key,
       `user_id`   varchar(64) not null,
       `data` JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table if exists VENDOR_LOGIN;
create table VENDOR_LOGIN (
       `id` varchar(64) not null primary key,
       `user_id`   varchar(64) not null,
       `data` JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

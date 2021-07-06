drop table if exists APPLET;
create table APPLET (
       `applet_id` varchar(64) not null primary key,
       `user_id`   varchar(64) not null,
       `data` JSON,
       `goodnum` JSON,
       `download` JSON,
       `publicstatus` JSON,
       `storestatus` JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table if exists APPLICATION_API_AUTH;
create table APPLICATION_API_AUTH (
       `block_id` varchar(64) not null primary key,
       `user_id`   varchar(64) not null,
       `data` JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table if exists BLOCK;
create table BLOCK (
       `block_id` varchar(64) not null primary key,
       `user_id`   varchar(64) not null,
       `data` JSON,
       `store_status` JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table if exists BLOCK_LAMBDA_STATUS;
create table BLOCK_LAMBDA_STATUS (
       `block_id` varchar(64) not null primary key,
       `user_id`   varchar(64) not null,
       `data` JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table if exists CLIENT_API_AUTH;
create table CLIENT_API_AUTH (
       `_id` varchar(128) not null primary key,
       `user_id`   varchar(64) not null,
       `data` JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table if exists NOTIFICATION_TOKEN;
create table NOTIFICATION_TOKEN (
       `_id` varchar(124) not null primary key,
       `user_id`   varchar(64) not null,
       `data` JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table if exists APPLET_ICON;
create table APPLET_ICON (
       `applet_id` varchar(64) not null primary key,
       `user_id`   varchar(64) not null,
       `data` JSON,
       `filename` varchar(256),
       `public_url` varchar(1024),
       `content_type` varchar(256),
       `file_versions` JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table if exists BLOCK_ICON;
create table BLOCK_ICON (
       `block_id` varchar(64) not null primary key,
       `user_id`   varchar(64) not null,
       `data` JSON,
       `filename` varchar(256),
       `public_url` varchar(1024),
       `content_type` varchar(256),
       `file_versions` JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table if exists BLOCK_ILLUST;
create table BLOCK_ILLUST (
       `block_id` varchar(64) not null primary key,
       `user_id`   varchar(64) not null,
       `data` JSON,
       `filename` varchar(256),
       `public_url` varchar(1024),
       `content_type` varchar(256),
       `file_versions` JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table if exists BLOCK_LAMBDA;
create table BLOCK_LAMBDA (
       `block_id` varchar(64) not null primary key,
       `user_id`   varchar(64) not null,
       `data` JSON,
       `filename` varchar(256),
       `public_url` varchar(1024),
       `content_type` varchar(256),
       `file_versions` JSON,
       del_flg char(1) not null default 0,
       ins_log varchar(100),
       ins_date datetime,
       upd_log varchar(100),
       upd_date datetime,
       version int not null default 0
);

drop table if exists FIREBASE_PRIVATE_KEY;
create table FIREBASE_PRIVATE_KEY (
        `app_id` varchar(64) not null primary key,
        `user_id` varchar(64) not null,
        `data` JSON,
        `vendor_id` varchar(64),
        `firebase_project_id` varchar(64),
        `firebase_private_key` varchar(64),
        del_flg char(1) not null default 0,
        ins_log varchar(100),
        ins_date datetime,
        upd_log varchar(100),
        upd_date datetime,
        version int not null default 0
);

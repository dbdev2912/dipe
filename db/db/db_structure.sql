DROP DATABASE IF EXISTS DIPE;

CREATE DATABASE DIPE;
USE DIPE;

CREATE TABLE `accounts`(
	account_string 	VARCHAR(255) PRIMARY KEY NOT NULL,
    pwd_string 		VARCHAR(255) NOT NULL,
    account_status 	ENUM("1", "0") NOT NULL,
    credential_string VARCHAR(255) UNIQUE NOT NULL,
    account_role 	ENUM('user', 'admin', 'su') DEFAULT 'user'
);

CREATE TABLE `account_detail`(
	credential_string VARCHAR(255) NOT NULL, -- fk
    fullname 	VARCHAR(255),
    email 		VARCHAR(255),
    phone 		VARCHAR(255),
    address 	TEXT,
    avatar 		VARCHAR(512) DEFAULT '/assets/image/icon.png'
);

ALTER TABLE `account_detail` ADD CONSTRAINT `fk_account_accountdetail` 
	FOREIGN KEY (credential_string) 
		REFERENCES accounts( credential_string ) ON UPDATE CASCADE;


CREATE TABLE `project_status`
(
	status_id INT PRIMARY KEY NOT NULL,
    status_name VARCHAR(255)
);

INSERT INTO `project_status` VALUES( 1, 'INITIALIZING'), ( 2, 'STARTED'), ( 3, 'PROGRESS'), ( 4, 'RELEASE'), ( 5, 'FINAL'), ( 6, 'COMPLETED'), ( 7, 'BUG'), ( 8, 'SUSPEND');

CREATE TABLE VERSIONS(
	version_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    project_id INT,
    version_name VARCHAR(255),
    publisher VARCHAR(255),
    publish_on DATETIME DEFAULT NOW(),
    descriptions TEXT
);

ALTER TABLE VERSIONS ADD CONSTRAINT `fk_ver_acc` FOREIGN KEY ( publisher ) REFERENCES accounts( credential_string );


CREATE TABLE `projects`
(
	`project_id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    `project_code` VARCHAR(255) UNIQUE,
    `project_name` TEXT DEFAULT "Dự án mới",
    `project_master` VARCHAR(255) NOT NULL, -- FK
    `description` TEXT,
    `create_on` DATETIME DEFAULT NOW(),
    `project_status` INT DEFAULT 1,
    `active` BOOL
);

CREATE TABLE `project_partner`
(
	`project_id` INT, -- fk 
    `credential_string` VARCHAR(255) NOT NULL
);

ALTER TABLE `project_partner` ADD CONSTRAINT PRIMARY KEY ( project_id, credential_string );
ALTER TABLE `project_partner` ADD CONSTRAINT `fk_pro_pro_partner` FOREIGN KEY ( project_id ) REFERENCES projects( project_id );
ALTER TABLE `project_partner` ADD CONSTRAINT `fk_pro_cred` FOREIGN KEY ( credential_string) REFERENCES accounts( credential_string );

CREATE TABLE `project_user`
(
	`project_id` INT, -- fk 
    `credential_string` VARCHAR(255) NOT NULL
);

ALTER TABLE `project_user` ADD CONSTRAINT PRIMARY KEY ( project_id, credential_string );
ALTER TABLE `project_user` ADD CONSTRAINT `fk_pro_pro_user` FOREIGN KEY ( project_id ) REFERENCES projects( project_id );
ALTER TABLE `project_user` ADD CONSTRAINT `fk_pro_cred_user` FOREIGN KEY ( credential_string) REFERENCES accounts( credential_string );


CREATE TABLE `task_status`
(
	status_id INT PRIMARY KEY NOT NULL,
    status_name VARCHAR(255)
);

INSERT INTO `task_status` VALUES( 1, 'INITIALIZING'), ( 2, 'STARTED'), ( 3, 'PROGRESS'), ( 4, 'COMPLETED'), ( 5, 'BUG'), ( 6, 'SUSPEND');


CREATE TABLE `tasks`
(
	`task_id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	`project_id` INT, -- fk 
    `task_owner`  VARCHAR(255) NOT NULL,
    `task_state` TINYINT, -- FK
    `task_label` TEXT,
    `task_description` TEXT,
    `change_at` DATETIME DEFAULT NOW()
);

ALTER TABLE tasks ADD CONSTRAINT `FK_PRO_TASK` FOREIGN KEY ( project_id ) REFERENCES projects( project_id );
ALTER TABLE tasks ADD CONSTRAINT `FK_PRO_user` FOREIGN KEY ( task_owner ) REFERENCES accounts( credential_string );


/* NO KEY AND NO TRIGGER */
CREATE TABLE TASK_MODIFY
(
	`task_id` INT,
    `modified_by` VARCHAR(255),
    `modified_at` DATETIME DEFAULT NOW(),
    `modified_what` VARCHAR(255),
    `from_value` TEXT,
    `to_value` TEXT
);

CREATE TABLE task_member(
	`task_id` INT,
    `member_cs` VARCHAR(255)
);

ALTER TABLE task_member ADD CONSTRAINT PRIMARY KEY ( `task_id`, `member_cs` );
ALTER TABLE task_member ADD CONSTRAINT FOREIGN KEY ( task_id ) REFERENCES tasks( task_id );
ALTER TABLE task_member ADD CONSTRAINT FOREIGN KEY ( member_cs ) REFERENCES accounts( credential_string );

CREATE TABLE `tables`(
	table_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    version_id INT,
    table_name VARCHAR(255) DEFAULT "Bảng mới",
    table_alias VARCHAR(255) NOT NULL UNIQUE ,
    create_on DATETIME DEFAULT NOW()
);

ALTER TABLE `tables` ADD CONSTRAINT `fk_project_ver` FOREIGN KEY ( `version_id` ) REFERENCES `versions`( `version_id` ) ON UPDATE CASCADE;

CREATE TABLE `fields`(
	field_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    table_id INT,
    field_name VARCHAR(255)  DEFAULT "Trường mới",
    field_alias VARCHAR(255) NOT NULL UNIQUE,
    nullable BOOL DEFAULT TRUE,
    field_props JSON,
    field_data_type VARCHAR(255)
);

CREATE TABLE `default_value`(
	field_id INT PRIMARY KEY NOT NULL,
    default_value TEXT
);

ALTER TABLE `fields` ADD CONSTRAINT `fk_fields_table` FOREIGN KEY ( `table_id` ) REFERENCES `tables`(`table_id`) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE `default_value` ADD CONSTRAINT `fk_field_default_value` FOREIGN KEY ( `field_id` ) REFERENCES `fields`(`field_id`) ON UPDATE CASCADE;

CREATE TABLE `constraints`(
	constraint_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    constraint_type ENUM("pk", "fk", "check"),
    field_id INT NOT NULL,
    reference_on INT,
    check_fomular ENUM(">", "<", ">=", "<=", "=", "NONE"),
    check_on_field BOOL,
    default_check_value TEXT
);


ALTER TABLE VERSIONS ADD CONSTRAINT `fk)ver_pro` FOREIGN KEY ( project_id ) REFERENCES projects(project_id);

/* NO PROCEDURES OR TRIGGERS */
CREATE TABLE MODIFY_HISTORY(
	ID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    account_string VARCHAR(255) NOT NULL,
    on_table VARCHAR(255),
    old_value TEXT,
    new_value TEXT,
    update_at DATETIME DEFAULT NOW()
);


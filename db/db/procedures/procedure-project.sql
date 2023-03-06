USE DIPE;

DELIMITER $$

DROP PROCEDURE IF EXISTS CREATE_PROJECT $$

CREATE PROCEDURE CREATE_PROJECT (
	IN IN_PROJECT_NAME TEXT,
    IN IN_PROJECT_CODE VARCHAR(255),
    IN IN_PROJECT_MASTER VARCHAR(255),
    IN PROJECT_DESCRIPTION TEXT
)
BEGIN
	DECLARE master_existed INT;
	DECLARE project_code_existed INT;
    SELECT COUNT(*) INTO master_existed FROM accounts WHERE credential_string = IN_PROJECT_MASTER;
    
    IF master_existed > 0 THEN
		SELECT COUNT(*) INTO project_code_existed FROM PROJECTS WHERE project_code = IN_PROJECT_CODE;
        
        IF project_code_existed = 0 THEN
			INSERT INTO projects( project_name, project_master, project_code, description ) VALUES
			( IN_PROJECT_NAME , IN_PROJECT_MASTER, IN_PROJECT_CODE, PROJECT_DESCRIPTION );
            
			SELECT TRUE as `success`, "SUCCESSFULLY CREATED NEW PROJECT!" AS content, LAST_INSERT_ID() as project_id;
        ELSE
			SELECT FALSE AS `success`, CONCAT("PROJECT CODE ", IN_PROJECT_CODE, " IS ALREADY EXISTED!") AS content;
        END IF;   
		
    ELSE
		SELECT FALSE AS `success`, CONCAT("USER WITH CREDENTIAL STRING ", IN_PROJECT_MASTER, " CANNOT BE FOUND!") AS content;
    END IF;
	
END
 $$

DROP PROCEDURE IF EXISTS MODIFY_PROJECT $$

CREATE PROCEDURE MODIFY_PROJECT (
	IN IN_PROJECT_ID INT,
    
	IN IN_PROJECT_NAME VARCHAR(255),
    IN IN_PROJECT_MASTER VARCHAR(255),
    IN PROJECT_DESCRIPTION TEXT
)
BEGIN
	DECLARE project_existed INT;
    DECLARE master_existed INT;
	SELECT COUNT(*) INTO project_existed  FROM `projects` WHERE `project_id` = IN_PROJECT_ID;
    
    IF project_existed > 0 THEN
		SELECT COUNT(*) INTO master_existed FROM accounts WHERE `credential_string` = IN_PROJECT_MASTER;
        IF master_existed > 0 THEN
			UPDATE projects SET 
				project_name = IN_PROJECT_NAME,
				project_master = IN_PROJECT_MASTER,
				description = PROJECT_DESCRIPTION
			WHERE project_id = IN_PROJECT_ID;
            SELECT TRUE AS `success`, "SUCCESSFULLY MODIFIED PROJECT" AS content;
		ELSE
			SELECT FALSE AS `success`, CONCAT("USER WITH CREDENTIAL STRING ", IN_PROJECT_MASTER, " CANNOT BE FOUND!") AS content;
        END IF;
    ELSE
		SELECT FALSE AS `success`, CONCAT("PROJECT WITH ID ", IN_PROJECT_ID, " CANNOT BE FOUND!") AS content;
    END IF;
END
$$



DROP PROCEDURE IF EXISTS DROP_PROJECT $$

CREATE PROCEDURE DROP_PROJECT (
	IN IN_PROJECT_ID INT
)
BEGIN
	DECLARE project_existed INT;
	SELECT COUNT(*) INTO project_existed  FROM `projects` WHERE `project_id` = IN_PROJECT_ID;
    
    IF project_existed > 0 THEN
		DELETE FROM `projects` WHERE project_id = IN_PROJECT_ID;
        SELECT TRUE AS `success`, "SUCCESSFULLY DROPPED PROJECT" AS content;
    ELSE
		SELECT FALSE AS `success`, CONCAT("PROJECT WITH ID ", IN_PROJECT_ID, " CANNOT BE FOUND!") AS content;
    END IF;
END
$$

DROP PROCEDURE IF EXISTS ADD_PARTNER_TO_PROJECT $$

CREATE PROCEDURE ADD_PARTNER_TO_PROJECT
(
	IN IN_PROJECT_ID INT,
    IN IN_CREDENTIAL_STRING VARCHAR(255)
)
BEGIN
	DECLARE EXISTED_PARTNER INT;
    DECLARE EXISTED_USER INT;
    
    SELECT COUNT(*) INTO EXISTED_USER FROM ACCOUNTS WHERE CREDENTIAL_STRING = IN_CREDENTIAL_STRING AND ACCOUNT_ROLE = 'admin';
    
    IF EXISTED_USER > 0 THEN
    
		SELECT COUNT(*) INTO EXISTED_PARTNER FROM PROJECT_PARTNER WHERE PROJECT_ID = IN_PROJECT_ID AND CREDENTIAL_STRING = IN_CREDENTIAL_STRING;
		IF EXISTED_PARTNER > 0 THEN
			SELECT FALSE AS `success`, "THIS USER IS ALREADY A PARTNER OF THIS PROJECT!" AS content;
		ELSE
			INSERT INTO project_partner( project_id, credential_string ) VALUES ( IN_PROJECT_ID, IN_CREDENTIAL_STRING );
			SELECT TRUE AS `success`, "SUCCESSFULLY ADD NEW PARTNER TO THE PROJECT" AS content;
		END IF;
	ELSE
		SELECT FALSE AS `success`, "THIS USER DOES NOT EXIST OR HAS NO RIGHTS" AS content;
    END IF;
END
$$


DROP PROCEDURE IF EXISTS REMOVE_PARTNER_FROM_PROJECT $$
CREATE PROCEDURE REMOVE_PARTNER_FROM_PROJECT
(
	IN IN_PROJECT_ID INT,
    IN IN_CREDENTIAL_STRING VARCHAR(255)
)
BEGIN
	DECLARE EXISTED_PARTNER INT;    
	DECLARE EXISTED_USER INT;
    
    SELECT COUNT(*) INTO EXISTED_USER FROM ACCOUNTS WHERE CREDENTIAL_STRING = IN_CREDENTIAL_STRING;
    
    IF EXISTED_USER > 0 THEN
    
		SELECT COUNT(*) INTO EXISTED_PARTNER FROM PROJECT_PARTNER WHERE PROJECT_ID = IN_PROJECT_ID AND CREDENTIAL_STRING = IN_CREDENTIAL_STRING;
		IF EXISTED_PARTNER = 0 THEN
			SELECT FALSE AS `success`, "THIS USER IS NOT A PARTNER OF THIS PROJECT!" AS content;
		ELSE
			DELETE FROM project_partner WHERE PROJECT_ID = IN_PROJECT_ID AND CREDENTIAL_STRING = IN_CREDENTIAL_STRING;
			SELECT TRUE AS `success`, "SUCCESSFULLY REMOVE THIS PARTNER FROM THE PROJECT" AS content;
		END IF;
	ELSE 
		SELECT FALSE AS `success`, "THIS USER DOES NOT EXIST" AS content;
    END IF;
END
$$



DROP PROCEDURE IF EXISTS ADD_USER_TO_PROJECT $$

CREATE PROCEDURE ADD_USER_TO_PROJECT 
(
	IN IN_PROJECT_ID INT,
    IN IN_CREDENTIAL_STRING VARCHAR(255)
)
BEGIN
	DECLARE EXISTED_P_USER INT;
    DECLARE EXISTED_USER INT;
    
    SELECT COUNT(*) INTO EXISTED_USER FROM ACCOUNTS WHERE CREDENTIAL_STRING = IN_CREDENTIAL_STRING AND ACCOUNT_ROLE = 'user';
    
    IF EXISTED_USER > 0 THEN
    
		SELECT COUNT(*) INTO EXISTED_P_USER FROM PROJECT_USER WHERE PROJECT_ID = IN_PROJECT_ID AND CREDENTIAL_STRING = IN_CREDENTIAL_STRING;
		IF EXISTED_P_USER > 0 THEN
			SELECT FALSE AS `success`, "THIS USER IS ALREADY A USER OF THIS PROJECT!" AS content;
		ELSE
			INSERT INTO project_user( project_id, credential_string ) VALUES ( IN_PROJECT_ID, IN_CREDENTIAL_STRING );
			SELECT TRUE AS `success`, "SUCCESSFULLY ADD NEW USER TO THE PROJECT" AS content;
		END IF;
	ELSE
		SELECT FALSE AS `success`, "THIS USER DOES NOT EXIST OR HAS NO RIGHTS" AS content;
    END IF;
END
$$



DROP PROCEDURE IF EXISTS REMOVE_USER_FROM_PROJECT $$
CREATE PROCEDURE REMOVE_USER_FROM_PROJECT
(
	IN IN_PROJECT_ID INT,
    IN IN_CREDENTIAL_STRING VARCHAR(255)
)
BEGIN
	DECLARE EXISTED_P_USER INT;    
	DECLARE EXISTED_USER INT;
    
    SELECT COUNT(*) INTO EXISTED_USER FROM ACCOUNTS WHERE CREDENTIAL_STRING = IN_CREDENTIAL_STRING;
    
    IF EXISTED_USER > 0 THEN
    
		SELECT COUNT(*) INTO EXISTED_P_USER FROM PROJECT_USER WHERE PROJECT_ID = IN_PROJECT_ID AND CREDENTIAL_STRING = IN_CREDENTIAL_STRING;
		IF EXISTED_P_USER = 0 THEN
			SELECT FALSE AS `success`, "THIS USER IS NOT A USER OF THIS PROJECT!" AS content;
		ELSE
			DELETE FROM project_user WHERE PROJECT_ID = IN_PROJECT_ID AND CREDENTIAL_STRING = IN_CREDENTIAL_STRING;
			SELECT TRUE AS `success`, "SUCCESSFULLY REMOVE THIS USER FROM THE PROJECT" AS content;
		END IF;
	ELSE 
		SELECT FALSE AS `success`, "THIS USER DOES NOT EXIST" AS content;
    END IF;
END
$$
USE DIPE;
DELIMITER $$

DROP PROCEDURE IF EXISTS `account_add` $$
CREATE PROCEDURE `account_add`(IN new_account_string VARCHAR(255), IN new_pwd_string VARCHAR(255), IN new_account_role ENUM('user', 'admin', 'su')) 

BEGIN 
	DECLARE acc_existed INT;
	SELECT COUNT(*) INTO acc_existed  FROM `accounts` WHERE `account_string` = new_account_string;
    IF acc_existed > 0 THEN 
		SELECT FALSE AS `success`, 'THIS USERNAME IS ALREADY EXISTED!' AS `content`;
	ELSE 
		INSERT INTO `accounts`( `account_string`, `pwd_string`, `account_status`, `credential_string`, `account_role`) VALUES
							  ( new_account_string, new_pwd_string, "1", UUID(), new_account_role );
		SELECT TRUE AS `success`, CONCAT('SUCCESSFULLY INSERT NEW USER: ', new_account_string ) AS `content`;
	END IF;
END
$$


DROP PROCEDURE IF EXISTS `user_activation` $$
CREATE PROCEDURE `user_activation`( IN in_credential_string VARCHAR(255), IN in_account_status ENUM("1", "0"))
BEGIN
	DECLARE acc_string VARCHAR(255);
    DECLARE acc_existed INT;    
    SELECT COUNT(*) INTO acc_existed  FROM `accounts` WHERE `credential_string` = in_credential_string;
    
	IF acc_existed > 0 THEN     
		UPDATE `accounts` SET `account_status` = in_account_status WHERE `credential_string` = in_credential_string;	
		SELECT account_string INTO acc_string FROM `accounts` WHERE `credential_string` = in_credential_string;
		
		IF in_account_status = "1"
			THEN 
				SELECT TRUE AS `success`, CONCAT("SUCCESSFULLY ACTIVATE USER: ", acc_string) AS `content`;
		ELSE
				SELECT TRUE AS `success`, CONCAT("SUCCESSFULLY DEACTIVATE USER: ", acc_string) AS `content`;
		END IF;        
	ELSE
		SELECT FALSE AS `success`, 'THIS ACCOUNT DOES NOT EXIST!' AS `content`;
	END IF;
END
$$

DROP PROCEDURE IF EXISTS `user_change_password` $$
CREATE PROCEDURE `user_change_password` ( IN in_credential_string VARCHAR(255), IN in_password_string VARCHAR(255))
BEGIN
	DECLARE acc_string VARCHAR(255);
    
	DECLARE acc_existed INT;    
    SELECT COUNT(*) INTO acc_existed  FROM `accounts` WHERE `credential_string` = in_credential_string;
    IF acc_existed > 0 THEN
    
		SELECT account_string INTO acc_string FROM `accounts` WHERE `credential_string` = in_credential_string;
		IF in_password_string IS NOT NULL AND in_password_string <> "" THEN
			BEGIN			
				UPDATE `accounts` SET `pwd_string` = in_password_string WHERE `credential_string` = in_credential_string;							
				SELECT TRUE AS `success`, CONCAT("SUCCESSFULLY CHANGE PASSWORD OF USER ", acc_string, " TO ", in_password_string ) AS `content`;
			END;
		ELSE
			SELECT FALSE AS `success`, CONCAT("CANNOT CHANGE PASSWORD OF USER ", acc_string, " DUE TO THE INPUT PASSWORD IS NULL OR INVALID") AS `content`;
		END IF;
	ELSE
		SELECT FALSE AS `success`, 'THIS ACCOUNT DOES NOT EXIST!' AS `content`;
	END IF;
END
$$


DROP PROCEDURE IF EXISTS `user_change_info` $$
CREATE PROCEDURE `user_change_info` (
	IN in_credential_string VARCHAR(255), 
    
    IN in_fullname 		VARCHAR(255),
    IN in_email 		VARCHAR(255),
    IN in_phone 		VARCHAR(255),
    IN in_address 		TEXT
)
BEGIN
	DECLARE acc_string VARCHAR(255);
    SELECT account_string INTO acc_string FROM `accounts` WHERE `credential_string` = in_credential_string;
    
	UPDATE `account_detail` SET 
    `fullname` = in_fullname, 
    `email` = in_email, 
    `phone` = in_phone, 
    `address` = in_address
    WHERE `credential_string` = in_credential_string;
    
    SELECT TRUE AS `success`, CONCAT("SUCCESSFULLY CHANGE DETAIL INFOs OF USER ", acc_string ) AS `content`;
END
$$


DROP PROCEDURE IF EXISTS `user_login` $$
CREATE PROCEDURE `user_login` ( IN in_account_string VARCHAR(255), IN in_pwd_string VARCHAR(255) )
BEGIN
	DECLARE user_existed INT;    
    
	SELECT COUNT(*) INTO user_existed FROM `accounts` WHERE `account_string` = in_account_string AND `pwd_string` = in_pwd_string;
    IF user_existed > 0 THEN 
		SELECT TRUE AS `success`, A.credential_string, account_role, account_status, account_role, fullname, phone, email, address
        FROM `accounts` AS A 
			INNER JOIN `account_detail` AS D 
				ON D.credential_string = A.credential_string 
		WHERE A.account_string = in_account_string;
    ELSE
		SELECT FALSE AS `success`;
    END IF;
END

 $$

DROP PROCEDURE IF EXISTS `is_account_existed` $$
CREATE PROCEDURE`is_account_existed` ( IN credential VARCHAR(255) )
BEGIN
	DECLARE user_existed INT;   
    
	SELECT COUNT(*) INTO user_existed FROM `accounts` WHERE `credential_string` = credential;
    IF user_existed > 0 THEN 
		SELECT TRUE AS `success`, CONCAT("ACCOUNT WITH CS: ", credential, " IS ALREADY EXISTED");        
    ELSE
		SELECT FALSE AS `success`, CONCAT("ACCOUNT WITH CS: ", credential, " IS NOT FOUND");
    END IF;
END

 $$


DELIMITER ;

USE DIPE;

DELIMITER $$
/* HAHAHAHAHAHAHAHAHAHAHA fix procedure loi cai loz */
DROP PROCEDURE IF EXISTS `table_add` $$
CREATE PROCEDURE `table_add` ( IN in_table_name VARCHAR(255), IN in_project_id INT, IN in_table_alias VARCHAR(255) )
BEGIN
	DECLARE table_existed INT;
    SELECT COUNT(*) INTO table_existed FROM `tables` WHERE `table_alias` = in_table_alias;
    IF table_existed = 0 THEN
		INSERT INTO `tables`(`table_name`, `table_alias`, `project_id`) VALUES ( in_table_name, in_table_alias, in_project_id );
        
		/* TRIGGER IS GONNA BE CALLED SOON */
        
		SELECT TRUE AS `success`, CONCAT("SUCCESSFULLY CREATE TABLE ", in_table_name) AS `content`, LAST_INSERT_ID() as table_id;
	ELSE 
		SELECT FALSE AS `success`, CONCAT("TABLE WITH ALIAS ", in_table_alias, " ALREADY EXISTED") AS `content`; 
    END IF;
END
$$


DROP PROCEDURE IF EXISTS `table_modify` $$
CREATE PROCEDURE `table_modify`( IN in_table_id INT, IN in_table_name VARCHAR(255) )
BEGIN

	DECLARE table_existed INT;
    SELECT COUNT(*) INTO table_existed FROM `tables` WHERE `table_id` = in_table_id;
	IF table_existed > 0 THEN
    
		UPDATE `tables` SET `table_name` = in_table_name WHERE `table_id` = in_table_id;
        SELECT TRUE AS `success`, CONCAT("SUCCESSFULLY CHANGE TABLE NAME TO ", in_table_name) AS `content`; 
    ELSE 
		SELECT FALSE AS `success`, "THE TABLE DOES NOT EXIST" AS `content`; 
    END IF;
END
$$


DROP PROCEDURE IF EXISTS `drop_table` $$
CREATE PROCEDURE `drop_table` (
	IN in_table_id INT
) BEGIN 
	DECLARE table_existed INT;
	SELECT COUNT(*) INTO table_existed FROM `tables` WHERE `table_id` = in_table_id;
    IF table_existed > 0 THEN    
		DELETE FROM `tables` WHERE table_id = in_table_id;
        SELECT TRUE AS `success`, CONCAT("SUCCESSFULLY DROP TABLE WITH ID ", in_table_id, " AND ITs FIELDS") AS `content`; 
    ELSE 
		SELECT FALSE AS `success`, "THE TABLE DOES NOT EXIST" AS `content`; 
    END IF;
	
END
$$

DROP PROCEDURE IF EXISTS `drop_all_tables` $$
CREATE PROCEDURE `drop_all_tables` () 
BEGIN 
	DELETE FROM `tables`;
	SELECT TRUE AS `success`, CONCAT("SUCCESSFULLY DROP ALL TABLES WITH THEIR FIELDS AND FIELD CONSTRAINTS") AS `content`; 
END
$$

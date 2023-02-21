USE DIPE;

DELIMITER $$

DROP PROCEDURE IF EXISTS `add_constraint` $$

CREATE PROCEDURE `add_constraint` (
	IN in_constraint_type ENUM("pk", "fk", "check"),
    IN in_field_id INT,
	IN in_reference_on INT,
	IN in_check_fomular ENUM(">", "<", ">=", "<=", "=", "NONE"),
	IN in_check_on_field BOOL,
	IN in_default_check_value TEXT
) BEGIN
	INSERT INTO `constraints`( `constraint_type` ,`field_id` ,`reference_on` ,`check_fomular` ,`check_on_field` ,`default_check_value` ) 
    VALUEs ( in_constraint_type, in_field_id, in_reference_on, in_check_fomular, in_check_on_field, in_default_check_value );
    SELECT TRUE AS `success`, "SUCCESSFULLY CREATE NEW CONSTRAINT" AS `content`, LAST_INSERT_ID() as id;
END
$$

DROP PROCEDURE IF EXISTS `modify_constraint` $$
CREATE PROCEDURE `modify_constraint` (
	IN in_constraint_id INT,
	IN in_constraint_type ENUM("pk", "fk", "check"),
    IN in_field_id INT,
	IN in_reference_on INT,
	IN in_check_fomular ENUM(">", "<", ">=", "<=", "=", "NONE"),
	IN in_check_on_field BOOL,
	IN in_default_check_value TEXT
) BEGIN
	DECLARE existed INT;
    SELECT COUNT(*) INTO EXISTED FROM `constraints` WHERE constraint_id = in_constraint_id;
    
    IF existed > 0 THEN 
		UPDATE `constraints` SET
			`constraint_type` = in_constraint_type,
			`field_id` = in_field_id,
			`reference_on` = in_reference_on,
			`check_fomular` = in_check_fomular,
			`check_on_field` = in_check_on_field,
			`default_check_value` = in_default_check_value
		WHERE `constraint_id` = in_constraint_id;
        SELECT TRUE AS `success`, CONCAT("CONSTRAINT WITH ID ", in_constraint_id, " WAS UPDATED SUCCESSULLY") AS `content`;
    ELSE 
		SELECT FALSE AS `success`, CONCAT("NO CONSTRAINT WITH ID ", in_constraint_id, " CAN BE FOUND!") AS `content`;
    END IF;
END
$$

DROP PROCEDURE IF EXISTS `drop_constraint` $$
CREATE PROCEDURE `drop_constraint`( IN in_constraint_id INT )
BEGIN
	DECLARE existed INT;
    SELECT COUNT(*) INTO EXISTED FROM `constraints` WHERE constraint_id = in_constraint_id;
    
    IF existed > 0 THEN 
		DELETE FROM `constraints` WHERE `constraint_id` = in_constraint_id;
        SELECT TRUE AS `success`, CONCAT("CONSTRAINT WITH ID ", in_constraint_id, " HAD BEEN DELETED") AS `content`;
    ELSE 
		SELECT FALSE AS `success`, CONCAT("NO CONSTRAINT WITH ID ", in_constraint_id, " CAN BE FOUND!") AS `content`;
    END IF;
END

$$

/* not tested  */
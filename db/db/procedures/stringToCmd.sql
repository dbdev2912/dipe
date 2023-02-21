SET @QUERY = "SELECT * FROM ACCOUNTS";
PREPARE cmd from @query;
execute cmd;
UPDATE A
SET A.FLAG_MYSQL=1
FROM SCCD_APP A
WHERE A.FLAG_MYSQL=0 
AND EXISTS( SELECT 1  FROM SCCD_APP B WHERE B.DOCUMENTO=A.DOCUMENTO AND B.IMAGEM_ID=A.IMAGEM_ID AND B.FLAG_MYSQL=1 )

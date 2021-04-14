/*

Apagar Imagens : C:\wamp64\www\sicnovo\carga\upload\FOR\FOR18627\VAZIO\FOR

*/

---------------------------------------------- MS SQL Server ----------------------------------------
select *
from SCCD_APP 
where DOCUMENTO='FOR-18627'
  AND OPERACAO = 'VAZIO'
order by DESTINO

;

update SCCD_APP 
   set DT_SCCD=null,
   DESTINO=null,
   FLAG_MYSQL=0
where DOCUMENTO='FOR-18627'
  AND OPERACAO = 'VAZIO'
;

--------------------------------------------------- MySQL -----------------------------------------
select *
from alb 
where FK_EMP_ORDEM='FOR18627'
and FKOPERACAO ='VAZIO'
;

select * from anx where OPERACAO='VAZIO' AND EMP_CODIGO='FOR18627';


-- delete from alb where ID_IMG in (839864,839865,839885)

-- delete from anx where ID_ORDEM in (105300)



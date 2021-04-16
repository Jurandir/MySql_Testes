/*
// FOR18627 -- teste (VAZIO	COMPLEMANTAR)
// rafael.gomes /operacional
pegar uma carta frete : select * FROM CARGASSQL.dbo.OPG order by DATATU desc
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

------------TESTE
select DISTINCT EMP_ORDEM,EMP_CODIGO,OPERACAO,FILIAL,TIPO
from anx where DATA_OPERACAO > '2021-04-13'

----------------------------------------------------------------------

--- ver duplicidades
select DOCUMENTO,DESTINO,MAX(DT_SCCD) DT_SCCD,COUNT(*) QTDE
from SCCD_APP 
group by DOCUMENTO,DESTINO
order by max(DT_SCCD) desc

--- exemplo erro antigo
SELECT * FROM SCCD_APP WHERE DOCUMENTO = 'SPO-57068'

select current_database() as database_name;
select table_name,column_name,data_type from information_schema.columns where table_schema='public' and table_name in ('brantford_patient_registrations','valleyview_patient_registrations','valleyview_chat_limits') order by table_name,ordinal_position;
select tablename,rowsecurity from pg_tables where schemaname='public' and tablename in ('brantford_patient_registrations','valleyview_patient_registrations','valleyview_chat_limits');

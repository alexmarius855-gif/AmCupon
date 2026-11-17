-- =====================================================================================
-- AmCupon v2 — de unde citeste oglinda (17.11.2026).
--
-- Prima tura reala a oglinzii (17.11, 20:30 UTC) a primit HTTP 402 „DEPLOYMENT_DISABLED" de la
-- amcupon.ro: contul Vercel e blocat din 14.11, 21:21 UTC (statusurile Vercel de pe commit-uri:
-- „Account is blocked."), iar numaratoarea de clicuri arata 0 din 15.11. Baza nu trebuie sa depinda de
-- gazduire, deci citeste fisierele direct din GitHub (main). Pe main ajung doar date care au trecut de
-- poarta de publicare (update-data.yml face commit numai daca garzile trec), deci sunt aceleasi fisiere
-- pe care le-ar servi site-ul dupa deploy.
--
-- Cand repo-ul devine privat (decizia 7), adresele se schimba aici, fara migrare, de exemplu:
--   update ops.mirror_sources set url = 'https://amcupon.ro/' || file;
-- =====================================================================================

create table ops.mirror_sources (
  kind text primary key check (kind in ('merchants', 'no_coupons', 'no_delivery', 'products')),
  file text not null,
  url  text not null check (url ~ '^https://')
);
insert into ops.mirror_sources (kind, file, url)
select v.kind, v.file, 'https://raw.githubusercontent.com/alexmarius855-gif/amcupon/main/frontend/public/' || v.file
  from (values ('merchants', 'output.json'), ('no_coupons', 'magazine-fara-cupoane.json'),
               ('no_delivery', 'magazine-fara-livrare-ro.json'), ('products', 'products.json')) v(kind, file);
grant select on ops.mirror_sources to amc_ingest;

create or replace function ops.mirror_fetch() returns integer
  language plpgsql security definer set search_path = '' as $$
declare
  r      record;
  v_etag text;
  n      integer := 0;
begin
  -- o tura pe rand: daca cea de dinainte n-a fost aplicata, nu cerem alta
  if exists (select 1 from ops.mirror_requests where processed_at is null and requested_at > now() - interval '30 minutes') then
    return 0;
  end if;
  delete from ops.mirror_requests where requested_at < now() - interval '14 days';
  for r in select s.kind, s.url from ops.mirror_sources s order by s.kind
  loop
    v_etag := null;
    if r.kind in ('merchants', 'products') then
      -- ETag-ul conteaza doar pentru aceeasi adresa: dupa o schimbare de sursa, prima cerere e completa
      select q.etag into v_etag from ops.mirror_requests q
       where q.kind = r.kind and q.url = r.url and q.etag is not null order by q.id desc limit 1;
    end if;
    insert into ops.mirror_requests (kind, url, request_id)
    values (r.kind, r.url,
            net.http_get(url := r.url,
                         headers := case when v_etag is null then '{}'::jsonb
                                         else jsonb_build_object('If-None-Match', v_etag) end,
                         timeout_milliseconds := 60000));
    n := n + 1;
  end loop;
  return n;
end $$;
revoke execute on function ops.mirror_fetch() from public;

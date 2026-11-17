-- Teste pentru schema-v2.sql, pe un Postgres de proba (NU pe Supabase).
-- Cum se ruleaza (vezi ARHITECTURA-V2.md, „Verificarea schemei"):
--   psql -d proba -f stub-supabase   (schema extensions + rolurile anon/authenticated/service_role)
--   psql -d proba -f schema-v2.sql
--   psql -d proba -f teste-schema-v2.sql
-- Fiecare rand marcat „asteptat" trebuie sa iasa exact asa; orice „NU A PICAT" e o problema.
\set ON_ERROR_STOP on

insert into core.merchants (slug, name, primary_category_id) values
  ('libris.ro',       'Libris',       (select id from core.categories where slug = 'carti-educatie')),
  ('kitunghii.ro',    'Kit Unghii',   (select id from core.categories where slug = 'beauty')),
  ('fara-program.ro', 'Fara Program', (select id from core.categories where slug = 'casa-gradina')),
  ('eufy-nl.com',     'Eufy NL',      (select id from core.categories where slug = 'electronice'));
insert into core.merchant_domains (domain, merchant_id, is_primary) select slug, id, true from core.merchants;

-- libris: program activ; kitunghii: programul interzice site-urile de cupoane; eufy: doar NL/BE.
insert into core.programs (network_code, external_id, merchant_id, name, status, tracking_url, allows_coupon_sites, ships_to, commission_pct) values
  ('2performant', 'p1', (select id from core.merchants where slug = 'libris.ro'),    'Libris',     'active', 'https://event.2performant.com/events/click?x=1', 'yes', null,      8),
  ('2performant', 'p2', (select id from core.merchants where slug = 'kitunghii.ro'), 'Kit Unghii', 'active', 'https://event.2performant.com/events/click?x=2', 'no',  null,      10),
  ('impact',      'c3', (select id from core.merchants where slug = 'eufy-nl.com'),  'Eufy NL',    'active', 'https://eufy.pxf.io/c/1/2/3',                   'yes', '{NL,BE}', 5);

insert into core.offers (merchant_id, program_id, dedup_key, kind, title, code, discount_type, discount_value,
                         landing_url, tracking_url, starts_at, ends_at, content_hash) values
  (1, 1, 'k1', 'code', '20% la carti',        'LIBRIS20', 'percent', 20,   'https://libris.ro/',   'https://event.2performant.com/events/click?x=o1', now() - interval '1 day', now() + interval '3 days', 'h1'),
  (1, 1, 'k2', 'deal', 'Oferta expirata',     null,       null,      null, 'https://libris.ro/a',  'https://event.2performant.com/events/click?x=o2', now() - interval '9 days', now() - interval '1 day', 'h2'),
  (1, 1, 'k3', 'deal', 'Black Friday Libris', null,       null,      null, 'https://libris.ro/bf', null, now() + interval '3 days', now() + interval '9 days', 'h3'),
  (2, 2, 'k4', 'code', 'Cod Kit Unghii',      'KIT10',    'percent', 10,   'https://kitunghii.ro/', null, null, null, 'h4');

-- 1. Constrangerile: toate 10 trebuie sa opreasca scrierea, fiecare cu motivul ei.
insert into ads.advertisers (name) values ('Test');
do $$
declare t text; n int := 0;
begin
  foreach t in array array[
    $q$insert into core.offers (merchant_id,dedup_key,kind,title,landing_url,content_hash) values (1,'x1','code','Cod fara cod','https://libris.ro/','h')$q$,
    $q$insert into core.offers (merchant_id,dedup_key,kind,title,code,landing_url,content_hash) values (1,'x2','deal','Oferta cu cod','ABC10','https://libris.ro/','h')$q$,
    $q$insert into core.offers (merchant_id,dedup_key,kind,title,code,discount_type,discount_value,landing_url,content_hash) values (1,'x3','code','Reducere 140%','ABC10','percent',140,'https://libris.ro/','h')$q$,
    $q$insert into core.offers (merchant_id,dedup_key,kind,title,landing_url,content_hash,is_exclusive) values (1,'x4','deal','Exclusiv inventat','https://libris.ro/','h',true)$q$,
    $q$insert into core.offers (merchant_id,dedup_key,kind,title,landing_url,content_hash,moderation) values (1,'x5','deal','Ascunsa fara motiv','https://libris.ro/','h','hidden')$q$,
    $q$insert into core.products (merchant_id,external_id,url,title,price) values (1,'b1','https://libris.ro/p','Prajitura 36 g',0.81)$q$,
    $q$insert into core.landing_pages (path,kind,title) values ('/x','niche','Un titlu de pagina mult prea lung care depaseste saizeci de caractere sigur')$q$,
    $q$insert into core.landing_pages (path,kind,title,status) values ('/y','niche','Titlu bun','approved')$q$,
    $q$insert into core.merchant_domains (domain, merchant_id) values ('www.libris.ro',1)$q$,
    $q$insert into ads.campaigns (advertiser_id,name,kind,label,pricing,price,starts_at,ends_at) values ((select max(id) from ads.advertisers),'x','banner','Recomandat','flat',1,now(),now()+interval '1 day')$q$
  ] loop
    begin
      execute t;
      raise notice 'NU A PICAT: %', left(t, 90);
    exception when check_violation then
      n := n + 1;
      raise notice 'oprit corect: %', sqlerrm;
    end;
  end loop;
  raise notice 'asteptat 10 din 10: % din 10', n;
end $$;

-- 2. Istoricul de pret: un rand la creare + unul la schimbare; acelasi pret sau „vazut azi" nu adauga.
insert into core.products (merchant_id, program_id, external_id, url, title, price, currency_proven) values
  (1, 1, 'pr1', 'https://libris.ro/bicicleta', 'Bicicletă electrică roșie pliabilă', 2500, true);
update core.products set price = 2400 where external_id = 'pr1';
update core.products set price = 2400 where external_id = 'pr1';
update core.products set last_seen_at = now() where external_id = 'pr1';
select 'asteptat 2' as test, count(*) as price_points from core.price_points;

-- 3. Coada de revalidare: fiecare eticheta o singura data cat timp asteapta.
select 'asteptat: merchant:kitunghii.ro, merchant:libris.ro, offers' as test,
       string_agg(tag, ', ' order by tag) from ops.revalidation_queue where processed_at is null;

-- 4. Vederile.
select 'asteptat: 20% la carti LIBRIS20' as test, string_agg(title || ' ' || coalesce(code, '-'), '; ') from site.offers_live;
select 'asteptat: Black Friday Libris' as test, string_agg(title, '; ') from site.offers_upcoming;
-- asteptat: eufy-nl.com no_delivery; fara-program.ro no_program; kitunghii.ro redirect /categorii/beauty; libris.ro full + indexabil
select slug, page_mode, redirect_path, indexable, offers_count, products_count from site.merchants order by slug;
select 'asteptat: /cod-reducere/libris.ro' as test, string_agg(path, ', ') from site.sitemap;
select 'asteptat: gaseste bicicleta' as test, string_agg(title, '; ') from site.search_products('bicicleta rosie');
select 'asteptat: gaseste si cu greseala' as test, string_agg(title, '; ') from site.search_products('bicicelta electrica');
select 'asteptat: min_30d 2400' as test, product_id, price, min_30d from site.price_stats;
-- asteptat: libris platit (oferta si magazin); fara-program si kitunghii neplatite -> pagina noastra
select target_kind, merchant_slug, tracking_url is not null as platit
  from site.outbound
 where (target_kind = 'offer' and target_id = 1)
    or (target_kind = 'merchant' and merchant_slug in ('fara-program.ro', 'kitunghii.ro', 'libris.ro'));

-- 5. Drepturile rolului site-ului: citeste doar `site`, scrie doar prin functii.
set role amc_site;
do $$ begin
  begin perform 1 from core.offers limit 1; raise notice 'NU A PICAT: amc_site citeste core.offers';
  exception when insufficient_privilege then raise notice 'ok: amc_site nu citeste core.offers'; end;
  begin perform 1 from core.programs limit 1; raise notice 'NU A PICAT: amc_site citeste comisionul';
  exception when insufficient_privilege then raise notice 'ok: amc_site nu citeste core.programs (comisionul)'; end;
  begin insert into track.clicks (click_id) values ('abcdefghij'); raise notice 'NU A PICAT: amc_site scrie direct clicuri';
  exception when insufficient_privilege then raise notice 'ok: amc_site nu scrie direct in track.clicks'; end;
end $$;
select site.log_click('k7x2m9q4wz', 'offer', 1, '/cod-reducere/libris.ro', 'offer_card', null, 'google.com', 'mobile', false);
select 'asteptat t' as test, site.vote_offer(1, 'h_aaaaaaaaaaaaaaaaaaaa', true);
select 'asteptat f (votase deja)' as test, site.vote_offer(1, 'h_aaaaaaaaaaaaaaaaaaaa', false);
select 'asteptat f (oferta expirata)' as test, site.vote_offer(2, 'h_bbbbbbbbbbbbbbbbbbbb', true);
reset role;
select 'asteptat: magazin 1, program 1, oferta 1' as test, click_id, merchant_id, program_id, offer_id, page_path from track.clicks;
select 'asteptat 0' as test, count(*) as coloane_cu_comision_in_site
  from information_schema.columns
 where table_schema = 'site' and (column_name ilike '%commission%' or column_name ilike '%rules%');

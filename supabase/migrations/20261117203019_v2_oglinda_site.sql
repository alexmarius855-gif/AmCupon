-- =====================================================================================
-- AmCupon v2 — puntea: baza copiaza ce publica pipeline-ul de azi (17.11.2026).
--
-- De ce: importul v2 din retele (Python, GitHub Actions) are nevoie de un secret pe care doar Alex il
-- poate pune. Pana atunci, baza citeste fisierele PUBLICE ale site-ului (output.json, products.json si
-- cele doua liste de magazine scoase) si le scrie in core.*, de cateva ori pe zi. Datele sunt deja
-- trecute prin toate regulile de azi, deci v2 porneste exact de la ce vede omul pe site.
-- Cand adaptoarele v2 scriu direct, joburile `amc-mirror-*` se opresc.
--
-- Proba locala: scripts/v2/proba_oglinda.py (aceleasi functii, cu fisierele din frontend/public).
-- Sursa (de unde descarca): 20261117203446_v2_oglinda_sursa.sql, tabelul ops.mirror_sources.
-- =====================================================================================

do $$ begin
  if exists (select 1 from pg_available_extensions where name = 'pg_net') then
    create extension if not exists pg_net with schema extensions;   -- pe Supabase; local lipseste (proba: net simulat)
  end if;
end $$;

-- updated_at = „s-a schimbat ce vede omul". „Vazut azi in fisier" (last_seen_at) nu e o schimbare:
-- altfel data din sitemap s-ar muta la fiecare rulare (problema din 16.08 cu lastModified = now).
create or replace function core.touch_updated_at() returns trigger
  language plpgsql set search_path = '' as $$
begin
  if (to_jsonb(new) - 'updated_at' - 'last_seen_at' - 'search')
     is distinct from (to_jsonb(old) - 'updated_at' - 'last_seen_at' - 'search') then
    new.updated_at := now();
  else
    new.updated_at := old.updated_at;
  end if;
  return new;
end $$;

-- O data gresita dintr-un fisier nu trebuie sa opreasca toata oglinda.
create function core.safe_date(p text) returns date
  language plpgsql immutable set search_path = '' as $$
begin
  if p is null or p !~ '^\d{4}-\d{2}-\d{2}' then return null; end if;
  return left(p, 10)::date;
exception when others then
  return null;
end $$;

-- Doua taxonomii azi: /categorii/<slug> (magazine) si /produse/<slug> (produse). Una singura acum,
-- cu adresa paginii de produse ca alias, ca adresele vechi sa ramana.
alter table core.categories add column if not exists product_slug text unique
  check (product_slug is null or product_slug ~ '^[a-z0-9-]+$');
update core.categories c set product_slug = v.ps
  from (values ('casa-gradina', 'casa'), ('fashion', 'fashion'), ('beauty', 'beauty'), ('carti-educatie', 'carti'),
               ('copii', 'copii'), ('electronice', 'electronice'), ('bijuterii', 'bijuterii'),
               ('mancare-bauturi', 'alimente'), ('auto-moto', 'auto'), ('sanatate', 'farmacie'),
               ('animale', 'animale'), ('sport', 'sport')) v(slug, ps)
 where c.slug = v.slug;
insert into core.categories (slug, name, parent_id, sort, product_slug)
select 'jocuri', 'Jocuri & Jucării', id, 19, 'jocuri' from core.categories where slug = 'copii'
on conflict (slug) do nothing;

-- Numele: calculat din domeniu (ca numeAfisat din lib/numeMagazin.ts) pana il scrie un om.
alter table core.merchants add column if not exists name_source text not null default 'auto'
  check (name_source in ('auto', 'manual', 'network'));

create function core.display_name(p_slug text) returns text
  language plpgsql immutable set search_path = '' as $$
declare
  parti   text[] := array_remove(string_to_array(lower(coalesce(p_slug, '')), '.'), '');
  neutre  text[] := array['store', 'shop', 'www', 'm', 'app', 'go', 'new', 'my', 'web', 'online', 'buy', 'ai',
                          'ro', 'us', 'uk', 'de', 'fr', 'it', 'es', 'nl', 'pl', 'eu', 'en', 'hu', 'bg', 'cz',
                          'sk', 'gr', 'pt', 'se', 'dk', 'fi', 'no', 'ie', 'at', 'ch', 'be', 'ca', 'au', 'sg'];
  regiuni text[] := array['us', 'uk', 'de', 'fr', 'it', 'es', 'nl', 'pl', 'eu', 'hu', 'bg', 'cz', 'sk', 'gr',
                          'pt', 'se', 'dk', 'fi', 'no', 'ie', 'at', 'ch', 'be', 'ca', 'au', 'sg', 'asia'];
  n       integer := coalesce(array_length(parti, 1), 0);
  i       integer := 1;
  baza    text;
  reg     text;
begin
  if n = 0 then return ''; end if;
  while i < n - 1 and parti[i] = any (neutre) loop i := i + 1; end loop;   -- sare peste store., de., www.
  select string_agg(upper(left(w, 1)) || substr(w, 2), ' ')
    into baza
    from unnest(string_to_array(replace(coalesce(parti[i], parti[1]), '-', ' '), ' ')) w
   where w <> '';
  if n >= 2 and parti[1] = any (regiuni) then reg := upper(parti[1]);        -- de.anthbot.com
  elsif n >= 2 and parti[n] = any (regiuni) then reg := upper(parti[n]);     -- vevor.com.au
  end if;
  return case when reg is null then baza else baza || ' ' || reg end;
end $$;

-- Parametrii din linkurile de afiliere sunt codati (%2F...). Postgres nu are functia, deci o scriem.
create function core.url_decode(p text) returns text
  language sql immutable strict set search_path = '' as $$
  select convert_from(coalesce(string_agg(
           case when t.m[1] ~ '^%[0-9a-fA-F]{2}$' then decode(substr(t.m[1], 2), 'hex')
                else convert_to(replace(t.m[1], '+', ' '), 'UTF8') end, ''::bytea order by t.n), ''::bytea), 'UTF8')
    from regexp_matches(p, '(%[0-9a-fA-F]{2}|[^%]+|%)', 'g') with ordinality as t(m, n);
$$;

-- Acelasi test ca esteLinkAfiliat din lib/subId.ts: gazdele retelelor + calea Impact /c/<p>/<a>/<c>.
create function core.is_tracking_url(p text) returns boolean
  language sql immutable set search_path = '' as $$
  select coalesce(p ~ '^https://'
     and (p ~* '(event\.2performant\.com|pxf\.io|sjv\.io|impactradius|impact\.com|awin1\.com|anrdoezrs\.net|prf\.hn)'
          or p ~* '^https?://[^/?#]+/c/\d{5,9}/\d+/\d+'), false);
$$;

-- Unde duce de fapt un link de afiliere (redirect_to la 2P, u= la Impact, ued= la Awin).
create function core.landing_from_tracking(p text) returns text
  language sql immutable set search_path = '' as $$
  select coalesce(core.url_decode((regexp_match(p, '[?&](?:redirect_to|u|ued|url)=([^&#]+)'))[1]), p);
$$;

-- O adresa scrisa fara schema de magazin („www.oleya.ro") devine https://...; altceva ramane null.
create function core.absolute_url(p text) returns text
  language sql immutable set search_path = '' as $$
  select case when p ~* '^https?://[^/\s]+' then p
              when p ~* '^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(/\S*)?$' then 'https://' || p end;
$$;

-- 2P scrie uneori destinatia quicklink-ului fara schema (redirect_to=www.oleya.ro, 3 oferte pe 17.11):
-- acelasi link, cu adresa completa, ca in formatul documentat al quicklink-ului.
create function core.fix_tracking_redirect(p text) returns text
  language sql immutable set search_path = '' as $$
  select regexp_replace(p, '([?&]redirect_to=)(?!https?(:|%3a))(?=(www\.|[a-z0-9-]+\.))', '\1https%3A%2F%2F', 'i');
$$;

-- Iesirea unei oferte fara link propriu cade pe linkul magazinului (tot platit), nu direct pe pagina noastra.
create or replace view site.outbound as
select 'offer'::text as target_kind, o.id as target_id, o.merchant_id, m.slug as merchant_slug,
       coalesce(case when p.status = 'active' and p.allows_coupon_sites <> 'no' and o.tracking_url is not null then p.id end,
                sm.program_id) as program_id,
       coalesce(case when p.status = 'active' and p.allows_coupon_sites <> 'no' then o.tracking_url end,
                case when sm.page_mode = 'full' then bp.tracking_url end) as tracking_url,
       coalesce(case when p.status = 'active' and o.tracking_url is not null then n.subid_param end, bn.subid_param) as subid_param
  from core.offers o
  join core.merchants m on m.id = o.merchant_id
  left join core.programs p on p.id = o.program_id
  left join core.networks n on n.code = p.network_code
  left join site.merchants sm on sm.id = o.merchant_id
  left join core.programs bp on bp.id = sm.program_id
  left join core.networks bn on bn.code = bp.network_code
union all
select 'product', pr.id, pr.merchant_id, m.slug, p.id,
       case when p.status = 'active' then pr.tracking_url end,
       n.subid_param
  from core.products pr
  join core.merchants m on m.id = pr.merchant_id
  left join core.programs p on p.id = pr.program_id
  left join core.networks n on n.code = p.network_code
union all
select 'merchant', sm.id, sm.id, sm.slug, p.id,
       case when sm.page_mode = 'full' then p.tracking_url end,
       n.subid_param
  from site.merchants sm
  left join core.programs p on p.id = sm.program_id
  left join core.networks n on n.code = p.network_code;

-- ── Carantina oglinzii = lista problemelor de ACUM ──────────────────────────────────
-- Fiecare problema apare o singura data cat timp e deschisa; cea care nu mai e in fisier se inchide
-- singura. Altfel ar intra ~1.400 de randuri identice la fiecare rulare (proba din 17.11).
-- Citeste tabelul temporar _q (entity, network_code, merchant_slug, rule, sample, resolution).
create index quarantine_open_key on ops.quarantine (detail, entity, rule, merchant_slug) where resolved_at is null;

create function ops.sync_quarantine(p_run bigint, p_detail text) returns integer
  language plpgsql security definer set search_path = '' as $$
declare
  v_n integer;
begin
  update ops.quarantine q set resolved_at = now(), resolution = 'nu mai apare in sursa'
   where q.resolved_at is null and q.detail = p_detail
     and not exists (select 1 from _q n
                      where n.entity = q.entity and n.rule = q.rule
                        and n.merchant_slug is not distinct from q.merchant_slug
                        and n.sample is not distinct from q.sample);
  insert into ops.quarantine (run_id, entity, network_code, merchant_slug, rule, detail, sample, resolution)
  select distinct on (n.entity, n.rule, n.merchant_slug, n.sample)
         p_run, n.entity, n.network_code, n.merchant_slug, n.rule, p_detail, n.sample, n.resolution
    from _q n
   where not exists (select 1 from ops.quarantine q
                      where q.resolved_at is null and q.detail = p_detail and q.entity = n.entity and q.rule = n.rule
                        and q.merchant_slug is not distinct from n.merchant_slug
                        and q.sample is not distinct from n.sample);
  get diagnostics v_n = row_count;
  delete from ops.quarantine where detail = p_detail and resolved_at < now() - interval '30 days';
  return v_n;
end $$;

-- ── Oglinda: magazine, programe, oferte ─────────────────────────────────────────────
-- p_data = output.json; p_no_coupons = magazine-fara-cupoane.json; p_no_delivery = magazine-fara-livrare-ro.json
create function ops.mirror_merchants(p_data jsonb, p_no_coupons jsonb, p_no_delivery jsonb)
returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare
  -- „vazut in rularea asta" = ora tranzactiei, aceeasi pe care o scrie now() in last_seen_at.
  -- Cu clock_timestamp() (ora de acum, mai tarzie) tot ce tocmai s-a scris parea nevazut si expira (proba 17.11).
  v_start timestamptz := now();
  v_run   bigint;
  v_stats jsonb := '{}';
  v_n     integer;
begin
  if jsonb_typeof(p_data) <> 'array' or jsonb_array_length(p_data) < 300 then
    raise exception 'output.json pare trunchiat (% magazine): nu scriu nimic', coalesce(jsonb_array_length(p_data), 0);
  end if;
  insert into ops.ingest_runs (job) values ('mirror-merchants') returning id into v_run;
  drop table if exists _m, _ex, _p, _o, _q;

  create temp table _m on commit drop as
  select lower(x->>'magazin') as slug, x->>'url' as url, nullif(x->>'url_afiliat', '') as url_afiliat,
         nullif(x->>'logo_url', '') as logo_url, x->>'categorie_slug' as cat, x->>'platforma' as network,
         nullif(x->>'program_id', '') as program_id, lower(coalesce(x->>'allows_deep_linking', '')) = 'true' as deeplink,
         coalesce(x->'promotii', '[]'::jsonb) as promos
    from jsonb_array_elements(p_data) x
   where lower(x->>'magazin') ~ '^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$'
     and x->>'platforma' in (select code from core.networks);
  get diagnostics v_n = row_count;
  v_stats := v_stats || jsonb_build_object('magazine_in_fisier', v_n);

  -- Magazinele scoase de pe site (programul interzice cupoanele / nu livreaza in Romania)
  create temp table _ex on commit drop as
  select lower(x->>'magazin') as slug, 'coupons'::text as why, x->>'destinatie' as dest,
         null::char(2)[] as regions, x->>'categorie_slug' as cat, null::text as url, null::text as program
    from jsonb_array_elements(coalesce(p_no_coupons, '[]')) x
  union all
  select lower(x->>'magazin'), 'delivery', null,
         array(select upper(r) from jsonb_array_elements_text(coalesce(x->'regiuni', '[]')) r where r ~ '^[A-Za-z]{2}$')::char(2)[],
         x->>'categorie_slug', x->>'url', x->>'program'
    from jsonb_array_elements(coalesce(p_no_delivery, '[]')) x;
  delete from _ex where slug !~ '^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$' or slug in (select slug from _m);

  -- 1. Magazinele
  insert into core.merchants (slug, name, primary_category_id, logo_source_url)
  select s.slug, core.display_name(s.slug), c.id, s.logo_url
    from (select slug, cat, logo_url from _m union all select slug, cat, null from _ex) s
    left join core.categories c on c.slug = s.cat
  on conflict (slug) do update
     set primary_category_id = coalesce(excluded.primary_category_id, core.merchants.primary_category_id),
         logo_source_url     = coalesce(excluded.logo_source_url, core.merchants.logo_source_url),
         name = case when core.merchants.name_source = 'auto' then excluded.name else core.merchants.name end
   where (core.merchants.primary_category_id, core.merchants.logo_source_url,
          case when core.merchants.name_source = 'auto' then excluded.name else core.merchants.name end)
         is distinct from
         (coalesce(excluded.primary_category_id, core.merchants.primary_category_id),
          coalesce(excluded.logo_source_url, core.merchants.logo_source_url), core.merchants.name);
  insert into core.merchant_domains (domain, merchant_id, is_primary)
  select m.slug, m.id, true from core.merchants m
   where m.slug in (select slug from _m union select slug from _ex)
  on conflict do nothing;

  -- Scoase pentru cupoane: pagina duce unde duce si azi. Revenite in output.json: redirectul se sterge.
  update core.merchants m set redirect_to = e.dest
    from _ex e where e.slug = m.slug and e.why = 'coupons' and e.dest ~ '^/' and m.redirect_to is distinct from e.dest;
  update core.merchants m set redirect_to = null
   where m.redirect_to is not null and m.slug in (select slug from _m);

  -- 2. Programele: id-ul real cand il stim (program_id la 2P, campania din link la Impact, awinmid la Awin)
  create temp table _p on commit drop as
  select m.slug, mm.id as merchant_id, m.network,
         coalesce(case m.network
                    when '2performant' then m.program_id
                    when 'impact' then (regexp_match(m.url_afiliat, '/c/\d+/\d+/(\d+)'))[1]
                    when 'awin' then (regexp_match(m.url_afiliat, '[?&]awinmid=(\d+)'))[1]
                  end, 'site:' || m.slug) as external_id,
         core.fix_tracking_redirect(m.url_afiliat) as tracking_url,
         case when m.network = '2performant' then true else m.deeplink end as deeplink,
         case m.cat when 'software' then 'saas' when 'calatorii' then 'travel' when 'financiar' then 'finance'
                    when 'servicii' then 'service' when 'marketplace' then 'marketplace' else 'retail' end as kind
    from _m m join core.merchants mm on mm.slug = m.slug
   where core.is_tracking_url(m.url_afiliat) and m.url_afiliat <> m.url;
  -- acelasi id la doua domenii: fiecare magazin isi pastreaza programul lui
  update _p set external_id = external_id || ':' || slug
   where (network, external_id) in (select network, external_id from _p group by 1, 2 having count(*) > 1);

  insert into core.programs (network_code, external_id, merchant_id, name, status, kind, tracking_url, deeplink_allowed, last_seen_at)
  select p.network, p.external_id, p.merchant_id, core.display_name(p.slug), 'active', p.kind, p.tracking_url, p.deeplink, now()
    from _p p
  on conflict (network_code, external_id) do update
     set merchant_id = excluded.merchant_id, status = 'active', tracking_url = excluded.tracking_url,
         deeplink_allowed = excluded.deeplink_allowed, kind = excluded.kind, last_seen_at = now();
  get diagnostics v_n = row_count;
  v_stats := v_stats || jsonb_build_object('programe_active', v_n);

  -- Programele scoase: fara livrare in Romania (tarile programului) / cupoane interzise
  -- (programele care interzic cupoanele sunt la 2Performant; cele fara livrare in RO, la Impact)
  insert into core.programs (network_code, external_id, merchant_id, name, status, ships_to, allows_coupon_sites, last_seen_at)
  select case when e.why = 'coupons' then '2performant' else 'impact' end, 'site:' || e.slug, m.id,
         coalesce(nullif(e.program, ''), core.display_name(e.slug)), 'active',
         case when e.why = 'delivery' and cardinality(e.regions) > 0 then e.regions end,
         case when e.why = 'coupons' then 'no'::core.tri_state else 'unknown'::core.tri_state end, now()
    from _ex e join core.merchants m on m.slug = e.slug
  on conflict (network_code, external_id) do update
     set status = 'active', ships_to = excluded.ships_to, allows_coupon_sites = excluded.allows_coupon_sites,
         last_seen_at = now();

  -- Programele care nu mai apar in fisiere: expirate (pagina devine „fara program"). Cat timp ruleaza
  -- oglinda, toate programele vin din ea; cand pornesc adaptoarele v2, oglinda se opreste.
  update core.programs set status = 'expired'
   where status = 'active' and last_seen_at < v_start;
  get diagnostics v_n = row_count;
  v_stats := v_stats || jsonb_build_object('programe_expirate', v_n);

  -- 3. Ofertele
  create temp table _o on commit drop as
  with raw as (
    select m.slug, mm.id as merchant_id, m.network, pr.id as program_id,
           nullif(trim(p->>'nume'), '') as nume, nullif(trim(p->>'descriere'), '') as descriere,
           nullif(trim(p->>'cod_cupon'), '') as cod, nullif(trim(p->>'landing_page'), '') as landing,
           nullif(p->>'incepe', '') as incepe, nullif(p->>'expira', '') as expira, p->>'sursa' as sursa
      from _m m
      join core.merchants mm on mm.slug = m.slug
      left join _p pp on pp.slug = m.slug
      left join core.programs pr on pr.network_code = pp.network and pr.external_id = pp.external_id
      cross join lateral jsonb_array_elements(m.promos) p
  ), clean as (
    select r.*,
           case when r.cod is not null and length(r.cod) between 3 and 30 and r.cod !~ '\s' then r.cod end as code,
           -- la Impact titlul e des chiar codul („DH2026NOVSAVE6"): atunci titlul e descrierea
           left(case when r.descriere is not null
                      and (r.nume is null or upper(r.nume) = upper(coalesce(r.cod, '')) or r.nume ~ '^[A-Z0-9][A-Z0-9_-]{3,29}$')
                     then r.descriere else r.nume end, 200) as title
      from raw r
  )
  select c.*,
         case when c.landing is null then null
              when core.is_tracking_url(c.landing) then core.fix_tracking_redirect(c.landing) end as tracking_url,
         coalesce(core.absolute_url(case when core.is_tracking_url(c.landing) then core.landing_from_tracking(c.landing)
                                         else c.landing end),
                  'https://' || c.slug) as landing_url,
         (core.safe_date(c.incepe)::timestamp at time zone 'Europe/Bucharest') as starts_at,
         -- `expira` = ultima zi valabila; peste 3 ani nu e o data, e un artefact de feed (PRAG_DATA_ABSURDA)
         case when core.safe_date(c.expira) < current_date + 1095
              then ((core.safe_date(c.expira) + 1)::timestamp at time zone 'Europe/Bucharest') end as ends_at,
         md5(lower(regexp_replace(coalesce(c.title, ''), '\s+', ' ', 'g')) || '|' || coalesce(c.code, '')) as dedup_key
    from clean c;

  -- Ce nu poate intra: in carantina, cu motivul (restul se publica)
  create temp table _q on commit drop as
  select 'offer'::text as entity, network as network_code, slug as merchant_slug,
         case when title is null or length(title) < 3 then 'titlu_lipsa'
              when landing_url !~ '^https?://' then 'link_invalid'
              when ends_at is not null and starts_at is not null and ends_at <= starts_at then 'date_inversate' end as rule,
         left(coalesce(nume, descriere, ''), 200) as sample, null::text as resolution
    from _o
   where title is null or length(title) < 3 or landing_url !~ '^https?://'
      or (ends_at is not null and starts_at is not null and ends_at <= starts_at);
  delete from _o where title is null or length(title) < 3 or landing_url !~ '^https?://'
      or (ends_at is not null and starts_at is not null and ends_at <= starts_at);
  insert into _q
  select 'offer', network, slug, 'cod_invalid', left(cod, 60), 'importata ca oferta fara cod'
    from _o where cod is not null and code is null;
  v_stats := v_stats || jsonb_build_object('carantina', (select count(*) from _q),
                                           'carantina_noua', ops.sync_quarantine(v_run, 'oglinda output.json'));
  -- aceeasi oferta de doua ori in fisier: o singura data
  delete from _o a using _o b
   where a.merchant_id = b.merchant_id and a.dedup_key = b.dedup_key and a.ctid > b.ctid;

  insert into core.offers (merchant_id, program_id, dedup_key, kind, title, description, title_raw, description_raw, code,
                           landing_url, tracking_url, starts_at, ends_at, content_hash, last_seen_at, removed_at)
  select o.merchant_id, o.program_id, o.dedup_key,
         case when o.code is not null then 'code'::core.offer_kind else 'deal'::core.offer_kind end,
         o.title, left(nullif(o.descriere, o.title), 1000), o.nume, o.descriere, o.code,
         o.landing_url, o.tracking_url, o.starts_at, o.ends_at,
         -- datele ca numar de secunde: textul unui timestamptz depinde de fusul sesiunii (cron vs. mana)
         md5(concat_ws('|', o.title, nullif(o.descriere, o.title), o.code, o.landing_url, o.tracking_url,
                       extract(epoch from o.starts_at), extract(epoch from o.ends_at))),
         now(), null
    from _o o
  on conflict (merchant_id, dedup_key) do update
     set program_id = excluded.program_id, kind = excluded.kind, title = excluded.title,
         description = excluded.description, title_raw = excluded.title_raw, description_raw = excluded.description_raw,
         code = excluded.code, landing_url = excluded.landing_url, tracking_url = excluded.tracking_url,
         starts_at = excluded.starts_at, ends_at = excluded.ends_at, content_hash = excluded.content_hash,
         last_seen_at = now(), removed_at = null;
  get diagnostics v_n = row_count;
  v_stats := v_stats || jsonb_build_object('oferte_in_fisier', v_n);

  insert into core.offer_sources (network_code, external_id, offer_id, last_seen_at)
  select o.network, 'site:' || md5(o.slug || '|' || o.dedup_key), co.id, now()
    from _o o join core.offers co on co.merchant_id = o.merchant_id and co.dedup_key = o.dedup_key
  on conflict (network_code, external_id) do update set last_seen_at = now(), offer_id = excluded.offer_id;

  -- Ofertele oglinzii disparute din fisier: scoase (raman in istoric, cu removed_at)
  update core.offers o set removed_at = now()
   where o.removed_at is null and o.last_seen_at < v_start
     and exists (select 1 from core.offer_sources s where s.offer_id = o.id and s.external_id like 'site:%');
  get diagnostics v_n = row_count;
  v_stats := v_stats || jsonb_build_object('oferte_scoase', v_n);

  update ops.ingest_runs set finished_at = clock_timestamp(), status = 'ok', stats = v_stats where id = v_run;
  return v_stats;
end $$;

-- ── Oglinda: produse ────────────────────────────────────────────────────────────────
-- p_data = products.json ({"products": [...]}). Produsele-promotie (is_promo, pret 0) nu sunt produse.
create function ops.mirror_products(p_data jsonb)
returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare
  v_run   bigint;
  v_stats jsonb := '{}';
  v_n     integer;
  v_prev  integer;
begin
  if jsonb_typeof(p_data->'products') <> 'array' then
    raise exception 'products.json fara lista de produse: nu scriu nimic';
  end if;
  select count(*) into v_prev from core.products where in_stock;
  -- Garda de azi din fetch_product_feeds.py: o cadere sub 40% dintr-un fisier mare = sursa stricata
  if v_prev > 1000 and jsonb_array_length(p_data->'products') < v_prev * 0.4 then
    insert into ops.ingest_runs (job, status, finished_at, stats)
    values ('mirror-products', 'source_broken', clock_timestamp(),
            jsonb_build_object('in_fisier', jsonb_array_length(p_data->'products'), 'in_baza', v_prev));
    return jsonb_build_object('oprit', 'products.json are sub 40% din produsele publicate');
  end if;
  insert into ops.ingest_runs (job) values ('mirror-products') returning id into v_run;
  drop table if exists _pr, _q;

  create temp table _pr on commit drop as
  select lower(x->>'merchant_slug') as slug, x->>'title' as title, x->>'url' as url_tracking,
         nullif(x->>'url_original', '') as url, nullif(x->>'image', '') as image,
         case when (x->>'price') ~ '^\d+(\.\d+)?$' then (x->>'price')::numeric end as price,
         nullif(x->>'brand', '') as brand, nullif(x->>'category', '') as category_raw, x->>'cat_slug' as cat_slug,
         nullif(x->>'feed_id', '') as feed_id
    from jsonb_array_elements(p_data->'products') x
   where coalesce((x->>'is_promo')::boolean, false) = false;
  get diagnostics v_n = row_count;
  v_stats := v_stats || jsonb_build_object('produse_in_fisier', v_n);

  -- `magazin_fara_program`: produsul e in products.json, dar magazinul nu e pe site (output.json are doar
  -- magazinele cu program aprobat). Pe 17.11: 1.238 de produse de la 27 de magazine (kiehls.ro, kedoo.ro...),
  -- niciunul printre cele 498 de programe 2P aprobate din data/2p-reguli.json.
  create temp table _q on commit drop as
  select 'product'::text as entity, '2performant'::text as network_code, p.slug as merchant_slug,
         case when p.price is null or p.price = 0 then 'pret_lipsa'   -- „Vezi pretul" pe site azi; v2 publica doar cu pret
              when p.price < 1 then 'pret_corupt'
              when p.url is null or p.url !~ '^https?://' then 'link_invalid'
              when length(coalesce(p.title, '')) < 3 then 'titlu_lipsa'
              else 'magazin_fara_program' end as rule,
         left(coalesce(p.title, ''), 200) as sample, null::text as resolution
    from _pr p
   where p.price is null or p.price < 1 or p.url is null or p.url !~ '^https?://' or length(coalesce(p.title, '')) < 3
      or not exists (select 1 from core.merchants m where m.slug = p.slug);
  delete from _pr p
   where p.price is null or p.price < 1 or p.url is null or p.url !~ '^https?://' or length(coalesce(p.title, '')) < 3
      or not exists (select 1 from core.merchants m where m.slug = p.slug);
  v_stats := v_stats || jsonb_build_object('carantina', (select count(*) from _q),
                                           'carantina_noua', ops.sync_quarantine(v_run, 'oglinda products.json'));

  -- Sursele (feed-urile 2P): memoria rotatiei se muta aici
  insert into core.feeds (network_code, external_id, kind, program_id, merchant_id, last_synced_at, last_complete)
  select distinct on (p.feed_id) '2performant', p.feed_id, 'product_feed', sm.program_id, m.id, now(), true
    from _pr p join core.merchants m on m.slug = p.slug left join site.merchants sm on sm.id = m.id
   where p.feed_id ~ '^\d+$'
  on conflict (network_code, external_id) do update set last_synced_at = now(), merchant_id = excluded.merchant_id;

  insert into core.products (merchant_id, program_id, feed_id, external_id, url, tracking_url, title, title_raw, brand,
                             category_id, category_raw, image_url, price, currency, currency_proven, condition, in_stock,
                             last_seen_at)
  select distinct on (m.id, md5(p.url))
         m.id, sm.program_id, f.id, md5(p.url), p.url,
         case when core.is_tracking_url(p.url_tracking) then p.url_tracking end,
         left(p.title, 300), p.title, left(p.brand, 120), c.id, left(p.category_raw, 200), p.image, p.price, 'RON', true,
         case when p.title ~* '\(resigilat\)' then 'resealed'::core.product_condition
              when p.title ~* '\(recondi[tț]ionat\)' then 'refurbished'::core.product_condition
              when p.title ~* '\(second hand\)' then 'used'::core.product_condition
              else 'unknown'::core.product_condition end,
         true, now()
    from _pr p
    join core.merchants m on m.slug = p.slug
    left join site.merchants sm on sm.id = m.id
    left join core.categories c on c.product_slug = p.cat_slug
    left join core.feeds f on f.network_code = '2performant' and f.external_id = p.feed_id
   order by m.id, md5(p.url)
  on conflict (merchant_id, external_id) do update
     set program_id = excluded.program_id, feed_id = excluded.feed_id, tracking_url = excluded.tracking_url,
         title = excluded.title, title_raw = excluded.title_raw, brand = excluded.brand,
         category_id = excluded.category_id, category_raw = excluded.category_raw, image_url = excluded.image_url,
         price = excluded.price, condition = excluded.condition, in_stock = true,
         last_seen_at = now()
   where (core.products.program_id, core.products.tracking_url, core.products.title, core.products.brand,
          core.products.category_id, core.products.image_url, core.products.price, core.products.condition, core.products.in_stock)
         is distinct from
         (excluded.program_id, excluded.tracking_url, excluded.title, excluded.brand,
          excluded.category_id, excluded.image_url, excluded.price, excluded.condition, true)
      or core.products.last_seen_at < now() - interval '20 hours';
  get diagnostics v_n = row_count;
  v_stats := v_stats || jsonb_build_object('produse_scrise', v_n);

  -- In oglinda, absent din products.json = nepublicat azi pe site (istoricul de pret ramane).
  update core.products pr set in_stock = false
   where pr.in_stock
     and not exists (select 1 from _pr p join core.merchants m on m.slug = p.slug
                      where m.id = pr.merchant_id and md5(p.url) = pr.external_id);
  get diagnostics v_n = row_count;
  v_stats := v_stats || jsonb_build_object('produse_nepublicate', v_n);

  update ops.ingest_runs set finished_at = clock_timestamp(), status = 'ok', stats = v_stats where id = v_run;
  return v_stats;
end $$;

-- ── Descarcarea (pg_net) si aplicarea ──────────────────────────────────────────────
-- products.json are ~17 MB. output.json si products.json se cer cu If-None-Match (ETag-ul ultimei
-- aplicari reusite): cand site-ul n-a publicat nimic nou, Vercel raspunde 304 si nu se descarca nimic.
-- Cele doua liste mici se descarca mereu: magazinele se aplica doar cu toate trei fisierele din aceeasi tura
-- (fara lista de excluderi, magazinele scoase ar parea revenite).
create table ops.mirror_requests (
  id           bigint generated always as identity primary key,
  kind         text not null check (kind in ('merchants', 'no_coupons', 'no_delivery', 'products')),
  url          text not null,
  request_id   bigint,
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  status_code  integer,
  etag         text,            -- scris doar dupa o aplicare reusita
  outcome      text
);
create index mirror_requests_pending on ops.mirror_requests (requested_at) where processed_at is null;
create index mirror_requests_etag on ops.mirror_requests (kind, id desc) where etag is not null;

create function ops.mirror_fetch() returns integer
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
  for r in select * from (values
      ('merchants',   'https://amcupon.ro/output.json'),
      ('no_coupons',  'https://amcupon.ro/magazine-fara-cupoane.json'),
      ('no_delivery', 'https://amcupon.ro/magazine-fara-livrare-ro.json'),
      ('products',    'https://amcupon.ro/products.json')) v(kind, url)
  loop
    v_etag := null;
    if r.kind in ('merchants', 'products') then
      select q.etag into v_etag from ops.mirror_requests q
       where q.kind = r.kind and q.etag is not null order by q.id desc limit 1;
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

create function ops.mirror_apply() returns jsonb
  language plpgsql security definer set search_path = '' as $$
declare
  v_bodies jsonb := '{}';
  v_req    jsonb := '{}';        -- kind -> {id, etag} pentru fisierele descarcate acum
  v_out    jsonb := '{}';
  r        record;
begin
  for r in
    select q.id, q.kind, q.requested_at, resp.status_code, resp.content, resp.headers, resp.timed_out, resp.error_msg
      from ops.mirror_requests q
      left join net._http_response resp on resp.id = q.request_id
     where q.processed_at is null
     order by q.id
  loop
    if r.status_code is null and coalesce(r.timed_out, false) = false and r.error_msg is null then
      if r.requested_at < now() - interval '30 minutes' then
        update ops.mirror_requests set processed_at = now(), outcome = 'fara raspuns' where id = r.id;
      end if;
      continue;                                                -- inca nu a raspuns
    end if;
    if r.status_code = 200 then
      begin
        v_bodies := v_bodies || jsonb_build_object(r.kind, r.content::jsonb);
        v_req := v_req || jsonb_build_object(r.kind, jsonb_build_object(
                   'id', r.id, 'etag', coalesce(r.headers->>'etag', r.headers->>'ETag', r.headers->>'Etag')));
        update ops.mirror_requests set processed_at = now(), status_code = 200, outcome = 'descarcat' where id = r.id;
      exception when others then                               -- pagina de eroare in loc de JSON
        update ops.mirror_requests set processed_at = now(), status_code = 200, outcome = 'json invalid' where id = r.id;
      end;
    elsif r.status_code = 304 then
      update ops.mirror_requests set processed_at = now(), status_code = 304, outcome = 'neschimbat' where id = r.id;
    else
      update ops.mirror_requests set processed_at = now(), status_code = r.status_code,
             outcome = coalesce('http ' || r.status_code, r.error_msg, 'timeout') where id = r.id;
    end if;
  end loop;

  -- Magazinele si produsele se aplica separat: daca una pica, cealalta merge (si ramane scris de ce).
  if v_bodies ? 'merchants' then
    if not (v_bodies ? 'no_coupons' and v_bodies ? 'no_delivery') then
      v_out := v_out || jsonb_build_object('magazine', 'neaplicate: lipseste o lista de excluderi din tura asta');
    else
      begin
        v_out := v_out || jsonb_build_object('magazine', ops.mirror_merchants(v_bodies->'merchants',
                   v_bodies->'no_coupons', v_bodies->'no_delivery'));
        update ops.mirror_requests set etag = v_req->'merchants'->>'etag', outcome = 'aplicat'
         where id = (v_req->'merchants'->>'id')::bigint;
      exception when others then
        insert into ops.ingest_runs (job, status, finished_at, error) values ('mirror-merchants', 'failed', now(), sqlerrm);
        v_out := v_out || jsonb_build_object('magazine', 'eroare: ' || sqlerrm);
      end;
    end if;
  end if;
  if v_bodies ? 'products' then
    begin
      v_out := v_out || jsonb_build_object('produse', ops.mirror_products(v_bodies->'products'));
      update ops.mirror_requests set etag = v_req->'products'->>'etag', outcome = 'aplicat'
       where id = (v_req->'products'->>'id')::bigint;
    exception when others then
      insert into ops.ingest_runs (job, status, finished_at, error) values ('mirror-products', 'failed', now(), sqlerrm);
      v_out := v_out || jsonb_build_object('produse', 'eroare: ' || sqlerrm);
    end;
  end if;
  return v_out;
end $$;

revoke execute on all functions in schema core, ops from public;
grant execute on function core.display_name(text), core.url_decode(text), core.is_tracking_url(text),
                          core.landing_from_tracking(text), core.absolute_url(text),
                          core.fix_tracking_redirect(text) to amc_ingest;
grant select, insert, update, delete on ops.mirror_requests to amc_ingest;

do $cron$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- Pipeline-ul de azi publica de ~3 ori pe zi (cu intarziere): verificam la 2 ore.
    perform cron.schedule('amc-mirror-fetch', '7 */2 * * *', 'select ops.mirror_fetch()');
    perform cron.schedule('amc-mirror-apply', '*/5 * * * *', 'select ops.mirror_apply()');
  end if;
end
$cron$;

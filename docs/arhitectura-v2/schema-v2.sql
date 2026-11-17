-- =====================================================================================
-- AmCupon v2 — schema bazei de date (Etapa 2).  CIORNA: NEAPLICATA pe Supabase.
--
-- Se aplica doar dupa confirmarea lui Alex, mutata in supabase/migrations/.
-- Verificata pe PostgreSQL 16 local, cu roluri si scheme ca in Supabase (stub-supabase.sql) si
-- cu teste-schema-v2.sql (ARHITECTURA-V2.md, „Verificarea schemei"). Ruleaza intr-o singura
-- tranzactie, deci intra tot sau nimic. Nu atinge tabelele v1 din `public`
-- (merchants/products/coupons/price_history sunt goale; clicuri_afiliate, voturi_cupoane,
-- reviews se muta in Etapa 3).
--
-- Principii (fiecare vine dintr-un bug real din 2026, vezi docs/LECTII-TEHNICE.md):
--  1. Baza de date e SINGURA sursa de adevar. Git tine doar cod si texte editoriale.
--  2. Ce se poate calcula NU se salveaza: „activ", „zile ramase", „indexabil" sunt vederi.
--     (zile_ramase salvat o data a aratat contoare false luni intregi.)
--  3. Datele de la retele intra brute (ops.raw_records), trec prin aceleasi reguli Python de azi,
--     iar ce pica o regula sta in carantina PE INREGISTRARE (ops.quarantine), nu opreste site-ul.
--  4. Constrangerile sunt plasa de siguranta: un „cod" fara cod, o reducere de 140%, un
--     „exclusiv" fara contract sau un titlu de pagina peste 60 de caractere nu pot fi scrise.
--  5. Magazinul nu e programul de afiliere: acelasi magazin poate avea programe in mai multe retele.
--  6. Site-ul citeste DOAR schema `site` (vederi + functii), cu un rol fara drept de scriere.
--     Comisionul nu ajunge niciodata in `site`.
-- =====================================================================================

begin;

create extension if not exists pg_trgm  with schema extensions;
create extension if not exists unaccent with schema extensions;

create schema if not exists core;       -- catalogul: magazine, programe, oferte, produse
create schema if not exists ops;        -- rulari de import, date brute, carantina, coada de revalidare
create schema if not exists track;      -- clicuri si conversii (venitul)
create schema if not exists community;  -- voturi, recenzii, abonari la alerte
create schema if not exists ads;        -- spatii promovate (magazine/oferte sponsorizate)
create schema if not exists site;       -- singurul lucru pe care il citeste site-ul

-- Roluri fara login aici; parola se pune separat, NU in repo:
--   alter role amc_site   login password '...';   -- Vercel: citeste `site`, scrie doar prin functii
--   alter role amc_ingest login password '...';   -- GitHub Actions: scrie catalogul
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'amc_site')   then create role amc_site   nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'amc_ingest') then create role amc_ingest nologin; end if;
end $$;

-- Cautare in romana, fara diacritice: „bicicleta rosie" gaseste „bicicletă roșie".
create text search configuration core.ro (copy = pg_catalog.romanian);
alter text search configuration core.ro
  alter mapping for hword, hword_part, word with extensions.unaccent, romanian_stem;

create type core.tri_state         as enum ('yes', 'no', 'maybe', 'unknown');
create type core.offer_kind        as enum ('code', 'deal', 'free_shipping', 'gift');
create type core.discount_type     as enum ('percent', 'amount', 'free_shipping', 'gift', 'other');
create type core.moderation        as enum ('ok', 'hidden', 'rejected');
create type core.product_condition as enum ('new', 'resealed', 'refurbished', 'used', 'unknown');

create function core.touch_updated_at() returns trigger
  language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ── core: catalogul ──────────────────────────────────────────────────────────────────

create table core.networks (
  code        text primary key check (code ~ '^[a-z0-9]+$'),
  name        text not null,
  subid_param text,                       -- unde punem click_id: st (2P), subId1 (Impact), clickref (Awin), sid (CJ)
  active      boolean not null default true
);

create table core.categories (
  id        smallint generated always as identity primary key,
  slug      text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name      text not null,
  parent_id smallint references core.categories(id),
  sort      smallint not null default 0
);

create table core.merchants (
  id                  bigint generated always as identity primary key,
  slug                text not null unique check (slug ~ '^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$'),  -- = domeniul principal, cheia din /cod-reducere/<slug>
  name                text not null,                    -- numele afisat (inlocuieste NUME_OVERRIDE)
  country             char(2) not null default 'RO',    -- piata servita: vidaxl.ro si vidaxl.bg sunt magazine diferite
  primary_category_id smallint references core.categories(id),
  logo_path           text,                             -- logo normalizat de noi (WebP 128 px) in Storage
  logo_source_url     text,
  about_md            text,                             -- doar text scris sau verificat de om; nimic generat
  seo_force_index     boolean not null default false,   -- fostul BRANDURI_CU_CERERE: cerere reala, masurata
  hidden_reason       text,                             -- ascuns manual (null = vizibil)
  redirect_to         text check (redirect_to is null or redirect_to ~ '^/'),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger merchants_updated before update on core.merchants
  for each row execute function core.touch_updated_at();

-- Potrivirea datelor de la retele cu magazinul se face pe domeniu EXACT (niciodata pe subsir):
-- de.fossibot.com nu e fossibot.com, store.boyamic.com nu e „store".
create table core.merchant_domains (
  domain      text primary key
              check (domain = lower(domain) and domain !~ '^www\.' and domain ~ '^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$'),
  merchant_id bigint not null references core.merchants(id) on delete cascade,
  is_primary  boolean not null default false
);
create unique index merchant_domains_one_primary on core.merchant_domains (merchant_id) where is_primary;

create table core.programs (
  id                  bigint generated always as identity primary key,
  network_code        text not null references core.networks(code),
  external_id         text not null,                     -- id-ul programului in retea
  merchant_id         bigint references core.merchants(id) on delete set null,  -- null = nepotrivit, asteapta revizuire
  name                text not null,
  status              text not null check (status in ('active', 'pending', 'rejected', 'expired', 'paused')),
  priority            smallint not null default 100,     -- mai mic = preferat, cand magazinul are mai multe programe
  tracking_url        text check (tracking_url is null or tracking_url ~ '^https://'),  -- link platit spre prima pagina
  deeplink_allowed    boolean not null default false,
  deeplink_domains    text[] not null default '{}',
  ships_to            char(2)[],                         -- null = programul nu declara tarile
  allows_coupon_sites core.tri_state not null default 'unknown',  -- „Coupons/Vouchers" din regulile 2P
  allows_search_ads   core.tri_state not null default 'unknown',
  allows_cashback     core.tri_state not null default 'unknown',
  commission_text     text,                              -- PRIVAT: nu iese niciodata in `site`
  commission_pct      numeric(5,2),                      -- PRIVAT
  cookie_days         smallint,
  rules_raw           jsonb,                             -- PRIVAT: regulile programului, cum le trimite reteaua
  first_seen_at       timestamptz not null default now(),
  last_seen_at        timestamptz not null default now(),
  unique (network_code, external_id)
);
create index programs_merchant_active on core.programs (merchant_id, priority) where status = 'active';

create table core.events (
  id         smallint generated always as identity primary key,
  slug       text not null check (slug ~ '^[a-z0-9-]+$'),    -- 'black-friday', 'black-friday-emag', 'back-to-school'
  year       smallint not null,
  name       text not null,
  starts_on  date not null,
  ends_on    date not null check (ends_on >= starts_on),
  source_url text not null check (source_url ~ '^https://'),  -- fara sursa nu publicam data unui eveniment
  unique (slug, year)
);

-- Coduri si oferte fara cod, intr-un singur tabel. „Activ" NU e o coloana: e vederea site.offers_live.
create table core.offers (
  id                bigint generated always as identity primary key,
  merchant_id       bigint not null references core.merchants(id) on delete cascade,
  program_id        bigint references core.programs(id) on delete set null,
  dedup_key         text not null,              -- calculat la import, cu aceeasi functie ca azi (promotii.py)
  kind              core.offer_kind not null,
  title             text not null check (length(title) between 3 and 200),
  description       text check (length(description) <= 1000),
  title_raw         text,                       -- PRIVAT: cum a venit de la retea
  description_raw   text,                       -- PRIVAT
  code              text check (code is null or (length(code) between 3 and 30 and code !~ '\s')),
  discount_type     core.discount_type,
  discount_value    numeric(10,2) check (discount_value is null or discount_value > 0),
  discount_upto     boolean not null default false,   -- „pana la 70%", nu „-70%"
  currency          char(3),
  min_order_value   numeric(10,2) check (min_order_value is null or min_order_value > 0),
  landing_url       text not null check (landing_url ~ '^https?://'),
  tracking_url      text check (tracking_url is null or tracking_url ~ '^https://'),  -- calculat de link_oferta.py
  starts_at         timestamptz,
  ends_at           timestamptz,                -- in ora Romaniei la import (2P: 00:00 = toata ziua dinainte)
  event_id          smallint references core.events(id) on delete set null,
  is_exclusive      boolean not null default false,
  exclusive_ref     text,                       -- contractul/emailul care face oferta exclusiva
  first_seen_at     timestamptz not null default now(),
  last_seen_at      timestamptz not null default now(),   -- ultima data cand reteaua a listat-o
  removed_at        timestamptz,                -- reteaua nu o mai listeaza
  moderation        core.moderation not null default 'ok',
  moderation_reason text,
  content_hash      text not null,              -- se schimba doar cand se schimba ce vede omul
  updated_at        timestamptz not null default now(),
  unique (merchant_id, dedup_key),
  constraint offers_code_matches_kind check ((kind = 'code') = (code is not null)),
  constraint offers_exclusive_needs_ref check (not is_exclusive or exclusive_ref is not null),
  constraint offers_dates check (ends_at is null or starts_at is null or ends_at > starts_at),
  constraint offers_percent_max check (discount_type is distinct from 'percent' or discount_value <= 100),
  constraint offers_amount_currency check (discount_type is distinct from 'amount' or currency is not null),
  constraint offers_moderation_reason check (moderation = 'ok' or moderation_reason is not null)
);
create index offers_merchant_visible on core.offers (merchant_id) where moderation = 'ok' and removed_at is null;
create index offers_ends on core.offers (ends_at) where removed_at is null;
create index offers_event on core.offers (event_id) where event_id is not null;
create trigger offers_updated before update on core.offers
  for each row execute function core.touch_updated_at();

-- Aceeasi oferta poate veni din doua surse (API 2P + exportul CSV): o oferta, doua surse.
create table core.offer_sources (
  network_code  text not null references core.networks(code),
  external_id   text not null,                 -- 'api:123', 'csv:<hash>', 'manual:<n>'
  offer_id      bigint not null references core.offers(id) on delete cascade,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  primary key (network_code, external_id)
);
create index offer_sources_offer on core.offer_sources (offer_id);

-- „Verificat" devine adevarat prin constructie: site-ul il afiseaza doar cand exista o verificare
-- facuta de om, in cos (manual_cart), recenta. robot_page = am deschis pagina ofertei si raspunde.
create table core.offer_checks (
  id         bigint generated always as identity primary key,
  offer_id   bigint not null references core.offers(id) on delete cascade,
  checked_at timestamptz not null default now(),
  method     text not null check (method in ('manual_cart', 'manual_page', 'robot_page')),
  result     text not null check (result in ('works', 'fails', 'unclear')),
  note       text,
  checked_by text not null                       -- 'alex', 'robot'
);
create index offer_checks_offer on core.offer_checks (offer_id, checked_at desc);

create table core.products (
  id              bigint generated always as identity primary key,
  merchant_id     bigint not null references core.merchants(id) on delete cascade,
  program_id      bigint references core.programs(id) on delete set null,
  external_id     text not null,
  url             text not null check (url ~ '^https?://'),
  tracking_url    text check (tracking_url is null or tracking_url ~ '^https://'),
  title           text not null check (length(title) between 3 and 300),
  title_raw       text,
  brand           text,                          -- la librarii e autorul: nu se afiseaza ca „marca"
  gtin            text,
  category_id     smallint references core.categories(id),
  category_raw    text,
  image_url       text,
  price           numeric(12,2) not null check (price >= 1),   -- sub 1 leu = pret de bax / feed stricat
  currency        char(3) not null default 'RON',
  currency_proven boolean not null default false,  -- reguli_produse.moneda_magazin: altfel pretul nu se publica
  condition       core.product_condition not null default 'unknown',  -- resigilat/recondiționat din adresa (stare_produs)
  in_stock        boolean not null default true,
  restricted      text check (restricted is null or restricted in ('adult', 'nicotine')),  -- Legea 349/2002
  first_seen_at   timestamptz not null default now(),
  last_seen_at    timestamptz not null default now(),
  verified_at     timestamptz,                     -- pret confirmat pe pagina magazinului (JSON-LD)
  verified_price  numeric(12,2),
  moderation      core.moderation not null default 'ok',
  search          tsvector generated always as
                    (to_tsvector('core.ro'::regconfig, coalesce(title, '') || ' ' || coalesce(brand, ''))) stored,
  updated_at      timestamptz not null default now(),
  unique (merchant_id, external_id)
);
create index products_merchant on core.products (merchant_id) where moderation = 'ok' and in_stock;
create index products_category on core.products (category_id, price) where moderation = 'ok' and in_stock and restricted is null;
create index products_search   on core.products using gin (search);
create index products_title_trgm on core.products using gin (title extensions.gin_trgm_ops);
create trigger products_updated before update on core.products
  for each row execute function core.touch_updated_at();

-- Un rand la fiecare SCHIMBARE de pret (si in sus): fara cresteri, minimul din 30 de zile ar minti.
create table core.price_points (
  product_id  bigint not null references core.products(id) on delete cascade,
  observed_at timestamptz not null default clock_timestamp(),
  price       numeric(12,2) not null check (price >= 1),
  primary key (product_id, observed_at)
);

create function core.note_price() returns trigger
  language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' or new.price is distinct from old.price then
    insert into core.price_points (product_id, observed_at, price) values (new.id, clock_timestamp(), new.price);
  end if;
  return null;
end $$;
create trigger products_note_price after insert or update of price on core.products
  for each row execute function core.note_price();

-- Paginile de categorie, nisa, eveniment si /alege: aceeasi pagina, alte date. Textul se aproba de om.
create table core.landing_pages (
  id               bigint generated always as identity primary key,
  path             text not null unique check (path ~ '^/[a-z0-9/-]*$'),
  kind             text not null check (kind in ('category', 'niche', 'event', 'feature', 'guide_hub')),
  title            text not null check (length(title) <= 60),
  meta_description text check (length(meta_description) <= 160),
  intro_md         text,
  rule             jsonb not null default '{}',   -- ce aduce pagina: categorii, eveniment, cautare de produs
  min_items        smallint not null default 4,   -- sub prag, pagina nu se publica (ca /alege si /cadouri azi)
  status           text not null default 'draft' check (status in ('draft', 'approved', 'retired')),
  approved_by      text,
  approved_at      timestamptz,
  redirect_to      text check (redirect_to is null or redirect_to ~ '^/'),
  updated_at       timestamptz not null default now(),
  constraint landing_approved_has_who check (status <> 'approved' or (approved_at is not null and approved_by is not null))
);
create trigger landing_pages_updated before update on core.landing_pages
  for each row execute function core.touch_updated_at();

-- ── ops: importuri, carantina, revalidare ────────────────────────────────────────────

create table ops.ingest_runs (
  id          bigint generated always as identity primary key,
  job         text not null,          -- 'offers-2p', 'products-2p', 'programs-impact', 'conversions-2p', 'prices-verify'...
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  status      text not null default 'running'
              check (status in ('running', 'ok', 'partial', 'failed', 'source_broken')),
  stats       jsonb not null default '{}',   -- citite, noi, schimbate, carantina, scoase
  error       text,
  git_sha     text
);
create index ingest_runs_job on ops.ingest_runs (job, started_at desc);

-- Ce a trimis reteaua, exact. Se pastreaza doar cand s-a schimbat (payload_hash) si doar 14 zile:
-- poti rula din nou regulile fara sa mai ceri API-ului (2P da 429 dupa ~110 cereri).
create table ops.raw_records (
  id           bigint generated always as identity primary key,
  run_id       bigint not null references ops.ingest_runs(id) on delete cascade,
  entity       text not null check (entity in ('program', 'offer', 'product', 'conversion')),
  network_code text not null,
  external_id  text not null,
  payload      jsonb not null,
  payload_hash text not null,
  received_at  timestamptz not null default now()
);
create index raw_records_key on ops.raw_records (entity, network_code, external_id, received_at desc);

-- O inregistrare care pica o regula ramane aici, cu motivul; restul site-ului se publica.
create table ops.quarantine (
  id            bigint generated always as identity primary key,
  run_id        bigint references ops.ingest_runs(id) on delete set null,
  entity        text not null,
  network_code  text,
  external_id   text,
  merchant_slug text,
  rule          text not null,     -- aceleasi nume ca azi: text_stricat, alta_piata, pentru_afiliati, pret_corupt...
  detail        text,
  sample        text,              -- bucata de text care a picat
  created_at    timestamptz not null default now(),
  resolved_at   timestamptz,
  resolution    text
);
create index quarantine_open on ops.quarantine (created_at desc) where resolved_at is null;

-- Ce pagini trebuie reimprospatate. Un tag apare o singura data cat timp asteapta.
create table ops.revalidation_queue (
  id           bigint generated always as identity primary key,
  tag          text not null,      -- 'merchant:libris.ro', 'offers', 'products:12', 'page:/black-friday'
  reason       text,
  created_at   timestamptz not null default now(),
  sent_at      timestamptz,
  processed_at timestamptz
);
create unique index revalidation_pending_tag on ops.revalidation_queue (tag) where processed_at is null;

create function ops.request_revalidation(p_tag text, p_reason text) returns void
  language sql security definer set search_path = '' as $$
  insert into ops.revalidation_queue (tag, reason) values (p_tag, p_reason)
  on conflict (tag) where processed_at is null do nothing;
$$;

-- Orice schimbare vizibila cere singura reimprospatarea paginilor ei (nu depinde de memoria scriptului).
create function ops.on_offer_change() returns trigger
  language plpgsql security definer set search_path = '' as $$
declare
  v_merchants bigint[];
begin
  if tg_op = 'DELETE' then v_merchants := array[old.merchant_id];
  elsif tg_op = 'UPDATE' then v_merchants := array[old.merchant_id, new.merchant_id];
  else v_merchants := array[new.merchant_id];
  end if;
  perform ops.request_revalidation('merchant:' || m.slug, 'offer ' || lower(tg_op))
     from core.merchants m where m.id = any (v_merchants);
  perform ops.request_revalidation('offers', 'offer ' || lower(tg_op));
  return null;
end $$;
create trigger offers_revalidate_ins after insert on core.offers
  for each row execute function ops.on_offer_change();
create trigger offers_revalidate_del after delete on core.offers
  for each row execute function ops.on_offer_change();
create trigger offers_revalidate_upd after update on core.offers
  for each row
  when (old.content_hash is distinct from new.content_hash
        or old.moderation is distinct from new.moderation
        or old.removed_at is distinct from new.removed_at
        or old.merchant_id is distinct from new.merchant_id)
  execute function ops.on_offer_change();

create function ops.on_product_change() returns trigger
  language plpgsql security definer set search_path = '' as $$
declare
  r record;
begin
  if tg_op = 'DELETE' then r := old; else r := new; end if;
  perform ops.request_revalidation('merchant:' || m.slug, 'product ' || lower(tg_op))
     from core.merchants m where m.id = r.merchant_id;
  if r.category_id is not null then
    perform ops.request_revalidation('category:' || r.category_id, 'product ' || lower(tg_op));
  end if;
  return null;
end $$;
create trigger products_revalidate_ins after insert on core.products
  for each row execute function ops.on_product_change();
create trigger products_revalidate_del after delete on core.products
  for each row execute function ops.on_product_change();
create trigger products_revalidate_upd after update on core.products
  for each row
  when (old.price is distinct from new.price
        or old.in_stock is distinct from new.in_stock
        or old.title is distinct from new.title
        or old.image_url is distinct from new.image_url
        or old.moderation is distinct from new.moderation
        or old.category_id is distinct from new.category_id)
  execute function ops.on_product_change();

-- ── track: clicuri si conversii ──────────────────────────────────────────────────────

-- Fara IP, fara cookie, fara user-agent: aceeasi regula ca azi (clicuri_afiliate).
create table track.clicks (
  click_id      text primary key check (click_id ~ '^[a-z0-9]{10,14}$'),  -- pus in sub-id-ul retelei
  clicked_at    timestamptz not null default now(),
  merchant_id   bigint references core.merchants(id) on delete set null,
  program_id    bigint references core.programs(id) on delete set null,
  offer_id      bigint references core.offers(id) on delete set null,
  product_id    bigint references core.products(id) on delete set null,
  creative_id   bigint,                        -- ads.creatives, cheia straina e adaugata mai jos
  page_path     text check (length(page_path) <= 200),
  placement     text check (length(placement) <= 40),     -- 'offer_card', 'store_button', 'product_card', 'ad:<slot>'
  campaign      text check (length(campaign) <= 80),      -- c-<utm_source>-<utm_campaign>
  referrer_host text check (length(referrer_host) <= 120),
  device        text check (device in ('mobile', 'desktop', 'tablet')),
  is_bot        boolean not null default false
);
create index clicks_time on track.clicks (clicked_at desc);
create index clicks_merchant on track.clicks (merchant_id, clicked_at desc);

-- Rezumatul zilnic ramane si dupa ce clicurile vechi se sterg (180 de zile).
create table track.click_daily (
  day           date not null,
  merchant_slug text not null default '-',
  page_path     text not null default '-',
  clicks        integer not null check (clicks >= 0),
  primary key (day, merchant_slug, page_path)
);

-- Vanzarile raportate de retele. PRIVAT in intregime (comision). Atribuirea se copiaza din clic
-- la potrivire, ca sa ramana si dupa stergerea clicului.
create table track.conversions (
  id                bigint generated always as identity primary key,
  network_code      text not null references core.networks(code),
  external_id       text not null,
  program_id        bigint references core.programs(id) on delete set null,
  merchant_id       bigint references core.merchants(id) on delete set null,
  click_id          text,                      -- din sub-id; fara cheie straina: clicul poate fi deja sters
  subid_raw         text,                      -- exact ce a trimis reteaua
  page_path         text,
  placement         text,
  campaign          text,
  occurred_at       timestamptz not null,
  order_amount      numeric(12,2),
  commission        numeric(12,2),
  currency          char(3) not null default 'RON',
  status            text not null check (status in ('pending', 'approved', 'rejected', 'paid')),
  status_updated_at timestamptz not null default now(),
  raw               jsonb,
  unique (network_code, external_id)
);
create index conversions_click on track.conversions (click_id) where click_id is not null;
create index conversions_time on track.conversions (occurred_at desc);

-- ── community: voturi, recenzii, alerte ──────────────────────────────────────────────

-- Un vot pe persoana si oferta, impus de cheia primara (nu de un cookie care se sterge).
create table community.offer_votes (
  offer_id   bigint not null references core.offers(id) on delete cascade,
  voter_hash text not null check (length(voter_hash) between 16 and 128),  -- hash(ip + user-agent + sare secreta)
  worked     boolean not null,
  voted_at   timestamptz not null default now(),
  primary key (offer_id, voter_hash)
);

create table community.merchant_reviews (
  id           bigint generated always as identity primary key,
  merchant_id  bigint not null references core.merchants(id) on delete cascade,
  author_name  text not null check (length(author_name) between 2 and 40),
  stars        smallint not null check (stars between 1 and 5),
  body         text not null check (length(body) between 20 and 2000),
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at   timestamptz not null default now(),
  moderated_at timestamptz
);
create index merchant_reviews_approved on community.merchant_reviews (merchant_id, created_at desc) where status = 'approved';

-- Emailul ramane in Brevo (consimtamant, dezabonare); aici doar id-ul contactului si magazinul.
create table community.alert_subscriptions (
  brevo_contact_id bigint not null,
  merchant_id      bigint not null references core.merchants(id) on delete cascade,
  created_at       timestamptz not null default now(),
  confirmed_at     timestamptz,
  primary key (brevo_contact_id, merchant_id)
);

-- ── ads: spatii promovate ────────────────────────────────────────────────────────────

create table ads.placements (
  code      text primary key check (code ~ '^[a-z0-9_]+$'),
  name      text not null,
  max_items smallint not null default 1 check (max_items between 1 and 6),
  active    boolean not null default true
);

create table ads.advertisers (
  id          bigint generated always as identity primary key,
  name        text not null,
  merchant_id bigint references core.merchants(id) on delete set null,
  billing_ref text,
  created_at  timestamptz not null default now()
);

-- Tot ce e platit poarta eticheta, prin constructie (Directiva UE 2019/2161: clasarea platita se declara).
create table ads.campaigns (
  id            bigint generated always as identity primary key,
  advertiser_id bigint not null references ads.advertisers(id),
  name          text not null,
  kind          text not null check (kind in ('sponsored_store', 'featured_offer', 'banner', 'newsletter')),
  label         text not null default 'Promovat' check (label in ('Promovat', 'Sponsorizat', 'Publicitate')),
  pricing       text not null check (pricing in ('flat', 'cpm', 'cpc')),
  price         numeric(10,2) not null check (price >= 0),
  currency      char(3) not null default 'RON',
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  status        text not null default 'draft' check (status in ('draft', 'approved', 'paused', 'ended')),
  created_at    timestamptz not null default now(),
  constraint campaigns_dates check (ends_at > starts_at)
);

create table ads.creatives (
  id          bigint generated always as identity primary key,
  campaign_id bigint not null references ads.campaigns(id) on delete cascade,
  merchant_id bigint references core.merchants(id) on delete set null,
  offer_id    bigint references core.offers(id) on delete set null,
  headline    text check (length(headline) <= 80),
  body        text check (length(body) <= 200),
  image_path  text,
  alt         text,
  target_url  text not null check (target_url ~ '^https://'),
  constraint creatives_image_alt check (image_path is null or alt is not null)
);
alter table track.clicks
  add constraint clicks_creative_fk foreign key (creative_id) references ads.creatives(id) on delete set null;

create table ads.campaign_placements (
  campaign_id    bigint not null references ads.campaigns(id) on delete cascade,
  placement_code text not null references ads.placements(code),
  category_ids   smallint[],             -- null = oriunde apare spatiul
  weight         smallint not null default 1 check (weight between 1 and 100),
  primary key (campaign_id, placement_code)
);

create table ads.stats_daily (
  creative_id    bigint not null references ads.creatives(id) on delete cascade,
  placement_code text not null references ads.placements(code),
  day            date not null,
  impressions    integer not null default 0 check (impressions >= 0),
  clicks         integer not null default 0 check (clicks >= 0),
  primary key (creative_id, placement_code, day)
);

-- ── site: tot ce citeste site-ul ─────────────────────────────────────────────────────
-- Vederile ruleaza cu drepturile proprietarului, deci amc_site nu are nevoie de acces la `core`.
-- Schema `site` NU se adauga la „Exposed schemas" din Supabase: site-ul se conecteaza direct
-- (Postgres, prin pooler), nu prin API-ul public.

-- Singura definitie a ofertei „active": datele, moderarea, reteaua si regulile programului.
create view site.offers_live as
select o.id, o.merchant_id, m.slug as merchant_slug, m.name as merchant_name,
       o.kind, o.title, o.description, o.code, o.discount_type, o.discount_value, o.discount_upto,
       o.currency, o.min_order_value, o.starts_at, o.ends_at, o.event_id, o.is_exclusive,
       o.first_seen_at, o.last_seen_at, o.updated_at
  from core.offers o
  join core.merchants m on m.id = o.merchant_id
 where o.moderation = 'ok'
   and o.removed_at is null
   and (o.starts_at is null or o.starts_at <= now())
   and (o.ends_at is null or o.ends_at > now())
   and m.hidden_reason is null
   and m.redirect_to is null
   and exists (select 1 from core.programs p
                where p.merchant_id = m.id and p.status = 'active' and p.allows_coupon_sites <> 'no');

-- Ofertele programate (calendarul de Black Friday: „Urmeaza"). Codul nu se arata inainte de start.
create view site.offers_upcoming as
select o.id, o.merchant_id, m.slug as merchant_slug, m.name as merchant_name,
       o.kind, o.title, o.starts_at, o.ends_at, o.event_id
  from core.offers o
  join core.merchants m on m.id = o.merchant_id
 where o.moderation = 'ok'
   and o.removed_at is null
   and o.starts_at > now()
   and m.hidden_reason is null
   and m.redirect_to is null
   and exists (select 1 from core.programs p
                where p.merchant_id = m.id and p.status = 'active' and p.allows_coupon_sites <> 'no');

-- Semnalele oneste de langa o oferta. Procentul de voturi se arata doar de la 3 voturi in sus.
create view site.offer_signals as
select o.id as offer_id,
       o.last_seen_at as seen_in_network_at,
       count(v.offer_id) filter (where v.voted_at > now() - interval '30 days') as votes_30d,
       count(v.offer_id) filter (where v.worked and v.voted_at > now() - interval '30 days') as worked_30d,
       (select max(c.checked_at) from core.offer_checks c
         where c.offer_id = o.id and c.method = 'manual_cart' and c.result = 'works') as verified_in_cart_at,
       (select max(c.checked_at) from core.offer_checks c
         where c.offer_id = o.id and c.method = 'robot_page' and c.result = 'works') as page_alive_at
  from core.offers o
  left join community.offer_votes v on v.offer_id = o.id
 group by o.id, o.last_seen_at;

-- Magazinul, cu felul paginii calculat (nu salvat). Aceeasi regula ca lib/seoIndexable.ts azi:
-- indexabil = are oferta activa SAU produse publicate SAU cerere masurata (seo_force_index).
create view site.merchants as
with best_program as (
  select distinct on (p.merchant_id) p.merchant_id, p.id as program_id, p.network_code, p.ships_to
    from core.programs p
   where p.status = 'active' and p.allows_coupon_sites <> 'no'
   order by p.merchant_id, p.priority, p.id
), offer_counts as (
  select merchant_id, count(*) as offers_count, count(*) filter (where kind = 'code') as codes_count,
         max(updated_at) as offers_changed_at
    from site.offers_live group by merchant_id
), product_counts as (
  select merchant_id, count(*) as products_count, max(updated_at) as products_changed_at
    from core.products
   where moderation = 'ok' and in_stock and restricted is null and currency_proven
   group by merchant_id
), modes as (
  select m.*, bp.program_id, bp.network_code,
         coalesce(oc.offers_count, 0) as offers_count,
         coalesce(oc.codes_count, 0) as codes_count,
         coalesce(pc.products_count, 0) as products_count,
         greatest(m.updated_at, oc.offers_changed_at, pc.products_changed_at) as content_changed_at,
         case
           when m.redirect_to is not null then 'redirect'
           when m.hidden_reason is not null then 'hidden'
           when bp.program_id is null and exists (
                  select 1 from core.programs x
                   where x.merchant_id = m.id and x.status = 'active' and x.allows_coupon_sites = 'no')
             then 'redirect'                 -- programul interzice site-urile de cupoane (33 de programe 2P)
           when bp.program_id is not null and bp.ships_to is not null and not ('RO' = any (bp.ships_to))
             then 'no_delivery'              -- programul nu acopera Romania (fostul FaraLivrareRo)
           when bp.program_id is null then 'no_program'
           else 'full'
         end as page_mode
    from core.merchants m
    left join best_program bp on bp.merchant_id = m.id
    left join offer_counts oc on oc.merchant_id = m.id
    left join product_counts pc on pc.merchant_id = m.id
)
select md.id, md.slug, md.name, md.country, md.logo_path, md.about_md,
       c.slug as category_slug, c.name as category_name,
       md.program_id, md.network_code, md.offers_count, md.codes_count, md.products_count,
       md.content_changed_at, md.page_mode,
       case
         when md.page_mode = 'redirect' then coalesce(md.redirect_to, '/categorii/' || c.slug, '/toate-magazinele')
       end as redirect_path,
       (md.page_mode = 'full' and (md.offers_count > 0 or md.products_count > 0 or md.seo_force_index)) as indexable
  from modes md
  left join core.categories c on c.id = md.primary_category_id;

-- Produsele publicabile. /alege cere in plus pret confirmat pe site-ul magazinului in ultimele 10 zile.
create view site.products_published as
select p.id, p.merchant_id, m.slug as merchant_slug, m.name as merchant_name,
       p.title, p.brand, p.category_id, c.slug as category_slug, p.image_url, p.price, p.condition,
       p.verified_at, (p.verified_at > now() - interval '10 days') as price_verified_recently,
       p.first_seen_at, p.updated_at
  from core.products p
  join core.merchants m on m.id = p.merchant_id
  left join core.categories c on c.id = p.category_id
 where p.moderation = 'ok' and p.in_stock and p.restricted is null and p.currency_proven
   and m.hidden_reason is null and m.redirect_to is null;

-- Minimul din 30 si 90 de zile: pretul de la inceputul ferestrei + schimbarile din ea.
-- `is_lowest_*` doar daca urmarim produsul de cel putin atatea zile; altfel nu stim.
create view site.price_stats as
select p.id as product_id, p.price, t.tracked_since, w30.min_price as min_30d, w90.min_price as min_90d,
       (now() - t.tracked_since >= interval '30 days' and p.price <= w30.min_price) as is_lowest_30d,
       (now() - t.tracked_since >= interval '90 days' and p.price <= w90.min_price) as is_lowest_90d
  from core.products p
  cross join lateral (select min(observed_at) as tracked_since from core.price_points where product_id = p.id) t
  cross join lateral (
    select min(x.price) as min_price from (
      select pp.price from core.price_points pp where pp.product_id = p.id and pp.observed_at >= now() - interval '30 days'
      union all
      (select pp.price from core.price_points pp where pp.product_id = p.id and pp.observed_at < now() - interval '30 days'
        order by pp.observed_at desc limit 1)
    ) x) w30
  cross join lateral (
    select min(x.price) as min_price from (
      select pp.price from core.price_points pp where pp.product_id = p.id and pp.observed_at >= now() - interval '90 days'
      union all
      (select pp.price from core.price_points pp where pp.product_id = p.id and pp.observed_at < now() - interval '90 days'
        order by pp.observed_at desc limit 1)
    ) x) w90;

-- Unde duce un clic: link platit doar daca programul e activ; altfel pagina noastra a magazinului
-- (aceeasi regula ca link_oferta.link_iesire azi). Comisionul nu apare.
create view site.outbound as
select 'offer'::text as target_kind, o.id as target_id, o.merchant_id, m.slug as merchant_slug,
       p.id as program_id,
       case when p.status = 'active' and p.allows_coupon_sites <> 'no' then o.tracking_url end as tracking_url,
       n.subid_param
  from core.offers o
  join core.merchants m on m.id = o.merchant_id
  left join core.programs p on p.id = o.program_id
  left join core.networks n on n.code = p.network_code
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

create view site.landing_pages as
select id, path, kind, title, meta_description, intro_md, rule, min_items, redirect_to, updated_at
  from core.landing_pages
 where status = 'approved';

create view site.events as
select id, slug, year, name, starts_on, ends_on, source_url from core.events;

create view site.categories as
select id, slug, name, parent_id, sort from core.categories;

create view site.reviews as
select id, merchant_id, author_name, stars, body, created_at
  from community.merchant_reviews where status = 'approved';

-- Reclamele care pot aparea acum, cu eticheta lor. Nimic platit fara eticheta.
create view site.ads_live as
select cr.id as creative_id, cp.placement_code, cp.category_ids, cp.weight, ca.label, ca.kind,
       cr.merchant_id, cr.offer_id, cr.headline, cr.body, cr.image_path, cr.alt, ca.ends_at
  from ads.creatives cr
  join ads.campaigns ca on ca.id = cr.campaign_id
  join ads.campaign_placements cp on cp.campaign_id = ca.id
  join ads.placements pl on pl.code = cp.placement_code and pl.active
 where ca.status = 'approved' and now() >= ca.starts_at and now() < ca.ends_at;

-- Sitemap-ul si eticheta `noindex` vin din ACEEASI vedere: nu se mai pot contrazice (29.10).
create view site.sitemap as
select '/cod-reducere/' || slug as path, content_changed_at as lastmod, 'merchant'::text as kind
  from site.merchants where indexable
union all
select path, updated_at, kind from site.landing_pages where redirect_to is null;

-- Cautare de produse: romana fara diacritice + toleranta la greseli de tastare (trigram).
create function site.search_products(p_query text, p_limit integer default 20)
returns table (product_id bigint, title text, price numeric, merchant_slug text, merchant_name text,
               image_url text, rank real)
  language sql stable security definer set search_path = '' as $$
  with q as (select websearch_to_tsquery('core.ro'::regconfig, left(p_query, 100)) as ts, left(p_query, 100) as raw)
  select pp.id, pp.title, pp.price, pp.merchant_slug, pp.merchant_name, pp.image_url,
         greatest(ts_rank(p.search, q.ts), extensions.similarity(p.title, q.raw))::real as rank
    from site.products_published pp
    join core.products p on p.id = pp.id
    cross join q
   where p.search @@ q.ts or p.title operator(extensions.%) q.raw
   order by rank desc
   limit least(greatest(p_limit, 1), 50);
$$;

-- Scrierile site-ului trec doar prin functiile de mai jos (amc_site nu poate scrie direct).
create function site.log_click(p_click_id text, p_target_kind text, p_target_id bigint, p_page_path text,
                               p_placement text, p_campaign text, p_referrer_host text, p_device text,
                               p_is_bot boolean)
returns void
  language sql security definer set search_path = '' as $$
  insert into track.clicks (click_id, merchant_id, program_id, offer_id, product_id, creative_id,
                            page_path, placement, campaign, referrer_host, device, is_bot)
  select p_click_id, o.merchant_id, o.program_id,
         case when p_target_kind = 'offer' then p_target_id end,
         case when p_target_kind = 'product' then p_target_id end,
         case when p_target_kind = 'creative' then p_target_id end,
         left(p_page_path, 200), left(p_placement, 40), left(p_campaign, 80), left(p_referrer_host, 120),
         case when p_device in ('mobile', 'desktop', 'tablet') then p_device end,
         coalesce(p_is_bot, false)
    from (select 1) one
    left join site.outbound o on o.target_kind = p_target_kind and o.target_id = p_target_id
  on conflict (click_id) do nothing;
$$;

create function site.vote_offer(p_offer_id bigint, p_voter_hash text, p_worked boolean)
returns boolean                                  -- true = vot nou, false = votase deja
  language plpgsql security definer set search_path = '' as $$
declare
  v_rows integer;
begin
  insert into community.offer_votes (offer_id, voter_hash, worked)
  select p_offer_id, p_voter_hash, p_worked
   where exists (select 1 from site.offers_live where id = p_offer_id)
  on conflict (offer_id, voter_hash) do nothing;
  get diagnostics v_rows = row_count;
  return v_rows > 0;
end $$;

create function site.submit_review(p_merchant_id bigint, p_author_name text, p_stars smallint, p_body text)
returns void
  language sql security definer set search_path = '' as $$
  insert into community.merchant_reviews (merchant_id, author_name, stars, body)
  values (p_merchant_id, trim(p_author_name), p_stars, trim(p_body));
$$;

create function site.subscribe_alert(p_brevo_contact_id bigint, p_merchant_id bigint)
returns void
  language sql security definer set search_path = '' as $$
  insert into community.alert_subscriptions (brevo_contact_id, merchant_id)
  values (p_brevo_contact_id, p_merchant_id)
  on conflict do nothing;
$$;

-- Ruta /api/revalidate confirma ce a reimprospatat; ce nu e confirmat se retrimite.
create function site.ack_revalidation(p_ids bigint[])
returns integer
  language sql security definer set search_path = '' as $$
  with done as (
    update ops.revalidation_queue set processed_at = now()
     where id = any (p_ids) and processed_at is null
    returning 1)
  select count(*)::integer from done;
$$;

-- ── Drepturi ─────────────────────────────────────────────────────────────────────────
-- Functiile noi primesc implicit EXECUTE pentru PUBLIC in Postgres: le inchidem explicit.
revoke all on schema core, ops, track, community, ads, site from public;
revoke execute on all functions in schema core, ops, track, community, ads, site from public;

grant usage on schema site to amc_site;
grant select on all tables in schema site to amc_site;     -- doar vederi; codul ofertei e citit pe server
grant execute on function site.search_products(text, integer),
                          site.log_click(text, text, bigint, text, text, text, text, text, boolean),
                          site.vote_offer(bigint, text, boolean),
                          site.submit_review(bigint, text, smallint, text),
                          site.subscribe_alert(bigint, bigint),
                          site.ack_revalidation(bigint[])
   to amc_site;

grant usage on schema core, ops, track to amc_ingest;
grant select, insert, update, delete on all tables in schema core to amc_ingest;
grant select, insert, update, delete on all tables in schema ops to amc_ingest;
grant select, insert, update on track.conversions, track.click_daily to amc_ingest;
grant select on track.clicks to amc_ingest;               -- potrivirea conversiilor cu clicurile
grant usage, select on all sequences in schema core, ops, track to amc_ingest;
grant execute on function ops.request_revalidation(text, text) to amc_ingest;

-- ── Date de referinta ────────────────────────────────────────────────────────────────

insert into core.networks (code, name, subid_param) values
  ('2performant', '2Performant', 'st'),
  ('impact',      'Impact.com',  'subId1'),
  ('awin',        'Awin',        'clickref'),
  ('cj',          'CJ Affiliate','sid'),
  ('direct',      'Program direct', null);

-- Cele 18 categorii reale din output.json (17.11.2026), cu eticheta folosita azi pe site.
insert into core.categories (slug, name, sort) values
  ('marketplace',     'Marketplace',            1),
  ('casa-gradina',    'Casă & Grădină',         2),
  ('electronice',     'Electronice & IT',       3),
  ('fashion',         'Fashion',                4),
  ('beauty',          'Beauty & Îngrijire',     5),
  ('sanatate',        'Sănătate & Farmacie',    6),
  ('carti-educatie',  'Cărți & Educație',       7),
  ('copii',           'Copii & Familie',        8),
  ('sport',           'Sport & Fitness',        9),
  ('calatorii',       'Călătorii',             10),
  ('software',        'Software & Digital',    11),
  ('auto-moto',       'Auto & Moto',           12),
  ('bijuterii',       'Bijuterii & Ceasuri',   13),
  ('mancare-bauturi', 'Mâncare & Băuturi',     14),
  ('cadouri-flori',   'Cadouri & Flori',       15),
  ('animale',         'Pet Shop',              16),
  ('servicii',        'Servicii',              17),
  ('financiar',       'Financiar & Asigurări', 18);

insert into ads.placements (code, name, max_items) values
  ('home_top',        'Prima pagina, sub antet',              1),
  ('store_sidebar',   'Pagina de magazin, coloana laterala',  1),
  ('store_inline',    'Pagina de magazin, intre oferte',      1),
  ('category_top',    'Pagina de categorie, sus',             2),
  ('search_top',      'Rezultatele cautarii, sus',            1),
  ('newsletter_top',  'Newsletter, primul bloc',              1);

-- ── Joburi in baza (pg_cron exista pe Supabase; local se sar) ────────────────────────
do $cron$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- O oferta care expira sau incepe cere reimprospatarea paginii ei (cache-ul nu stie de ceas).
    perform cron.schedule('amc-offer-boundaries', '*/10 * * * *', $job$
      select ops.request_revalidation('merchant:' || m.slug, 'expiry')
        from core.offers o join core.merchants m on m.id = o.merchant_id
       where o.ends_at between now() - interval '10 minutes' and now()
          or o.starts_at between now() - interval '10 minutes' and now();
    $job$);
    -- Rezumatul zilnic al clicurilor, apoi retentia: clicuri 180 de zile, date brute 14, coada 7.
    perform cron.schedule('amc-retention', '17 3 * * *', $job$
      insert into track.click_daily (day, merchant_slug, page_path, clicks)
      select c.clicked_at::date, coalesce(m.slug, '-'), coalesce(c.page_path, '-'), count(*)
        from track.clicks c left join core.merchants m on m.id = c.merchant_id
       where c.clicked_at >= current_date - 1 and c.clicked_at < current_date and not c.is_bot
       group by 1, 2, 3
      on conflict (day, merchant_slug, page_path) do update set clicks = excluded.clicks;
      delete from track.clicks c where c.clicked_at < now() - interval '180 days'
         and not exists (select 1 from track.conversions v where v.click_id = c.click_id);
      delete from ops.raw_records where received_at < now() - interval '14 days';
      delete from ops.revalidation_queue where processed_at < now() - interval '7 days';
    $job$);
  end if;
end
$cron$;

commit;

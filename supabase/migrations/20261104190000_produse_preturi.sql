-- Produse urmarite, oferte si istoric de pret (04.11.2026).
-- Feed-urile 2Performant au 7,66 milioane de produse, iar Supabase Free are 500 MB: aici stau doar produsele afisate pe site.
-- Doar pipeline-ul scrie (cheia service role ocoleste RLS). Comisionul si codurile nu se pot citi cu cheia publica a site-ului.
-- `2p_id` nu e un nume valid fara ghilimele in Postgres (incepe cu o cifra), de aceea coloana se numeste `p2_id`.

create extension if not exists pg_trgm schema extensions;

create table public.merchants (
  id                 bigint generated always as identity primary key,
  p2_id              text unique,
  slug               text not null unique,
  name               text not null,
  logo               text,
  default_commission numeric(6,2),
  status             text not null default 'active' check (status in ('active','paused')),
  category           text,
  affiliate_url      text,
  updated_at         timestamptz not null default now()
);

create table public.products (
  id               bigint generated always as identity primary key,
  p2_id            text not null,
  merchant_id      bigint not null references public.merchants(id) on delete cascade,
  title            text not null,
  description      text,
  brand            text,
  price            numeric(12,2) not null check (price > 0),
  old_price        numeric(12,2),
  discount_percent smallint generated always as (
    case when old_price > price then round((old_price - price) / old_price * 100)::smallint end
  ) stored,
  category         text,
  image_url        text,
  affiliate_url    text not null,
  slug             text not null unique,
  in_stock         boolean not null default true,
  first_seen_at    timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (merchant_id, p2_id)
);

create table public.coupons (
  id              bigint generated always as identity primary key,
  p2_id           text not null,
  merchant_id     bigint not null references public.merchants(id) on delete cascade,
  code            text,
  title           text not null,
  discount_value  text,
  start_date      timestamptz,
  expiration_date timestamptz,
  affiliate_url   text,
  is_exclusive    boolean not null default false,
  updated_at      timestamptz not null default now(),
  unique (merchant_id, p2_id)
);

-- Un rand la fiecare schimbare de pret, in sus sau in jos: fara cresteri, minimul din 30 de zile ar fi gresit.
create table public.price_history (
  id          bigint generated always as identity primary key,
  product_id  bigint not null references public.products(id) on delete cascade,
  price       numeric(12,2) not null,
  recorded_at timestamptz not null default clock_timestamp()
);

-- Cautare si liste: slug-ul are deja index prin `unique`.
create index products_categorie_reducere on public.products (category, discount_percent desc nulls last) where in_stock;
create index products_reducere           on public.products (discount_percent desc nulls last) where in_stock;
create index products_actualizat         on public.products (updated_at desc);
create index products_magazin            on public.products (merchant_id);
create index products_titlu_trgm         on public.products using gin (lower(title) extensions.gin_trgm_ops);
create index coupons_magazin             on public.coupons (merchant_id);
create index coupons_expira              on public.coupons (expiration_date);
create index price_history_produs        on public.price_history (product_id, recorded_at desc);

create function public.noteaza_pret() returns trigger
  language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' or new.price is distinct from old.price then
    insert into public.price_history (product_id, price) values (new.id, new.price);
  end if;
  return new;
end $$;
create trigger products_noteaza_pret after insert or update of price on public.products
  for each row execute function public.noteaza_pret();

-- Minimul din 30 si 90 de zile: pretul de la inceputul ferestrei + schimbarile din ea.
-- `is_lowest_*` e adevarat doar daca urmarim produsul de cel putin atatea zile: altfel nu stim.
create view public.product_price_stats with (security_invoker = true) as
with baza as (
  select p.id as product_id, p.p2_id, p.merchant_id, p.price,
         (select min(h.recorded_at) from public.price_history h where h.product_id = p.id) as tracked_since,
         (select min(x.price) from (
            select h.price from public.price_history h where h.product_id = p.id and h.recorded_at >= now() - interval '30 days'
            union all
            (select h.price from public.price_history h where h.product_id = p.id and h.recorded_at < now() - interval '30 days' order by h.recorded_at desc limit 1)
          ) x) as min_30d,
         (select min(x.price) from (
            select h.price from public.price_history h where h.product_id = p.id and h.recorded_at >= now() - interval '90 days'
            union all
            (select h.price from public.price_history h where h.product_id = p.id and h.recorded_at < now() - interval '90 days' order by h.recorded_at desc limit 1)
          ) x) as min_90d
    from public.products p
)
select product_id, p2_id, merchant_id, price, tracked_since, min_30d, min_90d,
       (now() - tracked_since) >= interval '30 days' and price <= min_30d as is_lowest_30d,
       (now() - tracked_since) >= interval '90 days' and price <= min_90d as is_lowest_90d
  from baza;

alter table public.merchants     enable row level security;
alter table public.products      enable row level security;
alter table public.coupons       enable row level security;
alter table public.price_history enable row level security;

create policy "citire publica" on public.merchants     for select to anon, authenticated using (true);
create policy "citire publica" on public.products      for select to anon, authenticated using (true);
create policy "citire publica" on public.coupons       for select to anon, authenticated using (true);
create policy "citire publica" on public.price_history for select to anon, authenticated using (true);

-- Coloanele private raman inchise: comisionul si codul. Codul se arata doar dupa clic pe linkul platit.
revoke all on public.merchants, public.coupons, public.products, public.price_history from anon, authenticated;
grant select (id, p2_id, slug, name, logo, status, category, affiliate_url, updated_at) on public.merchants to anon, authenticated;
grant select (id, p2_id, merchant_id, title, discount_value, start_date, expiration_date, affiliate_url, is_exclusive, updated_at) on public.coupons to anon, authenticated;
grant select on public.products, public.price_history, public.product_price_stats to anon, authenticated;

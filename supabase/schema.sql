-- 이자세이버 DB 스키마
-- Supabase SQL Editor에서 실행하세요

-- users 테이블 (Supabase Auth와 연동)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'premium')),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "본인만 조회 가능" on public.users
  for select using (auth.uid() = id);

create policy "본인만 수정 가능" on public.users
  for update using (auth.uid() = id);

-- Auth 가입 시 users 테이블에 자동 삽입
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- loans 테이블
create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  loan_amount numeric not null,
  current_rate numeric not null,
  bank text not null,
  loan_type text not null,
  region text not null,
  property_type text not null,
  repayment_type text not null default '원리금균등',
  loan_start_date date,
  loan_term_years integer not null default 30,
  early_repayment_fee_rate numeric not null default 1.2,
  early_repayment_fee_months integer not null default 36,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.loans enable row level security;

create policy "본인 대출 정보만 조회" on public.loans
  for select using (auth.uid() = user_id);

create policy "본인 대출 정보만 삽입" on public.loans
  for insert with check (auth.uid() = user_id);

create policy "본인 대출 정보만 수정" on public.loans
  for update using (auth.uid() = user_id);

create policy "본인 대출 정보만 삭제" on public.loans
  for delete using (auth.uid() = user_id);

-- special_offers 테이블 (더미 데이터 포함)
create table if not exists public.special_offers (
  id uuid primary key default gen_random_uuid(),
  bank text not null,
  rate numeric not null,
  conditions text,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.special_offers enable row level security;

create policy "모든 로그인 사용자 조회 가능" on public.special_offers
  for select using (auth.role() = 'authenticated');

-- 더미 특판 데이터
insert into public.special_offers (bank, rate, conditions, start_date, end_date) values
  ('KB국민은행', 3.45, '아파트담보대출, LTV 60% 이하, 서울/경기 지역, 신규 고객', '2026-05-01', '2026-05-31'),
  ('신한은행', 3.52, '주택담보대출, LTV 70% 이하, 전국, 급여이체 고객', '2026-05-10', '2026-06-10'),
  ('카카오뱅크', 3.38, '아파트담보대출, LTV 50% 이하, 전국, 비대면 신청', '2026-05-15', '2026-05-30'),
  ('우리은행', 3.61, '주택담보대출, LTV 70% 이하, 수도권, 신규 고객', '2026-05-01', '2026-05-25'),
  ('토스뱅크', 3.29, '아파트담보대출, LTV 40% 이하, 전국, 비대면 전용', '2026-05-20', '2026-06-05');

-- BatchCutout recovery and proof segments.
-- Use for manual review before sending any email.

-- 1) Account created, no checkout.
-- Send only after at least 2 hours and only if the user has a valid commercial relationship/consent.
select
  email,
  user_id,
  created_at,
  updated_at
from public.batchcutout_users
where plan = 'free'
  and stripe_customer_id is null
  and created_at <= now() - interval '2 hours'
order by created_at desc;

-- 2) Checkout started, no paid subscription.
-- In this app, a Stripe customer is created when checkout starts.
-- Send only after 24 hours and exclude anyone who has opted out.
select
  email,
  user_id,
  stripe_customer_id,
  created_at,
  updated_at
from public.batchcutout_users
where plan = 'free'
  and stripe_customer_id is not null
  and stripe_subscription_id is null
  and updated_at <= now() - interval '24 hours'
order by updated_at desc;

-- 3) Pro users to ask for proof/testimonial.
-- Prioritize customers with real usage, active status, and recent activity.
select
  email,
  user_id,
  plan,
  plan_status,
  monthly_images_used,
  monthly_image_limit,
  stripe_customer_id,
  stripe_subscription_id,
  current_period_start,
  current_period_end,
  updated_at
from public.batchcutout_users
where plan = 'pro'
  and plan_status in ('active', 'manual')
order by monthly_images_used desc, updated_at desc;

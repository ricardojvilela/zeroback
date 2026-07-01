# BatchCutout - daily prospecting queue

Updated: 2026-07-01

## Current pipeline

- Total prospects: 93.
- Ready for domain email: 13.
- Already contacted: 56.
- Blocked or not usable: 24.
- Follow-ups due next: 2026-07-06 and 2026-07-07.

## Today's rule

The domain already sent a meaningful batch on 2026-07-01. Do not send the full new queue immediately. Keep the new leads staged and send a small controlled batch through `/admin` only when ready to continue outreach.

Recommended cap while the domain is still warming:

- 10 to 15 direct emails per day.
- One follow-up only.
- Stop immediately on any negative reply or opt-out.
- Do not use personal email.

## New ready queue

Prioritize these first because each has a public email and a visual product category where product cutouts can matter:

1. West Glow Studio - candles - `hello@westglowstudio.com`
2. TIA by Tia Hayek - jewelry - `info@tiahayek.com`
3. Stefanie Sheehan Handmade Jewelry - jewelry - `hello@stefaniesheehandesigns.com`
4. Waxy Cy - candles - `info@waxyhandmadecandles.com`
5. Crystal Core Jewellery - jewelry - `crystalcorecompany@gmail.com`
6. Natural Artist - jewelry - `info@naturalartist.com`
7. Moonique Creation - jewelry - `hello@mooniquecreation.com`
8. Chaney Chicks Island Gifts - jewelry and gifts - `chaneychicksgifts@gmail.com`
9. Nath Soap Company - bath and body - `support@nathsoapcompany.com`
10. Calendula Farms - candles - `calendulafarms@gmail.com`
11. Off Grid Soap Company - bath and body - `offgridsoapcompany@gmail.com`
12. Nairi Handmade Jewelry - jewelry - `nairihandmadejewelry@gmail.com`
13. Bee Creative PDX - jewelry - `beecreativepdx@gmail.com`

## Daily operating routine

1. Open `/admin`.
2. Check `support@batchcutout.com` replies first.
3. Filter `Prospecção comercial` by `Prontos`.
4. Send 10 to 15 highest-score prospects through the domain email.
5. Update the CSV row after sending:
   - `status`: `sent_YYYY-MM-DD`
   - `next_action`: `follow_up_if_no_reply`
   - `follow_up_date`: 3 to 4 business days later
   - `send_id`: Resend ID from the panel
6. If a prospect replies negatively, set `status` to `blocked_opt_out` and `next_action` to `do_not_contact`.
7. If a prospect replies positively, handle manually and ask for proof only after they are satisfied.

## Follow-up timing

- Previous 2026-06-30 batch: follow-up from 2026-07-06 if no reply.
- Previous 2026-07-01 batch: follow-up from 2026-07-07 if no reply.
- New ready queue: follow-up should be 3 to 4 business days after each actual send date.


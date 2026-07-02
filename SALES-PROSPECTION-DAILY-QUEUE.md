# BatchCutout - daily prospecting queue

Updated: 2026-07-02

## Current pipeline

- Total prospects: 93.
- Ready for domain email: 0.
- Ready with demo email variant: 0.
- Already contacted: 69.
- Blocked or not usable: 24.
- Follow-ups due next: 2026-07-06, 2026-07-07 and 2026-07-08.

## Today's rule

The domain sent 13 demo-variant direct emails on 2026-07-02. Do not send more direct outreach today. Next action is monitoring replies and preparing the 2026-07-06, 2026-07-07 and 2026-07-08 follow-ups.

Recommended cap while the domain is still warming:

- 10 to 15 direct emails per day.
- One follow-up only.
- Stop immediately on any negative reply or opt-out.
- Do not use personal email.

## Demo batch sent on 2026-07-02

These were sent through `support@batchcutout.com` with the `/customer-results/` demo link before the free 2-image test:

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
3. Filter `Prospecção comercial` by follow-ups due.
4. Do not send a second direct outreach batch on 2026-07-02.
5. When a follow-up is due, update the CSV row after sending:
   - `status`: `sent_YYYY-MM-DD`
   - `next_action`: `follow_up_if_no_reply`
   - `follow_up_date`: 3 to 4 business days later
   - `send_id`: Resend ID from the panel
   - keep `outreach_variant`: `demo_video`
6. If a prospect replies negatively, set `status` to `blocked_opt_out` and `next_action` to `do_not_contact`.
7. If a prospect replies positively, handle manually and ask for proof only after they are satisfied.

## Follow-up timing

- Previous 2026-06-30 batch: follow-up from 2026-07-06 if no reply.
- Previous 2026-07-01 batch: follow-up from 2026-07-07 if no reply.
- Demo 2026-07-02 batch: follow-up from 2026-07-08 if no reply.

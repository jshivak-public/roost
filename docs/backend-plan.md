# Future backend boundaries

This is a design plan, not a deployed schema or a security guarantee for the browser-local demo.

| Entity | Important fields | Access rule |
| --- | --- | --- |
| universities | id, name, allowed_email_domains, semester_presets | Public read; trusted administrators write |
| profiles | auth_user_id, campus_id, name, bio, verified_at | Owner edits safe fields; verification comes from trusted auth; private email stays in Auth |
| listings | id, owner_id, campus_id, status, rent, deposit, dates, approximate_location, amenities, approval_status | Active campus listings readable; owner alone creates/updates/deletes |
| listing_photos | listing_id, storage_path, sort_order | Same ownership as listing, bounded file upload size/type |
| lifestyle_preferences | subject_id, consent_at, answer fields, deal_breakers | Owner reads/updates; explicitly consented household subset may be shown with listing |
| saved_listings | user_id, listing_id | User-private composite unique key |
| swipes | user_id, listing_id, action, previous_save_state, created_at | User-private, ordered history |
| conversations | id, listing_id | Read only through participant membership |
| conversation_participants | conversation_id, user_id | Membership created by trusted transaction for requester and listing owner |
| messages | id, conversation_id, sender_id, body, created_at | Only participants read; sender must be authenticated participant; bounded body |
| reports | id, reporter_id, listing_id, reason | Reporter inserts; moderation role reads; never public |
| listing_boosts | listing_id, status, starts_at, ends_at | Future trusted billing service only |

Index listings on campus/status/availability and owner, photos on listing/order, membership on user/conversation, and messages on conversation/time. Add date and positive-price constraints. Mutations must recheck ownership and campus on the server; UI checks are convenience only. Do not accept arbitrary participant IDs from the client. Test unauthorized reads and writes with two independent authenticated users before launch. Confirmed university email establishes email ownership, not current enrollment or landlord approval.

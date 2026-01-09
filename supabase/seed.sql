insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
)
values (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'user@gmail.com',
    crypt ('password123', gen_salt ('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
)
on conflict do nothing;

insert into auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
values (
    uuid_generate_v4 (),
    uuid_generate_v4 (),
    '11111111-1111-1111-1111-111111111111',
    format('{"sub":"%s","email":"%s"}', '22222222-2222-2222-2222-222222222222'::text, 'user@gmail.com')::jsonb,
    'email',
    current_timestamp,
    current_timestamp,
    current_timestamp
)
on conflict do nothing;

insert into profiles (id, display_name, image_url)
values (
    '11111111-1111-1111-1111-111111111111',
    'User',
    'https://github.com/shadcn.png'
)
on conflict do nothing;





insert into households (id, user_id, name)
values (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Household'
)
on conflict do nothing;

insert into household_users (household_id, user_id)
values (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111'
)
on conflict do nothing;

insert into grocery_items (id, user_id, name, is_global)
values (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Grocery Item',
    false
)
on conflict do nothing;

insert into grocery_items (id, name, is_global, image_url, quantity, quantity_unit, barcode, brand, categories, food_groups)
values (
    '22222222-2222-2222-2222-222222222222',
    'Global Grocery Item',
    true,
    'https://github.com/shadcn.png',
    1,
    'kg',
    '1234567890',
    'Brand',
    'Categories',
    'Food Groups'
)
on conflict do nothing;

insert into list_items (household_id, user_id, grocery_item_id, quantity)
values (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    3
)
on conflict do nothing;

insert into pantry_batches (id, household_id, user_id, grocery_item_id, initial_quantity, remaining_quantity)
values (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    3,
    1
)
on conflict do nothing;

insert into pantry_events (batch_id, user_id, event, quantity)
values (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'consume',
    2
)
on conflict do nothing;

insert into pantry_events (batch_id, user_id, event, quantity)
values (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'add',
    3
)
on conflict do nothing;

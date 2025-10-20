alter table users enable row level security;
alter table content_queue enable row level security;
alter table event_log enable row level security;
alter table registry_item enable row level security;

create policy users_self on users
for select using (auth.uid()::text = email)
with check (auth.uid()::text = email);

create policy content_by_creator on content_queue
for all using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy log_read on event_log
for select using (true);

create policy registry_read on registry_item
for select using (true);

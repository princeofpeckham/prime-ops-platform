-- Re-key every RLS policy from JWT role checks (is_ops/is_brandhost/is_cleaner)
-- to membership based, org scoped checks (auth_has_role / auth_org_ids).
-- Behaviour within a single org is identical to before; the new guard is that
-- a user can only ever see rows belonging to an org they are a member of.

-- ---------- drop old policies ----------
drop policy if exists properties_select_authed on public.properties;
drop policy if exists properties_ops_write     on public.properties;
drop policy if exists properties_ops_update    on public.properties;
drop policy if exists properties_ops_delete    on public.properties;

drop policy if exists bookings_ops_all        on public.bookings;
drop policy if exists bookings_bh_select       on public.bookings;
drop policy if exists bookings_cleaner_select  on public.bookings;

drop policy if exists shifts_ops_all  on public.shifts;
drop policy if exists shifts_bh_select on public.shifts;

drop policy if exists shift_apps_ops_all   on public.shift_applications;
drop policy if exists shift_apps_bh_select on public.shift_applications;
drop policy if exists shift_apps_bh_insert on public.shift_applications;
drop policy if exists shift_apps_bh_update on public.shift_applications;

drop policy if exists cleaning_jobs_ops_all          on public.cleaning_jobs;
drop policy if exists cleaning_jobs_cleaner_select    on public.cleaning_jobs;
drop policy if exists cleaning_jobs_cleaner_update    on public.cleaning_jobs;

drop policy if exists condition_reports_ops_all   on public.condition_reports;
drop policy if exists condition_reports_bh_select on public.condition_reports;
drop policy if exists condition_reports_bh_insert on public.condition_reports;
drop policy if exists condition_reports_bh_update on public.condition_reports;

drop policy if exists cra_ops_all   on public.condition_report_areas;
drop policy if exists cra_bh_select on public.condition_report_areas;
drop policy if exists cra_bh_insert on public.condition_report_areas;
drop policy if exists cra_bh_update on public.condition_report_areas;
drop policy if exists cra_bh_delete on public.condition_report_areas;

drop policy if exists vendors_ops_all     on public.vendors;
drop policy if exists vendor_jobs_ops_all on public.vendor_jobs;

drop policy if exists notifications_ops_all          on public.notifications;
drop policy if exists notifications_recipient_select on public.notifications;

drop policy if exists deposits_ops_all on public.deposits;

-- ---------- properties ----------
create policy properties_member_select on public.properties
  for select to authenticated using (org_id in (select public.auth_org_ids()));
create policy properties_ops_write on public.properties
  for insert to authenticated with check (public.auth_has_role(org_id, 'ops'));
create policy properties_ops_update on public.properties
  for update to authenticated using (public.auth_has_role(org_id, 'ops')) with check (public.auth_has_role(org_id, 'ops'));
create policy properties_ops_delete on public.properties
  for delete to authenticated using (public.auth_has_role(org_id, 'ops'));

-- ---------- bookings ----------
create policy bookings_ops_all on public.bookings
  for all to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));

create policy bookings_bh_select on public.bookings
  for select to authenticated
  using (
    public.auth_has_role(org_id, 'brandhost')
    and (
      exists (select 1 from public.shifts s where s.booking_id = bookings.id and s.assigned_bh_id = auth.uid())
      or exists (
        select 1 from public.shift_applications sa
        join public.shifts s on s.id = sa.shift_id
        where s.booking_id = bookings.id and sa.bh_id = auth.uid()
      )
      or exists (select 1 from public.condition_reports cr where cr.booking_id = bookings.id and cr.submitted_by = auth.uid())
    )
  );

create policy bookings_cleaner_select on public.bookings
  for select to authenticated
  using (
    public.auth_has_role(org_id, 'cleaner')
    and exists (select 1 from public.cleaning_jobs cj where cj.booking_id = bookings.id and cj.assigned_cleaner_id = auth.uid())
  );

-- ---------- shifts ----------
create policy shifts_ops_all on public.shifts
  for all to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));

create policy shifts_bh_select on public.shifts
  for select to authenticated
  using (
    public.auth_has_role(org_id, 'brandhost')
    and (
      status = 'open'
      or assigned_bh_id = auth.uid()
      or exists (select 1 from public.shift_applications sa where sa.shift_id = shifts.id and sa.bh_id = auth.uid())
    )
  );

-- ---------- shift_applications ----------
create policy shift_apps_ops_all on public.shift_applications
  for all to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));
create policy shift_apps_bh_select on public.shift_applications
  for select to authenticated
  using (public.auth_has_role(org_id, 'brandhost') and bh_id = auth.uid());
create policy shift_apps_bh_insert on public.shift_applications
  for insert to authenticated
  with check (public.auth_has_role(org_id, 'brandhost') and bh_id = auth.uid());
create policy shift_apps_bh_update on public.shift_applications
  for update to authenticated
  using (public.auth_has_role(org_id, 'brandhost') and bh_id = auth.uid())
  with check (public.auth_has_role(org_id, 'brandhost') and bh_id = auth.uid() and status in ('pending', 'withdrawn'));

-- ---------- cleaning_jobs ----------
create policy cleaning_jobs_ops_all on public.cleaning_jobs
  for all to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));
create policy cleaning_jobs_cleaner_select on public.cleaning_jobs
  for select to authenticated
  using (public.auth_has_role(org_id, 'cleaner') and assigned_cleaner_id = auth.uid());
create policy cleaning_jobs_cleaner_update on public.cleaning_jobs
  for update to authenticated
  using (public.auth_has_role(org_id, 'cleaner') and assigned_cleaner_id = auth.uid())
  with check (public.auth_has_role(org_id, 'cleaner') and assigned_cleaner_id = auth.uid());

-- ---------- condition_reports ----------
create policy condition_reports_ops_all on public.condition_reports
  for all to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));
create policy condition_reports_bh_select on public.condition_reports
  for select to authenticated
  using (public.auth_has_role(org_id, 'brandhost') and submitted_by = auth.uid());
create policy condition_reports_bh_insert on public.condition_reports
  for insert to authenticated
  with check (public.auth_has_role(org_id, 'brandhost') and submitted_by = auth.uid());
create policy condition_reports_bh_update on public.condition_reports
  for update to authenticated
  using (public.auth_has_role(org_id, 'brandhost') and submitted_by = auth.uid() and status = 'draft')
  with check (public.auth_has_role(org_id, 'brandhost') and submitted_by = auth.uid());

-- ---------- condition_report_areas ----------
create policy cra_ops_all on public.condition_report_areas
  for all to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));
create policy cra_bh_select on public.condition_report_areas
  for select to authenticated
  using (
    public.auth_has_role(org_id, 'brandhost')
    and exists (select 1 from public.condition_reports cr where cr.id = condition_report_areas.report_id and cr.submitted_by = auth.uid())
  );
create policy cra_bh_insert on public.condition_report_areas
  for insert to authenticated
  with check (
    public.auth_has_role(org_id, 'brandhost')
    and exists (select 1 from public.condition_reports cr where cr.id = condition_report_areas.report_id and cr.submitted_by = auth.uid() and cr.status = 'draft')
  );
create policy cra_bh_update on public.condition_report_areas
  for update to authenticated
  using (
    public.auth_has_role(org_id, 'brandhost')
    and exists (select 1 from public.condition_reports cr where cr.id = condition_report_areas.report_id and cr.submitted_by = auth.uid() and cr.status = 'draft')
  )
  with check (
    public.auth_has_role(org_id, 'brandhost')
    and exists (select 1 from public.condition_reports cr where cr.id = condition_report_areas.report_id and cr.submitted_by = auth.uid())
  );
create policy cra_bh_delete on public.condition_report_areas
  for delete to authenticated
  using (
    public.auth_has_role(org_id, 'brandhost')
    and exists (select 1 from public.condition_reports cr where cr.id = condition_report_areas.report_id and cr.submitted_by = auth.uid() and cr.status = 'draft')
  );

-- ---------- vendors + vendor_jobs ----------
create policy vendors_ops_all on public.vendors
  for all to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));
create policy vendor_jobs_ops_all on public.vendor_jobs
  for all to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));

-- ---------- notifications ----------
create policy notifications_ops_all on public.notifications
  for all to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));
create policy notifications_recipient_select on public.notifications
  for select to authenticated
  using (recipient_id is not null and recipient_id = auth.uid());

-- ---------- deposits ----------
create policy deposits_ops_all on public.deposits
  for all to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));

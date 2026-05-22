-- Row Level Security policies for all 11 tables.
-- Roles come from JWT app_metadata.role. service_role bypasses RLS by design.
-- Helper functions: public.is_ops(), public.is_brandhost(), public.is_cleaner().

-- =========================================================
-- properties
--   All authenticated users can read property metadata.
--   Only ops can write.
-- =========================================================
create policy properties_select_authed on public.properties
  for select to authenticated using (true);

create policy properties_ops_write on public.properties
  for insert to authenticated with check (public.is_ops());

create policy properties_ops_update on public.properties
  for update to authenticated using (public.is_ops()) with check (public.is_ops());

create policy properties_ops_delete on public.properties
  for delete to authenticated using (public.is_ops());

-- =========================================================
-- bookings
--   Ops full CRUD. n8n writes via service_role (bypasses RLS).
--   BH sees bookings tied to their shifts, applications, or reports.
--   Cleaner sees bookings tied to their assigned cleaning jobs.
-- =========================================================
create policy bookings_ops_all on public.bookings
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

create policy bookings_bh_select on public.bookings
  for select to authenticated
  using (
    public.is_brandhost()
    and (
      exists (
        select 1 from public.shifts s
        where s.booking_id = bookings.id and s.assigned_bh_id = auth.uid()
      )
      or exists (
        select 1 from public.shift_applications sa
        join public.shifts s on s.id = sa.shift_id
        where s.booking_id = bookings.id and sa.bh_id = auth.uid()
      )
      or exists (
        select 1 from public.condition_reports cr
        where cr.booking_id = bookings.id and cr.submitted_by = auth.uid()
      )
    )
  );

create policy bookings_cleaner_select on public.bookings
  for select to authenticated
  using (
    public.is_cleaner()
    and exists (
      select 1 from public.cleaning_jobs cj
      where cj.booking_id = bookings.id and cj.assigned_cleaner_id = auth.uid()
    )
  );

-- =========================================================
-- shifts
--   Ops full CRUD.
--   BH sees: open shifts (marketplace), shifts they applied to, shifts assigned to them.
-- =========================================================
create policy shifts_ops_all on public.shifts
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

create policy shifts_bh_select on public.shifts
  for select to authenticated
  using (
    public.is_brandhost()
    and (
      status = 'open'
      or assigned_bh_id = auth.uid()
      or exists (
        select 1 from public.shift_applications sa
        where sa.shift_id = shifts.id and sa.bh_id = auth.uid()
      )
    )
  );

-- =========================================================
-- shift_applications
--   Ops full CRUD.
--   BH can read, create, and withdraw their own applications.
-- =========================================================
create policy shift_apps_ops_all on public.shift_applications
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

create policy shift_apps_bh_select on public.shift_applications
  for select to authenticated
  using (public.is_brandhost() and bh_id = auth.uid());

create policy shift_apps_bh_insert on public.shift_applications
  for insert to authenticated
  with check (public.is_brandhost() and bh_id = auth.uid());

create policy shift_apps_bh_update on public.shift_applications
  for update to authenticated
  using (public.is_brandhost() and bh_id = auth.uid())
  with check (
    public.is_brandhost()
    and bh_id = auth.uid()
    and status in ('pending', 'withdrawn')
  );

-- =========================================================
-- cleaning_jobs
--   Ops full CRUD.
--   Cleaner sees and updates their own assigned jobs (confirm, complete).
-- =========================================================
create policy cleaning_jobs_ops_all on public.cleaning_jobs
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

create policy cleaning_jobs_cleaner_select on public.cleaning_jobs
  for select to authenticated
  using (public.is_cleaner() and assigned_cleaner_id = auth.uid());

create policy cleaning_jobs_cleaner_update on public.cleaning_jobs
  for update to authenticated
  using (public.is_cleaner() and assigned_cleaner_id = auth.uid())
  with check (public.is_cleaner() and assigned_cleaner_id = auth.uid());

-- =========================================================
-- condition_reports
--   Ops full CRUD.
--   BH creates, reads, and edits their own drafts. Once submitted, only ops can edit.
-- =========================================================
create policy condition_reports_ops_all on public.condition_reports
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

create policy condition_reports_bh_select on public.condition_reports
  for select to authenticated
  using (public.is_brandhost() and submitted_by = auth.uid());

create policy condition_reports_bh_insert on public.condition_reports
  for insert to authenticated
  with check (public.is_brandhost() and submitted_by = auth.uid());

create policy condition_reports_bh_update on public.condition_reports
  for update to authenticated
  using (
    public.is_brandhost()
    and submitted_by = auth.uid()
    and status = 'draft'
  )
  with check (public.is_brandhost() and submitted_by = auth.uid());

-- =========================================================
-- condition_report_areas
--   Scoped via parent report. BH can manage areas of their own draft reports.
-- =========================================================
create policy cra_ops_all on public.condition_report_areas
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

create policy cra_bh_select on public.condition_report_areas
  for select to authenticated
  using (
    public.is_brandhost()
    and exists (
      select 1 from public.condition_reports cr
      where cr.id = condition_report_areas.report_id
        and cr.submitted_by = auth.uid()
    )
  );

create policy cra_bh_insert on public.condition_report_areas
  for insert to authenticated
  with check (
    public.is_brandhost()
    and exists (
      select 1 from public.condition_reports cr
      where cr.id = condition_report_areas.report_id
        and cr.submitted_by = auth.uid()
        and cr.status = 'draft'
    )
  );

create policy cra_bh_update on public.condition_report_areas
  for update to authenticated
  using (
    public.is_brandhost()
    and exists (
      select 1 from public.condition_reports cr
      where cr.id = condition_report_areas.report_id
        and cr.submitted_by = auth.uid()
        and cr.status = 'draft'
    )
  )
  with check (
    public.is_brandhost()
    and exists (
      select 1 from public.condition_reports cr
      where cr.id = condition_report_areas.report_id
        and cr.submitted_by = auth.uid()
    )
  );

create policy cra_bh_delete on public.condition_report_areas
  for delete to authenticated
  using (
    public.is_brandhost()
    and exists (
      select 1 from public.condition_reports cr
      where cr.id = condition_report_areas.report_id
        and cr.submitted_by = auth.uid()
        and cr.status = 'draft'
    )
  );

-- =========================================================
-- vendors and vendor_jobs: ops only.
-- =========================================================
create policy vendors_ops_all on public.vendors
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

create policy vendor_jobs_ops_all on public.vendor_jobs
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

-- =========================================================
-- notifications
--   Ops full read. Recipients can read their own.
--   Inserts come from service_role (n8n) so bypass RLS.
-- =========================================================
create policy notifications_ops_all on public.notifications
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

create policy notifications_recipient_select on public.notifications
  for select to authenticated
  using (recipient_id is not null and recipient_id = auth.uid());

-- =========================================================
-- deposits: ops only.
-- =========================================================
create policy deposits_ops_all on public.deposits
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

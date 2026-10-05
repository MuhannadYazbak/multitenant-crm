--
-- PostgreSQL database dump
--

\restrict p8ZTBlRwrg6lhuYaaJ7PWh9sg5aCwcdw1hkounB5HfsGZSDuwy6S3tPtpcmDMTq

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.11 (Debian 17.11-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_recovery_code_sets; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_recovery_codes; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

-- INSERT INTO auth.schema_migrations (version) VALUES ('20171026211738');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20171026211808');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20171026211834');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20180103212743');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20180108183307');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20180119214651');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20180125194653');
-- INSERT INTO auth.schema_migrations (version) VALUES ('00');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20210710035447');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20210722035447');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20210730183235');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20210909172000');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20210927181326');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20211122151130');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20211124214934');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20211202183645');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20220114185221');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20220114185340');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20220224000811');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20220323170000');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20220429102000');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20220531120530');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20220614074223');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20220811173540');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20221003041349');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20221003041400');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20221011041400');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20221020193600');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20221021073300');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20221021082433');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20221027105023');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20221114143122');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20221114143410');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20221125140132');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20221208132122');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20221215195500');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20221215195800');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20221215195900');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20230116124310');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20230116124412');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20230131181311');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20230322519590');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20230402418590');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20230411005111');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20230508135423');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20230523124323');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20230818113222');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20230914180801');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20231027141322');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20231114161723');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20231117164230');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20240115144230');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20240214120130');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20240306115329');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20240314092811');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20240427152123');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20240612123726');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20240729123726');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20240802193726');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20240806073726');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20241009103726');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20250717082212');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20250731150234');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20250804100000');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20250901200500');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20250903112500');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20250904133000');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20250925093508');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20251007112900');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20251104100000');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20251111201300');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20251201000000');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20260115000000');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20260121000000');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20260219120000');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20260302000000');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20260625000000');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20260821000000');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20260821010000');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20260824000000');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20260824000001');
-- INSERT INTO auth.schema_migrations (version) VALUES ('20260831180000');


--
-- Data for Name: scim_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: scim_users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.admins (username, password_hash, created_at) VALUES ('admin', '$2b$12$I.8Fsv7v2jbsw313lx6/KuVdXsuVjs/Fx1/xyuqJEUxHOdtrqZ.zW', '2026-07-23 09:24:17.454665+00');


--
-- Data for Name: tenant_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.tenant_accounts (id, company_name, tenant_type, password_hash, status, created_at, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_end) VALUES (3, 'company-c', 'legal', '$2b$12$f/8htCOfEsukt1ipDXq6oulfb7UthRpjmUAahPCiGWz.8Yb5sTs8O', 'active', '2026-07-27 13:26:21.202497+00', 'ACTIVE', 'cus_V3ga734oRXuMXo', 'sub_1U3ZDgFReYuSySfN8OHEJSXl', '2026-09-11 10:17:14.973708');
INSERT INTO public.tenant_accounts (id, company_name, tenant_type, password_hash, status, created_at, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_end) VALUES (1, 'company-a', 'insurance', '$2b$12$L0CJu.HXKBpGOtKLrteDq.7h4yxTLplXBK3/h9yJlcWNBSFrKk2jS', 'active', '2026-07-27 13:26:21.202497+00', 'ACTIVE', 'cus_V3fJBE2vqIWqGf', 'sub_1U3Xz8FReYuSySfNIgzRsSAJ', '2026-09-11 10:14:48.651696');
INSERT INTO public.tenant_accounts (id, company_name, tenant_type, password_hash, status, created_at, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_end) VALUES (2, 'company-b', 'general', '$2b$12$a7FOV4vxovV12vvWlLn4OeW7jct.ugn.1YKCa/B9wzhP78RIPDiya', 'active', '2026-07-27 13:26:21.202497+00', 'INACTIVE', NULL, NULL, NULL);
INSERT INTO public.tenant_accounts (id, company_name, tenant_type, password_hash, status, created_at, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_end) VALUES (4, 'acme', 'insurance', '$2b$12$O/lCIqbpS5bzQFuiVtypg..N6EnVgmHoWWLgMye5DoDx6u6zmqDLu', 'active', '2026-09-14 09:25:04.905603+00', 'INACTIVE', NULL, NULL, NULL);
INSERT INTO public.tenant_accounts (id, company_name, tenant_type, password_hash, status, created_at, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_end) VALUES (7, 'yazbak', 'general', '$2b$12$619vRWFEbRYCd9nGiD/RTu5H1TthERZweo62YVYHr0rj7HlC6qTP6', 'active', '2026-09-14 09:49:09.338459+00', 'INACTIVE', NULL, NULL, NULL);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, tenant_id, email, password_hash, full_name, is_active, created_at, last_active) VALUES (7, 7, 'viewer@yazbak.com', '$2b$12$619vRWFEbRYCd9nGiD/RTu5H1TthERZweo62YVYHr0rj7HlC6qTP6', 'Aony Yazbak', false, '2026-09-23 09:34:18+00', NULL);
INSERT INTO public.users (id, tenant_id, email, password_hash, full_name, is_active, created_at, last_active) VALUES (2, 3, 'admin@example.com', '$2b$12$BkghctxHhYm2AnNraKgodOaFmXla3eu3CRoRrWjMaJKzCUOKtdDbC', 'Admin User', true, '2026-09-06 09:32:36.919695+00', '2026-09-27 10:22:23.502172+00');
INSERT INTO public.users (id, tenant_id, email, password_hash, full_name, is_active, created_at, last_active) VALUES (3, 3, 'john.doe@acme.com', '$2b$12$kQ3iFBcMfp/TNVmxw1bGEOL2Xqe.jECsoQBranXEPJlX0Ci36FYPa', 'John Doe', true, '2026-09-09 09:42:53.830779+00', '2026-09-27 11:38:27.741869+00');
INSERT INTO public.users (id, tenant_id, email, password_hash, full_name, is_active, created_at, last_active) VALUES (6, 7, 'manager@yazbak.com', '$2b$12$619vRWFEbRYCd9nGiD/RTu5H1TthERZweo62YVYHr0rj7HlC6qTP6', 'yazbak Manager', true, '2026-09-14 09:49:09.338459+00', '2026-09-28 09:26:43.707149+00');
INSERT INTO public.users (id, tenant_id, email, password_hash, full_name, is_active, created_at, last_active) VALUES (8, 7, 'yazbakm@gmail.com', '$2b$12$hffhE688a2q3RE1KZ6dHYu9zCv0JbWM7UOXNIhO7uJLVW.szQNNdq', 'Muhannad Yazbak', true, '2026-09-24 09:51:10.468363+00', '2026-09-28 11:25:40.129417+00');


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (1, NULL, 'system@crm.com', 'SYSTEM_INIT', 'system', '{"message": "Audit logging initialized successfully"}', NULL, '2026-09-03 09:19:27.52968+00', NULL);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (2, NULL, 'admin@example.com', 'TENANT_STATUS_FROZEN (was ACTIVE)', 'tenants', '{"new_status": "frozen", "company_name": "acme", "previous_status": "active"}', NULL, '2026-09-14 09:48:33.925175+00', 3);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (3, NULL, 'admin@example.com', 'TENANT_STATUS_ACTIVE (was FROZEN)', 'tenants', '{"new_status": "active", "company_name": "acme", "previous_status": "frozen"}', NULL, '2026-09-14 09:48:41.797496+00', 3);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (4, NULL, 'admin@example.com', 'TENANT_STATUS_DELETED (was ACTIVE)', 'tenants', '{"new_status": "deleted", "company_name": "acme", "previous_status": "active"}', NULL, '2026-09-14 09:48:46.345555+00', 3);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (5, NULL, 'admin@example.com', 'TENANT_PROVISIONED', 'tenants', '{"tenant_type": "general", "company_name": "yazbak"}', NULL, '2026-09-14 09:49:09.338459+00', 3);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (6, NULL, 'admin@example.com', 'TENANT_STATUS_FROZEN (was ACTIVE)', 'tenants', '{"new_status": "frozen", "company_name": "yazbak", "previous_status": "active"}', NULL, '2026-09-14 09:54:31.106128+00', 3);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (7, NULL, 'admin@example.com', 'TENANT_STATUS_ACTIVE (was FROZEN)', 'tenants', '{"new_status": "active", "company_name": "yazbak", "previous_status": "frozen"}', NULL, '2026-09-14 10:01:30.124491+00', 3);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (8, NULL, 'admin@example.com', 'TENANT_STATUS_FROZEN (was ACTIVE)', 'tenants', '{"new_status": "frozen", "company_name": "yazbak", "previous_status": "active"}', NULL, '2026-09-14 10:04:31.995604+00', 3);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (9, NULL, 'admin@example.com', 'TENANT_STATUS_ACTIVE (was FROZEN)', 'tenants', '{"new_status": "active", "company_name": "yazbak", "previous_status": "frozen"}', NULL, '2026-09-14 10:06:52.990178+00', 3);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (10, NULL, 'admin@example.com', 'TENANT_STATUS_FROZEN (was ACTIVE)', 'tenants', '{"new_status": "frozen", "company_name": "yazbak", "previous_status": "active"}', NULL, '2026-09-14 10:10:15.840504+00', 3);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (11, NULL, 'admin@example.com', 'TENANT_STATUS_ACTIVE (was DELETED)', 'tenants', '{"new_status": "active", "company_name": "acme", "previous_status": "deleted"}', NULL, '2026-09-14 10:10:29.218513+00', 3);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (12, NULL, 'admin@example.com', 'TENANT_STATUS_ACTIVE (was FROZEN)', 'tenants', '{"new_status": "active", "company_name": "yazbak", "previous_status": "frozen"}', NULL, '2026-09-14 10:14:13.419241+00', 3);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (13, 6, 'manager@yazbak.com', 'CLIENT_DELETED', 'clients', '{"client_id": 1}', '127.0.0.1', '2026-09-23 10:03:51.419021+00', 7);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (15, 6, 'manager@yazbak.com', 'USER_CREATED', 'users', '{"assigned_role": "Viewer", "created_user_id": 8, "created_user_email": "yazbakm@gmail.com"}', '127.0.0.1', '2026-09-24 09:51:10.468363+00', 7);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (16, 6, 'manager@yazbak.com', 'USER_UPDATED', 'users', '{"is_active": true, "updated_user_id": 7}', '127.0.0.1', '2026-09-24 10:52:22.176817+00', 7);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (17, 6, 'manager@yazbak.com', 'USER_DEACTIVATED', 'users', '{"email": "viewer@yazbak.com", "deactivated_user_id": 7}', '127.0.0.1', '2026-09-24 10:52:41.263735+00', 7);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (18, 6, 'manager@yazbak.com', 'CLIENT_CREATED', 'clients', '{"name": "Ab Cd", "client_id": 3}', '127.0.0.1', '2026-09-27 13:22:59.921595+00', 7);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (19, 6, 'manager@yazbak.com', 'CLIENT_CREATED', 'clients', '{"name": "Test Test", "client_id": 4}', '127.0.0.1', '2026-09-27 13:27:38.80157+00', 7);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (20, 6, 'manager@yazbak.com', 'USER_UPDATED', 'users', '{"is_active": true, "updated_user_id": 8}', '127.0.0.1', '2026-09-28 09:40:33.243608+00', NULL);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (21, 8, 'yazbakm@gmail.com', 'CLIENT_CREATED', 'clients', '{"name": "New User", "client_id": 5}', '127.0.0.1', '2026-09-28 09:58:29.185926+00', 7);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (22, 8, 'yazbakm@gmail.com', 'CLIENT_UPDATED', 'clients', '{"name": "Test Tests", "client_id": 4}', '127.0.0.1', '2026-09-28 10:08:55.212424+00', 7);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (23, 8, 'yazbakm@gmail.com', 'NOTE_CREATED', 'notes', '{"note_id": 1, "entity_id": 5, "entity_type": "client"}', '127.0.0.1', '2026-09-28 10:12:29.649601+00', 7);
INSERT INTO public.audit_logs (id, user_id, user_email, action, resource, details, ip_address, created_at, tenant_id) VALUES (24, 8, 'yazbakm@gmail.com', 'CLIENT_UPDATED', 'clients', '{"name": "Test Tests", "client_id": 4}', '127.0.0.1', '2026-09-28 10:38:56.228897+00', 7);


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.clients (id, name, phone, email, address, status, custom_fields) VALUES (1, 'Muhannad Yazbak', '0548034062', 'yazbakm@gmail.com', 'Nazareth, Beer Alameer 1010', NULL, '{}');


--
-- Data for Name: insurance_policies; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: legal_cases; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: billing_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: evidences; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles (id, name, permissions) VALUES (1, 'Admin', '["*:*"]');
INSERT INTO public.roles (id, name, permissions) VALUES (3, 'Viewer', '["clients:read", "notes:read", "documents:read", "billing:read"]');
INSERT INTO public.roles (id, name, permissions) VALUES (4, 'super_admin', '["*"]');
INSERT INTO public.roles (id, name, permissions) VALUES (5, 'Editor', '["clients:read", "clients:write", "notes:read", "notes:write", "documents:read", "documents:write", "billing:read", "billing:write", "dashboard:read", "audit:read"]');
INSERT INTO public.roles (id, name, permissions) VALUES (2, 'Manager', '["clients:read", "clients:write", "clients:delete", "notes:read", "notes:write", "notes:delete", "documents:read", "documents:write", "documents:delete", "billing:read", "billing:write", "billing:delete", "dashboard:read", "audit:read"]');


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_roles (id, user_id, role_id) VALUES (1, 2, 1);
INSERT INTO public.user_roles (id, user_id, role_id) VALUES (2, 2, 4);
INSERT INTO public.user_roles (id, user_id, role_id) VALUES (3, 3, 2);
INSERT INTO public.user_roles (id, user_id, role_id) VALUES (4, 6, 2);
INSERT INTO public.user_roles (id, user_id, role_id) VALUES (7, 7, 3);
INSERT INTO public.user_roles (id, user_id, role_id) VALUES (8, 8, 5);


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: witnesses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20211116024918, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20211116045059, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20211116050929, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20211116051442, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20211116212300, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20211116213355, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20211116213934, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20211116214523, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20211122062447, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20211124070109, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20211202204204, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20211202204605, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20211210212804, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20211228014915, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20220107221237, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20220228202821, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20220312004840, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20220603231003, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20220603232444, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20220615214548, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20220712093339, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20220908172859, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20220916233421, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20230119133233, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20230128025114, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20230128025212, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20230227211149, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20230228184745, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20230308225145, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20230328144023, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20231018144023, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20231204144023, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20231204144024, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20231204144025, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20240108234812, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20240109165339, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20240227174441, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20240311171622, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20240321100241, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20240401105812, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20240418121054, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20240523004032, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20240618124746, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20240801235015, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20240805133720, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20240827160934, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20240919163303, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20240919163305, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20241019105805, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20241030150047, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20241108114728, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20241121104152, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20241130184212, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20241220035512, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20241220123912, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20241224161212, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20250107150512, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20250110162412, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20250123174212, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20250128220012, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20250506224012, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20250523164012, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20250714121412, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20250905041441, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20251103001201, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20251120212548, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20251120215549, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260218120000, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260326120000, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260514120000, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260527120000, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260528120000, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260603120000, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260605120000, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260606110000, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260616120000, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260624120000, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260626120000, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260706120000, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260707120000, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260709120000, '2026-08-31 08:23:34');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260714120000, '2026-09-06 09:19:30');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260827120000, '2026-09-22 08:00:26');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260914120000, '2026-09-22 08:00:26');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260916120000, '2026-09-22 08:00:26');
INSERT INTO realtime.schema_migrations (version, inserted_at) VALUES (20260922120000, '2026-09-24 09:23:18');


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (0, 'create-migrations-table', 'e18db593bcde2aca2a408c4d1100f6abba2195df', '2026-08-31 08:24:09.441544');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (1, 'initialmigration', '6ab16121fbaa08bbd11b712d05f358f9b555d777', '2026-08-31 08:24:09.479618');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (2, 'storage-schema', 'f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd', '2026-08-31 08:24:09.485754');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (3, 'pathtoken-column', '2cb1b0004b817b29d5b0a971af16bafeede4b70d', '2026-08-31 08:24:09.514137');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (4, 'add-migrations-rls', '427c5b63fe1c5937495d9c635c263ee7a5905058', '2026-08-31 08:24:09.53557');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (5, 'add-size-functions', '79e081a1455b63666c1294a440f8ad4b1e6a7f84', '2026-08-31 08:24:09.540835');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (6, 'change-column-name-in-get-size', 'ded78e2f1b5d7e616117897e6443a925965b30d2', '2026-08-31 08:24:09.552281');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (7, 'add-rls-to-buckets', 'e7e7f86adbc51049f341dfe8d30256c1abca17aa', '2026-08-31 08:24:09.560735');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (8, 'add-public-to-buckets', 'fd670db39ed65f9d08b01db09d6202503ca2bab3', '2026-08-31 08:24:09.565992');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (9, 'fix-search-function', 'af597a1b590c70519b464a4ab3be54490712796b', '2026-08-31 08:24:09.582192');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (10, 'search-files-search-function', 'b595f05e92f7e91211af1bbfe9c6a13bb3391e16', '2026-08-31 08:24:09.587718');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (11, 'add-trigger-to-auto-update-updated_at-column', '7425bdb14366d1739fa8a18c83100636d74dcaa2', '2026-08-31 08:24:09.594133');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (12, 'add-automatic-avif-detection-flag', '8e92e1266eb29518b6a4c5313ab8f29dd0d08df9', '2026-08-31 08:24:09.600101');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (13, 'add-bucket-custom-limits', 'cce962054138135cd9a8c4bcd531598684b25e7d', '2026-08-31 08:24:09.605697');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (14, 'use-bytes-for-max-size', '941c41b346f9802b411f06f30e972ad4744dad27', '2026-08-31 08:24:09.610764');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (15, 'add-can-insert-object-function', '934146bc38ead475f4ef4b555c524ee5d66799e5', '2026-08-31 08:24:09.641745');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (16, 'add-version', '76debf38d3fd07dcfc747ca49096457d95b1221b', '2026-08-31 08:24:09.647407');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (17, 'drop-owner-foreign-key', 'f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101', '2026-08-31 08:24:09.652491');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (18, 'add_owner_id_column_deprecate_owner', 'e7a511b379110b08e2f214be852c35414749fe66', '2026-08-31 08:24:09.658593');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (19, 'alter-default-value-objects-id', '02e5e22a78626187e00d173dc45f58fa66a4f043', '2026-08-31 08:24:09.665417');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (20, 'list-objects-with-delimiter', 'cd694ae708e51ba82bf012bba00caf4f3b6393b7', '2026-08-31 08:24:09.670627');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (21, 's3-multipart-uploads', '8c804d4a566c40cd1e4cc5b3725a664a9303657f', '2026-08-31 08:24:09.67745');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (22, 's3-multipart-uploads-big-ints', '9737dc258d2397953c9953d9b86920b8be0cdb73', '2026-08-31 08:24:09.69372');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (23, 'optimize-search-function', '9d7e604cddc4b56a5422dc68c9313f4a1b6f132c', '2026-08-31 08:24:09.705646');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (24, 'operation-function', '8312e37c2bf9e76bbe841aa5fda889206d2bf8aa', '2026-08-31 08:24:09.711341');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (25, 'custom-metadata', 'd974c6057c3db1c1f847afa0e291e6165693b990', '2026-08-31 08:24:09.716394');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (26, 'objects-prefixes', '215cabcb7f78121892a5a2037a09fedf9a1ae322', '2026-08-31 08:24:09.721978');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (27, 'search-v2', '859ba38092ac96eb3964d83bf53ccc0b141663a6', '2026-08-31 08:24:09.726508');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (28, 'object-bucket-name-sorting', 'c73a2b5b5d4041e39705814fd3a1b95502d38ce4', '2026-08-31 08:24:09.731408');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (29, 'create-prefixes', 'ad2c1207f76703d11a9f9007f821620017a66c21', '2026-08-31 08:24:09.736279');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (30, 'update-object-levels', '2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6', '2026-08-31 08:24:09.741958');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (31, 'objects-level-index', 'b40367c14c3440ec75f19bbce2d71e914ddd3da0', '2026-08-31 08:24:09.747423');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (32, 'backward-compatible-index-on-objects', 'e0c37182b0f7aee3efd823298fb3c76f1042c0f7', '2026-08-31 08:24:09.752352');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (33, 'backward-compatible-index-on-prefixes', 'b480e99ed951e0900f033ec4eb34b5bdcb4e3d49', '2026-08-31 08:24:09.75778');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (34, 'optimize-search-function-v1', 'ca80a3dc7bfef894df17108785ce29a7fc8ee456', '2026-08-31 08:24:09.763348');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (35, 'add-insert-trigger-prefixes', '458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc', '2026-08-31 08:24:09.767951');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (36, 'optimise-existing-functions', '6ae5fca6af5c55abe95369cd4f93985d1814ca8f', '2026-08-31 08:24:09.772474');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (37, 'add-bucket-name-length-trigger', '3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1', '2026-08-31 08:24:09.777661');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (38, 'iceberg-catalog-flag-on-buckets', '02716b81ceec9705aed84aa1501657095b32e5c5', '2026-08-31 08:24:09.783363');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (39, 'add-search-v2-sort-support', '6706c5f2928846abee18461279799ad12b279b78', '2026-08-31 08:24:09.79679');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (40, 'fix-prefix-race-conditions-optimized', '7ad69982ae2d372b21f48fc4829ae9752c518f6b', '2026-08-31 08:24:09.80147');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (41, 'add-object-level-update-trigger', '07fcf1a22165849b7a029deed059ffcde08d1ae0', '2026-08-31 08:24:09.806165');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (42, 'rollback-prefix-triggers', '771479077764adc09e2ea2043eb627503c034cd4', '2026-08-31 08:24:09.810931');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (43, 'fix-object-level', '84b35d6caca9d937478ad8a797491f38b8c2979f', '2026-08-31 08:24:09.815823');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (44, 'vector-bucket-type', '99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3', '2026-08-31 08:24:09.820793');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (45, 'vector-buckets', '049e27196d77a7cb76497a85afae669d8b230953', '2026-08-31 08:24:09.826785');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (46, 'buckets-objects-grants', 'fedeb96d60fefd8e02ab3ded9fbde05632f84aed', '2026-08-31 08:24:09.840774');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (47, 'iceberg-table-metadata', '649df56855c24d8b36dd4cc1aeb8251aa9ad42c2', '2026-08-31 08:24:09.846756');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (48, 'iceberg-catalog-ids', 'e0e8b460c609b9999ccd0df9ad14294613eed939', '2026-08-31 08:24:09.85187');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (49, 'buckets-objects-grants-postgres', '072b1195d0d5a2f888af6b2302a1938dd94b8b3d', '2026-08-31 08:24:09.87296');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (50, 'search-v2-optimised', '6323ac4f850aa14e7387eb32102869578b5bd478', '2026-08-31 08:24:09.87866');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (51, 'index-backward-compatible-search', '2ee395d433f76e38bcd3856debaf6e0e5b674011', '2026-08-31 08:24:09.980457');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (52, 'drop-not-used-indexes-and-functions', '5cc44c8696749ac11dd0dc37f2a3802075f3a171', '2026-08-31 08:24:09.982587');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (53, 'drop-index-lower-name', 'd0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854', '2026-08-31 08:24:09.993971');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (54, 'drop-index-object-level', '6289e048b1472da17c31a7eba1ded625a6457e67', '2026-08-31 08:24:09.997158');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (55, 'prevent-direct-deletes', '262a4798d5e0f2e7c8970232e03ce8be695d5819', '2026-08-31 08:24:09.999103');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (56, 'fix-optimized-search-function', 'b823ed1e418101032fa01374edc9a436e54e3ed4', '2026-08-31 08:24:10.004972');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (57, 's3-multipart-uploads-metadata', 'f127886e00d1b374fadbc7c6b31e09336aad5287', '2026-08-31 08:24:10.011369');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (58, 'operation-ergonomics', '00ca5d483b3fe0d522133d9002ccc5df98365120', '2026-08-31 08:24:10.016483');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (59, 'drop-unused-functions', '38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4', '2026-08-31 08:24:10.022278');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (60, 'optimize-existing-functions-again', 'db35e1c91a9201e59f4fef8d972c2f277d68b157', '2026-08-31 08:24:10.028465');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (61, 'mark-filename-immutable', 'fe0096517ae9d60aaec1d110172ba9036dc66bb7', '2026-08-31 08:24:10.034171');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (62, 'object-versioning-core', '0b855f00ff3be0bfca91efee02a9858912491a9a', '2026-08-31 08:24:10.039365');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (63, 'fix-search-name-relative-to-prefix', 'c7485e417624f795ce8bb2da21927f48e088904d', '2026-08-31 08:24:10.047943');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (64, 'fix-search-by-timestamp-sqli', '0af424ecd388a39bb1645184b222185a12149675', '2026-08-31 08:24:10.055563');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (66, 'objects-current-version-index', '191466c93aa2c46a00e36505577c5fcab8d7cb4b', '2026-09-09 08:55:30.555631');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (67, 'objects-null-version-index', '15bfe8c35b66642b6c78ba60060fa8793bd2207a', '2026-09-09 08:55:30.561521');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (65, 'objects-key-version-index', 'da319c4b89ba800ce795d1b699f3a70675138058', '2026-09-09 08:55:30.54071');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (68, 'bucket-lifecycle-configuration', '3c08f6f889922f399519722a932b51007c11bebc', '2026-09-22 07:59:48.943889');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (69, 'validate-bucket-lifecycle-constraints', '4febacaaaa0e61e2b783bef081fe03a287e65eb3', '2026-09-22 07:59:49.048872');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (70, 'list-objects-with-versions', '5c17c3777616cd8d7b18b82835525fa3205af57b', '2026-09-22 07:59:49.065876');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (71, 'objects-delete-marker-index', '6d14858e66c66f8d6accf8a2630aefd1527fddba', '2026-09-22 07:59:49.158282');
INSERT INTO storage.migrations (id, name, hash, executed_at) VALUES (72, 'drop-bucketid-objname-index', '302beb09e1b469d7d4db19566f2389d280b64aa3', '2026-09-22 07:59:49.172558');


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: clients; Type: TABLE DATA; Schema: tenant_acme; Owner: postgres
--



--
-- Data for Name: insurance_policies; Type: TABLE DATA; Schema: tenant_acme; Owner: postgres
--



--
-- Data for Name: billing_entries; Type: TABLE DATA; Schema: tenant_acme; Owner: postgres
--



--
-- Data for Name: documents; Type: TABLE DATA; Schema: tenant_acme; Owner: postgres
--



--
-- Data for Name: notes; Type: TABLE DATA; Schema: tenant_acme; Owner: postgres
--



--
-- Data for Name: clients; Type: TABLE DATA; Schema: tenant_company_a; Owner: postgres
--

INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (1, 'Test User Msdagcls', '054-0000000', 'user-msdagcls@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (46, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (2, 'Test User Msdahmfd', '054-0000000', 'user-msdahmfd@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (26, 'Test User Mshnwbiy', '054-0000000', 'user-mshnwbiy@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (3, 'Test User Msdcigfi', '054-0000000', 'user-msdcigfi@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (4, 'Muhannad Yazbak', '0548034062', 'yazbakm@gmail.com', 'Nazareth, Beer Alameer 1010', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (27, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (5, 'Test User Msemejkc', '054-0000000', 'user-msemejkc@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (6, 'Test User Msemgzsl', '054-0000000', 'user-msemgzsl@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (47, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (7, 'Test User Msemkkcf', '054-0000000', 'user-msemkkcf@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (28, 'Test User Mshnzcjl', '054-0000000', 'user-mshnzcjl@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (8, 'Test User Mshltpld', '054-0000000', 'user-mshltpld@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (9, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (29, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (10, 'Test User Mshmaowj', '054-0000000', 'user-mshmaowj@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (11, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (12, 'Test User Mshmhzma', '054-0000000', 'user-mshmhzma@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (13, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (48, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (14, 'Test User Mshmlsna', '054-0000000', 'user-mshmlsna@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (15, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (30, 'Test User Mshodafi', '054-0000000', 'user-mshodafi@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (16, 'Test User Mshmofkg', '054-0000000', 'user-mshmofkg@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (17, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (31, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (18, 'Test User Mshmxifh', '054-0000000', 'user-mshmxifh@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (19, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (20, 'Test User Mshncbjg', '054-0000000', 'user-mshncbjg@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (21, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (22, 'Test User Mshnjisr', '054-0000000', 'user-mshnjisr@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (23, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (32, 'Test User Mshozhia', '054-0000000', 'user-mshozhia@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (24, 'Test User Mshnombz', '054-0000000', 'user-mshnombz@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (25, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (33, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (34, 'Test User Mshpcjak', '054-0000000', 'user-mshpcjak@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (35, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (49, 'Test User Msdecegf', '054-0000000', 'user-msdecegf@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (36, 'Test User Mshpcwgj', '054-0000000', 'user-mshpcwgj@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (37, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (38, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (39, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (40, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (41, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (42, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (43, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (44, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (45, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (50, 'Alice Smith', '0509876543', 'alice@example.com', 'Nazareth, Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (51, 'Test User Msdehmaq', '054-0000000', 'user-msdehmaq@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (54, 'Test User Msdhiaii', '054-0000000', 'user-msdhiaii@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (52, 'Test User Msdhcivf', '054-0000000', 'user-msdhcivf@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (53, 'Alice Smith Cwrifc', '0509876543', 'alice_1785759716795@example.com', 'Nazareth Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (55, 'Alice Smith Gggmve', '0509876543', 'alice_1785759854926@example.com', 'Nazareth Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (57, 'Alice Smith Xufjrc', '0509876543', 'alice_1785761554012@example.com', 'Nazareth Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (56, 'Test User Msdhbauw', '054-0000000', 'user-msdhbauw@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (58, 'Test User Msdibphv', '054-0000000', 'user-msdibphv@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (59, 'Alice Smith Dbrhbw', '0509876543', 'alice_1785761903715@example.com', 'Nazareth Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (61, 'Alice Smith Eeeggd', '0509876543', 'alice_1785832208348@example.com', 'Nazareth Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (60, 'Test User Msdijfii', '054-0000000', 'user-msdijfii@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (62, 'Test User Mseeeern', '054-0000000', 'user-mseeeern@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (63, 'Alice Smith Kosewl', '0509876543', 'alice_1785832406194@example.com', 'Nazareth Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (64, 'Test User Mseeickb', '054-0000000', 'user-mseeickb@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (65, 'Alice Smith Ytnxge', '0509876543', 'alice_1785834768360@example.com', 'Nazareth Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (66, 'Test User Msefwzds', '054-0000000', 'user-msefwzds@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (67, 'Alice Smith Bckwlw', '0509876543', 'alice_1785834940460@example.com', 'Nazareth Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (68, 'Test User Msegankb', '054-0000000', 'user-msegankb@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (69, 'Alice Smith Uksgoq', '0509876543', 'alice_1785835046452@example.com', 'Nazareth Israel', 'active', '{}');
INSERT INTO tenant_company_a.clients (id, name, phone, email, address, status, custom_fields) VALUES (70, 'Test User Msegcwwz', '054-0000000', 'user-msegcwwz@testcrm.com', '99 Updated Boulevard', 'inactive', '{"Priority": "High"}');


--
-- Data for Name: insurance_policies; Type: TABLE DATA; Schema: tenant_company_a; Owner: postgres
--

INSERT INTO tenant_company_a.insurance_policies (id, client_id, policy_number, policy_type, coverage_amount, deductible, status, start_date, end_date, created_at) VALUES (2, 4, '9845122', 'General', 50000.00, 0.00, 'Active', NULL, NULL, '2026-07-30 10:00:55.230864+00');
INSERT INTO tenant_company_a.insurance_policies (id, client_id, policy_number, policy_type, coverage_amount, deductible, status, start_date, end_date, created_at) VALUES (3, 4, '125477', 'General', 120000.00, 0.00, 'Active', NULL, NULL, '2026-07-30 13:59:40.951272+00');
INSERT INTO tenant_company_a.insurance_policies (id, client_id, policy_number, policy_type, coverage_amount, deductible, status, start_date, end_date, created_at) VALUES (4, 4, '147852', 'General', 65000.00, 0.00, 'Active', NULL, NULL, '2026-07-30 14:00:56.731783+00');
INSERT INTO tenant_company_a.insurance_policies (id, client_id, policy_number, policy_type, coverage_amount, deductible, status, start_date, end_date, created_at) VALUES (6, 9, 'POL-TEST-1785422824822', 'General', 150000.00, 0.00, 'Active', NULL, NULL, '2026-07-30 14:47:06.375876+00');
INSERT INTO tenant_company_a.insurance_policies (id, client_id, policy_number, policy_type, coverage_amount, deductible, status, start_date, end_date, created_at) VALUES (7, 9, 'POL-TEST-1785423261403', 'General', 150000.00, 0.00, 'Active', NULL, NULL, '2026-07-30 14:54:23.114044+00');
INSERT INTO tenant_company_a.insurance_policies (id, client_id, policy_number, policy_type, coverage_amount, deductible, status, start_date, end_date, created_at) VALUES (25, 65, 'POL-TEST-1785834768360', 'General', 150000.00, 0.00, 'Active', NULL, NULL, '2026-08-04 12:13:00.668886+00');


--
-- Data for Name: legal_cases; Type: TABLE DATA; Schema: tenant_company_a; Owner: postgres
--



--
-- Data for Name: billing_entries; Type: TABLE DATA; Schema: tenant_company_a; Owner: postgres
--



--
-- Data for Name: documents; Type: TABLE DATA; Schema: tenant_company_a; Owner: postgres
--



--
-- Data for Name: evidences; Type: TABLE DATA; Schema: tenant_company_a; Owner: postgres
--



--
-- Data for Name: notes; Type: TABLE DATA; Schema: tenant_company_a; Owner: postgres
--

INSERT INTO tenant_company_a.notes (id, author_name, note_type, content, is_pinned, created_at, client_id, case_id, policy_id) VALUES (18, 'Admin', 'General', 'test', false, '2026-08-01 17:36:25.640889+00', 4, NULL, NULL);


--
-- Data for Name: properties; Type: TABLE DATA; Schema: tenant_company_a; Owner: postgres
--

INSERT INTO tenant_company_a.properties (id, client_id, property_type, area, address, created_at) VALUES ('70af9ce2-c6ec-4f41-afbd-d4672bf50053', 46, 'Herzl St 1785754659465, Tel Aviv', 2500000, NULL, '2026-08-03 10:57:42.79162+00');
INSERT INTO tenant_company_a.properties (id, client_id, property_type, area, address, created_at) VALUES ('ecf6120c-032a-4b75-bc0b-3b72e1bd8c97', 46, 'Herzl St 1785754804935, Tel Aviv', 2500000, NULL, '2026-08-03 11:00:05.687659+00');
INSERT INTO tenant_company_a.properties (id, client_id, property_type, area, address, created_at) VALUES ('b58cf37b-68b1-4f43-baaa-689746d6af25', 46, 'Herzl St 1785754868971, Tel Aviv', 2500000, NULL, '2026-08-03 11:01:09.6604+00');
INSERT INTO tenant_company_a.properties (id, client_id, property_type, area, address, created_at) VALUES ('ee297860-1baa-4019-872b-9e4e3a5dd05c', 46, 'Herzl St 1785755112728, Tel Aviv', 2500000, NULL, '2026-08-03 11:05:13.298027+00');
INSERT INTO tenant_company_a.properties (id, client_id, property_type, area, address, created_at) VALUES ('f72a2857-128a-4246-85c6-853fc5ed401b', 53, 'Herzl St 1785759716238, Tel Aviv', 2500000, NULL, '2026-08-03 12:22:01.459101+00');
INSERT INTO tenant_company_a.properties (id, client_id, property_type, area, address, created_at) VALUES ('9e30d25d-6e16-4c0f-9f20-c4cce525a8fd', 55, 'Herzl St 1785759853488, Tel Aviv', 2500000, NULL, '2026-08-03 12:24:21.59679+00');
INSERT INTO tenant_company_a.properties (id, client_id, property_type, area, address, created_at) VALUES ('178f3af5-4a7d-4e7e-8d2c-50d16569b153', 59, 'Herzl St 1785761903061, Tel Aviv', 2500000, NULL, '2026-08-03 12:58:29.911752+00');
INSERT INTO tenant_company_a.properties (id, client_id, property_type, area, address, created_at) VALUES ('c7c4981a-647f-46ce-b614-81c4e46d748b', 61, 'Herzl St 1785832204503, Tel Aviv', 2500000, NULL, '2026-08-04 08:30:18.059532+00');
INSERT INTO tenant_company_a.properties (id, client_id, property_type, area, address, created_at) VALUES ('8e631f7f-69a7-4690-89b7-f241dcc82831', 63, 'Herzl St 1785832405232, Tel Aviv', 2500000, NULL, '2026-08-04 08:33:31.910026+00');
INSERT INTO tenant_company_a.properties (id, client_id, property_type, area, address, created_at) VALUES ('d8e83e05-38ac-40c2-a055-957020813713', 65, 'Herzl St 1785834766965, Tel Aviv', 2500000, NULL, '2026-08-04 09:13:00.28549+00');
INSERT INTO tenant_company_a.properties (id, client_id, property_type, area, address, created_at) VALUES ('5472e743-e24b-4256-866d-2441e0f6a5d8', 67, 'Herzl St 1785834938902, Tel Aviv', 2500000, NULL, '2026-08-04 09:15:47.276726+00');
INSERT INTO tenant_company_a.properties (id, client_id, property_type, area, address, created_at) VALUES ('c4ab3347-cc95-41e5-911a-6a9b928f5b3c', 69, 'Herzl St 1785835044783, Tel Aviv', 2500000, NULL, '2026-08-04 09:17:32.962123+00');


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: tenant_company_a; Owner: postgres
--

INSERT INTO tenant_company_a.vehicles (id, client_id, manufacturer, model, year, plate_no, created_at) VALUES ('5ee49130-7ac1-4aff-b616-aa2058c33c6f', 4, 'Skoda', 'Rapid Czech', 2017, '3144785', '2026-08-01 13:29:11.131657+00');
INSERT INTO tenant_company_a.vehicles (id, client_id, manufacturer, model, year, plate_no, created_at) VALUES ('77629c56-21d0-4b74-a39f-04427b2e3d13', 27, 'Skoda', 'Rapid', 2017, '1122233', '2026-08-03 10:54:49.489904+00');
INSERT INTO tenant_company_a.vehicles (id, client_id, manufacturer, model, year, plate_no, created_at) VALUES ('6c2bdf06-db5c-4dd5-a1e4-f856271f30f1', 46, 'Skoda', 'Rapid', 2017, '1122233', '2026-08-03 10:57:41.334164+00');
INSERT INTO tenant_company_a.vehicles (id, client_id, manufacturer, model, year, plate_no, created_at) VALUES ('dc058565-e5dd-456e-8502-85fdbd5b68e0', 46, 'Skoda', 'Rapid', 2017, '1122233', '2026-08-03 11:00:05.322737+00');
INSERT INTO tenant_company_a.vehicles (id, client_id, manufacturer, model, year, plate_no, created_at) VALUES ('148ea93e-eb14-428b-a5ae-3cb736998d2e', 46, 'Skoda', 'Rapid', 2017, '1122233', '2026-08-03 11:01:09.364913+00');
INSERT INTO tenant_company_a.vehicles (id, client_id, manufacturer, model, year, plate_no, created_at) VALUES ('48d876a9-691f-479e-85ee-9a892ecf533a', 46, 'Skoda', 'Rapid', 2017, '1122233', '2026-08-03 11:05:13.042224+00');
INSERT INTO tenant_company_a.vehicles (id, client_id, manufacturer, model, year, plate_no, created_at) VALUES ('d9505056-653d-4d5d-b363-337c24fda612', 53, 'Skoda', 'Rapid', 2017, '1122233', '2026-08-03 12:22:01.073666+00');
INSERT INTO tenant_company_a.vehicles (id, client_id, manufacturer, model, year, plate_no, created_at) VALUES ('df731018-9c7a-46ec-ae0e-a862846b23d5', 55, 'Skoda', 'Rapid', 2017, '1122233', '2026-08-03 12:24:21.011989+00');
INSERT INTO tenant_company_a.vehicles (id, client_id, manufacturer, model, year, plate_no, created_at) VALUES ('d5df255d-3e26-4a9e-89b6-54a383a0e9d8', 59, 'Skoda', 'Rapid', 2017, '1122233', '2026-08-03 12:58:29.609561+00');
INSERT INTO tenant_company_a.vehicles (id, client_id, manufacturer, model, year, plate_no, created_at) VALUES ('9f844b9c-f651-4834-a763-4a2d4c27cd8a', 61, 'Skoda', 'Rapid', 2017, '1122233', '2026-08-04 08:30:17.499878+00');
INSERT INTO tenant_company_a.vehicles (id, client_id, manufacturer, model, year, plate_no, created_at) VALUES ('a1d266c5-0129-4589-a0b9-88a367c913ec', 63, 'Skoda', 'Rapid', 2017, '1122233', '2026-08-04 08:33:31.360985+00');
INSERT INTO tenant_company_a.vehicles (id, client_id, manufacturer, model, year, plate_no, created_at) VALUES ('91d6f0e9-9232-4568-85a5-fdd31cab8f4f', 65, 'Skoda', 'Rapid', 2017, '1122233', '2026-08-04 09:12:59.843113+00');
INSERT INTO tenant_company_a.vehicles (id, client_id, manufacturer, model, year, plate_no, created_at) VALUES ('8961d2d3-9e0a-4f47-aa18-ee2347a96045', 67, 'Skoda', 'Rapid', 2017, '1122233', '2026-08-04 09:15:46.558373+00');
INSERT INTO tenant_company_a.vehicles (id, client_id, manufacturer, model, year, plate_no, created_at) VALUES ('851d3ca7-3dd5-4b65-8e2d-0b1bb64c65ba', 69, 'Skoda', 'Rapid', 2017, '1122233', '2026-08-04 09:17:32.328408+00');


--
-- Data for Name: witnesses; Type: TABLE DATA; Schema: tenant_company_a; Owner: postgres
--



--
-- Data for Name: clients; Type: TABLE DATA; Schema: tenant_company_b; Owner: postgres
--

INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (1, 'Amer Sajrawi', '0523001820', 'a.sajrawi@gmail.com', 'Haifa, Abbas 20', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (2, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (3, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (4, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (5, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (6, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (7, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (8, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (9, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (10, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (11, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (12, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (13, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (14, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (15, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (16, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (17, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (18, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (19, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (20, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (21, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (22, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (23, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (24, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (25, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (26, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');
INSERT INTO tenant_company_b.clients (id, name, phone, email, address, status, custom_fields) VALUES (27, 'Bob Jones', '0505554433', 'bob@example.com', 'Tel Aviv, Israel', 'active', '{}');


--
-- Data for Name: insurance_policies; Type: TABLE DATA; Schema: tenant_company_b; Owner: postgres
--



--
-- Data for Name: legal_cases; Type: TABLE DATA; Schema: tenant_company_b; Owner: postgres
--



--
-- Data for Name: billing_entries; Type: TABLE DATA; Schema: tenant_company_b; Owner: postgres
--

INSERT INTO tenant_company_b.billing_entries (id, description, hours, rate, total_amount, is_paid, created_at, client_id, case_id, policy_id) VALUES (5, 'No Idea', 12.00, 215.00, 2580.00, false, '2026-07-30 09:59:29.789015+00', 1, NULL, NULL);


--
-- Data for Name: documents; Type: TABLE DATA; Schema: tenant_company_b; Owner: postgres
--

INSERT INTO tenant_company_b.documents (id, file_name, file_path, file_type, file_category, file_size_bytes, is_archived, uploaded_at, client_id, case_id, policy_id) VALUES (1, 'DocumentsTab.tsx', 'uploaded_documents\default_tenant\client_1\DocumentsTab.tsx', NULL, 'General', 7294, true, '2026-07-30 09:35:29.638695+00', 1, NULL, NULL);
INSERT INTO tenant_company_b.documents (id, file_name, file_path, file_type, file_category, file_size_bytes, is_archived, uploaded_at, client_id, case_id, policy_id) VALUES (2, 'BillingTab.tsx', 'uploaded_documents\default_tenant\client_1\BillingTab.tsx', NULL, 'General', 8164, true, '2026-07-30 09:53:05.576786+00', 1, NULL, NULL);
INSERT INTO tenant_company_b.documents (id, file_name, file_path, file_type, file_category, file_size_bytes, is_archived, uploaded_at, client_id, case_id, policy_id) VALUES (3, 'Navbar.tsx', 'uploaded_documents\default_tenant\client_1\Navbar.tsx', NULL, 'General', 1791, true, '2026-07-30 09:59:13.745981+00', 1, NULL, NULL);


--
-- Data for Name: evidences; Type: TABLE DATA; Schema: tenant_company_b; Owner: postgres
--



--
-- Data for Name: notes; Type: TABLE DATA; Schema: tenant_company_b; Owner: postgres
--

INSERT INTO tenant_company_b.notes (id, author_name, note_type, content, is_pinned, created_at, client_id, case_id, policy_id) VALUES (3, 'A', 'General', 'BC', false, '2026-07-30 09:35:14.223414+00', 1, NULL, NULL);
INSERT INTO tenant_company_b.notes (id, author_name, note_type, content, is_pinned, created_at, client_id, case_id, policy_id) VALUES (5, 'New', 'General', 'Test', false, '2026-07-30 09:59:06.096806+00', 1, NULL, NULL);
INSERT INTO tenant_company_b.notes (id, author_name, note_type, content, is_pinned, created_at, client_id, case_id, policy_id) VALUES (6, 'Test Admin', 'General', 'General client note 1785423512055', false, '2026-07-30 14:58:32.202234+00', 2, NULL, NULL);


--
-- Data for Name: properties; Type: TABLE DATA; Schema: tenant_company_b; Owner: postgres
--



--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: tenant_company_b; Owner: postgres
--



--
-- Data for Name: witnesses; Type: TABLE DATA; Schema: tenant_company_b; Owner: postgres
--



--
-- Data for Name: clients; Type: TABLE DATA; Schema: tenant_company_c; Owner: postgres
--

INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (1, 'Muhannad Yazbak', '0548034062', 'yazbakm@gmail.com', 'Nazareth, Beer Alameer 1010', 'active', '{"Job": "FullStack Developer"}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (3, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (2, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'inactive', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (4, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (5, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (6, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (7, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (8, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (9, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (10, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (11, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (12, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (13, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (14, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (15, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (16, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (17, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (18, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (19, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (20, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (21, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (22, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (23, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (24, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (25, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (26, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (27, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (28, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (29, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (30, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (31, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (32, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (33, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (34, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (35, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (36, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (37, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (38, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (39, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (40, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (41, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (42, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (43, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (44, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (45, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (46, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (47, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (48, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (49, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (50, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (51, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (52, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (53, 'Charlie Brown', '0501234567', 'charlie@example.com', 'Haifa, Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (54, 'Charlie Brown Yogqrh', '0501234567', 'charlie_1785759717056@example.com', 'Haifa Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (55, 'Charlie Brown Yudfrq', '0501234567', 'charlie_1785759854982@example.com', 'Haifa Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (56, 'Charlie Brown Yhiuit', '0501234567', 'charlie_1785761554046@example.com', 'Haifa Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (57, 'Charlie Brown Jrabsw', '0501234567', 'charlie_1785761903999@example.com', 'Haifa Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (58, 'Charlie Brown Hnmnqw', '0501234567', 'charlie_1785832208347@example.com', 'Haifa Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (59, 'Charlie Brown Eaqcey', '0501234567', 'charlie_1785832406941@example.com', 'Haifa Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (60, 'Charlie Brown Uqtdtr', '0501234567', 'charlie_1785834768348@example.com', 'Haifa Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (61, 'Charlie Brown Dpvwrd', '0501234567', 'charlie_1785834940440@example.com', 'Haifa Israel', 'active', '{}');
INSERT INTO tenant_company_c.clients (id, name, phone, email, address, status, custom_fields) VALUES (62, 'Charlie Brown Dopbqk', '0501234567', 'charlie_1785835045948@example.com', 'Haifa Israel', 'active', '{}');


--
-- Data for Name: insurance_policies; Type: TABLE DATA; Schema: tenant_company_c; Owner: postgres
--



--
-- Data for Name: legal_cases; Type: TABLE DATA; Schema: tenant_company_c; Owner: postgres
--



--
-- Data for Name: billing_entries; Type: TABLE DATA; Schema: tenant_company_c; Owner: postgres
--



--
-- Data for Name: documents; Type: TABLE DATA; Schema: tenant_company_c; Owner: postgres
--



--
-- Data for Name: evidences; Type: TABLE DATA; Schema: tenant_company_c; Owner: postgres
--

INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('78784e75-edc4-4ea1-8f9f-2c3e254246ce', 1, 'Record', 'on the phone', '2026-08-02 11:42:12.340288+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('d0fe20e0-33c8-466e-94e3-629ac68d439b', 3, 'Recording', 'Audio Recording 1785747830037', '2026-08-03 09:03:50.305043+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('25108479-eb52-4e19-978a-a5edb90b3a8a', 3, 'Recording', 'Audio Recording 1785748639774', '2026-08-03 09:17:20.001561+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('b53810da-526a-47fb-8477-453509053520', 3, 'Recording', 'Audio Recording 1785748770306', '2026-08-03 09:19:30.506919+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('c338eccc-65f4-4600-8077-0c077c2ce3f6', 3, 'Recording', 'Audio Recording 1785748864170', '2026-08-03 09:21:04.488422+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('741ff0ed-36c1-4b9d-99db-c3a4e0aa21d8', 3, 'Recording', 'Audio Recording 1785749112969', '2026-08-03 09:25:13.488424+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('d8b5762a-db74-4962-a849-7a9f6bf9dd3e', 3, 'Recording', 'Audio Recording 1785749209333', '2026-08-03 09:26:49.859968+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('b22a494e-12d2-4bb7-848e-38ff35c8e9b8', 3, 'Recording', 'Audio Recording 1785749388500', '2026-08-03 09:29:49.05026+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('ec11cd93-20ac-49a7-99e4-b8fb447bccc6', 3, 'Recording', 'Audio Recording 1785749563067', '2026-08-03 09:32:43.412379+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('7cb1d765-48a3-4a04-8719-48c08ea5597b', 3, 'Recording', 'Audio Recording 1785750029137', '2026-08-03 09:40:30.36745+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('8f74840a-2909-4f26-9717-86ec29398a69', 3, 'Recording', 'Audio Recording 1785750110897', '2026-08-03 09:41:52.412325+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('282f7689-23a4-49d2-8174-a6bc45a2275d', 3, 'Recording', 'Audio Recording 1785750321908', '2026-08-03 09:45:24.943262+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('b0175781-a4c4-4c0d-b18e-cf1b65e37518', 3, 'Recording', 'Audio Recording 1785750732187', '2026-08-03 09:52:14.626758+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('d76f6e59-0946-4b4c-87a7-502a8edf8a3d', 3, 'Recording', 'Audio Recording 1785750792945', '2026-08-03 09:53:14.668911+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('5ed71e79-0d81-4b7c-b975-42c39774a13b', 3, 'Recording', 'Audio Recording 1785751081492', '2026-08-03 09:58:03.070192+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('86293cf6-ebc5-4101-883d-bed942379645', 3, 'Recording', 'Audio Recording 1785751382830', '2026-08-03 10:03:05.787075+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('04beec70-cdca-4a4b-94ae-5639aaa2912a', 3, 'Recording', 'Audio Recording 1785751429360', '2026-08-03 10:03:52.298343+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('3abd4900-d853-4c77-a6e0-2186cb03318d', 3, 'Recording', 'Audio Recording 1785751553508', '2026-08-03 10:05:55.816999+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('388a55af-d04e-4c8b-862c-2cc5e3d81495', 3, 'Recording', 'Audio Recording 1785751791979', '2026-08-03 10:09:54.696425+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('9ab89bce-1e91-488e-bd47-14047a3d3995', 3, 'Recording', 'Audio Recording 1785751975197', '2026-08-03 10:12:57.709128+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('4f225a27-8923-433d-9d7e-73b018659c44', 3, 'Recording', 'Audio Recording 1785752214198', '2026-08-03 10:16:56.602622+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('fd861e22-da16-47f6-bd9d-a4302d52a874', 3, 'Recording', 'Audio Recording 1785752347889', '2026-08-03 10:19:10.050453+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('783f7364-f927-4e80-9e59-666b459c3794', 3, 'Recording', 'Audio Recording 1785754867938', '2026-08-03 11:01:09.102853+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('cfd120ea-f74b-4aa7-bbcd-8fca3762b760', 3, 'Recording', 'Audio Recording 1785755112340', '2026-08-03 11:05:13.423036+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('652b63e9-ed72-4cbc-896d-79afd8f1c8fd', 54, 'Recording', 'Audio Recording 1785759716305', '2026-08-03 12:22:01.32618+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('9bacff42-7d18-4af2-a120-3563998a0ba2', 55, 'Recording', 'Audio Recording 1785759853473', '2026-08-03 12:24:19.626915+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('1dc805bc-8422-4f0c-ac57-68a36871e593', 57, 'Recording', 'Audio Recording 1785761903129', '2026-08-03 12:58:29.543128+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('40a16407-201b-410f-b2c7-72abcb1eb33a', 58, 'Recording', 'Audio Recording 1785832204484', '2026-08-04 08:30:17.476816+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('7fe72f8d-7daf-465f-a874-b5a391a7e6b0', 59, 'Recording', 'Audio Recording 1785832405369', '2026-08-04 08:33:32.357179+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('30cdaedd-b89f-403f-8eb0-4a01a4b2d550', 60, 'Recording', 'Audio Recording 1785834766899', '2026-08-04 09:12:53.031368+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('8e732fb2-820f-479d-8279-ab38f8c95d0b', 61, 'Recording', 'Audio Recording 1785834938893', '2026-08-04 09:15:46.406216+00');
INSERT INTO tenant_company_c.evidences (id, client_id, evidence_type, evidence_detail, created_at) VALUES ('4d3cd490-2688-4167-bfbb-392aa17861c1', 62, 'Recording', 'Audio Recording 1785835044716', '2026-08-04 09:17:31.469361+00');


--
-- Data for Name: notes; Type: TABLE DATA; Schema: tenant_company_c; Owner: postgres
--



--
-- Data for Name: properties; Type: TABLE DATA; Schema: tenant_company_c; Owner: postgres
--



--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: tenant_company_c; Owner: postgres
--



--
-- Data for Name: witnesses; Type: TABLE DATA; Schema: tenant_company_c; Owner: postgres
--

INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('356e8be1-ed75-46f7-bf7d-ab03c87484a7', 3, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-03 09:53:16.748535+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('fbf9a980-8c77-4771-84bf-a1c76de0ba9e', 3, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-03 09:58:05.327153+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('fd325920-6878-4133-820c-4575eb0288bc', 3, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-03 10:03:07.804463+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('ff65eec1-a7e9-4707-96c4-851f83eb8352', 3, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-03 10:03:54.131333+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('d4662de1-c4d0-40c1-a5d8-e40b971c9df8', 3, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-03 10:05:58.802293+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('fec4c782-1d18-4d37-8159-b32f7d0e6ea6', 3, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-03 10:09:57.016658+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('5e9b269f-3116-4f22-a8de-e464c30c63a6', 3, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-03 10:12:59.961011+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('a548224d-909b-4e66-b1ef-5588a856d78c', 3, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-03 10:16:59.916339+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('b51bddcd-3fee-4e53-a1af-28d83c0adf78', 3, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-03 10:19:11.914941+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('78f696d1-0bed-4bd5-9ca5-62e6d411f790', 3, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-03 11:01:09.926302+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('e462e8dd-7b93-4850-9e09-a5c523cd0304', 3, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-03 11:05:13.745254+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('6a47e83f-f999-4f70-a52b-b85fc37a50ec', 54, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-03 12:22:01.8812+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('92a5853b-7c80-4354-949e-fa735c51d4f3', 55, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-03 12:24:20.67538+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('64979578-19f9-4088-a137-dd9fb8b7df04', 57, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-03 12:58:29.861203+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('9124e00a-2a6f-440c-bca0-a94acc3edaab', 58, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-04 08:30:18.161097+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('677504cb-e4f8-47c2-9d7a-6193a37b66ff', 59, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-04 08:33:33.239969+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('a5e5001b-c887-439e-bbb8-955d7f692f8f', 60, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-04 09:12:53.794656+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('820f197e-8ccd-4b1f-bc69-e46516576328', 61, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-04 09:15:47.237892+00');
INSERT INTO tenant_company_c.witnesses (id, client_id, name, age, phone, email, address, created_at) VALUES ('f24165b6-fd93-466c-8e4c-895b9cee6f8b', 62, 'Eye Witness', 20, '0541112233', 'witness@example.com', '', '2026-08-04 09:17:32.394116+00');


--
-- Data for Name: clients; Type: TABLE DATA; Schema: tenant_yazbak; Owner: postgres
--

INSERT INTO tenant_yazbak.clients (id, name, phone, email, address, status, custom_fields) VALUES (1, 'Muhannad Yazbak', '0548034062', 'yazbakm@gmail.com', 'Beer Alameer 1010', 'inactive', '{}');
INSERT INTO tenant_yazbak.clients (id, name, phone, email, address, status, custom_fields) VALUES (3, 'Ab Cd', '0521478965', 'ab@cd.com', 'abcd', 'active', '{}');
INSERT INTO tenant_yazbak.clients (id, name, phone, email, address, status, custom_fields) VALUES (5, 'New User', '0501203201', 'newuser@yazbak.com', 'Unknown', 'active', '{}');
INSERT INTO tenant_yazbak.clients (id, name, phone, email, address, status, custom_fields) VALUES (4, 'Test Tests', '0541020101', 't2@test.com', 'test2', 'active', '{"Job": "Bus Driver"}');


--
-- Data for Name: billing_entries; Type: TABLE DATA; Schema: tenant_yazbak; Owner: postgres
--



--
-- Data for Name: documents; Type: TABLE DATA; Schema: tenant_yazbak; Owner: postgres
--



--
-- Data for Name: notes; Type: TABLE DATA; Schema: tenant_yazbak; Owner: postgres
--

INSERT INTO tenant_yazbak.notes (id, author_name, note_type, content, is_pinned, created_at, client_id, case_id, policy_id) VALUES (1, 'Muhannad', 'Strategy', 'should start Pr marketing', false, '2026-09-28 10:12:29.649601', 5, NULL, NULL);


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 24, true);


--
-- Name: billing_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.billing_entries_id_seq', 1, false);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clients_id_seq', 1, true);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.documents_id_seq', 1, false);


--
-- Name: insurance_policies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.insurance_policies_id_seq', 1, false);


--
-- Name: legal_cases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.legal_cases_id_seq', 1, false);


--
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notes_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- Name: tenant_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tenant_accounts_id_seq', 7, true);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 8, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_realtime_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: billing_entries_id_seq; Type: SEQUENCE SET; Schema: tenant_acme; Owner: postgres
--

SELECT pg_catalog.setval('tenant_acme.billing_entries_id_seq', 1, false);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: tenant_acme; Owner: postgres
--

SELECT pg_catalog.setval('tenant_acme.clients_id_seq', 1, false);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: tenant_acme; Owner: postgres
--

SELECT pg_catalog.setval('tenant_acme.documents_id_seq', 1, false);


--
-- Name: insurance_policies_id_seq; Type: SEQUENCE SET; Schema: tenant_acme; Owner: postgres
--

SELECT pg_catalog.setval('tenant_acme.insurance_policies_id_seq', 1, false);


--
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: tenant_acme; Owner: postgres
--

SELECT pg_catalog.setval('tenant_acme.notes_id_seq', 1, false);


--
-- Name: billing_entries_id_seq; Type: SEQUENCE SET; Schema: tenant_company_a; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_a.billing_entries_id_seq', 1, false);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: tenant_company_a; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_a.clients_id_seq', 1, false);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: tenant_company_a; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_a.documents_id_seq', 1, false);


--
-- Name: insurance_policies_id_seq; Type: SEQUENCE SET; Schema: tenant_company_a; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_a.insurance_policies_id_seq', 1, false);


--
-- Name: legal_cases_id_seq; Type: SEQUENCE SET; Schema: tenant_company_a; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_a.legal_cases_id_seq', 1, false);


--
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: tenant_company_a; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_a.notes_id_seq', 1, false);


--
-- Name: billing_entries_id_seq; Type: SEQUENCE SET; Schema: tenant_company_b; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_b.billing_entries_id_seq', 1, false);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: tenant_company_b; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_b.clients_id_seq', 1, false);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: tenant_company_b; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_b.documents_id_seq', 1, false);


--
-- Name: insurance_policies_id_seq; Type: SEQUENCE SET; Schema: tenant_company_b; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_b.insurance_policies_id_seq', 1, false);


--
-- Name: legal_cases_id_seq; Type: SEQUENCE SET; Schema: tenant_company_b; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_b.legal_cases_id_seq', 1, false);


--
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: tenant_company_b; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_b.notes_id_seq', 1, false);


--
-- Name: billing_entries_id_seq; Type: SEQUENCE SET; Schema: tenant_company_c; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_c.billing_entries_id_seq', 1, false);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: tenant_company_c; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_c.clients_id_seq', 4, true);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: tenant_company_c; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_c.documents_id_seq', 1, false);


--
-- Name: insurance_policies_id_seq; Type: SEQUENCE SET; Schema: tenant_company_c; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_c.insurance_policies_id_seq', 1, false);


--
-- Name: legal_cases_id_seq; Type: SEQUENCE SET; Schema: tenant_company_c; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_c.legal_cases_id_seq', 1, false);


--
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: tenant_company_c; Owner: postgres
--

SELECT pg_catalog.setval('tenant_company_c.notes_id_seq', 1, false);


--
-- Name: billing_entries_id_seq; Type: SEQUENCE SET; Schema: tenant_yazbak; Owner: postgres
--

SELECT pg_catalog.setval('tenant_yazbak.billing_entries_id_seq', 1, false);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: tenant_yazbak; Owner: postgres
--

SELECT pg_catalog.setval('tenant_yazbak.clients_id_seq', 5, true);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: tenant_yazbak; Owner: postgres
--

SELECT pg_catalog.setval('tenant_yazbak.documents_id_seq', 1, false);


--
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: tenant_yazbak; Owner: postgres
--

SELECT pg_catalog.setval('tenant_yazbak.notes_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--

\unrestrict p8ZTBlRwrg6lhuYaaJ7PWh9sg5aCwcdw1hkounB5HfsGZSDuwy6S3tPtpcmDMTq


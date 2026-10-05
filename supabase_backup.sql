


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;




ALTER SCHEMA "public" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "tenant_acme";


ALTER SCHEMA "tenant_acme" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "tenant_company_a";


ALTER SCHEMA "tenant_company_a" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "tenant_company_b";


ALTER SCHEMA "tenant_company_b" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "tenant_company_c";


ALTER SCHEMA "tenant_company_c" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "tenant_yazbak";


ALTER SCHEMA "tenant_yazbak" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admins" (
    "username" character varying(50) NOT NULL,
    "password_hash" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" integer NOT NULL,
    "tenant_id" integer,
    "user_id" integer,
    "user_email" character varying(100),
    "action" character varying(100) NOT NULL,
    "resource" character varying(50) NOT NULL,
    "details" "jsonb" NOT NULL,
    "ip_address" character varying(45),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."audit_logs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."audit_logs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."audit_logs_id_seq" OWNED BY "public"."audit_logs"."id";



CREATE TABLE IF NOT EXISTS "public"."billing_entries" (
    "id" integer NOT NULL,
    "description" character varying(255) NOT NULL,
    "hours" numeric(6,2),
    "rate" numeric(10,2),
    "total_amount" numeric(10,2) NOT NULL,
    "is_paid" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "public"."billing_entries" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."billing_entries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."billing_entries_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."billing_entries_id_seq" OWNED BY "public"."billing_entries"."id";



CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "phone" character varying(50) NOT NULL,
    "email" character varying(100) NOT NULL,
    "address" character varying(250),
    "status" character varying(50),
    "custom_fields" "jsonb" NOT NULL
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."clients_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."clients_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."clients_id_seq" OWNED BY "public"."clients"."id";



CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" integer NOT NULL,
    "file_name" character varying(255) NOT NULL,
    "file_path" character varying(500) NOT NULL,
    "file_type" character varying(50),
    "file_category" character varying(50),
    "file_size_bytes" bigint,
    "is_archived" boolean,
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."documents_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."documents_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."documents_id_seq" OWNED BY "public"."documents"."id";



CREATE TABLE IF NOT EXISTS "public"."evidences" (
    "id" character varying NOT NULL,
    "client_id" integer NOT NULL,
    "evidence_type" character varying(100) NOT NULL,
    "evidence_detail" character varying(100) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."evidences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."insurance_policies" (
    "id" integer NOT NULL,
    "client_id" integer NOT NULL,
    "policy_number" character varying(100) NOT NULL,
    "policy_type" character varying(100),
    "coverage_amount" numeric(12,2),
    "deductible" numeric(10,2),
    "status" character varying(50),
    "start_date" timestamp without time zone,
    "end_date" timestamp without time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."insurance_policies" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."insurance_policies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."insurance_policies_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."insurance_policies_id_seq" OWNED BY "public"."insurance_policies"."id";



CREATE TABLE IF NOT EXISTS "public"."legal_cases" (
    "id" integer NOT NULL,
    "client_id" integer NOT NULL,
    "case_number" character varying(100) NOT NULL,
    "case_type" character varying(100) NOT NULL,
    "court" character varying(255),
    "status" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."legal_cases" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."legal_cases_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."legal_cases_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."legal_cases_id_seq" OWNED BY "public"."legal_cases"."id";



CREATE TABLE IF NOT EXISTS "public"."notes" (
    "id" integer NOT NULL,
    "author_name" character varying(100) NOT NULL,
    "note_type" character varying(50),
    "content" "text" NOT NULL,
    "is_pinned" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "public"."notes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."notes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."notes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."notes_id_seq" OWNED BY "public"."notes"."id";



CREATE TABLE IF NOT EXISTS "public"."properties" (
    "id" character varying NOT NULL,
    "client_id" integer NOT NULL,
    "property_type" character varying(100) NOT NULL,
    "area" double precision NOT NULL,
    "address" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."properties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" integer NOT NULL,
    "name" character varying(50) NOT NULL,
    "permissions" "jsonb" NOT NULL
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."roles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."roles_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."roles_id_seq" OWNED BY "public"."roles"."id";



CREATE TABLE IF NOT EXISTS "public"."tenant_accounts" (
    "id" integer NOT NULL,
    "company_name" character varying(100) NOT NULL,
    "tenant_type" character varying(50) NOT NULL,
    "password_hash" character varying(255) NOT NULL,
    "status" character varying(20) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "subscription_status" character varying(50),
    "stripe_customer_id" character varying(255),
    "stripe_subscription_id" character varying(255),
    "current_period_end" timestamp without time zone
);


ALTER TABLE "public"."tenant_accounts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."tenant_accounts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."tenant_accounts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."tenant_accounts_id_seq" OWNED BY "public"."tenant_accounts"."id";



CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "role_id" integer NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_roles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."user_roles_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_roles_id_seq" OWNED BY "public"."user_roles"."id";



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" integer NOT NULL,
    "tenant_id" integer NOT NULL,
    "email" character varying(100) NOT NULL,
    "password_hash" character varying(255) NOT NULL,
    "full_name" character varying(100) NOT NULL,
    "is_active" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_active" timestamp with time zone
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."users_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."users_id_seq" OWNED BY "public"."users"."id";



CREATE TABLE IF NOT EXISTS "public"."vehicles" (
    "id" character varying NOT NULL,
    "client_id" integer NOT NULL,
    "manufacturer" character varying(100) NOT NULL,
    "model" character varying(100) NOT NULL,
    "year" integer NOT NULL,
    "plate_no" character varying(8) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."vehicles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."witnesses" (
    "id" character varying NOT NULL,
    "client_id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "age" double precision NOT NULL,
    "phone" character varying(10) NOT NULL,
    "email" character varying(30) NOT NULL,
    "address" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."witnesses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tenant_acme"."billing_entries" (
    "id" integer NOT NULL,
    "description" character varying(255) NOT NULL,
    "hours" numeric(6,2),
    "rate" numeric(10,2),
    "total_amount" numeric(10,2) NOT NULL,
    "is_paid" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "tenant_acme"."billing_entries" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_acme"."billing_entries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_acme"."billing_entries_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_acme"."billing_entries_id_seq" OWNED BY "tenant_acme"."billing_entries"."id";



CREATE TABLE IF NOT EXISTS "tenant_acme"."clients" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "phone" character varying(50) NOT NULL,
    "email" character varying(100) NOT NULL,
    "address" character varying(250),
    "status" character varying(50) DEFAULT 'active'::character varying,
    "custom_fields" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "tenant_acme"."clients" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_acme"."clients_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_acme"."clients_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_acme"."clients_id_seq" OWNED BY "tenant_acme"."clients"."id";



CREATE TABLE IF NOT EXISTS "tenant_acme"."documents" (
    "id" integer NOT NULL,
    "file_name" character varying(255) NOT NULL,
    "file_path" character varying(500) NOT NULL,
    "file_type" character varying(50),
    "file_category" character varying(50) DEFAULT 'General'::character varying,
    "file_size_bytes" bigint,
    "is_archived" boolean DEFAULT false,
    "uploaded_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "tenant_acme"."documents" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_acme"."documents_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_acme"."documents_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_acme"."documents_id_seq" OWNED BY "tenant_acme"."documents"."id";



CREATE TABLE IF NOT EXISTS "tenant_acme"."insurance_policies" (
    "id" integer NOT NULL,
    "client_id" integer NOT NULL,
    "policy_number" character varying(100) NOT NULL,
    "policy_type" character varying(100) DEFAULT 'General'::character varying,
    "coverage_amount" numeric(12,2),
    "deductible" numeric(10,2) DEFAULT 0.00,
    "status" character varying(50) DEFAULT 'Active'::character varying,
    "start_date" timestamp without time zone,
    "end_date" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "tenant_acme"."insurance_policies" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_acme"."insurance_policies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_acme"."insurance_policies_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_acme"."insurance_policies_id_seq" OWNED BY "tenant_acme"."insurance_policies"."id";



CREATE TABLE IF NOT EXISTS "tenant_acme"."notes" (
    "id" integer NOT NULL,
    "author_name" character varying(100) DEFAULT 'System User'::character varying NOT NULL,
    "note_type" character varying(50) DEFAULT 'General'::character varying,
    "content" "text" NOT NULL,
    "is_pinned" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "tenant_acme"."notes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_acme"."notes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_acme"."notes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_acme"."notes_id_seq" OWNED BY "tenant_acme"."notes"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_a"."billing_entries" (
    "id" integer NOT NULL,
    "description" character varying(255) NOT NULL,
    "hours" numeric(6,2),
    "rate" numeric(10,2),
    "total_amount" numeric(10,2) NOT NULL,
    "is_paid" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "tenant_company_a"."billing_entries" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_a"."billing_entries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_a"."billing_entries_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_a"."billing_entries_id_seq" OWNED BY "tenant_company_a"."billing_entries"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_a"."clients" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "phone" character varying(50) NOT NULL,
    "email" character varying(100) NOT NULL,
    "address" character varying(250),
    "status" character varying(50),
    "custom_fields" "jsonb" NOT NULL
);


ALTER TABLE "tenant_company_a"."clients" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_a"."clients_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_a"."clients_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_a"."clients_id_seq" OWNED BY "tenant_company_a"."clients"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_a"."documents" (
    "id" integer NOT NULL,
    "file_name" character varying(255) NOT NULL,
    "file_path" character varying(500) NOT NULL,
    "file_type" character varying(50),
    "file_category" character varying(50),
    "file_size_bytes" bigint,
    "is_archived" boolean,
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "tenant_company_a"."documents" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_a"."documents_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_a"."documents_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_a"."documents_id_seq" OWNED BY "tenant_company_a"."documents"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_a"."evidences" (
    "id" character varying NOT NULL,
    "client_id" integer NOT NULL,
    "evidence_type" character varying(100) NOT NULL,
    "evidence_detail" character varying(100) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_a"."evidences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tenant_company_a"."insurance_policies" (
    "id" integer NOT NULL,
    "client_id" integer NOT NULL,
    "policy_number" character varying(100) NOT NULL,
    "policy_type" character varying(100),
    "coverage_amount" numeric(12,2),
    "deductible" numeric(10,2),
    "status" character varying(50),
    "start_date" timestamp without time zone,
    "end_date" timestamp without time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_a"."insurance_policies" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_a"."insurance_policies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_a"."insurance_policies_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_a"."insurance_policies_id_seq" OWNED BY "tenant_company_a"."insurance_policies"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_a"."legal_cases" (
    "id" integer NOT NULL,
    "client_id" integer NOT NULL,
    "case_number" character varying(100) NOT NULL,
    "case_type" character varying(100) NOT NULL,
    "court" character varying(255),
    "status" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_a"."legal_cases" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_a"."legal_cases_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_a"."legal_cases_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_a"."legal_cases_id_seq" OWNED BY "tenant_company_a"."legal_cases"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_a"."notes" (
    "id" integer NOT NULL,
    "author_name" character varying(100) NOT NULL,
    "note_type" character varying(50),
    "content" "text" NOT NULL,
    "is_pinned" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "tenant_company_a"."notes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_a"."notes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_a"."notes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_a"."notes_id_seq" OWNED BY "tenant_company_a"."notes"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_a"."properties" (
    "id" character varying NOT NULL,
    "client_id" integer NOT NULL,
    "property_type" character varying(100) NOT NULL,
    "area" double precision NOT NULL,
    "address" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_a"."properties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tenant_company_a"."vehicles" (
    "id" character varying NOT NULL,
    "client_id" integer NOT NULL,
    "manufacturer" character varying(100) NOT NULL,
    "model" character varying(100) NOT NULL,
    "year" integer NOT NULL,
    "plate_no" character varying(8) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_a"."vehicles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tenant_company_a"."witnesses" (
    "id" character varying NOT NULL,
    "client_id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "age" double precision NOT NULL,
    "phone" character varying(10) NOT NULL,
    "email" character varying(30) NOT NULL,
    "address" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_a"."witnesses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tenant_company_b"."billing_entries" (
    "id" integer NOT NULL,
    "description" character varying(255) NOT NULL,
    "hours" numeric(6,2),
    "rate" numeric(10,2),
    "total_amount" numeric(10,2) NOT NULL,
    "is_paid" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "tenant_company_b"."billing_entries" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_b"."billing_entries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_b"."billing_entries_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_b"."billing_entries_id_seq" OWNED BY "tenant_company_b"."billing_entries"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_b"."clients" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "phone" character varying(50) NOT NULL,
    "email" character varying(100) NOT NULL,
    "address" character varying(250),
    "status" character varying(50),
    "custom_fields" "jsonb" NOT NULL
);


ALTER TABLE "tenant_company_b"."clients" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_b"."clients_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_b"."clients_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_b"."clients_id_seq" OWNED BY "tenant_company_b"."clients"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_b"."documents" (
    "id" integer NOT NULL,
    "file_name" character varying(255) NOT NULL,
    "file_path" character varying(500) NOT NULL,
    "file_type" character varying(50),
    "file_category" character varying(50),
    "file_size_bytes" bigint,
    "is_archived" boolean,
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "tenant_company_b"."documents" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_b"."documents_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_b"."documents_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_b"."documents_id_seq" OWNED BY "tenant_company_b"."documents"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_b"."evidences" (
    "id" character varying NOT NULL,
    "client_id" integer NOT NULL,
    "evidence_type" character varying(100) NOT NULL,
    "evidence_detail" character varying(100) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_b"."evidences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tenant_company_b"."insurance_policies" (
    "id" integer NOT NULL,
    "client_id" integer NOT NULL,
    "policy_number" character varying(100) NOT NULL,
    "policy_type" character varying(100),
    "coverage_amount" numeric(12,2),
    "deductible" numeric(10,2),
    "status" character varying(50),
    "start_date" timestamp without time zone,
    "end_date" timestamp without time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_b"."insurance_policies" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_b"."insurance_policies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_b"."insurance_policies_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_b"."insurance_policies_id_seq" OWNED BY "tenant_company_b"."insurance_policies"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_b"."legal_cases" (
    "id" integer NOT NULL,
    "client_id" integer NOT NULL,
    "case_number" character varying(100) NOT NULL,
    "case_type" character varying(100) NOT NULL,
    "court" character varying(255),
    "status" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_b"."legal_cases" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_b"."legal_cases_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_b"."legal_cases_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_b"."legal_cases_id_seq" OWNED BY "tenant_company_b"."legal_cases"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_b"."notes" (
    "id" integer NOT NULL,
    "author_name" character varying(100) NOT NULL,
    "note_type" character varying(50),
    "content" "text" NOT NULL,
    "is_pinned" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "tenant_company_b"."notes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_b"."notes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_b"."notes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_b"."notes_id_seq" OWNED BY "tenant_company_b"."notes"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_b"."properties" (
    "id" character varying NOT NULL,
    "client_id" integer NOT NULL,
    "property_type" character varying(100) NOT NULL,
    "area" double precision NOT NULL,
    "address" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_b"."properties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tenant_company_b"."vehicles" (
    "id" character varying NOT NULL,
    "client_id" integer NOT NULL,
    "manufacturer" character varying(100) NOT NULL,
    "model" character varying(100) NOT NULL,
    "year" integer NOT NULL,
    "plate_no" character varying(8) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_b"."vehicles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tenant_company_b"."witnesses" (
    "id" character varying NOT NULL,
    "client_id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "age" double precision NOT NULL,
    "phone" character varying(10) NOT NULL,
    "email" character varying(30) NOT NULL,
    "address" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_b"."witnesses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tenant_company_c"."billing_entries" (
    "id" integer NOT NULL,
    "description" character varying(255) NOT NULL,
    "hours" numeric(6,2),
    "rate" numeric(10,2),
    "total_amount" numeric(10,2) NOT NULL,
    "is_paid" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "tenant_company_c"."billing_entries" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_c"."billing_entries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_c"."billing_entries_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_c"."billing_entries_id_seq" OWNED BY "tenant_company_c"."billing_entries"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_c"."clients" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "phone" character varying(50) NOT NULL,
    "email" character varying(100) NOT NULL,
    "address" character varying(250),
    "status" character varying(50),
    "custom_fields" "jsonb" NOT NULL
);


ALTER TABLE "tenant_company_c"."clients" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_c"."clients_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_c"."clients_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_c"."clients_id_seq" OWNED BY "tenant_company_c"."clients"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_c"."documents" (
    "id" integer NOT NULL,
    "file_name" character varying(255) NOT NULL,
    "file_path" character varying(500) NOT NULL,
    "file_type" character varying(50),
    "file_category" character varying(50),
    "file_size_bytes" bigint,
    "is_archived" boolean,
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "tenant_company_c"."documents" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_c"."documents_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_c"."documents_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_c"."documents_id_seq" OWNED BY "tenant_company_c"."documents"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_c"."evidences" (
    "id" character varying NOT NULL,
    "client_id" integer NOT NULL,
    "evidence_type" character varying(100) NOT NULL,
    "evidence_detail" character varying(100) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_c"."evidences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tenant_company_c"."insurance_policies" (
    "id" integer NOT NULL,
    "client_id" integer NOT NULL,
    "policy_number" character varying(100) NOT NULL,
    "policy_type" character varying(100),
    "coverage_amount" numeric(12,2),
    "deductible" numeric(10,2),
    "status" character varying(50),
    "start_date" timestamp without time zone,
    "end_date" timestamp without time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_c"."insurance_policies" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_c"."insurance_policies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_c"."insurance_policies_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_c"."insurance_policies_id_seq" OWNED BY "tenant_company_c"."insurance_policies"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_c"."legal_cases" (
    "id" integer NOT NULL,
    "client_id" integer NOT NULL,
    "case_number" character varying(100) NOT NULL,
    "case_type" character varying(100) NOT NULL,
    "court" character varying(255),
    "status" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_c"."legal_cases" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_c"."legal_cases_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_c"."legal_cases_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_c"."legal_cases_id_seq" OWNED BY "tenant_company_c"."legal_cases"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_c"."notes" (
    "id" integer NOT NULL,
    "author_name" character varying(100) NOT NULL,
    "note_type" character varying(50),
    "content" "text" NOT NULL,
    "is_pinned" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "tenant_company_c"."notes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_company_c"."notes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_company_c"."notes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_company_c"."notes_id_seq" OWNED BY "tenant_company_c"."notes"."id";



CREATE TABLE IF NOT EXISTS "tenant_company_c"."properties" (
    "id" character varying NOT NULL,
    "client_id" integer NOT NULL,
    "property_type" character varying(100) NOT NULL,
    "area" double precision NOT NULL,
    "address" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_c"."properties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tenant_company_c"."vehicles" (
    "id" character varying NOT NULL,
    "client_id" integer NOT NULL,
    "manufacturer" character varying(100) NOT NULL,
    "model" character varying(100) NOT NULL,
    "year" integer NOT NULL,
    "plate_no" character varying(8) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_c"."vehicles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tenant_company_c"."witnesses" (
    "id" character varying NOT NULL,
    "client_id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "age" double precision NOT NULL,
    "phone" character varying(10) NOT NULL,
    "email" character varying(30) NOT NULL,
    "address" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tenant_company_c"."witnesses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tenant_yazbak"."billing_entries" (
    "id" integer NOT NULL,
    "description" character varying(255) NOT NULL,
    "hours" numeric(6,2),
    "rate" numeric(10,2),
    "total_amount" numeric(10,2) NOT NULL,
    "is_paid" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "tenant_yazbak"."billing_entries" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_yazbak"."billing_entries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_yazbak"."billing_entries_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_yazbak"."billing_entries_id_seq" OWNED BY "tenant_yazbak"."billing_entries"."id";



CREATE TABLE IF NOT EXISTS "tenant_yazbak"."clients" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "phone" character varying(50) NOT NULL,
    "email" character varying(100) NOT NULL,
    "address" character varying(250),
    "status" character varying(50) DEFAULT 'active'::character varying,
    "custom_fields" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "tenant_yazbak"."clients" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_yazbak"."clients_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_yazbak"."clients_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_yazbak"."clients_id_seq" OWNED BY "tenant_yazbak"."clients"."id";



CREATE TABLE IF NOT EXISTS "tenant_yazbak"."documents" (
    "id" integer NOT NULL,
    "file_name" character varying(255) NOT NULL,
    "file_path" character varying(500) NOT NULL,
    "file_type" character varying(50),
    "file_category" character varying(50) DEFAULT 'General'::character varying,
    "file_size_bytes" bigint,
    "is_archived" boolean DEFAULT false,
    "uploaded_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "tenant_yazbak"."documents" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_yazbak"."documents_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_yazbak"."documents_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_yazbak"."documents_id_seq" OWNED BY "tenant_yazbak"."documents"."id";



CREATE TABLE IF NOT EXISTS "tenant_yazbak"."notes" (
    "id" integer NOT NULL,
    "author_name" character varying(100) DEFAULT 'System User'::character varying NOT NULL,
    "note_type" character varying(50) DEFAULT 'General'::character varying,
    "content" "text" NOT NULL,
    "is_pinned" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "client_id" integer,
    "case_id" integer,
    "policy_id" integer
);


ALTER TABLE "tenant_yazbak"."notes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "tenant_yazbak"."notes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "tenant_yazbak"."notes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "tenant_yazbak"."notes_id_seq" OWNED BY "tenant_yazbak"."notes"."id";



ALTER TABLE ONLY "public"."audit_logs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."audit_logs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."billing_entries" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."billing_entries_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."clients" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."clients_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."documents" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."documents_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."insurance_policies" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."insurance_policies_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."legal_cases" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."legal_cases_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."notes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."roles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."roles_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tenant_accounts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tenant_accounts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_roles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_roles_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."users_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_acme"."billing_entries" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_acme"."billing_entries_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_acme"."clients" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_acme"."clients_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_acme"."documents" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_acme"."documents_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_acme"."insurance_policies" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_acme"."insurance_policies_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_acme"."notes" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_acme"."notes_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_a"."billing_entries" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_a"."billing_entries_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_a"."clients" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_a"."clients_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_a"."documents" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_a"."documents_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_a"."insurance_policies" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_a"."insurance_policies_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_a"."legal_cases" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_a"."legal_cases_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_a"."notes" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_a"."notes_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_b"."billing_entries" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_b"."billing_entries_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_b"."clients" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_b"."clients_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_b"."documents" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_b"."documents_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_b"."insurance_policies" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_b"."insurance_policies_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_b"."legal_cases" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_b"."legal_cases_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_b"."notes" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_b"."notes_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_c"."billing_entries" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_c"."billing_entries_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_c"."clients" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_c"."clients_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_c"."documents" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_c"."documents_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_c"."insurance_policies" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_c"."insurance_policies_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_c"."legal_cases" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_c"."legal_cases_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_company_c"."notes" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_company_c"."notes_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_yazbak"."billing_entries" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_yazbak"."billing_entries_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_yazbak"."clients" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_yazbak"."clients_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_yazbak"."documents" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_yazbak"."documents_id_seq"'::"regclass");



ALTER TABLE ONLY "tenant_yazbak"."notes" ALTER COLUMN "id" SET DEFAULT "nextval"('"tenant_yazbak"."notes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("username");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."billing_entries"
    ADD CONSTRAINT "billing_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evidences"
    ADD CONSTRAINT "evidences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."insurance_policies"
    ADD CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."legal_cases"
    ADD CONSTRAINT "legal_cases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenant_accounts"
    ADD CONSTRAINT "tenant_accounts_company_name_key" UNIQUE ("company_name");



ALTER TABLE ONLY "public"."tenant_accounts"
    ADD CONSTRAINT "tenant_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."witnesses"
    ADD CONSTRAINT "witnesses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_acme"."billing_entries"
    ADD CONSTRAINT "billing_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_acme"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_acme"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_acme"."insurance_policies"
    ADD CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_acme"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_a"."billing_entries"
    ADD CONSTRAINT "billing_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_a"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_a"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_a"."evidences"
    ADD CONSTRAINT "evidences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_a"."insurance_policies"
    ADD CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_a"."legal_cases"
    ADD CONSTRAINT "legal_cases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_a"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_a"."properties"
    ADD CONSTRAINT "properties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_a"."vehicles"
    ADD CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_a"."witnesses"
    ADD CONSTRAINT "witnesses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_b"."billing_entries"
    ADD CONSTRAINT "billing_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_b"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_b"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_b"."evidences"
    ADD CONSTRAINT "evidences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_b"."insurance_policies"
    ADD CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_b"."legal_cases"
    ADD CONSTRAINT "legal_cases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_b"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_b"."properties"
    ADD CONSTRAINT "properties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_b"."vehicles"
    ADD CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_b"."witnesses"
    ADD CONSTRAINT "witnesses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_c"."billing_entries"
    ADD CONSTRAINT "billing_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_c"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_c"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_c"."evidences"
    ADD CONSTRAINT "evidences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_c"."insurance_policies"
    ADD CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_c"."legal_cases"
    ADD CONSTRAINT "legal_cases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_c"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_c"."properties"
    ADD CONSTRAINT "properties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_c"."vehicles"
    ADD CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_company_c"."witnesses"
    ADD CONSTRAINT "witnesses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_yazbak"."billing_entries"
    ADD CONSTRAINT "billing_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_yazbak"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_yazbak"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tenant_yazbak"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");



CREATE INDEX "ix_billing_entries_id" ON "public"."billing_entries" USING "btree" ("id");



CREATE INDEX "ix_clients_id" ON "public"."clients" USING "btree" ("id");



CREATE INDEX "ix_clients_name" ON "public"."clients" USING "btree" ("name");



CREATE INDEX "ix_documents_id" ON "public"."documents" USING "btree" ("id");



CREATE INDEX "ix_insurance_policies_id" ON "public"."insurance_policies" USING "btree" ("id");



CREATE INDEX "ix_insurance_policies_policy_number" ON "public"."insurance_policies" USING "btree" ("policy_number");



CREATE INDEX "ix_legal_cases_case_number" ON "public"."legal_cases" USING "btree" ("case_number");



CREATE INDEX "ix_legal_cases_id" ON "public"."legal_cases" USING "btree" ("id");



CREATE INDEX "ix_notes_id" ON "public"."notes" USING "btree" ("id");



CREATE INDEX "ix_public_admins_username" ON "public"."admins" USING "btree" ("username");



CREATE INDEX "ix_public_audit_logs_id" ON "public"."audit_logs" USING "btree" ("id");



CREATE INDEX "ix_public_audit_logs_tenant_id" ON "public"."audit_logs" USING "btree" ("tenant_id");



CREATE INDEX "ix_public_tenant_accounts_id" ON "public"."tenant_accounts" USING "btree" ("id");



CREATE INDEX "ix_roles_id" ON "public"."roles" USING "btree" ("id");



CREATE INDEX "ix_user_roles_id" ON "public"."user_roles" USING "btree" ("id");



CREATE INDEX "ix_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "ix_users_id" ON "public"."users" USING "btree" ("id");



CREATE INDEX "ix_users_tenant_id" ON "public"."users" USING "btree" ("tenant_id");



CREATE INDEX "ix_billing_entries_id" ON "tenant_company_a"."billing_entries" USING "btree" ("id");



CREATE INDEX "ix_clients_id" ON "tenant_company_a"."clients" USING "btree" ("id");



CREATE INDEX "ix_clients_name" ON "tenant_company_a"."clients" USING "btree" ("name");



CREATE INDEX "ix_documents_id" ON "tenant_company_a"."documents" USING "btree" ("id");



CREATE INDEX "ix_insurance_policies_id" ON "tenant_company_a"."insurance_policies" USING "btree" ("id");



CREATE INDEX "ix_insurance_policies_policy_number" ON "tenant_company_a"."insurance_policies" USING "btree" ("policy_number");



CREATE INDEX "ix_legal_cases_case_number" ON "tenant_company_a"."legal_cases" USING "btree" ("case_number");



CREATE INDEX "ix_legal_cases_id" ON "tenant_company_a"."legal_cases" USING "btree" ("id");



CREATE INDEX "ix_notes_id" ON "tenant_company_a"."notes" USING "btree" ("id");



CREATE INDEX "ix_billing_entries_id" ON "tenant_company_b"."billing_entries" USING "btree" ("id");



CREATE INDEX "ix_clients_id" ON "tenant_company_b"."clients" USING "btree" ("id");



CREATE INDEX "ix_clients_name" ON "tenant_company_b"."clients" USING "btree" ("name");



CREATE INDEX "ix_documents_id" ON "tenant_company_b"."documents" USING "btree" ("id");



CREATE INDEX "ix_insurance_policies_id" ON "tenant_company_b"."insurance_policies" USING "btree" ("id");



CREATE INDEX "ix_insurance_policies_policy_number" ON "tenant_company_b"."insurance_policies" USING "btree" ("policy_number");



CREATE INDEX "ix_legal_cases_case_number" ON "tenant_company_b"."legal_cases" USING "btree" ("case_number");



CREATE INDEX "ix_legal_cases_id" ON "tenant_company_b"."legal_cases" USING "btree" ("id");



CREATE INDEX "ix_notes_id" ON "tenant_company_b"."notes" USING "btree" ("id");



CREATE INDEX "ix_billing_entries_id" ON "tenant_company_c"."billing_entries" USING "btree" ("id");



CREATE INDEX "ix_clients_id" ON "tenant_company_c"."clients" USING "btree" ("id");



CREATE INDEX "ix_clients_name" ON "tenant_company_c"."clients" USING "btree" ("name");



CREATE INDEX "ix_documents_id" ON "tenant_company_c"."documents" USING "btree" ("id");



CREATE INDEX "ix_insurance_policies_id" ON "tenant_company_c"."insurance_policies" USING "btree" ("id");



CREATE INDEX "ix_insurance_policies_policy_number" ON "tenant_company_c"."insurance_policies" USING "btree" ("policy_number");



CREATE INDEX "ix_legal_cases_case_number" ON "tenant_company_c"."legal_cases" USING "btree" ("case_number");



CREATE INDEX "ix_legal_cases_id" ON "tenant_company_c"."legal_cases" USING "btree" ("id");



CREATE INDEX "ix_notes_id" ON "tenant_company_c"."notes" USING "btree" ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant_accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."billing_entries"
    ADD CONSTRAINT "billing_entries_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."legal_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."billing_entries"
    ADD CONSTRAINT "billing_entries_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."billing_entries"
    ADD CONSTRAINT "billing_entries_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "public"."insurance_policies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."legal_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "public"."insurance_policies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evidences"
    ADD CONSTRAINT "evidences_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."insurance_policies"
    ADD CONSTRAINT "insurance_policies_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."legal_cases"
    ADD CONSTRAINT "legal_cases_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."legal_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "public"."insurance_policies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant_accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."witnesses"
    ADD CONSTRAINT "witnesses_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_acme"."billing_entries"
    ADD CONSTRAINT "billing_entries_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_acme"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_acme"."billing_entries"
    ADD CONSTRAINT "billing_entries_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "tenant_acme"."insurance_policies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_acme"."documents"
    ADD CONSTRAINT "documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_acme"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_acme"."documents"
    ADD CONSTRAINT "documents_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "tenant_acme"."insurance_policies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_acme"."insurance_policies"
    ADD CONSTRAINT "insurance_policies_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_acme"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_acme"."notes"
    ADD CONSTRAINT "notes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_acme"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_acme"."notes"
    ADD CONSTRAINT "notes_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "tenant_acme"."insurance_policies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_a"."billing_entries"
    ADD CONSTRAINT "billing_entries_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "tenant_company_a"."legal_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_a"."billing_entries"
    ADD CONSTRAINT "billing_entries_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_a"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_a"."billing_entries"
    ADD CONSTRAINT "billing_entries_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "tenant_company_a"."insurance_policies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_a"."documents"
    ADD CONSTRAINT "documents_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "tenant_company_a"."legal_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_a"."documents"
    ADD CONSTRAINT "documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_a"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_a"."documents"
    ADD CONSTRAINT "documents_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "tenant_company_a"."insurance_policies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_a"."evidences"
    ADD CONSTRAINT "evidences_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_a"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_a"."insurance_policies"
    ADD CONSTRAINT "insurance_policies_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_a"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_a"."legal_cases"
    ADD CONSTRAINT "legal_cases_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_a"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_a"."notes"
    ADD CONSTRAINT "notes_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "tenant_company_a"."legal_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_a"."notes"
    ADD CONSTRAINT "notes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_a"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_a"."notes"
    ADD CONSTRAINT "notes_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "tenant_company_a"."insurance_policies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_a"."properties"
    ADD CONSTRAINT "properties_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_a"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_a"."vehicles"
    ADD CONSTRAINT "vehicles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_a"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_a"."witnesses"
    ADD CONSTRAINT "witnesses_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_a"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_b"."billing_entries"
    ADD CONSTRAINT "billing_entries_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "tenant_company_b"."legal_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_b"."billing_entries"
    ADD CONSTRAINT "billing_entries_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_b"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_b"."billing_entries"
    ADD CONSTRAINT "billing_entries_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "tenant_company_b"."insurance_policies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_b"."documents"
    ADD CONSTRAINT "documents_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "tenant_company_b"."legal_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_b"."documents"
    ADD CONSTRAINT "documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_b"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_b"."documents"
    ADD CONSTRAINT "documents_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "tenant_company_b"."insurance_policies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_b"."evidences"
    ADD CONSTRAINT "evidences_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_b"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_b"."insurance_policies"
    ADD CONSTRAINT "insurance_policies_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_b"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_b"."legal_cases"
    ADD CONSTRAINT "legal_cases_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_b"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_b"."notes"
    ADD CONSTRAINT "notes_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "tenant_company_b"."legal_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_b"."notes"
    ADD CONSTRAINT "notes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_b"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_b"."notes"
    ADD CONSTRAINT "notes_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "tenant_company_b"."insurance_policies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_b"."properties"
    ADD CONSTRAINT "properties_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_b"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_b"."vehicles"
    ADD CONSTRAINT "vehicles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_b"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_b"."witnesses"
    ADD CONSTRAINT "witnesses_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_b"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_c"."billing_entries"
    ADD CONSTRAINT "billing_entries_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "tenant_company_c"."legal_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_c"."billing_entries"
    ADD CONSTRAINT "billing_entries_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_c"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_c"."billing_entries"
    ADD CONSTRAINT "billing_entries_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "tenant_company_c"."insurance_policies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_c"."documents"
    ADD CONSTRAINT "documents_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "tenant_company_c"."legal_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_c"."documents"
    ADD CONSTRAINT "documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_c"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_c"."documents"
    ADD CONSTRAINT "documents_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "tenant_company_c"."insurance_policies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_c"."evidences"
    ADD CONSTRAINT "evidences_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_c"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_c"."insurance_policies"
    ADD CONSTRAINT "insurance_policies_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_c"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_c"."legal_cases"
    ADD CONSTRAINT "legal_cases_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_c"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_c"."notes"
    ADD CONSTRAINT "notes_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "tenant_company_c"."legal_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_c"."notes"
    ADD CONSTRAINT "notes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_c"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_c"."notes"
    ADD CONSTRAINT "notes_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "tenant_company_c"."insurance_policies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_c"."properties"
    ADD CONSTRAINT "properties_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_c"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_c"."vehicles"
    ADD CONSTRAINT "vehicles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_c"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_company_c"."witnesses"
    ADD CONSTRAINT "witnesses_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_company_c"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_yazbak"."billing_entries"
    ADD CONSTRAINT "billing_entries_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_yazbak"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_yazbak"."documents"
    ADD CONSTRAINT "documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_yazbak"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tenant_yazbak"."notes"
    ADD CONSTRAINT "notes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tenant_yazbak"."clients"("id") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;





































































































































































































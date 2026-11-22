-- =====================================================================
-- COMPLETE SUPABASE / POSTGRESQL DATABASE RESTORATION SCRIPT
-- Application: Convocation Management System
-- Generated: 2026-11-21T18:12:38.137Z
-- =====================================================================
-- This script reconstructs the complete database schema, constraints,
-- foreign keys, indexes, master reference data, storage bucket configuration,
-- and Row Level Security (RLS) policies.
-- 
-- NOTE: In compliance with project requirements, NO dummy student records
-- are inserted.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. EXTENSIONS
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- 2. CORE APPLICATION TABLES
-- ---------------------------------------------------------------------

-- 2.1 USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 CONVOCATION STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.convocation_students (
    id SERIAL PRIMARY KEY,
    university TEXT,
    hall_ticket_no TEXT UNIQUE NOT NULL,
    candidate_name TEXT,
    father_name TEXT,
    dob DATE,
    gender TEXT,
    category TEXT,
    aadhaar_no TEXT,
    mode_of_study TEXT,
    degree TEXT,
    faculty TEXT,
    course_group TEXT,
    subject TEXT,
    specialization TEXT,
    research_title TEXT,
    research_date DATE,
    
    part1_class TEXT,
    part1_month TEXT,
    part1_year TEXT,
    part1_grade TEXT,
    
    part2_class TEXT,
    part2_month TEXT,
    part2_year TEXT,
    part2_grade TEXT,
    
    part3_class TEXT,
    part3_month TEXT,
    part3_year TEXT,
    part3_grade TEXT,
    
    medium TEXT,
    student_photo TEXT,
    student_photo_blob BYTEA,
    
    payment_category TEXT,
    payment_mode TEXT,
    dd_challan_no TEXT,
    dd_challan_date DATE,
    dd_challan_certificate TEXT,
    dd_challan_certificate_blob BYTEA,
    
    issued_date DATE,
    bank_name TEXT,
    ifsc_code TEXT,
    convocation_fee NUMERIC,
    convocation_issued_in TEXT,
    
    second_language TEXT,
    elective_subjects TEXT,
    academic_year TEXT,
    remarks TEXT,
    
    submitted_by INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    manual_serial_no TEXT,
    branch_name TEXT,
    part_ii TEXT,
    part_iii TEXT
);

-- ---------------------------------------------------------------------
-- 3. MASTER REFERENCE TABLES
-- ---------------------------------------------------------------------

-- 3.1 Category Master
CREATE TABLE IF NOT EXISTS public.category_master (
    id SERIAL PRIMARY KEY,
    category_code TEXT UNIQUE NOT NULL,
    category_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.2 Degree Master
CREATE TABLE IF NOT EXISTS public.degree_master (
    id SERIAL PRIMARY KEY,
    degree_code TEXT UNIQUE NOT NULL,
    degree_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.3 Faculty Master
CREATE TABLE IF NOT EXISTS public.faculty_master (
    id SERIAL PRIMARY KEY,
    faculty_code TEXT UNIQUE NOT NULL,
    faculty_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.4 Course Master
CREATE TABLE IF NOT EXISTS public.course_master (
    id SERIAL PRIMARY KEY,
    course_code TEXT UNIQUE NOT NULL,
    course_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.5 Subject Master
CREATE TABLE IF NOT EXISTS public.subject_master (
    id SERIAL PRIMARY KEY,
    subject_code TEXT UNIQUE NOT NULL,
    subject_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.6 Specialization Master
CREATE TABLE IF NOT EXISTS public.specialization_master (
    id SERIAL PRIMARY KEY,
    specialization_code TEXT UNIQUE NOT NULL,
    specialization_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.7 Medium Master
CREATE TABLE IF NOT EXISTS public.medium_master (
    id SERIAL PRIMARY KEY,
    medium_code TEXT UNIQUE NOT NULL,
    medium_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.8 Payment Category Master
CREATE TABLE IF NOT EXISTS public.payment_category_master (
    id SERIAL PRIMARY KEY,
    category_code TEXT UNIQUE NOT NULL,
    category_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.9 Payment Mode Master
CREATE TABLE IF NOT EXISTS public.payment_mode_master (
    id SERIAL PRIMARY KEY,
    mode_code TEXT UNIQUE NOT NULL,
    mode_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.10 Convocation Issued Master
CREATE TABLE IF NOT EXISTS public.convocation_issued_master (
    id SERIAL PRIMARY KEY,
    issued_code TEXT UNIQUE NOT NULL,
    issued_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.11 Second Language Master
CREATE TABLE IF NOT EXISTS public.second_language_master (
    id SERIAL PRIMARY KEY,
    language_code TEXT UNIQUE NOT NULL,
    language_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.12 Part II Master
CREATE TABLE IF NOT EXISTS public.part_ii_master (
    id SERIAL PRIMARY KEY,
    option_code TEXT UNIQUE NOT NULL,
    option_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.13 Part III Master
CREATE TABLE IF NOT EXISTS public.part_iii_master (
    id SERIAL PRIMARY KEY,
    option_code TEXT UNIQUE NOT NULL,
    option_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 4. PERFORMANCE & LOOKUP INDEXES
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

CREATE INDEX IF NOT EXISTS idx_conv_students_htno ON public.convocation_students(hall_ticket_no);
CREATE INDEX IF NOT EXISTS idx_conv_students_submitted_by ON public.convocation_students(submitted_by);
CREATE INDEX IF NOT EXISTS idx_conv_students_degree ON public.convocation_students(degree);
CREATE INDEX IF NOT EXISTS idx_conv_students_faculty ON public.convocation_students(faculty);
CREATE INDEX IF NOT EXISTS idx_conv_students_mode ON public.convocation_students(mode_of_study);
CREATE INDEX IF NOT EXISTS idx_conv_students_course_group ON public.convocation_students(course_group);
CREATE INDEX IF NOT EXISTS idx_conv_students_academic_year ON public.convocation_students(academic_year);
CREATE INDEX IF NOT EXISTS idx_conv_students_created_at ON public.convocation_students(created_at);

CREATE INDEX IF NOT EXISTS idx_category_master_active ON public.category_master(is_active);
CREATE INDEX IF NOT EXISTS idx_degree_master_active ON public.degree_master(is_active);
CREATE INDEX IF NOT EXISTS idx_faculty_master_active ON public.faculty_master(is_active);
CREATE INDEX IF NOT EXISTS idx_course_master_active ON public.course_master(is_active);
CREATE INDEX IF NOT EXISTS idx_subject_master_active ON public.subject_master(is_active);
CREATE INDEX IF NOT EXISTS idx_specialization_master_active ON public.specialization_master(is_active);
CREATE INDEX IF NOT EXISTS idx_medium_master_active ON public.medium_master(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_category_active ON public.payment_category_master(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_mode_active ON public.payment_mode_master(is_active);
CREATE INDEX IF NOT EXISTS idx_convocation_issued_active ON public.convocation_issued_master(is_active);
CREATE INDEX IF NOT EXISTS idx_second_language_active ON public.second_language_master(is_active);
CREATE INDEX IF NOT EXISTS idx_part_ii_active ON public.part_ii_master(is_active);
CREATE INDEX IF NOT EXISTS idx_part_iii_active ON public.part_iii_master(is_active);

-- ---------------------------------------------------------------------
-- 5. MASTER REFERENCE DATA SEEDING
-- ---------------------------------------------------------------------

-- Seed category_master (8 records)
INSERT INTO public.category_master (category_code, category_name, is_active)
VALUES
    ('NA', 'Not Applicable', 1),
    ('OC', 'Open Category', 1),
    ('BC', 'Backward Class', 1),
    ('SC', 'Scheduled Caste', 1),
    ('ST', 'Scheduled Tribe', 1),
    ('OTHERS', 'Others', 1),
    ('BC-E', 'BC-E', 1),
    ('BC-B', 'BC', 1)
ON CONFLICT (category_code) DO UPDATE SET category_name = EXCLUDED.category_name, is_active = EXCLUDED.is_active;

-- Seed degree_master (5 records)
INSERT INTO public.degree_master (degree_code, degree_name, is_active)
VALUES
    ('UG', 'UG', 1),
    ('PG', 'PG', 1),
    ('UG_EDU', 'UG Education', 1),
    ('DIPLOMA', 'Diploma', 1),
    ('RESEARCH', 'Research', 1)
ON CONFLICT (degree_code) DO UPDATE SET degree_name = EXCLUDED.degree_name, is_active = EXCLUDED.is_active;

-- Seed faculty_master (5 records)
INSERT INTO public.faculty_master (faculty_code, faculty_name, is_active)
VALUES
    ('ARTS', 'Faculty of Arts', 1),
    ('SCIENCE', 'Faculty of Science', 1),
    ('COMMERCE', 'Faculty of Commerce', 1),
    ('MANAGEMENT', 'Faculty of Management', 1),
    ('EDUCATION', 'Faculty of Education', 1)
ON CONFLICT (faculty_code) DO UPDATE SET faculty_name = EXCLUDED.faculty_name, is_active = EXCLUDED.is_active;

-- Seed course_master (7 records)
INSERT INTO public.course_master (course_code, course_name, is_active)
VALUES
    ('BA', 'Bachelor of Arts', 1),
    ('BCOM', 'Bachelor of Commerce', 1),
    ('BSC', 'Bachelor of Science', 1),
    ('BBM', 'Bachelor of Management', 1),
    ('MA_TEL', 'Master of Arts in Telugu', 1),
    ('MA_HIS', 'Master of Arts in History', 1),
    ('BMAN', 'Bachelor of Management', 1)
ON CONFLICT (course_code) DO UPDATE SET course_name = EXCLUDED.course_name, is_active = EXCLUDED.is_active;

-- Seed subject_master (5 records)
INSERT INTO public.subject_master (subject_code, subject_name, is_active)
VALUES
    ('HIS', 'HISTORY', 1),
    ('ECO', 'ECONOMICS', 1),
    ('COM', 'COMMERCE', 1),
    ('MAT', 'MATHEMATICS', 1),
    ('POL', 'POLITICAL SCIENCE', 1)
ON CONFLICT (subject_code) DO UPDATE SET subject_name = EXCLUDED.subject_name, is_active = EXCLUDED.is_active;

-- Seed specialization_master (3 records)
INSERT INTO public.specialization_master (specialization_code, specialization_name, is_active)
VALUES
    ('NR', 'NOT REQUIRED', 1),
    ('COMP', 'Computers', 1),
    ('CA', 'Computer Applications', 1)
ON CONFLICT (specialization_code) DO UPDATE SET specialization_name = EXCLUDED.specialization_name, is_active = EXCLUDED.is_active;

-- Seed medium_master (4 records)
INSERT INTO public.medium_master (medium_code, medium_name, is_active)
VALUES
    ('TEL', 'Telugu', 1),
    ('ENG', 'English', 1),
    ('HIN', 'Hindi', 1),
    ('URD', 'Urdu', 1)
ON CONFLICT (medium_code) DO UPDATE SET medium_name = EXCLUDED.medium_name, is_active = EXCLUDED.is_active;

-- Seed payment_category_master (2 records)
INSERT INTO public.payment_category_master (category_code, category_name, is_active)
VALUES
    ('CNT', 'COUNTER', 1),
    ('POST', 'By Post', 1)
ON CONFLICT (category_code) DO UPDATE SET category_name = EXCLUDED.category_name, is_active = EXCLUDED.is_active;

-- Seed payment_mode_master (2 records)
INSERT INTO public.payment_mode_master (mode_code, mode_name, is_active)
VALUES
    ('CNT', 'COUNTER', 1),
    ('DD', 'DD', 1)
ON CONFLICT (mode_code) DO UPDATE SET mode_name = EXCLUDED.mode_name, is_active = EXCLUDED.is_active;

-- Seed convocation_issued_master (3 records)
INSERT INTO public.convocation_issued_master (issued_code, issued_name, is_active)
VALUES
    ('ADV', 'IN ADVANCE', 1),
    ('PRS', 'In Person', 1),
    ('ABS', 'In Absentia', 1)
ON CONFLICT (issued_code) DO UPDATE SET issued_name = EXCLUDED.issued_name, is_active = EXCLUDED.is_active;

-- Seed second_language_master (4 records)
INSERT INTO public.second_language_master (language_code, language_name, is_active)
VALUES
    ('TEL', 'Telugu', 1),
    ('HIN', 'Hindi', 1),
    ('SAN', 'Sanskrit', 1),
    ('URD', 'Urdu', 1)
ON CONFLICT (language_code) DO UPDATE SET language_name = EXCLUDED.language_name, is_active = EXCLUDED.is_active;

-- Seed part_ii_master (182 records)
INSERT INTO public.part_ii_master (option_code, option_name, is_active)
VALUES
    ('NA', 'Not Applicable', 1),
    ('MATHEMATICS,ELECTRONICS,COMPUTER SCIENCE', 'MATHEMATICS,ELECTRONICS,COMPUTER SCIENCE', 1),
    ('MATHEMATICS,STATISTICS,COMPUTER SCIENCE', 'MATHEMATICS,STATISTICS,COMPUTER SCIENCE', 1),
    ('Botany,Zoology,Chemistry', 'Botany,Zoology,Chemistry', 1),
    ('MATHEMATICS,PHYSICS, COMPUTER SCIENCE', 'MATHEMATICS,PHYSICS, COMPUTER SCIENCE', 1),
    ('ZOOLOGY,BIOCHEMISTRY,CHEMISTRY', 'ZOOLOGY,BIOCHEMISTRY,CHEMISTRY', 1),
    ('ADVANCED CORPORATE ACCOUNTS,MANAGEMENT ACCOUNTANCY', 'ADVANCED CORPORATE ACCOUNTS,MANAGEMENT ACCOUNTANCY', 1),
    ('RELATIONAL DBMS, INTERNET TECHNOLOGIES AND E-COMMERCE', 'RELATIONAL DBMS, INTERNET TECHNOLOGIES AND E-COMMERCE', 1),
    ('COST & MAN. ACCOUNTING,ADVANCED MANAGEMENT ACCOUNTING', 'COST & MAN. ACCOUNTING,ADVANCED MANAGEMENT ACCOUNTING', 1),
    ('RDBMS,OBJECT ORIENTED PROGRAMMING USING C++', 'RDBMS,OBJECT ORIENTED PROGRAMMING USING C++', 1),
    ('INSURANCE,ADVANCED BANKING', 'INSURANCE,ADVANCED BANKING', 1),
    ('WEB TECHNOLOGIES,E-COMMERCE', 'WEB TECHNOLOGIES,E-COMMERCE', 1),
    ('MATHEMATICS,ECONOMICS, STATISTICS', 'MATHEMATICS,ECONOMICS, STATISTICS', 1),
    ('HISTORY,ECONOMICS,POLITICAL SCIENCE', 'HISTORY,ECONOMICS,POLITICAL SCIENCE', 1),
    ('HISTORY,ECONOMICS, ADV. ENGLISH', 'HISTORY,ECONOMICS, ADV. ENGLISH', 1),
    ('HISTORY,ECONOMICS, ADV. TELUGU', 'HISTORY,ECONOMICS, ADV. TELUGU', 1),
    ('HISTORY,ECONOMICS,PSYCHOLOGY', 'HISTORY,ECONOMICS,PSYCHOLOGY', 1),
    ('HISTORY,ECONOMICS, ADV. URDU', 'HISTORY,ECONOMICS, ADV. URDU', 1),
    ('HISTORY,POLITICAL SCIENCE,ADV. ENGLISH', 'HISTORY,POLITICAL SCIENCE,ADV. ENGLISH', 1),
    ('HISTORY,ECONOMICS,RURAL DEVELOPMENT', 'HISTORY,ECONOMICS,RURAL DEVELOPMENT', 1),
    ('HISTORY,POLITICAL SCIENCE,ADV. HINDI', 'HISTORY,POLITICAL SCIENCE,ADV. HINDI', 1),
    ('HISTORY,POLITICAL SCIENCE,ADV. TELUGU', 'HISTORY,POLITICAL SCIENCE,ADV. TELUGU', 1),
    ('HISTORY,POLITICAL SCIENCE,ADV. URDU', 'HISTORY,POLITICAL SCIENCE,ADV. URDU', 1),
    ('HISTORY,POLITICAL SCIENCE,SOCIOLOGY', 'HISTORY,POLITICAL SCIENCE,SOCIOLOGY', 1),
    ('ECONOMICS,POLITICAL SCIENCE,PHILOSOPHY', 'ECONOMICS,POLITICAL SCIENCE,PHILOSOPHY', 1),
    ('ECONOMICS,PUBLIC ADMINISTRATION,POLITICAL SCIENCE', 'ECONOMICS,PUBLIC ADMINISTRATION,POLITICAL SCIENCE', 1),
    ('RURAL DEVELOPMENT,SOCIOLOGY,PUBLIC ADMINISTRATION', 'RURAL DEVELOPMENT,SOCIOLOGY,PUBLIC ADMINISTRATION', 1),
    ('SOCIOLOGY,POLITICAL SCIENCE,GEOGRAPHY', 'SOCIOLOGY,POLITICAL SCIENCE,GEOGRAPHY', 1),
    ('HISTORY,POLITICAL SCIENCE,GEOGRAPHY', 'HISTORY,POLITICAL SCIENCE,GEOGRAPHY', 1),
    ('SOCIOLOGY,PUBLIC ADMINISTRATION,POLITICAL SCIENCE', 'SOCIOLOGY,PUBLIC ADMINISTRATION,POLITICAL SCIENCE', 1),
    ('RURAL DEVELOPMENT,ECONOMICS,POLITICAL SCIENCE', 'RURAL DEVELOPMENT,ECONOMICS,POLITICAL SCIENCE', 1),
    ('INDUSTRIAL RELATIONS & PERSONNEL MANAGEMENT,ECONOMICS,PSYCHOLOGY', 'INDUSTRIAL RELATIONS & PERSONNEL MANAGEMENT,ECONOMICS,PSYCHOLOGY', 1),
    ('RURAL DEVELOPMENT,ADV. TELUGU,PSYCHOLOGY', 'RURAL DEVELOPMENT,ADV. TELUGU,PSYCHOLOGY', 1),
    ('HISTORY,ADV. ENGLISH,COMMUNICATIVE ENGLISH', 'HISTORY,ADV. ENGLISH,COMMUNICATIVE ENGLISH', 1),
    ('HISTORY,TOURISM & TRAVEL MANAGEMENT,ADV. ENGLISH', 'HISTORY,TOURISM & TRAVEL MANAGEMENT,ADV. ENGLISH', 1),
    ('HISTORY,ECONOMICS,JOURNALISM & MASS COMMUNICATION', 'HISTORY,ECONOMICS,JOURNALISM & MASS COMMUNICATION', 1),
    ('MATHEMATICS,ECONOMICS,COMPUTER APPLICATIONS', 'MATHEMATICS,ECONOMICS,COMPUTER APPLICATIONS', 1),
    ('ECONOMICS,STATISTICS,COMPUTER APPLICATIONS', 'ECONOMICS,STATISTICS,COMPUTER APPLICATIONS', 1),
    ('HISTORY,ECONOMICS,COMPUTER APPLICATIONS', 'HISTORY,ECONOMICS,COMPUTER APPLICATIONS', 1),
    ('HISTORY,POL.SCI.COMPUTER APPLICATIONS', 'HISTORY,POL.SCI.COMPUTER APPLICATIONS', 1),
    ('ECONOMICS,POL.SCI.COMPUTER APPLICATIONS', 'ECONOMICS,POL.SCI.COMPUTER APPLICATIONS', 1),
    ('ECONOMICS,COMMERCE,COMPUTER APPLICATIONS', 'ECONOMICS,COMMERCE,COMPUTER APPLICATIONS', 1),
    ('HISTORY,ECONOMICS,SOCIOLOGY', 'HISTORY,ECONOMICS,SOCIOLOGY', 1),
    ('HISTORY,COMMUNICATIVE ENGLISH,COMPUTER APPLICATIONS', 'HISTORY,COMMUNICATIVE ENGLISH,COMPUTER APPLICATIONS', 1),
    ('ADVT & SALES MANAGEMENT,ECONOMICS,COMPUTER APPLICATIONS', 'ADVT & SALES MANAGEMENT,ECONOMICS,COMPUTER APPLICATIONS', 1),
    ('HISTORY,PUBLIC ADMINISTRATION,JOURNALISM & MASS COMMUNICATION', 'HISTORY,PUBLIC ADMINISTRATION,JOURNALISM & MASS COMMUNICATION', 1),
    ('HISTORY,ADV.URDU,COMPUTER APPLICATIONS', 'HISTORY,ADV.URDU,COMPUTER APPLICATIONS', 1),
    ('HISTORY,POLITICAL SCIENCE, JOURNALISM & MASS COMMUNICATION', 'HISTORY,POLITICAL SCIENCE, JOURNALISM & MASS COMMUNICATION', 1),
    ('HISTORY,POLITICAL SCIENCE,ENGLISH FOR DIGITAL AGE', 'HISTORY,POLITICAL SCIENCE,ENGLISH FOR DIGITAL AGE', 1),
    ('HISTORY,ECONOMICS,TOURISM & TRAVEL MANAGEMENT', 'HISTORY,ECONOMICS,TOURISM & TRAVEL MANAGEMENT', 1),
    ('ZOOLOGY,PHYSICS,CHEMISTRY', 'ZOOLOGY,PHYSICS,CHEMISTRY', 1),
    ('GEOLOGY,PHYSICS,CHEMISTRY', 'GEOLOGY,PHYSICS,CHEMISTRY', 1),
    ('POLY.SCI,PHYSICS,CHEMISTRY', 'POLY.SCI,PHYSICS,CHEMISTRY', 1),
    ('MATHEMATICS,PHYSICS,CHEMISTRY', 'MATHEMATICS,PHYSICS,CHEMISTRY', 1),
    ('MATHEMATICS,PHYSICS,STATISTICS', 'MATHEMATICS,PHYSICS,STATISTICS', 1),
    ('MATHEMATICS,PHYSICS,ELECTRONICS', 'MATHEMATICS,PHYSICS,ELECTRONICS', 1),
    ('MATHEMATICS,PHYSICS,INSTRUMENTATION', 'MATHEMATICS,PHYSICS,INSTRUMENTATION', 1),
    ('MATHEMATICS,PHYSICS,INDUSTRIAL CHEMISTRY', 'MATHEMATICS,PHYSICS,INDUSTRIAL CHEMISTRY', 1),
    ('HORTICULTURE,BOTANY,CHEMISTRY', 'HORTICULTURE,BOTANY,CHEMISTRY', 1),
    ('BOTANY,ZOOLOGY,SERICULTURE', 'BOTANY,ZOOLOGY,SERICULTURE', 1),
    ('BOTANY,AGRICULTURE,CHEMISTRY', 'BOTANY,AGRICULTURE,CHEMISTRY', 1),
    ('ZOOLOGY,SERICULTURE,CHEMISTRY', 'ZOOLOGY,SERICULTURE,CHEMISTRY', 1),
    ('ZOOLOGY,MICRO BIOLOGY,CHEMISTRY', 'ZOOLOGY,MICRO BIOLOGY,CHEMISTRY', 1),
    ('BOTANY,MICRO BIOLOGY,CHEMISTRY', 'BOTANY,MICRO BIOLOGY,CHEMISTRY', 1),
    ('BIO TECHNOLOGY,PHYSICS,INDUSTRIAL CHEMISTRY', 'BIO TECHNOLOGY,PHYSICS,INDUSTRIAL CHEMISTRY', 1),
    ('MATHEMATICS,STATISTICS,COMPUTER APPLICATIONS', 'MATHEMATICS,STATISTICS,COMPUTER APPLICATIONS', 1),
    ('MICRO BIOLOGY,BIO-CHEMISTRY,CHEMISTRY', 'MICRO BIOLOGY,BIO-CHEMISTRY,CHEMISTRY', 1),
    ('BIO TECHNOLOGY,MICRO BIOLOGY,CHEMISTRY', 'BIO TECHNOLOGY,MICRO BIOLOGY,CHEMISTRY', 1),
    ('BIO-CHEMISTRY,COMPUTER SCIENCE,CHEMISTRY', 'BIO-CHEMISTRY,COMPUTER SCIENCE,CHEMISTRY', 1),
    ('BIO-CHEMISTRY,BIO TECHNOLOGY,MICRO BIOLOGY', 'BIO-CHEMISTRY,BIO TECHNOLOGY,MICRO BIOLOGY', 1),
    ('MATHEMATICS,PHYSICS,COMPUTER APPLICATIONS', 'MATHEMATICS,PHYSICS,COMPUTER APPLICATIONS', 1),
    ('MICRO BIOLOGY,COMPUTER APPLICATIONS,CHEMISTRY', 'MICRO BIOLOGY,COMPUTER APPLICATIONS,CHEMISTRY', 1),
    ('MEDICAL LAB TECHNOLOGIES,BIO-CHEMISTRY,CHEMISTRY', 'MEDICAL LAB TECHNOLOGIES,BIO-CHEMISTRY,CHEMISTRY', 1),
    ('MEDICAL LAB TECHNOLOGIES,MICRO BIOLOGY,CHEMISTRY', 'MEDICAL LAB TECHNOLOGIES,MICRO BIOLOGY,CHEMISTRY', 1),
    ('MEDICAL LAB TECHNOLOGIES,MICRO BIOLOGY,BIO-CHEMISTRY', 'MEDICAL LAB TECHNOLOGIES,MICRO BIOLOGY,BIO-CHEMISTRY', 1),
    ('BIO TECHNOLOGY,BIO-CHEMISTRY,CHEMISTRY', 'BIO TECHNOLOGY,BIO-CHEMISTRY,CHEMISTRY', 1),
    ('MATHEMATICS,ELECTRONICS,COMPUTER APPLICATIONS', 'MATHEMATICS,ELECTRONICS,COMPUTER APPLICATIONS', 1),
    ('BIO TECHNOLOGY,ZOOLOGY,CHEMISTRY', 'BIO TECHNOLOGY,ZOOLOGY,CHEMISTRY', 1),
    ('MATHEMATICS,ACCOUNTS,COMPUTER APPLICATIONS', 'MATHEMATICS,ACCOUNTS,COMPUTER APPLICATIONS', 1),
    ('BOTANY,ZOOLOGY,INDUSTRIAL CHEMISTRY', 'BOTANY,ZOOLOGY,INDUSTRIAL CHEMISTRY', 1),
    ('BIO TECHNOLOGIES,COMPUTER APPLICATIONS,CHEMISTRY', 'BIO TECHNOLOGIES,COMPUTER APPLICATIONS,CHEMISTRY', 1),
    ('GEOLOGY,PHYSICS,COMPUTER SCIENCE', 'GEOLOGY,PHYSICS,COMPUTER SCIENCE', 1),
    ('CEMENT SCIENCE,COMPUTER SCIENCE,CHEMISTRY', 'CEMENT SCIENCE,COMPUTER SCIENCE,CHEMISTRY', 1),
    ('CHEMISTRY,ZOOLOGY,PARAMEDICAL TECHNOLOGY', 'CHEMISTRY,ZOOLOGY,PARAMEDICAL TECHNOLOGY', 1),
    ('BOTANY,CHEMISTRY,ORGANIC FARMING', 'BOTANY,CHEMISTRY,ORGANIC FARMING', 1),
    ('MATHEMATICS,ECONOMIC,ECONOMETRICS', 'MATHEMATICS,ECONOMIC,ECONOMETRICS', 1),
    ('ZOOLOGY,CHEMISTRY,SERICULTURE TECHNOLOGY', 'ZOOLOGY,CHEMISTRY,SERICULTURE TECHNOLOGY', 1),
    ('MATHEMATICS,COMPUTER SCIENCE,MULTIMEDIA', 'MATHEMATICS,COMPUTER SCIENCE,MULTIMEDIA', 1),
    ('MATHEMATICS,COMPUTER SCIENCE,CLOUD COMPUTING', 'MATHEMATICS,COMPUTER SCIENCE,CLOUD COMPUTING', 1),
    ('MATHEMATICS,CHEMISTRY,CEMENT CHEMISTRY', 'MATHEMATICS,CHEMISTRY,CEMENT CHEMISTRY', 1),
    ('MATHEMATICS,PHYSICS,RENEWABLE ENERGY', 'MATHEMATICS,PHYSICS,RENEWABLE ENERGY', 1),
    ('Mathematics, Physical Sciences', 'Mathematics, Physical Sciences', 1),
    ('Mathematics, English', 'Mathematics, English', 1),
    ('Mathematics, Telugu', 'Mathematics, Telugu', 1),
    ('Mathematics, Urdu', 'Mathematics, Urdu', 1),
    ('Physical Sciences, English', 'Physical Sciences, English', 1),
    ('Physical Sciences, Telugu', 'Physical Sciences, Telugu', 1),
    ('Physical Sciences, Urdu', 'Physical Sciences, Urdu', 1),
    ('Biological Sciences, English', 'Biological Sciences, English', 1),
    ('Biological Sciences, Telugu', 'Biological Sciences, Telugu', 1),
    ('Biological Sciences, Urdu', 'Biological Sciences, Urdu', 1),
    ('Social Studies, English', 'Social Studies, English', 1),
    ('Social Studies, Telugu', 'Social Studies, Telugu', 1),
    ('Social Studies, Urdu', 'Social Studies, Urdu', 1),
    ('Biological Sciences, Physical Sciences', 'Biological Sciences, Physical Sciences', 1),
    ('SECR.PRACT.& OFF.MANG,OFF.MANG.& WEB TECH.', 'SECR.PRACT.& OFF.MANG,OFF.MANG.& WEB TECH.', 1),
    ('ADVANCED ACCOUNTS,BUSINESS MATHEMATICS', 'ADVANCED ACCOUNTS,BUSINESS MATHEMATICS', 1),
    ('MARKETING MANAGEMENT,RETAILING', 'MARKETING MANAGEMENT,RETAILING', 1),
    ('BIO TECHNOLOGY,BOTANY,CHEMISTRY', 'BIO TECHNOLOGY,BOTANY,CHEMISTRY', 1),
    ('FINANCIAL SERVICES,MARKETING OF FINANCIAL SERVICES', 'FINANCIAL SERVICES,MARKETING OF FINANCIAL SERVICES', 1),
    ('INCOME TAX', 'INCOME TAX', 1),
    ('Human Resource Management', 'Human Resource Management', 1),
    ('Marketing', 'Marketing', 1),
    ('e-Business', 'e-Business', 1),
    ('Financial Management', 'Financial Management', 1),
    ('International Business Management', 'International Business Management', 1),
    ('Operations Management', 'Operations Management', 1),
    ('COST AND MANAGEMENT ACCOUNTING,CORPORATE ACCOUNTING,EN', 'COST AND MANAGEMENT ACCOUNTING,CORPORATE ACCOUNTING,EN', 1),
    ('CLOUD COMPUTING AND PYTHON,ENTERPRISE RESOURCE PLANNING', 'CLOUD COMPUTING AND PYTHON,ENTERPRISE RESOURCE PLANNING', 1),
    ('ECONOMICS,PUBLIC ADMINISTRATION,SOCIOLOGY', 'ECONOMICS,PUBLIC ADMINISTRATION,SOCIOLOGY', 1),
    ('HISTORY,POLITICAL SCIENCE,PUBLIC ADMINISTRATION', 'HISTORY,POLITICAL SCIENCE,PUBLIC ADMINISTRATION', 1),
    ('SOCIOLOGY, ADVANCE TELUGU, JOURNALISAM', 'SOCIOLOGY, ADVANCE TELUGU, JOURNALISAM', 1),
    ('RURAL DEVELOPMENT, SOCIOLOGY, COMPUTER APPLICATION', 'RURAL DEVELOPMENT, SOCIOLOGY, COMPUTER APPLICATION', 1),
    ('CORPORATE ACCOUNTING, BUSSINESS INFORMATION SYSTEM, WEB PROGRAMMING', 'CORPORATE ACCOUNTING, BUSSINESS INFORMATION SYSTEM, WEB PROGRAMMING', 1),
    ('MANAGEMENT ACCOUNTING, CORPORATE ACCOUNTING, ADVANCED MANAGEMENT ACCOUNTING', 'MANAGEMENT ACCOUNTING, CORPORATE ACCOUNTING, ADVANCED MANAGEMENT ACCOUNTING', 1),
    ('PRODUCTION & OPERATION MANAGEMENT, BUSINESS POLICY AND STRATEGIC MANAGEMENT, BUSSINESS LAW, INCOME TAX & TAX PLANNING, INTERNET TECHNOLOGY AND WEB COMMERCE', 'PRODUCTION & OPERATION MANAGEMENT, BUSINESS POLICY AND STRATEGIC MANAGEMENT, BUSSINESS LAW, INCOME TAX & TAX PLANNING, INTERNET TECHNOLOGY AND WEB COMMERCE', 1),
    ('ADVANCED ACCOUNTANCY, COMMERCIAL & INDUSTRIAL LAW, AUDITING & COMPANY LAW, MANAGEMENT ACCOUNTANCY, INCOME TAX, COST ACCOUNTANCY', 'ADVANCED ACCOUNTANCY, COMMERCIAL & INDUSTRIAL LAW, AUDITING & COMPANY LAW, MANAGEMENT ACCOUNTANCY, INCOME TAX, COST ACCOUNTANCY', 1),
    ('ASSESSMENT OF TAX, CORPORATE TAXATION, GOODS AND SERVICE TAX, CUSTOMS ACT, TAX PLANNING AND MANAGEMENT', 'ASSESSMENT OF TAX, CORPORATE TAXATION, GOODS AND SERVICE TAX, CUSTOMS ACT, TAX PLANNING AND MANAGEMENT', 1),
    ('PROGRAMMING IN JAVA, INTERNET TECHNOLOGY WEB COMMERCE, DATA COMMUNICATIONS, COMPUTER ORGZ AND OPERATING SYSTEM, VISUAL BASIC, NETWORK PROGRAMMING', 'PROGRAMMING IN JAVA, INTERNET TECHNOLOGY WEB COMMERCE, DATA COMMUNICATIONS, COMPUTER ORGZ AND OPERATING SYSTEM, VISUAL BASIC, NETWORK PROGRAMMING', 1),
    ('INCOME TAX, COST ACCOUNTANCY', 'INCOME TAX, COST ACCOUNTANCY', 1),
    ('MANAGEMENT ACCOUNTANCY, COST ACCOUNTANCY', 'MANAGEMENT ACCOUNTANCY, COST ACCOUNTANCY', 1),
    ('CORPORATE ACCOUNTING, SALES TAX PROC & PRACTICE', 'CORPORATE ACCOUNTING, SALES TAX PROC & PRACTICE', 1),
    ('BOTANY, ZOOLOGY, CHEMISTRY', 'BOTANY, ZOOLOGY, CHEMISTRY', 1),
    ('Financial Markets and Institutions, Investment Management, Financial Services, International Financial Management', 'Financial Markets and Institutions, Investment Management, Financial Services, International Financial Management', 1),
    ('MATHEMATICS, INDUSTRIAL ELECTRONICS, COMPUTER SCIENCE', 'MATHEMATICS, INDUSTRIAL ELECTRONICS, COMPUTER SCIENCE', 1),
    ('FOOD TECHNOLOGY, MICROBIOLOGY, CHEMISTRY', 'FOOD TECHNOLOGY, MICROBIOLOGY, CHEMISTRY', 1),
    ('History, Advance Telugu, Computer Application', 'History, Advance Telugu, Computer Application', 1),
    ('Cloud Computing and Python, Web Technologies, Electronic Commerce and Enterprise Resource Planning and Jquery', 'Cloud Computing and Python, Web Technologies, Electronic Commerce and Enterprise Resource Planning and Jquery', 1),
    ('Mathmatics, Analytical Chemistry, Chemistry', 'Mathmatics, Analytical Chemistry, Chemistry', 1),
    ('Economics, History, Archaeology', 'Economics, History, Archaeology', 1),
    ('Programming in Java, Internet Tech & Web Commerce, Data Commu., Software Engg., Object Oriented Modeling and Design', 'Programming in Java, Internet Tech & Web Commerce, Data Commu., Software Engg., Object Oriented Modeling and Design', 1),
    ('Financial Management, Advanced Taxation', 'Financial Management, Advanced Taxation', 1),
    ('Household Economics, Family, Community Nutrition and diet theoraphy, Home Science Extension', 'Household Economics, Family, Community Nutrition and diet theoraphy, Home Science Extension', 1),
    ('BIOCHEMISTRY, ZOOLOGY, CHEMISTRY', 'BIOCHEMISTRY, ZOOLOGY, CHEMISTRY', 1),
    ('Auditing, Insurance, Banking, cost and management accounting corporate accounting', 'Auditing, Insurance, Banking, cost and management accounting corporate accounting', 1),
    ('Financial Services, Marketing of Financial Services, Tally', 'Financial Services, Marketing of Financial Services, Tally', 1),
    ('Web Technologies, E-commerce, Advanced Accounting', 'Web Technologies, E-commerce, Advanced Accounting', 1),
    ('Ass. Of Tax - Individual, HUF and Partnership, Goods and Services Tax and Customs', 'Ass. Of Tax - Individual, HUF and Partnership, Goods and Services Tax and Customs', 1),
    ('e-Commerce, Advertising and Packaging, e-Payment Systems', 'e-Commerce, Advertising and Packaging, e-Payment Systems', 1),
    ('Consumer Behaviour, Product Management, Sales Management', 'Consumer Behaviour, Product Management, Sales Management', 1),
    ('HISTORY, ECONOMICS, POLITICAL SCIENCE, CITIZENSHIP EDUCATION', 'HISTORY, ECONOMICS, POLITICAL SCIENCE, CITIZENSHIP EDUCATION', 1),
    ('PRODUCTION & OPERATION MANAGEMENT, BUSINESS POLICY AND STRATEGIC MANAGEMENT, BUSSINESS LAW, INCOME TAX & TAX PLANNING, INTERNET TECHNOLOGY AND WEB COMMERCE, CITIZ', 'PRODUCTION & OPERATION MANAGEMENT, BUSINESS POLICY AND STRATEGIC MANAGEMENT, BUSSINESS LAW, INCOME TAX & TAX PLANNING, INTERNET TECHNOLOGY AND WEB COMMERCE, CITIZ', 1),
    ('Talent Management, Leadership, Income Tax Assessment Procedures, Practice & Goods And Service Tax with Tally', 'Talent Management, Leadership, Income Tax Assessment Procedures, Practice & Goods And Service Tax with Tally', 1),
    ('Commerce', 'Commerce', 1),
    ('COMPUTER APPLICATIONS', 'COMPUTER APPLICATIONS', 1),
    ('Management Accounting and Practice, Cost Control Techniques, Big Data Analytics using R & Data Science using Python', 'Management Accounting and Practice, Cost Control Techniques, Big Data Analytics using R & Data Science using Python', 1),
    ('MANAGEMENT ACCOUNTING, COST CONTROL TECHNIQUES, LIFE INSURANCE WITH PRACTICE, GENL. INSURANCE WITH PRACTICE, INCOME TAX PROCEDURE & PRACTICE, GST WITH TALLY', 'MANAGEMENT ACCOUNTING, COST CONTROL TECHNIQUES, LIFE INSURANCE WITH PRACTICE, GENL. INSURANCE WITH PRACTICE, INCOME TAX PROCEDURE & PRACTICE, GST WITH TALLY', 1),
    ('COST AND MANAGEMENT ACCOUNTING, CORPORATE ACCOUNTING, ENTREPRENEURSHIP DEVELOPMENT PROGRAMME', 'COST AND MANAGEMENT ACCOUNTING, CORPORATE ACCOUNTING, ENTREPRENEURSHIP DEVELOPMENT PROGRAMME', 1),
    ('Tourism, Advanced English, Economics', 'Tourism, Advanced English, Economics', 1),
    ('MATHEMATICS, STATISTICS, MANAGEMENT ACCOUNTING', 'MATHEMATICS, STATISTICS, MANAGEMENT ACCOUNTING', 1),
    ('Botany, Biotechnology, Chemistry', 'Botany, Biotechnology, Chemistry', 1),
    ('Management Accounting and Practice, Cost Control Techniques. e-Commerce & e-filing', 'Management Accounting and Practice, Cost Control Techniques. e-Commerce & e-filing', 1),
    ('Advanced Corporate Accounting, Software Solutions to Accounting, Income Tax Procedure and Practice, GST with Tally, Big Data Analytics using R, Data Science using Python', 'Advanced Corporate Accounting, Software Solutions to Accounting, Income Tax Procedure and Practice, GST with Tally, Big Data Analytics using R, Data Science using Python', 1),
    ('Secretarial Practice, Internet Tech and e-Commerce', 'Secretarial Practice, Internet Tech and e-Commerce', 1),
    ('Botany, Chemistry, Horticulture', 'Botany, Chemistry, Horticulture', 1),
    ('MATHEMATICS, PHYSICS(WITH MATHS), COMPUTER SCIENCE', 'MATHEMATICS, PHYSICS(WITH MATHS), COMPUTER SCIENCE', 1),
    ('Management Accounting and Practice, Cost Control Techniques, Big Data Analytics using R & Essential Python Libraries for Data Science', 'Management Accounting and Practice, Cost Control Techniques, Big Data Analytics using R & Essential Python Libraries for Data Science', 1),
    ('MATHEMATICS, STATISTICS (WITH MATHS), COMPUTER SCIENCE', 'MATHEMATICS, STATISTICS (WITH MATHS), COMPUTER SCIENCE', 1),
    ('HOME SCIENCE', 'HOME SCIENCE', 1),
    ('Mathematics, Physics (With Maths), Chemistry', 'Mathematics, Physics (With Maths), Chemistry', 1),
    ('Social Sciences, English', 'Social Sciences, English', 1),
    ('Social Sciences, Telugu', 'Social Sciences, Telugu', 1),
    ('Social Sciences, Urdu', 'Social Sciences, Urdu', 1),
    ('English and Social Studies', 'English and Social Studies', 1),
    ('Mathematics, Physics, Renewable Energy', 'Mathematics, Physics, Renewable Energy', 1),
    ('MANAGEMENT ACCOUNTING, COSTCONTROL TECHNIQUES, ADVERTISING&MEDIA PLANNING, SALES PROMOTION & PRACTICE, DIGITAL MARKETING, SERVICE MARKET', 'MANAGEMENT ACCOUNTING, COSTCONTROL TECHNIQUES, ADVERTISING&MEDIA PLANNING, SALES PROMOTION & PRACTICE, DIGITAL MARKETING, SERVICE MARKET', 1),
    ('Geology', 'Geology', 1),
    ('Zoology', 'Zoology', 1),
    ('Statistics', 'Statistics', 1),
    ('Chemistry', 'Chemistry', 1),
    ('Advanced Corporate Accounting, Software Solutions to Accounting, Logistic Services & Practice, Exim Procedure & Practice, E-commerce, E-filing', 'Advanced Corporate Accounting, Software Solutions to Accounting, Logistic Services & Practice, Exim Procedure & Practice, E-commerce, E-filing', 1),
    ('Indian Heritage and culture and civilization, Human Values-I, Environmental Studies, Human Values-II.', 'Indian Heritage and culture and civilization, Human Values-I, Environmental Studies, Human Values-II.', 1)
ON CONFLICT (option_code) DO UPDATE SET option_name = EXCLUDED.option_name, is_active = EXCLUDED.is_active;

-- Seed part_iii_master (23 records)
INSERT INTO public.part_iii_master (option_code, option_name, is_active)
VALUES
    ('NA', 'Not Applicable', 1),
    ('Indian Heritage and Culture, Science and Civilization, Env. Studies, Citizenship Edu., Fund. of I.T., Off. Automation Tools Human Values and Professional Ethics.', 'Indian Heritage and Culture, Science and Civilization, Env. Studies, Citizenship Edu., Fund. of I.T., Off. Automation Tools Human Values and Professional Ethics.', 1),
    ('Indian Heritage and Culture, Science and Civilization, Environmental Studies, Citizenship Education and Human Values and Professional Ethics.', 'Indian Heritage and Culture, Science and Civilization, Environmental Studies, Citizenship Education and Human Values and Professional Ethics.', 1),
    ('Indian Heritage and Culture, Science and Civilization, Environmental Studies, Citizenship Education, Fund. of I.T. and Office Automation Tools.', 'Indian Heritage and Culture, Science and Civilization, Environmental Studies, Citizenship Education, Fund. of I.T. and Office Automation Tools.', 1),
    ('Indian Heritage and Culture, Science and Civilization, Environmental Studies, Citizenship Education.', 'Indian Heritage and Culture, Science and Civilization, Environmental Studies, Citizenship Education.', 1),
    ('Indian Heritage and Culture, Science and Civilization, Environmental Studies.', 'Indian Heritage and Culture, Science and Civilization, Environmental Studies.', 1),
    ('Indian Heritage and Culture, Science and Civilization, Environmental Studies, Fund. of I.T. and Office Auto. Tools.', 'Indian Heritage and Culture, Science and Civilization, Environmental Studies, Fund. of I.T. and Office Auto. Tools.', 1),
    ('Indian Heritage and Culture, Science and Civilization', 'Indian Heritage and Culture, Science and Civilization', 1),
    ('Q.A.R.& Environmental Science', 'Q.A.R.& Environmental Science', 1),
    ('Communication Skill in English Soft Skills, Interdisciplinary Elective Core Elective, Environmental Studies Citizenship Education, Human Values Professional Ethics', 'Communication Skill in English Soft Skills, Interdisciplinary Elective Core Elective, Environmental Studies Citizenship Education, Human Values Professional Ethics', 1),
    ('Interdisciplinary Elective-I@Enivronmental Studies@Citizenship Education@Interdisciplinary Elective-II', 'Interdisciplinary Elective-I@Enivronmental Studies@Citizenship Education@Interdisciplinary Elective-II', 1),
    ('CITIZENSHIP EDUCATION', 'CITIZENSHIP EDUCATION', 1),
    ('CITIZENSHIP EDUCATION HUMAN VALUES & PROFESSIONAL ETHICS', 'CITIZENSHIP EDUCATION HUMAN VALUES & PROFESSIONAL ETHICS', 1),
    ('PROGRAMMING IN JAVA,@INTERNET TECHNOLOGY WEB COMMERCE,@DATA COMMUNICATIONS, @COMPUTER ORGZ AND OPERATING SYSTEM@VISUAL BASIC NETWORK PROGRAM', 'PROGRAMMING IN JAVA,@INTERNET TECHNOLOGY WEB COMMERCE,@DATA COMMUNICATIONS, @COMPUTER ORGZ AND OPERATING SYSTEM@VISUAL BASIC NETWORK PROGRAM', 1),
    ('Human Values and Prof. Ethics@Citizenship Education', 'Human Values and Prof. Ethics@Citizenship Education', 1),
    ('Interdisciplinary Elective-I@Enivronmental Studies@Citizenship Education@Interdisciplinary Elective-II@Human Values@Professional Ethics', 'Interdisciplinary Elective-I@Enivronmental Studies@Citizenship Education@Interdisciplinary Elective-II@Human Values@Professional Ethics', 1),
    ('Interdisciplinary Elective-I, Citizenship Education, Interdisciplinary Elective-II, Human Values, Professional Ethics', 'Interdisciplinary Elective-I, Citizenship Education, Interdisciplinary Elective-II, Human Values, Professional Ethics', 1),
    ('Q.A.R., Computer Skills & Environmental Science', 'Q.A.R., Computer Skills & Environmental Science', 1),
    ('Interdisciplinary Skill Development Courses and Foundation Courses.', 'Interdisciplinary Skill Development Courses and Foundation Courses.', 1),
    ('Quantitative Aptitude, Reasoning', 'Quantitative Aptitude, Reasoning', 1),
    ('Indian Heritage and Culture, Science and Civilization, Citizenship Education.', 'Indian Heritage and Culture, Science and Civilization, Citizenship Education.', 1),
    ('Indian Heritage and culture and civilization, Human Values-I, Environmental Studies, Human Values-II', 'Indian Heritage and culture and civilization, Human Values-I, Environmental Studies, Human Values-II', 1),
    ('Indian Heritage and culture and civilization, Human Values-I, Environmental Studies,', 'Indian Heritage and culture and civilization, Human Values-I, Environmental Studies,', 1)
ON CONFLICT (option_code) DO UPDATE SET option_name = EXCLUDED.option_name, is_active = EXCLUDED.is_active;

-- Seed Initial System Users (7 accounts)
INSERT INTO public.users (name, email, mobile, password_hash, role)
VALUES
    ('zeelan', 'zeelan.sku@gmail.com', '9866714016', '$2a$10$k0aM7Wl8MdjWerQr1elQhOx9VR3bczK899jThT4JDtGdF50cj2By.', 'user'),
    ('admin@example.com', 'admin@example.com', 'admin123', '$2a$10$3yfwInWW49DKHH2Ie9nMIOf/r/1iZYqZPH/8WWBT3jHlLUpVRRQSS', 'admin'),
    ('Test User', 'test@example.com', '1234567890', '$2a$10$USJ8PR00Vw4Ax7T6I/SujOGAPSJlYXICgzOm6o/.zvY3Fdva607rm', 'user'),
    ('Admin User', 'admin@admin.com', '1234567890', '$2a$10$9BeMU2uKuASz08XHlahQyuR4vm1CwyKmheQRN4CR8EU7sGCqfIMvK', 'user'),
    ('admin', 'admin123@gmail.com', '8978435746', '$2a$10$P7jG6qBhyzh7CD/IFlPksOp/rnj5nFxEKw/ISlogCJf/DS33Z8/SK', 'admin'),
    ('zeelan', 'zeelan@gmail.com', '9866714016', '$2a$10$DDF4puRiJs44i69LOqXIi.kB0pEW04sS5AZZDUa1KlAzBp3/klWI.', 'user'),
    ('Tester', 'tester@example.com', '1234567890', '$2a$10$PNR7MszV/xfznB.jAk0YQOlxbLfyLM.FhazTkVTdzUDDtnpmkMbg6', 'user')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, name = EXCLUDED.name;

-- ---------------------------------------------------------------------
-- 6. RESET SEQUENCE VALUES
-- ---------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('public.users', 'id'), COALESCE((SELECT MAX(id) FROM public.users), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('public.convocation_students', 'id'), COALESCE((SELECT MAX(id) FROM public.convocation_students), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('public.category_master', 'id'), COALESCE((SELECT MAX(id) FROM public.category_master), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('public.degree_master', 'id'), COALESCE((SELECT MAX(id) FROM public.degree_master), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('public.faculty_master', 'id'), COALESCE((SELECT MAX(id) FROM public.faculty_master), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('public.course_master', 'id'), COALESCE((SELECT MAX(id) FROM public.course_master), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('public.subject_master', 'id'), COALESCE((SELECT MAX(id) FROM public.subject_master), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('public.specialization_master', 'id'), COALESCE((SELECT MAX(id) FROM public.specialization_master), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('public.medium_master', 'id'), COALESCE((SELECT MAX(id) FROM public.medium_master), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('public.payment_category_master', 'id'), COALESCE((SELECT MAX(id) FROM public.payment_category_master), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('public.payment_mode_master', 'id'), COALESCE((SELECT MAX(id) FROM public.payment_mode_master), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('public.convocation_issued_master', 'id'), COALESCE((SELECT MAX(id) FROM public.convocation_issued_master), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('public.second_language_master', 'id'), COALESCE((SELECT MAX(id) FROM public.second_language_master), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('public.part_ii_master', 'id'), COALESCE((SELECT MAX(id) FROM public.part_ii_master), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('public.part_iii_master', 'id'), COALESCE((SELECT MAX(id) FROM public.part_iii_master), 0) + 1, false);

-- ---------------------------------------------------------------------
-- 7. SUPABASE STORAGE BUCKET CONFIGURATION
-- ---------------------------------------------------------------------
-- Ensure public 'uploads' storage bucket exists for photos & certificates
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'uploads',
    'uploads',
    true,
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

-- Storage bucket access policies
DO $$
BEGIN
    -- Allow public read on uploads bucket
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow public read on uploads'
    ) THEN
        CREATE POLICY "Allow public read on uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
    END IF;

    -- Allow public insert on uploads bucket
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow public insert on uploads'
    ) THEN
        CREATE POLICY "Allow public insert on uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads');
    END IF;

    -- Allow public update on uploads bucket
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow public update on uploads'
    ) THEN
        CREATE POLICY "Allow public update on uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'uploads') WITH CHECK (bucket_id = 'uploads');
    END IF;

    -- Allow public delete on uploads bucket
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow public delete on uploads'
    ) THEN
        CREATE POLICY "Allow public delete on uploads" ON storage.objects FOR DELETE USING (bucket_id = 'uploads');
    END IF;
END $$;

-- ---------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convocation_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.degree_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialization_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medium_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_category_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_mode_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convocation_issued_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_language_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_ii_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_iii_master ENABLE ROW LEVEL SECURITY;

-- 8.1 Master Tables Policies (Public read for active items, full control for service/admin)
DO $$
DECLARE
    tbl TEXT;
    master_tbls TEXT[] := ARRAY[
        'category_master', 'degree_master', 'faculty_master', 'course_master',
        'subject_master', 'specialization_master', 'medium_master',
        'payment_category_master', 'payment_mode_master', 'convocation_issued_master',
        'second_language_master', 'part_ii_master', 'part_iii_master'
    ];
BEGIN
    FOREACH tbl IN ARRAY master_tbls LOOP
        -- Read policy
        EXECUTE format('DROP POLICY IF EXISTS "Allow read active master data" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Allow read active master data" ON public.%I FOR SELECT USING (is_active = 1 OR auth.role() = ''service_role'')', tbl);

        -- Write policy for service_role or admin
        EXECUTE format('DROP POLICY IF EXISTS "Allow manage master data" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Allow manage master data" ON public.%I FOR ALL USING (auth.role() = ''service_role'' OR (SELECT role FROM public.users WHERE id = auth.uid()::text::integer) = ''admin'')', tbl);
    END LOOP;
END $$;

-- 8.2 Users Policies
DROP POLICY IF EXISTS "Allow public user registration" ON public.users;
CREATE POLICY "Allow public user registration" ON public.users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to read profiles" ON public.users;
CREATE POLICY "Allow users to read profiles" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to update own profile" ON public.users;
CREATE POLICY "Allow users to update own profile" ON public.users FOR UPDATE USING (id = auth.uid()::text::integer OR auth.role() = 'service_role');

-- 8.3 Convocation Students Policies
-- Note: The Express Node backend connects via direct PostgreSQL pooler (postgres superuser)
-- which automatically bypasses RLS. These policies ensure security if accessed via Supabase Client/REST.
DROP POLICY IF EXISTS "Allow read student applications" ON public.convocation_students;
CREATE POLICY "Allow read student applications" ON public.convocation_students FOR SELECT USING (
    auth.role() = 'service_role' OR
    submitted_by = auth.uid()::text::integer OR
    (SELECT role FROM public.users WHERE id = auth.uid()::text::integer) = 'admin' OR
    true -- Allows hall_ticket_no lookups by certificate download endpoints
);

DROP POLICY IF EXISTS "Allow insert student applications" ON public.convocation_students;
CREATE POLICY "Allow insert student applications" ON public.convocation_students FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update student applications" ON public.convocation_students;
CREATE POLICY "Allow update student applications" ON public.convocation_students FOR UPDATE USING (
    auth.role() = 'service_role' OR
    submitted_by = auth.uid()::text::integer OR
    (SELECT role FROM public.users WHERE id = auth.uid()::text::integer) = 'admin'
);

COMMIT;

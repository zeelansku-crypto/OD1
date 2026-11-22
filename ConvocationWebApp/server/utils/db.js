const { Pool, types } = require('pg');
require('dotenv').config();

// Fix PostgreSQL DATE (OID 1082) parsing so it returns exact 'YYYY-MM-DD' strings without timezone/UTC drift
types.setTypeParser(1082, (val) => val);

const poolConfig = {
  connectionString: process.env.DATABASE_URL
};

// Add SSL for remote servers (e.g. Supabase, Render), exclude for localhost
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')) {
  poolConfig.ssl = { rejectUnauthorized: false };
} else if (!process.env.DATABASE_URL) {
  // If no DB URL is defined, pg defaults to local, so explicitly no ssl
  // We can just rely on defaults.
}

const pool = new Pool(poolConfig);

const initDb = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Users Table
        await client.query(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            mobile TEXT,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Convocation Students Table
        await client.query(`CREATE TABLE IF NOT EXISTS convocation_students (
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
          
            payment_category TEXT,
            payment_mode TEXT,
            dd_challan_no TEXT,
            dd_challan_date DATE,
            dd_challan_certificate TEXT,
          
            issued_date DATE,
            bank_name TEXT,
            ifsc_code TEXT,
            convocation_fee NUMERIC,
            convocation_issued_in TEXT,
          
            second_language TEXT,
            elective_subjects TEXT,
            academic_year TEXT,
            remarks TEXT,
          
            submitted_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            manual_serial_no TEXT,
            branch_name TEXT,
            part_ii TEXT,
            part_iii TEXT,
            student_photo_blob BYTEA,
            dd_challan_certificate_blob BYTEA,
          
            CONSTRAINT fk_submitted_by FOREIGN KEY(submitted_by) REFERENCES users(id)
        )`);

        // Master Data Seeding Function
        const seedMasterData = async (table, codeColumn, nameColumn, data) => {
            for (const item of data) {
                await client.query(
                    `INSERT INTO ${table} (${codeColumn}, ${nameColumn}) VALUES ($1, $2) ON CONFLICT (${codeColumn}) DO NOTHING`,
                    item
                );
            }
        };

        // Category Master Table
        await client.query(`CREATE TABLE IF NOT EXISTS category_master (
            id SERIAL PRIMARY KEY,
            category_code TEXT UNIQUE NOT NULL,
            category_name TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await seedMasterData('category_master', 'category_code', 'category_name', [
            ['NA', 'Not Applicable'], ['OC', 'Open Category'], ['BC', 'Backward Class'], 
            ['SC', 'Scheduled Caste'], ['ST', 'Scheduled Tribe'], ['OTHERS', 'Others']
        ]);

        // Degree Master Table
        await client.query(`CREATE TABLE IF NOT EXISTS degree_master (
            id SERIAL PRIMARY KEY,
            degree_code TEXT UNIQUE NOT NULL,
            degree_name TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await seedMasterData('degree_master', 'degree_code', 'degree_name', [
            ['UG', 'UG'], ['PG', 'PG'], ['UG_EDU', 'UG Education'], ['DIPLOMA', 'Diploma'], ['RESEARCH', 'Research']
        ]);

        // Faculty Master Table
        await client.query(`CREATE TABLE IF NOT EXISTS faculty_master (
            id SERIAL PRIMARY KEY,
            faculty_code TEXT UNIQUE NOT NULL,
            faculty_name TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await seedMasterData('faculty_master', 'faculty_code', 'faculty_name', [
            ['ARTS', 'Faculty of Arts'], ['SCIENCE', 'Faculty of Science'], 
            ['COMMERCE', 'Faculty of Commerce'], ['MANAGEMENT', 'Faculty of Management']
        ]);

        // Course Master Table
        await client.query(`CREATE TABLE IF NOT EXISTS course_master (
            id SERIAL PRIMARY KEY,
            course_code TEXT UNIQUE NOT NULL,
            course_name TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await seedMasterData('course_master', 'course_code', 'course_name', [
            ['BA', 'Bachelor of Arts'], ['BCOM', 'Bachelor of Commerce'], ['BSC', 'Bachelor of Science'],
            ['BMAN', 'Bachelor of Management'], ['MA_TEL', 'Master of Arts in Telugu'], ['MA_HIS', 'Master of Arts in History']
        ]);

        // Subject Master Table
        await client.query(`CREATE TABLE IF NOT EXISTS subject_master (
            id SERIAL PRIMARY KEY,
            subject_code TEXT UNIQUE NOT NULL,
            subject_name TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await seedMasterData('subject_master', 'subject_code', 'subject_name', [
            ['HIS', 'HISTORY'], ['ECO', 'ECONOMICS'], ['COM', 'COMMERCE'], 
            ['MAT', 'MATHEMATICS'], ['POL', 'POLITICAL SCIENCE']
        ]);

        // Specialization Master Table
        await client.query(`CREATE TABLE IF NOT EXISTS specialization_master (
            id SERIAL PRIMARY KEY,
            specialization_code TEXT UNIQUE NOT NULL,
            specialization_name TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await seedMasterData('specialization_master', 'specialization_code', 'specialization_name', [
            ['NR', 'NOT REQUIRED'], ['COMP', 'Computers'], ['CA', 'Computer Applications']
        ]);

        // Medium Master Table
        await client.query(`CREATE TABLE IF NOT EXISTS medium_master (
            id SERIAL PRIMARY KEY,
            medium_code TEXT UNIQUE NOT NULL,
            medium_name TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await seedMasterData('medium_master', 'medium_code', 'medium_name', [
            ['TEL', 'Telugu'], ['ENG', 'English'], ['HIN', 'Hindi'], ['URD', 'Urdu']
        ]);

        // Payment Category Master Table
        await client.query(`CREATE TABLE IF NOT EXISTS payment_category_master (
            id SERIAL PRIMARY KEY,
            category_code TEXT UNIQUE NOT NULL,
            category_name TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await seedMasterData('payment_category_master', 'category_code', 'category_name', [
            ['CNT', 'COUNTER'], ['POST', 'By Post']
        ]);

        // Payment Mode Master Table
        await client.query(`CREATE TABLE IF NOT EXISTS payment_mode_master (
            id SERIAL PRIMARY KEY,
            mode_code TEXT UNIQUE NOT NULL,
            mode_name TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await seedMasterData('payment_mode_master', 'mode_code', 'mode_name', [
            ['CNT', 'COUNTER'], ['DD', 'DD']
        ]);

        // Convocation Issued Master Table
        await client.query(`CREATE TABLE IF NOT EXISTS convocation_issued_master (
            id SERIAL PRIMARY KEY,
            issued_code TEXT UNIQUE NOT NULL,
            issued_name TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await seedMasterData('convocation_issued_master', 'issued_code', 'issued_name', [
            ['ADV', 'IN ADVANCE'], ['PRS', 'In Person'], ['ABS', 'In Absentia']
        ]);

        // Second Language Master Table
        await client.query(`CREATE TABLE IF NOT EXISTS second_language_master (
            id SERIAL PRIMARY KEY,
            language_code TEXT UNIQUE NOT NULL,
            language_name TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await seedMasterData('second_language_master', 'language_code', 'language_name', [
            ['TEL', 'Telugu'], ['HIN', 'Hindi'], ['SAN', 'Sanskrit'], ['URD', 'Urdu']
        ]);

        // Part II Master Table
        await client.query(`CREATE TABLE IF NOT EXISTS part_ii_master (
            id SERIAL PRIMARY KEY,
            option_code TEXT UNIQUE NOT NULL,
            option_name TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        // Note: Seeding the long Part II list should be handled with a separate script or simplified here 
        // to avoid huge block in initDb. For now, we'll ensure the table exists.

        // Part III Master Table
        await client.query(`CREATE TABLE IF NOT EXISTS part_iii_master (
            id SERIAL PRIMARY KEY,
            option_code TEXT UNIQUE NOT NULL,
            option_name TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await client.query('COMMIT');
        console.log('PostgreSQL Database initialized.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Database Initialization Error:', e.message);
        throw e;
    } finally {
        client.release();
    }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initDb
};

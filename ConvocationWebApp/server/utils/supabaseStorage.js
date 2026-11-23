const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const DEFAULT_SUPABASE_URL = 'https://afusskwtfoxslmhjioma.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnbXZ5ZGdnaGRkYXFrcXNjanBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDg0MDksImV4cCI6MjA5MjE4NDQwOX0.drAYTMIJjD0NzZtGUkpBiK4GQ2nyMjVGNCaDlZT-ro4';

const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;
const DEFAULT_BUCKET = process.env.SUPABASE_BUCKET || 'uploads';

let supabase = null;

const getSupabaseClient = () => {
    if (supabase) return supabase;
    const url = (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
    const key = (
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_KEY ||
        process.env.supabase_key ||
        process.env.supabase_anon_key ||
        DEFAULT_SUPABASE_KEY
    ).trim();

    if (url && key) {
        try {
            supabase = createClient(url, key, {
                auth: { persistSession: false }
            });
            console.log('[Supabase Storage] Initialized successfully with bucket:', DEFAULT_BUCKET);
            return supabase;
        } catch (err) {
            console.error('[Supabase Storage] Initialization error:', err.message);
        }
    }
    return null;
};

/**
 * Upload buffer to Supabase Storage bucket
 * @param {Buffer} buffer - File data
 * @param {string} fileName - Destination path/name in bucket
 * @param {string} contentType - MIME type
 * @param {string} bucket - Bucket name (defaults to 'uploads')
 */
const uploadToSupabase = async (buffer, fileName, contentType, bucket = DEFAULT_BUCKET) => {
    const client = getSupabaseClient();
    if (!client) {
        const errorMsg = 'Supabase client is not initialized. Please ensure SUPABASE_KEY is configured in your environment.';
        console.error('[Supabase Storage] ' + errorMsg);
        throw new Error(errorMsg);
    }
    try {
        const { data, error } = await client.storage
            .from(bucket)
            .upload(fileName, buffer, {
                contentType: contentType || 'application/octet-stream',
                upsert: true
            });

        if (error) {
            console.error(`[Supabase Storage] Upload error for ${fileName}:`, error.message);
            throw error;
        }

        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        const publicUrl = urlData?.publicUrl || `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
        console.log(`[Supabase Storage] Uploaded ${fileName} -> ${publicUrl}`);
        return {
            path: data?.path || fileName,
            publicUrl: publicUrl
        };
    } catch (err) {
        console.error(`[Supabase Storage] Exception uploading ${fileName}:`, err.message || err);
        throw err;
    }
};

/**
 * Get Public URL of a file in Supabase Storage
 */
const getStoragePublicUrl = (fileName, bucket = DEFAULT_BUCKET) => {
    const client = getSupabaseClient();
    if (!client || !fileName) return null;
    try {
        const { data } = client.storage.from(bucket).getPublicUrl(fileName);
        return data?.publicUrl || null;
    } catch (err) {
        return null;
    }
};

/**
 * Download file buffer from Supabase Storage
 */
const downloadFromSupabase = async (fileName, bucket = DEFAULT_BUCKET) => {
    const client = getSupabaseClient();
    if (!client || !fileName) return null;
    try {
        const { data, error } = await client.storage.from(bucket).download(fileName);
        if (error || !data) return null;
        const arrayBuffer = await data.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (err) {
        console.error(`[Supabase Storage] Download error for ${fileName}:`, err.message);
        return null;
    }
};

module.exports = {
    supabase,
    uploadToSupabase,
    getStoragePublicUrl,
    downloadFromSupabase,
    DEFAULT_BUCKET
};

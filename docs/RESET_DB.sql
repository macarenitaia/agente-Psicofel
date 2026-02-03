-- ⚠️ CRITICAL WARNING: THIS SCRIPT WILL DELETE ALL DATA ⚠️
-- Use this in the Supabase SQL Editor to wipe the database clean for a fresh delivery.

-- 1. Truncate leads and messages tables. 
-- 'CASCADE' ensures that when a lead is deleted, their messages disappear too.
TRUNCATE TABLE messages, leads RESTART IDENTITY CASCADE;

-- 2. Verification (Optional)
-- Uncomment these lines to verify the tables are empty
-- SELECT count(*) FROM leads;
-- SELECT count(*) FROM messages;

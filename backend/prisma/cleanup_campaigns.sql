-- Cleanup script to remove all campaign data while preserving users
-- Connect to main database
\c incentiva_dev;

-- Clean up campaign-related tables (in correct order due to foreign key constraints)
DELETE FROM campaign_redemptions;
DELETE FROM user_campaigns;
DELETE FROM campaign_executions;
DELETE FROM campaign_schemas;
DELETE FROM campaign_rules;
DELETE FROM campaign_goals;
DELETE FROM campaigns;

-- Reset auto-increment sequences
ALTER SEQUENCE campaigns_id_seq RESTART WITH 1;
ALTER SEQUENCE campaign_goals_id_seq RESTART WITH 1;
ALTER SEQUENCE campaign_rules_id_seq RESTART WITH 1;
ALTER SEQUENCE campaign_schemas_id_seq RESTART WITH 1;
ALTER SEQUENCE campaign_executions_id_seq RESTART WITH 1;
ALTER SEQUENCE user_campaigns_id_seq RESTART WITH 1;
ALTER SEQUENCE campaign_redemptions_id_seq RESTART WITH 1;

-- Verify cleanup
SELECT 'Campaign cleanup completed!' as status;
SELECT COUNT(*) as remaining_campaigns FROM campaigns;
SELECT COUNT(*) as remaining_users FROM users;
SELECT COUNT(*) as remaining_user_campaigns FROM user_campaigns;
SELECT COUNT(*) as remaining_campaign_goals FROM campaign_goals;
SELECT COUNT(*) as remaining_campaign_rules FROM campaign_rules;
SELECT COUNT(*) as remaining_campaign_schemas FROM campaign_schemas;
SELECT COUNT(*) as remaining_campaign_executions FROM campaign_executions;
SELECT COUNT(*) as remaining_campaign_redemptions FROM campaign_redemptions;

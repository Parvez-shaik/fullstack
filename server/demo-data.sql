-- First, let's create a demo admin user if it doesn't exist
INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@example.com', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Get the admin user ID
DO $$
DECLARE
    admin_id INTEGER;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@example.com';

    -- Insert demo topics
    INSERT INTO topics (name, created_by)
    VALUES 
        ('Should we implement a four-day work week?', admin_id),
        ('Should remote work be mandatory?', admin_id),
        ('Should we switch to renewable energy?', admin_id),
        ('Should we implement a universal basic income?', admin_id),
        ('Should we ban single-use plastics?', admin_id)
    ON CONFLICT DO NOTHING;

    -- Get the topic IDs
    DECLARE
        topic_ids INTEGER[];
    BEGIN
        SELECT array_agg(id) INTO topic_ids FROM topics;
        
        -- Insert some demo votes for each topic (1 for yes, 0 for no)
        FOR i IN 1..array_length(topic_ids, 1) LOOP
            INSERT INTO votes (user_id, topic_id, vote)
            VALUES 
                (admin_id, topic_ids[i], 1),
                (admin_id, topic_ids[i], 0)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END;
END $$; 
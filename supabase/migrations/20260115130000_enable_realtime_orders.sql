-- Enable Realtime for the orders table
-- This adds the 'orders' table to the 'supabase_realtime' publication
-- allowing the frontend to receive real-time updates.

BEGIN;
  -- Check if the publication exists, and if so, add the table
  DO $$
  BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      -- Try to add the table, ignore if it's already added
      BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE orders;
      EXCEPTION WHEN duplicate_object THEN
        -- Table is already in the publication, do nothing
      END;
    END IF;
  END $$;
COMMIT;

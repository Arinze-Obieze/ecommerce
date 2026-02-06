-- Add sizes and colors columns if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sizes') THEN 
        ALTER TABLE products ADD COLUMN sizes TEXT[] DEFAULT '{}'; 
    END IF; 

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'colors') THEN 
        ALTER TABLE products ADD COLUMN colors TEXT[] DEFAULT '{}'; 
    END IF; 
END $$;

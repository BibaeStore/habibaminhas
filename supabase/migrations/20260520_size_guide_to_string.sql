-- Migration: Change size_guide from boolean to text to store image URL
-- Date: 2026-05-20
-- Purpose: Allow uploading size guide images instead of just a boolean flag

-- Step 1: Add new column for size guide image URL
ALTER TABLE products ADD COLUMN size_guide_temp TEXT;

-- Step 2: Migrate existing boolean values (if true, we can't recover the image, so set to null)
-- This assumes existing products with size_guide=true will need to re-upload the image
UPDATE products SET size_guide_temp = NULL;

-- Step 3: Drop old boolean column
ALTER TABLE products DROP COLUMN size_guide;

-- Step 4: Rename new column to size_guide
ALTER TABLE products RENAME COLUMN size_guide_temp TO size_guide;

-- Step 5: Add comment
COMMENT ON COLUMN products.size_guide IS 'URL to size guide image (optional)';

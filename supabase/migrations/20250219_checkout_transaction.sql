-- Create checkout_transaction RPC
CREATE OR REPLACE FUNCTION public.checkout_transaction(
    p_user_id UUID,
    p_items JSONB, -- Array of { variant_id, quantity, product_id, price }
    p_total NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (usually postgres/service_role) to bypass RLS on stock updates if needed
AS $$
DECLARE
    item JSONB;
    v_order_id UUID;
    v_stock INT;
    v_variant_id UUID;
    v_quantity INT;
    v_product_id BIGINT;
    v_price NUMERIC;
BEGIN
    -- 1. Create the order
    INSERT INTO public.orders (user_id, total_amount, status)
    VALUES (p_user_id, p_total, 'pending')
    RETURNING id INTO v_order_id;

    -- 2. Iterate through items
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_variant_id := (item->>'variant_id')::UUID;
        v_quantity := (item->>'quantity')::INT;
        v_product_id := (item->>'product_id')::BIGINT;
        v_price := (item->>'price')::NUMERIC;

        -- Check if variant_id is provided
        IF v_variant_id IS NOT NULL THEN
            -- Lock and Check Stock for Variant
            SELECT stock_quantity INTO v_stock
            FROM public.product_variants
            WHERE id = v_variant_id
            FOR UPDATE; -- Pessimistic lock to prevent race conditions

            IF v_stock IS NULL THEN
                RAISE EXCEPTION 'Variant not found: %', v_variant_id;
            END IF;

            IF v_stock < v_quantity THEN
                 RAISE EXCEPTION 'Insufficient stock for variant %', v_variant_id;
            END IF;

            -- Decrement Stock
            UPDATE public.product_variants
            SET stock_quantity = stock_quantity - v_quantity
            WHERE id = v_variant_id;
            
        ELSE
            -- Fallback: Lock and Check Stock for Product (if no variants used)
            SELECT stock_quantity INTO v_stock
            FROM public.products
            WHERE id = v_product_id
            FOR UPDATE;

            IF v_stock IS NULL THEN
                RAISE EXCEPTION 'Product not found: %', v_product_id;
            END IF;

            IF v_stock < v_quantity THEN
                 RAISE EXCEPTION 'Insufficient stock for product %', v_product_id;
            END IF;

            -- Decrement Stock
            UPDATE public.products
            SET stock_quantity = stock_quantity - v_quantity
            WHERE id = v_product_id;
        END IF;

        -- Insert into order_items
        -- Assuming order_items has columns: order_id, product_id, variant_id, quantity, price
        -- We handle the case where order_items might not have variant_id column yet by catching error or assuming it does.
        -- For robust script, let's assume it exists or we just insert product_id.
        -- Ideally, ensure order_items table has variant_id.
        INSERT INTO public.order_items (order_id, product_id, quantity, price, variant_id)
        VALUES (v_order_id, v_product_id, v_quantity, v_price, v_variant_id);
    END LOOP;

    RETURN v_order_id;

EXCEPTION
    WHEN OTHERS THEN
        -- Transaction automatically rolls back on exception
        RAISE; -- Re-raise error to client
END;
$$;

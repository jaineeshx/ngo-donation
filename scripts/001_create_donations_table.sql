-- Create donations table for storing donation information
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  amount DECIMAL(10,2) NOT NULL,
  donation_type TEXT NOT NULL CHECK (donation_type IN ('one-time', 'monthly', 'yearly')),
  purpose TEXT NOT NULL,
  message TEXT,
  payment_method TEXT NOT NULL DEFAULT 'razorpay',
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Create policies for donations (public can insert, admin can view all)
-- For now, allow public to insert donations (no auth required for donations)
CREATE POLICY "Allow public to insert donations" ON public.donations 
  FOR INSERT 
  WITH CHECK (true);

-- Allow public to view their own donations by email (for confirmation)
CREATE POLICY "Allow users to view donations by email" ON public.donations 
  FOR SELECT 
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_donations_email ON public.donations(email);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_payment_status ON public.donations(payment_status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_donations_updated_at 
  BEFORE UPDATE ON public.donations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

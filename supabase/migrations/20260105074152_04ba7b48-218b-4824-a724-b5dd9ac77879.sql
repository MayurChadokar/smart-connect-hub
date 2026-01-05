-- Create enum for gender
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create registrations table
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT NOT NULL,
  gender gender_type NOT NULL,
  department TEXT NOT NULL,
  address TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on registrations
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for registrations
-- Allow anyone to insert (public registration form)
CREATE POLICY "Anyone can submit registrations"
ON public.registrations
FOR INSERT
WITH CHECK (true);

-- Only admins can view registrations
CREATE POLICY "Admins can view all registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update registrations
CREATE POLICY "Admins can update registrations"
ON public.registrations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete registrations
CREATE POLICY "Admins can delete registrations"
ON public.registrations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for registrations
CREATE TRIGGER update_registrations_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for registration photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('registration-photos', 'registration-photos', true);

-- Storage policies for registration photos
-- Anyone can upload photos (for registration form)
CREATE POLICY "Anyone can upload registration photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'registration-photos');

-- Anyone can view photos (public bucket)
CREATE POLICY "Anyone can view registration photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'registration-photos');

-- Only admins can delete photos
CREATE POLICY "Admins can delete registration photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'registration-photos' AND public.has_role(auth.uid(), 'admin'));
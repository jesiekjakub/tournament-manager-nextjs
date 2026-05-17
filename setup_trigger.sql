-- Mirrors freshly-confirmed auth.users rows into the public.users table so the
-- app has a canonical record to attach tournaments and participants to.
-- firstName / lastName arrive via `signUp({ options: { data } })` and are
-- exposed under raw_user_meta_data.
--
-- Run once against the Supabase project (after `prisma db push`):
--   psql "$DIRECT_URL" -f setup_trigger.sql

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, "firstName", "lastName")
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'firstName',
    NEW.raw_user_meta_data ->> 'lastName'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

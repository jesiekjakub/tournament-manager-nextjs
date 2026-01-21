-- 1. Create a function that runs when a user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, "firstName", "lastName")
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data ->> 'firstName', 
    new.raw_user_meta_data ->> 'lastName'
  );
  return new;
end;
$$;

-- 2. Create the trigger that calls the function
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
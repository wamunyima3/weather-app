# React + TypeScript + Vite and Supabase
- Create a supabase accound and create a database there. the create these tables
```sql
create table
  public.weather_cache (
    data jsonb null,
    last_fetched timestamp without time zone null,
    search_id integer not null,
    constraint weather_cache_pkey primary key (search_id),
    constraint weather_cache_search_id_fkey foreign key (search_id) references search_history (id) on update cascade on delete cascade
  ) tablespace pg_default;

  create table
  public.search_history (
    id serial not null,
    city text not null,
    country text not null,
    timestamp timestamp without time zone null default now(),
    user_id uuid not null default auth.uid (),
    constraint search_history_pkey primary key (id)
  ) tablespace pg_default;
```

- create .env file at the root of the project and  add api keys
VITE_SUPABASE_URL=https://krzoawlazrrtbaihkmli.supabase.co
VITE_SUPABASE_KEY=yourkey
VITE_WEATHERBIT_URL=https://api.weatherbit.io/v2.0
VITE_WEATHERBIT_API_KEY=yourkey


- Install the dependances
```command
npm install
```
### or

```command
yarn install
```

### start the deve

```command
npm run dev
```



# visit my portfolio at:
https://wamunyimamukelabai.vercel.app/
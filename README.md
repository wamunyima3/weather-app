```markdown
# Weather App with React, TypeScript, Vite, and Supabase

This project is a weather application built with React, TypeScript, and Vite, using Supabase for backend services and data storage.

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- A Supabase account
- A Weatherbit API key

## Setup

1. Clone the repository:
```

git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name

```plaintext

2. Install dependencies:
```

npm install

# or

yarn install

```plaintext

3. Set up Supabase:
- Create a new project in Supabase
- In your Supabase project, create the following tables:

  ```sql
  create table public.search_history (
    id serial not null,
    city text not null,
    country text not null,
    timestamp timestamp without time zone null default now(),
    user_id uuid not null default auth.uid (),
    constraint search_history_pkey primary key (id)
  );

  create table public.weather_cache (
    data jsonb null,
    last_fetched timestamp without time zone null,
    search_id integer not null,
    constraint weather_cache_pkey primary key (search_id),
    constraint weather_cache_search_id_fkey foreign key (search_id) references search_history (id) on update cascade on delete cascade
  );
```

4. Set up environment variables:

1. Create a `.env` file in the root of your project
2. Add the following variables to the `.env` file:

```plaintext
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_WEATHERBIT_URL=https://api.weatherbit.io/v2.0
VITE_WEATHERBIT_API_KEY=your_weatherbit_api_key
```




Replace `your_supabase_project_url`, `your_supabase_anon_key`, and `your_weatherbit_api_key` with your actual values.




## Running the Application

To start the development server:

```plaintext
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Building for Production

To create a production build:

```plaintext
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Additional Information

- This project uses Vite as the build tool and dev server.
- TypeScript is used for type checking and improved developer experience.
- Supabase is used for authentication and data storage.
- The Weatherbit API is used for fetching weather data.


## Troubleshooting

If you encounter any issues:

1. Ensure all environment variables are correctly set in the `.env` file.
2. Check that you have the necessary permissions in your Supabase project.
3. Verify that your Weatherbit API key is valid and has the necessary permissions.


## Learn More

To learn more about the technologies used in this project:

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Supabase Documentation](https://supabase.io/docs)
- [Weatherbit API Documentation](https://www.weatherbit.io/api)


## Author

Mukelabai Wamunyima

Visit my portfolio at: [https://wamunyimamukelabai.vercel.app/](https://wamunyimamukelabai.vercel.app/)

# live link: [weather-app-delta-lime-58.vercel.app](weather-app-delta-lime-58.vercel.app)
Use this email for testing other wise due to free limits on supabase you might fail to login
# Email
```plaintext
prepmaster03@gmail.com
```

# Password
```plaintext
123456
```
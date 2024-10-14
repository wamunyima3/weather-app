import axios, { AxiosError } from 'axios';
import { supabase } from '../supabaseClient';

interface SearchHistoryRecord {
  id: number;
  city: string;
  country: string;
  timestamp: string;
}

interface ForecastData {
  max_temp: number;
  min_temp: number;
  weather: { description: string };
  precip: number;
  uv: number;
  wind_spd: number;
  wind_cdir_full: string;
  datetime: string;
}

export const fetchSearchHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('search_history')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(5);

  if (error) throw error;

  return data as SearchHistoryRecord[];
};

export const fetchWeatherData = async (searchId: number, city: string, country: string) => {
  // Check for cached data
  const { data: cachedData, error: cacheError } = await supabase
    .from('weather_cache')
    .select('*')
    .eq('search_id', searchId);

  if (cacheError) {
    console.error('Error fetching cached data:', cacheError);
  }

  if (cachedData && cachedData.length > 0) {
    const cacheAge = new Date().getTime() - new Date(cachedData[0].last_fetched).getTime();
    const cacheIsValid = cacheAge < 10 * 60 * 1000; // 10 minutes

    if (cacheIsValid) {
      return JSON.parse(cachedData[0].data);
    }
  }

  // Fetch new data
  const currentResponse = await axios.get(`${import.meta.env.VITE_WEATHERBIT_URL}/current`, {
    params: { city, country, key: import.meta.env.VITE_WEATHERBIT_API_KEY },
  });
  const currentWeatherData = currentResponse.data.data[0];

  const forecastResponse = await axios.get(`${import.meta.env.VITE_WEATHERBIT_URL}/forecast/daily`, {
    params: { city, country, key: import.meta.env.VITE_WEATHERBIT_API_KEY, days: 16 },
  });
  const forecastData = forecastResponse.data.data;

  // Cache the new data
  const newCacheData = JSON.stringify({ current_weather: currentWeatherData, forecast: forecastData });
  await supabase
    .from('weather_cache')
    .upsert({
      search_id: searchId,
      data: newCacheData,
      last_fetched: new Date().toISOString(),
    });

  return { current_weather: currentWeatherData, forecast: forecastData };
};

export const saveSearch = async (userId: string, city: string, country: string) => {
  const { data: existingSearches, error: searchError } = await supabase
    .from('search_history')
    .select('id')
    .eq('city', city.trim())
    .eq('country', country.trim())
    .eq('user_id', userId);

  if (searchError) throw searchError;

  if (existingSearches && existingSearches.length > 0) {
    const { error: updateError } = await supabase
      .from('search_history')
      .update({ timestamp: new Date().toISOString() })
      .eq('id', existingSearches[0].id);

    if (updateError) throw updateError;
    return existingSearches[0].id;
  } else {
    const { data: newSearch, error: insertError } = await supabase
      .from('search_history')
      .insert({ city: city.trim(), country: country.trim(), user_id: userId })
      .select()
      .single();

    if (insertError) throw insertError;
    if (!newSearch) throw new Error('Failed to create new search history entry');

    return newSearch.id;
  }
};

export const clearSearchHistory = async () => {
  const { error } = await supabase
    .from('search_history')
    .delete()
    .neq('id', 0);

  if (error) throw error;
};


export const signInWithPassword = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string) => {
  const redirectTo = import.meta.env.VITE_NODE_ENV === 'production'
    ? 'https://weather-app-delta-lime-58.vercel.app/auth/callback'
    : 'http://localhost:3000/auth/callback';
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
    },
  });
  
  if (error) throw error;
  return data;
};

export const resetPasswordForEmail = async (email: string) => {
  const redirectTo = import.meta.env.VITE_NODE_ENV === 'production'
    ? 'https://weather-app-delta-lime-58.vercel.app/auth/reset-password'
    : 'http://localhost:3000/auth/reset-password';
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
  return data;
};

export const updateUserPassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data;
};
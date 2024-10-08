import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { supabase } from '../supabaseClient';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCcw, Menu, LogOut, } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import CurrentWeather from './CurrentWeather';
import Forecast from './Forecast';
import SearchHistory from './SearchHistory';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast"
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton"

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

const Dashboard: React.FC = () => {
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<ForecastData[] | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [isCurrentWeatherLoading, setIsCurrentWeatherLoading] = useState<boolean>(false);
  // const [isForecastLoading, setIsForecastLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate('/');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      fetchSearchHistory();
    }
  }, [session]);

  const fetchSearchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

      if (error) throw error;

      setSearchHistory(data as SearchHistoryRecord[]);

      if (data && data.length > 0) {
        const lastSearch = data[0];
        setCity(lastSearch.city);
        setCountry(lastSearch.country);
        await fetchWeatherData(lastSearch.id, lastSearch.city, lastSearch.country);
      }
    } catch (error) {
      console.error('Failed to fetch search history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch search history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchWeatherData = async (searchId: number, city: string, country: string) => {
    setIsLoading(true);

    try {
      // First, check if we have cached data
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
          const parsedData = JSON.parse(cachedData[0].data);
          setCurrentWeather(parsedData.current_weather);
          setForecast(parsedData.forecast);
          setIsLoading(false);
          return;
        }
      }

      // If no valid cache, fetch new data
      const currentResponse = await axios.get(`${import.meta.env.VITE_WEATHERBIT_URL}/current`, {
        params: { city, country, key: import.meta.env.VITE_WEATHERBIT_API_KEY },
      });
      const currentWeatherData = currentResponse.data.data[0];

      const forecastResponse = await axios.get(`${import.meta.env.VITE_WEATHERBIT_URL}/forecast/daily`, {
        params: { city, country, key: import.meta.env.VITE_WEATHERBIT_API_KEY, days: 16 },
      });
      const forecastData = forecastResponse.data.data;

      // Update state
      setCurrentWeather(currentWeatherData);
      setForecast(forecastData);

      // Cache the new data
      const newCacheData = JSON.stringify({ current_weather: currentWeatherData, forecast: forecastData });
      const { error: upsertError } = await supabase
        .from('weather_cache')
        .upsert({
          search_id: searchId,
          data: newCacheData,
          last_fetched: new Date().toISOString(),
        });

      if (upsertError) {
        console.error('Error upserting weather cache:', upsertError);
      }

    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          if (axiosError.response.status === 404) {
            errorMessage = "City not found. Please check the city name and country code.";
          } else if (axiosError.response.status === 429) {
            errorMessage = "Too many requests. Please try again later.";
          } else {
            errorMessage = `Server error: ${axiosError.response.status} - ${axiosError.response.statusText}`;
          }
        } else if (axiosError.request) {
          errorMessage = "No response received from the server. Please check your internet connection.";
        } else {
          errorMessage = `Error setting up the request: ${axiosError.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!city.trim() || !country.trim()) {
      toast({
        title: "Error",
        description: "Please enter both city and country.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First, check if the search already exists
      const { data: existingSearches, error: searchError } = await supabase
        .from('search_history')
        .select('id')
        .eq('city', city.trim())
        .eq('country', country.trim())
        .eq('user_id', session?.user.id);

      if (searchError) {
        console.error('Error checking existing search:', searchError);
        throw new Error('Failed to check existing search');
      }

      let searchId: number;

      if (existingSearches && existingSearches.length > 0) {
        // If the search exists, update its timestamp
        searchId = existingSearches[0].id;
        const { error: updateError } = await supabase
          .from('search_history')
          .update({ timestamp: new Date().toISOString() })
          .eq('id', searchId);

        if (updateError) {
          console.error('Error updating search history:', updateError);
          throw new Error('Failed to update search history');
        }
      } else {
        // If it's a new search, insert it and get the new ID
        const { data: newSearch, error: insertError } = await supabase
          .from('search_history')
          .insert({ city: city.trim(), country: country.trim(), user_id: session?.user.id })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting new search:', insertError);
          throw new Error('Failed to save search history');
        }

        if (!newSearch) {
          throw new Error('Failed to create new search history entry');
        }

        searchId = newSearch.id;
      }

      // Now that we have the searchId, fetch the weather data
      await fetchWeatherData(searchId, city.trim(), country.trim());

      // After fetching weather data, update the search history
      await fetchSearchHistory();

    } catch (error) {
      console.error('Error handling search:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process your search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryClick = async (searchId: number) => {
    setIsSheetOpen(false);
    const { data: searchItem, error: searchError } = await supabase
      .from('search_history')
      .select('city, country')
      .eq('id', searchId)
      .single();

    if (searchError) {
      console.error('Error fetching search history item:', searchError);
      toast({
        title: "Error",
        description: "Failed to fetch search history item.",
        variant: "destructive",
      });
      return;
    }

    if (searchItem) {
      setCity(searchItem.city);
      setCountry(searchItem.country);
      await fetchWeatherData(searchId, searchItem.city, searchItem.country);
    }
  };

  const handleClearHistory = async () => {
    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .neq('id', 0);

      if (error) {
        console.error('Failed to clear search history:', error);
        toast({
          title: "Error",
          description: "Failed to clear search history.",
          variant: "destructive",
        });
      } else {
        setSearchHistory([]);
        setCity('');
        setCountry('');
        setCurrentWeather(null);
        setForecast(null);
        toast({
          title: "Success",
          description: "Search history cleared successfully.",
        });
      }
    } catch (error) {
      console.error('Error clearing search history:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while clearing search history.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-100 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className="hidden md:block w-64 bg-white shadow-lg"
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <SearchHistory
              searchHistory={searchHistory}
              onClose={() => setIsSidebarOpen(false)}
              onHistoryClick={handleHistoryClick}
              onClearHistory={handleClearHistory}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            className="flex items-center justify-between"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">Weather App</h1>
            <div className="flex space-x-2">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden" aria-label="Open search history">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Search History</SheetTitle>
                    <SheetDescription>
                      Your recent searches are stored here
                    </SheetDescription>
                  </SheetHeader>
                  <SearchHistory
                    searchHistory={searchHistory}
                    onHistoryClick={handleHistoryClick}
                    onClearHistory={handleClearHistory}
                  />
                </SheetContent>
              </Sheet>
              {!isSidebarOpen && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="hidden md:flex" onClick={() => setIsSidebarOpen(true)} aria-label="Show search history">
                    <Menu className="h-4 w-4 mr-2" />
                    Show History
                  </Button>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" onClick={handleSignOut} aria-label="Sign out">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </motion.div>
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="flex-grow"
              aria-label="Enter city name"
            />
            <Input
              type="text"
              placeholder="Country Code"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="flex-grow"
              aria-label="Enter country code"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button type="submit" disabled={isLoading} aria-label="Search weather">
                {isLoading ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
            </motion.div>
          </motion.form>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Skeleton className="w-full h-[200px] rounded-lg bg-gray-200" />
                <Skeleton className="w-full h-[400px] mt-4 rounded-lg bg-gray-200" />
              </motion.div>
            ) : (
              <>
                {currentWeather && (
                  <motion.div
                    key="current-weather"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CurrentWeather data={currentWeather} />
                  </motion.div>
                )}
                {forecast && (
                  <motion.div
                    key="forecast"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Forecast data={forecast} />
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCcw, Menu, LogOut, } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import CurrentWeather from './CurrentWeather';
import Forecast from './Forecast';
import SearchHistory from './SearchHistory';
import { motion, AnimatePresence } from 'framer-motion';
import AuthPage from './AuthPage';
import { useToast } from "@/hooks/use-toast"
import { Session } from '@supabase/supabase-js';

// Define the types for search history and forecast data
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      fetchSearchHistory().then((data) => setSearchHistory(data));
    }
  }, [session]);



  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    })
  }

  if (!session) {
    return <AuthPage />
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      // Check if we have recent cached data
      const { data: cachedData, error: cacheError } = await supabase
        .from('weather_cache')
        .select('*')
        .eq('search_id', `${city},${country}`)
        .single();

      if (cacheError && cacheError.code !== 'PGRST116') {
        console.error('Error fetching cached data:', cacheError);
      }

      if (cachedData) {
        const cacheAge = new Date().getTime() - new Date(cachedData.last_fetched).getTime();
        const cacheIsValid = cacheAge < 10 * 60 * 1000; // 10 minutes in milliseconds

        if (cacheIsValid) {
          setCurrentWeather(cachedData.data.current_weather);
          setForecast(cachedData.data.forecast);
          return;
        }
      }

      // If no valid cache, fetch new data
      const currentResponse = await axios.get(`${import.meta.env.VITE_WEATHERBIT_URL}/current`, {
        params: { city, country, key: import.meta.env.VITE_WEATHERBIT_API_KEY },
      });
      const currentWeatherData = currentResponse.data.data[0];
      setCurrentWeather(currentWeatherData);

      const forecastResponse = await axios.get(`${import.meta.env.VITE_WEATHERBIT_URL}/forecast/daily`, {
        params: { city, country, key: import.meta.env.VITE_WEATHERBIT_API_KEY, days: 16 },
      });
      const forecastData = forecastResponse.data.data;
      setForecast(forecastData);

      // Save search to Supabase
      const { error, data: searchData } = await supabase
        .from('search_history')
        .insert([{ city, country }])
        .select()
        .single();

      if (error) {
        console.error('Error saving search history:', error);
        toast({
          title: "Error",
          description: "Failed to save search history.",
          variant: "destructive",
        });
      }

      // Save the weather data to Supabase cache
      if (searchData) {
        const { error: cacheError } = await supabase.from('weather_cache').upsert({
          search_id: searchData.id,
          data: { current_weather: currentWeatherData, forecast: forecastData },
          last_fetched: new Date().toISOString(),
        });

        if (cacheError) {
          console.error('Error saving weather data to cache:', cacheError);
          toast({
            title: "Error",
            description: "Failed to cache weather data.",
            variant: "destructive",
          });
        }
      }

      await fetchSearchHistory();
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch weather data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };



  const handleHistoryClick = async (search_id: number) => {
    setIsLoading(true);

    try {
      // Fetch the search history item
      const { data: searchItem, error: searchError } = await supabase
        .from('search_history')
        .select('city, country')
        .eq('id', search_id)
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

      if (!searchItem) {
        console.error('Search history item not found');
        toast({
          title: "Error",
          description: "Search history item not found.",
          variant: "destructive",
        });
        return;
      }

      // Check if cached weather data exists and is still valid (within 10 minutes)
      const { data: cachedData, error: cacheError } = await supabase
        .from('weather_cache')
        .select('*')
        .eq('search_id', search_id)
        .single();

      if (cacheError && cacheError.code !== 'PGRST116') {
        console.error('Error fetching cached data:', cacheError);
      }

      if (cachedData) {
        const cacheAge = new Date().getTime() - new Date(cachedData.last_fetched).getTime();
        const cacheIsValid = cacheAge < 10 * 60 * 1000; // 10 minutes in milliseconds

        if (cacheIsValid) {
          // Use cached data
          setCurrentWeather(cachedData.data.current_weather);
          setForecast(cachedData.data.forecast);
          setCity(searchItem.city);
          setCountry(searchItem.country);
          return;
        }
      }

      // If no valid cache, fetch new data
      setCity(searchItem.city);
      setCountry(searchItem.country);
      await handleSearch();

    } catch (error) {
      console.error('Error handling search history click:', error);
      toast({
        title: "Error",
        description: "Failed to process search history item.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchHistory = async (): Promise<SearchHistoryRecord[]> => {
    const { data: { user } } = await supabase.auth.getUser(); // Get the authenticated user

    if (!user) {
      console.error('No user is logged in.');
      return [];
    }

    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', user.id) // Filter by user ID
      .order('timestamp', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Failed to fetch search history:', error);
      return [];
    }

    return data as SearchHistoryRecord[];
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
            className="hidden md:block"
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <SearchHistory searchHistory={searchHistory} onClose={() => setIsSidebarOpen(false)} onHistoryClick={handleHistoryClick} />
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
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Search History</SheetTitle>
                    <SheetDescription>
                      Whatever you search is stored here
                    </SheetDescription>
                  </SheetHeader>
                  <SearchHistory searchHistory={searchHistory} onHistoryClick={handleHistoryClick} />
                </SheetContent>
              </Sheet>
              {!isSidebarOpen && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="hidden md:flex" onClick={() => setIsSidebarOpen(true)}>
                    <Menu className="h-4 w-4 mr-2" />
                    Show History
                  </Button>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" onClick={handleSignOut}>
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
            />
            <Input
              type="text"
              placeholder="Country Code"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="flex-grow"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
            </motion.div>
          </motion.form>

          <AnimatePresence>
            {currentWeather && <CurrentWeather data={currentWeather} />}
          </AnimatePresence>
          <AnimatePresence>
            {forecast && <Forecast data={forecast} />}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;

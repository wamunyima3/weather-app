import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCcw, MapPin, X, Menu, LogOut, } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import CurrentWeather from './CurrentWeather';
import Forecast from './Forecast';
import SearchHistory from './SearchHistory';
import { motion, AnimatePresence } from 'framer-motion';
import AuthPage from './AuthPage';
import { useToast } from "@/hooks/use-toast"
import { Session } from '@supabase/supabase-js';

// Define the types for search history and forecast data
interface SearchHistoryRecord {
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const currentResponse = await axios.get(`${import.meta.env.VITE_WEATHERBIT_URL}/current`, {
        params: { city, country, key: import.meta.env.VITE_WEATHERBIT_API_KEY },
      });
      setCurrentWeather(currentResponse.data.data[0]);

      const forecastResponse = await axios.get(`${import.meta.env.VITE_WEATHERBIT_URL}/forecast/daily`, {
        params: { city, country, key: import.meta.env.VITE_WEATHERBIT_API_KEY, days: 16 },
      });
      setForecast(forecastResponse.data.data);

      // Save search to Supabase
      const { error } = await supabase.from('search_history').insert([{ city, country }]);
      if (error) console.error('Error saving search history:', error);

      fetchSearchHistory();
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchHistory = async (): Promise<SearchHistoryRecord[]> => {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Failed to fetch search history:', error);
      return [];
    }

    return data as SearchHistoryRecord[]; // Ensure correct type
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
            <SearchHistory searchHistory={searchHistory} onClose={() => setIsSidebarOpen(false)} />
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
                  <SearchHistory searchHistory={searchHistory} />
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

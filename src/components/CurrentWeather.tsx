import { MapPin, Thermometer, Wind, Droplet, Sun, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from 'framer-motion';

interface CurrentWeatherProps {
  data: {
    city_name: string;
    country_code: string;
    temp: number;
    app_temp: number;
    weather: { description: string };
    wind_spd: number;
    rh: number;
    aqi: number;
    ob_time: string;
  };
}

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function CurrentWeather({ data }: CurrentWeatherProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 text-rose-500" />
            Current Weather in {data.city_name}, {data.country_code}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div className="flex items-center" variants={itemVariants}>
            <Thermometer className="mr-2 text-amber-500" />
            <span>Temperature: {data.temp}°C (Feels like: {data.app_temp}°C)</span>
          </motion.div>
          <motion.div className="flex items-center" variants={itemVariants}>
            <Sun className="mr-2 text-yellow-500" />
            <span>Weather: {data.weather.description}</span>
          </motion.div>
          <motion.div className="flex items-center" variants={itemVariants}>
            <Wind className="mr-2 text-sky-500" />
            <span>Wind Speed: {data.wind_spd} m/s</span>
          </motion.div>
          <motion.div className="flex items-center" variants={itemVariants}>
            <Droplet className="mr-2 text-blue-500" />
            <span>Humidity: {data.rh}%</span>
          </motion.div>
          <motion.div className="flex items-center" variants={itemVariants}>
            <Sun className="mr-2 text-emerald-500" />
            <span>Air Quality Index: {data.aqi}</span>
          </motion.div>
          <motion.div className="flex items-center" variants={itemVariants}>
            <Clock className="mr-2 text-purple-500" />
            <span>Observation Time: {data.ob_time}</span>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
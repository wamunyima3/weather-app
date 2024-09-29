import { MapPin, Thermometer, Wind, Droplet, Sun, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

export default function CurrentWeather({ data }: CurrentWeatherProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2" />
          Current Weather in {data.city_name}, {data.country_code}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center">
          <Thermometer className="mr-2" />
          <span>Temperature: {data.temp}°C (Feels like: {data.app_temp}°C)</span>
        </div>
        <div className="flex items-center">
          <Sun className="mr-2" />
          <span>Weather: {data.weather.description}</span>
        </div>
        <div className="flex items-center">
          <Wind className="mr-2" />
          <span>Wind Speed: {data.wind_spd} m/s</span>
        </div>
        <div className="flex items-center">
          <Droplet className="mr-2" />
          <span>Humidity: {data.rh}%</span>
        </div>
        <div className="flex items-center">
          <span>Air Quality Index: {data.aqi}</span>
        </div>
        <div className="flex items-center">
          <Clock className="mr-2" />
          <span>Observation Time: {data.ob_time}</span>
        </div>
      </CardContent>
    </Card>
  );
}
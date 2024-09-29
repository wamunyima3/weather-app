import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Adjust import paths as needed
import { MapPin } from 'lucide-react'; // Import MapPin icon

interface CurrentWeatherProps {
    data: any;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ data }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <MapPin className="mr-2" />
                    Current Weather in {data.city_name}, {data.country_code}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>Temperature: {data.temp}°C (Feels like: {data.app_temp}°C)</div>
                <div>Weather: {data.weather.description}</div>
                <div>Wind Speed: {data.wind_spd} m/s</div>
                <div>Humidity: {data.rh}%</div>
            </CardContent>
        </Card>
    );
};

export default CurrentWeather;

import React from 'react';

interface ForecastProps {
    data: any;
}

const Forecast: React.FC<ForecastProps> = ({ data }) => {
    // Check if data exists and if it has a 'data' field to map over
    if (!data || !data.length) {
        return <p>No forecast data available</p>;
    }

    return (
        <div className="bg-gray-100 p-4 rounded shadow">
            <h2 className="text-xl font-semibold">16-Day Forecast</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.map((day: any, index: number) => (
                    <div key={index} className="bg-white p-4 rounded shadow">
                        <h3>{day.datetime}</h3>
                        <p>Max Temp: {day.max_temp}°C</p>
                        <p>Min Temp: {day.min_temp}°C</p>
                        <p>Weather: {day.weather.description}</p>
                        <p>Precipitation: {day.precip} mm</p>
                        <p>UV Index: {day.uv}</p>
                        <p>Wind: {day.wind_cdir_full} at {day.wind_spd} m/s</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Forecast;

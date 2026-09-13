import React, { useState, useEffect } from 'react';
import { CloudSun, Sun, CloudRain, Wind, Droplets, Thermometer, ShieldAlert } from 'lucide-react';
import { weatherApi } from '../../services/api';
import { WeatherRecord } from '../../types';

export const WeatherPage: React.FC = () => {
  const [forecast, setForecast] = useState<WeatherRecord[]>([]);

  const fetchWeather = async () => {
    try {
      const res = await weatherApi.getForecast({ days: 7 });
      setForecast(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Weather Forecast & Impact Calibration</h1>
        <p className="text-xs text-slate-500 mt-1">
          City weather conditions converted into configurable pricing multipliers. Works seamlessly offline.
        </p>
      </div>

      {/* 7-Day Forecast Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {forecast.map((w, idx) => {
          const isGood = ['Sunny', 'Good', 'Excellent'].includes(w.weather_condition);
          const isRain = w.weather_condition.includes('Rain');
          return (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{w.date}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isGood ? 'bg-emerald-50 text-emerald-700' : isRain ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {w.weather_condition}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-3xl font-black text-slate-900">{w.temperature}°C</span>
                  <span className="text-xs font-semibold text-slate-400">Jaipur</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span>{w.humidity}% Hum</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{w.rainfall} mm Rain</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Pricing Impact</span>
                <span className={`font-extrabold ${isGood ? 'text-emerald-600' : isRain ? 'text-rose-600' : 'text-slate-600'}`}>
                  {isGood ? '+2% to +5%' : isRain ? '-5% to -10%' : '0%'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hotel Type Configuration Callout (Section 13) */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md">
        <h3 className="text-sm font-bold text-slate-100 mb-2">Hotel Business Type Sensitivity Note</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Weather influence is fully configurable. For <b>resort & heritage properties</b>, adverse weather (such as heavy monsoon showers or extreme heat) creates downward pressure on leisure traveler demand (-5% to -15%), whereas sunny pleasant winter weather boosts bookings. For <b>business hotels</b>, administrators can configure weather sensitivity to zero or low impact in Pricing Rules.
        </p>
      </div>
    </div>
  );
};

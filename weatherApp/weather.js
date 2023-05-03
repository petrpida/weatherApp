import axios from "axios";

export function getWeather(lat, lon, timezone) {
    return axios
        .get(
            "https://api.open-meteo.com/v1/forecast?hourly=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&timeformat=unixtime",
            {
                params: {
                    latitude: lat,
                    longitude: lon,
                    timezone,
                }
            }
        )
        .then(({data}) => {
            return {
                current: parseCurrentWeather(data),
                daily: parseDailyWeather(data),
                hourly: parseHourlyWeather(data),
            }
        })
}

function parseCurrentWeather({current_weather, daily, hourly_units}) {
    const {
        temperature: currentTemp,
        windspeed: windSpeed,
        weathercode: iconCode
    } = current_weather

    const highTemp = daily.temperature_2m_max[0]
    const lowTemp = daily.temperature_2m_min[0]
    const highFeelsLike = daily.apparent_temperature_max[0]
    const lowFeelsLike = daily.apparent_temperature_min[0]
    const precip = daily.precipitation_sum[0]
    const precipUnits = hourly_units.precipitation
    const tempUnits = hourly_units.temperature_2m
    const windUnits = hourly_units.windspeed_10m
    return {
        currentTemp: Math.round(currentTemp),
        highTemp: Math.round(highTemp),
        lowTemp: Math.round(lowTemp),
        highFeelsLike: Math.round(highFeelsLike),
        lowFeelsLike: Math.round(lowFeelsLike),
        windSpeed: Math.round(windSpeed),
        precip,
        precipUnits,
        tempUnits,
        windUnits,
        iconCode,
    }
}

function parseDailyWeather({daily}) {
    return daily.time.map((time, index) => {
        return {
            timestamp: time * 1000,
            iconCode: daily.weathercode[index],
            maxTemp: Math.round(daily.temperature_2m_max[index]),
        }
    })
}

function parseHourlyWeather({hourly, current_weather}) {
    return hourly.time
        .map((time, index) => {
            return {
                timestamp: time * 1000,
                iconCode: hourly.weathercode[index],
                temp: Math.round(hourly.temperature_2m[index]),
                feelsLike: Math.round(hourly.apparent_temperature[index]),
                windSpeed: Math.round(hourly.windspeed_10m[index]),
                precip: hourly.precipitation[index],
            }
        })
        .filter(({timestamp}) => timestamp >= current_weather.time * 1000)
}
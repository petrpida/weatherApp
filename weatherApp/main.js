import "./style.css"
import {getWeather} from "./weather.js";
import {ICON_MAP} from "./iconMap";

navigator.geolocation.getCurrentPosition(positionSuccess, positionError)

function positionSuccess({coords}) {
    getWeather(coords.latitude, coords.longitude, Intl.DateTimeFormat().resolvedOptions().timeZone)
        .then(renderWeather)
        .catch(e => {
            console.error(e);
            alert("Error getting weather")
        })
}

function positionError() {
    const message = "There was an error getting your location. Please allow us to use your location and refresh the page."
    console.error(message)
    alert(message)
}


function renderWeather({current, daily, hourly}) {
    renderCurrentWeather(current);
    renderDailyWeather(daily);
    renderHourlyWeather(hourly);
    document.body.classList.remove("blurred");
}

function setValue(selector, value, {parent = document} = {}) {
    parent.querySelector(`[data-${selector}]`).textContent = value
}

function getIconUrl(iconCode) {
    return `icons/${ICON_MAP.get(iconCode)}.svg`
}

const currentIcon = document.querySelector("[data-current-icon]")

function renderCurrentWeather(current) {
    currentIcon.src = getIconUrl(current.iconCode)
    setValue("current-temp", current.currentTemp)
    setValue("current-high", current.highTemp)
    setValue("current-low", current.lowTemp)
    setValue("current-fl-high", current.highFeelsLike)
    setValue("current-fl-low", current.lowFeelsLike)
    setValue("current-wind", current.windSpeed)
    setValue("current-precip", current.precip)
    setValue("current-precip-units", current.precipUnits)
    setValue("current-wind-units", current.windUnits)
}

const dayFormatter = new Intl.DateTimeFormat(undefined, {weekday: "long"})
const dailySection = document.querySelector("[data-day-section]")
const dayCardTemplate = document.getElementById("day-card-template")

function renderDailyWeather(daily) {
    dailySection.innerHTML = "";
    daily.forEach(day => {
        const element = dayCardTemplate.content.cloneNode(true);
        setValue("temp", day.maxTemp, {parent: element});
        setValue("date", dayFormatter.format(day.timestamp), {parent: element});
        element.querySelector("[data-icon]").src = getIconUrl(day.iconCode);
        dailySection.append(element);
    })
}

const hourFormatter = new Intl.DateTimeFormat(undefined, {hour: "numeric"})
const hourlySection = document.querySelector("[data-hour-section]")
const hourRowTemplate = document.getElementById("hour-row-template")

function renderHourlyWeather(hourly) {
    hourlySection.innerHTML = "";
    hourly.forEach(hour => {
        const element = hourRowTemplate.content.cloneNode(true);
        setValue("time", hourFormatter.format(hour.timestamp), {parent: element});
        setValue("day", dayFormatter.format(hour.timestamp), {parent: element});
        setValue("temp", hour.temp, {parent: element})
        setValue("fl-temp", hour.feelsLike, {parent: element})
        setValue("wind", hour.windSpeed, {parent: element})
        setValue("precip", hour.precip, {parent: element})
        element.querySelector("[data-icon]").src = getIconUrl(hour.iconCode);
        hourlySection.append(element);
    })
}

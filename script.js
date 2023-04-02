"use strict";

const apiKey = "b21d6f8a5c1de655793f2864c38dadbf";
const getLocationButton = document.querySelector(".get-current-location"),
    currentCity = document.querySelector(".current-city"),
    currentCountry = document.querySelector(".current-country"),
    currentTime = document.querySelector(".current-time"),
    searchForm = document.querySelector(".search-location"),
    inputSearch = document.querySelector(".search"),
    searchIcon = document.querySelector(".search-icon"),
    shortDate = document.querySelector(".short-date"),
    fullDate = document.querySelector(".full-date"),
    windParameter = document.querySelector(".wind-parameter"),
    rainParameter = document.querySelector(".rain-parameter"),
    pressureParameter = document.querySelector(".pressure-parameter"),
    humidityParameter = document.querySelector(".humidity-parameter"),
    currentWeatherIcon = document.querySelector(".current-weather-icon"),
    currentWeather = document.querySelector(".current-weather"),
    currentTemperature = document.querySelector(".current-temperature"),
    weatherIn1Day = document.querySelector(".first-day"),
    weatherIn2Day = document.querySelector(".second-day"),
    weatherIn3Day = document.querySelector(".third-day"),
    tempIn1Day = document.querySelector(".temp-first-day"),
    tempIn2Day = document.querySelector(".temp-second-day"),
    tempIn3Day = document.querySelector(".temp-third-day"),
    iconIn1Day = document.querySelector(".icon-first-day"),
    iconIn2Day = document.querySelector(".icon-second-day"),
    iconIn3Day = document.querySelector(".icon-third-day"),
    sunriseTime = document.querySelector(".sunrise-time"),
    sunsetTime = document.querySelector(".sunset-time"),
    sunriseWhen = document.querySelector(".sunrise-when"),
    sunsetWhen = document.querySelector(".sunset-when"),
    getLocationBtn = document.querySelector(".get-location"),
    container = document.querySelector(".container"),
    loginContainer = document.querySelector(".backdrop"),
    errorLocationMessageLogin = document.querySelector(".error-location"),
    errorCityName = document.querySelector(".invalid-city-name");
let myChart = null;

// prettier-ignore
const days = ["Sunday", "Monday", "Tuesday", 'Wednesday','Thursday','Friday','Saturday'];
// prettier-ignore
const months = ["January",'February','March','April','May','June','July','August','September','October','November','December'];

const getCurrentPosition = () => {
    navigator.geolocation.getCurrentPosition(getPosition, errorPosition);
};

const getCityName = (data) => {
    return data.city.name;
};

const getCountryName = (data) => {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(data.city.country);
};

const getCurrentDate = (timezone) => {
    const date = new Date();
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const cityTimezone = timezone * 1000;
    return new Date(date.getTime() + timezoneOffset + cityTimezone);
};

const getCurrentTime = (timezone) => {
    const date = getCurrentDate(timezone);
    const hour = date.getHours();
    const min = date.getMinutes();
    return `${String(hour > 12 ? hour % 12 : hour).padStart(2, 0)}:${String(
        min
    ).padStart(2, 0)} ${hour > 12 ? "PM" : "AM"}`;
};

const shortDateFormat = (timezone) => {
    const date = getCurrentDate(timezone);
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

const longDateFormat = (timezone) => {
    const date = getCurrentDate(timezone);
    return `${days[date.getDay()]}, ${months[date.getMonth()].slice(
        0,
        3
    )} ${date.getDate()}, ${date.getFullYear()}`;
};

const calcTemperature = (temp) => {
    return `${Math.round(temp - 273)} °C`;
};

const weatherInNext3Days = (timezone) => {
    const data = getCurrentDate(timezone);
    const dayIndex = data.getDay();
    weatherIn1Day.innerHTML = `${String(
        days[dayIndex + 1 > 6 ? (dayIndex + 1) % 7 : dayIndex + 1]
    ).slice(0, 3)}`;
    weatherIn2Day.innerHTML = `${String(
        days[dayIndex + 2 > 6 ? (dayIndex + 2) % 7 : dayIndex + 2]
    ).slice(0, 3)}`;
    weatherIn3Day.innerHTML = `${String(
        days[dayIndex + 3 > 6 ? (dayIndex + 3) % 7 : dayIndex + 3]
    ).slice(0, 3)}`;
};

const calcNextTemp = (data, nextDayValue) => {
    const item = data.filter((day) => new Date(day.dt_txt).getHours() === 12);
    if (nextDayValue === 1) return calcTemperature(item[0].main.temp);
    if (nextDayValue === 2) return calcTemperature(item[1].main.temp);
    if (nextDayValue === 3) return calcTemperature(item[2].main.temp);
};

const calcNextIcon = (data, nextDayValue) => {
    const item = data.filter((day) => new Date(day.dt_txt).getHours() === 12);
    if (nextDayValue === 1) return item[0].weather[0].icon;
    if (nextDayValue === 2) return item[1].weather[0].icon;
    if (nextDayValue === 3) return item[2].weather[0].icon;
};

const temperatureInNext3Days = (data) => {
    tempIn1Day.innerHTML = calcNextTemp(data, 1);
    tempIn2Day.innerHTML = calcNextTemp(data, 2);
    tempIn3Day.innerHTML = calcNextTemp(data, 3);
};

const iconInNext3Days = (data) => {
    iconIn1Day.src = `http://openweathermap.org/img/wn/${calcNextIcon(
        data,
        1
    )}@2x.png`;
    iconIn2Day.src = `http://openweathermap.org/img/wn/${calcNextIcon(
        data,
        2
    )}@2x.png`;
    iconIn3Day.src = `http://openweathermap.org/img/wn/${calcNextIcon(
        data,
        3
    )}@2x.png`;
};

const selectSunriseSunsetTime = (time, timezone) => {
    const sunriseSunsetPar = time;
    const date = new Date(sunriseSunsetPar * 1000);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const cityTimezone = timezone * 1000;
    const eventTime = new Date(date.getTime() + timezoneOffset + cityTimezone);
    return {
        time: eventTime,
        sunriseSunsetResponse: `${String(
            eventTime.getHours() > 12
                ? eventTime.getHours() % 12
                : eventTime.getHours()
        ).padStart(2, 0)}:${String(eventTime.getMinutes()).padStart(2, 0)} ${
            eventTime.getHours() > 12 ? "PM" : "AM"
        }`,
    };
};

const calcWhenSunsiseSunset = (time, timezone) => {
    const eventTime = selectSunriseSunsetTime(time, timezone).time;
    const eventTimeDate = eventTime.getTime();
    const currentTime = getCurrentDate(timezone);
    const currentTimeDate = currentTime.getTime();
    if (currentTimeDate > eventTimeDate) {
        return `${currentTime.getHours() - eventTime.getHours()} hours ago`;
    } else {
        return `in ${eventTime.getHours() - currentTime.getHours()} hours`;
    }
};

const createLineChart = (data) => {
    const datasets = data.filter(
        (day) =>
            new Date(day.dt_txt).getHours() === 9 ||
            new Date(day.dt_txt).getHours() === 21
    );
    const dataLabel = datasets
        .map((data) => new Date(data.dt * 1000))
        .map(
            (data) =>
                `${String(data.getDate()).padStart(2, 0)}.${String(
                    data.getMonth() + 1
                ).padStart(2, 0)} ${String(data.getHours()).padStart(
                    2,
                    0
                )}:${String(data.getMinutes()).padStart(2, 0)}`
        )
        .slice(0, 8);
    const tempData = datasets
        .map((data) => calcTemperature(data.main.temp))
        .map((data) => data.substring(0, data.indexOf(" ")));

    const dataChart = {
        labels: dataLabel,
        datasets: [
            {
                label: "Weather in next days",
                backgroundColor: "#3374be",
                borderColor: "#3374be",
                data: tempData,
            },
        ],
    };
    const config = {
        type: "line",
        data: dataChart,
        options: {},
    };
    const ctx = document.getElementById("temp-graph").getContext("2d");
    if (myChart != null) {
        myChart.destroy();
    }
    myChart = new Chart(ctx, config);
};

const updateUI = (data) => {
    currentCity.innerHTML = getCityName(data);
    currentCountry.innerHTML = getCountryName(data);
    currentTime.innerHTML = getCurrentTime(data.city.timezone);
    shortDate.innerHTML = shortDateFormat(data.city.timezone);
    fullDate.innerHTML = longDateFormat(data.city.timezone);
    windParameter.innerHTML = `${data.list[0].wind.speed} km/h`;
    rainParameter.innerHTML = `${data.list[0].pop * 100} %`;
    pressureParameter.innerHTML = `${data.list[0].main.pressure} hPa`;
    humidityParameter.innerHTML = `${data.list[0].main.humidity} %`;
    currentWeatherIcon.src = `http://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png`;
    currentWeather.innerHTML = data.list[0].weather[0].main;
    currentTemperature.innerHTML = calcTemperature(data.list[0].main.temp);
    weatherInNext3Days(data.city.timezone);
    temperatureInNext3Days(data.list);
    iconInNext3Days(data.list);
    sunriseTime.innerHTML = selectSunriseSunsetTime(
        data.city.sunrise,
        data.city.timezone
    ).sunriseSunsetResponse;
    sunsetTime.innerHTML = selectSunriseSunsetTime(
        data.city.sunset,
        data.city.timezone
    ).sunriseSunsetResponse;
    sunriseWhen.innerHTML = calcWhenSunsiseSunset(
        data.city.sunrise,
        data.city.timezone
    );
    sunsetWhen.innerHTML = calcWhenSunsiseSunset(
        data.city.sunset,
        data.city.timezone
    );
    createLineChart(data.list);
};

const getPositionByCoords = async (pos) => {
    const { latitude, longitude } = pos;
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude.toFixed(
            2
        )}&lon=${longitude.toFixed(2)}&appid=${apiKey}`
    );

    const data = await response.json();
    updateUI(data);
};

const getPosition = (pos) => {
    container.style.display = "block";
    loginContainer.style.display = "none";
    const position = pos.coords;
    getPositionByCoords(position);
};

const errorPosition = () => {
    errorLocationMessageLogin.style.display = "flex";
};

document.addEventListener("click", () => {
    errorLocationMessageLogin.style.display = "none";
});

getLocationButton.addEventListener("click", () => {
    getCurrentPosition();
});

const getPositionByCityName = async (cityName) => {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}`
    );

    if (response.status === 404) {
        errorCityName.classList.remove("hidden");
    }
    const data = await response.json();
    updateUI(data);
};

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    getPositionByCityName(inputSearch.value);
    inputSearch.value = "";
});

searchIcon.addEventListener("click", () => {
    getPositionByCityName(inputSearch.value);
    inputSearch.value = "";
});

getLocationBtn.addEventListener("click", () => {
    getCurrentPosition();
});

inputSearch.addEventListener("keydown", () => {
    errorCityName.classList.add("hidden");
});

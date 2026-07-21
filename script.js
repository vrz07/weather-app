/* ==========================================
   API CONFIGURATION
========================================== */

console.log("Weather app JavaScript loaded");


/* ==========================================
   ELEMENTS
========================================== */

const cityInput =
document.getElementById("cityInput");

const searchBtn =
document.getElementById("searchBtn");

const locationBtn =
document.getElementById("locationBtn");

const cityName =
document.getElementById("cityName");

const date =
document.getElementById("date");

const weatherIcon =
document.getElementById("weatherIcon");

const temperature =
document.getElementById("temperature");

const condition =
document.getElementById("condition");

const description =
document.getElementById("description");

const feels =
document.getElementById("feels");

const humidity =
document.getElementById("humidity");

const wind =
document.getElementById("wind");

const visibility =
document.getElementById("visibility");

const forecast =
document.getElementById("forecast");

const loading =
document.getElementById("loading");

const historyList =
document.getElementById("historyList");

const errorMessage =
document.getElementById("errorMessage");

const clearHistory =
document.getElementById("clearHistory");

const themeToggle =
document.getElementById("themeToggle");

const celsiusBtn =
document.getElementById("celsiusBtn");

const fahrenheitBtn =
document.getElementById("fahrenheitBtn");



/* ==========================================
   VARIABLES
========================================== */

let unit =
"metric";


let currentTemp =
0;


let currentWeatherData =
null;


let currentCity =
"";


let currentLocation =
null;


let history =
JSON.parse(
    localStorage.getItem(
        "weatherHistory"
    )
) || [];



/* ==========================================
   SEARCH WEATHER
========================================== */

searchBtn.addEventListener(
    "click",
    function(){

        const city =
        cityInput.value.trim();


        if(city === ""){

            showError("Please enter a city name");

            return;

        }


        getWeather(city);

    }
);



/* ==========================================
   ENTER KEY SEARCH
========================================== */

cityInput.addEventListener(
    "keypress",
    function(event){

        if(
            event.key === "Enter"
        ){

            searchBtn.click();

        }

    }
);



/* ==========================================
   GET WEATHER
========================================== */

async function getWeather(
    city
){

    try{

        showLoading(true);


        searchBtn.disabled =
        true;


        searchBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Loading...
        `;


        const response =
        await fetch(
           `/api/weather?city=${encodeURIComponent(city)}&units=${unit}`
        );


        if(
            !response.ok
        ){

            throw new Error(
                "City not found"
            );

        }


        const data =
        await response.json();


        currentCity =
        data.name;


        currentLocation = {

            lat:
            data.coord.lat,

            lon:
            data.coord.lon

        };


        currentWeatherData =
        data;


        displayWeather(
            data
        );


        await getForecast(

            data.coord.lat,

            data.coord.lon

        );


        saveHistory(
            data.name
        );

    }


    catch(error){

        showError(error.message);

    }


    finally{

        showLoading(
            false
        );


        searchBtn.disabled =
        false;


        searchBtn.innerHTML = `
            <i class="fa-solid fa-search"></i>
            Search
        `;

    }

}



/* ==========================================
   DISPLAY WEATHER
========================================== */

function displayWeather(
    data
){

    currentWeatherData =
    data;


    cityName.innerHTML =
    `${data.name}, ${data.sys.country}`;


    date.innerHTML =
    new Date().toLocaleDateString(
        "en-US",
        {

            weekday:
            "long",

            month:
            "long",

            day:
            "numeric"

        }
    );


    weatherIcon.src =
    `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;


    weatherIcon.alt =
    data.weather[0].description;


    currentTemp =
    data.main.temp;


    temperature.innerHTML =
    `${Math.round(currentTemp)}°${
        unit === "metric"
        ? "C"
        : "F"
    }`;


    condition.innerHTML =
    data.weather[0].main;


    description.innerHTML =
    data.weather[0].description;


    feels.innerHTML =
    `${Math.round(
        data.main.feels_like
    )}°`;


    humidity.innerHTML =
    `${data.main.humidity}%`;


    wind.innerHTML =
    `${data.wind.speed} ${
        unit === "metric"
        ? "m/s"
        : "mph"
    }`;


    visibility.innerHTML =
    `${(
        data.visibility / 1000
    ).toFixed(1)} km`;

}



/* ==========================================
   FORECAST
========================================== */

async function getForecast(lat, lon) {

    try {

        const response = await fetch(
                `/api/forecast?lat=${lat}&lon=${lon}&units=${unit}`
        );

        if (!response.ok) {
            throw new Error("Forecast unavailable");
        }

        const data = await response.json();

        forecast.innerHTML = "";

        const days = [];

        data.list.forEach(function (item) {

            const forecastDate = new Date(item.dt_txt);

            const day = forecastDate.toDateString();

            // Skip today's remaining forecast
            const today = new Date().toDateString();

            if (
                !days.includes(day) &&
                day !== today
            ) {

                days.push(day);

                const card = document.createElement("div");

                card.className = "forecast-card";

                card.innerHTML = `

                    <h4>
                        ${forecastDate.toLocaleDateString(
                            "en-US",
                            {
                                weekday: "short"
                            }
                        )}
                    </h4>

                    <img
                        src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png"
                        alt="${item.weather[0].description}"
                    >

                    <h3>
                        ${Math.round(item.main.temp)}°
                    </h3>

                    <p>
                        ${item.weather[0].main}
                    </p>

                `;

                forecast.appendChild(card);

            }

        });

    }

    catch (error) {

        console.log(
            "Forecast error:",
            error
        );

    }

}



/* ==========================================
   CURRENT LOCATION WEATHER
========================================== */

locationBtn.addEventListener(
    "click",
    function(){

        locationBtn.disabled =
        true;


        locationBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Getting Location...
        `;


        navigator.geolocation.getCurrentPosition(

            function(position){

                getWeatherByLocation(

                    position.coords.latitude,

                    position.coords.longitude

                );

            },

            function(){

                 showError(
                     "Location permission denied"
                 );
             
             
                 locationBtn.disabled =
                 false;

                locationBtn.innerHTML = `
                    <i class="fa-solid fa-location-crosshairs"></i>
                    Use My Location
                `;

            }

        );

    }
);



async function getWeatherByLocation(
    lat,
    lon
){

    try{

        showLoading(
            true
        );


        const response =
        await fetch(
            `/api/weather?lat=${lat}&lon=${lon}&units=${unit}`
        );


        if(
            !response.ok
        ){

            throw new Error(
                "Unable to get weather data"
            );

        }


        const data =
        await response.json();


        currentCity =
        data.name;


        currentLocation = {

            lat:
            lat,

            lon:
            lon

        };


        currentWeatherData =
        data;


        displayWeather(
            data
        );


        await getForecast(
            lat,
            lon
        );


        saveHistory(
            data.name
        );

    }


   catch(error){

    showError(
        error.message
    );

    }


    finally{

        showLoading(
            false
        );


        locationBtn.disabled =
        false;


        locationBtn.innerHTML = `
            <i class="fa-solid fa-location-crosshairs"></i>
            Use My Location
        `;

    }

}



/* ==========================================
   CELSIUS BUTTON
========================================== */

celsiusBtn.addEventListener(
    "click",
    function(){

        if(
            unit === "metric"
        ){

            return;

        }


        unit =
        "metric";


        celsiusBtn.classList.add(
            "active"
        );


        fahrenheitBtn.classList.remove(
            "active"
        );


        reloadCurrentWeather();

    }
);



/* ==========================================
   FAHRENHEIT BUTTON
========================================== */

fahrenheitBtn.addEventListener(
    "click",
    function(){

        if(
            unit === "imperial"
        ){

            return;

        }


        unit =
        "imperial";


        fahrenheitBtn.classList.add(
            "active"
        );


        celsiusBtn.classList.remove(
            "active"
        );


        reloadCurrentWeather();

    }
);



/* ==========================================
   RELOAD WEATHER AFTER UNIT CHANGE
========================================== */

function reloadCurrentWeather(){

    if(
        currentLocation !== null
    ){

        getWeatherByLocation(

            currentLocation.lat,

            currentLocation.lon

        );

    }


    else if(
        currentCity !== ""
    ){

        getWeather(
            currentCity
        );

    }

}



/* ==========================================
   DARK MODE
========================================== */

themeToggle.addEventListener(
    "click",
    function(){

        document.body.classList.toggle(
            "dark"
        );


        const isDark =
        document.body.classList.contains(
            "dark"
        );


        localStorage.setItem(
            "theme",
            isDark
        );

    }
);



/* ==========================================
   LOAD SAVED THEME
========================================== */

if(
    localStorage.getItem(
        "theme"
    ) === "true"
){

    document.body.classList.add(
        "dark"
    );

}



/* ==========================================
   SEARCH HISTORY
========================================== */

function saveHistory(
    city
){

    const cityExists =
    history.some(
        function(item){

            return item.toLowerCase()
            === city.toLowerCase();

        }
    );


    if(
        !cityExists
    ){

        history.unshift(
            city
        );


        history =
        history.slice(
            0,
            5
        );


        localStorage.setItem(

            "weatherHistory",

            JSON.stringify(
                history
            )

        );

    }


    displayHistory();

}



/* ==========================================
   DISPLAY HISTORY
========================================== */

function displayHistory(){

    historyList.innerHTML =
    "";


    history.forEach(
        function(city){

            const item =
            document.createElement(
                "div"
            );


            item.className =
            "history-item";


            item.innerHTML =
            `
                <i class="fa-solid fa-clock-rotate-left"></i>
                ${city}
            `;


            item.addEventListener(
                "click",
                function(){

                    cityInput.value =
                    city;


                    getWeather(
                        city
                    );

                }
            );


            historyList.appendChild(
                item
            );

        }
    );

}



displayHistory();



/* ==========================================
   CLEAR SEARCH HISTORY
========================================== */

clearHistory.addEventListener(
    "click",
    function(){

        history =
        [];

        localStorage.removeItem(
            "weatherHistory"
        );

        displayHistory();

    }
);



/* ==========================================
   LOADING
========================================== */

function showLoading(
    state
){

    loading.style.display =
    state
    ? "block"
    : "none";

}

/* ==========================================
   ERROR MESSAGE
========================================== */

function showError(
    message
){

    errorMessage.innerHTML = `
        <i class="fa-solid fa-circle-exclamation"></i>
        ${message}
    `;


    errorMessage.classList.add(
        "show"
    );


    setTimeout(
        function(){

            errorMessage.classList.remove(
                "show"
            );

        },
        4000
    );

}
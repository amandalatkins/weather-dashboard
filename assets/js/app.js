// Global variables
var searchHistory = ["San Francisco","New York","Dallas"];
var currentCity;
var uvi;

var apiKey = "b28f5f2d03105fb62d4a0da76660b846";
apiKey = "166a433c57516f51dfab1f7edaed8413";

init();

function init() {
    getSearchHistory();
    getCurrentCity();
    renderSearchHistory();
}

// FUNCTIONS RELATED TO SEARCH HISTORY ===========================================================

function renderSearchHistory() {
    $('.historyContainer').empty();
    searchHistory.forEach(function(city) {
        var newBtn = $('<button>').addClass('cityBtn').val(city).text(city);
        if (city === currentCity) {
            newBtn.addClass('current');
        }
        $('.historyContainer').append(newBtn);
    });
}

function getSearchHistory() {
    var localHistory = localStorage.getItem('searchHistory');
    if (localHistory) {
        searchHistory = JSON.parse(localHistory);
    } else {
        storeSearchHistory();
    }
}

function storeSearchHistory() {
    localStorage.setItem('searchHistory',JSON.stringify(searchHistory));
}

function getCurrentCity() {
    currentCity = searchHistory[0];
}

function addNewCity() {
    searchHistory.unshift(currentCity);
    // Let's only keep 8 cities at a time, so if the length has gotten to 9
    if (searchHistory.length == 9) {
        // Drop the last element from the array
        searchHistory.splice(8,1);
    }
    storeSearchHistory();
    renderSearchHistory();
}

// FUNCTIONS RELATED TO ACTUALLY SEARCHING AND RENDERING RESULTS

function initSearch(e) {
    var searchField = $('#searchField');
    if (e.target.matches('button')) {   
        if ($(e.target).attr('id') === "searchBtn") {
            if (searchField.val() === "") {
                return;
            }
            currentCity = searchField.val();
            addNewCity();
        } else {
            currentCity = $(e.target).val();
        }
    } 
    // Else if there was an enter key pressed while in the search field
    else if (e.keyCode === 13) {
        if (searchField.val() === "") {
            return;
        }
        currentCity = searchField.val();
        addNewCity();
    }
    runSearch();
}

function runSearch() {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q="+currentCity+"&units=imperial&appid="+apiKey;
    runAjax(queryURL, renderCurrentWeather);

    queryURL = "https://api.openweathermap.org/data/2.5/forecast/daily?q="+currentCity+"&units=imperial&cnt=5&appid="+apiKey;
    runAjax(queryURL, renderForecast);
}

function renderCurrentWeather(weatherObj) {
    // console.log(weatherObj);
    var temp = Math.round(weatherObj.main.temp)+"°F";
    var humidity = weatherObj.main.humidity+"%";
    var wind = weatherObj.wind.speed + "mph";
    getUVI(weatherObj.coord.lat, weatherObj.coord.lon);

    $('#cityTitle').text(currentCity)
    // $('#currentDay'
    $('#cityTemp').text(temp);
    $('#cityUVI').html('UVI: '+uvi);
    $('#cityHumidity').text(humidity);
    $('#cityWind').text(wind);
}

function renderForecast(forecastObj) {
    // console.log(forecastObj);
    $('#fiveDayWeather').empty();
    var forecast = forecastObj.list;
    // console.log(forecast);
    forecast.forEach(function(day) {
    //    console.log(day);
        var newDay = $('<div>').addClass('fiveDayItem');
        newDay.append('<div class="theDate">'+convertToday(day.dt)+'</div>');
        newDay.append('<div class="theImage">'+getWeatherIcon(day.weather[0].main)+'</div>');
        newDay.append('<div class="theTemp">'+Math.round(day.temp.day)+'°F</div>');
        newDay.append('<div class="theHumidity">'+day.humidity+'%</div>');
        $('#fiveDayWeather').append(newDay);
    });
}

function getWeatherIcon(weather) {
    return weather;
}

function runAjax(query, method) {
    $.ajax({
        url: query,
        method: "GET"
    }).then(method);
}

function getUVI(lat,lon) {
    // var queryURL = "https://api.openweathermap.org/data/2.5/uvi/history?lat="+lat+"&lon="+lon+"&cnt=1&start="+Math.round(new Date("2019/12/10 12:00:00").getTime()/1000)+"&appid="+apiKey;
    var queryURL = "http://api.openweathermap.org/data/2.5/uvi?lat="+lat+"&lon="+lon+"&appid="+apiKey;
    runAjax(queryURL, makeUVIObject);
}

function makeUVIObject(uviObj) {
    var val = uviObj.value;
    console.log(val);

    if (val <= 3) {
        console.log('uvi is less tahn 3');
        uvi = '<span class="green">'+val+'</span>';
    } else if (val <= 6) {
        uvi = '<span class="yellow">'+val+'</span>';
    } else if (val <= 8) {
        uvi = '<span class="orange">'+val+'</span>';
    } else {
        uvi = '<span class="red">'+val+'</span>';
    }

}

function convertToday(unix) {
    return moment(unix,'X').format('M/D/YYYY');
}

// Event listeners
$(document).on('click','#searchContainer',initSearch);
$('#searchField').on('keyup',initSearch);

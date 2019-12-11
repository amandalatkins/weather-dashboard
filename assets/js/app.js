// Global variables
var searchHistory = ["San Francisco","New York","Dallas"];
var currentCity;

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
    console.log(weatherObj);
    var UVI = getUVI(weatherObj.coord.lat, weatherObj.coord.lon);
}

function renderForecast(forecastObj) {
    // console.log(forecastObj);
}

function runAjax(query, method) {
    $.ajax({
        url: query,
        method: "GET"
    }).then(method);
}

function getUVI(lat,lon) {
    console.log(lat,lon);
    // var queryURL = "https://api.openweathermap.org/data/2.5/uvi/history?lat="+lat+"&lon="+lon+"&cnt=1&start="+Math.round(new Date("2019/12/10 12:00:00").getTime()/1000)+"&appid="+apiKey;
    // var queryURL = "http://api.openweathermap.org/data/2.5/uvi/forecast?lat="+lat+"&lon="+lon+"&cnt=3&appid="+apiKey;
    // return runAjax(queryURL, makeUVIObject);
}

function makeUVIObject(uvi) {
    console.log(uvi);
}

// Event listeners
$(document).on('click','#searchContainer',initSearch);
$('#searchField').on('keyup',initSearch);

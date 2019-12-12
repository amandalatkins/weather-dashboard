// Global variables
var searchHistory = [];
var currentCity;
var uvi;

var apiKey = "b28f5f2d03105fb62d4a0da76660b846";
apiKey = "166a433c57516f51dfab1f7edaed8413";

init();

function init() {
    getSearchHistory();
    getCurrentCity();
    renderSearchHistory();
    // renderCurrentWeather();
    if (!currentCity || currentCity === "") {
        setDefaults();
    }
}

// BUG FIX: Handle "404" errors

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
    if (!searchHistory[0] || searchHistory[0] === "") {
        
    } else {
        currentCity = searchHistory[0];
        runSearch();
    }
}

function getGeoLocation() {
    $('body').css('cursor','wait');
    window.navigator.geolocation.getCurrentPosition(locAllowed,locDenied);
}

function locAllowed(position) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?appid="+apiKey+"&lat="+position.coords.latitude+"&lon="+position.coords.longitude+"&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        $('body').css('cursor','default');
        currentCity = response.name;
        renderCurrentWeather(response);
    });
    // runAjax(queryURL, renderCurrentWeather);
}

function locDenied(error) {
    $('body').css('cursor','default');
}

function addNewCity() {
    if (searchHistory.indexOf(currentCity) === -1) {
        searchHistory.unshift(currentCity);
        // Let's only keep 10 cities at a time, so if the length has gotten to 11
        if (searchHistory.length == 11) {
            // Drop the last element from the array
            searchHistory.splice(8,1);
        }
    } else {
        searchHistory.splice(searchHistory.indexOf(currentCity), 1);
        searchHistory.unshift(currentCity);
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
            searchField.val('');
            runSearch();
            if ($(window).width() < 992) {
            toggleMobileSearch();
        }
        } else if ($(e.target).attr('id') !== "currentLocation") {
            currentCity = $(e.target).val();
            searchField.val('');
            runSearch();
            if ($(window).width() < 992) {
                toggleMobileSearch();
            }
        }
    } 
    // Else if there was an enter key pressed while in the search field
    else if (e.keyCode === 13) {
        if (searchField.val() === "") {
            return;
        }
        currentCity = searchField.val();
        runSearch();
        if ($(window).width() < 992) {
            toggleMobileSearch();
        }
    }

}

function runSearch() {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q="+currentCity;
    // San Francisco returns San Francisco, Columbia, so just for the purposes of this exercise, let's display our SF weather
    if (currentCity === "San Francisco") {
        queryURL += ",US";
    }
    queryURL += "&units=imperial&appid="+apiKey;
    runAjax(queryURL, renderCurrentWeather);
}

function renderCurrentWeather(weatherObj) {
    currentCity = weatherObj.name;
    addNewCity();
    setUVI(weatherObj.coord.lat, weatherObj.coord.lon);
    var temp = Math.round(weatherObj.main.temp)+"°";
    var humidity = weatherObj.main.humidity+"%";
    var wind = Math.round(weatherObj.wind.speed) + " mph";

    $('#cityTitle').text(currentCity);
    $('#currentDay').text(convertToday(weatherObj.dt,weatherObj.timezone, 'dddd, MMMM D ∙ h:mma'));
    $('#cityTemp').text(temp);
    $('#cityConditions').text(weatherObj.weather[0].description);
    $('#cityIcon').html("<img src='"+getWeatherIcon(weatherObj.weather[0].icon)+"'/>");
    $('#cityHumidity').html("<h6>Humidity</h6>"+humidity);
    $('#cityWind').html("<h6>Wind Speed</h6>"+wind);

    queryURL = "https://api.openweathermap.org/data/2.5/forecast/daily?q="+currentCity+"&units=imperial&cnt=5&appid="+apiKey;
    runAjax(queryURL, renderForecast);

    getCityImage();
}

function renderForecast(forecastObj) {
    // console.log(forecastObj);
    $('#fiveDayWeather').empty();
    var forecast = forecastObj.list;
    var newRow = $('<div>').addClass('row');
    var i = 0;
    forecast.forEach(function(day) {

        var newCol = $('<div>').addClass('col-xs-12 col-md');
        var newDay = $('<div>').addClass('fiveDayItem'); 
        newDay.append('<div class="theDate">'+convertToday(day.dt, null, 'MMM D')+'</div>');
        newDay.append('<div class="theImage"><img src="'+getWeatherIcon(day.weather[0].icon)+'"/></div>');
        newDay.append('<div class="theTemp">'+Math.round(day.temp.day)+'°</div>');
        newDay.append('<div class="theHumidity">'+day.humidity+'% Humidity</div>');
        newCol.append(newDay);
        newRow.append(newCol);
    });
    $('#fiveDayWeather').append(newRow);
}

function getWeatherIcon(weather) {
    return 'http://openweathermap.org/img/wn/'+weather+'@2x.png';
}

function getCityImage() {
    var queryURL = "http://api.teleport.org/api/cities/?search="+currentCity;

    var cityUrl;
    var imageUrl;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        cityUrl = response["_embedded"]['city:search-results'][0]["_links"]["city:item"].href;
        $.ajax({
            url: cityUrl
        }).then(function(response) { 
            console.log(response);
            
            if (!response["_links"]["city:urban_area"]) {
                $('#weatherBackground').attr('style','background-image:url("'+getDefaultPicture(true)+'")');
            } else {
                imageUrl = response["_links"]["city:urban_area"].href+"images";
                $.ajax({
                    url: imageUrl,
                    method: "GET"
                }).then(function(response) {
                    console.log(response);
                    if ($(window).width() < 992) {
                        renderCityBackground(response.photos[0].image.mobile);
                    } else {
                        renderCityBackground(response.photos[0].image.web);
                    }
                });
            }
            
        });
    });
    
}

function renderCityBackground(imgUrl) {
    $('#weatherBackground').attr('style','background-image: url("'+imgUrl+'")');
}

function runAjax(query, method) {
    $.ajax({
        url: query,
        method: "GET"
    }).then(method);
}

function setUVI(lat,lon) {
    var queryURL = "http://api.openweathermap.org/data/2.5/uvi?lat="+lat+"&lon="+lon+"&appid="+apiKey;
    runAjax(queryURL, handleUVIObject);
}

function handleUVIObject(uviObj) {
    var val = uviObj.value;

    var uviDiv = $('#cityUVI');
    var level = "";

    if (val <= 3) {
        level = "green";
    } else if (val <= 6) {
        level = "yellow";
    } else if (val <= 8) {
        level = "orange";
    } else if (val <= 10) {
        level = "red";
    } else {
        level = "purple";
    }
    uviDiv.html('<h6>UV Index</h6><span class="'+level+'">'+val+'</span>');
}

function convertToday(unix, utc, format) {
    if (utc) {
        var utc = utc/60;
        return moment.utc().utcOffset(utc).format(format);
    } else {
        return moment.unix(unix).format(format);
    }
}

function setDefaults() {
    $('#weatherBackground').attr('style','background-image:url("'+getDefaultPicture(false)+'")');
}

function getDefaultPicture(isCurrentCity) {
    var hour = getHour();
    var imgUrl;
    if (hour <= 5 || hour >= 20) {

        if (!isCurrentCity) {
            $('#cityTitle').text('Good Night');
        }

        imgUrl = "https://images.unsplash.com/photo-1516191726963-61dae894c237?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2250&q=80";

    } 
    else if (hour > 5 && hour < 12) {
        if (!isCurrentCity) {
            $('#cityTitle').text('Good Morning');
        }
        imgUrl = "https://images.unsplash.com/photo-1519196806608-94026ab75b53?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2249&q=80";
    } 
    else if (hour >= 12 && hour < 18) {
        if (!isCurrentCity) {
            $('#cityTitle').text('Good Afternoon');
        }
        imgUrl = "https://images.unsplash.com/photo-1567533905227-039caf02237a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1934&q=80";
    } 
    else {
        if (!isCurrentCity) {
            $('#cityTitle').text('Good Evening');
        }
        imgUrl = "https://images.unsplash.com/photo-1540875880199-425bbbc17b24?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2250&q=80";
    }
    if (!isCurrentCity) {
        $('#currentDay').text('Use the search box to choose a city or click the arrow icon to use your current location.');
    }
    return imgUrl;
}

function getHour() {
    return moment().format('k');
}

function toggleMobileSearch() {
    var searchContainer = $('#searchContainer');
    var curState = searchContainer.css('display');
    if (curState === "block") {
        searchContainer.fadeOut('fast');
    } else if (curState === "none") {
        searchContainer.fadeIn('fast');
    }
}

// Event listeners
$(document).on('click','#searchContainer',initSearch);
$('#searchField').on('keyup',initSearch);
$('#currentLocation').on('click',getGeoLocation);
$('.navbar-toggler').on('click',toggleMobileSearch);


// teleport.org api
// Get city photos
// http://api.teleport.org/api/cities/?search=San+Francisco

// then use urban areas link from returned + /images
// http://api.teleport.org/api/urban_areas/slug:san-francisco-bay-area/images
// There is a mobile version and a web version for use

$(function () {
    'use strict'
  
    $('[data-toggle="offcanvas"]').on('click', function () {
      $('.offcanvas-collapse').toggleClass('open')
    })
  })
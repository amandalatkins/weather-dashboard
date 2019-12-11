// Global variables
var searchHistory = ["San Francisco","New York","Dallas"];
var currentCity;

init();

function init() {
    getSearchHistory();
    getCurrentCity();
    renderSearchHistory();
}

function renderSearchHistory() {
    console.log("render the search array");
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
    console.log("Get Search History");
    var localHistory = localStorage.getItem('searchHistory');
    if (localHistory) {
        console.log("Found search history in local storage");
        searchHistory = JSON.parse(localHistory);
    } else {
        console.log("Did not find search history in local storage");
        storeSearchHistory();
    }
}

function storeSearchHistory() {
    console.log("store search history");
    localStorage.setItem('searchHistory',JSON.stringify(searchHistory));
}

function getCurrentCity() {
    console.log("Get the current city");
    currentCity = searchHistory[0];
}

// Event listeners
// $(document).on('click','.cityBtn',runSearch);

# DateNight
Link to site: https://dscherer21.github.io/datenight/

About: This app is intended to help you easily plan your next night out at the movies. DateNight streamlines the process of planning your date by combing 2 processes into 1; picking a movie, theater and showtime and also a restaurant to grab a bite to eat before or after the movie.

The Game: ![alt "Image of DateNight App"](/assets/images/app-image.png)

Description: This app is intended to help you easily plan your next night out at the movies. DateNight streamlines the process of planning your date by combing 2 processes into 1; picking a movie, theater and showtime and also a restaurant to grab a bite to eat before or after the movie.

- On initial page load, we ask the user for consent to grab their geolocation. We then display their current address, give the user the opportunity to search from a different location and ask them to choose a search radius for the movie search ((defaulted to 5 miles).
- We then load a carousel of all movies playing within the search radius selected and let the user choose the movie they'd like to see. While browsing movies, we also allow the user to watch a trailer of each movie to help with their selection.
- Next, we display the 3 closest theaters relative to the user's location that are showing the movie they selected along with all movie showtimes until 12:00 am of the given day + 12 hours.
- After the user selects the theater and showtime that they'd like to see, we then populate a Google Map in a modal that lists the location of the theater along with the top 20 ranked restaurants in a 2 mile radius.

Technologies Used: HTML, CSS, Bootstrap, International Showtimes API, Google Maps, Places and Geocodes API, Javascript & the jQuery library.

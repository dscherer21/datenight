

var displayMovies = function () {
    var movieDiv = $('.carousel-inner');
    //Clears the Carousel
    movieDiv.html('');
    for (i = 0; i < theaterObj.movieStack.length; i++) {
        //For Loop to generate Carousel Cards
        var thumbURL = theaterObj.movieStack[i].thumbImgUrl;
        var movieTitle = theaterObj.movieStack[i].title;
        var movieTrailer = theaterObj.movieStack[i].urlTrailer;
        var movieCardActive = $('<div class="item text-center" data-slide-to="' + [i] + '">');
        var movieCard = $('<div class="card">');
        var moviePoster = $('<img class="card-img-top" alt="Movie Poster Here">');
        $(moviePoster).attr('src', thumbURL);
        var movieCardBlock = $('<div class="card-block">');
        var movieCardBlockTitle = $('<h4>' + movieTitle + '</h4>');
        var checkboxForm = $('<div class="form-check">');
        var checkbox = $('<input type="checkbox" class="form-check-input" id="movieCheck" data-movie-index="' + i + '">');
        var checkboxLabel = $('<label class="form-check-label" for="movieCheck"> I choose you!</label>');
        var trailerButton = $('<a href="' + movieTrailer + '" target="_blank" class="btn btn-primary">Watch Movie Trailer</a>');
        $(checkbox).appendTo(checkboxForm);
        $(checkboxLabel).appendTo(checkboxForm);
        $(movieCardBlockTitle).appendTo(movieCardBlock);
        $(checkboxForm).appendTo(movieCardBlock);
        $(moviePoster).appendTo(movieCard);
        $(movieCardBlock).appendTo(movieCard);
        $(trailerButton).appendTo(movieCard);
        $(movieCard).appendTo(movieCardActive);
        //gives the first card of the carousel a class of active to make it functional
        if (i === 0) {
            $(movieCardActive).addClass('active');
        };
        //
        $(movieCardActive).appendTo(movieDiv);
    };

};

$(document).ready(function () {
    console.log("ready!");
    getLocation();

    /* Set the width of the side navigation to 250px */
    $(document.body).on('click', '#navIcon', function openNav() {
        document.getElementById("mySidenav").style.width = "250px";
        console.log('Slider Button Clicked');
    });

    /* Set the width of the side navigation to 0 */
    $('.closebtn').on('click', function closeNav() {
        document.getElementById("mySidenav").style.width = "0";
    });

    //when the Search Movie Theaters Button is Clicked...
    $('#movieSearch').on('click', function () {
        //change main2 style to display: none; to hide it
        $('#main2').attr('style', 'display: none;');
        //change main3 style to display: initial: to show it
        $('#main3').attr('style', 'display: initial;');
        //store any movie-index that has a check mark in its box
        var checkboxNumber = $("input:checked").attr("data-movie-index");
        theaterObj.createTheatersMatchStack(checkboxNumber);
        console.log(checkboxNumber);
        //storing Theater Name.

        var chosenMovieName = theaterObj.movieStack[checkboxNumber].title;
        //storing Theater Name
        var theaterName = theaterObj.theatersMatchStack[0].theaterName;
        //storing Theater Address
        var theaterAddress = theaterObj.theatersMatchStack[0].address.dispText + ' ' + theaterObj.theatersMatchStack[0].address.city + ', ' + theaterObj.theatersMatchStack[0].address.state + ' ' + theaterObj.theatersMatchStack[0].address.zipCode;
        //storing Movies Times
        var movieTimes = theaterObj.theatersMatchStack[0].movieTimesStr;
        //storing Distance
        var distance = theaterObj.theatersMatchStack[0].distToCenter;
        var travelToTime = theaterObj.theatersMatchStack[0].travelToTime;
        //replacing the theatername field with the Theater 
        $("#movie1").text(chosenMovieName);
        //Name
        $('#name1').text(theaterName);
        //replacing the theaterAddress field with the Theater Address
        $('#address1').text(theaterAddress);
        //replacing the movieTimes field with Movie Times
        $('#times1').text(movieTimes);
        //format and output the distance to the screen
        var distanceString = "Distance : " + numeral(distance.toString()).format("0.0") + " miles";
        distanceString += " " + numeral(travelToTime.toString()).format("0.0") + " minutes";
        $('#dist1').text(distanceString);

        if (theaterObj.theatersMatchStack.length > 1) {
            //var chosenMovieName = theaterObj.movieStack[checkboxNumber].title;
            //storing Theater Name
            var theaterName = theaterObj.theatersMatchStack[1].theaterName;
            //storing Theater Address
            var theaterAddress = theaterObj.theatersMatchStack[1].address.dispText + ' ' + theaterObj.theatersMatchStack[1].address.city + ', ' + theaterObj.theatersMatchStack[1].address.state + ' ' + theaterObj.theatersMatchStack[1].address.zipCode;
            //storing Movies Times
            var movieTimes = theaterObj.theatersMatchStack[1].movieTimesStr;
            //storing Distance
            var distance = theaterObj.theatersMatchStack[1].distToCenter;
            var travelToTime = theaterObj.theatersMatchStack[1].travelToTime;
            //replacing the theatername field with the Theater 
            $("#movie2").text(chosenMovieName);
            //Name
            $('#name2').text(theaterName);
            //replacing the theaterAddress field with the Theater Address
            $('#address2').text(theaterAddress);
            //replacing the movieTimes field with Movie Times
            $('#times2').text(movieTimes);
            //format and output the distance to the screen
            var distanceString = "Distance : " + numeral(distance.toString()).format("0.0") + " miles";
            distanceString += " " + numeral(travelToTime.toString()).format("0.0") + " minutes";
            $('#dist2').text(distanceString);
        } else {
            hideLineTheater(2);  //this function uses option # to hide it
            //line #3 must be blank also
            hideLineTheater(3);  //this function uses option # to hide it
        };

        if (theaterObj.theatersMatchStack.length > 2) {
            //var chosenMovieName = theaterObj.movieStack[checkboxNumber].title;
            //storing Theater Name
            var theaterName = theaterObj.theatersMatchStack[2].theaterName;
            //storing Theater Address
            var theaterAddress = theaterObj.theatersMatchStack[2].address.dispText + ' ' + theaterObj.theatersMatchStack[2].address.city + ', ' + theaterObj.theatersMatchStack[2].address.state + ' ' + theaterObj.theatersMatchStack[2].address.zipCode;
            //storing Movies Times
            var movieTimes = theaterObj.theatersMatchStack[2].movieTimesStr;
            //replacing the theatername field with the Theater 
            //storing Distance
            var distance = theaterObj.theatersMatchStack[2].distToCenter;
            var travelToTime = theaterObj.theatersMatchStack[2].travelToTime;
            $("#movie3").text(chosenMovieName);
            //Name
            $('#name3').text(theaterName);
            //replacing the theaterAddress field with the Theater Address
            $('#address3').text(theaterAddress);
            //replacing the movieTimes field with Movie Times
            $('#times3').text(movieTimes);
            //format and output the distance to the screen
            var distanceString = "Distance : " + numeral(distance.toString()).format("0.0") + " miles";
            distanceString += " " + numeral(travelToTime.toString()).format("0.0") + " minutes";
            $('#dist3').text(distanceString);
        } else {
            hideLineTheater(3);  //this function uses option # to hide it
        };
    });

    //when the "Let's Get Started" Button is Clicked...
    $('#getStarted').on('click', function () {
        //change main1 style to display: none; to hide it
        $('#main1').attr('style', 'display: none;');
        //Change main2 style to display: initial; to show it
        $('#main2').attr('style', 'display: initial;');
        //attach any input in the City Search Field to a theater search Param
        theaterObj.addrSearchStr = $('#cityZipSearch').val;
        //attach any input for the distance field to a theater search Param
        theaterObj.searchLoc.dist = $('#distance').val;
        //Console log both to make sure that they are working
        console.log(theaterObj.addrSearchStr);
        console.log(theaterObj.searchLoc.dist);
        //
        startSearches();
    });



    // Initiate the Bootstrap carousel
    $('.multi-item-carousel').carousel({
        interval: false
    });

    // for every slide in carousel, copy the next slide's item in the slide.
    // Do the same for the next, next item.
    $('.multi-item-carousel .item').each(function () {
        var next = $(this).next();
        if (!next.length) {
            next = $(this).siblings(':first');
        }
        next.children(':first-child').clone().appendTo($(this));

        if (next.next().length > 0) {
            next.next().children(':first-child').clone().appendTo($(this));
        } else {
            $(this).siblings(':first').children(':first-child').clone().appendTo($(this));
        };
    });

    //theater button press.  has to be made more DRY but right now, look for the top three
    $('#theater1').on('click', function () {
        //pressed on theater number 1, pull up map
        theaterObj.theaterPicked = 0;  //stack / array is one less than what is displayed
        console.log("picked #1");
        evalTheaterClick();
    });

    $('#theater2').on('click', function () {
        //pressed on theater number 1, pull up map
        theaterObj.theaterPicked = 1; //stack / array is one less than what is displayed
        console.log("picked #2");
        evalTheaterClick();
    });

    $('#theater3').on('click', function () {
        //pressed on theater number 1, pull up map
        theaterObj.theaterPicked = 2; //stack / array is one less than what is displayed
        console.log("picked #3");
        evalTheaterClick();
    });

});
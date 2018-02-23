

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
        }
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

        //RPB changes hers
         //storing Theater Name.
        var chosenMovieName = theaterObj.movieStack[checkboxNumber].title;
        theaterObj.createTheatresMatchStack( chosenMovieName );

        //storing Theater Name
        var theaterName = theaterObj.theatersMatchStack[0].theaterName;
        //storing Theater Address
        var theaterAddress = theaterObj.theatersMatchStack[0].address.dispText + ' ' + theaterObj.theatersMatchStack[0].address.city + ', ' + theaterObj.theatersMatchStack[0].address.state + ' ' + theaterObj.theatersMatchStack[0].address.zipCode;
        //storing Movies Times
        var movieTimes = theaterObj.theatersMatchStack[0].movieTimes;
        //store movie title
        $('#title1').val(chosenMovieName);
        //replacing the theatername field with the Theater Name
        $('#name1').val(theaterName);
        //replacing the theaterAddress field with the Theater Address
        $('#addr1').val(theaterAddress);
        //replacing the movieTimes field with Movie Times
        $('#times1').val(movieTimes);

        //console.log(theaterObj);
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
        testSearch();
        displayMovies();
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
   




});
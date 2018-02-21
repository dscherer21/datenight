$( document ).ready(function() {
    console.log( "ready!" );

    /* Set the width of the side navigation to 250px */
     $('#navIcon').on('click', function openNav() {
        document.getElementById("mySidenav").style.width = "250px";
    });

    /* Set the width of the side navigation to 0 */
    $('.closebtn').on('click', function closeNav() {
        document.getElementById("mySidenav").style.width = "0";
    });
    var movieDiv = $('.carousel-inner');
    //Clears the Carousel
    movieDiv.html('');
    for (i = 0; i < theaterObj.movieStack.length; i++) {
        //For Loop to generate Carousel Cards
        var thumbURL = theaterObj.movieStack[i].thumbImgUrl;
        var movieTitle = theaterObj.movieStack[i].title;
        var movieTrailer = theaterObj.movieStack[i].urlTrailer;
        var movieCardActive = $('<div class="carousel-item active">');
        var movieCard = $('<div class="card d-block w-100" style="width: 20rem;">');
        var moviePoster = $('<img class="card-img-top" alt="Movie Poster Here">');
        $(moviePoster).attr('src', thumbURL);
        var movieCardBlock = $('<div class="card-block">');
        var movieCardBlockTitle = $('<h4>');
        $(movieCardBlockTitle).addClass('card-title', movieTitle);
        var checkboxForm = $('<div class="form-check">');
        var checkbox = $('<input type="checkbox" class="form-check-input" id="movieCheck">');
        var checkboxLabel = $('<label class="form-check-label" for="movieCheck">I choose this one!</label>');
        var trailerButton = $('<button href="' + movieTrailer + '" target="_blank" class="btn btn-primary">Watch Movie Trailer</button>');
        $(checkbox).appendTo(checkboxForm);
        $(checkbox).appendTo(checkboxForm);
        $(movieCardBlockTitle).appendTo(movieCardBlock);
        $(checkboxForm).appendTo(movieCardBlock);
        $(moviePoster).appendTo(movieCard);
        $(movieCardBlock).appendTo(movieCard);
        $(trailerButton).appendTo(movieCard);
        $(movieCard).appendTo(movieCardActive);
        $(movieCardActive).appendTo(movieDiv);
    };










});





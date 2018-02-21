$( document ).ready(function() {
    console.log( "ready!" );
    getLocation();
    console.log(theaterObj);

    /* Set the width of the side navigation to 250px */
     $(document.body).on('click', '#navIcon', function openNav() {
        document.getElementById("mySidenav").style.width = "250px";
        console.log('Slider Button Clicked');
    });

    /* Set the width of the side navigation to 0 */
    $('.closebtn').on('click', function closeNav() {
        document.getElementById("mySidenav").style.width = "0";
    });
    


});




var displayMovies = function() {
    var movieDiv = $('.carousel-inner');
    //Clears the Carousel
    movieDiv.html('');
    for (i = 0; i < theaterObj.movieStack.length; i++) {
        //For Loop to generate Carousel Cards
        var thumbURL = theaterObj.movieStack[i].thumbImgUrl;
        var movieTitle = theaterObj.movieStack[i].title;
        var movieTrailer = theaterObj.movieStack[i].urlTrailer;
        var movieCardActive = $('<div class="item text-center" data-slide-to="'+ [i] +'">');
        var movieCard = $('<div class="card">');
        var moviePoster = $('<img class="card-img-top" alt="Movie Poster Here">');
        $(moviePoster).attr('src', thumbURL);
        var movieCardBlock = $('<div class="card-block">');
        var movieCardBlockTitle = $('<h4>' + movieTitle + '</h4>');
        var checkboxForm = $('<div class="form-check">');
        var checkbox = $('<input type="checkbox" class="form-check-input" id="movieCheck">');
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
        if (i === 0) {
            $(movieCardActive).addClass('active');
        }
        $(movieCardActive).appendTo(movieDiv);
    };

    // Instantiate the Bootstrap carousel
$('.multi-item-carousel').carousel({
    interval: false
  });
  
  // for every slide in carousel, copy the next slide's item in the slide.
  // Do the same for the next, next item.
  $('.multi-item-carousel .item').each(function(){
    var next = $(this).next();
    if (!next.length) {
      next = $(this).siblings(':first');
    }
    next.children(':first-child').clone().appendTo($(this));
    
    if (next.next().length>0) {
      next.next().children(':first-child').clone().appendTo($(this));
    } else {
        $(this).siblings(':first').children(':first-child').clone().appendTo($(this));
    };
  });
    
};








//script files   

var configData = {
    theaterSearchDist: 6, //2 miles search earea
    //    restaurantSearchDist: 2, //2 miles
    restaurantSearchDist: 2 * 1609.34,  //because google is in meters
    dispRichOutput: false,
    dispRichTestFalseGPS: false,   //punch in known values for GPS
    keyAPIgoogle: "AIzaSyAE03QBe5yDXRr1fzDvkWs9i_E_BIyCDhk",
    keyAPIgoogleRich: "AIzaSyCrHKoPEISSoDAClePzcHVJVHB7G1-xb6s"
};

var modalWaitSearch1 = document.getElementById('modSearch1'); //earch all records
var modalWaitSearch2 = document.getElementById('modSearch2'); //search movies
var modalWaitSearch3 = document.getElementById('modSearch3'); //search cinemas
var modalWaitLocation = document.getElementById('modLocation'); //location
var modalWaitMovieTimes = document.getElementById('modMovieTimes'); //movie times
var modalMap = document.getElementById('modMap'); //map modal popup
var closeModMap = document.getElementById("closeModMap");

//When the user clicks on <span> (x), close the modal
closeModMap.onclick = function () {
    modalMap.style.display = "none";
};

var dataSrch = "";
var dataSrchDone = false;
var dataTheaterSearch;

var theaterRecType = {  //this is record type coming from iShowTimes
    auditorium: "",
    booking_type: "",
    cinema_id: "",
    is_3d: false,
    movie_id: "",
    start_at: "",      //time to start 
    EOR: ""            //place marker
};

var movieRecType = {  //this is what is stored for each movie
    index: 0,   //fill in when matching so can know which rec it is on stack
    title: "",
    rating: "",
    runtime: "",
    imdb_id: "", // incase want to search other web sites
    thumbImgUrl: "",    //thumbnail sized image files
    genres: [],
    synopsis: "",
    movie_id: "",
    urlWebsite: "",
    urlTrailer: "",
    closestDist: 0
};

var movieFoundType = { //movies found
    movie_id: "",
    cinema_id: "",
    startTime_utc: "",
    startTime_ts: 0, //time stamp
    runTime_min: 0, //in minutes
    finishTime_ts: 0,
    distToCenter: 0,
    travelToTime: 0,
    travelFromTime: 0,
    timeToLeave: 0,  //time that need to leave calc backwards
    timeBack: 0     //time back home
};

var theaterFoundType = {  //this is for every theater that was found
    index: 0, //when doing a match do know which item on stack it is 
    cinema_id: "",      //id to link to name of theater
    theaterName: "",   //actual name of the theater
    address: {
        dispText: "",
        houseNum: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        geoLocLat: 0,
        geoLocLong: 0
    },
    distToCenter: 0,
    travelToTime: 0,
    travelFromTime: 0
};

var theaterMatchType = {  //this is for all of the matches for movies found
    index: 0, //when doing a match do know which item on stack it is 
    cinema_id: "",      //id to link to name of theater
    theaterName: "",   //actual name of the theater
    address: {
        dispText: "",
        houseNum: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        geoLocLat: 0,
        geoLocLong: 0
    },
    distToCenter: 0,
    travelToTime: 0,
    travelFromTime: 0,
    movieTimes: [],     //all the movie times for the movie
    movieTimesStr: ""
};

var theaterObj = {   //main object for the whole theater
    currTheater: {
        theaterRec: theaterRecType,      //the current theater with movie
        theaterName: "",   //actual name of the theater
        address: {
            dispText: "",
            houseNum: "",
            street: "",
            city: "",
            state: "",
            zipCode: "",
            geoLocLat: 0,
            geoLocLong: 0,
        },
        distToCenter: 0,
        travelToTime: 0,
        travelFromTime: 0,
        url: "",
        telephone: "",
        movie: {
            title: "",
            rating: "",
            runtime: "",
            imdb_id: "", // in case want to search other web sites
            thumbImgUrl: "",    //thumbnail sized image files
            genres: []
        },
        EOR: ""    //place keeper, no comma needed
    },

    currMovieRec: movieRecType,
    currTheaterFound: theaterFoundType,
    currTheaterDisp: theaterFoundType,
    currMovieFoundRec: movieFoundType,

    searchParam: {
        //everything that stays fixed for search parameters
        urlPart1: "https://api.internationalshowtimes.com/v4/",
        qryCinemas: "cinemas/",
        qryMovies: "movies/",
        urlShowTimes: "showtimes/",    //for showtimes
        qryTimeFrom: "&time_from=",
        qryTimeTo: "&time_to=",
        urlLimit: "&limit=1",          //when searching for one item
        urlQryKey: "?apikey=xeeFzVhhznvw4MuwL9eZOxR0QhEdUZQW",  //API key
        urlCountry: "&countries=US",   //country
        urlBoundGeo: "&bounds=(42.056552,-87.707449),(42.040462,-87.670348)",  //geoposition bounds
        qryGeoLocation: "&location=",  //then put in lat,lon with comma between them
        qryDistance: "&distance=",     //in kilometers
        EOR: ""
    },

    //variables are here
    searchLoc: {
        lat: 0.0,
        long: 0.0,
        dist: 0.0,
        addrSearchStr: "",
        addrOriginalStr: ""   //used when first call the routine
    },

    geoLookup: {
        recIndexOn: 0,
        recIndexEnd: 0,
        currStackWorkingOn: "",
        geoDistFound: 0.0,
        geoTimeTravel: 0.0
    },

    theaterStack: [],      //array of theaters  --- treat as stack
    theatersFoundStack: [],  //all the theaters found
    theatersMatchStack: [], //
    cinemaIDstack: [],     //to look up unique cinema ID's
    numCinemaConv: 0,       //which cinema ID converting
    numSearchConv: 0,      //storage for the loop going thru the conversion
    numMovieClickedIndex: 0,
    searchLat: "",
    searchLon: "",
    searchDist: "",     //in kilometers
    movieIDvals: [],    //all the movie ID's
    movieStack: [],     //array of movieRecType, sorted by movie name
    genresStack: [],   //all the genres found
    movieFoundStack: [], //all the movies found
    theaterPicked: 0,  //sent from index.html page


    buildSearchStr: function (typeSearch, indexNum) {
        var timeFromStr = "2018-02-18T00:00:00-08:00";
        var timeToStr = "2018-02-19T00:00:00-08:00";
        var outString = "";
        var SP = this.searchParam;
        var formatStr = "YYYY-MM-DD h:mm:ss";
        //timeFromStr = moment().format(formatStr);
        timeFromStr = moment().utc().format();
        timeToStr = moment().add(12, "hours").utc().format();
        if (typeSearch == 1) {
            outString = SP.urlPart1 + SP.urlShowTimes + SP.urlQryKey + SP.qryGeoLocation + theaterObj.searchLoc.lat + "," + theaterObj.searchLoc.long + SP.qryDistance + theaterObj.searchLoc.dist;
            //outString = SP.urlPart1 + SP.urlShowTimes + SP.urlQryKey + SP.urlCountry + SP.urlBoundGeo;
            outString += SP.qryTimeFrom + timeFromStr + SP.qryTimeTo + timeToStr;
        };
        if (typeSearch == 2) {
            var cinemaID = theaterObj.cinemaIDstack[indexNum]; //pull from unique cinemaID's
            outString = SP.urlPart1 + SP.qryCinemas + cinemaID + SP.urlQryKey;
        };
        if (typeSearch == 3) {
            var movieID = theaterObj.movieIDvals[indexNum];
            if (movieID === "" || movieID === null) {
                //null movieID
                outString = "";
            } else {
                outString = SP.urlPart1 + SP.qryMovies + movieID + SP.urlQryKey + SP.urlLimit;
            }
        };

        return outString;
    },


    doSearchInitial: function () {
        //function to do current search
        //return the response    
        //typeSearch = 1 is the closest theaters

        dataSrchDone = false;
        var shouldSearch = true;
        //stop from multiple searches
        var urlString = this.buildSearchStr(1, 0);
        //check if it is a null string, if so, then need to take care of
        if (urlString === "") { shouldSearch = false; };
        if (shouldSearch) {
            jQuery.ajax({
                url: urlString,
                type: "GET"
            })
                .done(function (dataSrch, textStatus, jqXHR) {
                    console.log("HTTP Request Succeeded: " + jqXHR.status);
                    //console.log(dataSrch);
                    dataTheaterSearch = jQuery.extend(true, {}, dataSrch);
                    theaterObj.doSearchInitialDone();
                    //return dataTheaterSearch;
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus);
                    console.log(errorThrown);
                    console.log("HTTP Request Failed");
                })
                .always(function () {
                    /* ... */
                });
        } else {
            //mimic a search was finished
            theaterObj.doSearchInitialDone();
        };
    },


    doSearchInitialDone: function () {
        //part one of search is done
        modalWaitSearch1.style.display = "block";

        theaterObj.theaterResponseToStack(dataTheaterSearch);
        //all of the theater records are in
        //need to now get all the movie Id
        var tStack = theaterObj.theaterStack;
        var numRecs = tStack.length;
        theaterObj.clearMovieIDvals();
        theaterObj.clearMovieStack();
        //clear out the genres stack
        for (var i = 0; i < theaterObj.genresStack.length; i++) {
            theaterObj.genresStack.pop();
        };

        //loop thru and load single occurance of each movie ID
        for (var i = 0; i < numRecs; i++) {
            if (tStack[i].theaterRec.movie_id == null || tStack[i].theaterRec.movie_id == undefined) {
                //sometimes searches come back with nothing
                console.log("null at " + i);
            } else {
                //only check if not the first record
                //if first record, just push the record
                if (theaterObj.movieIDvals.length === 0) {
                    theaterObj.movieIDvals.push(tStack[i].theaterRec.movie_id);
                } else {
                    //loop thru all and add single movie_id's to array to search later
                    if (theaterObj.movieIDvals.indexOf(tStack[i].theaterRec.movie_id) < 0) {
                        //the movie id has not been used
                        theaterObj.movieIDvals.push(tStack[i].theaterRec.movie_id);
                    };
                };
            };
        };

        modalWaitSearch1.style.display = "none";
        modalWaitSearch2.style.display = "block";
        //now have to search the movie id's
        theaterObj.numSearchConv = 0;
        theaterObj.doMovieSearch(theaterObj.numSearchConv);
    },


    doMovieSearch: function (indexNum) {
        //function to do movie id search to get name of movie

        dataSrchDone = false;
        var shouldSearch = true;
        //stop from multiple searches
        var movieID = theaterObj.movieIDvals[indexNum];
        theaterObj.currMovieRec.movie_id = movieID;
        console.log("searching movie: " + indexNum + " id=" + movieID);

        var urlString = this.buildSearchStr(3, indexNum);
        //check if it is a null string, if so, then need to take care of
        if (urlString === "") { shouldSearch = false; };
        if (shouldSearch) {
            jQuery.ajax({
                url: urlString,
                type: "GET"
            })
                .done(function (dataSrch, textStatus, jqXHR) {
                    console.log("HTTP Request Succeeded: " + jqXHR.status);
                    dataTheaterSearch = jQuery.extend(true, {}, dataSrch);
                    dataSrchDone = true;
                    theaterObj.doMovieSearchDone(indexNum);
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus);
                    console.log(errorThrown);
                    console.log("HTTP Request Failed");
                })
                .always(function () {
                    /* ... */
                });
        } else {
            //mimic a search was finished
            theaterObj.doMovieSearchDone(indexNum);
        };
    },


    doMovieSearchDone: function (indexNum) {
        //searching on movie names
        var mRec = theaterObj.currMovieRec;
        if (dataTheaterSearch.movie.title == null || dataTheaterSearch.movie.title === "") {
            //title is blank, then user original title
            mRec.title = dataTheaterSearch.movie.original_title;
        } else {
            mRec.title = dataTheaterSearch.movie.title;
        };
        if (dataTheaterSearch.movie.age_limits != null) {
            mRec.rating = dataTheaterSearch.movie.age_limits.US;
        } else {
            mRec.rating = "none";
        };
        mRec.urlWebsite = dataTheaterSearch.movie.website;
        //now only move the trailer if it exists
        if (dataTheaterSearch.movie.trailers != null) {
            //there are trailers
            //load the first trailer and then replace if there are english
            mRec.urlTrailer = dataTheaterSearch.movie.trailers[0].trailer_files[0].url;
            var numTrailers = dataTheaterSearch.movie.trailers.length;
            for (var i = 0; i < numTrailers; i++) {
                if (dataTheaterSearch.movie.trailers.language === "en-US") {
                    //use the English trailer
                    mRec.urlTrailer = dataTheaterSearch.movie.trailers[i].trailer_files[0].url;
                } else if (dataTheaterSearch.movie.trailers.language === "en") {
                    mRec.urlTrailer = dataTheaterSearch.movie.trailers[i].trailer_files[0].url;
                };
            };
        };
        if (dataTheaterSearch.movie.trailers != null) {
            mRec.synopsis = dataTheaterSearch.movie.synopsis;
        } else {
            mRec.synopsis = "";
        }
        mRec.runtime = dataTheaterSearch.movie.runtime;
        mRec.imdb_id = dataTheaterSearch.movie.imdb_id;
        mRec.thumbImgUrl = dataTheaterSearch.movie.poster_image.image_files[0].url;
        //mRec.movie_id = dataTheaterSearch.theaterRec.movie_id;

        //clear all current genres
        var currAmount = mRec.genres.length;
        for (var i = 0; i < currAmount; i++) {
            mRec.genres.pop();
        };

        var genStack = theaterObj.genresStack;  //use as shortcut
        var endVal = dataTheaterSearch.movie.genres.length;
        for (var i = 0; i < endVal; i++) {
            //loop thru and add in all the genres for the film
            mRec.genres.push(dataTheaterSearch.movie.genres[i].name);
            //after adding for the movie, add into stack and make sure
            //it is a unique entry
            if (genStack.length === 0) {
                //no entries so push in the first one
                genStack.push(dataTheaterSearch.movie.genres[i].name);
            } else {
                if (genStack.indexOf(dataTheaterSearch.movie.genres[i].name) < 0) {
                    //no match in current stack, so insert it
                    genStack.push(dataTheaterSearch.movie.genres[i].name);
                };
            };
        };

        //can not just add to the stack, need to put in alpha order
        theaterObj.addToMovieStack();
        //var newObj = jQuery.extend(true, {}, mRec);
        //theaterObj.movieStack.push(newObj);    //object is now on the stack


        theaterObj.numSearchConv++; //go to the next one
        //check if all the movie ID's have been searched
        if (theaterObj.numSearchConv < theaterObj.movieIDvals.length) {
            //do another search
            theaterObj.doMovieSearch(theaterObj.numSearchConv);
        } else {
            modalWaitSearch2.style.display = "none";
            modalWaitSearch3.style.display = "block";
            theaterObj.numCinemaConv = 0;
            //clear out the theatersFound stack
            for (var k = 0; k < theaterObj.theatersFoundStack.length; k++) {
                theaterObj.theatersFoundStack.pop();
            };
            theaterObj.doCinemaSearch(theaterObj.numCinemaConv);
        };
    },


    doCinemaSearch: function (indexNum) {
        //function to go thru cinema ID's and get the addresses 

        dataSrchDone = false;
        var shouldSearch = true;
        //stop from multiple searches
        //check if should search
        var cinemaID = theaterObj.cinemaIDstack[indexNum];
        var urlString = this.buildSearchStr(2, indexNum);
        //check if it is a null string, if so, then need to take care of
        if (urlString === "") { shouldSearch = false; };
        if (shouldSearch) {
            jQuery.ajax({
                url: urlString,
                type: "GET"
            })
                .done(function (dataSrch, textStatus, jqXHR) {
                    console.log("HTTP Request Succeeded: " + jqXHR.status);
                    dataTheaterSearch = jQuery.extend(true, {}, dataSrch);
                    dataSrchDone = true;
                    theaterObj.doCinemaSearchDone(indexNum);
                    //return dataTheaterSearch;
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus);
                    console.log(errorThrown);
                    console.log("HTTP Request Failed");
                })
                .always(function () {
                    /* ... */
                });
        } else {
            //mimic a search was finished
            theaterObj.doCinemaSearchDone(indexNum);
        };
    },


    doCinemaSearchDone: function (indexNum) {
        //part one of search is done, now need movie theater names
        var ctfRec = theaterObj.currTheaterFound;  //for shorthand notation
        ctfRec.cinema_id = theaterObj.cinemaIDstack[indexNum];
        ctfRec.theaterName = dataTheaterSearch.cinema.name;
        ctfRec.address.geoLocLat = dataTheaterSearch.cinema.location.lat;
        ctfRec.address.geoLocLong = dataTheaterSearch.cinema.location.lon;
        ctfRec.address.dispText = dataTheaterSearch.cinema.location.address.display_text;
        ctfRec.address.houseNum = dataTheaterSearch.cinema.location.address.house;
        ctfRec.address.street = dataTheaterSearch.cinema.location.address.street;
        ctfRec.address.city = dataTheaterSearch.cinema.location.address.city;
        ctfRec.address.state = dataTheaterSearch.cinema.location.address.state_abbr;
        ctfRec.address.zipCode = dataTheaterSearch.cinema.location.address.zipcode;
        ctfRec.url = dataTheaterSearch.cinema.website;
        ctfRec.telephone = dataTheaterSearch.cinema.telephone;
        ctfRec.distToCenter = 0;
        ctfRec.travelToTime = 0;
        ctfRec.travelFromTime = 0;

        var newRec = jQuery.extend(true, {}, ctfRec);
        theaterObj.theatersFoundStack.push(newRec);
        console.log("converting .. " + theaterObj.numCinemaConv);
        theaterObj.numCinemaConv++; //go to the next one
        if (theaterObj.numCinemaConv < theaterObj.cinemaIDstack.length) {
            //do another search
            theaterObj.doCinemaSearch(theaterObj.numCinemaConv);
        } else {
            theaterObj.geoDistHomeToTheater_all_start();
        };
    },

    geoDistHomeToTheater_all_start: function () {
        var stackToUse = "TF";
        var searchStack;
        var indexNum = 0;
        if (stackToUse === "TF") {
            //all of the theatersFoundStack
            searchStack = theaterObj.theatersFoundStack;
        };
        theaterObj.geoLookup.recIndexEnd = searchStack.length;
        theaterObj.geoLookup.recIndexOn = 0;
        theaterObj.geoLookup.currStackWorkingOn = stackToUse;
        geoDistHomeToTheater(stackToUse, indexNum)
    },

    geoDistHomeToTheater_next: function (stackToUse) {
        var currStack;
        var stackToUse = theaterObj.geoLookup.currStackWorkingOn;
        var indexWorkingOn = theaterObj.geoLookup.recIndexOn;

        if (stackToUse === "TF") {
            searchStack = theaterObj.theatersFoundStack;
            theaterObj.theatersFoundStack[indexWorkingOn].distToCenter = theaterObj.geoLookup.geoDistFound;
            theaterObj.theatersFoundStack[indexWorkingOn].travelToTime = theaterObj.geoLookup.geoTimeTravel;
            theaterObj.theatersFoundStack[indexWorkingOn].travelFromTime = theaterObj.geoLookup.geoTimeTravel;
        };

        //loop back and get the next one
        theaterObj.geoLookup.recIndexOn++;
        if (theaterObj.geoLookup.recIndexOn < theaterObj.geoLookup.recIndexEnd) {
            //where to go next
            if (stackToUse === "TF") {
                geoDistHomeToTheater("TF", theaterObj.geoLookup.recIndexOn)
            };
        } else {
            //where to go after found all the distances
            theaterObj.numCinemaConv = 0;
            modalWaitSearch3.style.display = "none";
            if (configData.dispRichOutput === true) {
                outputMovies();
                outputTheaters();
            } else {
                displayMovies();
            };
        };
    },


    clearStack: function () {
        //clears all the current values in the array
        var endVal = theaterObj.theaterStack.length;
        for (var i = 0; i < endVal; i++) {
            theaterObj.theaterStack.pop();
        };
    },

    pushToStack: function () {
        //takes the currTheater and treats as record and pushes to stack array
        //have to make a copy of an object before pushing it anywhere
        var newObj = jQuery.extend(true, {}, theaterObj.currTheater);
        theaterObj.theaterStack.push(newObj);    //object is now on the stack
    },

    theaterResponseToStack: function (responseIn) {
        //pass the response in, just in case doing external to object
        //this is parsing for iShowTimes
        //stack is NOT CLEARED prior to entering
        var stArray = responseIn.showtimes;  //showtimes array shortcut

        var currTheaterRec = theaterObj.currTheater.theaterRec; //shortcut
        var endVal = stArray.length;
        for (var i = 0; i < endVal; i++) {
            //transfer the theater response to the currRec variable
            currTheaterRec.auditorium = stArray[i].auditorium;
            currTheaterRec.booking_type = stArray[i].booking_type;
            currTheaterRec.cinema_id = stArray[i].cinema_id;
            currTheaterRec.is_3d = stArray[i].is_3d;
            currTheaterRec.movie_id = stArray[i].movie_id;
            currTheaterRec.start_at = stArray[i].start_at;
            theaterObj.pushToStack();  //make permanent
            //add it to unique theater list
            if (theaterObj.cinemaIDstack.length === 0) {
                //var theaterFoundRec = Object.create(theaterFoundType);
                //theaterFoundRec.cinema_id = stArray[i].cinema_id;
                //theaterObj.theatersFoundStack.push(theaterFoundRec);
                theaterObj.cinemaIDstack.push(currTheaterRec.cinema_id); //unique ID lookup list
            } else {
                //there is more than one entry, so make sure it is unique
                if (theaterObj.cinemaIDstack.indexOf(currTheaterRec.cinema_id) < 0) {
                    //this is a new cinema not on the stack 
                    //var theaterFoundRec = Object.create(theaterFoundType);
                    //theaterFoundRec.cinema_id = stArray[i].cinema_id;
                    //theaterObj.theatersFoundStack.push(theaterFoundRec);
                    theaterObj.cinemaIDstack.push(currTheaterRec.cinema_id); //unique ID lookup list
                };
            };
        };
    },


    clearMovieIDvals: function () {
        var endVal = theaterObj.movieIDvals.length;
        for (var i = 0; i < endVal; i++) {
            theaterObj.movieIDvals.pop();
        }
    },

    clearMovieStack: function () {
        //clears all the current values in the array
        var endVal = theaterObj.movieStack.length;
        for (var i = 0; i < endVal; i++) {
            theaterObj.movieStack.pop();
        };
    },

    addToMovieStack: function () {
        //takes the currMovie and treats as record and pushes to stack array
        //puts in alpahbetical order onto the movie stack
        //have to make a copy of an object before pushing it anywhere
        if (theaterObj.movieStack.length === 0) {
            //no records on the stack so push the first one
            var newObj = jQuery.extend(true, {}, theaterObj.currMovieRec);
            theaterObj.movieStack.push(newObj);    //object is now on the stack
        } else {
            var endVal = theaterObj.movieStack.length;
            var i = 0;  //loop iterator
            //shortened variable names
            var mRec = theaterObj.currMovieRec;
            var mStack = theaterObj.movieStack;
            var loopContinue = true;
            do {
                if (mRec.title.toUpperCase() > mStack[i].title.toUpperCase()) {
                    if (i === (endVal - 1)) {
                        //at the end of the loop, so push at end
                        var newObj = jQuery.extend(true, {}, mRec);
                        mStack.push(newObj);    //object is now on the stack                                
                        loopContinue = false;
                    } else {
                        //it is greater than, so keep moving
                        i++;
                        loopContinue = true;
                    };
                } else {
                    //it is less then check if it is the first one 
                    if (i === 0) {
                        var newObj = jQuery.extend(true, {}, mRec);
                        mStack.unshift(newObj);    //adds to begining of stack                                
                        loopContinue = false;
                    } else {
                        //splice into the middle of the array
                        var newObj = jQuery.extend(true, {}, mRec);
                        mStack.splice(i, 0, newObj);
                        loopContinue = false;
                    };
                };

            } while (loopContinue);
        };
    },

    doMoviesFoundList: function () {
        //will assemble all of the movies found and put them 
        //into movieFoundStack, can sort by time
        //first, clear the stack for movies found
        var mfStack = theaterObj.movieFoundStack; //shorthand variable
        var mStack = theaterObj.movieStack; //shorthand for movie stack
        var cfRec = theaterObj.currMovieFoundRec; //shorthand for curr record
        for (var i = 0; i < mfStack.length; i++) {
            mfStack.pop();
        };
        //get shorthand for movie
        var currMovieClicked = theaterObj.movieStack[theaterObj.numMovieClickedIndex];
        var currMovieID = currMovieClicked.movie_id;
        //now go thru all the original search records and find matches
        //probably could use JS function like index of, but for good
        //exercise, step thru manually
        var tStack = theaterObj.theaterStack; //shorthand
        var numOrigRecs = tStack.length;
        for (var i = 0; i < numOrigRecs; i++) {
            var searchMovieID = tStack[i].theaterRec.movie_id;
            if (searchMovieID === currMovieID) {
                //a match was found
                cfRec.movie_id = currMovieID;
                cfRec.cinema_id = tStack[i].theaterRec.cinema_id;
                cfRec.startTime_utc = tStack[i].theaterRec.start_at;
                cfRec.startTime_ts = parseInt(moment(tStack[i].theaterRec.start_at).unix());

                //get the rest of the record
                var matchMovieRec = theaterObj.retMatchRecFromMovieStack(searchMovieID);
                cfRec.runTime_min = matchMovieRec.runtime;
                cfRec.finishTime_ts = parseInt(moment(cfRec.startTime_utc).add(cfRec.runTime_min, "minutes").unix());

                //rpb working ... calculate the time travel
                var travelObj = theaterObj.retTravelTimeFromTheatersFoundStack(cfRec.cinema_id);
                cfRec.distToCenter = travelObj.distToCenter;
                //the travel time is in seconds as is the start time
                //so the time that should leave should be simple subtration
                cfRec.travelToTime = travelObj.travelToTime;
                cfRec.travelFromTime = travelObj.travelFromTime;
                cfRec.timeToLeave = cfRec.startTime_ts - parseInt(travelObj.travelToTime * 60.00);
                cfRec.timeBack = cfRec.finishTime_ts + parseInt(travelObj.travelToTime * 60.00);

                //now that the cfRec is filled, make a copy and pop to movieFoundStack
                var copyOfRec = jQuery.extend(true, {}, cfRec);
                mfStack.push(copyOfRec);
            };
        };
    },

    retMatchRecFromMovieStack: function (movieIDmatch) {
        var continLoop = true;
        var i = 0;
        var matchObj;
        do {
            if (theaterObj.movieStack[i].movie_id == movieIDmatch) {
                //there is a match
                matchObj = jQuery.extend(true, {}, theaterObj.movieStack[i]);
                matchObj.index = i;
                continLoop = false;
            } else {
                i++;
                if (i >= theaterObj.movieStack.length) {
                    continLoop = false;
                    console.log("no movie id match");
                };
            };
        }
        while (continLoop === true);
        return matchObj;
    },

    retMatchRecFromCinemaStack: function (cinemaIDmatch) {
        var continLoop = true;
        var i = 0;
        do {
            if (theaterObj.theatersFoundStack[i].cinema_id === cinemaIDmatch) {
                //there is a match
                var matchObj = jQuery.extend(true, {}, theaterObj.theatersFoundStack[i]);
                matchObj.index = i;
                continLoop = false;
                return matchObj;
            } else {
                i++;
                if (i >= theaterObj.theatersFoundStack.length) {
                    continLoop = false;
                    return;
                };
            };
        } while (continLoop);
    },

    retTravelTimeFromTheatersFoundStack: function (cinemaIDmatch) {
        //returns the distance and time for locations
        var outputObj;
        var tfStack = theaterObj.theatersFoundStack;
        var iCurrRec = 0;
        var continLoop = true;
        do {
            if (tfStack[iCurrRec].cinema_id === cinemaIDmatch) {
                //there is a match
                outputObj = {
                    distToCenter: tfStack[iCurrRec].distToCenter,
                    travelToTime: tfStack[iCurrRec].travelToTime,
                    travelFromTime: tfStack[iCurrRec].travelFromTime
                };
                continLoop = false;
            } else {
                //step thru the loop now
                iCurrRec++;
                if (iCurrRec >= tfStack.length) {
                    outputObj = null;
                    continLoop = false;
                };
            };
        } while (continLoop === true);
        return outputObj;
    },

    createTheatersMatchStack: function (movieStackIndex) {
        //create theatersMatchStack of all theaters for a movie 
        //used when picking by movie and want to know the theaters and times
        //playing at

        //user selected a movie from the movieStack
        //so, need to find the movie and then find all the theaters that have that
        //movie.  movieFoundStack will do that, listing movies by mo

        //very similar to the evalPicClick

        //first clear out the theatersFoundStack
        for (var i = 0; i < this.theatersMatchStack.length; i++) {
            this.theatersMatchStack, pop();
        };
        //var matchRec = this.retMatchRecFromMovieStack(movieStackIndex);
        var searchMovieID = this.movieStack[movieStackIndex].movie_id;
        theaterObj.numMovieClickedIndex = parseInt(movieStackIndex);

        theaterObj.doMoviesFoundList();

        //so movies now are sorted by tiem across all cinemas
        var tmStack = theaterObj.theatersMatchStack;    //output stack
        var mfStack = theaterObj.movieFoundStack        //input stack
        for (var i = 0; i < mfStack.length; i++) {
            //so now step thru all of the movies found and find match cinemas
            var searchCinemaID = mfStack[i].cinema_id;
            var numTM = 0;  //number of theaters found on stack 
            var continF = true;
            continLoop = true;
            if (tmStack.length === 0) {
                //there is nothing on the stack, so push in a new rec
                var newRec = jQuery.extend(true, {}, theaterMatchType);
                newRec.index = numTM;
                newRec.cinema_id = mfStack[i].cinema_id;
                newRec.theaterName = "";
                newRec.movieTimes.push(mfStack[i].startTime_utc);
                newRec.movieTimesStr = moment(mfStack[i].startTime_utc).format("h:mma");
                var newTheater = theaterObj.retMatchRecFromCinemaStack(searchCinemaID);
                newRec.theaterName = newTheater.theaterName;
                newRec.address.dispText = newTheater.address.dispText;
                newRec.address.houseNum = newTheater.address.houseNum;
                newRec.address.street = newTheater.address.street;
                newRec.address.city = newTheater.address.city;
                newRec.address.state = newTheater.address.state;
                newRec.address.zipCode = newTheater.address.zipCode;
                newRec.address.geoLocLat = newTheater.address.geoLocLat;
                newRec.address.geoLocLong = newTheater.address.geoLocLong;
                newRec.distToCenter = newTheater.distToCenter;
                newRec.travelToTime = newTheater.travelToTime;
                newRec.travelFromTime = newTheater.travelFromTime;

                tmStack.push(newRec);
                continLoop = false;
            };
            while (continLoop === true) {
                //loop thru all the current recs and see if there is a match
                if (tmStack[numTM].cinema_id === searchCinemaID) {
                    //it matches so append to movie times
                    tmStack[numTM].movieTimes.push(mfStack[i].startTime_utc);
                    tmStack[numTM].movieTimesStr += "  " + moment(mfStack[i].startTime_utc).format("h:mma");
                    continLoop = false;
                } else {
                    //doesn't match, check if it is the end
                    numTM++;
                    if (numTM >= tmStack.length) {
                        //it is end of the line, so insert a new cinema record
                        var newRec = jQuery.extend(true, {}, theaterMatchType);
                        newRec.index = numTM;
                        newRec.cinema_id = mfStack[i].cinema_id;
                        newRec.theaterName = "";
                        newRec.movieTimes.push(mfStack[i].startTime_utc);
                        newRec.movieTimesStr = moment(mfStack[i].startTime_utc).format("h:mma");
                        var newTheater = theaterObj.retMatchRecFromCinemaStack(searchCinemaID);
                        newRec.theaterName = newTheater.theaterName;
                        newRec.address.dispText = newTheater.address.dispText;
                        newRec.address.houseNum = newTheater.address.houseNum;
                        newRec.address.street = newTheater.address.street;
                        newRec.address.city = newTheater.address.city;
                        newRec.address.state = newTheater.address.state;
                        newRec.address.zipCode = newTheater.address.zipCode;
                        newRec.address.geoLocLat = newTheater.address.geoLocLat;
                        newRec.address.geoLocLong = newTheater.address.geoLocLong;
                        newRec.distToCenter = newTheater.distToCenter;
                        newRec.travelToTime = newTheater.travelToTime;
                        newRec.travelFromTime = newTheater.travelFromTime;
                        tmStack.push(newRec);
                        continLoop = false;
                    };
                };
            };
        };
        //now sort the stack
        tmStack.sort(function (a, b) { return a.distToCenter - b.distToCenter });

    },

    EOR: ""    //place keeper so don't have to worry about stupid commas
};

var startSearches = function () {
    //entry point to do a search
    //global function outside of the theaterObj
    theaterObj.clearStack();
    if (configData.dispRichOutput == true) {
        modalMap.style.display = "none";
        //document.getElementById("container-map").style.display = "none";
    };

    //clear all the movie theaters found in the area
    for (var i = 0; i < theaterObj.theatersFoundStack.length; i++) {
        theaterObj.theatersFoundStack.pop();
    };
    //clear all the movie theaters found in the area
    for (var i = 0; i < theaterObj.cinemaIDstack.length; i++) {
        theaterObj.cinemaIDstack.pop();
    };

    if (configData.dispRichOutput != true) {
        theaterObj.searchLoc.dist = numeral($("#distance").val() * 1.60934).format("+0000.0000");
    };

    //used to call:  theaterObj.doSearchInitial();
    //now done in   geo conversion
    //so, go and check the address to geo conversion
    checkAndConvertAddrToGeo();
};


var outputMovies = function () {
    //outputs search to movies
    var divOutput = $("#movieOutput");
    divOutput.html("");
    var divTop = $("#top-panel-div");
    divTop.html("");
    var divBottom = $("#bottom-panel-div");
    divBottom.html("");
    var mStack = theaterObj.movieStack;
    var numFound = mStack.length;

    //findings heading
    var newRow = $("<div>");
    $(newRow).addClass("row");
    //var newPtag = $("<p>");
    var H4tag = $("<h4>");
    H4tag.css("margin", "3px");
    var findingsStr = "found: ";
    // $(H3tag).text(findingsStr);
    // $(H3tag).appendTo(newRow);
    // $(newPtag).appendTo(newRow);

    // var H4tag = $("<h4>");
    findingsStr += numFound;
    findingsStr += " movies in " + theaterObj.cinemaIDstack.length + " theaters.";
    findingsStr += " covering " + theaterObj.genresStack.length + " genres.";
    $(H4tag).text(findingsStr);
    $(H4tag).appendTo(newRow);

    theaterObj.genresStack.sort();
    newPtag = $("<p>");
    //$(newPtag).text("Genres found and sorted:");
    //$(newPtag).appendTo(newRow);
    var genresFoundStr = "";
    for (var i = 0; i < theaterObj.genresStack.length; i++) {
        genresFoundStr += theaterObj.genresStack[i] + " , ";
    };
    //newPtag = $("<p>");
    $(newPtag).text(genresFoundStr);
    $(newPtag).appendTo(newRow);

    $(newRow).appendTo(divTop);

    //put heading in the movies found
    var newRow = $("<div>");
    $(newRow).addClass("row");
    H4tag = $("<h4>");
    H4tag.css("margin", "3px");
    var outputStr = "click on a movie picture to select";
    $(H4tag).text(outputStr);
    $(H4tag).appendTo(newRow);
    $(newRow).appendTo(divOutput);

    for (var i = 0; i < numFound; i++) {
        //loop thru the all movies found

        var newRow = $("<div>");
        $(newRow).addClass("row");
        var movieStr = mStack[i].title;
        var rating = mStack[i].rating;
        var runTime = mStack.runtime + " min";

        var H2tag = $("<h4>");
        var line1str = movieStr;
        var newPtag = $("<p>");

        $(H2tag).text(line1str);
        $(H2tag).appendTo(newPtag);
        $(newPtag).appendTo(newRow);

        var line2str = "";
        newPtag = $("<p>");
        $(newPtag).text(line2str);
        $(newPtag).appendTo(newRow);

        //create a panel for the image
        var urlMovieThumb = mStack[i].thumbImgUrl;
        var imgTag = $("<img>");
        $(imgTag).attr("src", urlMovieThumb)
        //var toolTipStr = "title: " + "\n";
        //toolTipStr += "";
        //toolTipStr += "\n\n";
        $(imgTag).attr("id", mStack[i].movie_id);
        //$(imgTag).attr("data-toggle", "tooltip");
        //$(imgTag).attr("title", toolTipStr);
        //$(imgTag).attr("data-image", i); //data for click
        //$(imgTag).addClass("movie-pic");  //for mass adds
        $(imgTag).css("width", "92px");
        $(imgTag).css("height", "138px");
        $(imgTag).css("border", "2px");
        $(imgTag).css("margin", "5px")
        $(imgTag).css("margin", "5px");

        //create <div> panel with 2 parts, header and content
        var divPanel = $("<div>");
        $(divPanel).addClass("panel");
        $(divPanel).addClass("panel-info");
        $(divPanel).addClass("panelMinMargin");
        //$(divPanel).css("float", "left");
        $(divPanel).css("width", "110px");
        $(divPanel).css("height", "152px");
        //to allow clicking and the data for the image    
        $(divPanel).attr("data-image", i); //data for click
        $(divPanel).addClass("movie-pic");  //for mass adds


        /*    
        var divPanelHead = $("<div>");
        $(divPanelHead).addClass("panel-heading");
        $(divPanelHead).addClass("panelMinPadding");
        $(divPanelHead).css("height", "20px");

        var panelHeadText = $("<p>");
        var panelHeadTextString = mStack[i].title;
        $(panelHeadText).text(panelHeadTextString);
        $(panelHeadText).appendTo(divPanelHead);

        $(divPanelHead).appendTo(divPanel);
        */

        var divPanelBody = $("<div>");
        $(divPanelBody).addClass("panel-body");
        $(divPanelBody).addClass("panelMinPadding");
        $(imgTag).appendTo(divPanelBody);  //imsage goes onto the panel body
        $(divPanelBody).appendTo(divPanel);

        $(divPanel).appendTo(newRow);


        //put rating to page
        newPtag = $("<p>");
        $(newPtag).text("rating: " + mStack[i].rating);
        $(newPtag).appendTo(newRow);

        //put to page the genres for this movie
        var lineGenres = "";
        var currAmount = mStack[i].genres.length;
        for (var k = 0; k < currAmount; k++) {
            lineGenres += mStack[i].genres[k] + " , ";
        };
        newPtag = $("<p>");
        $(newPtag).text(lineGenres);
        $(newPtag).appendTo(newRow);

        var lineSynopsis = mStack[i].synopsis;
        newPtag = $("<p>");
        $(newPtag).text(lineSynopsis);
        $(newPtag).appendTo(newRow);


        $(newRow).appendTo(divOutput);

        //horizontal break line
        newRow = $("<div>");
        $(newRow).addClass("row");
        newPtag = $("<p>");
        HRtag = $("<hr>");
        $(HRtag).appendTo(newPtag);
        $(newPtag).appendTo(newRow);
        $(newRow).appendTo(divOutput);
    };
    newRow = $("<div>");
    $(newRow).addClass("row");
    newPtag = $("<p>");
    HRtag = $("<hr>");
    $(HRtag).appendTo(newPtag);
    $(newPtag).appendTo(newRow);        //hor row
    $(newPtag).appendTo(newRow);        //2nd hor row


    //finish out the row
    $(newRow).appendTo(divOutput);

};


var outputTheaters = function () {
    //outputs search to movies
    var divOutput = $("#bottom-panel-div");
    divOutput.html("");
    //divOutput.html("");
    var tfStack = theaterObj.theatersFoundStack;
    var numFound = tfStack.length;

    //findings heading
    var newRow = $("<div>");
    $(newRow).addClass("row");
    $(newRow).css("line-height", "2px");
    $(newRow).css("margin", "2px");
    $(newRow).css("padding", "2px");
    $(newRow).addClass("row");

    var newPtag = $("<p>");
    var H3tag = $("<h3>");
    var findingsStr = "Theaters found in search area";
    $(H3tag).text(findingsStr);
    $(H3tag).appendTo(newPtag);
    $(newPtag).appendTo(newRow);
    //$(newRow).appendTo(divOutput);

    //var newRow = $("<div>");

    for (var i = 0; i < numFound; i++) {
        //loop thru the entire stack of theaters found

        //bring out as local variable for demo purposes
        var nameStr = tfStack[i].theaterName;
        var address = tfStack[i].address.houseNum + " " + tfStack[i].address.street;
        var city = tfStack[i].address.city;
        var state = tfStack[i].address.state;
        var zipcode = tfStack[i].address.zipCode;
        var geoLat = tfStack[i].address.geoLocLat;
        var geoLong = tfStack[i].address.geoLocLong;
        var distToCenter = tfStack[i].distToCenter;
        var travelToTime = tfStack[i].travelToTime;

        var H3tag = $("<h4>");
        $(H3tag).css("line-height", "1.0");
        $(H3tag).css("margin", "0px");
        $(H3tag).css("padding", "0px");
        var line1str = nameStr;
        var newPtag = $("<p>");
        $(newPtag).css("margin", "0px");
        $(newPtag).css("padding", "0px");
        $(newPtag).css("line-height", "2px");

        $(H3tag).text(line1str);
        $(H3tag).appendTo(newPtag);
        var brTag = $("<br/>");
        $(brTag).appendTo(newPtag);

        var H4tag = $("<h5>");
        $(H4tag).css("line-height", "1.0");
        $(H4tag).css("margin", "0px");
        $(H4tag).css("padding", "0px");
        var line2str = address;
        $(H4tag).text(line2str);
        $(H4tag).appendTo(newPtag);
        var brTag = $("<br/>");
        $(brTag).appendTo(newPtag);

        H4tag = $("<h5>");
        $(H4tag).css("line-height", "1.0");
        $(H4tag).css("margin", "0px");
        $(H4tag).css("padding", "0px");
        var line3str = city + " , " + state + " " + zipcode;
        $(H4tag).text(line3str);
        $(H4tag).appendTo(newPtag);
        var brTag = $("<br/>");
        $(brTag).css("line-height", "2px");
        $(brTag).appendTo(newPtag);

        H4tag = $("<h5>");
        $(H4tag).css("line-height", "1.0");
        $(H4tag).css("margin", "0px");
        $(H4tag).css("padding", "0px");
        var line5str = "Distance : " + numeral(distToCenter.toString()).format("0.0") + " miles";
        line5str += " " + numeral(travelToTime.toString()).format("0.0") + " minutes";
        $(H4tag).text(line5str);
        $(H4tag).appendTo(newPtag);
        var brTag = $("<br/>");
        $(brTag).appendTo(newPtag);
        $(newPtag).appendTo(newRow);

        newPtag = $("<p>");
        $(newPtag).text(" ");
        var brTag = $("<br/>");
        $(brTag).appendTo(newPtag);
        $(newPtag).appendTo(newRow);
    };

    $(newRow).appendTo(divOutput);
    newRow = $("<div>");
    $(newRow).addClass("row");
    newPtag = $("<p>");
    HRtag = $("<hr>");
    $(HRtag).appendTo(newPtag);
    $(newPtag).appendTo(newRow);        //hor row
    $(newPtag).appendTo(newRow);        //2nd hor row

    //finish out the row
    $(newRow).appendTo(divOutput);
};


var outputMoviesByMovieTime = function () {
    //outputs search to movies
    var divOutput = $("#movieOutput");
    divOutput.html("");
    var divTop = $("#top-panel-div");
    divTop.html("");
    var divBottom = $("#bottom-panel-div");
    divBottom.html("");
   var mfStack = theaterObj.movieFoundStack;  //shorthand
    var mStack = theaterObj.movieStack;  //shorthand
    var numFound = mfStack.length;
    //sort the movies by start time
    mfStack.sort(function (a, b) { return a.startTime_ts - b.startTime_ts });

    //move to local variables for show and tell purposes
    //theaterObj.retMatchRecFromMovieStack(mfStack[theaterObj.numMovieClickedIndex].movie_id);
    var movieRec = theaterObj.retMatchRecFromMovieStack(mStack[theaterObj.numMovieClickedIndex].movie_id);
    var movieTitle = movieRec.title;
    var movieRunTime = movieRec.runtime;
    var movieSynopsis = movieRec.synopsis;
    var movieThumUrl = movieRec.thumbImgUrl;
    var movie_url_website = movieRec.urlWebsite;
    var movie_url_trailer = movieRec.urlTrailer;

    var newRow = $("<div>");
    $(newRow).addClass("row");
    $(newRow).css("line-height", "2px");
    $(newRow).css("margin", "2px");
    $(newRow).css("padding", "2px");
    $(newRow).addClass("row");

    //movie name
    var H3tag = $("<h4>");
    $(H3tag).css("line-height", "1.0");
    $(H3tag).css("margin", "0px");
    $(H3tag).css("padding", "0px");
    var newPtag = $("<p>");
    $(newPtag).css("margin", "0px");
    $(newPtag).css("padding", "0px");
    $(newPtag).css("line-height", "2px");

    $(H3tag).text(movieTitle);
    $(H3tag).appendTo(newPtag);
    var brTag = $("<br/>");
    $(brTag).appendTo(newPtag);

    var H4tag = $("<h5>");
    $(H4tag).css("line-height", "1.0");
    $(H4tag).css("margin", "0px");
    $(H4tag).css("padding", "0px");
    $(H4tag).text("run time = " + movieRunTime + " minutes");
    $(H4tag).appendTo(newPtag);
    var brTag = $("<br/>");
    $(brTag).appendTo(newPtag);

    H4tag = $("<h5>");
    $(H4tag).css("line-height", "1.0");
    $(H4tag).css("margin", "0px");
    $(H4tag).css("padding", "0px");
    $(H4tag).text(movieSynopsis);
    $(H4tag).appendTo(newPtag);
    var brTag = $("<br/>");
    $(brTag).appendTo(newPtag);
    $(newPtag).appendTo(newRow);        //hor row
    $(newRow).appendTo(divTop);
    newRow = $("<div>");
    $(newRow).addClass("row");
    $(newRow).appendTo(divTop);

    //findings heading
    newPtag = $("<p>");
    H3tag = $("<h3>");
    var findingsStr = "Theater Times (sorted by start time)";
    $(H3tag).text(findingsStr);
    $(H3tag).appendTo(newPtag);
    $(newPtag).appendTo(newRow);
    H3tag = $("<h4>");
    $(H3tag).text("click on a showtime for map");
    $(H3tag).appendTo(newRow);

    $(newRow).appendTo(divOutput);
    newRow = $("<div>");
    $(newRow).addClass("row");
    newPtag = $("<p>");
    var HRtag = $("<hr>");
    $(HRtag).appendTo(newPtag);
    $(newPtag).appendTo(newRow);        //hor row
    $(newRow).appendTo(divOutput);
    newRow = $("<div>");
    $(newRow).addClass("row");

    for (var i = 0; i < numFound; i++) {
        //loop thru the entire stack of theaters found
        newRow = $("<div>");
        $(newRow).addClass("row");
        $(newRow).addClass("click-theater");
        $(newRow).attr("data-theater-ind", i);  //index to theater stack 


        //bring out as local variable for demo purposes
        var currCinemaRec = theaterObj.retMatchRecFromCinemaStack(mfStack[i].cinema_id);
        var nameStr = currCinemaRec.theaterName;
        var address = currCinemaRec.address.houseNum + " " + currCinemaRec.address.street;
        var city = currCinemaRec.address.city;
        var state = currCinemaRec.address.state;
        var zipcode = currCinemaRec.address.zipCode;
        var geoLat = currCinemaRec.address.geoLocLat;
        var geoLong = currCinemaRec.address.geoLocLong;
        var distToCenter = currCinemaRec.distToCenter.toString();
        var travelTime = currCinemaRec.travelToTime.toString();


        //        newPtag = $("<p>");
        H4tag = $("<h4>");
        $(H4tag).css("line-height", "1.0");
        $(H4tag).css("margin", "0px");
        $(H4tag).css("padding", "0px");
        var line3str = "" + moment(mfStack[i].startTime_utc).format("h:mm a");
        $(H4tag).text(line3str);
        //        $(H4tag).appendTo(newPtag);
        //$(newPtag).appendTo(newRow);

        var newSpanTag = $("<span>");
        //        H4tag = $("<h4>");
        //        $(H4tag).css("line-height", "1.0");
        //        $(H4tag).css("margin", "0px");
        //        $(H4tag).css("padding", "0px");
        $(newSpanTag).css("font-weight", "normal");
        line3str = "  show, ends at "
        $(newSpanTag).text(line3str);
        $(newSpanTag).appendTo(H4tag);
        //        $(newSpanTag).appendTo(newPtag);

        newSpanTag = $("<span>");
        //        H4tag = $("<h4>");
        //        $(H4tag).css("line-height", "1.0");
        //        $(H4tag).css("margin", "0px");
        //        $(H4tag).css("padding", "0px");
        line3str = moment.unix(mfStack[i].finishTime_ts).format("h:mm a");
        $(newSpanTag).text(line3str);
        $(newSpanTag).appendTo(H4tag);
        var brTag = $("<br/>");
        $(brTag).css("line-height", "2px");
        $(brTag).appendTo(H4tag);
        $(H4tag).appendTo(newRow);

        newPtag = $("<p>");
        var H3tag = $("<h4>");
        $(H3tag).css("line-height", "1.0");
        $(H3tag).css("margin", "0px");
        $(H3tag).css("padding", "0px");
        $(newPtag).css("margin", "0px");
        $(newPtag).css("padding", "0px");
        $(newPtag).css("line-height", "2px");
        $(H3tag).text(nameStr);
        $(H3tag).appendTo(newPtag);
        var brTag = $("<br/>");
        $(brTag).appendTo(newPtag);


        var H4tag = $("<h5>");
        $(H4tag).css("line-height", "1.0");
        $(H4tag).css("margin", "0px");
        $(H4tag).css("padding", "0px");
        $(H4tag).text(address);
        $(H4tag).appendTo(newPtag);
        var brTag = $("<br/>");
        $(brTag).appendTo(newPtag);

        H4tag = $("<h5>");
        $(H4tag).css("line-height", "1.0");
        $(H4tag).css("margin", "0px");
        $(H4tag).css("padding", "0px");
        $(H4tag).text(city + " , " + state + " " + zipcode);
        $(H4tag).appendTo(newPtag);
        brTag = $("<br/>");
        $(brTag).appendTo(newPtag);
        brTag = $("<br/>");
        $(brTag).appendTo(newPtag);
        brTag = $("<br/>");
        $(brTag).appendTo(newPtag);

        //travel from time
        H4tag = $("<h5>");
        $(H4tag).css("line-height", "1.0");
        $(H4tag).css("margin", "0px");
        $(H4tag).css("padding", "0px");
        $(H4tag).text("trip details: ");
        $(H4tag).appendTo(newPtag);
        var brTag = $("<br/>");
        $(brTag).appendTo(newPtag);

        //put in the distance and times now
        H4tag = $("<h5>");
        $(H4tag).css("line-height", "1.0");
        $(H4tag).css("margin", "0px");
        $(H4tag).css("padding", "0px");
        $(H4tag).text("" + numeral(distToCenter).format("0.0") + " miles" + " " + numeral(travelTime).format("0.0") + " min" + " away");
        $(H4tag).appendTo(newPtag);
        var brTag = $("<br/>");
        $(brTag).appendTo(newPtag);

        H4tag = $("<h5>");
        $(H4tag).css("line-height", "1.0");
        $(H4tag).css("margin", "0px");
        $(H4tag).css("padding", "0px");
        var tripDetails = "leave: " + moment.unix(mfStack[i].timeToLeave).format("h:mma");
        $(H4tag).text(tripDetails);
        $(H4tag).appendTo(newPtag);
        brTag = $("<br/>");
        $(brTag).appendTo(newPtag);

        H4tag = $("<h5>");
        $(H4tag).css("line-height", "1.0");
        $(H4tag).css("margin", "0px");
        $(H4tag).css("padding", "0px");
        tripDetails = "movie starts: " + moment(mfStack[i].startTime_utc).format("h:mma");
        $(H4tag).text(tripDetails);
        $(H4tag).appendTo(newPtag);
        brTag = $("<br/>");
        $(brTag).appendTo(newPtag);


        H4tag = $("<h5>");
        $(H4tag).css("line-height", "1.0");
        $(H4tag).css("margin", "0px");
        $(H4tag).css("padding", "0px");
        tripDetails = "movie ends: " + moment.unix(mfStack[i].finishTime_ts).format("h:mma");
        $(H4tag).text(tripDetails);
        $(H4tag).appendTo(newPtag);
        brTag = $("<br/>");
        $(brTag).appendTo(newPtag);

        H4tag = $("<h5>");
        $(H4tag).css("line-height", "1.0");
        $(H4tag).css("margin", "0px");
        $(H4tag).css("padding", "0px");
        tripDetails = "back home at: " + moment.unix(mfStack[i].timeBack).format("h:mma");
        $(H4tag).text(tripDetails);
        $(H4tag).appendTo(newPtag);
        brTag = $("<br/>");
        $(brTag).appendTo(newPtag);

        $(H4tag).appendTo(newPtag);
        var brTag = $("<br/>");
        $(brTag).appendTo(newPtag);

        $(newPtag).appendTo(newRow);

        //horizontal row between movies
        newPtag = $("<p>");
        HRtag = $("<hr>");
        $(HRtag).appendTo(newPtag);
        $(newPtag).appendTo(newRow);

        $(newRow).appendTo(divOutput);
    };

    $(newRow).appendTo(divOutput);
    newRow = $("<div>");
    $(newRow).addClass("row");
    newPtag = $("<p>");
    HRtag = $("<hr>");
    $(HRtag).appendTo(newPtag);
    $(newPtag).appendTo(newRow);        //hor row
    $(newPtag).appendTo(newRow);        //2nd hor row

    //finish out the row
    $(newRow).appendTo(divOutput);
};


var outputShowTimes = function () {
    //outputs search to movies
    var divOutput = $("#movieOutput");
    divOutput.html("");
    var mStack = theaterObj.movieStack.length;
    var numFound = mStack.length;
    for (var i = 0; i < numFound; i++) {
        //loop thru the entire stack
        //var stackPtr = th[i];

        var newRow = $("<div>");
        $(newRow).addClass("row");
        var movieStr = mStack[i].movie.title;
        var rating = mStack[i].movie.rating;
        //var theaterName = stack.theaterName;
        //var theaterStreet = stackPtr.address.street;
        //var theaterCity = stackPtr.address.city;
        //var theaterState = stackPtr.address.state;
        //var startTime = moment(stackPtr.theaterRec.start_at).format("h:mm a");
        var runTime = mStack.runtime + " min";
        //var stopTime = moment(stackPtr.theaterRec.start_at).add(stackPtr.movie.runtime, "minutes").format("h:mm a");

        var H2tag = $("<h3>");
        var line1str = movieStr;
        var newPtag = $("<p>");

        $(H2tag).text(line1str);
        var H3tag = $("<h4>");
        $(H3tag).text(" " + startTime + " " + "run=" + runTime + " ends = " + stopTime);
        $(H2tag).appendTo(newPtag);
        $(H3tag).appendTo(newPtag);
        $(newPtag).appendTo(newRow);

        var line2str = theaterName
            + " " + theaterCity + "," + theaterState;
        newPtag = $("<p>");
        newPtag.text(line2str);
        $(newPtag).appendTo(newRow);
        $(newRow).appendTo(divOutput);

        var line3str = theaterStreet + " " + theaterCity + ", " + theaterState;
        newPtag = $("<p>");
        newPtag.text(line3str);
        $(newPtag).appendTo(newRow);
        $(newRow).appendTo(divOutput);

        //now the location file
        var line4str = "lat=" + stackPtr.address.geoLocLat + " lon=" + stackPtr.address.geoLocLong;
        newPtag = $("<p>");
        newPtag.text(line4str);
        $(newPtag).appendTo(newRow);
        $(newRow).appendTo(divOutput);

        var urlMovieThumb = stackPtr.movie.thumbImgUrl;
        var imgTag = $("<img>");
        $(imgTag).attr("src", urlMovieThumb)
        $(imgTag).appendTo(newRow);

        newPtag = $("<p>");
        HRtag = $("<hr>");
        $(HRtag).appendTo(newPtag);
        $(newPtag).appendTo(newRow);
        $(newRow).appendTo(divOutput);
    };
};


var geoPushDefault = function () {
    //send in a default address if blocked the input
    theaterObj.searchLoc.addrOriginalStr = "2607 W 17th St, Chicago IL 60608";
    theaterObj.searchLoc.addrSearchStr = "2607 W 17th St, Chicago IL 60608";
    theaterObj.searchLoc.lat = numeral(41.8583606).format("+0000.000000");
    theaterObj.searchLoc.long = numeral(-87.69337).format("+0000.000000");
    if (configData.dispRichOutput === true) {
        //$("#GPScoord").text(numeral(theaterObj.searchLoc.lat).format("+0000.000000") + " , " + numeral(theaterObj.searchLoc.long).format("+0000.000000"));
        $("#input-addr").val(theaterObj.searchLoc.addrSearchStr);
    } else {
        $("#cityZipSearch").val(theaterObj.searchLoc.addrSearchStr);
    };

};

var getLocation = function () {
    modalWaitLocation.style.display = "block";
    navigator.geolocation.getCurrentPosition(showPosition,
        function (error) {
            //there is a problem with getting the GPS data

            //alert("why cancel ?")
            geoPushDefault();
            modalWaitLocation.style.display = "none";
            //showPosition();
        });

    if (configData.dispRichOutput === true) {
        //modalMap.style.display = "none";
        //document.getElementById("container-map").style.display = "none";
    };
};

var showPosition = function (position) {
    if (configData.dispRichOutput === true) {
        $("#input-lat").val(numeral(position.coords.latitude).format("0000.000000"));
        $("#input-lon").val(numeral(position.coords.longitude).format("0000.000000"));
        $("#input-dist").val(numeral(configData.theaterSearchDist).format("0.0"));
        theaterObj.searchLoc.lat = numeral(position.coords.latitude).format("0000.000000");
        theaterObj.searchLoc.long = numeral(position.coords.longitude).format("0000.000000");
        theaterObj.searchLoc.dist = configData.theaterSearchDist;
        theaterObj.addrSearchStr = "";
    } else {
        theaterObj.searchLoc.lat = numeral(position.coords.latitude).format("0000.000000");
        theaterObj.searchLoc.long = numeral(position.coords.longitude).format("0000.000000");
        theaterObj.searchLoc.dist = configData.theaterSearchDist;
        theaterObj.addrSearchStr = "";
    };
    //next step is to convert to a postal address
    convertGeoToAddr();
};

var convertGeoToAddr = function () {
    var userPositionToAddressURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
    userPositionToAddressURL += numeral(theaterObj.searchLoc.lat).format("+0000.000000");
    userPositionToAddressURL += "," + numeral(theaterObj.searchLoc.long).format("+0000.000000");
    userPositionToAddressURL += "&key=" + configData.keyAPIgoogle;

    $.ajax({
        url: userPositionToAddressURL,
        method: "GET"
    }).then(function (response) {
        theaterObj.searchLoc.addrSearchStr = response.results[0].formatted_address;
        //store the orignal string to see if need to re-compute geo location
        theaterObj.searchLoc.addrOriginalStr = theaterObj.searchLoc.addrSearchStr;
        if (configData.dispRichOutput != true) {
            $("#cityZipSearch").val(theaterObj.searchLoc.addrSearchStr);
        } else {
            //$("#GPScoord").text(numeral(theaterObj.searchLoc.lat).format("+0000.000000") + " , " + numeral(theaterObj.searchLoc.long).format("+0000.000000"));
            $("#input-addr").val(theaterObj.searchLoc.addrSearchStr);
        };
        //turn off wait location
        modalWaitLocation.style.display = "none";
    });
};

var checkAndConvertAddrToGeo = function () {
    // take address typed in an convert to Geo Location
    // RPB to implement
    //turn on wait location
    modalWaitLocation.style.display = "block";

    //read in the current inputted address and see if it changed
    var origAddrStr;
    if (theaterObj.searchLoc.addrOriginalStr == undefined || theaterObj.searchLoc.addrOriginalStr == null) {
        origAddrStr = "";
    } else {
        origAddrStr = theaterObj.searchLoc.addrOriginalStr.trim();
    };

    //need to check for blanks and null before accepting page's address
    var strIn;
    if (configData.dispRichOutput != true) {
        //full page
        strIn = $("#cityZipSearch").val();
    } else {
        //rich's test screen has different data
        var strIn = $("#input-addr").val();
    };
    if (strIn == null || strIn == undefined) {
        //handle a blank input
        strIn = "";
    };
    var pageAddrStr = strIn.trim();  //address inputted on page

    if (origAddrStr != pageAddrStr) {
        //need to do a new search to get new geo location
        //for testing false or bad location, just force in a known address
        if (configData.dispRichTestFalseGPS == true) {
            //for now, just blast in 467 W. second street address
            theaterObj.searchLoc.addrOriginalStr = "467 W. Second Street, Elmhurst IL 60126";
            theaterObj.searchLoc.addrSearchStr = "467 W. Second Street, Elmhurst IL 60126";
            theaterObj.searchLoc.lat = numeral(41.9057183).format("+0000.000000");
            theaterObj.searchLoc.long = numeral(-87.9747192).format("+0000.000000");
            if (configData.dispRichOutput != true) {
                $("#cityZipSearch").val(theaterObj.searchLoc.addrSearchStr);
            } else {
                //$("#GPScoord").text(numeral(theaterObj.searchLoc.lat).format("+0000.000000") + " , " + numeral(theaterObj.searchLoc.long).format("+0000.000000"));
                $("#input-addr").val(theaterObj.searchLoc.addrSearchStr);
            };
            doneConvertAddrToGeo();
        } else {
            //needs new geo location based on address and NOT in test mode
            var userAddrToGeoURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + pageAddrStr + "&key=AIzaSyAE03QBe5yDXRr1fzDvkWs9i_E_BIyCDhk";
            $.ajax({
                url: userAddrToGeoURL,
                method: "GET"
            }).then(function (response) {
                //got the geo location
                var locLatIn = response.results[0].geometry.location.lat;
                var locLongIn = response.results[0].geometry.location.lng;
                theaterObj.searchLoc.lat = numeral(locLatIn).format("+0000.000000");
                theaterObj.searchLoc.long = numeral(locLongIn).format("+0000.000000");
                theaterObj.searchLoc.addrSearchStr = response.results[0].formatted_address;

                if (configData.dispRichOutput != true) {
                    $("#cityZipSearch").val(theaterObj.searchLoc.addrSearchStr);
                } else {
                    //$("#GPScoord").text(numeral(theaterObj.searchLoc.lat).format("+0000.000000") + " , " + numeral(theaterObj.searchLoc.long).format("+0000.000000"));
                    $("#input-addr").val(theaterObj.searchLoc.addrSearchStr);
                };
                doneConvertAddrToGeo();
            });
        }
    } else {
        //old addr matches, so can continue
        doneConvertAddrToGeo();
    };
};


var doneConvertAddrToGeo = function () {
    //geo conversion is done, continue on
    //turn off wait location
    modalWaitLocation.style.display = "none";
    theaterObj.doSearchInitial();
};


var geoDistCalcBetweenPoints = function (geoPt1, geoPt2) {
    //calculate the distance between search
    //geoPt1  is  { lat: , lng: }
    var Pt1 = {
        lat: parseFloat(geoPt1.lat),
        lng: parseFloat(geoPt1.lng)
    };
    var Pt1_lat_Str = numeral(Pt1.lat).format("+0000.000000");
    var Pt1_lng_Str = numeral(Pt1.lng).format("+0000.000000");
    Pt1_str = Pt1_lat_Str + "," + Pt1_lng_Str;
    //Pt1_str = JSON.stringify( Pt1 );    

    var Pt2 = {
        lat: parseFloat(geoPt2.lat),
        lng: parseFloat(geoPt2.lng)
    };
    var Pt2_lat_Str = numeral(Pt2.lat).format("+0000.000000");
    var Pt2_lng_Str = numeral(Pt2.lng).format("+0000.000000");
    Pt2_str = Pt2_lat_Str + "," + Pt2_lng_Str;

    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
        {
            origins: [Pt1_str],
            destinations: [Pt2_str],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            avoidHighways: false,
            avoidTolls: false
        }, geoDistResponded);

};



var geoDistHomeToTheater = function (stackToUse, indexNum) {
    //calculate the distance of the theater and home
    //and store it
    var searchStack;

    var Pt1 = {
        lat: theaterObj.searchLoc.lat,
        lng: theaterObj.searchLoc.long
    };

    if (stackToUse === "TF") { searchStack = theaterObj.theatersFoundStack };

    var Pt2 = {
        lat: searchStack[indexNum].address.geoLocLat,
        lng: searchStack[indexNum].address.geoLocLong
    };

    theaterObj.geoLookup.recIndexOn = indexNum;
    theaterObj.geoLookup.currStackWorkingOn = stackToUse;
    geoDistCalcBetweenPoints(Pt1, Pt2);
};



var evalPicClick = function () {
    //a picture got clicked
    //so user picked a movie and now needs the theaters associated with it
    var imgClicked = $(this).attr("data-image");
    modalWaitMovieTimes.style.display = "block";
    var divOutput = $("#movieOutput");
    divOutput.html("");
    theaterObj.numMovieClickedIndex = parseInt(imgClicked);
    //find all matches and put onto a moviesFound stack with movie_id, start_time, and cinema
    theaterObj.doMoviesFoundList();
    modalWaitMovieTimes.style.display = "none";
    outputMoviesByMovieTime();
};


var evalTheaterClick = function () {
    //theater option clicked
    //so at this point know what movie want to see 
    //and the theater going to
    var currCinemaRec;
    var mfStack = theaterObj.movieFoundStack;  //shorthand
    if (configData.dispRichOutput == true) {
        var theaterRow = $(this).attr("data-theater-ind");
        currCinemaRec = theaterObj.retMatchRecFromCinemaStack(mfStack[theaterRow].cinema_id);
    } else {
        //came from index file, so need different way to pull
        //so cinema ID comes from theatersMatchStack     
        var thPicked = theaterObj.theaterPicked;
        var TMstack = theaterObj.theatersMatchStack; //shorthand to make next line readable
        currCinemaRec = theaterObj.retMatchRecFromCinemaStack(TMstack[thPicked].cinema_id);
    }
    var ctRec = theaterObj.currTheaterDisp;   //shorthand for current theater record
    var geoLat = currCinemaRec.address.geoLocLat;
    var geoLong = currCinemaRec.address.geoLocLong;

    //global variable for the theater location
    testTheater.lat = geoLat;
    testTheater.lng = geoLong;

    //move to current record spot
    ctRec.cinema_id = currCinemaRec.cinema_id;
    ctRec.theaterName = currCinemaRec.theaterName;
    ctRec.distToCenter = currCinemaRec.distToCenter;
    ctRec.telephone = currCinemaRec.telephone;
    ctRec.travelToTime = currCinemaRec.travelToTime;
    ctRec.travelFromTime = currCinemaRec.travelFromTime;
    ctRec.url = currCinemaRec.url;
    ctRec.address.city = currCinemaRec.address.city;
    ctRec.address, dispText = currCinemaRec.address.dispText;
    ctRec.address.geoLocLat = currCinemaRec.address.geoLocLat;
    ctRec.address.geoLocLong = currCinemaRec.address.geoLocLong;
    ctRec.address.houseNum = currCinemaRec.address.houseNum;
    ctRec.address.state = currCinemaRec.address.state;
    ctRec.address.street = currCinemaRec.address.street;
    ctRec.address.zipCode = currCinemaRec.address.zipCode;

    if (configData.dispRichOutput == true) {
        displayMap(true);
        //document.getElementById("container-map").style.display = "block";
        // popup is shown and map is not visible
        //google.maps.event.trigger(map, 'resize');
    } else {
        //in case need to do something special in the index.html file
        displayMap(true);
    };

};


//these are Open Table API searches.  
//move to restaurant search later
var restRecOpenTableType = { //record coming back from OpenTable
    name: "",
    restID: "",
    address: {
        dispText: "",
        houseNum: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        geoLocLat: 0,
        geoLocLong: 0
    },
    telephone: "",
    urlOpenTableSite: "",  //open table url
    urlOpenTableReservation: "",
    urlOpenTableMobileReserv: "",
    urlOpenTableImage: "",
    urlRestaurant: "",
    distToTheater: 0,
    travelTimeToTheater: 0,
    distToHome: 0,
    travelTimeToHome: 0,
    eatingTime: 0,
};

var restOpenTableObj = { //everything for OpenTable
    currRestOpenTable: restRecOpenTableType,
    restFoundStack: [],  //array of restRecOpenTableType

    clearRestFoundStack: function () {
        //clear out the entire stack
        for (var i = 0; i < restOpenTableObj.restFoundStack.length; i++) {
            restOpenTableObj.restFoundStack.pop();
        };
    },

    addToRestFoundStack: function () {
        //adds the currRestOpen rec to the stack
        var copyOfRec = jQuery.extend(true, {}, this.currRestOpenTable);
        this.restFoundStack.push(copyOfRec);
    },

    copyResponseToCurrRec: function (OTresponse) {
        recCurr = this.currRestOpenTable;  //for shorthand
        recIn = OTresponse; //shorthand
        recCurr.restID = recIn.id;
        recCurr.name = recIn.name;
        recCurr.address.dispText = recIn.address;
        recCurr.address.city = recIn.city;
        recCurr.address.state = recIn.state;
        recCurr.zipCode = recIn.postal_code;
        recCurr.address.geoLocLat = recIn.lat;
        recCurr.address.geoLocLong = recIn.lng;
        recCurr.telephone = recIn.phone;
        recCurr.urlOpenTableReservation = recIn.reserve_url;
        recCurr.urlOpenTableMobileReserv = recIn.mobile_reserve_url;
        recCurr.urlOpenTableImage = recIn.image_url;
    },

    retIsRestOnOpenTable: function () {
        //go thru the entire file and see if there is a match
        var numInStack = this.restFoundStack.length;
        var iLoop = 0;
        var continLoop = true;
        do {
            iLoop++
            if (iLoop >= numInStack) {
                continLoop = false;
            }
        } while (continLoop === true);
    }
};

var displayMap = function (dispOn) {
    //display the map if the dispOn is on
    if (dispOn === true) {
        modalMap.style.display = "block";
        initMap();
    } else {
        modalMap.style.display = "none";
    };
};



// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    //just mass close everything
    //replace with Case statement  in future
    if (event.target == modalMap) {
        modalMap.style.display = "none";
    }
};


var hideLineTheater = function (tNum) {
    //hide a theater
    if (tNum == 2) { $("#theater2").css("display", "none"); };
    if (tNum == 3) { $("#theater3").css("display", "none"); };
};



var geoDistResponded = function (response, status) {
    if (status != google.maps.DistanceMatrixStatus.OK) {
        alert("error in calculating distance");
        console.log("dist calc erro = ", err);
    } else {
        var origin = response.originAddresses[0];
        var destination = response.destinationAddresses[0];
        if (response.rows[0].elements[0].status === "ZERO_RESULTS") {
            alert("no land roads between your points");
            console.log("no land roads");
        } else {
            var distance = response.rows[0].elements[0].distance;
            var distance_value = distance.value;
            var miles = parseFloat(distance_value) / 1609.344;
            console.log("distance = " + miles);
            theaterObj.geoLookup.geoDistFound = miles;
            var timeInSecs = response.rows[0].elements[0].duration.value;
            var timeInMin = parseFloat(timeInSecs) / 60.00;
            theaterObj.geoLookup.geoTimeTravel = timeInMin;
            console.log("time in min = " + timeInMin);

            //now figure out what to do next
            if (theaterObj.geoLookup.currStackWorkingOn === "TF") {
                theaterObj.geoDistHomeToTheater_next("TF");
            };
        };
    };
};



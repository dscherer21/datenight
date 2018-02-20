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












});





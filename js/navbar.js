$(function(){
    $("#includedContent").load("menu.html"); 
  });

  // $('.navmenu li a').click(function(){
  //   console.log('in menu');
  //   $(this).addClass('selected').siblings().removeClass('selected');
  //   });

  // function toggleSelected() {
  //     const element = document.getElementById("myDiv");
  //     element.classList.toggle("selected");
  // }

  $(document).ready(function() {
    // Get the current page URL

    $('ul li').click(function(){
      $(this).addClass('active');
      $(this).parent().children('li').not(this).removeClass('active');
    });
    
    // var currentUrl = window.location.pathname;
  
    // // Select all navbar links
    // $('.navmenu li a').each(function() {
    //   console.log('in func')
    //   // Check if the link's href matches the current URL
    //   if ($(this).attr('href') === currentUrl) {
    //     // Add the 'selected' class to the link
    //     console.log('in if')

    //     $(this).addClass('selected'); 
    //   }
    // });
  });
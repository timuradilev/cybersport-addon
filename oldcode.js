//window.scroll(0, 2000); setTimeout( function(){window.scroll(0, 0);}, 100 );
//comments__count is class for <span class="comments__count">count</span>

var myelem = document.getElementById("comments");
/*setInterval(function isScrolledIntoView()
{
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    console.log( ((elemBottom <= docViewBottom) && (elemTop >= docViewTop)));
}, 100); */
function isScrolledIntoView(elem)
{
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}
//var commentsArticle = $("#comments").attr("class");
//console.log(commentsArticle);
$(document).scroll(function() {
  //console.log($("#comments").attr("class"));
  if(isScrolledIntoView(myelem)) {
    //if(!(count--))
    //  $(document).off("scroll");
    //console.log($("#comments").attr("class"));
    if("comments" == $("#comments").attr("class")) {
      console.log("success");
      $(document).off("scroll");
    }
  }
});

function addKeys(start, end)
{
  for(var i = start; i <= end; ++i) {
    localStorage.setItem("news/vega-squadron-pokinula-sl-imbatv-invitational-chongqing-2018" + i, "1000" + i  + ":1000");
  }
}

  //setInterval(highlightUsersComments, 100);
  //$(".comments__list").on("DOMNodeRemoved", "article", function(event) { console.log($(event.currentTarget));} );
  //var count = 0; $("article").livequery(function(){ alert("sssd"); });
  //var count = 0; $(".comments__list").on('DOMNodeInsertedIntoDocument', "article", function() { console.log(++count); } );
  //$('.comments__list').one('DOMNodeInserted', '.comment', highlightUsersComments); //Call handler when first comment is added in comments list
  //$('.comments__count').on('DOMSubtreeModified', function() {
  //$('.comments__list').on('DOMNodeInserted', '.comments__item', function(event) {
  //  console.log(event.currentTarget);
  //}); //Call handler when first comment is added in comments list

  //$(document).ready(highlightUsersComments); //Call handler when a page has loaded

  //var parsedUrl = parseUrl();
  //if("none" != parsedUrl.type) // if current page is news/blog/match/tournament...
  //    $('.comments__list').one('DOMNodeInserted', '.comment', { "key": parsedUrl.key }, highlightNewComments); //Call handler when first comment is added in comments list


/*$(document).ready(function() {
    $(".comment-counter").after(function(){ // iterate over each topic's comment counter
      //var topicHref = this.parentElement.href.replace("#comments","");
      //console.log(this.parentElement.pathname);
      var parsedUrl = parseUrlPathname(this.parentElement.pathname);
      var locStorValue = localStorage.getItem(parsedUrl.key);
      if(null != locStorValue) {
        var oldCommentsCount = locStorValue.split(":")[1]; // id:count
        var commentsCount = this.children[2].innerText; // span(.comment-counter) > childs[2] > span(.comment-counter__count)
        return "<span style='color: #6c9007'>+" + (commentsCount > oldCommentsCount ? commentsCount - oldCommentsCount : "0") + "</span>";
      }
      return "";
    });
  });
  */
  
  //comment-counter__count
  // comment-counter
  //$(".comment-counter").after("!");
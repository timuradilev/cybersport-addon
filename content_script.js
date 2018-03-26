init();
function init()
{
  
  keepLocalStorageFromOverflowing();
  if(window.location.pathname == "/") //if it is main page
    showNewCommentsCounterOnMainPage();
  else
    highlightComments();
}

function showNewCommentsCounterOnMainPage()
{
  $(document).ready(function() {
    $.initialize(".comment-counter", function() {
      var parsedUrl = parseUrlPathname(this.parentElement.pathname);
      var locStorValue = localStorage.getItem(parsedUrl.key);
      if(null != locStorValue) {
        var oldCommentsCount = locStorValue.split(":")[1]; // id:count
        var commentsCount = this.children[2].innerText; // span(.comment-counter) > childs[2] > span(.comment-counter__count)
        $(this).after("\n<span style='color: #6c9007'>+" + (commentsCount > oldCommentsCount ? commentsCount - oldCommentsCount : "0") + "</span>");
      }
    });
  });
}


function highlightComments()
{
  var parsedUrl = parseUrlPathname(window.location.pathname);
  
  //tracking changes in 'comments__count'. It happens only when user posts or removes comment
  var config = { childList: true };
  var callback = function(mutationsList) {
    var removedCounter = null;
    for(var mutation of mutationsList) {
      if(mutation.removedNodes.length != 0) // if 'comments__count' removed from DOM
        removedCounter = mutation.removedNodes[0].data;
      if (mutation.addedNodes.length != 0) {// if 'comments__count' added to DOM
        //if user posts comment, add 1 to commentsCount, if removes comment, take 1 from commentsCount
        if(null != removedCounter) {
          var arrInfo = localStorage.getItem(parsedUrl.key).split(":");
          var maxCommentId  = arrInfo[0];
          var commentsCoundDiff = mutation.addedNodes[0].data - removedCounter; // has to be 1 or -1.
          var newCommentsCount = parseInt(arrInfo[1]) + parseInt(commentsCoundDiff); //arrInfo[1] + commentsCoundDiff returns string, not int
          localStorage.setItem(parsedUrl.key, maxCommentId + ":" + newCommentsCount);
        }
      }
    }
  };
  var observer = new MutationObserver(callback);
  
  //get user's name
  var userName = document.getElementsByClassName("header__login")[0].children[3].children[0].children[0].innerText;
  
  //get data from localStorage about last visit
  var locStorValue = localStorage.getItem(parsedUrl.key);
  if(null != locStorValue) { // if user has already visited this page
    var arr = locStorValue.split(":"); // id:count
    var oldMaxCommentId = arr[0];
    var oldCommentsCount = arr[1];
    var newMaxCommentId = oldMaxCommentId;
  } else { // it is first time user visit the page
    var oldMaxCommentId = 0;
    var newMaxCommentId = 0;
    localStorage.setItem(parsedUrl.key, "0:0");
  }
  
  var currentCommentCountElem = $(".comments__count")[0];
  
  var callOnceMutationObserverObserve = (function() {
    var executed = false;
    return function() {
      if (!executed) {
        executed = true;
        var targetNode = document.getElementsByClassName('comments__count').item(0);
        observer.observe(targetNode, config);
      }
    };
  })();
  
  var callOnceShowNewCommentsCount = (function() {
    var executed = locStorValue == null; //if it is first visit to this page, set true and never execute!
    var commentsCount = locStorValue != null ? oldCommentsCount : null;
    return function() {
      if (!executed) {
        executed = true;
        var newCommentsCount = $(".comments__count")[0].innerText - commentsCount;
        showNewCommentsCount(newCommentsCount >= 0 ? newCommentsCount : 0);
      }
    };
  })();
  
  //track every new comments that is loaded into document by site's js
  $.initialize(".comment", function() {
    if(this.className != "form__comment comment") { //exclude the form for posting new comment
      //show number of new comments only once in first call of this anonymous function. 
      //Not possible to call this function earlier because '.comments__count' not set to actual number of comments till this point of time
      callOnceShowNewCommentsCount();
      //at this point of time '.comments__count' is set from 0 to actual number of comments by site's js
      //and all comments are loaded. '.comments__count' is changed if user post new comment or delete old one.
      //next function tracks this user's actions
      callOnceMutationObserverObserve();
      //debug();
      
      
      //highlighting user's comment
      if($(this).attr('data-user-name') === userName) {
        $(this).find(".comment__inner").attr('style','background-color: #fff8dd');
        if(0 == oldCommentsCount) // if it is first user's visit or last time there were no comments at all
          if($(".comment").not(".form__comment").length == 1) // and this is the first comment on this page i.e. user posted this comment now
            localStorage.setItem(parsedUrl.key, "0:1"); // next time all others comments has to be highlighted as new.
        return;
      }
      
      //highlighting new comment
      if("none" != parsedUrl.type) {
        var commentId = $(this).attr("data-id");
        if(commentId > oldMaxCommentId) {
          if(null != locStorValue)
            $(this).find(".comment__inner").attr('style', 'background-color: rgb(222,222,222)');
          if(commentId > newMaxCommentId) {
            newMaxCommentId = commentId;
            localStorage.setItem(parsedUrl.key, newMaxCommentId + ":" + currentCommentCountElem.innerText);
          }
        }
      }
      
      //if user is 'verified'
      if($(this).find('.icon-verification').length)
        $(this).find(".comment__inner").attr('style','background-color: #f98a8a');
    }
  });
}

function keepLocalStorageFromOverflowing()
{
  if(localStorage.length > 5000) {
    //get all our key:value from localStorage
    var data = []; // key:commentId
    for(var i = 0; i < localStorage.length; ++i) {
      var key = localStorage.key(i);
      if(key.length > 3) { // length is enough to contain "news", "blog", "match", "reports"
        var arr = key.split("/");
        if(arr.length == 2 && (arr[0] === "news" || arr[0] === "match" || arr[0] === "blog" || arr[0] === "reports")) {
          data.push({ "key": key, "value": localStorage.getItem(key).split(":")[0] }); //commentId
        }          
      }
    }
    //sort keys and deleted oldest by comparing commentId with each other
    data.sort(function(a,b) { 
      if(a.value < b.value)
        return -1;
      if(a.value > b.value)
        return 1;
      return 0;
    });
    var commentsCountToDelete = 2000;
    for(var i = 0; i < commentsCountToDelete && i < data.length; ++i)
      localStorage.removeItem(data[i].key);
  }
}
function debug()
{
  var maxId = 0;
  var comments = $(".comment").not(".form__comment");
  comments.each(function() {
    if($(this).attr("data-id") > maxId)
      maxId = $(this).attr("data-id");
  });
  
  console.log("maxId = " + maxId);
}

//get type of page and key to set in localStorage or get from localStorage
function parseUrlPathname(url)
{
  var pathnameParts = url.split("/");
  //var parsedUrl = window.location.pathname.match(/(\w+)\/([\w-]+)/i); // hostname/*/*/
  var page = { "type": null };
  if(pathnameParts.length < 2)
    page = { "type": "none" };
  else
    page = { "type": pathnameParts[1] }; // news/blog/reports/matches...
  
  if("news" == page.type &&  pathnameParts.length > 2)
    page.key = pathnameParts[1] + "/" + pathnameParts[2]; // key in localStorage
  else if ("blog" == page.type && pathnameParts.length > 3)
    page.key = pathnameParts[1] + "/" + pathnameParts[3];
  else if ("base" == page.type && pathnameParts.length > 4) {
      if("match" == pathnameParts[2]) {
        page.type = "match";
        page.key = "match/" + pathnameParts[4];
      }
      else {
        page.type = "none";
      }
  }
  else if ("reports" == page.type && pathnameParts.length > 2)
    page.key = pathnameParts[1] + "/" + pathnameParts[2];
  else
    page.type = "none";

  return page;
}

function showNewCommentsCount(number)
{
  var commentsCountElem = $(".comments__header").find("h3");
  $(commentsCountElem).append("<span style='color:#6c9007'> +" + number +"</span>");
}

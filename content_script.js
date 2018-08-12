'use strict';
init();
function init()
{
  keepLocalStorageFromOverflowing();
  if(window.location.pathname == "/")
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
        var oldCommentsCount = parseInt(locStorValue.split(":")[1]); // id:count
        var commentsCount = parseInt(this.children[2].innerText); // span(.comment-counter) -> childs[2] -> span(.comment-counter__count)
        $(this).after("\n<span style='color: #6c9007'>+" + (commentsCount > oldCommentsCount ? commentsCount - oldCommentsCount : "0") + "</span>");
      }
    });
  });
}
function highlightComments()
{
  var parsedUrl = parseUrlPathname(window.location.pathname);
  if("none" == parsedUrl.type) {
    highlightUsersComents();
    return;
  }
  var colors = getColors();
  var locStorValue = localStorage.getItem(parsedUrl.key);
  if(null != locStorValue) {
    var arr = locStorValue.split(":"); // id:count
    var oldMaxCommentId = arr[0];
    var oldCommentsCount = arr[1];
    var newMaxCommentId = oldMaxCommentId;
  } else {
    var oldMaxCommentId = 0;
    var newMaxCommentId = 0;
    var oldCommentsCount = 0;
    localStorage.setItem(parsedUrl.key, "0:0");
  }
  var callOnceMutationObserverObserve = (function() {
    var executed = false;
    return function() {
      if (!executed) {
        executed = true;
        trackUserPostingAndDeletingComment(parsedUrl.key);
      }
    };
  })();
  var callOnceShowNewCommentsCount = (function() {
    var executed = locStorValue == null;
    var commentsCount = locStorValue != null ? oldCommentsCount : null;
    return function() {
      if (!executed) {
        executed = true;
        var newCommentsCount = $(".comments__count")[0].innerText - commentsCount;
        showNewCommentsCount(newCommentsCount >= 0 ? newCommentsCount : 0);
      }
    };
  })();
  var userName = getUserName();
  var currentCommentCountElem = $(".comments__count")[0];
  var mutationObserverRunned = false; //kludge! See comment for 'highlighting user's comment' section further
  //track every new comments that is loaded into document by site's js
  $.initialize(".comment", function() {
    if(this.className != "form__comment comment") { //exclude the posting form
      //Not possible to call this function earlier because '.comments__count' not set to actual number of comments till this point of time
      callOnceShowNewCommentsCount();
      if($(this).attr('data-user-name') === userName) {
        $(this).find(".comment__inner").attr('style','background-color: ' + colors.userComment);
        //mutationObserver starts tracking '.comments__count'(to know when user is posting or removing comments) after the first comment is inserted in DOM
        //when user posts a comment and it is the first comment in this news(blog/reports/match) mutationObserver hasn't been started yet.
        //So next two lines of code exists to handle this situation
        if(!mutationObserverRunned && 0 == oldCommentsCount) // this ensures that this is not old user's comment, but new and created right now
            localStorage.setItem(parsedUrl.key, "0:1");
      } else {
        var commentId = $(this).attr("data-id");
        if(commentId > oldMaxCommentId) {
          if(null != locStorValue)
            $(this).find(".comment__inner").attr('style', 'background-color: ' + colors.newComment);
          if(commentId > newMaxCommentId) {
            newMaxCommentId = commentId;
            localStorage.setItem(parsedUrl.key, newMaxCommentId + ":" + currentCommentCountElem.innerText);
          }
        }
        //an author of the comment is 'verified'. If this is highlighted as a new comment, it will be restyled.
        if($(this).find('.icon-verification').length)
          $(this).find(".comment__inner").attr('style','background-color: ' + colors.verifiedUserComment);
      }
      //to know when user posts or removes comments, mutationObserver is called to track changes in '.comments__count' element
      //at this point of time '.comments__count' is set from 0 to actual number of comments by site's js and all comments are loaded.
      //why mutationObserver isn't called before "$.initialize(".comment" ? mutationObserver has to be triggered only by user's action, 
      //not when site's JS sets '.comments__count' to actual number of comments.
      callOnceMutationObserverObserve();
      mutationObserverRunned = true;
    }
  });
}
function highlightUsersComents()
{
  var colors = getColors();
  var userName = getUserName();
  $.initialize(".comment", function() {
    if(this.className != "form__comment comment") {
      if($(this).attr('data-user-name') === userName)
        $(this).find(".comment__inner").attr('style','background-color: ' + colors.userComment);
      else
        if($(this).find('.icon-verification').length)
          $(this).find(".comment__inner").attr('style','background-color: ' + colors.verifiedUserComment);
    }
  });
}
function keepLocalStorageFromOverflowing()
{
  if(localStorage.length > 3000) {
    var data = []; // key:commentId
    for(var i = 0; i < localStorage.length; ++i) {
      var key = localStorage.key(i);
      if(key.length > 3) { // length is enough to contain "news", "blog", "match", "repo"rts
        var arr = key.split("/");
        if(arr.length == 2 && (arr[0] === "news" || arr[0] === "match" || arr[0] === "blog" || arr[0] === "reports")) { // type/rest of key
          data.push({ "key": key, "value": localStorage.getItem(key).split(":")[0] }); //save maxCommentId
        }          
      }
    }
    data.sort(function(a,b){ return (a.value < b.value) ? -1 : (a.value > b.value) ? 1 : 0; });
    var commentsCountToDelete = 1500;
    for(var i = 0; i < commentsCountToDelete && i < data.length; ++i) {// delete first elements. they are oldest ones.
      console.log(data[i].value);
      localStorage.removeItem(data[i].key);
    }
  }
}

/**
 * get type of page and key to set in localStorage or get from localStorage
 */
function parseUrlPathname(url)
{
  var pathnameParts = url.split("/");
  if(pathnameParts.length < 2)
    return { "type": "none" };
  else
    var page = { "type": pathnameParts[1] }; // news/blog/reports/matches...
  if("news" == page.type &&  pathnameParts.length > 2)
    page.key = "news/" + pathnameParts[2]; // key in localStorage
  else if ("blog" == page.type && pathnameParts.length > 3)
    page.key = "blog/" + pathnameParts[3];
  else if ("base" == page.type && pathnameParts.length > 4) {
      if("match" == pathnameParts[2]) {
        page.type = "match";
        page.key = "match/" + pathnameParts[4];
      }
      else {
        page.type = "none";
      }
  } else if ("reports" == page.type && pathnameParts.length > 2)
    page.key = "reports/" + pathnameParts[2];
  else
    page.type = "none";
  return page;
}
function showNewCommentsCount(number)
{
  var commentsCountElem = $(".comments__header").find("h3");
  $(commentsCountElem).append("<span style='color:#6c9007'> +" + number +"</span>");
}
//tracking changes in 'comments__count'. It happens only when user posts or removes comment
function trackUserPostingAndDeletingComment(localStorageKey)
{
  var config = { childList: true };
  var callback = function(mutationsList) {
    var removedCounter = null;
    for(var mutation of mutationsList) {
      console.log(mutation);
      if(mutation.removedNodes.length != 0) // if 'comments__count' removed from DOM
        removedCounter = mutation.removedNodes[0].data;
      if (mutation.addedNodes.length != 0) {// if 'comments__count' added to DOM
        //if user posts comment, add 1 to commentsCount, if removes comment, take 1 from commentsCount
        if(null != removedCounter) {
          var arrInfo = localStorage.getItem(localStorageKey).split(":");
          var maxCommentId  = arrInfo[0];
          var commentsCoundDiff = mutation.addedNodes[0].data - removedCounter; // has to be 1 or -1.
          var newCommentsCount = parseInt(arrInfo[1]) + parseInt(commentsCoundDiff);
          localStorage.setItem(localStorageKey, maxCommentId + ":" + newCommentsCount);
        }
      }
    }
  };
  var observer = new MutationObserver(callback);
  var targetNode = document.getElementsByClassName('comments__count').item(0);
  observer.observe(targetNode, config);
}

function getColors()
{
  var dayNightMode = getCookie("color-mode");
  var colors = {};
  switch (dayNightMode) {
    default:
    case "mode-day":
      colors.userComment = "#fff8dd";
      colors.newComment = "#dedede";
      colors.verifiedUserComment = "#beeaec";
      break;
    case "mode-night":
      colors.userComment = "#423814";
      colors.newComment = "#154824";
      colors.verifiedUserComment = "#07494c";
      break;
  }
  return colors;
}

/**
 * source https://www.w3schools.com/js/js_cookies.asp
 */
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function getUserName()
{
  var userName = document.getElementsByClassName("header__login");
  if(userName.length)
    return userName[0].children[3].children[0].children[0].innerText;
  else
    return "";
}
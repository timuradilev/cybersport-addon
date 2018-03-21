init();

function init()
{
  var target = document.getElementsByClassName("comments__list");
 
  // создаем экземпляр наблюдателя
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        console.log(mutation);
    });    
  });
 
  // настраиваем наблюдатель
  var config = {subtree: true, attributes: true};
 
  // передаем элемент и настройки в наблюдатель
  observer.observe(target[0], config);
 
  // позже можно остановить наблюдение
  //observer.disconnect();
  
  //$('.comments__list').one('DOMNodeInserted', '.comment', highlightUsersComments); //Call handler when first comment is added in comments list
  //$('.comments__count').on('DOMSubtreeModified', function() {
  //$('.comments__list').on('DOMNodeInserted', '.comments__item', function(event) {
  //  console.log(event.currentTarget);
  //}); //Call handler when first comment is added in comments list

  //$(document).ready(highlightUsersComments); //Call handler when a page has loaded

  //var parsedUrl = parseUrl();
  //if("none" != parsedUrl.type) // if current page is news/blog/match/tournament...
  //    $('.comments__list').one('DOMNodeInserted', '.comment', { "key": parsedUrl.key }, highlightNewComments); //Call handler when first comment is added in comments list

}

function highlightUsersComments()
{
  //find out username
  var userName = document.getElementsByClassName("header__login")[0].children[3].children[0].children[0].innerText;
  //search for comments
  var comments = $(".comment");
  var myComments = [];
  
  for(var commentNumber in comments) {
    if(Number.isInteger(parseInt(commentNumber)))
     if('className' in comments[commentNumber].__proto__ && $(comments[commentNumber]).attr('data-user-name') === userName)
        myComments.push(comments[commentNumber]);
  }
  //set background color for the comments
  myComments.forEach(function(comment){
    $(comment).attr('style','background-color: #fff8dd');
  });

  //track user's attempt to post new comment
  //$('.comments__list').one('DOMNodeInserted', 'li', highlightUsersComments);
  //comments.each(function(index) {
  //  console.log($(this));
  //  $(this).attr('style','background-color: #fff8dd');
  //});
}

//return date as string with specific format(dd.mm.yyyy, hh:mm)
function convertDateToString(date)
{
  var result = "";
  var day = date.getDate();
  result += day < 10 ? "0" + day : day;
  var month = date.getMonth() + 1;
  result += "." + (month < 10 ? "0" + month : month);
  result += "." + date.getFullYear();
  result += ", ";
  var hours = date.getHours();
  result += hours < 10 ? "0" + hours : hours;
  var minutes = date.getMinutes();
  result += ":" + (minutes < 10 ? "0" + minutes : minutes);
  return result;
}

function convertStringToDate(str)
{
  //dd.mm.yyyy, hh:mm or dd.mm.yyyy, h:mm or dd.mm.yyyy, h:m
  var date = new Date(str.substr(6,4), parseInt(str.substr(3,2)) - 1, str.substr(0,2));
  var arr = str.substr(12).match(/(\d{1,2}):(\d{1,2})/);
  date.setHours(arr[1], arr[2]);
  return date;
}

//get type of page and key to set in localStorage or get from localStorage
function parseUrl()
{
  var pathnameParts = window.location.pathname.split("/");
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

function checkUserFirstTimeVisitPage()
{
  
  //alert(parsedUrl.type);
  //if(parsedUrl.type != "none")
  //  alert(parsedUrl.key);

  //if(null == localStorage.getItem(parsedUrl.key)) { // if it is the first visit of this page
  //  return;
  //}
  //if(null != localStorage.getItem(parsedUrl.key)) { //if user has already visited this page
  //  var lastVisitDate = convertStringToDate(localStorage.getItem(parsedUrl.key));
  //  //$(document).ready(highlightNewComments);
  //}
  //localStorage.setItem(parsedUrl.key, convertDateToString(new Date(Date.now()))); //set/update new visit date
}

function highlightNewComments(event)
{
  var notUsersComments = $(".comment.comment--not-my");
  var usersComments = $(".comment").not(".comment--not-my").not(".form__comment");
  var totalNumberOfComments = notUsersComments.length + usersComments.length;

  var locStorValue = localStorage.getItem(event.data.key);
  if(null != locStorValue) {
    var arr = locStorValue.split(":"); // id:number
    var oldMaxCommentId = arr[0];
    var oldNumberOfComments = arr[1];
    
    showNumberOfNewComments(totalNumberOfComments - oldNumberOfComments);
  }
  
  var maxCommentId = 0;
  notUsersComments.each(function() {
    var commentId = $(this).attr("data-id");
    if(commentId > maxCommentId)
      maxCommentId = commentId;
    
    if(null != locStorValue) { // if it is not the first time user visit current page
      if($(this).attr("data-id") > oldMaxCommentId)
        $(this).find(".comment__inner").attr('style', 'background-color: rgb(222,222,222)');
    }
  });
  
  localStorage.setItem(event.data.key, maxCommentId + ":" + totalNumberOfComments); // set/update new id:number
  
  //track user's attempt to post new comment
  //$('.comments__list').one('DOMNodeInserted', 'li', { "key": event.data.key }, function(event){
  //  var totalNumberOfComments = $(".comment").not(".form__comment").length;
  //  var arr = localStorage.getItem(event.data.key).split("/");
  //  localStorage.setItem(event.data.key, arr[0] + "/" + totalNumberOfComments);
  //});
}

function showNumberOfNewComments(number)
{
  //var currentNumberOfComments = $(".comments__count").text();
  //var numberOfNewComments = currentNumberOfComments - oldNumberOfComments;
  
  var commentsCountElem = $(".comments__header").find("h3").html();
  $(".comments__header").find("h3").html(commentsCountElem + "<span style='color:#6c9007'> +" + number +"</span>");
}

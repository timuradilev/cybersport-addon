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
}

//Call handler when first comment is added in comments list
$('.comments__list').one('DOMNodeInserted', '.comment', highlightUsersComments);
//$('.comments__count').on('DOMSubtreeModified', function() {

//Call handler when a page has loaded
$(document).ready(highlightUsersComments);

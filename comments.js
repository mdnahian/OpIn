var pageURL = "";
var pageTitle = "";
var fullscreen = false;

function getCurrentTabUrl(callback) {
  
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
  
    var tab = tabs[0];

    var url = getURLParameter('url', tab.url);
    var title = getURLParameter('title', tab.url);
    var page = getURLParameter('p', tab.url);

    if(url == null || title == null){
      url = tab.url;
      title = tab.title;

      if(page != null){
        fullscreen = true;
      }
    } else {
      fullscreen = true;
    }

    callback(url, title, page);
  });
}



function getURLParameter(name, url) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}


function closeAll() {
  for(var i=0; i<document.getElementsByClassName('input').length; i++){
    document.getElementsByClassName('input')[i].style.display = 'none';
  }
}

function buildDialog(title, message, button) {

  document.getElementById('dialog-box').innerHTML = "<div id='dtitle'>Something Went Wrong :(</div> <div id='dmessage'>This shouldn't be happening. Luckily, an error report has been sent. We will fix this issue immediately.</div> <hr> <a>&nbsp;</a> <a id='closeBtn'>Close</a>";

  document.getElementById('dtitle').innerHTML = title;
  document.getElementById('dmessage').innerHTML = message;
  document.getElementById('closeBtn').innerHTML = button;

  document.getElementById('closeBtn').addEventListener('click', function(){
    document.getElementById('dialog').style.display = 'none';
  });
  
  document.getElementById('dialog').style.display = 'block';

}

function buildUI(){
    document.getElementById('title').innerHTML = cleanHTML(pageTitle);
    document.getElementById('url').innerHTML = "<a href='" + pageURL + "'>" + cleanHTML(pageURL) + "</a>";

    var titlePage = document.getElementsByClassName('title-page')[0];

    document.getElementById('signupBtn1').addEventListener('click', function() {
      closeAll();
      document.getElementById('signup').style.display = 'block';
    });

    document.getElementById('loginBtn2').addEventListener('click', function() {
      loginBtnPressed();
    });

    document.getElementById('forgotBtn').addEventListener('click', function() {
      closeAll();
      document.getElementById('forgot').style.display = 'block';
    });

    document.getElementById('cancelBtn').addEventListener('click', function() {
      closeAll();
      document.getElementById('login').style.display = 'block';
    });

    document.getElementById('signupBtn3').addEventListener('click', function() {
      closeAll();
      document.getElementById('signup').style.display = 'block';
    });
}

function updateSessionState(){
  var currentUser = Parse.User.current();
  if (currentUser) {
      closeAll();
      document.getElementById('comment-input').style.display = 'block';
      commentSetup();
      hideLoading();
  } else {
      loginBtnPressed();
      hideLoading();
  }
}



function loadReplies(){
  showLoading()
  document.getElementById('comment-input').innerHTML = document.getElementById('welcome').innerHTML;

  loadUIBtns();

  var Comment = Parse.Object.extend("Comment");
  var query = new Parse.Query(Comment);
  query.equalTo("replyto", Parse.User.current().get("username"));
  query.descending("createdAt");

  query.find({
    success: function(results) {
      if(results.length == 0) {
        document.getElementById('comments').innerHTML = '<h5>There are no replies yet.</h5>';
        hideLoading();
      } else {

        var content =  '<h4 style="margin:0; margin-bottom:10px;">' + results.length + ' Replies</h4> <div id="comments" class="comments" style="max-height:350px; overflow-y:auto;">';

        for(var i=0; i<results.length; i++){
          var object = results[i];
          content = content + parseComment(object);
        }

        document.getElementById('comments').innerHTML = content + "</div>";

        document.getElementById('comments').style.marginTop = "10px";
        document.getElementById('comments').style.marginBottom = "10px";
        document.getElementsByTagName('body')[0].style.overflowY = 'auto';

      }

      hideLoading();

      loadLinks();

      loadLikes();

    }
  });

}



function loadActivity(){
  showLoading();
  document.getElementById('comment-input').innerHTML = document.getElementById('welcome').innerHTML;

  loadUIBtns();

  var Comment = Parse.Object.extend("Comment");

  var query1 = new Parse.Query(Comment);
  query1.equalTo("like", Parse.User.current().get("username"));

  var query2 = new Parse.Query(Comment);
  query2.equalTo("username", Parse.User.current().get("username"));

  var mainQuery = Parse.Query.or(query1, query2);
  mainQuery.descending("createdAt");
  mainQuery.find({
    success: function(results) {
      if(results.length == 0) {
        document.getElementById('comments').innerHTML = '<h5>You have not done anything yet.</h5>';
        hideLoading();
      } else {

        var numComments = 0;
        var content = '';

        for(var i=0; i<results.length; i++){
          var object = results[i];
          
          if(object.get("username") == Parse.User.current().get("username")){
            content = content + parseComment(object);
            numComments++;
          }

          
          for(var j=0; j<object.get("like").length; j++){
            if(object.get("like")[j] == Parse.User.current().get("username")){
              content = content + parseLike(object);
              break;
            }
          }
          
        }

        document.getElementById('comments').innerHTML =  '<h4 style="margin:0; margin-bottom:10px;">' + numComments + ' Comments</h4>' + content;
        document.getElementById('comments').style.marginTop = "10px";
        document.getElementById('comments').style.marginBottom = "10px";
        document.getElementsByTagName('body')[0].style.overflowY = 'auto';
      }

      hideLoading();

      loadLinks();

      loadLikes();

    }
  });


}


function commentSetup(){
  document.getElementById('welcome').innerHTML = "Hi, <a id='myaccountBtn' style='font-weight:bold; text-decoration:underline;'>" + Parse.User.current().get("username") + "</a>! &nbsp; <small><a id='repliesBtn'>Replies</a></small> &nbsp; <small><a id='signoutBtn' style='float:right;'>Sign Out</a></small>";
  
  loadUIBtns();

  document.getElementById('postBtn').addEventListener('click', function(){
    showLoading();
    var input = document.getElementById('cinput').value;

    if(input != ""){
      var Comment = Parse.Object.extend("Comment");
      var comment = new Comment();
      comment.set("title", pageTitle);
      comment.set("url", pageURL);
      comment.set("customURL", pageURL.replace(/[^a-zA-Z 0-9]+/g,''));
      comment.set("username", Parse.User.current().get("username"));
      comment.set("content", input);
      comment.set("like", []);

      var commentArray = input.split(" ");
      for(var j=0; j<commentArray.length; j++){
        if(commentArray[j].charAt(0) == "@"){
          var includeUser = commentArray[j].replace("@", "").replace(".", "").replace(",", "").replace("!", "").replace("?");
          comment.set("replyto", includeUser);
          break;
        }
      }


      comment.save(null, {
        success: function(comment) {
          document.getElementById('cinput').value = "";
          document.getElementById('cinput').innerHTML = "";
          hideLoading();
          loadComments();
        },
        error: function(comment, error) {
          hideLoading();
          buildDialog("Failed to Post Comment", "Error: " + error.message, "Try Again");
        }
      });

    } else {
      hideLoading();
      buildDialog("Failed to Post Comment", "Please fill all fields.", "Try Again");
    }
  });
}



function cleanHTML(input){
  var div = document.createElement("div");
  div.innerHTML = input;
  return div.textContent || div.innerText || "";
}



function loginBtnPressed(){
  closeAll();
  document.getElementById('login').style.display = 'block';
}

function loginSetup(){
  document.getElementById('loginBtn1').addEventListener('click', function() {
    showLoading();
      var username = document.getElementById('username1').value;
      var password = document.getElementById('password1').value;

      if(username != "" && password != ""){

        Parse.User.logIn(username, password, {
          success: function(user) {
            updateSessionState();
          },
          error: function(user, error) {
            hideLoading();
            buildDialog("Login Failed", "Error: " + error.code + " " + error.message, "Try Again");
          }
        });

      } else {
        hideLoading();
        buildDialog("Login Failed", "Please fill all fields.", "Try Again")
      }
    });
}




function signupSetup(){
  document.getElementById('signupBtn2').addEventListener('click', function() {
    showLoading();
      var username = document.getElementById('username').value;
      var email = document.getElementById('email2').value;
      var password = document.getElementById('password2').value;
      var confirm = document.getElementById('confirm').value;

      if(username != "" && email != "" && password != "" && confirm != ""){
        if(username.length < 5 || username.length > 16) {
          hideLoading();
          buildDialog("Sign Up Failed", "Username must be between 5 and 16 characters long.", "Try Again");
        } else {
          if(password != confirm) {
            hideLoading();
            buildDialog("Sign Up Failed", "Passwords do not match.", "Try Again");
          } else {
            
            var user = new Parse.User();
            user.set("username", username);
            user.set("email", email);
            user.set("password", password);

            user.signUp(null, {
              success: function(user) {
                loginBtnPressed();
                updateSessionState();
              },
              error: function(user, error) {
                hideLoading();
                buildDialog("Sign Up Failed", "Error: " + error.code + " " + error.message, "Try Again");
              }
            });

          }
        }
      } else {
        hideLoading();
        buildDialog("Sign Up Failed", "Please fill all fields.", "Try Again");
      }

  });
}


function resetSetup(){
  document.getElementById('resetBtn').addEventListener('click', function() {
    showLoading();

      var email = document.getElementById("email3").value;

      if(email != ""){

        var query = new Parse.Query(Parse.User);
        query.equalTo("email", email);
        query.find({
          success: function(user) {
            buildDialog("Sent Password Reset Link", "A password reset link has been emailed to "+cleanHTML(email)+".", "Login");
            loginBtnPressed();
          }, 
          error:  function(error) {
            buildDialog("Failed to Send Reset Link", "The email "+cleanHTML(email)+" is not in our records.", "Try Again");
          }
        });
      } else {
        hideLoading();
        buildDialog("Failed to Send Reset Link", "Please fill all fields.", "Try Again");
      }

  });
}


function loadComments(){
  showLoading();

  var Comment = Parse.Object.extend("Comment");
  
  var query1 = new Parse.Query(Comment);
  query1.equalTo("title", pageTitle);

  var query2 = new Parse.Query(Comment);
  query2.equalTo("customURL", pageURL.replace(/[^a-zA-Z 0-9]+/g,''));

  var mainQuery = Parse.Query.or(query1, query2);
  mainQuery.descending("like");
  mainQuery.find({
    success: function(results) {

      var num = results.length;
      var comments = "";

      for (var i = 0; i < results.length; i++) {
        var included = false;

        var object = results[i];
        if(object.get("title") != pageTitle){
          if(object.get("customURL") == pageURL.replace(/[^a-zA-Z 0-9]+/g,'')){
            included = true;
          } else {
            num--;
          }
        } else {
          if(object.get("customURL") == pageURL.replace(/[^a-zA-Z 0-9]+/g,'')){
            included = true;
          } else {
            num--;
          }
        }

        if(included){
          comments = comments + parseComment(object);
        }
      }

      var numComments = "<h4 style='display:inline;'>" + num + " Comments</h4> <img id='openBtn' src='open.png' alt='open in new tab' style='float:right; height:20px; margin-top:1px; cursor:pointer;'> <br>";
      document.getElementById('comments').style.marginTop = "10px";
      document.getElementById("comments").innerHTML = numComments + "<div id='holder' style='margin-top:10px;'>" + comments + "</div>";

      if(fullscreen) {
        document.getElementById('holder').style.maxHeight = 'none';
        document.getElementsByTagName('body')[0].style.overflowY = 'auto';
        document.getElementById('openBtn').style.display = "none";
      }

      document.getElementById('openBtn').addEventListener('click', function(){
        chrome.tabs.create({url: chrome.extension.getURL('comments.html?url='+pageURL+'&title='+pageTitle)});
      });

      loadLinks();

      loadLikes();

      hideLoading();
    },
    error: function(error) {
      hideLoading();
    }
  });
}



function loadLinks() {
  for(var k=0; k<document.getElementsByClassName("content").length; k++) {
    document.getElementsByClassName("content")[k].addEventListener("click", function() {

      chrome.tabs.create({url: this.getAttribute("data-url")});

    });
  }
}



function loadLikes() {
  for(var k=0; k<document.getElementsByClassName('likeBtn').length; k++){

        document.getElementsByClassName('likeBtn')[k].addEventListener('click', function(){
          showLoading();

          var currentUser = Parse.User.current();
          if(currentUser){
            var objectId = this.getAttribute("data-id");
            if(objectId != ""){

              var Comment = Parse.Object.extend("Comment");
              var query = new Parse.Query(Comment);
              query.get(objectId, {
                success: function(comment) {
                  if(comment.get("username") != currentUser.get("username")){
                    comment.addUnique("like", currentUser.get("username"));
                    comment.save();
                    hideLoading();
                    loadComments();
                  } else {
                    hideLoading();
                  }
                },
                error: function(object, error) {
                  hideLoading();
                  buildDialog("Failed to Like Comment", error.message, "Close");
                }
              });
              

            } else {
              hideLoading();
            }
          } else {
            hideLoading();
            buildDialog("Failed to Like Comment", "You are not logged in. Please login to like and post comments.", "Close");
          }
          
        });
      
  }
}


function loadUIBtns(){

  /*
    Replies
  */
  document.getElementById('repliesBtn').addEventListener('click', function(){
    chrome.tabs.create({url: chrome.extension.getURL('comments.html?p=replies')});
  });

  /*
    My Activity
  */
  document.getElementById('myaccountBtn').addEventListener('click', function(){
    chrome.tabs.create({url: chrome.extension.getURL('comments.html?p=myactivity')});
  });

  /*
    Signout
  */
  document.getElementById('signoutBtn').addEventListener('click', function(){
    showLoading();
    Parse.User.logOut().then(() => {
      var currentUser = Parse.User.current();
      updateSessionState();
    });
  });

}





function parseComment(object){
  var content = "";
  var commentArray = object.get("content").split(" ");
  for(var j=0; j<commentArray.length; j++){
    if(validURL(commentArray[j])){
      var ext = commentArray[j].substr(commentArray[j].length - 4).toLowerCase();
      if(ext == ".jpg" || ext == ".png" || ext == "jpeg" || ext == ".gif"){
        commentArray[j] = "<img src='" + commentArray[j] + "' style='width=100%; max-width:250px; display:block;'>";
      }
    } else {
      if(commentArray[j].charAt(0) == "@"){
        var includeUser = commentArray[j].replace("@", "").replace(".", "").replace(",", "").replace("!", "").replace("?");
        commentArray[j] = "<a id='user' data-user='"+object.get("username")+"' style='font-weight:500; color:#999999; cursor:default;'>" + commentArray[j] + "</a>";
      }
    }

    content += commentArray[j] + " ";
  }

  var likes = 0;
  if(object.get("like") != null){
    likes = object.get("like").length;
  }

  return "<div class='comment'> <div class='username'>" + cleanHTML(object.get("username")) + "</div> <div class='content' data-url='"+object.get("url")+"' style='cursor:pointer;'>" + content + " </div> <div class='like'> <a id='likeBtn' class='likeBtn' data-id='" + object.id + "'>" + likes + " <img src='like.png' alt='like comment'></a></div> <div class='datetime'>" + object.createdAt + "</div> </div>";
}




function parseLike(object) {
    return "<div class='comment'> <div class='content' data-url='"+object.get("url")+"' style='cursor:pointer;'> You liked <div class='username' style='display:inline; color:#999999;'>@" + cleanHTML(object.get("username")) + "</div>'s comment \"" + cleanHTML(object.get("content")) + "\"</div> </div>";
}






function showLoading(){
  document.getElementById('loading').style.display = 'block';
}

function hideLoading(){
  document.getElementById('loading').style.display = 'none';
}

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return pattern.test(str);
}

  
function onCreate(){
  buildUI();

  loginSetup();

  signupSetup();

  resetSetup();

  updateSessionState();
}


document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url, title, page) {
    
    /*
      Configure Parse
    */
    Parse.initialize("opin_chrome_ext");
    Parse.serverURL = 'http://parseserver-8qx6b-env.us-west-2.elasticbeanstalk.com/parse'

    pageURL = url;
    pageTitle = title;


    if(page == "myactivity" && fullscreen){
      pageTitle = "My Activity";
      onCreate();
      loadActivity();
    } else if(page == "replies" && fullscreen) {
      pageTitle = "My Replies";
      onCreate();
      loadReplies();
    } else {
      onCreate();
      loadComments();
    }
  
  });
});


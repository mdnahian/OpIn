var pageURL = "";
var pageTitle = "";

function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    var title = tab.title;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url, title);
  });
}

function closeAll() {
  for(var i=0; i<document.getElementsByClassName('input').length; i++){
    document.getElementsByClassName('input')[i].style.display = 'none';
  }
}

function buildDialog(title, message, button) {
  console.log(title+" - "+message);
}

function buildUI(){
    document.getElementById('title').innerHTML = pageTitle;
    document.getElementById('url').innerHTML = "<a href='" + pageURL + "'>" + pageURL + "</a>";

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


function commentSetup(){
  document.getElementById('welcome').innerHTML = "Hi, " + Parse.User.current().get("username") + "! &nbsp; <small><a id='signoutBtn'>Sign Out</a></small>";
  
  document.getElementById('signoutBtn').addEventListener('click', function(){
    showLoading();
    Parse.User.logOut().then(() => {
      var currentUser = Parse.User.current();
      updateSessionState();
    });
  });

  document.getElementById('postBtn').addEventListener('click', function(){
    showLoading();
    var input = document.getElementById('cinput').value;

    if(input != ""){
      var Comment = Parse.Object.extend("Comment");
      var comment = new Comment();
      comment.set("title", pageTitle);
      comment.set("url", pageURL);
      comment.set("username", Parse.User.current().get("username"));
      comment.set("content", input);
      comment.set("likes", 0);

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
      
  });
}




function loadComments(){
  showLoading();

  var Comment = Parse.Object.extend("Comment");
  var query = new Parse.Query(Comment);
  query.equalTo("title", pageTitle);
  query.equalTo("url", pageURL);

  query.find({
    success: function(results) {
      var numComments = "<h5>" + results.length + " Comments</h5>";

      var comments = "";

      for (var i = 0; i < results.length; i++) {
        var object = results[i];
        comments = comments + "<div class='comment'> <div class='username'>" + object.get("username") + "</div> <div class='content'>" + object.get("content") + "</div> <div class='like'>" + object.get("likes") + " <a id='likeBtn' data-id='" + object.id + "'><img src='like.png' alt='like comment'></a></div> <div class='datetime'>" + object.createdAt + "</div> </div>";
      }

      document.getElementById("comments").innerHTML = numComments + comments;

      hideLoading();
    },
    error: function(error) {
      console.log("Error: " + error.code + " " + error.message);
      hideLoading();
    }
  });
}




function showLoading(){
  document.getElementById('loading').style.display = 'block';
}

function hideLoading(){
  document.getElementById('loading').style.display = 'none';
}






document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url, title) {
    
    /*
      Configure Parse
    */
    Parse.initialize("opin_chrome_ext");
    Parse.serverURL = 'http://parseserver-8qx6b-env.us-west-2.elasticbeanstalk.com/parse'

    pageURL = url;
    pageTitle = title;

    buildUI();

    loginSetup();

    signupSetup();

    resetSetup();

    updateSessionState();

    loadComments();


  });
});


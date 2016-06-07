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


function buildUI(url, title){
    document.getElementById('title').innerHTML = title;
    document.getElementById('url').innerHTML = "<a href='" + url + "'>" + url + "</a>";

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
/*
  firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        if(isSigningUp) {
          user.updateProfile({
            displayName: signedUpUser
          }).then(function() {
            console.log('Account Created Successfuly');
            isSigningUp = false;
            signedUpUser = "";
          }, function(error) {
            console.log('There was an error creating the account');
          });
        }

        document.getElementById('comment-input').style.display = 'block';
        document.getElementById('login').style.display = 'none';
        document.getElementById('signup').style.display = 'none';

        console.log('Logged In');
      } else {
        document.getElementById('comment-input').style.display = 'none';
        document.getElementById('signup').style.display = 'none';
        document.getElementById('login').style.display = 'block';

        console.log('Not Logged In')
      }
    });
*/
}


function loginBtnPressed(){
  closeAll();
  document.getElementById('login').style.display = 'block';
}

function loginSetup(){
  document.getElementById('loginBtn1').addEventListener('click', function() {
      var username = document.getElementById('username1').value;
      var password = document.getElementById('password1').value;

      if(email != "" && password != ""){

        Parse.User.logIn(username, password, {
          success: function(user) {
            updateSessionState();
          },
          error: function(user, error) {
            buildDialog("Login Failed", "Error: " + error.code + " " + error.message, "Try Again");
          }
        });
        
      } else {
        buildDialog("Login Failed", "Please fill all fields.", "Try Again")
      }
    });
}




function signupSetup(){
  document.getElementById('signupBtn2').addEventListener('click', function() {
      var username = document.getElementById('username').value;
      var email = document.getElementById('email2').value;
      var password = document.getElementById('password2').value;
      var confirm = document.getElementById('confirm').value;

      if(username != "" && email != "" && password != "" && confirm != ""){
        if(username.length < 5 || username.length > 16) {
          buildDialog("Sign Up Failed", "Username must be between 5 and 16 characters long.", "Try Again");
        } else {
          if(password != confirm) {
            buildDialog("Sign Up Failed", "Passwords do not match.", "Try Again");
          } else {
            
            var user = new Parse.User();
            user.set("username", username);
            user.set("email", email);
            user.set("password", password);

            user.signUp(null, {
              success: function(user) {
                loginBtnPressed();
                updateSessionState()
              },
              error: function(user, error) {
                // Show the error message somewhere and let the user try again.
                buildDialog("Sign Up Failed", "Error: " + error.code + " " + error.message, "Try Again");
              }
            });

          }
        }
      } else {
        buildDialog("Sign Up Failed", "Please fill all fields.", "Try Again");
      }

  });
}


function resetSetup(){
  document.getElementById('resetBtn').addEventListener('click', function() {
      
  });
}



document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url, title) {
    
    buildUI(url, title);

    loginSetup();

    signupSetup();

    resetSetup();

  

    Parse.initialize("YOUR_APP_ID");
    Parse.serverURL = 'http://YOUR_PARSE_SERVER:1337/parse'


    updateSessionState()


  });
});


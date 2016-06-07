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

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url, title) {
    
    document.getElementById('title').innerHTML = title;
    document.getElementById('url').innerHTML = "<a href='" + url + "'>" + url + "</a>";


    document.getElementById('signupBtn1').addEventListener('click' function() {
      document.getElementById('comment-input').style.display = 'none';
      document.getElementById('signup').style.display = 'block';
      document.getElementById('login').style.display = 'none';
    });



    var config = {
        apiKey: "AIzaSyBcSBuzH1-kHTijWwO2K3KdJ1GPTRYNhIw",
        authDomain: "project-5397732214719422155.firebaseapp.com",
        databaseURL: "https://project-5397732214719422155.firebaseio.com",
        storageBucket: "",
    };
    firebase.initializeApp(config);

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        document.getElementById('comment-input').style.display = 'block';
        document.getElementById('login').style.display = 'none';
        document.getElementById('signup').style.display = 'none';
      } else {
        document.getElementById('comment-input').style.display = 'none';
        document.getElementById('signup').style.display = 'none';
        document.getElementById('login').style.display = 'block';
      }
    });

  });
});
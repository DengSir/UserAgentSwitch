
var userAgentSwitch = {
  userAgentRules: [
    { url: "^http:\/\/vod.kankan.com\/v\/*",  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:18.0) Gecko/20100101 Firefox/18.0" },
    { url: "^https?:\/\/.+\.icbc\.com\.cn.*", userAgent: "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:10.0) Gecko/20100101 Firefox/10.0" },
  ],

  onload: function() {
    var os = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
    os.addObserver(this, "http-on-modify-request", false);
    os.addObserver(this.onDocumentCreated, "content-document-global-created", false);
  },
  
  observe: function(subject, topic, data) {
    if (topic != "http-on-modify-request")
      return;

    var http = subject.QueryInterface(Ci.nsIHttpChannel);
    if (!http.URI)
      return;

    for (var i = 0; i < this.userAgentRules.length; i++) {
      if ((new RegExp(this.userAgentRules[i].url)).test(http.URI.spec)) {
        http.setRequestHeader("User-Agent", this.userAgentRules[i].userAgent, false);
        break;
      }
    }
  },

  onDocumentCreated: function(aSubject, aTopic, aData)
  {
    var aChannel = aSubject.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebNavigation).QueryInterface(Ci.nsIDocShell).currentDocumentChannel;
    if (aChannel instanceof Ci.nsIHttpChannel)
    {
      var navigator = aSubject.navigator;
      var userAgent = aChannel.getRequestHeader("User-Agent");
      if (navigator.userAgent != userAgent)
      {
        Object.defineProperty(XPCNativeWrapper.unwrap(navigator), "userAgent", {value : userAgent, enumerable : true});
      }
    }
  },

  handleEvent: function(event) {
    switch (event.type) {
      case "load":
        return this.onload();
    }
  },
}

window.addEventListener("load", userAgentSwitch, false);

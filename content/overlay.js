//const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"]
//                                  .getService(Components.interfaces.nsIClipboardHelper);
//gClipboardHelper.copyString("Put me on the clipboard, please.");

// Import the Services module for future use, if we're not in
// a browser window where it's already loaded.
Components.utils.import('resource://gre/modules/Services.jsm');

// Create a constructor for the built-in supports-string class.
const nsSupportsString = Components.Constructor("@mozilla.org/supports-string;1", "nsISupportsString");
function SupportsString(str) {
    // Create an instance of the supports-string class
    var res = nsSupportsString();

    // Store the JavaScript string that we want to wrap in the new nsISupportsString object
    res.data = str;
    return res;
}

// Create a constructor for the built-in transferable class
const nsTransferable = Components.Constructor("@mozilla.org/widget/transferable;1", "nsITransferable");

// Create a wrapper to construct a nsITransferable instance and set its source to the given window, when necessary
function Transferable(source) {
    var res = nsTransferable();
    if ('init' in res) {
        // When passed a Window object, find a suitable privacy context for it.
        if (source instanceof Ci.nsIDOMWindow)
            // Note: in Gecko versions >16, you can import the PrivateBrowsingUtils.jsm module
            // and use PrivateBrowsingUtils.privacyContextFromWindow(sourceWindow) instead
            source = source.QueryInterface(Ci.nsIInterfaceRequestor)
                           .getInterface(Ci.nsIWebNavigation);

        res.init(source);
    }
    return res;
}

if ("undefined" == typeof(DmapEx)) {
    var DmapEx = {};
}

DmapEx.overlay = {
    prefix : 'extensions.dmapex@leehana.co.kr.',
    init : function() {
        /*
        let name = 'firstRun24';
        let prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
        if (prefs.getBoolPref(this.prefix + name)) {
            this.addButton();
            prefs.setBoolPref(this.prefix + name, false);
        }
        */
        this.addButton();
    },
    getClipboardData : function() {
        var trans = Transferable();
        trans.addDataFlavor("text/unicode");
        Services.clipboard.getData(trans, Services.clipboard.kGlobalClipboard);

        var str       = {};
        var strLength = {};

        trans.getTransferData("text/unicode", str, strLength);

        let message;
        if (str) {
          var pastetext = str.value.QueryInterface(Ci.nsISupportsString).data;
          message = pastetext;
        }
        
        return message;
    },
    sayHello : function(event) {
        var trans = Transferable();
        trans.addDataFlavor("text/unicode");
        Services.clipboard.getData(trans, Services.clipboard.kGlobalClipboard);

        var str       = {};
        var strLength = {};

        trans.getTransferData("text/unicode", str, strLength);

        let message;
        if (str) {
          var pastetext = str.value.QueryInterface(Ci.nsISupportsString).data;
          message = "msg : " + pastetext;
        }
        //let stringBundle = document.getElementById("string-bundle");
        //let message = stringBundle.getString("location.current.label");
        
        window.alert(message);
    },
    openAreaPopup : function(event) {
        let popupPanel = document.getElementById("map_area");
        let anchor = document.getElementById("dmapex_toolbarButton");
        popupPanel.openPopup(anchor, "after_end");
    },
    handleOnPopupLoad : function() {
        var iframe = document.getElementById('dmap_iframe');
        iframe.setAttribute("src", "");
        iframe.setAttribute("src", "chrome://dmapex/content/index.html");
        return false;
    },
    handleOnPopupHiding : function() {
        var iframe = document.getElementById('dmap_iframe');
        iframe.setAttribute('src', '');
        return false;
    },
    addButton: function() {
        let toolbarButton = 'dmapex_toolbarButton';
        var navBar = document.getElementById('nav-bar');
        let currentSet = navBar.getAttribute('currentset');
        if (!currentSet) {
            currentSet = navBar.currentSet;
        }
        let currentSetArray = currentSet.split(',');
        if (currentSetArray.indexOf(toolbarButton) == -1) {
            currentSetArray.push(toolbarButton);
            navBar.setAttribute("currentset", currentSetArray.join(','));
            navBar.currentSet = currentSetArray.join(',');
            document.persist('nav-bar', 'currentset');
            try {
                BrowserToolboxCustomizeDone(true);
            } catch (e) {}
        }
    }
};

window.addEventListener("load", function () { DmapEx.overlay.init(); }, false);
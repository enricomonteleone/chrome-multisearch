//Globals
var RESULT_EXTRA = 100;

var arInput = [];
var sHtml;

//Init
window.addEventListener("load", initPage);

//Functions
function initPage() {
    //document.getElementById("btnRefresh").addEventListener("click", refreshInput, false);
    //document.getElementById("btnRead").addEventListener("click", readStorage, false);
    //document.getElementById("btnSearch").addEventListener("click", doSearch, false);
    document.getElementById("btnClear").addEventListener("click", clearStorage, false);
    document.getElementById("lnkAdd").addEventListener("click", addInput, false);
    getInput();

    //Assume only one type of message and response, and trigger search function
    chrome.runtime.onMessage.addListener(function (response) {
        sHtml = response;
        searchHtml();
    });

    //General message dispatcher
    //chrome.runtime.onMessage.addListener(
    //    function (message, sender, sendResponse) {
    //        switch(message.method) {
    //        case 'getHtml':
    //            getHtml(message);
    //            break;
    //        default:
    //            break;
    //        }
    //    }
    //);

    doSearch();

}

function doSearch() {

    //Simple message, triggers search when message received
    chrome.tabs.executeScript({
        //code: "chrome.runtime.sendMessage(document.body.innerHTML);"
        code: "chrome.runtime.sendMessage(document.documentElement.textContent);"
    });

    //chrome.tabs.executeScript({
    //  chrome.runtime.sendMessage({ method: "getHtml", sHtml: document.body.innerHTML });
    //});

}

function searchHtml() {

    var i, sSearch, nSearchLen, nCount, nPhraseLen, nFound, sResult, nResultMin, nResultMax, divOutput;

    divOutput = document.getElementById("divOutput");
    divOutput.innerHTML = "";
    nCount = 0;

    if (arInput) {

        //For each search phrase
        for (i = 0; i < arInput.length; i++) {

            //Get string lengths
            sSearch = sHtml.toLowerCase();
            nSearchLen = sSearch.length;
            nPhraseLen = arInput[i].length;

            //Search page text
            //divOutput.innerHTML += "<h3>" + arInput[i] + "</h3>";
            while (nSearchLen >= 1) {

                //If match found
                nFound = sSearch.search(arInput[i]);
                if (nFound >= 0) {

                    //Counter
                    nCount = nCount + 1;
                    
                    //Grab extra characters before and after and add to result
                    nResultMin = Math.max(0, nFound-(RESULT_EXTRA/2));
                    nResultMax = Math.min(nResultMin+RESULT_EXTRA, nSearchLen-1);
                    sResult = sSearch.substring(nResultMin, nResultMax);
                    sResult = sResult.replace(arInput[i], "<span style='background-color: #FF0;'>" + arInput[i] + "</span>");
                    divOutput.innerHTML += "<p>" + nCount + ". " + sResult + "</p>";

                    //Move search pointer
                    sSearch = sSearch.substring(nFound+nPhraseLen, nSearchLen - 1);
                    nSearchLen = sSearch.length;

                } else {
                    nSearchLen = 0;
                } //if

            } //while

        } //for

    } //if
    
    //No results
    if (nCount <= 0) {
        divOutput.innerHTML += "<p>No results.</p>";
    }

}

function getInput() {
    chrome.storage.local.get(
        "userdata",
        function (buffer) {
            if (chrome.runtime.lastError) {
                alert("getInput(): " + chrome.runtime.lastError);
            } else {
                if (buffer.userdata) {
                    arInput = buffer.userdata;
                    refreshInput();
                    searchHtml();
                }
            }
        }
    );
}

function readStorage() {
    chrome.storage.local.get(
        "userdata",
        function (buffer) {
            if (chrome.runtime.lastError) {
                alert("readStorage(): " + chrome.runtime.lastError);
            } else {
                if (buffer.userdata) {
                    arInput = buffer.userdata;
                    alert("readStroage(): " + arInput.join());
                } else {
                    alert("readStorage(): empty");
                }
            }
        }
    );
}

function addInput() {
    var s;

    if (arInput && arInput.length >= 9) {
        alert("This extension is limited to 10 search terms.");
    } else {
        s = document.getElementById("txtAdd").value.toLowerCase();
        if (s && arInput.push(s) > 0) {
            document.getElementById("txtAdd").value = "";
            setInput();
            refreshInput();
            searchHtml();
        } else {
            alert("addInput(): Nothing to add!");
        }
    }
}

function setInput() {
    chrome.storage.local.set(
        { "userdata": arInput },
        function () {
            if (chrome.runtime.lastError) {
                alert("setInput(): " + chrome.runtime.lastError);
            }
        }
    );
}

function refreshInput() {
    var i, sInput;
    sInput = "";
    if (arInput && arInput.length > 0) {
        for (i = 0; i < arInput.length; i++) {
            sInput += arInput[i] + "<a id='" + i + "' href='#'>X</a>";
        }
    }
    document.getElementById("divInput").innerHTML = sInput;
    bindEvents();
}

function bindEvents() {
    if (arInput && arInput.length > 0) {
        for (var i = 0; i < arInput.length; i++) {
            document.getElementById(i).addEventListener("click", delInput, false);
        }
    }
}

function delInput() {
    arInput.splice(this.id, 1);
    setInput();
    refreshInput();
    searchHtml();
}

function clearStorage() {
    chrome.storage.local.clear(
        function () {
            if (chrome.runtime.lastError) {
                alert("clearStorage(): " + chrome.runtime.lastError);
            }
        }
    );
    arInput = [];
    refreshInput();
    document.getElementById("txtAdd").value = "";
}

//End
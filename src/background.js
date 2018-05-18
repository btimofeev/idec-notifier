const NODE = "http://idec.spline-online.tk/";
const ECHOES = ["develop.16", "idec.talks", "linux.14", "pipe.2032"];
var messagesCount = new Object();

function openWebsite() {

    function onError(error) {
        console.log(`Error: ${error}`);
    }
    
    function onGot(item) {
        var url = NODE;
        if (item.node) {
            url = item.node
        }
        
        browser.tabs.create({
            "url": url
        });
    }
    
    browser.storage.local.get("node")
        .then(onGot, onError);
}

function setBadge(text) {
    browser.browserAction.setBadgeText({"text": text});
}

function onButtonClicked() {
    browser.storage.local.set({ messagesCount })
        .then(setBadge(""));
    openWebsite();
}

function updateBadge() {
    function calculate(result) {
        var oldCount = result.messagesCount || new Object();
        var sum = 0;
        //console.log(oldCount);
        for (var node in messagesCount) {
            if (oldCount.hasOwnProperty(node)) {
                var oldVal = parseInt(oldCount[node]);
                var val = parseInt(messagesCount[node]);
                if (val > oldVal) {
                    sum += val - oldVal;
                }
            } else {
                var val = parseInt(messagesCount[node]);
                if (!isNaN(val)) {
                    sum += val;
                }
            }
        }
        //console.log("sum: " + sum);
        if (sum > 0) {
            setBadge(sum.toString());
        } else {
            setBadge("");
        }
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    browser.storage.local.get("messagesCount")
        .then(calculate, onError);
}

function getMessageCount() {
    function parseResponse(response) {
        var lines = response.split("\n");
        messagesCount = new Object(); // clean old object
        for (var i = 0; i < lines.length; i++) {
            var array = lines[i].split(":");
            messagesCount[array["0"]] = array["1"];
        }
        //console.log(messagesCount);
        updateBadge();
    }

    function makeRequest(result) {
        var node = result.node || NODE;
        var echoes = result.echoes || ECHOES;

        var req = new XMLHttpRequest();
        req.open("GET", node + "/x/c/" + echoes.join("/"), true);
        req.addEventListener("load", function() {
          //console.log(req.response);
          parseResponse(req.response)
        });
        req.send(null);
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    var getting = browser.storage.local.get(["node", "echoes"]);
    getting.then(makeRequest, onError);
}

function handleAlarm(alarmInfo) {
    getMessageCount();
}

browser.browserAction.setBadgeBackgroundColor({color: "gray"});

browser.browserAction.onClicked.addListener(onButtonClicked);

const delay = 10;
browser.alarms.create("check-messages-alarm", {
    "delayInMinutes": delay,
    "periodInMinutes": delay
});

browser.alarms.onAlarm.addListener(handleAlarm);
getMessageCount();

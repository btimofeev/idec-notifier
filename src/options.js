const NODE = "http://idec.spline-online.tk/";
const ECHOES = ["develop.16", "idec.talks", "linux.14", "pipe.2032"];

function saveOptions(e) {
    e.preventDefault();

    var node = addHttp(document.querySelector("#node").value);
    var echoes = cleanEchoes(document.querySelector("#echoes").value);
    
    browser.storage.local.set({
        "node": node,
        "echoes": echoes
    });
}

function restoreOptions() {

    function setCurrentChoice(result) {
        document.querySelector("#node").value = result.node || NODE;
        document.querySelector("#echoes").value = (result.echoes || ECHOES).join("\n");
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    var getting = browser.storage.local.get(["node", "echoes"]);
    getting.then(setCurrentChoice, onError);
}

function addHttp(url) {
    var pattern = /^((http|https):\/\/)/;

    if(!pattern.test(url)) {
        url = "http://" + url;
    }

    return url;
}

function cleanEchoes(echoes) {
    var array = echoes.split("\n");
    
    // trim elements and remove empty lines
    for(var i = array.length - 1; i >= 0; i--) {
        array[i] = array[i].trim();
        if(array[i] === "") {
            array.splice(i, 1);
        }
    }

    // sort and remove duplicates
    array = array.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })

    return array;
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);

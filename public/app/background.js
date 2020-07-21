const tabStorage = {};
const networkFilters = {
    urls: [
        "*://*.ddshu.net/*/opf.html",
    ]
};

chrome.webRequest.onBeforeRequest.addListener((details) => {
    const { tabId, requestId } = details;
    if (!tabStorage.hasOwnProperty(tabId)) {
        return;
    }

    tabStorage[tabId].requests[requestId] = {
        requestId: requestId,
        url: details.url,
        startTime: details.timeStamp,
        status: 'pending'
    };
    console.log(tabStorage[tabId].requests[requestId]);
}, networkFilters);

chrome.webRequest.onCompleted.addListener((details) => {
    const { tabId, requestId } = details;
    if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
        return;
    }

    const request = tabStorage[tabId].requests[requestId];

    Object.assign(request, {
        endTime: details.timeStamp,
        requestDuration: details.timeStamp - request.startTime,
        status: 'complete'
    });
    console.log(tabStorage[tabId].requests[details.requestId]);
    console.log("Sending message landing_page_detected")
    chrome.tabs.sendMessage(tabId, { "action": "landing_page_detected"})
}, networkFilters);

chrome.webRequest.onErrorOccurred.addListener((details)=> {
    const { tabId, requestId } = details;
    if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
        return;
    }

    const request = tabStorage[tabId].requests[requestId];
    Object.assign(request, {
        endTime: details.timeStamp,           
        status: 'error',
    });
    console.log(tabStorage[tabId].requests[requestId]);
}, networkFilters);

chrome.tabs.onActivated.addListener((tab) => {
    const tabId = tab ? tab.tabId : chrome.tabs.TAB_ID_NONE;
    if (!tabStorage.hasOwnProperty(tabId)) {
        tabStorage[tabId] = {
            id: tabId,
            requests: {},
            registerTime: new Date().getTime()
        };
    }
});

chrome.tabs.onRemoved.addListener((tab) => {
    const tabId = tab.tabId;
    if (!tabStorage.hasOwnProperty(tabId)) {
        return;
    }
    tabStorage[tabId] = null;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background.js received message", message);
});
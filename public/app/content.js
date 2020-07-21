/* global chrome */

chrome.runtime.onMessage.addListener((msg, sender, response) => {
    // First, validate the message's structure.
    if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
        var linksDetected = []
        let tables = window.document.getElementsByTagName('table')
        if (tables && tables.length > 0) {
            let firstTable = tables[0]
            linksDetected = Array.from(firstTable.getElementsByTagName('a')).map((a) => {
                return { 
                    title: a.textContent,
                    href: a.href
                }
            })
        } else {
            linksDetected = []
        }

        response(linksDetected);
    }
});


/* global chrome */
import React, { Component } from 'react';
import styled from 'styled-components';
import EpubMaker from '../js-epub-maker/js-epub-maker';

const Container = styled.div`
    min-width: 150px;
    min-height: 150px;
`

export default class PreviewLinks extends Component {
    constructor(props) {
        super(props);
        this.state = {
            links: []
        }
        this.setDOMInfo = this.setDOMInfo.bind(this)
        this.downloadEpub = this.downloadEpub.bind(this)
    }

    setDOMInfo = links => {
        chrome.runtime.sendMessage({ "logger": links })
        this.setState({ links: links })
    };

    downloadEpub() {
        chrome.runtime.sendMessage({ "logger": "Attempting to start download" })
        let newDocumentPromise = new EpubMaker()
            .withUuid('github.com/bbottema/js-epub-maker::it-came-from::example-using-idpf-wasteland')
            .withTemplate('idpf-wasteland')
            .withAuthor('T. Est')
            .withLanguage('en-GB')
            .withModificationDate(new Date(2015, 8, 7))
            .withRights({
                description: 'This work is shared with the public using the Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0) license.',
                license: 'http://creativecommons.org/licenses/by-sa/3.0/'
            })
            .withAttributionUrl('https://github.com/bbottema/js-epub-maker')
            .withStylesheetUrl('src/test/content-for-epub/extra_styles.css')
            .withCover('src/test/content-for-epub/js-epub-maker-cover.jpg', {
                license: 'http://creativecommons.org/licenses/by-sa/3.0/',
                attributionUrl: 'http://www.webestools.com/web20-title-generator-logo-title-maker-online-web20-effect-reflect-free-photoshop.html'
            })
            .withTitle('It Came From... [Example Using Waste Land Template]')
            .makeEpub();

        newDocumentPromise.then((content) => {
            let url = URL.createObjectURL(content);
            chrome.runtime.sendMessage({ "logger": url })
            chrome.downloads.download({
                url: url
            });
        })
    }


    componentDidMount() {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            // send a request for the DOM info...
            chrome.tabs.sendMessage(
                tabs[0].id,
                { from: 'popup', subject: 'DOMInfo' },
                this.setDOMInfo);
        });
    }

    render() {
        console.log(this.state.links)
        if (this.state.links) {
            return <Container>
                {this.state.links.map((a) => { return <h2><a href={a.href}>{a.title}</a></h2> })}
                <button onClick={this.downloadEpub}>Download EPUB</button>
            </Container>
        } else {
            return <h1>No Links Found.</h1>
        }
    }
}
/* global require, module, exports, saveAs */
const console = require('./js/util/console')();
const slugify = require('./js/util/slugify');

require('./js/util/handlebar-helpers');

const templateManagers = {
    'idpf-wasteland': require('./js/template-builders/idpf-wasteland-builder.js').builder
};

export default class EpubMaker {
    constructor() {
        this.epubConfig = { toc: [], landmarks: [], sections: [], stylesheet: {} };
    };

    withUuid(uuid) {
        this.epubConfig.uuid = uuid;
        return this;
    };

    withTemplate(templateName) {
        this.epubConfig.templateName = templateName;
        return this;
    };

    withTitle (title) {
        this.epubConfig.title = title;
        this.epubConfig.slug = slugify(title);
        return this;
    };

    withLanguage(lang) {
        this.epubConfig.lang = lang;
        return this;
    };

    withAuthor(fullName) {
        this.epubConfig.author = fullName;
        return this;
    };

    withModificationDate(modificationDate) {
        this.epubConfig.modificationDate = modificationDate.toISOString();
        return this;
    };

    withRights(rightsConfig) {
        this.epubConfig.rights = rightsConfig;
        return this;
    };

    withCover(coverUrl, rightsConfig) {
        this.epubConfig.coverUrl = coverUrl;
        this.epubConfig.coverRights = rightsConfig;
        return this;
    };

    withAttributionUrl(attributionUrl) {
        this.epubConfig.attributionUrl = attributionUrl;
        return this;
    };

    withStylesheetUrl(stylesheetUrl, replaceOriginal) {
        this.epubConfig.stylesheet = {
            url: stylesheetUrl,
            styles: '',
            replaceOriginal: replaceOriginal
        };
        return this;
    };

    withSection(section) {
        this.epubConfig.sections.push(section);
        Array.prototype.push.apply(this.epubConfig.toc, section.collectToc());
        Array.prototype.push.apply(this.epubConfig.landmarks, section.collectLandmarks());
        return this;
    };

    makeEpub() {
        this.epubConfig.publicationDate = new Date().toISOString();
        return templateManagers[this.epubConfig.templateName].make(this.epubConfig).then(function(epubZip) {
            console.info('generating epub for: ' + this.epubConfig.title);
            var content = epubZip.generate({ type: 'blob', mimeType: 'application/epub+zip', compression: 'DEFLATE' });
            return content;
        });
    };

    downloadEpub(callback) {
        this.makeEpub().then(function(epubZipContent) {
            var filename = this.epubConfig.slug + '.epub';
            console.debug('saving "' + filename + '"...');
            if (callback && typeof(callback) === 'function') {
                callback(epubZipContent, filename);
            }
            saveAs(epubZipContent, filename);
        });
    };
};

// epubtypes and descriptions, useful for vendors implementing a GUI
EpubMaker.epubtypes = require('./js/epub-types.js');

/**
 * @epubType Optional. Allows you to add specific epub type content such as [epub:type="titlepage"]
 * @id Optional, but required if section should be included in toc and / or landmarks
 * @content Optional. Should not be empty if there will be no subsections added to this section. Format: { title, content, renderTitle }
 */
EpubMaker.Section = function(epubType, id, content, includeInToc, includeInLandmarks) {
    var self = this;
    this.epubType = epubType;
    this.id = id;
    this.content = content;
    this.includeInToc = includeInToc;
    this.includeInLandmarks = includeInLandmarks;
    this.subSections = [];

    if (content) {
        content.renderTitle = content.renderTitle !== false; // 'undefined' should default to true
    }

    this.withSubSection = function(subsection) {
        self.subSections.push(subsection);
        return self;
    };

    this.collectToc = function() {
        return collectSections(this, 'includeInToc');
    };

    this.collectLandmarks = function() {
        return collectSections(this, 'includeInLandmarks');
    };

    function collectSections(section, prop) {
        var sections = section[prop] ? [section] : [];
        for (var i = 0; i < section.subSections.length; i++) {
            Array.prototype.push.apply(sections, collectSections(section.subSections[i], prop));
        }
        return sections;
    }
};
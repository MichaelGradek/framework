'use strict';

var ObjUtils = require('./../../../utilities/object');

// A BEST Application with a Famo.us Context
var EXECUTED_COMPONENTS = {};

// A component is an instantiated BEST module.
var COMPONENTS = {};

// List of the tagged dependencies of every tagged module.
var DEPENDENCIES = {};

// A module is a BEST definition.
var MODULES = {};

// Config objects
var CONFIGS = {};

// Timelines objects
var TIMELINES = {};

// Attachment objects ('raw code' wrappers)
var ATTACHMENTS = {};

var DEFAULT_TAG = 'HEAD';
var BEHAVIORS_KEY = 'behaviors';
var EVENTS_KEY = 'events';
var STATES_KEY = 'states';
var TREE_KEY = 'tree';
var EXTENSION_KEYS = 'extensions';

function getAttachments(name, tag) {
    if (ATTACHMENTS[name] && ATTACHMENTS[name][tag]) {
        return ObjUtils.clone(ATTACHMENTS[name][tag]);
    }
    else {
        return [];
    }
}

function setAttachment(name, tag, info) {
    if (!ATTACHMENTS[name]) ATTACHMENTS[name] = {};
    if (!ATTACHMENTS[name][tag]) ATTACHMENTS[name][tag] = [];
    ATTACHMENTS[name][tag].push(info);
}

function Wrapper(name, tag, mod) {
    this.name = name;
    this.tag = tag;
    this.mod = mod;
}

Wrapper.prototype.config = function(conf) {
    if (!CONFIGS[this.name]) {
        CONFIGS[this.name] = {};
    }
    CONFIGS[this.name][this.tag] = conf;
    return this;
};

function getConfig(name, tag) {
    if (CONFIGS[name] && CONFIGS[name][tag]) {
        return ObjUtils.clone(CONFIGS[name][tag]);
    }
    else {
        return {};
    }
}

Wrapper.prototype.timelines = function timelines(timelinesObject) {
    if (!TIMELINES[this.name]) {
        TIMELINES[this.name] = {};
    }
    TIMELINES[this.name][this.tag] = timelinesObject;
    return this;
};

function getTimelines(name, tag) {
    if (TIMELINES[name] && TIMELINES[name][tag]) {
        return ObjUtils.clone(TIMELINES[name][tag]);
    }
    else {
        return {};
    }
}

function wrapModule(name, tag, mod) {
    return new Wrapper(name, tag, mod);
}

function getModuleDefinition(name, tag, useClone) {
    useClone = useClone === undefined ? true : useClone;
    tag = tag ? tag : DEFAULT_TAG;
    if (MODULES[name] && MODULES[name][tag]) {
        return useClone ? ObjUtils.clone(MODULES[name][tag].definition) : MODULES[name][tag].definition;
    }
    else {
        return null;
    }
}

function saveModule(name, tag, options, definition) {
    if (!MODULES[name]) {
        MODULES[name] = {};
    }
    MODULES[name][tag] = {
        definition: definition,
        options: options
    };
    saveDependencies(name, tag, options.dependencies || {});
    return getModuleDefinition(name, tag);
}

function hasModule(name, tag) {
    return !!getModuleDefinition(name, tag);
}

var NORMAL_FACET_NAMES = {
    'behaviors': true,
    'events': true,
    'states': true,
    'tree': true
};

function extendDefintion(definition, extensions) {
    var extensionDefinition;
    for (var i = 0; i < extensions.length; i++) {
        extensionDefinition = getModuleDefinition(extensions[i].name, extensions[i].version, false);

        definition[BEHAVIORS_KEY] = definition[BEHAVIORS_KEY] ? definition[BEHAVIORS_KEY] : {};
        definition[EVENTS_KEY] = definition[EVENTS_KEY] ? definition[EVENTS_KEY] : {};
        definition[STATES_KEY] = definition[STATES_KEY] ? definition[STATES_KEY] : {};

        if (extensionDefinition) {
            ObjUtils.naiveExtends(definition[BEHAVIORS_KEY], extensionDefinition[BEHAVIORS_KEY]);
            ObjUtils.naiveExtends(definition[EVENTS_KEY], extensionDefinition[EVENTS_KEY]);
            ObjUtils.naiveExtends(definition[STATES_KEY], extensionDefinition[STATES_KEY]);

            if (!definition[TREE_KEY]) {
                definition[TREE_KEY] = extensionDefinition[TREE_KEY] || '';
            }
        }
    }
}

function validateModule(name, tag, options, definition) {
    if (/[A-Z]/.test(name)) {
        console.warn('`' + name + ' (' + tag + ')` ' + 'has an uppercase letter in its name; use lowercase only');
    }
    for (var facetName in definition) {
        if (!(facetName in NORMAL_FACET_NAMES)) {
            console.warn('`' + name + ' (' + tag + ')` ' + 'has an unrecognized property `' + facetName + '` in its definition');
        }

        if (options[EXTENSION_KEYS]) {
            extendDefintion(definition, options[EXTENSION_KEYS]);
        }
    }
}

function registerModule(name, tag, options, definition) {
    if (!hasModule(name, tag)) {
        validateModule(name, tag, options, definition);
        return wrapModule(name, tag, saveModule(name, tag, options, definition));
    }
    else {
        return wrapModule(name, tag, getModuleDefinition(name, tag));
    }
}

function getComponent(uid) {
    return COMPONENTS[uid];
}

function hasComponent(uid) {
    return !!getComponent(uid);
}

function saveComponent(uid, component) {
    COMPONENTS[uid] = component;
}

function registerComponent(uid, component) {
    if (hasComponent(uid)) {
        throw new Error('Component with UID `' + uid + '` already exists!');
    }
    else {
        saveComponent(uid, component);
    }
}

function saveExecutedComponent(selector, component) {
    EXECUTED_COMPONENTS[selector] = component;
}

function getExecutedComponent(selector) {
    return EXECUTED_COMPONENTS[selector];
}

// We need to store the dependencies that a given module depends on
// because we need to assign the version tags to all of the components
// in the tree for use when selecting elements correctly
function saveDependencies(name, tag, dependencies) {
    if (!DEPENDENCIES[name]) {
        DEPENDENCIES[name] = {};
    }
    DEPENDENCIES[name][tag] = {};
    for (var depName in dependencies) {
        var depVersion = dependencies[depName];
        DEPENDENCIES[name][tag][depName] = depVersion;
    }
}

function getDependencies(name, tag) {
    if (DEPENDENCIES[name] && DEPENDENCIES[name][tag]) {
        return DEPENDENCIES[name][tag];
    }
    else {
        throw new Error('No dependencies found for `' + name + ' (' + tag + ')`');
    }
}

module.exports = {
    getAttachments: getAttachments,
    getComponent: getComponent,
    getConfig: getConfig,
    getDependencies: getDependencies,
    getExecutedComponent: getExecutedComponent,
    getModuleDefinition: getModuleDefinition,
    getTimelines: getTimelines,
    registerComponent: registerComponent,
    registerModule: registerModule,
    saveDependencies: saveDependencies,
    saveExecutedComponent: saveExecutedComponent,
    setAttachment: setAttachment
};

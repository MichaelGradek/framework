var VirtualDOM = require('../../lib/virtual-dom/virtual-dom');

/*
Virtual DOM Stub One:

wrapper
    parent:element#PARENT
        child:element.FIRST_CHILD(uid=0)
            grandchild:element
        child:element(uid=1)
            grandchild:element
        child:element(uid=2)
            grandchild:element
        child:element(uid=3)
        child:element(uid=4)
        child:element(uid=5)
 */

var STUB_ONE_INFO = {
    PARENT_ID: 'PARENT',
    FIRST_CHILD_CLASS_NAME: 'FIRST_CHILD',
    GRANDCHILD_NAME: 'grandchild:element',
    GRANDCHILDREN_COUNT: 3,
    CHILD_COUNT: 6,
    UID_KEY: 'uid'
};

function createStubOne () {
    var wrapper = document.createElement('wrapper');
    var parent = document.createElement('parent:element');
    parent.id = STUB_ONE_INFO.PARENT_ID;
    wrapper.appendChild(parent);

    var child
    var grandchild;
    for(var i = 0; i < STUB_ONE_INFO.CHILD_COUNT; i++) {
        child = document.createElement('child:element');
        child.setAttribute(STUB_ONE_INFO.UID_KEY, i);
        parent.appendChild(child);
        if (i === 0) {
            child.className = STUB_ONE_INFO.FIRST_CHILD_CLASS_NAME;
        }
        if (i < STUB_ONE_INFO.GRANDCHILDREN_COUNT) {
            grandchild = document.createElement(STUB_ONE_INFO.GRANDCHILD_NAME);
            child.appendChild(grandchild);
        }
    }

    return wrapper;
}

module.exports = {
    stubOneInfo: STUB_ONE_INFO,
    getStubOne: createStubOne
}
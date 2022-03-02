function colorToHexString(dColor) {
    return '#' + ("000000" + (((dColor & 0xFF) << 16) + (dColor & 0xFF00) + ((dColor >> 16) & 0xFF)).toString(16)).slice(-6);
}

function clearPixiChildren(objectWithChildren) {
    while (objectWithChildren.children.length > 0) {
        objectWithChildren.removeChild(objectWithChildren.children[0])
    }
}

function destroyPixiChildren(objectWithChildren) {
    objectWithChildren.children.forEach(child => child.destroy());
}
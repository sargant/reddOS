/**
 * Extended Objects
 *
 * Adds additional methods to javascript built-in types
 */

// Function for unescaping HTML encoded characters
String.prototype.unescapeHtml = function () {
    
    // Create a fake element and assign our string to its contents
    var temp = document.createElement("div");
    temp.innerHTML = this;
    
    // Get the contents (now natively escaped), remove the child node and retuin
    var result = temp.childNodes.length === 0 ? "" : temp.childNodes[0].nodeValue;
    if(temp.firstChild) temp.removeChild(temp.firstChild);
    return result;
};

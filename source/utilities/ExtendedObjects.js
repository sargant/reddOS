String.prototype.unescapeHtml = function () {
    var temp = document.createElement("div");
    temp.innerHTML = this;
    var result = temp.childNodes.length === 0 ? "" : temp.childNodes[0].nodeValue;
    temp.removeChild(temp.firstChild);
    return result;
};

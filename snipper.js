/* 
   Snipper is a small javascript to add the html5 details/summary functionality to old browsers 
   Dual MIT+BSD license 
   http://mudasobwa.github.com
*/

var snipper = {
  /** We should avoid applying this patch to those browsers already having details/summary support */
  isNativelySupported : function() {
    // the code is stolen from http://mathiasbynens.be/notes/html5-details-jquery
    // this will not work in `Chrome =10` but who cares since Chrome’s autoupdate 
    return ('open' in document.createElement('details'));
  }(),
  /** The main entry point of the script. Supposed to be used as:
          snipper.init();                 // all the details on the page
          snipper.init("cutted");         // those having class “cutted”
          snipper.init("cutted", false);  // those having class “cutted”, initially opened

      Initializes all the details elements [optionally all having a specific class] on a page.
      @param className the name of a class for a details’ to initialize (omit for all.)
      @param openAll boolean, denoting whether initial state of elements should be “opened”
        or “closed” (defaults to “opened”.) */
  init : function(className, openAll) {
    if (this.isNativelySupported) return;
    this.initDefaultCss(className);
    var dets = document.getElementsByTagName("details");
    for (var i = 0; i < dets.length; i++ ) {
      if (!className || new RegExp(className, "i").test(dets[i].className)) { 
        this.initDetail(dets[i], openAll);
      }
    }
  },
  /** Initializes the default CSS for details/summaries. This is necessary since older browsers
        have no clue about whether details/summary are block elements.
      Furthermore, the older browsers are to be teached to draw “hand” cursor pointer above
        summary as well as triangles before it, denoting the current state (open/close).
      @param className the name of a details’ class to apply default css to; if it’s omitted,
        all the details on the page will be affected. */
  initDefaultCss : function(className) {
    if (this.isNativelySupported) return;
    var style = document.createElement("style");
    style.type = "text/css";
    var detailsCssTag = "details" + (className ? "." + className : "");
    style.innerHTML =  detailsCssTag + ", " + detailsCssTag + " summary { display: block; } " +
                       detailsCssTag + " { padding-left: 1em; margin-left: 1em; } " +
                       detailsCssTag + " summary { cursor: pointer; } " +
                       detailsCssTag + " summary.opened:before { content: '▾ '; } " +
                       detailsCssTag + " summary.closed:before { content: '▸ '; } ";
    document.getElementsByTagName("head")[0].appendChild(style);
  },
  /** Initializes one details element.
      @param det the details element to initialize
      @param openIt set the default state on the page (may be omitted for closed state.) */
  initDetail : function(det, openIt) {
    if (this.isNativelySupported) return;
    if (!det || !det.tagName || det.tagName.toLowerCase() !== "details") return;
    var n = det.firstChild;
    for ( ; n; n = n.nextSibling ) {
      if ( n.nodeType == 1 && n.tagName && n.tagName.toLowerCase() === "summary") {
        var toggler = this;
        n.onclick = function(e) { toggler.toggleDetail(e); };
        this.setOpenClose(n, openIt);
        break;
      }
    }
  },
  /** Opens/closes a summary’s siblings.
      @param elem the summary element to be opened/closed
      @param open opens an element when true, closes otherwise */
  setOpenClose : function(elem, open) {
    if (this.isNativelySupported) return;
    var n = elem.parentNode.firstChild;
    for ( ; n; n = n.nextSibling ) {
      if ( n.nodeType == 1 && n != elem ) {
        n.style.display = open ? "block" : "none";
      }
    }
    elem.className = elem.className.replace(/opened|closed/g,"") + (open ? " opened" : " closed");
  },
  /** Toggles a summary’s siblings.
      @param elem the summary element to be toggled */
  toggleOpenClose : function(elem) {
    if (this.isNativelySupported) return;
    if (elem && elem.tagName && elem.tagName.toLowerCase() === "summary") {
      this.setOpenClose(elem, !elem.className || /closed/.test(elem.className));
    }
  },
  /** Callback for onclick event on summary. Set’s in initDetail. */
  toggleDetail: function(e) {
    if (this.isNativelySupported) return;
    var t;
    if (!e) var e = window.event;
    if (e.target) t = e.target; else if (e.srcElement) t = e.srcElement;
    if (t.nodeType == 3) /* defeat Safari bug */ t = t.parentNode;

    this.toggleOpenClose(t);
  }
}

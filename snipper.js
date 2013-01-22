/* Snipper is a small javascript to add the html5 details/summary functionality to alld browsers :: MIT+BSD license :: http://mudasobwa.github.com */

/** 
* Draws a rounded rectangle using the current state of the canvas.  
* If you omit the last three params, it will draw a rectangle  
* outline with a 5 pixel border radius  
*
* author: http://stackoverflow.com/a/7592676
*
* @param {Number} x The top left x coordinate 
* @param {Number} y The top left y coordinate  
* @param {Number} width The width of the rectangle  
* @param {Number} height The height of the rectangle 
* @param {Object} radius All corner radii. Defaults to 0,0,0,0; 
* @param {Boolean} fill Whether to fill the rectangle. Defaults to false. 
* @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true. 
*/
CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius, fill, stroke) {
  var cornerRadius = { upperLeft: 0, upperRight: 0, lowerLeft: 0, lowerRight: 0 };
  if (typeof stroke == "undefined") {
    stroke = true;
  }
  if (typeof radius === "object") {
    for (var side in radius) {
      cornerRadius[side] = radius[side];
    }
  }

  this.beginPath();
  this.moveTo(x + cornerRadius.upperLeft, y);
  this.lineTo(x + width - cornerRadius.upperRight, y);
  this.quadraticCurveTo(x + width, y, x + width, y + cornerRadius.upperRight);
  this.lineTo(x + width, y + height - cornerRadius.lowerRight);
  this.quadraticCurveTo(x + width, y + height, x + width - cornerRadius.lowerRight, y + height);
  this.lineTo(x + cornerRadius.lowerLeft, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - cornerRadius.lowerLeft);
  this.lineTo(x, y + cornerRadius.upperLeft);
  this.quadraticCurveTo(x, y, x + cornerRadius.upperLeft, y);
  this.closePath();
  if (stroke) {
    this.stroke();
  }
  if (fill) {
    this.fill();
  }
} 

var snipper = {
  /** We should avoid applying this patch to those browsers already having details/summary support */
  isNativelySupported : function() {
    // the code is stolen from http://mathiasbynens.be/notes/html5-details-jquery
    // this will not work in `Chrome =10` but who cares since Chrome’s autoupdate 
    // return ('open' in document.createElement('details'));
    var isDetailsSupported = (function(doc) {
      var el = doc.createElement('details'), fake, root, diff; 
      if (!('open' in el)) return false;
      root = doc.body || (function() {
        var de = doc.documentElement;
        fake = true;
        return de.insertBefore(doc.createElement('body'), de.firstElementChild || de.firstChild);
      }());
      el.innerHTML = '<summary>a</summary>b';
      el.style.display = 'block';
      root.appendChild(el);
      diff = el.offsetHeight;
      el.open = true;
      diff = diff != el.offsetHeight;
      root.removeChild(el);
      if (fake) root.parentNode.removeChild(root);
      return diff;
    }(document));
    return isDetailsSupported;
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
  toggleDetail : function(e) {
    if (this.isNativelySupported) return;
    var t;
    if (!e) var e = window.event;
    if (e.target) t = e.target; else if (e.srcElement) t = e.srcElement;
    if (t.nodeType == 3) /* defeat Safari bug */ t = t.parentNode;

    this.toggleOpenClose(t);
  },

  /* ========================================================================== */
  /* ====         Dealing with canvas to draw proper captions              ==== */
  /* ========================================================================== */
 
  prepareShadow : function (ctx, x, y, b, cl) {
    x |= 0; y |= 0; b |= 0;
    ctx.shadowOffsetX = x;
    ctx.shadowOffsetY = y;
    ctx.shadowBlur = b;
    ctx.shadowColor = cl ? cl : "#FFF";
  },

  drawCaptionBG : function(c, ctx, colorFrom, colorTo) {
    var r = c.height / 2;
    var cf = colorFrom ? colorFrom : "#666";
    var ct = colorTo ? colorTo : "#CCC";
    var grd = ctx.createLinearGradient(0, 0, 0, c.height);
    grd.addColorStop(0, cf);   
    grd.addColorStop(1, ct);
    ctx.fillStyle = grd;
    ctx.strokeStyle = cf;
    ctx.roundRect(0, 0, c.width, c.height, {upperLeft:r,upperRight:r}, true, true);    
  },

  drawCaptionText : function(c, ctx, txt, sz, cl) {
    sz |= c.height * 0.54;
    ctx.font = "bold " + sz + "px Ubuntu";
    ctx.fillStyle = cl ? cl : "#FFF";
    ctx.fillText(txt, c.height * 2, c.height / 2 + sz * 0.3);
  },

  drawControlButton : function (c, ctx, opened, cl, clTxt) {
    shadowSz = 4;
    y = c.height * 0.5;
    r = c.height * 0.3; 
    x = c.height * 0.75;

    _cl = cl ? cl : "#999";

    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    
    var grd = ctx.createRadialGradient(x - r/2, y - r/2, 0, x, y, r);
    grd.addColorStop(0, "#FFF");
    grd.addColorStop(1, _cl);
    ctx.fillStyle = grd;

    this.prepareShadow(ctx, -1, -1, shadowSz, "#999");

    ctx.fill();
    ctx.strokeStyle = _cl;
    ctx.stroke();

    ctx.font = "normal " + (1 + 2 * r) + "px Ubuntu";
    ctx.fillStyle = clTxt ? clTxt : "#666";
    ctx.fillText(opened ? "▾" : "▸", x - r/2 + (opened ? 0 : 1), y + r/2);
  },

  drawCaption : function(canvas, text, opened) {
    var c = canvas.getContext("2d");
    this.drawCaptionBG(canvas, c);
    this.drawCaptionText(canvas, c, text);
    this.drawControlButton(canvas, c, opened);
  }
}

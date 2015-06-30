/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright 2012 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jshint globalstrict: false */
/* globals PDFJS */

// Initializing PDFJS global object (if still undefined)
if (typeof PDFJS === 'undefined') {
  (typeof window !== 'undefined' ? window : this).PDFJS = {};
}

PDFJS.version = '1.0.925';
PDFJS.build = '6048c8a';

(function pdfjsWrapper() {
  // Use strict in our context only - users might not want it
  'use strict';

/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright 2012 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* globals Cmd, ColorSpace, Dict, MozBlobBuilder, Name, PDFJS, Ref, URL,
           Promise */

'use strict';

var globalScope = (typeof window === 'undefined') ? this : window;

var isWorker = (typeof window === 'undefined');

var FONT_IDENTITY_MATRIX = [0.001, 0, 0, 0.001, 0, 0];

var TextRenderingMode = {
  FILL: 0,
  STROKE: 1,
  FILL_STROKE: 2,
  INVISIBLE: 3,
  FILL_ADD_TO_PATH: 4,
  STROKE_ADD_TO_PATH: 5,
  FILL_STROKE_ADD_TO_PATH: 6,
  ADD_TO_PATH: 7,
  FILL_STROKE_MASK: 3,
  ADD_TO_PATH_FLAG: 4
};

var ImageKind = {
  GRAYSCALE_1BPP: 1,
  RGB_24BPP: 2,
  RGBA_32BPP: 3
};

var AnnotationType = {
  WIDGET: 1,
  TEXT: 2,
  LINK: 3
};

var StreamType = {
  UNKNOWN: 0,
  FLATE: 1,
  LZW: 2,
  DCT: 3,
  JPX: 4,
  JBIG: 5,
  A85: 6,
  AHX: 7,
  CCF: 8,
  RL: 9
};

var FontType = {
  UNKNOWN: 0,
  TYPE1: 1,
  TYPE1C: 2,
  CIDFONTTYPE0: 3,
  CIDFONTTYPE0C: 4,
  TRUETYPE: 5,
  CIDFONTTYPE2: 6,
  TYPE3: 7,
  OPENTYPE: 8,
  TYPE0: 9,
  MMTYPE1: 10
};

// The global PDFJS object exposes the API
// In production, it will be declared outside a global wrapper
// In development, it will be declared here
if (!globalScope.PDFJS) {
  globalScope.PDFJS = {};
}

globalScope.PDFJS.pdfBug = false;

PDFJS.VERBOSITY_LEVELS = {
  errors: 0,
  warnings: 1,
  infos: 5
};

// All the possible operations for an operator list.
var OPS = PDFJS.OPS = {
  // Intentionally start from 1 so it is easy to spot bad operators that will be
  // 0's.
  dependency: 1,
  setLineWidth: 2,
  setLineCap: 3,
  setLineJoin: 4,
  setMiterLimit: 5,
  setDash: 6,
  setRenderingIntent: 7,
  setFlatness: 8,
  setGState: 9,
  save: 10,
  restore: 11,
  transform: 12,
  moveTo: 13,
  lineTo: 14,
  curveTo: 15,
  curveTo2: 16,
  curveTo3: 17,
  closePath: 18,
  rectangle: 19,
  stroke: 20,
  closeStroke: 21,
  fill: 22,
  eoFill: 23,
  fillStroke: 24,
  eoFillStroke: 25,
  closeFillStroke: 26,
  closeEOFillStroke: 27,
  endPath: 28,
  clip: 29,
  eoClip: 30,
  beginText: 31,
  endText: 32,
  setCharSpacing: 33,
  setWordSpacing: 34,
  setHScale: 35,
  setLeading: 36,
  setFont: 37,
  setTextRenderingMode: 38,
  setTextRise: 39,
  moveText: 40,
  setLeadingMoveText: 41,
  setTextMatrix: 42,
  nextLine: 43,
  showText: 44,
  showSpacedText: 45,
  nextLineShowText: 46,
  nextLineSetSpacingShowText: 47,
  setCharWidth: 48,
  setCharWidthAndBounds: 49,
  setStrokeColorSpace: 50,
  setFillColorSpace: 51,
  setStrokeColor: 52,
  setStrokeColorN: 53,
  setFillColor: 54,
  setFillColorN: 55,
  setStrokeGray: 56,
  setFillGray: 57,
  setStrokeRGBColor: 58,
  setFillRGBColor: 59,
  setStrokeCMYKColor: 60,
  setFillCMYKColor: 61,
  shadingFill: 62,
  beginInlineImage: 63,
  beginImageData: 64,
  endInlineImage: 65,
  paintXObject: 66,
  markPoint: 67,
  markPointProps: 68,
  beginMarkedContent: 69,
  beginMarkedContentProps: 70,
  endMarkedContent: 71,
  beginCompat: 72,
  endCompat: 73,
  paintFormXObjectBegin: 74,
  paintFormXObjectEnd: 75,
  beginGroup: 76,
  endGroup: 77,
  beginAnnotations: 78,
  endAnnotations: 79,
  beginAnnotation: 80,
  endAnnotation: 81,
  paintJpegXObject: 82,
  paintImageMaskXObject: 83,
  paintImageMaskXObjectGroup: 84,
  paintImageXObject: 85,
  paintInlineImageXObject: 86,
  paintInlineImageXObjectGroup: 87,
  paintImageXObjectRepeat: 88,
  paintImageMaskXObjectRepeat: 89,
  paintSolidColorImageMask: 90,
  constructPath: 91
};

// A notice for devs. These are good for things that are helpful to devs, such
// as warning that Workers were disabled, which is important to devs but not
// end users.
function info(msg) {
  if (PDFJS.verbosity >= PDFJS.VERBOSITY_LEVELS.infos) {
    console.log('Info: ' + msg);
  }
}

// Non-fatal warnings.
function warn(msg) {
  if (PDFJS.verbosity >= PDFJS.VERBOSITY_LEVELS.warnings) {
    console.log('Warning: ' + msg);
  }
}

// Fatal errors that should trigger the fallback UI and halt execution by
// throwing an exception.
function error(msg) {
  // If multiple arguments were passed, pass them all to the log function.
  if (arguments.length > 1) {
    var logArguments = ['Error:'];
    logArguments.push.apply(logArguments, arguments);
    console.log.apply(console, logArguments);
    // Join the arguments into a single string for the lines below.
    msg = [].join.call(arguments, ' ');
  } else {
    console.log('Error: ' + msg);
  }
  console.log(backtrace());
  UnsupportedManager.notify(UNSUPPORTED_FEATURES.unknown);
  throw new Error(msg);
}

function backtrace() {
  try {
    throw new Error();
  } catch (e) {
    return e.stack ? e.stack.split('\n').slice(2).join('\n') : '';
  }
}

function assert(cond, msg) {
  if (!cond) {
    error(msg);
  }
}

var UNSUPPORTED_FEATURES = PDFJS.UNSUPPORTED_FEATURES = {
  unknown: 'unknown',
  forms: 'forms',
  javaScript: 'javaScript',
  smask: 'smask',
  shadingPattern: 'shadingPattern',
  font: 'font'
};

var UnsupportedManager = PDFJS.UnsupportedManager =
  (function UnsupportedManagerClosure() {
  var listeners = [];
  return {
    listen: function (cb) {
      listeners.push(cb);
    },
    notify: function (featureId) {
      warn('Unsupported feature "' + featureId + '"');
      for (var i = 0, ii = listeners.length; i < ii; i++) {
        listeners[i](featureId);
      }
    }
  };
})();

// Combines two URLs. The baseUrl shall be absolute URL. If the url is an
// absolute URL, it will be returned as is.
function combineUrl(baseUrl, url) {
  if (!url) {
    return baseUrl;
  }
  if (/^[a-z][a-z0-9+\-.]*:/i.test(url)) {
    return url;
  }
  var i;
  if (url.charAt(0) === '/') {
    // absolute path
    i = baseUrl.indexOf('://');
    if (url.charAt(1) === '/') {
      ++i;
    } else {
      i = baseUrl.indexOf('/', i + 3);
    }
    return baseUrl.substring(0, i) + url;
  } else {
    // relative path
    var pathLength = baseUrl.length;
    i = baseUrl.lastIndexOf('#');
    pathLength = i >= 0 ? i : pathLength;
    i = baseUrl.lastIndexOf('?', pathLength);
    pathLength = i >= 0 ? i : pathLength;
    var prefixLength = baseUrl.lastIndexOf('/', pathLength);
    return baseUrl.substring(0, prefixLength + 1) + url;
  }
}

// Validates if URL is safe and allowed, e.g. to avoid XSS.
function isValidUrl(url, allowRelative) {
  if (!url) {
    return false;
  }
  // RFC 3986 (http://tools.ietf.org/html/rfc3986#section-3.1)
  // scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
  var protocol = /^[a-z][a-z0-9+\-.]*(?=:)/i.exec(url);
  if (!protocol) {
    return allowRelative;
  }
  protocol = protocol[0].toLowerCase();
  switch (protocol) {
    case 'http':
    case 'https':
    case 'ftp':
    case 'mailto':
      return true;
    default:
      return false;
  }
}
PDFJS.isValidUrl = isValidUrl;

function shadow(obj, prop, value) {
  Object.defineProperty(obj, prop, { value: value,
                                     enumerable: true,
                                     configurable: true,
                                     writable: false });
  return value;
}

var PasswordResponses = PDFJS.PasswordResponses = {
  NEED_PASSWORD: 1,
  INCORRECT_PASSWORD: 2
};

var PasswordException = (function PasswordExceptionClosure() {
  function PasswordException(msg, code) {
    this.name = 'PasswordException';
    this.message = msg;
    this.code = code;
  }

  PasswordException.prototype = new Error();
  PasswordException.constructor = PasswordException;

  return PasswordException;
})();
PDFJS.PasswordException = PasswordException;

var UnknownErrorException = (function UnknownErrorExceptionClosure() {
  function UnknownErrorException(msg, details) {
    this.name = 'UnknownErrorException';
    this.message = msg;
    this.details = details;
  }

  UnknownErrorException.prototype = new Error();
  UnknownErrorException.constructor = UnknownErrorException;

  return UnknownErrorException;
})();
PDFJS.UnknownErrorException = UnknownErrorException;

var InvalidPDFException = (function InvalidPDFExceptionClosure() {
  function InvalidPDFException(msg) {
    this.name = 'InvalidPDFException';
    this.message = msg;
  }

  InvalidPDFException.prototype = new Error();
  InvalidPDFException.constructor = InvalidPDFException;

  return InvalidPDFException;
})();
PDFJS.InvalidPDFException = InvalidPDFException;

var MissingPDFException = (function MissingPDFExceptionClosure() {
  function MissingPDFException(msg) {
    this.name = 'MissingPDFException';
    this.message = msg;
  }

  MissingPDFException.prototype = new Error();
  MissingPDFException.constructor = MissingPDFException;

  return MissingPDFException;
})();
PDFJS.MissingPDFException = MissingPDFException;

var UnexpectedResponseException =
    (function UnexpectedResponseExceptionClosure() {
  function UnexpectedResponseException(msg, status) {
    this.name = 'UnexpectedResponseException';
    this.message = msg;
    this.status = status;
  }

  UnexpectedResponseException.prototype = new Error();
  UnexpectedResponseException.constructor = UnexpectedResponseException;

  return UnexpectedResponseException;
})();
PDFJS.UnexpectedResponseException = UnexpectedResponseException;

var NotImplementedException = (function NotImplementedExceptionClosure() {
  function NotImplementedException(msg) {
    this.message = msg;
  }

  NotImplementedException.prototype = new Error();
  NotImplementedException.prototype.name = 'NotImplementedException';
  NotImplementedException.constructor = NotImplementedException;

  return NotImplementedException;
})();

var MissingDataException = (function MissingDataExceptionClosure() {
  function MissingDataException(begin, end) {
    this.begin = begin;
    this.end = end;
    this.message = 'Missing data [' + begin + ', ' + end + ')';
  }

  MissingDataException.prototype = new Error();
  MissingDataException.prototype.name = 'MissingDataException';
  MissingDataException.constructor = MissingDataException;

  return MissingDataException;
})();

var XRefParseException = (function XRefParseExceptionClosure() {
  function XRefParseException(msg) {
    this.message = msg;
  }

  XRefParseException.prototype = new Error();
  XRefParseException.prototype.name = 'XRefParseException';
  XRefParseException.constructor = XRefParseException;

  return XRefParseException;
})();


function bytesToString(bytes) {
  var length = bytes.length;
  var MAX_ARGUMENT_COUNT = 8192;
  if (length < MAX_ARGUMENT_COUNT) {
    return String.fromCharCode.apply(null, bytes);
  }
  var strBuf = [];
  for (var i = 0; i < length; i += MAX_ARGUMENT_COUNT) {
    var chunkEnd = Math.min(i + MAX_ARGUMENT_COUNT, length);
    var chunk = bytes.subarray(i, chunkEnd);
    strBuf.push(String.fromCharCode.apply(null, chunk));
  }
  return strBuf.join('');
}

function stringToBytes(str) {
  var length = str.length;
  var bytes = new Uint8Array(length);
  for (var i = 0; i < length; ++i) {
    bytes[i] = str.charCodeAt(i) & 0xFF;
  }
  return bytes;
}

function string32(value) {
  return String.fromCharCode((value >> 24) & 0xff, (value >> 16) & 0xff,
                             (value >> 8) & 0xff, value & 0xff);
}

function log2(x) {
  var n = 1, i = 0;
  while (x > n) {
    n <<= 1;
    i++;
  }
  return i;
}

function readInt8(data, start) {
  return (data[start] << 24) >> 24;
}

function readUint16(data, offset) {
  return (data[offset] << 8) | data[offset + 1];
}

function readUint32(data, offset) {
  return ((data[offset] << 24) | (data[offset + 1] << 16) |
         (data[offset + 2] << 8) | data[offset + 3]) >>> 0;
}

// Lazy test the endianness of the platform
// NOTE: This will be 'true' for simulated TypedArrays
function isLittleEndian() {
  var buffer8 = new Uint8Array(2);
  buffer8[0] = 1;
  var buffer16 = new Uint16Array(buffer8.buffer);
  return (buffer16[0] === 1);
}

Object.defineProperty(PDFJS, 'isLittleEndian', {
  configurable: true,
  get: function PDFJS_isLittleEndian() {
    return shadow(PDFJS, 'isLittleEndian', isLittleEndian());
  }
});

  // Lazy test if the userAgant support CanvasTypedArrays
function hasCanvasTypedArrays() {
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  var ctx = canvas.getContext('2d');
  var imageData = ctx.createImageData(1, 1);
  return (typeof imageData.data.buffer !== 'undefined');
}

Object.defineProperty(PDFJS, 'hasCanvasTypedArrays', {
  configurable: true,
  get: function PDFJS_hasCanvasTypedArrays() {
    return shadow(PDFJS, 'hasCanvasTypedArrays', hasCanvasTypedArrays());
  }
});

var Uint32ArrayView = (function Uint32ArrayViewClosure() {

  function Uint32ArrayView(buffer, length) {
    this.buffer = buffer;
    this.byteLength = buffer.length;
    this.length = length === undefined ? (this.byteLength >> 2) : length;
    ensureUint32ArrayViewProps(this.length);
  }
  Uint32ArrayView.prototype = Object.create(null);

  var uint32ArrayViewSetters = 0;
  function createUint32ArrayProp(index) {
    return {
      get: function () {
        var buffer = this.buffer, offset = index << 2;
        return (buffer[offset] | (buffer[offset + 1] << 8) |
          (buffer[offset + 2] << 16) | (buffer[offset + 3] << 24)) >>> 0;
      },
      set: function (value) {
        var buffer = this.buffer, offset = index << 2;
        buffer[offset] = value & 255;
        buffer[offset + 1] = (value >> 8) & 255;
        buffer[offset + 2] = (value >> 16) & 255;
        buffer[offset + 3] = (value >>> 24) & 255;
      }
    };
  }

  function ensureUint32ArrayViewProps(length) {
    while (uint32ArrayViewSetters < length) {
      Object.defineProperty(Uint32ArrayView.prototype,
        uint32ArrayViewSetters,
        createUint32ArrayProp(uint32ArrayViewSetters));
      uint32ArrayViewSetters++;
    }
  }

  return Uint32ArrayView;
})();

var IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0];

var Util = PDFJS.Util = (function UtilClosure() {
  function Util() {}

  var rgbBuf = ['rgb(', 0, ',', 0, ',', 0, ')'];

  // makeCssRgb() can be called thousands of times. Using |rgbBuf| avoids
  // creating many intermediate strings.
  Util.makeCssRgb = function Util_makeCssRgb(rgb) {
    rgbBuf[1] = rgb[0];
    rgbBuf[3] = rgb[1];
    rgbBuf[5] = rgb[2];
    return rgbBuf.join('');
  };

  // Concatenates two transformation matrices together and returns the result.
  Util.transform = function Util_transform(m1, m2) {
    return [
      m1[0] * m2[0] + m1[2] * m2[1],
      m1[1] * m2[0] + m1[3] * m2[1],
      m1[0] * m2[2] + m1[2] * m2[3],
      m1[1] * m2[2] + m1[3] * m2[3],
      m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
      m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
    ];
  };

  // For 2d affine transforms
  Util.applyTransform = function Util_applyTransform(p, m) {
    var xt = p[0] * m[0] + p[1] * m[2] + m[4];
    var yt = p[0] * m[1] + p[1] * m[3] + m[5];
    return [xt, yt];
  };

  Util.applyInverseTransform = function Util_applyInverseTransform(p, m) {
    var d = m[0] * m[3] - m[1] * m[2];
    var xt = (p[0] * m[3] - p[1] * m[2] + m[2] * m[5] - m[4] * m[3]) / d;
    var yt = (-p[0] * m[1] + p[1] * m[0] + m[4] * m[1] - m[5] * m[0]) / d;
    return [xt, yt];
  };

  // Applies the transform to the rectangle and finds the minimum axially
  // aligned bounding box.
  Util.getAxialAlignedBoundingBox =
    function Util_getAxialAlignedBoundingBox(r, m) {

    var p1 = Util.applyTransform(r, m);
    var p2 = Util.applyTransform(r.slice(2, 4), m);
    var p3 = Util.applyTransform([r[0], r[3]], m);
    var p4 = Util.applyTransform([r[2], r[1]], m);
    return [
      Math.min(p1[0], p2[0], p3[0], p4[0]),
      Math.min(p1[1], p2[1], p3[1], p4[1]),
      Math.max(p1[0], p2[0], p3[0], p4[0]),
      Math.max(p1[1], p2[1], p3[1], p4[1])
    ];
  };

  Util.inverseTransform = function Util_inverseTransform(m) {
    var d = m[0] * m[3] - m[1] * m[2];
    return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d,
      (m[2] * m[5] - m[4] * m[3]) / d, (m[4] * m[1] - m[5] * m[0]) / d];
  };

  // Apply a generic 3d matrix M on a 3-vector v:
  //   | a b c |   | X |
  //   | d e f | x | Y |
  //   | g h i |   | Z |
  // M is assumed to be serialized as [a,b,c,d,e,f,g,h,i],
  // with v as [X,Y,Z]
  Util.apply3dTransform = function Util_apply3dTransform(m, v) {
    return [
      m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
      m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
      m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
    ];
  };

  // This calculation uses Singular Value Decomposition.
  // The SVD can be represented with formula A = USV. We are interested in the
  // matrix S here because it represents the scale values.
  Util.singularValueDecompose2dScale =
    function Util_singularValueDecompose2dScale(m) {

    var transpose = [m[0], m[2], m[1], m[3]];

    // Multiply matrix m with its transpose.
    var a = m[0] * transpose[0] + m[1] * transpose[2];
    var b = m[0] * transpose[1] + m[1] * transpose[3];
    var c = m[2] * transpose[0] + m[3] * transpose[2];
    var d = m[2] * transpose[1] + m[3] * transpose[3];

    // Solve the second degree polynomial to get roots.
    var first = (a + d) / 2;
    var second = Math.sqrt((a + d) * (a + d) - 4 * (a * d - c * b)) / 2;
    var sx = first + second || 1;
    var sy = first - second || 1;

    // Scale values are the square roots of the eigenvalues.
    return [Math.sqrt(sx), Math.sqrt(sy)];
  };

  // Normalize rectangle rect=[x1, y1, x2, y2] so that (x1,y1) < (x2,y2)
  // For coordinate systems whose origin lies in the bottom-left, this
  // means normalization to (BL,TR) ordering. For systems with origin in the
  // top-left, this means (TL,BR) ordering.
  Util.normalizeRect = function Util_normalizeRect(rect) {
    var r = rect.slice(0); // clone rect
    if (rect[0] > rect[2]) {
      r[0] = rect[2];
      r[2] = rect[0];
    }
    if (rect[1] > rect[3]) {
      r[1] = rect[3];
      r[3] = rect[1];
    }
    return r;
  };

  // Returns a rectangle [x1, y1, x2, y2] corresponding to the
  // intersection of rect1 and rect2. If no intersection, returns 'false'
  // The rectangle coordinates of rect1, rect2 should be [x1, y1, x2, y2]
  Util.intersect = function Util_intersect(rect1, rect2) {
    function compare(a, b) {
      return a - b;
    }

    // Order points along the axes
    var orderedX = [rect1[0], rect1[2], rect2[0], rect2[2]].sort(compare),
        orderedY = [rect1[1], rect1[3], rect2[1], rect2[3]].sort(compare),
        result = [];

    rect1 = Util.normalizeRect(rect1);
    rect2 = Util.normalizeRect(rect2);

    // X: first and second points belong to different rectangles?
    if ((orderedX[0] === rect1[0] && orderedX[1] === rect2[0]) ||
        (orderedX[0] === rect2[0] && orderedX[1] === rect1[0])) {
      // Intersection must be between second and third points
      result[0] = orderedX[1];
      result[2] = orderedX[2];
    } else {
      return false;
    }

    // Y: first and second points belong to different rectangles?
    if ((orderedY[0] === rect1[1] && orderedY[1] === rect2[1]) ||
        (orderedY[0] === rect2[1] && orderedY[1] === rect1[1])) {
      // Intersection must be between second and third points
      result[1] = orderedY[1];
      result[3] = orderedY[2];
    } else {
      return false;
    }

    return result;
  };

  Util.sign = function Util_sign(num) {
    return num < 0 ? -1 : 1;
  };

  Util.appendToArray = function Util_appendToArray(arr1, arr2) {
    Array.prototype.push.apply(arr1, arr2);
  };

  Util.prependToArray = function Util_prependToArray(arr1, arr2) {
    Array.prototype.unshift.apply(arr1, arr2);
  };

  Util.extendObj = function extendObj(obj1, obj2) {
    for (var key in obj2) {
      obj1[key] = obj2[key];
    }
  };

  Util.getInheritableProperty = function Util_getInheritableProperty(dict,
                                                                     name) {
    while (dict && !dict.has(name)) {
      dict = dict.get('Parent');
    }
    if (!dict) {
      return null;
    }
    return dict.get(name);
  };

  Util.inherit = function Util_inherit(sub, base, prototype) {
    sub.prototype = Object.create(base.prototype);
    sub.prototype.constructor = sub;
    for (var prop in prototype) {
      sub.prototype[prop] = prototype[prop];
    }
  };

  Util.loadScript = function Util_loadScript(src, callback) {
    var script = document.createElement('script');
    var loaded = false;
    script.setAttribute('src', src);
    if (callback) {
      script.onload = function() {
        if (!loaded) {
          callback();
        }
        loaded = true;
      };
    }
    document.getElementsByTagName('head')[0].appendChild(script);
  };

  return Util;
})();

/**
 * PDF page viewport created based on scale, rotation and offset.
 * @class
 * @alias PDFJS.PageViewport
 */
var PageViewport = PDFJS.PageViewport = (function PageViewportClosure() {
  /**
   * @constructor
   * @private
   * @param viewBox {Array} xMin, yMin, xMax and yMax coordinates.
   * @param scale {number} scale of the viewport.
   * @param rotation {number} rotations of the viewport in degrees.
   * @param offsetX {number} offset X
   * @param offsetY {number} offset Y
   * @param dontFlip {boolean} if true, axis Y will not be flipped.
   */
  function PageViewport(viewBox, scale, rotation, offsetX, offsetY, dontFlip) {
    this.viewBox = viewBox;
    this.scale = scale;
    this.rotation = rotation;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    // creating transform to convert pdf coordinate system to the normal
    // canvas like coordinates taking in account scale and rotation
    var centerX = (viewBox[2] + viewBox[0]) / 2;
    var centerY = (viewBox[3] + viewBox[1]) / 2;
    var rotateA, rotateB, rotateC, rotateD;
    rotation = rotation % 360;
    rotation = rotation < 0 ? rotation + 360 : rotation;
    switch (rotation) {
      case 180:
        rotateA = -1; rotateB = 0; rotateC = 0; rotateD = 1;
        break;
      case 90:
        rotateA = 0; rotateB = 1; rotateC = 1; rotateD = 0;
        break;
      case 270:
        rotateA = 0; rotateB = -1; rotateC = -1; rotateD = 0;
        break;
      //case 0:
      default:
        rotateA = 1; rotateB = 0; rotateC = 0; rotateD = -1;
        break;
    }

    if (dontFlip) {
      rotateC = -rotateC; rotateD = -rotateD;
    }

    var offsetCanvasX, offsetCanvasY;
    var width, height;
    if (rotateA === 0) {
      offsetCanvasX = Math.abs(centerY - viewBox[1]) * scale + offsetX;
      offsetCanvasY = Math.abs(centerX - viewBox[0]) * scale + offsetY;
      width = Math.abs(viewBox[3] - viewBox[1]) * scale;
      height = Math.abs(viewBox[2] - viewBox[0]) * scale;
    } else {
      offsetCanvasX = Math.abs(centerX - viewBox[0]) * scale + offsetX;
      offsetCanvasY = Math.abs(centerY - viewBox[1]) * scale + offsetY;
      width = Math.abs(viewBox[2] - viewBox[0]) * scale;
      height = Math.abs(viewBox[3] - viewBox[1]) * scale;
    }
    // creating transform for the following operations:
    // translate(-centerX, -centerY), rotate and flip vertically,
    // scale, and translate(offsetCanvasX, offsetCanvasY)
    this.transform = [
      rotateA * scale,
      rotateB * scale,
      rotateC * scale,
      rotateD * scale,
      offsetCanvasX - rotateA * scale * centerX - rotateC * scale * centerY,
      offsetCanvasY - rotateB * scale * centerX - rotateD * scale * centerY
    ];

    this.width = width;
    this.height = height;
    this.fontScale = scale;
  }
  PageViewport.prototype = /** @lends PDFJS.PageViewport.prototype */ {
    /**
     * Clones viewport with additional properties.
     * @param args {Object} (optional) If specified, may contain the 'scale' or
     * 'rotation' properties to override the corresponding properties in
     * the cloned viewport.
     * @returns {PDFJS.PageViewport} Cloned viewport.
     */
    clone: function PageViewPort_clone(args) {
      args = args || {};
      var scale = 'scale' in args ? args.scale : this.scale;
      var rotation = 'rotation' in args ? args.rotation : this.rotation;
      return new PageViewport(this.viewBox.slice(), scale, rotation,
                              this.offsetX, this.offsetY, args.dontFlip);
    },
    /**
     * Converts PDF point to the viewport coordinates. For examples, useful for
     * converting PDF location into canvas pixel coordinates.
     * @param x {number} X coordinate.
     * @param y {number} Y coordinate.
     * @returns {Object} Object that contains 'x' and 'y' properties of the
     * point in the viewport coordinate space.
     * @see {@link convertToPdfPoint}
     * @see {@link convertToViewportRectangle}
     */
    convertToViewportPoint: function PageViewport_convertToViewportPoint(x, y) {
      return Util.applyTransform([x, y], this.transform);
    },
    /**
     * Converts PDF rectangle to the viewport coordinates.
     * @param rect {Array} xMin, yMin, xMax and yMax coordinates.
     * @returns {Array} Contains corresponding coordinates of the rectangle
     * in the viewport coordinate space.
     * @see {@link convertToViewportPoint}
     */
    convertToViewportRectangle:
      function PageViewport_convertToViewportRectangle(rect) {
      var tl = Util.applyTransform([rect[0], rect[1]], this.transform);
      var br = Util.applyTransform([rect[2], rect[3]], this.transform);
      return [tl[0], tl[1], br[0], br[1]];
    },
    /**
     * Converts viewport coordinates to the PDF location. For examples, useful
     * for converting canvas pixel location into PDF one.
     * @param x {number} X coordinate.
     * @param y {number} Y coordinate.
     * @returns {Object} Object that contains 'x' and 'y' properties of the
     * point in the PDF coordinate space.
     * @see {@link convertToViewportPoint}
     */
    convertToPdfPoint: function PageViewport_convertToPdfPoint(x, y) {
      return Util.applyInverseTransform([x, y], this.transform);
    }
  };
  return PageViewport;
})();

var PDFStringTranslateTable = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0x2D8, 0x2C7, 0x2C6, 0x2D9, 0x2DD, 0x2DB, 0x2DA, 0x2DC, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x2022, 0x2020, 0x2021, 0x2026, 0x2014,
  0x2013, 0x192, 0x2044, 0x2039, 0x203A, 0x2212, 0x2030, 0x201E, 0x201C,
  0x201D, 0x2018, 0x2019, 0x201A, 0x2122, 0xFB01, 0xFB02, 0x141, 0x152, 0x160,
  0x178, 0x17D, 0x131, 0x142, 0x153, 0x161, 0x17E, 0, 0x20AC
];

function stringToPDFString(str) {
  var i, n = str.length, strBuf = [];
  if (str[0] === '\xFE' && str[1] === '\xFF') {
    // UTF16BE BOM
    for (i = 2; i < n; i += 2) {
      strBuf.push(String.fromCharCode(
        (str.charCodeAt(i) << 8) | str.charCodeAt(i + 1)));
    }
  } else {
    for (i = 0; i < n; ++i) {
      var code = PDFStringTranslateTable[str.charCodeAt(i)];
      strBuf.push(code ? String.fromCharCode(code) : str.charAt(i));
    }
  }
  return strBuf.join('');
}

function stringToUTF8String(str) {
  return decodeURIComponent(escape(str));
}

function isEmptyObj(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
}

function isBool(v) {
  return typeof v === 'boolean';
}

function isInt(v) {
  return typeof v === 'number' && ((v | 0) === v);
}

function isNum(v) {
  return typeof v === 'number';
}

function isString(v) {
  return typeof v === 'string';
}

function isNull(v) {
  return v === null;
}

function isName(v) {
  return v instanceof Name;
}

function isCmd(v, cmd) {
  return v instanceof Cmd && (cmd === undefined || v.cmd === cmd);
}

function isDict(v, type) {
  if (!(v instanceof Dict)) {
    return false;
  }
  if (!type) {
    return true;
  }
  var dictType = v.get('Type');
  return isName(dictType) && dictType.name === type;
}

function isArray(v) {
  return v instanceof Array;
}

function isStream(v) {
  return typeof v === 'object' && v !== null && v.getBytes !== undefined;
}

function isArrayBuffer(v) {
  return typeof v === 'object' && v !== null && v.byteLength !== undefined;
}

function isRef(v) {
  return v instanceof Ref;
}

/**
 * Promise Capability object.
 *
 * @typedef {Object} PromiseCapability
 * @property {Promise} promise - A promise object.
 * @property {function} resolve - Fullfills the promise.
 * @property {function} reject - Rejects the promise.
 */

/**
 * Creates a promise capability object.
 * @alias PDFJS.createPromiseCapability
 *
 * @return {PromiseCapability} A capability object contains:
 * - a Promise, resolve and reject methods.
 */
function createPromiseCapability() {
  var capability = {};
  capability.promise = new Promise(function (resolve, reject) {
    capability.resolve = resolve;
    capability.reject = reject;
  });
  return capability;
}

PDFJS.createPromiseCapability = createPromiseCapability;

/**
 * Polyfill for Promises:
 * The following promise implementation tries to generally implement the
 * Promise/A+ spec. Some notable differences from other promise libaries are:
 * - There currently isn't a seperate deferred and promise object.
 * - Unhandled rejections eventually show an error if they aren't handled.
 *
 * Based off of the work in:
 * https://bugzilla.mozilla.org/show_bug.cgi?id=810490
 */
(function PromiseClosure() {
  if (globalScope.Promise) {
    // Promises existing in the DOM/Worker, checking presence of all/resolve
    if (typeof globalScope.Promise.all !== 'function') {
      globalScope.Promise.all = function (iterable) {
        var count = 0, results = [], resolve, reject;
        var promise = new globalScope.Promise(function (resolve_, reject_) {
          resolve = resolve_;
          reject = reject_;
        });
        iterable.forEach(function (p, i) {
          count++;
          p.then(function (result) {
            results[i] = result;
            count--;
            if (count === 0) {
              resolve(results);
            }
          }, reject);
        });
        if (count === 0) {
          resolve(results);
        }
        return promise;
      };
    }
    if (typeof globalScope.Promise.resolve !== 'function') {
      globalScope.Promise.resolve = function (value) {
        return new globalScope.Promise(function (resolve) { resolve(value); });
      };
    }
    if (typeof globalScope.Promise.reject !== 'function') {
      globalScope.Promise.reject = function (reason) {
        return new globalScope.Promise(function (resolve, reject) {
          reject(reason);
        });
      };
    }
    if (typeof globalScope.Promise.prototype.catch !== 'function') {
      globalScope.Promise.prototype.catch = function (onReject) {
        return globalScope.Promise.prototype.then(undefined, onReject);
      };
    }
    return;
  }
  var STATUS_PENDING = 0;
  var STATUS_RESOLVED = 1;
  var STATUS_REJECTED = 2;

  // In an attempt to avoid silent exceptions, unhandled rejections are
  // tracked and if they aren't handled in a certain amount of time an
  // error is logged.
  var REJECTION_TIMEOUT = 500;

  var HandlerManager = {
    handlers: [],
    running: false,
    unhandledRejections: [],
    pendingRejectionCheck: false,

    scheduleHandlers: function scheduleHandlers(promise) {
      if (promise._status === STATUS_PENDING) {
        return;
      }

      this.handlers = this.handlers.concat(promise._handlers);
      promise._handlers = [];

      if (this.running) {
        return;
      }
      this.running = true;

      setTimeout(this.runHandlers.bind(this), 0);
    },

    runHandlers: function runHandlers() {
      var RUN_TIMEOUT = 1; // ms
      var timeoutAt = Date.now() + RUN_TIMEOUT;
      while (this.handlers.length > 0) {
        var handler = this.handlers.shift();

        var nextStatus = handler.thisPromise._status;
        var nextValue = handler.thisPromise._value;

        try {
          if (nextStatus === STATUS_RESOLVED) {
            if (typeof handler.onResolve === 'function') {
              nextValue = handler.onResolve(nextValue);
            }
          } else if (typeof handler.onReject === 'function') {
              nextValue = handler.onReject(nextValue);
              nextStatus = STATUS_RESOLVED;

              if (handler.thisPromise._unhandledRejection) {
                this.removeUnhandeledRejection(handler.thisPromise);
              }
          }
        } catch (ex) {
          nextStatus = STATUS_REJECTED;
          nextValue = ex;
        }

        handler.nextPromise._updateStatus(nextStatus, nextValue);
        if (Date.now() >= timeoutAt) {
          break;
        }
      }

      if (this.handlers.length > 0) {
        setTimeout(this.runHandlers.bind(this), 0);
        return;
      }

      this.running = false;
    },

    addUnhandledRejection: function addUnhandledRejection(promise) {
      this.unhandledRejections.push({
        promise: promise,
        time: Date.now()
      });
      this.scheduleRejectionCheck();
    },

    removeUnhandeledRejection: function removeUnhandeledRejection(promise) {
      promise._unhandledRejection = false;
      for (var i = 0; i < this.unhandledRejections.length; i++) {
        if (this.unhandledRejections[i].promise === promise) {
          this.unhandledRejections.splice(i);
          i--;
        }
      }
    },

    scheduleRejectionCheck: function scheduleRejectionCheck() {
      if (this.pendingRejectionCheck) {
        return;
      }
      this.pendingRejectionCheck = true;
      setTimeout(function rejectionCheck() {
        this.pendingRejectionCheck = false;
        var now = Date.now();
        for (var i = 0; i < this.unhandledRejections.length; i++) {
          if (now - this.unhandledRejections[i].time > REJECTION_TIMEOUT) {
            var unhandled = this.unhandledRejections[i].promise._value;
            var msg = 'Unhandled rejection: ' + unhandled;
            if (unhandled.stack) {
              msg += '\n' + unhandled.stack;
            }
            warn(msg);
            this.unhandledRejections.splice(i);
            i--;
          }
        }
        if (this.unhandledRejections.length) {
          this.scheduleRejectionCheck();
        }
      }.bind(this), REJECTION_TIMEOUT);
    }
  };

  function Promise(resolver) {
    this._status = STATUS_PENDING;
    this._handlers = [];
    try {
      resolver.call(this, this._resolve.bind(this), this._reject.bind(this));
    } catch (e) {
      this._reject(e);
    }
  }
  /**
   * Builds a promise that is resolved when all the passed in promises are
   * resolved.
   * @param {array} array of data and/or promises to wait for.
   * @return {Promise} New dependant promise.
   */
  Promise.all = function Promise_all(promises) {
    var resolveAll, rejectAll;
    var deferred = new Promise(function (resolve, reject) {
      resolveAll = resolve;
      rejectAll = reject;
    });
    var unresolved = promises.length;
    var results = [];
    if (unresolved === 0) {
      resolveAll(results);
      return deferred;
    }
    function reject(reason) {
      if (deferred._status === STATUS_REJECTED) {
        return;
      }
      results = [];
      rejectAll(reason);
    }
    for (var i = 0, ii = promises.length; i < ii; ++i) {
      var promise = promises[i];
      var resolve = (function(i) {
        return function(value) {
          if (deferred._status === STATUS_REJECTED) {
            return;
          }
          results[i] = value;
          unresolved--;
          if (unresolved === 0) {
            resolveAll(results);
          }
        };
      })(i);
      if (Promise.isPromise(promise)) {
        promise.then(resolve, reject);
      } else {
        resolve(promise);
      }
    }
    return deferred;
  };

  /**
   * Checks if the value is likely a promise (has a 'then' function).
   * @return {boolean} true if value is thenable
   */
  Promise.isPromise = function Promise_isPromise(value) {
    return value && typeof value.then === 'function';
  };

  /**
   * Creates resolved promise
   * @param value resolve value
   * @returns {Promise}
   */
  Promise.resolve = function Promise_resolve(value) {
    return new Promise(function (resolve) { resolve(value); });
  };

  /**
   * Creates rejected promise
   * @param reason rejection value
   * @returns {Promise}
   */
  Promise.reject = function Promise_reject(reason) {
    return new Promise(function (resolve, reject) { reject(reason); });
  };

  Promise.prototype = {
    _status: null,
    _value: null,
    _handlers: null,
    _unhandledRejection: null,

    _updateStatus: function Promise__updateStatus(status, value) {
      if (this._status === STATUS_RESOLVED ||
          this._status === STATUS_REJECTED) {
        return;
      }

      if (status === STATUS_RESOLVED &&
          Promise.isPromise(value)) {
        value.then(this._updateStatus.bind(this, STATUS_RESOLVED),
                   this._updateStatus.bind(this, STATUS_REJECTED));
        return;
      }

      this._status = status;
      this._value = value;

      if (status === STATUS_REJECTED && this._handlers.length === 0) {
        this._unhandledRejection = true;
        HandlerManager.addUnhandledRejection(this);
      }

      HandlerManager.scheduleHandlers(this);
    },

    _resolve: function Promise_resolve(value) {
      this._updateStatus(STATUS_RESOLVED, value);
    },

    _reject: function Promise_reject(reason) {
      this._updateStatus(STATUS_REJECTED, reason);
    },

    then: function Promise_then(onResolve, onReject) {
      var nextPromise = new Promise(function (resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;
      });
      this._handlers.push({
        thisPromise: this,
        onResolve: onResolve,
        onReject: onReject,
        nextPromise: nextPromise
      });
      HandlerManager.scheduleHandlers(this);
      return nextPromise;
    },

    catch: function Promise_catch(onReject) {
      return this.then(undefined, onReject);
    }
  };

  globalScope.Promise = Promise;
})();

var StatTimer = (function StatTimerClosure() {
  function rpad(str, pad, length) {
    while (str.length < length) {
      str += pad;
    }
    return str;
  }
  function StatTimer() {
    this.started = {};
    this.times = [];
    this.enabled = true;
  }
  StatTimer.prototype = {
    time: function StatTimer_time(name) {
      if (!this.enabled) {
        return;
      }
      if (name in this.started) {
        warn('Timer is already running for ' + name);
      }
      this.started[name] = Date.now();
    },
    timeEnd: function StatTimer_timeEnd(name) {
      if (!this.enabled) {
        return;
      }
      if (!(name in this.started)) {
        warn('Timer has not been started for ' + name);
      }
      this.times.push({
        'name': name,
        'start': this.started[name],
        'end': Date.now()
      });
      // Remove timer from started so it can be called again.
      delete this.started[name];
    },
    toString: function StatTimer_toString() {
      var i, ii;
      var times = this.times;
      var out = '';
      // Find the longest name for padding purposes.
      var longest = 0;
      for (i = 0, ii = times.length; i < ii; ++i) {
        var name = times[i]['name'];
        if (name.length > longest) {
          longest = name.length;
        }
      }
      for (i = 0, ii = times.length; i < ii; ++i) {
        var span = times[i];
        var duration = span.end - span.start;
        out += rpad(span['name'], ' ', longest) + ' ' + duration + 'ms\n';
      }
      return out;
    }
  };
  return StatTimer;
})();

PDFJS.createBlob = function createBlob(data, contentType) {
  if (typeof Blob !== 'undefined') {
    return new Blob([data], { type: contentType });
  }
  // Blob builder is deprecated in FF14 and removed in FF18.
  var bb = new MozBlobBuilder();
  bb.append(data);
  return bb.getBlob(contentType);
};

PDFJS.createObjectURL = (function createObjectURLClosure() {
  // Blob/createObjectURL is not available, falling back to data schema.
  var digits =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  return function createObjectURL(data, contentType) {
    if (!PDFJS.disableCreateObjectURL &&
        typeof URL !== 'undefined' && URL.createObjectURL) {
      var blob = PDFJS.createBlob(data, contentType);
      return URL.createObjectURL(blob);
    }

    var buffer = 'data:' + contentType + ';base64,';
    for (var i = 0, ii = data.length; i < ii; i += 3) {
      var b1 = data[i] & 0xFF;
      var b2 = data[i + 1] & 0xFF;
      var b3 = data[i + 2] & 0xFF;
      var d1 = b1 >> 2, d2 = ((b1 & 3) << 4) | (b2 >> 4);
      var d3 = i + 1 < ii ? ((b2 & 0xF) << 2) | (b3 >> 6) : 64;
      var d4 = i + 2 < ii ? (b3 & 0x3F) : 64;
      buffer += digits[d1] + digits[d2] + digits[d3] + digits[d4];
    }
    return buffer;
  };
})();

function MessageHandler(name, comObj) {
  this.name = name;
  this.comObj = comObj;
  this.callbackIndex = 1;
  this.postMessageTransfers = true;
  var callbacksCapabilities = this.callbacksCapabilities = {};
  var ah = this.actionHandler = {};

  ah['console_log'] = [function ahConsoleLog(data) {
    console.log.apply(console, data);
  }];
  ah['console_error'] = [function ahConsoleError(data) {
    console.error.apply(console, data);
  }];
  ah['_unsupported_feature'] = [function ah_unsupportedFeature(data) {
    UnsupportedManager.notify(data);
  }];

  comObj.onmessage = function messageHandlerComObjOnMessage(event) {
    var data = event.data;
    if (data.isReply) {
      var callbackId = data.callbackId;
      if (data.callbackId in callbacksCapabilities) {
        var callback = callbacksCapabilities[callbackId];
        delete callbacksCapabilities[callbackId];
        if ('error' in data) {
          callback.reject(data.error);
        } else {
          callback.resolve(data.data);
        }
      } else {
        error('Cannot resolve callback ' + callbackId);
      }
    } else if (data.action in ah) {
      var action = ah[data.action];
      if (data.callbackId) {
        Promise.resolve().then(function () {
          return action[0].call(action[1], data.data);
        }).then(function (result) {
          comObj.postMessage({
            isReply: true,
            callbackId: data.callbackId,
            data: result
          });
        }, function (reason) {
          comObj.postMessage({
            isReply: true,
            callbackId: data.callbackId,
            error: reason
          });
        });
      } else {
        action[0].call(action[1], data.data);
      }
    } else {
      error('Unknown action from worker: ' + data.action);
    }
  };
}

MessageHandler.prototype = {
  on: function messageHandlerOn(actionName, handler, scope) {
    var ah = this.actionHandler;
    if (ah[actionName]) {
      error('There is already an actionName called "' + actionName + '"');
    }
    ah[actionName] = [handler, scope];
  },
  /**
   * Sends a message to the comObj to invoke the action with the supplied data.
   * @param {String} actionName Action to call.
   * @param {JSON} data JSON data to send.
   * @param {Array} [transfers] Optional list of transfers/ArrayBuffers
   */
  send: function messageHandlerSend(actionName, data, transfers) {
    var message = {
      action: actionName,
      data: data
    };
    this.postMessage(message, transfers);
  },
  /**
   * Sends a message to the comObj to invoke the action with the supplied data.
   * Expects that other side will callback with the response.
   * @param {String} actionName Action to call.
   * @param {JSON} data JSON data to send.
   * @param {Array} [transfers] Optional list of transfers/ArrayBuffers.
   * @returns {Promise} Promise to be resolved with response data.
   */
  sendWithPromise:
    function messageHandlerSendWithPromise(actionName, data, transfers) {
    var callbackId = this.callbackIndex++;
    var message = {
      action: actionName,
      data: data,
      callbackId: callbackId
    };
    var capability = createPromiseCapability();
    this.callbacksCapabilities[callbackId] = capability;
    try {
      this.postMessage(message, transfers);
    } catch (e) {
      capability.reject(e);
    }
    return capability.promise;
  },
  /**
   * Sends raw message to the comObj.
   * @private
   * @param message {Object} Raw message.
   * @param transfers List of transfers/ArrayBuffers, or undefined.
   */
  postMessage: function (message, transfers) {
    if (transfers && this.postMessageTransfers) {
      this.comObj.postMessage(message, transfers);
    } else {
      this.comObj.postMessage(message);
    }
  }
};

function loadJpegStream(id, imageUrl, objs) {
  var img = new Image();
  img.onload = (function loadJpegStream_onloadClosure() {
    objs.resolve(id, img);
  });
  img.onerror = (function loadJpegStream_onerrorClosure() {
    objs.resolve(id, null);
    warn('Error during JPEG image loading');
  });
  img.src = imageUrl;
}


/**
 * The maximum allowed image size in total pixels e.g. width * height. Images
 * above this value will not be drawn. Use -1 for no limit.
 * @var {number}
 */
PDFJS.maxImageSize = (PDFJS.maxImageSize === undefined ?
                      -1 : PDFJS.maxImageSize);

/**
 * The url of where the predefined Adobe CMaps are located. Include trailing
 * slash.
 * @var {string}
 */
PDFJS.cMapUrl = (PDFJS.cMapUrl === undefined ? null : PDFJS.cMapUrl);

/**
 * Specifies if CMaps are binary packed.
 * @var {boolean}
 */
PDFJS.cMapPacked = PDFJS.cMapPacked === undefined ? false : PDFJS.cMapPacked;

/*
 * By default fonts are converted to OpenType fonts and loaded via font face
 * rules. If disabled, the font will be rendered using a built in font renderer
 * that constructs the glyphs with primitive path commands.
 * @var {boolean}
 */
PDFJS.disableFontFace = (PDFJS.disableFontFace === undefined ?
                         false : PDFJS.disableFontFace);

/**
 * Path for image resources, mainly for annotation icons. Include trailing
 * slash.
 * @var {string}
 */
PDFJS.imageResourcesPath = (PDFJS.imageResourcesPath === undefined ?
                            '' : PDFJS.imageResourcesPath);

/**
 * Disable the web worker and run all code on the main thread. This will happen
 * automatically if the browser doesn't support workers or sending typed arrays
 * to workers.
 * @var {boolean}
 */
PDFJS.disableWorker = (PDFJS.disableWorker === undefined ?
                       false : PDFJS.disableWorker);

/**
 * Path and filename of the worker file. Required when the worker is enabled in
 * development mode. If unspecified in the production build, the worker will be
 * loaded based on the location of the pdf.js file.
 * @var {string}
 */
PDFJS.workerSrc = (PDFJS.workerSrc === undefined ? null : PDFJS.workerSrc);

/**
 * Disable range request loading of PDF files. When enabled and if the server
 * supports partial content requests then the PDF will be fetched in chunks.
 * Enabled (false) by default.
 * @var {boolean}
 */
PDFJS.disableRange = (PDFJS.disableRange === undefined ?
                      false : PDFJS.disableRange);

/**
 * Disable streaming of PDF file data. By default PDF.js attempts to load PDF
 * in chunks. This default behavior can be disabled.
 * @var {boolean}
 */
PDFJS.disableStream = (PDFJS.disableStream === undefined ?
                       false : PDFJS.disableStream);

/**
 * Disable pre-fetching of PDF file data. When range requests are enabled PDF.js
 * will automatically keep fetching more data even if it isn't needed to display
 * the current page. This default behavior can be disabled.
 * @var {boolean}
 */
PDFJS.disableAutoFetch = (PDFJS.disableAutoFetch === undefined ?
                          false : PDFJS.disableAutoFetch);

/**
 * Enables special hooks for debugging PDF.js.
 * @var {boolean}
 */
PDFJS.pdfBug = (PDFJS.pdfBug === undefined ? false : PDFJS.pdfBug);

/**
 * Enables transfer usage in postMessage for ArrayBuffers.
 * @var {boolean}
 */
PDFJS.postMessageTransfers = (PDFJS.postMessageTransfers === undefined ?
                              true : PDFJS.postMessageTransfers);

/**
 * Disables URL.createObjectURL usage.
 * @var {boolean}
 */
PDFJS.disableCreateObjectURL = (PDFJS.disableCreateObjectURL === undefined ?
                                false : PDFJS.disableCreateObjectURL);

/**
 * Disables WebGL usage.
 * @var {boolean}
 */
PDFJS.disableWebGL = (PDFJS.disableWebGL === undefined ?
                      true : PDFJS.disableWebGL);

/**
 * Enables CSS only zooming.
 * @var {boolean}
 */
PDFJS.useOnlyCssZoom = (PDFJS.useOnlyCssZoom === undefined ?
                        false : PDFJS.useOnlyCssZoom);

/**
 * Controls the logging level.
 * The constants from PDFJS.VERBOSITY_LEVELS should be used:
 * - errors
 * - warnings [default]
 * - infos
 * @var {number}
 */
PDFJS.verbosity = (PDFJS.verbosity === undefined ?
                   PDFJS.VERBOSITY_LEVELS.warnings : PDFJS.verbosity);

/**
 * The maximum supported canvas size in total pixels e.g. width * height. 
 * The default value is 4096 * 4096. Use -1 for no limit.
 * @var {number}
 */
PDFJS.maxCanvasPixels = (PDFJS.maxCanvasPixels === undefined ?
                         16777216 : PDFJS.maxCanvasPixels);

/**
 * Document initialization / loading parameters object.
 *
 * @typedef {Object} DocumentInitParameters
 * @property {string}     url   - The URL of the PDF.
 * @property {TypedArray} data  - A typed array with PDF data.
 * @property {Object}     httpHeaders - Basic authentication headers.
 * @property {boolean}    withCredentials - Indicates whether or not cross-site
 *   Access-Control requests should be made using credentials such as cookies
 *   or authorization headers. The default is false.
 * @property {string}     password - For decrypting password-protected PDFs.
 * @property {TypedArray} initialData - A typed array with the first portion or
 *   all of the pdf data. Used by the extension since some data is already
 *   loaded before the switch to range requests.
 */

/**
 * @typedef {Object} PDFDocumentStats
 * @property {Array} streamTypes - Used stream types in the document (an item
 *   is set to true if specific stream ID was used in the document).
 * @property {Array} fontTypes - Used font type in the document (an item is set
 *   to true if specific font ID was used in the document).
 */

/**
 * This is the main entry point for loading a PDF and interacting with it.
 * NOTE: If a URL is used to fetch the PDF data a standard XMLHttpRequest(XHR)
 * is used, which means it must follow the same origin rules that any XHR does
 * e.g. No cross domain requests without CORS.
 *
 * @param {string|TypedArray|DocumentInitParameters} source Can be a url to
 * where a PDF is located, a typed array (Uint8Array) already populated with
 * data or parameter object.
 *
 * @param {Object} pdfDataRangeTransport is optional. It is used if you want
 * to manually serve range requests for data in the PDF. See viewer.js for
 * an example of pdfDataRangeTransport's interface.
 *
 * @param {function} passwordCallback is optional. It is used to request a
 * password if wrong or no password was provided. The callback receives two
 * parameters: function that needs to be called with new password and reason
 * (see {PasswordResponses}).
 *
 * @param {function} progressCallback is optional. It is used to be able to
 * monitor the loading progress of the PDF file (necessary to implement e.g.
 * a loading bar). The callback receives an {Object} with the properties:
 * {number} loaded and {number} total.
 *
 * @return {Promise} A promise that is resolved with {@link PDFDocumentProxy}
 *   object.
 */
PDFJS.getDocument = function getDocument(source,
                                         pdfDataRangeTransport,
                                         passwordCallback,
                                         progressCallback) {
  var workerInitializedCapability, workerReadyCapability, transport;

  if (typeof source === 'string') {
    source = { url: source };
  } else if (isArrayBuffer(source)) {
    source = { data: source };
  } else if (typeof source !== 'object') {
    error('Invalid parameter in getDocument, need either Uint8Array, ' +
          'string or a parameter object');
  }

  if (!source.url && !source.data) {
    error('Invalid parameter array, need either .data or .url');
  }

  // copy/use all keys as is except 'url' -- full path is required
  var params = {};
  for (var key in source) {
    if (key === 'url' && typeof window !== 'undefined') {
      params[key] = combineUrl(window.location.href, source[key]);
      continue;
    }
    params[key] = source[key];
  }

  workerInitializedCapability = createPromiseCapability();
  workerReadyCapability = createPromiseCapability();
  transport = new WorkerTransport(workerInitializedCapability,
                                  workerReadyCapability, pdfDataRangeTransport,
                                  progressCallback);
  workerInitializedCapability.promise.then(function transportInitialized() {
    transport.passwordCallback = passwordCallback;
    transport.fetchDocument(params);
  });
  return workerReadyCapability.promise;
};

/**
 * Proxy to a PDFDocument in the worker thread. Also, contains commonly used
 * properties that can be read synchronously.
 * @class
 */
var PDFDocumentProxy = (function PDFDocumentProxyClosure() {
  function PDFDocumentProxy(pdfInfo, transport) {
    this.pdfInfo = pdfInfo;
    this.transport = transport;
  }
  PDFDocumentProxy.prototype = /** @lends PDFDocumentProxy.prototype */ {
    /**
     * @return {number} Total number of pages the PDF contains.
     */
    get numPages() {
      return this.pdfInfo.numPages;
    },
    /**
     * @return {string} A unique ID to identify a PDF. Not guaranteed to be
     * unique.
     */
    get fingerprint() {
      return this.pdfInfo.fingerprint;
    },
    /**
     * @param {number} pageNumber The page number to get. The first page is 1.
     * @return {Promise} A promise that is resolved with a {@link PDFPageProxy}
     * object.
     */
    getPage: function PDFDocumentProxy_getPage(pageNumber) {
      return this.transport.getPage(pageNumber);
    },
    /**
     * @param {{num: number, gen: number}} ref The page reference. Must have
     *   the 'num' and 'gen' properties.
     * @return {Promise} A promise that is resolved with the page index that is
     * associated with the reference.
     */
    getPageIndex: function PDFDocumentProxy_getPageIndex(ref) {
      return this.transport.getPageIndex(ref);
    },
    /**
     * @return {Promise} A promise that is resolved with a lookup table for
     * mapping named destinations to reference numbers.
     *
     * This can be slow for large documents: use getDestination instead
     */
    getDestinations: function PDFDocumentProxy_getDestinations() {
      return this.transport.getDestinations();
    },
    /**
     * @param {string} id The named destination to get.
     * @return {Promise} A promise that is resolved with all information
     * of the given named destination.
     */
    getDestination: function PDFDocumentProxy_getDestination(id) {
      return this.transport.getDestination(id);
    },
    /**
     * @return {Promise} A promise that is resolved with a lookup table for
     * mapping named attachments to their content.
     */
    getAttachments: function PDFDocumentProxy_getAttachments() {
      return this.transport.getAttachments();
    },
    /**
     * @return {Promise} A promise that is resolved with an array of all the
     * JavaScript strings in the name tree.
     */
    getJavaScript: function PDFDocumentProxy_getJavaScript() {
      return this.transport.getJavaScript();
    },
    /**
     * @return {Promise} A promise that is resolved with an {Array} that is a
     * tree outline (if it has one) of the PDF. The tree is in the format of:
     * [
     *  {
     *   title: string,
     *   bold: boolean,
     *   italic: boolean,
     *   color: rgb array,
     *   dest: dest obj,
     *   items: array of more items like this
     *  },
     *  ...
     * ].
     */
    getOutline: function PDFDocumentProxy_getOutline() {
      return this.transport.getOutline();
    },
    /**
     * @return {Promise} A promise that is resolved with an {Object} that has
     * info and metadata properties.  Info is an {Object} filled with anything
     * available in the information dictionary and similarly metadata is a
     * {Metadata} object with information from the metadata section of the PDF.
     */
    getMetadata: function PDFDocumentProxy_getMetadata() {
      return this.transport.getMetadata();
    },
    /**
     * @return {Promise} A promise that is resolved with a TypedArray that has
     * the raw data from the PDF.
     */
    getData: function PDFDocumentProxy_getData() {
      return this.transport.getData();
    },
    /**
     * @return {Promise} A promise that is resolved when the document's data
     * is loaded. It is resolved with an {Object} that contains the length
     * property that indicates size of the PDF data in bytes.
     */
    getDownloadInfo: function PDFDocumentProxy_getDownloadInfo() {
      return this.transport.downloadInfoCapability.promise;
    },
    /**
     * @returns {Promise} A promise this is resolved with current stats about
     * document structures (see {@link PDFDocumentStats}).
     */
    getStats: function PDFDocumentProxy_getStats() {
      return this.transport.getStats();
    },
    /**
     * Cleans up resources allocated by the document, e.g. created @font-face.
     */
    cleanup: function PDFDocumentProxy_cleanup() {
      this.transport.startCleanup();
    },
    /**
     * Destroys current document instance and terminates worker.
     */
    destroy: function PDFDocumentProxy_destroy() {
      this.transport.destroy();
    }
  };
  return PDFDocumentProxy;
})();

/**
 * Page text content.
 *
 * @typedef {Object} TextContent
 * @property {array} items - array of {@link TextItem}
 * @property {Object} styles - {@link TextStyles} objects, indexed by font
 *                    name.
 */

/**
 * Page text content part.
 *
 * @typedef {Object} TextItem
 * @property {string} str - text content.
 * @property {string} dir - text direction: 'ttb', 'ltr' or 'rtl'.
 * @property {array} transform - transformation matrix.
 * @property {number} width - width in device space.
 * @property {number} height - height in device space.
 * @property {string} fontName - font name used by pdf.js for converted font.
 */

/**
 * Text style.
 *
 * @typedef {Object} TextStyle
 * @property {number} ascent - font ascent.
 * @property {number} descent - font descent.
 * @property {boolean} vertical - text is in vertical mode.
 * @property {string} fontFamily - possible font family
 */

/**
 * Page render parameters.
 *
 * @typedef {Object} RenderParameters
 * @property {Object} canvasContext - A 2D context of a DOM Canvas object.
 * @property {PDFJS.PageViewport} viewport - Rendering viewport obtained by
 *                                calling of PDFPage.getViewport method.
 * @property {string} intent - Rendering intent, can be 'display' or 'print'
 *                    (default value is 'display').
 * @property {Object} imageLayer - (optional) An object that has beginLayout,
 *                    endLayout and appendImage functions.
 * @property {function} continueCallback - (optional) A function that will be
 *                      called each time the rendering is paused.  To continue
 *                      rendering call the function that is the first argument
 *                      to the callback.
 */
 
/**
 * PDF page operator list.
 *
 * @typedef {Object} PDFOperatorList
 * @property {Array} fnArray - Array containing the operator functions.
 * @property {Array} argsArray - Array containing the arguments of the
 *                               functions.
 */

/**
 * Proxy to a PDFPage in the worker thread.
 * @class
 */
var PDFPageProxy = (function PDFPageProxyClosure() {
  function PDFPageProxy(pageIndex, pageInfo, transport) {
    this.pageIndex = pageIndex;
    this.pageInfo = pageInfo;
    this.transport = transport;
    this.stats = new StatTimer();
    this.stats.enabled = !!globalScope.PDFJS.enableStats;
    this.commonObjs = transport.commonObjs;
    this.objs = new PDFObjects();
    this.cleanupAfterRender = false;
    this.pendingDestroy = false;
    this.intentStates = {};
  }
  PDFPageProxy.prototype = /** @lends PDFPageProxy.prototype */ {
    /**
     * @return {number} Page number of the page. First page is 1.
     */
    get pageNumber() {
      return this.pageIndex + 1;
    },
    /**
     * @return {number} The number of degrees the page is rotated clockwise.
     */
    get rotate() {
      return this.pageInfo.rotate;
    },
    /**
     * @return {Object} The reference that points to this page. It has 'num' and
     * 'gen' properties.
     */
    get ref() {
      return this.pageInfo.ref;
    },
    /**
     * @return {Array} An array of the visible portion of the PDF page in the
     * user space units - [x1, y1, x2, y2].
     */
    get view() {
      return this.pageInfo.view;
    },
    /**
     * @param {number} scale The desired scale of the viewport.
     * @param {number} rotate Degrees to rotate the viewport. If omitted this
     * defaults to the page rotation.
     * @return {PDFJS.PageViewport} Contains 'width' and 'height' properties
     * along with transforms required for rendering.
     */
    getViewport: function PDFPageProxy_getViewport(scale, rotate) {
      if (arguments.length < 2) {
        rotate = this.rotate;
      }
      return new PDFJS.PageViewport(this.view, scale, rotate, 0, 0);
    },
    /**
     * @return {Promise} A promise that is resolved with an {Array} of the
     * annotation objects.
     */
    getAnnotations: function PDFPageProxy_getAnnotations() {
      if (this.annotationsPromise) {
        return this.annotationsPromise;
      }

      var promise = this.transport.getAnnotations(this.pageIndex);
      this.annotationsPromise = promise;
      return promise;
    },
    /**
     * Begins the process of rendering a page to the desired context.
     * @param {RenderParameters} params Page render parameters.
     * @return {RenderTask} An object that contains the promise, which
     *                      is resolved when the page finishes rendering.
     */
    render: function PDFPageProxy_render(params) {
      var stats = this.stats;
      stats.time('Overall');

      // If there was a pending destroy cancel it so no cleanup happens during
      // this call to render.
      this.pendingDestroy = false;

      var renderingIntent = (params.intent === 'print' ? 'print' : 'display');

      if (!this.intentStates[renderingIntent]) {
        this.intentStates[renderingIntent] = {};
      }
      var intentState = this.intentStates[renderingIntent];

      // If there's no displayReadyCapability yet, then the operatorList
      // was never requested before. Make the request and create the promise.
      if (!intentState.displayReadyCapability) {
        intentState.receivingOperatorList = true;
        intentState.displayReadyCapability = createPromiseCapability();
        intentState.operatorList = {
          fnArray: [],
          argsArray: [],
          lastChunk: false
        };

        this.stats.time('Page Request');
        this.transport.messageHandler.send('RenderPageRequest', {
          pageIndex: this.pageNumber - 1,
          intent: renderingIntent
        });
      }

      var internalRenderTask = new InternalRenderTask(complete, params,
                                                      this.objs,
                                                      this.commonObjs,
                                                      intentState.operatorList,
                                                      this.pageNumber);
      if (!intentState.renderTasks) {
        intentState.renderTasks = [];
      }
      intentState.renderTasks.push(internalRenderTask);
      var renderTask = new RenderTask(internalRenderTask);

      var self = this;
      intentState.displayReadyCapability.promise.then(
        function pageDisplayReadyPromise(transparency) {
          if (self.pendingDestroy) {
            complete();
            return;
          }
          stats.time('Rendering');
          internalRenderTask.initalizeGraphics(transparency);
          internalRenderTask.operatorListChanged();
        },
        function pageDisplayReadPromiseError(reason) {
          complete(reason);
        }
      );

      function complete(error) {
        var i = intentState.renderTasks.indexOf(internalRenderTask);
        if (i >= 0) {
          intentState.renderTasks.splice(i, 1);
        }

        if (self.cleanupAfterRender) {
          self.pendingDestroy = true;
        }
        self._tryDestroy();

        if (error) {
          internalRenderTask.capability.reject(error);
        } else {
          internalRenderTask.capability.resolve();
        }
        stats.timeEnd('Rendering');
        stats.timeEnd('Overall');
      }

      return renderTask;
    },

    /**
     * @return {Promise} A promise resolved with an {@link PDFOperatorList}
     * object that represents page's operator list.
     */
    getOperatorList: function PDFPageProxy_getOperatorList() {
      function operatorListChanged() {
        if (intentState.operatorList.lastChunk) {
          intentState.opListReadCapability.resolve(intentState.operatorList);
        }
      }

      var renderingIntent = 'oplist';
      if (!this.intentStates[renderingIntent]) {
        this.intentStates[renderingIntent] = {};
      }
      var intentState = this.intentStates[renderingIntent];

      if (!intentState.opListReadCapability) {
        var opListTask = {};
        opListTask.operatorListChanged = operatorListChanged;
        intentState.receivingOperatorList = true;
        intentState.opListReadCapability = createPromiseCapability();
        intentState.renderTasks = [];
        intentState.renderTasks.push(opListTask);
        intentState.operatorList = {
          fnArray: [],
          argsArray: [],
          lastChunk: false
        };

        this.transport.messageHandler.send('RenderPageRequest', {
          pageIndex: this.pageIndex,
          intent: renderingIntent
        });
      }
      return intentState.opListReadCapability.promise;
    },

    /**
     * @return {Promise} That is resolved a {@link TextContent}
     * object that represent the page text content.
     */
    getTextContent: function PDFPageProxy_getTextContent() {
      return this.transport.messageHandler.sendWithPromise('GetTextContent', {
        pageIndex: this.pageNumber - 1
      });
    },
    /**
     * Destroys resources allocated by the page.
     */
    destroy: function PDFPageProxy_destroy() {
      this.pendingDestroy = true;
      this._tryDestroy();
    },
    /**
     * For internal use only. Attempts to clean up if rendering is in a state
     * where that's possible.
     * @ignore
     */
    _tryDestroy: function PDFPageProxy__destroy() {
      if (!this.pendingDestroy ||
          Object.keys(this.intentStates).some(function(intent) {
            var intentState = this.intentStates[intent];
            return (intentState.renderTasks.length !== 0 ||
                    intentState.receivingOperatorList);
          }, this)) {
        return;
      }

      Object.keys(this.intentStates).forEach(function(intent) {
        delete this.intentStates[intent];
      }, this);
      this.objs.clear();
      this.annotationsPromise = null;
      this.pendingDestroy = false;
    },
    /**
     * For internal use only.
     * @ignore
     */
    _startRenderPage: function PDFPageProxy_startRenderPage(transparency,
                                                            intent) {
      var intentState = this.intentStates[intent];
      // TODO Refactor RenderPageRequest to separate rendering
      // and operator list logic
      if (intentState.displayReadyCapability) {
        intentState.displayReadyCapability.resolve(transparency);
      }
    },
    /**
     * For internal use only.
     * @ignore
     */
    _renderPageChunk: function PDFPageProxy_renderPageChunk(operatorListChunk,
                                                            intent) {
      var intentState = this.intentStates[intent];
      var i, ii;
      // Add the new chunk to the current operator list.
      for (i = 0, ii = operatorListChunk.length; i < ii; i++) {
        intentState.operatorList.fnArray.push(operatorListChunk.fnArray[i]);
        intentState.operatorList.argsArray.push(
          operatorListChunk.argsArray[i]);
      }
      intentState.operatorList.lastChunk = operatorListChunk.lastChunk;

      // Notify all the rendering tasks there are more operators to be consumed.
      for (i = 0; i < intentState.renderTasks.length; i++) {
        intentState.renderTasks[i].operatorListChanged();
      }

      if (operatorListChunk.lastChunk) {
        intentState.receivingOperatorList = false;
        this._tryDestroy();
      }
    }
  };
  return PDFPageProxy;
})();

/**
 * For internal use only.
 * @ignore
 */
var WorkerTransport = (function WorkerTransportClosure() {
  function WorkerTransport(workerInitializedCapability, workerReadyCapability,
                           pdfDataRangeTransport, progressCallback) {
    this.pdfDataRangeTransport = pdfDataRangeTransport;

    this.workerInitializedCapability = workerInitializedCapability;
    this.workerReadyCapability = workerReadyCapability;
    this.progressCallback = progressCallback;
    this.commonObjs = new PDFObjects();

    this.pageCache = [];
    this.pagePromises = [];
    this.downloadInfoCapability = createPromiseCapability();
    this.passwordCallback = null;

    // If worker support isn't disabled explicit and the browser has worker
    // support, create a new web worker and test if it/the browser fullfills
    // all requirements to run parts of pdf.js in a web worker.
    // Right now, the requirement is, that an Uint8Array is still an Uint8Array
    // as it arrives on the worker. Chrome added this with version 15.
    // Either workers are disabled, not supported or have thrown an exception.
    // Thus, we fallback to a faked worker.
    this.setupFakeWorker();
  }
  WorkerTransport.prototype = {
    destroy: function WorkerTransport_destroy() {
      this.pageCache = [];
      this.pagePromises = [];
      var self = this;
      this.messageHandler.sendWithPromise('Terminate', null).then(function () {
        FontLoader.clear();
        if (self.worker) {
          self.worker.terminate();
        }
      });
    },

    setupFakeWorker: function WorkerTransport_setupFakeWorker() {
      globalScope.PDFJS.disableWorker = true;

      if (!PDFJS.fakeWorkerFilesLoadedCapability) {
        PDFJS.fakeWorkerFilesLoadedCapability = createPromiseCapability();
        // In the developer build load worker_loader which in turn loads all the
        // other files and resolves the promise. In production only the
        // pdf.worker.js file is needed.
        PDFJS.fakeWorkerFilesLoadedCapability.resolve();
      }
      PDFJS.fakeWorkerFilesLoadedCapability.promise.then(function () {
        warn('Setting up fake worker.');
        // If we don't use a worker, just post/sendMessage to the main thread.
        var fakeWorker = {
          postMessage: function WorkerTransport_postMessage(obj) {
            fakeWorker.onmessage({data: obj});
          },
          terminate: function WorkerTransport_terminate() {}
        };

        var messageHandler = new MessageHandler('main', fakeWorker);
        this.setupMessageHandler(messageHandler);

        // If the main thread is our worker, setup the handling for the messages
        // the main thread sends to it self.
        PDFJS.WorkerMessageHandler.setup(messageHandler);

        this.workerInitializedCapability.resolve();
      }.bind(this));
    },

    setupMessageHandler:
      function WorkerTransport_setupMessageHandler(messageHandler) {
      this.messageHandler = messageHandler;

      function updatePassword(password) {
        messageHandler.send('UpdatePassword', password);
      }

      var pdfDataRangeTransport = this.pdfDataRangeTransport;
      if (pdfDataRangeTransport) {
        pdfDataRangeTransport.addRangeListener(function(begin, chunk) {
          messageHandler.send('OnDataRange', {
            begin: begin,
            chunk: chunk
          });
        });

        pdfDataRangeTransport.addProgressListener(function(loaded) {
          messageHandler.send('OnDataProgress', {
            loaded: loaded
          });
        });

        pdfDataRangeTransport.addProgressiveReadListener(function(chunk) {
          messageHandler.send('OnDataRange', {
            chunk: chunk
          });
        });

        messageHandler.on('RequestDataRange',
          function transportDataRange(data) {
            pdfDataRangeTransport.requestDataRange(data.begin, data.end);
          }, this);
      }

      messageHandler.on('GetDoc', function transportDoc(data) {
        var pdfInfo = data.pdfInfo;
        this.numPages = data.pdfInfo.numPages;
        var pdfDocument = new PDFDocumentProxy(pdfInfo, this);
        this.pdfDocument = pdfDocument;
        this.workerReadyCapability.resolve(pdfDocument);
      }, this);

      messageHandler.on('NeedPassword',
                        function transportNeedPassword(exception) {
        if (this.passwordCallback) {
          return this.passwordCallback(updatePassword,
                                       PasswordResponses.NEED_PASSWORD);
        }
        this.workerReadyCapability.reject(
          new PasswordException(exception.message, exception.code));
      }, this);

      messageHandler.on('IncorrectPassword',
                        function transportIncorrectPassword(exception) {
        if (this.passwordCallback) {
          return this.passwordCallback(updatePassword,
                                       PasswordResponses.INCORRECT_PASSWORD);
        }
        this.workerReadyCapability.reject(
          new PasswordException(exception.message, exception.code));
      }, this);

      messageHandler.on('InvalidPDF', function transportInvalidPDF(exception) {
        this.workerReadyCapability.reject(
          new InvalidPDFException(exception.message));
      }, this);

      messageHandler.on('MissingPDF', function transportMissingPDF(exception) {
        this.workerReadyCapability.reject(
          new MissingPDFException(exception.message));
      }, this);

      messageHandler.on('UnexpectedResponse',
                        function transportUnexpectedResponse(exception) {
        this.workerReadyCapability.reject(
          new UnexpectedResponseException(exception.message, exception.status));
      }, this);

      messageHandler.on('UnknownError',
                        function transportUnknownError(exception) {
        this.workerReadyCapability.reject(
          new UnknownErrorException(exception.message, exception.details));
      }, this);

      messageHandler.on('DataLoaded', function transportPage(data) {
        this.downloadInfoCapability.resolve(data);
      }, this);

      messageHandler.on('PDFManagerReady', function transportPage(data) {
        if (this.pdfDataRangeTransport) {
          this.pdfDataRangeTransport.transportReady();
        }
      }, this);

      messageHandler.on('StartRenderPage', function transportRender(data) {
        var page = this.pageCache[data.pageIndex];

        page.stats.timeEnd('Page Request');
        page._startRenderPage(data.transparency, data.intent);
      }, this);

      messageHandler.on('RenderPageChunk', function transportRender(data) {
        var page = this.pageCache[data.pageIndex];

        page._renderPageChunk(data.operatorList, data.intent);
      }, this);

      messageHandler.on('commonobj', function transportObj(data) {
        var id = data[0];
        var type = data[1];
        if (this.commonObjs.hasData(id)) {
          return;
        }

        switch (type) {
          case 'Font':
            var exportedData = data[2];

            var font;
            if ('error' in exportedData) {
              var error = exportedData.error;
              warn('Error during font loading: ' + error);
              this.commonObjs.resolve(id, error);
              break;
            } else {
              font = new FontFaceObject(exportedData);
            }

            FontLoader.bind(
              [font],
              function fontReady(fontObjs) {
                this.commonObjs.resolve(id, font);
              }.bind(this)
            );
            break;
          case 'FontPath':
            this.commonObjs.resolve(id, data[2]);
            break;
          default:
            error('Got unknown common object type ' + type);
        }
      }, this);

      messageHandler.on('obj', function transportObj(data) {
        var id = data[0];
        var pageIndex = data[1];
        var type = data[2];
        var pageProxy = this.pageCache[pageIndex];
        var imageData;
        if (pageProxy.objs.hasData(id)) {
          return;
        }

        switch (type) {
          case 'JpegStream':
            imageData = data[3];
            loadJpegStream(id, imageData, pageProxy.objs);
            break;
          case 'Image':
            imageData = data[3];
            pageProxy.objs.resolve(id, imageData);

            // heuristics that will allow not to store large data
            var MAX_IMAGE_SIZE_TO_STORE = 8000000;
            if (imageData && 'data' in imageData &&
                imageData.data.length > MAX_IMAGE_SIZE_TO_STORE) {
              pageProxy.cleanupAfterRender = true;
            }
            break;
          default:
            error('Got unknown object type ' + type);
        }
      }, this);

      messageHandler.on('DocProgress', function transportDocProgress(data) {
        if (this.progressCallback) {
          this.progressCallback({
            loaded: data.loaded,
            total: data.total
          });
        }
      }, this);

      messageHandler.on('PageError', function transportError(data) {
        var page = this.pageCache[data.pageNum - 1];
        var intentState = page.intentStates[data.intent];
        if (intentState.displayReadyCapability) {
          intentState.displayReadyCapability.reject(data.error);
        } else {
          error(data.error);
        }
      }, this);

      messageHandler.on('JpegDecode', function(data) {
        var imageUrl = data[0];
        var components = data[1];
        if (components !== 3 && components !== 1) {
          return Promise.reject(
            new Error('Only 3 components or 1 component can be returned'));
        }

        return new Promise(function (resolve, reject) {
          var img = new Image();
          img.onload = function () {
            var width = img.width;
            var height = img.height;
            var size = width * height;
            var rgbaLength = size * 4;
            var buf = new Uint8Array(size * components);
            var tmpCanvas = createScratchCanvas(width, height);
            var tmpCtx = tmpCanvas.getContext('2d');
            tmpCtx.drawImage(img, 0, 0);
            var data = tmpCtx.getImageData(0, 0, width, height).data;
            var i, j;

            if (components === 3) {
              for (i = 0, j = 0; i < rgbaLength; i += 4, j += 3) {
                buf[j] = data[i];
                buf[j + 1] = data[i + 1];
                buf[j + 2] = data[i + 2];
              }
            } else if (components === 1) {
              for (i = 0, j = 0; i < rgbaLength; i += 4, j++) {
                buf[j] = data[i];
              }
            }
            resolve({ data: buf, width: width, height: height});
          };
          img.onerror = function () {
            reject(new Error('JpegDecode failed to load image'));
          };
          img.src = imageUrl;
        });
      });
    },

    fetchDocument: function WorkerTransport_fetchDocument(source) {
      source.disableAutoFetch = PDFJS.disableAutoFetch;
      source.disableStream = PDFJS.disableStream;
      source.chunkedViewerLoading = !!this.pdfDataRangeTransport;
      this.messageHandler.send('GetDocRequest', {
        source: source,
        disableRange: PDFJS.disableRange,
        maxImageSize: PDFJS.maxImageSize,
        cMapUrl: PDFJS.cMapUrl,
        cMapPacked: PDFJS.cMapPacked,
        disableFontFace: PDFJS.disableFontFace,
        disableCreateObjectURL: PDFJS.disableCreateObjectURL,
        verbosity: PDFJS.verbosity
      });
    },

    getData: function WorkerTransport_getData() {
      return this.messageHandler.sendWithPromise('GetData', null);
    },

    getPage: function WorkerTransport_getPage(pageNumber, capability) {
      if (pageNumber <= 0 || pageNumber > this.numPages ||
          (pageNumber|0) !== pageNumber) {
        return Promise.reject(new Error('Invalid page request'));
      }

      var pageIndex = pageNumber - 1;
      if (pageIndex in this.pagePromises) {
        return this.pagePromises[pageIndex];
      }
      var promise = this.messageHandler.sendWithPromise('GetPage', {
        pageIndex: pageIndex
      }).then(function (pageInfo) {
        var page = new PDFPageProxy(pageIndex, pageInfo, this);
        this.pageCache[pageIndex] = page;
        return page;
      }.bind(this));
      this.pagePromises[pageIndex] = promise;
      return promise;
    },

    getPageIndex: function WorkerTransport_getPageIndexByRef(ref) {
      return this.messageHandler.sendWithPromise('GetPageIndex', { ref: ref });
    },

    getAnnotations: function WorkerTransport_getAnnotations(pageIndex) {
      return this.messageHandler.sendWithPromise('GetAnnotations',
        { pageIndex: pageIndex });
    },

    getDestinations: function WorkerTransport_getDestinations() {
      return this.messageHandler.sendWithPromise('GetDestinations', null);
    },

    getDestination: function WorkerTransport_getDestination(id) {
      return this.messageHandler.sendWithPromise('GetDestination', { id: id } );
    },

    getAttachments: function WorkerTransport_getAttachments() {
      return this.messageHandler.sendWithPromise('GetAttachments', null);
    },

    getJavaScript: function WorkerTransport_getJavaScript() {
      return this.messageHandler.sendWithPromise('GetJavaScript', null);
    },

    getOutline: function WorkerTransport_getOutline() {
      return this.messageHandler.sendWithPromise('GetOutline', null);
    },

    getMetadata: function WorkerTransport_getMetadata() {
      return this.messageHandler.sendWithPromise('GetMetadata', null).
        then(function transportMetadata(results) {
        return {
          info: results[0],
          metadata: (results[1] ? new PDFJS.Metadata(results[1]) : null)
        };
      });
    },

    getStats: function WorkerTransport_getStats() {
      return this.messageHandler.sendWithPromise('GetStats', null);
    },

    startCleanup: function WorkerTransport_startCleanup() {
      this.messageHandler.sendWithPromise('Cleanup', null).
        then(function endCleanup() {
        for (var i = 0, ii = this.pageCache.length; i < ii; i++) {
          var page = this.pageCache[i];
          if (page) {
            page.destroy();
          }
        }
        this.commonObjs.clear();
        FontLoader.clear();
      }.bind(this));
    }
  };
  return WorkerTransport;

})();

/**
 * A PDF document and page is built of many objects. E.g. there are objects
 * for fonts, images, rendering code and such. These objects might get processed
 * inside of a worker. The `PDFObjects` implements some basic functions to
 * manage these objects.
 * @ignore
 */
var PDFObjects = (function PDFObjectsClosure() {
  function PDFObjects() {
    this.objs = {};
  }

  PDFObjects.prototype = {
    /**
     * Internal function.
     * Ensures there is an object defined for `objId`.
     */
    ensureObj: function PDFObjects_ensureObj(objId) {
      if (this.objs[objId]) {
        return this.objs[objId];
      }

      var obj = {
        capability: createPromiseCapability(),
        data: null,
        resolved: false
      };
      this.objs[objId] = obj;

      return obj;
    },

    /**
     * If called *without* callback, this returns the data of `objId` but the
     * object needs to be resolved. If it isn't, this function throws.
     *
     * If called *with* a callback, the callback is called with the data of the
     * object once the object is resolved. That means, if you call this
     * function and the object is already resolved, the callback gets called
     * right away.
     */
    get: function PDFObjects_get(objId, callback) {
      // If there is a callback, then the get can be async and the object is
      // not required to be resolved right now
      if (callback) {
        this.ensureObj(objId).capability.promise.then(callback);
        return null;
      }

      // If there isn't a callback, the user expects to get the resolved data
      // directly.
      var obj = this.objs[objId];

      // If there isn't an object yet or the object isn't resolved, then the
      // data isn't ready yet!
      if (!obj || !obj.resolved) {
        error('Requesting object that isn\'t resolved yet ' + objId);
      }

      return obj.data;
    },

    /**
     * Resolves the object `objId` with optional `data`.
     */
    resolve: function PDFObjects_resolve(objId, data) {
      var obj = this.ensureObj(objId);

      obj.resolved = true;
      obj.data = data;
      obj.capability.resolve(data);
    },

    isResolved: function PDFObjects_isResolved(objId) {
      var objs = this.objs;

      if (!objs[objId]) {
        return false;
      } else {
        return objs[objId].resolved;
      }
    },

    hasData: function PDFObjects_hasData(objId) {
      return this.isResolved(objId);
    },

    /**
     * Returns the data of `objId` if object exists, null otherwise.
     */
    getData: function PDFObjects_getData(objId) {
      var objs = this.objs;
      if (!objs[objId] || !objs[objId].resolved) {
        return null;
      } else {
        return objs[objId].data;
      }
    },

    clear: function PDFObjects_clear() {
      this.objs = {};
    }
  };
  return PDFObjects;
})();

/**
 * Allows controlling of the rendering tasks.
 * @class
 */
var RenderTask = (function RenderTaskClosure() {
  function RenderTask(internalRenderTask) {
    this.internalRenderTask = internalRenderTask;
    /**
     * Promise for rendering task completion.
     * @type {Promise}
     */
    this.promise = this.internalRenderTask.capability.promise;
  }

  RenderTask.prototype = /** @lends RenderTask.prototype */ {
    /**
     * Cancels the rendering task. If the task is currently rendering it will
     * not be cancelled until graphics pauses with a timeout. The promise that
     * this object extends will resolved when cancelled.
     */
    cancel: function RenderTask_cancel() {
      this.internalRenderTask.cancel();
    },

    /**
     * Registers callback to indicate the rendering task completion.
     *
     * @param {function} onFulfilled The callback for the rendering completion.
     * @param {function} onRejected The callback for the rendering failure.
     * @return {Promise} A promise that is resolved after the onFulfilled or
     *                   onRejected callback.
     */
    then: function RenderTask_then(onFulfilled, onRejected) {
      return this.promise.then(onFulfilled, onRejected);
    }
  };

  return RenderTask;
})();

/**
 * For internal use only.
 * @ignore
 */
var InternalRenderTask = (function InternalRenderTaskClosure() {

  function InternalRenderTask(callback, params, objs, commonObjs, operatorList,
                              pageNumber) {
    this.callback = callback;
    this.params = params;
    this.objs = objs;
    this.commonObjs = commonObjs;
    this.operatorListIdx = null;
    this.operatorList = operatorList;
    this.pageNumber = pageNumber;
    this.running = false;
    this.graphicsReadyCallback = null;
    this.graphicsReady = false;
    this.cancelled = false;
    this.capability = createPromiseCapability();
    // caching this-bound methods
    this._continueBound = this._continue.bind(this);
    this._scheduleNextBound = this._scheduleNext.bind(this);
    this._nextBound = this._next.bind(this);
  }

  InternalRenderTask.prototype = {

    initalizeGraphics:
        function InternalRenderTask_initalizeGraphics(transparency) {

      if (this.cancelled) {
        return;
      }
      if (PDFJS.pdfBug && 'StepperManager' in globalScope &&
          globalScope.StepperManager.enabled) {
        this.stepper = globalScope.StepperManager.create(this.pageNumber - 1);
        this.stepper.init(this.operatorList);
        this.stepper.nextBreakPoint = this.stepper.getNextBreakPoint();
      }

      var params = this.params;
      this.gfx = new CanvasGraphics(params.canvasContext, this.commonObjs,
                                    this.objs, params.imageLayer);

      this.gfx.beginDrawing(params.viewport, transparency);
      this.operatorListIdx = 0;
      this.graphicsReady = true;
      if (this.graphicsReadyCallback) {
        this.graphicsReadyCallback();
      }
    },

    cancel: function InternalRenderTask_cancel() {
      this.running = false;
      this.cancelled = true;
      this.callback('cancelled');
    },

    operatorListChanged: function InternalRenderTask_operatorListChanged() {
      if (!this.graphicsReady) {
        if (!this.graphicsReadyCallback) {
          this.graphicsReadyCallback = this._continueBound;
        }
        return;
      }

      if (this.stepper) {
        this.stepper.updateOperatorList(this.operatorList);
      }

      if (this.running) {
        return;
      }
      this._continue();
    },

    _continue: function InternalRenderTask__continue() {
      this.running = true;
      if (this.cancelled) {
        return;
      }
      if (this.params.continueCallback) {
        this.params.continueCallback(this._scheduleNextBound);
      } else {
        this._scheduleNext();
      }
    },

    _scheduleNext: function InternalRenderTask__scheduleNext() {
      window.requestAnimationFrame(this._nextBound);
    },

    _next: function InternalRenderTask__next() {
      if (this.cancelled) {
        return;
      }
      this.operatorListIdx = this.gfx.executeOperatorList(this.operatorList,
                                        this.operatorListIdx,
                                        this._continueBound,
                                        this.stepper);
      if (this.operatorListIdx === this.operatorList.argsArray.length) {
        this.running = false;
        if (this.operatorList.lastChunk) {
          this.gfx.endDrawing();
          this.callback();
        }
      }
    }

  };

  return InternalRenderTask;
})();


var Metadata = PDFJS.Metadata = (function MetadataClosure() {
  function fixMetadata(meta) {
    return meta.replace(/>\\376\\377([^<]+)/g, function(all, codes) {
      var bytes = codes.replace(/\\([0-3])([0-7])([0-7])/g,
                                function(code, d1, d2, d3) {
        return String.fromCharCode(d1 * 64 + d2 * 8 + d3 * 1);
      });
      var chars = '';
      for (var i = 0; i < bytes.length; i += 2) {
        var code = bytes.charCodeAt(i) * 256 + bytes.charCodeAt(i + 1);
        chars += code >= 32 && code < 127 && code !== 60 && code !== 62 &&
          code !== 38 && false ? String.fromCharCode(code) :
          '&#x' + (0x10000 + code).toString(16).substring(1) + ';';
      }
      return '>' + chars;
    });
  }

  function Metadata(meta) {
    if (typeof meta === 'string') {
      // Ghostscript produces invalid metadata
      meta = fixMetadata(meta);

      var parser = new DOMParser();
      meta = parser.parseFromString(meta, 'application/xml');
    } else if (!(meta instanceof Document)) {
      error('Metadata: Invalid metadata object');
    }

    this.metaDocument = meta;
    this.metadata = {};
    this.parse();
  }

  Metadata.prototype = {
    parse: function Metadata_parse() {
      var doc = this.metaDocument;
      var rdf = doc.documentElement;

      if (rdf.nodeName.toLowerCase() !== 'rdf:rdf') { // Wrapped in <xmpmeta>
        rdf = rdf.firstChild;
        while (rdf && rdf.nodeName.toLowerCase() !== 'rdf:rdf') {
          rdf = rdf.nextSibling;
        }
      }

      var nodeName = (rdf) ? rdf.nodeName.toLowerCase() : null;
      if (!rdf || nodeName !== 'rdf:rdf' || !rdf.hasChildNodes()) {
        return;
      }

      var children = rdf.childNodes, desc, entry, name, i, ii, length, iLength;
      for (i = 0, length = children.length; i < length; i++) {
        desc = children[i];
        if (desc.nodeName.toLowerCase() !== 'rdf:description') {
          continue;
        }

        for (ii = 0, iLength = desc.childNodes.length; ii < iLength; ii++) {
          if (desc.childNodes[ii].nodeName.toLowerCase() !== '#text') {
            entry = desc.childNodes[ii];
            name = entry.nodeName.toLowerCase();
            this.metadata[name] = entry.textContent.trim();
          }
        }
      }
    },

    get: function Metadata_get(name) {
      return this.metadata[name] || null;
    },

    has: function Metadata_has(name) {
      return typeof this.metadata[name] !== 'undefined';
    }
  };

  return Metadata;
})();


// <canvas> contexts store most of the state we need natively.
// However, PDF needs a bit more state, which we store here.

// Minimal font size that would be used during canvas fillText operations.
var MIN_FONT_SIZE = 16;
var MAX_GROUP_SIZE = 4096;

var COMPILE_TYPE3_GLYPHS = true;

function createScratchCanvas(width, height) {
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function addContextCurrentTransform(ctx) {
  // If the context doesn't expose a `mozCurrentTransform`, add a JS based on.
  if (!ctx.mozCurrentTransform) {
    // Store the original context
    ctx._scaleX = ctx._scaleX || 1.0;
    ctx._scaleY = ctx._scaleY || 1.0;
    ctx._originalSave = ctx.save;
    ctx._originalRestore = ctx.restore;
    ctx._originalRotate = ctx.rotate;
    ctx._originalScale = ctx.scale;
    ctx._originalTranslate = ctx.translate;
    ctx._originalTransform = ctx.transform;
    ctx._originalSetTransform = ctx.setTransform;

    ctx._transformMatrix = [ctx._scaleX, 0, 0, ctx._scaleY, 0, 0];
    ctx._transformStack = [];

    Object.defineProperty(ctx, 'mozCurrentTransform', {
      get: function getCurrentTransform() {
        return this._transformMatrix;
      }
    });

    Object.defineProperty(ctx, 'mozCurrentTransformInverse', {
      get: function getCurrentTransformInverse() {
        // Calculation done using WolframAlpha:
        // http://www.wolframalpha.com/input/?
        //   i=Inverse+{{a%2C+c%2C+e}%2C+{b%2C+d%2C+f}%2C+{0%2C+0%2C+1}}

        var m = this._transformMatrix;
        var a = m[0], b = m[1], c = m[2], d = m[3], e = m[4], f = m[5];

        var ad_bc = a * d - b * c;
        var bc_ad = b * c - a * d;

        return [
          d / ad_bc,
          b / bc_ad,
          c / bc_ad,
          a / ad_bc,
          (d * e - c * f) / bc_ad,
          (b * e - a * f) / ad_bc
        ];
      }
    });

    ctx.save = function ctxSave() {
      var old = this._transformMatrix;
      this._transformStack.push(old);
      this._transformMatrix = old.slice(0, 6);

      this._originalSave();
    };

    ctx.restore = function ctxRestore() {
      var prev = this._transformStack.pop();
      if (prev) {
        this._transformMatrix = prev;
        this._originalRestore();
      }
    };

    ctx.translate = function ctxTranslate(x, y) {
      var m = this._transformMatrix;
      m[4] = m[0] * x + m[2] * y + m[4];
      m[5] = m[1] * x + m[3] * y + m[5];

      this._originalTranslate(x, y);
    };

    ctx.scale = function ctxScale(x, y) {
      var m = this._transformMatrix;
      m[0] = m[0] * x;
      m[1] = m[1] * x;
      m[2] = m[2] * y;
      m[3] = m[3] * y;

      this._originalScale(x, y);
    };

    ctx.transform = function ctxTransform(a, b, c, d, e, f) {
      var m = this._transformMatrix;
      this._transformMatrix = [
        m[0] * a + m[2] * b,
        m[1] * a + m[3] * b,
        m[0] * c + m[2] * d,
        m[1] * c + m[3] * d,
        m[0] * e + m[2] * f + m[4],
        m[1] * e + m[3] * f + m[5]
      ];

      ctx._originalTransform(a, b, c, d, e, f);
    };

    ctx.setTransform = function ctxSetTransform(a, b, c, d, e, f) {
      this._transformMatrix = [a, b, c, d, e, f];

      ctx._originalSetTransform(a, b, c, d, e, f);
    };

    ctx.rotate = function ctxRotate(angle) {
      var cosValue = Math.cos(angle);
      var sinValue = Math.sin(angle);

      var m = this._transformMatrix;
      this._transformMatrix = [
        m[0] * cosValue + m[2] * sinValue,
        m[1] * cosValue + m[3] * sinValue,
        m[0] * (-sinValue) + m[2] * cosValue,
        m[1] * (-sinValue) + m[3] * cosValue,
        m[4],
        m[5]
      ];

      this._originalRotate(angle);
    };
  }
}

var CachedCanvases = (function CachedCanvasesClosure() {
  var cache = {};
  return {
    getCanvas: function CachedCanvases_getCanvas(id, width, height,
                                                 trackTransform) {
      var canvasEntry;
      if (id in cache) {
        canvasEntry = cache[id];
        canvasEntry.canvas.width = width;
        canvasEntry.canvas.height = height;
        // reset canvas transform for emulated mozCurrentTransform, if needed
        canvasEntry.context.setTransform(1, 0, 0, 1, 0, 0);
      } else {
        var canvas = createScratchCanvas(width, height);
        var ctx = canvas.getContext('2d');
        if (trackTransform) {
          addContextCurrentTransform(ctx);
        }
        cache[id] = canvasEntry = {canvas: canvas, context: ctx};
      }
      return canvasEntry;
    },
    clear: function () {
      for (var id in cache) {
        var canvasEntry = cache[id];
        // Zeroing the width and height causes Firefox to release graphics
        // resources immediately, which can greatly reduce memory consumption.
        canvasEntry.canvas.width = 0;
        canvasEntry.canvas.height = 0;
        delete cache[id];
      }
    }
  };
})();

function compileType3Glyph(imgData) {
  var POINT_TO_PROCESS_LIMIT = 1000;

  var width = imgData.width, height = imgData.height;
  var i, j, j0, width1 = width + 1;
  var points = new Uint8Array(width1 * (height + 1));
  var POINT_TYPES =
      new Uint8Array([0, 2, 4, 0, 1, 0, 5, 4, 8, 10, 0, 8, 0, 2, 1, 0]);

  // decodes bit-packed mask data
  var lineSize = (width + 7) & ~7, data0 = imgData.data;
  var data = new Uint8Array(lineSize * height), pos = 0, ii;
  for (i = 0, ii = data0.length; i < ii; i++) {
    var mask = 128, elem = data0[i];
    while (mask > 0) {
      data[pos++] = (elem & mask) ? 0 : 255;
      mask >>= 1;
    }
  }

  // finding iteresting points: every point is located between mask pixels,
  // so there will be points of the (width + 1)x(height + 1) grid. Every point
  // will have flags assigned based on neighboring mask pixels:
  //   4 | 8
  //   --P--
  //   2 | 1
  // We are interested only in points with the flags:
  //   - outside corners: 1, 2, 4, 8;
  //   - inside corners: 7, 11, 13, 14;
  //   - and, intersections: 5, 10.
  var count = 0;
  pos = 0;
  if (data[pos] !== 0) {
    points[0] = 1;
    ++count;
  }
  for (j = 1; j < width; j++) {
    if (data[pos] !== data[pos + 1]) {
      points[j] = data[pos] ? 2 : 1;
      ++count;
    }
    pos++;
  }
  if (data[pos] !== 0) {
    points[j] = 2;
    ++count;
  }
  for (i = 1; i < height; i++) {
    pos = i * lineSize;
    j0 = i * width1;
    if (data[pos - lineSize] !== data[pos]) {
      points[j0] = data[pos] ? 1 : 8;
      ++count;
    }
    // 'sum' is the position of the current pixel configuration in the 'TYPES'
    // array (in order 8-1-2-4, so we can use '>>2' to shift the column).
    var sum = (data[pos] ? 4 : 0) + (data[pos - lineSize] ? 8 : 0);
    for (j = 1; j < width; j++) {
      sum = (sum >> 2) + (data[pos + 1] ? 4 : 0) +
            (data[pos - lineSize + 1] ? 8 : 0);
      if (POINT_TYPES[sum]) {
        points[j0 + j] = POINT_TYPES[sum];
        ++count;
      }
      pos++;
    }
    if (data[pos - lineSize] !== data[pos]) {
      points[j0 + j] = data[pos] ? 2 : 4;
      ++count;
    }

    if (count > POINT_TO_PROCESS_LIMIT) {
      return null;
    }
  }

  pos = lineSize * (height - 1);
  j0 = i * width1;
  if (data[pos] !== 0) {
    points[j0] = 8;
    ++count;
  }
  for (j = 1; j < width; j++) {
    if (data[pos] !== data[pos + 1]) {
      points[j0 + j] = data[pos] ? 4 : 8;
      ++count;
    }
    pos++;
  }
  if (data[pos] !== 0) {
    points[j0 + j] = 4;
    ++count;
  }
  if (count > POINT_TO_PROCESS_LIMIT) {
    return null;
  }

  // building outlines
  var steps = new Int32Array([0, width1, -1, 0, -width1, 0, 0, 0, 1]);
  var outlines = [];
  for (i = 0; count && i <= height; i++) {
    var p = i * width1;
    var end = p + width;
    while (p < end && !points[p]) {
      p++;
    }
    if (p === end) {
      continue;
    }
    var coords = [p % width1, i];

    var type = points[p], p0 = p, pp;
    do {
      var step = steps[type];
      do {
        p += step;
      } while (!points[p]);

      pp = points[p];
      if (pp !== 5 && pp !== 10) {
        // set new direction
        type = pp;
        // delete mark
        points[p] = 0;
      } else { // type is 5 or 10, ie, a crossing
        // set new direction
        type = pp & ((0x33 * type) >> 4);
        // set new type for "future hit"
        points[p] &= (type >> 2 | type << 2);
      }

      coords.push(p % width1);
      coords.push((p / width1) | 0);
      --count;
    } while (p0 !== p);
    outlines.push(coords);
    --i;
  }

  var drawOutline = function(c) {
    c.save();
    // the path shall be painted in [0..1]x[0..1] space
    c.scale(1 / width, -1 / height);
    c.translate(0, -height);
    c.beginPath();
    for (var i = 0, ii = outlines.length; i < ii; i++) {
      var o = outlines[i];
      c.moveTo(o[0], o[1]);
      for (var j = 2, jj = o.length; j < jj; j += 2) {
        c.lineTo(o[j], o[j+1]);
      }
    }
    c.fill();
    c.beginPath();
    c.restore();
  };

  return drawOutline;
}

var CanvasExtraState = (function CanvasExtraStateClosure() {
  function CanvasExtraState(old) {
    // Are soft masks and alpha values shapes or opacities?
    this.alphaIsShape = false;
    this.fontSize = 0;
    this.fontSizeScale = 1;
    this.textMatrix = IDENTITY_MATRIX;
    this.textMatrixScale = 1;
    this.fontMatrix = FONT_IDENTITY_MATRIX;
    this.leading = 0;
    // Current point (in user coordinates)
    this.x = 0;
    this.y = 0;
    // Start of text line (in text coordinates)
    this.lineX = 0;
    this.lineY = 0;
    // Character and word spacing
    this.charSpacing = 0;
    this.wordSpacing = 0;
    this.textHScale = 1;
    this.textRenderingMode = TextRenderingMode.FILL;
    this.textRise = 0;
    // Default fore and background colors
    this.fillColor = '#000000';
    this.strokeColor = '#000000';
    // Note: fill alpha applies to all non-stroking operations
    this.fillAlpha = 1;
    this.strokeAlpha = 1;
    this.lineWidth = 1;
    this.activeSMask = null; // nonclonable field (see the save method below)

    this.old = old;
  }

  CanvasExtraState.prototype = {
    clone: function CanvasExtraState_clone() {
      return Object.create(this);
    },
    setCurrentPoint: function CanvasExtraState_setCurrentPoint(x, y) {
      this.x = x;
      this.y = y;
    }
  };
  return CanvasExtraState;
})();

var CanvasGraphics = (function CanvasGraphicsClosure() {
  // Defines the time the executeOperatorList is going to be executing
  // before it stops and shedules a continue of execution.
  var EXECUTION_TIME = 15;
  // Defines the number of steps before checking the execution time
  var EXECUTION_STEPS = 10;

  function CanvasGraphics(canvasCtx, commonObjs, objs, imageLayer) {
    this.ctx = canvasCtx;
    this.current = new CanvasExtraState();
    this.stateStack = [];
    this.pendingClip = null;
    this.pendingEOFill = false;
    this.res = null;
    this.xobjs = null;
    this.commonObjs = commonObjs;
    this.objs = objs;
    this.imageLayer = imageLayer;
    this.groupStack = [];
    this.processingType3 = null;
    // Patterns are painted relative to the initial page/form transform, see pdf
    // spec 8.7.2 NOTE 1.
    this.baseTransform = null;
    this.baseTransformStack = [];
    this.groupLevel = 0;
    this.smaskStack = [];
    this.smaskCounter = 0;
    this.tempSMask = null;
    if (canvasCtx) {
      addContextCurrentTransform(canvasCtx);
    }
  }

  function putBinaryImageData(ctx, imgData) {
    if (typeof ImageData !== 'undefined' && imgData instanceof ImageData) {
      ctx.putImageData(imgData, 0, 0);
      return;
    }

    // Put the image data to the canvas in chunks, rather than putting the
    // whole image at once.  This saves JS memory, because the ImageData object
    // is smaller. It also possibly saves C++ memory within the implementation
    // of putImageData(). (E.g. in Firefox we make two short-lived copies of
    // the data passed to putImageData()). |n| shouldn't be too small, however,
    // because too many putImageData() calls will slow things down.
    //
    // Note: as written, if the last chunk is partial, the putImageData() call
    // will (conceptually) put pixels past the bounds of the canvas.  But
    // that's ok; any such pixels are ignored.

    var height = imgData.height, width = imgData.width;
    var fullChunkHeight = 16;
    var fracChunks = height / fullChunkHeight;
    var fullChunks = Math.floor(fracChunks);
    var totalChunks = Math.ceil(fracChunks);
    var partialChunkHeight = height - fullChunks * fullChunkHeight;

    var chunkImgData = ctx.createImageData(width, fullChunkHeight);
    var srcPos = 0, destPos;
    var src = imgData.data;
    var dest = chunkImgData.data;
    var i, j, thisChunkHeight, elemsInThisChunk;

    // There are multiple forms in which the pixel data can be passed, and
    // imgData.kind tells us which one this is.
    if (imgData.kind === ImageKind.GRAYSCALE_1BPP) {
      // Grayscale, 1 bit per pixel (i.e. black-and-white).
      var srcLength = src.byteLength;
      var dest32 = PDFJS.hasCanvasTypedArrays ? new Uint32Array(dest.buffer) :
        new Uint32ArrayView(dest);
      var dest32DataLength = dest32.length;
      var fullSrcDiff = (width + 7) >> 3;
      var white = 0xFFFFFFFF;
      var black = (PDFJS.isLittleEndian || !PDFJS.hasCanvasTypedArrays) ?
        0xFF000000 : 0x000000FF;
      for (i = 0; i < totalChunks; i++) {
        thisChunkHeight =
          (i < fullChunks) ? fullChunkHeight : partialChunkHeight;
        destPos = 0;
        for (j = 0; j < thisChunkHeight; j++) {
          var srcDiff = srcLength - srcPos;
          var k = 0;
          var kEnd = (srcDiff > fullSrcDiff) ? width : srcDiff * 8 - 7;
          var kEndUnrolled = kEnd & ~7;
          var mask = 0;
          var srcByte = 0;
          for (; k < kEndUnrolled; k += 8) {
            srcByte = src[srcPos++];
            dest32[destPos++] = (srcByte & 128) ? white : black;
            dest32[destPos++] = (srcByte & 64) ? white : black;
            dest32[destPos++] = (srcByte & 32) ? white : black;
            dest32[destPos++] = (srcByte & 16) ? white : black;
            dest32[destPos++] = (srcByte & 8) ? white : black;
            dest32[destPos++] = (srcByte & 4) ? white : black;
            dest32[destPos++] = (srcByte & 2) ? white : black;
            dest32[destPos++] = (srcByte & 1) ? white : black;
          }
          for (; k < kEnd; k++) {
             if (mask === 0) {
               srcByte = src[srcPos++];
               mask = 128;
             }

            dest32[destPos++] = (srcByte & mask) ? white : black;
            mask >>= 1;
          }
        }
        // We ran out of input. Make all remaining pixels transparent.
        while (destPos < dest32DataLength) {
          dest32[destPos++] = 0;
        }

        ctx.putImageData(chunkImgData, 0, i * fullChunkHeight);
      }
    } else if (imgData.kind === ImageKind.RGBA_32BPP) {
      // RGBA, 32-bits per pixel.

      j = 0;
      elemsInThisChunk = width * fullChunkHeight * 4;
      for (i = 0; i < fullChunks; i++) {
        dest.set(src.subarray(srcPos, srcPos + elemsInThisChunk));
        srcPos += elemsInThisChunk;

        ctx.putImageData(chunkImgData, 0, j);
        j += fullChunkHeight;
      }
      if (i < totalChunks) {
        elemsInThisChunk = width * partialChunkHeight * 4;
        dest.set(src.subarray(srcPos, srcPos + elemsInThisChunk));
        ctx.putImageData(chunkImgData, 0, j);
      }

    } else if (imgData.kind === ImageKind.RGB_24BPP) {
      // RGB, 24-bits per pixel.
      thisChunkHeight = fullChunkHeight;
      elemsInThisChunk = width * thisChunkHeight;
      for (i = 0; i < totalChunks; i++) {
        if (i >= fullChunks) {
          thisChunkHeight =partialChunkHeight;
          elemsInThisChunk = width * thisChunkHeight;
        }

        destPos = 0;
        for (j = elemsInThisChunk; j--;) {
          dest[destPos++] = src[srcPos++];
          dest[destPos++] = src[srcPos++];
          dest[destPos++] = src[srcPos++];
          dest[destPos++] = 255;
        }
        ctx.putImageData(chunkImgData, 0, i * fullChunkHeight);
      }
    } else {
      error('bad image kind: ' + imgData.kind);
    }
  }

  function putBinaryImageMask(ctx, imgData) {
    var height = imgData.height, width = imgData.width;
    var fullChunkHeight = 16;
    var fracChunks = height / fullChunkHeight;
    var fullChunks = Math.floor(fracChunks);
    var totalChunks = Math.ceil(fracChunks);
    var partialChunkHeight = height - fullChunks * fullChunkHeight;

    var chunkImgData = ctx.createImageData(width, fullChunkHeight);
    var srcPos = 0;
    var src = imgData.data;
    var dest = chunkImgData.data;

    for (var i = 0; i < totalChunks; i++) {
      var thisChunkHeight =
        (i < fullChunks) ? fullChunkHeight : partialChunkHeight;

      // Expand the mask so it can be used by the canvas.  Any required
      // inversion has already been handled.
      var destPos = 3; // alpha component offset
      for (var j = 0; j < thisChunkHeight; j++) {
        var mask = 0;
        for (var k = 0; k < width; k++) {
          if (!mask) {
            var elem = src[srcPos++];
            mask = 128;
          }
          dest[destPos] = (elem & mask) ? 0 : 255;
          destPos += 4;
          mask >>= 1;
        }
      }
      ctx.putImageData(chunkImgData, 0, i * fullChunkHeight);
    }
  }

  function copyCtxState(sourceCtx, destCtx) {
    var properties = ['strokeStyle', 'fillStyle', 'fillRule', 'globalAlpha',
                      'lineWidth', 'lineCap', 'lineJoin', 'miterLimit',
                      'globalCompositeOperation', 'font'];
    for (var i = 0, ii = properties.length; i < ii; i++) {
      var property = properties[i];
      if (property in sourceCtx) {
        destCtx[property] = sourceCtx[property];
      }
    }
    if ('setLineDash' in sourceCtx) {
      destCtx.setLineDash(sourceCtx.getLineDash());
      destCtx.lineDashOffset =  sourceCtx.lineDashOffset;
    } else if ('mozDash' in sourceCtx) {
      destCtx.mozDash = sourceCtx.mozDash;
      destCtx.mozDashOffset = sourceCtx.mozDashOffset;
    }
  }

  function composeSMaskBackdrop(bytes, r0, g0, b0) {
    var length = bytes.length;
    for (var i = 3; i < length; i += 4) {
      var alpha = bytes[i];
      if (alpha === 0) {
        bytes[i - 3] = r0;
        bytes[i - 2] = g0;
        bytes[i - 1] = b0;
      } else if (alpha < 255) {
        var alpha_ = 255 - alpha;
        bytes[i - 3] = (bytes[i - 3] * alpha + r0 * alpha_) >> 8;
        bytes[i - 2] = (bytes[i - 2] * alpha + g0 * alpha_) >> 8;
        bytes[i - 1] = (bytes[i - 1] * alpha + b0 * alpha_) >> 8;
      }
    }
  }

  function composeSMaskAlpha(maskData, layerData) {
    var length = maskData.length;
    var scale = 1 / 255;
    for (var i = 3; i < length; i += 4) {
      var alpha = maskData[i];
      layerData[i] = (layerData[i] * alpha * scale) | 0;
    }
  }

  function composeSMaskLuminosity(maskData, layerData) {
    var length = maskData.length;
    for (var i = 3; i < length; i += 4) {
      var y = ((maskData[i - 3] * 77) +     // * 0.3 / 255 * 0x10000
               (maskData[i - 2] * 152) +    // * 0.59 ....
               (maskData[i - 1] * 28)) | 0; // * 0.11 ....
      layerData[i] = (layerData[i] * y) >> 16;
    }
  }

  function genericComposeSMask(maskCtx, layerCtx, width, height,
                               subtype, backdrop) {
    var hasBackdrop = !!backdrop;
    var r0 = hasBackdrop ? backdrop[0] : 0;
    var g0 = hasBackdrop ? backdrop[1] : 0;
    var b0 = hasBackdrop ? backdrop[2] : 0;

    var composeFn;
    if (subtype === 'Luminosity') {
      composeFn = composeSMaskLuminosity;
    } else {
      composeFn = composeSMaskAlpha;
    }

    // processing image in chunks to save memory
    var PIXELS_TO_PROCESS = 65536;
    var chunkSize = Math.min(height, Math.ceil(PIXELS_TO_PROCESS / width));
    for (var row = 0; row < height; row += chunkSize) {
      var chunkHeight = Math.min(chunkSize, height - row);
      var maskData = maskCtx.getImageData(0, row, width, chunkHeight);
      var layerData = layerCtx.getImageData(0, row, width, chunkHeight);

      if (hasBackdrop) {
        composeSMaskBackdrop(maskData.data, r0, g0, b0);
      }
      composeFn(maskData.data, layerData.data);

      maskCtx.putImageData(layerData, 0, row);
    }
  }

  function composeSMask(ctx, smask, layerCtx) {
    var mask = smask.canvas;
    var maskCtx = smask.context;

    ctx.setTransform(smask.scaleX, 0, 0, smask.scaleY,
                     smask.offsetX, smask.offsetY);

    var backdrop = smask.backdrop || null;
    if (WebGLUtils.isEnabled) {
      var composed = WebGLUtils.composeSMask(layerCtx.canvas, mask,
        {subtype: smask.subtype, backdrop: backdrop});
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(composed, smask.offsetX, smask.offsetY);
      return;
    }
    genericComposeSMask(maskCtx, layerCtx, mask.width, mask.height,
                        smask.subtype, backdrop);
    ctx.drawImage(mask, 0, 0);
  }

  var LINE_CAP_STYLES = ['butt', 'round', 'square'];
  var LINE_JOIN_STYLES = ['miter', 'round', 'bevel'];
  var NORMAL_CLIP = {};
  var EO_CLIP = {};

  CanvasGraphics.prototype = {

    beginDrawing: function CanvasGraphics_beginDrawing(viewport, transparency) {
      // For pdfs that use blend modes we have to clear the canvas else certain
      // blend modes can look wrong since we'd be blending with a white
      // backdrop. The problem with a transparent backdrop though is we then
      // don't get sub pixel anti aliasing on text, so we fill with white if
      // we can.
      var width = this.ctx.canvas.width;
      var height = this.ctx.canvas.height;
      if (transparency) {
        this.ctx.clearRect(0, 0, width, height);
      } else {
        this.ctx.mozOpaque = true;
        this.ctx.save();
        this.ctx.fillStyle = 'rgb(255, 255, 255)';
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.restore();
      }

      var transform = viewport.transform;

      this.ctx.save();
      this.ctx.transform.apply(this.ctx, transform);

      this.baseTransform = this.ctx.mozCurrentTransform.slice();

      if (this.imageLayer) {
        this.imageLayer.beginLayout();
      }
    },

    executeOperatorList: function CanvasGraphics_executeOperatorList(
                                    operatorList,
                                    executionStartIdx, continueCallback,
                                    stepper) {
      var argsArray = operatorList.argsArray;
      var fnArray = operatorList.fnArray;
      var i = executionStartIdx || 0;
      var argsArrayLen = argsArray.length;

      // Sometimes the OperatorList to execute is empty.
      if (argsArrayLen === i) {
        return i;
      }

      var chunkOperations = (argsArrayLen - i > EXECUTION_STEPS &&
                             typeof continueCallback === 'function');
      var endTime = chunkOperations ? Date.now() + EXECUTION_TIME : 0;
      var steps = 0;

      var commonObjs = this.commonObjs;
      var objs = this.objs;
      var fnId;

      while (true) {
        if (stepper !== undefined && i === stepper.nextBreakPoint) {
          stepper.breakIt(i, continueCallback);
          return i;
        }

        fnId = fnArray[i];

        if (fnId !== OPS.dependency) {
          this[fnId].apply(this, argsArray[i]);
        } else {
          var deps = argsArray[i];
          for (var n = 0, nn = deps.length; n < nn; n++) {
            var depObjId = deps[n];
            var common = depObjId[0] === 'g' && depObjId[1] === '_';
            var objsPool = common ? commonObjs : objs;

            // If the promise isn't resolved yet, add the continueCallback
            // to the promise and bail out.
            if (!objsPool.isResolved(depObjId)) {
              objsPool.get(depObjId, continueCallback);
              return i;
            }
          }
        }

        i++;

        // If the entire operatorList was executed, stop as were done.
        if (i === argsArrayLen) {
          return i;
        }

        // If the execution took longer then a certain amount of time and
        // `continueCallback` is specified, interrupt the execution.
        if (chunkOperations && ++steps > EXECUTION_STEPS) {
          if (Date.now() > endTime) {
            continueCallback();
            return i;
          }
          steps = 0;
        }

        // If the operatorList isn't executed completely yet OR the execution
        // time was short enough, do another execution round.
      }
    },

    endDrawing: function CanvasGraphics_endDrawing() {
      this.ctx.restore();
      CachedCanvases.clear();
      WebGLUtils.clear();

      if (this.imageLayer) {
        this.imageLayer.endLayout();
      }
    },

    // Graphics state
    setLineWidth: function CanvasGraphics_setLineWidth(width) {
      this.current.lineWidth = width;
      this.ctx.lineWidth = width;
    },
    setLineCap: function CanvasGraphics_setLineCap(style) {
      this.ctx.lineCap = LINE_CAP_STYLES[style];
    },
    setLineJoin: function CanvasGraphics_setLineJoin(style) {
      this.ctx.lineJoin = LINE_JOIN_STYLES[style];
    },
    setMiterLimit: function CanvasGraphics_setMiterLimit(limit) {
      this.ctx.miterLimit = limit;
    },
    setDash: function CanvasGraphics_setDash(dashArray, dashPhase) {
      var ctx = this.ctx;
      if ('setLineDash' in ctx) {
        ctx.setLineDash(dashArray);
        ctx.lineDashOffset = dashPhase;
      } else {
        ctx.mozDash = dashArray;
        ctx.mozDashOffset = dashPhase;
      }
    },
    setRenderingIntent: function CanvasGraphics_setRenderingIntent(intent) {
      // Maybe if we one day fully support color spaces this will be important
      // for now we can ignore.
      // TODO set rendering intent?
    },
    setFlatness: function CanvasGraphics_setFlatness(flatness) {
      // There's no way to control this with canvas, but we can safely ignore.
      // TODO set flatness?
    },
    setGState: function CanvasGraphics_setGState(states) {
      for (var i = 0, ii = states.length; i < ii; i++) {
        var state = states[i];
        var key = state[0];
        var value = state[1];

        switch (key) {
          case 'LW':
            this.setLineWidth(value);
            break;
          case 'LC':
            this.setLineCap(value);
            break;
          case 'LJ':
            this.setLineJoin(value);
            break;
          case 'ML':
            this.setMiterLimit(value);
            break;
          case 'D':
            this.setDash(value[0], value[1]);
            break;
          case 'RI':
            this.setRenderingIntent(value);
            break;
          case 'FL':
            this.setFlatness(value);
            break;
          case 'Font':
            this.setFont(value[0], value[1]);
            break;
          case 'CA':
            this.current.strokeAlpha = state[1];
            break;
          case 'ca':
            this.current.fillAlpha = state[1];
            this.ctx.globalAlpha = state[1];
            break;
          case 'BM':
            if (value && value.name && (value.name !== 'Normal')) {
              var mode = value.name.replace(/([A-Z])/g,
                function(c) {
                  return '-' + c.toLowerCase();
                }
              ).substring(1);
              this.ctx.globalCompositeOperation = mode;
              if (this.ctx.globalCompositeOperation !== mode) {
                warn('globalCompositeOperation "' + mode +
                     '" is not supported');
              }
            } else {
              this.ctx.globalCompositeOperation = 'source-over';
            }
            break;
          case 'SMask':
            if (this.current.activeSMask) {
              this.endSMaskGroup();
            }
            this.current.activeSMask = value ? this.tempSMask : null;
            if (this.current.activeSMask) {
              this.beginSMaskGroup();
            }
            this.tempSMask = null;
            break;
        }
      }
    },
    beginSMaskGroup: function CanvasGraphics_beginSMaskGroup() {

      var activeSMask = this.current.activeSMask;
      var drawnWidth = activeSMask.canvas.width;
      var drawnHeight = activeSMask.canvas.height;
      var cacheId = 'smaskGroupAt' + this.groupLevel;
      var scratchCanvas = CachedCanvases.getCanvas(
        cacheId, drawnWidth, drawnHeight, true);

      var currentCtx = this.ctx;
      var currentTransform = currentCtx.mozCurrentTransform;
      this.ctx.save();

      var groupCtx = scratchCanvas.context;
      groupCtx.scale(1 / activeSMask.scaleX, 1 / activeSMask.scaleY);
      groupCtx.translate(-activeSMask.offsetX, -activeSMask.offsetY);
      groupCtx.transform.apply(groupCtx, currentTransform);

      copyCtxState(currentCtx, groupCtx);
      this.ctx = groupCtx;
      this.setGState([
        ['BM', 'Normal'],
        ['ca', 1],
        ['CA', 1]
      ]);
      this.groupStack.push(currentCtx);
      this.groupLevel++;
    },
    endSMaskGroup: function CanvasGraphics_endSMaskGroup() {
      var groupCtx = this.ctx;
      this.groupLevel--;
      this.ctx = this.groupStack.pop();

      composeSMask(this.ctx, this.current.activeSMask, groupCtx);
      this.ctx.restore();
    },
    save: function CanvasGraphics_save() {
      this.ctx.save();
      var old = this.current;
      this.stateStack.push(old);
      this.current = old.clone();
      this.current.activeSMask = null;
    },
    restore: function CanvasGraphics_restore() {
      if (this.stateStack.length !== 0) {
        if (this.current.activeSMask !== null) {
          this.endSMaskGroup();
        }

        this.current = this.stateStack.pop();
        this.ctx.restore();
      }
    },
    transform: function CanvasGraphics_transform(a, b, c, d, e, f) {
      this.ctx.transform(a, b, c, d, e, f);
    },

    // Path
    constructPath: function CanvasGraphics_constructPath(ops, args) {
      var ctx = this.ctx;
      var current = this.current;
      var x = current.x, y = current.y;
      for (var i = 0, j = 0, ii = ops.length; i < ii; i++) {
        switch (ops[i] | 0) {
          case OPS.rectangle:
            x = args[j++];
            y = args[j++];
            var width = args[j++];
            var height = args[j++];
            if (width === 0) {
              width = this.getSinglePixelWidth();
            }
            if (height === 0) {
              height = this.getSinglePixelWidth();
            }
            var xw = x + width;
            var yh = y + height;
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(xw, y);
            this.ctx.lineTo(xw, yh);
            this.ctx.lineTo(x, yh);
            this.ctx.lineTo(x, y);
            this.ctx.closePath();
            break;
          case OPS.moveTo:
            x = args[j++];
            y = args[j++];
            ctx.moveTo(x, y);
            break;
          case OPS.lineTo:
            x = args[j++];
            y = args[j++];
            ctx.lineTo(x, y);
            break;
          case OPS.curveTo:
            x = args[j + 4];
            y = args[j + 5];
            ctx.bezierCurveTo(args[j], args[j + 1], args[j + 2], args[j + 3],
                              x, y);
            j += 6;
            break;
          case OPS.curveTo2:
            ctx.bezierCurveTo(x, y, args[j], args[j + 1],
                              args[j + 2], args[j + 3]);
            x = args[j + 2];
            y = args[j + 3];
            j += 4;
            break;
          case OPS.curveTo3:
            x = args[j + 2];
            y = args[j + 3];
            ctx.bezierCurveTo(args[j], args[j + 1], x, y, x, y);
            j += 4;
            break;
          case OPS.closePath:
            ctx.closePath();
            break;
        }
      }
      current.setCurrentPoint(x, y);
    },
    closePath: function CanvasGraphics_closePath() {
      this.ctx.closePath();
    },
    stroke: function CanvasGraphics_stroke(consumePath) {
      consumePath = typeof consumePath !== 'undefined' ? consumePath : true;
      var ctx = this.ctx;
      var strokeColor = this.current.strokeColor;
      if (this.current.lineWidth === 0) {
        ctx.lineWidth = this.getSinglePixelWidth();
      }
      // For stroke we want to temporarily change the global alpha to the
      // stroking alpha.
      ctx.globalAlpha = this.current.strokeAlpha;
      if (strokeColor && strokeColor.hasOwnProperty('type') &&
          strokeColor.type === 'Pattern') {
        // for patterns, we transform to pattern space, calculate
        // the pattern, call stroke, and restore to user space
        ctx.save();
        ctx.strokeStyle = strokeColor.getPattern(ctx, this);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.stroke();
      }
      if (consumePath) {
        this.consumePath();
      }
      // Restore the global alpha to the fill alpha
      ctx.globalAlpha = this.current.fillAlpha;
    },
    closeStroke: function CanvasGraphics_closeStroke() {
      this.closePath();
      this.stroke();
    },
    fill: function CanvasGraphics_fill(consumePath) {
      consumePath = typeof consumePath !== 'undefined' ? consumePath : true;
      var ctx = this.ctx;
      var fillColor = this.current.fillColor;
      var needRestore = false;

      if (fillColor && fillColor.hasOwnProperty('type') &&
          fillColor.type === 'Pattern') {
        ctx.save();
        ctx.fillStyle = fillColor.getPattern(ctx, this);
        needRestore = true;
      }

      if (this.pendingEOFill) {
        if (ctx.mozFillRule !== undefined) {
          ctx.mozFillRule = 'evenodd';
          ctx.fill();
          ctx.mozFillRule = 'nonzero';
        } else {
          try {
            ctx.fill('evenodd');
          } catch (ex) {
            // shouldn't really happen, but browsers might think differently
            ctx.fill();
          }
        }
        this.pendingEOFill = false;
      } else {
        ctx.fill();
      }

      if (needRestore) {
        ctx.restore();
      }
      if (consumePath) {
        this.consumePath();
      }
    },
    eoFill: function CanvasGraphics_eoFill() {
      this.pendingEOFill = true;
      this.fill();
    },
    fillStroke: function CanvasGraphics_fillStroke() {
      this.fill(false);
      this.stroke(false);

      this.consumePath();
    },
    eoFillStroke: function CanvasGraphics_eoFillStroke() {
      this.pendingEOFill = true;
      this.fillStroke();
    },
    closeFillStroke: function CanvasGraphics_closeFillStroke() {
      this.closePath();
      this.fillStroke();
    },
    closeEOFillStroke: function CanvasGraphics_closeEOFillStroke() {
      this.pendingEOFill = true;
      this.closePath();
      this.fillStroke();
    },
    endPath: function CanvasGraphics_endPath() {
      this.consumePath();
    },

    // Clipping
    clip: function CanvasGraphics_clip() {
      this.pendingClip = NORMAL_CLIP;
    },
    eoClip: function CanvasGraphics_eoClip() {
      this.pendingClip = EO_CLIP;
    },

    // Text
    beginText: function CanvasGraphics_beginText() {
      this.current.textMatrix = IDENTITY_MATRIX;
      this.current.textMatrixScale = 1;
      this.current.x = this.current.lineX = 0;
      this.current.y = this.current.lineY = 0;
    },
    endText: function CanvasGraphics_endText() {
      var paths = this.pendingTextPaths;
      var ctx = this.ctx;
      if (paths === undefined) {
        ctx.beginPath();
        return;
      }

      ctx.save();
      ctx.beginPath();
      for (var i = 0; i < paths.length; i++) {
        var path = paths[i];
        ctx.setTransform.apply(ctx, path.transform);
        ctx.translate(path.x, path.y);
        path.addToPath(ctx, path.fontSize);
      }
      ctx.restore();
      ctx.clip();
      ctx.beginPath();
      delete this.pendingTextPaths;
    },
    setCharSpacing: function CanvasGraphics_setCharSpacing(spacing) {
      this.current.charSpacing = spacing;
    },
    setWordSpacing: function CanvasGraphics_setWordSpacing(spacing) {
      this.current.wordSpacing = spacing;
    },
    setHScale: function CanvasGraphics_setHScale(scale) {
      this.current.textHScale = scale / 100;
    },
    setLeading: function CanvasGraphics_setLeading(leading) {
      this.current.leading = -leading;
    },
    setFont: function CanvasGraphics_setFont(fontRefName, size) {
      var fontObj = this.commonObjs.get(fontRefName);
      var current = this.current;

      if (!fontObj) {
        error('Can\'t find font for ' + fontRefName);
      }

      current.fontMatrix = (fontObj.fontMatrix ?
                            fontObj.fontMatrix : FONT_IDENTITY_MATRIX);

      // A valid matrix needs all main diagonal elements to be non-zero
      // This also ensures we bypass FF bugzilla bug #719844.
      if (current.fontMatrix[0] === 0 ||
          current.fontMatrix[3] === 0) {
        warn('Invalid font matrix for font ' + fontRefName);
      }

      // The spec for Tf (setFont) says that 'size' specifies the font 'scale',
      // and in some docs this can be negative (inverted x-y axes).
      if (size < 0) {
        size = -size;
        current.fontDirection = -1;
      } else {
        current.fontDirection = 1;
      }

      this.current.font = fontObj;
      this.current.fontSize = size;

      if (fontObj.isType3Font) {
        return; // we don't need ctx.font for Type3 fonts
      }

      var name = fontObj.loadedName || 'sans-serif';
      var bold = fontObj.black ? (fontObj.bold ? 'bolder' : 'bold') :
                                 (fontObj.bold ? 'bold' : 'normal');

      var italic = fontObj.italic ? 'italic' : 'normal';
      var typeface = '"' + name + '", ' + fontObj.fallbackName;

      // Some font backends cannot handle fonts below certain size.
      // Keeping the font at minimal size and using the fontSizeScale to change
      // the current transformation matrix before the fillText/strokeText.
      // See https://bugzilla.mozilla.org/show_bug.cgi?id=726227
      var browserFontSize = size >= MIN_FONT_SIZE ? size : MIN_FONT_SIZE;
      this.current.fontSizeScale = browserFontSize !== MIN_FONT_SIZE ? 1.0 :
                                   size / MIN_FONT_SIZE;

      var rule = italic + ' ' + bold + ' ' + browserFontSize + 'px ' + typeface;
      this.ctx.font = rule;
    },
    setTextRenderingMode: function CanvasGraphics_setTextRenderingMode(mode) {
      this.current.textRenderingMode = mode;
    },
    setTextRise: function CanvasGraphics_setTextRise(rise) {
      this.current.textRise = rise;
    },
    moveText: function CanvasGraphics_moveText(x, y) {
      this.current.x = this.current.lineX += x;
      this.current.y = this.current.lineY += y;
    },
    setLeadingMoveText: function CanvasGraphics_setLeadingMoveText(x, y) {
      this.setLeading(-y);
      this.moveText(x, y);
    },
    setTextMatrix: function CanvasGraphics_setTextMatrix(a, b, c, d, e, f) {
      this.current.textMatrix = [a, b, c, d, e, f];
      this.current.textMatrixScale = Math.sqrt(a * a + b * b);

      this.current.x = this.current.lineX = 0;
      this.current.y = this.current.lineY = 0;
    },
    nextLine: function CanvasGraphics_nextLine() {
      this.moveText(0, this.current.leading);
    },

    paintChar: function CanvasGraphics_paintChar(character, x, y) {
      var ctx = this.ctx;
      var current = this.current;
      var font = current.font;
      var textRenderingMode = current.textRenderingMode;
      var fontSize = current.fontSize / current.fontSizeScale;
      var fillStrokeMode = textRenderingMode &
        TextRenderingMode.FILL_STROKE_MASK;
      var isAddToPathSet = !!(textRenderingMode &
        TextRenderingMode.ADD_TO_PATH_FLAG);

      var addToPath;
      if (font.disableFontFace || isAddToPathSet) {
        addToPath = font.getPathGenerator(this.commonObjs, character);
      }

      if (font.disableFontFace) {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        addToPath(ctx, fontSize);
        if (fillStrokeMode === TextRenderingMode.FILL ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          ctx.fill();
        }
        if (fillStrokeMode === TextRenderingMode.STROKE ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          ctx.stroke();
        }
        ctx.restore();
      } else {
        if (fillStrokeMode === TextRenderingMode.FILL ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          ctx.fillText(character, x, y);
        }
        if (fillStrokeMode === TextRenderingMode.STROKE ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          ctx.strokeText(character, x, y);
        }
      }

      if (isAddToPathSet) {
        var paths = this.pendingTextPaths || (this.pendingTextPaths = []);
        paths.push({
          transform: ctx.mozCurrentTransform,
          x: x,
          y: y,
          fontSize: fontSize,
          addToPath: addToPath
        });
      }
    },

    get isFontSubpixelAAEnabled() {
      // Checks if anti-aliasing is enabled when scaled text is painted.
      // On Windows GDI scaled fonts looks bad.
      var ctx = document.createElement('canvas').getContext('2d');
      ctx.scale(1.5, 1);
      ctx.fillText('I', 0, 10);
      var data = ctx.getImageData(0, 0, 10, 10).data;
      var enabled = false;
      for (var i = 3; i < data.length; i += 4) {
        if (data[i] > 0 && data[i] < 255) {
          enabled = true;
          break;
        }
      }
      return shadow(this, 'isFontSubpixelAAEnabled', enabled);
    },

    showText: function CanvasGraphics_showText(glyphs) {
      var current = this.current;
      var font = current.font;
      if (font.isType3Font) {
        return this.showType3Text(glyphs);
      }

      var fontSize = current.fontSize;
      if (fontSize === 0) {
        return;
      }

      var ctx = this.ctx;
      var fontSizeScale = current.fontSizeScale;
      var charSpacing = current.charSpacing;
      var wordSpacing = current.wordSpacing;
      var fontDirection = current.fontDirection;
      var textHScale = current.textHScale * fontDirection;
      var glyphsLength = glyphs.length;
      var vertical = font.vertical;
      var defaultVMetrics = font.defaultVMetrics;
      var widthAdvanceScale = fontSize * current.fontMatrix[0];

      var simpleFillText =
        current.textRenderingMode === TextRenderingMode.FILL &&
        !font.disableFontFace;

      ctx.save();
      ctx.transform.apply(ctx, current.textMatrix);
      ctx.translate(current.x, current.y + current.textRise);

      if (fontDirection > 0) {
        ctx.scale(textHScale, -1);
      } else {
        ctx.scale(textHScale, 1);
      }

      var lineWidth = current.lineWidth;
      var scale = current.textMatrixScale;
      if (scale === 0 || lineWidth === 0) {
        lineWidth = this.getSinglePixelWidth();
      } else {
        lineWidth /= scale;
      }

      if (fontSizeScale !== 1.0) {
        ctx.scale(fontSizeScale, fontSizeScale);
        lineWidth /= fontSizeScale;
      }

      ctx.lineWidth = lineWidth;

      var x = 0, i;
      for (i = 0; i < glyphsLength; ++i) {
        var glyph = glyphs[i];
        if (glyph === null) {
          // word break
          x += fontDirection * wordSpacing;
          continue;
        } else if (isNum(glyph)) {
          x += -glyph * fontSize * 0.001;
          continue;
        }

        var restoreNeeded = false;
        var character = glyph.fontChar;
        var accent = glyph.accent;
        var scaledX, scaledY, scaledAccentX, scaledAccentY;
        var width = glyph.width;
        if (vertical) {
          var vmetric, vx, vy;
          vmetric = glyph.vmetric || defaultVMetrics;
          vx = glyph.vmetric ? vmetric[1] : width * 0.5;
          vx = -vx * widthAdvanceScale;
          vy = vmetric[2] * widthAdvanceScale;

          width = vmetric ? -vmetric[0] : width;
          scaledX = vx / fontSizeScale;
          scaledY = (x + vy) / fontSizeScale;
        } else {
          scaledX = x / fontSizeScale;
          scaledY = 0;
        }

        if (font.remeasure && width > 0 && this.isFontSubpixelAAEnabled) {
          // some standard fonts may not have the exact width, trying to
          // rescale per character
          var measuredWidth = ctx.measureText(character).width * 1000 /
            fontSize * fontSizeScale;
          var characterScaleX = width / measuredWidth;
          restoreNeeded = true;
          ctx.save();
          ctx.scale(characterScaleX, 1);
          scaledX /= characterScaleX;
        }

        if (simpleFillText && !accent) {
          // common case
          ctx.fillText(character, scaledX, scaledY);
        } else {
          this.paintChar(character, scaledX, scaledY);
          if (accent) {
            scaledAccentX = scaledX + accent.offset.x / fontSizeScale;
            scaledAccentY = scaledY - accent.offset.y / fontSizeScale;
            this.paintChar(accent.fontChar, scaledAccentX, scaledAccentY);
          }
        }

        var charWidth = width * widthAdvanceScale + charSpacing * fontDirection;
        x += charWidth;

        if (restoreNeeded) {
          ctx.restore();
        }
      }
      if (vertical) {
        current.y -= x * textHScale;
      } else {
        current.x += x * textHScale;
      }
      ctx.restore();
    },

    showType3Text: function CanvasGraphics_showType3Text(glyphs) {
      // Type3 fonts - each glyph is a "mini-PDF"
      var ctx = this.ctx;
      var current = this.current;
      var font = current.font;
      var fontSize = current.fontSize;
      var fontDirection = current.fontDirection;
      var charSpacing = current.charSpacing;
      var wordSpacing = current.wordSpacing;
      var textHScale = current.textHScale * fontDirection;
      var fontMatrix = current.fontMatrix || FONT_IDENTITY_MATRIX;
      var glyphsLength = glyphs.length;
      var isTextInvisible =
        current.textRenderingMode === TextRenderingMode.INVISIBLE;
      var i, glyph, width;

      if (isTextInvisible || fontSize === 0) {
        return;
      }

      ctx.save();
      ctx.transform.apply(ctx, current.textMatrix);
      ctx.translate(current.x, current.y);

      ctx.scale(textHScale, fontDirection);

      for (i = 0; i < glyphsLength; ++i) {
        glyph = glyphs[i];
        if (glyph === null) {
          // word break
          this.ctx.translate(wordSpacing, 0);
          current.x += wordSpacing * textHScale;
          continue;
        } else if (isNum(glyph)) {
          var spacingLength = -glyph * 0.001 * fontSize;
          this.ctx.translate(spacingLength, 0);
          current.x += spacingLength * textHScale;
          continue;
        }

        var operatorList = font.charProcOperatorList[glyph.operatorListId];
        if (!operatorList) {
          warn('Type3 character \"' + glyph.operatorListId +
               '\" is not available');
          continue;
        }
        this.processingType3 = glyph;
        this.save();
        ctx.scale(fontSize, fontSize);
        ctx.transform.apply(ctx, fontMatrix);
        this.executeOperatorList(operatorList);
        this.restore();

        var transformed = Util.applyTransform([glyph.width, 0], fontMatrix);
        width = transformed[0] * fontSize + charSpacing;

        ctx.translate(width, 0);
        current.x += width * textHScale;
      }
      ctx.restore();
      this.processingType3 = null;
    },

    // Type3 fonts
    setCharWidth: function CanvasGraphics_setCharWidth(xWidth, yWidth) {
      // We can safely ignore this since the width should be the same
      // as the width in the Widths array.
    },
    setCharWidthAndBounds: function CanvasGraphics_setCharWidthAndBounds(xWidth,
                                                                        yWidth,
                                                                        llx,
                                                                        lly,
                                                                        urx,
                                                                        ury) {
      // TODO According to the spec we're also suppose to ignore any operators
      // that set color or include images while processing this type3 font.
      this.ctx.rect(llx, lly, urx - llx, ury - lly);
      this.clip();
      this.endPath();
    },

    // Color
    getColorN_Pattern: function CanvasGraphics_getColorN_Pattern(IR) {
      var pattern;
      if (IR[0] === 'TilingPattern') {
        var color = IR[1];
        pattern = new TilingPattern(IR, color, this.ctx, this.objs,
                                    this.commonObjs, this.baseTransform);
      } else {
        pattern = getShadingPatternFromIR(IR);
      }
      return pattern;
    },
    setStrokeColorN: function CanvasGraphics_setStrokeColorN(/*...*/) {
      this.current.strokeColor = this.getColorN_Pattern(arguments);
    },
    setFillColorN: function CanvasGraphics_setFillColorN(/*...*/) {
      this.current.fillColor = this.getColorN_Pattern(arguments);
    },
    setStrokeRGBColor: function CanvasGraphics_setStrokeRGBColor(r, g, b) {
      var color = Util.makeCssRgb(arguments);
      this.ctx.strokeStyle = color;
      this.current.strokeColor = color;
    },
    setFillRGBColor: function CanvasGraphics_setFillRGBColor(r, g, b) {
      var color = Util.makeCssRgb(arguments);
      this.ctx.fillStyle = color;
      this.current.fillColor = color;
    },

    shadingFill: function CanvasGraphics_shadingFill(patternIR) {
      var ctx = this.ctx;

      this.save();
      var pattern = getShadingPatternFromIR(patternIR);
      ctx.fillStyle = pattern.getPattern(ctx, this, true);

      var inv = ctx.mozCurrentTransformInverse;
      if (inv) {
        var canvas = ctx.canvas;
        var width = canvas.width;
        var height = canvas.height;

        var bl = Util.applyTransform([0, 0], inv);
        var br = Util.applyTransform([0, height], inv);
        var ul = Util.applyTransform([width, 0], inv);
        var ur = Util.applyTransform([width, height], inv);

        var x0 = Math.min(bl[0], br[0], ul[0], ur[0]);
        var y0 = Math.min(bl[1], br[1], ul[1], ur[1]);
        var x1 = Math.max(bl[0], br[0], ul[0], ur[0]);
        var y1 = Math.max(bl[1], br[1], ul[1], ur[1]);

        this.ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      } else {
        // HACK to draw the gradient onto an infinite rectangle.
        // PDF gradients are drawn across the entire image while
        // Canvas only allows gradients to be drawn in a rectangle
        // The following bug should allow us to remove this.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=664884

        this.ctx.fillRect(-1e10, -1e10, 2e10, 2e10);
      }

      this.restore();
    },

    // Images
    beginInlineImage: function CanvasGraphics_beginInlineImage() {
      error('Should not call beginInlineImage');
    },
    beginImageData: function CanvasGraphics_beginImageData() {
      error('Should not call beginImageData');
    },

    paintFormXObjectBegin: function CanvasGraphics_paintFormXObjectBegin(matrix,
                                                                        bbox) {
      this.save();
      this.baseTransformStack.push(this.baseTransform);

      if (isArray(matrix) && 6 === matrix.length) {
        this.transform.apply(this, matrix);
      }

      this.baseTransform = this.ctx.mozCurrentTransform;

      if (isArray(bbox) && 4 === bbox.length) {
        var width = bbox[2] - bbox[0];
        var height = bbox[3] - bbox[1];
        this.ctx.rect(bbox[0], bbox[1], width, height);
        this.clip();
        this.endPath();
      }
    },

    paintFormXObjectEnd: function CanvasGraphics_paintFormXObjectEnd() {
      this.restore();
      this.baseTransform = this.baseTransformStack.pop();
    },

    beginGroup: function CanvasGraphics_beginGroup(group) {
      this.save();
      var currentCtx = this.ctx;
      // TODO non-isolated groups - according to Rik at adobe non-isolated
      // group results aren't usually that different and they even have tools
      // that ignore this setting. Notes from Rik on implmenting:
      // - When you encounter an transparency group, create a new canvas with
      // the dimensions of the bbox
      // - copy the content from the previous canvas to the new canvas
      // - draw as usual
      // - remove the backdrop alpha:
      // alphaNew = 1 - (1 - alpha)/(1 - alphaBackdrop) with 'alpha' the alpha
      // value of your transparency group and 'alphaBackdrop' the alpha of the
      // backdrop
      // - remove background color:
      // colorNew = color - alphaNew *colorBackdrop /(1 - alphaNew)
      if (!group.isolated) {
        info('TODO: Support non-isolated groups.');
      }

      // TODO knockout - supposedly possible with the clever use of compositing
      // modes.
      if (group.knockout) {
        warn('Knockout groups not supported.');
      }

      var currentTransform = currentCtx.mozCurrentTransform;
      if (group.matrix) {
        currentCtx.transform.apply(currentCtx, group.matrix);
      }
      assert(group.bbox, 'Bounding box is required.');

      // Based on the current transform figure out how big the bounding box
      // will actually be.
      var bounds = Util.getAxialAlignedBoundingBox(
                    group.bbox,
                    currentCtx.mozCurrentTransform);
      // Clip the bounding box to the current canvas.
      var canvasBounds = [0,
                          0,
                          currentCtx.canvas.width,
                          currentCtx.canvas.height];
      bounds = Util.intersect(bounds, canvasBounds) || [0, 0, 0, 0];
      // Use ceil in case we're between sizes so we don't create canvas that is
      // too small and make the canvas at least 1x1 pixels.
      var offsetX = Math.floor(bounds[0]);
      var offsetY = Math.floor(bounds[1]);
      var drawnWidth = Math.max(Math.ceil(bounds[2]) - offsetX, 1);
      var drawnHeight = Math.max(Math.ceil(bounds[3]) - offsetY, 1);
      var scaleX = 1, scaleY = 1;
      if (drawnWidth > MAX_GROUP_SIZE) {
        scaleX = drawnWidth / MAX_GROUP_SIZE;
        drawnWidth = MAX_GROUP_SIZE;
      }
      if (drawnHeight > MAX_GROUP_SIZE) {
        scaleY = drawnHeight / MAX_GROUP_SIZE;
        drawnHeight = MAX_GROUP_SIZE;
      }

      var cacheId = 'groupAt' + this.groupLevel;
      if (group.smask) {
        // Using two cache entries is case if masks are used one after another.
        cacheId +=  '_smask_' + ((this.smaskCounter++) % 2);
      }
      var scratchCanvas = CachedCanvases.getCanvas(
        cacheId, drawnWidth, drawnHeight, true);
      var groupCtx = scratchCanvas.context;

      // Since we created a new canvas that is just the size of the bounding box
      // we have to translate the group ctx.
      groupCtx.scale(1 / scaleX, 1 / scaleY);
      groupCtx.translate(-offsetX, -offsetY);
      groupCtx.transform.apply(groupCtx, currentTransform);

      if (group.smask) {
        // Saving state and cached mask to be used in setGState.
        this.smaskStack.push({
          canvas: scratchCanvas.canvas,
          context: groupCtx,
          offsetX: offsetX,
          offsetY: offsetY,
          scaleX: scaleX,
          scaleY: scaleY,
          subtype: group.smask.subtype,
          backdrop: group.smask.backdrop
        });
      } else {
        // Setup the current ctx so when the group is popped we draw it at the
        // right location.
        currentCtx.setTransform(1, 0, 0, 1, 0, 0);
        currentCtx.translate(offsetX, offsetY);
        currentCtx.scale(scaleX, scaleY);
      }
      // The transparency group inherits all off the current graphics state
      // except the blend mode, soft mask, and alpha constants.
      copyCtxState(currentCtx, groupCtx);
      this.ctx = groupCtx;
      this.setGState([
        ['BM', 'Normal'],
        ['ca', 1],
        ['CA', 1]
      ]);
      this.groupStack.push(currentCtx);
      this.groupLevel++;
    },

    endGroup: function CanvasGraphics_endGroup(group) {
      this.groupLevel--;
      var groupCtx = this.ctx;
      this.ctx = this.groupStack.pop();
      // Turn off image smoothing to avoid sub pixel interpolation which can
      // look kind of blurry for some pdfs.
      if (this.ctx.imageSmoothingEnabled !== undefined) {
        this.ctx.imageSmoothingEnabled = false;
      } else {
        this.ctx.mozImageSmoothingEnabled = false;
      }
      if (group.smask) {
        this.tempSMask = this.smaskStack.pop();
      } else {
        this.ctx.drawImage(groupCtx.canvas, 0, 0);
      }
      this.restore();
    },

    beginAnnotations: function CanvasGraphics_beginAnnotations() {
      this.save();
      this.current = new CanvasExtraState();
    },

    endAnnotations: function CanvasGraphics_endAnnotations() {
      this.restore();
    },

    beginAnnotation: function CanvasGraphics_beginAnnotation(rect, transform,
                                                             matrix) {
      this.save();

      if (isArray(rect) && 4 === rect.length) {
        var width = rect[2] - rect[0];
        var height = rect[3] - rect[1];
        this.ctx.rect(rect[0], rect[1], width, height);
        this.clip();
        this.endPath();
      }

      this.transform.apply(this, transform);
      this.transform.apply(this, matrix);
    },

    endAnnotation: function CanvasGraphics_endAnnotation() {
      this.restore();
    },

    paintJpegXObject: function CanvasGraphics_paintJpegXObject(objId, w, h) {
      var domImage = this.objs.get(objId);
      if (!domImage) {
        warn('Dependent image isn\'t ready yet');
        return;
      }

      this.save();

      var ctx = this.ctx;
      // scale the image to the unit square
      ctx.scale(1 / w, -1 / h);

      ctx.drawImage(domImage, 0, 0, domImage.width, domImage.height,
                    0, -h, w, h);
      if (this.imageLayer) {
        var currentTransform = ctx.mozCurrentTransformInverse;
        var position = this.getCanvasPosition(0, 0);
        this.imageLayer.appendImage({
          objId: objId,
          left: position[0],
          top: position[1],
          width: w / currentTransform[0],
          height: h / currentTransform[3]
        });
      }
      this.restore();
    },

    paintImageMaskXObject: function CanvasGraphics_paintImageMaskXObject(img) {
      var ctx = this.ctx;
      var width = img.width, height = img.height;

      var glyph = this.processingType3;

      if (COMPILE_TYPE3_GLYPHS && glyph && !('compiled' in glyph)) {
        var MAX_SIZE_TO_COMPILE = 1000;
        if (width <= MAX_SIZE_TO_COMPILE && height <= MAX_SIZE_TO_COMPILE) {
          glyph.compiled =
            compileType3Glyph({data: img.data, width: width, height: height});
        } else {
          glyph.compiled = null;
        }
      }

      if (glyph && glyph.compiled) {
        glyph.compiled(ctx);
        return;
      }

      var maskCanvas = CachedCanvases.getCanvas('maskCanvas', width, height);
      var maskCtx = maskCanvas.context;
      maskCtx.save();

      putBinaryImageMask(maskCtx, img);

      maskCtx.globalCompositeOperation = 'source-in';

      var fillColor = this.current.fillColor;
      maskCtx.fillStyle = (fillColor && fillColor.hasOwnProperty('type') &&
                          fillColor.type === 'Pattern') ?
                          fillColor.getPattern(maskCtx, this) : fillColor;
      maskCtx.fillRect(0, 0, width, height);

      maskCtx.restore();

      this.paintInlineImageXObject(maskCanvas.canvas);
    },

    paintImageMaskXObjectRepeat:
      function CanvasGraphics_paintImageMaskXObjectRepeat(imgData, scaleX,
                                                          scaleY, positions) {
      var width = imgData.width;
      var height = imgData.height;
      var ctx = this.ctx;

      var maskCanvas = CachedCanvases.getCanvas('maskCanvas', width, height);
      var maskCtx = maskCanvas.context;
      maskCtx.save();

      putBinaryImageMask(maskCtx, imgData);

      maskCtx.globalCompositeOperation = 'source-in';

      var fillColor = this.current.fillColor;
      maskCtx.fillStyle = (fillColor && fillColor.hasOwnProperty('type') &&
        fillColor.type === 'Pattern') ?
        fillColor.getPattern(maskCtx, this) : fillColor;
      maskCtx.fillRect(0, 0, width, height);

      maskCtx.restore();

      for (var i = 0, ii = positions.length; i < ii; i += 2) {
        ctx.save();
        ctx.transform(scaleX, 0, 0, scaleY, positions[i], positions[i + 1]);
        ctx.scale(1, -1);
        ctx.drawImage(maskCanvas.canvas, 0, 0, width, height,
          0, -1, 1, 1);
        ctx.restore();
      }
    },

    paintImageMaskXObjectGroup:
      function CanvasGraphics_paintImageMaskXObjectGroup(images) {
      var ctx = this.ctx;

      for (var i = 0, ii = images.length; i < ii; i++) {
        var image = images[i];
        var width = image.width, height = image.height;

        var maskCanvas = CachedCanvases.getCanvas('maskCanvas', width, height);
        var maskCtx = maskCanvas.context;
        maskCtx.save();

        putBinaryImageMask(maskCtx, image);

        maskCtx.globalCompositeOperation = 'source-in';

        var fillColor = this.current.fillColor;
        maskCtx.fillStyle = (fillColor && fillColor.hasOwnProperty('type') &&
                            fillColor.type === 'Pattern') ?
                            fillColor.getPattern(maskCtx, this) : fillColor;
        maskCtx.fillRect(0, 0, width, height);

        maskCtx.restore();

        ctx.save();
        ctx.transform.apply(ctx, image.transform);
        ctx.scale(1, -1);
        ctx.drawImage(maskCanvas.canvas, 0, 0, width, height,
                      0, -1, 1, 1);
        ctx.restore();
      }
    },

    paintImageXObject: function CanvasGraphics_paintImageXObject(objId) {
      var imgData = this.objs.get(objId);
      if (!imgData) {
        warn('Dependent image isn\'t ready yet');
        return;
      }

      this.paintInlineImageXObject(imgData);
    },

    paintImageXObjectRepeat:
      function CanvasGraphics_paintImageXObjectRepeat(objId, scaleX, scaleY,
                                                          positions) {
      var imgData = this.objs.get(objId);
      if (!imgData) {
        warn('Dependent image isn\'t ready yet');
        return;
      }

      var width = imgData.width;
      var height = imgData.height;
      var map = [];
      for (var i = 0, ii = positions.length; i < ii; i += 2) {
        map.push({transform: [scaleX, 0, 0, scaleY, positions[i],
                 positions[i + 1]], x: 0, y: 0, w: width, h: height});
      }
      this.paintInlineImageXObjectGroup(imgData, map);
    },

    paintInlineImageXObject:
      function CanvasGraphics_paintInlineImageXObject(imgData) {
      var width = imgData.width;
      var height = imgData.height;
      var ctx = this.ctx;

      this.save();
      // scale the image to the unit square
      ctx.scale(1 / width, -1 / height);

      var currentTransform = ctx.mozCurrentTransformInverse;
      var a = currentTransform[0], b = currentTransform[1];
      var widthScale = Math.max(Math.sqrt(a * a + b * b), 1);
      var c = currentTransform[2], d = currentTransform[3];
      var heightScale = Math.max(Math.sqrt(c * c + d * d), 1);

      var imgToPaint, tmpCanvas;
      // instanceof HTMLElement does not work in jsdom node.js module
      if (imgData instanceof HTMLElement || !imgData.data) {
        imgToPaint = imgData;
      } else {
        tmpCanvas = CachedCanvases.getCanvas('inlineImage', width, height);
        var tmpCtx = tmpCanvas.context;
        putBinaryImageData(tmpCtx, imgData);
        imgToPaint = tmpCanvas.canvas;
      }

      var paintWidth = width, paintHeight = height;
      var tmpCanvasId = 'prescale1';
      // Vertial or horizontal scaling shall not be more than 2 to not loose the
      // pixels during drawImage operation, painting on the temporary canvas(es)
      // that are twice smaller in size
      while ((widthScale > 2 && paintWidth > 1) ||
             (heightScale > 2 && paintHeight > 1)) {
        var newWidth = paintWidth, newHeight = paintHeight;
        if (widthScale > 2 && paintWidth > 1) {
          newWidth = Math.ceil(paintWidth / 2);
          widthScale /= paintWidth / newWidth;
        }
        if (heightScale > 2 && paintHeight > 1) {
          newHeight = Math.ceil(paintHeight / 2);
          heightScale /= paintHeight / newHeight;
        }
        tmpCanvas = CachedCanvases.getCanvas(tmpCanvasId, newWidth, newHeight);
        tmpCtx = tmpCanvas.context;
        tmpCtx.clearRect(0, 0, newWidth, newHeight);
        tmpCtx.drawImage(imgToPaint, 0, 0, paintWidth, paintHeight,
                                     0, 0, newWidth, newHeight);
        imgToPaint = tmpCanvas.canvas;
        paintWidth = newWidth;
        paintHeight = newHeight;
        tmpCanvasId = tmpCanvasId === 'prescale1' ? 'prescale2' : 'prescale1';
      }
      ctx.drawImage(imgToPaint, 0, 0, paintWidth, paintHeight,
                                0, -height, width, height);

      if (this.imageLayer) {
        var position = this.getCanvasPosition(0, -height);
        this.imageLayer.appendImage({
          imgData: imgData,
          left: position[0],
          top: position[1],
          width: width / currentTransform[0],
          height: height / currentTransform[3]
        });
      }
      this.restore();
    },

    paintInlineImageXObjectGroup:
      function CanvasGraphics_paintInlineImageXObjectGroup(imgData, map) {
      var ctx = this.ctx;
      var w = imgData.width;
      var h = imgData.height;

      var tmpCanvas = CachedCanvases.getCanvas('inlineImage', w, h);
      var tmpCtx = tmpCanvas.context;
      putBinaryImageData(tmpCtx, imgData);

      for (var i = 0, ii = map.length; i < ii; i++) {
        var entry = map[i];
        ctx.save();
        ctx.transform.apply(ctx, entry.transform);
        ctx.scale(1, -1);
        ctx.drawImage(tmpCanvas.canvas, entry.x, entry.y, entry.w, entry.h,
                      0, -1, 1, 1);
        if (this.imageLayer) {
          var position = this.getCanvasPosition(entry.x, entry.y);
          this.imageLayer.appendImage({
            imgData: imgData,
            left: position[0],
            top: position[1],
            width: w,
            height: h
          });
        }
        ctx.restore();
      }
    },

    paintSolidColorImageMask:
      function CanvasGraphics_paintSolidColorImageMask() {
        this.ctx.fillRect(0, 0, 1, 1);
    },

    // Marked content

    markPoint: function CanvasGraphics_markPoint(tag) {
      // TODO Marked content.
    },
    markPointProps: function CanvasGraphics_markPointProps(tag, properties) {
      // TODO Marked content.
    },
    beginMarkedContent: function CanvasGraphics_beginMarkedContent(tag) {
      // TODO Marked content.
    },
    beginMarkedContentProps: function CanvasGraphics_beginMarkedContentProps(
                                        tag, properties) {
      // TODO Marked content.
    },
    endMarkedContent: function CanvasGraphics_endMarkedContent() {
      // TODO Marked content.
    },

    // Compatibility

    beginCompat: function CanvasGraphics_beginCompat() {
      // TODO ignore undefined operators (should we do that anyway?)
    },
    endCompat: function CanvasGraphics_endCompat() {
      // TODO stop ignoring undefined operators
    },

    // Helper functions

    consumePath: function CanvasGraphics_consumePath() {
      var ctx = this.ctx;
      if (this.pendingClip) {
        if (this.pendingClip === EO_CLIP) {
          if (ctx.mozFillRule !== undefined) {
            ctx.mozFillRule = 'evenodd';
            ctx.clip();
            ctx.mozFillRule = 'nonzero';
          } else {
            try {
              ctx.clip('evenodd');
            } catch (ex) {
              // shouldn't really happen, but browsers might think differently
              ctx.clip();
            }
          }
        } else {
          ctx.clip();
        }
        this.pendingClip = null;
      }
      ctx.beginPath();
    },
    getSinglePixelWidth: function CanvasGraphics_getSinglePixelWidth(scale) {
      var inverse = this.ctx.mozCurrentTransformInverse;
      // max of the current horizontal and vertical scale
      return Math.sqrt(Math.max(
        (inverse[0] * inverse[0] + inverse[1] * inverse[1]),
        (inverse[2] * inverse[2] + inverse[3] * inverse[3])));
    },
    getCanvasPosition: function CanvasGraphics_getCanvasPosition(x, y) {
        var transform = this.ctx.mozCurrentTransform;
        return [
          transform[0] * x + transform[2] * y + transform[4],
          transform[1] * x + transform[3] * y + transform[5]
        ];
    }
  };

  for (var op in OPS) {
    CanvasGraphics.prototype[OPS[op]] = CanvasGraphics.prototype[op];
  }

  return CanvasGraphics;
})();



var WebGLUtils = (function WebGLUtilsClosure() {
  function loadShader(gl, code, shaderType) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      var errorMsg = gl.getShaderInfoLog(shader);
      throw new Error('Error during shader compilation: ' + errorMsg);
    }
    return shader;
  }
  function createVertexShader(gl, code) {
    return loadShader(gl, code, gl.VERTEX_SHADER);
  }
  function createFragmentShader(gl, code) {
    return loadShader(gl, code, gl.FRAGMENT_SHADER);
  }
  function createProgram(gl, shaders) {
    var program = gl.createProgram();
    for (var i = 0, ii = shaders.length; i < ii; ++i) {
      gl.attachShader(program, shaders[i]);
    }
    gl.linkProgram(program);
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      var errorMsg = gl.getProgramInfoLog(program);
      throw new Error('Error during program linking: ' + errorMsg);
    }
    return program;
  }
  function createTexture(gl, image, textureId) {
    gl.activeTexture(textureId);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    return texture;
  }

  var currentGL, currentCanvas;
  function generageGL() {
    if (currentGL) {
      return;
    }
    currentCanvas = document.createElement('canvas');
    currentGL = currentCanvas.getContext('webgl',
      { premultipliedalpha: false });
  }

  var smaskVertexShaderCode = '\
  attribute vec2 a_position;                                    \
  attribute vec2 a_texCoord;                                    \
                                                                \
  uniform vec2 u_resolution;                                    \
                                                                \
  varying vec2 v_texCoord;                                      \
                                                                \
  void main() {                                                 \
    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;   \
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);          \
                                                                \
    v_texCoord = a_texCoord;                                    \
  }                                                             ';

  var smaskFragmentShaderCode = '\
  precision mediump float;                                      \
                                                                \
  uniform vec4 u_backdrop;                                      \
  uniform int u_subtype;                                        \
  uniform sampler2D u_image;                                    \
  uniform sampler2D u_mask;                                     \
                                                                \
  varying vec2 v_texCoord;                                      \
                                                                \
  void main() {                                                 \
    vec4 imageColor = texture2D(u_image, v_texCoord);           \
    vec4 maskColor = texture2D(u_mask, v_texCoord);             \
    if (u_backdrop.a > 0.0) {                                   \
      maskColor.rgb = maskColor.rgb * maskColor.a +             \
                      u_backdrop.rgb * (1.0 - maskColor.a);     \
    }                                                           \
    float lum;                                                  \
    if (u_subtype == 0) {                                       \
      lum = maskColor.a;                                        \
    } else {                                                    \
      lum = maskColor.r * 0.3 + maskColor.g * 0.59 +            \
            maskColor.b * 0.11;                                 \
    }                                                           \
    imageColor.a *= lum;                                        \
    imageColor.rgb *= imageColor.a;                             \
    gl_FragColor = imageColor;                                  \
  }                                                             ';

  var smaskCache = null;

  function initSmaskGL() {
    var canvas, gl;

    generageGL();
    canvas = currentCanvas;
    currentCanvas = null;
    gl = currentGL;
    currentGL = null;

    // setup a GLSL program
    var vertexShader = createVertexShader(gl, smaskVertexShaderCode);
    var fragmentShader = createFragmentShader(gl, smaskFragmentShaderCode);
    var program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(program);

    var cache = {};
    cache.gl = gl;
    cache.canvas = canvas;
    cache.resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    cache.positionLocation = gl.getAttribLocation(program, 'a_position');
    cache.backdropLocation = gl.getUniformLocation(program, 'u_backdrop');
    cache.subtypeLocation = gl.getUniformLocation(program, 'u_subtype');

    var texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    var texLayerLocation = gl.getUniformLocation(program, 'u_image');
    var texMaskLocation = gl.getUniformLocation(program, 'u_mask');

    // provide texture coordinates for the rectangle.
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1i(texLayerLocation, 0);
    gl.uniform1i(texMaskLocation, 1);

    smaskCache = cache;
  }

  function composeSMask(layer, mask, properties) {
    var width = layer.width, height = layer.height;

    if (!smaskCache) {
      initSmaskGL();
    }
    var cache = smaskCache,canvas = cache.canvas, gl = cache.gl;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform2f(cache.resolutionLocation, width, height);

    if (properties.backdrop) {
      gl.uniform4f(cache.resolutionLocation, properties.backdrop[0],
                   properties.backdrop[1], properties.backdrop[2], 1);
    } else {
      gl.uniform4f(cache.resolutionLocation, 0, 0, 0, 0);
    }
    gl.uniform1i(cache.subtypeLocation,
                 properties.subtype === 'Luminosity' ? 1 : 0);

    // Create a textures
    var texture = createTexture(gl, layer, gl.TEXTURE0);
    var maskTexture = createTexture(gl, mask, gl.TEXTURE1);


    // Create a buffer and put a single clipspace rectangle in
    // it (2 triangles)
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 0,
      width, 0,
      0, height,
      0, height,
      width, 0,
      width, height]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(cache.positionLocation);
    gl.vertexAttribPointer(cache.positionLocation, 2, gl.FLOAT, false, 0, 0);

    // draw
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.flush();

    gl.deleteTexture(texture);
    gl.deleteTexture(maskTexture);
    gl.deleteBuffer(buffer);

    return canvas;
  }

  var figuresVertexShaderCode = '\
  attribute vec2 a_position;                                    \
  attribute vec3 a_color;                                       \
                                                                \
  uniform vec2 u_resolution;                                    \
  uniform vec2 u_scale;                                         \
  uniform vec2 u_offset;                                        \
                                                                \
  varying vec4 v_color;                                         \
                                                                \
  void main() {                                                 \
    vec2 position = (a_position + u_offset) * u_scale;          \
    vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;     \
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);          \
                                                                \
    v_color = vec4(a_color / 255.0, 1.0);                       \
  }                                                             ';

  var figuresFragmentShaderCode = '\
  precision mediump float;                                      \
                                                                \
  varying vec4 v_color;                                         \
                                                                \
  void main() {                                                 \
    gl_FragColor = v_color;                                     \
  }                                                             ';

  var figuresCache = null;

  function initFiguresGL() {
    var canvas, gl;

    generageGL();
    canvas = currentCanvas;
    currentCanvas = null;
    gl = currentGL;
    currentGL = null;

    // setup a GLSL program
    var vertexShader = createVertexShader(gl, figuresVertexShaderCode);
    var fragmentShader = createFragmentShader(gl, figuresFragmentShaderCode);
    var program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(program);

    var cache = {};
    cache.gl = gl;
    cache.canvas = canvas;
    cache.resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    cache.scaleLocation = gl.getUniformLocation(program, 'u_scale');
    cache.offsetLocation = gl.getUniformLocation(program, 'u_offset');
    cache.positionLocation = gl.getAttribLocation(program, 'a_position');
    cache.colorLocation = gl.getAttribLocation(program, 'a_color');

    figuresCache = cache;
  }

  function drawFigures(width, height, backgroundColor, figures, context) {
    if (!figuresCache) {
      initFiguresGL();
    }
    var cache = figuresCache, canvas = cache.canvas, gl = cache.gl;

    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform2f(cache.resolutionLocation, width, height);

    // count triangle points
    var count = 0;
    var i, ii, rows;
    for (i = 0, ii = figures.length; i < ii; i++) {
      switch (figures[i].type) {
        case 'lattice':
          rows = (figures[i].coords.length / figures[i].verticesPerRow) | 0;
          count += (rows - 1) * (figures[i].verticesPerRow - 1) * 6;
          break;
        case 'triangles':
          count += figures[i].coords.length;
          break;
      }
    }
    // transfer data
    var coords = new Float32Array(count * 2);
    var colors = new Uint8Array(count * 3);
    var coordsMap = context.coords, colorsMap = context.colors;
    var pIndex = 0, cIndex = 0;
    for (i = 0, ii = figures.length; i < ii; i++) {
      var figure = figures[i], ps = figure.coords, cs = figure.colors;
      switch (figure.type) {
        case 'lattice':
          var cols = figure.verticesPerRow;
          rows = (ps.length / cols) | 0;
          for (var row = 1; row < rows; row++) {
            var offset = row * cols + 1;
            for (var col = 1; col < cols; col++, offset++) {
              coords[pIndex] = coordsMap[ps[offset - cols - 1]];
              coords[pIndex + 1] = coordsMap[ps[offset - cols - 1] + 1];
              coords[pIndex + 2] = coordsMap[ps[offset - cols]];
              coords[pIndex + 3] = coordsMap[ps[offset - cols] + 1];
              coords[pIndex + 4] = coordsMap[ps[offset - 1]];
              coords[pIndex + 5] = coordsMap[ps[offset - 1] + 1];
              colors[cIndex] = colorsMap[cs[offset - cols - 1]];
              colors[cIndex + 1] = colorsMap[cs[offset - cols - 1] + 1];
              colors[cIndex + 2] = colorsMap[cs[offset - cols - 1] + 2];
              colors[cIndex + 3] = colorsMap[cs[offset - cols]];
              colors[cIndex + 4] = colorsMap[cs[offset - cols] + 1];
              colors[cIndex + 5] = colorsMap[cs[offset - cols] + 2];
              colors[cIndex + 6] = colorsMap[cs[offset - 1]];
              colors[cIndex + 7] = colorsMap[cs[offset - 1] + 1];
              colors[cIndex + 8] = colorsMap[cs[offset - 1] + 2];

              coords[pIndex + 6] = coords[pIndex + 2];
              coords[pIndex + 7] = coords[pIndex + 3];
              coords[pIndex + 8] = coords[pIndex + 4];
              coords[pIndex + 9] = coords[pIndex + 5];
              coords[pIndex + 10] = coordsMap[ps[offset]];
              coords[pIndex + 11] = coordsMap[ps[offset] + 1];
              colors[cIndex + 9] = colors[cIndex + 3];
              colors[cIndex + 10] = colors[cIndex + 4];
              colors[cIndex + 11] = colors[cIndex + 5];
              colors[cIndex + 12] = colors[cIndex + 6];
              colors[cIndex + 13] = colors[cIndex + 7];
              colors[cIndex + 14] = colors[cIndex + 8];
              colors[cIndex + 15] = colorsMap[cs[offset]];
              colors[cIndex + 16] = colorsMap[cs[offset] + 1];
              colors[cIndex + 17] = colorsMap[cs[offset] + 2];
              pIndex += 12;
              cIndex += 18;
            }
          }
          break;
        case 'triangles':
          for (var j = 0, jj = ps.length; j < jj; j++) {
            coords[pIndex] = coordsMap[ps[j]];
            coords[pIndex + 1] = coordsMap[ps[j] + 1];
            colors[cIndex] = colorsMap[cs[i]];
            colors[cIndex + 1] = colorsMap[cs[j] + 1];
            colors[cIndex + 2] = colorsMap[cs[j] + 2];
            pIndex += 2;
            cIndex += 3;
          }
          break;
      }
    }

    // draw
    if (backgroundColor) {
      gl.clearColor(backgroundColor[0] / 255, backgroundColor[1] / 255,
                    backgroundColor[2] / 255, 1.0);
    } else {
      gl.clearColor(0, 0, 0, 0);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);

    var coordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(cache.positionLocation);
    gl.vertexAttribPointer(cache.positionLocation, 2, gl.FLOAT, false, 0, 0);

    var colorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(cache.colorLocation);
    gl.vertexAttribPointer(cache.colorLocation, 3, gl.UNSIGNED_BYTE, false,
                           0, 0);

    gl.uniform2f(cache.scaleLocation, context.scaleX, context.scaleY);
    gl.uniform2f(cache.offsetLocation, context.offsetX, context.offsetY);

    gl.drawArrays(gl.TRIANGLES, 0, count);

    gl.flush();

    gl.deleteBuffer(coordsBuffer);
    gl.deleteBuffer(colorsBuffer);

    return canvas;
  }

  function cleanup() {
    if (smaskCache && smaskCache.canvas) {
      smaskCache.canvas.width = 0;
      smaskCache.canvas.height = 0;
    }
    if (figuresCache && figuresCache.canvas) {
      figuresCache.canvas.width = 0;
      figuresCache.canvas.height = 0;
    }
    smaskCache = null;
    figuresCache = null;
  }

  return {
    get isEnabled() {
      if (PDFJS.disableWebGL) {
        return false;
      }
      var enabled = false;
      try {
        generageGL();
        enabled = !!currentGL;
      } catch (e) { }
      return shadow(this, 'isEnabled', enabled);
    },
    composeSMask: composeSMask,
    drawFigures: drawFigures,
    clear: cleanup
  };
})();


var ShadingIRs = {};

ShadingIRs.RadialAxial = {
  fromIR: function RadialAxial_fromIR(raw) {
    var type = raw[1];
    var colorStops = raw[2];
    var p0 = raw[3];
    var p1 = raw[4];
    var r0 = raw[5];
    var r1 = raw[6];
    return {
      type: 'Pattern',
      getPattern: function RadialAxial_getPattern(ctx) {
        var grad;
        if (type === 'axial') {
          grad = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
        } else if (type === 'radial') {
          grad = ctx.createRadialGradient(p0[0], p0[1], r0, p1[0], p1[1], r1);
        }

        for (var i = 0, ii = colorStops.length; i < ii; ++i) {
          var c = colorStops[i];
          grad.addColorStop(c[0], c[1]);
        }
        return grad;
      }
    };
  }
};

var createMeshCanvas = (function createMeshCanvasClosure() {
  function drawTriangle(data, context, p1, p2, p3, c1, c2, c3) {
    // Very basic Gouraud-shaded triangle rasterization algorithm.
    var coords = context.coords, colors = context.colors;
    var bytes = data.data, rowSize = data.width * 4;
    var tmp;
    if (coords[p1 + 1] > coords[p2 + 1]) {
      tmp = p1; p1 = p2; p2 = tmp; tmp = c1; c1 = c2; c2 = tmp;
    }
    if (coords[p2 + 1] > coords[p3 + 1]) {
      tmp = p2; p2 = p3; p3 = tmp; tmp = c2; c2 = c3; c3 = tmp;
    }
    if (coords[p1 + 1] > coords[p2 + 1]) {
      tmp = p1; p1 = p2; p2 = tmp; tmp = c1; c1 = c2; c2 = tmp;
    }
    var x1 = (coords[p1] + context.offsetX) * context.scaleX;
    var y1 = (coords[p1 + 1] + context.offsetY) * context.scaleY;
    var x2 = (coords[p2] + context.offsetX) * context.scaleX;
    var y2 = (coords[p2 + 1] + context.offsetY) * context.scaleY;
    var x3 = (coords[p3] + context.offsetX) * context.scaleX;
    var y3 = (coords[p3 + 1] + context.offsetY) * context.scaleY;
    if (y1 >= y3) {
      return;
    }
    var c1r = colors[c1], c1g = colors[c1 + 1], c1b = colors[c1 + 2];
    var c2r = colors[c2], c2g = colors[c2 + 1], c2b = colors[c2 + 2];
    var c3r = colors[c3], c3g = colors[c3 + 1], c3b = colors[c3 + 2];

    var minY = Math.round(y1), maxY = Math.round(y3);
    var xa, car, cag, cab;
    var xb, cbr, cbg, cbb;
    var k;
    for (var y = minY; y <= maxY; y++) {
      if (y < y2) {
        k = y < y1 ? 0 : y1 === y2 ? 1 : (y1 - y) / (y1 - y2);
        xa = x1 - (x1 - x2) * k;
        car = c1r - (c1r - c2r) * k;
        cag = c1g - (c1g - c2g) * k;
        cab = c1b - (c1b - c2b) * k;
      } else {
        k = y > y3 ? 1 : y2 === y3 ? 0 : (y2 - y) / (y2 - y3);
        xa = x2 - (x2 - x3) * k;
        car = c2r - (c2r - c3r) * k;
        cag = c2g - (c2g - c3g) * k;
        cab = c2b - (c2b - c3b) * k;
      }
      k = y < y1 ? 0 : y > y3 ? 1 : (y1 - y) / (y1 - y3);
      xb = x1 - (x1 - x3) * k;
      cbr = c1r - (c1r - c3r) * k;
      cbg = c1g - (c1g - c3g) * k;
      cbb = c1b - (c1b - c3b) * k;
      var x1_ = Math.round(Math.min(xa, xb));
      var x2_ = Math.round(Math.max(xa, xb));
      var j = rowSize * y + x1_ * 4;
      for (var x = x1_; x <= x2_; x++) {
        k = (xa - x) / (xa - xb);
        k = k < 0 ? 0 : k > 1 ? 1 : k;
        bytes[j++] = (car - (car - cbr) * k) | 0;
        bytes[j++] = (cag - (cag - cbg) * k) | 0;
        bytes[j++] = (cab - (cab - cbb) * k) | 0;
        bytes[j++] = 255;
      }
    }
  }

  function drawFigure(data, figure, context) {
    var ps = figure.coords;
    var cs = figure.colors;
    var i, ii;
    switch (figure.type) {
      case 'lattice':
        var verticesPerRow = figure.verticesPerRow;
        var rows = Math.floor(ps.length / verticesPerRow) - 1;
        var cols = verticesPerRow - 1;
        for (i = 0; i < rows; i++) {
          var q = i * verticesPerRow;
          for (var j = 0; j < cols; j++, q++) {
            drawTriangle(data, context,
              ps[q], ps[q + 1], ps[q + verticesPerRow],
              cs[q], cs[q + 1], cs[q + verticesPerRow]);
            drawTriangle(data, context,
              ps[q + verticesPerRow + 1], ps[q + 1], ps[q + verticesPerRow],
              cs[q + verticesPerRow + 1], cs[q + 1], cs[q + verticesPerRow]);
          }
        }
        break;
      case 'triangles':
        for (i = 0, ii = ps.length; i < ii; i += 3) {
          drawTriangle(data, context,
            ps[i], ps[i + 1], ps[i + 2],
            cs[i], cs[i + 1], cs[i + 2]);
        }
        break;
      default:
        error('illigal figure');
        break;
    }
  }

  function createMeshCanvas(bounds, combinesScale, coords, colors, figures,
                            backgroundColor) {
    // we will increase scale on some weird factor to let antialiasing take
    // care of "rough" edges
    var EXPECTED_SCALE = 1.1;
    // MAX_PATTERN_SIZE is used to avoid OOM situation.
    var MAX_PATTERN_SIZE = 3000; // 10in @ 300dpi shall be enough

    var offsetX = Math.floor(bounds[0]);
    var offsetY = Math.floor(bounds[1]);
    var boundsWidth = Math.ceil(bounds[2]) - offsetX;
    var boundsHeight = Math.ceil(bounds[3]) - offsetY;

    var width = Math.min(Math.ceil(Math.abs(boundsWidth * combinesScale[0] *
      EXPECTED_SCALE)), MAX_PATTERN_SIZE);
    var height = Math.min(Math.ceil(Math.abs(boundsHeight * combinesScale[1] *
      EXPECTED_SCALE)), MAX_PATTERN_SIZE);
    var scaleX = boundsWidth / width;
    var scaleY = boundsHeight / height;

    var context = {
      coords: coords,
      colors: colors,
      offsetX: -offsetX,
      offsetY: -offsetY,
      scaleX: 1 / scaleX,
      scaleY: 1 / scaleY
    };

    var canvas, tmpCanvas, i, ii;
    if (WebGLUtils.isEnabled) {
      canvas = WebGLUtils.drawFigures(width, height, backgroundColor,
                                      figures, context);

      // https://bugzilla.mozilla.org/show_bug.cgi?id=972126
      tmpCanvas = CachedCanvases.getCanvas('mesh', width, height, false);
      tmpCanvas.context.drawImage(canvas, 0, 0);
      canvas = tmpCanvas.canvas;
    } else {
      tmpCanvas = CachedCanvases.getCanvas('mesh', width, height, false);
      var tmpCtx = tmpCanvas.context;

      var data = tmpCtx.createImageData(width, height);
      if (backgroundColor) {
        var bytes = data.data;
        for (i = 0, ii = bytes.length; i < ii; i += 4) {
          bytes[i] = backgroundColor[0];
          bytes[i + 1] = backgroundColor[1];
          bytes[i + 2] = backgroundColor[2];
          bytes[i + 3] = 255;
        }
      }
      for (i = 0; i < figures.length; i++) {
        drawFigure(data, figures[i], context);
      }
      tmpCtx.putImageData(data, 0, 0);
      canvas = tmpCanvas.canvas;
    }

    return {canvas: canvas, offsetX: offsetX, offsetY: offsetY,
            scaleX: scaleX, scaleY: scaleY};
  }
  return createMeshCanvas;
})();

ShadingIRs.Mesh = {
  fromIR: function Mesh_fromIR(raw) {
    //var type = raw[1];
    var coords = raw[2];
    var colors = raw[3];
    var figures = raw[4];
    var bounds = raw[5];
    var matrix = raw[6];
    //var bbox = raw[7];
    var background = raw[8];
    return {
      type: 'Pattern',
      getPattern: function Mesh_getPattern(ctx, owner, shadingFill) {
        var scale;
        if (shadingFill) {
          scale = Util.singularValueDecompose2dScale(ctx.mozCurrentTransform);
        } else {
          // Obtain scale from matrix and current transformation matrix.
          scale = Util.singularValueDecompose2dScale(owner.baseTransform);
          if (matrix) {
            var matrixScale = Util.singularValueDecompose2dScale(matrix);
            scale = [scale[0] * matrixScale[0],
                     scale[1] * matrixScale[1]];
          }
        }


        // Rasterizing on the main thread since sending/queue large canvases
        // might cause OOM.
        var temporaryPatternCanvas = createMeshCanvas(bounds, scale, coords,
          colors, figures, shadingFill ? null : background);

        if (!shadingFill) {
          ctx.setTransform.apply(ctx, owner.baseTransform);
          if (matrix) {
            ctx.transform.apply(ctx, matrix);
          }
        }

        ctx.translate(temporaryPatternCanvas.offsetX,
                      temporaryPatternCanvas.offsetY);
        ctx.scale(temporaryPatternCanvas.scaleX,
                  temporaryPatternCanvas.scaleY);

        return ctx.createPattern(temporaryPatternCanvas.canvas, 'no-repeat');
      }
    };
  }
};

ShadingIRs.Dummy = {
  fromIR: function Dummy_fromIR() {
    return {
      type: 'Pattern',
      getPattern: function Dummy_fromIR_getPattern() {
        return 'hotpink';
      }
    };
  }
};

function getShadingPatternFromIR(raw) {
  var shadingIR = ShadingIRs[raw[0]];
  if (!shadingIR) {
    error('Unknown IR type: ' + raw[0]);
  }
  return shadingIR.fromIR(raw);
}

var TilingPattern = (function TilingPatternClosure() {
  var PaintType = {
    COLORED: 1,
    UNCOLORED: 2
  };

  var MAX_PATTERN_SIZE = 3000; // 10in @ 300dpi shall be enough

  function TilingPattern(IR, color, ctx, objs, commonObjs, baseTransform) {
    this.operatorList = IR[2];
    this.matrix = IR[3] || [1, 0, 0, 1, 0, 0];
    this.bbox = IR[4];
    this.xstep = IR[5];
    this.ystep = IR[6];
    this.paintType = IR[7];
    this.tilingType = IR[8];
    this.color = color;
    this.objs = objs;
    this.commonObjs = commonObjs;
    this.baseTransform = baseTransform;
    this.type = 'Pattern';
    this.ctx = ctx;
  }

  TilingPattern.prototype = {
    createPatternCanvas: function TilinPattern_createPatternCanvas(owner) {
      var operatorList = this.operatorList;
      var bbox = this.bbox;
      var xstep = this.xstep;
      var ystep = this.ystep;
      var paintType = this.paintType;
      var tilingType = this.tilingType;
      var color = this.color;
      var objs = this.objs;
      var commonObjs = this.commonObjs;

      info('TilingType: ' + tilingType);

      var x0 = bbox[0], y0 = bbox[1], x1 = bbox[2], y1 = bbox[3];

      var topLeft = [x0, y0];
      // we want the canvas to be as large as the step size
      var botRight = [x0 + xstep, y0 + ystep];

      var width = botRight[0] - topLeft[0];
      var height = botRight[1] - topLeft[1];

      // Obtain scale from matrix and current transformation matrix.
      var matrixScale = Util.singularValueDecompose2dScale(this.matrix);
      var curMatrixScale = Util.singularValueDecompose2dScale(
        this.baseTransform);
      var combinedScale = [matrixScale[0] * curMatrixScale[0],
        matrixScale[1] * curMatrixScale[1]];

      // MAX_PATTERN_SIZE is used to avoid OOM situation.
      // Use width and height values that are as close as possible to the end
      // result when the pattern is used. Too low value makes the pattern look
      // blurry. Too large value makes it look too crispy.
      width = Math.min(Math.ceil(Math.abs(width * combinedScale[0])),
        MAX_PATTERN_SIZE);

      height = Math.min(Math.ceil(Math.abs(height * combinedScale[1])),
        MAX_PATTERN_SIZE);

      var tmpCanvas = CachedCanvases.getCanvas('pattern', width, height, true);
      var tmpCtx = tmpCanvas.context;
      var graphics = new CanvasGraphics(tmpCtx, commonObjs, objs);
      graphics.groupLevel = owner.groupLevel;

      this.setFillAndStrokeStyleToContext(tmpCtx, paintType, color);

      this.setScale(width, height, xstep, ystep);
      this.transformToScale(graphics);

      // transform coordinates to pattern space
      var tmpTranslate = [1, 0, 0, 1, -topLeft[0], -topLeft[1]];
      graphics.transform.apply(graphics, tmpTranslate);

      this.clipBbox(graphics, bbox, x0, y0, x1, y1);

      graphics.executeOperatorList(operatorList);
      return tmpCanvas.canvas;
    },

    setScale: function TilingPattern_setScale(width, height, xstep, ystep) {
      this.scale = [width / xstep, height / ystep];
    },

    transformToScale: function TilingPattern_transformToScale(graphics) {
      var scale = this.scale;
      var tmpScale = [scale[0], 0, 0, scale[1], 0, 0];
      graphics.transform.apply(graphics, tmpScale);
    },

    scaleToContext: function TilingPattern_scaleToContext() {
      var scale = this.scale;
      this.ctx.scale(1 / scale[0], 1 / scale[1]);
    },

    clipBbox: function clipBbox(graphics, bbox, x0, y0, x1, y1) {
      if (bbox && isArray(bbox) && bbox.length === 4) {
        var bboxWidth = x1 - x0;
        var bboxHeight = y1 - y0;
        graphics.ctx.rect(x0, y0, bboxWidth, bboxHeight);
        graphics.clip();
        graphics.endPath();
      }
    },

    setFillAndStrokeStyleToContext:
      function setFillAndStrokeStyleToContext(context, paintType, color) {
        switch (paintType) {
          case PaintType.COLORED:
            var ctx = this.ctx;
            context.fillStyle = ctx.fillStyle;
            context.strokeStyle = ctx.strokeStyle;
            break;
          case PaintType.UNCOLORED:
            var cssColor = Util.makeCssRgb(color);
            context.fillStyle = cssColor;
            context.strokeStyle = cssColor;
            break;
          default:
            error('Unsupported paint type: ' + paintType);
        }
      },

    getPattern: function TilingPattern_getPattern(ctx, owner) {
      var temporaryPatternCanvas = this.createPatternCanvas(owner);

      ctx = this.ctx;
      ctx.setTransform.apply(ctx, this.baseTransform);
      ctx.transform.apply(ctx, this.matrix);
      this.scaleToContext();

      return ctx.createPattern(temporaryPatternCanvas, 'repeat');
    }
  };

  return TilingPattern;
})();


PDFJS.disableFontFace = false;

var FontLoader = {
  insertRule: function fontLoaderInsertRule(rule) {
    var styleElement = document.getElementById('PDFJS_FONT_STYLE_TAG');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'PDFJS_FONT_STYLE_TAG';
      document.documentElement.getElementsByTagName('head')[0].appendChild(
        styleElement);
    }

    var styleSheet = styleElement.sheet;
    styleSheet.insertRule(rule, styleSheet.cssRules.length);
  },

  clear: function fontLoaderClear() {
    var styleElement = document.getElementById('PDFJS_FONT_STYLE_TAG');
    if (styleElement) {
      styleElement.parentNode.removeChild(styleElement);
    }
    this.nativeFontFaces.forEach(function(nativeFontFace) {
      document.fonts.delete(nativeFontFace);
    });
    this.nativeFontFaces.length = 0;
  },
  get loadTestFont() {
    // This is a CFF font with 1 glyph for '.' that fills its entire width and
    // height.
    return shadow(this, 'loadTestFont', atob(
      'T1RUTwALAIAAAwAwQ0ZGIDHtZg4AAAOYAAAAgUZGVE1lkzZwAAAEHAAAABxHREVGABQAFQ' +
      'AABDgAAAAeT1MvMlYNYwkAAAEgAAAAYGNtYXABDQLUAAACNAAAAUJoZWFk/xVFDQAAALwA' +
      'AAA2aGhlYQdkA+oAAAD0AAAAJGhtdHgD6AAAAAAEWAAAAAZtYXhwAAJQAAAAARgAAAAGbm' +
      'FtZVjmdH4AAAGAAAAAsXBvc3T/hgAzAAADeAAAACAAAQAAAAEAALZRFsRfDzz1AAsD6AAA' +
      'AADOBOTLAAAAAM4KHDwAAAAAA+gDIQAAAAgAAgAAAAAAAAABAAADIQAAAFoD6AAAAAAD6A' +
      'ABAAAAAAAAAAAAAAAAAAAAAQAAUAAAAgAAAAQD6AH0AAUAAAKKArwAAACMAooCvAAAAeAA' +
      'MQECAAACAAYJAAAAAAAAAAAAAQAAAAAAAAAAAAAAAFBmRWQAwAAuAC4DIP84AFoDIQAAAA' +
      'AAAQAAAAAAAAAAACAAIAABAAAADgCuAAEAAAAAAAAAAQAAAAEAAAAAAAEAAQAAAAEAAAAA' +
      'AAIAAQAAAAEAAAAAAAMAAQAAAAEAAAAAAAQAAQAAAAEAAAAAAAUAAQAAAAEAAAAAAAYAAQ' +
      'AAAAMAAQQJAAAAAgABAAMAAQQJAAEAAgABAAMAAQQJAAIAAgABAAMAAQQJAAMAAgABAAMA' +
      'AQQJAAQAAgABAAMAAQQJAAUAAgABAAMAAQQJAAYAAgABWABYAAAAAAAAAwAAAAMAAAAcAA' +
      'EAAAAAADwAAwABAAAAHAAEACAAAAAEAAQAAQAAAC7//wAAAC7////TAAEAAAAAAAABBgAA' +
      'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAA' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAA' +
      'AAAAD/gwAyAAAAAQAAAAAAAAAAAAAAAAAAAAABAAQEAAEBAQJYAAEBASH4DwD4GwHEAvgc' +
      'A/gXBIwMAYuL+nz5tQXkD5j3CBLnEQACAQEBIVhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWF' +
      'hYWFhYWFhYAAABAQAADwACAQEEE/t3Dov6fAH6fAT+fPp8+nwHDosMCvm1Cvm1DAz6fBQA' +
      'AAAAAAABAAAAAMmJbzEAAAAAzgTjFQAAAADOBOQpAAEAAAAAAAAADAAUAAQAAAABAAAAAg' +
      'ABAAAAAAAAAAAD6AAAAAAAAA=='
    ));
  },

  loadTestFontId: 0,

  loadingContext: {
    requests: [],
    nextRequestId: 0
  },

  isSyncFontLoadingSupported: (function detectSyncFontLoadingSupport() {
    if (isWorker) {
      return false;
    }

    // User agent string sniffing is bad, but there is no reliable way to tell
    // if font is fully loaded and ready to be used with canvas.
    var userAgent = window.navigator.userAgent;
    var m = /Mozilla\/5.0.*?rv:(\d+).*? Gecko/.exec(userAgent);
    if (m && m[1] >= 14) {
      return true;
    }
    // TODO other browsers
    if (userAgent === 'node') {
      return true;
    }
    return false;
  })(),

  nativeFontFaces: [],

  isFontLoadingAPISupported: !isWorker && !!document.fonts,

  addNativeFontFace: function fontLoader_addNativeFontFace(nativeFontFace) {
    this.nativeFontFaces.push(nativeFontFace);
    document.fonts.add(nativeFontFace);
  },

  bind: function fontLoaderBind(fonts, callback) {
    assert(!isWorker, 'bind() shall be called from main thread');

    var rules = [];
    var fontsToLoad = [];
    var fontLoadPromises = [];
    for (var i = 0, ii = fonts.length; i < ii; i++) {
      var font = fonts[i];

      // Add the font to the DOM only once or skip if the font
      // is already loaded.
      if (font.attached || font.loading === false) {
        continue;
      }
      font.attached = true;

      if (this.isFontLoadingAPISupported) {
        var nativeFontFace = font.createNativeFontFace();
        if (nativeFontFace) {
          fontLoadPromises.push(nativeFontFace.loaded);
        }
      } else {
        var rule = font.bindDOM();
        if (rule) {
          rules.push(rule);
          fontsToLoad.push(font);
        }
      }
    }

    var request = FontLoader.queueLoadingCallback(callback);
    if (this.isFontLoadingAPISupported) {
      Promise.all(fontsToLoad).then(function() {
        request.complete();
      });
    } else if (rules.length > 0 && !this.isSyncFontLoadingSupported) {
      FontLoader.prepareFontLoadEvent(rules, fontsToLoad, request);
    } else {
      request.complete();
    }
  },

  queueLoadingCallback: function FontLoader_queueLoadingCallback(callback) {
    function LoadLoader_completeRequest() {
      assert(!request.end, 'completeRequest() cannot be called twice');
      request.end = Date.now();

      // sending all completed requests in order how they were queued
      while (context.requests.length > 0 && context.requests[0].end) {
        var otherRequest = context.requests.shift();
        setTimeout(otherRequest.callback, 0);
      }
    }

    var context = FontLoader.loadingContext;
    var requestId = 'pdfjs-font-loading-' + (context.nextRequestId++);
    var request = {
      id: requestId,
      complete: LoadLoader_completeRequest,
      callback: callback,
      started: Date.now()
    };
    context.requests.push(request);
    return request;
  },

  prepareFontLoadEvent: function fontLoaderPrepareFontLoadEvent(rules,
                                                                fonts,
                                                                request) {
      /** Hack begin */
      // There's currently no event when a font has finished downloading so the
      // following code is a dirty hack to 'guess' when a font is
      // ready. It's assumed fonts are loaded in order, so add a known test
      // font after the desired fonts and then test for the loading of that
      // test font.

      function int32(data, offset) {
        return (data.charCodeAt(offset) << 24) |
               (data.charCodeAt(offset + 1) << 16) |
               (data.charCodeAt(offset + 2) << 8) |
               (data.charCodeAt(offset + 3) & 0xff);
      }

      function spliceString(s, offset, remove, insert) {
        var chunk1 = s.substr(0, offset);
        var chunk2 = s.substr(offset + remove);
        return chunk1 + insert + chunk2;
      }

      var i, ii;

      var canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      var ctx = canvas.getContext('2d');

      var called = 0;
      function isFontReady(name, callback) {
        called++;
        // With setTimeout clamping this gives the font ~100ms to load.
        if(called > 30) {
          warn('Load test font never loaded.');
          callback();
          return;
        }
        ctx.font = '30px ' + name;
        ctx.fillText('.', 0, 20);
        var imageData = ctx.getImageData(0, 0, 1, 1);
        if (imageData.data[3] > 0) {
          callback();
          return;
        }
        setTimeout(isFontReady.bind(null, name, callback));
      }

      var loadTestFontId = 'lt' + Date.now() + this.loadTestFontId++;
      // Chromium seems to cache fonts based on a hash of the actual font data,
      // so the font must be modified for each load test else it will appear to
      // be loaded already.
      // TODO: This could maybe be made faster by avoiding the btoa of the full
      // font by splitting it in chunks before hand and padding the font id.
      var data = this.loadTestFont;
      var COMMENT_OFFSET = 976; // has to be on 4 byte boundary (for checksum)
      data = spliceString(data, COMMENT_OFFSET, loadTestFontId.length,
                          loadTestFontId);
      // CFF checksum is important for IE, adjusting it
      var CFF_CHECKSUM_OFFSET = 16;
      var XXXX_VALUE = 0x58585858; // the "comment" filled with 'X'
      var checksum = int32(data, CFF_CHECKSUM_OFFSET);
      for (i = 0, ii = loadTestFontId.length - 3; i < ii; i += 4) {
        checksum = (checksum - XXXX_VALUE + int32(loadTestFontId, i)) | 0;
      }
      if (i < loadTestFontId.length) { // align to 4 bytes boundary
        checksum = (checksum - XXXX_VALUE +
                    int32(loadTestFontId + 'XXX', i)) | 0;
      }
      data = spliceString(data, CFF_CHECKSUM_OFFSET, 4, string32(checksum));

      var url = 'url(data:font/opentype;base64,' + btoa(data) + ');';
      var rule = '@font-face { font-family:"' + loadTestFontId + '";src:' +
                 url + '}';
      FontLoader.insertRule(rule);

      var names = [];
      for (i = 0, ii = fonts.length; i < ii; i++) {
        names.push(fonts[i].loadedName);
      }
      names.push(loadTestFontId);

      var div = document.createElement('div');
      div.setAttribute('style',
                       'visibility: hidden;' +
                       'width: 10px; height: 10px;' +
                       'position: absolute; top: 0px; left: 0px;');
      for (i = 0, ii = names.length; i < ii; ++i) {
        var span = document.createElement('span');
        span.textContent = 'Hi';
        span.style.fontFamily = names[i];
        div.appendChild(span);
      }
      document.body.appendChild(div);

      isFontReady(loadTestFontId, function() {
        document.body.removeChild(div);
        request.complete();
      });
      /** Hack end */
  }
};

var FontFaceObject = (function FontFaceObjectClosure() {
  function FontFaceObject(name, file, properties) {
    this.compiledGlyphs = {};
    if (arguments.length === 1) {
      // importing translated data
      var data = arguments[0];
      for (var i in data) {
        this[i] = data[i];
      }
      return;
    }
  }
  FontFaceObject.prototype = {
    createNativeFontFace: function FontFaceObject_createNativeFontFace() {
      if (!this.data) {
        return null;
      }

      if (PDFJS.disableFontFace) {
        this.disableFontFace = true;
        return null;
      }

      var nativeFontFace = new FontFace(this.loadedName, this.data, {});

      FontLoader.addNativeFontFace(nativeFontFace);

      if (PDFJS.pdfBug && 'FontInspector' in globalScope &&
          globalScope['FontInspector'].enabled) {
        globalScope['FontInspector'].fontAdded(this);
      }
      return nativeFontFace;
    },

    bindDOM: function FontFaceObject_bindDOM() {
      if (!this.data) {
        return null;
      }

      if (PDFJS.disableFontFace) {
        this.disableFontFace = true;
        return null;
      }

      var data = bytesToString(new Uint8Array(this.data));
      var fontName = this.loadedName;

      // Add the font-face rule to the document
      var url = ('url(data:' + this.mimetype + ';base64,' +
                 window.btoa(data) + ');');
      var rule = '@font-face { font-family:"' + fontName + '";src:' + url + '}';
      FontLoader.insertRule(rule);

      if (PDFJS.pdfBug && 'FontInspector' in globalScope &&
          globalScope['FontInspector'].enabled) {
        globalScope['FontInspector'].fontAdded(this, url);
      }

      return rule;
    },

    getPathGenerator: function FontLoader_getPathGenerator(objs, character) {
      if (!(character in this.compiledGlyphs)) {
        var js = objs.get(this.loadedName + '_path_' + character);
        /*jshint -W054 */
        this.compiledGlyphs[character] = new Function('c', 'size', js);
      }
      return this.compiledGlyphs[character];
    }
  };
  return FontFaceObject;
})();


var HIGHLIGHT_OFFSET = 4; // px
var ANNOT_MIN_SIZE = 10; // px

var AnnotationUtils = (function AnnotationUtilsClosure() {
  // TODO(mack): This dupes some of the logic in CanvasGraphics.setFont()
  function setTextStyles(element, item, fontObj) {

    var style = element.style;
    style.fontSize = item.fontSize + 'px';
    style.direction = item.fontDirection < 0 ? 'rtl': 'ltr';

    if (!fontObj) {
      return;
    }

    style.fontWeight = fontObj.black ?
      (fontObj.bold ? 'bolder' : 'bold') :
      (fontObj.bold ? 'bold' : 'normal');
    style.fontStyle = fontObj.italic ? 'italic' : 'normal';

    var fontName = fontObj.loadedName;
    var fontFamily = fontName ? '"' + fontName + '", ' : '';
    // Use a reasonable default font if the font doesn't specify a fallback
    var fallbackName = fontObj.fallbackName || 'Helvetica, sans-serif';
    style.fontFamily = fontFamily + fallbackName;
  }

  // TODO(mack): Remove this, it's not really that helpful.
  function getEmptyContainer(tagName, rect, borderWidth) {
    var bWidth = borderWidth || 0;
    var element = document.createElement(tagName);
    element.style.borderWidth = bWidth + 'px';
    var width = rect[2] - rect[0] - 2 * bWidth;
    var height = rect[3] - rect[1] - 2 * bWidth;
    element.style.width = width + 'px';
    element.style.height = height + 'px';
    return element;
  }

  function initContainer(item) {
    var container = getEmptyContainer('section', item.rect, item.borderWidth);
    container.style.backgroundColor = item.color;

    var color = item.color;
    var rgb = [];
    for (var i = 0; i < 3; ++i) {
      rgb[i] = Math.round(color[i] * 255);
    }
    item.colorCssRgb = Util.makeCssRgb(rgb);

    var highlight = document.createElement('div');
    highlight.className = 'annotationHighlight';
    highlight.style.left = highlight.style.top = -HIGHLIGHT_OFFSET + 'px';
    highlight.style.right = highlight.style.bottom = -HIGHLIGHT_OFFSET + 'px';
    highlight.setAttribute('hidden', true);

    item.highlightElement = highlight;
    container.appendChild(item.highlightElement);

    return container;
  }

  function getHtmlElementForTextWidgetAnnotation(item, commonObjs) {
    var element = getEmptyContainer('div', item.rect, 0);
    element.style.display = 'table';

    var content = document.createElement('div');
    content.textContent = item.fieldValue;
    var textAlignment = item.textAlignment;
    content.style.textAlign = ['left', 'center', 'right'][textAlignment];
    content.style.verticalAlign = 'middle';
    content.style.display = 'table-cell';

    var fontObj = item.fontRefName ?
      commonObjs.getData(item.fontRefName) : null;
    setTextStyles(content, item, fontObj);

    element.appendChild(content);

    return element;
  }

  function getHtmlElementForTextAnnotation(item) {
    var rect = item.rect;

    // sanity check because of OOo-generated PDFs
    if ((rect[3] - rect[1]) < ANNOT_MIN_SIZE) {
      rect[3] = rect[1] + ANNOT_MIN_SIZE;
    }
    if ((rect[2] - rect[0]) < ANNOT_MIN_SIZE) {
      rect[2] = rect[0] + (rect[3] - rect[1]); // make it square
    }

    var container = initContainer(item);
    container.className = 'annotText';

    var image  = document.createElement('img');
    image.style.height = container.style.height;
    image.style.width = container.style.width;
    var iconName = item.name;
    image.src = PDFJS.imageResourcesPath + 'annotation-' +
      iconName.toLowerCase() + '.svg';
    image.alt = '[{{type}} Annotation]';
    image.dataset.l10nId = 'text_annotation_type';
    image.dataset.l10nArgs = JSON.stringify({type: iconName});

    var contentWrapper = document.createElement('div');
    contentWrapper.className = 'annotTextContentWrapper';
    contentWrapper.style.left = Math.floor(rect[2] - rect[0] + 5) + 'px';
    contentWrapper.style.top = '-10px';

    var content = document.createElement('div');
    content.className = 'annotTextContent';
    content.setAttribute('hidden', true);

    var i, ii;
    if (item.hasBgColor) {
      var color = item.color;
      var rgb = [];
      for (i = 0; i < 3; ++i) {
        // Enlighten the color (70%)
        var c = Math.round(color[i] * 255);
        rgb[i] = Math.round((255 - c) * 0.7) + c;
      }
      content.style.backgroundColor = Util.makeCssRgb(rgb);
    }

    var title = document.createElement('h1');
    var text = document.createElement('p');
    title.textContent = item.title;

    if (!item.content && !item.title) {
      content.setAttribute('hidden', true);
    } else {
      var e = document.createElement('span');
      var lines = item.content.split(/(?:\r\n?|\n)/);
      for (i = 0, ii = lines.length; i < ii; ++i) {
        var line = lines[i];
        e.appendChild(document.createTextNode(line));
        if (i < (ii - 1)) {
          e.appendChild(document.createElement('br'));
        }
      }
      text.appendChild(e);

      var pinned = false;

      var showAnnotation = function showAnnotation(pin) {
        if (pin) {
          pinned = true;
        }
        if (content.hasAttribute('hidden')) {
          container.style.zIndex += 1;
          content.removeAttribute('hidden');
        }
      };

      var hideAnnotation = function hideAnnotation(unpin) {
        if (unpin) {
          pinned = false;
        }
        if (!content.hasAttribute('hidden') && !pinned) {
          container.style.zIndex -= 1;
          content.setAttribute('hidden', true);
        }
      };

      var toggleAnnotation = function toggleAnnotation() {
        if (pinned) {
          hideAnnotation(true);
        } else {
          showAnnotation(true);
        }
      };

      image.addEventListener('click', function image_clickHandler() {
        toggleAnnotation();
      }, false);
      image.addEventListener('mouseover', function image_mouseOverHandler() {
        showAnnotation();
      }, false);
      image.addEventListener('mouseout', function image_mouseOutHandler() {
        hideAnnotation();
      }, false);

      content.addEventListener('click', function content_clickHandler() {
        hideAnnotation(true);
      }, false);
    }

    content.appendChild(title);
    content.appendChild(text);
    contentWrapper.appendChild(content);
    container.appendChild(image);
    container.appendChild(contentWrapper);

    return container;
  }

  function getHtmlElementForLinkAnnotation(item) {
    var container = initContainer(item);
    container.className = 'annotLink';

    container.style.borderColor = item.colorCssRgb;
    container.style.borderStyle = 'solid';

    var link = document.createElement('a');
    link.href = link.title = item.url || '';

    container.appendChild(link);

    return container;
  }

  function getHtmlElement(data, objs) {
    switch (data.annotationType) {
      case AnnotationType.WIDGET:
        return getHtmlElementForTextWidgetAnnotation(data, objs);
      case AnnotationType.TEXT:
        return getHtmlElementForTextAnnotation(data);
      case AnnotationType.LINK:
        return getHtmlElementForLinkAnnotation(data);
      default:
        throw new Error('Unsupported annotationType: ' + data.annotationType);
    }
  }

  return {
    getHtmlElement: getHtmlElement
  };
})();
PDFJS.AnnotationUtils = AnnotationUtils;


var SVG_DEFAULTS = {
  fontStyle: 'normal',
  fontWeight: 'normal',
  fillColor: '#000000'
};

var convertImgDataToPng = (function convertImgDataToPngClosure() {
  var PNG_HEADER =
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  var CHUNK_WRAPPER_SIZE = 12;

  var crcTable = new Int32Array(256);
  for (var i = 0; i < 256; i++) {
    var c = i;
    for (var h = 0; h < 8; h++) {
      if (c & 1) {
        c = 0xedB88320 ^ ((c >> 1) & 0x7fffffff);
      } else {
        c = (c >> 1) & 0x7fffffff;
      }
    }
    crcTable[i] = c;
  }

  function crc32(data, start, end) {
    var crc = -1;
    for (var i = start; i < end; i++) {
      var a = (crc ^ data[i]) & 0xff;
      var b = crcTable[a];
      crc = (crc >>> 8) ^ b;
    }
    return crc ^ -1;
  }

  function writePngChunk(type, body, data, offset) {
    var p = offset;
    var len = body.length;

    data[p] = len >> 24 & 0xff;
    data[p + 1] = len >> 16 & 0xff;
    data[p + 2] = len >> 8 & 0xff;
    data[p + 3] = len & 0xff;
    p += 4;

    data[p] = type.charCodeAt(0) & 0xff;
    data[p + 1] = type.charCodeAt(1) & 0xff;
    data[p + 2] = type.charCodeAt(2) & 0xff;
    data[p + 3] = type.charCodeAt(3) & 0xff;
    p += 4;

    data.set(body, p);
    p += body.length;

    var crc = crc32(data, offset + 4, p);

    data[p] = crc >> 24 & 0xff;
    data[p + 1] = crc >> 16 & 0xff;
    data[p + 2] = crc >> 8 & 0xff;
    data[p + 3] = crc & 0xff;
  }

  function adler32(data, start, end) {
    var a = 1;
    var b = 0;
    for (var i = start; i < end; ++i) {
      a = (a + (data[i] & 0xff)) % 65521;
      b = (b + a) % 65521;
    }
    return (b << 16) | a;
  }

  function encode(imgData, kind) {
    var width = imgData.width;
    var height = imgData.height;
    var bitDepth, colorType, lineSize;
    var bytes = imgData.data;

    switch (kind) {
      case ImageKind.GRAYSCALE_1BPP:
        colorType = 0;
        bitDepth = 1;
        lineSize = (width + 7) >> 3;
        break;
      case ImageKind.RGB_24BPP:
        colorType = 2;
        bitDepth = 8;
        lineSize = width * 3;
        break;
      case ImageKind.RGBA_32BPP:
        colorType = 6;
        bitDepth = 8;
        lineSize = width * 4;
        break;
      default:
        throw new Error('invalid format');
    }

    // prefix every row with predictor 0
    var literals = new Uint8Array((1 + lineSize) * height);
    var offsetLiterals = 0, offsetBytes = 0;
    var y, i;
    for (y = 0; y < height; ++y) {
      literals[offsetLiterals++] = 0; // no prediction
      literals.set(bytes.subarray(offsetBytes, offsetBytes + lineSize),
                   offsetLiterals);
      offsetBytes += lineSize;
      offsetLiterals += lineSize;
    }

    if (kind === ImageKind.GRAYSCALE_1BPP) {
      // inverting for B/W
      offsetLiterals = 0;
      for (y = 0; y < height; y++) {
        offsetLiterals++; // skipping predictor
        for (i = 0; i < lineSize; i++) {
          literals[offsetLiterals++] ^= 0xFF;
        }
      }
    }

    var ihdr = new Uint8Array([
      width >> 24 & 0xff,
      width >> 16 & 0xff,
      width >> 8 & 0xff,
      width & 0xff,
      height >> 24 & 0xff,
      height >> 16 & 0xff,
      height >> 8 & 0xff,
      height & 0xff,
      bitDepth, // bit depth
      colorType, // color type
      0x00, // compression method
      0x00, // filter method
      0x00 // interlace method
    ]);

    var len = literals.length;
    var maxBlockLength = 0xFFFF;

    var deflateBlocks = Math.ceil(len / maxBlockLength);
    var idat = new Uint8Array(2 + len + deflateBlocks * 5 + 4);
    var pi = 0;
    idat[pi++] = 0x78; // compression method and flags
    idat[pi++] = 0x9c; // flags

    var pos = 0;
    while (len > maxBlockLength) {
      // writing non-final DEFLATE blocks type 0 and length of 65535
      idat[pi++] = 0x00;
      idat[pi++] = 0xff;
      idat[pi++] = 0xff;
      idat[pi++] = 0x00;
      idat[pi++] = 0x00;
      idat.set(literals.subarray(pos, pos + maxBlockLength), pi);
      pi += maxBlockLength;
      pos += maxBlockLength;
      len -= maxBlockLength;
    }

    // writing non-final DEFLATE blocks type 0
    idat[pi++] = 0x01;
    idat[pi++] = len & 0xff;
    idat[pi++] = len >> 8 & 0xff;
    idat[pi++] = (~len & 0xffff) & 0xff;
    idat[pi++] = (~len & 0xffff) >> 8 & 0xff;
    idat.set(literals.subarray(pos), pi);
    pi += literals.length - pos;

    var adler = adler32(literals, 0, literals.length); // checksum
    idat[pi++] = adler >> 24 & 0xff;
    idat[pi++] = adler >> 16 & 0xff;
    idat[pi++] = adler >> 8 & 0xff;
    idat[pi++] = adler & 0xff;

    // PNG will consists: header, IHDR+data, IDAT+data, and IEND.
    var pngLength = PNG_HEADER.length + (CHUNK_WRAPPER_SIZE * 3) +
                    ihdr.length + idat.length;
    var data = new Uint8Array(pngLength);
    var offset = 0;
    data.set(PNG_HEADER, offset);
    offset += PNG_HEADER.length;
    writePngChunk('IHDR', ihdr, data, offset);
    offset += CHUNK_WRAPPER_SIZE + ihdr.length;
    writePngChunk('IDATA', idat, data, offset);
    offset += CHUNK_WRAPPER_SIZE + idat.length;
    writePngChunk('IEND', new Uint8Array(0), data, offset);

    return PDFJS.createObjectURL(data, 'image/png');
  }

  return function convertImgDataToPng(imgData) {
    var kind = (imgData.kind === undefined ?
                ImageKind.GRAYSCALE_1BPP : imgData.kind);
    return encode(imgData, kind);
  };
})();

var SVGExtraState = (function SVGExtraStateClosure() {
  function SVGExtraState() {
    this.fontSizeScale = 1;
    this.fontWeight = SVG_DEFAULTS.fontWeight;
    this.fontSize = 0;

    this.textMatrix = IDENTITY_MATRIX;
    this.fontMatrix = FONT_IDENTITY_MATRIX;
    this.leading = 0;

    // Current point (in user coordinates)
    this.x = 0;
    this.y = 0;

    // Start of text line (in text coordinates)
    this.lineX = 0;
    this.lineY = 0;

    // Character and word spacing
    this.charSpacing = 0;
    this.wordSpacing = 0;
    this.textHScale = 1;
    this.textRise = 0;

    // Default foreground and background colors
    this.fillColor = SVG_DEFAULTS.fillColor;
    this.strokeColor = '#000000';

    this.fillAlpha = 1;
    this.strokeAlpha = 1;
    this.lineWidth = 1;
    this.lineJoin = '';
    this.lineCap = '';
    this.miterLimit = 0;
    
    this.dashArray = [];
    this.dashPhase = 0;

    this.dependencies = [];

    // Clipping
    this.clipId = '';
    this.pendingClip = false;

    this.maskId = '';
  }

  SVGExtraState.prototype = {
    clone: function SVGExtraState_clone() {
      return Object.create(this);
    },
    setCurrentPoint: function SVGExtraState_setCurrentPoint(x, y) {
      this.x = x;
      this.y = y;
    }
  };
  return SVGExtraState;
})();

var SVGGraphics = (function SVGGraphicsClosure() {
  function createScratchSVG(width, height) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg:svg');
    svg.setAttributeNS(null, 'version', '1.1');
    svg.setAttributeNS(null, 'width', width + 'px');
    svg.setAttributeNS(null, 'height', height + 'px');
    svg.setAttributeNS(null, 'viewBox', '0 0 ' + width + ' ' + height);
    return svg;
  }

  function opListToTree(opList) {
    var opTree = [];
    var tmp = [];
    var opListLen = opList.length;

    for (var x = 0; x < opListLen; x++) {
      if (opList[x].fn === 'save') {
        opTree.push({'fnId': 92, 'fn': 'group', 'items': []});
        tmp.push(opTree);
        opTree = opTree[opTree.length - 1].items;
        continue;
      }

      if(opList[x].fn === 'restore') {
        opTree = tmp.pop();
      } else {
        opTree.push(opList[x]);
      }
    }
    return opTree;
  }

  /**
   * Formats float number.
   * @param value {number} number to format.
   * @returns {string}
   */
  function pf(value) {
    if (value === (value | 0)) { // integer number
      return value.toString();
    }
    var s = value.toFixed(10);
    var i = s.length - 1;
    if (s[i] !== '0') {
      return s;
    }
    // removing trailing zeros
    do {
      i--;
    } while (s[i] === '0');
    return s.substr(0, s[i] === '.' ? i : i + 1);
  }

  /**
   * Formats transform matrix. The standard rotation, scale and translate
   * matrices are replaced by their shorter forms, and for identity matrix
   * returns empty string to save the memory.
   * @param m {Array} matrix to format.
   * @returns {string}
   */
  function pm(m) {
    if (m[4] === 0 && m[5] === 0) {
      if (m[1] === 0 && m[2] === 0) {
        if (m[0] === 1 && m[3] === 1) {
          return '';
        }
        return 'scale(' + pf(m[0]) + ' ' + pf(m[3]) + ')';
      }
      if (m[0] === m[3] && m[1] === -m[2]) {
        var a = Math.acos(m[0]) * 180 / Math.PI;
        return 'rotate(' + pf(a) + ')';
      }
    } else {
      if (m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1) {
        return 'translate(' + pf(m[4]) + ' ' + pf(m[5]) + ')';
      }
    }
    return 'matrix(' + pf(m[0]) + ' ' + pf(m[1]) + ' ' + pf(m[2]) + ' ' +
      pf(m[3]) + ' ' + pf(m[4]) + ' ' + pf(m[5]) + ')';
  }

  function SVGGraphics(commonObjs, objs) {
    this.current = new SVGExtraState();
    this.transformMatrix = IDENTITY_MATRIX; // Graphics state matrix
    this.transformStack = [];
    this.extraStack = [];
    this.commonObjs = commonObjs;
    this.objs = objs;
    this.pendingEOFill = false;

    this.embedFonts = false;
    this.embeddedFonts = {};
    this.cssStyle = null;
  }

  var NS = 'http://www.w3.org/2000/svg';
  var XML_NS = 'http://www.w3.org/XML/1998/namespace';
  var XLINK_NS = 'http://www.w3.org/1999/xlink';
  var LINE_CAP_STYLES = ['butt', 'round', 'square'];
  var LINE_JOIN_STYLES = ['miter', 'round', 'bevel'];
  var clipCount = 0;
  var maskCount = 0;

  SVGGraphics.prototype = {
    save: function SVGGraphics_save() {
      this.transformStack.push(this.transformMatrix);
      var old = this.current;
      this.extraStack.push(old);
      this.current = old.clone();
    },

    restore: function SVGGraphics_restore() {
      this.transformMatrix = this.transformStack.pop();
      this.current = this.extraStack.pop();

      this.tgrp = document.createElementNS(NS, 'svg:g');
      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
      this.pgrp.appendChild(this.tgrp);
    },

    group: function SVGGraphics_group(items) {
      this.save();
      this.executeOpTree(items);
      this.restore();
    },

    loadDependencies: function SVGGraphics_loadDependencies(operatorList) {
      var fnArray = operatorList.fnArray;
      var fnArrayLen = fnArray.length;
      var argsArray = operatorList.argsArray;

      var self = this;
      for (var i = 0; i < fnArrayLen; i++) {
        if (OPS.dependency === fnArray[i]) {
          var deps = argsArray[i];
          for (var n = 0, nn = deps.length; n < nn; n++) {
            var obj = deps[n];
            var common = obj.substring(0, 2) === 'g_';
            var promise;
            if (common) {
              promise = new Promise(function(resolve) {
                self.commonObjs.get(obj, resolve);
              });
            } else {
              promise = new Promise(function(resolve) {
                self.objs.get(obj, resolve);
              });
            }
            this.current.dependencies.push(promise);
          }
        }
      }
      return Promise.all(this.current.dependencies);
    },

    transform: function SVGGraphics_transform(a, b, c, d, e, f) {
      var transformMatrix = [a, b, c, d, e, f];
      this.transformMatrix = PDFJS.Util.transform(this.transformMatrix,
                                                  transformMatrix);

      this.tgrp = document.createElementNS(NS, 'svg:g');
      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
    },

    getSVG: function SVGGraphics_getSVG(operatorList, viewport) {
      this.svg = createScratchSVG(viewport.width, viewport.height);
      this.viewport = viewport;

      return this.loadDependencies(operatorList).then(function () {
        this.transformMatrix = IDENTITY_MATRIX;
        this.pgrp = document.createElementNS(NS, 'svg:g'); // Parent group
        this.pgrp.setAttributeNS(null, 'transform', pm(viewport.transform));
        this.tgrp = document.createElementNS(NS, 'svg:g'); // Transform group
        this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
        this.defs = document.createElementNS(NS, 'svg:defs');
        this.pgrp.appendChild(this.defs);
        this.pgrp.appendChild(this.tgrp);
        this.svg.appendChild(this.pgrp);
        var opTree = this.convertOpList(operatorList);
        this.executeOpTree(opTree);
        return this.svg;
      }.bind(this));
    },

    convertOpList: function SVGGraphics_convertOpList(operatorList) {
      var argsArray = operatorList.argsArray;
      var fnArray = operatorList.fnArray;
      var fnArrayLen  = fnArray.length;
      var REVOPS = [];
      var opList = [];

      for (var op in OPS) {
        REVOPS[OPS[op]] = op;
      }

      for (var x = 0; x < fnArrayLen; x++) {
        var fnId = fnArray[x];
        opList.push({'fnId' : fnId, 'fn': REVOPS[fnId], 'args': argsArray[x]});
      }
      return opListToTree(opList);
    },
    
    executeOpTree: function SVGGraphics_executeOpTree(opTree) {
      var opTreeLen = opTree.length;
      for(var x = 0; x < opTreeLen; x++) {
        var fn = opTree[x].fn;
        var fnId = opTree[x].fnId;
        var args = opTree[x].args;

        switch (fnId | 0) {
          case OPS.beginText:
            this.beginText();
            break;
          case OPS.setLeading:
            this.setLeading(args);
            break;
          case OPS.setLeadingMoveText:
            this.setLeadingMoveText(args[0], args[1]);
            break;
          case OPS.setFont:
            this.setFont(args);
            break;
          case OPS.showText:
            this.showText(args[0]);
            break;
          case OPS.showSpacedText:
            this.showText(args[0]);
            break;
          case OPS.endText:
            this.endText();
            break;
          case OPS.moveText:
            this.moveText(args[0], args[1]);
            break;
          case OPS.setCharSpacing:
            this.setCharSpacing(args[0]);
            break;
          case OPS.setWordSpacing:
            this.setWordSpacing(args[0]);
            break;
          case OPS.setTextMatrix:
            this.setTextMatrix(args[0], args[1], args[2],
                               args[3], args[4], args[5]);
            break;
          case OPS.setLineWidth:
            this.setLineWidth(args[0]);
            break;
          case OPS.setLineJoin:
            this.setLineJoin(args[0]);
            break;
          case OPS.setLineCap:
            this.setLineCap(args[0]);
            break;
          case OPS.setMiterLimit:
            this.setMiterLimit(args[0]);
            break;
          case OPS.setFillRGBColor:
            this.setFillRGBColor(args[0], args[1], args[2]);
            break;
          case OPS.setStrokeRGBColor:
            this.setStrokeRGBColor(args[0], args[1], args[2]);
            break;
          case OPS.setDash:
            this.setDash(args[0], args[1]);
            break;
          case OPS.setGState:
            this.setGState(args[0]);
            break;
          case OPS.fill:
            this.fill();
            break;
          case OPS.eoFill:
            this.eoFill();
            break;
          case OPS.stroke:
            this.stroke();
            break;
          case OPS.fillStroke:
            this.fillStroke();
            break;
          case OPS.eoFillStroke:
            this.eoFillStroke();
            break;
          case OPS.clip:
            this.clip('nonzero');
            break;
          case OPS.eoClip:
            this.clip('evenodd');
            break;
          case OPS.paintSolidColorImageMask:
            this.paintSolidColorImageMask();
            break;
          case OPS.paintJpegXObject:
            this.paintJpegXObject(args[0], args[1], args[2]);
            break;
          case OPS.paintImageXObject:
            this.paintImageXObject(args[0]);
            break;
          case OPS.paintInlineImageXObject:
            this.paintInlineImageXObject(args[0]);
            break;
          case OPS.paintImageMaskXObject:
            this.paintImageMaskXObject(args[0]);
            break;
          case OPS.paintFormXObjectBegin:
            this.paintFormXObjectBegin(args[0], args[1]);
            break;
          case OPS.paintFormXObjectEnd:
            this.paintFormXObjectEnd();
            break;
          case OPS.closePath:
            this.closePath();
            break;
          case OPS.closeStroke:
            this.closeStroke();
            break;
          case OPS.closeFillStroke:
            this.closeFillStroke();
            break;
          case OPS.nextLine:
            this.nextLine();
            break;
          case OPS.transform:
            this.transform(args[0], args[1], args[2], args[3],
                           args[4], args[5]);
            break;
          case OPS.constructPath:
            this.constructPath(args[0], args[1]);
            break;
          case OPS.endPath:
            this.endPath();
            break;
          case 92:
            this.group(opTree[x].items);
            break;
          default:
            warn('Unimplemented method '+ fn);
            break;
        }
      }
    },

    setWordSpacing: function SVGGraphics_setWordSpacing(wordSpacing) {
      this.current.wordSpacing = wordSpacing;
    },

    setCharSpacing: function SVGGraphics_setCharSpacing(charSpacing) {
      this.current.charSpacing = charSpacing;
    },

    nextLine: function SVGGraphics_nextLine() {
      this.moveText(0, this.current.leading);
    },

    setTextMatrix: function SVGGraphics_setTextMatrix(a, b, c, d, e, f) {
      var current = this.current;
      this.current.textMatrix = this.current.lineMatrix = [a, b, c, d, e, f];

      this.current.x = this.current.lineX = 0;
      this.current.y = this.current.lineY = 0;

      current.xcoords = [];
      current.tspan = document.createElementNS(NS, 'svg:tspan');
      current.tspan.setAttributeNS(null, 'font-family', current.fontFamily);
      current.tspan.setAttributeNS(null, 'font-size',
                                   pf(current.fontSize) + 'px');
      current.tspan.setAttributeNS(null, 'y', pf(-current.y));

      current.txtElement = document.createElementNS(NS, 'svg:text');
      current.txtElement.appendChild(current.tspan);
    },

    beginText: function SVGGraphics_beginText() {
      this.current.x = this.current.lineX = 0;
      this.current.y = this.current.lineY = 0;
      this.current.textMatrix = IDENTITY_MATRIX;
      this.current.lineMatrix = IDENTITY_MATRIX;
      this.current.tspan = document.createElementNS(NS, 'svg:tspan');
      this.current.txtElement = document.createElementNS(NS, 'svg:text');
      this.current.txtgrp = document.createElementNS(NS, 'svg:g');
      this.current.xcoords = [];
    },

    moveText: function SVGGraphics_moveText(x, y) {
      var current = this.current;
      this.current.x = this.current.lineX += x;
      this.current.y = this.current.lineY += y;

      current.xcoords = [];
      current.tspan = document.createElementNS(NS, 'svg:tspan');
      current.tspan.setAttributeNS(null, 'font-family', current.fontFamily);
      current.tspan.setAttributeNS(null, 'font-size',
                                   pf(current.fontSize) + 'px');
      current.tspan.setAttributeNS(null, 'y', pf(-current.y));
    },

    showText: function SVGGraphics_showText(glyphs) {
      var current = this.current;
      var font = current.font;
      var fontSize = current.fontSize;

      if (fontSize === 0) {
        return;
      }

      var charSpacing = current.charSpacing;
      var wordSpacing = current.wordSpacing;
      var fontDirection = current.fontDirection;
      var textHScale = current.textHScale * fontDirection;
      var glyphsLength = glyphs.length;
      var vertical = font.vertical;
      var widthAdvanceScale = fontSize * current.fontMatrix[0];

      var x = 0, i;
      for (i = 0; i < glyphsLength; ++i) {
        var glyph = glyphs[i];
        if (glyph === null) {
          // word break
          x += fontDirection * wordSpacing;
          continue;
        } else if (isNum(glyph)) {
          x += -glyph * fontSize * 0.001;
          continue;
        }
        current.xcoords.push(current.x + x * textHScale);

        var width = glyph.width;
        var character = glyph.fontChar;
        var charWidth = width * widthAdvanceScale + charSpacing * fontDirection;
        x += charWidth;

        current.tspan.textContent += character;
      }
      if (vertical) {
        current.y -= x * textHScale;
      } else {
        current.x += x * textHScale;
      }

      current.tspan.setAttributeNS(null, 'x',
                                   current.xcoords.map(pf).join(' '));
      current.tspan.setAttributeNS(null, 'y', pf(-current.y));
      current.tspan.setAttributeNS(null, 'font-family', current.fontFamily);
      current.tspan.setAttributeNS(null, 'font-size',
                                   pf(current.fontSize) + 'px');
      if (current.fontStyle !== SVG_DEFAULTS.fontStyle) {
        current.tspan.setAttributeNS(null, 'font-style', current.fontStyle);
      }
      if (current.fontWeight !== SVG_DEFAULTS.fontWeight) {
        current.tspan.setAttributeNS(null, 'font-weight', current.fontWeight);
      }
      if (current.fillColor !== SVG_DEFAULTS.fillColor) {
        current.tspan.setAttributeNS(null, 'fill', current.fillColor);
      }

      current.txtElement.setAttributeNS(null, 'transform',
                                        pm(current.textMatrix) +
                                        ' scale(1, -1)' );
      current.txtElement.setAttributeNS(XML_NS, 'xml:space', 'preserve');
      current.txtElement.appendChild(current.tspan);
      current.txtgrp.appendChild(current.txtElement);

      this.tgrp.appendChild(current.txtElement);

    },

    setLeadingMoveText: function SVGGraphics_setLeadingMoveText(x, y) {
      this.setLeading(-y);
      this.moveText(x, y);
    },

    addFontStyle: function SVGGraphics_addFontStyle(fontObj) {
      if (!this.cssStyle) {
        this.cssStyle = document.createElementNS(NS, 'svg:style');
        this.cssStyle.setAttributeNS(null, 'type', 'text/css');
        this.defs.appendChild(this.cssStyle);
      }

      var url = PDFJS.createObjectURL(fontObj.data, fontObj.mimetype);
      this.cssStyle.textContent +=
        '@font-face { font-family: "' + fontObj.loadedName + '";' +
        ' src: url(' + url + '); }\n';
    },

    setFont: function SVGGraphics_setFont(details) {
      var current = this.current;
      var fontObj = this.commonObjs.get(details[0]);
      var size = details[1];
      this.current.font = fontObj;

      if (this.embedFonts && fontObj.data &&
          !this.embeddedFonts[fontObj.loadedName]) {
        this.addFontStyle(fontObj);
        this.embeddedFonts[fontObj.loadedName] = fontObj;
      }

      current.fontMatrix = (fontObj.fontMatrix ?
                            fontObj.fontMatrix : FONT_IDENTITY_MATRIX);

      var bold = fontObj.black ? (fontObj.bold ? 'bolder' : 'bold') :
                                 (fontObj.bold ? 'bold' : 'normal');
      var italic = fontObj.italic ? 'italic' : 'normal';

      if (size < 0) {
        size = -size;
        current.fontDirection = -1;
      } else {
        current.fontDirection = 1;
      }
      current.fontSize = size;
      current.fontFamily = fontObj.loadedName;
      current.fontWeight = bold;
      current.fontStyle = italic;

      current.tspan = document.createElementNS(NS, 'svg:tspan');
      current.tspan.setAttributeNS(null, 'y', pf(-current.y));
      current.xcoords = [];
    },

    endText: function SVGGraphics_endText() {
      if (this.current.pendingClip) {
        this.cgrp.appendChild(this.tgrp);
        this.pgrp.appendChild(this.cgrp);
      } else {
        this.pgrp.appendChild(this.tgrp);
      }
      this.tgrp = document.createElementNS(NS, 'svg:g');
      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
    },

    // Path properties
    setLineWidth: function SVGGraphics_setLineWidth(width) {
      this.current.lineWidth = width;
    },
    setLineCap: function SVGGraphics_setLineCap(style) {
      this.current.lineCap = LINE_CAP_STYLES[style];
    },
    setLineJoin: function SVGGraphics_setLineJoin(style) {
      this.current.lineJoin = LINE_JOIN_STYLES[style];
    },
    setMiterLimit: function SVGGraphics_setMiterLimit(limit) {
      this.current.miterLimit = limit;
    },
    setStrokeRGBColor: function SVGGraphics_setStrokeRGBColor(r, g, b) {
      var color = Util.makeCssRgb(arguments);
      this.current.strokeColor = color;
    },
    setFillRGBColor: function SVGGraphics_setFillRGBColor(r, g, b) {
      var color = Util.makeCssRgb(arguments);
      this.current.fillColor = color;
      this.current.tspan = document.createElementNS(NS, 'svg:tspan');
      this.current.xcoords = [];
    },
    setDash: function SVGGraphics_setDash(dashArray, dashPhase) {
      this.current.dashArray = dashArray;
      this.current.dashPhase = dashPhase;
    },

    constructPath: function SVGGraphics_constructPath(ops, args) {
      var current = this.current;
      var x = current.x, y = current.y;
      current.path = document.createElementNS(NS, 'svg:path');
      var d = [];
      var opLength = ops.length;

      for (var i = 0, j = 0; i < opLength; i++) {
        switch (ops[i] | 0) {
          case OPS.rectangle:
            x = args[j++];
            y = args[j++];
            var width = args[j++];
            var height = args[j++];
            var xw = x + width;
            var yh = y + height;
            d.push('M', pf(x), pf(y), 'L', pf(xw) , pf(y), 'L', pf(xw), pf(yh),
                   'L', pf(x), pf(yh), 'Z');
            break;
          case OPS.moveTo:
            x = args[j++];
            y = args[j++];
            d.push('M', pf(x), pf(y));
            break;
          case OPS.lineTo:
            x = args[j++];
            y = args[j++];
            d.push('L', pf(x) , pf(y));
            break;
          case OPS.curveTo:
            x = args[j + 4];
            y = args[j + 5];
            d.push('C', pf(args[j]), pf(args[j + 1]), pf(args[j + 2]),
                   pf(args[j + 3]), pf(x), pf(y));
            j += 6;
            break;
          case OPS.curveTo2:
            x = args[j + 2];
            y = args[j + 3];
            d.push('C', pf(x), pf(y), pf(args[j]), pf(args[j + 1]),
                   pf(args[j + 2]), pf(args[j + 3]));
            j += 4;
            break;
          case OPS.curveTo3:
            x = args[j + 2];
            y = args[j + 3];
            d.push('C', pf(args[j]), pf(args[j + 1]), pf(x), pf(y),
                   pf(x), pf(y));
            j += 4;
            break;
          case OPS.closePath:
            d.push('Z');
            break;
        }
      }
      current.path.setAttributeNS(null, 'd', d.join(' '));
      current.path.setAttributeNS(null, 'stroke-miterlimit',
                                  pf(current.miterLimit));
      current.path.setAttributeNS(null, 'stroke-linecap', current.lineCap);
      current.path.setAttributeNS(null, 'stroke-linejoin', current.lineJoin);
      current.path.setAttributeNS(null, 'stroke-width',
                                  pf(current.lineWidth) + 'px');
      current.path.setAttributeNS(null, 'stroke-dasharray',
                                  current.dashArray.map(pf).join(' '));
      current.path.setAttributeNS(null, 'stroke-dashoffset',
                                  pf(current.dashPhase) + 'px');
      current.path.setAttributeNS(null, 'fill', 'none');

      this.tgrp.appendChild(current.path);
      if (current.pendingClip) {
        this.cgrp.appendChild(this.tgrp);
        this.pgrp.appendChild(this.cgrp);
      } else {
        this.pgrp.appendChild(this.tgrp);
      }
      // Saving a reference in current.element so that it can be addressed
      // in 'fill' and 'stroke'
      current.element = current.path;
      current.setCurrentPoint(x, y);
    },

    endPath: function SVGGraphics_endPath() {
      var current = this.current;
      if (current.pendingClip) {
        this.cgrp.appendChild(this.tgrp);
        this.pgrp.appendChild(this.cgrp);
      } else {
        this.pgrp.appendChild(this.tgrp);
      }
      this.tgrp = document.createElementNS(NS, 'svg:g');
      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
    },

    clip: function SVGGraphics_clip(type) {
      var current = this.current;
      // Add current path to clipping path
      current.clipId = 'clippath' + clipCount;
      clipCount++;
      this.clippath = document.createElementNS(NS, 'svg:clipPath');
      this.clippath.setAttributeNS(null, 'id', current.clipId);
      var clipElement = current.element.cloneNode();
      if (type === 'evenodd') {
        clipElement.setAttributeNS(null, 'clip-rule', 'evenodd');
      } else {
        clipElement.setAttributeNS(null, 'clip-rule', 'nonzero');
      }
      this.clippath.setAttributeNS(null, 'transform', pm(this.transformMatrix));
      this.clippath.appendChild(clipElement);
      this.defs.appendChild(this.clippath);

      // Create a new group with that attribute
      current.pendingClip = true;
      this.cgrp = document.createElementNS(NS, 'svg:g');
      this.cgrp.setAttributeNS(null, 'clip-path',
                               'url(#' + current.clipId + ')');
      this.pgrp.appendChild(this.cgrp);
    },

    closePath: function SVGGraphics_closePath() {
      var current = this.current;
      var d = current.path.getAttributeNS(null, 'd');
      d += 'Z';
      current.path.setAttributeNS(null, 'd', d);
    },

    setLeading: function SVGGraphics_setLeading(leading) {
      this.current.leading = -leading;
    },

    setTextRise: function SVGGraphics_setTextRise(textRise) {
      this.current.textRise = textRise;
    },

    setHScale: function SVGGraphics_setHScale(scale) {
      this.current.textHScale = scale / 100;
    },

    setGState: function SVGGraphics_setGState(states) {
      for (var i = 0, ii = states.length; i < ii; i++) {
        var state = states[i];
        var key = state[0];
        var value = state[1];

        switch (key) {
          case 'LW':
            this.setLineWidth(value);
            break;
          case 'LC':
            this.setLineCap(value);
            break;
          case 'LJ':
            this.setLineJoin(value);
            break;
          case 'ML':
            this.setMiterLimit(value);
            break;
          case 'D':
            this.setDash(value[0], value[1]);
            break;
          case 'RI':
            break;
          case 'FL':
            break;
          case 'Font':
            this.setFont(value);
            break;
          case 'CA':
            break;
          case 'ca':
            break;
          case 'BM':
            break;
          case 'SMask':
            break;
        }
      }
    },

    fill: function SVGGraphics_fill() {
      var current = this.current;
      current.element.setAttributeNS(null, 'fill', current.fillColor);
    },

    stroke: function SVGGraphics_stroke() {
      var current = this.current;
      current.element.setAttributeNS(null, 'stroke', current.strokeColor);
      current.element.setAttributeNS(null, 'fill', 'none');
    },

    eoFill: function SVGGraphics_eoFill() {
      var current = this.current;
      current.element.setAttributeNS(null, 'fill', current.fillColor);
      current.element.setAttributeNS(null, 'fill-rule', 'evenodd');
    },

    fillStroke: function SVGGraphics_fillStroke() {
      // Order is important since stroke wants fill to be none.
      // First stroke, then if fill needed, it will be overwritten.
      this.stroke();
      this.fill();
    },

    eoFillStroke: function SVGGraphics_eoFillStroke() {
      this.current.element.setAttributeNS(null, 'fill-rule', 'evenodd');
      this.fillStroke();
    },

    closeStroke: function SVGGraphics_closeStroke() {
      this.closePath();
      this.stroke();
    },

    closeFillStroke: function SVGGraphics_closeFillStroke() {
      this.closePath();
      this.fillStroke();
    },

    paintSolidColorImageMask:
        function SVGGraphics_paintSolidColorImageMask() {
      var current = this.current;
      var rect = document.createElementNS(NS, 'svg:rect');
      rect.setAttributeNS(null, 'x', '0');
      rect.setAttributeNS(null, 'y', '0');
      rect.setAttributeNS(null, 'width', '1px');
      rect.setAttributeNS(null, 'height', '1px');
      rect.setAttributeNS(null, 'fill', current.fillColor);
      this.tgrp.appendChild(rect);
    },

    paintJpegXObject: function SVGGraphics_paintJpegXObject(objId, w, h) {
      var current = this.current;
      var imgObj = this.objs.get(objId);
      var imgEl = document.createElementNS(NS, 'svg:image');
      imgEl.setAttributeNS(XLINK_NS, 'xlink:href', imgObj.src);
      imgEl.setAttributeNS(null, 'width', imgObj.width + 'px');
      imgEl.setAttributeNS(null, 'height', imgObj.height + 'px');
      imgEl.setAttributeNS(null, 'x', '0');
      imgEl.setAttributeNS(null, 'y', pf(-h));
      imgEl.setAttributeNS(null, 'transform',
                           'scale(' + pf(1 / w) + ' ' + pf(-1 / h) + ')');

      this.tgrp.appendChild(imgEl);
      if (current.pendingClip) {
        this.cgrp.appendChild(this.tgrp);
        this.pgrp.appendChild(this.cgrp);
      } else {
        this.pgrp.appendChild(this.tgrp);
      }
    },

    paintImageXObject: function SVGGraphics_paintImageXObject(objId) {
      var imgData = this.objs.get(objId);
      if (!imgData) {
        warn('Dependent image isn\'t ready yet');
        return;
      }
      this.paintInlineImageXObject(imgData);
    },

    paintInlineImageXObject:
        function SVGGraphics_paintInlineImageXObject(imgData, mask) {
      var current = this.current;
      var width = imgData.width;
      var height = imgData.height;

      var imgSrc = convertImgDataToPng(imgData);
      var cliprect = document.createElementNS(NS, 'svg:rect');
      cliprect.setAttributeNS(null, 'x', '0');
      cliprect.setAttributeNS(null, 'y', '0');
      cliprect.setAttributeNS(null, 'width', pf(width));
      cliprect.setAttributeNS(null, 'height', pf(height));
      current.element = cliprect;
      this.clip('nonzero');
      var imgEl = document.createElementNS(NS, 'svg:image');
      imgEl.setAttributeNS(XLINK_NS, 'xlink:href', imgSrc);
      imgEl.setAttributeNS(null, 'x', '0');
      imgEl.setAttributeNS(null, 'y', pf(-height));
      imgEl.setAttributeNS(null, 'width', pf(width) + 'px');
      imgEl.setAttributeNS(null, 'height', pf(height) + 'px');
      imgEl.setAttributeNS(null, 'transform',
                           'scale(' + pf(1 / width) + ' ' +
                           pf(-1 / height) + ')');
      if (mask) {
        mask.appendChild(imgEl);
      } else {
        this.tgrp.appendChild(imgEl);
      }
      if (current.pendingClip) {
        this.cgrp.appendChild(this.tgrp);
        this.pgrp.appendChild(this.cgrp);
      } else {
        this.pgrp.appendChild(this.tgrp);
      }
    },

    paintImageMaskXObject:
        function SVGGraphics_paintImageMaskXObject(imgData) {
      var current = this.current;
      var width = imgData.width;
      var height = imgData.height;
      var fillColor = current.fillColor;

      current.maskId = 'mask' + maskCount++;
      var mask = document.createElementNS(NS, 'svg:mask');
      mask.setAttributeNS(null, 'id', current.maskId);

      var rect = document.createElementNS(NS, 'svg:rect');
      rect.setAttributeNS(null, 'x', '0');
      rect.setAttributeNS(null, 'y', '0');
      rect.setAttributeNS(null, 'width', pf(width));
      rect.setAttributeNS(null, 'height', pf(height));
      rect.setAttributeNS(null, 'fill', fillColor);
      rect.setAttributeNS(null, 'mask', 'url(#' + current.maskId +')');
      this.defs.appendChild(mask);
      this.tgrp.appendChild(rect);

      this.paintInlineImageXObject(imgData, mask);
    },

    paintFormXObjectBegin:
        function SVGGraphics_paintFormXObjectBegin(matrix, bbox) {
      this.save();

      if (isArray(matrix) && matrix.length === 6) {
        this.transform(matrix[0], matrix[1], matrix[2],
                       matrix[3], matrix[4], matrix[5]);
      }

      if (isArray(bbox) && bbox.length === 4) {
        var width = bbox[2] - bbox[0];
        var height = bbox[3] - bbox[1];

        var cliprect = document.createElementNS(NS, 'svg:rect');
        cliprect.setAttributeNS(null, 'x', bbox[0]);
        cliprect.setAttributeNS(null, 'y', bbox[1]);
        cliprect.setAttributeNS(null, 'width', pf(width));
        cliprect.setAttributeNS(null, 'height', pf(height));
        this.current.element = cliprect;
        this.clip('nonzero');
        this.endPath();
      }
    },

    paintFormXObjectEnd:
        function SVGGraphics_paintFormXObjectEnd() {
      this.restore();
    }
  };
  return SVGGraphics;
})();

PDFJS.SVGGraphics = SVGGraphics;




var NetworkManager = (function NetworkManagerClosure() {

  var OK_RESPONSE = 200;
  var PARTIAL_CONTENT_RESPONSE = 206;

  function NetworkManager(url, args) {
    this.url = url;
    args = args || {};
    this.isHttp = /^https?:/i.test(url);
    this.httpHeaders = (this.isHttp && args.httpHeaders) || {};
    this.withCredentials = args.withCredentials || false;
    this.getXhr = args.getXhr ||
      function NetworkManager_getXhr() {
        return new XMLHttpRequest();
      };

    this.currXhrId = 0;
    this.pendingRequests = {};
    this.loadedRequests = {};
  }

  function getArrayBuffer(xhr) {
    var data = xhr.response;
    if (typeof data !== 'string') {
      return data;
    }
    var length = data.length;
    var array = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
      array[i] = data.charCodeAt(i) & 0xFF;
    }
    return array.buffer;
  }

  NetworkManager.prototype = {
    requestRange: function NetworkManager_requestRange(begin, end, listeners) {
      var args = {
        begin: begin,
        end: end
      };
      for (var prop in listeners) {
        args[prop] = listeners[prop];
      }
      return this.request(args);
    },

    requestFull: function NetworkManager_requestFull(listeners) {
      return this.request(listeners);
    },

    request: function NetworkManager_request(args) {
      var xhr = this.getXhr();
      var xhrId = this.currXhrId++;
      var pendingRequest = this.pendingRequests[xhrId] = {
        xhr: xhr
      };

      xhr.open('GET', this.url);
      xhr.setRequestHeader("Cache-control", "no-cache");
      xhr.withCredentials = this.withCredentials;
      for (var property in this.httpHeaders) {
        var value = this.httpHeaders[property];
        if (typeof value === 'undefined') {
          continue;
        }
        xhr.setRequestHeader(property, value);
      }
      if (this.isHttp && 'begin' in args && 'end' in args) {
        var rangeStr = args.begin + '-' + (args.end - 1);
        xhr.setRequestHeader('Range', 'bytes=' + rangeStr);
        pendingRequest.expectedStatus = 206;
      } else {
        pendingRequest.expectedStatus = 200;
      }

      if (args.onProgressiveData) {
        xhr.responseType = 'moz-chunked-arraybuffer';
        if (xhr.responseType === 'moz-chunked-arraybuffer') {
          pendingRequest.onProgressiveData = args.onProgressiveData;
          pendingRequest.mozChunked = true;
        } else {
          xhr.responseType = 'arraybuffer';
        }
      } else {
        xhr.responseType = 'arraybuffer';
      }

      if (args.onError) {
        xhr.onerror = function(evt) {
          args.onError(xhr.status);
        };
      }
      xhr.onreadystatechange = this.onStateChange.bind(this, xhrId);
      xhr.onprogress = this.onProgress.bind(this, xhrId);

      pendingRequest.onHeadersReceived = args.onHeadersReceived;
      pendingRequest.onDone = args.onDone;
      pendingRequest.onError = args.onError;
      pendingRequest.onProgress = args.onProgress;

      xhr.send(null);

      return xhrId;
    },

    onProgress: function NetworkManager_onProgress(xhrId, evt) {
      var pendingRequest = this.pendingRequests[xhrId];
      if (!pendingRequest) {
        // Maybe abortRequest was called...
        return;
      }

      if (pendingRequest.mozChunked) {
        var chunk = getArrayBuffer(pendingRequest.xhr);
        pendingRequest.onProgressiveData(chunk);
      }

      var onProgress = pendingRequest.onProgress;
      if (onProgress) {
        onProgress(evt);
      }
    },

    onStateChange: function NetworkManager_onStateChange(xhrId, evt) {
      var pendingRequest = this.pendingRequests[xhrId];
      if (!pendingRequest) {
        // Maybe abortRequest was called...
        return;
      }

      var xhr = pendingRequest.xhr;
      if (xhr.readyState >= 2 && pendingRequest.onHeadersReceived) {
        pendingRequest.onHeadersReceived();
        delete pendingRequest.onHeadersReceived;
      }

      if (xhr.readyState !== 4) {
        return;
      }

      if (!(xhrId in this.pendingRequests)) {
        // The XHR request might have been aborted in onHeadersReceived()
        // callback, in which case we should abort request
        return;
      }

      delete this.pendingRequests[xhrId];

      // success status == 0 can be on ftp, file and other protocols
      if (xhr.status === 0 && this.isHttp) {
        if (pendingRequest.onError) {
          pendingRequest.onError(xhr.status);
        }
        return;
      }
      var xhrStatus = xhr.status || OK_RESPONSE;

      // From http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.35.2:
      // "A server MAY ignore the Range header". This means it's possible to
      // get a 200 rather than a 206 response from a range request.
      var ok_response_on_range_request =
          xhrStatus === OK_RESPONSE &&
          pendingRequest.expectedStatus === PARTIAL_CONTENT_RESPONSE;

      if (!ok_response_on_range_request &&
          xhrStatus !== pendingRequest.expectedStatus) {
        if (pendingRequest.onError) {
          pendingRequest.onError(xhr.status);
        }
        return;
      }

      this.loadedRequests[xhrId] = true;

      var chunk = getArrayBuffer(xhr);
      if (xhrStatus === PARTIAL_CONTENT_RESPONSE) {
        var rangeHeader = xhr.getResponseHeader('Content-Range');
        var matches = /bytes (\d+)-(\d+)\/(\d+)/.exec(rangeHeader);
        var begin = parseInt(matches[1], 10);
        pendingRequest.onDone({
          begin: begin,
          chunk: chunk
        });
      } else if (pendingRequest.onProgressiveData) {
        pendingRequest.onDone(null);
      } else {
        pendingRequest.onDone({
          begin: 0,
          chunk: chunk
        });
      }
    },

    hasPendingRequests: function NetworkManager_hasPendingRequests() {
      for (var xhrId in this.pendingRequests) {
        return true;
      }
      return false;
    },

    getRequestXhr: function NetworkManager_getXhr(xhrId) {
      return this.pendingRequests[xhrId].xhr;
    },

    isStreamingRequest: function NetworkManager_isStreamingRequest(xhrId) {
      return !!(this.pendingRequests[xhrId].onProgressiveData);
    },

    isPendingRequest: function NetworkManager_isPendingRequest(xhrId) {
      return xhrId in this.pendingRequests;
    },

    isLoadedRequest: function NetworkManager_isLoadedRequest(xhrId) {
      return xhrId in this.loadedRequests;
    },

    abortAllRequests: function NetworkManager_abortAllRequests() {
      for (var xhrId in this.pendingRequests) {
        this.abortRequest(xhrId | 0);
      }
    },

    abortRequest: function NetworkManager_abortRequest(xhrId) {
      var xhr = this.pendingRequests[xhrId].xhr;
      delete this.pendingRequests[xhrId];
      xhr.abort();
    }
  };

  return NetworkManager;
})();



var ChunkedStream = (function ChunkedStreamClosure() {
  function ChunkedStream(length, chunkSize, manager) {
    this.bytes = new Uint8Array(length);
    this.start = 0;
    this.pos = 0;
    this.end = length;
    this.chunkSize = chunkSize;
    this.loadedChunks = [];
    this.numChunksLoaded = 0;
    this.numChunks = Math.ceil(length / chunkSize);
    this.manager = manager;
    this.progressiveDataLength = 0;
    this.lastSuccessfulEnsureByteChunk = -1;  // a single-entry cache
  }

  // required methods for a stream. if a particular stream does not
  // implement these, an error should be thrown
  ChunkedStream.prototype = {

    getMissingChunks: function ChunkedStream_getMissingChunks() {
      var chunks = [];
      for (var chunk = 0, n = this.numChunks; chunk < n; ++chunk) {
        if (!this.loadedChunks[chunk]) {
          chunks.push(chunk);
        }
      }
      return chunks;
    },

    getBaseStreams: function ChunkedStream_getBaseStreams() {
      return [this];
    },

    allChunksLoaded: function ChunkedStream_allChunksLoaded() {
      return this.numChunksLoaded === this.numChunks;
    },

    onReceiveData: function ChunkedStream_onReceiveData(begin, chunk) {
      var end = begin + chunk.byteLength;

      assert(begin % this.chunkSize === 0, 'Bad begin offset: ' + begin);
      // Using this.length is inaccurate here since this.start can be moved
      // See ChunkedStream.moveStart()
      var length = this.bytes.length;
      assert(end % this.chunkSize === 0 || end === length,
             'Bad end offset: ' + end);

      this.bytes.set(new Uint8Array(chunk), begin);
      var chunkSize = this.chunkSize;
      var beginChunk = Math.floor(begin / chunkSize);
      var endChunk = Math.floor((end - 1) / chunkSize) + 1;
      var curChunk;

      for (curChunk = beginChunk; curChunk < endChunk; ++curChunk) {
        if (!this.loadedChunks[curChunk]) {
          this.loadedChunks[curChunk] = true;
          ++this.numChunksLoaded;
        }
      }
    },

    onReceiveProgressiveData:
        function ChunkedStream_onReceiveProgressiveData(data) {
      var position = this.progressiveDataLength;
      var beginChunk = Math.floor(position / this.chunkSize);

      this.bytes.set(new Uint8Array(data), position);
      position += data.byteLength;
      this.progressiveDataLength = position;
      var endChunk = position >= this.end ? this.numChunks :
                     Math.floor(position / this.chunkSize);
      var curChunk;
      for (curChunk = beginChunk; curChunk < endChunk; ++curChunk) {
        if (!this.loadedChunks[curChunk]) {
          this.loadedChunks[curChunk] = true;
          ++this.numChunksLoaded;
        }
      }
    },

    ensureByte: function ChunkedStream_ensureByte(pos) {
      var chunk = Math.floor(pos / this.chunkSize);
      if (chunk === this.lastSuccessfulEnsureByteChunk) {
        return;
      }

      if (!this.loadedChunks[chunk]) {
        throw new MissingDataException(pos, pos + 1);
      }
      this.lastSuccessfulEnsureByteChunk = chunk;
    },

    ensureRange: function ChunkedStream_ensureRange(begin, end) {
      if (begin >= end) {
        return;
      }

      if (end <= this.progressiveDataLength) {
        return;
      }

      var chunkSize = this.chunkSize;
      var beginChunk = Math.floor(begin / chunkSize);
      var endChunk = Math.floor((end - 1) / chunkSize) + 1;
      for (var chunk = beginChunk; chunk < endChunk; ++chunk) {
        if (!this.loadedChunks[chunk]) {
          throw new MissingDataException(begin, end);
        }
      }
    },

    nextEmptyChunk: function ChunkedStream_nextEmptyChunk(beginChunk) {
      var chunk, n;
      for (chunk = beginChunk, n = this.numChunks; chunk < n; ++chunk) {
        if (!this.loadedChunks[chunk]) {
          return chunk;
        }
      }
      // Wrap around to beginning
      for (chunk = 0; chunk < beginChunk; ++chunk) {
        if (!this.loadedChunks[chunk]) {
          return chunk;
        }
      }
      return null;
    },

    hasChunk: function ChunkedStream_hasChunk(chunk) {
      return !!this.loadedChunks[chunk];
    },

    get length() {
      return this.end - this.start;
    },

    get isEmpty() {
      return this.length === 0;
    },

    getByte: function ChunkedStream_getByte() {
      var pos = this.pos;
      if (pos >= this.end) {
        return -1;
      }
      this.ensureByte(pos);
      return this.bytes[this.pos++];
    },

    getUint16: function ChunkedStream_getUint16() {
      var b0 = this.getByte();
      var b1 = this.getByte();
      return (b0 << 8) + b1;
    },

    getInt32: function ChunkedStream_getInt32() {
      var b0 = this.getByte();
      var b1 = this.getByte();
      var b2 = this.getByte();
      var b3 = this.getByte();
      return (b0 << 24) + (b1 << 16) + (b2 << 8) + b3;
    },

    // returns subarray of original buffer
    // should only be read
    getBytes: function ChunkedStream_getBytes(length) {
      var bytes = this.bytes;
      var pos = this.pos;
      var strEnd = this.end;

      if (!length) {
        this.ensureRange(pos, strEnd);
        return bytes.subarray(pos, strEnd);
      }

      var end = pos + length;
      if (end > strEnd) {
        end = strEnd;
      }
      this.ensureRange(pos, end);

      this.pos = end;
      return bytes.subarray(pos, end);
    },

    peekByte: function ChunkedStream_peekByte() {
      var peekedByte = this.getByte();
      this.pos--;
      return peekedByte;
    },

    peekBytes: function ChunkedStream_peekBytes(length) {
      var bytes = this.getBytes(length);
      this.pos -= bytes.length;
      return bytes;
    },

    getByteRange: function ChunkedStream_getBytes(begin, end) {
      this.ensureRange(begin, end);
      return this.bytes.subarray(begin, end);
    },

    skip: function ChunkedStream_skip(n) {
      if (!n) {
        n = 1;
      }
      this.pos += n;
    },

    reset: function ChunkedStream_reset() {
      this.pos = this.start;
    },

    moveStart: function ChunkedStream_moveStart() {
      this.start = this.pos;
    },

    makeSubStream: function ChunkedStream_makeSubStream(start, length, dict) {
      this.ensureRange(start, start + length);

      function ChunkedStreamSubstream() {}
      ChunkedStreamSubstream.prototype = Object.create(this);
      ChunkedStreamSubstream.prototype.getMissingChunks = function() {
        var chunkSize = this.chunkSize;
        var beginChunk = Math.floor(this.start / chunkSize);
        var endChunk = Math.floor((this.end - 1) / chunkSize) + 1;
        var missingChunks = [];
        for (var chunk = beginChunk; chunk < endChunk; ++chunk) {
          if (!this.loadedChunks[chunk]) {
            missingChunks.push(chunk);
          }
        }
        return missingChunks;
      };
      var subStream = new ChunkedStreamSubstream();
      subStream.pos = subStream.start = start;
      subStream.end = start + length || this.end;
      subStream.dict = dict;
      return subStream;
    },

    isStream: true
  };

  return ChunkedStream;
})();

var ChunkedStreamManager = (function ChunkedStreamManagerClosure() {

  function ChunkedStreamManager(length, chunkSize, url, args) {
    this.stream = new ChunkedStream(length, chunkSize, this);
    this.length = length;
    this.chunkSize = chunkSize;
    this.url = url;
    this.disableAutoFetch = args.disableAutoFetch;
    var msgHandler = this.msgHandler = args.msgHandler;

    if (args.chunkedViewerLoading) {
      msgHandler.on('OnDataRange', this.onReceiveData.bind(this));
      msgHandler.on('OnDataProgress', this.onProgress.bind(this));
      this.sendRequest = function ChunkedStreamManager_sendRequest(begin, end) {
        msgHandler.send('RequestDataRange', { begin: begin, end: end });
      };
    } else {

      var getXhr = function getXhr() {
        return new XMLHttpRequest();
      };
      this.networkManager = new NetworkManager(this.url, {
        getXhr: getXhr,
        httpHeaders: args.httpHeaders,
        withCredentials: args.withCredentials
      });
      this.sendRequest = function ChunkedStreamManager_sendRequest(begin, end) {
        this.networkManager.requestRange(begin, end, {
          onDone: this.onReceiveData.bind(this),
          onProgress: this.onProgress.bind(this)
        });
      };
    }

    this.currRequestId = 0;

    this.chunksNeededByRequest = {};
    this.requestsByChunk = {};
    this.callbacksByRequest = {};
    this.progressiveDataLength = 0;

    this._loadedStreamCapability = createPromiseCapability();

    if (args.initialData) {
      this.onReceiveData({chunk: args.initialData});
    }
  }

  ChunkedStreamManager.prototype = {
    onLoadedStream: function ChunkedStreamManager_getLoadedStream() {
      return this._loadedStreamCapability.promise;
    },

    // Get all the chunks that are not yet loaded and groups them into
    // contiguous ranges to load in as few requests as possible
    requestAllChunks: function ChunkedStreamManager_requestAllChunks() {
      var missingChunks = this.stream.getMissingChunks();
      this.requestChunks(missingChunks);
      return this._loadedStreamCapability.promise;
    },

    requestChunks: function ChunkedStreamManager_requestChunks(chunks,
                                                               callback) {
      var requestId = this.currRequestId++;

      var chunksNeeded;
      var i, ii;
      this.chunksNeededByRequest[requestId] = chunksNeeded = {};
      for (i = 0, ii = chunks.length; i < ii; i++) {
        if (!this.stream.hasChunk(chunks[i])) {
          chunksNeeded[chunks[i]] = true;
        }
      }

      if (isEmptyObj(chunksNeeded)) {
        if (callback) {
          callback();
        }
        return;
      }

      this.callbacksByRequest[requestId] = callback;

      var chunksToRequest = [];
      for (var chunk in chunksNeeded) {
        chunk = chunk | 0;
        if (!(chunk in this.requestsByChunk)) {
          this.requestsByChunk[chunk] = [];
          chunksToRequest.push(chunk);
        }
        this.requestsByChunk[chunk].push(requestId);
      }

      if (!chunksToRequest.length) {
        return;
      }

      var groupedChunksToRequest = this.groupChunks(chunksToRequest);

      for (i = 0; i < groupedChunksToRequest.length; ++i) {
        var groupedChunk = groupedChunksToRequest[i];
        var begin = groupedChunk.beginChunk * this.chunkSize;
        var end = Math.min(groupedChunk.endChunk * this.chunkSize, this.length);
        this.sendRequest(begin, end);
      }
    },

    getStream: function ChunkedStreamManager_getStream() {
      return this.stream;
    },

    // Loads any chunks in the requested range that are not yet loaded
    requestRange: function ChunkedStreamManager_requestRange(
                      begin, end, callback) {

      end = Math.min(end, this.length);

      var beginChunk = this.getBeginChunk(begin);
      var endChunk = this.getEndChunk(end);

      var chunks = [];
      for (var chunk = beginChunk; chunk < endChunk; ++chunk) {
        chunks.push(chunk);
      }

      this.requestChunks(chunks, callback);
    },

    requestRanges: function ChunkedStreamManager_requestRanges(ranges,
                                                               callback) {
      ranges = ranges || [];
      var chunksToRequest = [];

      for (var i = 0; i < ranges.length; i++) {
        var beginChunk = this.getBeginChunk(ranges[i].begin);
        var endChunk = this.getEndChunk(ranges[i].end);
        for (var chunk = beginChunk; chunk < endChunk; ++chunk) {
          if (chunksToRequest.indexOf(chunk) < 0) {
            chunksToRequest.push(chunk);
          }
        }
      }

      chunksToRequest.sort(function(a, b) { return a - b; });
      this.requestChunks(chunksToRequest, callback);
    },

    // Groups a sorted array of chunks into as few continguous larger
    // chunks as possible
    groupChunks: function ChunkedStreamManager_groupChunks(chunks) {
      var groupedChunks = [];
      var beginChunk = -1;
      var prevChunk = -1;
      for (var i = 0; i < chunks.length; ++i) {
        var chunk = chunks[i];

        if (beginChunk < 0) {
          beginChunk = chunk;
        }

        if (prevChunk >= 0 && prevChunk + 1 !== chunk) {
          groupedChunks.push({ beginChunk: beginChunk,
                               endChunk: prevChunk + 1 });
          beginChunk = chunk;
        }
        if (i + 1 === chunks.length) {
          groupedChunks.push({ beginChunk: beginChunk,
                               endChunk: chunk + 1 });
        }

        prevChunk = chunk;
      }
      return groupedChunks;
    },

    onProgress: function ChunkedStreamManager_onProgress(args) {
      var bytesLoaded = (this.stream.numChunksLoaded * this.chunkSize +
                         args.loaded);
      this.msgHandler.send('DocProgress', {
        loaded: bytesLoaded,
        total: this.length
      });
    },

    onReceiveData: function ChunkedStreamManager_onReceiveData(args) {
      var chunk = args.chunk;
      var isProgressive = args.begin === undefined;
      var begin = isProgressive ? this.progressiveDataLength : args.begin;
      var end = begin + chunk.byteLength;

      var beginChunk = Math.floor(begin / this.chunkSize);
      var endChunk = end < this.length ? Math.floor(end / this.chunkSize) :
                                         Math.ceil(end / this.chunkSize);

      if (isProgressive) {
        this.stream.onReceiveProgressiveData(chunk);
        this.progressiveDataLength = end;
      } else {
        this.stream.onReceiveData(begin, chunk);
      }

      if (this.stream.allChunksLoaded()) {
        this._loadedStreamCapability.resolve(this.stream);
      }

      var loadedRequests = [];
      var i, requestId;
      for (chunk = beginChunk; chunk < endChunk; ++chunk) {
        // The server might return more chunks than requested
        var requestIds = this.requestsByChunk[chunk] || [];
        delete this.requestsByChunk[chunk];

        for (i = 0; i < requestIds.length; ++i) {
          requestId = requestIds[i];
          var chunksNeeded = this.chunksNeededByRequest[requestId];
          if (chunk in chunksNeeded) {
            delete chunksNeeded[chunk];
          }

          if (!isEmptyObj(chunksNeeded)) {
            continue;
          }

          loadedRequests.push(requestId);
        }
      }

      // If there are no pending requests, automatically fetch the next
      // unfetched chunk of the PDF
      if (!this.disableAutoFetch && isEmptyObj(this.requestsByChunk)) {
        var nextEmptyChunk;
        if (this.stream.numChunksLoaded === 1) {
          // This is a special optimization so that after fetching the first
          // chunk, rather than fetching the second chunk, we fetch the last
          // chunk.
          var lastChunk = this.stream.numChunks - 1;
          if (!this.stream.hasChunk(lastChunk)) {
            nextEmptyChunk = lastChunk;
          }
        } else {
          nextEmptyChunk = this.stream.nextEmptyChunk(endChunk);
        }
        if (isInt(nextEmptyChunk)) {
          this.requestChunks([nextEmptyChunk]);
        }
      }

      for (i = 0; i < loadedRequests.length; ++i) {
        requestId = loadedRequests[i];
        var callback = this.callbacksByRequest[requestId];
        delete this.callbacksByRequest[requestId];
        if (callback) {
          callback();
        }
      }

      this.msgHandler.send('DocProgress', {
        loaded: this.stream.numChunksLoaded * this.chunkSize,
        total: this.length
      });
    },

    onError: function ChunkedStreamManager_onError(err) {
      this._loadedStreamCapability.reject(err);
    },

    getBeginChunk: function ChunkedStreamManager_getBeginChunk(begin) {
      var chunk = Math.floor(begin / this.chunkSize);
      return chunk;
    },

    getEndChunk: function ChunkedStreamManager_getEndChunk(end) {
      if (end % this.chunkSize === 0) {
        return end / this.chunkSize;
      }

      // 0 -> 0
      // 1 -> 1
      // 99 -> 1
      // 100 -> 1
      // 101 -> 2
      var chunk = Math.floor((end - 1) / this.chunkSize) + 1;
      return chunk;
    }
  };

  return ChunkedStreamManager;
})();



// The maximum number of bytes fetched per range request
var RANGE_CHUNK_SIZE = 65536;

// TODO(mack): Make use of PDFJS.Util.inherit() when it becomes available
var BasePdfManager = (function BasePdfManagerClosure() {
  function BasePdfManager() {
    throw new Error('Cannot initialize BaseManagerManager');
  }

  BasePdfManager.prototype = {
    onLoadedStream: function BasePdfManager_onLoadedStream() {
      throw new NotImplementedException();
    },

    ensureDoc: function BasePdfManager_ensureDoc(prop, args) {
      return this.ensure(this.pdfDocument, prop, args);
    },

    ensureXRef: function BasePdfManager_ensureXRef(prop, args) {
      return this.ensure(this.pdfDocument.xref, prop, args);
    },

    ensureCatalog: function BasePdfManager_ensureCatalog(prop, args) {
      return this.ensure(this.pdfDocument.catalog, prop, args);
    },

    getPage: function BasePdfManager_pagePage(pageIndex) {
      return this.pdfDocument.getPage(pageIndex);
    },

    cleanup: function BasePdfManager_cleanup() {
      return this.pdfDocument.cleanup();
    },

    ensure: function BasePdfManager_ensure(obj, prop, args) {
      return new NotImplementedException();
    },

    requestRange: function BasePdfManager_ensure(begin, end) {
      return new NotImplementedException();
    },

    requestLoadedStream: function BasePdfManager_requestLoadedStream() {
      return new NotImplementedException();
    },

    sendProgressiveData: function BasePdfManager_sendProgressiveData(chunk) {
      return new NotImplementedException();
    },

    updatePassword: function BasePdfManager_updatePassword(password) {
      this.pdfDocument.xref.password = this.password = password;
      if (this._passwordChangedCapability) {
        this._passwordChangedCapability.resolve();
      }
    },

    passwordChanged: function BasePdfManager_passwordChanged() {
      this._passwordChangedCapability = createPromiseCapability();
      return this._passwordChangedCapability.promise;
    },

    terminate: function BasePdfManager_terminate() {
      return new NotImplementedException();
    }
  };

  return BasePdfManager;
})();

var LocalPdfManager = (function LocalPdfManagerClosure() {
  function LocalPdfManager(data, password) {
    var stream = new Stream(data);
    this.pdfDocument = new PDFDocument(this, stream, password);
    this._loadedStreamCapability = createPromiseCapability();
    this._loadedStreamCapability.resolve(stream);
  }

  LocalPdfManager.prototype = Object.create(BasePdfManager.prototype);
  LocalPdfManager.prototype.constructor = LocalPdfManager;

  LocalPdfManager.prototype.ensure =
      function LocalPdfManager_ensure(obj, prop, args) {
    return new Promise(function (resolve, reject) {
      try {
        var value = obj[prop];
        var result;
        if (typeof value === 'function') {
          result = value.apply(obj, args);
        } else {
          result = value;
        }
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  };

  LocalPdfManager.prototype.requestRange =
      function LocalPdfManager_requestRange(begin, end) {
    return Promise.resolve();
  };

  LocalPdfManager.prototype.requestLoadedStream =
      function LocalPdfManager_requestLoadedStream() {
  };

  LocalPdfManager.prototype.onLoadedStream =
      function LocalPdfManager_getLoadedStream() {
    return this._loadedStreamCapability.promise;
  };

  LocalPdfManager.prototype.terminate =
      function LocalPdfManager_terminate() {
    return;
  };

  return LocalPdfManager;
})();

var NetworkPdfManager = (function NetworkPdfManagerClosure() {
  function NetworkPdfManager(args, msgHandler) {

    this.msgHandler = msgHandler;

    var params = {
      msgHandler: msgHandler,
      httpHeaders: args.httpHeaders,
      withCredentials: args.withCredentials,
      chunkedViewerLoading: args.chunkedViewerLoading,
      disableAutoFetch: args.disableAutoFetch,
      initialData: args.initialData
    };
    this.streamManager = new ChunkedStreamManager(args.length, RANGE_CHUNK_SIZE,
                                                  args.url, params);

    this.pdfDocument = new PDFDocument(this, this.streamManager.getStream(),
                                    args.password);
  }

  NetworkPdfManager.prototype = Object.create(BasePdfManager.prototype);
  NetworkPdfManager.prototype.constructor = NetworkPdfManager;

  NetworkPdfManager.prototype.ensure =
      function NetworkPdfManager_ensure(obj, prop, args) {
    var pdfManager = this;

    return new Promise(function (resolve, reject) {
      function ensureHelper() {
        try {
          var result;
          var value = obj[prop];
          if (typeof value === 'function') {
            result = value.apply(obj, args);
          } else {
            result = value;
          }
          resolve(result);
        } catch(e) {
          if (!(e instanceof MissingDataException)) {
            reject(e);
            return;
          }
          pdfManager.streamManager.requestRange(e.begin, e.end, ensureHelper);
        }
      }

      ensureHelper();
    });
  };

  NetworkPdfManager.prototype.requestRange =
      function NetworkPdfManager_requestRange(begin, end) {
    return new Promise(function (resolve) {
      this.streamManager.requestRange(begin, end, function() {
        resolve();
      });
    }.bind(this));
  };

  NetworkPdfManager.prototype.requestLoadedStream =
      function NetworkPdfManager_requestLoadedStream() {
    this.streamManager.requestAllChunks();
  };

  NetworkPdfManager.prototype.sendProgressiveData =
      function NetworkPdfManager_sendProgressiveData(chunk) {
    this.streamManager.onReceiveData({ chunk: chunk });
  };

  NetworkPdfManager.prototype.onLoadedStream =
      function NetworkPdfManager_getLoadedStream() {
    return this.streamManager.onLoadedStream();
  };

  NetworkPdfManager.prototype.terminate =
      function NetworkPdfManager_terminate() {
    this.streamManager.networkManager.abortAllRequests();
  };

  return NetworkPdfManager;
})();



var Page = (function PageClosure() {

  var LETTER_SIZE_MEDIABOX = [0, 0, 612, 792];

  function Page(pdfManager, xref, pageIndex, pageDict, ref, fontCache) {
    this.pdfManager = pdfManager;
    this.pageIndex = pageIndex;
    this.pageDict = pageDict;
    this.xref = xref;
    this.ref = ref;
    this.fontCache = fontCache;
    this.idCounters = {
      obj: 0
    };
    this.resourcesPromise = null;
  }

  Page.prototype = {
    getPageProp: function Page_getPageProp(key) {
      return this.pageDict.get(key);
    },

    getInheritedPageProp: function Page_inheritPageProp(key) {
      var dict = this.pageDict;
      var value = dict.get(key);
      while (value === undefined) {
        dict = dict.get('Parent');
        if (!dict) {
          break;
        }
        value = dict.get(key);
      }
      return value;
    },

    get content() {
      return this.getPageProp('Contents');
    },

    get resources() {
      var value = this.getInheritedPageProp('Resources');
      // For robustness: The spec states that a \Resources entry has to be
      // present, but can be empty. Some document omit it still. In this case
      // return an empty dictionary:
      if (value === undefined) {
        value = Dict.empty;
      }
      return shadow(this, 'resources', value);
    },

    get mediaBox() {
      var obj = this.getInheritedPageProp('MediaBox');
      // Reset invalid media box to letter size.
      if (!isArray(obj) || obj.length !== 4) {
        obj = LETTER_SIZE_MEDIABOX;
      }
      return shadow(this, 'mediaBox', obj);
    },

    get view() {
      var mediaBox = this.mediaBox;
      var cropBox = this.getInheritedPageProp('CropBox');
      if (!isArray(cropBox) || cropBox.length !== 4) {
        return shadow(this, 'view', mediaBox);
      }

      // From the spec, 6th ed., p.963:
      // "The crop, bleed, trim, and art boxes should not ordinarily
      // extend beyond the boundaries of the media box. If they do, they are
      // effectively reduced to their intersection with the media box."
      cropBox = Util.intersect(cropBox, mediaBox);
      if (!cropBox) {
        return shadow(this, 'view', mediaBox);
      }
      return shadow(this, 'view', cropBox);
    },

    get annotationRefs() {
      return shadow(this, 'annotationRefs',
                    this.getInheritedPageProp('Annots'));
    },

    get rotate() {
      var rotate = this.getInheritedPageProp('Rotate') || 0;
      // Normalize rotation so it's a multiple of 90 and between 0 and 270
      if (rotate % 90 !== 0) {
        rotate = 0;
      } else if (rotate >= 360) {
        rotate = rotate % 360;
      } else if (rotate < 0) {
        // The spec doesn't cover negatives, assume its counterclockwise
        // rotation. The following is the other implementation of modulo.
        rotate = ((rotate % 360) + 360) % 360;
      }
      return shadow(this, 'rotate', rotate);
    },

    getContentStream: function Page_getContentStream() {
      var content = this.content;
      var stream;
      if (isArray(content)) {
        // fetching items
        var xref = this.xref;
        var i, n = content.length;
        var streams = [];
        for (i = 0; i < n; ++i) {
          streams.push(xref.fetchIfRef(content[i]));
        }
        stream = new StreamsSequenceStream(streams);
      } else if (isStream(content)) {
        stream = content;
      } else {
        // replacing non-existent page content with empty one
        stream = new NullStream();
      }
      return stream;
    },

    loadResources: function Page_loadResources(keys) {
      if (!this.resourcesPromise) {
        // TODO: add async getInheritedPageProp and remove this.
        this.resourcesPromise = this.pdfManager.ensure(this, 'resources');
      }
      return this.resourcesPromise.then(function resourceSuccess() {
        var objectLoader = new ObjectLoader(this.resources.map,
                                            keys,
                                            this.xref);
        return objectLoader.load();
      }.bind(this));
    },

    getOperatorList: function Page_getOperatorList(handler, intent) {
      var self = this;

      var pdfManager = this.pdfManager;
      var contentStreamPromise = pdfManager.ensure(this, 'getContentStream',
                                                   []);
      var resourcesPromise = this.loadResources([
        'ExtGState',
        'ColorSpace',
        'Pattern',
        'Shading',
        'XObject',
        'Font'
        // ProcSet
        // Properties
      ]);

      var partialEvaluator = new PartialEvaluator(pdfManager, this.xref,
                                                  handler, this.pageIndex,
                                                  'p' + this.pageIndex + '_',
                                                  this.idCounters,
                                                  this.fontCache);

      var dataPromises = Promise.all([contentStreamPromise, resourcesPromise]);
      var pageListPromise = dataPromises.then(function(data) {
        var contentStream = data[0];
        var opList = new OperatorList(intent, handler, self.pageIndex);

        handler.send('StartRenderPage', {
          transparency: partialEvaluator.hasBlendModes(self.resources),
          pageIndex: self.pageIndex,
          intent: intent
        });
        return partialEvaluator.getOperatorList(contentStream, self.resources,
          opList).then(function () {
            return opList;
          });
      });

      var annotationsPromise = pdfManager.ensure(this, 'annotations');
      return Promise.all([pageListPromise, annotationsPromise]).then(
          function(datas) {
        var pageOpList = datas[0];
        var annotations = datas[1];

        if (annotations.length === 0) {
          pageOpList.flush(true);
          return pageOpList;
        }

        var annotationsReadyPromise = Annotation.appendToOperatorList(
          annotations, pageOpList, pdfManager, partialEvaluator, intent);
        return annotationsReadyPromise.then(function () {
          pageOpList.flush(true);
          return pageOpList;
        });
      });
    },

    extractTextContent: function Page_extractTextContent() {
      var handler = {
        on: function nullHandlerOn() {},
        send: function nullHandlerSend() {}
      };

      var self = this;

      var pdfManager = this.pdfManager;
      var contentStreamPromise = pdfManager.ensure(this, 'getContentStream',
                                                   []);

      var resourcesPromise = this.loadResources([
        'ExtGState',
        'XObject',
        'Font'
      ]);

      var dataPromises = Promise.all([contentStreamPromise,
                                      resourcesPromise]);
      return dataPromises.then(function(data) {
        var contentStream = data[0];
        var partialEvaluator = new PartialEvaluator(pdfManager, self.xref,
                                                    handler, self.pageIndex,
                                                    'p' + self.pageIndex + '_',
                                                    self.idCounters,
                                                    self.fontCache);

        return partialEvaluator.getTextContent(contentStream,
                                               self.resources);
      });
    },

    getAnnotationsData: function Page_getAnnotationsData() {
      var annotations = this.annotations;
      var annotationsData = [];
      for (var i = 0, n = annotations.length; i < n; ++i) {
        annotationsData.push(annotations[i].getData());
      }
      return annotationsData;
    },

    get annotations() {
      var annotations = [];
      var annotationRefs = (this.annotationRefs || []);
      for (var i = 0, n = annotationRefs.length; i < n; ++i) {
        var annotationRef = annotationRefs[i];
        var annotation = Annotation.fromRef(this.xref, annotationRef);
        if (annotation) {
          annotations.push(annotation);
        }
      }
      return shadow(this, 'annotations', annotations);
    }
  };

  return Page;
})();

/**
 * The `PDFDocument` holds all the data of the PDF file. Compared to the
 * `PDFDoc`, this one doesn't have any job management code.
 * Right now there exists one PDFDocument on the main thread + one object
 * for each worker. If there is no worker support enabled, there are two
 * `PDFDocument` objects on the main thread created.
 */
var PDFDocument = (function PDFDocumentClosure() {
  function PDFDocument(pdfManager, arg, password) {
    if (isStream(arg)) {
      init.call(this, pdfManager, arg, password);
    } else if (isArrayBuffer(arg)) {
      init.call(this, pdfManager, new Stream(arg), password);
    } else {
      error('PDFDocument: Unknown argument type');
    }
  }

  function init(pdfManager, stream, password) {
    assert(stream.length > 0, 'stream must have data');
    this.pdfManager = pdfManager;
    this.stream = stream;
    var xref = new XRef(this.stream, password, pdfManager);
    this.xref = xref;
  }

  function find(stream, needle, limit, backwards) {
    var pos = stream.pos;
    var end = stream.end;
    var strBuf = [];
    if (pos + limit > end) {
      limit = end - pos;
    }
    for (var n = 0; n < limit; ++n) {
      strBuf.push(String.fromCharCode(stream.getByte()));
    }
    var str = strBuf.join('');
    stream.pos = pos;
    var index = backwards ? str.lastIndexOf(needle) : str.indexOf(needle);
    if (index === -1) {
      return false; /* not found */
    }
    stream.pos += index;
    return true; /* found */
  }

  var DocumentInfoValidators = {
    get entries() {
      // Lazily build this since all the validation functions below are not
      // defined until after this file loads.
      return shadow(this, 'entries', {
        Title: isString,
        Author: isString,
        Subject: isString,
        Keywords: isString,
        Creator: isString,
        Producer: isString,
        CreationDate: isString,
        ModDate: isString,
        Trapped: isName
      });
    }
  };

  PDFDocument.prototype = {
    parse: function PDFDocument_parse(recoveryMode) {
      this.setup(recoveryMode);
      try {
        // checking if AcroForm is present
        this.acroForm = this.catalog.catDict.get('AcroForm');
        if (this.acroForm) {
          this.xfa = this.acroForm.get('XFA');
          var fields = this.acroForm.get('Fields');
          if ((!fields || !isArray(fields) || fields.length === 0) &&
              !this.xfa) {
            // no fields and no XFA -- not a form (?)
            this.acroForm = null;
          }
        }
      } catch (ex) {
        info('Something wrong with AcroForm entry');
        this.acroForm = null;
      }
    },

    get linearization() {
      var linearization = null;
      if (this.stream.length) {
        try {
          linearization = Linearization.create(this.stream);
        } catch (err) {
          if (err instanceof MissingDataException) {
            throw err;
          }
          info(err);
        }
      }
      // shadow the prototype getter with a data property
      return shadow(this, 'linearization', linearization);
    },
    get startXRef() {
      var stream = this.stream;
      var startXRef = 0;
      var linearization = this.linearization;
      if (linearization) {
        // Find end of first obj.
        stream.reset();
        if (find(stream, 'endobj', 1024)) {
          startXRef = stream.pos + 6;
        }
      } else {
        // Find startxref by jumping backward from the end of the file.
        var step = 1024;
        var found = false, pos = stream.end;
        while (!found && pos > 0) {
          pos -= step - 'startxref'.length;
          if (pos < 0) {
            pos = 0;
          }
          stream.pos = pos;
          found = find(stream, 'startxref', step, true);
        }
        if (found) {
          stream.skip(9);
          var ch;
          do {
            ch = stream.getByte();
          } while (Lexer.isSpace(ch));
          var str = '';
          while (ch >= 0x20 && ch <= 0x39) { // < '9'
            str += String.fromCharCode(ch);
            ch = stream.getByte();
          }
          startXRef = parseInt(str, 10);
          if (isNaN(startXRef)) {
            startXRef = 0;
          }
        }
      }
      // shadow the prototype getter with a data property
      return shadow(this, 'startXRef', startXRef);
    },
    get mainXRefEntriesOffset() {
      var mainXRefEntriesOffset = 0;
      var linearization = this.linearization;
      if (linearization) {
        mainXRefEntriesOffset = linearization.mainXRefEntriesOffset;
      }
      // shadow the prototype getter with a data property
      return shadow(this, 'mainXRefEntriesOffset', mainXRefEntriesOffset);
    },
    // Find the header, remove leading garbage and setup the stream
    // starting from the header.
    checkHeader: function PDFDocument_checkHeader() {
      var stream = this.stream;
      stream.reset();
      if (find(stream, '%PDF-', 1024)) {
        // Found the header, trim off any garbage before it.
        stream.moveStart();
        // Reading file format version
        var MAX_VERSION_LENGTH = 12;
        var version = '', ch;
        while ((ch = stream.getByte()) > 0x20) { // SPACE
          if (version.length >= MAX_VERSION_LENGTH) {
            break;
          }
          version += String.fromCharCode(ch);
        }
        // removing "%PDF-"-prefix
        this.pdfFormatVersion = version.substring(5);
        return;
      }
      // May not be a PDF file, continue anyway.
    },
    parseStartXRef: function PDFDocument_parseStartXRef() {
      var startXRef = this.startXRef;
      this.xref.setStartXRef(startXRef);
    },
    setup: function PDFDocument_setup(recoveryMode) {
      this.xref.parse(recoveryMode);
      this.catalog = new Catalog(this.pdfManager, this.xref);
    },
    get numPages() {
      var linearization = this.linearization;
      var num = linearization ? linearization.numPages : this.catalog.numPages;
      // shadow the prototype getter
      return shadow(this, 'numPages', num);
    },
    get documentInfo() {
      var docInfo = {
        PDFFormatVersion: this.pdfFormatVersion,
        IsAcroFormPresent: !!this.acroForm,
        IsXFAPresent: !!this.xfa
      };
      var infoDict;
      try {
        infoDict = this.xref.trailer.get('Info');
      } catch (err) {
        info('The document information dictionary is invalid.');
      }
      if (infoDict) {
        var validEntries = DocumentInfoValidators.entries;
        // Only fill the document info with valid entries from the spec.
        for (var key in validEntries) {
          if (infoDict.has(key)) {
            var value = infoDict.get(key);
            // Make sure the value conforms to the spec.
            if (validEntries[key](value)) {
              docInfo[key] = (typeof value !== 'string' ?
                              value : stringToPDFString(value));
            } else {
              info('Bad value in document info for "' + key + '"');
            }
          }
        }
      }
      return shadow(this, 'documentInfo', docInfo);
    },
    get fingerprint() {
      var xref = this.xref, hash, fileID = '';

      if (xref.trailer.has('ID')) {
        hash = stringToBytes(xref.trailer.get('ID')[0]);
      } else {
        hash = calculateMD5(this.stream.bytes.subarray(0, 100), 0, 100);
      }

      for (var i = 0, n = hash.length; i < n; i++) {
        fileID += hash[i].toString(16);
      }

      return shadow(this, 'fingerprint', fileID);
    },

    getPage: function PDFDocument_getPage(pageIndex) {
      return this.catalog.getPage(pageIndex);
    },

    cleanup: function PDFDocument_cleanup() {
      return this.catalog.cleanup();
    }
  };

  return PDFDocument;
})();



var Name = (function NameClosure() {
  function Name(name) {
    this.name = name;
  }

  Name.prototype = {};

  var nameCache = {};

  Name.get = function Name_get(name) {
    var nameValue = nameCache[name];
    return (nameValue ? nameValue : (nameCache[name] = new Name(name)));
  };

  return Name;
})();

var Cmd = (function CmdClosure() {
  function Cmd(cmd) {
    this.cmd = cmd;
  }

  Cmd.prototype = {};

  var cmdCache = {};

  Cmd.get = function Cmd_get(cmd) {
    var cmdValue = cmdCache[cmd];
    return (cmdValue ? cmdValue : (cmdCache[cmd] = new Cmd(cmd)));
  };

  return Cmd;
})();

var Dict = (function DictClosure() {
  var nonSerializable = function nonSerializableClosure() {
    return nonSerializable; // creating closure on some variable
  };

  var GETALL_DICTIONARY_TYPES_WHITELIST = {
    'Background': true,
    'ExtGState': true,
    'Halftone': true,
    'Layout': true,
    'Mask': true,
    'Pagination': true,
    'Printing': true
  };

  function isRecursionAllowedFor(dict) {
    if (!isName(dict.Type)) {
      return true;
    }
    var dictType = dict.Type.name;
    return GETALL_DICTIONARY_TYPES_WHITELIST[dictType] === true;
  }

  // xref is optional
  function Dict(xref) {
    // Map should only be used internally, use functions below to access.
    this.map = Object.create(null);
    this.xref = xref;
    this.objId = null;
    this.__nonSerializable__ = nonSerializable; // disable cloning of the Dict
  }

  Dict.prototype = {
    assignXref: function Dict_assignXref(newXref) {
      this.xref = newXref;
    },

    // automatically dereferences Ref objects
    get: function Dict_get(key1, key2, key3) {
      var value;
      var xref = this.xref;
      if (typeof (value = this.map[key1]) !== 'undefined' || key1 in this.map ||
          typeof key2 === 'undefined') {
        return xref ? xref.fetchIfRef(value) : value;
      }
      if (typeof (value = this.map[key2]) !== 'undefined' || key2 in this.map ||
          typeof key3 === 'undefined') {
        return xref ? xref.fetchIfRef(value) : value;
      }
      value = this.map[key3] || null;
      return xref ? xref.fetchIfRef(value) : value;
    },

    // Same as get(), but returns a promise and uses fetchIfRefAsync().
    getAsync: function Dict_getAsync(key1, key2, key3) {
      var value;
      var xref = this.xref;
      if (typeof (value = this.map[key1]) !== 'undefined' || key1 in this.map ||
          typeof key2 === 'undefined') {
        if (xref) {
          return xref.fetchIfRefAsync(value);
        }
        return Promise.resolve(value);
      }
      if (typeof (value = this.map[key2]) !== 'undefined' || key2 in this.map ||
          typeof key3 === 'undefined') {
        if (xref) {
          return xref.fetchIfRefAsync(value);
        }
        return Promise.resolve(value);
      }
      value = this.map[key3] || null;
      if (xref) {
        return xref.fetchIfRefAsync(value);
      }
      return Promise.resolve(value);
    },

    // no dereferencing
    getRaw: function Dict_getRaw(key) {
      return this.map[key];
    },

    // creates new map and dereferences all Refs
    getAll: function Dict_getAll() {
      var all = Object.create(null);
      var queue = null;
      var key, obj;
      for (key in this.map) {
        obj = this.get(key);
        if (obj instanceof Dict) {
          if (isRecursionAllowedFor(obj)) {
            (queue || (queue = [])).push({target: all, key: key, obj: obj});
          } else {
            all[key] = this.getRaw(key);
          }
        } else {
          all[key] = obj;
        }
      }
      if (!queue) {
        return all;
      }

      // trying to take cyclic references into the account
      var processed = Object.create(null);
      while (queue.length > 0) {
        var item = queue.shift();
        var itemObj = item.obj;
        var objId = itemObj.objId;
        if (objId && objId in processed) {
          item.target[item.key] = processed[objId];
          continue;
        }
        var dereferenced = Object.create(null);
        for (key in itemObj.map) {
          obj = itemObj.get(key);
          if (obj instanceof Dict) {
            if (isRecursionAllowedFor(obj)) {
              queue.push({target: dereferenced, key: key, obj: obj});
            } else {
              dereferenced[key] = itemObj.getRaw(key);
            }
          } else {
            dereferenced[key] = obj;
          }
        }
        if (objId) {
          processed[objId] = dereferenced;
        }
        item.target[item.key] = dereferenced;
      }
      return all;
    },

    set: function Dict_set(key, value) {
      this.map[key] = value;
    },

    has: function Dict_has(key) {
      return key in this.map;
    },

    forEach: function Dict_forEach(callback) {
      for (var key in this.map) {
        callback(key, this.get(key));
      }
    }
  };

  Dict.empty = new Dict(null);

  return Dict;
})();

var Ref = (function RefClosure() {
  function Ref(num, gen) {
    this.num = num;
    this.gen = gen;
  }

  Ref.prototype = {
    toString: function Ref_toString() {
      // This function is hot, so we make the string as compact as possible.
      // |this.gen| is almost always zero, so we treat that case specially.
      var str = this.num + 'R';
      if (this.gen !== 0) {
        str += this.gen;
      }
      return str;
    }
  };

  return Ref;
})();

// The reference is identified by number and generation.
// This structure stores only one instance of the reference.
var RefSet = (function RefSetClosure() {
  function RefSet() {
    this.dict = {};
  }

  RefSet.prototype = {
    has: function RefSet_has(ref) {
      return ref.toString() in this.dict;
    },

    put: function RefSet_put(ref) {
      this.dict[ref.toString()] = true;
    },

    remove: function RefSet_remove(ref) {
      delete this.dict[ref.toString()];
    }
  };

  return RefSet;
})();

var RefSetCache = (function RefSetCacheClosure() {
  function RefSetCache() {
    this.dict = Object.create(null);
  }

  RefSetCache.prototype = {
    get: function RefSetCache_get(ref) {
      return this.dict[ref.toString()];
    },

    has: function RefSetCache_has(ref) {
      return ref.toString() in this.dict;
    },

    put: function RefSetCache_put(ref, obj) {
      this.dict[ref.toString()] = obj;
    },

    putAlias: function RefSetCache_putAlias(ref, aliasRef) {
      this.dict[ref.toString()] = this.get(aliasRef);
    },

    forEach: function RefSetCache_forEach(fn, thisArg) {
      for (var i in this.dict) {
        fn.call(thisArg, this.dict[i]);
      }
    },

    clear: function RefSetCache_clear() {
      this.dict = Object.create(null);
    }
  };

  return RefSetCache;
})();

var Catalog = (function CatalogClosure() {
  function Catalog(pdfManager, xref) {
    this.pdfManager = pdfManager;
    this.xref = xref;
    this.catDict = xref.getCatalogObj();
    this.fontCache = new RefSetCache();
    assert(isDict(this.catDict),
      'catalog object is not a dictionary');

    this.pagePromises = [];
  }

  Catalog.prototype = {
    get metadata() {
      var streamRef = this.catDict.getRaw('Metadata');
      if (!isRef(streamRef)) {
        return shadow(this, 'metadata', null);
      }

      var encryptMetadata = (!this.xref.encrypt ? false :
                             this.xref.encrypt.encryptMetadata);

      var stream = this.xref.fetch(streamRef, !encryptMetadata);
      var metadata;
      if (stream && isDict(stream.dict)) {
        var type = stream.dict.get('Type');
        var subtype = stream.dict.get('Subtype');

        if (isName(type) && isName(subtype) &&
            type.name === 'Metadata' && subtype.name === 'XML') {
          // XXX: This should examine the charset the XML document defines,
          // however since there are currently no real means to decode
          // arbitrary charsets, let's just hope that the author of the PDF
          // was reasonable enough to stick with the XML default charset,
          // which is UTF-8.
          try {
            metadata = stringToUTF8String(bytesToString(stream.getBytes()));
          } catch (e) {
            info('Skipping invalid metadata.');
          }
        }
      }

      return shadow(this, 'metadata', metadata);
    },
    get toplevelPagesDict() {
      var pagesObj = this.catDict.get('Pages');
      assert(isDict(pagesObj), 'invalid top-level pages dictionary');
      // shadow the prototype getter
      return shadow(this, 'toplevelPagesDict', pagesObj);
    },
    get documentOutline() {
      var obj = null;
      try {
        obj = this.readDocumentOutline();
      } catch (ex) {
        if (ex instanceof MissingDataException) {
          throw ex;
        }
        warn('Unable to read document outline');
      }
      return shadow(this, 'documentOutline', obj);
    },
    readDocumentOutline: function Catalog_readDocumentOutline() {
      var xref = this.xref;
      var obj = this.catDict.get('Outlines');
      var root = { items: [] };
      if (isDict(obj)) {
        obj = obj.getRaw('First');
        var processed = new RefSet();
        if (isRef(obj)) {
          var queue = [{obj: obj, parent: root}];
          // to avoid recursion keeping track of the items
          // in the processed dictionary
          processed.put(obj);
          while (queue.length > 0) {
            var i = queue.shift();
            var outlineDict = xref.fetchIfRef(i.obj);
            if (outlineDict === null) {
              continue;
            }
            if (!outlineDict.has('Title')) {
              error('Invalid outline item');
            }
            var dest = outlineDict.get('A');
            if (dest) {
              dest = dest.get('D');
            } else if (outlineDict.has('Dest')) {
              dest = outlineDict.getRaw('Dest');
              if (isName(dest)) {
                dest = dest.name;
              }
            }
            var title = outlineDict.get('Title');
            var outlineItem = {
              dest: dest,
              title: stringToPDFString(title),
              color: outlineDict.get('C') || [0, 0, 0],
              count: outlineDict.get('Count'),
              bold: !!(outlineDict.get('F') & 2),
              italic: !!(outlineDict.get('F') & 1),
              items: []
            };
            i.parent.items.push(outlineItem);
            obj = outlineDict.getRaw('First');
            if (isRef(obj) && !processed.has(obj)) {
              queue.push({obj: obj, parent: outlineItem});
              processed.put(obj);
            }
            obj = outlineDict.getRaw('Next');
            if (isRef(obj) && !processed.has(obj)) {
              queue.push({obj: obj, parent: i.parent});
              processed.put(obj);
            }
          }
        }
      }
      return (root.items.length > 0 ? root.items : null);
    },
    get numPages() {
      var obj = this.toplevelPagesDict.get('Count');
      assert(
        isInt(obj),
        'page count in top level pages object is not an integer'
      );
      // shadow the prototype getter
      return shadow(this, 'num', obj);
    },
    get destinations() {
      function fetchDestination(dest) {
        return isDict(dest) ? dest.get('D') : dest;
      }

      var xref = this.xref;
      var dests = {}, nameTreeRef, nameDictionaryRef;
      var obj = this.catDict.get('Names');
      if (obj && obj.has('Dests')) {
        nameTreeRef = obj.getRaw('Dests');
      } else if (this.catDict.has('Dests')) {
        nameDictionaryRef = this.catDict.get('Dests');
      }

      if (nameDictionaryRef) {
        // reading simple destination dictionary
        obj = nameDictionaryRef;
        obj.forEach(function catalogForEach(key, value) {
          if (!value) {
            return;
          }
          dests[key] = fetchDestination(value);
        });
      }
      if (nameTreeRef) {
        var nameTree = new NameTree(nameTreeRef, xref);
        var names = nameTree.getAll();
        for (var name in names) {
          if (!names.hasOwnProperty(name)) {
            continue;
          }
          dests[name] = fetchDestination(names[name]);
        }
      }
      return shadow(this, 'destinations', dests);
    },
    getDestination: function Catalog_getDestination(destinationId) {
      function fetchDestination(dest) {
        return isDict(dest) ? dest.get('D') : dest;
      }

      var xref = this.xref;
      var dest, nameTreeRef, nameDictionaryRef;
      var obj = this.catDict.get('Names');
      if (obj && obj.has('Dests')) {
        nameTreeRef = obj.getRaw('Dests');
      } else if (this.catDict.has('Dests')) {
        nameDictionaryRef = this.catDict.get('Dests');
      }

      if (nameDictionaryRef) {
        // reading simple destination dictionary
        obj = nameDictionaryRef;
        obj.forEach(function catalogForEach(key, value) {
          if (!value) {
            return;
          }
          if (key === destinationId) {
            dest = fetchDestination(value);
          }
        });
      }
      if (nameTreeRef) {
        var nameTree = new NameTree(nameTreeRef, xref);
        dest = fetchDestination(nameTree.get(destinationId));
      }
      return dest;
    },
    get attachments() {
      var xref = this.xref;
      var attachments = null, nameTreeRef;
      var obj = this.catDict.get('Names');
      if (obj) {
        nameTreeRef = obj.getRaw('EmbeddedFiles');
      }

      if (nameTreeRef) {
        var nameTree = new NameTree(nameTreeRef, xref);
        var names = nameTree.getAll();
        for (var name in names) {
          if (!names.hasOwnProperty(name)) {
            continue;
          }
          var fs = new FileSpec(names[name], xref);
          if (!attachments) {
            attachments = {};
          }
          attachments[stringToPDFString(name)] = fs.serializable;
        }
      }
      return shadow(this, 'attachments', attachments);
    },
    get javaScript() {
      var xref = this.xref;
      var obj = this.catDict.get('Names');

      var javaScript = [];
      if (obj && obj.has('JavaScript')) {
        var nameTree = new NameTree(obj.getRaw('JavaScript'), xref);
        var names = nameTree.getAll();
        for (var name in names) {
          if (!names.hasOwnProperty(name)) {
            continue;
          }
          // We don't really use the JavaScript right now. This code is
          // defensive so we don't cause errors on document load.
          var jsDict = names[name];
          if (!isDict(jsDict)) {
            continue;
          }
          var type = jsDict.get('S');
          if (!isName(type) || type.name !== 'JavaScript') {
            continue;
          }
          var js = jsDict.get('JS');
          if (!isString(js) && !isStream(js)) {
            continue;
          }
          if (isStream(js)) {
            js = bytesToString(js.getBytes());
          }
          javaScript.push(stringToPDFString(js));
        }
      }

      // Append OpenAction actions to javaScript array
      var openactionDict = this.catDict.get('OpenAction');
      if (isDict(openactionDict)) {
        var objType = openactionDict.get('Type');
        var actionType = openactionDict.get('S');
        var action = openactionDict.get('N');
        var isPrintAction = (isName(objType) && objType.name === 'Action' &&
                            isName(actionType) && actionType.name === 'Named' &&
                            isName(action) && action.name === 'Print');
        
        if (isPrintAction) {
          javaScript.push('print(true);');
        }
      }

      return shadow(this, 'javaScript', javaScript);
    },

    cleanup: function Catalog_cleanup() {
      var promises = [];
      this.fontCache.forEach(function (promise) {
        promises.push(promise);
      });
      return Promise.all(promises).then(function (translatedFonts) {
        for (var i = 0, ii = translatedFonts.length; i < ii; i++) {
          var font = translatedFonts[i].dict;
          delete font.translated;
        }
        this.fontCache.clear();
      }.bind(this));
    },

    getPage: function Catalog_getPage(pageIndex) {
      if (!(pageIndex in this.pagePromises)) {
        this.pagePromises[pageIndex] = this.getPageDict(pageIndex).then(
          function (a) {
            var dict = a[0];
            var ref = a[1];
            return new Page(this.pdfManager, this.xref, pageIndex, dict, ref,
                            this.fontCache);
          }.bind(this)
        );
      }
      return this.pagePromises[pageIndex];
    },

    getPageDict: function Catalog_getPageDict(pageIndex) {
      var capability = createPromiseCapability();
      var nodesToVisit = [this.catDict.getRaw('Pages')];
      var currentPageIndex = 0;
      var xref = this.xref;

      function next() {
        while (nodesToVisit.length) {
          var currentNode = nodesToVisit.pop();

          if (isRef(currentNode)) {
            xref.fetchAsync(currentNode).then(function (obj) {
              if ((isDict(obj, 'Page') || (isDict(obj) && !obj.has('Kids')))) {
                if (pageIndex === currentPageIndex) {
                  capability.resolve([obj, currentNode]);
                } else {
                  currentPageIndex++;
                  next();
                }
                return;
              }
              nodesToVisit.push(obj);
              next();
            }, capability.reject);
            return;
          }

          // must be a child page dictionary
          assert(
            isDict(currentNode),
            'page dictionary kid reference points to wrong type of object'
          );
          var count = currentNode.get('Count');
          // Skip nodes where the page can't be.
          if (currentPageIndex + count <= pageIndex) {
            currentPageIndex += count;
            continue;
          }

          var kids = currentNode.get('Kids');
          assert(isArray(kids), 'page dictionary kids object is not an array');
          if (count === kids.length) {
            // Nodes that don't have the page have been skipped and this is the
            // bottom of the tree which means the page requested must be a
            // descendant of this pages node. Ideally we would just resolve the
            // promise with the page ref here, but there is the case where more
            // pages nodes could link to single a page (see issue 3666 pdf). To
            // handle this push it back on the queue so if it is a pages node it
            // will be descended into.
            nodesToVisit = [kids[pageIndex - currentPageIndex]];
            currentPageIndex = pageIndex;
            continue;
          } else {
            for (var last = kids.length - 1; last >= 0; last--) {
              nodesToVisit.push(kids[last]);
            }
          }
        }
        capability.reject('Page index ' + pageIndex + ' not found.');
      }
      next();
      return capability.promise;
    },

    getPageIndex: function Catalog_getPageIndex(ref) {
      // The page tree nodes have the count of all the leaves below them. To get
      // how many pages are before we just have to walk up the tree and keep
      // adding the count of siblings to the left of the node.
      var xref = this.xref;
      function pagesBeforeRef(kidRef) {
        var total = 0;
        var parentRef;
        return xref.fetchAsync(kidRef).then(function (node) {
          if (!node) {
            return null;
          }
          parentRef = node.getRaw('Parent');
          return node.getAsync('Parent');
        }).then(function (parent) {
          if (!parent) {
            return null;
          }
          return parent.getAsync('Kids');
        }).then(function (kids) {
          if (!kids) {
            return null;
          }
          var kidPromises = [];
          var found = false;
          for (var i = 0; i < kids.length; i++) {
            var kid = kids[i];
            assert(isRef(kid), 'kids must be a ref');
            if (kid.num === kidRef.num) {
              found = true;
              break;
            }
            kidPromises.push(xref.fetchAsync(kid).then(function (kid) {
              if (kid.has('Count')) {
                var count = kid.get('Count');
                total += count;
              } else { // page leaf node
                total++;
              }
            }));
          }
          if (!found) {
            error('kid ref not found in parents kids');
          }
          return Promise.all(kidPromises).then(function () {
            return [total, parentRef];
          });
        });
      }

      var total = 0;
      function next(ref) {
        return pagesBeforeRef(ref).then(function (args) {
          if (!args) {
            return total;
          }
          var count = args[0];
          var parentRef = args[1];
          total += count;
          return next(parentRef);
        });
      }

      return next(ref);
    }
  };

  return Catalog;
})();

var XRef = (function XRefClosure() {
  function XRef(stream, password) {
    this.stream = stream;
    this.entries = [];
    this.xrefstms = {};
    // prepare the XRef cache
    this.cache = [];
    this.password = password;
    this.stats = {
      streamTypes: [],
      fontTypes: []
    };
  }

  XRef.prototype = {
    setStartXRef: function XRef_setStartXRef(startXRef) {
      // Store the starting positions of xref tables as we process them
      // so we can recover from missing data errors
      this.startXRefQueue = [startXRef];
    },

    parse: function XRef_parse(recoveryMode) {
      var trailerDict;
      if (!recoveryMode) {
        trailerDict = this.readXRef();
      } else {
        warn('Indexing all PDF objects');
        trailerDict = this.indexObjects();
      }
      trailerDict.assignXref(this);
      this.trailer = trailerDict;
      var encrypt = trailerDict.get('Encrypt');
      if (encrypt) {
        var ids = trailerDict.get('ID');
        var fileId = (ids && ids.length) ? ids[0] : '';
        this.encrypt = new CipherTransformFactory(encrypt, fileId,
                                                  this.password);
      }

      // get the root dictionary (catalog) object
      if (!(this.root = trailerDict.get('Root'))) {
        error('Invalid root reference');
      }
    },

    processXRefTable: function XRef_processXRefTable(parser) {
      if (!('tableState' in this)) {
        // Stores state of the table as we process it so we can resume
        // from middle of table in case of missing data error
        this.tableState = {
          entryNum: 0,
          streamPos: parser.lexer.stream.pos,
          parserBuf1: parser.buf1,
          parserBuf2: parser.buf2
        };
      }

      var obj = this.readXRefTable(parser);

      // Sanity check
      if (!isCmd(obj, 'trailer')) {
        error('Invalid XRef table: could not find trailer dictionary');
      }
      // Read trailer dictionary, e.g.
      // trailer
      //    << /Size 22
      //      /Root 20R
      //      /Info 10R
      //      /ID [ <81b14aafa313db63dbd6f981e49f94f4> ]
      //    >>
      // The parser goes through the entire stream << ... >> and provides
      // a getter interface for the key-value table
      var dict = parser.getObj();

      // The pdflib PDF generator can generate a nested trailer dictionary
      if (!isDict(dict) && dict.dict) {
        dict = dict.dict;
      }
      if (!isDict(dict)) {
        error('Invalid XRef table: could not parse trailer dictionary');
      }
      delete this.tableState;

      return dict;
    },

    readXRefTable: function XRef_readXRefTable(parser) {
      // Example of cross-reference table:
      // xref
      // 0 1                    <-- subsection header (first obj #, obj count)
      // 0000000000 65535 f     <-- actual object (offset, generation #, f/n)
      // 23 2                   <-- subsection header ... and so on ...
      // 0000025518 00002 n
      // 0000025635 00000 n
      // trailer
      // ...

      var stream = parser.lexer.stream;
      var tableState = this.tableState;
      stream.pos = tableState.streamPos;
      parser.buf1 = tableState.parserBuf1;
      parser.buf2 = tableState.parserBuf2;

      // Outer loop is over subsection headers
      var obj;

      while (true) {
        if (!('firstEntryNum' in tableState) || !('entryCount' in tableState)) {
          if (isCmd(obj = parser.getObj(), 'trailer')) {
            break;
          }
          tableState.firstEntryNum = obj;
          tableState.entryCount = parser.getObj();
        }

        var first = tableState.firstEntryNum;
        var count = tableState.entryCount;
        if (!isInt(first) || !isInt(count)) {
          error('Invalid XRef table: wrong types in subsection header');
        }
        // Inner loop is over objects themselves
        for (var i = tableState.entryNum; i < count; i++) {
          tableState.streamPos = stream.pos;
          tableState.entryNum = i;
          tableState.parserBuf1 = parser.buf1;
          tableState.parserBuf2 = parser.buf2;

          var entry = {};
          entry.offset = parser.getObj();
          entry.gen = parser.getObj();
          var type = parser.getObj();

          if (isCmd(type, 'f')) {
            entry.free = true;
          } else if (isCmd(type, 'n')) {
            entry.uncompressed = true;
          }

          // Validate entry obj
          if (!isInt(entry.offset) || !isInt(entry.gen) ||
              !(entry.free || entry.uncompressed)) {
            error('Invalid entry in XRef subsection: ' + first + ', ' + count);
          }

          if (!this.entries[i + first]) {
            this.entries[i + first] = entry;
          }
        }

        tableState.entryNum = 0;
        tableState.streamPos = stream.pos;
        tableState.parserBuf1 = parser.buf1;
        tableState.parserBuf2 = parser.buf2;
        delete tableState.firstEntryNum;
        delete tableState.entryCount;
      }

      // Per issue 3248: hp scanners generate bad XRef
      if (first === 1 && this.entries[1] && this.entries[1].free) {
        // shifting the entries
        this.entries.shift();
      }

      // Sanity check: as per spec, first object must be free
      if (this.entries[0] && !this.entries[0].free) {
        error('Invalid XRef table: unexpected first object');
      }
      return obj;
    },

    processXRefStream: function XRef_processXRefStream(stream) {
      if (!('streamState' in this)) {
        // Stores state of the stream as we process it so we can resume
        // from middle of stream in case of missing data error
        var streamParameters = stream.dict;
        var byteWidths = streamParameters.get('W');
        var range = streamParameters.get('Index');
        if (!range) {
          range = [0, streamParameters.get('Size')];
        }

        this.streamState = {
          entryRanges: range,
          byteWidths: byteWidths,
          entryNum: 0,
          streamPos: stream.pos
        };
      }
      this.readXRefStream(stream);
      delete this.streamState;

      return stream.dict;
    },

    readXRefStream: function XRef_readXRefStream(stream) {
      var i, j;
      var streamState = this.streamState;
      stream.pos = streamState.streamPos;

      var byteWidths = streamState.byteWidths;
      var typeFieldWidth = byteWidths[0];
      var offsetFieldWidth = byteWidths[1];
      var generationFieldWidth = byteWidths[2];

      var entryRanges = streamState.entryRanges;
      while (entryRanges.length > 0) {
        var first = entryRanges[0];
        var n = entryRanges[1];

        if (!isInt(first) || !isInt(n)) {
          error('Invalid XRef range fields: ' + first + ', ' + n);
        }
        if (!isInt(typeFieldWidth) || !isInt(offsetFieldWidth) ||
            !isInt(generationFieldWidth)) {
          error('Invalid XRef entry fields length: ' + first + ', ' + n);
        }
        for (i = streamState.entryNum; i < n; ++i) {
          streamState.entryNum = i;
          streamState.streamPos = stream.pos;

          var type = 0, offset = 0, generation = 0;
          for (j = 0; j < typeFieldWidth; ++j) {
            type = (type << 8) | stream.getByte();
          }
          // if type field is absent, its default value is 1
          if (typeFieldWidth === 0) {
            type = 1;
          }
          for (j = 0; j < offsetFieldWidth; ++j) {
            offset = (offset << 8) | stream.getByte();
          }
          for (j = 0; j < generationFieldWidth; ++j) {
            generation = (generation << 8) | stream.getByte();
          }
          var entry = {};
          entry.offset = offset;
          entry.gen = generation;
          switch (type) {
            case 0:
              entry.free = true;
              break;
            case 1:
              entry.uncompressed = true;
              break;
            case 2:
              break;
            default:
              error('Invalid XRef entry type: ' + type);
          }
          if (!this.entries[first + i]) {
            this.entries[first + i] = entry;
          }
        }

        streamState.entryNum = 0;
        streamState.streamPos = stream.pos;
        entryRanges.splice(0, 2);
      }
    },

    indexObjects: function XRef_indexObjects() {
      // Simple scan through the PDF content to find objects,
      // trailers and XRef streams.
      function readToken(data, offset) {
        var token = '', ch = data[offset];
        while (ch !== 13 && ch !== 10) {
          if (++offset >= data.length) {
            break;
          }
          token += String.fromCharCode(ch);
          ch = data[offset];
        }
        return token;
      }
      function skipUntil(data, offset, what) {
        var length = what.length, dataLength = data.length;
        var skipped = 0;
        // finding byte sequence
        while (offset < dataLength) {
          var i = 0;
          while (i < length && data[offset + i] === what[i]) {
            ++i;
          }
          if (i >= length) {
            break; // sequence found
          }
          offset++;
          skipped++;
        }
        return skipped;
      }
      var trailerBytes = new Uint8Array([116, 114, 97, 105, 108, 101, 114]);
      var startxrefBytes = new Uint8Array([115, 116, 97, 114, 116, 120, 114,
                                          101, 102]);
      var endobjBytes = new Uint8Array([101, 110, 100, 111, 98, 106]);
      var xrefBytes = new Uint8Array([47, 88, 82, 101, 102]);

      var stream = this.stream;
      stream.pos = 0;
      var buffer = stream.getBytes();
      var position = stream.start, length = buffer.length;
      var trailers = [], xrefStms = [];
      while (position < length) {
        var ch = buffer[position];
        if (ch === 32 || ch === 9 || ch === 13 || ch === 10) {
          ++position;
          continue;
        }
        if (ch === 37) { // %-comment
          do {
            ++position;
            if (position >= length) {
              break;
            }
            ch = buffer[position];
          } while (ch !== 13 && ch !== 10);
          continue;
        }
        var token = readToken(buffer, position);
        var m;
        if (token === 'xref') {
          position += skipUntil(buffer, position, trailerBytes);
          trailers.push(position);
          position += skipUntil(buffer, position, startxrefBytes);
        } else if ((m = /^(\d+)\s+(\d+)\s+obj\b/.exec(token))) {
          this.entries[m[1]] = {
            offset: position,
            gen: m[2] | 0,
            uncompressed: true
          };

          var contentLength = skipUntil(buffer, position, endobjBytes) + 7;
          var content = buffer.subarray(position, position + contentLength);

          // checking XRef stream suspect
          // (it shall have '/XRef' and next char is not a letter)
          var xrefTagOffset = skipUntil(content, 0, xrefBytes);
          if (xrefTagOffset < contentLength &&
              content[xrefTagOffset + 5] < 64) {
            xrefStms.push(position);
            this.xrefstms[position] = 1; // don't read it recursively
          }

          position += contentLength;
        } else {
          position += token.length + 1;
        }
      }
      // reading XRef streams
      var i, ii;
      for (i = 0, ii = xrefStms.length; i < ii; ++i) {
        this.startXRefQueue.push(xrefStms[i]);
        this.readXRef(/* recoveryMode */ true);
      }
      // finding main trailer
      var dict;
      for (i = 0, ii = trailers.length; i < ii; ++i) {
        stream.pos = trailers[i];
        var parser = new Parser(new Lexer(stream), true, this);
        var obj = parser.getObj();
        if (!isCmd(obj, 'trailer')) {
          continue;
        }
        // read the trailer dictionary
        if (!isDict(dict = parser.getObj())) {
          continue;
        }
        // taking the first one with 'ID'
        if (dict.has('ID')) {
          return dict;
        }
      }
      // no tailer with 'ID', taking last one (if exists)
      if (dict) {
        return dict;
      }
      // nothing helps
      // calling error() would reject worker with an UnknownErrorException.
      throw new InvalidPDFException('Invalid PDF structure');
    },

    readXRef: function XRef_readXRef(recoveryMode) {
      var stream = this.stream;

      try {
        while (this.startXRefQueue.length) {
          var startXRef = this.startXRefQueue[0];

          stream.pos = startXRef + stream.start;

          var parser = new Parser(new Lexer(stream), true, this);
          var obj = parser.getObj();
          var dict;

          // Get dictionary
          if (isCmd(obj, 'xref')) {
            // Parse end-of-file XRef
            dict = this.processXRefTable(parser);
            if (!this.topDict) {
              this.topDict = dict;
            }

            // Recursively get other XRefs 'XRefStm', if any
            obj = dict.get('XRefStm');
            if (isInt(obj)) {
              var pos = obj;
              // ignore previously loaded xref streams
              // (possible infinite recursion)
              if (!(pos in this.xrefstms)) {
                this.xrefstms[pos] = 1;
                this.startXRefQueue.push(pos);
              }
            }
          } else if (isInt(obj)) {
            // Parse in-stream XRef
            if (!isInt(parser.getObj()) ||
                !isCmd(parser.getObj(), 'obj') ||
                !isStream(obj = parser.getObj())) {
              error('Invalid XRef stream');
            }
            dict = this.processXRefStream(obj);
            if (!this.topDict) {
              this.topDict = dict;
            }
            if (!dict) {
              error('Failed to read XRef stream');
            }
          } else {
            error('Invalid XRef stream header');
          }

          // Recursively get previous dictionary, if any
          obj = dict.get('Prev');
          if (isInt(obj)) {
            this.startXRefQueue.push(obj);
          } else if (isRef(obj)) {
            // The spec says Prev must not be a reference, i.e. "/Prev NNN"
            // This is a fallback for non-compliant PDFs, i.e. "/Prev NNN 0 R"
            this.startXRefQueue.push(obj.num);
          }

          this.startXRefQueue.shift();
        }

        return this.topDict;
      } catch (e) {
        if (e instanceof MissingDataException) {
          throw e;
        }
        info('(while reading XRef): ' + e);
      }

      if (recoveryMode) {
        return;
      }
      throw new XRefParseException();
    },

    getEntry: function XRef_getEntry(i) {
      var xrefEntry = this.entries[i];
      if (xrefEntry && !xrefEntry.free && xrefEntry.offset) {
        return xrefEntry;
      }
      return null;
    },

    fetchIfRef: function XRef_fetchIfRef(obj) {
      if (!isRef(obj)) {
        return obj;
      }
      return this.fetch(obj);
    },

    fetch: function XRef_fetch(ref, suppressEncryption) {
      assert(isRef(ref), 'ref object is not a reference');
      var num = ref.num;
      if (num in this.cache) {
        var cacheEntry = this.cache[num];
        return cacheEntry;
      }

      var xrefEntry = this.getEntry(num);

      // the referenced entry can be free
      if (xrefEntry === null) {
        return (this.cache[num] = null);
      }

      if (xrefEntry.uncompressed) {
        xrefEntry = this.fetchUncompressed(ref, xrefEntry, suppressEncryption);
      } else {
        xrefEntry = this.fetchCompressed(xrefEntry, suppressEncryption);
      }
      if (isDict(xrefEntry)){
        xrefEntry.objId = ref.toString();
      } else if (isStream(xrefEntry)) {
        xrefEntry.dict.objId = ref.toString();
      }
      return xrefEntry;
    },

    fetchUncompressed: function XRef_fetchUncompressed(ref, xrefEntry,
                                                       suppressEncryption) {
      var gen = ref.gen;
      var num = ref.num;
      if (xrefEntry.gen !== gen) {
        error('inconsistent generation in XRef');
      }
      var stream = this.stream.makeSubStream(xrefEntry.offset +
                                             this.stream.start);
      var parser = new Parser(new Lexer(stream), true, this);
      var obj1 = parser.getObj();
      var obj2 = parser.getObj();
      var obj3 = parser.getObj();
      if (!isInt(obj1) || parseInt(obj1, 10) !== num ||
          !isInt(obj2) || parseInt(obj2, 10) !== gen ||
          !isCmd(obj3)) {
        error('bad XRef entry');
      }
      if (!isCmd(obj3, 'obj')) {
        // some bad PDFs use "obj1234" and really mean 1234
        if (obj3.cmd.indexOf('obj') === 0) {
          num = parseInt(obj3.cmd.substring(3), 10);
          if (!isNaN(num)) {
            return num;
          }
        }
        error('bad XRef entry');
      }
      if (this.encrypt && !suppressEncryption) {
        xrefEntry = parser.getObj(this.encrypt.createCipherTransform(num, gen));
      } else {
        xrefEntry = parser.getObj();
      }
      if (!isStream(xrefEntry)) {
        this.cache[num] = xrefEntry;
      }
      return xrefEntry;
    },

    fetchCompressed: function XRef_fetchCompressed(xrefEntry,
                                                   suppressEncryption) {
      var tableOffset = xrefEntry.offset;
      var stream = this.fetch(new Ref(tableOffset, 0));
      if (!isStream(stream)) {
        error('bad ObjStm stream');
      }
      var first = stream.dict.get('First');
      var n = stream.dict.get('N');
      if (!isInt(first) || !isInt(n)) {
        error('invalid first and n parameters for ObjStm stream');
      }
      var parser = new Parser(new Lexer(stream), false, this);
      parser.allowStreams = true;
      var i, entries = [], num, nums = [];
      // read the object numbers to populate cache
      for (i = 0; i < n; ++i) {
        num = parser.getObj();
        if (!isInt(num)) {
          error('invalid object number in the ObjStm stream: ' + num);
        }
        nums.push(num);
        var offset = parser.getObj();
        if (!isInt(offset)) {
          error('invalid object offset in the ObjStm stream: ' + offset);
        }
      }
      // read stream objects for cache
      for (i = 0; i < n; ++i) {
        entries.push(parser.getObj());
        num = nums[i];
        var entry = this.entries[num];
        if (entry && entry.offset === tableOffset && entry.gen === i) {
          this.cache[num] = entries[i];
        }
      }
      xrefEntry = entries[xrefEntry.gen];
      if (xrefEntry === undefined) {
        error('bad XRef entry for compressed object');
      }
      return xrefEntry;
    },

    fetchIfRefAsync: function XRef_fetchIfRefAsync(obj) {
      if (!isRef(obj)) {
        return Promise.resolve(obj);
      }
      return this.fetchAsync(obj);
    },

    fetchAsync: function XRef_fetchAsync(ref, suppressEncryption) {
      var streamManager = this.stream.manager;
      var xref = this;
      return new Promise(function tryFetch(resolve, reject) {
        try {
          resolve(xref.fetch(ref, suppressEncryption));
        } catch (e) {
          if (e instanceof MissingDataException) {
            streamManager.requestRange(e.begin, e.end, function () {
              tryFetch(resolve, reject);
            });
            return;
          }
          reject(e);
        }
      });
    },

    getCatalogObj: function XRef_getCatalogObj() {
      return this.root;
    }
  };

  return XRef;
})();

/**
 * A NameTree is like a Dict but has some advantageous properties, see the
 * spec (7.9.6) for more details.
 * TODO: implement all the Dict functions and make this more efficent.
 */
var NameTree = (function NameTreeClosure() {
  function NameTree(root, xref) {
    this.root = root;
    this.xref = xref;
  }

  NameTree.prototype = {
    getAll: function NameTree_getAll() {
      var dict = {};
      if (!this.root) {
        return dict;
      }
      var xref = this.xref;
      // reading name tree
      var processed = new RefSet();
      processed.put(this.root);
      var queue = [this.root];
      while (queue.length > 0) {
        var i, n;
        var obj = xref.fetchIfRef(queue.shift());
        if (!isDict(obj)) {
          continue;
        }
        if (obj.has('Kids')) {
          var kids = obj.get('Kids');
          for (i = 0, n = kids.length; i < n; i++) {
            var kid = kids[i];
            if (processed.has(kid)) {
              error('invalid destinations');
            }
            queue.push(kid);
            processed.put(kid);
          }
          continue;
        }
        var names = obj.get('Names');
        if (names) {
          for (i = 0, n = names.length; i < n; i += 2) {
            dict[names[i]] = xref.fetchIfRef(names[i + 1]);
          }
        }
      }
      return dict;
    },

    get: function NameTree_get(destinationId) {
      if (!this.root) {
        return null;
      }

      var xref = this.xref;
      var kidsOrNames = xref.fetchIfRef(this.root);
      var loopCount = 0;
      var MAX_NAMES_LEVELS = 10;
      var l, r, m;

      // Perform a binary search to quickly find the entry that
      // contains the named destination we are looking for.
      while (kidsOrNames.has('Kids')) {
        loopCount++;
        if (loopCount > MAX_NAMES_LEVELS) {
          warn('Search depth limit for named destionations has been reached.');
          return null;
        }
        
        var kids = kidsOrNames.get('Kids');
        if (!isArray(kids)) {
          return null;
        }

        l = 0;
        r = kids.length - 1;
        while (l <= r) {
          m = (l + r) >> 1;
          var kid = xref.fetchIfRef(kids[m]);
          var limits = kid.get('Limits');

          if (destinationId < limits[0]) {
            r = m - 1;
          } else if (destinationId > limits[1]) {
            l = m + 1;
          } else {
            kidsOrNames = xref.fetchIfRef(kids[m]);
            break;
          }
        }
        if (l > r) {
          return null;
        }
      }

      // If we get here, then we have found the right entry. Now
      // go through the named destinations in the Named dictionary
      // until we find the exact destination we're looking for.
      var names = kidsOrNames.get('Names');
      if (isArray(names)) {
        // Perform a binary search to reduce the lookup time.
        l = 0;
        r = names.length - 2;
        while (l <= r) {
          // Check only even indices (0, 2, 4, ...) because the
          // odd indices contain the actual D array.
          m = (l + r) & ~1;
          if (destinationId < names[m]) {
            r = m - 2;
          } else if (destinationId > names[m]) {
            l = m + 2;
          } else {
            return xref.fetchIfRef(names[m + 1]);
          }
        }
      }
      return null;
    }
  };
  return NameTree;
})();

/**
 * "A PDF file can refer to the contents of another file by using a File 
 * Specification (PDF 1.1)", see the spec (7.11) for more details.
 * NOTE: Only embedded files are supported (as part of the attachments support)
 * TODO: support the 'URL' file system (with caching if !/V), portable 
 * collections attributes and related files (/RF)
 */
var FileSpec = (function FileSpecClosure() {
  function FileSpec(root, xref) {
    if (!root || !isDict(root)) {
      return;
    }
    this.xref = xref;
    this.root = root;
    if (root.has('FS')) {
      this.fs = root.get('FS');
    }
    this.description = root.has('Desc') ?
                         stringToPDFString(root.get('Desc')) :
                         '';
    if (root.has('RF')) {
      warn('Related file specifications are not supported');
    }
    this.contentAvailable = true;
    if (!root.has('EF')) {
      this.contentAvailable = false;
      warn('Non-embedded file specifications are not supported');
    }
  }

  function pickPlatformItem(dict) {
    // Look for the filename in this order:
    // UF, F, Unix, Mac, DOS
    if (dict.has('UF')) {
      return dict.get('UF');
    } else if (dict.has('F')) {
      return dict.get('F');
    } else if (dict.has('Unix')) {
      return dict.get('Unix');
    } else if (dict.has('Mac')) {
      return dict.get('Mac');
    } else if (dict.has('DOS')) {
      return dict.get('DOS');
    } else {
      return null;
    }
  }

  FileSpec.prototype = {
    get filename() {
      if (!this._filename && this.root) {
        var filename = pickPlatformItem(this.root) || 'unnamed';
        this._filename = stringToPDFString(filename).
          replace(/\\\\/g, '\\').
          replace(/\\\//g, '/').
          replace(/\\/g, '/');
      }
      return this._filename;
    },
    get content() {
      if (!this.contentAvailable) {
        return null;
      }
      if (!this.contentRef && this.root) {
        this.contentRef = pickPlatformItem(this.root.get('EF'));
      }
      var content = null;
      if (this.contentRef) {
        var xref = this.xref;
        var fileObj = xref.fetchIfRef(this.contentRef);
        if (fileObj && isStream(fileObj)) {
          content = fileObj.getBytes();
        } else {
          warn('Embedded file specification points to non-existing/invalid ' +
            'content');
        }
      } else {
        warn('Embedded file specification does not have a content');
      }
      return content;
    },
    get serializable() {
      return {
        filename: this.filename,
        content: this.content
      };
    }
  };
  return FileSpec;
})();

/**
 * A helper for loading missing data in object graphs. It traverses the graph
 * depth first and queues up any objects that have missing data. Once it has
 * has traversed as many objects that are available it attempts to bundle the
 * missing data requests and then resume from the nodes that weren't ready.
 *
 * NOTE: It provides protection from circular references by keeping track of
 * of loaded references. However, you must be careful not to load any graphs
 * that have references to the catalog or other pages since that will cause the
 * entire PDF document object graph to be traversed.
 */
var ObjectLoader = (function() {
  function mayHaveChildren(value) {
    return isRef(value) || isDict(value) || isArray(value) || isStream(value);
  }

  function addChildren(node, nodesToVisit) {
    var value;
    if (isDict(node) || isStream(node)) {
      var map;
      if (isDict(node)) {
        map = node.map;
      } else {
        map = node.dict.map;
      }
      for (var key in map) {
        value = map[key];
        if (mayHaveChildren(value)) {
          nodesToVisit.push(value);
        }
      }
    } else if (isArray(node)) {
      for (var i = 0, ii = node.length; i < ii; i++) {
        value = node[i];
        if (mayHaveChildren(value)) {
          nodesToVisit.push(value);
        }
      }
    }
  }

  function ObjectLoader(obj, keys, xref) {
    this.obj = obj;
    this.keys = keys;
    this.xref = xref;
    this.refSet = null;
  }

  ObjectLoader.prototype = {
    load: function ObjectLoader_load() {
      var keys = this.keys;
      this.capability = createPromiseCapability();
      // Don't walk the graph if all the data is already loaded.
      if (!(this.xref.stream instanceof ChunkedStream) ||
          this.xref.stream.getMissingChunks().length === 0) {
        this.capability.resolve();
        return this.capability.promise;
      }

      this.refSet = new RefSet();
      // Setup the initial nodes to visit.
      var nodesToVisit = [];
      for (var i = 0; i < keys.length; i++) {
        nodesToVisit.push(this.obj[keys[i]]);
      }

      this.walk(nodesToVisit);
      return this.capability.promise;
    },

    walk: function ObjectLoader_walk(nodesToVisit) {
      var nodesToRevisit = [];
      var pendingRequests = [];
      // DFS walk of the object graph.
      while (nodesToVisit.length) {
        var currentNode = nodesToVisit.pop();

        // Only references or chunked streams can cause missing data exceptions.
        if (isRef(currentNode)) {
          // Skip nodes that have already been visited.
          if (this.refSet.has(currentNode)) {
            continue;
          }
          try {
            var ref = currentNode;
            this.refSet.put(ref);
            currentNode = this.xref.fetch(currentNode);
          } catch (e) {
            if (!(e instanceof MissingDataException)) {
              throw e;
            }
            nodesToRevisit.push(currentNode);
            pendingRequests.push({ begin: e.begin, end: e.end });
          }
        }
        if (currentNode && currentNode.getBaseStreams) {
          var baseStreams = currentNode.getBaseStreams();
          var foundMissingData = false;
          for (var i = 0; i < baseStreams.length; i++) {
            var stream = baseStreams[i];
            if (stream.getMissingChunks && stream.getMissingChunks().length) {
              foundMissingData = true;
              pendingRequests.push({
                begin: stream.start,
                end: stream.end
              });
            }
          }
          if (foundMissingData) {
            nodesToRevisit.push(currentNode);
          }
        }

        addChildren(currentNode, nodesToVisit);
      }

      if (pendingRequests.length) {
        this.xref.stream.manager.requestRanges(pendingRequests,
            function pendingRequestCallback() {
          nodesToVisit = nodesToRevisit;
          for (var i = 0; i < nodesToRevisit.length; i++) {
            var node = nodesToRevisit[i];
            // Remove any reference nodes from the currrent refset so they
            // aren't skipped when we revist them.
            if (isRef(node)) {
              this.refSet.remove(node);
            }
          }
          this.walk(nodesToVisit);
        }.bind(this));
        return;
      }
      // Everything is loaded.
      this.refSet = null;
      this.capability.resolve();
    }
  };

  return ObjectLoader;
})();


var ISOAdobeCharset = [
  '.notdef', 'space', 'exclam', 'quotedbl', 'numbersign', 'dollar',
  'percent', 'ampersand', 'quoteright', 'parenleft', 'parenright',
  'asterisk', 'plus', 'comma', 'hyphen', 'period', 'slash', 'zero',
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'colon', 'semicolon', 'less', 'equal', 'greater', 'question',
  'at', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'bracketleft', 'backslash', 'bracketright', 'asciicircum', 'underscore',
  'quoteleft', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
  'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'braceleft', 'bar', 'braceright', 'asciitilde', 'exclamdown', 'cent',
  'sterling', 'fraction', 'yen', 'florin', 'section', 'currency',
  'quotesingle', 'quotedblleft', 'guillemotleft', 'guilsinglleft',
  'guilsinglright', 'fi', 'fl', 'endash', 'dagger', 'daggerdbl',
  'periodcentered', 'paragraph', 'bullet', 'quotesinglbase',
  'quotedblbase', 'quotedblright', 'guillemotright', 'ellipsis',
  'perthousand', 'questiondown', 'grave', 'acute', 'circumflex', 'tilde',
  'macron', 'breve', 'dotaccent', 'dieresis', 'ring', 'cedilla',
  'hungarumlaut', 'ogonek', 'caron', 'emdash', 'AE', 'ordfeminine',
  'Lslash', 'Oslash', 'OE', 'ordmasculine', 'ae', 'dotlessi', 'lslash',
  'oslash', 'oe', 'germandbls', 'onesuperior', 'logicalnot', 'mu',
  'trademark', 'Eth', 'onehalf', 'plusminus', 'Thorn', 'onequarter',
  'divide', 'brokenbar', 'degree', 'thorn', 'threequarters', 'twosuperior',
  'registered', 'minus', 'eth', 'multiply', 'threesuperior', 'copyright',
  'Aacute', 'Acircumflex', 'Adieresis', 'Agrave', 'Aring', 'Atilde',
  'Ccedilla', 'Eacute', 'Ecircumflex', 'Edieresis', 'Egrave', 'Iacute',
  'Icircumflex', 'Idieresis', 'Igrave', 'Ntilde', 'Oacute', 'Ocircumflex',
  'Odieresis', 'Ograve', 'Otilde', 'Scaron', 'Uacute', 'Ucircumflex',
  'Udieresis', 'Ugrave', 'Yacute', 'Ydieresis', 'Zcaron', 'aacute',
  'acircumflex', 'adieresis', 'agrave', 'aring', 'atilde', 'ccedilla',
  'eacute', 'ecircumflex', 'edieresis', 'egrave', 'iacute', 'icircumflex',
  'idieresis', 'igrave', 'ntilde', 'oacute', 'ocircumflex', 'odieresis',
  'ograve', 'otilde', 'scaron', 'uacute', 'ucircumflex', 'udieresis',
  'ugrave', 'yacute', 'ydieresis', 'zcaron'
];

var ExpertCharset = [
  '.notdef', 'space', 'exclamsmall', 'Hungarumlautsmall', 'dollaroldstyle',
  'dollarsuperior', 'ampersandsmall', 'Acutesmall', 'parenleftsuperior',
  'parenrightsuperior', 'twodotenleader', 'onedotenleader', 'comma',
  'hyphen', 'period', 'fraction', 'zerooldstyle', 'oneoldstyle',
  'twooldstyle', 'threeoldstyle', 'fouroldstyle', 'fiveoldstyle',
  'sixoldstyle', 'sevenoldstyle', 'eightoldstyle', 'nineoldstyle',
  'colon', 'semicolon', 'commasuperior', 'threequartersemdash',
  'periodsuperior', 'questionsmall', 'asuperior', 'bsuperior',
  'centsuperior', 'dsuperior', 'esuperior', 'isuperior', 'lsuperior',
  'msuperior', 'nsuperior', 'osuperior', 'rsuperior', 'ssuperior',
  'tsuperior', 'ff', 'fi', 'fl', 'ffi', 'ffl', 'parenleftinferior',
  'parenrightinferior', 'Circumflexsmall', 'hyphensuperior', 'Gravesmall',
  'Asmall', 'Bsmall', 'Csmall', 'Dsmall', 'Esmall', 'Fsmall', 'Gsmall',
  'Hsmall', 'Ismall', 'Jsmall', 'Ksmall', 'Lsmall', 'Msmall', 'Nsmall',
  'Osmall', 'Psmall', 'Qsmall', 'Rsmall', 'Ssmall', 'Tsmall', 'Usmall',
  'Vsmall', 'Wsmall', 'Xsmall', 'Ysmall', 'Zsmall', 'colonmonetary',
  'onefitted', 'rupiah', 'Tildesmall', 'exclamdownsmall', 'centoldstyle',
  'Lslashsmall', 'Scaronsmall', 'Zcaronsmall', 'Dieresissmall',
  'Brevesmall', 'Caronsmall', 'Dotaccentsmall', 'Macronsmall',
  'figuredash', 'hypheninferior', 'Ogoneksmall', 'Ringsmall',
  'Cedillasmall', 'onequarter', 'onehalf', 'threequarters',
  'questiondownsmall', 'oneeighth', 'threeeighths', 'fiveeighths',
  'seveneighths', 'onethird', 'twothirds', 'zerosuperior', 'onesuperior',
  'twosuperior', 'threesuperior', 'foursuperior', 'fivesuperior',
  'sixsuperior', 'sevensuperior', 'eightsuperior', 'ninesuperior',
  'zeroinferior', 'oneinferior', 'twoinferior', 'threeinferior',
  'fourinferior', 'fiveinferior', 'sixinferior', 'seveninferior',
  'eightinferior', 'nineinferior', 'centinferior', 'dollarinferior',
  'periodinferior', 'commainferior', 'Agravesmall', 'Aacutesmall',
  'Acircumflexsmall', 'Atildesmall', 'Adieresissmall', 'Aringsmall',
  'AEsmall', 'Ccedillasmall', 'Egravesmall', 'Eacutesmall',
  'Ecircumflexsmall', 'Edieresissmall', 'Igravesmall', 'Iacutesmall',
  'Icircumflexsmall', 'Idieresissmall', 'Ethsmall', 'Ntildesmall',
  'Ogravesmall', 'Oacutesmall', 'Ocircumflexsmall', 'Otildesmall',
  'Odieresissmall', 'OEsmall', 'Oslashsmall', 'Ugravesmall', 'Uacutesmall',
  'Ucircumflexsmall', 'Udieresissmall', 'Yacutesmall', 'Thornsmall',
  'Ydieresissmall'
];

var ExpertSubsetCharset = [
  '.notdef', 'space', 'dollaroldstyle', 'dollarsuperior',
  'parenleftsuperior', 'parenrightsuperior', 'twodotenleader',
  'onedotenleader', 'comma', 'hyphen', 'period', 'fraction',
  'zerooldstyle', 'oneoldstyle', 'twooldstyle', 'threeoldstyle',
  'fouroldstyle', 'fiveoldstyle', 'sixoldstyle', 'sevenoldstyle',
  'eightoldstyle', 'nineoldstyle', 'colon', 'semicolon', 'commasuperior',
  'threequartersemdash', 'periodsuperior', 'asuperior', 'bsuperior',
  'centsuperior', 'dsuperior', 'esuperior', 'isuperior', 'lsuperior',
  'msuperior', 'nsuperior', 'osuperior', 'rsuperior', 'ssuperior',
  'tsuperior', 'ff', 'fi', 'fl', 'ffi', 'ffl', 'parenleftinferior',
  'parenrightinferior', 'hyphensuperior', 'colonmonetary', 'onefitted',
  'rupiah', 'centoldstyle', 'figuredash', 'hypheninferior', 'onequarter',
  'onehalf', 'threequarters', 'oneeighth', 'threeeighths', 'fiveeighths',
  'seveneighths', 'onethird', 'twothirds', 'zerosuperior', 'onesuperior',
  'twosuperior', 'threesuperior', 'foursuperior', 'fivesuperior',
  'sixsuperior', 'sevensuperior', 'eightsuperior', 'ninesuperior',
  'zeroinferior', 'oneinferior', 'twoinferior', 'threeinferior',
  'fourinferior', 'fiveinferior', 'sixinferior', 'seveninferior',
  'eightinferior', 'nineinferior', 'centinferior', 'dollarinferior',
  'periodinferior', 'commainferior'
];



var DEFAULT_ICON_SIZE = 22; // px
var SUPPORTED_TYPES = ['Link', 'Text', 'Widget'];

var Annotation = (function AnnotationClosure() {
  // 12.5.5: Algorithm: Appearance streams
  function getTransformMatrix(rect, bbox, matrix) {
    var bounds = Util.getAxialAlignedBoundingBox(bbox, matrix);
    var minX = bounds[0];
    var minY = bounds[1];
    var maxX = bounds[2];
    var maxY = bounds[3];

    if (minX === maxX || minY === maxY) {
      // From real-life file, bbox was [0, 0, 0, 0]. In this case,
      // just apply the transform for rect
      return [1, 0, 0, 1, rect[0], rect[1]];
    }

    var xRatio = (rect[2] - rect[0]) / (maxX - minX);
    var yRatio = (rect[3] - rect[1]) / (maxY - minY);
    return [
      xRatio,
      0,
      0,
      yRatio,
      rect[0] - minX * xRatio,
      rect[1] - minY * yRatio
    ];
  }

  function getDefaultAppearance(dict) {
    var appearanceState = dict.get('AP');
    if (!isDict(appearanceState)) {
      return;
    }

    var appearance;
    var appearances = appearanceState.get('N');
    if (isDict(appearances)) {
      var as = dict.get('AS');
      if (as && appearances.has(as.name)) {
        appearance = appearances.get(as.name);
      }
    } else {
      appearance = appearances;
    }
    return appearance;
  }

  function Annotation(params) {
    var dict = params.dict;
    var data = this.data = {};

    data.subtype = dict.get('Subtype').name;
    var rect = dict.get('Rect') || [0, 0, 0, 0];
    data.rect = Util.normalizeRect(rect);
    data.annotationFlags = dict.get('F');

    var color = dict.get('C');
    if (isArray(color) && color.length === 3) {
      // TODO(mack): currently only supporting rgb; need support different
      // colorspaces
      data.color = color;
    } else {
      data.color = [0, 0, 0];
    }

    // Some types of annotations have border style dict which has more
    // info than the border array
    if (dict.has('BS')) {
      var borderStyle = dict.get('BS');
      data.borderWidth = borderStyle.has('W') ? borderStyle.get('W') : 1;
    } else {
      var borderArray = dict.get('Border') || [0, 0, 1];
      data.borderWidth = borderArray[2] || 0;

      // TODO: implement proper support for annotations with line dash patterns.
      var dashArray = borderArray[3];
      if (data.borderWidth > 0 && dashArray) {
        if (!isArray(dashArray)) {
          // Ignore the border if dashArray is not actually an array,
          // this is consistent with the behaviour in Adobe Reader. 
          data.borderWidth = 0;
        } else {
          var dashArrayLength = dashArray.length;
          if (dashArrayLength > 0) {
            // According to the PDF specification: the elements in a dashArray
            // shall be numbers that are nonnegative and not all equal to zero.
            var isInvalid = false;
            var numPositive = 0;
            for (var i = 0; i < dashArrayLength; i++) {
              var validNumber = (+dashArray[i] >= 0);
              if (!validNumber) {
                isInvalid = true;
                break;
              } else if (dashArray[i] > 0) {
                numPositive++;
              }
            }
            if (isInvalid || numPositive === 0) {
              data.borderWidth = 0;
            }
          }
        }
      }
    }

    this.appearance = getDefaultAppearance(dict);
    data.hasAppearance = !!this.appearance;
    data.id = params.ref.num;
  }

  Annotation.prototype = {

    getData: function Annotation_getData() {
      return this.data;
    },

    isInvisible: function Annotation_isInvisible() {
      var data = this.data;
      if (data && SUPPORTED_TYPES.indexOf(data.subtype) !== -1) {
        return false;
      } else {
        return !!(data &&
                  data.annotationFlags &&            // Default: not invisible
                  data.annotationFlags & 0x1);       // Invisible
      }
    },

    isViewable: function Annotation_isViewable() {
      var data = this.data;
      return !!(!this.isInvisible() &&
                data &&
                (!data.annotationFlags ||
                 !(data.annotationFlags & 0x22)) &&  // Hidden or NoView
                data.rect);                          // rectangle is necessary
    },

    isPrintable: function Annotation_isPrintable() {
      var data = this.data;
      return !!(!this.isInvisible() &&
                data &&
                data.annotationFlags &&              // Default: not printable
                data.annotationFlags & 0x4 &&        // Print
                !(data.annotationFlags & 0x2) &&     // Hidden
                data.rect);                          // rectangle is necessary
    },

    loadResources: function Annotation_loadResources(keys) {
      return new Promise(function (resolve, reject) {
        this.appearance.dict.getAsync('Resources').then(function (resources) {
          if (!resources) {
            resolve();
            return;
          }
          var objectLoader = new ObjectLoader(resources.map,
                                              keys,
                                              resources.xref);
          objectLoader.load().then(function() {
            resolve(resources);
          }, reject);
        }, reject);
      }.bind(this));
    },

    getOperatorList: function Annotation_getOperatorList(evaluator) {

      if (!this.appearance) {
        return Promise.resolve(new OperatorList());
      }

      var data = this.data;

      var appearanceDict = this.appearance.dict;
      var resourcesPromise = this.loadResources([
        'ExtGState',
        'ColorSpace',
        'Pattern',
        'Shading',
        'XObject',
        'Font'
        // ProcSet
        // Properties
      ]);
      var bbox = appearanceDict.get('BBox') || [0, 0, 1, 1];
      var matrix = appearanceDict.get('Matrix') || [1, 0, 0, 1, 0 ,0];
      var transform = getTransformMatrix(data.rect, bbox, matrix);
      var self = this;

      return resourcesPromise.then(function(resources) {
          var opList = new OperatorList();
          opList.addOp(OPS.beginAnnotation, [data.rect, transform, matrix]);
          return evaluator.getOperatorList(self.appearance, resources, opList).
            then(function () {
              opList.addOp(OPS.endAnnotation, []);
              self.appearance.reset();
              return opList;
            });
        });
    }
  };

  Annotation.getConstructor =
      function Annotation_getConstructor(subtype, fieldType) {

    if (!subtype) {
      return;
    }

    // TODO(mack): Implement FreeText annotations
    if (subtype === 'Link') {
      return LinkAnnotation;
    } else if (subtype === 'Text') {
      return TextAnnotation;
    } else if (subtype === 'Widget') {
      if (!fieldType) {
        return;
      }

      if (fieldType === 'Tx') {
        return TextWidgetAnnotation;
      } else {
        return WidgetAnnotation;
      }
    } else {
      return Annotation;
    }
  };

  Annotation.fromRef = function Annotation_fromRef(xref, ref) {

    var dict = xref.fetchIfRef(ref);
    if (!isDict(dict)) {
      return;
    }

    var subtype = dict.get('Subtype');
    subtype = isName(subtype) ? subtype.name : '';
    if (!subtype) {
      return;
    }

    var fieldType = Util.getInheritableProperty(dict, 'FT');
    fieldType = isName(fieldType) ? fieldType.name : '';

    var Constructor = Annotation.getConstructor(subtype, fieldType);
    if (!Constructor) {
      return;
    }

    var params = {
      dict: dict,
      ref: ref,
    };

    var annotation = new Constructor(params);

    if (annotation.isViewable() || annotation.isPrintable()) {
      return annotation;
    } else {
      if (SUPPORTED_TYPES.indexOf(subtype) === -1) {
        warn('unimplemented annotation type: ' + subtype);
      }
    }
  };

  Annotation.appendToOperatorList = function Annotation_appendToOperatorList(
      annotations, opList, pdfManager, partialEvaluator, intent) {

    function reject(e) {
      annotationsReadyCapability.reject(e);
    }

    var annotationsReadyCapability = createPromiseCapability();

    var annotationPromises = [];
    for (var i = 0, n = annotations.length; i < n; ++i) {
      if (intent === 'display' && annotations[i].isViewable() ||
          intent === 'print' && annotations[i].isPrintable()) {
        annotationPromises.push(
          annotations[i].getOperatorList(partialEvaluator));
      }
    }
    Promise.all(annotationPromises).then(function(datas) {
      opList.addOp(OPS.beginAnnotations, []);
      for (var i = 0, n = datas.length; i < n; ++i) {
        var annotOpList = datas[i];
        opList.addOpList(annotOpList);
      }
      opList.addOp(OPS.endAnnotations, []);
      annotationsReadyCapability.resolve();
    }, reject);

    return annotationsReadyCapability.promise;
  };

  return Annotation;
})();

var WidgetAnnotation = (function WidgetAnnotationClosure() {

  function WidgetAnnotation(params) {
    Annotation.call(this, params);

    var dict = params.dict;
    var data = this.data;

    data.fieldValue = stringToPDFString(
      Util.getInheritableProperty(dict, 'V') || '');
    data.alternativeText = stringToPDFString(dict.get('TU') || '');
    data.defaultAppearance = Util.getInheritableProperty(dict, 'DA') || '';
    var fieldType = Util.getInheritableProperty(dict, 'FT');
    data.fieldType = isName(fieldType) ? fieldType.name : '';
    data.fieldFlags = Util.getInheritableProperty(dict, 'Ff') || 0;
    this.fieldResources = Util.getInheritableProperty(dict, 'DR') || Dict.empty;

    // Building the full field name by collecting the field and
    // its ancestors 'T' data and joining them using '.'.
    var fieldName = [];
    var namedItem = dict;
    var ref = params.ref;
    while (namedItem) {
      var parent = namedItem.get('Parent');
      var parentRef = namedItem.getRaw('Parent');
      var name = namedItem.get('T');
      if (name) {
        fieldName.unshift(stringToPDFString(name));
      } else if (parent && ref) {
        // The field name is absent, that means more than one field
        // with the same name may exist. Replacing the empty name
        // with the '`' plus index in the parent's 'Kids' array.
        // This is not in the PDF spec but necessary to id the
        // the input controls.
        var kids = parent.get('Kids');
        var j, jj;
        for (j = 0, jj = kids.length; j < jj; j++) {
          var kidRef = kids[j];
          if (kidRef.num === ref.num && kidRef.gen === ref.gen) {
            break;
          }
        }
        fieldName.unshift('`' + j);
      }
      namedItem = parent;
      ref = parentRef;
    }
    data.fullName = fieldName.join('.');
  }

  var parent = Annotation.prototype;
  Util.inherit(WidgetAnnotation, Annotation, {
    isViewable: function WidgetAnnotation_isViewable() {
      if (this.data.fieldType === 'Sig') {
        warn('unimplemented annotation type: Widget signature');
        return false;
      }

      return parent.isViewable.call(this);
    }
  });

  return WidgetAnnotation;
})();

var TextWidgetAnnotation = (function TextWidgetAnnotationClosure() {
  function TextWidgetAnnotation(params) {
    WidgetAnnotation.call(this, params);

    this.data.textAlignment = Util.getInheritableProperty(params.dict, 'Q');
    this.data.annotationType = AnnotationType.WIDGET;
    this.data.hasHtml = !this.data.hasAppearance && !!this.data.fieldValue;
  }

  Util.inherit(TextWidgetAnnotation, WidgetAnnotation, {
    getOperatorList: function TextWidgetAnnotation_getOperatorList(evaluator) {
      if (this.appearance) {
        return Annotation.prototype.getOperatorList.call(this, evaluator);
      }

      var opList = new OperatorList();
      var data = this.data;

      // Even if there is an appearance stream, ignore it. This is the
      // behaviour used by Adobe Reader.
      if (!data.defaultAppearance) {
        return Promise.resolve(opList);
      }

      var stream = new Stream(stringToBytes(data.defaultAppearance));
      return evaluator.getOperatorList(stream, this.fieldResources, opList).
        then(function () {
          return opList;
        });
    }
  });

  return TextWidgetAnnotation;
})();

var InteractiveAnnotation = (function InteractiveAnnotationClosure() {
  function InteractiveAnnotation(params) {
    Annotation.call(this, params);

    this.data.hasHtml = true;
  }

  Util.inherit(InteractiveAnnotation, Annotation, { });

  return InteractiveAnnotation;
})();

var TextAnnotation = (function TextAnnotationClosure() {
  function TextAnnotation(params) {
    InteractiveAnnotation.call(this, params);

    var dict = params.dict;
    var data = this.data;

    var content = dict.get('Contents');
    var title = dict.get('T');
    data.annotationType = AnnotationType.TEXT;
    data.content = stringToPDFString(content || '');
    data.title = stringToPDFString(title || '');

    if (data.hasAppearance) {
      data.name = 'NoIcon';
    } else {
      data.rect[1] = data.rect[3] - DEFAULT_ICON_SIZE;
      data.rect[2] = data.rect[0] + DEFAULT_ICON_SIZE;
      data.name = dict.has('Name') ? dict.get('Name').name : 'Note';
    }

    if (dict.has('C')) {
      data.hasBgColor = true;
    }
  }

  Util.inherit(TextAnnotation, InteractiveAnnotation, { });

  return TextAnnotation;
})();

var LinkAnnotation = (function LinkAnnotationClosure() {
  function LinkAnnotation(params) {
    InteractiveAnnotation.call(this, params);

    var dict = params.dict;
    var data = this.data;
    data.annotationType = AnnotationType.LINK;

    var action = dict.get('A');
    if (action) {
      var linkType = action.get('S').name;
      if (linkType === 'URI') {
        var url = action.get('URI');
        if (isName(url)) {
          // Some bad PDFs do not put parentheses around relative URLs.
          url = '/' + url.name;
        } else if (url) {
          url = addDefaultProtocolToUrl(url);
        }
        // TODO: pdf spec mentions urls can be relative to a Base
        // entry in the dictionary.
        if (!isValidUrl(url, false)) {
          url = '';
        }
        data.url = url;
      } else if (linkType === 'GoTo') {
        data.dest = action.get('D');
      } else if (linkType === 'GoToR') {
        var urlDict = action.get('F');
        if (isDict(urlDict)) {
          // We assume that the 'url' is a Filspec dictionary
          // and fetch the url without checking any further
          url = urlDict.get('F') || '';
        }

        // TODO: pdf reference says that GoToR
        // can also have 'NewWindow' attribute
        if (!isValidUrl(url, false)) {
          url = '';
        }
        data.url = url;
        data.dest = action.get('D');
      } else if (linkType === 'Named') {
        data.action = action.get('N').name;
      } else {
        warn('unrecognized link type: ' + linkType);
      }
    } else if (dict.has('Dest')) {
      // simple destination link
      var dest = dict.get('Dest');
      data.dest = isName(dest) ? dest.name : dest;
    }
  }

  // Lets URLs beginning with 'www.' default to using the 'http://' protocol.
  function addDefaultProtocolToUrl(url) {
    if (url && url.indexOf('www.') === 0) {
      return ('http://' + url);
    }
    return url;
  }

  Util.inherit(LinkAnnotation, InteractiveAnnotation, {
    hasOperatorList: function LinkAnnotation_hasOperatorList() {
      return false;
    }
  });

  return LinkAnnotation;
})();


var PDFFunction = (function PDFFunctionClosure() {
  var CONSTRUCT_SAMPLED = 0;
  var CONSTRUCT_INTERPOLATED = 2;
  var CONSTRUCT_STICHED = 3;
  var CONSTRUCT_POSTSCRIPT = 4;

  return {
    getSampleArray: function PDFFunction_getSampleArray(size, outputSize, bps,
                                                       str) {
      var i, ii;
      var length = 1;
      for (i = 0, ii = size.length; i < ii; i++) {
        length *= size[i];
      }
      length *= outputSize;

      var array = new Array(length);
      var codeSize = 0;
      var codeBuf = 0;
      // 32 is a valid bps so shifting won't work
      var sampleMul = 1.0 / (Math.pow(2.0, bps) - 1);

      var strBytes = str.getBytes((length * bps + 7) / 8);
      var strIdx = 0;
      for (i = 0; i < length; i++) {
        while (codeSize < bps) {
          codeBuf <<= 8;
          codeBuf |= strBytes[strIdx++];
          codeSize += 8;
        }
        codeSize -= bps;
        array[i] = (codeBuf >> codeSize) * sampleMul;
        codeBuf &= (1 << codeSize) - 1;
      }
      return array;
    },

    getIR: function PDFFunction_getIR(xref, fn) {
      var dict = fn.dict;
      if (!dict) {
        dict = fn;
      }

      var types = [this.constructSampled,
                   null,
                   this.constructInterpolated,
                   this.constructStiched,
                   this.constructPostScript];

      var typeNum = dict.get('FunctionType');
      var typeFn = types[typeNum];
      if (!typeFn) {
        error('Unknown type of function');
      }

      return typeFn.call(this, fn, dict, xref);
    },

    fromIR: function PDFFunction_fromIR(IR) {
      var type = IR[0];
      switch (type) {
        case CONSTRUCT_SAMPLED:
          return this.constructSampledFromIR(IR);
        case CONSTRUCT_INTERPOLATED:
          return this.constructInterpolatedFromIR(IR);
        case CONSTRUCT_STICHED:
          return this.constructStichedFromIR(IR);
        //case CONSTRUCT_POSTSCRIPT:
        default:
          return this.constructPostScriptFromIR(IR);
      }
    },

    parse: function PDFFunction_parse(xref, fn) {
      var IR = this.getIR(xref, fn);
      return this.fromIR(IR);
    },

    parseArray: function PDFFunction_parseArray(xref, fnObj) {
      if (!isArray(fnObj)) {
        // not an array -- parsing as regular function
        return this.parse(xref, fnObj);
      }

      var fnArray = [];
      for (var j = 0, jj = fnObj.length; j < jj; j++) {
        var obj = xref.fetchIfRef(fnObj[j]);
        fnArray.push(PDFFunction.parse(xref, obj));
      }
      return function (src, srcOffset, dest, destOffset) {
        for (var i = 0, ii = fnArray.length; i < ii; i++) {
          fnArray[i](src, srcOffset, dest, destOffset + i);
        }
      };
    },

    constructSampled: function PDFFunction_constructSampled(str, dict) {
      function toMultiArray(arr) {
        var inputLength = arr.length;
        var out = [];
        var index = 0;
        for (var i = 0; i < inputLength; i += 2) {
          out[index] = [arr[i], arr[i + 1]];
          ++index;
        }
        return out;
      }
      var domain = dict.get('Domain');
      var range = dict.get('Range');

      if (!domain || !range) {
        error('No domain or range');
      }

      var inputSize = domain.length / 2;
      var outputSize = range.length / 2;

      domain = toMultiArray(domain);
      range = toMultiArray(range);

      var size = dict.get('Size');
      var bps = dict.get('BitsPerSample');
      var order = dict.get('Order') || 1;
      if (order !== 1) {
        // No description how cubic spline interpolation works in PDF32000:2008
        // As in poppler, ignoring order, linear interpolation may work as good
        info('No support for cubic spline interpolation: ' + order);
      }

      var encode = dict.get('Encode');
      if (!encode) {
        encode = [];
        for (var i = 0; i < inputSize; ++i) {
          encode.push(0);
          encode.push(size[i] - 1);
        }
      }
      encode = toMultiArray(encode);

      var decode = dict.get('Decode');
      if (!decode) {
        decode = range;
      } else {
        decode = toMultiArray(decode);
      }

      var samples = this.getSampleArray(size, outputSize, bps, str);

      return [
        CONSTRUCT_SAMPLED, inputSize, domain, encode, decode, samples, size,
        outputSize, Math.pow(2, bps) - 1, range
      ];
    },

    constructSampledFromIR: function PDFFunction_constructSampledFromIR(IR) {
      // See chapter 3, page 109 of the PDF reference
      function interpolate(x, xmin, xmax, ymin, ymax) {
        return ymin + ((x - xmin) * ((ymax - ymin) / (xmax - xmin)));
      }

      return function constructSampledFromIRResult(src, srcOffset,
                                                   dest, destOffset) {
        // See chapter 3, page 110 of the PDF reference.
        var m = IR[1];
        var domain = IR[2];
        var encode = IR[3];
        var decode = IR[4];
        var samples = IR[5];
        var size = IR[6];
        var n = IR[7];
        //var mask = IR[8];
        var range = IR[9];

        // Building the cube vertices: its part and sample index
        // http://rjwagner49.com/Mathematics/Interpolation.pdf
        var cubeVertices = 1 << m;
        var cubeN = new Float64Array(cubeVertices);
        var cubeVertex = new Uint32Array(cubeVertices);
        var i, j;
        for (j = 0; j < cubeVertices; j++) {
          cubeN[j] = 1;
        }

        var k = n, pos = 1;
        // Map x_i to y_j for 0 <= i < m using the sampled function.
        for (i = 0; i < m; ++i) {
          // x_i' = min(max(x_i, Domain_2i), Domain_2i+1)
          var domain_2i = domain[i][0];
          var domain_2i_1 = domain[i][1];
          var xi = Math.min(Math.max(src[srcOffset +i], domain_2i),
                            domain_2i_1);

          // e_i = Interpolate(x_i', Domain_2i, Domain_2i+1,
          //                   Encode_2i, Encode_2i+1)
          var e = interpolate(xi, domain_2i, domain_2i_1,
                              encode[i][0], encode[i][1]);

          // e_i' = min(max(e_i, 0), Size_i - 1)
          var size_i = size[i];
          e = Math.min(Math.max(e, 0), size_i - 1);

          // Adjusting the cube: N and vertex sample index
          var e0 = e < size_i - 1 ? Math.floor(e) : e - 1; // e1 = e0 + 1;
          var n0 = e0 + 1 - e; // (e1 - e) / (e1 - e0);
          var n1 = e - e0; // (e - e0) / (e1 - e0);
          var offset0 = e0 * k;
          var offset1 = offset0 + k; // e1 * k
          for (j = 0; j < cubeVertices; j++) {
            if (j & pos) {
              cubeN[j] *= n1;
              cubeVertex[j] += offset1;
            } else {
              cubeN[j] *= n0;
              cubeVertex[j] += offset0;
            }
          }

          k *= size_i;
          pos <<= 1;
        }

        for (j = 0; j < n; ++j) {
          // Sum all cube vertices' samples portions
          var rj = 0;
          for (i = 0; i < cubeVertices; i++) {
            rj += samples[cubeVertex[i] + j] * cubeN[i];
          }

          // r_j' = Interpolate(r_j, 0, 2^BitsPerSample - 1,
          //                    Decode_2j, Decode_2j+1)
          rj = interpolate(rj, 0, 1, decode[j][0], decode[j][1]);

          // y_j = min(max(r_j, range_2j), range_2j+1)
          dest[destOffset + j] = Math.min(Math.max(rj, range[j][0]),
                                          range[j][1]);
        }
      };
    },

    constructInterpolated: function PDFFunction_constructInterpolated(str,
                                                                      dict) {
      var c0 = dict.get('C0') || [0];
      var c1 = dict.get('C1') || [1];
      var n = dict.get('N');

      if (!isArray(c0) || !isArray(c1)) {
        error('Illegal dictionary for interpolated function');
      }

      var length = c0.length;
      var diff = [];
      for (var i = 0; i < length; ++i) {
        diff.push(c1[i] - c0[i]);
      }

      return [CONSTRUCT_INTERPOLATED, c0, diff, n];
    },

    constructInterpolatedFromIR:
      function PDFFunction_constructInterpolatedFromIR(IR) {
      var c0 = IR[1];
      var diff = IR[2];
      var n = IR[3];

      var length = diff.length;

      return function constructInterpolatedFromIRResult(src, srcOffset,
                                                        dest, destOffset) {
        var x = n === 1 ? src[srcOffset] : Math.pow(src[srcOffset], n);

        for (var j = 0; j < length; ++j) {
          dest[destOffset + j] = c0[j] + (x * diff[j]);
        }
      };
    },

    constructStiched: function PDFFunction_constructStiched(fn, dict, xref) {
      var domain = dict.get('Domain');

      if (!domain) {
        error('No domain');
      }

      var inputSize = domain.length / 2;
      if (inputSize !== 1) {
        error('Bad domain for stiched function');
      }

      var fnRefs = dict.get('Functions');
      var fns = [];
      for (var i = 0, ii = fnRefs.length; i < ii; ++i) {
        fns.push(PDFFunction.getIR(xref, xref.fetchIfRef(fnRefs[i])));
      }

      var bounds = dict.get('Bounds');
      var encode = dict.get('Encode');

      return [CONSTRUCT_STICHED, domain, bounds, encode, fns];
    },

    constructStichedFromIR: function PDFFunction_constructStichedFromIR(IR) {
      var domain = IR[1];
      var bounds = IR[2];
      var encode = IR[3];
      var fnsIR = IR[4];
      var fns = [];
      var tmpBuf = new Float32Array(1);

      for (var i = 0, ii = fnsIR.length; i < ii; i++) {
        fns.push(PDFFunction.fromIR(fnsIR[i]));
      }

      return function constructStichedFromIRResult(src, srcOffset,
                                                   dest, destOffset) {
        var clip = function constructStichedFromIRClip(v, min, max) {
          if (v > max) {
            v = max;
          } else if (v < min) {
            v = min;
          }
          return v;
        };

        // clip to domain
        var v = clip(src[srcOffset], domain[0], domain[1]);
        // calulate which bound the value is in
        for (var i = 0, ii = bounds.length; i < ii; ++i) {
          if (v < bounds[i]) {
            break;
          }
        }

        // encode value into domain of function
        var dmin = domain[0];
        if (i > 0) {
          dmin = bounds[i - 1];
        }
        var dmax = domain[1];
        if (i < bounds.length) {
          dmax = bounds[i];
        }

        var rmin = encode[2 * i];
        var rmax = encode[2 * i + 1];

        tmpBuf[0] = rmin + (v - dmin) * (rmax - rmin) / (dmax - dmin);

        // call the appropriate function
        fns[i](tmpBuf, 0, dest, destOffset);
      };
    },

    constructPostScript: function PDFFunction_constructPostScript(fn, dict,
                                                                  xref) {
      var domain = dict.get('Domain');
      var range = dict.get('Range');

      if (!domain) {
        error('No domain.');
      }

      if (!range) {
        error('No range.');
      }

      var lexer = new PostScriptLexer(fn);
      var parser = new PostScriptParser(lexer);
      var code = parser.parse();

      return [CONSTRUCT_POSTSCRIPT, domain, range, code];
    },

    constructPostScriptFromIR: function PDFFunction_constructPostScriptFromIR(
                                          IR) {
      var domain = IR[1];
      var range = IR[2];
      var code = IR[3];

      var compiled = (new PostScriptCompiler()).compile(code, domain, range);
      if (compiled) {
        // Compiled function consists of simple expressions such as addition,
        // subtraction, Math.max, and also contains 'var' and 'return'
        // statements. See the generation in the PostScriptCompiler below.
        /*jshint -W054 */
        return new Function('src', 'srcOffset', 'dest', 'destOffset', compiled);
      }

      info('Unable to compile PS function');

      var numOutputs = range.length >> 1;
      var numInputs = domain.length >> 1;
      var evaluator = new PostScriptEvaluator(code);
      // Cache the values for a big speed up, the cache size is limited though
      // since the number of possible values can be huge from a PS function.
      var cache = {};
      // The MAX_CACHE_SIZE is set to ~4x the maximum number of distinct values
      // seen in our tests.
      var MAX_CACHE_SIZE = 2048 * 4;
      var cache_available = MAX_CACHE_SIZE;
      var tmpBuf = new Float32Array(numInputs);

      return function constructPostScriptFromIRResult(src, srcOffset,
                                                      dest, destOffset) {
        var i, value;
        var key = '';
        var input = tmpBuf;
        for (i = 0; i < numInputs; i++) {
          value = src[srcOffset + i];
          input[i] = value;
          key += value + '_';
        }

        var cachedValue = cache[key];
        if (cachedValue !== undefined) {
          cachedValue.set(dest, destOffset);
          return;
        }

        var output = new Float32Array(numOutputs);
        var stack = evaluator.execute(input);
        var stackIndex = stack.length - numOutputs;
        for (i = 0; i < numOutputs; i++) {
          value = stack[stackIndex + i];
          var bound = range[i * 2];
          if (value < bound) {
            value = bound;
          } else {
            bound = range[i * 2 +1];
            if (value > bound) {
              value = bound;
            }
          }
          output[i] = value;
        }
        if (cache_available > 0) {
          cache_available--;
          cache[key] = output;
        }
        output.set(dest, destOffset);
      };
    }
  };
})();

function isPDFFunction(v) {
  var fnDict;
  if (typeof v !== 'object') {
    return false;
  } else if (isDict(v)) {
    fnDict = v;
  } else if (isStream(v)) {
    fnDict = v.dict;
  } else {
    return false;
  }
  return fnDict.has('FunctionType');
}

var PostScriptStack = (function PostScriptStackClosure() {
  var MAX_STACK_SIZE = 100;
  function PostScriptStack(initialStack) {
    this.stack = !initialStack ? [] :
                 Array.prototype.slice.call(initialStack, 0);
  }

  PostScriptStack.prototype = {
    push: function PostScriptStack_push(value) {
      if (this.stack.length >= MAX_STACK_SIZE) {
        error('PostScript function stack overflow.');
      }
      this.stack.push(value);
    },
    pop: function PostScriptStack_pop() {
      if (this.stack.length <= 0) {
        error('PostScript function stack underflow.');
      }
      return this.stack.pop();
    },
    copy: function PostScriptStack_copy(n) {
      if (this.stack.length + n >= MAX_STACK_SIZE) {
        error('PostScript function stack overflow.');
      }
      var stack = this.stack;
      for (var i = stack.length - n, j = n - 1; j >= 0; j--, i++) {
        stack.push(stack[i]);
      }
    },
    index: function PostScriptStack_index(n) {
      this.push(this.stack[this.stack.length - n - 1]);
    },
    // rotate the last n stack elements p times
    roll: function PostScriptStack_roll(n, p) {
      var stack = this.stack;
      var l = stack.length - n;
      var r = stack.length - 1, c = l + (p - Math.floor(p / n) * n), i, j, t;
      for (i = l, j = r; i < j; i++, j--) {
        t = stack[i]; stack[i] = stack[j]; stack[j] = t;
      }
      for (i = l, j = c - 1; i < j; i++, j--) {
        t = stack[i]; stack[i] = stack[j]; stack[j] = t;
      }
      for (i = c, j = r; i < j; i++, j--) {
        t = stack[i]; stack[i] = stack[j]; stack[j] = t;
      }
    }
  };
  return PostScriptStack;
})();
var PostScriptEvaluator = (function PostScriptEvaluatorClosure() {
  function PostScriptEvaluator(operators) {
    this.operators = operators;
  }
  PostScriptEvaluator.prototype = {
    execute: function PostScriptEvaluator_execute(initialStack) {
      var stack = new PostScriptStack(initialStack);
      var counter = 0;
      var operators = this.operators;
      var length = operators.length;
      var operator, a, b;
      while (counter < length) {
        operator = operators[counter++];
        if (typeof operator === 'number') {
          // Operator is really an operand and should be pushed to the stack.
          stack.push(operator);
          continue;
        }
        switch (operator) {
          // non standard ps operators
          case 'jz': // jump if false
            b = stack.pop();
            a = stack.pop();
            if (!a) {
              counter = b;
            }
            break;
          case 'j': // jump
            a = stack.pop();
            counter = a;
            break;

          // all ps operators in alphabetical order (excluding if/ifelse)
          case 'abs':
            a = stack.pop();
            stack.push(Math.abs(a));
            break;
          case 'add':
            b = stack.pop();
            a = stack.pop();
            stack.push(a + b);
            break;
          case 'and':
            b = stack.pop();
            a = stack.pop();
            if (isBool(a) && isBool(b)) {
              stack.push(a && b);
            } else {
              stack.push(a & b);
            }
            break;
          case 'atan':
            a = stack.pop();
            stack.push(Math.atan(a));
            break;
          case 'bitshift':
            b = stack.pop();
            a = stack.pop();
            if (a > 0) {
              stack.push(a << b);
            } else {
              stack.push(a >> b);
            }
            break;
          case 'ceiling':
            a = stack.pop();
            stack.push(Math.ceil(a));
            break;
          case 'copy':
            a = stack.pop();
            stack.copy(a);
            break;
          case 'cos':
            a = stack.pop();
            stack.push(Math.cos(a));
            break;
          case 'cvi':
            a = stack.pop() | 0;
            stack.push(a);
            break;
          case 'cvr':
            // noop
            break;
          case 'div':
            b = stack.pop();
            a = stack.pop();
            stack.push(a / b);
            break;
          case 'dup':
            stack.copy(1);
            break;
          case 'eq':
            b = stack.pop();
            a = stack.pop();
            stack.push(a === b);
            break;
          case 'exch':
            stack.roll(2, 1);
            break;
          case 'exp':
            b = stack.pop();
            a = stack.pop();
            stack.push(Math.pow(a, b));
            break;
          case 'false':
            stack.push(false);
            break;
          case 'floor':
            a = stack.pop();
            stack.push(Math.floor(a));
            break;
          case 'ge':
            b = stack.pop();
            a = stack.pop();
            stack.push(a >= b);
            break;
          case 'gt':
            b = stack.pop();
            a = stack.pop();
            stack.push(a > b);
            break;
          case 'idiv':
            b = stack.pop();
            a = stack.pop();
            stack.push((a / b) | 0);
            break;
          case 'index':
            a = stack.pop();
            stack.index(a);
            break;
          case 'le':
            b = stack.pop();
            a = stack.pop();
            stack.push(a <= b);
            break;
          case 'ln':
            a = stack.pop();
            stack.push(Math.log(a));
            break;
          case 'log':
            a = stack.pop();
            stack.push(Math.log(a) / Math.LN10);
            break;
          case 'lt':
            b = stack.pop();
            a = stack.pop();
            stack.push(a < b);
            break;
          case 'mod':
            b = stack.pop();
            a = stack.pop();
            stack.push(a % b);
            break;
          case 'mul':
            b = stack.pop();
            a = stack.pop();
            stack.push(a * b);
            break;
          case 'ne':
            b = stack.pop();
            a = stack.pop();
            stack.push(a !== b);
            break;
          case 'neg':
            a = stack.pop();
            stack.push(-a);
            break;
          case 'not':
            a = stack.pop();
            if (isBool(a)) {
              stack.push(!a);
            } else {
              stack.push(~a);
            }
            break;
          case 'or':
            b = stack.pop();
            a = stack.pop();
            if (isBool(a) && isBool(b)) {
              stack.push(a || b);
            } else {
              stack.push(a | b);
            }
            break;
          case 'pop':
            stack.pop();
            break;
          case 'roll':
            b = stack.pop();
            a = stack.pop();
            stack.roll(a, b);
            break;
          case 'round':
            a = stack.pop();
            stack.push(Math.round(a));
            break;
          case 'sin':
            a = stack.pop();
            stack.push(Math.sin(a));
            break;
          case 'sqrt':
            a = stack.pop();
            stack.push(Math.sqrt(a));
            break;
          case 'sub':
            b = stack.pop();
            a = stack.pop();
            stack.push(a - b);
            break;
          case 'true':
            stack.push(true);
            break;
          case 'truncate':
            a = stack.pop();
            a = a < 0 ? Math.ceil(a) : Math.floor(a);
            stack.push(a);
            break;
          case 'xor':
            b = stack.pop();
            a = stack.pop();
            if (isBool(a) && isBool(b)) {
              stack.push(a !== b);
            } else {
              stack.push(a ^ b);
            }
            break;
          default:
            error('Unknown operator ' + operator);
            break;
        }
      }
      return stack.stack;
    }
  };
  return PostScriptEvaluator;
})();

// Most of the PDFs functions consist of simple operations such as:
//   roll, exch, sub, cvr, pop, index, dup, mul, if, gt, add.
//
// We can compile most of such programs, and at the same moment, we can
// optimize some expressions using basic math properties. Keeping track of
// min/max values will allow us to avoid extra Math.min/Math.max calls.
var PostScriptCompiler = (function PostScriptCompilerClosure() {
  function AstNode(type) {
    this.type = type;
  }
  AstNode.prototype.visit = function (visitor) {
    throw new Error('abstract method');
  };

  function AstArgument(index, min, max) {
    AstNode.call(this, 'args');
    this.index = index;
    this.min = min;
    this.max = max;
  }
  AstArgument.prototype = Object.create(AstNode.prototype);
  AstArgument.prototype.visit = function (visitor) {
    visitor.visitArgument(this);
  };

  function AstLiteral(number) {
    AstNode.call(this, 'literal');
    this.number = number;
    this.min = number;
    this.max = number;
  }
  AstLiteral.prototype = Object.create(AstNode.prototype);
  AstLiteral.prototype.visit = function (visitor) {
    visitor.visitLiteral(this);
  };

  function AstBinaryOperation(op, arg1, arg2, min, max) {
    AstNode.call(this, 'binary');
    this.op = op;
    this.arg1 = arg1;
    this.arg2 = arg2;
    this.min = min;
    this.max = max;
  }
  AstBinaryOperation.prototype = Object.create(AstNode.prototype);
  AstBinaryOperation.prototype.visit = function (visitor) {
    visitor.visitBinaryOperation(this);
  };

  function AstMin(arg, max) {
    AstNode.call(this, 'max');
    this.arg = arg;
    this.min = arg.min;
    this.max = max;
  }
  AstMin.prototype = Object.create(AstNode.prototype);
  AstMin.prototype.visit = function (visitor) {
    visitor.visitMin(this);
  };

  function AstVariable(index, min, max) {
    AstNode.call(this, 'var');
    this.index = index;
    this.min = min;
    this.max = max;
  }
  AstVariable.prototype = Object.create(AstNode.prototype);
  AstVariable.prototype.visit = function (visitor) {
    visitor.visitVariable(this);
  };

  function AstVariableDefinition(variable, arg) {
    AstNode.call(this, 'definition');
    this.variable = variable;
    this.arg = arg;
  }
  AstVariableDefinition.prototype = Object.create(AstNode.prototype);
  AstVariableDefinition.prototype.visit = function (visitor) {
    visitor.visitVariableDefinition(this);
  };

  function ExpressionBuilderVisitor() {
    this.parts = [];
  }
  ExpressionBuilderVisitor.prototype = {
    visitArgument: function (arg) {
      this.parts.push('Math.max(', arg.min, ', Math.min(',
                      arg.max, ', src[srcOffset + ', arg.index, ']))');
    },
    visitVariable: function (variable) {
      this.parts.push('v', variable.index);
    },
    visitLiteral: function (literal) {
      this.parts.push(literal.number);
    },
    visitBinaryOperation: function (operation) {
      this.parts.push('(');
      operation.arg1.visit(this);
      this.parts.push(' ', operation.op, ' ');
      operation.arg2.visit(this);
      this.parts.push(')');
    },
    visitVariableDefinition: function (definition) {
      this.parts.push('var ');
      definition.variable.visit(this);
      this.parts.push(' = ');
      definition.arg.visit(this);
      this.parts.push(';');
    },
    visitMin: function (max) {
      this.parts.push('Math.min(');
      max.arg.visit(this);
      this.parts.push(', ', max.max, ')');
    },
    toString: function () {
      return this.parts.join('');
    }
  };

  function buildAddOperation(num1, num2) {
    if (num2.type === 'literal' && num2.number === 0) {
      // optimization: second operand is 0
      return num1;
    }
    if (num1.type === 'literal' && num1.number === 0) {
      // optimization: first operand is 0
      return num2;
    }
    if (num2.type === 'literal' && num1.type === 'literal') {
      // optimization: operands operand are literals
      return new AstLiteral(num1.number + num2.number);
    }
    return new AstBinaryOperation('+', num1, num2,
                                  num1.min + num2.min, num1.max + num2.max);
  }

  function buildMulOperation(num1, num2) {
    if (num2.type === 'literal') {
      // optimization: second operands is a literal...
      if (num2.number === 0) {
        return new AstLiteral(0); // and it's 0
      } else if (num2.number === 1) {
        return num1; // and it's 1
      } else if (num1.type === 'literal') {
        // ... and first operands is a literal too
        return new AstLiteral(num1.number * num2.number);
      }
    }
    if (num1.type === 'literal') {
      // optimization: first operands is a literal...
      if (num1.number === 0) {
        return new AstLiteral(0); // and it's 0
      } else if (num1.number === 1) {
        return num2; // and it's 1
      }
    }
    var min = Math.min(num1.min * num2.min, num1.min * num2.max,
                       num1.max * num2.min, num1.max * num2.max);
    var max = Math.max(num1.min * num2.min, num1.min * num2.max,
                       num1.max * num2.min, num1.max * num2.max);
    return new AstBinaryOperation('*', num1, num2, min, max);
  }

  function buildSubOperation(num1, num2) {
    if (num2.type === 'literal') {
      // optimization: second operands is a literal...
      if (num2.number === 0) {
        return num1; // ... and it's 0
      } else if (num1.type === 'literal') {
        // ... and first operands is a literal too
        return new AstLiteral(num1.number - num2.number);
      }
    }
    if (num2.type === 'binary' && num2.op === '-' &&
      num1.type === 'literal' && num1.number === 1 &&
      num2.arg1.type === 'literal' && num2.arg1.number === 1) {
      // optimization for case: 1 - (1 - x)
      return num2.arg2;
    }
    return new AstBinaryOperation('-', num1, num2,
                                  num1.min - num2.max, num1.max - num2.min);
  }

  function buildMinOperation(num1, max) {
    if (num1.min >= max) {
      // optimization: num1 min value is not less than required max
      return new AstLiteral(max); // just returning max
    } else if (num1.max <= max) {
      // optimization: num1 max value is not greater than required max
      return num1; // just returning an argument
    }
    return new AstMin(num1, max);
  }

  function PostScriptCompiler() {}
  PostScriptCompiler.prototype = {
    compile: function PostScriptCompiler_compile(code, domain, range) {
      var stack = [];
      var i, ii;
      var instructions = [];
      var inputSize = domain.length >> 1, outputSize = range.length >> 1;
      var lastRegister = 0;
      var n, j, min, max;
      var num1, num2, ast1, ast2, tmpVar, item;
      for (i = 0; i < inputSize; i++) {
        stack.push(new AstArgument(i, domain[i * 2], domain[i * 2 + 1]));
      }

      for (i = 0, ii = code.length; i < ii; i++) {
        item = code[i];
        if (typeof item === 'number') {
          stack.push(new AstLiteral(item));
          continue;
        }

        switch (item) {
          case 'add':
            if (stack.length < 2) {
              return null;
            }
            num2 = stack.pop();
            num1 = stack.pop();
            stack.push(buildAddOperation(num1, num2));
            break;
          case 'cvr':
            if (stack.length < 1) {
              return null;
            }
            break;
          case 'mul':
            if (stack.length < 2) {
              return null;
            }
            num2 = stack.pop();
            num1 = stack.pop();
            stack.push(buildMulOperation(num1, num2));
            break;
          case 'sub':
            if (stack.length < 2) {
              return null;
            }
            num2 = stack.pop();
            num1 = stack.pop();
            stack.push(buildSubOperation(num1, num2));
            break;
          case 'exch':
            if (stack.length < 2) {
              return null;
            }
            ast1 = stack.pop(); ast2 = stack.pop();
            stack.push(ast1, ast2);
            break;
          case 'pop':
            if (stack.length < 1) {
              return null;
            }
            stack.pop();
            break;
          case 'index':
            if (stack.length < 1) {
              return null;
            }
            num1 = stack.pop();
            if (num1.type !== 'literal') {
              return null;
            }
            n = num1.number;
            if (n < 0 || (n|0) !== n || stack.length < n) {
              return null;
            }
            ast1 = stack[stack.length - n - 1];
            if (ast1.type === 'literal' || ast1.type === 'var') {
              stack.push(ast1);
              break;
            }
            tmpVar = new AstVariable(lastRegister++, ast1.min, ast1.max);
            stack[stack.length - n - 1] = tmpVar;
            stack.push(tmpVar);
            instructions.push(new AstVariableDefinition(tmpVar, ast1));
            break;
          case 'dup':
            if (stack.length < 1) {
              return null;
            }
            if (typeof code[i + 1] === 'number' && code[i + 2] === 'gt' &&
                code[i + 3] === i + 7 && code[i + 4] === 'jz' &&
                code[i + 5] === 'pop' && code[i + 6] === code[i + 1]) {
              // special case of the commands sequence for the min operation
              num1 = stack.pop();
              stack.push(buildMinOperation(num1, code[i + 1]));
              i += 6;
              break;
            }
            ast1 = stack[stack.length - 1];
            if (ast1.type === 'literal' || ast1.type === 'var') {
              // we don't have to save into intermediate variable a literal or
              // variable.
              stack.push(ast1);
              break;
            }
            tmpVar = new AstVariable(lastRegister++, ast1.min, ast1.max);
            stack[stack.length - 1] = tmpVar;
            stack.push(tmpVar);
            instructions.push(new AstVariableDefinition(tmpVar, ast1));
            break;
          case 'roll':
            if (stack.length < 2) {
              return null;
            }
            num2 = stack.pop();
            num1 = stack.pop();
            if (num2.type !== 'literal' || num1.type !== 'literal') {
              // both roll operands must be numbers
              return null;
            }
            j = num2.number;
            n = num1.number;
            if (n <= 0 || (n|0) !== n || (j|0) !== j || stack.length < n) {
              // ... and integers
              return null;
            }
            j = ((j % n) + n) % n;
            if (j === 0) {
              break; // just skipping -- there are nothing to rotate
            }
            Array.prototype.push.apply(stack,
                                       stack.splice(stack.length - n, n - j));
            break;
          default:
            return null; // unsupported operator
        }
      }

      if (stack.length !== outputSize) {
        return null;
      }

      var result = [];
      instructions.forEach(function (instruction) {
        var statementBuilder = new ExpressionBuilderVisitor();
        instruction.visit(statementBuilder);
        result.push(statementBuilder.toString());
      });
      stack.forEach(function (expr, i) {
        var statementBuilder = new ExpressionBuilderVisitor();
        expr.visit(statementBuilder);
        var min = range[i * 2], max = range[i * 2 + 1];
        var out = [statementBuilder.toString()];
        if (min > expr.min) {
          out.unshift('Math.max(', min, ', ');
          out.push(')');
        }
        if (max < expr.max) {
          out.unshift('Math.min(', max, ', ');
          out.push(')');
        }
        out.unshift('dest[destOffset + ', i, '] = ');
        out.push(';');
        result.push(out.join(''));
      });
      return result.join('\n');
    }
  };

  return PostScriptCompiler;
})();


var ColorSpace = (function ColorSpaceClosure() {
  // Constructor should define this.numComps, this.defaultColor, this.name
  function ColorSpace() {
    error('should not call ColorSpace constructor');
  }

  ColorSpace.prototype = {
    /**
     * Converts the color value to the RGB color. The color components are
     * located in the src array starting from the srcOffset. Returns the array
     * of the rgb components, each value ranging from [0,255].
     */
    getRgb: function ColorSpace_getRgb(src, srcOffset) {
      var rgb = new Uint8Array(3);
      this.getRgbItem(src, srcOffset, rgb, 0);
      return rgb;
    },
    /**
     * Converts the color value to the RGB color, similar to the getRgb method.
     * The result placed into the dest array starting from the destOffset.
     */
    getRgbItem: function ColorSpace_getRgbItem(src, srcOffset,
                                               dest, destOffset) {
      error('Should not call ColorSpace.getRgbItem');
    },
    /**
     * Converts the specified number of the color values to the RGB colors.
     * The colors are located in the src array starting from the srcOffset.
     * The result is placed into the dest array starting from the destOffset.
     * The src array items shall be in [0,2^bits) range, the dest array items
     * will be in [0,255] range. alpha01 indicates how many alpha components
     * there are in the dest array; it will be either 0 (RGB array) or 1 (RGBA
     * array).
     */
    getRgbBuffer: function ColorSpace_getRgbBuffer(src, srcOffset, count,
                                                   dest, destOffset, bits,
                                                   alpha01) {
      error('Should not call ColorSpace.getRgbBuffer');
    },
    /**
     * Determines the number of bytes required to store the result of the
     * conversion done by the getRgbBuffer method. As in getRgbBuffer,
     * |alpha01| is either 0 (RGB output) or 1 (RGBA output).
     */
    getOutputLength: function ColorSpace_getOutputLength(inputLength,
                                                         alpha01) {
      error('Should not call ColorSpace.getOutputLength');
    },
    /**
     * Returns true if source data will be equal the result/output data.
     */
    isPassthrough: function ColorSpace_isPassthrough(bits) {
      return false;
    },
    /**
     * Fills in the RGB colors in the destination buffer.  alpha01 indicates
     * how many alpha components there are in the dest array; it will be either
     * 0 (RGB array) or 1 (RGBA array).
     */
    fillRgb: function ColorSpace_fillRgb(dest, originalWidth,
                                         originalHeight, width, height,
                                         actualHeight, bpc, comps, alpha01) {
      var count = originalWidth * originalHeight;
      var rgbBuf = null;
      var numComponentColors = 1 << bpc;
      var needsResizing = originalHeight !== height || originalWidth !== width;
      var i, ii;

      if (this.isPassthrough(bpc)) {
        rgbBuf = comps;
      } else if (this.numComps === 1 && count > numComponentColors &&
          this.name !== 'DeviceGray' && this.name !== 'DeviceRGB') {
        // Optimization: create a color map when there is just one component and
        // we are converting more colors than the size of the color map. We
        // don't build the map if the colorspace is gray or rgb since those
        // methods are faster than building a map. This mainly offers big speed
        // ups for indexed and alternate colorspaces.
        //
        // TODO it may be worth while to cache the color map. While running
        // testing I never hit a cache so I will leave that out for now (perhaps
        // we are reparsing colorspaces too much?).
        var allColors = bpc <= 8 ? new Uint8Array(numComponentColors) :
                                   new Uint16Array(numComponentColors);
        var key;
        for (i = 0; i < numComponentColors; i++) {
          allColors[i] = i;
        }
        var colorMap = new Uint8Array(numComponentColors * 3);
        this.getRgbBuffer(allColors, 0, numComponentColors, colorMap, 0, bpc,
                          /* alpha01 = */ 0);

        var destPos, rgbPos;
        if (!needsResizing) {
          // Fill in the RGB values directly into |dest|.
          destPos = 0;
          for (i = 0; i < count; ++i) {
            key = comps[i] * 3;
            dest[destPos++] = colorMap[key];
            dest[destPos++] = colorMap[key + 1];
            dest[destPos++] = colorMap[key + 2];
            destPos += alpha01;
          }
        } else {
          rgbBuf = new Uint8Array(count * 3);
          rgbPos = 0;
          for (i = 0; i < count; ++i) {
            key = comps[i] * 3;
            rgbBuf[rgbPos++] = colorMap[key];
            rgbBuf[rgbPos++] = colorMap[key + 1];
            rgbBuf[rgbPos++] = colorMap[key + 2];
          }
        }
      } else {
        if (!needsResizing) {
          // Fill in the RGB values directly into |dest|.
          this.getRgbBuffer(comps, 0, width * actualHeight, dest, 0, bpc,
                            alpha01);
        } else {
          rgbBuf = new Uint8Array(count * 3);
          this.getRgbBuffer(comps, 0, count, rgbBuf, 0, bpc,
                            /* alpha01 = */ 0);
        }
      }

      if (rgbBuf) {
        if (needsResizing) {
          PDFImage.resize(rgbBuf, bpc, 3, originalWidth, originalHeight, width,
                          height, dest, alpha01);
        } else {
          rgbPos = 0;
          destPos = 0;
          for (i = 0, ii = width * actualHeight; i < ii; i++) {
            dest[destPos++] = rgbBuf[rgbPos++];
            dest[destPos++] = rgbBuf[rgbPos++];
            dest[destPos++] = rgbBuf[rgbPos++];
            destPos += alpha01;
          }
        }
      }
    },
    /**
     * True if the colorspace has components in the default range of [0, 1].
     * This should be true for all colorspaces except for lab color spaces
     * which are [0,100], [-128, 127], [-128, 127].
     */
    usesZeroToOneRange: true
  };

  ColorSpace.parse = function ColorSpace_parse(cs, xref, res) {
    var IR = ColorSpace.parseToIR(cs, xref, res);
    if (IR instanceof AlternateCS) {
      return IR;
    }
    return ColorSpace.fromIR(IR);
  };

  ColorSpace.fromIR = function ColorSpace_fromIR(IR) {
    var name = isArray(IR) ? IR[0] : IR;
    var whitePoint, blackPoint, gamma;

    switch (name) {
      case 'DeviceGrayCS':
        return this.singletons.gray;
      case 'DeviceRgbCS':
        return this.singletons.rgb;
      case 'DeviceCmykCS':
        return this.singletons.cmyk;
      case 'CalGrayCS':
        whitePoint = IR[1].WhitePoint;
        blackPoint = IR[1].BlackPoint;
        gamma = IR[1].Gamma;
        return new CalGrayCS(whitePoint, blackPoint, gamma);
      case 'CalRGBCS':
        whitePoint = IR[1].WhitePoint;
        blackPoint = IR[1].BlackPoint;
        gamma = IR[1].Gamma;
        var matrix = IR[1].Matrix;
        return new CalRGBCS(whitePoint, blackPoint, gamma, matrix);
      case 'PatternCS':
        var basePatternCS = IR[1];
        if (basePatternCS) {
          basePatternCS = ColorSpace.fromIR(basePatternCS);
        }
        return new PatternCS(basePatternCS);
      case 'IndexedCS':
        var baseIndexedCS = IR[1];
        var hiVal = IR[2];
        var lookup = IR[3];
        return new IndexedCS(ColorSpace.fromIR(baseIndexedCS), hiVal, lookup);
      case 'AlternateCS':
        var numComps = IR[1];
        var alt = IR[2];
        var tintFnIR = IR[3];

        return new AlternateCS(numComps, ColorSpace.fromIR(alt),
                                PDFFunction.fromIR(tintFnIR));
      case 'LabCS':
        whitePoint = IR[1].WhitePoint;
        blackPoint = IR[1].BlackPoint;
        var range = IR[1].Range;
        return new LabCS(whitePoint, blackPoint, range);
      default:
        error('Unknown name ' + name);
    }
    return null;
  };

  ColorSpace.parseToIR = function ColorSpace_parseToIR(cs, xref, res) {
    if (isName(cs)) {
      var colorSpaces = res.get('ColorSpace');
      if (isDict(colorSpaces)) {
        var refcs = colorSpaces.get(cs.name);
        if (refcs) {
          cs = refcs;
        }
      }
    }

    cs = xref.fetchIfRef(cs);
    var mode;

    if (isName(cs)) {
      mode = cs.name;
      this.mode = mode;

      switch (mode) {
        case 'DeviceGray':
        case 'G':
          return 'DeviceGrayCS';
        case 'DeviceRGB':
        case 'RGB':
          return 'DeviceRgbCS';
        case 'DeviceCMYK':
        case 'CMYK':
          return 'DeviceCmykCS';
        case 'Pattern':
          return ['PatternCS', null];
        default:
          error('unrecognized colorspace ' + mode);
      }
    } else if (isArray(cs)) {
      mode = cs[0].name;
      this.mode = mode;
      var numComps, params;

      switch (mode) {
        case 'DeviceGray':
        case 'G':
          return 'DeviceGrayCS';
        case 'DeviceRGB':
        case 'RGB':
          return 'DeviceRgbCS';
        case 'DeviceCMYK':
        case 'CMYK':
          return 'DeviceCmykCS';
        case 'CalGray':
          params = cs[1].getAll();
          return ['CalGrayCS', params];
        case 'CalRGB':
          params = cs[1].getAll();
          return ['CalRGBCS', params];
        case 'ICCBased':
          var stream = xref.fetchIfRef(cs[1]);
          var dict = stream.dict;
          numComps = dict.get('N');
          if (numComps === 1) {
            return 'DeviceGrayCS';
          } else if (numComps === 3) {
            return 'DeviceRgbCS';
          } else if (numComps === 4) {
            return 'DeviceCmykCS';
          }
          break;
        case 'Pattern':
          var basePatternCS = cs[1];
          if (basePatternCS) {
            basePatternCS = ColorSpace.parseToIR(basePatternCS, xref, res);
          }
          return ['PatternCS', basePatternCS];
        case 'Indexed':
        case 'I':
          var baseIndexedCS = ColorSpace.parseToIR(cs[1], xref, res);
          var hiVal = cs[2] + 1;
          var lookup = xref.fetchIfRef(cs[3]);
          if (isStream(lookup)) {
            lookup = lookup.getBytes();
          }
          return ['IndexedCS', baseIndexedCS, hiVal, lookup];
        case 'Separation':
        case 'DeviceN':
          var name = cs[1];
          numComps = 1;
          if (isName(name)) {
            numComps = 1;
          } else if (isArray(name)) {
            numComps = name.length;
          }
          var alt = ColorSpace.parseToIR(cs[2], xref, res);
          var tintFnIR = PDFFunction.getIR(xref, xref.fetchIfRef(cs[3]));
          return ['AlternateCS', numComps, alt, tintFnIR];
        case 'Lab':
          params = cs[1].getAll();
          return ['LabCS', params];
        default:
          error('unimplemented color space object "' + mode + '"');
      }
    } else {
      error('unrecognized color space object: "' + cs + '"');
    }
    return null;
  };
  /**
   * Checks if a decode map matches the default decode map for a color space.
   * This handles the general decode maps where there are two values per
   * component. e.g. [0, 1, 0, 1, 0, 1] for a RGB color.
   * This does not handle Lab, Indexed, or Pattern decode maps since they are
   * slightly different.
   * @param {Array} decode Decode map (usually from an image).
   * @param {Number} n Number of components the color space has.
   */
  ColorSpace.isDefaultDecode = function ColorSpace_isDefaultDecode(decode, n) {
    if (!decode) {
      return true;
    }

    if (n * 2 !== decode.length) {
      warn('The decode map is not the correct length');
      return true;
    }
    for (var i = 0, ii = decode.length; i < ii; i += 2) {
      if (decode[i] !== 0 || decode[i + 1] !== 1) {
        return false;
      }
    }
    return true;
  };

  ColorSpace.singletons = {
    get gray() {
      return shadow(this, 'gray', new DeviceGrayCS());
    },
    get rgb() {
      return shadow(this, 'rgb', new DeviceRgbCS());
    },
    get cmyk() {
      return shadow(this, 'cmyk', new DeviceCmykCS());
    }
  };

  return ColorSpace;
})();

/**
 * Alternate color space handles both Separation and DeviceN color spaces.  A
 * Separation color space is actually just a DeviceN with one color component.
 * Both color spaces use a tinting function to convert colors to a base color
 * space.
 */
var AlternateCS = (function AlternateCSClosure() {
  function AlternateCS(numComps, base, tintFn) {
    this.name = 'Alternate';
    this.numComps = numComps;
    this.defaultColor = new Float32Array(numComps);
    for (var i = 0; i < numComps; ++i) {
      this.defaultColor[i] = 1;
    }
    this.base = base;
    this.tintFn = tintFn;
    this.tmpBuf = new Float32Array(base.numComps);
  }

  AlternateCS.prototype = {
    getRgb: ColorSpace.prototype.getRgb,
    getRgbItem: function AlternateCS_getRgbItem(src, srcOffset,
                                                dest, destOffset) {
      var tmpBuf = this.tmpBuf;
      this.tintFn(src, srcOffset, tmpBuf, 0);
      this.base.getRgbItem(tmpBuf, 0, dest, destOffset);
    },
    getRgbBuffer: function AlternateCS_getRgbBuffer(src, srcOffset, count,
                                                    dest, destOffset, bits,
                                                    alpha01) {
      var tintFn = this.tintFn;
      var base = this.base;
      var scale = 1 / ((1 << bits) - 1);
      var baseNumComps = base.numComps;
      var usesZeroToOneRange = base.usesZeroToOneRange;
      var isPassthrough = (base.isPassthrough(8) || !usesZeroToOneRange) &&
                          alpha01 === 0;
      var pos = isPassthrough ? destOffset : 0;
      var baseBuf = isPassthrough ? dest : new Uint8Array(baseNumComps * count);
      var numComps = this.numComps;

      var scaled = new Float32Array(numComps);
      var tinted = new Float32Array(baseNumComps);
      var i, j;
      if (usesZeroToOneRange) {
        for (i = 0; i < count; i++) {
          for (j = 0; j < numComps; j++) {
            scaled[j] = src[srcOffset++] * scale;
          }
          tintFn(scaled, 0, tinted, 0);
          for (j = 0; j < baseNumComps; j++) {
            baseBuf[pos++] = tinted[j] * 255;
          }
        }
      } else {
        for (i = 0; i < count; i++) {
          for (j = 0; j < numComps; j++) {
            scaled[j] = src[srcOffset++] * scale;
          }
          tintFn(scaled, 0, tinted, 0);
          base.getRgbItem(tinted, 0, baseBuf, pos);
          pos += baseNumComps;
        }
      }
      if (!isPassthrough) {
        base.getRgbBuffer(baseBuf, 0, count, dest, destOffset, 8, alpha01);
      }
    },
    getOutputLength: function AlternateCS_getOutputLength(inputLength,
                                                          alpha01) {
      return this.base.getOutputLength(inputLength *
                                       this.base.numComps / this.numComps,
                                       alpha01);
    },
    isPassthrough: ColorSpace.prototype.isPassthrough,
    fillRgb: ColorSpace.prototype.fillRgb,
    isDefaultDecode: function AlternateCS_isDefaultDecode(decodeMap) {
      return ColorSpace.isDefaultDecode(decodeMap, this.numComps);
    },
    usesZeroToOneRange: true
  };

  return AlternateCS;
})();

var PatternCS = (function PatternCSClosure() {
  function PatternCS(baseCS) {
    this.name = 'Pattern';
    this.base = baseCS;
  }
  PatternCS.prototype = {};

  return PatternCS;
})();

var IndexedCS = (function IndexedCSClosure() {
  function IndexedCS(base, highVal, lookup) {
    this.name = 'Indexed';
    this.numComps = 1;
    this.defaultColor = new Uint8Array([0]);
    this.base = base;
    this.highVal = highVal;

    var baseNumComps = base.numComps;
    var length = baseNumComps * highVal;
    var lookupArray;

    if (isStream(lookup)) {
      lookupArray = new Uint8Array(length);
      var bytes = lookup.getBytes(length);
      lookupArray.set(bytes);
    } else if (isString(lookup)) {
      lookupArray = new Uint8Array(length);
      for (var i = 0; i < length; ++i) {
        lookupArray[i] = lookup.charCodeAt(i);
      }
    } else if (lookup instanceof Uint8Array || lookup instanceof Array) {
      lookupArray = lookup;
    } else {
      error('Unrecognized lookup table: ' + lookup);
    }
    this.lookup = lookupArray;
  }

  IndexedCS.prototype = {
    getRgb: ColorSpace.prototype.getRgb,
    getRgbItem: function IndexedCS_getRgbItem(src, srcOffset,
                                              dest, destOffset) {
      var numComps = this.base.numComps;
      var start = src[srcOffset] * numComps;
      this.base.getRgbItem(this.lookup, start, dest, destOffset);
    },
    getRgbBuffer: function IndexedCS_getRgbBuffer(src, srcOffset, count,
                                                  dest, destOffset, bits,
                                                  alpha01) {
      var base = this.base;
      var numComps = base.numComps;
      var outputDelta = base.getOutputLength(numComps, alpha01);
      var lookup = this.lookup;

      for (var i = 0; i < count; ++i) {
        var lookupPos = src[srcOffset++] * numComps;
        base.getRgbBuffer(lookup, lookupPos, 1, dest, destOffset, 8, alpha01);
        destOffset += outputDelta;
      }
    },
    getOutputLength: function IndexedCS_getOutputLength(inputLength, alpha01) {
      return this.base.getOutputLength(inputLength * this.base.numComps,
                                       alpha01);
    },
    isPassthrough: ColorSpace.prototype.isPassthrough,
    fillRgb: ColorSpace.prototype.fillRgb,
    isDefaultDecode: function IndexedCS_isDefaultDecode(decodeMap) {
      // indexed color maps shouldn't be changed
      return true;
    },
    usesZeroToOneRange: true
  };
  return IndexedCS;
})();

var DeviceGrayCS = (function DeviceGrayCSClosure() {
  function DeviceGrayCS() {
    this.name = 'DeviceGray';
    this.numComps = 1;
    this.defaultColor = new Float32Array([0]);
  }

  DeviceGrayCS.prototype = {
    getRgb: ColorSpace.prototype.getRgb,
    getRgbItem: function DeviceGrayCS_getRgbItem(src, srcOffset,
                                                 dest, destOffset) {
      var c = (src[srcOffset] * 255) | 0;
      c = c < 0 ? 0 : c > 255 ? 255 : c;
      dest[destOffset] = dest[destOffset + 1] = dest[destOffset + 2] = c;
    },
    getRgbBuffer: function DeviceGrayCS_getRgbBuffer(src, srcOffset, count,
                                                     dest, destOffset, bits,
                                                     alpha01) {
      var scale = 255 / ((1 << bits) - 1);
      var j = srcOffset, q = destOffset;
      for (var i = 0; i < count; ++i) {
        var c = (scale * src[j++]) | 0;
        dest[q++] = c;
        dest[q++] = c;
        dest[q++] = c;
        q += alpha01;
      }
    },
    getOutputLength: function DeviceGrayCS_getOutputLength(inputLength,
                                                           alpha01) {
      return inputLength * (3 + alpha01);
    },
    isPassthrough: ColorSpace.prototype.isPassthrough,
    fillRgb: ColorSpace.prototype.fillRgb,
    isDefaultDecode: function DeviceGrayCS_isDefaultDecode(decodeMap) {
      return ColorSpace.isDefaultDecode(decodeMap, this.numComps);
    },
    usesZeroToOneRange: true
  };
  return DeviceGrayCS;
})();

var DeviceRgbCS = (function DeviceRgbCSClosure() {
  function DeviceRgbCS() {
    this.name = 'DeviceRGB';
    this.numComps = 3;
    this.defaultColor = new Float32Array([0, 0, 0]);
  }
  DeviceRgbCS.prototype = {
    getRgb: ColorSpace.prototype.getRgb,
    getRgbItem: function DeviceRgbCS_getRgbItem(src, srcOffset,
                                                dest, destOffset) {
      var r = (src[srcOffset] * 255) | 0;
      var g = (src[srcOffset + 1] * 255) | 0;
      var b = (src[srcOffset + 2] * 255) | 0;
      dest[destOffset] = r < 0 ? 0 : r > 255 ? 255 : r;
      dest[destOffset + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
      dest[destOffset + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
    },
    getRgbBuffer: function DeviceRgbCS_getRgbBuffer(src, srcOffset, count,
                                                    dest, destOffset, bits,
                                                    alpha01) {
      if (bits === 8 && alpha01 === 0) {
        dest.set(src.subarray(srcOffset, srcOffset + count * 3), destOffset);
        return;
      }
      var scale = 255 / ((1 << bits) - 1);
      var j = srcOffset, q = destOffset;
      for (var i = 0; i < count; ++i) {
        dest[q++] = (scale * src[j++]) | 0;
        dest[q++] = (scale * src[j++]) | 0;
        dest[q++] = (scale * src[j++]) | 0;
        q += alpha01;
      }
    },
    getOutputLength: function DeviceRgbCS_getOutputLength(inputLength,
                                                          alpha01) {
      return (inputLength * (3 + alpha01) / 3) | 0;
    },
    isPassthrough: function DeviceRgbCS_isPassthrough(bits) {
      return bits === 8;
    },
    fillRgb: ColorSpace.prototype.fillRgb,
    isDefaultDecode: function DeviceRgbCS_isDefaultDecode(decodeMap) {
      return ColorSpace.isDefaultDecode(decodeMap, this.numComps);
    },
    usesZeroToOneRange: true
  };
  return DeviceRgbCS;
})();

var DeviceCmykCS = (function DeviceCmykCSClosure() {
  // The coefficients below was found using numerical analysis: the method of
  // steepest descent for the sum((f_i - color_value_i)^2) for r/g/b colors,
  // where color_value is the tabular value from the table of sampled RGB colors
  // from CMYK US Web Coated (SWOP) colorspace, and f_i is the corresponding
  // CMYK color conversion using the estimation below:
  //   f(A, B,.. N) = Acc+Bcm+Ccy+Dck+c+Fmm+Gmy+Hmk+Im+Jyy+Kyk+Ly+Mkk+Nk+255
  function convertToRgb(src, srcOffset, srcScale, dest, destOffset) {
    var c = src[srcOffset + 0] * srcScale;
    var m = src[srcOffset + 1] * srcScale;
    var y = src[srcOffset + 2] * srcScale;
    var k = src[srcOffset + 3] * srcScale;

    var r =
      (c * (-4.387332384609988 * c + 54.48615194189176 * m +
            18.82290502165302 * y + 212.25662451639585 * k +
            -285.2331026137004) +
       m * (1.7149763477362134 * m - 5.6096736904047315 * y +
            -17.873870861415444 * k - 5.497006427196366) +
       y * (-2.5217340131683033 * y - 21.248923337353073 * k +
            17.5119270841813) +
       k * (-21.86122147463605 * k - 189.48180835922747) + 255) | 0;
    var g =
      (c * (8.841041422036149 * c + 60.118027045597366 * m +
            6.871425592049007 * y + 31.159100130055922 * k +
            -79.2970844816548) +
       m * (-15.310361306967817 * m + 17.575251261109482 * y +
            131.35250912493976 * k - 190.9453302588951) +
       y * (4.444339102852739 * y + 9.8632861493405 * k - 24.86741582555878) +
       k * (-20.737325471181034 * k - 187.80453709719578) + 255) | 0;
    var b =
      (c * (0.8842522430003296 * c + 8.078677503112928 * m +
            30.89978309703729 * y - 0.23883238689178934 * k +
            -14.183576799673286) +
       m * (10.49593273432072 * m + 63.02378494754052 * y +
            50.606957656360734 * k - 112.23884253719248) +
       y * (0.03296041114873217 * y + 115.60384449646641 * k +
            -193.58209356861505) +
       k * (-22.33816807309886 * k - 180.12613974708367) + 255) | 0;

    dest[destOffset] = r > 255 ? 255 : r < 0 ? 0 : r;
    dest[destOffset + 1] = g > 255 ? 255 : g < 0 ? 0 : g;
    dest[destOffset + 2] = b > 255 ? 255 : b < 0 ? 0 : b;
  }

  function DeviceCmykCS() {
    this.name = 'DeviceCMYK';
    this.numComps = 4;
    this.defaultColor = new Float32Array([0, 0, 0, 1]);
  }
  DeviceCmykCS.prototype = {
    getRgb: ColorSpace.prototype.getRgb,
    getRgbItem: function DeviceCmykCS_getRgbItem(src, srcOffset,
                                                 dest, destOffset) {
      convertToRgb(src, srcOffset, 1, dest, destOffset);
    },
    getRgbBuffer: function DeviceCmykCS_getRgbBuffer(src, srcOffset, count,
                                                     dest, destOffset, bits,
                                                     alpha01) {
      var scale = 1 / ((1 << bits) - 1);
      for (var i = 0; i < count; i++) {
        convertToRgb(src, srcOffset, scale, dest, destOffset);
        srcOffset += 4;
        destOffset += 3 + alpha01;
      }
    },
    getOutputLength: function DeviceCmykCS_getOutputLength(inputLength,
                                                           alpha01) {
      return (inputLength / 4 * (3 + alpha01)) | 0;
    },
    isPassthrough: ColorSpace.prototype.isPassthrough,
    fillRgb: ColorSpace.prototype.fillRgb,
    isDefaultDecode: function DeviceCmykCS_isDefaultDecode(decodeMap) {
      return ColorSpace.isDefaultDecode(decodeMap, this.numComps);
    },
    usesZeroToOneRange: true
  };

  return DeviceCmykCS;
})();

//
// CalGrayCS: Based on "PDF Reference, Sixth Ed", p.245
//
var CalGrayCS = (function CalGrayCSClosure() {
  function CalGrayCS(whitePoint, blackPoint, gamma) {
    this.name = 'CalGray';
    this.numComps = 1;
    this.defaultColor = new Float32Array([0]);

    if (!whitePoint) {
      error('WhitePoint missing - required for color space CalGray');
    }
    blackPoint = blackPoint || [0, 0, 0];
    gamma = gamma || 1;

    // Translate arguments to spec variables.
    this.XW = whitePoint[0];
    this.YW = whitePoint[1];
    this.ZW = whitePoint[2];

    this.XB = blackPoint[0];
    this.YB = blackPoint[1];
    this.ZB = blackPoint[2];

    this.G = gamma;

    // Validate variables as per spec.
    if (this.XW < 0 || this.ZW < 0 || this.YW !== 1) {
      error('Invalid WhitePoint components for ' + this.name +
            ', no fallback available');
    }

    if (this.XB < 0 || this.YB < 0 || this.ZB < 0) {
      info('Invalid BlackPoint for ' + this.name + ', falling back to default');
      this.XB = this.YB = this.ZB = 0;
    }

    if (this.XB !== 0 || this.YB !== 0 || this.ZB !== 0) {
      warn(this.name + ', BlackPoint: XB: ' + this.XB + ', YB: ' + this.YB +
           ', ZB: ' + this.ZB + ', only default values are supported.');
    }

    if (this.G < 1) {
      info('Invalid Gamma: ' + this.G + ' for ' + this.name +
           ', falling back to default');
      this.G = 1;
    }
  }

  function convertToRgb(cs, src, srcOffset, dest, destOffset, scale) {
    // A represents a gray component of a calibrated gray space.
    // A <---> AG in the spec
    var A = src[srcOffset] * scale;
    var AG = Math.pow(A, cs.G);

    // Computes L as per spec. ( = cs.YW * AG )
    // Except if other than default BlackPoint values are used.
    var L = cs.YW * AG;
    // http://www.poynton.com/notes/colour_and_gamma/ColorFAQ.html, Ch 4.
    // Convert values to rgb range [0, 255].
    var val = Math.max(295.8 * Math.pow(L, 0.333333333333333333) - 40.8, 0) | 0;
    dest[destOffset] = val;
    dest[destOffset + 1] = val;
    dest[destOffset + 2] = val;
  }

  CalGrayCS.prototype = {
    getRgb: ColorSpace.prototype.getRgb,
    getRgbItem: function CalGrayCS_getRgbItem(src, srcOffset,
                                              dest, destOffset) {
      convertToRgb(this, src, srcOffset, dest, destOffset, 1);
    },
    getRgbBuffer: function CalGrayCS_getRgbBuffer(src, srcOffset, count,
                                                  dest, destOffset, bits,
                                                  alpha01) {
      var scale = 1 / ((1 << bits) - 1);

      for (var i = 0; i < count; ++i) {
        convertToRgb(this, src, srcOffset, dest, destOffset, scale);
        srcOffset += 1;
        destOffset += 3 + alpha01;
      }
    },
    getOutputLength: function CalGrayCS_getOutputLength(inputLength, alpha01) {
      return inputLength * (3 + alpha01);
    },
    isPassthrough: ColorSpace.prototype.isPassthrough,
    fillRgb: ColorSpace.prototype.fillRgb,
    isDefaultDecode: function CalGrayCS_isDefaultDecode(decodeMap) {
      return ColorSpace.isDefaultDecode(decodeMap, this.numComps);
    },
    usesZeroToOneRange: true
  };
  return CalGrayCS;
})();

//
// CalRGBCS: Based on "PDF Reference, Sixth Ed", p.247
//
var CalRGBCS = (function CalRGBCSClosure() {

  // See http://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html for these
  // matrices.
  var BRADFORD_SCALE_MATRIX = new Float32Array([
    0.8951, 0.2664, -0.1614,
    -0.7502, 1.7135, 0.0367,
    0.0389, -0.0685, 1.0296]);

  var BRADFORD_SCALE_INVERSE_MATRIX = new Float32Array([
    0.9869929, -0.1470543, 0.1599627,
    0.4323053, 0.5183603, 0.0492912,
    -0.0085287, 0.0400428, 0.9684867]);

  // See http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html.
  var SRGB_D65_XYZ_TO_RGB_MATRIX = new Float32Array([
    3.2404542, -1.5371385, -0.4985314,
    -0.9692660, 1.8760108, 0.0415560,
    0.0556434, -0.2040259, 1.0572252]);

  var FLAT_WHITEPOINT_MATRIX = new Float32Array([1, 1, 1]);

  var tempNormalizeMatrix = new Float32Array(3);
  var tempConvertMatrix1 = new Float32Array(3);
  var tempConvertMatrix2 = new Float32Array(3);

  var DECODE_L_CONSTANT = Math.pow(((8 + 16) / 116), 3) / 8.0;

  function CalRGBCS(whitePoint, blackPoint, gamma, matrix) {
    this.name = 'CalRGB';
    this.numComps = 3;
    this.defaultColor = new Float32Array(3);

    if (!whitePoint) {
      error('WhitePoint missing - required for color space CalRGB');
    }
    blackPoint = blackPoint || new Float32Array(3);
    gamma = gamma || new Float32Array([1, 1, 1]);
    matrix = matrix || new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

    // Translate arguments to spec variables.
    var XW = whitePoint[0];
    var YW = whitePoint[1];
    var ZW = whitePoint[2];
    this.whitePoint = whitePoint;

    var XB = blackPoint[0];
    var YB = blackPoint[1];
    var ZB = blackPoint[2];
    this.blackPoint = blackPoint;

    this.GR = gamma[0];
    this.GG = gamma[1];
    this.GB = gamma[2];

    this.MXA = matrix[0];
    this.MYA = matrix[1];
    this.MZA = matrix[2];
    this.MXB = matrix[3];
    this.MYB = matrix[4];
    this.MZB = matrix[5];
    this.MXC = matrix[6];
    this.MYC = matrix[7];
    this.MZC = matrix[8];

    // Validate variables as per spec.
    if (XW < 0 || ZW < 0 || YW !== 1) {
      error('Invalid WhitePoint components for ' + this.name +
            ', no fallback available');
    }

    if (XB < 0 || YB < 0 || ZB < 0) {
      info('Invalid BlackPoint for ' + this.name + ' [' + XB + ', ' + YB +
           ', ' + ZB + '], falling back to default');
      this.blackPoint = new Float32Array(3);
    }

    if (this.GR < 0 || this.GG < 0 || this.GB < 0) {
      info('Invalid Gamma [' + this.GR + ', ' + this.GG + ', ' + this.GB +
           '] for ' + this.name + ', falling back to default');
      this.GR = this.GG = this.GB = 1;
    }

    if (this.MXA < 0 || this.MYA < 0 || this.MZA < 0 ||
        this.MXB < 0 || this.MYB < 0 || this.MZB < 0 ||
        this.MXC < 0 || this.MYC < 0 || this.MZC < 0) {
      info('Invalid Matrix for ' + this.name + ' [' +
           this.MXA + ', ' + this.MYA + ', ' + this.MZA +
           this.MXB + ', ' + this.MYB + ', ' + this.MZB +
           this.MXC + ', ' + this.MYC + ', ' + this.MZC +
           '], falling back to default');
      this.MXA = this.MYB = this.MZC = 1;
      this.MXB = this.MYA = this.MZA = this.MXC = this.MYC = this.MZB = 0;
    }
  }

  function matrixProduct(a, b, result) {
      result[0] = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      result[1] = a[3] * b[0] + a[4] * b[1] + a[5] * b[2];
      result[2] = a[6] * b[0] + a[7] * b[1] + a[8] * b[2];
  }

  function convertToFlat(sourceWhitePoint, LMS, result) {
      result[0] = LMS[0] * 1 / sourceWhitePoint[0];
      result[1] = LMS[1] * 1 / sourceWhitePoint[1];
      result[2] = LMS[2] * 1 / sourceWhitePoint[2];
  }

  function convertToD65(sourceWhitePoint, LMS, result) {
    var D65X = 0.95047;
    var D65Y = 1;
    var D65Z = 1.08883;

    result[0] = LMS[0] * D65X / sourceWhitePoint[0];
    result[1] = LMS[1] * D65Y / sourceWhitePoint[1];
    result[2] = LMS[2] * D65Z / sourceWhitePoint[2];
  }

  function sRGBTransferFunction(color) {
    // See http://en.wikipedia.org/wiki/SRGB.
    if (color <= 0.0031308){
      return adjustToRange(0, 1, 12.92 * color);
    }

    return adjustToRange(0, 1, (1 + 0.055) * Math.pow(color, 1 / 2.4) - 0.055);
  }

  function adjustToRange(min, max, value) {
    return Math.max(min, Math.min(max, value));
  }

  function decodeL(L) {
    if (L < 0) {
      return -decodeL(-L);
    }

    if (L > 8.0) {
      return Math.pow(((L + 16) / 116), 3);
    }

    return L * DECODE_L_CONSTANT;
  }

  function compensateBlackPoint(sourceBlackPoint, XYZ_Flat, result) {

    // In case the blackPoint is already the default blackPoint then there is
    // no need to do compensation.
    if (sourceBlackPoint[0] === 0 &&
        sourceBlackPoint[1] === 0 &&
        sourceBlackPoint[2] === 0) {
      result[0] = XYZ_Flat[0];
      result[1] = XYZ_Flat[1];
      result[2] = XYZ_Flat[2];
      return;
    }

    // For the blackPoint calculation details, please see
    // http://www.adobe.com/content/dam/Adobe/en/devnet/photoshop/sdk/
    // AdobeBPC.pdf.
    // The destination blackPoint is the default blackPoint [0, 0, 0].
    var zeroDecodeL = decodeL(0);

    var X_DST = zeroDecodeL;
    var X_SRC = decodeL(sourceBlackPoint[0]);

    var Y_DST = zeroDecodeL;
    var Y_SRC = decodeL(sourceBlackPoint[1]);

    var Z_DST = zeroDecodeL;
    var Z_SRC = decodeL(sourceBlackPoint[2]);

    var X_Scale = (1 - X_DST) / (1 - X_SRC);
    var X_Offset = 1 - X_Scale;

    var Y_Scale = (1 - Y_DST) / (1 - Y_SRC);
    var Y_Offset = 1 - Y_Scale;

    var Z_Scale = (1 - Z_DST) / (1 - Z_SRC);
    var Z_Offset = 1 - Z_Scale;

    result[0] = XYZ_Flat[0] * X_Scale + X_Offset;
    result[1] = XYZ_Flat[1] * Y_Scale + Y_Offset;
    result[2] = XYZ_Flat[2] * Z_Scale + Z_Offset;
  }

  function normalizeWhitePointToFlat(sourceWhitePoint, XYZ_In, result) {

    // In case the whitePoint is already flat then there is no need to do
    // normalization.
    if (sourceWhitePoint[0] === 1 && sourceWhitePoint[2] === 1) {
      result[0] = XYZ_In[0];
      result[1] = XYZ_In[1];
      result[2] = XYZ_In[2];
      return;
    }

    var LMS = result;
    matrixProduct(BRADFORD_SCALE_MATRIX, XYZ_In, LMS);

    var LMS_Flat = tempNormalizeMatrix;
    convertToFlat(sourceWhitePoint, LMS, LMS_Flat);

    matrixProduct(BRADFORD_SCALE_INVERSE_MATRIX, LMS_Flat, result);
  }

  function normalizeWhitePointToD65(sourceWhitePoint, XYZ_In, result) {

    var LMS = result;
    matrixProduct(BRADFORD_SCALE_MATRIX, XYZ_In, LMS);

    var LMS_D65 = tempNormalizeMatrix;
    convertToD65(sourceWhitePoint, LMS, LMS_D65);

    matrixProduct(BRADFORD_SCALE_INVERSE_MATRIX, LMS_D65, result);
  }

  function convertToRgb(cs, src, srcOffset, dest, destOffset, scale) {
    // A, B and C represent a red, green and blue components of a calibrated
    // rgb space.
    var A = adjustToRange(0, 1, src[srcOffset] * scale);
    var B = adjustToRange(0, 1, src[srcOffset + 1] * scale);
    var C = adjustToRange(0, 1, src[srcOffset + 2] * scale);

    // A <---> AGR in the spec
    // B <---> BGG in the spec
    // C <---> CGB in the spec
    var AGR = Math.pow(A, cs.GR);
    var BGG = Math.pow(B, cs.GG);
    var CGB = Math.pow(C, cs.GB);

    // Computes intermediate variables L, M, N as per spec.
    // To decode X, Y, Z values map L, M, N directly to them.
    var X = cs.MXA * AGR + cs.MXB * BGG + cs.MXC * CGB;
    var Y = cs.MYA * AGR + cs.MYB * BGG + cs.MYC * CGB;
    var Z = cs.MZA * AGR + cs.MZB * BGG + cs.MZC * CGB;

    // The following calculations are based on this document:
    // http://www.adobe.com/content/dam/Adobe/en/devnet/photoshop/sdk/
    // AdobeBPC.pdf.
    var XYZ = tempConvertMatrix1;
    XYZ[0] = X;
    XYZ[1] = Y;
    XYZ[2] = Z;
    var XYZ_Flat = tempConvertMatrix2;

    normalizeWhitePointToFlat(cs.whitePoint, XYZ, XYZ_Flat);

    var XYZ_Black = tempConvertMatrix1;
    compensateBlackPoint(cs.blackPoint, XYZ_Flat, XYZ_Black);

    var XYZ_D65 = tempConvertMatrix2;
    normalizeWhitePointToD65(FLAT_WHITEPOINT_MATRIX, XYZ_Black, XYZ_D65);

    var SRGB = tempConvertMatrix1;
    matrixProduct(SRGB_D65_XYZ_TO_RGB_MATRIX, XYZ_D65, SRGB);

    var sR = sRGBTransferFunction(SRGB[0]);
    var sG = sRGBTransferFunction(SRGB[1]);
    var sB = sRGBTransferFunction(SRGB[2]);

    // Convert the values to rgb range [0, 255].
    dest[destOffset] = Math.round(sR * 255);
    dest[destOffset + 1] = Math.round(sG * 255);
    dest[destOffset + 2] = Math.round(sB * 255);
  }

  CalRGBCS.prototype = {
    getRgb: function CalRGBCS_getRgb(src, srcOffset) {
      var rgb = new Uint8Array(3);
      this.getRgbItem(src, srcOffset, rgb, 0);
      return rgb;
    },
    getRgbItem: function CalRGBCS_getRgbItem(src, srcOffset,
                                             dest, destOffset) {
      convertToRgb(this, src, srcOffset, dest, destOffset, 1);
    },
    getRgbBuffer: function CalRGBCS_getRgbBuffer(src, srcOffset, count,
                                                 dest, destOffset, bits,
                                                 alpha01) {
      var scale = 1 / ((1 << bits) - 1);

      for (var i = 0; i < count; ++i) {
        convertToRgb(this, src, srcOffset, dest, destOffset, scale);
        srcOffset += 3;
        destOffset += 3 + alpha01;
      }
    },
    getOutputLength: function CalRGBCS_getOutputLength(inputLength, alpha01) {
      return (inputLength * (3 + alpha01) / 3) | 0;
    },
    isPassthrough: ColorSpace.prototype.isPassthrough,
    fillRgb: ColorSpace.prototype.fillRgb,
    isDefaultDecode: function CalRGBCS_isDefaultDecode(decodeMap) {
      return ColorSpace.isDefaultDecode(decodeMap, this.numComps);
    },
    usesZeroToOneRange: true
  };
  return CalRGBCS;
})();

//
// LabCS: Based on "PDF Reference, Sixth Ed", p.250
//
var LabCS = (function LabCSClosure() {
  function LabCS(whitePoint, blackPoint, range) {
    this.name = 'Lab';
    this.numComps = 3;
    this.defaultColor = new Float32Array([0, 0, 0]);

    if (!whitePoint) {
      error('WhitePoint missing - required for color space Lab');
    }
    blackPoint = blackPoint || [0, 0, 0];
    range = range || [-100, 100, -100, 100];

    // Translate args to spec variables
    this.XW = whitePoint[0];
    this.YW = whitePoint[1];
    this.ZW = whitePoint[2];
    this.amin = range[0];
    this.amax = range[1];
    this.bmin = range[2];
    this.bmax = range[3];

    // These are here just for completeness - the spec doesn't offer any
    // formulas that use BlackPoint in Lab
    this.XB = blackPoint[0];
    this.YB = blackPoint[1];
    this.ZB = blackPoint[2];

    // Validate vars as per spec
    if (this.XW < 0 || this.ZW < 0 || this.YW !== 1) {
      error('Invalid WhitePoint components, no fallback available');
    }

    if (this.XB < 0 || this.YB < 0 || this.ZB < 0) {
      info('Invalid BlackPoint, falling back to default');
      this.XB = this.YB = this.ZB = 0;
    }

    if (this.amin > this.amax || this.bmin > this.bmax) {
      info('Invalid Range, falling back to defaults');
      this.amin = -100;
      this.amax = 100;
      this.bmin = -100;
      this.bmax = 100;
    }
  }

  // Function g(x) from spec
  function fn_g(x) {
    if (x >= 6 / 29) {
      return x * x * x;
    } else {
      return (108 / 841) * (x - 4 / 29);
    }
  }

  function decode(value, high1, low2, high2) {
    return low2 + (value) * (high2 - low2) / (high1);
  }

  // If decoding is needed maxVal should be 2^bits per component - 1.
  function convertToRgb(cs, src, srcOffset, maxVal, dest, destOffset) {
    // XXX: Lab input is in the range of [0, 100], [amin, amax], [bmin, bmax]
    // not the usual [0, 1]. If a command like setFillColor is used the src
    // values will already be within the correct range. However, if we are
    // converting an image we have to map the values to the correct range given
    // above.
    // Ls,as,bs <---> L*,a*,b* in the spec
    var Ls = src[srcOffset];
    var as = src[srcOffset + 1];
    var bs = src[srcOffset + 2];
    if (maxVal !== false) {
      Ls = decode(Ls, maxVal, 0, 100);
      as = decode(as, maxVal, cs.amin, cs.amax);
      bs = decode(bs, maxVal, cs.bmin, cs.bmax);
    }

    // Adjust limits of 'as' and 'bs'
    as = as > cs.amax ? cs.amax : as < cs.amin ? cs.amin : as;
    bs = bs > cs.bmax ? cs.bmax : bs < cs.bmin ? cs.bmin : bs;

    // Computes intermediate variables X,Y,Z as per spec
    var M = (Ls + 16) / 116;
    var L = M + (as / 500);
    var N = M - (bs / 200);

    var X = cs.XW * fn_g(L);
    var Y = cs.YW * fn_g(M);
    var Z = cs.ZW * fn_g(N);

    var r, g, b;
    // Using different conversions for D50 and D65 white points,
    // per http://www.color.org/srgb.pdf
    if (cs.ZW < 1) {
      // Assuming D50 (X=0.9642, Y=1.00, Z=0.8249)
      r = X * 3.1339 + Y * -1.6170 + Z * -0.4906;
      g = X * -0.9785 + Y * 1.9160 + Z * 0.0333;
      b = X * 0.0720 + Y * -0.2290 + Z * 1.4057;
    } else {
      // Assuming D65 (X=0.9505, Y=1.00, Z=1.0888)
      r = X * 3.2406 + Y * -1.5372 + Z * -0.4986;
      g = X * -0.9689 + Y * 1.8758 + Z * 0.0415;
      b = X * 0.0557 + Y * -0.2040 + Z * 1.0570;
    }
    // clamp color values to [0,1] range then convert to [0,255] range.
    dest[destOffset] = r <= 0 ? 0 : r >= 1 ? 255 : Math.sqrt(r) * 255 | 0;
    dest[destOffset + 1] = g <= 0 ? 0 : g >= 1 ? 255 : Math.sqrt(g) * 255 | 0;
    dest[destOffset + 2] = b <= 0 ? 0 : b >= 1 ? 255 : Math.sqrt(b) * 255 | 0;
  }

  LabCS.prototype = {
    getRgb: ColorSpace.prototype.getRgb,
    getRgbItem: function LabCS_getRgbItem(src, srcOffset, dest, destOffset) {
      convertToRgb(this, src, srcOffset, false, dest, destOffset);
    },
    getRgbBuffer: function LabCS_getRgbBuffer(src, srcOffset, count,
                                              dest, destOffset, bits,
                                              alpha01) {
      var maxVal = (1 << bits) - 1;
      for (var i = 0; i < count; i++) {
        convertToRgb(this, src, srcOffset, maxVal, dest, destOffset);
        srcOffset += 3;
        destOffset += 3 + alpha01;
      }
    },
    getOutputLength: function LabCS_getOutputLength(inputLength, alpha01) {
      return (inputLength * (3 + alpha01) / 3) | 0;
    },
    isPassthrough: ColorSpace.prototype.isPassthrough,
    fillRgb: ColorSpace.prototype.fillRgb,
    isDefaultDecode: function LabCS_isDefaultDecode(decodeMap) {
      // XXX: Decoding is handled with the lab conversion because of the strange
      // ranges that are used.
      return true;
    },
    usesZeroToOneRange: false
  };
  return LabCS;
})();


var ARCFourCipher = (function ARCFourCipherClosure() {
  function ARCFourCipher(key) {
    this.a = 0;
    this.b = 0;
    var s = new Uint8Array(256);
    var i, j = 0, tmp, keyLength = key.length;
    for (i = 0; i < 256; ++i) {
      s[i] = i;
    }
    for (i = 0; i < 256; ++i) {
      tmp = s[i];
      j = (j + tmp + key[i % keyLength]) & 0xFF;
      s[i] = s[j];
      s[j] = tmp;
    }
    this.s = s;
  }

  ARCFourCipher.prototype = {
    encryptBlock: function ARCFourCipher_encryptBlock(data) {
      var i, n = data.length, tmp, tmp2;
      var a = this.a, b = this.b, s = this.s;
      var output = new Uint8Array(n);
      for (i = 0; i < n; ++i) {
        a = (a + 1) & 0xFF;
        tmp = s[a];
        b = (b + tmp) & 0xFF;
        tmp2 = s[b];
        s[a] = tmp2;
        s[b] = tmp;
        output[i] = data[i] ^ s[(tmp + tmp2) & 0xFF];
      }
      this.a = a;
      this.b = b;
      return output;
    }
  };
  ARCFourCipher.prototype.decryptBlock = ARCFourCipher.prototype.encryptBlock;

  return ARCFourCipher;
})();

var calculateMD5 = (function calculateMD5Closure() {
  var r = new Uint8Array([
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21]);

  var k = new Int32Array([
    -680876936, -389564586, 606105819, -1044525330, -176418897, 1200080426,
    -1473231341, -45705983, 1770035416, -1958414417, -42063, -1990404162,
    1804603682, -40341101, -1502002290, 1236535329, -165796510, -1069501632,
    643717713, -373897302, -701558691, 38016083, -660478335, -405537848,
    568446438, -1019803690, -187363961, 1163531501, -1444681467, -51403784,
    1735328473, -1926607734, -378558, -2022574463, 1839030562, -35309556,
    -1530992060, 1272893353, -155497632, -1094730640, 681279174, -358537222,
    -722521979, 76029189, -640364487, -421815835, 530742520, -995338651,
    -198630844, 1126891415, -1416354905, -57434055, 1700485571, -1894986606,
    -1051523, -2054922799, 1873313359, -30611744, -1560198380, 1309151649,
    -145523070, -1120210379, 718787259, -343485551]);

  function hash(data, offset, length) {
    var h0 = 1732584193, h1 = -271733879, h2 = -1732584194, h3 = 271733878;
    // pre-processing
    var paddedLength = (length + 72) & ~63; // data + 9 extra bytes
    var padded = new Uint8Array(paddedLength);
    var i, j, n;
    for (i = 0; i < length; ++i) {
      padded[i] = data[offset++];
    }
    padded[i++] = 0x80;
    n = paddedLength - 8;
    while (i < n) {
      padded[i++] = 0;
    }
    padded[i++] = (length << 3) & 0xFF;
    padded[i++] = (length >> 5) & 0xFF;
    padded[i++] = (length >> 13) & 0xFF;
    padded[i++] = (length >> 21) & 0xFF;
    padded[i++] = (length >>> 29) & 0xFF;
    padded[i++] = 0;
    padded[i++] = 0;
    padded[i++] = 0;
    var w = new Int32Array(16);
    for (i = 0; i < paddedLength;) {
      for (j = 0; j < 16; ++j, i += 4) {
        w[j] = (padded[i] | (padded[i + 1] << 8) |
               (padded[i + 2] << 16) | (padded[i + 3] << 24));
      }
      var a = h0, b = h1, c = h2, d = h3, f, g;
      for (j = 0; j < 64; ++j) {
        if (j < 16) {
          f = (b & c) | ((~b) & d);
          g = j;
        } else if (j < 32) {
          f = (d & b) | ((~d) & c);
          g = (5 * j + 1) & 15;
        } else if (j < 48) {
          f = b ^ c ^ d;
          g = (3 * j + 5) & 15;
        } else {
          f = c ^ (b | (~d));
          g = (7 * j) & 15;
        }
        var tmp = d, rotateArg = (a + f + k[j] + w[g]) | 0, rotate = r[j];
        d = c;
        c = b;
        b = (b + ((rotateArg << rotate) | (rotateArg >>> (32 - rotate)))) | 0;
        a = tmp;
      }
      h0 = (h0 + a) | 0;
      h1 = (h1 + b) | 0;
      h2 = (h2 + c) | 0;
      h3 = (h3 + d) | 0;
    }
    return new Uint8Array([
      h0 & 0xFF, (h0 >> 8) & 0xFF, (h0 >> 16) & 0xFF, (h0 >>> 24) & 0xFF,
      h1 & 0xFF, (h1 >> 8) & 0xFF, (h1 >> 16) & 0xFF, (h1 >>> 24) & 0xFF,
      h2 & 0xFF, (h2 >> 8) & 0xFF, (h2 >> 16) & 0xFF, (h2 >>> 24) & 0xFF,
      h3 & 0xFF, (h3 >> 8) & 0xFF, (h3 >> 16) & 0xFF, (h3 >>> 24) & 0xFF
    ]);
  }

  return hash;
})();
var Word64 = (function Word64Closure() {
  function Word64(highInteger, lowInteger) {
    this.high = highInteger | 0;
    this.low = lowInteger | 0;
  }
  Word64.prototype = {
    and: function Word64_and(word) {
      this.high &= word.high;
      this.low &= word.low;
    },
    xor: function Word64_xor(word) {
     this.high ^= word.high;
     this.low ^= word.low;
    },

    or: function Word64_or(word) {
      this.high |= word.high;
      this.low |= word.low;
    },

    shiftRight: function Word64_shiftRight(places) {
      if (places >= 32) {
        this.low = (this.high >>> (places - 32)) | 0;
        this.high = 0;
      } else {
        this.low = (this.low >>> places) | (this.high << (32 - places));
        this.high = (this.high >>> places) | 0;
      }
    },

    shiftLeft: function Word64_shiftLeft(places) {
      if (places >= 32) {
        this.high = this.low << (places - 32);
        this.low = 0;
      } else {
        this.high = (this.high << places) | (this.low >>> (32 - places));
        this.low = this.low << places;
      }
    },

    rotateRight: function Word64_rotateRight(places) {
      var low, high;
      if (places & 32) {
        high = this.low;
        low = this.high;
      } else {
        low = this.low;
        high = this.high;
      }
      places &= 31;
      this.low = (low >>> places) | (high << (32 - places));
      this.high = (high >>> places) | (low << (32 - places));
    },

    not: function Word64_not() {
      this.high = ~this.high;
      this.low = ~this.low;
    },

    add: function Word64_add(word) {
      var lowAdd = (this.low >>> 0) + (word.low >>> 0);
      var highAdd = (this.high >>> 0) + (word.high >>> 0);
      if (lowAdd > 0xFFFFFFFF) {
        highAdd += 1;
      }
      this.low = lowAdd | 0;
      this.high = highAdd | 0;
    },

    copyTo: function Word64_copyTo(bytes, offset) {
      bytes[offset] = (this.high >>> 24) & 0xFF;
      bytes[offset + 1] = (this.high >> 16) & 0xFF;
      bytes[offset + 2] = (this.high >> 8) & 0xFF;
      bytes[offset + 3] = this.high & 0xFF;
      bytes[offset + 4] = (this.low >>> 24) & 0xFF;
      bytes[offset + 5] = (this.low >> 16) & 0xFF;
      bytes[offset + 6] = (this.low >> 8) & 0xFF;
      bytes[offset + 7] = this.low & 0xFF;
    },

    assign: function Word64_assign(word) {
      this.high = word.high;
      this.low = word.low;
    }
  };
  return Word64;
})();

var calculateSHA256 = (function calculateSHA256Closure() {
  function rotr(x, n) {
    return (x >>> n) | (x << 32 - n);
  }

  function ch(x, y, z) {
    return (x & y) ^ (~x & z);
  }

  function maj(x, y, z) {
    return (x & y) ^ (x & z) ^ (y & z);
  }

  function sigma(x) {
    return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
  }

  function sigmaPrime(x) {
    return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
  }

  function littleSigma(x) {
    return rotr(x, 7) ^ rotr(x, 18) ^ x >>> 3;
  }

  function littleSigmaPrime(x) {
    return rotr(x, 17) ^ rotr(x, 19) ^ x >>> 10;
  }

  var k = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
           0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
           0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
           0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
           0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
           0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
           0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
           0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
           0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
           0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
           0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
           0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
           0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
           0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
           0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
           0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];

  function hash(data, offset, length) {
    // initial hash values
    var h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372,
        h3 = 0xa54ff53a, h4 = 0x510e527f, h5 = 0x9b05688c,
        h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    // pre-processing
    var paddedLength = Math.ceil((length + 9) / 64) * 64;
    var padded = new Uint8Array(paddedLength);
    var i, j, n;
    for (i = 0; i < length; ++i) {
      padded[i] = data[offset++];
    }
    padded[i++] = 0x80;
    n = paddedLength - 8;
    while (i < n) {
      padded[i++] = 0;
    }
    padded[i++] = 0;
    padded[i++] = 0;
    padded[i++] = 0;
    padded[i++] = (length >>> 29) & 0xFF;
    padded[i++] = (length >> 21) & 0xFF;
    padded[i++] = (length >> 13) & 0xFF;
    padded[i++] = (length >> 5) & 0xFF;
    padded[i++] = (length << 3) & 0xFF;
    var w = new Uint32Array(64);
    // for each 512 bit block
    for (i = 0; i < paddedLength;) {
      for (j = 0; j < 16; ++j) {
        w[j] = (padded[i] << 24 | (padded[i + 1] << 16) |
               (padded[i + 2] << 8) | (padded[i + 3]));
        i += 4;
      }

      for (j = 16; j < 64; ++j) {
        w[j] = littleSigmaPrime(w[j - 2]) + w[j - 7] +
               littleSigma(w[j - 15]) + w[j - 16] | 0;
      }
      var a = h0, b = h1, c = h2, d = h3, e = h4,
          f = h5, g = h6, h = h7, t1, t2;
      for (j = 0; j < 64; ++j) {
        t1 = h + sigmaPrime(e) + ch(e, f, g) + k[j] + w[j];
        t2 = sigma(a) + maj(a, b, c);
        h = g;
        g = f;
        f = e;
        e = (d + t1) | 0;
        d = c;
        c = b;
        b = a;
        a = (t1 + t2) | 0;
      }
      h0 = (h0 + a) | 0;
      h1 = (h1 + b) | 0;
      h2 = (h2 + c) | 0;
      h3 = (h3 + d) | 0;
      h4 = (h4 + e) | 0;
      h5 = (h5 + f) | 0;
      h6 = (h6 + g) | 0;
      h7 = (h7 + h) | 0;
    }
    return new Uint8Array([
      (h0 >> 24) & 0xFF, (h0 >> 16) & 0xFF, (h0 >> 8) & 0xFF, (h0) & 0xFF,
      (h1 >> 24) & 0xFF, (h1 >> 16) & 0xFF, (h1 >> 8) & 0xFF, (h1) & 0xFF,
      (h2 >> 24) & 0xFF, (h2 >> 16) & 0xFF, (h2 >> 8) & 0xFF, (h2) & 0xFF,
      (h3 >> 24) & 0xFF, (h3 >> 16) & 0xFF, (h3 >> 8) & 0xFF, (h3) & 0xFF,
      (h4 >> 24) & 0xFF, (h4 >> 16) & 0xFF, (h4 >> 8) & 0xFF, (h4) & 0xFF,
      (h5 >> 24) & 0xFF, (h5 >> 16) & 0xFF, (h5 >> 8) & 0xFF, (h5) & 0xFF,
      (h6 >> 24) & 0xFF, (h6 >> 16) & 0xFF, (h6 >> 8) & 0xFF, (h6) & 0xFF,
      (h7 >> 24) & 0xFF, (h7 >> 16) & 0xFF, (h7 >> 8) & 0xFF, (h7) & 0xFF
    ]);
  }

  return hash;
})();

var calculateSHA512 = (function calculateSHA512Closure() {
  function ch(result, x, y, z, tmp) {
    result.assign(x);
    result.and(y);
    tmp.assign(x);
    tmp.not();
    tmp.and(z);
    result.xor(tmp);
  }

  function maj(result, x, y, z, tmp) {
    result.assign(x);
    result.and(y);
    tmp.assign(x);
    tmp.and(z);
    result.xor(tmp);
    tmp.assign(y);
    tmp.and(z);
    result.xor(tmp);
  }

  function sigma(result, x, tmp) {
    result.assign(x);
    result.rotateRight(28);
    tmp.assign(x);
    tmp.rotateRight(34);
    result.xor(tmp);
    tmp.assign(x);
    tmp.rotateRight(39);
    result.xor(tmp);
  }

  function sigmaPrime(result, x, tmp) {
    result.assign(x);
    result.rotateRight(14);
    tmp.assign(x);
    tmp.rotateRight(18);
    result.xor(tmp);
    tmp.assign(x);
    tmp.rotateRight(41);
    result.xor(tmp);
  }

  function littleSigma(result, x, tmp) {
    result.assign(x);
    result.rotateRight(1);
    tmp.assign(x);
    tmp.rotateRight(8);
    result.xor(tmp);
    tmp.assign(x);
    tmp.shiftRight(7);
    result.xor(tmp);
  }

  function littleSigmaPrime(result, x, tmp) {
    result.assign(x);
    result.rotateRight(19);
    tmp.assign(x);
    tmp.rotateRight(61);
    result.xor(tmp);
    tmp.assign(x);
    tmp.shiftRight(6);
    result.xor(tmp);
  }

  var k = [
    new Word64(0x428a2f98, 0xd728ae22), new Word64(0x71374491, 0x23ef65cd),
    new Word64(0xb5c0fbcf, 0xec4d3b2f), new Word64(0xe9b5dba5, 0x8189dbbc),
    new Word64(0x3956c25b, 0xf348b538), new Word64(0x59f111f1, 0xb605d019),
    new Word64(0x923f82a4, 0xaf194f9b), new Word64(0xab1c5ed5, 0xda6d8118),
    new Word64(0xd807aa98, 0xa3030242), new Word64(0x12835b01, 0x45706fbe),
    new Word64(0x243185be, 0x4ee4b28c), new Word64(0x550c7dc3, 0xd5ffb4e2),
    new Word64(0x72be5d74, 0xf27b896f), new Word64(0x80deb1fe, 0x3b1696b1),
    new Word64(0x9bdc06a7, 0x25c71235), new Word64(0xc19bf174, 0xcf692694),
    new Word64(0xe49b69c1, 0x9ef14ad2), new Word64(0xefbe4786, 0x384f25e3),
    new Word64(0x0fc19dc6, 0x8b8cd5b5), new Word64(0x240ca1cc, 0x77ac9c65),
    new Word64(0x2de92c6f, 0x592b0275), new Word64(0x4a7484aa, 0x6ea6e483),
    new Word64(0x5cb0a9dc, 0xbd41fbd4), new Word64(0x76f988da, 0x831153b5),
    new Word64(0x983e5152, 0xee66dfab), new Word64(0xa831c66d, 0x2db43210),
    new Word64(0xb00327c8, 0x98fb213f), new Word64(0xbf597fc7, 0xbeef0ee4),
    new Word64(0xc6e00bf3, 0x3da88fc2), new Word64(0xd5a79147, 0x930aa725),
    new Word64(0x06ca6351, 0xe003826f), new Word64(0x14292967, 0x0a0e6e70),
    new Word64(0x27b70a85, 0x46d22ffc), new Word64(0x2e1b2138, 0x5c26c926),
    new Word64(0x4d2c6dfc, 0x5ac42aed), new Word64(0x53380d13, 0x9d95b3df),
    new Word64(0x650a7354, 0x8baf63de), new Word64(0x766a0abb, 0x3c77b2a8),
    new Word64(0x81c2c92e, 0x47edaee6), new Word64(0x92722c85, 0x1482353b),
    new Word64(0xa2bfe8a1, 0x4cf10364), new Word64(0xa81a664b, 0xbc423001),
    new Word64(0xc24b8b70, 0xd0f89791), new Word64(0xc76c51a3, 0x0654be30),
    new Word64(0xd192e819, 0xd6ef5218), new Word64(0xd6990624, 0x5565a910),
    new Word64(0xf40e3585, 0x5771202a), new Word64(0x106aa070, 0x32bbd1b8),
    new Word64(0x19a4c116, 0xb8d2d0c8), new Word64(0x1e376c08, 0x5141ab53),
    new Word64(0x2748774c, 0xdf8eeb99), new Word64(0x34b0bcb5, 0xe19b48a8),
    new Word64(0x391c0cb3, 0xc5c95a63), new Word64(0x4ed8aa4a, 0xe3418acb),
    new Word64(0x5b9cca4f, 0x7763e373), new Word64(0x682e6ff3, 0xd6b2b8a3),
    new Word64(0x748f82ee, 0x5defb2fc), new Word64(0x78a5636f, 0x43172f60),
    new Word64(0x84c87814, 0xa1f0ab72), new Word64(0x8cc70208, 0x1a6439ec),
    new Word64(0x90befffa, 0x23631e28), new Word64(0xa4506ceb, 0xde82bde9),
    new Word64(0xbef9a3f7, 0xb2c67915), new Word64(0xc67178f2, 0xe372532b),
    new Word64(0xca273ece, 0xea26619c), new Word64(0xd186b8c7, 0x21c0c207),
    new Word64(0xeada7dd6, 0xcde0eb1e), new Word64(0xf57d4f7f, 0xee6ed178),
    new Word64(0x06f067aa, 0x72176fba), new Word64(0x0a637dc5, 0xa2c898a6),
    new Word64(0x113f9804, 0xbef90dae), new Word64(0x1b710b35, 0x131c471b),
    new Word64(0x28db77f5, 0x23047d84), new Word64(0x32caab7b, 0x40c72493),
    new Word64(0x3c9ebe0a, 0x15c9bebc), new Word64(0x431d67c4, 0x9c100d4c),
    new Word64(0x4cc5d4be, 0xcb3e42b6), new Word64(0x597f299c, 0xfc657e2a),
    new Word64(0x5fcb6fab, 0x3ad6faec), new Word64(0x6c44198c, 0x4a475817)];

  function hash(data, offset, length, mode384) {
    mode384 = !!mode384;
    // initial hash values
    var h0, h1, h2, h3, h4, h5, h6, h7;
    if (!mode384) {
      h0 = new Word64(0x6a09e667, 0xf3bcc908);
      h1 = new Word64(0xbb67ae85, 0x84caa73b);
      h2 = new Word64(0x3c6ef372, 0xfe94f82b);
      h3 = new Word64(0xa54ff53a, 0x5f1d36f1);
      h4 = new Word64(0x510e527f, 0xade682d1);
      h5 = new Word64(0x9b05688c, 0x2b3e6c1f);
      h6 = new Word64(0x1f83d9ab, 0xfb41bd6b);
      h7 = new Word64(0x5be0cd19, 0x137e2179);
    }
    else {
      // SHA384 is exactly the same
      // except with different starting values and a trimmed result
      h0 = new Word64(0xcbbb9d5d, 0xc1059ed8);
      h1 = new Word64(0x629a292a, 0x367cd507);
      h2 = new Word64(0x9159015a, 0x3070dd17);
      h3 = new Word64(0x152fecd8, 0xf70e5939);
      h4 = new Word64(0x67332667, 0xffc00b31);
      h5 = new Word64(0x8eb44a87, 0x68581511);
      h6 = new Word64(0xdb0c2e0d, 0x64f98fa7);
      h7 = new Word64(0x47b5481d, 0xbefa4fa4);
    }

    // pre-processing
    var paddedLength = Math.ceil((length + 17) / 128) * 128;
    var padded = new Uint8Array(paddedLength);
    var i, j, n;
    for (i = 0; i < length; ++i) {
      padded[i] = data[offset++];
    }
    padded[i++] = 0x80;
    n = paddedLength - 16;
    while (i < n) {
      padded[i++] = 0;
    }
    padded[i++] = 0;
    padded[i++] = 0;
    padded[i++] = 0;
    padded[i++] = 0;
    padded[i++] = 0;
    padded[i++] = 0;
    padded[i++] = 0;
    padded[i++] = 0;
    padded[i++] = 0;
    padded[i++] = 0;
    padded[i++] = 0;
    padded[i++] = (length >>> 29) & 0xFF;
    padded[i++] = (length >> 21) & 0xFF;
    padded[i++] = (length >> 13) & 0xFF;
    padded[i++] = (length >> 5) & 0xFF;
    padded[i++] = (length << 3) & 0xFF;

    var w = new Array(80);
    for (i = 0; i < 80; i++) {
      w[i] = new Word64(0, 0);
    }
    var a = new Word64(0, 0), b = new Word64(0, 0), c = new Word64(0, 0);
    var d = new Word64(0, 0), e = new Word64(0, 0), f = new Word64(0, 0);
    var g = new Word64(0, 0), h = new Word64(0, 0);
    var t1 = new Word64(0, 0), t2 = new Word64(0, 0);
    var tmp1 = new Word64(0, 0), tmp2 = new Word64(0, 0), tmp3;

    // for each 1024 bit block
    for (i = 0; i < paddedLength;) {
      for (j = 0; j < 16; ++j) {
        w[j].high = (padded[i] << 24) | (padded[i + 1] << 16) |
                    (padded[i + 2] << 8) | (padded[i + 3]);
        w[j].low = (padded[i + 4]) << 24 | (padded[i + 5]) << 16 |
                   (padded[i + 6]) << 8 | (padded[i + 7]);
        i += 8;
      }
      for (j = 16; j < 80; ++j) {
        tmp3 = w[j];
        littleSigmaPrime(tmp3, w[j - 2], tmp2);
        tmp3.add(w[j - 7]);
        littleSigma(tmp1, w[j - 15], tmp2);
        tmp3.add(tmp1);
        tmp3.add(w[j - 16]);
      }

      a.assign(h0); b.assign(h1); c.assign(h2); d.assign(h3);
      e.assign(h4); f.assign(h5); g.assign(h6); h.assign(h7);
      for (j = 0; j < 80; ++j) {
        t1.assign(h);
        sigmaPrime(tmp1, e, tmp2);
        t1.add(tmp1);
        ch(tmp1, e, f, g, tmp2);
        t1.add(tmp1);
        t1.add(k[j]);
        t1.add(w[j]);

        sigma(t2, a, tmp2);
        maj(tmp1, a, b, c, tmp2);
        t2.add(tmp1);

        tmp3 = h;
        h = g;
        g = f;
        f = e;
        d.add(t1);
        e = d;
        d = c;
        c = b;
        b = a;
        tmp3.assign(t1);
        tmp3.add(t2);
        a = tmp3;
      }
      h0.add(a);
      h1.add(b);
      h2.add(c);
      h3.add(d);
      h4.add(e);
      h5.add(f);
      h6.add(g);
      h7.add(h);
    }

    var result;
    if (!mode384) {
      result = new Uint8Array(64);
      h0.copyTo(result,0);
      h1.copyTo(result,8);
      h2.copyTo(result,16);
      h3.copyTo(result,24);
      h4.copyTo(result,32);
      h5.copyTo(result,40);
      h6.copyTo(result,48);
      h7.copyTo(result,56);
    }
    else {
      result = new Uint8Array(48);
      h0.copyTo(result,0);
      h1.copyTo(result,8);
      h2.copyTo(result,16);
      h3.copyTo(result,24);
      h4.copyTo(result,32);
      h5.copyTo(result,40);
    }
    return result;
  }

  return hash;
})();
var calculateSHA384 = (function calculateSHA384Closure() {
  function hash(data, offset, length) {
    return calculateSHA512(data, offset, length, true);
  }

  return hash;
})();
var NullCipher = (function NullCipherClosure() {
  function NullCipher() {
  }

  NullCipher.prototype = {
    decryptBlock: function NullCipher_decryptBlock(data) {
      return data;
    }
  };

  return NullCipher;
})();

var AES128Cipher = (function AES128CipherClosure() {
  var rcon = new Uint8Array([
    0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c,
    0xd8, 0xab, 0x4d, 0x9a, 0x2f, 0x5e, 0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a,
    0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5, 0x91, 0x39, 0x72, 0xe4, 0xd3, 0xbd,
    0x61, 0xc2, 0x9f, 0x25, 0x4a, 0x94, 0x33, 0x66, 0xcc, 0x83, 0x1d, 0x3a,
    0x74, 0xe8, 0xcb, 0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80,
    0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a, 0x2f, 0x5e, 0xbc, 0x63, 0xc6,
    0x97, 0x35, 0x6a, 0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5, 0x91, 0x39, 0x72,
    0xe4, 0xd3, 0xbd, 0x61, 0xc2, 0x9f, 0x25, 0x4a, 0x94, 0x33, 0x66, 0xcc,
    0x83, 0x1d, 0x3a, 0x74, 0xe8, 0xcb, 0x8d, 0x01, 0x02, 0x04, 0x08, 0x10,
    0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a, 0x2f, 0x5e,
    0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a, 0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5,
    0x91, 0x39, 0x72, 0xe4, 0xd3, 0xbd, 0x61, 0xc2, 0x9f, 0x25, 0x4a, 0x94,
    0x33, 0x66, 0xcc, 0x83, 0x1d, 0x3a, 0x74, 0xe8, 0xcb, 0x8d, 0x01, 0x02,
    0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d,
    0x9a, 0x2f, 0x5e, 0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a, 0xd4, 0xb3, 0x7d,
    0xfa, 0xef, 0xc5, 0x91, 0x39, 0x72, 0xe4, 0xd3, 0xbd, 0x61, 0xc2, 0x9f,
    0x25, 0x4a, 0x94, 0x33, 0x66, 0xcc, 0x83, 0x1d, 0x3a, 0x74, 0xe8, 0xcb,
    0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c,
    0xd8, 0xab, 0x4d, 0x9a, 0x2f, 0x5e, 0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a,
    0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5, 0x91, 0x39, 0x72, 0xe4, 0xd3, 0xbd,
    0x61, 0xc2, 0x9f, 0x25, 0x4a, 0x94, 0x33, 0x66, 0xcc, 0x83, 0x1d, 0x3a,
    0x74, 0xe8, 0xcb, 0x8d]);

  var s = new Uint8Array([
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b,
    0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0,
    0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26,
    0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2,
    0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0,
    0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed,
    0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f,
    0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5,
    0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec,
    0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14,
    0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c,
    0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d,
    0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f,
    0x4b, 0xbd, 0x8b, 0x8a, 0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e,
    0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11,
    0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f,
    0xb0, 0x54, 0xbb, 0x16]);

  var inv_s = new Uint8Array([
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e,
    0x81, 0xf3, 0xd7, 0xfb, 0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87,
    0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb, 0x54, 0x7b, 0x94, 0x32,
    0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49,
    0x6d, 0x8b, 0xd1, 0x25, 0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16,
    0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92, 0x6c, 0x70, 0x48, 0x50,
    0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05,
    0xb8, 0xb3, 0x45, 0x06, 0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02,
    0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b, 0x3a, 0x91, 0x11, 0x41,
    0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8,
    0x1c, 0x75, 0xdf, 0x6e, 0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89,
    0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b, 0xfc, 0x56, 0x3e, 0x4b,
    0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59,
    0x27, 0x80, 0xec, 0x5f, 0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d,
    0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef, 0xa0, 0xe0, 0x3b, 0x4d,
    0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63,
    0x55, 0x21, 0x0c, 0x7d]);
  var mixCol = new Uint8Array(256);
  for (var i = 0; i < 256; i++) {
    if (i < 128) {
      mixCol[i] = i << 1;
    } else {
      mixCol[i] = (i << 1) ^ 0x1b;
    }
  }
  var mix = new Uint32Array([
    0x00000000, 0x0e090d0b, 0x1c121a16, 0x121b171d, 0x3824342c, 0x362d3927,
    0x24362e3a, 0x2a3f2331, 0x70486858, 0x7e416553, 0x6c5a724e, 0x62537f45,
    0x486c5c74, 0x4665517f, 0x547e4662, 0x5a774b69, 0xe090d0b0, 0xee99ddbb,
    0xfc82caa6, 0xf28bc7ad, 0xd8b4e49c, 0xd6bde997, 0xc4a6fe8a, 0xcaaff381,
    0x90d8b8e8, 0x9ed1b5e3, 0x8ccaa2fe, 0x82c3aff5, 0xa8fc8cc4, 0xa6f581cf,
    0xb4ee96d2, 0xbae79bd9, 0xdb3bbb7b, 0xd532b670, 0xc729a16d, 0xc920ac66,
    0xe31f8f57, 0xed16825c, 0xff0d9541, 0xf104984a, 0xab73d323, 0xa57ade28,
    0xb761c935, 0xb968c43e, 0x9357e70f, 0x9d5eea04, 0x8f45fd19, 0x814cf012,
    0x3bab6bcb, 0x35a266c0, 0x27b971dd, 0x29b07cd6, 0x038f5fe7, 0x0d8652ec,
    0x1f9d45f1, 0x119448fa, 0x4be30393, 0x45ea0e98, 0x57f11985, 0x59f8148e,
    0x73c737bf, 0x7dce3ab4, 0x6fd52da9, 0x61dc20a2, 0xad766df6, 0xa37f60fd,
    0xb16477e0, 0xbf6d7aeb, 0x955259da, 0x9b5b54d1, 0x894043cc, 0x87494ec7,
    0xdd3e05ae, 0xd33708a5, 0xc12c1fb8, 0xcf2512b3, 0xe51a3182, 0xeb133c89,
    0xf9082b94, 0xf701269f, 0x4de6bd46, 0x43efb04d, 0x51f4a750, 0x5ffdaa5b,
    0x75c2896a, 0x7bcb8461, 0x69d0937c, 0x67d99e77, 0x3daed51e, 0x33a7d815,
    0x21bccf08, 0x2fb5c203, 0x058ae132, 0x0b83ec39, 0x1998fb24, 0x1791f62f,
    0x764dd68d, 0x7844db86, 0x6a5fcc9b, 0x6456c190, 0x4e69e2a1, 0x4060efaa,
    0x527bf8b7, 0x5c72f5bc, 0x0605bed5, 0x080cb3de, 0x1a17a4c3, 0x141ea9c8,
    0x3e218af9, 0x302887f2, 0x223390ef, 0x2c3a9de4, 0x96dd063d, 0x98d40b36,
    0x8acf1c2b, 0x84c61120, 0xaef93211, 0xa0f03f1a, 0xb2eb2807, 0xbce2250c,
    0xe6956e65, 0xe89c636e, 0xfa877473, 0xf48e7978, 0xdeb15a49, 0xd0b85742,
    0xc2a3405f, 0xccaa4d54, 0x41ecdaf7, 0x4fe5d7fc, 0x5dfec0e1, 0x53f7cdea,
    0x79c8eedb, 0x77c1e3d0, 0x65daf4cd, 0x6bd3f9c6, 0x31a4b2af, 0x3fadbfa4,
    0x2db6a8b9, 0x23bfa5b2, 0x09808683, 0x07898b88, 0x15929c95, 0x1b9b919e,
    0xa17c0a47, 0xaf75074c, 0xbd6e1051, 0xb3671d5a, 0x99583e6b, 0x97513360,
    0x854a247d, 0x8b432976, 0xd134621f, 0xdf3d6f14, 0xcd267809, 0xc32f7502,
    0xe9105633, 0xe7195b38, 0xf5024c25, 0xfb0b412e, 0x9ad7618c, 0x94de6c87,
    0x86c57b9a, 0x88cc7691, 0xa2f355a0, 0xacfa58ab, 0xbee14fb6, 0xb0e842bd,
    0xea9f09d4, 0xe49604df, 0xf68d13c2, 0xf8841ec9, 0xd2bb3df8, 0xdcb230f3,
    0xcea927ee, 0xc0a02ae5, 0x7a47b13c, 0x744ebc37, 0x6655ab2a, 0x685ca621,
    0x42638510, 0x4c6a881b, 0x5e719f06, 0x5078920d, 0x0a0fd964, 0x0406d46f,
    0x161dc372, 0x1814ce79, 0x322bed48, 0x3c22e043, 0x2e39f75e, 0x2030fa55,
    0xec9ab701, 0xe293ba0a, 0xf088ad17, 0xfe81a01c, 0xd4be832d, 0xdab78e26,
    0xc8ac993b, 0xc6a59430, 0x9cd2df59, 0x92dbd252, 0x80c0c54f, 0x8ec9c844,
    0xa4f6eb75, 0xaaffe67e, 0xb8e4f163, 0xb6edfc68, 0x0c0a67b1, 0x02036aba,
    0x10187da7, 0x1e1170ac, 0x342e539d, 0x3a275e96, 0x283c498b, 0x26354480,
    0x7c420fe9, 0x724b02e2, 0x605015ff, 0x6e5918f4, 0x44663bc5, 0x4a6f36ce,
    0x587421d3, 0x567d2cd8, 0x37a10c7a, 0x39a80171, 0x2bb3166c, 0x25ba1b67,
    0x0f853856, 0x018c355d, 0x13972240, 0x1d9e2f4b, 0x47e96422, 0x49e06929,
    0x5bfb7e34, 0x55f2733f, 0x7fcd500e, 0x71c45d05, 0x63df4a18, 0x6dd64713,
    0xd731dcca, 0xd938d1c1, 0xcb23c6dc, 0xc52acbd7, 0xef15e8e6, 0xe11ce5ed,
    0xf307f2f0, 0xfd0efffb, 0xa779b492, 0xa970b999, 0xbb6bae84, 0xb562a38f,
    0x9f5d80be, 0x91548db5, 0x834f9aa8, 0x8d4697a3]);

  function expandKey128(cipherKey) {
    var b = 176, result = new Uint8Array(b);
    result.set(cipherKey);
    for (var j = 16, i = 1; j < b; ++i) {
      // RotWord
      var t1 = result[j - 3], t2 = result[j - 2],
          t3 = result[j - 1], t4 = result[j - 4];
      // SubWord
      t1 = s[t1];
      t2 = s[t2];
      t3 = s[t3];
      t4 = s[t4];
      // Rcon
      t1 = t1 ^ rcon[i];
      for (var n = 0; n < 4; ++n) {
        result[j] = (t1 ^= result[j - 16]);
        j++;
        result[j] = (t2 ^= result[j - 16]);
        j++;
        result[j] = (t3 ^= result[j - 16]);
        j++;
        result[j] = (t4 ^= result[j - 16]);
        j++;
      }
    }
    return result;
  }

  function decrypt128(input, key) {
    var state = new Uint8Array(16);
    state.set(input);
    var i, j, k;
    var t, u, v;
    // AddRoundKey
    for (j = 0, k = 160; j < 16; ++j, ++k) {
      state[j] ^= key[k];
    }
    for (i = 9; i >= 1; --i) {
      // InvShiftRows
      t = state[13];
      state[13] = state[9];
      state[9] = state[5];
      state[5] = state[1];
      state[1] = t;
      t = state[14];
      u = state[10];
      state[14] = state[6];
      state[10] = state[2];
      state[6] = t;
      state[2] = u;
      t = state[15];
      u = state[11];
      v = state[7];
      state[15] = state[3];
      state[11] = t;
      state[7] = u;
      state[3] = v;
      // InvSubBytes
      for (j = 0; j < 16; ++j) {
        state[j] = inv_s[state[j]];
      }
      // AddRoundKey
      for (j = 0, k = i * 16; j < 16; ++j, ++k) {
        state[j] ^= key[k];
      }
      // InvMixColumns
      for (j = 0; j < 16; j += 4) {
        var s0 = mix[state[j]], s1 = mix[state[j + 1]],
          s2 = mix[state[j + 2]], s3 = mix[state[j + 3]];
        t = (s0 ^ (s1 >>> 8) ^ (s1 << 24) ^ (s2 >>> 16) ^ (s2 << 16) ^
          (s3 >>> 24) ^ (s3 << 8));
        state[j] = (t >>> 24) & 0xFF;
        state[j + 1] = (t >> 16) & 0xFF;
        state[j + 2] = (t >> 8) & 0xFF;
        state[j + 3] = t & 0xFF;
      }
    }
    // InvShiftRows
    t = state[13];
    state[13] = state[9];
    state[9] = state[5];
    state[5] = state[1];
    state[1] = t;
    t = state[14];
    u = state[10];
    state[14] = state[6];
    state[10] = state[2];
    state[6] = t;
    state[2] = u;
    t = state[15];
    u = state[11];
    v = state[7];
    state[15] = state[3];
    state[11] = t;
    state[7] = u;
    state[3] = v;
    for (j = 0; j < 16; ++j) {
      // InvSubBytes
      state[j] = inv_s[state[j]];
      // AddRoundKey
      state[j] ^= key[j];
    }
    return state;
  }

  function encrypt128(input, key) {
    var t, u, v, k;
    var state = new Uint8Array(16);
    state.set(input);
    for (j = 0; j < 16; ++j) {
      // AddRoundKey
      state[j] ^= key[j];
    }

    for (i = 1; i < 10; i++) {
      //SubBytes
      for (j = 0; j < 16; ++j) {
        state[j] = s[state[j]];
      }
      //ShiftRows
      v = state[1];
      state[1] = state[5];
      state[5] = state[9];
      state[9] = state[13];
      state[13] = v;
      v = state[2];
      u = state[6];
      state[2] = state[10];
      state[6] = state[14];
      state[10] = v;
      state[14] = u;
      v = state[3];
      u = state[7];
      t = state[11];
      state[3] = state[15];
      state[7] = v;
      state[11] = u;
      state[15] = t;
      //MixColumns
      for (var j = 0; j < 16; j += 4) {
        var s0 = state[j + 0], s1 = state[j + 1];
        var s2 = state[j + 2], s3 = state[j + 3];
        t = s0 ^ s1 ^ s2 ^ s3;
        state[j + 0] ^= t ^ mixCol[s0 ^ s1];
        state[j + 1] ^= t ^ mixCol[s1 ^ s2];
        state[j + 2] ^= t ^ mixCol[s2 ^ s3];
        state[j + 3] ^= t ^ mixCol[s3 ^ s0];
      }
      //AddRoundKey
      for (j = 0, k = i * 16; j < 16; ++j, ++k) {
        state[j] ^= key[k];
      }
    }

    //SubBytes
    for (j = 0; j < 16; ++j) {
      state[j] = s[state[j]];
    }
    //ShiftRows
    v = state[1];
    state[1] = state[5];
    state[5] = state[9];
    state[9] = state[13];
    state[13] = v;
    v = state[2];
    u = state[6];
    state[2] = state[10];
    state[6] = state[14];
    state[10] = v;
    state[14] = u;
    v = state[3];
    u = state[7];
    t = state[11];
    state[3] = state[15];
    state[7] = v;
    state[11] = u;
    state[15] = t;
    //AddRoundKey
    for (j = 0, k = 160; j < 16; ++j, ++k) {
      state[j] ^= key[k];
    }
    return state;
  }

  function AES128Cipher(key) {
    this.key = expandKey128(key);
    this.buffer = new Uint8Array(16);
    this.bufferPosition = 0;
  }

  function decryptBlock2(data, finalize) {
    var i, j, ii, sourceLength = data.length,
        buffer = this.buffer, bufferLength = this.bufferPosition,
        result = [], iv = this.iv;
    for (i = 0; i < sourceLength; ++i) {
      buffer[bufferLength] = data[i];
      ++bufferLength;
      if (bufferLength < 16) {
        continue;
      }
      // buffer is full, decrypting
      var plain = decrypt128(buffer, this.key);
      // xor-ing the IV vector to get plain text
      for (j = 0; j < 16; ++j) {
        plain[j] ^= iv[j];
      }
      iv = buffer;
      result.push(plain);
      buffer = new Uint8Array(16);
      bufferLength = 0;
    }
    // saving incomplete buffer
    this.buffer = buffer;
    this.bufferLength = bufferLength;
    this.iv = iv;
    if (result.length === 0) {
      return new Uint8Array([]);
    }
    // combining plain text blocks into one
    var outputLength = 16 * result.length;
    if (finalize) {
      // undo a padding that is described in RFC 2898
      var lastBlock = result[result.length - 1];
      var psLen = lastBlock[15];
      if (psLen <= 16) {
        for (i = 15, ii = 16 - psLen; i >= ii; --i) {
          if (lastBlock[i] !== psLen) {
            // Invalid padding, assume that the block has no padding.
            psLen = 0;
            break;
          }
        }
        outputLength -= psLen;
        result[result.length - 1] = lastBlock.subarray(0, 16 - psLen);
      }
    }
    var output = new Uint8Array(outputLength);
    for (i = 0, j = 0, ii = result.length; i < ii; ++i, j += 16) {
      output.set(result[i], j);
    }
    return output;
  }

  AES128Cipher.prototype = {
    decryptBlock: function AES128Cipher_decryptBlock(data, finalize) {
      var i, sourceLength = data.length;
      var buffer = this.buffer, bufferLength = this.bufferPosition;
      // waiting for IV values -- they are at the start of the stream
      for (i = 0; bufferLength < 16 && i < sourceLength; ++i, ++bufferLength) {
        buffer[bufferLength] = data[i];
      }
      if (bufferLength < 16) {
        // need more data
        this.bufferLength = bufferLength;
        return new Uint8Array([]);
      }
      this.iv = buffer;
      this.buffer = new Uint8Array(16);
      this.bufferLength = 0;
      // starting decryption
      this.decryptBlock = decryptBlock2;
      return this.decryptBlock(data.subarray(16), finalize);
    },
    encrypt: function AES128Cipher_encrypt(data, iv) {
      var i, j, ii, sourceLength = data.length,
          buffer = this.buffer, bufferLength = this.bufferPosition,
          result = [];
      if (!iv) {
        iv = new Uint8Array(16);
      }
      for (i = 0; i < sourceLength; ++i) {
        buffer[bufferLength] = data[i];
        ++bufferLength;
        if (bufferLength < 16) {
          continue;
        }
        for (j = 0; j < 16; ++j) {
          buffer[j] ^= iv[j];
        }

        // buffer is full, encrypting
        var cipher = encrypt128(buffer, this.key);
        iv = cipher;
        result.push(cipher);
        buffer = new Uint8Array(16);
        bufferLength = 0;
      }
      // saving incomplete buffer
      this.buffer = buffer;
      this.bufferLength = bufferLength;
      this.iv = iv;
      if (result.length === 0) {
        return new Uint8Array([]);
      }
      // combining plain text blocks into one
      var outputLength = 16 * result.length;
      var output = new Uint8Array(outputLength);
      for (i = 0, j = 0, ii = result.length; i < ii; ++i, j += 16) {
        output.set(result[i], j);
      }
      return output;
    }
  };

  return AES128Cipher;
})();

var AES256Cipher = (function AES256CipherClosure() {
  var rcon = new Uint8Array([
    0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c,
    0xd8, 0xab, 0x4d, 0x9a, 0x2f, 0x5e, 0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a,
    0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5, 0x91, 0x39, 0x72, 0xe4, 0xd3, 0xbd,
    0x61, 0xc2, 0x9f, 0x25, 0x4a, 0x94, 0x33, 0x66, 0xcc, 0x83, 0x1d, 0x3a,
    0x74, 0xe8, 0xcb, 0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80,
    0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a, 0x2f, 0x5e, 0xbc, 0x63, 0xc6,
    0x97, 0x35, 0x6a, 0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5, 0x91, 0x39, 0x72,
    0xe4, 0xd3, 0xbd, 0x61, 0xc2, 0x9f, 0x25, 0x4a, 0x94, 0x33, 0x66, 0xcc,
    0x83, 0x1d, 0x3a, 0x74, 0xe8, 0xcb, 0x8d, 0x01, 0x02, 0x04, 0x08, 0x10,
    0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a, 0x2f, 0x5e,
    0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a, 0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5,
    0x91, 0x39, 0x72, 0xe4, 0xd3, 0xbd, 0x61, 0xc2, 0x9f, 0x25, 0x4a, 0x94,
    0x33, 0x66, 0xcc, 0x83, 0x1d, 0x3a, 0x74, 0xe8, 0xcb, 0x8d, 0x01, 0x02,
    0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d,
    0x9a, 0x2f, 0x5e, 0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a, 0xd4, 0xb3, 0x7d,
    0xfa, 0xef, 0xc5, 0x91, 0x39, 0x72, 0xe4, 0xd3, 0xbd, 0x61, 0xc2, 0x9f,
    0x25, 0x4a, 0x94, 0x33, 0x66, 0xcc, 0x83, 0x1d, 0x3a, 0x74, 0xe8, 0xcb,
    0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c,
    0xd8, 0xab, 0x4d, 0x9a, 0x2f, 0x5e, 0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a,
    0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5, 0x91, 0x39, 0x72, 0xe4, 0xd3, 0xbd,
    0x61, 0xc2, 0x9f, 0x25, 0x4a, 0x94, 0x33, 0x66, 0xcc, 0x83, 0x1d, 0x3a,
    0x74, 0xe8, 0xcb, 0x8d]);

  var s = new Uint8Array([
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b,
    0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0,
    0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26,
    0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2,
    0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0,
    0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed,
    0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f,
    0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5,
    0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec,
    0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14,
    0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c,
    0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d,
    0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f,
    0x4b, 0xbd, 0x8b, 0x8a, 0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e,
    0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11,
    0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f,
    0xb0, 0x54, 0xbb, 0x16]);

  var inv_s = new Uint8Array([
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e,
    0x81, 0xf3, 0xd7, 0xfb, 0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87,
    0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb, 0x54, 0x7b, 0x94, 0x32,
    0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49,
    0x6d, 0x8b, 0xd1, 0x25, 0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16,
    0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92, 0x6c, 0x70, 0x48, 0x50,
    0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05,
    0xb8, 0xb3, 0x45, 0x06, 0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02,
    0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b, 0x3a, 0x91, 0x11, 0x41,
    0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8,
    0x1c, 0x75, 0xdf, 0x6e, 0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89,
    0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b, 0xfc, 0x56, 0x3e, 0x4b,
    0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59,
    0x27, 0x80, 0xec, 0x5f, 0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d,
    0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef, 0xa0, 0xe0, 0x3b, 0x4d,
    0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63,
    0x55, 0x21, 0x0c, 0x7d]);

  var mixCol = new Uint8Array(256);
  for (var i = 0; i < 256; i++) {
    if (i < 128) {
      mixCol[i] = i << 1;
    } else {
      mixCol[i] = (i << 1) ^ 0x1b;
    }
  }
  var mix = new Uint32Array([
    0x00000000, 0x0e090d0b, 0x1c121a16, 0x121b171d, 0x3824342c, 0x362d3927,
    0x24362e3a, 0x2a3f2331, 0x70486858, 0x7e416553, 0x6c5a724e, 0x62537f45,
    0x486c5c74, 0x4665517f, 0x547e4662, 0x5a774b69, 0xe090d0b0, 0xee99ddbb,
    0xfc82caa6, 0xf28bc7ad, 0xd8b4e49c, 0xd6bde997, 0xc4a6fe8a, 0xcaaff381,
    0x90d8b8e8, 0x9ed1b5e3, 0x8ccaa2fe, 0x82c3aff5, 0xa8fc8cc4, 0xa6f581cf,
    0xb4ee96d2, 0xbae79bd9, 0xdb3bbb7b, 0xd532b670, 0xc729a16d, 0xc920ac66,
    0xe31f8f57, 0xed16825c, 0xff0d9541, 0xf104984a, 0xab73d323, 0xa57ade28,
    0xb761c935, 0xb968c43e, 0x9357e70f, 0x9d5eea04, 0x8f45fd19, 0x814cf012,
    0x3bab6bcb, 0x35a266c0, 0x27b971dd, 0x29b07cd6, 0x038f5fe7, 0x0d8652ec,
    0x1f9d45f1, 0x119448fa, 0x4be30393, 0x45ea0e98, 0x57f11985, 0x59f8148e,
    0x73c737bf, 0x7dce3ab4, 0x6fd52da9, 0x61dc20a2, 0xad766df6, 0xa37f60fd,
    0xb16477e0, 0xbf6d7aeb, 0x955259da, 0x9b5b54d1, 0x894043cc, 0x87494ec7,
    0xdd3e05ae, 0xd33708a5, 0xc12c1fb8, 0xcf2512b3, 0xe51a3182, 0xeb133c89,
    0xf9082b94, 0xf701269f, 0x4de6bd46, 0x43efb04d, 0x51f4a750, 0x5ffdaa5b,
    0x75c2896a, 0x7bcb8461, 0x69d0937c, 0x67d99e77, 0x3daed51e, 0x33a7d815,
    0x21bccf08, 0x2fb5c203, 0x058ae132, 0x0b83ec39, 0x1998fb24, 0x1791f62f,
    0x764dd68d, 0x7844db86, 0x6a5fcc9b, 0x6456c190, 0x4e69e2a1, 0x4060efaa,
    0x527bf8b7, 0x5c72f5bc, 0x0605bed5, 0x080cb3de, 0x1a17a4c3, 0x141ea9c8,
    0x3e218af9, 0x302887f2, 0x223390ef, 0x2c3a9de4, 0x96dd063d, 0x98d40b36,
    0x8acf1c2b, 0x84c61120, 0xaef93211, 0xa0f03f1a, 0xb2eb2807, 0xbce2250c,
    0xe6956e65, 0xe89c636e, 0xfa877473, 0xf48e7978, 0xdeb15a49, 0xd0b85742,
    0xc2a3405f, 0xccaa4d54, 0x41ecdaf7, 0x4fe5d7fc, 0x5dfec0e1, 0x53f7cdea,
    0x79c8eedb, 0x77c1e3d0, 0x65daf4cd, 0x6bd3f9c6, 0x31a4b2af, 0x3fadbfa4,
    0x2db6a8b9, 0x23bfa5b2, 0x09808683, 0x07898b88, 0x15929c95, 0x1b9b919e,
    0xa17c0a47, 0xaf75074c, 0xbd6e1051, 0xb3671d5a, 0x99583e6b, 0x97513360,
    0x854a247d, 0x8b432976, 0xd134621f, 0xdf3d6f14, 0xcd267809, 0xc32f7502,
    0xe9105633, 0xe7195b38, 0xf5024c25, 0xfb0b412e, 0x9ad7618c, 0x94de6c87,
    0x86c57b9a, 0x88cc7691, 0xa2f355a0, 0xacfa58ab, 0xbee14fb6, 0xb0e842bd,
    0xea9f09d4, 0xe49604df, 0xf68d13c2, 0xf8841ec9, 0xd2bb3df8, 0xdcb230f3,
    0xcea927ee, 0xc0a02ae5, 0x7a47b13c, 0x744ebc37, 0x6655ab2a, 0x685ca621,
    0x42638510, 0x4c6a881b, 0x5e719f06, 0x5078920d, 0x0a0fd964, 0x0406d46f,
    0x161dc372, 0x1814ce79, 0x322bed48, 0x3c22e043, 0x2e39f75e, 0x2030fa55,
    0xec9ab701, 0xe293ba0a, 0xf088ad17, 0xfe81a01c, 0xd4be832d, 0xdab78e26,
    0xc8ac993b, 0xc6a59430, 0x9cd2df59, 0x92dbd252, 0x80c0c54f, 0x8ec9c844,
    0xa4f6eb75, 0xaaffe67e, 0xb8e4f163, 0xb6edfc68, 0x0c0a67b1, 0x02036aba,
    0x10187da7, 0x1e1170ac, 0x342e539d, 0x3a275e96, 0x283c498b, 0x26354480,
    0x7c420fe9, 0x724b02e2, 0x605015ff, 0x6e5918f4, 0x44663bc5, 0x4a6f36ce,
    0x587421d3, 0x567d2cd8, 0x37a10c7a, 0x39a80171, 0x2bb3166c, 0x25ba1b67,
    0x0f853856, 0x018c355d, 0x13972240, 0x1d9e2f4b, 0x47e96422, 0x49e06929,
    0x5bfb7e34, 0x55f2733f, 0x7fcd500e, 0x71c45d05, 0x63df4a18, 0x6dd64713,
    0xd731dcca, 0xd938d1c1, 0xcb23c6dc, 0xc52acbd7, 0xef15e8e6, 0xe11ce5ed,
    0xf307f2f0, 0xfd0efffb, 0xa779b492, 0xa970b999, 0xbb6bae84, 0xb562a38f,
    0x9f5d80be, 0x91548db5, 0x834f9aa8, 0x8d4697a3]);

  function expandKey256(cipherKey) {
    var b = 240, result = new Uint8Array(b);
    var r = 1;

    result.set(cipherKey);
    for (var j = 32, i = 1; j < b; ++i) {
      if (j % 32 === 16) {
        t1 = s[t1];
        t2 = s[t2];
        t3 = s[t3];
        t4 = s[t4];
      } else if (j % 32 === 0) {
        // RotWord
        var t1 = result[j - 3], t2 = result[j - 2],
          t3 = result[j - 1], t4 = result[j - 4];
        // SubWord
        t1 = s[t1];
        t2 = s[t2];
        t3 = s[t3];
        t4 = s[t4];
        // Rcon
        t1 = t1 ^ r;
        if ((r <<= 1) >= 256) {
          r = (r ^ 0x1b) & 0xFF;
        }
      }

      for (var n = 0; n < 4; ++n) {
        result[j] = (t1 ^= result[j - 32]);
        j++;
        result[j] = (t2 ^= result[j - 32]);
        j++;
        result[j] = (t3 ^= result[j - 32]);
        j++;
        result[j] = (t4 ^= result[j - 32]);
        j++;
      }
    }
    return result;
  }

  function decrypt256(input, key) {
    var state = new Uint8Array(16);
    state.set(input);
    var i, j, k;
    var t, u, v;
    // AddRoundKey
    for (j = 0, k = 224; j < 16; ++j, ++k) {
      state[j] ^= key[k];
    }
    for (i = 13; i >= 1; --i) {
      // InvShiftRows
      t = state[13];
      state[13] = state[9];
      state[9] = state[5];
      state[5] = state[1];
      state[1] = t;
      t = state[14];
      u = state[10];
      state[14] = state[6];
      state[10] = state[2];
      state[6] = t;
      state[2] = u;
      t = state[15];
      u = state[11];
      v = state[7];
      state[15] = state[3];
      state[11] = t;
      state[7] = u;
      state[3] = v;
      // InvSubBytes
      for (j = 0; j < 16; ++j) {
        state[j] = inv_s[state[j]];
      }
      // AddRoundKey
      for (j = 0, k = i * 16; j < 16; ++j, ++k) {
        state[j] ^= key[k];
      }
      // InvMixColumns
      for (j = 0; j < 16; j += 4) {
        var s0 = mix[state[j]], s1 = mix[state[j + 1]],
            s2 = mix[state[j + 2]], s3 = mix[state[j + 3]];
        t = (s0 ^ (s1 >>> 8) ^ (s1 << 24) ^ (s2 >>> 16) ^ (s2 << 16) ^
            (s3 >>> 24) ^ (s3 << 8));
        state[j] = (t >>> 24) & 0xFF;
        state[j + 1] = (t >> 16) & 0xFF;
        state[j + 2] = (t >> 8) & 0xFF;
        state[j + 3] = t & 0xFF;
      }
    }
    // InvShiftRows
    t = state[13];
    state[13] = state[9];
    state[9] = state[5];
    state[5] = state[1];
    state[1] = t;
    t = state[14];
    u = state[10];
    state[14] = state[6];
    state[10] = state[2];
    state[6] = t;
    state[2] = u;
    t = state[15];
    u = state[11];
    v = state[7];
    state[15] = state[3];
    state[11] = t;
    state[7] = u;
    state[3] = v;
    for (j = 0; j < 16; ++j) {
      // InvSubBytes
      state[j] = inv_s[state[j]];
      // AddRoundKey
      state[j] ^= key[j];
    }
    return state;
  }

  function encrypt256(input, key) {
    var t, u, v, k;
    var state = new Uint8Array(16);
    state.set(input);
    for (j = 0; j < 16; ++j) {
      // AddRoundKey
      state[j] ^= key[j];
    }

    for (i = 1; i < 14; i++) {
      //SubBytes
      for (j = 0; j < 16; ++j) {
        state[j] = s[state[j]];
      }
      //ShiftRows
      v = state[1];
      state[1] = state[5];
      state[5] = state[9];
      state[9] = state[13];
      state[13] = v;
      v = state[2];
      u = state[6];
      state[2] = state[10];
      state[6] = state[14];
      state[10] = v;
      state[14] = u;
      v = state[3];
      u = state[7];
      t = state[11];
      state[3] = state[15];
      state[7] = v;
      state[11] = u;
      state[15] = t;
      //MixColumns
      for (var j = 0; j < 16; j += 4) {
        var s0 = state[j + 0], s1 = state[j + 1];
        var s2 = state[j + 2], s3 = state[j + 3];
        t = s0 ^ s1 ^ s2 ^ s3;
        state[j + 0] ^= t ^ mixCol[s0 ^ s1];
        state[j + 1] ^= t ^ mixCol[s1 ^ s2];
        state[j + 2] ^= t ^ mixCol[s2 ^ s3];
        state[j + 3] ^= t ^ mixCol[s3 ^ s0];
      }
      //AddRoundKey
      for (j = 0, k = i * 16; j < 16; ++j, ++k) {
        state[j] ^= key[k];
      }
    }

    //SubBytes
    for (j = 0; j < 16; ++j) {
      state[j] = s[state[j]];
    }
    //ShiftRows
    v = state[1];
    state[1] = state[5];
    state[5] = state[9];
    state[9] = state[13];
    state[13] = v;
    v = state[2];
    u = state[6];
    state[2] = state[10];
    state[6] = state[14];
    state[10] = v;
    state[14] = u;
    v = state[3];
    u = state[7];
    t = state[11];
    state[3] = state[15];
    state[7] = v;
    state[11] = u;
    state[15] = t;
    //AddRoundKey
    for (j = 0, k = 224; j < 16; ++j, ++k) {
      state[j] ^= key[k];
    }

    return state;

  }

  function AES256Cipher(key) {
    this.key = expandKey256(key);
    this.buffer = new Uint8Array(16);
    this.bufferPosition = 0;
  }

  function decryptBlock2(data, finalize) {
    var i, j, ii, sourceLength = data.length,
        buffer = this.buffer, bufferLength = this.bufferPosition,
        result = [], iv = this.iv;

    for (i = 0; i < sourceLength; ++i) {
      buffer[bufferLength] = data[i];
      ++bufferLength;
      if (bufferLength < 16) {
        continue;
      }
      // buffer is full, decrypting
      var plain = decrypt256(buffer, this.key);
      // xor-ing the IV vector to get plain text
      for (j = 0; j < 16; ++j) {
        plain[j] ^= iv[j];
      }
      iv = buffer;
      result.push(plain);
      buffer = new Uint8Array(16);
      bufferLength = 0;
    }
    // saving incomplete buffer
    this.buffer = buffer;
    this.bufferLength = bufferLength;
    this.iv = iv;
    if (result.length === 0) {
      return new Uint8Array([]);
    }
    // combining plain text blocks into one
    var outputLength = 16 * result.length;
    if (finalize) {
      // undo a padding that is described in RFC 2898
      var lastBlock = result[result.length - 1];
      var psLen = lastBlock[15];
      if (psLen <= 16) {
        for (i = 15, ii = 16 - psLen; i >= ii; --i) {
          if (lastBlock[i] !== psLen) {
            // Invalid padding, assume that the block has no padding.
            psLen = 0;
            break;
          }
        }
        outputLength -= psLen;
        result[result.length - 1] = lastBlock.subarray(0, 16 - psLen);
      }
    }
    var output = new Uint8Array(outputLength);
    for (i = 0, j = 0, ii = result.length; i < ii; ++i, j += 16) {
      output.set(result[i], j);
    }
    return output;

  }

  AES256Cipher.prototype = {
    decryptBlock: function AES256Cipher_decryptBlock(data, finalize, iv) {
      var i, sourceLength = data.length;
      var buffer = this.buffer, bufferLength = this.bufferPosition;
      // if not supplied an IV wait for IV values
      // they are at the start of the stream
      if (iv) {
        this.iv = iv;
      } else {
        for (i = 0; bufferLength < 16 &&
             i < sourceLength; ++i, ++bufferLength) {
          buffer[bufferLength] = data[i];
        }
        if (bufferLength < 16) {
          //need more data
          this.bufferLength = bufferLength;
          return new Uint8Array([]);
        }
        this.iv = buffer;
        data = data.subarray(16);
      }
      this.buffer = new Uint8Array(16);
      this.bufferLength = 0;
      // starting decryption
      this.decryptBlock = decryptBlock2;
      return this.decryptBlock(data, finalize);
    },
    encrypt: function AES256Cipher_encrypt(data, iv) {
      var i, j, ii, sourceLength = data.length,
          buffer = this.buffer, bufferLength = this.bufferPosition,
          result = [];
      if (!iv) {
        iv = new Uint8Array(16);
      }
      for (i = 0; i < sourceLength; ++i) {
        buffer[bufferLength] = data[i];
        ++bufferLength;
        if (bufferLength < 16) {
          continue;
        }
        for (j = 0; j < 16; ++j) {
          buffer[j] ^= iv[j];
        }

        // buffer is full, encrypting
        var cipher = encrypt256(buffer, this.key);
        this.iv = cipher;
        result.push(cipher);
        buffer = new Uint8Array(16);
        bufferLength = 0;
      }
      // saving incomplete buffer
      this.buffer = buffer;
      this.bufferLength = bufferLength;
      this.iv = iv;
      if (result.length === 0) {
        return new Uint8Array([]);
      }
      // combining plain text blocks into one
      var outputLength = 16 * result.length;
      var output = new Uint8Array(outputLength);
      for (i = 0, j = 0, ii = result.length; i < ii; ++i, j += 16) {
        output.set(result[i], j);
      }
      return output;
    }
  };

  return AES256Cipher;
})();

var PDF17 = (function PDF17Closure() {

  function compareByteArrays(array1, array2) {
    if (array1.length !== array2.length) {
      return false;
    }
    for (var i = 0; i < array1.length; i++) {
      if (array1[i] !== array2[i]) {
        return false;
      }
    }
    return true;
  }

  function PDF17() {
  }

  PDF17.prototype = {
    checkOwnerPassword: function PDF17_checkOwnerPassword(password,
                                                          ownerValidationSalt,
                                                          userBytes,
                                                          ownerPassword) {
      var hashData = new Uint8Array(password.length + 56);
      hashData.set(password, 0);
      hashData.set(ownerValidationSalt, password.length);
      hashData.set(userBytes, password.length + ownerValidationSalt.length);
      var result = calculateSHA256(hashData, 0, hashData.length);
      return compareByteArrays(result, ownerPassword);
    },
    checkUserPassword: function PDF17_checkUserPassword(password,
                                                        userValidationSalt,
                                                        userPassword) {
      var hashData = new Uint8Array(password.length + 8);
      hashData.set(password, 0);
      hashData.set(userValidationSalt, password.length);
      var result = calculateSHA256(hashData, 0, hashData.length);
      return compareByteArrays(result, userPassword);
    },
    getOwnerKey: function PDF17_getOwnerKey(password, ownerKeySalt, userBytes,
                                            ownerEncryption) {
      var hashData = new Uint8Array(password.length + 56);
      hashData.set(password, 0);
      hashData.set(ownerKeySalt, password.length);
      hashData.set(userBytes, password.length + ownerKeySalt.length);
      var key = calculateSHA256(hashData, 0, hashData.length);
      var cipher = new AES256Cipher(key);
      return cipher.decryptBlock(ownerEncryption,
                                 false,
                                 new Uint8Array(16));

    },
    getUserKey: function PDF17_getUserKey(password, userKeySalt,
                                          userEncryption) {
      var hashData = new Uint8Array(password.length + 8);
      hashData.set(password, 0);
      hashData.set(userKeySalt, password.length);
      //key is the decryption key for the UE string
      var key = calculateSHA256(hashData, 0, hashData.length);
      var cipher = new AES256Cipher(key);
      return cipher.decryptBlock(userEncryption,
                                 false,
                                 new Uint8Array(16));
    }
  };
  return PDF17;
})();

var PDF20 = (function PDF20Closure() {

  function concatArrays(array1, array2) {
    var t = new Uint8Array(array1.length + array2.length);
    t.set(array1, 0);
    t.set(array2, array1.length);
    return t;
  }

  function calculatePDF20Hash(password, input, userBytes) {
    //This refers to Algorithm 2.B as defined in ISO 32000-2
    var k = calculateSHA256(input, 0, input.length).subarray(0, 32);
    var e = [0];
    var i = 0;
    while (i < 64 || e[e.length - 1] > i - 32) {
      var arrayLength = password.length + k.length + userBytes.length;

      var k1 = new Uint8Array(arrayLength * 64);
      var array = concatArrays(password, k);
      array = concatArrays(array, userBytes);
      for (var j = 0, pos = 0; j < 64; j++, pos += arrayLength) {
        k1.set(array, pos);
      }
      //AES128 CBC NO PADDING with
      //first 16 bytes of k as the key and the second 16 as the iv.
      var cipher = new AES128Cipher(k.subarray(0, 16));
      e = cipher.encrypt(k1, k.subarray(16, 32));
      //Now we have to take the first 16 bytes of an unsigned
      //big endian integer... and compute the remainder
      //modulo 3.... That is a fairly large number and
      //JavaScript isn't going to handle that well...
      //So we're using a trick that allows us to perform
      //modulo math byte by byte
      var remainder = 0;
      for (var z = 0; z < 16; z++) {
        remainder *= (256 % 3);
        remainder %= 3;
        remainder += ((e[z] >>> 0) % 3);
        remainder %= 3;
      }
      if (remainder === 0) {
        k = calculateSHA256(e, 0, e.length);
      }
      else if (remainder === 1) {
        k = calculateSHA384(e, 0, e.length);
      }
      else if (remainder === 2) {
        k = calculateSHA512(e, 0, e.length);
      }
      i++;
    }
    return k.subarray(0, 32);
  }

  function PDF20() {
  }

  function compareByteArrays(array1, array2) {
    if (array1.length !== array2.length) {
      return false;
    }
    for (var i = 0; i < array1.length; i++) {
      if (array1[i] !== array2[i]) {
        return false;
      }
    }
    return true;
  }

  PDF20.prototype = {
    hash: function PDF20_hash(password, concatBytes, userBytes) {
      return calculatePDF20Hash(password, concatBytes, userBytes);
    },
    checkOwnerPassword: function PDF20_checkOwnerPassword(password,
                                                          ownerValidationSalt,
                                                          userBytes,
                                                          ownerPassword) {
      var hashData = new Uint8Array(password.length + 56);
      hashData.set(password, 0);
      hashData.set(ownerValidationSalt, password.length);
      hashData.set(userBytes, password.length + ownerValidationSalt.length);
      var result = calculatePDF20Hash(password, hashData, userBytes);
      return compareByteArrays(result, ownerPassword);
    },
    checkUserPassword: function PDF20_checkUserPassword(password,
                                                        userValidationSalt,
                                                        userPassword) {
      var hashData = new Uint8Array(password.length + 8);
      hashData.set(password, 0);
      hashData.set(userValidationSalt, password.length);
      var result = calculatePDF20Hash(password, hashData, []);
      return compareByteArrays(result, userPassword);
    },
    getOwnerKey: function PDF20_getOwnerKey(password, ownerKeySalt, userBytes,
                                            ownerEncryption) {
      var hashData = new Uint8Array(password.length + 56);
      hashData.set(password, 0);
      hashData.set(ownerKeySalt, password.length);
      hashData.set(userBytes, password.length + ownerKeySalt.length);
      var key = calculatePDF20Hash(password, hashData, userBytes);
      var cipher = new AES256Cipher(key);
      return cipher.decryptBlock(ownerEncryption,
                                 false,
                                 new Uint8Array(16));

    },
    getUserKey: function PDF20_getUserKey(password, userKeySalt,
                                          userEncryption) {
      var hashData = new Uint8Array(password.length + 8);
      hashData.set(password, 0);
      hashData.set(userKeySalt, password.length);
      //key is the decryption key for the UE string
      var key = calculatePDF20Hash(password, hashData, []);
      var cipher = new AES256Cipher(key);
      return cipher.decryptBlock(userEncryption,
                                 false,
                                 new Uint8Array(16));
    }
  };
  return PDF20;
})();

var CipherTransform = (function CipherTransformClosure() {
  function CipherTransform(stringCipherConstructor, streamCipherConstructor) {
    this.stringCipherConstructor = stringCipherConstructor;
    this.streamCipherConstructor = streamCipherConstructor;
  }

  CipherTransform.prototype = {
    createStream: function CipherTransform_createStream(stream, length) {
      var cipher = new this.streamCipherConstructor();
      return new DecryptStream(stream, length,
        function cipherTransformDecryptStream(data, finalize) {
          return cipher.decryptBlock(data, finalize);
        }
      );
    },
    decryptString: function CipherTransform_decryptString(s) {
      var cipher = new this.stringCipherConstructor();
      var data = stringToBytes(s);
      data = cipher.decryptBlock(data, true);
      return bytesToString(data);
    }
  };
  return CipherTransform;
})();

var CipherTransformFactory = (function CipherTransformFactoryClosure() {
  var defaultPasswordBytes = new Uint8Array([
    0x28, 0xBF, 0x4E, 0x5E, 0x4E, 0x75, 0x8A, 0x41,
    0x64, 0x00, 0x4E, 0x56, 0xFF, 0xFA, 0x01, 0x08,
    0x2E, 0x2E, 0x00, 0xB6, 0xD0, 0x68, 0x3E, 0x80,
    0x2F, 0x0C, 0xA9, 0xFE, 0x64, 0x53, 0x69, 0x7A]);

  function createEncryptionKey20(revision, password, ownerPassword,
                                 ownerValidationSalt, ownerKeySalt, uBytes,
                                 userPassword, userValidationSalt, userKeySalt,
                                 ownerEncryption, userEncryption, perms) {
    if (password) {
      var passwordLength = Math.min(127, password.length);
      password = password.subarray(0, passwordLength);
    } else {
      password = [];
    }
    var pdfAlgorithm;
    if (revision === 6) {
      pdfAlgorithm = new PDF20();
    } else {
      pdfAlgorithm = new PDF17();
    }

    if (pdfAlgorithm) {
      if (pdfAlgorithm.checkUserPassword(password, userValidationSalt,
                                         userPassword)) {
        return pdfAlgorithm.getUserKey(password, userKeySalt, userEncryption);
      } else if (pdfAlgorithm.checkOwnerPassword(password, ownerValidationSalt,
                                                 uBytes,
                                                 ownerPassword)) {
        return pdfAlgorithm.getOwnerKey(password, ownerKeySalt, uBytes,
                                        ownerEncryption);
      }
    }

    return null;
  }

  function prepareKeyData(fileId, password, ownerPassword, userPassword,
                          flags, revision, keyLength, encryptMetadata) {
    var hashDataSize = 40 + ownerPassword.length + fileId.length;
    var hashData = new Uint8Array(hashDataSize), i = 0, j, n;
    if (password) {
      n = Math.min(32, password.length);
      for (; i < n; ++i) {
        hashData[i] = password[i];
      }
    }
    j = 0;
    while (i < 32) {
      hashData[i++] = defaultPasswordBytes[j++];
    }
    // as now the padded password in the hashData[0..i]
    for (j = 0, n = ownerPassword.length; j < n; ++j) {
      hashData[i++] = ownerPassword[j];
    }
    hashData[i++] = flags & 0xFF;
    hashData[i++] = (flags >> 8) & 0xFF;
    hashData[i++] = (flags >> 16) & 0xFF;
    hashData[i++] = (flags >>> 24) & 0xFF;
    for (j = 0, n = fileId.length; j < n; ++j) {
      hashData[i++] = fileId[j];
    }
    if (revision >= 4 && !encryptMetadata) {
      hashData[i++] = 0xFF;
      hashData[i++] = 0xFF;
      hashData[i++] = 0xFF;
      hashData[i++] = 0xFF;
    }
    var hash = calculateMD5(hashData, 0, i);
    var keyLengthInBytes = keyLength >> 3;
    if (revision >= 3) {
      for (j = 0; j < 50; ++j) {
        hash = calculateMD5(hash, 0, keyLengthInBytes);
      }
    }
    var encryptionKey = hash.subarray(0, keyLengthInBytes);
    var cipher, checkData;

    if (revision >= 3) {
      for (i = 0; i < 32; ++i) {
        hashData[i] = defaultPasswordBytes[i];
      }
      for (j = 0, n = fileId.length; j < n; ++j) {
        hashData[i++] = fileId[j];
      }
      cipher = new ARCFourCipher(encryptionKey);
      checkData = cipher.encryptBlock(calculateMD5(hashData, 0, i));
      n = encryptionKey.length;
      var derivedKey = new Uint8Array(n), k;
      for (j = 1; j <= 19; ++j) {
        for (k = 0; k < n; ++k) {
          derivedKey[k] = encryptionKey[k] ^ j;
        }
        cipher = new ARCFourCipher(derivedKey);
        checkData = cipher.encryptBlock(checkData);
      }
      for (j = 0, n = checkData.length; j < n; ++j) {
        if (userPassword[j] !== checkData[j]) {
          return null;
        }
      }
    } else {
      cipher = new ARCFourCipher(encryptionKey);
      checkData = cipher.encryptBlock(defaultPasswordBytes);
      for (j = 0, n = checkData.length; j < n; ++j) {
        if (userPassword[j] !== checkData[j]) {
          return null;
        }
      }
    }
    return encryptionKey;
  }

  function decodeUserPassword(password, ownerPassword, revision, keyLength) {
    var hashData = new Uint8Array(32), i = 0, j, n;
    n = Math.min(32, password.length);
    for (; i < n; ++i) {
      hashData[i] = password[i];
    }
    j = 0;
    while (i < 32) {
      hashData[i++] = defaultPasswordBytes[j++];
    }
    var hash = calculateMD5(hashData, 0, i);
    var keyLengthInBytes = keyLength >> 3;
    if (revision >= 3) {
      for (j = 0; j < 50; ++j) {
        hash = calculateMD5(hash, 0, hash.length);
      }
    }

    var cipher, userPassword;
    if (revision >= 3) {
      userPassword = ownerPassword;
      var derivedKey = new Uint8Array(keyLengthInBytes), k;
      for (j = 19; j >= 0; j--) {
        for (k = 0; k < keyLengthInBytes; ++k) {
          derivedKey[k] = hash[k] ^ j;
        }
        cipher = new ARCFourCipher(derivedKey);
        userPassword = cipher.encryptBlock(userPassword);
      }
    } else {
      cipher = new ARCFourCipher(hash.subarray(0, keyLengthInBytes));
      userPassword = cipher.encryptBlock(ownerPassword);
    }
    return userPassword;
  }

  var identityName = Name.get('Identity');

  function CipherTransformFactory(dict, fileId, password) {
    var filter = dict.get('Filter');
    if (!isName(filter) || filter.name !== 'Standard') {
      error('unknown encryption method');
    }
    this.dict = dict;
    var algorithm = dict.get('V');
    if (!isInt(algorithm) ||
        (algorithm !== 1 && algorithm !== 2 && algorithm !== 4 &&
        algorithm !== 5)) {
      error('unsupported encryption algorithm');
    }
    this.algorithm = algorithm;
    var keyLength = dict.get('Length') || 40;
    if (!isInt(keyLength) ||
        keyLength < 40 || (keyLength % 8) !== 0) {
      error('invalid key length');
    }

    // prepare keys
    var ownerPassword = stringToBytes(dict.get('O')).subarray(0, 32);
    var userPassword = stringToBytes(dict.get('U')).subarray(0, 32);
    var flags = dict.get('P');
    var revision = dict.get('R');
    // meaningful when V is 4 or 5
    var encryptMetadata = ((algorithm === 4 || algorithm === 5) &&
                           dict.get('EncryptMetadata') !== false);
    this.encryptMetadata = encryptMetadata;

    var fileIdBytes = stringToBytes(fileId);
    var passwordBytes;
    if (password) {
      passwordBytes = stringToBytes(password);
    }

    var encryptionKey;
    if (algorithm !== 5) {
      encryptionKey = prepareKeyData(fileIdBytes, passwordBytes,
                                     ownerPassword, userPassword, flags,
                                     revision, keyLength, encryptMetadata);
    }
    else {
      var ownerValidationSalt = stringToBytes(dict.get('O')).subarray(32, 40);
      var ownerKeySalt = stringToBytes(dict.get('O')).subarray(40, 48);
      var uBytes = stringToBytes(dict.get('U')).subarray(0, 48);
      var userValidationSalt = stringToBytes(dict.get('U')).subarray(32, 40);
      var userKeySalt = stringToBytes(dict.get('U')).subarray(40, 48);
      var ownerEncryption = stringToBytes(dict.get('OE'));
      var userEncryption = stringToBytes(dict.get('UE'));
      var perms = stringToBytes(dict.get('Perms'));
      encryptionKey =
        createEncryptionKey20(revision, passwordBytes,
          ownerPassword, ownerValidationSalt,
          ownerKeySalt, uBytes,
          userPassword, userValidationSalt,
          userKeySalt, ownerEncryption,
          userEncryption, perms);
    }
    if (!encryptionKey && !password) {
      throw new PasswordException('No password given',
                                  PasswordResponses.NEED_PASSWORD);
    } else if (!encryptionKey && password) {
      // Attempting use the password as an owner password
      var decodedPassword = decodeUserPassword(passwordBytes, ownerPassword,
                                               revision, keyLength);
      encryptionKey = prepareKeyData(fileIdBytes, decodedPassword,
                                     ownerPassword, userPassword, flags,
                                     revision, keyLength, encryptMetadata);
    }

    if (!encryptionKey) {
      throw new PasswordException('Incorrect Password',
                                  PasswordResponses.INCORRECT_PASSWORD);
    }

    this.encryptionKey = encryptionKey;

    if (algorithm >= 4) {
      this.cf = dict.get('CF');
      this.stmf = dict.get('StmF') || identityName;
      this.strf = dict.get('StrF') || identityName;
      this.eff = dict.get('EFF') || this.strf;
    }
  }

  function buildObjectKey(num, gen, encryptionKey, isAes) {
    var key = new Uint8Array(encryptionKey.length + 9), i, n;
    for (i = 0, n = encryptionKey.length; i < n; ++i) {
      key[i] = encryptionKey[i];
    }
    key[i++] = num & 0xFF;
    key[i++] = (num >> 8) & 0xFF;
    key[i++] = (num >> 16) & 0xFF;
    key[i++] = gen & 0xFF;
    key[i++] = (gen >> 8) & 0xFF;
    if (isAes) {
      key[i++] = 0x73;
      key[i++] = 0x41;
      key[i++] = 0x6C;
      key[i++] = 0x54;
    }
    var hash = calculateMD5(key, 0, i);
    return hash.subarray(0, Math.min(encryptionKey.length + 5, 16));
  }

  function buildCipherConstructor(cf, name, num, gen, key) {
    var cryptFilter = cf.get(name.name);
    var cfm;
    if (cryptFilter !== null && cryptFilter !== undefined) {
      cfm = cryptFilter.get('CFM');
    }
    if (!cfm || cfm.name === 'None') {
      return function cipherTransformFactoryBuildCipherConstructorNone() {
        return new NullCipher();
      };
    }
    if ('V2' === cfm.name) {
      return function cipherTransformFactoryBuildCipherConstructorV2() {
        return new ARCFourCipher(buildObjectKey(num, gen, key, false));
      };
    }
    if ('AESV2' === cfm.name) {
      return function cipherTransformFactoryBuildCipherConstructorAESV2() {
        return new AES128Cipher(buildObjectKey(num, gen, key, true));
      };
    }
    if ('AESV3' === cfm.name) {
      return function cipherTransformFactoryBuildCipherConstructorAESV3() {
        return new AES256Cipher(key);
      };
    }
    error('Unknown crypto method');
  }

  CipherTransformFactory.prototype = {
    createCipherTransform:
      function CipherTransformFactory_createCipherTransform(num, gen) {
      if (this.algorithm === 4 || this.algorithm === 5) {
        return new CipherTransform(
          buildCipherConstructor(this.cf, this.stmf,
                                 num, gen, this.encryptionKey),
          buildCipherConstructor(this.cf, this.strf,
                                 num, gen, this.encryptionKey));
      }
      // algorithms 1 and 2
      var key = buildObjectKey(num, gen, this.encryptionKey, false);
      var cipherConstructor = function buildCipherCipherConstructor() {
        return new ARCFourCipher(key);
      };
      return new CipherTransform(cipherConstructor, cipherConstructor);
    }
  };

  return CipherTransformFactory;
})();

var PatternType = {
  FUNCTION_BASED: 1,
  AXIAL: 2,
  RADIAL: 3,
  FREE_FORM_MESH: 4,
  LATTICE_FORM_MESH: 5,
  COONS_PATCH_MESH: 6,
  TENSOR_PATCH_MESH: 7
};

var Pattern = (function PatternClosure() {
  // Constructor should define this.getPattern
  function Pattern() {
    error('should not call Pattern constructor');
  }

  Pattern.prototype = {
    // Input: current Canvas context
    // Output: the appropriate fillStyle or strokeStyle
    getPattern: function Pattern_getPattern(ctx) {
      error('Should not call Pattern.getStyle: ' + ctx);
    }
  };

  Pattern.parseShading = function Pattern_parseShading(shading, matrix, xref,
                                                       res) {

    var dict = isStream(shading) ? shading.dict : shading;
    var type = dict.get('ShadingType');

    switch (type) {
      case PatternType.AXIAL:
      case PatternType.RADIAL:
        // Both radial and axial shadings are handled by RadialAxial shading.
        return new Shadings.RadialAxial(dict, matrix, xref, res);
      case PatternType.FREE_FORM_MESH:
      case PatternType.LATTICE_FORM_MESH:
      case PatternType.COONS_PATCH_MESH:
      case PatternType.TENSOR_PATCH_MESH:
        return new Shadings.Mesh(shading, matrix, xref, res);
      default:
        UnsupportedManager.notify(UNSUPPORTED_FEATURES.shadingPattern);
        return new Shadings.Dummy();
    }
  };
  return Pattern;
})();

var Shadings = {};

// A small number to offset the first/last color stops so we can insert ones to
// support extend.  Number.MIN_VALUE appears to be too small and breaks the
// extend. 1e-7 works in FF but chrome seems to use an even smaller sized number
// internally so we have to go bigger.
Shadings.SMALL_NUMBER = 1e-2;

// Radial and axial shading have very similar implementations
// If needed, the implementations can be broken into two classes
Shadings.RadialAxial = (function RadialAxialClosure() {
  function RadialAxial(dict, matrix, xref, res) {
    this.matrix = matrix;
    this.coordsArr = dict.get('Coords');
    this.shadingType = dict.get('ShadingType');
    this.type = 'Pattern';
    var cs = dict.get('ColorSpace', 'CS');
    cs = ColorSpace.parse(cs, xref, res);
    this.cs = cs;

    var t0 = 0.0, t1 = 1.0;
    if (dict.has('Domain')) {
      var domainArr = dict.get('Domain');
      t0 = domainArr[0];
      t1 = domainArr[1];
    }

    var extendStart = false, extendEnd = false;
    if (dict.has('Extend')) {
      var extendArr = dict.get('Extend');
      extendStart = extendArr[0];
      extendEnd = extendArr[1];
    }

    if (this.shadingType === PatternType.RADIAL &&
       (!extendStart || !extendEnd)) {
      // Radial gradient only currently works if either circle is fully within
      // the other circle.
      var x1 = this.coordsArr[0];
      var y1 = this.coordsArr[1];
      var r1 = this.coordsArr[2];
      var x2 = this.coordsArr[3];
      var y2 = this.coordsArr[4];
      var r2 = this.coordsArr[5];
      var distance = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
      if (r1 <= r2 + distance &&
          r2 <= r1 + distance) {
        warn('Unsupported radial gradient.');
      }
    }

    this.extendStart = extendStart;
    this.extendEnd = extendEnd;

    var fnObj = dict.get('Function');
    var fn = PDFFunction.parseArray(xref, fnObj);

    // 10 samples seems good enough for now, but probably won't work
    // if there are sharp color changes. Ideally, we would implement
    // the spec faithfully and add lossless optimizations.
    var diff = t1 - t0;
    var step = diff / 10;

    var colorStops = this.colorStops = [];

    // Protect against bad domains so we don't end up in an infinte loop below.
    if (t0 >= t1 || step <= 0) {
      // Acrobat doesn't seem to handle these cases so we'll ignore for
      // now.
      info('Bad shading domain.');
      return;
    }

    var color = new Float32Array(cs.numComps), ratio = new Float32Array(1);
    var rgbColor;
    for (var i = t0; i <= t1; i += step) {
      ratio[0] = i;
      fn(ratio, 0, color, 0);
      rgbColor = cs.getRgb(color, 0);
      var cssColor = Util.makeCssRgb(rgbColor);
      colorStops.push([(i - t0) / diff, cssColor]);
    }

    var background = 'transparent';
    if (dict.has('Background')) {
      rgbColor = cs.getRgb(dict.get('Background'), 0);
      background = Util.makeCssRgb(rgbColor);
    }

    if (!extendStart) {
      // Insert a color stop at the front and offset the first real color stop
      // so it doesn't conflict with the one we insert.
      colorStops.unshift([0, background]);
      colorStops[1][0] += Shadings.SMALL_NUMBER;
    }
    if (!extendEnd) {
      // Same idea as above in extendStart but for the end.
      colorStops[colorStops.length - 1][0] -= Shadings.SMALL_NUMBER;
      colorStops.push([1, background]);
    }

    this.colorStops = colorStops;
  }

  RadialAxial.prototype = {
    getIR: function RadialAxial_getIR() {
      var coordsArr = this.coordsArr;
      var shadingType = this.shadingType;
      var type, p0, p1, r0, r1;
      if (shadingType === PatternType.AXIAL) {
        p0 = [coordsArr[0], coordsArr[1]];
        p1 = [coordsArr[2], coordsArr[3]];
        r0 = null;
        r1 = null;
        type = 'axial';
      } else if (shadingType === PatternType.RADIAL) {
        p0 = [coordsArr[0], coordsArr[1]];
        p1 = [coordsArr[3], coordsArr[4]];
        r0 = coordsArr[2];
        r1 = coordsArr[5];
        type = 'radial';
      } else {
        error('getPattern type unknown: ' + shadingType);
      }

      var matrix = this.matrix;
      if (matrix) {
        p0 = Util.applyTransform(p0, matrix);
        p1 = Util.applyTransform(p1, matrix);
      }

      return ['RadialAxial', type, this.colorStops, p0, p1, r0, r1];
    }
  };

  return RadialAxial;
})();

// All mesh shading. For now, they will be presented as set of the triangles
// to be drawn on the canvas and rgb color for each vertex.
Shadings.Mesh = (function MeshClosure() {
  function MeshStreamReader(stream, context) {
    this.stream = stream;
    this.context = context;
    this.buffer = 0;
    this.bufferLength = 0;

    var numComps = context.numComps;
    this.tmpCompsBuf = new Float32Array(numComps);
    var csNumComps = context.colorSpace;
    this.tmpCsCompsBuf = context.colorFn ? new Float32Array(csNumComps) :
                                           this.tmpCompsBuf;
  }
  MeshStreamReader.prototype = {
    get hasData() {
      if (this.stream.end) {
        return this.stream.pos < this.stream.end;
      }
      if (this.bufferLength > 0) {
        return true;
      }
      var nextByte = this.stream.getByte();
      if (nextByte < 0) {
        return false;
      }
      this.buffer = nextByte;
      this.bufferLength = 8;
      return true;
    },
    readBits: function MeshStreamReader_readBits(n) {
      var buffer = this.buffer;
      var bufferLength = this.bufferLength;
      if (n === 32) {
        if (bufferLength === 0) {
          return ((this.stream.getByte() << 24) |
            (this.stream.getByte() << 16) | (this.stream.getByte() << 8) |
            this.stream.getByte()) >>> 0;
        }
        buffer = (buffer << 24) | (this.stream.getByte() << 16) |
          (this.stream.getByte() << 8) | this.stream.getByte();
        var nextByte = this.stream.getByte();
        this.buffer = nextByte & ((1 << bufferLength) - 1);
        return ((buffer << (8 - bufferLength)) |
          ((nextByte & 0xFF) >> bufferLength)) >>> 0;
      }
      if (n === 8 && bufferLength === 0) {
        return this.stream.getByte();
      }
      while (bufferLength < n) {
        buffer = (buffer << 8) | this.stream.getByte();
        bufferLength += 8;
      }
      bufferLength -= n;
      this.bufferLength = bufferLength;
      this.buffer = buffer & ((1 << bufferLength) - 1);
      return buffer >> bufferLength;
    },
    align: function MeshStreamReader_align() {
      this.buffer = 0;
      this.bufferLength = 0;
    },
    readFlag: function MeshStreamReader_readFlag() {
      return this.readBits(this.context.bitsPerFlag);
    },
    readCoordinate: function MeshStreamReader_readCoordinate() {
      var bitsPerCoordinate = this.context.bitsPerCoordinate;
      var xi = this.readBits(bitsPerCoordinate);
      var yi = this.readBits(bitsPerCoordinate);
      var decode = this.context.decode;
      var scale = bitsPerCoordinate < 32 ? 1 / ((1 << bitsPerCoordinate) - 1) :
        2.3283064365386963e-10; // 2 ^ -32
      return [
        xi * scale * (decode[1] - decode[0]) + decode[0],
        yi * scale * (decode[3] - decode[2]) + decode[2]
      ];
    },
    readComponents: function MeshStreamReader_readComponents() {
      var numComps = this.context.numComps;
      var bitsPerComponent = this.context.bitsPerComponent;
      var scale = bitsPerComponent < 32 ? 1 / ((1 << bitsPerComponent) - 1) :
        2.3283064365386963e-10; // 2 ^ -32
      var decode = this.context.decode;
      var components = this.tmpCompsBuf;
      for (var i = 0, j = 4; i < numComps; i++, j += 2) {
        var ci = this.readBits(bitsPerComponent);
        components[i] = ci * scale * (decode[j + 1] - decode[j]) + decode[j];
      }
      var color = this.tmpCsCompsBuf;
      if (this.context.colorFn) {
        this.context.colorFn(components, 0, color, 0);
      }
      return this.context.colorSpace.getRgb(color, 0);
    }
  };

  function decodeType4Shading(mesh, reader) {
    var coords = mesh.coords;
    var colors = mesh.colors;
    var operators = [];
    var ps = []; // not maintaining cs since that will match ps
    var verticesLeft = 0; // assuming we have all data to start a new triangle
    while (reader.hasData) {
      var f = reader.readFlag();
      var coord = reader.readCoordinate();
      var color = reader.readComponents();
      if (verticesLeft === 0) { // ignoring flags if we started a triangle
        assert(0 <= f && f <= 2, 'Unknown type4 flag');
        switch (f) {
          case 0:
            verticesLeft = 3;
            break;
          case 1:
            ps.push(ps[ps.length - 2], ps[ps.length - 1]);
            verticesLeft = 1;
            break;
          case 2:
            ps.push(ps[ps.length - 3], ps[ps.length - 1]);
            verticesLeft = 1;
            break;
        }
        operators.push(f);
      }
      ps.push(coords.length);
      coords.push(coord);
      colors.push(color);
      verticesLeft--;

      reader.align();
    }

    var psPacked = new Int32Array(ps);

    mesh.figures.push({
      type: 'triangles',
      coords: psPacked,
      colors: psPacked
    });
  }

  function decodeType5Shading(mesh, reader, verticesPerRow) {
    var coords = mesh.coords;
    var colors = mesh.colors;
    var ps = []; // not maintaining cs since that will match ps
    while (reader.hasData) {
      var coord = reader.readCoordinate();
      var color = reader.readComponents();
      ps.push(coords.length);
      coords.push(coord);
      colors.push(color);
    }

    var psPacked = new Int32Array(ps);

    mesh.figures.push({
      type: 'lattice',
      coords: psPacked,
      colors: psPacked,
      verticesPerRow: verticesPerRow
    });
  }

  var MIN_SPLIT_PATCH_CHUNKS_AMOUNT = 3;
  var MAX_SPLIT_PATCH_CHUNKS_AMOUNT = 20;

  var TRIANGLE_DENSITY = 20; // count of triangles per entire mesh bounds

  var getB = (function getBClosure() {
    function buildB(count) {
      var lut = [];
      for (var i = 0; i <= count; i++) {
        var t = i / count, t_ = 1 - t;
        lut.push(new Float32Array([t_ * t_ * t_, 3 * t * t_ * t_,
          3 * t * t * t_, t * t * t]));
      }
      return lut;
    }
    var cache = [];
    return function getB(count) {
      if (!cache[count]) {
        cache[count] = buildB(count);
      }
      return cache[count];
    };
  })();

  function buildFigureFromPatch(mesh, index) {
    var figure = mesh.figures[index];
    assert(figure.type === 'patch', 'Unexpected patch mesh figure');

    var coords = mesh.coords, colors = mesh.colors;
    var pi = figure.coords;
    var ci = figure.colors;

    var figureMinX = Math.min(coords[pi[0]][0], coords[pi[3]][0],
                              coords[pi[12]][0], coords[pi[15]][0]);
    var figureMinY = Math.min(coords[pi[0]][1], coords[pi[3]][1],
                              coords[pi[12]][1], coords[pi[15]][1]);
    var figureMaxX = Math.max(coords[pi[0]][0], coords[pi[3]][0],
                              coords[pi[12]][0], coords[pi[15]][0]);
    var figureMaxY = Math.max(coords[pi[0]][1], coords[pi[3]][1],
                              coords[pi[12]][1], coords[pi[15]][1]);
    var splitXBy = Math.ceil((figureMaxX - figureMinX) * TRIANGLE_DENSITY /
                             (mesh.bounds[2] - mesh.bounds[0]));
    splitXBy = Math.max(MIN_SPLIT_PATCH_CHUNKS_AMOUNT,
               Math.min(MAX_SPLIT_PATCH_CHUNKS_AMOUNT, splitXBy));
    var splitYBy = Math.ceil((figureMaxY - figureMinY) * TRIANGLE_DENSITY /
                             (mesh.bounds[3] - mesh.bounds[1]));
    splitYBy = Math.max(MIN_SPLIT_PATCH_CHUNKS_AMOUNT,
               Math.min(MAX_SPLIT_PATCH_CHUNKS_AMOUNT, splitYBy));

    var verticesPerRow = splitXBy + 1;
    var figureCoords = new Int32Array((splitYBy + 1) * verticesPerRow);
    var figureColors = new Int32Array((splitYBy + 1) * verticesPerRow);
    var k = 0;
    var cl = new Uint8Array(3), cr = new Uint8Array(3);
    var c0 = colors[ci[0]], c1 = colors[ci[1]],
      c2 = colors[ci[2]], c3 = colors[ci[3]];
    var bRow = getB(splitYBy), bCol = getB(splitXBy);
    for (var row = 0; row <= splitYBy; row++) {
      cl[0] = ((c0[0] * (splitYBy - row) + c2[0] * row) / splitYBy) | 0;
      cl[1] = ((c0[1] * (splitYBy - row) + c2[1] * row) / splitYBy) | 0;
      cl[2] = ((c0[2] * (splitYBy - row) + c2[2] * row) / splitYBy) | 0;

      cr[0] = ((c1[0] * (splitYBy - row) + c3[0] * row) / splitYBy) | 0;
      cr[1] = ((c1[1] * (splitYBy - row) + c3[1] * row) / splitYBy) | 0;
      cr[2] = ((c1[2] * (splitYBy - row) + c3[2] * row) / splitYBy) | 0;

      for (var col = 0; col <= splitXBy; col++, k++) {
        if ((row === 0 || row === splitYBy) &&
            (col === 0 || col === splitXBy)) {
          continue;
        }
        var x = 0, y = 0;
        var q = 0;
        for (var i = 0; i <= 3; i++) {
          for (var j = 0; j <= 3; j++, q++) {
            var m = bRow[row][i] * bCol[col][j];
            x += coords[pi[q]][0] * m;
            y += coords[pi[q]][1] * m;
          }
        }
        figureCoords[k] = coords.length;
        coords.push([x, y]);
        figureColors[k] = colors.length;
        var newColor = new Uint8Array(3);
        newColor[0] = ((cl[0] * (splitXBy - col) + cr[0] * col) / splitXBy) | 0;
        newColor[1] = ((cl[1] * (splitXBy - col) + cr[1] * col) / splitXBy) | 0;
        newColor[2] = ((cl[2] * (splitXBy - col) + cr[2] * col) / splitXBy) | 0;
        colors.push(newColor);
      }
    }
    figureCoords[0] = pi[0];
    figureColors[0] = ci[0];
    figureCoords[splitXBy] = pi[3];
    figureColors[splitXBy] = ci[1];
    figureCoords[verticesPerRow * splitYBy] = pi[12];
    figureColors[verticesPerRow * splitYBy] = ci[2];
    figureCoords[verticesPerRow * splitYBy + splitXBy] = pi[15];
    figureColors[verticesPerRow * splitYBy + splitXBy] = ci[3];

    mesh.figures[index] = {
      type: 'lattice',
      coords: figureCoords,
      colors: figureColors,
      verticesPerRow: verticesPerRow
    };
  }

  function decodeType6Shading(mesh, reader) {
    // A special case of Type 7. The p11, p12, p21, p22 automatically filled
    var coords = mesh.coords;
    var colors = mesh.colors;
    var ps = new Int32Array(16); // p00, p10, ..., p30, p01, ..., p33
    var cs = new Int32Array(4); // c00, c30, c03, c33
    while (reader.hasData) {
      var f = reader.readFlag();
      assert(0 <= f && f <= 3, 'Unknown type6 flag');
      var i, ii;
      var pi = coords.length;
      for (i = 0, ii = (f !== 0 ? 8 : 12); i < ii; i++) {
        coords.push(reader.readCoordinate());
      }
      var ci = colors.length;
      for (i = 0, ii = (f !== 0 ? 2 : 4); i < ii; i++) {
        colors.push(reader.readComponents());
      }
      var tmp1, tmp2, tmp3, tmp4;
      switch (f) {
        case 0:
          ps[12] = pi + 3; ps[13] = pi + 4;  ps[14] = pi + 5;  ps[15] = pi + 6;
          ps[ 8] = pi + 2; /* values for 5, 6, 9, 10 are    */ ps[11] = pi + 7;
          ps[ 4] = pi + 1; /* calculated below              */ ps[ 7] = pi + 8;
          ps[ 0] = pi;     ps[ 1] = pi + 11; ps[ 2] = pi + 10; ps[ 3] = pi + 9;
          cs[2] = ci + 1; cs[3] = ci + 2;
          cs[0] = ci;     cs[1] = ci + 3;
          break;
        case 1:
          tmp1 = ps[12]; tmp2 = ps[13]; tmp3 = ps[14]; tmp4 = ps[15];
          ps[12] = pi + 5; ps[13] = pi + 4;  ps[14] = pi + 3;  ps[15] = pi + 2;
          ps[ 8] = pi + 6; /* values for 5, 6, 9, 10 are    */ ps[11] = pi + 1;
          ps[ 4] = pi + 7; /* calculated below              */ ps[ 7] = pi;
          ps[ 0] = tmp1;   ps[ 1] = tmp2;    ps[ 2] = tmp3;    ps[ 3] = tmp4;
          tmp1 = cs[2]; tmp2 = cs[3];
          cs[2] = ci + 1; cs[3] = ci;
          cs[0] = tmp1;   cs[1] = tmp2;
          break;
        case 2:
          ps[12] = ps[15]; ps[13] = pi + 7; ps[14] = pi + 6;   ps[15] = pi + 5;
          ps[ 8] = ps[11]; /* values for 5, 6, 9, 10 are    */ ps[11] = pi + 4;
          ps[ 4] = ps[7];  /* calculated below              */ ps[ 7] = pi + 3;
          ps[ 0] = ps[3];  ps[ 1] = pi;     ps[ 2] = pi + 1;   ps[ 3] = pi + 2;
          cs[2] = cs[3]; cs[3] = ci + 1;
          cs[0] = cs[1]; cs[1] = ci;
          break;
        case 3:
          ps[12] = ps[0];  ps[13] = ps[1];   ps[14] = ps[2];   ps[15] = ps[3];
          ps[ 8] = pi;     /* values for 5, 6, 9, 10 are    */ ps[11] = pi + 7;
          ps[ 4] = pi + 1; /* calculated below              */ ps[ 7] = pi + 6;
          ps[ 0] = pi + 2; ps[ 1] = pi + 3;  ps[ 2] = pi + 4;  ps[ 3] = pi + 5;
          cs[2] = cs[0]; cs[3] = cs[1];
          cs[0] = ci;    cs[1] = ci + 1;
          break;
      }
      // set p11, p12, p21, p22
      ps[5] = coords.length;
      coords.push([
        (-4 * coords[ps[0]][0] - coords[ps[15]][0] +
          6 * (coords[ps[4]][0] + coords[ps[1]][0]) -
          2 * (coords[ps[12]][0] + coords[ps[3]][0]) +
          3 * (coords[ps[13]][0] + coords[ps[7]][0])) / 9,
        (-4 * coords[ps[0]][1] - coords[ps[15]][1] +
          6 * (coords[ps[4]][1] + coords[ps[1]][1]) -
          2 * (coords[ps[12]][1] + coords[ps[3]][1]) +
          3 * (coords[ps[13]][1] + coords[ps[7]][1])) / 9
      ]);
      ps[6] = coords.length;
      coords.push([
        (-4 * coords[ps[3]][0] - coords[ps[12]][0] +
          6 * (coords[ps[2]][0] + coords[ps[7]][0]) -
          2 * (coords[ps[0]][0] + coords[ps[15]][0]) +
          3 * (coords[ps[4]][0] + coords[ps[14]][0])) / 9,
        (-4 * coords[ps[3]][1] - coords[ps[12]][1] +
          6 * (coords[ps[2]][1] + coords[ps[7]][1]) -
          2 * (coords[ps[0]][1] + coords[ps[15]][1]) +
          3 * (coords[ps[4]][1] + coords[ps[14]][1])) / 9
      ]);
      ps[9] = coords.length;
      coords.push([
        (-4 * coords[ps[12]][0] - coords[ps[3]][0] +
          6 * (coords[ps[8]][0] + coords[ps[13]][0]) -
          2 * (coords[ps[0]][0] + coords[ps[15]][0]) +
          3 * (coords[ps[11]][0] + coords[ps[1]][0])) / 9,
        (-4 * coords[ps[12]][1] - coords[ps[3]][1] +
          6 * (coords[ps[8]][1] + coords[ps[13]][1]) -
          2 * (coords[ps[0]][1] + coords[ps[15]][1]) +
          3 * (coords[ps[11]][1] + coords[ps[1]][1])) / 9
      ]);
      ps[10] = coords.length;
      coords.push([
        (-4 * coords[ps[15]][0] - coords[ps[0]][0] +
          6 * (coords[ps[11]][0] + coords[ps[14]][0]) -
          2 * (coords[ps[12]][0] + coords[ps[3]][0]) +
          3 * (coords[ps[2]][0] + coords[ps[8]][0])) / 9,
        (-4 * coords[ps[15]][1] - coords[ps[0]][1] +
          6 * (coords[ps[11]][1] + coords[ps[14]][1]) -
          2 * (coords[ps[12]][1] + coords[ps[3]][1]) +
          3 * (coords[ps[2]][1] + coords[ps[8]][1])) / 9
      ]);
      mesh.figures.push({
        type: 'patch',
        coords: new Int32Array(ps), // making copies of ps and cs
        colors: new Int32Array(cs)
      });
    }
  }

  function decodeType7Shading(mesh, reader) {
    var coords = mesh.coords;
    var colors = mesh.colors;
    var ps = new Int32Array(16); // p00, p10, ..., p30, p01, ..., p33
    var cs = new Int32Array(4); // c00, c30, c03, c33
    while (reader.hasData) {
      var f = reader.readFlag();
      assert(0 <= f && f <= 3, 'Unknown type7 flag');
      var i, ii;
      var pi = coords.length;
      for (i = 0, ii = (f !== 0 ? 12 : 16); i < ii; i++) {
        coords.push(reader.readCoordinate());
      }
      var ci = colors.length;
      for (i = 0, ii = (f !== 0 ? 2 : 4); i < ii; i++) {
        colors.push(reader.readComponents());
      }
      var tmp1, tmp2, tmp3, tmp4;
      switch (f) {
        case 0:
          ps[12] = pi + 3; ps[13] = pi + 4;  ps[14] = pi + 5;  ps[15] = pi + 6;
          ps[ 8] = pi + 2; ps[ 9] = pi + 13; ps[10] = pi + 14; ps[11] = pi + 7;
          ps[ 4] = pi + 1; ps[ 5] = pi + 12; ps[ 6] = pi + 15; ps[ 7] = pi + 8;
          ps[ 0] = pi;     ps[ 1] = pi + 11; ps[ 2] = pi + 10; ps[ 3] = pi + 9;
          cs[2] = ci + 1; cs[3] = ci + 2;
          cs[0] = ci;     cs[1] = ci + 3;
          break;
        case 1:
          tmp1 = ps[12]; tmp2 = ps[13]; tmp3 = ps[14]; tmp4 = ps[15];
          ps[12] = pi + 5; ps[13] = pi + 4;  ps[14] = pi + 3;  ps[15] = pi + 2;
          ps[ 8] = pi + 6; ps[ 9] = pi + 11; ps[10] = pi + 10; ps[11] = pi + 1;
          ps[ 4] = pi + 7; ps[ 5] = pi + 8;  ps[ 6] = pi + 9;  ps[ 7] = pi;
          ps[ 0] = tmp1;   ps[ 1] = tmp2;    ps[ 2] = tmp3;    ps[ 3] = tmp4;
          tmp1 = cs[2]; tmp2 = cs[3];
          cs[2] = ci + 1; cs[3] = ci;
          cs[0] = tmp1;   cs[1] = tmp2;
          break;
        case 2:
          ps[12] = ps[15]; ps[13] = pi + 7; ps[14] = pi + 6;  ps[15] = pi + 5;
          ps[ 8] = ps[11]; ps[ 9] = pi + 8; ps[10] = pi + 11; ps[11] = pi + 4;
          ps[ 4] = ps[7];  ps[ 5] = pi + 9; ps[ 6] = pi + 10; ps[ 7] = pi + 3;
          ps[ 0] = ps[3];  ps[ 1] = pi;     ps[ 2] = pi + 1;  ps[ 3] = pi + 2;
          cs[2] = cs[3]; cs[3] = ci + 1;
          cs[0] = cs[1]; cs[1] = ci;
          break;
        case 3:
          ps[12] = ps[0];  ps[13] = ps[1];   ps[14] = ps[2];   ps[15] = ps[3];
          ps[ 8] = pi;     ps[ 9] = pi + 9;  ps[10] = pi + 8;  ps[11] = pi + 7;
          ps[ 4] = pi + 1; ps[ 5] = pi + 10; ps[ 6] = pi + 11; ps[ 7] = pi + 6;
          ps[ 0] = pi + 2; ps[ 1] = pi + 3;  ps[ 2] = pi + 4;  ps[ 3] = pi + 5;
          cs[2] = cs[0]; cs[3] = cs[1];
          cs[0] = ci;    cs[1] = ci + 1;
          break;
      }
      mesh.figures.push({
        type: 'patch',
        coords: new Int32Array(ps), // making copies of ps and cs
        colors: new Int32Array(cs)
      });
    }
  }

  function updateBounds(mesh) {
    var minX = mesh.coords[0][0], minY = mesh.coords[0][1],
      maxX = minX, maxY = minY;
    for (var i = 1, ii = mesh.coords.length; i < ii; i++) {
      var x = mesh.coords[i][0], y = mesh.coords[i][1];
      minX = minX > x ? x : minX;
      minY = minY > y ? y : minY;
      maxX = maxX < x ? x : maxX;
      maxY = maxY < y ? y : maxY;
    }
    mesh.bounds = [minX, minY, maxX, maxY];
  }

  function packData(mesh) {
    var i, ii, j, jj;

    var coords = mesh.coords;
    var coordsPacked = new Float32Array(coords.length * 2);
    for (i = 0, j = 0, ii = coords.length; i < ii; i++) {
      var xy = coords[i];
      coordsPacked[j++] = xy[0];
      coordsPacked[j++] = xy[1];
    }
    mesh.coords = coordsPacked;

    var colors = mesh.colors;
    var colorsPacked = new Uint8Array(colors.length * 3);
    for (i = 0, j = 0, ii = colors.length; i < ii; i++) {
      var c = colors[i];
      colorsPacked[j++] = c[0];
      colorsPacked[j++] = c[1];
      colorsPacked[j++] = c[2];
    }
    mesh.colors = colorsPacked;

    var figures = mesh.figures;
    for (i = 0, ii = figures.length; i < ii; i++) {
      var figure = figures[i], ps = figure.coords, cs = figure.colors;
      for (j = 0, jj = ps.length; j < jj; j++) {
        ps[j] *= 2;
        cs[j] *= 3;
      }
    }
  }

  function Mesh(stream, matrix, xref, res) {
    assert(isStream(stream), 'Mesh data is not a stream');
    var dict = stream.dict;
    this.matrix = matrix;
    this.shadingType = dict.get('ShadingType');
    this.type = 'Pattern';
    this.bbox = dict.get('BBox');
    var cs = dict.get('ColorSpace', 'CS');
    cs = ColorSpace.parse(cs, xref, res);
    this.cs = cs;
    this.background = dict.has('Background') ?
      cs.getRgb(dict.get('Background'), 0) : null;

    var fnObj = dict.get('Function');
    var fn = fnObj ? PDFFunction.parseArray(xref, fnObj) : null;

    this.coords = [];
    this.colors = [];
    this.figures = [];

    var decodeContext = {
      bitsPerCoordinate: dict.get('BitsPerCoordinate'),
      bitsPerComponent: dict.get('BitsPerComponent'),
      bitsPerFlag: dict.get('BitsPerFlag'),
      decode: dict.get('Decode'),
      colorFn: fn,
      colorSpace: cs,
      numComps: fn ? 1 : cs.numComps
    };
    var reader = new MeshStreamReader(stream, decodeContext);

    var patchMesh = false;
    switch (this.shadingType) {
      case PatternType.FREE_FORM_MESH:
        decodeType4Shading(this, reader);
        break;
      case PatternType.LATTICE_FORM_MESH:
        var verticesPerRow = dict.get('VerticesPerRow') | 0;
        assert(verticesPerRow >= 2, 'Invalid VerticesPerRow');
        decodeType5Shading(this, reader, verticesPerRow);
        break;
      case PatternType.COONS_PATCH_MESH:
        decodeType6Shading(this, reader);
        patchMesh = true;
        break;
      case PatternType.TENSOR_PATCH_MESH:
        decodeType7Shading(this, reader);
        patchMesh = true;
        break;
      default:
        error('Unsupported mesh type.');
        break;
    }

    if (patchMesh) {
      // dirty bounds calculation for determining, how dense shall be triangles
      updateBounds(this);
      for (var i = 0, ii = this.figures.length; i < ii; i++) {
        buildFigureFromPatch(this, i);
      }
    }
    // calculate bounds
    updateBounds(this);

    packData(this);
  }

  Mesh.prototype = {
    getIR: function Mesh_getIR() {
      return ['Mesh', this.shadingType, this.coords, this.colors, this.figures,
        this.bounds, this.matrix, this.bbox, this.background];
    }
  };

  return Mesh;
})();

Shadings.Dummy = (function DummyClosure() {
  function Dummy() {
    this.type = 'Pattern';
  }

  Dummy.prototype = {
    getIR: function Dummy_getIR() {
      return ['Dummy'];
    }
  };
  return Dummy;
})();

function getTilingPatternIR(operatorList, dict, args) {
  var matrix = dict.get('Matrix');
  var bbox = dict.get('BBox');
  var xstep = dict.get('XStep');
  var ystep = dict.get('YStep');
  var paintType = dict.get('PaintType');
  var tilingType = dict.get('TilingType');

  return [
    'TilingPattern', args, operatorList, matrix, bbox, xstep, ystep,
    paintType, tilingType
  ];
}


var PartialEvaluator = (function PartialEvaluatorClosure() {
  function PartialEvaluator(pdfManager, xref, handler, pageIndex,
                            uniquePrefix, idCounters, fontCache) {
    this.pdfManager = pdfManager;
    this.xref = xref;
    this.handler = handler;
    this.pageIndex = pageIndex;
    this.uniquePrefix = uniquePrefix;
    this.idCounters = idCounters;
    this.fontCache = fontCache;
  }

  // Trying to minimize Date.now() usage and check every 100 time
  var TIME_SLOT_DURATION_MS = 20;
  var CHECK_TIME_EVERY = 100;
  function TimeSlotManager() {
    this.reset();
  }
  TimeSlotManager.prototype = {
    check: function TimeSlotManager_check() {
      if (++this.checked < CHECK_TIME_EVERY) {
        return false;
      }
      this.checked = 0;
      return this.endTime <= Date.now();
    },
    reset: function TimeSlotManager_reset() {
      this.endTime = Date.now() + TIME_SLOT_DURATION_MS;
      this.checked = 0;
    }
  };

  var deferred = Promise.resolve();

  var TILING_PATTERN = 1, SHADING_PATTERN = 2;

  PartialEvaluator.prototype = {
    hasBlendModes: function PartialEvaluator_hasBlendModes(resources) {
      if (!isDict(resources)) {
        return false;
      }

      var processed = Object.create(null);
      if (resources.objId) {
        processed[resources.objId] = true;
      }

      var nodes = [resources];
      while (nodes.length) {
        var key;
        var node = nodes.shift();
        // First check the current resources for blend modes.
        var graphicStates = node.get('ExtGState');
        if (isDict(graphicStates)) {
          graphicStates = graphicStates.getAll();
          for (key in graphicStates) {
            var graphicState = graphicStates[key];
            var bm = graphicState['BM'];
            if (isName(bm) && bm.name !== 'Normal') {
              return true;
            }
          }
        }
        // Descend into the XObjects to look for more resources and blend modes.
        var xObjects = node.get('XObject');
        if (!isDict(xObjects)) {
          continue;
        }
        xObjects = xObjects.getAll();
        for (key in xObjects) {
          var xObject = xObjects[key];
          if (!isStream(xObject)) {
            continue;
          }
          if (xObject.dict.objId) {
            if (processed[xObject.dict.objId]) {
              // stream has objId and is processed already
              continue;
            }
            processed[xObject.dict.objId] = true;
          }
          var xResources = xObject.dict.get('Resources');
          // Checking objId to detect an infinite loop.
          if (isDict(xResources) &&
              (!xResources.objId || !processed[xResources.objId])) {
            nodes.push(xResources);
            if (xResources.objId) {
              processed[xResources.objId] = true;
            }
          }
        }
      }
      return false;
    },

    buildFormXObject: function PartialEvaluator_buildFormXObject(resources,
                                                                 xobj, smask,
                                                                 operatorList,
                                                                 initialState) {
      var matrix = xobj.dict.get('Matrix');
      var bbox = xobj.dict.get('BBox');
      var group = xobj.dict.get('Group');
      if (group) {
        var groupOptions = {
          matrix: matrix,
          bbox: bbox,
          smask: smask,
          isolated: false,
          knockout: false
        };

        var groupSubtype = group.get('S');
        var colorSpace;
        if (isName(groupSubtype) && groupSubtype.name === 'Transparency') {
          groupOptions.isolated = (group.get('I') || false);
          groupOptions.knockout = (group.get('K') || false);
          colorSpace = (group.has('CS') ?
            ColorSpace.parse(group.get('CS'), this.xref, resources) : null);
        }

        if (smask && smask.backdrop) {
          colorSpace = colorSpace || ColorSpace.singletons.rgb;
          smask.backdrop = colorSpace.getRgb(smask.backdrop, 0);
        }

        operatorList.addOp(OPS.beginGroup, [groupOptions]);
      }

      operatorList.addOp(OPS.paintFormXObjectBegin, [matrix, bbox]);

      return this.getOperatorList(xobj,
        (xobj.dict.get('Resources') || resources), operatorList, initialState).
        then(function () {
          operatorList.addOp(OPS.paintFormXObjectEnd, []);

          if (group) {
            operatorList.addOp(OPS.endGroup, [groupOptions]);
          }
        });
    },

    buildPaintImageXObject:
        function PartialEvaluator_buildPaintImageXObject(resources, image,
                                                         inline, operatorList,
                                                         cacheKey, cache) {
      var self = this;
      var dict = image.dict;
      var w = dict.get('Width', 'W');
      var h = dict.get('Height', 'H');

      if (!(w && isNum(w)) || !(h && isNum(h))) {
        warn('Image dimensions are missing, or not numbers.');
        return;
      }
      if (PDFJS.maxImageSize !== -1 && w * h > PDFJS.maxImageSize) {
        warn('Image exceeded maximum allowed size and was removed.');
        return;
      }

      var imageMask = (dict.get('ImageMask', 'IM') || false);
      var imgData, args;
      if (imageMask) {
        // This depends on a tmpCanvas being filled with the
        // current fillStyle, such that processing the pixel
        // data can't be done here. Instead of creating a
        // complete PDFImage, only read the information needed
        // for later.

        var width = dict.get('Width', 'W');
        var height = dict.get('Height', 'H');
        var bitStrideLength = (width + 7) >> 3;
        var imgArray = image.getBytes(bitStrideLength * height);
        var decode = dict.get('Decode', 'D');
        var inverseDecode = (!!decode && decode[0] > 0);

        imgData = PDFImage.createMask(imgArray, width, height,
                                      image instanceof DecodeStream,
                                      inverseDecode);
        imgData.cached = true;
        args = [imgData];
        operatorList.addOp(OPS.paintImageMaskXObject, args);
        if (cacheKey) {
          cache.key = cacheKey;
          cache.fn = OPS.paintImageMaskXObject;
          cache.args = args;
        }
        return;
      }

      var softMask = (dict.get('SMask', 'SM') || false);
      var mask = (dict.get('Mask') || false);

      var SMALL_IMAGE_DIMENSIONS = 200;
      // Inlining small images into the queue as RGB data
      if (inline && !softMask && !mask && !(image instanceof JpegStream) &&
          (w + h) < SMALL_IMAGE_DIMENSIONS) {
        var imageObj = new PDFImage(this.xref, resources, image,
                                    inline, null, null);
        // We force the use of RGBA_32BPP images here, because we can't handle
        // any other kind.
        imgData = imageObj.createImageData(/* forceRGBA = */ true);
        operatorList.addOp(OPS.paintInlineImageXObject, [imgData]);
        return;
      }

      // If there is no imageMask, create the PDFImage and a lot
      // of image processing can be done here.
      var uniquePrefix = (this.uniquePrefix || '');
      var objId = 'img_' + uniquePrefix + (++this.idCounters.obj);
      operatorList.addDependency(objId);
      args = [objId, w, h];

      if (!softMask && !mask && image instanceof JpegStream &&
          image.isNativelySupported(this.xref, resources)) {
        // These JPEGs don't need any more processing so we can just send it.
        operatorList.addOp(OPS.paintJpegXObject, args);
        this.handler.send('obj',
          [objId, this.pageIndex, 'JpegStream', image.getIR()]);
        return;
      }

      PDFImage.buildImage(self.handler, self.xref, resources, image, inline).
        then(function(imageObj) {
          var imgData = imageObj.createImageData(/* forceRGBA = */ false);
          self.handler.send('obj', [objId, self.pageIndex, 'Image', imgData],
            [imgData.data.buffer]);
        }).then(null, function (reason) {
          warn('Unable to decode image: ' + reason);
          self.handler.send('obj', [objId, self.pageIndex, 'Image', null]);
        });

      operatorList.addOp(OPS.paintImageXObject, args);
      if (cacheKey) {
        cache.key = cacheKey;
        cache.fn = OPS.paintImageXObject;
        cache.args = args;
      }
    },

    handleSMask: function PartialEvaluator_handleSmask(smask, resources,
                                                       operatorList,
                                                       stateManager) {
      var smaskContent = smask.get('G');
      var smaskOptions = {
        subtype: smask.get('S').name,
        backdrop: smask.get('BC')
      };
      return this.buildFormXObject(resources, smaskContent, smaskOptions,
                            operatorList, stateManager.state.clone());
    },

    handleTilingType:
        function PartialEvaluator_handleTilingType(fn, args, resources,
                                                   pattern, patternDict,
                                                   operatorList) {
      // Create an IR of the pattern code.
      var tilingOpList = new OperatorList();
      return this.getOperatorList(pattern,
        (patternDict.get('Resources') || resources), tilingOpList).
        then(function () {
          // Add the dependencies to the parent operator list so they are
          // resolved before sub operator list is executed synchronously.
          operatorList.addDependencies(tilingOpList.dependencies);
          operatorList.addOp(fn, getTilingPatternIR({
            fnArray: tilingOpList.fnArray,
            argsArray: tilingOpList.argsArray
          }, patternDict, args));
        });
    },

    handleSetFont:
        function PartialEvaluator_handleSetFont(resources, fontArgs, fontRef,
                                                operatorList, state) {
      // TODO(mack): Not needed?
      var fontName;
      if (fontArgs) {
        fontArgs = fontArgs.slice();
        fontName = fontArgs[0].name;
      }

      var self = this;
      return this.loadFont(fontName, fontRef, this.xref, resources).then(
          function (translated) {
        if (!translated.font.isType3Font) {
          return translated;
        }
        return translated.loadType3Data(self, resources, operatorList).then(
            function () {
          return translated;
        });
      }).then(function (translated) {
        state.font = translated.font;
        translated.send(self.handler);
        return translated.loadedName;
      });
    },

    handleText: function PartialEvaluator_handleText(chars, state) {
      var font = state.font;
      var glyphs = font.charsToGlyphs(chars);
      var isAddToPathSet = !!(state.textRenderingMode &
                              TextRenderingMode.ADD_TO_PATH_FLAG);
      if (font.data && (isAddToPathSet || PDFJS.disableFontFace)) {
        var buildPath = function (fontChar) {
          if (!font.renderer.hasBuiltPath(fontChar)) {
            var path = font.renderer.getPathJs(fontChar);
            this.handler.send('commonobj', [
              font.loadedName + '_path_' + fontChar,
              'FontPath',
              path
            ]);
          }
        }.bind(this);

        for (var i = 0, ii = glyphs.length; i < ii; i++) {
          var glyph = glyphs[i];
          if (glyph === null) {
            continue;
          }
          buildPath(glyph.fontChar);

          // If the glyph has an accent we need to build a path for its
          // fontChar too, otherwise CanvasGraphics_paintChar will fail.
          var accent = glyph.accent;
          if (accent && accent.fontChar) {
            buildPath(accent.fontChar);
          }
        }
      }

      return glyphs;
    },

    setGState: function PartialEvaluator_setGState(resources, gState,
                                                   operatorList, xref,
                                                   stateManager) {
      // This array holds the converted/processed state data.
      var gStateObj = [];
      var gStateMap = gState.map;
      var self = this;
      var promise = Promise.resolve();
      for (var key in gStateMap) {
        var value = gStateMap[key];
        switch (key) {
          case 'Type':
            break;
          case 'LW':
          case 'LC':
          case 'LJ':
          case 'ML':
          case 'D':
          case 'RI':
          case 'FL':
          case 'CA':
          case 'ca':
            gStateObj.push([key, value]);
            break;
          case 'Font':
            promise = promise.then(function () {
              return self.handleSetFont(resources, null, value[0],
                                        operatorList, stateManager.state).
                then(function (loadedName) {
                  operatorList.addDependency(loadedName);
                  gStateObj.push([key, [loadedName, value[1]]]);
                });
            });
            break;
          case 'BM':
            gStateObj.push([key, value]);
            break;
          case 'SMask':
            if (isName(value) && value.name === 'None') {
              gStateObj.push([key, false]);
              break;
            }
            var dict = xref.fetchIfRef(value);
            if (isDict(dict)) {
              promise = promise.then(function () {
                return self.handleSMask(dict, resources, operatorList,
                                        stateManager);
              });
              gStateObj.push([key, true]);
            } else {
              warn('Unsupported SMask type');
            }

            break;
          // Only generate info log messages for the following since
          // they are unlikely to have a big impact on the rendering.
          case 'OP':
          case 'op':
          case 'OPM':
          case 'BG':
          case 'BG2':
          case 'UCR':
          case 'UCR2':
          case 'TR':
          case 'TR2':
          case 'HT':
          case 'SM':
          case 'SA':
          case 'AIS':
          case 'TK':
            // TODO implement these operators.
            info('graphic state operator ' + key);
            break;
          default:
            info('Unknown graphic state operator ' + key);
            break;
        }
      }
      return promise.then(function () {
        if (gStateObj.length >= 0) {
          operatorList.addOp(OPS.setGState, [gStateObj]);
        }
      });
    },

    loadFont: function PartialEvaluator_loadFont(fontName, font, xref,
                                                 resources) {

      function errorFont() {
        return Promise.resolve(new TranslatedFont('g_font_error',
          new ErrorFont('Font ' + fontName + ' is not available'), font));
      }
      var fontRef;
      if (font) { // Loading by ref.
        assert(isRef(font));
        fontRef = font;
      } else { // Loading by name.
        var fontRes = resources.get('Font');
        if (fontRes) {
          fontRef = fontRes.getRaw(fontName);
        } else {
          warn('fontRes not available');
          return errorFont();
        }
      }
      if (!fontRef) {
        warn('fontRef not available');
        return errorFont();
      }

      if (this.fontCache.has(fontRef)) {
        return this.fontCache.get(fontRef);
      }

      font = xref.fetchIfRef(fontRef);
      if (!isDict(font)) {
        return errorFont();
      }

      // We are holding font.translated references just for fontRef that are not
      // dictionaries (Dict). See explanation below.
      if (font.translated) {
        return font.translated;
      }

      var fontCapability = createPromiseCapability();

      var preEvaluatedFont = this.preEvaluateFont(font, xref);
      var descriptor = preEvaluatedFont.descriptor;
      var fontID = fontRef.num + '_' + fontRef.gen;
      if (isDict(descriptor)) {
        if (!descriptor.fontAliases) {
          descriptor.fontAliases = Object.create(null);
        }

        var fontAliases = descriptor.fontAliases;
        var hash = preEvaluatedFont.hash;
        if (fontAliases[hash]) {
          var aliasFontRef = fontAliases[hash].aliasRef;
          if (aliasFontRef && this.fontCache.has(aliasFontRef)) {
            this.fontCache.putAlias(fontRef, aliasFontRef);
            return this.fontCache.get(fontRef);
          }
        }

        if (!fontAliases[hash]) {
          fontAliases[hash] = {
            fontID: Font.getFontID()
          };
        }

        fontAliases[hash].aliasRef = fontRef;
        fontID = fontAliases[hash].fontID;
      }

      // Workaround for bad PDF generators that don't reference fonts
      // properly, i.e. by not using an object identifier.
      // Check if the fontRef is a Dict (as opposed to a standard object),
      // in which case we don't cache the font and instead reference it by
      // fontName in font.loadedName below.
      var fontRefIsDict = isDict(fontRef);
      if (!fontRefIsDict) {
        this.fontCache.put(fontRef, fontCapability.promise);
      }

      // Keep track of each font we translated so the caller can
      // load them asynchronously before calling display on a page.
      font.loadedName = 'g_font_' + (fontRefIsDict ?
        fontName.replace(/\W/g, '') : fontID);

      font.translated = fontCapability.promise;

      // TODO move promises into translate font
      var translatedPromise;
      try {
        translatedPromise = Promise.resolve(
          this.translateFont(preEvaluatedFont, xref));
      } catch (e) {
        translatedPromise = Promise.reject(e);
      }

      translatedPromise.then(function (translatedFont) {
        if (translatedFont.fontType !== undefined) {
          var xrefFontStats = xref.stats.fontTypes;
          xrefFontStats[translatedFont.fontType] = true;
        }

        fontCapability.resolve(new TranslatedFont(font.loadedName,
          translatedFont, font));
      }, function (reason) {
        // TODO fontCapability.reject?
        UnsupportedManager.notify(UNSUPPORTED_FEATURES.font);

        try {
          // error, but it's still nice to have font type reported
          var descriptor = preEvaluatedFont.descriptor;
          var fontFile3 = descriptor && descriptor.get('FontFile3');
          var subtype = fontFile3 && fontFile3.get('Subtype');
          var fontType = getFontType(preEvaluatedFont.type,
                                     subtype && subtype.name);
          var xrefFontStats = xref.stats.fontTypes;
          xrefFontStats[fontType] = true;
        } catch (ex) { }

        fontCapability.resolve(new TranslatedFont(font.loadedName,
          new ErrorFont(reason instanceof Error ? reason.message : reason),
          font));
      });
      return fontCapability.promise;
    },

    buildPath: function PartialEvaluator_buildPath(operatorList, fn, args) {
      var lastIndex = operatorList.length - 1;
      if (!args) {
        args = [];
      }
      if (lastIndex < 0 ||
          operatorList.fnArray[lastIndex] !== OPS.constructPath) {
        operatorList.addOp(OPS.constructPath, [[fn], args]);
      } else {
        var opArgs = operatorList.argsArray[lastIndex];
        opArgs[0].push(fn);
        Array.prototype.push.apply(opArgs[1], args);
      }
    },

    handleColorN: function PartialEvaluator_handleColorN(operatorList, fn, args,
          cs, patterns, resources, xref) {
      // compile tiling patterns
      var patternName = args[args.length - 1];
      // SCN/scn applies patterns along with normal colors
      var pattern;
      if (isName(patternName) &&
          (pattern = patterns.get(patternName.name))) {
        var dict = (isStream(pattern) ? pattern.dict : pattern);
        var typeNum = dict.get('PatternType');

        if (typeNum === TILING_PATTERN) {
          var color = cs.base ? cs.base.getRgb(args, 0) : null;
          return this.handleTilingType(fn, color, resources, pattern,
                                       dict, operatorList);
        } else if (typeNum === SHADING_PATTERN) {
          var shading = dict.get('Shading');
          var matrix = dict.get('Matrix');
          pattern = Pattern.parseShading(shading, matrix, xref, resources);
          operatorList.addOp(fn, pattern.getIR());
          return Promise.resolve();
        } else {
          return Promise.reject('Unknown PatternType: ' + typeNum);
        }
      }
      // TODO shall we fail here?
      operatorList.addOp(fn, args);
      return Promise.resolve();
    },

    getOperatorList: function PartialEvaluator_getOperatorList(stream,
                                                               resources,
                                                               operatorList,
                                                               initialState) {

      var self = this;
      var xref = this.xref;
      var imageCache = {};

      assert(operatorList);

      resources = (resources || Dict.empty);
      var xobjs = (resources.get('XObject') || Dict.empty);
      var patterns = (resources.get('Pattern') || Dict.empty);
      var stateManager = new StateManager(initialState || new EvalState());
      var preprocessor = new EvaluatorPreprocessor(stream, xref, stateManager);
      var timeSlotManager = new TimeSlotManager();

      return new Promise(function next(resolve, reject) {
        timeSlotManager.reset();
        var stop, operation = {}, i, ii, cs;
        while (!(stop = timeSlotManager.check())) {
          // The arguments parsed by read() are used beyond this loop, so we
          // cannot reuse the same array on each iteration. Therefore we pass
          // in |null| as the initial value (see the comment on
          // EvaluatorPreprocessor_read() for why).
          operation.args = null;
          if (!(preprocessor.read(operation))) {
            break;
          }
          var args = operation.args;
          var fn = operation.fn;

          switch (fn | 0) {
            case OPS.paintXObject:
              if (args[0].code) {
                break;
              }
              // eagerly compile XForm objects
              var name = args[0].name;
              if (imageCache.key === name) {
                operatorList.addOp(imageCache.fn, imageCache.args);
                args = null;
                continue;
              }

              var xobj = xobjs.get(name);
              if (xobj) {
                assert(isStream(xobj), 'XObject should be a stream');

                var type = xobj.dict.get('Subtype');
                assert(isName(type),
                  'XObject should have a Name subtype');

                if (type.name === 'Form') {
                  stateManager.save();
                  return self.buildFormXObject(resources, xobj, null,
                                               operatorList,
                                               stateManager.state.clone()).
                    then(function () {
                      stateManager.restore();
                      next(resolve, reject);
                    }, reject);
                } else if (type.name === 'Image') {
                  self.buildPaintImageXObject(resources, xobj, false,
                    operatorList, name, imageCache);
                  args = null;
                  continue;
                } else if (type.name === 'PS') {
                  // PostScript XObjects are unused when viewing documents.
                  // See section 4.7.1 of Adobe's PDF reference.
                  info('Ignored XObject subtype PS');
                  continue;
                } else {
                  error('Unhandled XObject subtype ' + type.name);
                }
              }
              break;
            case OPS.setFont:
              var fontSize = args[1];
              // eagerly collect all fonts
              return self.handleSetFont(resources, args, null,
                                        operatorList, stateManager.state).
                then(function (loadedName) {
                  operatorList.addDependency(loadedName);
                  operatorList.addOp(OPS.setFont, [loadedName, fontSize]);
                  next(resolve, reject);
                }, reject);
            case OPS.endInlineImage:
              var cacheKey = args[0].cacheKey;
              if (cacheKey && imageCache.key === cacheKey) {
                operatorList.addOp(imageCache.fn, imageCache.args);
                args = null;
                continue;
              }
              self.buildPaintImageXObject(resources, args[0], true,
                operatorList, cacheKey, imageCache);
              args = null;
              continue;
            case OPS.showText:
              args[0] = self.handleText(args[0], stateManager.state);
              break;
            case OPS.showSpacedText:
              var arr = args[0];
              var combinedGlyphs = [];
              var arrLength = arr.length;
              for (i = 0; i < arrLength; ++i) {
                var arrItem = arr[i];
                if (isString(arrItem)) {
                  Array.prototype.push.apply(combinedGlyphs,
                    self.handleText(arrItem, stateManager.state));
                } else if (isNum(arrItem)) {
                  combinedGlyphs.push(arrItem);
                }
              }
              args[0] = combinedGlyphs;
              fn = OPS.showText;
              break;
            case OPS.nextLineShowText:
              operatorList.addOp(OPS.nextLine);
              args[0] = self.handleText(args[0], stateManager.state);
              fn = OPS.showText;
              break;
            case OPS.nextLineSetSpacingShowText:
              operatorList.addOp(OPS.nextLine);
              operatorList.addOp(OPS.setWordSpacing, [args.shift()]);
              operatorList.addOp(OPS.setCharSpacing, [args.shift()]);
              args[0] = self.handleText(args[0], stateManager.state);
              fn = OPS.showText;
              break;
            case OPS.setTextRenderingMode:
              stateManager.state.textRenderingMode = args[0];
              break;

            case OPS.setFillColorSpace:
              stateManager.state.fillColorSpace =
                ColorSpace.parse(args[0], xref, resources);
              continue;
            case OPS.setStrokeColorSpace:
              stateManager.state.strokeColorSpace =
                ColorSpace.parse(args[0], xref, resources);
              continue;
            case OPS.setFillColor:
              cs = stateManager.state.fillColorSpace;
              args = cs.getRgb(args, 0);
              fn = OPS.setFillRGBColor;
              break;
            case OPS.setStrokeColor:
              cs = stateManager.state.strokeColorSpace;
              args = cs.getRgb(args, 0);
              fn = OPS.setStrokeRGBColor;
              break;
            case OPS.setFillGray:
              stateManager.state.fillColorSpace = ColorSpace.singletons.gray;
              args = ColorSpace.singletons.gray.getRgb(args, 0);
              fn = OPS.setFillRGBColor;
              break;
            case OPS.setStrokeGray:
              stateManager.state.strokeColorSpace = ColorSpace.singletons.gray;
              args = ColorSpace.singletons.gray.getRgb(args, 0);
              fn = OPS.setStrokeRGBColor;
              break;
            case OPS.setFillCMYKColor:
              stateManager.state.fillColorSpace = ColorSpace.singletons.cmyk;
              args = ColorSpace.singletons.cmyk.getRgb(args, 0);
              fn = OPS.setFillRGBColor;
              break;
            case OPS.setStrokeCMYKColor:
              stateManager.state.strokeColorSpace = ColorSpace.singletons.cmyk;
              args = ColorSpace.singletons.cmyk.getRgb(args, 0);
              fn = OPS.setStrokeRGBColor;
              break;
            case OPS.setFillRGBColor:
              stateManager.state.fillColorSpace = ColorSpace.singletons.rgb;
              args = ColorSpace.singletons.rgb.getRgb(args, 0);
              break;
            case OPS.setStrokeRGBColor:
              stateManager.state.strokeColorSpace = ColorSpace.singletons.rgb;
              args = ColorSpace.singletons.rgb.getRgb(args, 0);
              break;
            case OPS.setFillColorN:
              cs = stateManager.state.fillColorSpace;
              if (cs.name === 'Pattern') {
                return self.handleColorN(operatorList, OPS.setFillColorN,
                  args, cs, patterns, resources, xref).then(function() {
                    next(resolve, reject);
                  }, reject);
              }
              args = cs.getRgb(args, 0);
              fn = OPS.setFillRGBColor;
              break;
            case OPS.setStrokeColorN:
              cs = stateManager.state.strokeColorSpace;
              if (cs.name === 'Pattern') {
                return self.handleColorN(operatorList, OPS.setStrokeColorN,
                  args, cs, patterns, resources, xref).then(function() {
                    next(resolve, reject);
                  }, reject);
              }
              args = cs.getRgb(args, 0);
              fn = OPS.setStrokeRGBColor;
              break;

            case OPS.shadingFill:
              var shadingRes = resources.get('Shading');
              if (!shadingRes) {
                error('No shading resource found');
              }

              var shading = shadingRes.get(args[0].name);
              if (!shading) {
                error('No shading object found');
              }

              var shadingFill = Pattern.parseShading(shading, null, xref,
                resources);
              var patternIR = shadingFill.getIR();
              args = [patternIR];
              fn = OPS.shadingFill;
              break;
            case OPS.setGState:
              var dictName = args[0];
              var extGState = resources.get('ExtGState');

              if (!isDict(extGState) || !extGState.has(dictName.name)) {
                break;
              }

              var gState = extGState.get(dictName.name);
              return self.setGState(resources, gState, operatorList, xref,
                stateManager).then(function() {
                  next(resolve, reject);
                }, reject);
            case OPS.moveTo:
            case OPS.lineTo:
            case OPS.curveTo:
            case OPS.curveTo2:
            case OPS.curveTo3:
            case OPS.closePath:
              self.buildPath(operatorList, fn, args);
              continue;
            case OPS.rectangle:
              self.buildPath(operatorList, fn, args);
              continue;
          }
          operatorList.addOp(fn, args);
        }
        if (stop) {
          deferred.then(function () {
            next(resolve, reject);
          });
          return;
        }
        // Some PDFs don't close all restores inside object/form.
        // Closing those for them.
        for (i = 0, ii = preprocessor.savedStatesDepth; i < ii; i++) {
          operatorList.addOp(OPS.restore, []);
        }
        resolve();
      });
    },

    getTextContent: function PartialEvaluator_getTextContent(stream, resources,
                                                             stateManager) {

      stateManager = (stateManager || new StateManager(new TextState()));

      var textContent = {
        items: [],
        styles: Object.create(null)
      };
      var bidiTexts = textContent.items;
      var SPACE_FACTOR = 0.35;
      var MULTI_SPACE_FACTOR = 1.5;

      var self = this;
      var xref = this.xref;

      resources = (xref.fetchIfRef(resources) || Dict.empty);

      // The xobj is parsed iff it's needed, e.g. if there is a `DO` cmd.
      var xobjs = null;
      var xobjsCache = {};

      var preprocessor = new EvaluatorPreprocessor(stream, xref, stateManager);

      var textState;

      function newTextChunk() {
        var font = textState.font;
        if (!(font.loadedName in textContent.styles)) {
          textContent.styles[font.loadedName] = {
            fontFamily: font.fallbackName,
            ascent: font.ascent,
            descent: font.descent,
            vertical: font.vertical
          };
        }
        return {
          // |str| is initially an array which we push individual chars to, and
          // then runBidi() overwrites it with the final string.
          str: [],
          dir: null,
          width: 0,
          height: 0,
          transform: null,
          fontName: font.loadedName
        };
      }

      function runBidi(textChunk) {
        var str = textChunk.str.join('');
        var bidiResult = PDFJS.bidi(str, -1, textState.font.vertical);
        textChunk.str = bidiResult.str;
        textChunk.dir = bidiResult.dir;
        return textChunk;
      }

      function handleSetFont(fontName, fontRef) {
        return self.loadFont(fontName, fontRef, xref, resources).
          then(function (translated) {
            textState.font = translated.font;
            textState.fontMatrix = translated.font.fontMatrix ||
              FONT_IDENTITY_MATRIX;
          });
      }

      function buildTextGeometry(chars, textChunk) {
        var font = textState.font;
        textChunk = textChunk || newTextChunk();
        if (!textChunk.transform) {
          // 9.4.4 Text Space Details
          var tsm = [textState.fontSize * textState.textHScale, 0,
                     0, textState.fontSize,
                     0, textState.textRise];
          var trm = textChunk.transform = Util.transform(textState.ctm,
                                    Util.transform(textState.textMatrix, tsm));
          if (!font.vertical) {
            textChunk.height = Math.sqrt(trm[2] * trm[2] + trm[3] * trm[3]);
          } else {
            textChunk.width = Math.sqrt(trm[0] * trm[0] + trm[1] * trm[1]);
          }
        }
        var width = 0;
        var height = 0;
        var glyphs = font.charsToGlyphs(chars);
        var defaultVMetrics = font.defaultVMetrics;
        for (var i = 0; i < glyphs.length; i++) {
          var glyph = glyphs[i];
          if (!glyph) { // Previous glyph was a space.
            width += textState.wordSpacing * textState.textHScale;
            continue;
          }
          var vMetricX = null;
          var vMetricY = null;
          var glyphWidth = null;
          if (font.vertical) {
            if (glyph.vmetric) {
              glyphWidth = glyph.vmetric[0];
              vMetricX = glyph.vmetric[1];
              vMetricY = glyph.vmetric[2];
            } else {
              glyphWidth = glyph.width;
              vMetricX = glyph.width * 0.5;
              vMetricY = defaultVMetrics[2];
            }
          } else {
            glyphWidth = glyph.width;
          }

          var glyphUnicode = glyph.unicode;
          if (NormalizedUnicodes[glyphUnicode] !== undefined) {
            glyphUnicode = NormalizedUnicodes[glyphUnicode];
          }
          glyphUnicode = reverseIfRtl(glyphUnicode);

          // The following will calculate the x and y of the individual glyphs.
          // if (font.vertical) {
          //   tsm[4] -= vMetricX * Math.abs(textState.fontSize) *
          //             textState.fontMatrix[0];
          //   tsm[5] -= vMetricY * textState.fontSize *
          //             textState.fontMatrix[0];
          // }
          // var trm = Util.transform(textState.textMatrix, tsm);
          // var pt = Util.applyTransform([trm[4], trm[5]], textState.ctm);
          // var x = pt[0];
          // var y = pt[1];

          var tx = 0;
          var ty = 0;
          if (!font.vertical) {
            var w0 = glyphWidth * textState.fontMatrix[0];
            tx = (w0 * textState.fontSize + textState.charSpacing) *
                 textState.textHScale;
            width += tx;
          } else {
            var w1 = glyphWidth * textState.fontMatrix[0];
            ty = w1 * textState.fontSize + textState.charSpacing;
            height += ty;
          }
          textState.translateTextMatrix(tx, ty);

          textChunk.str.push(glyphUnicode);
        }

        var a = textState.textLineMatrix[0];
        var b = textState.textLineMatrix[1];
        var scaleLineX = Math.sqrt(a * a + b * b);
        a = textState.ctm[0];
        b = textState.ctm[1];
        var scaleCtmX = Math.sqrt(a * a + b * b);
        if (!font.vertical) {
          textChunk.width += width * scaleCtmX * scaleLineX;
        } else {
          textChunk.height += Math.abs(height * scaleCtmX * scaleLineX);
        }
        return textChunk;
      }

      var timeSlotManager = new TimeSlotManager();

      return new Promise(function next(resolve, reject) {
        timeSlotManager.reset();
        var stop, operation = {}, args = [];
        while (!(stop = timeSlotManager.check())) {
          // The arguments parsed by read() are not used beyond this loop, so
          // we can reuse the same array on every iteration, thus avoiding
          // unnecessary allocations.
          args.length = 0;
          operation.args = args;
          if (!(preprocessor.read(operation))) {
            break;
          }
          textState = stateManager.state;
          var fn = operation.fn;
          args = operation.args;

          switch (fn | 0) {
            case OPS.setFont:
              textState.fontSize = args[1];
              return handleSetFont(args[0].name).then(function() {
                next(resolve, reject);
              }, reject);
            case OPS.setTextRise:
              textState.textRise = args[0];
              break;
            case OPS.setHScale:
              textState.textHScale = args[0] / 100;
              break;
            case OPS.setLeading:
              textState.leading = args[0];
              break;
            case OPS.moveText:
              textState.translateTextLineMatrix(args[0], args[1]);
              textState.textMatrix = textState.textLineMatrix.slice();
              break;
            case OPS.setLeadingMoveText:
              textState.leading = -args[1];
              textState.translateTextLineMatrix(args[0], args[1]);
              textState.textMatrix = textState.textLineMatrix.slice();
              break;
            case OPS.nextLine:
              textState.carriageReturn();
              break;
            case OPS.setTextMatrix:
              textState.setTextMatrix(args[0], args[1], args[2], args[3],
                args[4], args[5]);
              textState.setTextLineMatrix(args[0], args[1], args[2], args[3],
                args[4], args[5]);
              break;
            case OPS.setCharSpacing:
              textState.charSpacing = args[0];
              break;
            case OPS.setWordSpacing:
              textState.wordSpacing = args[0];
              break;
            case OPS.beginText:
              textState.textMatrix = IDENTITY_MATRIX.slice();
              textState.textLineMatrix = IDENTITY_MATRIX.slice();
              break;
            case OPS.showSpacedText:
              var items = args[0];
              var textChunk = newTextChunk();
              var offset;
              for (var j = 0, jj = items.length; j < jj; j++) {
                if (typeof items[j] === 'string') {
                  buildTextGeometry(items[j], textChunk);
                } else {
                  var val = items[j] / 1000;
                  if (!textState.font.vertical) {
                    offset = -val * textState.fontSize * textState.textHScale *
                      textState.textMatrix[0];
                    textState.translateTextMatrix(offset, 0);
                    textChunk.width += offset;
                  } else {
                    offset = -val * textState.fontSize *
                      textState.textMatrix[3];
                    textState.translateTextMatrix(0, offset);
                    textChunk.height += offset;
                  }
                  if (items[j] < 0 && textState.font.spaceWidth > 0) {
                    var fakeSpaces = -items[j] / textState.font.spaceWidth;
                    if (fakeSpaces > MULTI_SPACE_FACTOR) {
                      fakeSpaces = Math.round(fakeSpaces);
                      while (fakeSpaces--) {
                        textChunk.str.push(' ');
                      }
                    } else if (fakeSpaces > SPACE_FACTOR) {
                      textChunk.str.push(' ');
                    }
                  }
                }
              }
              bidiTexts.push(runBidi(textChunk));
              break;
            case OPS.showText:
              bidiTexts.push(runBidi(buildTextGeometry(args[0])));
              break;
            case OPS.nextLineShowText:
              textState.carriageReturn();
              bidiTexts.push(runBidi(buildTextGeometry(args[0])));
              break;
            case OPS.nextLineSetSpacingShowText:
              textState.wordSpacing = args[0];
              textState.charSpacing = args[1];
              textState.carriageReturn();
              bidiTexts.push(runBidi(buildTextGeometry(args[2])));
              break;
            case OPS.paintXObject:
              if (args[0].code) {
                break;
              }

              if (!xobjs) {
                xobjs = (resources.get('XObject') || Dict.empty);
              }

              var name = args[0].name;
              if (xobjsCache.key === name) {
                if (xobjsCache.texts) {
                  Util.appendToArray(bidiTexts, xobjsCache.texts.items);
                  Util.extendObj(textContent.styles, xobjsCache.texts.styles);
                }
                break;
              }

              var xobj = xobjs.get(name);
              if (!xobj) {
                break;
              }
              assert(isStream(xobj), 'XObject should be a stream');

              var type = xobj.dict.get('Subtype');
              assert(isName(type),
                'XObject should have a Name subtype');

              if ('Form' !== type.name) {
                xobjsCache.key = name;
                xobjsCache.texts = null;
                break;
              }

              stateManager.save();
              var matrix = xobj.dict.get('Matrix');
              if (isArray(matrix) && matrix.length === 6) {
                stateManager.transform(matrix);
              }

              return self.getTextContent(xobj,
                xobj.dict.get('Resources') || resources, stateManager).
                then(function (formTextContent) {
                  Util.appendToArray(bidiTexts, formTextContent.items);
                  Util.extendObj(textContent.styles, formTextContent.styles);
                  stateManager.restore();

                  xobjsCache.key = name;
                  xobjsCache.texts = formTextContent;

                  next(resolve, reject);
                }, reject);
            case OPS.setGState:
              var dictName = args[0];
              var extGState = resources.get('ExtGState');

              if (!isDict(extGState) || !extGState.has(dictName.name)) {
                break;
              }

              var gsStateMap = extGState.get(dictName.name);
              var gsStateFont = null;
              for (var key in gsStateMap) {
                if (key === 'Font') {
                  assert(!gsStateFont);
                  gsStateFont = gsStateMap[key];
                }
              }
              if (gsStateFont) {
                textState.fontSize = gsStateFont[1];
                return handleSetFont(gsStateFont[0]).then(function() {
                  next(resolve, reject);
                }, reject);
              }
              break;
          } // switch
        } // while
        if (stop) {
          deferred.then(function () {
            next(resolve, reject);
          });
          return;
        }
        resolve(textContent);
      });
    },

    extractDataStructures: function
      partialEvaluatorExtractDataStructures(dict, baseDict,
                                            xref, properties) {
      // 9.10.2
      var toUnicode = (dict.get('ToUnicode') || baseDict.get('ToUnicode'));
      if (toUnicode) {
        properties.toUnicode = this.readToUnicode(toUnicode);
      }
      if (properties.composite) {
        // CIDSystemInfo helps to match CID to glyphs
        var cidSystemInfo = dict.get('CIDSystemInfo');
        if (isDict(cidSystemInfo)) {
          properties.cidSystemInfo = {
            registry: cidSystemInfo.get('Registry'),
            ordering: cidSystemInfo.get('Ordering'),
            supplement: cidSystemInfo.get('Supplement')
          };
        }

        var cidToGidMap = dict.get('CIDToGIDMap');
        if (isStream(cidToGidMap)) {
          properties.cidToGidMap = this.readCidToGidMap(cidToGidMap);
        }
      }

      // Based on 9.6.6 of the spec the encoding can come from multiple places
      // and depends on the font type. The base encoding and differences are
      // read here, but the encoding that is actually used is chosen during
      // glyph mapping in the font.
      // TODO: Loading the built in encoding in the font would allow the
      // differences to be merged in here not require us to hold on to it.
      var differences = [];
      var baseEncodingName = null;
      var encoding;
      if (dict.has('Encoding')) {
        encoding = dict.get('Encoding');
        if (isDict(encoding)) {
          baseEncodingName = encoding.get('BaseEncoding');
          baseEncodingName = (isName(baseEncodingName) ?
                              baseEncodingName.name : null);
          // Load the differences between the base and original
          if (encoding.has('Differences')) {
            var diffEncoding = encoding.get('Differences');
            var index = 0;
            for (var j = 0, jj = diffEncoding.length; j < jj; j++) {
              var data = diffEncoding[j];
              if (isNum(data)) {
                index = data;
              } else {
                differences[index++] = data.name;
              }
            }
          }
        } else if (isName(encoding)) {
          baseEncodingName = encoding.name;
        } else {
          error('Encoding is not a Name nor a Dict');
        }
        // According to table 114 if the encoding is a named encoding it must be
        // one of these predefined encodings.
        if ((baseEncodingName !== 'MacRomanEncoding' &&
             baseEncodingName !== 'MacExpertEncoding' &&
             baseEncodingName !== 'WinAnsiEncoding')) {
          baseEncodingName = null;
        }
      }

      if (baseEncodingName) {
        properties.defaultEncoding = Encodings[baseEncodingName].slice();
      } else {
        encoding = (properties.type === 'TrueType' ?
                    Encodings.WinAnsiEncoding : Encodings.StandardEncoding);
        // The Symbolic attribute can be misused for regular fonts
        // Heuristic: we have to check if the font is a standard one also
        if (!!(properties.flags & FontFlags.Symbolic)) {
          encoding = Encodings.MacRomanEncoding;
          if (!properties.file) {
            if (/Symbol/i.test(properties.name)) {
              encoding = Encodings.SymbolSetEncoding;
            } else if (/Dingbats/i.test(properties.name)) {
              encoding = Encodings.ZapfDingbatsEncoding;
            }
          }
        }
        properties.defaultEncoding = encoding;
      }

      properties.differences = differences;
      properties.baseEncodingName = baseEncodingName;
      properties.dict = dict;
    },

    readToUnicode: function PartialEvaluator_readToUnicode(toUnicode) {
      var cmap, cmapObj = toUnicode;
      if (isName(cmapObj)) {
        cmap = CMapFactory.create(cmapObj,
          { url: PDFJS.cMapUrl, packed: PDFJS.cMapPacked }, null).getMap();
        return new ToUnicodeMap(cmap);
      } else if (isStream(cmapObj)) {
        cmap = CMapFactory.create(cmapObj,
          { url: PDFJS.cMapUrl, packed: PDFJS.cMapPacked }, null).getMap();
        // Convert UTF-16BE
        // NOTE: cmap can be a sparse array, so use forEach instead of for(;;)
        // to iterate over all keys.
        cmap.forEach(function(token, i) {
          var str = [];
          for (var k = 0; k < token.length; k += 2) {
            var w1 = (token.charCodeAt(k) << 8) | token.charCodeAt(k + 1);
            if ((w1 & 0xF800) !== 0xD800) { // w1 < 0xD800 || w1 > 0xDFFF
              str.push(w1);
              continue;
            }
            k += 2;
            var w2 = (token.charCodeAt(k) << 8) | token.charCodeAt(k + 1);
            str.push(((w1 & 0x3ff) << 10) + (w2 & 0x3ff) + 0x10000);
          }
          cmap[i] = String.fromCharCode.apply(String, str);
        });
        return new ToUnicodeMap(cmap);
      }
      return null;
    },

    readCidToGidMap: function PartialEvaluator_readCidToGidMap(cidToGidStream) {
      // Extract the encoding from the CIDToGIDMap
      var glyphsData = cidToGidStream.getBytes();

      // Set encoding 0 to later verify the font has an encoding
      var result = [];
      for (var j = 0, jj = glyphsData.length; j < jj; j++) {
        var glyphID = (glyphsData[j++] << 8) | glyphsData[j];
        if (glyphID === 0) {
          continue;
        }
        var code = j >> 1;
        result[code] = glyphID;
      }
      return result;
    },

    extractWidths: function PartialEvaluator_extractWidths(dict, xref,
                                                           descriptor,
                                                           properties) {
      var glyphsWidths = [];
      var defaultWidth = 0;
      var glyphsVMetrics = [];
      var defaultVMetrics;
      var i, ii, j, jj, start, code, widths;
      if (properties.composite) {
        defaultWidth = dict.get('DW') || 1000;

        widths = dict.get('W');
        if (widths) {
          for (i = 0, ii = widths.length; i < ii; i++) {
            start = widths[i++];
            code = xref.fetchIfRef(widths[i]);
            if (isArray(code)) {
              for (j = 0, jj = code.length; j < jj; j++) {
                glyphsWidths[start++] = code[j];
              }
            } else {
              var width = widths[++i];
              for (j = start; j <= code; j++) {
                glyphsWidths[j] = width;
              }
            }
          }
        }

        if (properties.vertical) {
          var vmetrics = (dict.get('DW2') || [880, -1000]);
          defaultVMetrics = [vmetrics[1], defaultWidth * 0.5, vmetrics[0]];
          vmetrics = dict.get('W2');
          if (vmetrics) {
            for (i = 0, ii = vmetrics.length; i < ii; i++) {
              start = vmetrics[i++];
              code = xref.fetchIfRef(vmetrics[i]);
              if (isArray(code)) {
                for (j = 0, jj = code.length; j < jj; j++) {
                  glyphsVMetrics[start++] = [code[j++], code[j++], code[j]];
                }
              } else {
                var vmetric = [vmetrics[++i], vmetrics[++i], vmetrics[++i]];
                for (j = start; j <= code; j++) {
                  glyphsVMetrics[j] = vmetric;
                }
              }
            }
          }
        }
      } else {
        var firstChar = properties.firstChar;
        widths = dict.get('Widths');
        if (widths) {
          j = firstChar;
          for (i = 0, ii = widths.length; i < ii; i++) {
            glyphsWidths[j++] = widths[i];
          }
          defaultWidth = (parseFloat(descriptor.get('MissingWidth')) || 0);
        } else {
          // Trying get the BaseFont metrics (see comment above).
          var baseFontName = dict.get('BaseFont');
          if (isName(baseFontName)) {
            var metrics = this.getBaseFontMetrics(baseFontName.name);

            glyphsWidths = this.buildCharCodeToWidth(metrics.widths,
                                                     properties);
            defaultWidth = metrics.defaultWidth;
          }
        }
      }

      // Heuristic: detection of monospace font by checking all non-zero widths
      var isMonospace = true;
      var firstWidth = defaultWidth;
      for (var glyph in glyphsWidths) {
        var glyphWidth = glyphsWidths[glyph];
        if (!glyphWidth) {
          continue;
        }
        if (!firstWidth) {
          firstWidth = glyphWidth;
          continue;
        }
        if (firstWidth !== glyphWidth) {
          isMonospace = false;
          break;
        }
      }
      if (isMonospace) {
        properties.flags |= FontFlags.FixedPitch;
      }

      properties.defaultWidth = defaultWidth;
      properties.widths = glyphsWidths;
      properties.defaultVMetrics = defaultVMetrics;
      properties.vmetrics = glyphsVMetrics;
    },

    isSerifFont: function PartialEvaluator_isSerifFont(baseFontName) {
      // Simulating descriptor flags attribute
      var fontNameWoStyle = baseFontName.split('-')[0];
      return (fontNameWoStyle in serifFonts) ||
              (fontNameWoStyle.search(/serif/gi) !== -1);
    },

    getBaseFontMetrics: function PartialEvaluator_getBaseFontMetrics(name) {
      var defaultWidth = 0;
      var widths = [];
      var monospace = false;
      var lookupName = (stdFontMap[name] || name);

      if (!(lookupName in Metrics)) {
        // Use default fonts for looking up font metrics if the passed
        // font is not a base font
        if (this.isSerifFont(name)) {
          lookupName = 'Times-Roman';
        } else {
          lookupName = 'Helvetica';
        }
      }
      var glyphWidths = Metrics[lookupName];

      if (isNum(glyphWidths)) {
        defaultWidth = glyphWidths;
        monospace = true;
      } else {
        widths = glyphWidths;
      }

      return {
        defaultWidth: defaultWidth,
        monospace: monospace,
        widths: widths
      };
    },

    buildCharCodeToWidth:
        function PartialEvaluator_bulildCharCodeToWidth(widthsByGlyphName,
                                                        properties) {
      var widths = Object.create(null);
      var differences = properties.differences;
      var encoding = properties.defaultEncoding;
      for (var charCode = 0; charCode < 256; charCode++) {
        if (charCode in differences &&
            widthsByGlyphName[differences[charCode]]) {
          widths[charCode] = widthsByGlyphName[differences[charCode]];
          continue;
        }
        if (charCode in encoding && widthsByGlyphName[encoding[charCode]]) {
          widths[charCode] = widthsByGlyphName[encoding[charCode]];
          continue;
        }
      }
      return widths;
    },

    preEvaluateFont: function PartialEvaluator_preEvaluateFont(dict, xref) {
      var baseDict = dict;
      var type = dict.get('Subtype');
      assert(isName(type), 'invalid font Subtype');

      var composite = false;
      var uint8array;
      if (type.name === 'Type0') {
        // If font is a composite
        //  - get the descendant font
        //  - set the type according to the descendant font
        //  - get the FontDescriptor from the descendant font
        var df = dict.get('DescendantFonts');
        if (!df) {
          error('Descendant fonts are not specified');
        }
        dict = (isArray(df) ? xref.fetchIfRef(df[0]) : df);

        type = dict.get('Subtype');
        assert(isName(type), 'invalid font Subtype');
        composite = true;
      }

      var descriptor = dict.get('FontDescriptor');
      if (descriptor) {
        var hash = new MurmurHash3_64();
        var encoding = baseDict.getRaw('Encoding');
        if (isName(encoding)) {
          hash.update(encoding.name);
        } else if (isRef(encoding)) {
          hash.update(encoding.num + '_' + encoding.gen);
        }

        var toUnicode = dict.get('ToUnicode') || baseDict.get('ToUnicode');
        if (isStream(toUnicode)) {
          var stream = toUnicode.str || toUnicode;
          uint8array = stream.buffer ?
            new Uint8Array(stream.buffer.buffer, 0, stream.bufferLength) :
            new Uint8Array(stream.bytes.buffer,
                           stream.start, stream.end - stream.start);
          hash.update(uint8array);

        } else if (isName(toUnicode)) {
          hash.update(toUnicode.name);
        }

        var widths = dict.get('Widths') || baseDict.get('Widths');
        if (widths) {
          uint8array = new Uint8Array(new Uint32Array(widths).buffer);
          hash.update(uint8array);
        }
      }

      return {
        descriptor: descriptor,
        dict: dict,
        baseDict: baseDict,
        composite: composite,
        type: type.name,
        hash: hash ? hash.hexdigest() : ''
      };
    },

    translateFont: function PartialEvaluator_translateFont(preEvaluatedFont,
                                                           xref) {
      var baseDict = preEvaluatedFont.baseDict;
      var dict = preEvaluatedFont.dict;
      var composite = preEvaluatedFont.composite;
      var descriptor = preEvaluatedFont.descriptor;
      var type = preEvaluatedFont.type;
      var maxCharIndex = (composite ? 0xFFFF : 0xFF);
      var properties;

      if (!descriptor) {
        if (type === 'Type3') {
          // FontDescriptor is only required for Type3 fonts when the document
          // is a tagged pdf. Create a barbebones one to get by.
          descriptor = new Dict(null);
          descriptor.set('FontName', Name.get(type));
        } else {
          // Before PDF 1.5 if the font was one of the base 14 fonts, having a
          // FontDescriptor was not required.
          // This case is here for compatibility.
          var baseFontName = dict.get('BaseFont');
          if (!isName(baseFontName)) {
            error('Base font is not specified');
          }

          // Using base font name as a font name.
          baseFontName = baseFontName.name.replace(/[,_]/g, '-');
          var metrics = this.getBaseFontMetrics(baseFontName);

          // Simulating descriptor flags attribute
          var fontNameWoStyle = baseFontName.split('-')[0];
          var flags =
            (this.isSerifFont(fontNameWoStyle) ? FontFlags.Serif : 0) |
            (metrics.monospace ? FontFlags.FixedPitch : 0) |
            (symbolsFonts[fontNameWoStyle] ? FontFlags.Symbolic :
                                             FontFlags.Nonsymbolic);

          properties = {
            type: type,
            name: baseFontName,
            widths: metrics.widths,
            defaultWidth: metrics.defaultWidth,
            flags: flags,
            firstChar: 0,
            lastChar: maxCharIndex
          };
          this.extractDataStructures(dict, dict, xref, properties);
          properties.widths = this.buildCharCodeToWidth(metrics.widths,
                                                        properties);
          return new Font(baseFontName, null, properties);
        }
      }

      // According to the spec if 'FontDescriptor' is declared, 'FirstChar',
      // 'LastChar' and 'Widths' should exist too, but some PDF encoders seem
      // to ignore this rule when a variant of a standart font is used.
      // TODO Fill the width array depending on which of the base font this is
      // a variant.
      var firstChar = (dict.get('FirstChar') || 0);
      var lastChar = (dict.get('LastChar') || maxCharIndex);

      var fontName = descriptor.get('FontName');
      var baseFont = dict.get('BaseFont');
      // Some bad PDFs have a string as the font name.
      if (isString(fontName)) {
        fontName = Name.get(fontName);
      }
      if (isString(baseFont)) {
        baseFont = Name.get(baseFont);
      }

      if (type !== 'Type3') {
        var fontNameStr = fontName && fontName.name;
        var baseFontStr = baseFont && baseFont.name;
        if (fontNameStr !== baseFontStr) {
          info('The FontDescriptor\'s FontName is "' + fontNameStr +
               '" but should be the same as the Font\'s BaseFont "' +
               baseFontStr + '"');
          // Workaround for cases where e.g. fontNameStr = 'Arial' and
          // baseFontStr = 'Arial,Bold' (needed when no font file is embedded).
          if (fontNameStr && baseFontStr &&
              baseFontStr.indexOf(fontNameStr) === 0) {
            fontName = baseFont;
          }
        }
      }
      fontName = (fontName || baseFont);

      assert(isName(fontName), 'invalid font name');

      var fontFile = descriptor.get('FontFile', 'FontFile2', 'FontFile3');
      if (fontFile) {
        if (fontFile.dict) {
          var subtype = fontFile.dict.get('Subtype');
          if (subtype) {
            subtype = subtype.name;
          }
          var length1 = fontFile.dict.get('Length1');
          var length2 = fontFile.dict.get('Length2');
        }
      }

      properties = {
        type: type,
        name: fontName.name,
        subtype: subtype,
        file: fontFile,
        length1: length1,
        length2: length2,
        loadedName: baseDict.loadedName,
        composite: composite,
        wideChars: composite,
        fixedPitch: false,
        fontMatrix: (dict.get('FontMatrix') || FONT_IDENTITY_MATRIX),
        firstChar: firstChar || 0,
        lastChar: (lastChar || maxCharIndex),
        bbox: descriptor.get('FontBBox'),
        ascent: descriptor.get('Ascent'),
        descent: descriptor.get('Descent'),
        xHeight: descriptor.get('XHeight'),
        capHeight: descriptor.get('CapHeight'),
        flags: descriptor.get('Flags'),
        italicAngle: descriptor.get('ItalicAngle'),
        coded: false
      };

      if (composite) {
        var cidEncoding = baseDict.get('Encoding');
        if (isName(cidEncoding)) {
          properties.cidEncoding = cidEncoding.name;
        }
        properties.cMap = CMapFactory.create(cidEncoding,
          { url: PDFJS.cMapUrl, packed: PDFJS.cMapPacked }, null);
        properties.vertical = properties.cMap.vertical;
      }
      this.extractDataStructures(dict, baseDict, xref, properties);
      this.extractWidths(dict, xref, descriptor, properties);

      if (type === 'Type3') {
        properties.isType3Font = true;
      }

      return new Font(fontName.name, fontFile, properties);
    }
  };

  return PartialEvaluator;
})();

var TranslatedFont = (function TranslatedFontClosure() {
  function TranslatedFont(loadedName, font, dict) {
    this.loadedName = loadedName;
    this.font = font;
    this.dict = dict;
    this.type3Loaded = null;
    this.sent = false;
  }
  TranslatedFont.prototype = {
    send: function (handler) {
      if (this.sent) {
        return;
      }
      var fontData = this.font.exportData();
      handler.send('commonobj', [
        this.loadedName,
        'Font',
        fontData
      ]);
      this.sent = true;
    },
    loadType3Data: function (evaluator, resources, parentOperatorList) {
      assert(this.font.isType3Font);

      if (this.type3Loaded) {
        return this.type3Loaded;
      }

      var translatedFont = this.font;
      var loadCharProcsPromise = Promise.resolve();
      var charProcs = this.dict.get('CharProcs').getAll();
      var fontResources = this.dict.get('Resources') || resources;
      var charProcKeys = Object.keys(charProcs);
      var charProcOperatorList = {};
      for (var i = 0, n = charProcKeys.length; i < n; ++i) {
        loadCharProcsPromise = loadCharProcsPromise.then(function (key) {
          var glyphStream = charProcs[key];
          var operatorList = new OperatorList();
          return evaluator.getOperatorList(glyphStream, fontResources,
                                           operatorList).then(function () {
            charProcOperatorList[key] = operatorList.getIR();

            // Add the dependencies to the parent operator list so they are
            // resolved before sub operator list is executed synchronously.
            parentOperatorList.addDependencies(operatorList.dependencies);
          }, function (reason) {
            warn('Type3 font resource \"' + key + '\" is not available');
            var operatorList = new OperatorList();
            charProcOperatorList[key] = operatorList.getIR();
          });
        }.bind(this, charProcKeys[i]));
      }
      this.type3Loaded = loadCharProcsPromise.then(function () {
        translatedFont.charProcOperatorList = charProcOperatorList;
      });
      return this.type3Loaded;
    }
  };
  return TranslatedFont;
})();

var OperatorList = (function OperatorListClosure() {
  var CHUNK_SIZE = 1000;
  var CHUNK_SIZE_ABOUT = CHUNK_SIZE - 5; // close to chunk size

  function getTransfers(queue) {
    var transfers = [];
    var fnArray = queue.fnArray, argsArray = queue.argsArray;
    for (var i = 0, ii = queue.length; i < ii; i++) {
      switch (fnArray[i]) {
        case OPS.paintInlineImageXObject:
        case OPS.paintInlineImageXObjectGroup:
        case OPS.paintImageMaskXObject:
          var arg = argsArray[i][0]; // first param in imgData
          if (!arg.cached) {
            transfers.push(arg.data.buffer);
          }
          break;
      }
    }
    return transfers;
  }

  function OperatorList(intent, messageHandler, pageIndex) {
    this.messageHandler = messageHandler;
    this.fnArray = [];
    this.argsArray = [];
    this.dependencies = {};
    this.pageIndex = pageIndex;
    this.intent = intent;
  }

  OperatorList.prototype = {
    get length() {
      return this.argsArray.length;
    },

    addOp: function(fn, args) {
      this.fnArray.push(fn);
      this.argsArray.push(args);
      if (this.messageHandler) {
        if (this.fnArray.length >= CHUNK_SIZE) {
          this.flush();
        } else if (this.fnArray.length >= CHUNK_SIZE_ABOUT &&
                   (fn === OPS.restore || fn === OPS.endText)) {
          // heuristic to flush on boundary of restore or endText
          this.flush();
        }
      }
    },

    addDependency: function(dependency) {
      if (dependency in this.dependencies) {
        return;
      }
      this.dependencies[dependency] = true;
      this.addOp(OPS.dependency, [dependency]);
    },

    addDependencies: function(dependencies) {
      for (var key in dependencies) {
        this.addDependency(key);
      }
    },

    addOpList: function(opList) {
      Util.extendObj(this.dependencies, opList.dependencies);
      for (var i = 0, ii = opList.length; i < ii; i++) {
        this.addOp(opList.fnArray[i], opList.argsArray[i]);
      }
    },

    getIR: function() {
      return {
        fnArray: this.fnArray,
        argsArray: this.argsArray,
        length: this.length
      };
    },

    flush: function(lastChunk) {
      if (this.intent !== 'oplist') {
        new QueueOptimizer().optimize(this);
      }
      var transfers = getTransfers(this);
      this.messageHandler.send('RenderPageChunk', {
        operatorList: {
          fnArray: this.fnArray,
          argsArray: this.argsArray,
          lastChunk: lastChunk,
          length: this.length
        },
        pageIndex: this.pageIndex,
        intent: this.intent
      }, transfers);
      this.dependencies = {};
      this.fnArray.length = 0;
      this.argsArray.length = 0;
    }
  };

  return OperatorList;
})();

var StateManager = (function StateManagerClosure() {
  function StateManager(initialState) {
    this.state = initialState;
    this.stateStack = [];
  }
  StateManager.prototype = {
    save: function () {
      var old = this.state;
      this.stateStack.push(this.state);
      this.state = old.clone();
    },
    restore: function () {
      var prev = this.stateStack.pop();
      if (prev) {
        this.state = prev;
      }
    },
    transform: function (args) {
      this.state.ctm = Util.transform(this.state.ctm, args);
    }
  };
  return StateManager;
})();

var TextState = (function TextStateClosure() {
  function TextState() {
    this.ctm = new Float32Array(IDENTITY_MATRIX);
    this.fontSize = 0;
    this.font = null;
    this.fontMatrix = FONT_IDENTITY_MATRIX;
    this.textMatrix = IDENTITY_MATRIX.slice();
    this.textLineMatrix = IDENTITY_MATRIX.slice();
    this.charSpacing = 0;
    this.wordSpacing = 0;
    this.leading = 0;
    this.textHScale = 1;
    this.textRise = 0;
  }

  TextState.prototype = {
    setTextMatrix: function TextState_setTextMatrix(a, b, c, d, e, f) {
      var m = this.textMatrix;
      m[0] = a; m[1] = b; m[2] = c; m[3] = d; m[4] = e; m[5] = f;
    },
    setTextLineMatrix: function TextState_setTextMatrix(a, b, c, d, e, f) {
      var m = this.textLineMatrix;
      m[0] = a; m[1] = b; m[2] = c; m[3] = d; m[4] = e; m[5] = f;
    },
    translateTextMatrix: function TextState_translateTextMatrix(x, y) {
      var m = this.textMatrix;
      m[4] = m[0] * x + m[2] * y + m[4];
      m[5] = m[1] * x + m[3] * y + m[5];
    },
    translateTextLineMatrix: function TextState_translateTextMatrix(x, y) {
      var m = this.textLineMatrix;
      m[4] = m[0] * x + m[2] * y + m[4];
      m[5] = m[1] * x + m[3] * y + m[5];
    },
    calcRenderMatrix: function TextState_calcRendeMatrix(ctm) {
      // 9.4.4 Text Space Details
      var tsm = [this.fontSize * this.textHScale, 0,
                0, this.fontSize,
                0, this.textRise];
      return Util.transform(ctm, Util.transform(this.textMatrix, tsm));
    },
    carriageReturn: function TextState_carriageReturn() {
      this.translateTextLineMatrix(0, -this.leading);
      this.textMatrix = this.textLineMatrix.slice();
    },
    clone: function TextState_clone() {
      var clone = Object.create(this);
      clone.textMatrix = this.textMatrix.slice();
      clone.textLineMatrix = this.textLineMatrix.slice();
      clone.fontMatrix = this.fontMatrix.slice();
      return clone;
    }
  };
  return TextState;
})();

var EvalState = (function EvalStateClosure() {
  function EvalState() {
    this.ctm = new Float32Array(IDENTITY_MATRIX);
    this.font = null;
    this.textRenderingMode = TextRenderingMode.FILL;
    this.fillColorSpace = ColorSpace.singletons.gray;
    this.strokeColorSpace = ColorSpace.singletons.gray;
  }
  EvalState.prototype = {
    clone: function CanvasExtraState_clone() {
      return Object.create(this);
    },
  };
  return EvalState;
})();

var EvaluatorPreprocessor = (function EvaluatorPreprocessorClosure() {
  // Specifies properties for each command
  //
  // If variableArgs === true: [0, `numArgs`] expected
  // If variableArgs === false: exactly `numArgs` expected
  var OP_MAP = {
    // Graphic state
    w: { id: OPS.setLineWidth, numArgs: 1, variableArgs: false },
    J: { id: OPS.setLineCap, numArgs: 1, variableArgs: false },
    j: { id: OPS.setLineJoin, numArgs: 1, variableArgs: false },
    M: { id: OPS.setMiterLimit, numArgs: 1, variableArgs: false },
    d: { id: OPS.setDash, numArgs: 2, variableArgs: false },
    ri: { id: OPS.setRenderingIntent, numArgs: 1, variableArgs: false },
    i: { id: OPS.setFlatness, numArgs: 1, variableArgs: false },
    gs: { id: OPS.setGState, numArgs: 1, variableArgs: false },
    q: { id: OPS.save, numArgs: 0, variableArgs: false },
    Q: { id: OPS.restore, numArgs: 0, variableArgs: false },
    cm: { id: OPS.transform, numArgs: 6, variableArgs: false },

    // Path
    m: { id: OPS.moveTo, numArgs: 2, variableArgs: false },
    l: { id: OPS.lineTo, numArgs: 2, variableArgs: false },
    c: { id: OPS.curveTo, numArgs: 6, variableArgs: false },
    v: { id: OPS.curveTo2, numArgs: 4, variableArgs: false },
    y: { id: OPS.curveTo3, numArgs: 4, variableArgs: false },
    h: { id: OPS.closePath, numArgs: 0, variableArgs: false },
    re: { id: OPS.rectangle, numArgs: 4, variableArgs: false },
    S: { id: OPS.stroke, numArgs: 0, variableArgs: false },
    s: { id: OPS.closeStroke, numArgs: 0, variableArgs: false },
    f: { id: OPS.fill, numArgs: 0, variableArgs: false },
    F: { id: OPS.fill, numArgs: 0, variableArgs: false },
    'f*': { id: OPS.eoFill, numArgs: 0, variableArgs: false },
    B: { id: OPS.fillStroke, numArgs: 0, variableArgs: false },
    'B*': { id: OPS.eoFillStroke, numArgs: 0, variableArgs: false },
    b: { id: OPS.closeFillStroke, numArgs: 0, variableArgs: false },
    'b*': { id: OPS.closeEOFillStroke, numArgs: 0, variableArgs: false },
    n: { id: OPS.endPath, numArgs: 0, variableArgs: false },

    // Clipping
    W: { id: OPS.clip, numArgs: 0, variableArgs: false },
    'W*': { id: OPS.eoClip, numArgs: 0, variableArgs: false },

    // Text
    BT: { id: OPS.beginText, numArgs: 0, variableArgs: false },
    ET: { id: OPS.endText, numArgs: 0, variableArgs: false },
    Tc: { id: OPS.setCharSpacing, numArgs: 1, variableArgs: false },
    Tw: { id: OPS.setWordSpacing, numArgs: 1, variableArgs: false },
    Tz: { id: OPS.setHScale, numArgs: 1, variableArgs: false },
    TL: { id: OPS.setLeading, numArgs: 1, variableArgs: false },
    Tf: { id: OPS.setFont, numArgs: 2, variableArgs: false },
    Tr: { id: OPS.setTextRenderingMode, numArgs: 1, variableArgs: false },
    Ts: { id: OPS.setTextRise, numArgs: 1, variableArgs: false },
    Td: { id: OPS.moveText, numArgs: 2, variableArgs: false },
    TD: { id: OPS.setLeadingMoveText, numArgs: 2, variableArgs: false },
    Tm: { id: OPS.setTextMatrix, numArgs: 6, variableArgs: false },
    'T*': { id: OPS.nextLine, numArgs: 0, variableArgs: false },
    Tj: { id: OPS.showText, numArgs: 1, variableArgs: false },
    TJ: { id: OPS.showSpacedText, numArgs: 1, variableArgs: false },
    '\'': { id: OPS.nextLineShowText, numArgs: 1, variableArgs: false },
    '"': { id: OPS.nextLineSetSpacingShowText, numArgs: 3,
           variableArgs: false },

    // Type3 fonts
    d0: { id: OPS.setCharWidth, numArgs: 2, variableArgs: false },
    d1: { id: OPS.setCharWidthAndBounds, numArgs: 6, variableArgs: false },

    // Color
    CS: { id: OPS.setStrokeColorSpace, numArgs: 1, variableArgs: false },
    cs: { id: OPS.setFillColorSpace, numArgs: 1, variableArgs: false },
    SC: { id: OPS.setStrokeColor, numArgs: 4, variableArgs: true },
    SCN: { id: OPS.setStrokeColorN, numArgs: 33, variableArgs: true },
    sc: { id: OPS.setFillColor, numArgs: 4, variableArgs: true },
    scn: { id: OPS.setFillColorN, numArgs: 33, variableArgs: true },
    G: { id: OPS.setStrokeGray, numArgs: 1, variableArgs: false },
    g: { id: OPS.setFillGray, numArgs: 1, variableArgs: false },
    RG: { id: OPS.setStrokeRGBColor, numArgs: 3, variableArgs: false },
    rg: { id: OPS.setFillRGBColor, numArgs: 3, variableArgs: false },
    K: { id: OPS.setStrokeCMYKColor, numArgs: 4, variableArgs: false },
    k: { id: OPS.setFillCMYKColor, numArgs: 4, variableArgs: false },

    // Shading
    sh: { id: OPS.shadingFill, numArgs: 1, variableArgs: false },

    // Images
    BI: { id: OPS.beginInlineImage, numArgs: 0, variableArgs: false },
    ID: { id: OPS.beginImageData, numArgs: 0, variableArgs: false },
    EI: { id: OPS.endInlineImage, numArgs: 1, variableArgs: false },

    // XObjects
    Do: { id: OPS.paintXObject, numArgs: 1, variableArgs: false },
    MP: { id: OPS.markPoint, numArgs: 1, variableArgs: false },
    DP: { id: OPS.markPointProps, numArgs: 2, variableArgs: false },
    BMC: { id: OPS.beginMarkedContent, numArgs: 1, variableArgs: false },
    BDC: { id: OPS.beginMarkedContentProps, numArgs: 2,
           variableArgs: false },
    EMC: { id: OPS.endMarkedContent, numArgs: 0, variableArgs: false },

    // Compatibility
    BX: { id: OPS.beginCompat, numArgs: 0, variableArgs: false },
    EX: { id: OPS.endCompat, numArgs: 0, variableArgs: false },

    // (reserved partial commands for the lexer)
    BM: null,
    BD: null,
    'true': null,
    fa: null,
    fal: null,
    fals: null,
    'false': null,
    nu: null,
    nul: null,
    'null': null
  };

  function EvaluatorPreprocessor(stream, xref, stateManager) {
    // TODO(mduan): pass array of knownCommands rather than OP_MAP
    // dictionary
    this.parser = new Parser(new Lexer(stream, OP_MAP), false, xref);
    this.stateManager = stateManager;
    this.nonProcessedArgs = [];
  }

  EvaluatorPreprocessor.prototype = {
    get savedStatesDepth() {
      return this.stateManager.stateStack.length;
    },

    // |operation| is an object with two fields:
    //
    // - |fn| is an out param.
    //
    // - |args| is an inout param. On entry, it should have one of two values.
    //
    //   - An empty array. This indicates that the caller is providing the
    //     array in which the args will be stored in. The caller should use
    //     this value if it can reuse a single array for each call to read().
    //
    //   - |null|. This indicates that the caller needs this function to create
    //     the array in which any args are stored in. If there are zero args,
    //     this function will leave |operation.args| as |null| (thus avoiding
    //     allocations that would occur if we used an empty array to represent
    //     zero arguments). Otherwise, it will replace |null| with a new array
    //     containing the arguments. The caller should use this value if it
    //     cannot reuse an array for each call to read().
    //
    // These two modes are present because this function is very hot and so
    // avoiding allocations where possible is worthwhile.
    //
    read: function EvaluatorPreprocessor_read(operation) {
      var args = operation.args;
      while (true) {
        var obj = this.parser.getObj();
        if (isCmd(obj)) {
          var cmd = obj.cmd;
          // Check that the command is valid
          var opSpec = OP_MAP[cmd];
          if (!opSpec) {
            warn('Unknown command "' + cmd + '"');
            continue;
          }

          var fn = opSpec.id;
          var numArgs = opSpec.numArgs;
          var argsLength = args !== null ? args.length : 0;

          if (!opSpec.variableArgs) {
            // Postscript commands can be nested, e.g. /F2 /GS2 gs 5.711 Tf
            if (argsLength !== numArgs) {
              var nonProcessedArgs = this.nonProcessedArgs;
              while (argsLength > numArgs) {
                nonProcessedArgs.push(args.shift());
                argsLength--;
              }
              while (argsLength < numArgs && nonProcessedArgs.length !== 0) {
                if (!args) {
                  args = [];
                }
                args.unshift(nonProcessedArgs.pop());
                argsLength++;
              }
            }

            if (argsLength < numArgs) {
              // If we receive too few args, it's not possible to possible
              // to execute the command, so skip the command
              info('Command ' + fn + ': because expected ' +
                   numArgs + ' args, but received ' + argsLength +
                   ' args; skipping');
              args = null;
              continue;
            }
          } else if (argsLength > numArgs) {
            info('Command ' + fn + ': expected [0,' + numArgs +
                 '] args, but received ' + argsLength + ' args');
          }

          // TODO figure out how to type-check vararg functions
          this.preprocessCommand(fn, args);

          operation.fn = fn;
          operation.args = args;
          return true;
        } else {
          if (isEOF(obj)) {
            return false; // no more commands
          }
          // argument
          if (obj !== null) {
            if (!args) {
              args = [];
            }
            args.push((obj instanceof Dict ? obj.getAll() : obj));
            assert(args.length <= 33, 'Too many arguments');
          }
        }
      }
    },

    preprocessCommand:
        function EvaluatorPreprocessor_preprocessCommand(fn, args) {
      switch (fn | 0) {
        case OPS.save:
          this.stateManager.save();
          break;
        case OPS.restore:
          this.stateManager.restore();
          break;
        case OPS.transform:
          this.stateManager.transform(args);
          break;
      }
    }
  };
  return EvaluatorPreprocessor;
})();

var QueueOptimizer = (function QueueOptimizerClosure() {
  function addState(parentState, pattern, fn) {
    var state = parentState;
    for (var i = 0, ii = pattern.length - 1; i < ii; i++) {
      var item = pattern[i];
      state = (state[item] || (state[item] = []));
    }
    state[pattern[pattern.length - 1]] = fn;
  }

  function handlePaintSolidColorImageMask(iFirstSave, count, fnArray,
                                          argsArray) {
    // Handles special case of mainly LaTeX documents which use image masks to
    // draw lines with the current fill style.
    // 'count' groups of (save, transform, paintImageMaskXObject, restore)+
    // have been found at iFirstSave.
    var iFirstPIMXO = iFirstSave + 2;
    for (var i = 0; i < count; i++) {
      var arg = argsArray[iFirstPIMXO + 4 * i];
      var imageMask = arg.length === 1 && arg[0];
      if (imageMask && imageMask.width === 1 && imageMask.height === 1 &&
          (!imageMask.data.length ||
           (imageMask.data.length === 1 && imageMask.data[0] === 0))) {
        fnArray[iFirstPIMXO + 4 * i] = OPS.paintSolidColorImageMask;
        continue;
      }
      break;
    }
    return count - i;
  }

  var InitialState = [];

  // This replaces (save, transform, paintInlineImageXObject, restore)+
  // sequences with one |paintInlineImageXObjectGroup| operation.
  addState(InitialState,
    [OPS.save, OPS.transform, OPS.paintInlineImageXObject, OPS.restore],
    function foundInlineImageGroup(context) {
      var MIN_IMAGES_IN_INLINE_IMAGES_BLOCK = 10;
      var MAX_IMAGES_IN_INLINE_IMAGES_BLOCK = 200;
      var MAX_WIDTH = 1000;
      var IMAGE_PADDING = 1;

      var fnArray = context.fnArray, argsArray = context.argsArray;
      var curr = context.iCurr;
      var iFirstSave = curr - 3;
      var iFirstTransform = curr - 2;
      var iFirstPIIXO = curr - 1;

      // Look for the quartets.
      var i = iFirstSave + 4;
      var ii = fnArray.length;
      while (i + 3 < ii) {
        if (fnArray[i] !== OPS.save ||
            fnArray[i + 1] !== OPS.transform ||
            fnArray[i + 2] !== OPS.paintInlineImageXObject ||
            fnArray[i + 3] !== OPS.restore) {
          break;    // ops don't match
        }
        i += 4;
      }

      // At this point, i is the index of the first op past the last valid
      // quartet.
      var count = Math.min((i - iFirstSave) / 4,
                           MAX_IMAGES_IN_INLINE_IMAGES_BLOCK);
      if (count < MIN_IMAGES_IN_INLINE_IMAGES_BLOCK) {
        return i;
      }

      // assuming that heights of those image is too small (~1 pixel)
      // packing as much as possible by lines
      var maxX = 0;
      var map = [], maxLineHeight = 0;
      var currentX = IMAGE_PADDING, currentY = IMAGE_PADDING;
      var q;
      for (q = 0; q < count; q++) {
        var transform = argsArray[iFirstTransform + (q << 2)];
        var img = argsArray[iFirstPIIXO + (q << 2)][0];
        if (currentX + img.width > MAX_WIDTH) {
          // starting new line
          maxX = Math.max(maxX, currentX);
          currentY += maxLineHeight + 2 * IMAGE_PADDING;
          currentX = 0;
          maxLineHeight = 0;
        }
        map.push({
          transform: transform,
          x: currentX, y: currentY,
          w: img.width, h: img.height
        });
        currentX += img.width + 2 * IMAGE_PADDING;
        maxLineHeight = Math.max(maxLineHeight, img.height);
      }
      var imgWidth = Math.max(maxX, currentX) + IMAGE_PADDING;
      var imgHeight = currentY + maxLineHeight + IMAGE_PADDING;
      var imgData = new Uint8Array(imgWidth * imgHeight * 4);
      var imgRowSize = imgWidth << 2;
      for (q = 0; q < count; q++) {
        var data = argsArray[iFirstPIIXO + (q << 2)][0].data;
        // Copy image by lines and extends pixels into padding.
        var rowSize = map[q].w << 2;
        var dataOffset = 0;
        var offset = (map[q].x + map[q].y * imgWidth) << 2;
        imgData.set(data.subarray(0, rowSize), offset - imgRowSize);
        for (var k = 0, kk = map[q].h; k < kk; k++) {
          imgData.set(data.subarray(dataOffset, dataOffset + rowSize), offset);
          dataOffset += rowSize;
          offset += imgRowSize;
        }
        imgData.set(data.subarray(dataOffset - rowSize, dataOffset), offset);
        while (offset >= 0) {
          data[offset - 4] = data[offset];
          data[offset - 3] = data[offset + 1];
          data[offset - 2] = data[offset + 2];
          data[offset - 1] = data[offset + 3];
          data[offset + rowSize] = data[offset + rowSize - 4];
          data[offset + rowSize + 1] = data[offset + rowSize - 3];
          data[offset + rowSize + 2] = data[offset + rowSize - 2];
          data[offset + rowSize + 3] = data[offset + rowSize - 1];
          offset -= imgRowSize;
        }
      }

      // Replace queue items.
      fnArray.splice(iFirstSave, count * 4, OPS.paintInlineImageXObjectGroup);
      argsArray.splice(iFirstSave, count * 4,
        [{ width: imgWidth, height: imgHeight, kind: ImageKind.RGBA_32BPP,
           data: imgData }, map]);

      return iFirstSave + 1;
    });

  // This replaces (save, transform, paintImageMaskXObject, restore)+
  // sequences with one |paintImageMaskXObjectGroup| or one
  // |paintImageMaskXObjectRepeat| operation.
  addState(InitialState,
    [OPS.save, OPS.transform, OPS.paintImageMaskXObject, OPS.restore],
    function foundImageMaskGroup(context) {
      var MIN_IMAGES_IN_MASKS_BLOCK = 10;
      var MAX_IMAGES_IN_MASKS_BLOCK = 100;
      var MAX_SAME_IMAGES_IN_MASKS_BLOCK = 1000;

      var fnArray = context.fnArray, argsArray = context.argsArray;
      var curr = context.iCurr;
      var iFirstSave = curr - 3;
      var iFirstTransform = curr - 2;
      var iFirstPIMXO = curr - 1;

      // Look for the quartets.
      var i = iFirstSave + 4;
      var ii = fnArray.length;
      while (i + 3 < ii) {
        if (fnArray[i] !== OPS.save ||
            fnArray[i + 1] !== OPS.transform ||
            fnArray[i + 2] !== OPS.paintImageMaskXObject ||
            fnArray[i + 3] !== OPS.restore) {
          break;    // ops don't match
        }
        i += 4;
      }

      // At this point, i is the index of the first op past the last valid
      // quartet.
      var count = (i - iFirstSave) / 4;
      count = handlePaintSolidColorImageMask(iFirstSave, count, fnArray,
                                             argsArray);
      if (count < MIN_IMAGES_IN_MASKS_BLOCK) {
        return i;
      }

      var q;
      var isSameImage = false;
      var iTransform, transformArgs;
      var firstPIMXOArg0 = argsArray[iFirstPIMXO][0];
      if (argsArray[iFirstTransform][1] === 0 &&
          argsArray[iFirstTransform][2] === 0) {
        isSameImage = true;
        var firstTransformArg0 = argsArray[iFirstTransform][0];
        var firstTransformArg3 = argsArray[iFirstTransform][3];
        iTransform = iFirstTransform + 4;
        var iPIMXO = iFirstPIMXO + 4;
        for (q = 1; q < count; q++, iTransform += 4, iPIMXO += 4) {
          transformArgs = argsArray[iTransform];
          if (argsArray[iPIMXO][0] !== firstPIMXOArg0 ||
              transformArgs[0] !== firstTransformArg0 ||
              transformArgs[1] !== 0 ||
              transformArgs[2] !== 0 ||
              transformArgs[3] !== firstTransformArg3) {
            if (q < MIN_IMAGES_IN_MASKS_BLOCK) {
              isSameImage = false;
            } else {
              count = q;
            }
            break; // different image or transform
          }
        }
      }

      if (isSameImage) {
        count = Math.min(count, MAX_SAME_IMAGES_IN_MASKS_BLOCK);
        var positions = new Float32Array(count * 2);
        iTransform = iFirstTransform;
        for (q = 0; q < count; q++, iTransform += 4) {
          transformArgs = argsArray[iTransform];
          positions[(q << 1)] = transformArgs[4];
          positions[(q << 1) + 1] = transformArgs[5];
        }

        // Replace queue items.
        fnArray.splice(iFirstSave, count * 4, OPS.paintImageMaskXObjectRepeat);
        argsArray.splice(iFirstSave, count * 4,
          [firstPIMXOArg0, firstTransformArg0, firstTransformArg3, positions]);
      } else {
        count = Math.min(count, MAX_IMAGES_IN_MASKS_BLOCK);
        var images = [];
        for (q = 0; q < count; q++) {
          transformArgs = argsArray[iFirstTransform + (q << 2)];
          var maskParams = argsArray[iFirstPIMXO + (q << 2)][0];
          images.push({ data: maskParams.data, width: maskParams.width,
                        height: maskParams.height,
                        transform: transformArgs });
        }

        // Replace queue items.
        fnArray.splice(iFirstSave, count * 4, OPS.paintImageMaskXObjectGroup);
        argsArray.splice(iFirstSave, count * 4, [images]);
      }

      return iFirstSave + 1;
    });

  // This replaces (save, transform, paintImageXObject, restore)+ sequences
  // with one paintImageXObjectRepeat operation, if the |transform| and
  // |paintImageXObjectRepeat| ops are appropriate.
  addState(InitialState,
    [OPS.save, OPS.transform, OPS.paintImageXObject, OPS.restore],
    function (context) {
      var MIN_IMAGES_IN_BLOCK = 3;
      var MAX_IMAGES_IN_BLOCK = 1000;

      var fnArray = context.fnArray, argsArray = context.argsArray;
      var curr = context.iCurr;
      var iFirstSave = curr - 3;
      var iFirstTransform = curr - 2;
      var iFirstPIXO = curr - 1;
      var iFirstRestore = curr;

      if (argsArray[iFirstTransform][1] !== 0 ||
          argsArray[iFirstTransform][2] !== 0) {
        return iFirstRestore + 1;   // transform has the wrong form
      }

      // Look for the quartets.
      var firstPIXOArg0 = argsArray[iFirstPIXO][0];
      var firstTransformArg0 = argsArray[iFirstTransform][0];
      var firstTransformArg3 = argsArray[iFirstTransform][3];
      var i = iFirstSave + 4;
      var ii = fnArray.length;
      while (i + 3 < ii) {
        if (fnArray[i] !== OPS.save ||
            fnArray[i + 1] !== OPS.transform ||
            fnArray[i + 2] !== OPS.paintImageXObject ||
            fnArray[i + 3] !== OPS.restore) {
          break;    // ops don't match
        }
        if (argsArray[i + 1][0] !== firstTransformArg0 ||
            argsArray[i + 1][1] !== 0 ||
            argsArray[i + 1][2] !== 0 ||
            argsArray[i + 1][3] !== firstTransformArg3) {
          break;    // transforms don't match
        }
        if (argsArray[i + 2][0] !== firstPIXOArg0) {
          break;    // images don't match
        }
        i += 4;
      }

      // At this point, i is the index of the first op past the last valid
      // quartet.
      var count = Math.min((i - iFirstSave) / 4, MAX_IMAGES_IN_BLOCK);
      if (count < MIN_IMAGES_IN_BLOCK) {
        return i;
      }

      // Extract the (x,y) positions from all of the matching transforms.
      var positions = new Float32Array(count * 2);
      var iTransform = iFirstTransform;
      for (var q = 0; q < count; q++, iTransform += 4) {
        var transformArgs = argsArray[iTransform];
        positions[(q << 1)] = transformArgs[4];
        positions[(q << 1) + 1] = transformArgs[5];
      }

      // Replace queue items.
      var args = [firstPIXOArg0, firstTransformArg0, firstTransformArg3,
                  positions];
      fnArray.splice(iFirstSave, count * 4, OPS.paintImageXObjectRepeat);
      argsArray.splice(iFirstSave, count * 4, args);

      return iFirstSave + 1;
    });

  // This replaces (beginText, setFont, setTextMatrix, showText, endText)+
  // sequences with (beginText, setFont, (setTextMatrix, showText)+, endText)+
  // sequences, if the font for each one is the same.
  addState(InitialState,
    [OPS.beginText, OPS.setFont, OPS.setTextMatrix, OPS.showText, OPS.endText],
    function (context) {
      var MIN_CHARS_IN_BLOCK = 3;
      var MAX_CHARS_IN_BLOCK = 1000;

      var fnArray = context.fnArray, argsArray = context.argsArray;
      var curr = context.iCurr;
      var iFirstBeginText = curr - 4;
      var iFirstSetFont = curr - 3;
      var iFirstSetTextMatrix = curr - 2;
      var iFirstShowText = curr - 1;
      var iFirstEndText = curr;

      // Look for the quintets.
      var firstSetFontArg0 = argsArray[iFirstSetFont][0];
      var firstSetFontArg1 = argsArray[iFirstSetFont][1];
      var i = iFirstBeginText + 5;
      var ii = fnArray.length;
      while (i + 4 < ii) {
        if (fnArray[i] !== OPS.beginText ||
            fnArray[i + 1] !== OPS.setFont ||
            fnArray[i + 2] !== OPS.setTextMatrix ||
            fnArray[i + 3] !== OPS.showText ||
            fnArray[i + 4] !== OPS.endText) {
          break;    // ops don't match
        }
        if (argsArray[i + 1][0] !== firstSetFontArg0 ||
            argsArray[i + 1][1] !== firstSetFontArg1) {
          break;    // fonts don't match
        }
        i += 5;
      }

      // At this point, i is the index of the first op past the last valid
      // quintet.
      var count = Math.min(((i - iFirstBeginText) / 5), MAX_CHARS_IN_BLOCK);
      if (count < MIN_CHARS_IN_BLOCK) {
        return i;
      }

      // If the preceding quintet is (<something>, setFont, setTextMatrix,
      // showText, endText), include that as well. (E.g. <something> might be
      // |dependency|.)
      var iFirst = iFirstBeginText;
      if (iFirstBeginText >= 4 &&
          fnArray[iFirstBeginText - 4] === fnArray[iFirstSetFont] &&
          fnArray[iFirstBeginText - 3] === fnArray[iFirstSetTextMatrix] &&
          fnArray[iFirstBeginText - 2] === fnArray[iFirstShowText] &&
          fnArray[iFirstBeginText - 1] === fnArray[iFirstEndText] &&
          argsArray[iFirstBeginText - 4][0] === firstSetFontArg0 &&
          argsArray[iFirstBeginText - 4][1] === firstSetFontArg1) {
        count++;
        iFirst -= 5;
      }

      // Remove (endText, beginText, setFont) trios.
      var iEndText = iFirst + 4;
      for (var q = 1; q < count; q++) {
        fnArray.splice(iEndText, 3);
        argsArray.splice(iEndText, 3);
        iEndText += 2;
      }

      return iEndText + 1;
    });

  function QueueOptimizer() {}

  QueueOptimizer.prototype = {
    optimize: function QueueOptimizer_optimize(queue) {
      var fnArray = queue.fnArray, argsArray = queue.argsArray;
      var context = {
        iCurr: 0,
        fnArray: fnArray,
        argsArray: argsArray
      };
      var state;
      var i = 0, ii = fnArray.length;
      while (i < ii) {
        state = (state || InitialState)[fnArray[i]];
        if (typeof state === 'function') { // we found some handler
          context.iCurr = i;
          // state() returns the index of the first non-matching op (if we
          // didn't match) or the first op past the modified ops (if we did
          // match and replace).
          i = state(context);
          state = undefined;    // reset the state machine
          ii = context.fnArray.length;
        } else {
          i++;
        }
      }
    }
  };
  return QueueOptimizer;
})();


var BUILT_IN_CMAPS = [
// << Start unicode maps.
'Adobe-GB1-UCS2',
'Adobe-CNS1-UCS2',
'Adobe-Japan1-UCS2',
'Adobe-Korea1-UCS2',
// >> End unicode maps.
'78-EUC-H',
'78-EUC-V',
'78-H',
'78-RKSJ-H',
'78-RKSJ-V',
'78-V',
'78ms-RKSJ-H',
'78ms-RKSJ-V',
'83pv-RKSJ-H',
'90ms-RKSJ-H',
'90ms-RKSJ-V',
'90msp-RKSJ-H',
'90msp-RKSJ-V',
'90pv-RKSJ-H',
'90pv-RKSJ-V',
'Add-H',
'Add-RKSJ-H',
'Add-RKSJ-V',
'Add-V',
'Adobe-CNS1-0',
'Adobe-CNS1-1',
'Adobe-CNS1-2',
'Adobe-CNS1-3',
'Adobe-CNS1-4',
'Adobe-CNS1-5',
'Adobe-CNS1-6',
'Adobe-GB1-0',
'Adobe-GB1-1',
'Adobe-GB1-2',
'Adobe-GB1-3',
'Adobe-GB1-4',
'Adobe-GB1-5',
'Adobe-Japan1-0',
'Adobe-Japan1-1',
'Adobe-Japan1-2',
'Adobe-Japan1-3',
'Adobe-Japan1-4',
'Adobe-Japan1-5',
'Adobe-Japan1-6',
'Adobe-Korea1-0',
'Adobe-Korea1-1',
'Adobe-Korea1-2',
'B5-H',
'B5-V',
'B5pc-H',
'B5pc-V',
'CNS-EUC-H',
'CNS-EUC-V',
'CNS1-H',
'CNS1-V',
'CNS2-H',
'CNS2-V',
'ETHK-B5-H',
'ETHK-B5-V',
'ETen-B5-H',
'ETen-B5-V',
'ETenms-B5-H',
'ETenms-B5-V',
'EUC-H',
'EUC-V',
'Ext-H',
'Ext-RKSJ-H',
'Ext-RKSJ-V',
'Ext-V',
'GB-EUC-H',
'GB-EUC-V',
'GB-H',
'GB-V',
'GBK-EUC-H',
'GBK-EUC-V',
'GBK2K-H',
'GBK2K-V',
'GBKp-EUC-H',
'GBKp-EUC-V',
'GBT-EUC-H',
'GBT-EUC-V',
'GBT-H',
'GBT-V',
'GBTpc-EUC-H',
'GBTpc-EUC-V',
'GBpc-EUC-H',
'GBpc-EUC-V',
'H',
'HKdla-B5-H',
'HKdla-B5-V',
'HKdlb-B5-H',
'HKdlb-B5-V',
'HKgccs-B5-H',
'HKgccs-B5-V',
'HKm314-B5-H',
'HKm314-B5-V',
'HKm471-B5-H',
'HKm471-B5-V',
'HKscs-B5-H',
'HKscs-B5-V',
'Hankaku',
'Hiragana',
'KSC-EUC-H',
'KSC-EUC-V',
'KSC-H',
'KSC-Johab-H',
'KSC-Johab-V',
'KSC-V',
'KSCms-UHC-H',
'KSCms-UHC-HW-H',
'KSCms-UHC-HW-V',
'KSCms-UHC-V',
'KSCpc-EUC-H',
'KSCpc-EUC-V',
'Katakana',
'NWP-H',
'NWP-V',
'RKSJ-H',
'RKSJ-V',
'Roman',
'UniCNS-UCS2-H',
'UniCNS-UCS2-V',
'UniCNS-UTF16-H',
'UniCNS-UTF16-V',
'UniCNS-UTF32-H',
'UniCNS-UTF32-V',
'UniCNS-UTF8-H',
'UniCNS-UTF8-V',
'UniGB-UCS2-H',
'UniGB-UCS2-V',
'UniGB-UTF16-H',
'UniGB-UTF16-V',
'UniGB-UTF32-H',
'UniGB-UTF32-V',
'UniGB-UTF8-H',
'UniGB-UTF8-V',
'UniJIS-UCS2-H',
'UniJIS-UCS2-HW-H',
'UniJIS-UCS2-HW-V',
'UniJIS-UCS2-V',
'UniJIS-UTF16-H',
'UniJIS-UTF16-V',
'UniJIS-UTF32-H',
'UniJIS-UTF32-V',
'UniJIS-UTF8-H',
'UniJIS-UTF8-V',
'UniJIS2004-UTF16-H',
'UniJIS2004-UTF16-V',
'UniJIS2004-UTF32-H',
'UniJIS2004-UTF32-V',
'UniJIS2004-UTF8-H',
'UniJIS2004-UTF8-V',
'UniJISPro-UCS2-HW-V',
'UniJISPro-UCS2-V',
'UniJISPro-UTF8-V',
'UniJISX0213-UTF32-H',
'UniJISX0213-UTF32-V',
'UniJISX02132004-UTF32-H',
'UniJISX02132004-UTF32-V',
'UniKS-UCS2-H',
'UniKS-UCS2-V',
'UniKS-UTF16-H',
'UniKS-UTF16-V',
'UniKS-UTF32-H',
'UniKS-UTF32-V',
'UniKS-UTF8-H',
'UniKS-UTF8-V',
'V',
'WP-Symbol'];

// CMap, not to be confused with TrueType's cmap.
var CMap = (function CMapClosure() {
  function CMap(builtInCMap) {
    // Codespace ranges are stored as follows:
    // [[1BytePairs], [2BytePairs], [3BytePairs], [4BytePairs]]
    // where nBytePairs are ranges e.g. [low1, high1, low2, high2, ...]
    this.codespaceRanges = [[], [], [], []];
    this.numCodespaceRanges = 0;
    // Map entries have one of two forms.
    // - cid chars are 16-bit unsigned integers, stored as integers.
    // - bf chars are variable-length byte sequences, stored as strings, with
    //   one byte per character.
    this._map = [];
    this.vertical = false;
    this.useCMap = null;
    this.builtInCMap = builtInCMap;
  }
  CMap.prototype = {
    addCodespaceRange: function(n, low, high) {
      this.codespaceRanges[n - 1].push(low, high);
      this.numCodespaceRanges++;
    },

    mapCidRange: function(low, high, dstLow) {
      while (low <= high) {
        this._map[low++] = dstLow++;
      }
    },

    mapBfRange: function(low, high, dstLow) {
      var lastByte = dstLow.length - 1;
      while (low <= high) {
        this._map[low++] = dstLow;
        // Only the last byte has to be incremented.
        dstLow = dstLow.substr(0, lastByte) +
                 String.fromCharCode(dstLow.charCodeAt(lastByte) + 1);
      }
    },

    mapBfRangeToArray: function(low, high, array) {
      var i = 0, ii = array.length;
      while (low <= high && i < ii) {
        this._map[low] = array[i++];
        ++low;
      }
    },

    // This is used for both bf and cid chars.
    mapOne: function(src, dst) {
      this._map[src] = dst;
    },

    lookup: function(code) {
      return this._map[code];
    },

    contains: function(code) {
      return this._map[code] !== undefined;
    },

    forEach: function(callback) {
      // Most maps have fewer than 65536 entries, and for those we use normal
      // array iteration. But really sparse tables are possible -- e.g. with
      // indices in the *billions*. For such tables we use for..in, which isn't
      // ideal because it stringifies the indices for all present elements, but
      // it does avoid iterating over every undefined entry.
      var map = this._map;
      var length = map.length;
      var i;
      if (length <= 0x10000) {
        for (i = 0; i < length; i++) {
          if (map[i] !== undefined) {
            callback(i, map[i]);
          }
        }
      } else {
        for (i in this._map) {
          callback(i, map[i]);
        }
      }
    },

    charCodeOf: function(value) {
      return this._map.indexOf(value);
    },

    getMap: function() {
      return this._map;
    },

    readCharCode: function(str, offset, out) {
      var c = 0;
      var codespaceRanges = this.codespaceRanges;
      var codespaceRangesLen = this.codespaceRanges.length;
      // 9.7.6.2 CMap Mapping
      // The code length is at most 4.
      for (var n = 0; n < codespaceRangesLen; n++) {
        c = ((c << 8) | str.charCodeAt(offset + n)) >>> 0;
        // Check each codespace range to see if it falls within.
        var codespaceRange = codespaceRanges[n];
        for (var k = 0, kk = codespaceRange.length; k < kk;) {
          var low = codespaceRange[k++];
          var high = codespaceRange[k++];
          if (c >= low && c <= high) {
            out.charcode = c;
            out.length = n + 1;
            return;
          }
        }
      }
      out.charcode = 0;
      out.length = 1;
    }
  };
  return CMap;
})();

// A special case of CMap, where the _map array implicitly has a length of
// 65535 and each element is equal to its index.
var IdentityCMap = (function IdentityCMapClosure() {
  function IdentityCMap(vertical, n) {
    CMap.call(this);
    this.vertical = vertical;
    this.addCodespaceRange(n, 0, 0xffff);
  }
  Util.inherit(IdentityCMap, CMap, {});

  IdentityCMap.prototype = {
    addCodespaceRange: CMap.prototype.addCodespaceRange,

    mapCidRange: function(low, high, dstLow) {
      error('should not call mapCidRange');
    },

    mapBfRange: function(low, high, dstLow) {
      error('should not call mapBfRange');
    },

    mapBfRangeToArray: function(low, high, array) {
      error('should not call mapBfRangeToArray');
    },

    mapOne: function(src, dst) {
      error('should not call mapCidOne');
    },

    lookup: function(code) {
      return (isInt(code) && code <= 0xffff) ? code : undefined;
    },

    contains: function(code) {
      return isInt(code) && code <= 0xffff;
    },

    forEach: function(callback) {
      for (var i = 0; i <= 0xffff; i++) {
        callback(i, i);
      }
    },

    charCodeOf: function(value) {
      return (isInt(value) && value <= 0xffff) ? value : -1;
    },

    getMap: function() {
      // Sometimes identity maps must be instantiated, but it's rare.
      var map = new Array(0x10000);
      for (var i = 0; i <= 0xffff; i++) {
        map[i] = i;
      }
      return map;
    },

    readCharCode: CMap.prototype.readCharCode
  };

  return IdentityCMap;
})();

var BinaryCMapReader = (function BinaryCMapReaderClosure() {
  function fetchBinaryData(url) {
    var nonBinaryRequest = PDFJS.disableWorker;
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    if (!nonBinaryRequest) {
      try {
        request.responseType = 'arraybuffer';
        nonBinaryRequest = request.responseType !== 'arraybuffer';
      } catch (e) {
        nonBinaryRequest = true;
      }
    }
    if (nonBinaryRequest && request.overrideMimeType) {
      request.overrideMimeType('text/plain; charset=x-user-defined');
    }
    request.send(null);
    if (nonBinaryRequest ? !request.responseText : !request.response) {
      error('Unable to get binary cMap at: ' + url);
    }
    if (nonBinaryRequest) {
      var data = Array.prototype.map.call(request.responseText, function (ch) {
        return ch.charCodeAt(0) & 255;
      });
      return new Uint8Array(data);
    }
    return new Uint8Array(request.response);
  }

  function hexToInt(a, size) {
    var n = 0;
    for (var i = 0; i <= size; i++) {
      n = (n << 8) | a[i];
    }
    return n >>> 0;
  }

  function hexToStr(a, size) {
    // This code is hot. Special-case some common values to avoid creating an
    // object with subarray().
    if (size === 1) {
      return String.fromCharCode(a[0], a[1]);
    }
    if (size === 3) {
      return String.fromCharCode(a[0], a[1], a[2], a[3]);
    }
    return String.fromCharCode.apply(null, a.subarray(0, size + 1));
  }

  function addHex(a, b, size) {
    var c = 0;
    for (var i = size; i >= 0; i--) {
      c += a[i] + b[i];
      a[i] = c & 255;
      c >>= 8;
    }
  }

  function incHex(a, size) {
    var c = 1;
    for (var i = size; i >= 0 && c > 0; i--) {
      c += a[i];
      a[i] = c & 255;
      c >>= 8;
    }
  }

  var MAX_NUM_SIZE = 16;
  var MAX_ENCODED_NUM_SIZE = 19; // ceil(MAX_NUM_SIZE * 7 / 8)

  function BinaryCMapStream(data) {
    this.buffer = data;
    this.pos = 0;
    this.end = data.length;
    this.tmpBuf = new Uint8Array(MAX_ENCODED_NUM_SIZE);
  }

  BinaryCMapStream.prototype = {
    readByte: function () {
      if (this.pos >= this.end) {
        return -1;
      }
      return this.buffer[this.pos++];
    },
    readNumber: function () {
      var n = 0;
      var last;
      do {
        var b = this.readByte();
        if (b < 0) {
          error('unexpected EOF in bcmap');
        }
        last = !(b & 0x80);
        n = (n << 7) | (b & 0x7F);
      } while (!last);
      return n;
    },
    readSigned: function () {
      var n = this.readNumber();
      return (n & 1) ? ~(n >>> 1) : n >>> 1;
    },
    readHex: function (num, size) {
      num.set(this.buffer.subarray(this.pos,
        this.pos + size + 1));
      this.pos += size + 1;
    },
    readHexNumber: function (num, size) {
      var last;
      var stack = this.tmpBuf, sp = 0;
      do {
        var b = this.readByte();
        if (b < 0) {
          error('unexpected EOF in bcmap');
        }
        last = !(b & 0x80);
        stack[sp++] = b & 0x7F;
      } while (!last);
      var i = size, buffer = 0, bufferSize = 0;
      while (i >= 0) {
        while (bufferSize < 8 && stack.length > 0) {
          buffer = (stack[--sp] << bufferSize) | buffer;
          bufferSize += 7;
        }
        num[i] = buffer & 255;
        i--;
        buffer >>= 8;
        bufferSize -= 8;
      }
    },
    readHexSigned: function (num, size) {
      this.readHexNumber(num, size);
      var sign = num[size] & 1 ? 255 : 0;
      var c = 0;
      for (var i = 0; i <= size; i++) {
        c = ((c & 1) << 8) | num[i];
        num[i] = (c >> 1) ^ sign;
      }
    },
    readString: function () {
      var len = this.readNumber();
      var s = '';
      for (var i = 0; i < len; i++) {
        s += String.fromCharCode(this.readNumber());
      }
      return s;
    }
  };

  function processBinaryCMap(url, cMap, extend) {
    var data = fetchBinaryData(url);
    var stream = new BinaryCMapStream(data);

    var header = stream.readByte();
    cMap.vertical = !!(header & 1);

    var useCMap = null;
    var start = new Uint8Array(MAX_NUM_SIZE);
    var end = new Uint8Array(MAX_NUM_SIZE);
    var char = new Uint8Array(MAX_NUM_SIZE);
    var charCode = new Uint8Array(MAX_NUM_SIZE);
    var tmp = new Uint8Array(MAX_NUM_SIZE);
    var code;

    var b;
    while ((b = stream.readByte()) >= 0) {
      var type = b >> 5;
      if (type === 7) { // metadata, e.g. comment or usecmap
        switch (b & 0x1F) {
          case 0:
            stream.readString(); // skipping comment
            break;
          case 1:
            useCMap = stream.readString();
            break;
        }
        continue;
      }
      var sequence = !!(b & 0x10);
      var dataSize = b & 15;

      assert(dataSize + 1 <= MAX_NUM_SIZE);

      var ucs2DataSize = 1;
      var subitemsCount = stream.readNumber();
      var i;
      switch (type) {
        case 0: // codespacerange
          stream.readHex(start, dataSize);
          stream.readHexNumber(end, dataSize);
          addHex(end, start, dataSize);
          cMap.addCodespaceRange(dataSize + 1, hexToInt(start, dataSize),
                                 hexToInt(end, dataSize));
          for (i = 1; i < subitemsCount; i++) {
            incHex(end, dataSize);
            stream.readHexNumber(start, dataSize);
            addHex(start, end, dataSize);
            stream.readHexNumber(end, dataSize);
            addHex(end, start, dataSize);
            cMap.addCodespaceRange(dataSize + 1, hexToInt(start, dataSize),
                                   hexToInt(end, dataSize));
          }
          break;
        case 1: // notdefrange
          stream.readHex(start, dataSize);
          stream.readHexNumber(end, dataSize);
          addHex(end, start, dataSize);
          code = stream.readNumber();
          // undefined range, skipping
          for (i = 1; i < subitemsCount; i++) {
            incHex(end, dataSize);
            stream.readHexNumber(start, dataSize);
            addHex(start, end, dataSize);
            stream.readHexNumber(end, dataSize);
            addHex(end, start, dataSize);
            code = stream.readNumber();
            // nop
          }
          break;
        case 2: // cidchar
          stream.readHex(char, dataSize);
          code = stream.readNumber();
          cMap.mapOne(hexToInt(char, dataSize), code);
          for (i = 1; i < subitemsCount; i++) {
            incHex(char, dataSize);
            if (!sequence) {
              stream.readHexNumber(tmp, dataSize);
              addHex(char, tmp, dataSize);
            }
            code = stream.readSigned() + (code + 1);
            cMap.mapOne(hexToInt(char, dataSize), code);
          }
          break;
        case 3: // cidrange
          stream.readHex(start, dataSize);
          stream.readHexNumber(end, dataSize);
          addHex(end, start, dataSize);
          code = stream.readNumber();
          cMap.mapCidRange(hexToInt(start, dataSize), hexToInt(end, dataSize),
                           code);
          for (i = 1; i < subitemsCount; i++) {
            incHex(end, dataSize);
            if (!sequence) {
              stream.readHexNumber(start, dataSize);
              addHex(start, end, dataSize);
            } else {
              start.set(end);
            }
            stream.readHexNumber(end, dataSize);
            addHex(end, start, dataSize);
            code = stream.readNumber();
            cMap.mapCidRange(hexToInt(start, dataSize), hexToInt(end, dataSize),
                             code);
          }
          break;
        case 4: // bfchar
          stream.readHex(char, ucs2DataSize);
          stream.readHex(charCode, dataSize);
          cMap.mapOne(hexToInt(char, ucs2DataSize),
                      hexToStr(charCode, dataSize));
          for (i = 1; i < subitemsCount; i++) {
            incHex(char, ucs2DataSize);
            if (!sequence) {
              stream.readHexNumber(tmp, ucs2DataSize);
              addHex(char, tmp, ucs2DataSize);
            }
            incHex(charCode, dataSize);
            stream.readHexSigned(tmp, dataSize);
            addHex(charCode, tmp, dataSize);
            cMap.mapOne(hexToInt(char, ucs2DataSize),
                        hexToStr(charCode, dataSize));
          }
          break;
        case 5: // bfrange
          stream.readHex(start, ucs2DataSize);
          stream.readHexNumber(end, ucs2DataSize);
          addHex(end, start, ucs2DataSize);
          stream.readHex(charCode, dataSize);
          cMap.mapBfRange(hexToInt(start, ucs2DataSize),
                          hexToInt(end, ucs2DataSize),
                          hexToStr(charCode, dataSize));
          for (i = 1; i < subitemsCount; i++) {
            incHex(end, ucs2DataSize);
            if (!sequence) {
              stream.readHexNumber(start, ucs2DataSize);
              addHex(start, end, ucs2DataSize);
            } else {
              start.set(end);
            }
            stream.readHexNumber(end, ucs2DataSize);
            addHex(end, start, ucs2DataSize);
            stream.readHex(charCode, dataSize);
            cMap.mapBfRange(hexToInt(start, ucs2DataSize),
                            hexToInt(end, ucs2DataSize),
                            hexToStr(charCode, dataSize));
          }
          break;
        default:
          error('Unknown type: ' + type);
          break;
      }
    }

    if (useCMap) {
      extend(useCMap);
    }
    return cMap;
  }

  function BinaryCMapReader() {}

  BinaryCMapReader.prototype = {
    read: processBinaryCMap
  };

  return BinaryCMapReader;
})();

var CMapFactory = (function CMapFactoryClosure() {
  function strToInt(str) {
    var a = 0;
    for (var i = 0; i < str.length; i++) {
      a = (a << 8) | str.charCodeAt(i);
    }
    return a >>> 0;
  }

  function expectString(obj) {
    if (!isString(obj)) {
      error('Malformed CMap: expected string.');
    }
  }

  function expectInt(obj) {
    if (!isInt(obj)) {
      error('Malformed CMap: expected int.');
    }
  }

  function parseBfChar(cMap, lexer) {
    while (true) {
      var obj = lexer.getObj();
      if (isEOF(obj)) {
        break;
      }
      if (isCmd(obj, 'endbfchar')) {
        return;
      }
      expectString(obj);
      var src = strToInt(obj);
      obj = lexer.getObj();
      // TODO are /dstName used?
      expectString(obj);
      var dst = obj;
      cMap.mapOne(src, dst);
    }
  }

  function parseBfRange(cMap, lexer) {
    while (true) {
      var obj = lexer.getObj();
      if (isEOF(obj)) {
        break;
      }
      if (isCmd(obj, 'endbfrange')) {
        return;
      }
      expectString(obj);
      var low = strToInt(obj);
      obj = lexer.getObj();
      expectString(obj);
      var high = strToInt(obj);
      obj = lexer.getObj();
      if (isInt(obj) || isString(obj)) {
        var dstLow = isInt(obj) ? String.fromCharCode(obj) : obj;
        cMap.mapBfRange(low, high, dstLow);
      } else if (isCmd(obj, '[')) {
        obj = lexer.getObj();
        var array = [];
        while (!isCmd(obj, ']') && !isEOF(obj)) {
          array.push(obj);
          obj = lexer.getObj();
        }
        cMap.mapBfRangeToArray(low, high, array);
      } else {
        break;
      }
    }
    error('Invalid bf range.');
  }

  function parseCidChar(cMap, lexer) {
    while (true) {
      var obj = lexer.getObj();
      if (isEOF(obj)) {
        break;
      }
      if (isCmd(obj, 'endcidchar')) {
        return;
      }
      expectString(obj);
      var src = strToInt(obj);
      obj = lexer.getObj();
      expectInt(obj);
      var dst = obj;
      cMap.mapOne(src, dst);
    }
  }

  function parseCidRange(cMap, lexer) {
    while (true) {
      var obj = lexer.getObj();
      if (isEOF(obj)) {
        break;
      }
      if (isCmd(obj, 'endcidrange')) {
        return;
      }
      expectString(obj);
      var low = strToInt(obj);
      obj = lexer.getObj();
      expectString(obj);
      var high = strToInt(obj);
      obj = lexer.getObj();
      expectInt(obj);
      var dstLow = obj;
      cMap.mapCidRange(low, high, dstLow);
    }
  }

  function parseCodespaceRange(cMap, lexer) {
    while (true) {
      var obj = lexer.getObj();
      if (isEOF(obj)) {
        break;
      }
      if (isCmd(obj, 'endcodespacerange')) {
        return;
      }
      if (!isString(obj)) {
        break;
      }
      var low = strToInt(obj);
      obj = lexer.getObj();
      if (!isString(obj)) {
        break;
      }
      var high = strToInt(obj);
      cMap.addCodespaceRange(obj.length, low, high);
    }
    error('Invalid codespace range.');
  }

  function parseWMode(cMap, lexer) {
    var obj = lexer.getObj();
    if (isInt(obj)) {
      cMap.vertical = !!obj;
    }
  }

  function parseCMap(cMap, lexer, builtInCMapParams, useCMap) {
    var previous;
    var embededUseCMap;
    objLoop: while (true) {
      var obj = lexer.getObj();
      if (isEOF(obj)) {
        break;
      } else if (isName(obj)) {
        if (obj.name === 'WMode') {
          parseWMode(cMap, lexer);
        }
        previous = obj;
      } else if (isCmd(obj)) {
        switch (obj.cmd) {
          case 'endcmap':
            break objLoop;
          case 'usecmap':
            if (isName(previous)) {
              embededUseCMap = previous.name;
            }
            break;
          case 'begincodespacerange':
            parseCodespaceRange(cMap, lexer);
            break;
          case 'beginbfchar':
            parseBfChar(cMap, lexer);
            break;
          case 'begincidchar':
            parseCidChar(cMap, lexer);
            break;
          case 'beginbfrange':
            parseBfRange(cMap, lexer);
            break;
          case 'begincidrange':
            parseCidRange(cMap, lexer);
            break;
        }
      }
    }

    if (!useCMap && embededUseCMap) {
      // Load the usecmap definition from the file only if there wasn't one
      // specified.
      useCMap = embededUseCMap;
    }
    if (useCMap) {
      extendCMap(cMap, builtInCMapParams, useCMap);
    }
  }

  function extendCMap(cMap, builtInCMapParams, useCMap) {
    cMap.useCMap = createBuiltInCMap(useCMap, builtInCMapParams);
    // If there aren't any code space ranges defined clone all the parent ones
    // into this cMap.
    if (cMap.numCodespaceRanges === 0) {
      var useCodespaceRanges = cMap.useCMap.codespaceRanges;
      for (var i = 0; i < useCodespaceRanges.length; i++) {
        cMap.codespaceRanges[i] = useCodespaceRanges[i].slice();
      }
      cMap.numCodespaceRanges = cMap.useCMap.numCodespaceRanges;
    }
    // Merge the map into the current one, making sure not to override
    // any previously defined entries.
    cMap.useCMap.forEach(function(key, value) {
      if (!cMap.contains(key)) {
        cMap.mapOne(key, cMap.useCMap.lookup(key));
      }
    });
  }

  function parseBinaryCMap(name, builtInCMapParams) {
    var url = builtInCMapParams.url + name + '.bcmap';
    var cMap = new CMap(true);
    new BinaryCMapReader().read(url, cMap, function (useCMap) {
      extendCMap(cMap, builtInCMapParams, useCMap);
    });
    return cMap;
  }

  function createBuiltInCMap(name, builtInCMapParams) {
    if (name === 'Identity-H') {
      return new IdentityCMap(false, 2);
    } else if (name === 'Identity-V') {
      return new IdentityCMap(true, 2);
    }
    if (BUILT_IN_CMAPS.indexOf(name) === -1) {
      error('Unknown cMap name: ' + name);
    }
    assert(builtInCMapParams, 'built-in cMap parameters are not provided');

    if (builtInCMapParams.packed) {
      return parseBinaryCMap(name, builtInCMapParams);
    }

    var request = new XMLHttpRequest();
    var url = builtInCMapParams.url + name;
    request.open('GET', url, false);
    request.send(null);
    if (!request.responseText) {
      error('Unable to get cMap at: ' + url);
    }
    var cMap = new CMap(true);
    var lexer = new Lexer(new StringStream(request.responseText));
    parseCMap(cMap, lexer, builtInCMapParams, null);
    return cMap;
  }

  return {
    create: function (encoding, builtInCMapParams, useCMap) {
      if (isName(encoding)) {
        return createBuiltInCMap(encoding.name, builtInCMapParams);
      } else if (isStream(encoding)) {
        var cMap = new CMap();
        var lexer = new Lexer(encoding);
        try {
          parseCMap(cMap, lexer, builtInCMapParams, useCMap);
        } catch (e) {
          warn('Invalid CMap data. ' + e);
        }
        return cMap;
      }
      error('Encoding required.');
    }
  };
})();


// Unicode Private Use Area
var PRIVATE_USE_OFFSET_START = 0xE000;
var PRIVATE_USE_OFFSET_END = 0xF8FF;
var SKIP_PRIVATE_USE_RANGE_F000_TO_F01F = false;

// PDF Glyph Space Units are one Thousandth of a TextSpace Unit
// except for Type 3 fonts
var PDF_GLYPH_SPACE_UNITS = 1000;

// Hinting is currently disabled due to unknown problems on windows
// in tracemonkey and various other pdfs with type1 fonts.
var HINTING_ENABLED = false;

// Accented charactars are not displayed properly on windows, using this flag
// to control analysis of seac charstrings.
var SEAC_ANALYSIS_ENABLED = false;

var FontFlags = {
  FixedPitch: 1,
  Serif: 2,
  Symbolic: 4,
  Script: 8,
  Nonsymbolic: 32,
  Italic: 64,
  AllCap: 65536,
  SmallCap: 131072,
  ForceBold: 262144
};

var Encodings = {
  ExpertEncoding: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    'space', 'exclamsmall', 'Hungarumlautsmall', '', 'dollaroldstyle',
    'dollarsuperior', 'ampersandsmall', 'Acutesmall', 'parenleftsuperior',
    'parenrightsuperior', 'twodotenleader', 'onedotenleader', 'comma',
    'hyphen', 'period', 'fraction', 'zerooldstyle', 'oneoldstyle',
    'twooldstyle', 'threeoldstyle', 'fouroldstyle', 'fiveoldstyle',
    'sixoldstyle', 'sevenoldstyle', 'eightoldstyle', 'nineoldstyle', 'colon',
    'semicolon', 'commasuperior', 'threequartersemdash', 'periodsuperior',
    'questionsmall', '', 'asuperior', 'bsuperior', 'centsuperior', 'dsuperior',
    'esuperior', '', '', 'isuperior', '', '', 'lsuperior', 'msuperior',
    'nsuperior', 'osuperior', '', '', 'rsuperior', 'ssuperior', 'tsuperior',
    '', 'ff', 'fi', 'fl', 'ffi', 'ffl', 'parenleftinferior', '',
    'parenrightinferior', 'Circumflexsmall', 'hyphensuperior', 'Gravesmall',
    'Asmall', 'Bsmall', 'Csmall', 'Dsmall', 'Esmall', 'Fsmall', 'Gsmall',
    'Hsmall', 'Ismall', 'Jsmall', 'Ksmall', 'Lsmall', 'Msmall', 'Nsmall',
    'Osmall', 'Psmall', 'Qsmall', 'Rsmall', 'Ssmall', 'Tsmall', 'Usmall',
    'Vsmall', 'Wsmall', 'Xsmall', 'Ysmall', 'Zsmall', 'colonmonetary',
    'onefitted', 'rupiah', 'Tildesmall', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', 'exclamdownsmall', 'centoldstyle', 'Lslashsmall',
    '', '', 'Scaronsmall', 'Zcaronsmall', 'Dieresissmall', 'Brevesmall',
    'Caronsmall', '', 'Dotaccentsmall', '', '', 'Macronsmall', '', '',
    'figuredash', 'hypheninferior', '', '', 'Ogoneksmall', 'Ringsmall',
    'Cedillasmall', '', '', '', 'onequarter', 'onehalf', 'threequarters',
    'questiondownsmall', 'oneeighth', 'threeeighths', 'fiveeighths',
    'seveneighths', 'onethird', 'twothirds', '', '', 'zerosuperior',
    'onesuperior', 'twosuperior', 'threesuperior', 'foursuperior',
    'fivesuperior', 'sixsuperior', 'sevensuperior', 'eightsuperior',
    'ninesuperior', 'zeroinferior', 'oneinferior', 'twoinferior',
    'threeinferior', 'fourinferior', 'fiveinferior', 'sixinferior',
    'seveninferior', 'eightinferior', 'nineinferior', 'centinferior',
    'dollarinferior', 'periodinferior', 'commainferior', 'Agravesmall',
    'Aacutesmall', 'Acircumflexsmall', 'Atildesmall', 'Adieresissmall',
    'Aringsmall', 'AEsmall', 'Ccedillasmall', 'Egravesmall', 'Eacutesmall',
    'Ecircumflexsmall', 'Edieresissmall', 'Igravesmall', 'Iacutesmall',
    'Icircumflexsmall', 'Idieresissmall', 'Ethsmall', 'Ntildesmall',
    'Ogravesmall', 'Oacutesmall', 'Ocircumflexsmall', 'Otildesmall',
    'Odieresissmall', 'OEsmall', 'Oslashsmall', 'Ugravesmall', 'Uacutesmall',
    'Ucircumflexsmall', 'Udieresissmall', 'Yacutesmall', 'Thornsmall',
    'Ydieresissmall'],
  MacExpertEncoding: ['', '', '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    'space', 'exclamsmall', 'Hungarumlautsmall', 'centoldstyle',
    'dollaroldstyle', 'dollarsuperior', 'ampersandsmall', 'Acutesmall',
    'parenleftsuperior', 'parenrightsuperior', 'twodotenleader',
    'onedotenleader', 'comma', 'hyphen', 'period', 'fraction', 'zerooldstyle',
    'oneoldstyle', 'twooldstyle', 'threeoldstyle', 'fouroldstyle',
    'fiveoldstyle', 'sixoldstyle', 'sevenoldstyle', 'eightoldstyle',
    'nineoldstyle', 'colon', 'semicolon', '', 'threequartersemdash', '',
    'questionsmall', '', '', '', '', 'Ethsmall', '', '', 'onequarter',
    'onehalf', 'threequarters', 'oneeighth', 'threeeighths', 'fiveeighths',
    'seveneighths', 'onethird', 'twothirds', '', '', '', '', '', '', 'ff',
    'fi', 'fl', 'ffi', 'ffl', 'parenleftinferior', '', 'parenrightinferior',
    'Circumflexsmall', 'hypheninferior', 'Gravesmall', 'Asmall', 'Bsmall',
    'Csmall', 'Dsmall', 'Esmall', 'Fsmall', 'Gsmall', 'Hsmall', 'Ismall',
    'Jsmall', 'Ksmall', 'Lsmall', 'Msmall', 'Nsmall', 'Osmall', 'Psmall',
    'Qsmall', 'Rsmall', 'Ssmall', 'Tsmall', 'Usmall', 'Vsmall', 'Wsmall',
    'Xsmall', 'Ysmall', 'Zsmall', 'colonmonetary', 'onefitted', 'rupiah',
    'Tildesmall', '', '', 'asuperior', 'centsuperior', '', '', '', '',
    'Aacutesmall', 'Agravesmall', 'Acircumflexsmall', 'Adieresissmall',
    'Atildesmall', 'Aringsmall', 'Ccedillasmall', 'Eacutesmall', 'Egravesmall',
    'Ecircumflexsmall', 'Edieresissmall', 'Iacutesmall', 'Igravesmall',
    'Icircumflexsmall', 'Idieresissmall', 'Ntildesmall', 'Oacutesmall',
    'Ogravesmall', 'Ocircumflexsmall', 'Odieresissmall', 'Otildesmall',
    'Uacutesmall', 'Ugravesmall', 'Ucircumflexsmall', 'Udieresissmall', '',
    'eightsuperior', 'fourinferior', 'threeinferior', 'sixinferior',
    'eightinferior', 'seveninferior', 'Scaronsmall', '', 'centinferior',
    'twoinferior', '', 'Dieresissmall', '', 'Caronsmall', 'osuperior',
    'fiveinferior', '', 'commainferior', 'periodinferior', 'Yacutesmall', '',
    'dollarinferior', '', 'Thornsmall', '', 'nineinferior', 'zeroinferior',
    'Zcaronsmall', 'AEsmall', 'Oslashsmall', 'questiondownsmall',
    'oneinferior', 'Lslashsmall', '', '', '', '', '', '', 'Cedillasmall', '',
    '', '', '', '', 'OEsmall', 'figuredash', 'hyphensuperior', '', '', '', '',
    'exclamdownsmall', '', 'Ydieresissmall', '', 'onesuperior', 'twosuperior',
    'threesuperior', 'foursuperior', 'fivesuperior', 'sixsuperior',
    'sevensuperior', 'ninesuperior', 'zerosuperior', '', 'esuperior',
    'rsuperior', 'tsuperior', '', '', 'isuperior', 'ssuperior', 'dsuperior',
    '', '', '', '', '', 'lsuperior', 'Ogoneksmall', 'Brevesmall',
    'Macronsmall', 'bsuperior', 'nsuperior', 'msuperior', 'commasuperior',
    'periodsuperior', 'Dotaccentsmall', 'Ringsmall'],
  MacRomanEncoding: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    'space', 'exclam', 'quotedbl', 'numbersign', 'dollar', 'percent',
    'ampersand', 'quotesingle', 'parenleft', 'parenright', 'asterisk', 'plus',
    'comma', 'hyphen', 'period', 'slash', 'zero', 'one', 'two', 'three',
    'four', 'five', 'six', 'seven', 'eight', 'nine', 'colon', 'semicolon',
    'less', 'equal', 'greater', 'question', 'at', 'A', 'B', 'C', 'D', 'E', 'F',
    'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
    'V', 'W', 'X', 'Y', 'Z', 'bracketleft', 'backslash', 'bracketright',
    'asciicircum', 'underscore', 'grave', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
    'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z', 'braceleft', 'bar', 'braceright', 'asciitilde', '',
    'Adieresis', 'Aring', 'Ccedilla', 'Eacute', 'Ntilde', 'Odieresis',
    'Udieresis', 'aacute', 'agrave', 'acircumflex', 'adieresis', 'atilde',
    'aring', 'ccedilla', 'eacute', 'egrave', 'ecircumflex', 'edieresis',
    'iacute', 'igrave', 'icircumflex', 'idieresis', 'ntilde', 'oacute',
    'ograve', 'ocircumflex', 'odieresis', 'otilde', 'uacute', 'ugrave',
    'ucircumflex', 'udieresis', 'dagger', 'degree', 'cent', 'sterling',
    'section', 'bullet', 'paragraph', 'germandbls', 'registered', 'copyright',
    'trademark', 'acute', 'dieresis', 'notequal', 'AE', 'Oslash', 'infinity',
    'plusminus', 'lessequal', 'greaterequal', 'yen', 'mu', 'partialdiff',
    'summation', 'product', 'pi', 'integral', 'ordfeminine', 'ordmasculine',
    'Omega', 'ae', 'oslash', 'questiondown', 'exclamdown', 'logicalnot',
    'radical', 'florin', 'approxequal', 'Delta', 'guillemotleft',
    'guillemotright', 'ellipsis', 'space', 'Agrave', 'Atilde', 'Otilde', 'OE',
    'oe', 'endash', 'emdash', 'quotedblleft', 'quotedblright', 'quoteleft',
    'quoteright', 'divide', 'lozenge', 'ydieresis', 'Ydieresis', 'fraction',
    'currency', 'guilsinglleft', 'guilsinglright', 'fi', 'fl', 'daggerdbl',
    'periodcentered', 'quotesinglbase', 'quotedblbase', 'perthousand',
    'Acircumflex', 'Ecircumflex', 'Aacute', 'Edieresis', 'Egrave', 'Iacute',
    'Icircumflex', 'Idieresis', 'Igrave', 'Oacute', 'Ocircumflex', 'apple',
    'Ograve', 'Uacute', 'Ucircumflex', 'Ugrave', 'dotlessi', 'circumflex',
    'tilde', 'macron', 'breve', 'dotaccent', 'ring', 'cedilla', 'hungarumlaut',
    'ogonek', 'caron'],
  StandardEncoding: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    'space', 'exclam', 'quotedbl', 'numbersign', 'dollar', 'percent',
    'ampersand', 'quoteright', 'parenleft', 'parenright', 'asterisk', 'plus',
    'comma', 'hyphen', 'period', 'slash', 'zero', 'one', 'two', 'three',
    'four', 'five', 'six', 'seven', 'eight', 'nine', 'colon', 'semicolon',
    'less', 'equal', 'greater', 'question', 'at', 'A', 'B', 'C', 'D', 'E', 'F',
    'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
    'V', 'W', 'X', 'Y', 'Z', 'bracketleft', 'backslash', 'bracketright',
    'asciicircum', 'underscore', 'quoteleft', 'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u',
    'v', 'w', 'x', 'y', 'z', 'braceleft', 'bar', 'braceright', 'asciitilde',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'exclamdown',
    'cent', 'sterling', 'fraction', 'yen', 'florin', 'section', 'currency',
    'quotesingle', 'quotedblleft', 'guillemotleft', 'guilsinglleft',
    'guilsinglright', 'fi', 'fl', '', 'endash', 'dagger', 'daggerdbl',
    'periodcentered', '', 'paragraph', 'bullet', 'quotesinglbase',
    'quotedblbase', 'quotedblright', 'guillemotright', 'ellipsis',
    'perthousand', '', 'questiondown', '', 'grave', 'acute', 'circumflex',
    'tilde', 'macron', 'breve', 'dotaccent', 'dieresis', '', 'ring', 'cedilla',
    '', 'hungarumlaut', 'ogonek', 'caron', 'emdash', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', 'AE', '', 'ordfeminine', '', '',
    '', '', 'Lslash', 'Oslash', 'OE', 'ordmasculine', '', '', '', '', '', 'ae',
    '', '', '', 'dotlessi', '', '', 'lslash', 'oslash', 'oe', 'germandbls'],
  WinAnsiEncoding: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    'space', 'exclam', 'quotedbl', 'numbersign', 'dollar', 'percent',
    'ampersand', 'quotesingle', 'parenleft', 'parenright', 'asterisk', 'plus',
    'comma', 'hyphen', 'period', 'slash', 'zero', 'one', 'two', 'three',
    'four', 'five', 'six', 'seven', 'eight', 'nine', 'colon', 'semicolon',
    'less', 'equal', 'greater', 'question', 'at', 'A', 'B', 'C', 'D', 'E', 'F',
    'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
    'V', 'W', 'X', 'Y', 'Z', 'bracketleft', 'backslash', 'bracketright',
    'asciicircum', 'underscore', 'grave', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
    'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z', 'braceleft', 'bar', 'braceright', 'asciitilde',
    'bullet', 'Euro', 'bullet', 'quotesinglbase', 'florin', 'quotedblbase',
    'ellipsis', 'dagger', 'daggerdbl', 'circumflex', 'perthousand', 'Scaron',
    'guilsinglleft', 'OE', 'bullet', 'Zcaron', 'bullet', 'bullet', 'quoteleft',
    'quoteright', 'quotedblleft', 'quotedblright', 'bullet', 'endash',
    'emdash', 'tilde', 'trademark', 'scaron', 'guilsinglright', 'oe', 'bullet',
    'zcaron', 'Ydieresis', 'space', 'exclamdown', 'cent', 'sterling',
    'currency', 'yen', 'brokenbar', 'section', 'dieresis', 'copyright',
    'ordfeminine', 'guillemotleft', 'logicalnot', 'hyphen', 'registered',
    'macron', 'degree', 'plusminus', 'twosuperior', 'threesuperior', 'acute',
    'mu', 'paragraph', 'periodcentered', 'cedilla', 'onesuperior',
    'ordmasculine', 'guillemotright', 'onequarter', 'onehalf', 'threequarters',
    'questiondown', 'Agrave', 'Aacute', 'Acircumflex', 'Atilde', 'Adieresis',
    'Aring', 'AE', 'Ccedilla', 'Egrave', 'Eacute', 'Ecircumflex', 'Edieresis',
    'Igrave', 'Iacute', 'Icircumflex', 'Idieresis', 'Eth', 'Ntilde', 'Ograve',
    'Oacute', 'Ocircumflex', 'Otilde', 'Odieresis', 'multiply', 'Oslash',
    'Ugrave', 'Uacute', 'Ucircumflex', 'Udieresis', 'Yacute', 'Thorn',
    'germandbls', 'agrave', 'aacute', 'acircumflex', 'atilde', 'adieresis',
    'aring', 'ae', 'ccedilla', 'egrave', 'eacute', 'ecircumflex', 'edieresis',
    'igrave', 'iacute', 'icircumflex', 'idieresis', 'eth', 'ntilde', 'ograve',
    'oacute', 'ocircumflex', 'otilde', 'odieresis', 'divide', 'oslash',
    'ugrave', 'uacute', 'ucircumflex', 'udieresis', 'yacute', 'thorn',
    'ydieresis'],
  SymbolSetEncoding: ['', '', '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    'space', 'exclam', 'universal', 'numbersign', 'existential', 'percent',
    'ampersand', 'suchthat', 'parenleft', 'parenright', 'asteriskmath', 'plus',
    'comma', 'minus', 'period', 'slash', 'zero', 'one', 'two', 'three', 'four',
    'five', 'six', 'seven', 'eight', 'nine', 'colon', 'semicolon', 'less',
    'equal', 'greater', 'question', 'congruent', 'Alpha', 'Beta', 'Chi',
    'Delta', 'Epsilon', 'Phi', 'Gamma', 'Eta', 'Iota', 'theta1', 'Kappa',
    'Lambda', 'Mu', 'Nu', 'Omicron', 'Pi', 'Theta', 'Rho', 'Sigma', 'Tau',
    'Upsilon', 'sigma1', 'Omega', 'Xi', 'Psi', 'Zeta', 'bracketleft',
    'therefore', 'bracketright', 'perpendicular', 'underscore', 'radicalex',
    'alpha', 'beta', 'chi', 'delta', 'epsilon', 'phi', 'gamma', 'eta', 'iota',
    'phi1', 'kappa', 'lambda', 'mu', 'nu', 'omicron', 'pi', 'theta', 'rho',
    'sigma', 'tau', 'upsilon', 'omega1', 'omega', 'xi', 'psi', 'zeta',
    'braceleft', 'bar', 'braceright', 'similar', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', 'Euro', 'Upsilon1', 'minute', 'lessequal',
    'fraction', 'infinity', 'florin', 'club', 'diamond', 'heart', 'spade',
    'arrowboth', 'arrowleft', 'arrowup', 'arrowright', 'arrowdown', 'degree',
    'plusminus', 'second', 'greaterequal', 'multiply', 'proportional',
    'partialdiff', 'bullet', 'divide', 'notequal', 'equivalence',
    'approxequal', 'ellipsis', 'arrowvertex', 'arrowhorizex', 'carriagereturn',
    'aleph', 'Ifraktur', 'Rfraktur', 'weierstrass', 'circlemultiply',
    'circleplus', 'emptyset', 'intersection', 'union', 'propersuperset',
    'reflexsuperset', 'notsubset', 'propersubset', 'reflexsubset', 'element',
    'notelement', 'angle', 'gradient', 'registerserif', 'copyrightserif',
    'trademarkserif', 'product', 'radical', 'dotmath', 'logicalnot',
    'logicaland', 'logicalor', 'arrowdblboth', 'arrowdblleft', 'arrowdblup',
    'arrowdblright', 'arrowdbldown', 'lozenge', 'angleleft', 'registersans',
    'copyrightsans', 'trademarksans', 'summation', 'parenlefttp',
    'parenleftex', 'parenleftbt', 'bracketlefttp', 'bracketleftex',
    'bracketleftbt', 'bracelefttp', 'braceleftmid', 'braceleftbt', 'braceex',
    '', 'angleright', 'integral', 'integraltp', 'integralex', 'integralbt',
    'parenrighttp', 'parenrightex', 'parenrightbt', 'bracketrighttp',
    'bracketrightex', 'bracketrightbt', 'bracerighttp', 'bracerightmid',
    'bracerightbt'],
  ZapfDingbatsEncoding: ['', '', '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    'space', 'a1', 'a2', 'a202', 'a3', 'a4', 'a5', 'a119', 'a118', 'a117',
    'a11', 'a12', 'a13', 'a14', 'a15', 'a16', 'a105', 'a17', 'a18', 'a19',
    'a20', 'a21', 'a22', 'a23', 'a24', 'a25', 'a26', 'a27', 'a28', 'a6', 'a7',
    'a8', 'a9', 'a10', 'a29', 'a30', 'a31', 'a32', 'a33', 'a34', 'a35', 'a36',
    'a37', 'a38', 'a39', 'a40', 'a41', 'a42', 'a43', 'a44', 'a45', 'a46',
    'a47', 'a48', 'a49', 'a50', 'a51', 'a52', 'a53', 'a54', 'a55', 'a56',
    'a57', 'a58', 'a59', 'a60', 'a61', 'a62', 'a63', 'a64', 'a65', 'a66',
    'a67', 'a68', 'a69', 'a70', 'a71', 'a72', 'a73', 'a74', 'a203', 'a75',
    'a204', 'a76', 'a77', 'a78', 'a79', 'a81', 'a82', 'a83', 'a84', 'a97',
    'a98', 'a99', 'a100', '', 'a89', 'a90', 'a93', 'a94', 'a91', 'a92', 'a205',
    'a85', 'a206', 'a86', 'a87', 'a88', 'a95', 'a96', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', '', '', 'a101', 'a102', 'a103',
    'a104', 'a106', 'a107', 'a108', 'a112', 'a111', 'a110', 'a109', 'a120',
    'a121', 'a122', 'a123', 'a124', 'a125', 'a126', 'a127', 'a128', 'a129',
    'a130', 'a131', 'a132', 'a133', 'a134', 'a135', 'a136', 'a137', 'a138',
    'a139', 'a140', 'a141', 'a142', 'a143', 'a144', 'a145', 'a146', 'a147',
    'a148', 'a149', 'a150', 'a151', 'a152', 'a153', 'a154', 'a155', 'a156',
    'a157', 'a158', 'a159', 'a160', 'a161', 'a163', 'a164', 'a196', 'a165',
    'a192', 'a166', 'a167', 'a168', 'a169', 'a170', 'a171', 'a172', 'a173',
    'a162', 'a174', 'a175', 'a176', 'a177', 'a178', 'a179', 'a193', 'a180',
    'a199', 'a181', 'a200', 'a182', '', 'a201', 'a183', 'a184', 'a197', 'a185',
    'a194', 'a198', 'a186', 'a195', 'a187', 'a188', 'a189', 'a190', 'a191']
};

/**
 * Hold a map of decoded fonts and of the standard fourteen Type1
 * fonts and their acronyms.
 */
var stdFontMap = {
  'ArialNarrow': 'Helvetica',
  'ArialNarrow-Bold': 'Helvetica-Bold',
  'ArialNarrow-BoldItalic': 'Helvetica-BoldOblique',
  'ArialNarrow-Italic': 'Helvetica-Oblique',
  'ArialBlack': 'Helvetica',
  'ArialBlack-Bold': 'Helvetica-Bold',
  'ArialBlack-BoldItalic': 'Helvetica-BoldOblique',
  'ArialBlack-Italic': 'Helvetica-Oblique',
  'Arial': 'Helvetica',
  'Arial-Bold': 'Helvetica-Bold',
  'Arial-BoldItalic': 'Helvetica-BoldOblique',
  'Arial-Italic': 'Helvetica-Oblique',
  'Arial-BoldItalicMT': 'Helvetica-BoldOblique',
  'Arial-BoldMT': 'Helvetica-Bold',
  'Arial-ItalicMT': 'Helvetica-Oblique',
  'ArialMT': 'Helvetica',
  'Courier-Bold': 'Courier-Bold',
  'Courier-BoldItalic': 'Courier-BoldOblique',
  'Courier-Italic': 'Courier-Oblique',
  'CourierNew': 'Courier',
  'CourierNew-Bold': 'Courier-Bold',
  'CourierNew-BoldItalic': 'Courier-BoldOblique',
  'CourierNew-Italic': 'Courier-Oblique',
  'CourierNewPS-BoldItalicMT': 'Courier-BoldOblique',
  'CourierNewPS-BoldMT': 'Courier-Bold',
  'CourierNewPS-ItalicMT': 'Courier-Oblique',
  'CourierNewPSMT': 'Courier',
  'Helvetica-Bold': 'Helvetica-Bold',
  'Helvetica-BoldItalic': 'Helvetica-BoldOblique',
  'Helvetica-Italic': 'Helvetica-Oblique',
  'Symbol-Bold': 'Symbol',
  'Symbol-BoldItalic': 'Symbol',
  'Symbol-Italic': 'Symbol',
  'TimesNewRoman': 'Times-Roman',
  'TimesNewRoman-Bold': 'Times-Bold',
  'TimesNewRoman-BoldItalic': 'Times-BoldItalic',
  'TimesNewRoman-Italic': 'Times-Italic',
  'TimesNewRomanPS': 'Times-Roman',
  'TimesNewRomanPS-Bold': 'Times-Bold',
  'TimesNewRomanPS-BoldItalic': 'Times-BoldItalic',
  'TimesNewRomanPS-BoldItalicMT': 'Times-BoldItalic',
  'TimesNewRomanPS-BoldMT': 'Times-Bold',
  'TimesNewRomanPS-Italic': 'Times-Italic',
  'TimesNewRomanPS-ItalicMT': 'Times-Italic',
  'TimesNewRomanPSMT': 'Times-Roman',
  'TimesNewRomanPSMT-Bold': 'Times-Bold',
  'TimesNewRomanPSMT-BoldItalic': 'Times-BoldItalic',
  'TimesNewRomanPSMT-Italic': 'Times-Italic'
};

/**
 * Holds the map of the non-standard fonts that might be included as a standard
 * fonts without glyph data.
 */
var nonStdFontMap = {
  'ComicSansMS': 'Comic Sans MS',
  'ComicSansMS-Bold': 'Comic Sans MS-Bold',
  'ComicSansMS-BoldItalic': 'Comic Sans MS-BoldItalic',
  'ComicSansMS-Italic': 'Comic Sans MS-Italic',
  'LucidaConsole': 'Courier',
  'LucidaConsole-Bold': 'Courier-Bold',
  'LucidaConsole-BoldItalic': 'Courier-BoldOblique',
  'LucidaConsole-Italic': 'Courier-Oblique',
  'MS-Gothic': 'MS Gothic',
  'MS-Gothic-Bold': 'MS Gothic-Bold',
  'MS-Gothic-BoldItalic': 'MS Gothic-BoldItalic',
  'MS-Gothic-Italic': 'MS Gothic-Italic',
  'MS-Mincho': 'MS Mincho',
  'MS-Mincho-Bold': 'MS Mincho-Bold',
  'MS-Mincho-BoldItalic': 'MS Mincho-BoldItalic',
  'MS-Mincho-Italic': 'MS Mincho-Italic',
  'MS-PGothic': 'MS PGothic',
  'MS-PGothic-Bold': 'MS PGothic-Bold',
  'MS-PGothic-BoldItalic': 'MS PGothic-BoldItalic',
  'MS-PGothic-Italic': 'MS PGothic-Italic',
  'MS-PMincho': 'MS PMincho',
  'MS-PMincho-Bold': 'MS PMincho-Bold',
  'MS-PMincho-BoldItalic': 'MS PMincho-BoldItalic',
  'MS-PMincho-Italic': 'MS PMincho-Italic'
};

var serifFonts = {
  'Adobe Jenson': true, 'Adobe Text': true, 'Albertus': true,
  'Aldus': true, 'Alexandria': true, 'Algerian': true,
  'American Typewriter': true, 'Antiqua': true, 'Apex': true,
  'Arno': true, 'Aster': true, 'Aurora': true,
  'Baskerville': true, 'Bell': true, 'Bembo': true,
  'Bembo Schoolbook': true, 'Benguiat': true, 'Berkeley Old Style': true,
  'Bernhard Modern': true, 'Berthold City': true, 'Bodoni': true,
  'Bauer Bodoni': true, 'Book Antiqua': true, 'Bookman': true,
  'Bordeaux Roman': true, 'Californian FB': true, 'Calisto': true,
  'Calvert': true, 'Capitals': true, 'Cambria': true,
  'Cartier': true, 'Caslon': true, 'Catull': true,
  'Centaur': true, 'Century Old Style': true, 'Century Schoolbook': true,
  'Chaparral': true, 'Charis SIL': true, 'Cheltenham': true,
  'Cholla Slab': true, 'Clarendon': true, 'Clearface': true,
  'Cochin': true, 'Colonna': true, 'Computer Modern': true,
  'Concrete Roman': true, 'Constantia': true, 'Cooper Black': true,
  'Corona': true, 'Ecotype': true, 'Egyptienne': true,
  'Elephant': true, 'Excelsior': true, 'Fairfield': true,
  'FF Scala': true, 'Folkard': true, 'Footlight': true,
  'FreeSerif': true, 'Friz Quadrata': true, 'Garamond': true,
  'Gentium': true, 'Georgia': true, 'Gloucester': true,
  'Goudy Old Style': true, 'Goudy Schoolbook': true, 'Goudy Pro Font': true,
  'Granjon': true, 'Guardian Egyptian': true, 'Heather': true,
  'Hercules': true, 'High Tower Text': true, 'Hiroshige': true,
  'Hoefler Text': true, 'Humana Serif': true, 'Imprint': true,
  'Ionic No. 5': true, 'Janson': true, 'Joanna': true,
  'Korinna': true, 'Lexicon': true, 'Liberation Serif': true,
  'Linux Libertine': true, 'Literaturnaya': true, 'Lucida': true,
  'Lucida Bright': true, 'Melior': true, 'Memphis': true,
  'Miller': true, 'Minion': true, 'Modern': true,
  'Mona Lisa': true, 'Mrs Eaves': true, 'MS Serif': true,
  'Museo Slab': true, 'New York': true, 'Nimbus Roman': true,
  'NPS Rawlinson Roadway': true, 'Palatino': true, 'Perpetua': true,
  'Plantin': true, 'Plantin Schoolbook': true, 'Playbill': true,
  'Poor Richard': true, 'Rawlinson Roadway': true, 'Renault': true,
  'Requiem': true, 'Rockwell': true, 'Roman': true,
  'Rotis Serif': true, 'Sabon': true, 'Scala': true,
  'Seagull': true, 'Sistina': true, 'Souvenir': true,
  'STIX': true, 'Stone Informal': true, 'Stone Serif': true,
  'Sylfaen': true, 'Times': true, 'Trajan': true,
  'TrinitÃ©': true, 'Trump Mediaeval': true, 'Utopia': true,
  'Vale Type': true, 'Bitstream Vera': true, 'Vera Serif': true,
  'Versailles': true, 'Wanted': true, 'Weiss': true,
  'Wide Latin': true, 'Windsor': true, 'XITS': true
};

var symbolsFonts = {
  'Dingbats': true, 'Symbol': true, 'ZapfDingbats': true
};

// Glyph map for well-known standard fonts. Sometimes Ghostscript uses CID fonts
// but does not embed the CID to GID mapping. The mapping is incomplete for all
// glyphs, but common for some set of the standard fonts.
var GlyphMapForStandardFonts = {
  '2': 10, '3': 32, '4': 33, '5': 34, '6': 35, '7': 36, '8': 37, '9': 38,
  '10': 39, '11': 40, '12': 41, '13': 42, '14': 43, '15': 44, '16': 45,
  '17': 46, '18': 47, '19': 48, '20': 49, '21': 50, '22': 51, '23': 52,
  '24': 53, '25': 54, '26': 55, '27': 56, '28': 57, '29': 58, '30': 894,
  '31': 60, '32': 61, '33': 62, '34': 63, '35': 64, '36': 65, '37': 66,
  '38': 67, '39': 68, '40': 69, '41': 70, '42': 71, '43': 72, '44': 73,
  '45': 74, '46': 75, '47': 76, '48': 77, '49': 78, '50': 79, '51': 80,
  '52': 81, '53': 82, '54': 83, '55': 84, '56': 85, '57': 86, '58': 87,
  '59': 88, '60': 89, '61': 90, '62': 91, '63': 92, '64': 93, '65': 94,
  '66': 95, '67': 96, '68': 97, '69': 98, '70': 99, '71': 100, '72': 101,
  '73': 102, '74': 103, '75': 104, '76': 105, '77': 106, '78': 107, '79': 108,
  '80': 109, '81': 110, '82': 111, '83': 112, '84': 113, '85': 114, '86': 115,
  '87': 116, '88': 117, '89': 118, '90': 119, '91': 120, '92': 121, '93': 122,
  '94': 123, '95': 124, '96': 125, '97': 126, '98': 196, '99': 197, '100': 199,
  '101': 201, '102': 209, '103': 214, '104': 220, '105': 225, '106': 224,
  '107': 226, '108': 228, '109': 227, '110': 229, '111': 231, '112': 233,
  '113': 232, '114': 234, '115': 235, '116': 237, '117': 236, '118': 238,
  '119': 239, '120': 241, '121': 243, '122': 242, '123': 244, '124': 246,
  '125': 245, '126': 250, '127': 249, '128': 251, '129': 252, '130': 8224,
  '131': 176, '132': 162, '133': 163, '134': 167, '135': 8226, '136': 182,
  '137': 223, '138': 174, '139': 169, '140': 8482, '141': 180, '142': 168,
  '143': 8800, '144': 198, '145': 216, '146': 8734, '147': 177, '148': 8804,
  '149': 8805, '150': 165, '151': 181, '152': 8706, '153': 8721, '154': 8719,
  '156': 8747, '157': 170, '158': 186, '159': 8486, '160': 230, '161': 248,
  '162': 191, '163': 161, '164': 172, '165': 8730, '166': 402, '167': 8776,
  '168': 8710, '169': 171, '170': 187, '171': 8230, '210': 218, '223': 711,
  '224': 321, '225': 322, '227': 353, '229': 382, '234': 253, '252': 263,
  '253': 268, '254': 269, '258': 258, '260': 260, '261': 261, '265': 280,
  '266': 281, '268': 283, '269': 313, '275': 323, '276': 324, '278': 328,
  '284': 345, '285': 346, '286': 347, '292': 367, '295': 377, '296': 378,
  '298': 380, '305': 963,
  '306': 964, '307': 966, '308': 8215, '309': 8252, '310': 8319, '311': 8359,
  '312': 8592, '313': 8593, '337': 9552, '493': 1039, '494': 1040, '705': 1524,
  '706': 8362, '710': 64288, '711': 64298, '759': 1617, '761': 1776,
  '763': 1778, '775': 1652, '777': 1764, '778': 1780, '779': 1781, '780': 1782,
  '782': 771, '783': 64726, '786': 8363, '788': 8532, '790': 768, '791': 769,
  '792': 768, '795': 803, '797': 64336, '798': 64337, '799': 64342,
  '800': 64343, '801': 64344, '802': 64345, '803': 64362, '804': 64363,
  '805': 64364, '2424': 7821, '2425': 7822, '2426': 7823, '2427': 7824,
  '2428': 7825, '2429': 7826, '2430': 7827, '2433': 7682, '2678': 8045,
  '2679': 8046, '2830': 1552, '2838': 686, '2840': 751, '2842': 753,
  '2843': 754, '2844': 755, '2846': 757, '2856': 767, '2857': 848, '2858': 849,
  '2862': 853, '2863': 854, '2864': 855, '2865': 861, '2866': 862, '2906': 7460,
  '2908': 7462, '2909': 7463, '2910': 7464, '2912': 7466, '2913': 7467,
  '2914': 7468, '2916': 7470, '2917': 7471, '2918': 7472, '2920': 7474,
  '2921': 7475, '2922': 7476, '2924': 7478, '2925': 7479, '2926': 7480,
  '2928': 7482, '2929': 7483, '2930': 7484, '2932': 7486, '2933': 7487,
  '2934': 7488, '2936': 7490, '2937': 7491, '2938': 7492, '2940': 7494,
  '2941': 7495, '2942': 7496, '2944': 7498, '2946': 7500, '2948': 7502,
  '2950': 7504, '2951': 7505, '2952': 7506, '2954': 7508, '2955': 7509,
  '2956': 7510, '2958': 7512, '2959': 7513, '2960': 7514, '2962': 7516,
  '2963': 7517, '2964': 7518, '2966': 7520, '2967': 7521, '2968': 7522,
  '2970': 7524, '2971': 7525, '2972': 7526, '2974': 7528, '2975': 7529,
  '2976': 7530, '2978': 1537, '2979': 1538, '2980': 1539, '2982': 1549,
  '2983': 1551, '2984': 1552, '2986': 1554, '2987': 1555, '2988': 1556,
  '2990': 1623, '2991': 1624, '2995': 1775, '2999': 1791, '3002': 64290,
  '3003': 64291, '3004': 64292, '3006': 64294, '3007': 64295, '3008': 64296,
  '3011': 1900, '3014': 8223, '3015': 8244, '3017': 7532, '3018': 7533,
  '3019': 7534, '3075': 7590, '3076': 7591, '3079': 7594, '3080': 7595,
  '3083': 7598, '3084': 7599, '3087': 7602, '3088': 7603, '3091': 7606,
  '3092': 7607, '3095': 7610, '3096': 7611, '3099': 7614, '3100': 7615,
  '3103': 7618, '3104': 7619, '3107': 8337, '3108': 8338, '3116': 1884,
  '3119': 1885, '3120': 1885, '3123': 1886, '3124': 1886, '3127': 1887,
  '3128': 1887, '3131': 1888, '3132': 1888, '3135': 1889, '3136': 1889,
  '3139': 1890, '3140': 1890, '3143': 1891, '3144': 1891, '3147': 1892,
  '3148': 1892, '3153': 580, '3154': 581, '3157': 584, '3158': 585, '3161': 588,
  '3162': 589, '3165': 891, '3166': 892, '3169': 1274, '3170': 1275,
  '3173': 1278, '3174': 1279, '3181': 7622, '3182': 7623, '3282': 11799,
  '3316': 578, '3379': 42785, '3393': 1159, '3416': 8377
};

// Some characters, e.g. copyrightserif, are mapped to the private use area and
// might not be displayed using standard fonts. Mapping/hacking well-known chars
// to the similar equivalents in the normal characters range.
var SpecialPUASymbols = {
  '63721': 0x00A9, // copyrightsans (0xF8E9) => copyright
  '63193': 0x00A9, // copyrightserif (0xF6D9) => copyright
  '63720': 0x00AE, // registersans (0xF8E8) => registered
  '63194': 0x00AE, // registerserif (0xF6DA) => registered
  '63722': 0x2122, // trademarksans (0xF8EA) => trademark
  '63195': 0x2122, // trademarkserif (0xF6DB) => trademark
  '63729': 0x23A7, // bracelefttp (0xF8F1)
  '63730': 0x23A8, // braceleftmid (0xF8F2)
  '63731': 0x23A9, // braceleftbt (0xF8F3)
  '63740': 0x23AB, // bracerighttp (0xF8FC)
  '63741': 0x23AC, // bracerightmid (0xF8FD)
  '63742': 0x23AD, // bracerightmid (0xF8FE)
  '63726': 0x23A1, // bracketlefttp (0xF8EE)
  '63727': 0x23A2, // bracketleftex (0xF8EF)
  '63728': 0x23A3, // bracketleftbt (0xF8F0)
  '63737': 0x23A4, // bracketrighttp (0xF8F9)
  '63738': 0x23A5, // bracketrightex (0xF8FA)
  '63739': 0x23A6, // bracketrightbt (0xF8FB)
  '63723': 0x239B, // parenlefttp (0xF8EB)
  '63724': 0x239C, // parenleftex (0xF8EC)
  '63725': 0x239D, // parenleftbt (0xF8ED)
  '63734': 0x239E, // parenrighttp (0xF8F6)
  '63735': 0x239F, // parenrightex (0xF8F7)
  '63736': 0x23A0, // parenrightbt (0xF8F8)
};
function mapSpecialUnicodeValues(code) {
  if (code >= 0xFFF0 && code <= 0xFFFF) { // Specials unicode block.
    return 0;
  } else if (code >= 0xF600 && code <= 0xF8FF) {
    return (SpecialPUASymbols[code] || code);
  }
  return code;
}

var UnicodeRanges = [
  { 'begin': 0x0000, 'end': 0x007F }, // Basic Latin
  { 'begin': 0x0080, 'end': 0x00FF }, // Latin-1 Supplement
  { 'begin': 0x0100, 'end': 0x017F }, // Latin Extended-A
  { 'begin': 0x0180, 'end': 0x024F }, // Latin Extended-B
  { 'begin': 0x0250, 'end': 0x02AF }, // IPA Extensions
  { 'begin': 0x02B0, 'end': 0x02FF }, // Spacing Modifier Letters
  { 'begin': 0x0300, 'end': 0x036F }, // Combining Diacritical Marks
  { 'begin': 0x0370, 'end': 0x03FF }, // Greek and Coptic
  { 'begin': 0x2C80, 'end': 0x2CFF }, // Coptic
  { 'begin': 0x0400, 'end': 0x04FF }, // Cyrillic
  { 'begin': 0x0530, 'end': 0x058F }, // Armenian
  { 'begin': 0x0590, 'end': 0x05FF }, // Hebrew
  { 'begin': 0xA500, 'end': 0xA63F }, // Vai
  { 'begin': 0x0600, 'end': 0x06FF }, // Arabic
  { 'begin': 0x07C0, 'end': 0x07FF }, // NKo
  { 'begin': 0x0900, 'end': 0x097F }, // Devanagari
  { 'begin': 0x0980, 'end': 0x09FF }, // Bengali
  { 'begin': 0x0A00, 'end': 0x0A7F }, // Gurmukhi
  { 'begin': 0x0A80, 'end': 0x0AFF }, // Gujarati
  { 'begin': 0x0B00, 'end': 0x0B7F }, // Oriya
  { 'begin': 0x0B80, 'end': 0x0BFF }, // Tamil
  { 'begin': 0x0C00, 'end': 0x0C7F }, // Telugu
  { 'begin': 0x0C80, 'end': 0x0CFF }, // Kannada
  { 'begin': 0x0D00, 'end': 0x0D7F }, // Malayalam
  { 'begin': 0x0E00, 'end': 0x0E7F }, // Thai
  { 'begin': 0x0E80, 'end': 0x0EFF }, // Lao
  { 'begin': 0x10A0, 'end': 0x10FF }, // Georgian
  { 'begin': 0x1B00, 'end': 0x1B7F }, // Balinese
  { 'begin': 0x1100, 'end': 0x11FF }, // Hangul Jamo
  { 'begin': 0x1E00, 'end': 0x1EFF }, // Latin Extended Additional
  { 'begin': 0x1F00, 'end': 0x1FFF }, // Greek Extended
  { 'begin': 0x2000, 'end': 0x206F }, // General Punctuation
  { 'begin': 0x2070, 'end': 0x209F }, // Superscripts And Subscripts
  { 'begin': 0x20A0, 'end': 0x20CF }, // Currency Symbol
  { 'begin': 0x20D0, 'end': 0x20FF }, // Combining Diacritical Marks For Symbols
  { 'begin': 0x2100, 'end': 0x214F }, // Letterlike Symbols
  { 'begin': 0x2150, 'end': 0x218F }, // Number Forms
  { 'begin': 0x2190, 'end': 0x21FF }, // Arrows
  { 'begin': 0x2200, 'end': 0x22FF }, // Mathematical Operators
  { 'begin': 0x2300, 'end': 0x23FF }, // Miscellaneous Technical
  { 'begin': 0x2400, 'end': 0x243F }, // Control Pictures
  { 'begin': 0x2440, 'end': 0x245F }, // Optical Character Recognition
  { 'begin': 0x2460, 'end': 0x24FF }, // Enclosed Alphanumerics
  { 'begin': 0x2500, 'end': 0x257F }, // Box Drawing
  { 'begin': 0x2580, 'end': 0x259F }, // Block Elements
  { 'begin': 0x25A0, 'end': 0x25FF }, // Geometric Shapes
  { 'begin': 0x2600, 'end': 0x26FF }, // Miscellaneous Symbols
  { 'begin': 0x2700, 'end': 0x27BF }, // Dingbats
  { 'begin': 0x3000, 'end': 0x303F }, // CJK Symbols And Punctuation
  { 'begin': 0x3040, 'end': 0x309F }, // Hiragana
  { 'begin': 0x30A0, 'end': 0x30FF }, // Katakana
  { 'begin': 0x3100, 'end': 0x312F }, // Bopomofo
  { 'begin': 0x3130, 'end': 0x318F }, // Hangul Compatibility Jamo
  { 'begin': 0xA840, 'end': 0xA87F }, // Phags-pa
  { 'begin': 0x3200, 'end': 0x32FF }, // Enclosed CJK Letters And Months
  { 'begin': 0x3300, 'end': 0x33FF }, // CJK Compatibility
  { 'begin': 0xAC00, 'end': 0xD7AF }, // Hangul Syllables
  { 'begin': 0xD800, 'end': 0xDFFF }, // Non-Plane 0 *
  { 'begin': 0x10900, 'end': 0x1091F }, // Phoenicia
  { 'begin': 0x4E00, 'end': 0x9FFF }, // CJK Unified Ideographs
  { 'begin': 0xE000, 'end': 0xF8FF }, // Private Use Area (plane 0)
  { 'begin': 0x31C0, 'end': 0x31EF }, // CJK Strokes
  { 'begin': 0xFB00, 'end': 0xFB4F }, // Alphabetic Presentation Forms
  { 'begin': 0xFB50, 'end': 0xFDFF }, // Arabic Presentation Forms-A
  { 'begin': 0xFE20, 'end': 0xFE2F }, // Combining Half Marks
  { 'begin': 0xFE10, 'end': 0xFE1F }, // Vertical Forms
  { 'begin': 0xFE50, 'end': 0xFE6F }, // Small Form Variants
  { 'begin': 0xFE70, 'end': 0xFEFF }, // Arabic Presentation Forms-B
  { 'begin': 0xFF00, 'end': 0xFFEF }, // Halfwidth And Fullwidth Forms
  { 'begin': 0xFFF0, 'end': 0xFFFF }, // Specials
  { 'begin': 0x0F00, 'end': 0x0FFF }, // Tibetan
  { 'begin': 0x0700, 'end': 0x074F }, // Syriac
  { 'begin': 0x0780, 'end': 0x07BF }, // Thaana
  { 'begin': 0x0D80, 'end': 0x0DFF }, // Sinhala
  { 'begin': 0x1000, 'end': 0x109F }, // Myanmar
  { 'begin': 0x1200, 'end': 0x137F }, // Ethiopic
  { 'begin': 0x13A0, 'end': 0x13FF }, // Cherokee
  { 'begin': 0x1400, 'end': 0x167F }, // Unified Canadian Aboriginal Syllabics
  { 'begin': 0x1680, 'end': 0x169F }, // Ogham
  { 'begin': 0x16A0, 'end': 0x16FF }, // Runic
  { 'begin': 0x1780, 'end': 0x17FF }, // Khmer
  { 'begin': 0x1800, 'end': 0x18AF }, // Mongolian
  { 'begin': 0x2800, 'end': 0x28FF }, // Braille Patterns
  { 'begin': 0xA000, 'end': 0xA48F }, // Yi Syllables
  { 'begin': 0x1700, 'end': 0x171F }, // Tagalog
  { 'begin': 0x10300, 'end': 0x1032F }, // Old Italic
  { 'begin': 0x10330, 'end': 0x1034F }, // Gothic
  { 'begin': 0x10400, 'end': 0x1044F }, // Deseret
  { 'begin': 0x1D000, 'end': 0x1D0FF }, // Byzantine Musical Symbols
  { 'begin': 0x1D400, 'end': 0x1D7FF }, // Mathematical Alphanumeric Symbols
  { 'begin': 0xFF000, 'end': 0xFFFFD }, // Private Use (plane 15)
  { 'begin': 0xFE00, 'end': 0xFE0F }, // Variation Selectors
  { 'begin': 0xE0000, 'end': 0xE007F }, // Tags
  { 'begin': 0x1900, 'end': 0x194F }, // Limbu
  { 'begin': 0x1950, 'end': 0x197F }, // Tai Le
  { 'begin': 0x1980, 'end': 0x19DF }, // New Tai Lue
  { 'begin': 0x1A00, 'end': 0x1A1F }, // Buginese
  { 'begin': 0x2C00, 'end': 0x2C5F }, // Glagolitic
  { 'begin': 0x2D30, 'end': 0x2D7F }, // Tifinagh
  { 'begin': 0x4DC0, 'end': 0x4DFF }, // Yijing Hexagram Symbols
  { 'begin': 0xA800, 'end': 0xA82F }, // Syloti Nagri
  { 'begin': 0x10000, 'end': 0x1007F }, // Linear B Syllabary
  { 'begin': 0x10140, 'end': 0x1018F }, // Ancient Greek Numbers
  { 'begin': 0x10380, 'end': 0x1039F }, // Ugaritic
  { 'begin': 0x103A0, 'end': 0x103DF }, // Old Persian
  { 'begin': 0x10450, 'end': 0x1047F }, // Shavian
  { 'begin': 0x10480, 'end': 0x104AF }, // Osmanya
  { 'begin': 0x10800, 'end': 0x1083F }, // Cypriot Syllabary
  { 'begin': 0x10A00, 'end': 0x10A5F }, // Kharoshthi
  { 'begin': 0x1D300, 'end': 0x1D35F }, // Tai Xuan Jing Symbols
  { 'begin': 0x12000, 'end': 0x123FF }, // Cuneiform
  { 'begin': 0x1D360, 'end': 0x1D37F }, // Counting Rod Numerals
  { 'begin': 0x1B80, 'end': 0x1BBF }, // Sundanese
  { 'begin': 0x1C00, 'end': 0x1C4F }, // Lepcha
  { 'begin': 0x1C50, 'end': 0x1C7F }, // Ol Chiki
  { 'begin': 0xA880, 'end': 0xA8DF }, // Saurashtra
  { 'begin': 0xA900, 'end': 0xA92F }, // Kayah Li
  { 'begin': 0xA930, 'end': 0xA95F }, // Rejang
  { 'begin': 0xAA00, 'end': 0xAA5F }, // Cham
  { 'begin': 0x10190, 'end': 0x101CF }, // Ancient Symbols
  { 'begin': 0x101D0, 'end': 0x101FF }, // Phaistos Disc
  { 'begin': 0x102A0, 'end': 0x102DF }, // Carian
  { 'begin': 0x1F030, 'end': 0x1F09F }  // Domino Tiles
];

var MacStandardGlyphOrdering = [
  '.notdef', '.null', 'nonmarkingreturn', 'space', 'exclam', 'quotedbl',
  'numbersign', 'dollar', 'percent', 'ampersand', 'quotesingle', 'parenleft',
  'parenright', 'asterisk', 'plus', 'comma', 'hyphen', 'period', 'slash',
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'colon', 'semicolon', 'less', 'equal', 'greater', 'question', 'at',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
  'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'bracketleft',
  'backslash', 'bracketright', 'asciicircum', 'underscore', 'grave', 'a', 'b',
  'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q',
  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'braceleft', 'bar', 'braceright',
  'asciitilde', 'Adieresis', 'Aring', 'Ccedilla', 'Eacute', 'Ntilde',
  'Odieresis', 'Udieresis', 'aacute', 'agrave', 'acircumflex', 'adieresis',
  'atilde', 'aring', 'ccedilla', 'eacute', 'egrave', 'ecircumflex', 'edieresis',
  'iacute', 'igrave', 'icircumflex', 'idieresis', 'ntilde', 'oacute', 'ograve',
  'ocircumflex', 'odieresis', 'otilde', 'uacute', 'ugrave', 'ucircumflex',
  'udieresis', 'dagger', 'degree', 'cent', 'sterling', 'section', 'bullet',
  'paragraph', 'germandbls', 'registered', 'copyright', 'trademark', 'acute',
  'dieresis', 'notequal', 'AE', 'Oslash', 'infinity', 'plusminus', 'lessequal',
  'greaterequal', 'yen', 'mu', 'partialdiff', 'summation', 'product', 'pi',
  'integral', 'ordfeminine', 'ordmasculine', 'Omega', 'ae', 'oslash',
  'questiondown', 'exclamdown', 'logicalnot', 'radical', 'florin',
  'approxequal', 'Delta', 'guillemotleft', 'guillemotright', 'ellipsis',
  'nonbreakingspace', 'Agrave', 'Atilde', 'Otilde', 'OE', 'oe', 'endash',
  'emdash', 'quotedblleft', 'quotedblright', 'quoteleft', 'quoteright',
  'divide', 'lozenge', 'ydieresis', 'Ydieresis', 'fraction', 'currency',
  'guilsinglleft', 'guilsinglright', 'fi', 'fl', 'daggerdbl', 'periodcentered',
  'quotesinglbase', 'quotedblbase', 'perthousand', 'Acircumflex',
  'Ecircumflex', 'Aacute', 'Edieresis', 'Egrave', 'Iacute', 'Icircumflex',
  'Idieresis', 'Igrave', 'Oacute', 'Ocircumflex', 'apple', 'Ograve', 'Uacute',
  'Ucircumflex', 'Ugrave', 'dotlessi', 'circumflex', 'tilde', 'macron',
  'breve', 'dotaccent', 'ring', 'cedilla', 'hungarumlaut', 'ogonek', 'caron',
  'Lslash', 'lslash', 'Scaron', 'scaron', 'Zcaron', 'zcaron', 'brokenbar',
  'Eth', 'eth', 'Yacute', 'yacute', 'Thorn', 'thorn', 'minus', 'multiply',
  'onesuperior', 'twosuperior', 'threesuperior', 'onehalf', 'onequarter',
  'threequarters', 'franc', 'Gbreve', 'gbreve', 'Idotaccent', 'Scedilla',
  'scedilla', 'Cacute', 'cacute', 'Ccaron', 'ccaron', 'dcroat'];

function getUnicodeRangeFor(value) {
  for (var i = 0, ii = UnicodeRanges.length; i < ii; i++) {
    var range = UnicodeRanges[i];
    if (value >= range.begin && value < range.end) {
      return i;
    }
  }
  return -1;
}

function isRTLRangeFor(value) {
  var range = UnicodeRanges[13];
  if (value >= range.begin && value < range.end) {
    return true;
  }
  range = UnicodeRanges[11];
  if (value >= range.begin && value < range.end) {
    return true;
  }
  return false;
}

// The normalization table is obtained by filtering the Unicode characters
// database with <compat> entries.
var NormalizedUnicodes = {
  '\u00A8': '\u0020\u0308',
  '\u00AF': '\u0020\u0304',
  '\u00B4': '\u0020\u0301',
  '\u00B5': '\u03BC',
  '\u00B8': '\u0020\u0327',
  '\u0132': '\u0049\u004A',
  '\u0133': '\u0069\u006A',
  '\u013F': '\u004C\u00B7',
  '\u0140': '\u006C\u00B7',
  '\u0149': '\u02BC\u006E',
  '\u017F': '\u0073',
  '\u01C4': '\u0044\u017D',
  '\u01C5': '\u0044\u017E',
  '\u01C6': '\u0064\u017E',
  '\u01C7': '\u004C\u004A',
  '\u01C8': '\u004C\u006A',
  '\u01C9': '\u006C\u006A',
  '\u01CA': '\u004E\u004A',
  '\u01CB': '\u004E\u006A',
  '\u01CC': '\u006E\u006A',
  '\u01F1': '\u0044\u005A',
  '\u01F2': '\u0044\u007A',
  '\u01F3': '\u0064\u007A',
  '\u02D8': '\u0020\u0306',
  '\u02D9': '\u0020\u0307',
  '\u02DA': '\u0020\u030A',
  '\u02DB': '\u0020\u0328',
  '\u02DC': '\u0020\u0303',
  '\u02DD': '\u0020\u030B',
  '\u037A': '\u0020\u0345',
  '\u0384': '\u0020\u0301',
  '\u03D0': '\u03B2',
  '\u03D1': '\u03B8',
  '\u03D2': '\u03A5',
  '\u03D5': '\u03C6',
  '\u03D6': '\u03C0',
  '\u03F0': '\u03BA',
  '\u03F1': '\u03C1',
  '\u03F2': '\u03C2',
  '\u03F4': '\u0398',
  '\u03F5': '\u03B5',
  '\u03F9': '\u03A3',
  '\u0587': '\u0565\u0582',
  '\u0675': '\u0627\u0674',
  '\u0676': '\u0648\u0674',
  '\u0677': '\u06C7\u0674',
  '\u0678': '\u064A\u0674',
  '\u0E33': '\u0E4D\u0E32',
  '\u0EB3': '\u0ECD\u0EB2',
  '\u0EDC': '\u0EAB\u0E99',
  '\u0EDD': '\u0EAB\u0EA1',
  '\u0F77': '\u0FB2\u0F81',
  '\u0F79': '\u0FB3\u0F81',
  '\u1E9A': '\u0061\u02BE',
  '\u1FBD': '\u0020\u0313',
  '\u1FBF': '\u0020\u0313',
  '\u1FC0': '\u0020\u0342',
  '\u1FFE': '\u0020\u0314',
  '\u2002': '\u0020',
  '\u2003': '\u0020',
  '\u2004': '\u0020',
  '\u2005': '\u0020',
  '\u2006': '\u0020',
  '\u2008': '\u0020',
  '\u2009': '\u0020',
  '\u200A': '\u0020',
  '\u2017': '\u0020\u0333',
  '\u2024': '\u002E',
  '\u2025': '\u002E\u002E',
  '\u2026': '\u002E\u002E\u002E',
  '\u2033': '\u2032\u2032',
  '\u2034': '\u2032\u2032\u2032',
  '\u2036': '\u2035\u2035',
  '\u2037': '\u2035\u2035\u2035',
  '\u203C': '\u0021\u0021',
  '\u203E': '\u0020\u0305',
  '\u2047': '\u003F\u003F',
  '\u2048': '\u003F\u0021',
  '\u2049': '\u0021\u003F',
  '\u2057': '\u2032\u2032\u2032\u2032',
  '\u205F': '\u0020',
  '\u20A8': '\u0052\u0073',
  '\u2100': '\u0061\u002F\u0063',
  '\u2101': '\u0061\u002F\u0073',
  '\u2103': '\u00B0\u0043',
  '\u2105': '\u0063\u002F\u006F',
  '\u2106': '\u0063\u002F\u0075',
  '\u2107': '\u0190',
  '\u2109': '\u00B0\u0046',
  '\u2116': '\u004E\u006F',
  '\u2121': '\u0054\u0045\u004C',
  '\u2135': '\u05D0',
  '\u2136': '\u05D1',
  '\u2137': '\u05D2',
  '\u2138': '\u05D3',
  '\u213B': '\u0046\u0041\u0058',
  '\u2160': '\u0049',
  '\u2161': '\u0049\u0049',
  '\u2162': '\u0049\u0049\u0049',
  '\u2163': '\u0049\u0056',
  '\u2164': '\u0056',
  '\u2165': '\u0056\u0049',
  '\u2166': '\u0056\u0049\u0049',
  '\u2167': '\u0056\u0049\u0049\u0049',
  '\u2168': '\u0049\u0058',
  '\u2169': '\u0058',
  '\u216A': '\u0058\u0049',
  '\u216B': '\u0058\u0049\u0049',
  '\u216C': '\u004C',
  '\u216D': '\u0043',
  '\u216E': '\u0044',
  '\u216F': '\u004D',
  '\u2170': '\u0069',
  '\u2171': '\u0069\u0069',
  '\u2172': '\u0069\u0069\u0069',
  '\u2173': '\u0069\u0076',
  '\u2174': '\u0076',
  '\u2175': '\u0076\u0069',
  '\u2176': '\u0076\u0069\u0069',
  '\u2177': '\u0076\u0069\u0069\u0069',
  '\u2178': '\u0069\u0078',
  '\u2179': '\u0078',
  '\u217A': '\u0078\u0069',
  '\u217B': '\u0078\u0069\u0069',
  '\u217C': '\u006C',
  '\u217D': '\u0063',
  '\u217E': '\u0064',
  '\u217F': '\u006D',
  '\u222C': '\u222B\u222B',
  '\u222D': '\u222B\u222B\u222B',
  '\u222F': '\u222E\u222E',
  '\u2230': '\u222E\u222E\u222E',
  '\u2474': '\u0028\u0031\u0029',
  '\u2475': '\u0028\u0032\u0029',
  '\u2476': '\u0028\u0033\u0029',
  '\u2477': '\u0028\u0034\u0029',
  '\u2478': '\u0028\u0035\u0029',
  '\u2479': '\u0028\u0036\u0029',
  '\u247A': '\u0028\u0037\u0029',
  '\u247B': '\u0028\u0038\u0029',
  '\u247C': '\u0028\u0039\u0029',
  '\u247D': '\u0028\u0031\u0030\u0029',
  '\u247E': '\u0028\u0031\u0031\u0029',
  '\u247F': '\u0028\u0031\u0032\u0029',
  '\u2480': '\u0028\u0031\u0033\u0029',
  '\u2481': '\u0028\u0031\u0034\u0029',
  '\u2482': '\u0028\u0031\u0035\u0029',
  '\u2483': '\u0028\u0031\u0036\u0029',
  '\u2484': '\u0028\u0031\u0037\u0029',
  '\u2485': '\u0028\u0031\u0038\u0029',
  '\u2486': '\u0028\u0031\u0039\u0029',
  '\u2487': '\u0028\u0032\u0030\u0029',
  '\u2488': '\u0031\u002E',
  '\u2489': '\u0032\u002E',
  '\u248A': '\u0033\u002E',
  '\u248B': '\u0034\u002E',
  '\u248C': '\u0035\u002E',
  '\u248D': '\u0036\u002E',
  '\u248E': '\u0037\u002E',
  '\u248F': '\u0038\u002E',
  '\u2490': '\u0039\u002E',
  '\u2491': '\u0031\u0030\u002E',
  '\u2492': '\u0031\u0031\u002E',
  '\u2493': '\u0031\u0032\u002E',
  '\u2494': '\u0031\u0033\u002E',
  '\u2495': '\u0031\u0034\u002E',
  '\u2496': '\u0031\u0035\u002E',
  '\u2497': '\u0031\u0036\u002E',
  '\u2498': '\u0031\u0037\u002E',
  '\u2499': '\u0031\u0038\u002E',
  '\u249A': '\u0031\u0039\u002E',
  '\u249B': '\u0032\u0030\u002E',
  '\u249C': '\u0028\u0061\u0029',
  '\u249D': '\u0028\u0062\u0029',
  '\u249E': '\u0028\u0063\u0029',
  '\u249F': '\u0028\u0064\u0029',
  '\u24A0': '\u0028\u0065\u0029',
  '\u24A1': '\u0028\u0066\u0029',
  '\u24A2': '\u0028\u0067\u0029',
  '\u24A3': '\u0028\u0068\u0029',
  '\u24A4': '\u0028\u0069\u0029',
  '\u24A5': '\u0028\u006A\u0029',
  '\u24A6': '\u0028\u006B\u0029',
  '\u24A7': '\u0028\u006C\u0029',
  '\u24A8': '\u0028\u006D\u0029',
  '\u24A9': '\u0028\u006E\u0029',
  '\u24AA': '\u0028\u006F\u0029',
  '\u24AB': '\u0028\u0070\u0029',
  '\u24AC': '\u0028\u0071\u0029',
  '\u24AD': '\u0028\u0072\u0029',
  '\u24AE': '\u0028\u0073\u0029',
  '\u24AF': '\u0028\u0074\u0029',
  '\u24B0': '\u0028\u0075\u0029',
  '\u24B1': '\u0028\u0076\u0029',
  '\u24B2': '\u0028\u0077\u0029',
  '\u24B3': '\u0028\u0078\u0029',
  '\u24B4': '\u0028\u0079\u0029',
  '\u24B5': '\u0028\u007A\u0029',
  '\u2A0C': '\u222B\u222B\u222B\u222B',
  '\u2A74': '\u003A\u003A\u003D',
  '\u2A75': '\u003D\u003D',
  '\u2A76': '\u003D\u003D\u003D',
  '\u2E9F': '\u6BCD',
  '\u2EF3': '\u9F9F',
  '\u2F00': '\u4E00',
  '\u2F01': '\u4E28',
  '\u2F02': '\u4E36',
  '\u2F03': '\u4E3F',
  '\u2F04': '\u4E59',
  '\u2F05': '\u4E85',
  '\u2F06': '\u4E8C',
  '\u2F07': '\u4EA0',
  '\u2F08': '\u4EBA',
  '\u2F09': '\u513F',
  '\u2F0A': '\u5165',
  '\u2F0B': '\u516B',
  '\u2F0C': '\u5182',
  '\u2F0D': '\u5196',
  '\u2F0E': '\u51AB',
  '\u2F0F': '\u51E0',
  '\u2F10': '\u51F5',
  '\u2F11': '\u5200',
  '\u2F12': '\u529B',
  '\u2F13': '\u52F9',
  '\u2F14': '\u5315',
  '\u2F15': '\u531A',
  '\u2F16': '\u5338',
  '\u2F17': '\u5341',
  '\u2F18': '\u535C',
  '\u2F19': '\u5369',
  '\u2F1A': '\u5382',
  '\u2F1B': '\u53B6',
  '\u2F1C': '\u53C8',
  '\u2F1D': '\u53E3',
  '\u2F1E': '\u56D7',
  '\u2F1F': '\u571F',
  '\u2F20': '\u58EB',
  '\u2F21': '\u5902',
  '\u2F22': '\u590A',
  '\u2F23': '\u5915',
  '\u2F24': '\u5927',
  '\u2F25': '\u5973',
  '\u2F26': '\u5B50',
  '\u2F27': '\u5B80',
  '\u2F28': '\u5BF8',
  '\u2F29': '\u5C0F',
  '\u2F2A': '\u5C22',
  '\u2F2B': '\u5C38',
  '\u2F2C': '\u5C6E',
  '\u2F2D': '\u5C71',
  '\u2F2E': '\u5DDB',
  '\u2F2F': '\u5DE5',
  '\u2F30': '\u5DF1',
  '\u2F31': '\u5DFE',
  '\u2F32': '\u5E72',
  '\u2F33': '\u5E7A',
  '\u2F34': '\u5E7F',
  '\u2F35': '\u5EF4',
  '\u2F36': '\u5EFE',
  '\u2F37': '\u5F0B',
  '\u2F38': '\u5F13',
  '\u2F39': '\u5F50',
  '\u2F3A': '\u5F61',
  '\u2F3B': '\u5F73',
  '\u2F3C': '\u5FC3',
  '\u2F3D': '\u6208',
  '\u2F3E': '\u6236',
  '\u2F3F': '\u624B',
  '\u2F40': '\u652F',
  '\u2F41': '\u6534',
  '\u2F42': '\u6587',
  '\u2F43': '\u6597',
  '\u2F44': '\u65A4',
  '\u2F45': '\u65B9',
  '\u2F46': '\u65E0',
  '\u2F47': '\u65E5',
  '\u2F48': '\u66F0',
  '\u2F49': '\u6708',
  '\u2F4A': '\u6728',
  '\u2F4B': '\u6B20',
  '\u2F4C': '\u6B62',
  '\u2F4D': '\u6B79',
  '\u2F4E': '\u6BB3',
  '\u2F4F': '\u6BCB',
  '\u2F50': '\u6BD4',
  '\u2F51': '\u6BDB',
  '\u2F52': '\u6C0F',
  '\u2F53': '\u6C14',
  '\u2F54': '\u6C34',
  '\u2F55': '\u706B',
  '\u2F56': '\u722A',
  '\u2F57': '\u7236',
  '\u2F58': '\u723B',
  '\u2F59': '\u723F',
  '\u2F5A': '\u7247',
  '\u2F5B': '\u7259',
  '\u2F5C': '\u725B',
  '\u2F5D': '\u72AC',
  '\u2F5E': '\u7384',
  '\u2F5F': '\u7389',
  '\u2F60': '\u74DC',
  '\u2F61': '\u74E6',
  '\u2F62': '\u7518',
  '\u2F63': '\u751F',
  '\u2F64': '\u7528',
  '\u2F65': '\u7530',
  '\u2F66': '\u758B',
  '\u2F67': '\u7592',
  '\u2F68': '\u7676',
  '\u2F69': '\u767D',
  '\u2F6A': '\u76AE',
  '\u2F6B': '\u76BF',
  '\u2F6C': '\u76EE',
  '\u2F6D': '\u77DB',
  '\u2F6E': '\u77E2',
  '\u2F6F': '\u77F3',
  '\u2F70': '\u793A',
  '\u2F71': '\u79B8',
  '\u2F72': '\u79BE',
  '\u2F73': '\u7A74',
  '\u2F74': '\u7ACB',
  '\u2F75': '\u7AF9',
  '\u2F76': '\u7C73',
  '\u2F77': '\u7CF8',
  '\u2F78': '\u7F36',
  '\u2F79': '\u7F51',
  '\u2F7A': '\u7F8A',
  '\u2F7B': '\u7FBD',
  '\u2F7C': '\u8001',
  '\u2F7D': '\u800C',
  '\u2F7E': '\u8012',
  '\u2F7F': '\u8033',
  '\u2F80': '\u807F',
  '\u2F81': '\u8089',
  '\u2F82': '\u81E3',
  '\u2F83': '\u81EA',
  '\u2F84': '\u81F3',
  '\u2F85': '\u81FC',
  '\u2F86': '\u820C',
  '\u2F87': '\u821B',
  '\u2F88': '\u821F',
  '\u2F89': '\u826E',
  '\u2F8A': '\u8272',
  '\u2F8B': '\u8278',
  '\u2F8C': '\u864D',
  '\u2F8D': '\u866B',
  '\u2F8E': '\u8840',
  '\u2F8F': '\u884C',
  '\u2F90': '\u8863',
  '\u2F91': '\u897E',
  '\u2F92': '\u898B',
  '\u2F93': '\u89D2',
  '\u2F94': '\u8A00',
  '\u2F95': '\u8C37',
  '\u2F96': '\u8C46',
  '\u2F97': '\u8C55',
  '\u2F98': '\u8C78',
  '\u2F99': '\u8C9D',
  '\u2F9A': '\u8D64',
  '\u2F9B': '\u8D70',
  '\u2F9C': '\u8DB3',
  '\u2F9D': '\u8EAB',
  '\u2F9E': '\u8ECA',
  '\u2F9F': '\u8F9B',
  '\u2FA0': '\u8FB0',
  '\u2FA1': '\u8FB5',
  '\u2FA2': '\u9091',
  '\u2FA3': '\u9149',
  '\u2FA4': '\u91C6',
  '\u2FA5': '\u91CC',
  '\u2FA6': '\u91D1',
  '\u2FA7': '\u9577',
  '\u2FA8': '\u9580',
  '\u2FA9': '\u961C',
  '\u2FAA': '\u96B6',
  '\u2FAB': '\u96B9',
  '\u2FAC': '\u96E8',
  '\u2FAD': '\u9751',
  '\u2FAE': '\u975E',
  '\u2FAF': '\u9762',
  '\u2FB0': '\u9769',
  '\u2FB1': '\u97CB',
  '\u2FB2': '\u97ED',
  '\u2FB3': '\u97F3',
  '\u2FB4': '\u9801',
  '\u2FB5': '\u98A8',
  '\u2FB6': '\u98DB',
  '\u2FB7': '\u98DF',
  '\u2FB8': '\u9996',
  '\u2FB9': '\u9999',
  '\u2FBA': '\u99AC',
  '\u2FBB': '\u9AA8',
  '\u2FBC': '\u9AD8',
  '\u2FBD': '\u9ADF',
  '\u2FBE': '\u9B25',
  '\u2FBF': '\u9B2F',
  '\u2FC0': '\u9B32',
  '\u2FC1': '\u9B3C',
  '\u2FC2': '\u9B5A',
  '\u2FC3': '\u9CE5',
  '\u2FC4': '\u9E75',
  '\u2FC5': '\u9E7F',
  '\u2FC6': '\u9EA5',
  '\u2FC7': '\u9EBB',
  '\u2FC8': '\u9EC3',
  '\u2FC9': '\u9ECD',
  '\u2FCA': '\u9ED1',
  '\u2FCB': '\u9EF9',
  '\u2FCC': '\u9EFD',
  '\u2FCD': '\u9F0E',
  '\u2FCE': '\u9F13',
  '\u2FCF': '\u9F20',
  '\u2FD0': '\u9F3B',
  '\u2FD1': '\u9F4A',
  '\u2FD2': '\u9F52',
  '\u2FD3': '\u9F8D',
  '\u2FD4': '\u9F9C',
  '\u2FD5': '\u9FA0',
  '\u3036': '\u3012',
  '\u3038': '\u5341',
  '\u3039': '\u5344',
  '\u303A': '\u5345',
  '\u309B': '\u0020\u3099',
  '\u309C': '\u0020\u309A',
  '\u3131': '\u1100',
  '\u3132': '\u1101',
  '\u3133': '\u11AA',
  '\u3134': '\u1102',
  '\u3135': '\u11AC',
  '\u3136': '\u11AD',
  '\u3137': '\u1103',
  '\u3138': '\u1104',
  '\u3139': '\u1105',
  '\u313A': '\u11B0',
  '\u313B': '\u11B1',
  '\u313C': '\u11B2',
  '\u313D': '\u11B3',
  '\u313E': '\u11B4',
  '\u313F': '\u11B5',
  '\u3140': '\u111A',
  '\u3141': '\u1106',
  '\u3142': '\u1107',
  '\u3143': '\u1108',
  '\u3144': '\u1121',
  '\u3145': '\u1109',
  '\u3146': '\u110A',
  '\u3147': '\u110B',
  '\u3148': '\u110C',
  '\u3149': '\u110D',
  '\u314A': '\u110E',
  '\u314B': '\u110F',
  '\u314C': '\u1110',
  '\u314D': '\u1111',
  '\u314E': '\u1112',
  '\u314F': '\u1161',
  '\u3150': '\u1162',
  '\u3151': '\u1163',
  '\u3152': '\u1164',
  '\u3153': '\u1165',
  '\u3154': '\u1166',
  '\u3155': '\u1167',
  '\u3156': '\u1168',
  '\u3157': '\u1169',
  '\u3158': '\u116A',
  '\u3159': '\u116B',
  '\u315A': '\u116C',
  '\u315B': '\u116D',
  '\u315C': '\u116E',
  '\u315D': '\u116F',
  '\u315E': '\u1170',
  '\u315F': '\u1171',
  '\u3160': '\u1172',
  '\u3161': '\u1173',
  '\u3162': '\u1174',
  '\u3163': '\u1175',
  '\u3164': '\u1160',
  '\u3165': '\u1114',
  '\u3166': '\u1115',
  '\u3167': '\u11C7',
  '\u3168': '\u11C8',
  '\u3169': '\u11CC',
  '\u316A': '\u11CE',
  '\u316B': '\u11D3',
  '\u316C': '\u11D7',
  '\u316D': '\u11D9',
  '\u316E': '\u111C',
  '\u316F': '\u11DD',
  '\u3170': '\u11DF',
  '\u3171': '\u111D',
  '\u3172': '\u111E',
  '\u3173': '\u1120',
  '\u3174': '\u1122',
  '\u3175': '\u1123',
  '\u3176': '\u1127',
  '\u3177': '\u1129',
  '\u3178': '\u112B',
  '\u3179': '\u112C',
  '\u317A': '\u112D',
  '\u317B': '\u112E',
  '\u317C': '\u112F',
  '\u317D': '\u1132',
  '\u317E': '\u1136',
  '\u317F': '\u1140',
  '\u3180': '\u1147',
  '\u3181': '\u114C',
  '\u3182': '\u11F1',
  '\u3183': '\u11F2',
  '\u3184': '\u1157',
  '\u3185': '\u1158',
  '\u3186': '\u1159',
  '\u3187': '\u1184',
  '\u3188': '\u1185',
  '\u3189': '\u1188',
  '\u318A': '\u1191',
  '\u318B': '\u1192',
  '\u318C': '\u1194',
  '\u318D': '\u119E',
  '\u318E': '\u11A1',
  '\u3200': '\u0028\u1100\u0029',
  '\u3201': '\u0028\u1102\u0029',
  '\u3202': '\u0028\u1103\u0029',
  '\u3203': '\u0028\u1105\u0029',
  '\u3204': '\u0028\u1106\u0029',
  '\u3205': '\u0028\u1107\u0029',
  '\u3206': '\u0028\u1109\u0029',
  '\u3207': '\u0028\u110B\u0029',
  '\u3208': '\u0028\u110C\u0029',
  '\u3209': '\u0028\u110E\u0029',
  '\u320A': '\u0028\u110F\u0029',
  '\u320B': '\u0028\u1110\u0029',
  '\u320C': '\u0028\u1111\u0029',
  '\u320D': '\u0028\u1112\u0029',
  '\u320E': '\u0028\u1100\u1161\u0029',
  '\u320F': '\u0028\u1102\u1161\u0029',
  '\u3210': '\u0028\u1103\u1161\u0029',
  '\u3211': '\u0028\u1105\u1161\u0029',
  '\u3212': '\u0028\u1106\u1161\u0029',
  '\u3213': '\u0028\u1107\u1161\u0029',
  '\u3214': '\u0028\u1109\u1161\u0029',
  '\u3215': '\u0028\u110B\u1161\u0029',
  '\u3216': '\u0028\u110C\u1161\u0029',
  '\u3217': '\u0028\u110E\u1161\u0029',
  '\u3218': '\u0028\u110F\u1161\u0029',
  '\u3219': '\u0028\u1110\u1161\u0029',
  '\u321A': '\u0028\u1111\u1161\u0029',
  '\u321B': '\u0028\u1112\u1161\u0029',
  '\u321C': '\u0028\u110C\u116E\u0029',
  '\u321D': '\u0028\u110B\u1169\u110C\u1165\u11AB\u0029',
  '\u321E': '\u0028\u110B\u1169\u1112\u116E\u0029',
  '\u3220': '\u0028\u4E00\u0029',
  '\u3221': '\u0028\u4E8C\u0029',
  '\u3222': '\u0028\u4E09\u0029',
  '\u3223': '\u0028\u56DB\u0029',
  '\u3224': '\u0028\u4E94\u0029',
  '\u3225': '\u0028\u516D\u0029',
  '\u3226': '\u0028\u4E03\u0029',
  '\u3227': '\u0028\u516B\u0029',
  '\u3228': '\u0028\u4E5D\u0029',
  '\u3229': '\u0028\u5341\u0029',
  '\u322A': '\u0028\u6708\u0029',
  '\u322B': '\u0028\u706B\u0029',
  '\u322C': '\u0028\u6C34\u0029',
  '\u322D': '\u0028\u6728\u0029',
  '\u322E': '\u0028\u91D1\u0029',
  '\u322F': '\u0028\u571F\u0029',
  '\u3230': '\u0028\u65E5\u0029',
  '\u3231': '\u0028\u682A\u0029',
  '\u3232': '\u0028\u6709\u0029',
  '\u3233': '\u0028\u793E\u0029',
  '\u3234': '\u0028\u540D\u0029',
  '\u3235': '\u0028\u7279\u0029',
  '\u3236': '\u0028\u8CA1\u0029',
  '\u3237': '\u0028\u795D\u0029',
  '\u3238': '\u0028\u52B4\u0029',
  '\u3239': '\u0028\u4EE3\u0029',
  '\u323A': '\u0028\u547C\u0029',
  '\u323B': '\u0028\u5B66\u0029',
  '\u323C': '\u0028\u76E3\u0029',
  '\u323D': '\u0028\u4F01\u0029',
  '\u323E': '\u0028\u8CC7\u0029',
  '\u323F': '\u0028\u5354\u0029',
  '\u3240': '\u0028\u796D\u0029',
  '\u3241': '\u0028\u4F11\u0029',
  '\u3242': '\u0028\u81EA\u0029',
  '\u3243': '\u0028\u81F3\u0029',
  '\u32C0': '\u0031\u6708',
  '\u32C1': '\u0032\u6708',
  '\u32C2': '\u0033\u6708',
  '\u32C3': '\u0034\u6708',
  '\u32C4': '\u0035\u6708',
  '\u32C5': '\u0036\u6708',
  '\u32C6': '\u0037\u6708',
  '\u32C7': '\u0038\u6708',
  '\u32C8': '\u0039\u6708',
  '\u32C9': '\u0031\u0030\u6708',
  '\u32CA': '\u0031\u0031\u6708',
  '\u32CB': '\u0031\u0032\u6708',
  '\u3358': '\u0030\u70B9',
  '\u3359': '\u0031\u70B9',
  '\u335A': '\u0032\u70B9',
  '\u335B': '\u0033\u70B9',
  '\u335C': '\u0034\u70B9',
  '\u335D': '\u0035\u70B9',
  '\u335E': '\u0036\u70B9',
  '\u335F': '\u0037\u70B9',
  '\u3360': '\u0038\u70B9',
  '\u3361': '\u0039\u70B9',
  '\u3362': '\u0031\u0030\u70B9',
  '\u3363': '\u0031\u0031\u70B9',
  '\u3364': '\u0031\u0032\u70B9',
  '\u3365': '\u0031\u0033\u70B9',
  '\u3366': '\u0031\u0034\u70B9',
  '\u3367': '\u0031\u0035\u70B9',
  '\u3368': '\u0031\u0036\u70B9',
  '\u3369': '\u0031\u0037\u70B9',
  '\u336A': '\u0031\u0038\u70B9',
  '\u336B': '\u0031\u0039\u70B9',
  '\u336C': '\u0032\u0030\u70B9',
  '\u336D': '\u0032\u0031\u70B9',
  '\u336E': '\u0032\u0032\u70B9',
  '\u336F': '\u0032\u0033\u70B9',
  '\u3370': '\u0032\u0034\u70B9',
  '\u33E0': '\u0031\u65E5',
  '\u33E1': '\u0032\u65E5',
  '\u33E2': '\u0033\u65E5',
  '\u33E3': '\u0034\u65E5',
  '\u33E4': '\u0035\u65E5',
  '\u33E5': '\u0036\u65E5',
  '\u33E6': '\u0037\u65E5',
  '\u33E7': '\u0038\u65E5',
  '\u33E8': '\u0039\u65E5',
  '\u33E9': '\u0031\u0030\u65E5',
  '\u33EA': '\u0031\u0031\u65E5',
  '\u33EB': '\u0031\u0032\u65E5',
  '\u33EC': '\u0031\u0033\u65E5',
  '\u33ED': '\u0031\u0034\u65E5',
  '\u33EE': '\u0031\u0035\u65E5',
  '\u33EF': '\u0031\u0036\u65E5',
  '\u33F0': '\u0031\u0037\u65E5',
  '\u33F1': '\u0031\u0038\u65E5',
  '\u33F2': '\u0031\u0039\u65E5',
  '\u33F3': '\u0032\u0030\u65E5',
  '\u33F4': '\u0032\u0031\u65E5',
  '\u33F5': '\u0032\u0032\u65E5',
  '\u33F6': '\u0032\u0033\u65E5',
  '\u33F7': '\u0032\u0034\u65E5',
  '\u33F8': '\u0032\u0035\u65E5',
  '\u33F9': '\u0032\u0036\u65E5',
  '\u33FA': '\u0032\u0037\u65E5',
  '\u33FB': '\u0032\u0038\u65E5',
  '\u33FC': '\u0032\u0039\u65E5',
  '\u33FD': '\u0033\u0030\u65E5',
  '\u33FE': '\u0033\u0031\u65E5',
  '\uFB00': '\u0066\u0066',
  '\uFB01': '\u0066\u0069',
  '\uFB02': '\u0066\u006C',
  '\uFB03': '\u0066\u0066\u0069',
  '\uFB04': '\u0066\u0066\u006C',
  '\uFB05': '\u017F\u0074',
  '\uFB06': '\u0073\u0074',
  '\uFB13': '\u0574\u0576',
  '\uFB14': '\u0574\u0565',
  '\uFB15': '\u0574\u056B',
  '\uFB16': '\u057E\u0576',
  '\uFB17': '\u0574\u056D',
  '\uFB4F': '\u05D0\u05DC',
  '\uFB50': '\u0671',
  '\uFB51': '\u0671',
  '\uFB52': '\u067B',
  '\uFB53': '\u067B',
  '\uFB54': '\u067B',
  '\uFB55': '\u067B',
  '\uFB56': '\u067E',
  '\uFB57': '\u067E',
  '\uFB58': '\u067E',
  '\uFB59': '\u067E',
  '\uFB5A': '\u0680',
  '\uFB5B': '\u0680',
  '\uFB5C': '\u0680',
  '\uFB5D': '\u0680',
  '\uFB5E': '\u067A',
  '\uFB5F': '\u067A',
  '\uFB60': '\u067A',
  '\uFB61': '\u067A',
  '\uFB62': '\u067F',
  '\uFB63': '\u067F',
  '\uFB64': '\u067F',
  '\uFB65': '\u067F',
  '\uFB66': '\u0679',
  '\uFB67': '\u0679',
  '\uFB68': '\u0679',
  '\uFB69': '\u0679',
  '\uFB6A': '\u06A4',
  '\uFB6B': '\u06A4',
  '\uFB6C': '\u06A4',
  '\uFB6D': '\u06A4',
  '\uFB6E': '\u06A6',
  '\uFB6F': '\u06A6',
  '\uFB70': '\u06A6',
  '\uFB71': '\u06A6',
  '\uFB72': '\u0684',
  '\uFB73': '\u0684',
  '\uFB74': '\u0684',
  '\uFB75': '\u0684',
  '\uFB76': '\u0683',
  '\uFB77': '\u0683',
  '\uFB78': '\u0683',
  '\uFB79': '\u0683',
  '\uFB7A': '\u0686',
  '\uFB7B': '\u0686',
  '\uFB7C': '\u0686',
  '\uFB7D': '\u0686',
  '\uFB7E': '\u0687',
  '\uFB7F': '\u0687',
  '\uFB80': '\u0687',
  '\uFB81': '\u0687',
  '\uFB82': '\u068D',
  '\uFB83': '\u068D',
  '\uFB84': '\u068C',
  '\uFB85': '\u068C',
  '\uFB86': '\u068E',
  '\uFB87': '\u068E',
  '\uFB88': '\u0688',
  '\uFB89': '\u0688',
  '\uFB8A': '\u0698',
  '\uFB8B': '\u0698',
  '\uFB8C': '\u0691',
  '\uFB8D': '\u0691',
  '\uFB8E': '\u06A9',
  '\uFB8F': '\u06A9',
  '\uFB90': '\u06A9',
  '\uFB91': '\u06A9',
  '\uFB92': '\u06AF',
  '\uFB93': '\u06AF',
  '\uFB94': '\u06AF',
  '\uFB95': '\u06AF',
  '\uFB96': '\u06B3',
  '\uFB97': '\u06B3',
  '\uFB98': '\u06B3',
  '\uFB99': '\u06B3',
  '\uFB9A': '\u06B1',
  '\uFB9B': '\u06B1',
  '\uFB9C': '\u06B1',
  '\uFB9D': '\u06B1',
  '\uFB9E': '\u06BA',
  '\uFB9F': '\u06BA',
  '\uFBA0': '\u06BB',
  '\uFBA1': '\u06BB',
  '\uFBA2': '\u06BB',
  '\uFBA3': '\u06BB',
  '\uFBA4': '\u06C0',
  '\uFBA5': '\u06C0',
  '\uFBA6': '\u06C1',
  '\uFBA7': '\u06C1',
  '\uFBA8': '\u06C1',
  '\uFBA9': '\u06C1',
  '\uFBAA': '\u06BE',
  '\uFBAB': '\u06BE',
  '\uFBAC': '\u06BE',
  '\uFBAD': '\u06BE',
  '\uFBAE': '\u06D2',
  '\uFBAF': '\u06D2',
  '\uFBB0': '\u06D3',
  '\uFBB1': '\u06D3',
  '\uFBD3': '\u06AD',
  '\uFBD4': '\u06AD',
  '\uFBD5': '\u06AD',
  '\uFBD6': '\u06AD',
  '\uFBD7': '\u06C7',
  '\uFBD8': '\u06C7',
  '\uFBD9': '\u06C6',
  '\uFBDA': '\u06C6',
  '\uFBDB': '\u06C8',
  '\uFBDC': '\u06C8',
  '\uFBDD': '\u0677',
  '\uFBDE': '\u06CB',
  '\uFBDF': '\u06CB',
  '\uFBE0': '\u06C5',
  '\uFBE1': '\u06C5',
  '\uFBE2': '\u06C9',
  '\uFBE3': '\u06C9',
  '\uFBE4': '\u06D0',
  '\uFBE5': '\u06D0',
  '\uFBE6': '\u06D0',
  '\uFBE7': '\u06D0',
  '\uFBE8': '\u0649',
  '\uFBE9': '\u0649',
  '\uFBEA': '\u0626\u0627',
  '\uFBEB': '\u0626\u0627',
  '\uFBEC': '\u0626\u06D5',
  '\uFBED': '\u0626\u06D5',
  '\uFBEE': '\u0626\u0648',
  '\uFBEF': '\u0626\u0648',
  '\uFBF0': '\u0626\u06C7',
  '\uFBF1': '\u0626\u06C7',
  '\uFBF2': '\u0626\u06C6',
  '\uFBF3': '\u0626\u06C6',
  '\uFBF4': '\u0626\u06C8',
  '\uFBF5': '\u0626\u06C8',
  '\uFBF6': '\u0626\u06D0',
  '\uFBF7': '\u0626\u06D0',
  '\uFBF8': '\u0626\u06D0',
  '\uFBF9': '\u0626\u0649',
  '\uFBFA': '\u0626\u0649',
  '\uFBFB': '\u0626\u0649',
  '\uFBFC': '\u06CC',
  '\uFBFD': '\u06CC',
  '\uFBFE': '\u06CC',
  '\uFBFF': '\u06CC',
  '\uFC00': '\u0626\u062C',
  '\uFC01': '\u0626\u062D',
  '\uFC02': '\u0626\u0645',
  '\uFC03': '\u0626\u0649',
  '\uFC04': '\u0626\u064A',
  '\uFC05': '\u0628\u062C',
  '\uFC06': '\u0628\u062D',
  '\uFC07': '\u0628\u062E',
  '\uFC08': '\u0628\u0645',
  '\uFC09': '\u0628\u0649',
  '\uFC0A': '\u0628\u064A',
  '\uFC0B': '\u062A\u062C',
  '\uFC0C': '\u062A\u062D',
  '\uFC0D': '\u062A\u062E',
  '\uFC0E': '\u062A\u0645',
  '\uFC0F': '\u062A\u0649',
  '\uFC10': '\u062A\u064A',
  '\uFC11': '\u062B\u062C',
  '\uFC12': '\u062B\u0645',
  '\uFC13': '\u062B\u0649',
  '\uFC14': '\u062B\u064A',
  '\uFC15': '\u062C\u062D',
  '\uFC16': '\u062C\u0645',
  '\uFC17': '\u062D\u062C',
  '\uFC18': '\u062D\u0645',
  '\uFC19': '\u062E\u062C',
  '\uFC1A': '\u062E\u062D',
  '\uFC1B': '\u062E\u0645',
  '\uFC1C': '\u0633\u062C',
  '\uFC1D': '\u0633\u062D',
  '\uFC1E': '\u0633\u062E',
  '\uFC1F': '\u0633\u0645',
  '\uFC20': '\u0635\u062D',
  '\uFC21': '\u0635\u0645',
  '\uFC22': '\u0636\u062C',
  '\uFC23': '\u0636\u062D',
  '\uFC24': '\u0636\u062E',
  '\uFC25': '\u0636\u0645',
  '\uFC26': '\u0637\u062D',
  '\uFC27': '\u0637\u0645',
  '\uFC28': '\u0638\u0645',
  '\uFC29': '\u0639\u062C',
  '\uFC2A': '\u0639\u0645',
  '\uFC2B': '\u063A\u062C',
  '\uFC2C': '\u063A\u0645',
  '\uFC2D': '\u0641\u062C',
  '\uFC2E': '\u0641\u062D',
  '\uFC2F': '\u0641\u062E',
  '\uFC30': '\u0641\u0645',
  '\uFC31': '\u0641\u0649',
  '\uFC32': '\u0641\u064A',
  '\uFC33': '\u0642\u062D',
  '\uFC34': '\u0642\u0645',
  '\uFC35': '\u0642\u0649',
  '\uFC36': '\u0642\u064A',
  '\uFC37': '\u0643\u0627',
  '\uFC38': '\u0643\u062C',
  '\uFC39': '\u0643\u062D',
  '\uFC3A': '\u0643\u062E',
  '\uFC3B': '\u0643\u0644',
  '\uFC3C': '\u0643\u0645',
  '\uFC3D': '\u0643\u0649',
  '\uFC3E': '\u0643\u064A',
  '\uFC3F': '\u0644\u062C',
  '\uFC40': '\u0644\u062D',
  '\uFC41': '\u0644\u062E',
  '\uFC42': '\u0644\u0645',
  '\uFC43': '\u0644\u0649',
  '\uFC44': '\u0644\u064A',
  '\uFC45': '\u0645\u062C',
  '\uFC46': '\u0645\u062D',
  '\uFC47': '\u0645\u062E',
  '\uFC48': '\u0645\u0645',
  '\uFC49': '\u0645\u0649',
  '\uFC4A': '\u0645\u064A',
  '\uFC4B': '\u0646\u062C',
  '\uFC4C': '\u0646\u062D',
  '\uFC4D': '\u0646\u062E',
  '\uFC4E': '\u0646\u0645',
  '\uFC4F': '\u0646\u0649',
  '\uFC50': '\u0646\u064A',
  '\uFC51': '\u0647\u062C',
  '\uFC52': '\u0647\u0645',
  '\uFC53': '\u0647\u0649',
  '\uFC54': '\u0647\u064A',
  '\uFC55': '\u064A\u062C',
  '\uFC56': '\u064A\u062D',
  '\uFC57': '\u064A\u062E',
  '\uFC58': '\u064A\u0645',
  '\uFC59': '\u064A\u0649',
  '\uFC5A': '\u064A\u064A',
  '\uFC5B': '\u0630\u0670',
  '\uFC5C': '\u0631\u0670',
  '\uFC5D': '\u0649\u0670',
  '\uFC5E': '\u0020\u064C\u0651',
  '\uFC5F': '\u0020\u064D\u0651',
  '\uFC60': '\u0020\u064E\u0651',
  '\uFC61': '\u0020\u064F\u0651',
  '\uFC62': '\u0020\u0650\u0651',
  '\uFC63': '\u0020\u0651\u0670',
  '\uFC64': '\u0626\u0631',
  '\uFC65': '\u0626\u0632',
  '\uFC66': '\u0626\u0645',
  '\uFC67': '\u0626\u0646',
  '\uFC68': '\u0626\u0649',
  '\uFC69': '\u0626\u064A',
  '\uFC6A': '\u0628\u0631',
  '\uFC6B': '\u0628\u0632',
  '\uFC6C': '\u0628\u0645',
  '\uFC6D': '\u0628\u0646',
  '\uFC6E': '\u0628\u0649',
  '\uFC6F': '\u0628\u064A',
  '\uFC70': '\u062A\u0631',
  '\uFC71': '\u062A\u0632',
  '\uFC72': '\u062A\u0645',
  '\uFC73': '\u062A\u0646',
  '\uFC74': '\u062A\u0649',
  '\uFC75': '\u062A\u064A',
  '\uFC76': '\u062B\u0631',
  '\uFC77': '\u062B\u0632',
  '\uFC78': '\u062B\u0645',
  '\uFC79': '\u062B\u0646',
  '\uFC7A': '\u062B\u0649',
  '\uFC7B': '\u062B\u064A',
  '\uFC7C': '\u0641\u0649',
  '\uFC7D': '\u0641\u064A',
  '\uFC7E': '\u0642\u0649',
  '\uFC7F': '\u0642\u064A',
  '\uFC80': '\u0643\u0627',
  '\uFC81': '\u0643\u0644',
  '\uFC82': '\u0643\u0645',
  '\uFC83': '\u0643\u0649',
  '\uFC84': '\u0643\u064A',
  '\uFC85': '\u0644\u0645',
  '\uFC86': '\u0644\u0649',
  '\uFC87': '\u0644\u064A',
  '\uFC88': '\u0645\u0627',
  '\uFC89': '\u0645\u0645',
  '\uFC8A': '\u0646\u0631',
  '\uFC8B': '\u0646\u0632',
  '\uFC8C': '\u0646\u0645',
  '\uFC8D': '\u0646\u0646',
  '\uFC8E': '\u0646\u0649',
  '\uFC8F': '\u0646\u064A',
  '\uFC90': '\u0649\u0670',
  '\uFC91': '\u064A\u0631',
  '\uFC92': '\u064A\u0632',
  '\uFC93': '\u064A\u0645',
  '\uFC94': '\u064A\u0646',
  '\uFC95': '\u064A\u0649',
  '\uFC96': '\u064A\u064A',
  '\uFC97': '\u0626\u062C',
  '\uFC98': '\u0626\u062D',
  '\uFC99': '\u0626\u062E',
  '\uFC9A': '\u0626\u0645',
  '\uFC9B': '\u0626\u0647',
  '\uFC9C': '\u0628\u062C',
  '\uFC9D': '\u0628\u062D',
  '\uFC9E': '\u0628\u062E',
  '\uFC9F': '\u0628\u0645',
  '\uFCA0': '\u0628\u0647',
  '\uFCA1': '\u062A\u062C',
  '\uFCA2': '\u062A\u062D',
  '\uFCA3': '\u062A\u062E',
  '\uFCA4': '\u062A\u0645',
  '\uFCA5': '\u062A\u0647',
  '\uFCA6': '\u062B\u0645',
  '\uFCA7': '\u062C\u062D',
  '\uFCA8': '\u062C\u0645',
  '\uFCA9': '\u062D\u062C',
  '\uFCAA': '\u062D\u0645',
  '\uFCAB': '\u062E\u062C',
  '\uFCAC': '\u062E\u0645',
  '\uFCAD': '\u0633\u062C',
  '\uFCAE': '\u0633\u062D',
  '\uFCAF': '\u0633\u062E',
  '\uFCB0': '\u0633\u0645',
  '\uFCB1': '\u0635\u062D',
  '\uFCB2': '\u0635\u062E',
  '\uFCB3': '\u0635\u0645',
  '\uFCB4': '\u0636\u062C',
  '\uFCB5': '\u0636\u062D',
  '\uFCB6': '\u0636\u062E',
  '\uFCB7': '\u0636\u0645',
  '\uFCB8': '\u0637\u062D',
  '\uFCB9': '\u0638\u0645',
  '\uFCBA': '\u0639\u062C',
  '\uFCBB': '\u0639\u0645',
  '\uFCBC': '\u063A\u062C',
  '\uFCBD': '\u063A\u0645',
  '\uFCBE': '\u0641\u062C',
  '\uFCBF': '\u0641\u062D',
  '\uFCC0': '\u0641\u062E',
  '\uFCC1': '\u0641\u0645',
  '\uFCC2': '\u0642\u062D',
  '\uFCC3': '\u0642\u0645',
  '\uFCC4': '\u0643\u062C',
  '\uFCC5': '\u0643\u062D',
  '\uFCC6': '\u0643\u062E',
  '\uFCC7': '\u0643\u0644',
  '\uFCC8': '\u0643\u0645',
  '\uFCC9': '\u0644\u062C',
  '\uFCCA': '\u0644\u062D',
  '\uFCCB': '\u0644\u062E',
  '\uFCCC': '\u0644\u0645',
  '\uFCCD': '\u0644\u0647',
  '\uFCCE': '\u0645\u062C',
  '\uFCCF': '\u0645\u062D',
  '\uFCD0': '\u0645\u062E',
  '\uFCD1': '\u0645\u0645',
  '\uFCD2': '\u0646\u062C',
  '\uFCD3': '\u0646\u062D',
  '\uFCD4': '\u0646\u062E',
  '\uFCD5': '\u0646\u0645',
  '\uFCD6': '\u0646\u0647',
  '\uFCD7': '\u0647\u062C',
  '\uFCD8': '\u0647\u0645',
  '\uFCD9': '\u0647\u0670',
  '\uFCDA': '\u064A\u062C',
  '\uFCDB': '\u064A\u062D',
  '\uFCDC': '\u064A\u062E',
  '\uFCDD': '\u064A\u0645',
  '\uFCDE': '\u064A\u0647',
  '\uFCDF': '\u0626\u0645',
  '\uFCE0': '\u0626\u0647',
  '\uFCE1': '\u0628\u0645',
  '\uFCE2': '\u0628\u0647',
  '\uFCE3': '\u062A\u0645',
  '\uFCE4': '\u062A\u0647',
  '\uFCE5': '\u062B\u0645',
  '\uFCE6': '\u062B\u0647',
  '\uFCE7': '\u0633\u0645',
  '\uFCE8': '\u0633\u0647',
  '\uFCE9': '\u0634\u0645',
  '\uFCEA': '\u0634\u0647',
  '\uFCEB': '\u0643\u0644',
  '\uFCEC': '\u0643\u0645',
  '\uFCED': '\u0644\u0645',
  '\uFCEE': '\u0646\u0645',
  '\uFCEF': '\u0646\u0647',
  '\uFCF0': '\u064A\u0645',
  '\uFCF1': '\u064A\u0647',
  '\uFCF2': '\u0640\u064E\u0651',
  '\uFCF3': '\u0640\u064F\u0651',
  '\uFCF4': '\u0640\u0650\u0651',
  '\uFCF5': '\u0637\u0649',
  '\uFCF6': '\u0637\u064A',
  '\uFCF7': '\u0639\u0649',
  '\uFCF8': '\u0639\u064A',
  '\uFCF9': '\u063A\u0649',
  '\uFCFA': '\u063A\u064A',
  '\uFCFB': '\u0633\u0649',
  '\uFCFC': '\u0633\u064A',
  '\uFCFD': '\u0634\u0649',
  '\uFCFE': '\u0634\u064A',
  '\uFCFF': '\u062D\u0649',
  '\uFD00': '\u062D\u064A',
  '\uFD01': '\u062C\u0649',
  '\uFD02': '\u062C\u064A',
  '\uFD03': '\u062E\u0649',
  '\uFD04': '\u062E\u064A',
  '\uFD05': '\u0635\u0649',
  '\uFD06': '\u0635\u064A',
  '\uFD07': '\u0636\u0649',
  '\uFD08': '\u0636\u064A',
  '\uFD09': '\u0634\u062C',
  '\uFD0A': '\u0634\u062D',
  '\uFD0B': '\u0634\u062E',
  '\uFD0C': '\u0634\u0645',
  '\uFD0D': '\u0634\u0631',
  '\uFD0E': '\u0633\u0631',
  '\uFD0F': '\u0635\u0631',
  '\uFD10': '\u0636\u0631',
  '\uFD11': '\u0637\u0649',
  '\uFD12': '\u0637\u064A',
  '\uFD13': '\u0639\u0649',
  '\uFD14': '\u0639\u064A',
  '\uFD15': '\u063A\u0649',
  '\uFD16': '\u063A\u064A',
  '\uFD17': '\u0633\u0649',
  '\uFD18': '\u0633\u064A',
  '\uFD19': '\u0634\u0649',
  '\uFD1A': '\u0634\u064A',
  '\uFD1B': '\u062D\u0649',
  '\uFD1C': '\u062D\u064A',
  '\uFD1D': '\u062C\u0649',
  '\uFD1E': '\u062C\u064A',
  '\uFD1F': '\u062E\u0649',
  '\uFD20': '\u062E\u064A',
  '\uFD21': '\u0635\u0649',
  '\uFD22': '\u0635\u064A',
  '\uFD23': '\u0636\u0649',
  '\uFD24': '\u0636\u064A',
  '\uFD25': '\u0634\u062C',
  '\uFD26': '\u0634\u062D',
  '\uFD27': '\u0634\u062E',
  '\uFD28': '\u0634\u0645',
  '\uFD29': '\u0634\u0631',
  '\uFD2A': '\u0633\u0631',
  '\uFD2B': '\u0635\u0631',
  '\uFD2C': '\u0636\u0631',
  '\uFD2D': '\u0634\u062C',
  '\uFD2E': '\u0634\u062D',
  '\uFD2F': '\u0634\u062E',
  '\uFD30': '\u0634\u0645',
  '\uFD31': '\u0633\u0647',
  '\uFD32': '\u0634\u0647',
  '\uFD33': '\u0637\u0645',
  '\uFD34': '\u0633\u062C',
  '\uFD35': '\u0633\u062D',
  '\uFD36': '\u0633\u062E',
  '\uFD37': '\u0634\u062C',
  '\uFD38': '\u0634\u062D',
  '\uFD39': '\u0634\u062E',
  '\uFD3A': '\u0637\u0645',
  '\uFD3B': '\u0638\u0645',
  '\uFD3C': '\u0627\u064B',
  '\uFD3D': '\u0627\u064B',
  '\uFD50': '\u062A\u062C\u0645',
  '\uFD51': '\u062A\u062D\u062C',
  '\uFD52': '\u062A\u062D\u062C',
  '\uFD53': '\u062A\u062D\u0645',
  '\uFD54': '\u062A\u062E\u0645',
  '\uFD55': '\u062A\u0645\u062C',
  '\uFD56': '\u062A\u0645\u062D',
  '\uFD57': '\u062A\u0645\u062E',
  '\uFD58': '\u062C\u0645\u062D',
  '\uFD59': '\u062C\u0645\u062D',
  '\uFD5A': '\u062D\u0645\u064A',
  '\uFD5B': '\u062D\u0645\u0649',
  '\uFD5C': '\u0633\u062D\u062C',
  '\uFD5D': '\u0633\u062C\u062D',
  '\uFD5E': '\u0633\u062C\u0649',
  '\uFD5F': '\u0633\u0645\u062D',
  '\uFD60': '\u0633\u0645\u062D',
  '\uFD61': '\u0633\u0645\u062C',
  '\uFD62': '\u0633\u0645\u0645',
  '\uFD63': '\u0633\u0645\u0645',
  '\uFD64': '\u0635\u062D\u062D',
  '\uFD65': '\u0635\u062D\u062D',
  '\uFD66': '\u0635\u0645\u0645',
  '\uFD67': '\u0634\u062D\u0645',
  '\uFD68': '\u0634\u062D\u0645',
  '\uFD69': '\u0634\u062C\u064A',
  '\uFD6A': '\u0634\u0645\u062E',
  '\uFD6B': '\u0634\u0645\u062E',
  '\uFD6C': '\u0634\u0645\u0645',
  '\uFD6D': '\u0634\u0645\u0645',
  '\uFD6E': '\u0636\u062D\u0649',
  '\uFD6F': '\u0636\u062E\u0645',
  '\uFD70': '\u0636\u062E\u0645',
  '\uFD71': '\u0637\u0645\u062D',
  '\uFD72': '\u0637\u0645\u062D',
  '\uFD73': '\u0637\u0645\u0645',
  '\uFD74': '\u0637\u0645\u064A',
  '\uFD75': '\u0639\u062C\u0645',
  '\uFD76': '\u0639\u0645\u0645',
  '\uFD77': '\u0639\u0645\u0645',
  '\uFD78': '\u0639\u0645\u0649',
  '\uFD79': '\u063A\u0645\u0645',
  '\uFD7A': '\u063A\u0645\u064A',
  '\uFD7B': '\u063A\u0645\u0649',
  '\uFD7C': '\u0641\u062E\u0645',
  '\uFD7D': '\u0641\u062E\u0645',
  '\uFD7E': '\u0642\u0645\u062D',
  '\uFD7F': '\u0642\u0645\u0645',
  '\uFD80': '\u0644\u062D\u0645',
  '\uFD81': '\u0644\u062D\u064A',
  '\uFD82': '\u0644\u062D\u0649',
  '\uFD83': '\u0644\u062C\u062C',
  '\uFD84': '\u0644\u062C\u062C',
  '\uFD85': '\u0644\u062E\u0645',
  '\uFD86': '\u0644\u062E\u0645',
  '\uFD87': '\u0644\u0645\u062D',
  '\uFD88': '\u0644\u0645\u062D',
  '\uFD89': '\u0645\u062D\u062C',
  '\uFD8A': '\u0645\u062D\u0645',
  '\uFD8B': '\u0645\u062D\u064A',
  '\uFD8C': '\u0645\u062C\u062D',
  '\uFD8D': '\u0645\u062C\u0645',
  '\uFD8E': '\u0645\u062E\u062C',
  '\uFD8F': '\u0645\u062E\u0645',
  '\uFD92': '\u0645\u062C\u062E',
  '\uFD93': '\u0647\u0645\u062C',
  '\uFD94': '\u0647\u0645\u0645',
  '\uFD95': '\u0646\u062D\u0645',
  '\uFD96': '\u0646\u062D\u0649',
  '\uFD97': '\u0646\u062C\u0645',
  '\uFD98': '\u0646\u062C\u0645',
  '\uFD99': '\u0646\u062C\u0649',
  '\uFD9A': '\u0646\u0645\u064A',
  '\uFD9B': '\u0646\u0645\u0649',
  '\uFD9C': '\u064A\u0645\u0645',
  '\uFD9D': '\u064A\u0645\u0645',
  '\uFD9E': '\u0628\u062E\u064A',
  '\uFD9F': '\u062A\u062C\u064A',
  '\uFDA0': '\u062A\u062C\u0649',
  '\uFDA1': '\u062A\u062E\u064A',
  '\uFDA2': '\u062A\u062E\u0649',
  '\uFDA3': '\u062A\u0645\u064A',
  '\uFDA4': '\u062A\u0645\u0649',
  '\uFDA5': '\u062C\u0645\u064A',
  '\uFDA6': '\u062C\u062D\u0649',
  '\uFDA7': '\u062C\u0645\u0649',
  '\uFDA8': '\u0633\u062E\u0649',
  '\uFDA9': '\u0635\u062D\u064A',
  '\uFDAA': '\u0634\u062D\u064A',
  '\uFDAB': '\u0636\u062D\u064A',
  '\uFDAC': '\u0644\u062C\u064A',
  '\uFDAD': '\u0644\u0645\u064A',
  '\uFDAE': '\u064A\u062D\u064A',
  '\uFDAF': '\u064A\u062C\u064A',
  '\uFDB0': '\u064A\u0645\u064A',
  '\uFDB1': '\u0645\u0645\u064A',
  '\uFDB2': '\u0642\u0645\u064A',
  '\uFDB3': '\u0646\u062D\u064A',
  '\uFDB4': '\u0642\u0645\u062D',
  '\uFDB5': '\u0644\u062D\u0645',
  '\uFDB6': '\u0639\u0645\u064A',
  '\uFDB7': '\u0643\u0645\u064A',
  '\uFDB8': '\u0646\u062C\u062D',
  '\uFDB9': '\u0645\u062E\u064A',
  '\uFDBA': '\u0644\u062C\u0645',
  '\uFDBB': '\u0643\u0645\u0645',
  '\uFDBC': '\u0644\u062C\u0645',
  '\uFDBD': '\u0646\u062C\u062D',
  '\uFDBE': '\u062C\u062D\u064A',
  '\uFDBF': '\u062D\u062C\u064A',
  '\uFDC0': '\u0645\u062C\u064A',
  '\uFDC1': '\u0641\u0645\u064A',
  '\uFDC2': '\u0628\u062D\u064A',
  '\uFDC3': '\u0643\u0645\u0645',
  '\uFDC4': '\u0639\u062C\u0645',
  '\uFDC5': '\u0635\u0645\u0645',
  '\uFDC6': '\u0633\u062E\u064A',
  '\uFDC7': '\u0646\u062C\u064A',
  '\uFE49': '\u203E',
  '\uFE4A': '\u203E',
  '\uFE4B': '\u203E',
  '\uFE4C': '\u203E',
  '\uFE4D': '\u005F',
  '\uFE4E': '\u005F',
  '\uFE4F': '\u005F',
  '\uFE80': '\u0621',
  '\uFE81': '\u0622',
  '\uFE82': '\u0622',
  '\uFE83': '\u0623',
  '\uFE84': '\u0623',
  '\uFE85': '\u0624',
  '\uFE86': '\u0624',
  '\uFE87': '\u0625',
  '\uFE88': '\u0625',
  '\uFE89': '\u0626',
  '\uFE8A': '\u0626',
  '\uFE8B': '\u0626',
  '\uFE8C': '\u0626',
  '\uFE8D': '\u0627',
  '\uFE8E': '\u0627',
  '\uFE8F': '\u0628',
  '\uFE90': '\u0628',
  '\uFE91': '\u0628',
  '\uFE92': '\u0628',
  '\uFE93': '\u0629',
  '\uFE94': '\u0629',
  '\uFE95': '\u062A',
  '\uFE96': '\u062A',
  '\uFE97': '\u062A',
  '\uFE98': '\u062A',
  '\uFE99': '\u062B',
  '\uFE9A': '\u062B',
  '\uFE9B': '\u062B',
  '\uFE9C': '\u062B',
  '\uFE9D': '\u062C',
  '\uFE9E': '\u062C',
  '\uFE9F': '\u062C',
  '\uFEA0': '\u062C',
  '\uFEA1': '\u062D',
  '\uFEA2': '\u062D',
  '\uFEA3': '\u062D',
  '\uFEA4': '\u062D',
  '\uFEA5': '\u062E',
  '\uFEA6': '\u062E',
  '\uFEA7': '\u062E',
  '\uFEA8': '\u062E',
  '\uFEA9': '\u062F',
  '\uFEAA': '\u062F',
  '\uFEAB': '\u0630',
  '\uFEAC': '\u0630',
  '\uFEAD': '\u0631',
  '\uFEAE': '\u0631',
  '\uFEAF': '\u0632',
  '\uFEB0': '\u0632',
  '\uFEB1': '\u0633',
  '\uFEB2': '\u0633',
  '\uFEB3': '\u0633',
  '\uFEB4': '\u0633',
  '\uFEB5': '\u0634',
  '\uFEB6': '\u0634',
  '\uFEB7': '\u0634',
  '\uFEB8': '\u0634',
  '\uFEB9': '\u0635',
  '\uFEBA': '\u0635',
  '\uFEBB': '\u0635',
  '\uFEBC': '\u0635',
  '\uFEBD': '\u0636',
  '\uFEBE': '\u0636',
  '\uFEBF': '\u0636',
  '\uFEC0': '\u0636',
  '\uFEC1': '\u0637',
  '\uFEC2': '\u0637',
  '\uFEC3': '\u0637',
  '\uFEC4': '\u0637',
  '\uFEC5': '\u0638',
  '\uFEC6': '\u0638',
  '\uFEC7': '\u0638',
  '\uFEC8': '\u0638',
  '\uFEC9': '\u0639',
  '\uFECA': '\u0639',
  '\uFECB': '\u0639',
  '\uFECC': '\u0639',
  '\uFECD': '\u063A',
  '\uFECE': '\u063A',
  '\uFECF': '\u063A',
  '\uFED0': '\u063A',
  '\uFED1': '\u0641',
  '\uFED2': '\u0641',
  '\uFED3': '\u0641',
  '\uFED4': '\u0641',
  '\uFED5': '\u0642',
  '\uFED6': '\u0642',
  '\uFED7': '\u0642',
  '\uFED8': '\u0642',
  '\uFED9': '\u0643',
  '\uFEDA': '\u0643',
  '\uFEDB': '\u0643',
  '\uFEDC': '\u0643',
  '\uFEDD': '\u0644',
  '\uFEDE': '\u0644',
  '\uFEDF': '\u0644',
  '\uFEE0': '\u0644',
  '\uFEE1': '\u0645',
  '\uFEE2': '\u0645',
  '\uFEE3': '\u0645',
  '\uFEE4': '\u0645',
  '\uFEE5': '\u0646',
  '\uFEE6': '\u0646',
  '\uFEE7': '\u0646',
  '\uFEE8': '\u0646',
  '\uFEE9': '\u0647',
  '\uFEEA': '\u0647',
  '\uFEEB': '\u0647',
  '\uFEEC': '\u0647',
  '\uFEED': '\u0648',
  '\uFEEE': '\u0648',
  '\uFEEF': '\u0649',
  '\uFEF0': '\u0649',
  '\uFEF1': '\u064A',
  '\uFEF2': '\u064A',
  '\uFEF3': '\u064A',
  '\uFEF4': '\u064A',
  '\uFEF5': '\u0644\u0622',
  '\uFEF6': '\u0644\u0622',
  '\uFEF7': '\u0644\u0623',
  '\uFEF8': '\u0644\u0623',
  '\uFEF9': '\u0644\u0625',
  '\uFEFA': '\u0644\u0625',
  '\uFEFB': '\u0644\u0627',
  '\uFEFC': '\u0644\u0627'
};

function reverseIfRtl(chars) {
  var charsLength = chars.length;
  //reverse an arabic ligature
  if (charsLength <= 1 || !isRTLRangeFor(chars.charCodeAt(0))) {
    return chars;
  }
  var s = '';
  for (var ii = charsLength - 1; ii >= 0; ii--) {
    s += chars[ii];
  }
  return s;
}

function adjustWidths(properties) {
  if (properties.fontMatrix[0] === FONT_IDENTITY_MATRIX[0]) {
    return;
  }
  // adjusting width to fontMatrix scale
  var scale = 0.001 / properties.fontMatrix[0];
  var glyphsWidths = properties.widths;
  for (var glyph in glyphsWidths) {
    glyphsWidths[glyph] *= scale;
  }
  properties.defaultWidth *= scale;
}

function getFontType(type, subtype) {
  switch (type) {
    case 'Type1':
      return subtype === 'Type1C' ? FontType.TYPE1C : FontType.TYPE1;
    case 'CIDFontType0':
      return subtype === 'CIDFontType0C' ? FontType.CIDFONTTYPE0C :
        FontType.CIDFONTTYPE0;
    case 'OpenType':
      return FontType.OPENTYPE;
    case 'TrueType':
      return FontType.TRUETYPE;
    case 'CIDFontType2':
      return FontType.CIDFONTTYPE2;
    case 'MMType1':
      return FontType.MMTYPE1;
    case 'Type0':
      return FontType.TYPE0;
    default:
      return FontType.UNKNOWN;
  }
}

var Glyph = (function GlyphClosure() {
  function Glyph(fontChar, unicode, accent, width, vmetric, operatorListId) {
    this.fontChar = fontChar;
    this.unicode = unicode;
    this.accent = accent;
    this.width = width;
    this.vmetric = vmetric;
    this.operatorListId = operatorListId;
  }

  Glyph.prototype.matchesForCache =
      function(fontChar, unicode, accent, width, vmetric, operatorListId) {
    return this.fontChar === fontChar &&
           this.unicode === unicode &&
           this.accent === accent &&
           this.width === width &&
           this.vmetric === vmetric &&
           this.operatorListId === operatorListId;
  };

  return Glyph;
})();

var ToUnicodeMap = (function ToUnicodeMapClosure() {
  function ToUnicodeMap(cmap) {
    // The elements of this._map can be integers or strings, depending on how
    // |cmap| was created.
    this._map = cmap;
  }

  ToUnicodeMap.prototype = {
    get length() {
      return this._map.length;
    },

    forEach: function(callback) {
      for (var charCode in this._map) {
        callback(charCode, this._map[charCode].charCodeAt(0));
      }
    },

    get: function(i) {
      return this._map[i];
    },

    charCodeOf: function(v) {
      return this._map.indexOf(v);
    }
  };

  return ToUnicodeMap;
})();

var IdentityToUnicodeMap = (function IdentityToUnicodeMapClosure() {
  function IdentityToUnicodeMap(firstChar, lastChar) {
    this.firstChar = firstChar;
    this.lastChar = lastChar;
  }

  IdentityToUnicodeMap.prototype = {
    get length() {
      error('should not access .length');
    },

    forEach: function (callback) {
      for (var i = this.firstChar, ii = this.lastChar; i <= ii; i++) {
        callback(i, i);
      }
    },

    get: function (i) {
      if (this.firstChar <= i && i <= this.lastChar) {
        return String.fromCharCode(i);
      }
      return undefined;
    },

    charCodeOf: function (v) {
      error('should not call .charCodeOf');
    }
  };

  return IdentityToUnicodeMap;
})();

var OpenTypeFileBuilder = (function OpenTypeFileBuilderClosure() {
  function writeInt16(dest, offset, num) {
    dest[offset] = (num >> 8) & 0xFF;
    dest[offset + 1] = num & 0xFF;
  }

  function writeInt32(dest, offset, num) {
    dest[offset] = (num >> 24) & 0xFF;
    dest[offset + 1] = (num >> 16) & 0xFF;
    dest[offset + 2] = (num >> 8) & 0xFF;
    dest[offset + 3] = num & 0xFF;
  }

  function writeData(dest, offset, data) {
    var i, ii;
    if (data instanceof Uint8Array) {
      dest.set(data, offset);
    } else if (typeof data === 'string') {
      for (i = 0, ii = data.length; i < ii; i++) {
        dest[offset++] = data.charCodeAt(i) & 0xFF;
      }
    } else {
      // treating everything else as array
      for (i = 0, ii = data.length; i < ii; i++) {
        dest[offset++] = data[i] & 0xFF;
      }
    }
  }

  function OpenTypeFileBuilder(sfnt) {
    this.sfnt = sfnt;
    this.tables = Object.create(null);
  }

  OpenTypeFileBuilder.getSearchParams =
      function OpenTypeFileBuilder_getSearchParams(entriesCount, entrySize) {
    var maxPower2 = 1, log2 = 0;
    while ((maxPower2 ^ entriesCount) > maxPower2) {
      maxPower2 <<= 1;
      log2++;
    }
    var searchRange = maxPower2 * entrySize;
    return {
      range: searchRange,
      entry: log2,
      rangeShift: entrySize * entriesCount - searchRange
    };
  };

  var OTF_HEADER_SIZE = 12;
  var OTF_TABLE_ENTRY_SIZE = 16;

  OpenTypeFileBuilder.prototype = {
    toArray: function OpenTypeFileBuilder_toArray() {
      var sfnt = this.sfnt;

      // Tables needs to be written by ascendant alphabetic order
      var tables = this.tables;
      var tablesNames = Object.keys(tables);
      tablesNames.sort();
      var numTables = tablesNames.length;

      var i, j, jj, table, tableName;
      // layout the tables data
      var offset = OTF_HEADER_SIZE + numTables * OTF_TABLE_ENTRY_SIZE;
      var tableOffsets = [offset];
      for (i = 0; i < numTables; i++) {
        table = tables[tablesNames[i]];
        var paddedLength = ((table.length + 3) & ~3) >>> 0;
        offset += paddedLength;
        tableOffsets.push(offset);
      }

      var file = new Uint8Array(offset);
      // write the table data first (mostly for checksum)
      for (i = 0; i < numTables; i++) {
        table = tables[tablesNames[i]];
        writeData(file, tableOffsets[i], table);
      }

      // sfnt version (4 bytes)
      if (sfnt === 'true') {
        // Windows hates the Mac TrueType sfnt version number
        sfnt = string32(0x00010000);
      }
      file[0] = sfnt.charCodeAt(0) & 0xFF;
      file[1] = sfnt.charCodeAt(1) & 0xFF;
      file[2] = sfnt.charCodeAt(2) & 0xFF;
      file[3] = sfnt.charCodeAt(3) & 0xFF;

      // numTables (2 bytes)
      writeInt16(file, 4, numTables);

      var searchParams = OpenTypeFileBuilder.getSearchParams(numTables, 16);

      // searchRange (2 bytes)
      writeInt16(file, 6, searchParams.range);
      // entrySelector (2 bytes)
      writeInt16(file, 8, searchParams.entry);
      // rangeShift (2 bytes)
      writeInt16(file, 10, searchParams.rangeShift);

      offset = OTF_HEADER_SIZE;
      // writing table entries
      for (i = 0; i < numTables; i++) {
        tableName = tablesNames[i];
        file[offset] = tableName.charCodeAt(0) & 0xFF;
        file[offset + 1] = tableName.charCodeAt(1) & 0xFF;
        file[offset + 2] = tableName.charCodeAt(2) & 0xFF;
        file[offset + 3] = tableName.charCodeAt(3) & 0xFF;

        // checksum
        var checksum = 0;
        for (j = tableOffsets[i], jj = tableOffsets[i + 1]; j < jj; j += 4) {
          var quad = (file[j] << 24) + (file[j + 1] << 16) +
                     (file[j + 2] << 8) + file[j + 3];
          checksum = (checksum + quad) | 0;
        }
        writeInt32(file, offset + 4, checksum);

        // offset
        writeInt32(file, offset + 8, tableOffsets[i]);
        // length
        writeInt32(file, offset + 12, tables[tableName].length);

        offset += OTF_TABLE_ENTRY_SIZE;
      }
      return file;
    },

    addTable: function OpenTypeFileBuilder_addTable(tag, data) {
      if (tag in this.tables) {
        throw new Error('Table ' + tag + ' already exists');
      }
      this.tables[tag] = data;
    }
  };

  return OpenTypeFileBuilder;
})();

/**
 * 'Font' is the class the outside world should use, it encapsulate all the font
 * decoding logics whatever type it is (assuming the font type is supported).
 *
 * For example to read a Type1 font and to attach it to the document:
 *   var type1Font = new Font("MyFontName", binaryFile, propertiesObject);
 *   type1Font.bind();
 */
var Font = (function FontClosure() {
  function Font(name, file, properties) {
    var charCode, glyphName, fontChar;

    this.name = name;
    this.loadedName = properties.loadedName;
    this.isType3Font = properties.isType3Font;
    this.sizes = [];

    this.glyphCache = {};

    var names = name.split('+');
    names = names.length > 1 ? names[1] : names[0];
    names = names.split(/[-,_]/g)[0];
    this.isSerifFont = !!(properties.flags & FontFlags.Serif);
    this.isSymbolicFont = !!(properties.flags & FontFlags.Symbolic);
    this.isMonospace = !!(properties.flags & FontFlags.FixedPitch);

    var type = properties.type;
    var subtype = properties.subtype;
    this.type = type;

    this.fallbackName = (this.isMonospace ? 'monospace' :
                         (this.isSerifFont ? 'serif' : 'sans-serif'));

    this.differences = properties.differences;
    this.widths = properties.widths;
    this.defaultWidth = properties.defaultWidth;
    this.composite = properties.composite;
    this.wideChars = properties.wideChars;
    this.cMap = properties.cMap;
    this.ascent = properties.ascent / PDF_GLYPH_SPACE_UNITS;
    this.descent = properties.descent / PDF_GLYPH_SPACE_UNITS;
    this.fontMatrix = properties.fontMatrix;

    this.toUnicode = properties.toUnicode = this.buildToUnicode(properties);

    this.toFontChar = [];

    if (properties.type === 'Type3') {
      for (charCode = 0; charCode < 256; charCode++) {
        this.toFontChar[charCode] = (this.differences[charCode] ||
                                     properties.defaultEncoding[charCode]);
      }
      this.fontType = FontType.TYPE3;
      return;
    }

    this.cidEncoding = properties.cidEncoding;
    this.vertical = properties.vertical;
    if (this.vertical) {
      this.vmetrics = properties.vmetrics;
      this.defaultVMetrics = properties.defaultVMetrics;
    }

    if (!file || file.isEmpty) {
      if (file) {
        // Some bad PDF generators will include empty font files,
        // attempting to recover by assuming that no file exists.
        warn('Font file is empty in "' + name + '" (' + this.loadedName + ')');
      }

      this.missingFile = true;
      // The file data is not specified. Trying to fix the font name
      // to be used with the canvas.font.
      var fontName = name.replace(/[,_]/g, '-');
      var isStandardFont = fontName in stdFontMap;
      fontName = stdFontMap[fontName] || nonStdFontMap[fontName] || fontName;

      this.bold = (fontName.search(/bold/gi) !== -1);
      this.italic = ((fontName.search(/oblique/gi) !== -1) ||
                     (fontName.search(/italic/gi) !== -1));

      // Use 'name' instead of 'fontName' here because the original
      // name ArialBlack for example will be replaced by Helvetica.
      this.black = (name.search(/Black/g) !== -1);

      // if at least one width is present, remeasure all chars when exists
      this.remeasure = Object.keys(this.widths).length > 0;
      if (isStandardFont && type === 'CIDFontType2' &&
          properties.cidEncoding.indexOf('Identity-') === 0) {
        // Standard fonts might be embedded as CID font without glyph mapping.
        // Building one based on GlyphMapForStandardFonts.
        var map = [];
        for (var code in GlyphMapForStandardFonts) {
          map[+code] = GlyphMapForStandardFonts[code];
        }
        var isIdentityUnicode = this.toUnicode instanceof IdentityToUnicodeMap;
        if (!isIdentityUnicode) {
          this.toUnicode.forEach(function(charCode, unicodeCharCode) {
            map[+charCode] = unicodeCharCode;
          });
        }
        this.toFontChar = map;
        this.toUnicode = new ToUnicodeMap(map);
      } else if (/Symbol/i.test(fontName)) {
        var symbols = Encodings.SymbolSetEncoding;
        for (charCode in symbols) {
          fontChar = GlyphsUnicode[symbols[charCode]];
          if (!fontChar) {
            continue;
          }
          this.toFontChar[charCode] = fontChar;
        }
        for (charCode in properties.differences) {
          fontChar = GlyphsUnicode[properties.differences[charCode]];
          if (!fontChar) {
            continue;
          }
          this.toFontChar[charCode] = fontChar;
        }
      } else if (/Dingbats/i.test(fontName)) {
        var dingbats = Encodings.ZapfDingbatsEncoding;
        for (charCode in dingbats) {
          fontChar = DingbatsGlyphsUnicode[dingbats[charCode]];
          if (!fontChar) {
            continue;
          }
          this.toFontChar[charCode] = fontChar;
        }
        for (charCode in properties.differences) {
          fontChar = DingbatsGlyphsUnicode[properties.differences[charCode]];
          if (!fontChar) {
            continue;
          }
          this.toFontChar[charCode] = fontChar;
        }
      } else if (isStandardFont) {
        this.toFontChar = [];
        for (charCode in properties.defaultEncoding) {
          glyphName = (properties.differences[charCode] ||
                       properties.defaultEncoding[charCode]);
          this.toFontChar[charCode] = GlyphsUnicode[glyphName];
        }
      } else {
        var unicodeCharCode, notCidFont = (type.indexOf('CIDFontType') === -1);
        this.toUnicode.forEach(function(charCode, unicodeCharCode) {
          if (notCidFont) {
            glyphName = (properties.differences[charCode] ||
                         properties.defaultEncoding[charCode]);
            unicodeCharCode = (GlyphsUnicode[glyphName] || unicodeCharCode);
          }
          this.toFontChar[charCode] = unicodeCharCode;
        }.bind(this));
      }
      this.loadedName = fontName.split('-')[0];
      this.loading = false;
      this.fontType = getFontType(type, subtype);
      return;
    }

    // Some fonts might use wrong font types for Type1C or CIDFontType0C
    if (subtype === 'Type1C' && (type !== 'Type1' && type !== 'MMType1')) {
      // Some TrueType fonts by mistake claim Type1C
      if (isTrueTypeFile(file)) {
        subtype = 'TrueType';
      } else {
        type = 'Type1';
      }
    }
    if (subtype === 'CIDFontType0C' && type !== 'CIDFontType0') {
      type = 'CIDFontType0';
    }
    // XXX: Temporarily change the type for open type so we trigger a warning.
    // This should be removed when we add support for open type.
    if (subtype === 'OpenType') {
      type = 'OpenType';
    }

    var data;
    switch (type) {
      case 'MMType1':
        info('MMType1 font (' + name + '), falling back to Type1.');
        /* falls through */
      case 'Type1':
      case 'CIDFontType0':
        this.mimetype = 'font/opentype';

        var cff = (subtype === 'Type1C' || subtype === 'CIDFontType0C') ?
          new CFFFont(file, properties) : new Type1Font(name, file, properties);

        adjustWidths(properties);

        // Wrap the CFF data inside an OTF font file
        data = this.convert(name, cff, properties);
        break;

      case 'OpenType':
      case 'TrueType':
      case 'CIDFontType2':
        this.mimetype = 'font/opentype';

        // Repair the TrueType file. It is can be damaged in the point of
        // view of the sanitizer
        data = this.checkAndRepair(name, file, properties);
        if (this.isOpenType) {
          type = 'OpenType';
        }
        break;

      default:
        error('Font ' + type + ' is not supported');
        break;
    }

    this.data = data;
    this.fontType = getFontType(type, subtype);

    // Transfer some properties again that could change during font conversion
    this.fontMatrix = properties.fontMatrix;
    this.widths = properties.widths;
    this.defaultWidth = properties.defaultWidth;
    this.encoding = properties.baseEncoding;
    this.seacMap = properties.seacMap;

    this.loading = true;
  }

  Font.getFontID = (function () {
    var ID = 1;
    return function Font_getFontID() {
      return String(ID++);
    };
  })();

  function int16(b0, b1) {
    return (b0 << 8) + b1;
  }

  function int32(b0, b1, b2, b3) {
    return (b0 << 24) + (b1 << 16) + (b2 << 8) + b3;
  }

  function string16(value) {
    return String.fromCharCode((value >> 8) & 0xff, value & 0xff);
  }

  function safeString16(value) {
    // clamp value to the 16-bit int range
    value = (value > 0x7FFF ? 0x7FFF : (value < -0x8000 ? -0x8000 : value));
    return String.fromCharCode((value >> 8) & 0xff, value & 0xff);
  }

  function isTrueTypeFile(file) {
    var header = file.peekBytes(4);
    return readUint32(header, 0) === 0x00010000;
  }

  /**
   * Rebuilds the char code to glyph ID map by trying to replace the char codes
   * with their unicode value. It also moves char codes that are in known
   * problematic locations.
   * @return {Object} Two properties:
   * 'toFontChar' - maps original char codes(the value that will be read
   * from commands such as show text) to the char codes that will be used in the
   * font that we build
   * 'charCodeToGlyphId' - maps the new font char codes to glyph ids
   */
  function adjustMapping(charCodeToGlyphId, properties) {
    var toUnicode = properties.toUnicode;
    var isSymbolic = !!(properties.flags & FontFlags.Symbolic);
    var isIdentityUnicode =
      properties.toUnicode instanceof IdentityToUnicodeMap;
    var isCidFontType2 = (properties.type === 'CIDFontType2');
    var newMap = Object.create(null);
    var toFontChar = [];
    var usedFontCharCodes = [];
    var nextAvailableFontCharCode = PRIVATE_USE_OFFSET_START;
    for (var originalCharCode in charCodeToGlyphId) {
      originalCharCode |= 0;
      var glyphId = charCodeToGlyphId[originalCharCode];
      var fontCharCode = originalCharCode;
      // First try to map the value to a unicode position if a non identity map
      // was created.
      if (!isIdentityUnicode) {
        if (toUnicode.get(originalCharCode) !== undefined) {
          var unicode = toUnicode.get(fontCharCode);
          // TODO: Try to map ligatures to the correct spot.
          if (unicode.length === 1) {
            fontCharCode = unicode.charCodeAt(0);
          }
        } else if (isCidFontType2) {
          // For CIDFontType2, move characters not present in toUnicode
          // to the private use area (fixes bug 1028735 and issue 4881).
          fontCharCode = nextAvailableFontCharCode;
        }
      }
      // Try to move control characters, special characters and already mapped
      // characters to the private use area since they will not be drawn by
      // canvas if left in their current position. Also, move characters if the
      // font was symbolic and there is only an identity unicode map since the
      // characters probably aren't in the correct position (fixes an issue
      // with firefox and thuluthfont).
      if ((usedFontCharCodes[fontCharCode] !== undefined ||
           fontCharCode <= 0x1f || // Control chars
           fontCharCode === 0x7F || // Control char
           fontCharCode === 0xAD || // Soft hyphen
           (fontCharCode >= 0x80 && fontCharCode <= 0x9F) || // Control chars
           // Prevent drawing characters in the specials unicode block.
           (fontCharCode >= 0xFFF0 && fontCharCode <= 0xFFFF) ||
           (isSymbolic && isIdentityUnicode)) &&
          nextAvailableFontCharCode <= PRIVATE_USE_OFFSET_END) { // Room left.
        // Loop to try and find a free spot in the private use area.
        do {
          fontCharCode = nextAvailableFontCharCode++;

          if (SKIP_PRIVATE_USE_RANGE_F000_TO_F01F && fontCharCode === 0xF000) {
            fontCharCode = 0xF020;
            nextAvailableFontCharCode = fontCharCode + 1;
          }

        } while (usedFontCharCodes[fontCharCode] !== undefined &&
                 nextAvailableFontCharCode <= PRIVATE_USE_OFFSET_END);
      }

      newMap[fontCharCode] = glyphId;
      toFontChar[originalCharCode] = fontCharCode;
      usedFontCharCodes[fontCharCode] = true;
    }
    return {
      toFontChar: toFontChar,
      charCodeToGlyphId: newMap,
      nextAvailableFontCharCode: nextAvailableFontCharCode
    };
  }

  function getRanges(glyphs) {
    // Array.sort() sorts by characters, not numerically, so convert to an
    // array of characters.
    var codes = [];
    for (var charCode in glyphs) {
      codes.push({ fontCharCode: charCode | 0, glyphId: glyphs[charCode] });
    }
    codes.sort(function fontGetRangesSort(a, b) {
      return a.fontCharCode - b.fontCharCode;
    });

    // Split the sorted codes into ranges.
    var ranges = [];
    var length = codes.length;
    for (var n = 0; n < length; ) {
      var start = codes[n].fontCharCode;
      var codeIndices = [codes[n].glyphId];
      ++n;
      var end = start;
      while (n < length && end + 1 === codes[n].fontCharCode) {
        codeIndices.push(codes[n].glyphId);
        ++end;
        ++n;
        if (end === 0xFFFF) {
          break;
        }
      }
      ranges.push([start, end, codeIndices]);
    }

    return ranges;
  }

  function createCmapTable(glyphs) {
    var ranges = getRanges(glyphs);
    var numTables = ranges[ranges.length - 1][1] > 0xFFFF ? 2 : 1;
    var cmap = '\x00\x00' + // version
               string16(numTables) +  // numTables
               '\x00\x03' + // platformID
               '\x00\x01' + // encodingID
               string32(4 + numTables * 8); // start of the table record

    var i, ii, j, jj;
    for (i = ranges.length - 1; i >= 0; --i) {
      if (ranges[i][0] <= 0xFFFF) { break; }
    }
    var bmpLength = i + 1;

    if (ranges[i][0] < 0xFFFF && ranges[i][1] === 0xFFFF) {
      ranges[i][1] = 0xFFFE;
    }
    var trailingRangesCount = ranges[i][1] < 0xFFFF ? 1 : 0;
    var segCount = bmpLength + trailingRangesCount;
    var searchParams = OpenTypeFileBuilder.getSearchParams(segCount, 2);

    // Fill up the 4 parallel arrays describing the segments.
    var startCount = '';
    var endCount = '';
    var idDeltas = '';
    var idRangeOffsets = '';
    var glyphsIds = '';
    var bias = 0;

    var range, start, end, codes;
    for (i = 0, ii = bmpLength; i < ii; i++) {
      range = ranges[i];
      start = range[0];
     
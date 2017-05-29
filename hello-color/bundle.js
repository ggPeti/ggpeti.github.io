'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _chromaJs = require('chroma-js');

var _chromaJs2 = _interopRequireDefault(_chromaJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var negate = function negate(color) {
  var rgb = (0, _chromaJs2.default)(color).rgb();
  var neg = rgb.map(function (val, i) {
    return 255 - val;
  });
  return (0, _chromaJs2.default)(neg).hex();
};

var getColor = function getColor(base, _ref) {
  var multiplier = _ref.multiplier,
      lightness = _ref.lightness,
      saturation = _ref.saturation;

  var neg = negate(base);
  if (multiplier === 1) {
    return neg;
  }

  var isDark = _chromaJs2.default.contrast(neg, '#000') < _chromaJs2.default.contrast(neg, '#fff');
  var isDull = (0, _chromaJs2.default)(neg).hsl()[1] < .5;

  return (0, _chromaJs2.default)(neg).saturate(isDull ? multiplier * saturation : 0).desaturate(isDull ? 0 : multiplier * saturation).darken(isDark ? 0 : multiplier * lightness).brighten(isDark ? multiplier * lightness : 0).hex();
};

var resolveColor = function resolveColor(base) {
  return function (options) {
    return function (color) {
      var multiplier = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 17 / 16;

      color = color || getColor(base, _extends({}, options, {
        multiplier: multiplier
      }));

      var contrast = _chromaJs2.default.contrast(base, color);

      if (contrast > options.contrast) {
        return color;
      }

      var _chroma$hsl = (0, _chromaJs2.default)(color).hsl(),
          _chroma$hsl2 = _slicedToArray(_chroma$hsl, 3),
          h = _chroma$hsl2[0],
          s = _chroma$hsl2[1],
          l = _chroma$hsl2[2];

      if ((s === 0 || s === 1) && (l === 0 || l === 1)) {
        return resolveColor(base)(options)(null, -18 / 16);
      }

      color = getColor(base, _extends({}, options, {
        multiplier: multiplier
      }));

      var isNegative = multiplier < 0;
      var mult = multiplier + 1 / 16 * (isNegative ? -1 : 1);

      return resolveColor(base)(options)(color, mult);
    };
  };
};

var rotate = function rotate(base) {
  return function (deg) {
    var _chroma$hsl3 = (0, _chromaJs2.default)(base).hsl(),
        _chroma$hsl4 = _slicedToArray(_chroma$hsl3, 3),
        h = _chroma$hsl4[0],
        s = _chroma$hsl4[1],
        l = _chroma$hsl4[2];

    return (0, _chromaJs2.default)(h + deg, s, l, 'hsl').hex();
  };
};

var getHues = function getHues(base) {
  return function (length) {
    var hues = [];
    for (var i = 0; i < length; i++) {
      var deg = 360 / (length + 1) * (i + 1);
      var hex = rotate(base)(deg);
      hues.push(hex);
    }

    return hues;
  };
};

var hello = function hello(base) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$saturation = options.saturation,
      saturation = _options$saturation === undefined ? 0 : _options$saturation,
      _options$lightness = options.lightness,
      lightness = _options$lightness === undefined ? 1 / 16 : _options$lightness,
      _options$contrast = options.contrast,
      contrast = _options$contrast === undefined ? 3 : _options$contrast,
      _options$hues = options.hues,
      hues = _options$hues === undefined ? 3 : _options$hues;


  try {
    (0, _chromaJs2.default)(base);
  } catch (e) {
    return null;
  }

  var _chroma$hsl5 = (0, _chromaJs2.default)(base).hsl(),
      _chroma$hsl6 = _slicedToArray(_chroma$hsl5, 3),
      h = _chroma$hsl6[0],
      s = _chroma$hsl6[1],
      l = _chroma$hsl6[2];

  var luminance = (0, _chromaJs2.default)(base).luminance();
  var cont = {
    white: _chromaJs2.default.contrast(base, '#fff'),
    black: _chromaJs2.default.contrast(base, '#000')
  };
  var isDark = cont.white > cont.black;
  var isDull = s < .5;

  var color = resolveColor(base)({
    saturation: saturation,
    lightness: lightness,
    contrast: contrast
  })();

  var maxed = false;

  var result = {
    base: (0, _chromaJs2.default)(base).hex(),
    color: color,
    contrast: _chromaJs2.default.contrast(base, color),
    dark: isDark,
    scale: _chromaJs2.default.scale([base, color]).colors(8),
    hues: getHues(base)(hues)
  };

  return result;
};

exports.default = hello;
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["cheatmap"] = factory();
	else
		root["cheatmap"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.cheatmap = undefined;
	
	var _ndarray = __webpack_require__(1);
	
	var _ndarray2 = _interopRequireDefault(_ndarray);
	
	var _d3Array = __webpack_require__(4);
	
	var _ndarrayChunk = __webpack_require__(5);
	
	var _ndarrayHeatmap = __webpack_require__(6);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function cheatmap() {
	  var hm = (0, _ndarrayHeatmap.heatmap)();
	  var chunkShape = [1024, 1024];
	
	  function render(_) {
	    var data = hm.data();
	    hm.domain((0, _d3Array.extent)(data.data));
	
	    var chunkedArrays = (0, _ndarrayChunk.chunk)(data, chunkShape);
	    var chunkedCanvases = new Array(chunkedArrays.length);
	    for (var i = 0; i < chunkedArrays.length; ++i) {
	      chunkedCanvases[i] = new Array(chunkedArrays[i].length);
	      for (var j = 0; j < chunkedArrays[i].length; j++) {
	        hm.data(chunkedArrays[i][j]);
	        chunkedCanvases[i][j] = hm();
	      }
	    }
	    return chunkedCanvases;
	  }
	
	  render.chunkShape = function (_) {
	    return arguments.length ? (chunkShape = _, render) : chunkShape;
	  };
	
	  render.data = function (_) {
	    return arguments.length ? (hm.data(_), render) : hm.data();
	  };
	
	  render.colorSteps = function (_) {
	    return arguments.length ? (hm.colorSteps(_), render) : hm.colorSteps();
	  };
	
	  render.colorRange = function (_) {
	    return arguments.length ? (hm.colorRange(_), render) : hm.colorRange();
	  };
	
	  return render;
	}
	
	exports.cheatmap = cheatmap;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var iota = __webpack_require__(2)
	var isBuffer = __webpack_require__(3)
	
	var hasTypedArrays  = ((typeof Float64Array) !== "undefined")
	
	function compare1st(a, b) {
	  return a[0] - b[0]
	}
	
	function order() {
	  var stride = this.stride
	  var terms = new Array(stride.length)
	  var i
	  for(i=0; i<terms.length; ++i) {
	    terms[i] = [Math.abs(stride[i]), i]
	  }
	  terms.sort(compare1st)
	  var result = new Array(terms.length)
	  for(i=0; i<result.length; ++i) {
	    result[i] = terms[i][1]
	  }
	  return result
	}
	
	function compileConstructor(dtype, dimension) {
	  var className = ["View", dimension, "d", dtype].join("")
	  if(dimension < 0) {
	    className = "View_Nil" + dtype
	  }
	  var useGetters = (dtype === "generic")
	
	  if(dimension === -1) {
	    //Special case for trivial arrays
	    var code =
	      "function "+className+"(a){this.data=a;};\
	var proto="+className+".prototype;\
	proto.dtype='"+dtype+"';\
	proto.index=function(){return -1};\
	proto.size=0;\
	proto.dimension=-1;\
	proto.shape=proto.stride=proto.order=[];\
	proto.lo=proto.hi=proto.transpose=proto.step=\
	function(){return new "+className+"(this.data);};\
	proto.get=proto.set=function(){};\
	proto.pick=function(){return null};\
	return function construct_"+className+"(a){return new "+className+"(a);}"
	    var procedure = new Function(code)
	    return procedure()
	  } else if(dimension === 0) {
	    //Special case for 0d arrays
	    var code =
	      "function "+className+"(a,d) {\
	this.data = a;\
	this.offset = d\
	};\
	var proto="+className+".prototype;\
	proto.dtype='"+dtype+"';\
	proto.index=function(){return this.offset};\
	proto.dimension=0;\
	proto.size=1;\
	proto.shape=\
	proto.stride=\
	proto.order=[];\
	proto.lo=\
	proto.hi=\
	proto.transpose=\
	proto.step=function "+className+"_copy() {\
	return new "+className+"(this.data,this.offset)\
	};\
	proto.pick=function "+className+"_pick(){\
	return TrivialArray(this.data);\
	};\
	proto.valueOf=proto.get=function "+className+"_get(){\
	return "+(useGetters ? "this.data.get(this.offset)" : "this.data[this.offset]")+
	"};\
	proto.set=function "+className+"_set(v){\
	return "+(useGetters ? "this.data.set(this.offset,v)" : "this.data[this.offset]=v")+"\
	};\
	return function construct_"+className+"(a,b,c,d){return new "+className+"(a,d)}"
	    var procedure = new Function("TrivialArray", code)
	    return procedure(CACHED_CONSTRUCTORS[dtype][0])
	  }
	
	  var code = ["'use strict'"]
	
	  //Create constructor for view
	  var indices = iota(dimension)
	  var args = indices.map(function(i) { return "i"+i })
	  var index_str = "this.offset+" + indices.map(function(i) {
	        return "this.stride[" + i + "]*i" + i
	      }).join("+")
	  var shapeArg = indices.map(function(i) {
	      return "b"+i
	    }).join(",")
	  var strideArg = indices.map(function(i) {
	      return "c"+i
	    }).join(",")
	  code.push(
	    "function "+className+"(a," + shapeArg + "," + strideArg + ",d){this.data=a",
	      "this.shape=[" + shapeArg + "]",
	      "this.stride=[" + strideArg + "]",
	      "this.offset=d|0}",
	    "var proto="+className+".prototype",
	    "proto.dtype='"+dtype+"'",
	    "proto.dimension="+dimension)
	
	  //view.size:
	  code.push("Object.defineProperty(proto,'size',{get:function "+className+"_size(){\
	return "+indices.map(function(i) { return "this.shape["+i+"]" }).join("*"),
	"}})")
	
	  //view.order:
	  if(dimension === 1) {
	    code.push("proto.order=[0]")
	  } else {
	    code.push("Object.defineProperty(proto,'order',{get:")
	    if(dimension < 4) {
	      code.push("function "+className+"_order(){")
	      if(dimension === 2) {
	        code.push("return (Math.abs(this.stride[0])>Math.abs(this.stride[1]))?[1,0]:[0,1]}})")
	      } else if(dimension === 3) {
	        code.push(
	"var s0=Math.abs(this.stride[0]),s1=Math.abs(this.stride[1]),s2=Math.abs(this.stride[2]);\
	if(s0>s1){\
	if(s1>s2){\
	return [2,1,0];\
	}else if(s0>s2){\
	return [1,2,0];\
	}else{\
	return [1,0,2];\
	}\
	}else if(s0>s2){\
	return [2,0,1];\
	}else if(s2>s1){\
	return [0,1,2];\
	}else{\
	return [0,2,1];\
	}}})")
	      }
	    } else {
	      code.push("ORDER})")
	    }
	  }
	
	  //view.set(i0, ..., v):
	  code.push(
	"proto.set=function "+className+"_set("+args.join(",")+",v){")
	  if(useGetters) {
	    code.push("return this.data.set("+index_str+",v)}")
	  } else {
	    code.push("return this.data["+index_str+"]=v}")
	  }
	
	  //view.get(i0, ...):
	  code.push("proto.get=function "+className+"_get("+args.join(",")+"){")
	  if(useGetters) {
	    code.push("return this.data.get("+index_str+")}")
	  } else {
	    code.push("return this.data["+index_str+"]}")
	  }
	
	  //view.index:
	  code.push(
	    "proto.index=function "+className+"_index(", args.join(), "){return "+index_str+"}")
	
	  //view.hi():
	  code.push("proto.hi=function "+className+"_hi("+args.join(",")+"){return new "+className+"(this.data,"+
	    indices.map(function(i) {
	      return ["(typeof i",i,"!=='number'||i",i,"<0)?this.shape[", i, "]:i", i,"|0"].join("")
	    }).join(",")+","+
	    indices.map(function(i) {
	      return "this.stride["+i + "]"
	    }).join(",")+",this.offset)}")
	
	  //view.lo():
	  var a_vars = indices.map(function(i) { return "a"+i+"=this.shape["+i+"]" })
	  var c_vars = indices.map(function(i) { return "c"+i+"=this.stride["+i+"]" })
	  code.push("proto.lo=function "+className+"_lo("+args.join(",")+"){var b=this.offset,d=0,"+a_vars.join(",")+","+c_vars.join(","))
	  for(var i=0; i<dimension; ++i) {
	    code.push(
	"if(typeof i"+i+"==='number'&&i"+i+">=0){\
	d=i"+i+"|0;\
	b+=c"+i+"*d;\
	a"+i+"-=d}")
	  }
	  code.push("return new "+className+"(this.data,"+
	    indices.map(function(i) {
	      return "a"+i
	    }).join(",")+","+
	    indices.map(function(i) {
	      return "c"+i
	    }).join(",")+",b)}")
	
	  //view.step():
	  code.push("proto.step=function "+className+"_step("+args.join(",")+"){var "+
	    indices.map(function(i) {
	      return "a"+i+"=this.shape["+i+"]"
	    }).join(",")+","+
	    indices.map(function(i) {
	      return "b"+i+"=this.stride["+i+"]"
	    }).join(",")+",c=this.offset,d=0,ceil=Math.ceil")
	  for(var i=0; i<dimension; ++i) {
	    code.push(
	"if(typeof i"+i+"==='number'){\
	d=i"+i+"|0;\
	if(d<0){\
	c+=b"+i+"*(a"+i+"-1);\
	a"+i+"=ceil(-a"+i+"/d)\
	}else{\
	a"+i+"=ceil(a"+i+"/d)\
	}\
	b"+i+"*=d\
	}")
	  }
	  code.push("return new "+className+"(this.data,"+
	    indices.map(function(i) {
	      return "a" + i
	    }).join(",")+","+
	    indices.map(function(i) {
	      return "b" + i
	    }).join(",")+",c)}")
	
	  //view.transpose():
	  var tShape = new Array(dimension)
	  var tStride = new Array(dimension)
	  for(var i=0; i<dimension; ++i) {
	    tShape[i] = "a[i"+i+"]"
	    tStride[i] = "b[i"+i+"]"
	  }
	  code.push("proto.transpose=function "+className+"_transpose("+args+"){"+
	    args.map(function(n,idx) { return n + "=(" + n + "===undefined?" + idx + ":" + n + "|0)"}).join(";"),
	    "var a=this.shape,b=this.stride;return new "+className+"(this.data,"+tShape.join(",")+","+tStride.join(",")+",this.offset)}")
	
	  //view.pick():
	  code.push("proto.pick=function "+className+"_pick("+args+"){var a=[],b=[],c=this.offset")
	  for(var i=0; i<dimension; ++i) {
	    code.push("if(typeof i"+i+"==='number'&&i"+i+">=0){c=(c+this.stride["+i+"]*i"+i+")|0}else{a.push(this.shape["+i+"]);b.push(this.stride["+i+"])}")
	  }
	  code.push("var ctor=CTOR_LIST[a.length+1];return ctor(this.data,a,b,c)}")
	
	  //Add return statement
	  code.push("return function construct_"+className+"(data,shape,stride,offset){return new "+className+"(data,"+
	    indices.map(function(i) {
	      return "shape["+i+"]"
	    }).join(",")+","+
	    indices.map(function(i) {
	      return "stride["+i+"]"
	    }).join(",")+",offset)}")
	
	  //Compile procedure
	  var procedure = new Function("CTOR_LIST", "ORDER", code.join("\n"))
	  return procedure(CACHED_CONSTRUCTORS[dtype], order)
	}
	
	function arrayDType(data) {
	  if(isBuffer(data)) {
	    return "buffer"
	  }
	  if(hasTypedArrays) {
	    switch(Object.prototype.toString.call(data)) {
	      case "[object Float64Array]":
	        return "float64"
	      case "[object Float32Array]":
	        return "float32"
	      case "[object Int8Array]":
	        return "int8"
	      case "[object Int16Array]":
	        return "int16"
	      case "[object Int32Array]":
	        return "int32"
	      case "[object Uint8Array]":
	        return "uint8"
	      case "[object Uint16Array]":
	        return "uint16"
	      case "[object Uint32Array]":
	        return "uint32"
	      case "[object Uint8ClampedArray]":
	        return "uint8_clamped"
	    }
	  }
	  if(Array.isArray(data)) {
	    return "array"
	  }
	  return "generic"
	}
	
	var CACHED_CONSTRUCTORS = {
	  "float32":[],
	  "float64":[],
	  "int8":[],
	  "int16":[],
	  "int32":[],
	  "uint8":[],
	  "uint16":[],
	  "uint32":[],
	  "array":[],
	  "uint8_clamped":[],
	  "buffer":[],
	  "generic":[]
	}
	
	;(function() {
	  for(var id in CACHED_CONSTRUCTORS) {
	    CACHED_CONSTRUCTORS[id].push(compileConstructor(id, -1))
	  }
	});
	
	function wrappedNDArrayCtor(data, shape, stride, offset) {
	  if(data === undefined) {
	    var ctor = CACHED_CONSTRUCTORS.array[0]
	    return ctor([])
	  } else if(typeof data === "number") {
	    data = [data]
	  }
	  if(shape === undefined) {
	    shape = [ data.length ]
	  }
	  var d = shape.length
	  if(stride === undefined) {
	    stride = new Array(d)
	    for(var i=d-1, sz=1; i>=0; --i) {
	      stride[i] = sz
	      sz *= shape[i]
	    }
	  }
	  if(offset === undefined) {
	    offset = 0
	    for(var i=0; i<d; ++i) {
	      if(stride[i] < 0) {
	        offset -= (shape[i]-1)*stride[i]
	      }
	    }
	  }
	  var dtype = arrayDType(data)
	  var ctor_list = CACHED_CONSTRUCTORS[dtype]
	  while(ctor_list.length <= d+1) {
	    ctor_list.push(compileConstructor(dtype, ctor_list.length-1))
	  }
	  var ctor = ctor_list[d+1]
	  return ctor(data, shape, stride, offset)
	}
	
	module.exports = wrappedNDArrayCtor


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict"
	
	function iota(n) {
	  var result = new Array(n)
	  for(var i=0; i<n; ++i) {
	    result[i] = i
	  }
	  return result
	}
	
	module.exports = iota

/***/ },
/* 3 */
/***/ function(module, exports) {

	/**
	 * Determine if an object is Buffer
	 *
	 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * License:  MIT
	 *
	 * `npm install is-buffer`
	 */
	
	module.exports = function (obj) {
	  return !!(obj != null &&
	    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
	      (obj.constructor &&
	      typeof obj.constructor.isBuffer === 'function' &&
	      obj.constructor.isBuffer(obj))
	    ))
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	(function (global, factory) {
	   true ? factory(exports) :
	  typeof define === 'function' && define.amd ? define('d3-array', ['exports'], factory) :
	  factory((global.d3_array = {}));
	}(this, function (exports) { 'use strict';
	
	  function ascending(a, b) {
	    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	  };
	
	  function bisector(compare) {
	    if (compare.length === 1) compare = ascendingComparator(compare);
	    return {
	      left: function(a, x, lo, hi) {
	        if (arguments.length < 3) lo = 0;
	        if (arguments.length < 4) hi = a.length;
	        while (lo < hi) {
	          var mid = lo + hi >>> 1;
	          if (compare(a[mid], x) < 0) lo = mid + 1;
	          else hi = mid;
	        }
	        return lo;
	      },
	      right: function(a, x, lo, hi) {
	        if (arguments.length < 3) lo = 0;
	        if (arguments.length < 4) hi = a.length;
	        while (lo < hi) {
	          var mid = lo + hi >>> 1;
	          if (compare(a[mid], x) > 0) hi = mid;
	          else lo = mid + 1;
	        }
	        return lo;
	      }
	    };
	  };
	
	  function ascendingComparator(f) {
	    return function(d, x) {
	      return ascending(f(d), x);
	    };
	  }
	
	  var ascendingBisect = bisector(ascending);
	  var bisectRight = ascendingBisect.right;
	  var bisectLeft = ascendingBisect.left;
	
	  function descending(a, b) {
	    return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
	  };
	
	  function number$1(x) {
	    return x === null ? NaN : +x;
	  };
	
	  function variance(array, f) {
	    var n = array.length,
	        m = 0,
	        a,
	        d,
	        s = 0,
	        i = -1,
	        j = 0;
	
	    if (arguments.length === 1) {
	      while (++i < n) {
	        if (!isNaN(a = number$1(array[i]))) {
	          d = a - m;
	          m += d / ++j;
	          s += d * (a - m);
	        }
	      }
	    }
	
	    else {
	      while (++i < n) {
	        if (!isNaN(a = number$1(f(array[i], i, array)))) {
	          d = a - m;
	          m += d / ++j;
	          s += d * (a - m);
	        }
	      }
	    }
	
	    if (j > 1) return s / (j - 1);
	  };
	
	  function deviation() {
	    var v = variance.apply(this, arguments);
	    return v ? Math.sqrt(v) : v;
	  };
	
	  function extent(array, f) {
	    var i = -1,
	        n = array.length,
	        a,
	        b,
	        c;
	
	    if (arguments.length === 1) {
	      while (++i < n) if ((b = array[i]) != null && b >= b) { a = c = b; break; }
	      while (++i < n) if ((b = array[i]) != null) {
	        if (a > b) a = b;
	        if (c < b) c = b;
	      }
	    }
	
	    else {
	      while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = c = b; break; }
	      while (++i < n) if ((b = f(array[i], i, array)) != null) {
	        if (a > b) a = b;
	        if (c < b) c = b;
	      }
	    }
	
	    return [a, c];
	  };
	
	  function constant(x) {
	    return function() {
	      return x;
	    };
	  };
	
	  function identity(x) {
	    return x;
	  };
	
	  function range(start, stop, step) {
	    if ((n = arguments.length) < 3) {
	      step = 1;
	      if (n < 2) {
	        stop = start;
	        start = 0;
	      }
	    }
	
	    var i = -1,
	        n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
	        range = new Array(n);
	
	    while (++i < n) {
	      range[i] = start + i * step;
	    }
	
	    return range;
	  };
	
	  var e10 = Math.sqrt(50);
	  var e5 = Math.sqrt(10);
	  var e2 = Math.sqrt(2);
	  function ticks(start, stop, count) {
	    var step = tickStep(start, stop, count);
	    return range(
	      Math.ceil(start / step) * step,
	      Math.floor(stop / step) * step + step / 2, // inclusive
	      step
	    );
	  };
	
	  function tickStep(start, stop, count) {
	    var step0 = Math.abs(stop - start) / Math.max(0, count),
	        step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
	        error = step0 / step1;
	    if (error >= e10) step1 *= 10;
	    else if (error >= e5) step1 *= 5;
	    else if (error >= e2) step1 *= 2;
	    return stop < start ? -step1 : step1;
	  };
	
	  function sturges(values) {
	    return Math.ceil(Math.log(values.length) / Math.LN2) + 1;
	  };
	
	  function number(x) {
	    return +x;
	  }
	
	  function histogram() {
	    var value = identity,
	        domain = extent,
	        threshold = sturges;
	
	    function histogram(data) {
	      var i,
	          n = data.length,
	          x,
	          values = new Array(n);
	
	      // Coerce values to numbers.
	      for (i = 0; i < n; ++i) {
	        values[i] = +value(data[i], i, data);
	      }
	
	      var xz = domain(values),
	          x0 = +xz[0],
	          x1 = +xz[1],
	          tz = threshold(values, x0, x1);
	
	      // Convert number of thresholds into uniform thresholds.
	      if (!Array.isArray(tz)) tz = ticks(x0, x1, +tz);
	
	      // Coerce thresholds to numbers, ignoring any outside the domain.
	      var m = tz.length;
	      for (i = 0; i < m; ++i) tz[i] = +tz[i];
	      while (tz[0] <= x0) tz.shift(), --m;
	      while (tz[m - 1] >= x1) tz.pop(), --m;
	
	      var bins = new Array(m + 1),
	          bin;
	
	      // Initialize bins.
	      for (i = 0; i <= m; ++i) {
	        bin = bins[i] = [];
	        bin.x0 = i > 0 ? tz[i - 1] : x0;
	        bin.x1 = i < m ? tz[i] : x1;
	      }
	
	      // Assign data to bins by value, ignoring any outside the domain.
	      for (i = 0; i < n; ++i) {
	        x = values[i];
	        if (x0 <= x && x <= x1) {
	          bins[bisectRight(tz, x, 0, m)].push(data[i]);
	        }
	      }
	
	      return bins;
	    }
	
	    histogram.value = function(_) {
	      return arguments.length ? (value = typeof _ === "function" ? _ : constant(+_), histogram) : value;
	    };
	
	    histogram.domain = function(_) {
	      return arguments.length ? (domain = typeof _ === "function" ? _ : constant([+_[0], +_[1]]), histogram) : domain;
	    };
	
	    histogram.thresholds = function(_) {
	      if (!arguments.length) return threshold;
	      threshold = typeof _ === "function" ? _
	          : Array.isArray(_) ? constant(Array.prototype.map.call(_, number))
	          : constant(+_);
	      return histogram;
	    };
	
	    return histogram;
	  };
	
	  function quantile(array, p, f) {
	    if (arguments.length < 3) f = number$1;
	    if (!(n = array.length)) return;
	    if ((p = +p) <= 0 || n < 2) return +f(array[0], 0, array);
	    if (p >= 1) return +f(array[n - 1], n - 1, array);
	    var n,
	        h = (n - 1) * p,
	        i = Math.floor(h),
	        a = +f(array[i], i, array),
	        b = +f(array[i + 1], i + 1, array);
	    return a + (b - a) * (h - i);
	  };
	
	  function freedmanDiaconis(values, min, max) {
	    values.sort(ascending);
	    return Math.ceil((max - min) / (2 * (quantile(values, 0.75) - quantile(values, 0.25)) * Math.pow(values.length, -1 / 3)));
	  };
	
	  function scott(values, min, max) {
	    return Math.ceil((max - min) / (3.5 * deviation(values) * Math.pow(values.length, -1 / 3)));
	  };
	
	  function max(array, f) {
	    var i = -1,
	        n = array.length,
	        a,
	        b;
	
	    if (arguments.length === 1) {
	      while (++i < n) if ((b = array[i]) != null && b >= b) { a = b; break; }
	      while (++i < n) if ((b = array[i]) != null && b > a) a = b;
	    }
	
	    else {
	      while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = b; break; }
	      while (++i < n) if ((b = f(array[i], i, array)) != null && b > a) a = b;
	    }
	
	    return a;
	  };
	
	  function mean(array, f) {
	    var s = 0,
	        n = array.length,
	        a,
	        i = -1,
	        j = n;
	
	    if (arguments.length === 1) {
	      while (++i < n) if (!isNaN(a = number$1(array[i]))) s += a; else --j;
	    }
	
	    else {
	      while (++i < n) if (!isNaN(a = number$1(f(array[i], i, array)))) s += a; else --j;
	    }
	
	    if (j) return s / j;
	  };
	
	  function median(array, f) {
	    var numbers = [],
	        n = array.length,
	        a,
	        i = -1;
	
	    if (arguments.length === 1) {
	      while (++i < n) if (!isNaN(a = number$1(array[i]))) numbers.push(a);
	    }
	
	    else {
	      while (++i < n) if (!isNaN(a = number$1(f(array[i], i, array)))) numbers.push(a);
	    }
	
	    return quantile(numbers.sort(ascending), 0.5);
	  };
	
	  function merge(arrays) {
	    var n = arrays.length,
	        m,
	        i = -1,
	        j = 0,
	        merged,
	        array;
	
	    while (++i < n) j += arrays[i].length;
	    merged = new Array(j);
	
	    while (--n >= 0) {
	      array = arrays[n];
	      m = array.length;
	      while (--m >= 0) {
	        merged[--j] = array[m];
	      }
	    }
	
	    return merged;
	  };
	
	  function min(array, f) {
	    var i = -1,
	        n = array.length,
	        a,
	        b;
	
	    if (arguments.length === 1) {
	      while (++i < n) if ((b = array[i]) != null && b >= b) { a = b; break; }
	      while (++i < n) if ((b = array[i]) != null && a > b) a = b;
	    }
	
	    else {
	      while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = b; break; }
	      while (++i < n) if ((b = f(array[i], i, array)) != null && a > b) a = b;
	    }
	
	    return a;
	  };
	
	  function pairs(array) {
	    var i = 0, n = array.length - 1, p0, p1 = array[0], pairs = new Array(n < 0 ? 0 : n);
	    while (i < n) pairs[i] = [p0 = p1, p1 = array[++i]];
	    return pairs;
	  };
	
	  function permute(array, indexes) {
	    var i = indexes.length, permutes = new Array(i);
	    while (i--) permutes[i] = array[indexes[i]];
	    return permutes;
	  };
	
	  function scan(array, compare) {
	    if (!(n = array.length)) return;
	    var i = 0,
	        n,
	        j = 0,
	        xi,
	        xj = array[j];
	
	    if (!compare) compare = ascending;
	
	    while (++i < n) if (compare(xi = array[i], xj) < 0 || compare(xj, xj) !== 0) xj = xi, j = i;
	
	    if (compare(xj, xj) === 0) return j;
	  };
	
	  function shuffle(array, i0, i1) {
	    if ((m = arguments.length) < 3) {
	      i1 = array.length;
	      if (m < 2) i0 = 0;
	    }
	
	    var m = i1 - i0,
	        t,
	        i;
	
	    while (m) {
	      i = Math.random() * m-- | 0;
	      t = array[m + i0];
	      array[m + i0] = array[i + i0];
	      array[i + i0] = t;
	    }
	
	    return array;
	  };
	
	  function sum(array, f) {
	    var s = 0,
	        n = array.length,
	        a,
	        i = -1;
	
	    if (arguments.length === 1) {
	      while (++i < n) if (a = +array[i]) s += a; // Note: zero and null are equivalent.
	    }
	
	    else {
	      while (++i < n) if (a = +f(array[i], i, array)) s += a;
	    }
	
	    return s;
	  };
	
	  function transpose(matrix) {
	    if (!(n = matrix.length)) return [];
	    for (var i = -1, m = min(matrix, length), transpose = new Array(m); ++i < m;) {
	      for (var j = -1, n, row = transpose[i] = new Array(n); ++j < n;) {
	        row[j] = matrix[j][i];
	      }
	    }
	    return transpose;
	  };
	
	  function length(d) {
	    return d.length;
	  }
	
	  function zip() {
	    return transpose(arguments);
	  };
	
	  var version = "0.7.0";
	
	  exports.version = version;
	  exports.bisect = bisectRight;
	  exports.bisectRight = bisectRight;
	  exports.bisectLeft = bisectLeft;
	  exports.ascending = ascending;
	  exports.bisector = bisector;
	  exports.descending = descending;
	  exports.deviation = deviation;
	  exports.extent = extent;
	  exports.histogram = histogram;
	  exports.thresholdFreedmanDiaconis = freedmanDiaconis;
	  exports.thresholdScott = scott;
	  exports.thresholdSturges = sturges;
	  exports.max = max;
	  exports.mean = mean;
	  exports.median = median;
	  exports.merge = merge;
	  exports.min = min;
	  exports.pairs = pairs;
	  exports.permute = permute;
	  exports.quantile = quantile;
	  exports.range = range;
	  exports.scan = scan;
	  exports.shuffle = shuffle;
	  exports.sum = sum;
	  exports.ticks = ticks;
	  exports.tickStep = tickStep;
	  exports.transpose = transpose;
	  exports.variance = variance;
	  exports.zip = zip;
	
	}));

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	(function webpackUniversalModuleDefinition(root, factory) {
		if(true)
			module.exports = factory();
		else if(typeof define === 'function' && define.amd)
			define([], factory);
		else if(typeof exports === 'object')
			exports["chunk"] = factory();
		else
			root["chunk"] = factory();
	})(this, function() {
	return /******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};
	/******/
	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {
	/******/
	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId])
	/******/ 			return installedModules[moduleId].exports;
	/******/
	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			exports: {},
	/******/ 			id: moduleId,
	/******/ 			loaded: false
	/******/ 		};
	/******/
	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	/******/
	/******/ 		// Flag the module as loaded
	/******/ 		module.loaded = true;
	/******/
	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}
	/******/
	/******/
	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;
	/******/
	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;
	/******/
	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";
	/******/
	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(0);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
		
		Object.defineProperty(exports, "__esModule", {
		  value: true
		});
		exports.chunk = undefined;
		
		var _ndarrayPack = __webpack_require__(1);
		
		var _ndarrayPack2 = _interopRequireDefault(_ndarrayPack);
		
		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
		
		function chunk(array, shape) {
		  array = array.shape ? array : (0, _ndarrayPack2.default)(array);
		
		  if (array.shape.length !== shape.length) throw new Error('Shape mismatch');
		
		  var rank = shape.length;
		  if (rank === 1) {
		    var remainder = array.shape[0] % shape[0];
		    var nChunk = Math.floor(array.shape[0] / shape[0]) + !!remainder;
		    var chunks = new Array(nChunk);
		    for (var i = 0; i < nChunk; ++i) {
		      chunks[i] = array.hi(Math.min(i * shape[0] + shape[0], array.shape[0])).lo(i * shape[0]);
		    }
		    return chunks;
		  } else if (rank === 2) {
		    var remainder0 = array.shape[0] % shape[0];
		    var remainder1 = array.shape[1] % shape[1];
		    var nChunk0 = Math.floor(array.shape[0] / shape[0]) + !!remainder0;
		    var nChunk1 = Math.floor(array.shape[1] / shape[1]) + !!remainder1;
		    var chunks = new Array(nChunk0);
		    for (var i = 0; i < nChunk0; ++i) {
		      chunks[i] = new Array(nChunk1);
		      for (var j = 0; j < nChunk1; ++j) {
		        chunks[i][j] = array.hi(Math.min(i * shape[0] + shape[0], array.shape[0]), Math.min(j * shape[1] + shape[1], array.shape[1])).lo(i * shape[0], j * shape[1]);
		      }
		    }
		    return chunks;
		  } else {
		    throw new Error('Unsupported rank');
		  }
		}
		
		exports.chunk = chunk;
	
	/***/ },
	/* 1 */
	/***/ function(module, exports, __webpack_require__) {
	
		"use strict"
		
		var ndarray = __webpack_require__(2)
		var do_convert = __webpack_require__(5)
		
		module.exports = function convert(arr, result) {
		  var shape = [], c = arr, sz = 1
		  while(c instanceof Array) {
		    shape.push(c.length)
		    sz *= c.length
		    c = c[0]
		  }
		  if(shape.length === 0) {
		    return ndarray()
		  }
		  if(!result) {
		    result = ndarray(new Float64Array(sz), shape)
		  }
		  do_convert(result, arr)
		  return result
		}
	
	
	/***/ },
	/* 2 */
	/***/ function(module, exports, __webpack_require__) {
	
		var iota = __webpack_require__(3)
		var isBuffer = __webpack_require__(4)
		
		var hasTypedArrays  = ((typeof Float64Array) !== "undefined")
		
		function compare1st(a, b) {
		  return a[0] - b[0]
		}
		
		function order() {
		  var stride = this.stride
		  var terms = new Array(stride.length)
		  var i
		  for(i=0; i<terms.length; ++i) {
		    terms[i] = [Math.abs(stride[i]), i]
		  }
		  terms.sort(compare1st)
		  var result = new Array(terms.length)
		  for(i=0; i<result.length; ++i) {
		    result[i] = terms[i][1]
		  }
		  return result
		}
		
		function compileConstructor(dtype, dimension) {
		  var className = ["View", dimension, "d", dtype].join("")
		  if(dimension < 0) {
		    className = "View_Nil" + dtype
		  }
		  var useGetters = (dtype === "generic")
		
		  if(dimension === -1) {
		    //Special case for trivial arrays
		    var code =
		      "function "+className+"(a){this.data=a;};\
		var proto="+className+".prototype;\
		proto.dtype='"+dtype+"';\
		proto.index=function(){return -1};\
		proto.size=0;\
		proto.dimension=-1;\
		proto.shape=proto.stride=proto.order=[];\
		proto.lo=proto.hi=proto.transpose=proto.step=\
		function(){return new "+className+"(this.data);};\
		proto.get=proto.set=function(){};\
		proto.pick=function(){return null};\
		return function construct_"+className+"(a){return new "+className+"(a);}"
		    var procedure = new Function(code)
		    return procedure()
		  } else if(dimension === 0) {
		    //Special case for 0d arrays
		    var code =
		      "function "+className+"(a,d) {\
		this.data = a;\
		this.offset = d\
		};\
		var proto="+className+".prototype;\
		proto.dtype='"+dtype+"';\
		proto.index=function(){return this.offset};\
		proto.dimension=0;\
		proto.size=1;\
		proto.shape=\
		proto.stride=\
		proto.order=[];\
		proto.lo=\
		proto.hi=\
		proto.transpose=\
		proto.step=function "+className+"_copy() {\
		return new "+className+"(this.data,this.offset)\
		};\
		proto.pick=function "+className+"_pick(){\
		return TrivialArray(this.data);\
		};\
		proto.valueOf=proto.get=function "+className+"_get(){\
		return "+(useGetters ? "this.data.get(this.offset)" : "this.data[this.offset]")+
		"};\
		proto.set=function "+className+"_set(v){\
		return "+(useGetters ? "this.data.set(this.offset,v)" : "this.data[this.offset]=v")+"\
		};\
		return function construct_"+className+"(a,b,c,d){return new "+className+"(a,d)}"
		    var procedure = new Function("TrivialArray", code)
		    return procedure(CACHED_CONSTRUCTORS[dtype][0])
		  }
		
		  var code = ["'use strict'"]
		
		  //Create constructor for view
		  var indices = iota(dimension)
		  var args = indices.map(function(i) { return "i"+i })
		  var index_str = "this.offset+" + indices.map(function(i) {
		        return "this.stride[" + i + "]*i" + i
		      }).join("+")
		  var shapeArg = indices.map(function(i) {
		      return "b"+i
		    }).join(",")
		  var strideArg = indices.map(function(i) {
		      return "c"+i
		    }).join(",")
		  code.push(
		    "function "+className+"(a," + shapeArg + "," + strideArg + ",d){this.data=a",
		      "this.shape=[" + shapeArg + "]",
		      "this.stride=[" + strideArg + "]",
		      "this.offset=d|0}",
		    "var proto="+className+".prototype",
		    "proto.dtype='"+dtype+"'",
		    "proto.dimension="+dimension)
		
		  //view.size:
		  code.push("Object.defineProperty(proto,'size',{get:function "+className+"_size(){\
		return "+indices.map(function(i) { return "this.shape["+i+"]" }).join("*"),
		"}})")
		
		  //view.order:
		  if(dimension === 1) {
		    code.push("proto.order=[0]")
		  } else {
		    code.push("Object.defineProperty(proto,'order',{get:")
		    if(dimension < 4) {
		      code.push("function "+className+"_order(){")
		      if(dimension === 2) {
		        code.push("return (Math.abs(this.stride[0])>Math.abs(this.stride[1]))?[1,0]:[0,1]}})")
		      } else if(dimension === 3) {
		        code.push(
		"var s0=Math.abs(this.stride[0]),s1=Math.abs(this.stride[1]),s2=Math.abs(this.stride[2]);\
		if(s0>s1){\
		if(s1>s2){\
		return [2,1,0];\
		}else if(s0>s2){\
		return [1,2,0];\
		}else{\
		return [1,0,2];\
		}\
		}else if(s0>s2){\
		return [2,0,1];\
		}else if(s2>s1){\
		return [0,1,2];\
		}else{\
		return [0,2,1];\
		}}})")
		      }
		    } else {
		      code.push("ORDER})")
		    }
		  }
		
		  //view.set(i0, ..., v):
		  code.push(
		"proto.set=function "+className+"_set("+args.join(",")+",v){")
		  if(useGetters) {
		    code.push("return this.data.set("+index_str+",v)}")
		  } else {
		    code.push("return this.data["+index_str+"]=v}")
		  }
		
		  //view.get(i0, ...):
		  code.push("proto.get=function "+className+"_get("+args.join(",")+"){")
		  if(useGetters) {
		    code.push("return this.data.get("+index_str+")}")
		  } else {
		    code.push("return this.data["+index_str+"]}")
		  }
		
		  //view.index:
		  code.push(
		    "proto.index=function "+className+"_index(", args.join(), "){return "+index_str+"}")
		
		  //view.hi():
		  code.push("proto.hi=function "+className+"_hi("+args.join(",")+"){return new "+className+"(this.data,"+
		    indices.map(function(i) {
		      return ["(typeof i",i,"!=='number'||i",i,"<0)?this.shape[", i, "]:i", i,"|0"].join("")
		    }).join(",")+","+
		    indices.map(function(i) {
		      return "this.stride["+i + "]"
		    }).join(",")+",this.offset)}")
		
		  //view.lo():
		  var a_vars = indices.map(function(i) { return "a"+i+"=this.shape["+i+"]" })
		  var c_vars = indices.map(function(i) { return "c"+i+"=this.stride["+i+"]" })
		  code.push("proto.lo=function "+className+"_lo("+args.join(",")+"){var b=this.offset,d=0,"+a_vars.join(",")+","+c_vars.join(","))
		  for(var i=0; i<dimension; ++i) {
		    code.push(
		"if(typeof i"+i+"==='number'&&i"+i+">=0){\
		d=i"+i+"|0;\
		b+=c"+i+"*d;\
		a"+i+"-=d}")
		  }
		  code.push("return new "+className+"(this.data,"+
		    indices.map(function(i) {
		      return "a"+i
		    }).join(",")+","+
		    indices.map(function(i) {
		      return "c"+i
		    }).join(",")+",b)}")
		
		  //view.step():
		  code.push("proto.step=function "+className+"_step("+args.join(",")+"){var "+
		    indices.map(function(i) {
		      return "a"+i+"=this.shape["+i+"]"
		    }).join(",")+","+
		    indices.map(function(i) {
		      return "b"+i+"=this.stride["+i+"]"
		    }).join(",")+",c=this.offset,d=0,ceil=Math.ceil")
		  for(var i=0; i<dimension; ++i) {
		    code.push(
		"if(typeof i"+i+"==='number'){\
		d=i"+i+"|0;\
		if(d<0){\
		c+=b"+i+"*(a"+i+"-1);\
		a"+i+"=ceil(-a"+i+"/d)\
		}else{\
		a"+i+"=ceil(a"+i+"/d)\
		}\
		b"+i+"*=d\
		}")
		  }
		  code.push("return new "+className+"(this.data,"+
		    indices.map(function(i) {
		      return "a" + i
		    }).join(",")+","+
		    indices.map(function(i) {
		      return "b" + i
		    }).join(",")+",c)}")
		
		  //view.transpose():
		  var tShape = new Array(dimension)
		  var tStride = new Array(dimension)
		  for(var i=0; i<dimension; ++i) {
		    tShape[i] = "a[i"+i+"]"
		    tStride[i] = "b[i"+i+"]"
		  }
		  code.push("proto.transpose=function "+className+"_transpose("+args+"){"+
		    args.map(function(n,idx) { return n + "=(" + n + "===undefined?" + idx + ":" + n + "|0)"}).join(";"),
		    "var a=this.shape,b=this.stride;return new "+className+"(this.data,"+tShape.join(",")+","+tStride.join(",")+",this.offset)}")
		
		  //view.pick():
		  code.push("proto.pick=function "+className+"_pick("+args+"){var a=[],b=[],c=this.offset")
		  for(var i=0; i<dimension; ++i) {
		    code.push("if(typeof i"+i+"==='number'&&i"+i+">=0){c=(c+this.stride["+i+"]*i"+i+")|0}else{a.push(this.shape["+i+"]);b.push(this.stride["+i+"])}")
		  }
		  code.push("var ctor=CTOR_LIST[a.length+1];return ctor(this.data,a,b,c)}")
		
		  //Add return statement
		  code.push("return function construct_"+className+"(data,shape,stride,offset){return new "+className+"(data,"+
		    indices.map(function(i) {
		      return "shape["+i+"]"
		    }).join(",")+","+
		    indices.map(function(i) {
		      return "stride["+i+"]"
		    }).join(",")+",offset)}")
		
		  //Compile procedure
		  var procedure = new Function("CTOR_LIST", "ORDER", code.join("\n"))
		  return procedure(CACHED_CONSTRUCTORS[dtype], order)
		}
		
		function arrayDType(data) {
		  if(isBuffer(data)) {
		    return "buffer"
		  }
		  if(hasTypedArrays) {
		    switch(Object.prototype.toString.call(data)) {
		      case "[object Float64Array]":
		        return "float64"
		      case "[object Float32Array]":
		        return "float32"
		      case "[object Int8Array]":
		        return "int8"
		      case "[object Int16Array]":
		        return "int16"
		      case "[object Int32Array]":
		        return "int32"
		      case "[object Uint8Array]":
		        return "uint8"
		      case "[object Uint16Array]":
		        return "uint16"
		      case "[object Uint32Array]":
		        return "uint32"
		      case "[object Uint8ClampedArray]":
		        return "uint8_clamped"
		    }
		  }
		  if(Array.isArray(data)) {
		    return "array"
		  }
		  return "generic"
		}
		
		var CACHED_CONSTRUCTORS = {
		  "float32":[],
		  "float64":[],
		  "int8":[],
		  "int16":[],
		  "int32":[],
		  "uint8":[],
		  "uint16":[],
		  "uint32":[],
		  "array":[],
		  "uint8_clamped":[],
		  "buffer":[],
		  "generic":[]
		}
		
		;(function() {
		  for(var id in CACHED_CONSTRUCTORS) {
		    CACHED_CONSTRUCTORS[id].push(compileConstructor(id, -1))
		  }
		});
		
		function wrappedNDArrayCtor(data, shape, stride, offset) {
		  if(data === undefined) {
		    var ctor = CACHED_CONSTRUCTORS.array[0]
		    return ctor([])
		  } else if(typeof data === "number") {
		    data = [data]
		  }
		  if(shape === undefined) {
		    shape = [ data.length ]
		  }
		  var d = shape.length
		  if(stride === undefined) {
		    stride = new Array(d)
		    for(var i=d-1, sz=1; i>=0; --i) {
		      stride[i] = sz
		      sz *= shape[i]
		    }
		  }
		  if(offset === undefined) {
		    offset = 0
		    for(var i=0; i<d; ++i) {
		      if(stride[i] < 0) {
		        offset -= (shape[i]-1)*stride[i]
		      }
		    }
		  }
		  var dtype = arrayDType(data)
		  var ctor_list = CACHED_CONSTRUCTORS[dtype]
		  while(ctor_list.length <= d+1) {
		    ctor_list.push(compileConstructor(dtype, ctor_list.length-1))
		  }
		  var ctor = ctor_list[d+1]
		  return ctor(data, shape, stride, offset)
		}
		
		module.exports = wrappedNDArrayCtor
	
	
	/***/ },
	/* 3 */
	/***/ function(module, exports) {
	
		"use strict"
		
		function iota(n) {
		  var result = new Array(n)
		  for(var i=0; i<n; ++i) {
		    result[i] = i
		  }
		  return result
		}
		
		module.exports = iota
	
	/***/ },
	/* 4 */
	/***/ function(module, exports) {
	
		/**
		 * Determine if an object is Buffer
		 *
		 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
		 * License:  MIT
		 *
		 * `npm install is-buffer`
		 */
		
		module.exports = function (obj) {
		  return !!(obj != null &&
		    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
		      (obj.constructor &&
		      typeof obj.constructor.isBuffer === 'function' &&
		      obj.constructor.isBuffer(obj))
		    ))
		}
	
	
	/***/ },
	/* 5 */
	/***/ function(module, exports, __webpack_require__) {
	
		module.exports=__webpack_require__(6)({"args":["array","scalar","index"],"pre":{"body":"{}","args":[],"thisVars":[],"localVars":[]},"body":{"body":"{\nvar _inline_1_v=_inline_1_arg1_,_inline_1_i\nfor(_inline_1_i=0;_inline_1_i<_inline_1_arg2_.length-1;++_inline_1_i) {\n_inline_1_v=_inline_1_v[_inline_1_arg2_[_inline_1_i]]\n}\n_inline_1_arg0_=_inline_1_v[_inline_1_arg2_[_inline_1_arg2_.length-1]]\n}","args":[{"name":"_inline_1_arg0_","lvalue":true,"rvalue":false,"count":1},{"name":"_inline_1_arg1_","lvalue":false,"rvalue":true,"count":1},{"name":"_inline_1_arg2_","lvalue":false,"rvalue":true,"count":4}],"thisVars":[],"localVars":["_inline_1_i","_inline_1_v"]},"post":{"body":"{}","args":[],"thisVars":[],"localVars":[]},"funcName":"convert","blockSize":64})
	
	
	/***/ },
	/* 6 */
	/***/ function(module, exports, __webpack_require__) {
	
		"use strict"
		
		var createThunk = __webpack_require__(7)
		
		function Procedure() {
		  this.argTypes = []
		  this.shimArgs = []
		  this.arrayArgs = []
		  this.arrayBlockIndices = []
		  this.scalarArgs = []
		  this.offsetArgs = []
		  this.offsetArgIndex = []
		  this.indexArgs = []
		  this.shapeArgs = []
		  this.funcName = ""
		  this.pre = null
		  this.body = null
		  this.post = null
		  this.debug = false
		}
		
		function compileCwise(user_args) {
		  //Create procedure
		  var proc = new Procedure()
		  
		  //Parse blocks
		  proc.pre    = user_args.pre
		  proc.body   = user_args.body
		  proc.post   = user_args.post
		
		  //Parse arguments
		  var proc_args = user_args.args.slice(0)
		  proc.argTypes = proc_args
		  for(var i=0; i<proc_args.length; ++i) {
		    var arg_type = proc_args[i]
		    if(arg_type === "array" || (typeof arg_type === "object" && arg_type.blockIndices)) {
		      proc.argTypes[i] = "array"
		      proc.arrayArgs.push(i)
		      proc.arrayBlockIndices.push(arg_type.blockIndices ? arg_type.blockIndices : 0)
		      proc.shimArgs.push("array" + i)
		      if(i < proc.pre.args.length && proc.pre.args[i].count>0) {
		        throw new Error("cwise: pre() block may not reference array args")
		      }
		      if(i < proc.post.args.length && proc.post.args[i].count>0) {
		        throw new Error("cwise: post() block may not reference array args")
		      }
		    } else if(arg_type === "scalar") {
		      proc.scalarArgs.push(i)
		      proc.shimArgs.push("scalar" + i)
		    } else if(arg_type === "index") {
		      proc.indexArgs.push(i)
		      if(i < proc.pre.args.length && proc.pre.args[i].count > 0) {
		        throw new Error("cwise: pre() block may not reference array index")
		      }
		      if(i < proc.body.args.length && proc.body.args[i].lvalue) {
		        throw new Error("cwise: body() block may not write to array index")
		      }
		      if(i < proc.post.args.length && proc.post.args[i].count > 0) {
		        throw new Error("cwise: post() block may not reference array index")
		      }
		    } else if(arg_type === "shape") {
		      proc.shapeArgs.push(i)
		      if(i < proc.pre.args.length && proc.pre.args[i].lvalue) {
		        throw new Error("cwise: pre() block may not write to array shape")
		      }
		      if(i < proc.body.args.length && proc.body.args[i].lvalue) {
		        throw new Error("cwise: body() block may not write to array shape")
		      }
		      if(i < proc.post.args.length && proc.post.args[i].lvalue) {
		        throw new Error("cwise: post() block may not write to array shape")
		      }
		    } else if(typeof arg_type === "object" && arg_type.offset) {
		      proc.argTypes[i] = "offset"
		      proc.offsetArgs.push({ array: arg_type.array, offset:arg_type.offset })
		      proc.offsetArgIndex.push(i)
		    } else {
		      throw new Error("cwise: Unknown argument type " + proc_args[i])
		    }
		  }
		  
		  //Make sure at least one array argument was specified
		  if(proc.arrayArgs.length <= 0) {
		    throw new Error("cwise: No array arguments specified")
		  }
		  
		  //Make sure arguments are correct
		  if(proc.pre.args.length > proc_args.length) {
		    throw new Error("cwise: Too many arguments in pre() block")
		  }
		  if(proc.body.args.length > proc_args.length) {
		    throw new Error("cwise: Too many arguments in body() block")
		  }
		  if(proc.post.args.length > proc_args.length) {
		    throw new Error("cwise: Too many arguments in post() block")
		  }
		
		  //Check debug flag
		  proc.debug = !!user_args.printCode || !!user_args.debug
		  
		  //Retrieve name
		  proc.funcName = user_args.funcName || "cwise"
		  
		  //Read in block size
		  proc.blockSize = user_args.blockSize || 64
		
		  return createThunk(proc)
		}
		
		module.exports = compileCwise
	
	
	/***/ },
	/* 7 */
	/***/ function(module, exports, __webpack_require__) {
	
		"use strict"
		
		// The function below is called when constructing a cwise function object, and does the following:
		// A function object is constructed which accepts as argument a compilation function and returns another function.
		// It is this other function that is eventually returned by createThunk, and this function is the one that actually
		// checks whether a certain pattern of arguments has already been used before and compiles new loops as needed.
		// The compilation passed to the first function object is used for compiling new functions.
		// Once this function object is created, it is called with compile as argument, where the first argument of compile
		// is bound to "proc" (essentially containing a preprocessed version of the user arguments to cwise).
		// So createThunk roughly works like this:
		// function createThunk(proc) {
		//   var thunk = function(compileBound) {
		//     var CACHED = {}
		//     return function(arrays and scalars) {
		//       if (dtype and order of arrays in CACHED) {
		//         var func = CACHED[dtype and order of arrays]
		//       } else {
		//         var func = CACHED[dtype and order of arrays] = compileBound(dtype and order of arrays)
		//       }
		//       return func(arrays and scalars)
		//     }
		//   }
		//   return thunk(compile.bind1(proc))
		// }
		
		var compile = __webpack_require__(8)
		
		function createThunk(proc) {
		  var code = ["'use strict'", "var CACHED={}"]
		  var vars = []
		  var thunkName = proc.funcName + "_cwise_thunk"
		  
		  //Build thunk
		  code.push(["return function ", thunkName, "(", proc.shimArgs.join(","), "){"].join(""))
		  var typesig = []
		  var string_typesig = []
		  var proc_args = [["array",proc.arrayArgs[0],".shape.slice(", // Slice shape so that we only retain the shape over which we iterate (which gets passed to the cwise operator as SS).
		                    Math.max(0,proc.arrayBlockIndices[0]),proc.arrayBlockIndices[0]<0?(","+proc.arrayBlockIndices[0]+")"):")"].join("")]
		  var shapeLengthConditions = [], shapeConditions = []
		  // Process array arguments
		  for(var i=0; i<proc.arrayArgs.length; ++i) {
		    var j = proc.arrayArgs[i]
		    vars.push(["t", j, "=array", j, ".dtype,",
		               "r", j, "=array", j, ".order"].join(""))
		    typesig.push("t" + j)
		    typesig.push("r" + j)
		    string_typesig.push("t"+j)
		    string_typesig.push("r"+j+".join()")
		    proc_args.push("array" + j + ".data")
		    proc_args.push("array" + j + ".stride")
		    proc_args.push("array" + j + ".offset|0")
		    if (i>0) { // Gather conditions to check for shape equality (ignoring block indices)
		      shapeLengthConditions.push("array" + proc.arrayArgs[0] + ".shape.length===array" + j + ".shape.length+" + (Math.abs(proc.arrayBlockIndices[0])-Math.abs(proc.arrayBlockIndices[i])))
		      shapeConditions.push("array" + proc.arrayArgs[0] + ".shape[shapeIndex+" + Math.max(0,proc.arrayBlockIndices[0]) + "]===array" + j + ".shape[shapeIndex+" + Math.max(0,proc.arrayBlockIndices[i]) + "]")
		    }
		  }
		  // Check for shape equality
		  if (proc.arrayArgs.length > 1) {
		    code.push("if (!(" + shapeLengthConditions.join(" && ") + ")) throw new Error('cwise: Arrays do not all have the same dimensionality!')")
		    code.push("for(var shapeIndex=array" + proc.arrayArgs[0] + ".shape.length-" + Math.abs(proc.arrayBlockIndices[0]) + "; shapeIndex-->0;) {")
		    code.push("if (!(" + shapeConditions.join(" && ") + ")) throw new Error('cwise: Arrays do not all have the same shape!')")
		    code.push("}")
		  }
		  // Process scalar arguments
		  for(var i=0; i<proc.scalarArgs.length; ++i) {
		    proc_args.push("scalar" + proc.scalarArgs[i])
		  }
		  // Check for cached function (and if not present, generate it)
		  vars.push(["type=[", string_typesig.join(","), "].join()"].join(""))
		  vars.push("proc=CACHED[type]")
		  code.push("var " + vars.join(","))
		  
		  code.push(["if(!proc){",
		             "CACHED[type]=proc=compile([", typesig.join(","), "])}",
		             "return proc(", proc_args.join(","), ")}"].join(""))
		
		  if(proc.debug) {
		    console.log("-----Generated thunk:\n" + code.join("\n") + "\n----------")
		  }
		  
		  //Compile thunk
		  var thunk = new Function("compile", code.join("\n"))
		  return thunk(compile.bind(undefined, proc))
		}
		
		module.exports = createThunk
	
	
	/***/ },
	/* 8 */
	/***/ function(module, exports, __webpack_require__) {
	
		"use strict"
		
		var uniq = __webpack_require__(9)
		
		// This function generates very simple loops analogous to how you typically traverse arrays (the outermost loop corresponds to the slowest changing index, the innermost loop to the fastest changing index)
		// TODO: If two arrays have the same strides (and offsets) there is potential for decreasing the number of "pointers" and related variables. The drawback is that the type signature would become more specific and that there would thus be less potential for caching, but it might still be worth it, especially when dealing with large numbers of arguments.
		function innerFill(order, proc, body) {
		  var dimension = order.length
		    , nargs = proc.arrayArgs.length
		    , has_index = proc.indexArgs.length>0
		    , code = []
		    , vars = []
		    , idx=0, pidx=0, i, j
		  for(i=0; i<dimension; ++i) { // Iteration variables
		    vars.push(["i",i,"=0"].join(""))
		  }
		  //Compute scan deltas
		  for(j=0; j<nargs; ++j) {
		    for(i=0; i<dimension; ++i) {
		      pidx = idx
		      idx = order[i]
		      if(i === 0) { // The innermost/fastest dimension's delta is simply its stride
		        vars.push(["d",j,"s",i,"=t",j,"p",idx].join(""))
		      } else { // For other dimensions the delta is basically the stride minus something which essentially "rewinds" the previous (more inner) dimension
		        vars.push(["d",j,"s",i,"=(t",j,"p",idx,"-s",pidx,"*t",j,"p",pidx,")"].join(""))
		      }
		    }
		  }
		  code.push("var " + vars.join(","))
		  //Scan loop
		  for(i=dimension-1; i>=0; --i) { // Start at largest stride and work your way inwards
		    idx = order[i]
		    code.push(["for(i",i,"=0;i",i,"<s",idx,";++i",i,"){"].join(""))
		  }
		  //Push body of inner loop
		  code.push(body)
		  //Advance scan pointers
		  for(i=0; i<dimension; ++i) {
		    pidx = idx
		    idx = order[i]
		    for(j=0; j<nargs; ++j) {
		      code.push(["p",j,"+=d",j,"s",i].join(""))
		    }
		    if(has_index) {
		      if(i > 0) {
		        code.push(["index[",pidx,"]-=s",pidx].join(""))
		      }
		      code.push(["++index[",idx,"]"].join(""))
		    }
		    code.push("}")
		  }
		  return code.join("\n")
		}
		
		// Generate "outer" loops that loop over blocks of data, applying "inner" loops to the blocks by manipulating the local variables in such a way that the inner loop only "sees" the current block.
		// TODO: If this is used, then the previous declaration (done by generateCwiseOp) of s* is essentially unnecessary.
		//       I believe the s* are not used elsewhere (in particular, I don't think they're used in the pre/post parts and "shape" is defined independently), so it would be possible to make defining the s* dependent on what loop method is being used.
		function outerFill(matched, order, proc, body) {
		  var dimension = order.length
		    , nargs = proc.arrayArgs.length
		    , blockSize = proc.blockSize
		    , has_index = proc.indexArgs.length > 0
		    , code = []
		  for(var i=0; i<nargs; ++i) {
		    code.push(["var offset",i,"=p",i].join(""))
		  }
		  //Generate loops for unmatched dimensions
		  // The order in which these dimensions are traversed is fairly arbitrary (from small stride to large stride, for the first argument)
		  // TODO: It would be nice if the order in which these loops are placed would also be somehow "optimal" (at the very least we should check that it really doesn't hurt us if they're not).
		  for(var i=matched; i<dimension; ++i) {
		    code.push(["for(var j"+i+"=SS[", order[i], "]|0;j", i, ">0;){"].join("")) // Iterate back to front
		    code.push(["if(j",i,"<",blockSize,"){"].join("")) // Either decrease j by blockSize (s = blockSize), or set it to zero (after setting s = j).
		    code.push(["s",order[i],"=j",i].join(""))
		    code.push(["j",i,"=0"].join(""))
		    code.push(["}else{s",order[i],"=",blockSize].join(""))
		    code.push(["j",i,"-=",blockSize,"}"].join(""))
		    if(has_index) {
		      code.push(["index[",order[i],"]=j",i].join(""))
		    }
		  }
		  for(var i=0; i<nargs; ++i) {
		    var indexStr = ["offset"+i]
		    for(var j=matched; j<dimension; ++j) {
		      indexStr.push(["j",j,"*t",i,"p",order[j]].join(""))
		    }
		    code.push(["p",i,"=(",indexStr.join("+"),")"].join(""))
		  }
		  code.push(innerFill(order, proc, body))
		  for(var i=matched; i<dimension; ++i) {
		    code.push("}")
		  }
		  return code.join("\n")
		}
		
		//Count the number of compatible inner orders
		// This is the length of the longest common prefix of the arrays in orders.
		// Each array in orders lists the dimensions of the correspond ndarray in order of increasing stride.
		// This is thus the maximum number of dimensions that can be efficiently traversed by simple nested loops for all arrays.
		function countMatches(orders) {
		  var matched = 0, dimension = orders[0].length
		  while(matched < dimension) {
		    for(var j=1; j<orders.length; ++j) {
		      if(orders[j][matched] !== orders[0][matched]) {
		        return matched
		      }
		    }
		    ++matched
		  }
		  return matched
		}
		
		//Processes a block according to the given data types
		// Replaces variable names by different ones, either "local" ones (that are then ferried in and out of the given array) or ones matching the arguments that the function performing the ultimate loop will accept.
		function processBlock(block, proc, dtypes) {
		  var code = block.body
		  var pre = []
		  var post = []
		  for(var i=0; i<block.args.length; ++i) {
		    var carg = block.args[i]
		    if(carg.count <= 0) {
		      continue
		    }
		    var re = new RegExp(carg.name, "g")
		    var ptrStr = ""
		    var arrNum = proc.arrayArgs.indexOf(i)
		    switch(proc.argTypes[i]) {
		      case "offset":
		        var offArgIndex = proc.offsetArgIndex.indexOf(i)
		        var offArg = proc.offsetArgs[offArgIndex]
		        arrNum = offArg.array
		        ptrStr = "+q" + offArgIndex // Adds offset to the "pointer" in the array
		      case "array":
		        ptrStr = "p" + arrNum + ptrStr
		        var localStr = "l" + i
		        var arrStr = "a" + arrNum
		        if (proc.arrayBlockIndices[arrNum] === 0) { // Argument to body is just a single value from this array
		          if(carg.count === 1) { // Argument/array used only once(?)
		            if(dtypes[arrNum] === "generic") {
		              if(carg.lvalue) {
		                pre.push(["var ", localStr, "=", arrStr, ".get(", ptrStr, ")"].join("")) // Is this necessary if the argument is ONLY used as an lvalue? (keep in mind that we can have a += something, so we would actually need to check carg.rvalue)
		                code = code.replace(re, localStr)
		                post.push([arrStr, ".set(", ptrStr, ",", localStr,")"].join(""))
		              } else {
		                code = code.replace(re, [arrStr, ".get(", ptrStr, ")"].join(""))
		              }
		            } else {
		              code = code.replace(re, [arrStr, "[", ptrStr, "]"].join(""))
		            }
		          } else if(dtypes[arrNum] === "generic") {
		            pre.push(["var ", localStr, "=", arrStr, ".get(", ptrStr, ")"].join("")) // TODO: Could we optimize by checking for carg.rvalue?
		            code = code.replace(re, localStr)
		            if(carg.lvalue) {
		              post.push([arrStr, ".set(", ptrStr, ",", localStr,")"].join(""))
		            }
		          } else {
		            pre.push(["var ", localStr, "=", arrStr, "[", ptrStr, "]"].join("")) // TODO: Could we optimize by checking for carg.rvalue?
		            code = code.replace(re, localStr)
		            if(carg.lvalue) {
		              post.push([arrStr, "[", ptrStr, "]=", localStr].join(""))
		            }
		          }
		        } else { // Argument to body is a "block"
		          var reStrArr = [carg.name], ptrStrArr = [ptrStr]
		          for(var j=0; j<Math.abs(proc.arrayBlockIndices[arrNum]); j++) {
		            reStrArr.push("\\s*\\[([^\\]]+)\\]")
		            ptrStrArr.push("$" + (j+1) + "*t" + arrNum + "b" + j) // Matched index times stride
		          }
		          re = new RegExp(reStrArr.join(""), "g")
		          ptrStr = ptrStrArr.join("+")
		          if(dtypes[arrNum] === "generic") {
		            /*if(carg.lvalue) {
		              pre.push(["var ", localStr, "=", arrStr, ".get(", ptrStr, ")"].join("")) // Is this necessary if the argument is ONLY used as an lvalue? (keep in mind that we can have a += something, so we would actually need to check carg.rvalue)
		              code = code.replace(re, localStr)
		              post.push([arrStr, ".set(", ptrStr, ",", localStr,")"].join(""))
		            } else {
		              code = code.replace(re, [arrStr, ".get(", ptrStr, ")"].join(""))
		            }*/
		            throw new Error("cwise: Generic arrays not supported in combination with blocks!")
		          } else {
		            // This does not produce any local variables, even if variables are used multiple times. It would be possible to do so, but it would complicate things quite a bit.
		            code = code.replace(re, [arrStr, "[", ptrStr, "]"].join(""))
		          }
		        }
		      break
		      case "scalar":
		        code = code.replace(re, "Y" + proc.scalarArgs.indexOf(i))
		      break
		      case "index":
		        code = code.replace(re, "index")
		      break
		      case "shape":
		        code = code.replace(re, "shape")
		      break
		    }
		  }
		  return [pre.join("\n"), code, post.join("\n")].join("\n").trim()
		}
		
		function typeSummary(dtypes) {
		  var summary = new Array(dtypes.length)
		  var allEqual = true
		  for(var i=0; i<dtypes.length; ++i) {
		    var t = dtypes[i]
		    var digits = t.match(/\d+/)
		    if(!digits) {
		      digits = ""
		    } else {
		      digits = digits[0]
		    }
		    if(t.charAt(0) === 0) {
		      summary[i] = "u" + t.charAt(1) + digits
		    } else {
		      summary[i] = t.charAt(0) + digits
		    }
		    if(i > 0) {
		      allEqual = allEqual && summary[i] === summary[i-1]
		    }
		  }
		  if(allEqual) {
		    return summary[0]
		  }
		  return summary.join("")
		}
		
		//Generates a cwise operator
		function generateCWiseOp(proc, typesig) {
		
		  //Compute dimension
		  // Arrays get put first in typesig, and there are two entries per array (dtype and order), so this gets the number of dimensions in the first array arg.
		  var dimension = (typesig[1].length - Math.abs(proc.arrayBlockIndices[0]))|0
		  var orders = new Array(proc.arrayArgs.length)
		  var dtypes = new Array(proc.arrayArgs.length)
		  for(var i=0; i<proc.arrayArgs.length; ++i) {
		    dtypes[i] = typesig[2*i]
		    orders[i] = typesig[2*i+1]
		  }
		  
		  //Determine where block and loop indices start and end
		  var blockBegin = [], blockEnd = [] // These indices are exposed as blocks
		  var loopBegin = [], loopEnd = [] // These indices are iterated over
		  var loopOrders = [] // orders restricted to the loop indices
		  for(var i=0; i<proc.arrayArgs.length; ++i) {
		    if (proc.arrayBlockIndices[i]<0) {
		      loopBegin.push(0)
		      loopEnd.push(dimension)
		      blockBegin.push(dimension)
		      blockEnd.push(dimension+proc.arrayBlockIndices[i])
		    } else {
		      loopBegin.push(proc.arrayBlockIndices[i]) // Non-negative
		      loopEnd.push(proc.arrayBlockIndices[i]+dimension)
		      blockBegin.push(0)
		      blockEnd.push(proc.arrayBlockIndices[i])
		    }
		    var newOrder = []
		    for(var j=0; j<orders[i].length; j++) {
		      if (loopBegin[i]<=orders[i][j] && orders[i][j]<loopEnd[i]) {
		        newOrder.push(orders[i][j]-loopBegin[i]) // If this is a loop index, put it in newOrder, subtracting loopBegin, to make sure that all loopOrders are using a common set of indices.
		      }
		    }
		    loopOrders.push(newOrder)
		  }
		
		  //First create arguments for procedure
		  var arglist = ["SS"] // SS is the overall shape over which we iterate
		  var code = ["'use strict'"]
		  var vars = []
		  
		  for(var j=0; j<dimension; ++j) {
		    vars.push(["s", j, "=SS[", j, "]"].join("")) // The limits for each dimension.
		  }
		  for(var i=0; i<proc.arrayArgs.length; ++i) {
		    arglist.push("a"+i) // Actual data array
		    arglist.push("t"+i) // Strides
		    arglist.push("p"+i) // Offset in the array at which the data starts (also used for iterating over the data)
		    
		    for(var j=0; j<dimension; ++j) { // Unpack the strides into vars for looping
		      vars.push(["t",i,"p",j,"=t",i,"[",loopBegin[i]+j,"]"].join(""))
		    }
		    
		    for(var j=0; j<Math.abs(proc.arrayBlockIndices[i]); ++j) { // Unpack the strides into vars for block iteration
		      vars.push(["t",i,"b",j,"=t",i,"[",blockBegin[i]+j,"]"].join(""))
		    }
		  }
		  for(var i=0; i<proc.scalarArgs.length; ++i) {
		    arglist.push("Y" + i)
		  }
		  if(proc.shapeArgs.length > 0) {
		    vars.push("shape=SS.slice(0)") // Makes the shape over which we iterate available to the user defined functions (so you can use width/height for example)
		  }
		  if(proc.indexArgs.length > 0) {
		    // Prepare an array to keep track of the (logical) indices, initialized to dimension zeroes.
		    var zeros = new Array(dimension)
		    for(var i=0; i<dimension; ++i) {
		      zeros[i] = "0"
		    }
		    vars.push(["index=[", zeros.join(","), "]"].join(""))
		  }
		  for(var i=0; i<proc.offsetArgs.length; ++i) { // Offset arguments used for stencil operations
		    var off_arg = proc.offsetArgs[i]
		    var init_string = []
		    for(var j=0; j<off_arg.offset.length; ++j) {
		      if(off_arg.offset[j] === 0) {
		        continue
		      } else if(off_arg.offset[j] === 1) {
		        init_string.push(["t", off_arg.array, "p", j].join(""))      
		      } else {
		        init_string.push([off_arg.offset[j], "*t", off_arg.array, "p", j].join(""))
		      }
		    }
		    if(init_string.length === 0) {
		      vars.push("q" + i + "=0")
		    } else {
		      vars.push(["q", i, "=", init_string.join("+")].join(""))
		    }
		  }
		
		  //Prepare this variables
		  var thisVars = uniq([].concat(proc.pre.thisVars)
		                      .concat(proc.body.thisVars)
		                      .concat(proc.post.thisVars))
		  vars = vars.concat(thisVars)
		  code.push("var " + vars.join(","))
		  for(var i=0; i<proc.arrayArgs.length; ++i) {
		    code.push("p"+i+"|=0")
		  }
		  
		  //Inline prelude
		  if(proc.pre.body.length > 3) {
		    code.push(processBlock(proc.pre, proc, dtypes))
		  }
		
		  //Process body
		  var body = processBlock(proc.body, proc, dtypes)
		  var matched = countMatches(loopOrders)
		  if(matched < dimension) {
		    code.push(outerFill(matched, loopOrders[0], proc, body)) // TODO: Rather than passing loopOrders[0], it might be interesting to look at passing an order that represents the majority of the arguments for example.
		  } else {
		    code.push(innerFill(loopOrders[0], proc, body))
		  }
		
		  //Inline epilog
		  if(proc.post.body.length > 3) {
		    code.push(processBlock(proc.post, proc, dtypes))
		  }
		  
		  if(proc.debug) {
		    console.log("-----Generated cwise routine for ", typesig, ":\n" + code.join("\n") + "\n----------")
		  }
		  
		  var loopName = [(proc.funcName||"unnamed"), "_cwise_loop_", orders[0].join("s"),"m",matched,typeSummary(dtypes)].join("")
		  var f = new Function(["function ",loopName,"(", arglist.join(","),"){", code.join("\n"),"} return ", loopName].join(""))
		  return f()
		}
		module.exports = generateCWiseOp
	
	
	/***/ },
	/* 9 */
	/***/ function(module, exports) {
	
		"use strict"
		
		function unique_pred(list, compare) {
		  var ptr = 1
		    , len = list.length
		    , a=list[0], b=list[0]
		  for(var i=1; i<len; ++i) {
		    b = a
		    a = list[i]
		    if(compare(a, b)) {
		      if(i === ptr) {
		        ptr++
		        continue
		      }
		      list[ptr++] = a
		    }
		  }
		  list.length = ptr
		  return list
		}
		
		function unique_eq(list) {
		  var ptr = 1
		    , len = list.length
		    , a=list[0], b = list[0]
		  for(var i=1; i<len; ++i, b=a) {
		    b = a
		    a = list[i]
		    if(a !== b) {
		      if(i === ptr) {
		        ptr++
		        continue
		      }
		      list[ptr++] = a
		    }
		  }
		  list.length = ptr
		  return list
		}
		
		function unique(list, compare, sorted) {
		  if(list.length === 0) {
		    return list
		  }
		  if(compare) {
		    if(!sorted) {
		      list.sort(compare)
		    }
		    return unique_pred(list, compare)
		  }
		  if(!sorted) {
		    list.sort()
		  }
		  return unique_eq(list)
		}
		
		module.exports = unique
	
	
	/***/ }
	/******/ ])
	});
	;
	//# sourceMappingURL=ndarray-chunk.js.map

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	(function webpackUniversalModuleDefinition(root, factory) {
		if(true)
			module.exports = factory();
		else if(typeof define === 'function' && define.amd)
			define([], factory);
		else if(typeof exports === 'object')
			exports["heatmap"] = factory();
		else
			root["heatmap"] = factory();
	})(this, function() {
	return /******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};
	/******/
	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {
	/******/
	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId])
	/******/ 			return installedModules[moduleId].exports;
	/******/
	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			exports: {},
	/******/ 			id: moduleId,
	/******/ 			loaded: false
	/******/ 		};
	/******/
	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	/******/
	/******/ 		// Flag the module as loaded
	/******/ 		module.loaded = true;
	/******/
	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}
	/******/
	/******/
	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;
	/******/
	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;
	/******/
	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";
	/******/
	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(0);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
		
		var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
		
		Object.defineProperty(exports, "__esModule", {
		  value: true
		});
		exports.heatmap = undefined;
		
		var _ndarray = __webpack_require__(1);
		
		var _ndarray2 = _interopRequireDefault(_ndarray);
		
		var _ndarrayPack = __webpack_require__(4);
		
		var _ndarrayPack2 = _interopRequireDefault(_ndarrayPack);
		
		var _cwise = __webpack_require__(10);
		
		var _cwise2 = _interopRequireDefault(_cwise);
		
		var _d3Array = __webpack_require__(13);
		
		var _d3Interpolate = __webpack_require__(14);
		
		var _d3Color = __webpack_require__(15);
		
		function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
		
		function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
		
		var renderToCanvas = (0, _cwise2.default)({
		  args: ['index', 'array', 'scalar', 'scalar', 'scalar', 'scalar', 'scalar'],
		  body: function body(i, value, imgArray, colors, min, max, imgWidth) {
		    var colorIndex = Math.round((value - min) / (max - min) * (colors.length - 1));
		    var _colors$colorIndex = colors[colorIndex];
		    var r = _colors$colorIndex.r;
		    var g = _colors$colorIndex.g;
		    var b = _colors$colorIndex.b;
		    var a = _colors$colorIndex.a;
		
		    var base = (i[0] * imgWidth + i[1]) * 4;
		    imgArray[base] = r;
		    imgArray[++base] = g;
		    imgArray[++base] = b;
		    imgArray[++base] = a || 255;
		  }
		});
		
		function heatmap() {
		  var data = (0, _ndarray2.default)(new Float64Array([0]), [1, 1]);
		  var colorSteps = 256;
		  var domain = null;
		  var colorRange = ['#000000', '#FFFFFF'];
		
		  function render(_) {
		    var canvas = _ || document.createElement('canvas');
		    canvas.width = data.shape[1];
		    canvas.height = data.shape[0];
		
		    var ctx = canvas.getContext('2d');
		    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		    var imgArray = imgData.data;
		
		    var _ref = domain || (0, _d3Array.extent)(data.data);
		
		    var _ref2 = _slicedToArray(_ref, 2);
		
		    var min = _ref2[0];
		    var max = _ref2[1];
		
		    var colorScale = _d3Interpolate.interpolateLab.apply(undefined, _toConsumableArray(colorRange));
		    var colors = [];
		    for (var i = 0; i < colorSteps; ++i) {
		      colors.push((0, _d3Color.rgb)(colorScale(i / (colorSteps - 1))));
		    }
		    renderToCanvas(data, imgArray, colors, min, max, canvas.width);
		    ctx.putImageData(imgData, 0, 0);
		
		    return canvas;
		  }
		
		  render.data = function (_) {
		    if (!arguments.length) return data;
		
		    // Convert plain JS array into ndarray
		    _ = _.shape ? _ : (0, _ndarrayPack2.default)(_);
		
		    if (_.shape.length !== 2) throw new Error('Invalid rank: ' + _.shape.length);
		    data = _;
		    return render;
		  };
		
		  render.colorSteps = function (_) {
		    return arguments.length ? (colorSteps = _, render) : colorSteps;
		  };
		
		  render.domain = function (_) {
		    return arguments.length ? (domain = _, render) : domain;
		  };
		
		  render.colorRange = function (_) {
		    return arguments.length ? (colorRange = _, render) : colorRange;
		  };
		
		  return render;
		}
		
		exports.heatmap = heatmap;
	
	/***/ },
	/* 1 */
	/***/ function(module, exports, __webpack_require__) {
	
		var iota = __webpack_require__(2)
		var isBuffer = __webpack_require__(3)
		
		var hasTypedArrays  = ((typeof Float64Array) !== "undefined")
		
		function compare1st(a, b) {
		  return a[0] - b[0]
		}
		
		function order() {
		  var stride = this.stride
		  var terms = new Array(stride.length)
		  var i
		  for(i=0; i<terms.length; ++i) {
		    terms[i] = [Math.abs(stride[i]), i]
		  }
		  terms.sort(compare1st)
		  var result = new Array(terms.length)
		  for(i=0; i<result.length; ++i) {
		    result[i] = terms[i][1]
		  }
		  return result
		}
		
		function compileConstructor(dtype, dimension) {
		  var className = ["View", dimension, "d", dtype].join("")
		  if(dimension < 0) {
		    className = "View_Nil" + dtype
		  }
		  var useGetters = (dtype === "generic")
		
		  if(dimension === -1) {
		    //Special case for trivial arrays
		    var code =
		      "function "+className+"(a){this.data=a;};\
		var proto="+className+".prototype;\
		proto.dtype='"+dtype+"';\
		proto.index=function(){return -1};\
		proto.size=0;\
		proto.dimension=-1;\
		proto.shape=proto.stride=proto.order=[];\
		proto.lo=proto.hi=proto.transpose=proto.step=\
		function(){return new "+className+"(this.data);};\
		proto.get=proto.set=function(){};\
		proto.pick=function(){return null};\
		return function construct_"+className+"(a){return new "+className+"(a);}"
		    var procedure = new Function(code)
		    return procedure()
		  } else if(dimension === 0) {
		    //Special case for 0d arrays
		    var code =
		      "function "+className+"(a,d) {\
		this.data = a;\
		this.offset = d\
		};\
		var proto="+className+".prototype;\
		proto.dtype='"+dtype+"';\
		proto.index=function(){return this.offset};\
		proto.dimension=0;\
		proto.size=1;\
		proto.shape=\
		proto.stride=\
		proto.order=[];\
		proto.lo=\
		proto.hi=\
		proto.transpose=\
		proto.step=function "+className+"_copy() {\
		return new "+className+"(this.data,this.offset)\
		};\
		proto.pick=function "+className+"_pick(){\
		return TrivialArray(this.data);\
		};\
		proto.valueOf=proto.get=function "+className+"_get(){\
		return "+(useGetters ? "this.data.get(this.offset)" : "this.data[this.offset]")+
		"};\
		proto.set=function "+className+"_set(v){\
		return "+(useGetters ? "this.data.set(this.offset,v)" : "this.data[this.offset]=v")+"\
		};\
		return function construct_"+className+"(a,b,c,d){return new "+className+"(a,d)}"
		    var procedure = new Function("TrivialArray", code)
		    return procedure(CACHED_CONSTRUCTORS[dtype][0])
		  }
		
		  var code = ["'use strict'"]
		
		  //Create constructor for view
		  var indices = iota(dimension)
		  var args = indices.map(function(i) { return "i"+i })
		  var index_str = "this.offset+" + indices.map(function(i) {
		        return "this.stride[" + i + "]*i" + i
		      }).join("+")
		  var shapeArg = indices.map(function(i) {
		      return "b"+i
		    }).join(",")
		  var strideArg = indices.map(function(i) {
		      return "c"+i
		    }).join(",")
		  code.push(
		    "function "+className+"(a," + shapeArg + "," + strideArg + ",d){this.data=a",
		      "this.shape=[" + shapeArg + "]",
		      "this.stride=[" + strideArg + "]",
		      "this.offset=d|0}",
		    "var proto="+className+".prototype",
		    "proto.dtype='"+dtype+"'",
		    "proto.dimension="+dimension)
		
		  //view.size:
		  code.push("Object.defineProperty(proto,'size',{get:function "+className+"_size(){\
		return "+indices.map(function(i) { return "this.shape["+i+"]" }).join("*"),
		"}})")
		
		  //view.order:
		  if(dimension === 1) {
		    code.push("proto.order=[0]")
		  } else {
		    code.push("Object.defineProperty(proto,'order',{get:")
		    if(dimension < 4) {
		      code.push("function "+className+"_order(){")
		      if(dimension === 2) {
		        code.push("return (Math.abs(this.stride[0])>Math.abs(this.stride[1]))?[1,0]:[0,1]}})")
		      } else if(dimension === 3) {
		        code.push(
		"var s0=Math.abs(this.stride[0]),s1=Math.abs(this.stride[1]),s2=Math.abs(this.stride[2]);\
		if(s0>s1){\
		if(s1>s2){\
		return [2,1,0];\
		}else if(s0>s2){\
		return [1,2,0];\
		}else{\
		return [1,0,2];\
		}\
		}else if(s0>s2){\
		return [2,0,1];\
		}else if(s2>s1){\
		return [0,1,2];\
		}else{\
		return [0,2,1];\
		}}})")
		      }
		    } else {
		      code.push("ORDER})")
		    }
		  }
		
		  //view.set(i0, ..., v):
		  code.push(
		"proto.set=function "+className+"_set("+args.join(",")+",v){")
		  if(useGetters) {
		    code.push("return this.data.set("+index_str+",v)}")
		  } else {
		    code.push("return this.data["+index_str+"]=v}")
		  }
		
		  //view.get(i0, ...):
		  code.push("proto.get=function "+className+"_get("+args.join(",")+"){")
		  if(useGetters) {
		    code.push("return this.data.get("+index_str+")}")
		  } else {
		    code.push("return this.data["+index_str+"]}")
		  }
		
		  //view.index:
		  code.push(
		    "proto.index=function "+className+"_index(", args.join(), "){return "+index_str+"}")
		
		  //view.hi():
		  code.push("proto.hi=function "+className+"_hi("+args.join(",")+"){return new "+className+"(this.data,"+
		    indices.map(function(i) {
		      return ["(typeof i",i,"!=='number'||i",i,"<0)?this.shape[", i, "]:i", i,"|0"].join("")
		    }).join(",")+","+
		    indices.map(function(i) {
		      return "this.stride["+i + "]"
		    }).join(",")+",this.offset)}")
		
		  //view.lo():
		  var a_vars = indices.map(function(i) { return "a"+i+"=this.shape["+i+"]" })
		  var c_vars = indices.map(function(i) { return "c"+i+"=this.stride["+i+"]" })
		  code.push("proto.lo=function "+className+"_lo("+args.join(",")+"){var b=this.offset,d=0,"+a_vars.join(",")+","+c_vars.join(","))
		  for(var i=0; i<dimension; ++i) {
		    code.push(
		"if(typeof i"+i+"==='number'&&i"+i+">=0){\
		d=i"+i+"|0;\
		b+=c"+i+"*d;\
		a"+i+"-=d}")
		  }
		  code.push("return new "+className+"(this.data,"+
		    indices.map(function(i) {
		      return "a"+i
		    }).join(",")+","+
		    indices.map(function(i) {
		      return "c"+i
		    }).join(",")+",b)}")
		
		  //view.step():
		  code.push("proto.step=function "+className+"_step("+args.join(",")+"){var "+
		    indices.map(function(i) {
		      return "a"+i+"=this.shape["+i+"]"
		    }).join(",")+","+
		    indices.map(function(i) {
		      return "b"+i+"=this.stride["+i+"]"
		    }).join(",")+",c=this.offset,d=0,ceil=Math.ceil")
		  for(var i=0; i<dimension; ++i) {
		    code.push(
		"if(typeof i"+i+"==='number'){\
		d=i"+i+"|0;\
		if(d<0){\
		c+=b"+i+"*(a"+i+"-1);\
		a"+i+"=ceil(-a"+i+"/d)\
		}else{\
		a"+i+"=ceil(a"+i+"/d)\
		}\
		b"+i+"*=d\
		}")
		  }
		  code.push("return new "+className+"(this.data,"+
		    indices.map(function(i) {
		      return "a" + i
		    }).join(",")+","+
		    indices.map(function(i) {
		      return "b" + i
		    }).join(",")+",c)}")
		
		  //view.transpose():
		  var tShape = new Array(dimension)
		  var tStride = new Array(dimension)
		  for(var i=0; i<dimension; ++i) {
		    tShape[i] = "a[i"+i+"]"
		    tStride[i] = "b[i"+i+"]"
		  }
		  code.push("proto.transpose=function "+className+"_transpose("+args+"){"+
		    args.map(function(n,idx) { return n + "=(" + n + "===undefined?" + idx + ":" + n + "|0)"}).join(";"),
		    "var a=this.shape,b=this.stride;return new "+className+"(this.data,"+tShape.join(",")+","+tStride.join(",")+",this.offset)}")
		
		  //view.pick():
		  code.push("proto.pick=function "+className+"_pick("+args+"){var a=[],b=[],c=this.offset")
		  for(var i=0; i<dimension; ++i) {
		    code.push("if(typeof i"+i+"==='number'&&i"+i+">=0){c=(c+this.stride["+i+"]*i"+i+")|0}else{a.push(this.shape["+i+"]);b.push(this.stride["+i+"])}")
		  }
		  code.push("var ctor=CTOR_LIST[a.length+1];return ctor(this.data,a,b,c)}")
		
		  //Add return statement
		  code.push("return function construct_"+className+"(data,shape,stride,offset){return new "+className+"(data,"+
		    indices.map(function(i) {
		      return "shape["+i+"]"
		    }).join(",")+","+
		    indices.map(function(i) {
		      return "stride["+i+"]"
		    }).join(",")+",offset)}")
		
		  //Compile procedure
		  var procedure = new Function("CTOR_LIST", "ORDER", code.join("\n"))
		  return procedure(CACHED_CONSTRUCTORS[dtype], order)
		}
		
		function arrayDType(data) {
		  if(isBuffer(data)) {
		    return "buffer"
		  }
		  if(hasTypedArrays) {
		    switch(Object.prototype.toString.call(data)) {
		      case "[object Float64Array]":
		        return "float64"
		      case "[object Float32Array]":
		        return "float32"
		      case "[object Int8Array]":
		        return "int8"
		      case "[object Int16Array]":
		        return "int16"
		      case "[object Int32Array]":
		        return "int32"
		      case "[object Uint8Array]":
		        return "uint8"
		      case "[object Uint16Array]":
		        return "uint16"
		      case "[object Uint32Array]":
		        return "uint32"
		      case "[object Uint8ClampedArray]":
		        return "uint8_clamped"
		    }
		  }
		  if(Array.isArray(data)) {
		    return "array"
		  }
		  return "generic"
		}
		
		var CACHED_CONSTRUCTORS = {
		  "float32":[],
		  "float64":[],
		  "int8":[],
		  "int16":[],
		  "int32":[],
		  "uint8":[],
		  "uint16":[],
		  "uint32":[],
		  "array":[],
		  "uint8_clamped":[],
		  "buffer":[],
		  "generic":[]
		}
		
		;(function() {
		  for(var id in CACHED_CONSTRUCTORS) {
		    CACHED_CONSTRUCTORS[id].push(compileConstructor(id, -1))
		  }
		});
		
		function wrappedNDArrayCtor(data, shape, stride, offset) {
		  if(data === undefined) {
		    var ctor = CACHED_CONSTRUCTORS.array[0]
		    return ctor([])
		  } else if(typeof data === "number") {
		    data = [data]
		  }
		  if(shape === undefined) {
		    shape = [ data.length ]
		  }
		  var d = shape.length
		  if(stride === undefined) {
		    stride = new Array(d)
		    for(var i=d-1, sz=1; i>=0; --i) {
		      stride[i] = sz
		      sz *= shape[i]
		    }
		  }
		  if(offset === undefined) {
		    offset = 0
		    for(var i=0; i<d; ++i) {
		      if(stride[i] < 0) {
		        offset -= (shape[i]-1)*stride[i]
		      }
		    }
		  }
		  var dtype = arrayDType(data)
		  var ctor_list = CACHED_CONSTRUCTORS[dtype]
		  while(ctor_list.length <= d+1) {
		    ctor_list.push(compileConstructor(dtype, ctor_list.length-1))
		  }
		  var ctor = ctor_list[d+1]
		  return ctor(data, shape, stride, offset)
		}
		
		module.exports = wrappedNDArrayCtor
	
	
	/***/ },
	/* 2 */
	/***/ function(module, exports) {
	
		"use strict"
		
		function iota(n) {
		  var result = new Array(n)
		  for(var i=0; i<n; ++i) {
		    result[i] = i
		  }
		  return result
		}
		
		module.exports = iota
	
	/***/ },
	/* 3 */
	/***/ function(module, exports) {
	
		/**
		 * Determine if an object is Buffer
		 *
		 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
		 * License:  MIT
		 *
		 * `npm install is-buffer`
		 */
		
		module.exports = function (obj) {
		  return !!(obj != null &&
		    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
		      (obj.constructor &&
		      typeof obj.constructor.isBuffer === 'function' &&
		      obj.constructor.isBuffer(obj))
		    ))
		}
	
	
	/***/ },
	/* 4 */
	/***/ function(module, exports, __webpack_require__) {
	
		"use strict"
		
		var ndarray = __webpack_require__(1)
		var do_convert = __webpack_require__(5)
		
		module.exports = function convert(arr, result) {
		  var shape = [], c = arr, sz = 1
		  while(c instanceof Array) {
		    shape.push(c.length)
		    sz *= c.length
		    c = c[0]
		  }
		  if(shape.length === 0) {
		    return ndarray()
		  }
		  if(!result) {
		    result = ndarray(new Float64Array(sz), shape)
		  }
		  do_convert(result, arr)
		  return result
		}
	
	
	/***/ },
	/* 5 */
	/***/ function(module, exports, __webpack_require__) {
	
		module.exports=__webpack_require__(6)({"args":["array","scalar","index"],"pre":{"body":"{}","args":[],"thisVars":[],"localVars":[]},"body":{"body":"{\nvar _inline_1_v=_inline_1_arg1_,_inline_1_i\nfor(_inline_1_i=0;_inline_1_i<_inline_1_arg2_.length-1;++_inline_1_i) {\n_inline_1_v=_inline_1_v[_inline_1_arg2_[_inline_1_i]]\n}\n_inline_1_arg0_=_inline_1_v[_inline_1_arg2_[_inline_1_arg2_.length-1]]\n}","args":[{"name":"_inline_1_arg0_","lvalue":true,"rvalue":false,"count":1},{"name":"_inline_1_arg1_","lvalue":false,"rvalue":true,"count":1},{"name":"_inline_1_arg2_","lvalue":false,"rvalue":true,"count":4}],"thisVars":[],"localVars":["_inline_1_i","_inline_1_v"]},"post":{"body":"{}","args":[],"thisVars":[],"localVars":[]},"funcName":"convert","blockSize":64})
	
	
	/***/ },
	/* 6 */
	/***/ function(module, exports, __webpack_require__) {
	
		"use strict"
		
		var createThunk = __webpack_require__(7)
		
		function Procedure() {
		  this.argTypes = []
		  this.shimArgs = []
		  this.arrayArgs = []
		  this.arrayBlockIndices = []
		  this.scalarArgs = []
		  this.offsetArgs = []
		  this.offsetArgIndex = []
		  this.indexArgs = []
		  this.shapeArgs = []
		  this.funcName = ""
		  this.pre = null
		  this.body = null
		  this.post = null
		  this.debug = false
		}
		
		function compileCwise(user_args) {
		  //Create procedure
		  var proc = new Procedure()
		  
		  //Parse blocks
		  proc.pre    = user_args.pre
		  proc.body   = user_args.body
		  proc.post   = user_args.post
		
		  //Parse arguments
		  var proc_args = user_args.args.slice(0)
		  proc.argTypes = proc_args
		  for(var i=0; i<proc_args.length; ++i) {
		    var arg_type = proc_args[i]
		    if(arg_type === "array" || (typeof arg_type === "object" && arg_type.blockIndices)) {
		      proc.argTypes[i] = "array"
		      proc.arrayArgs.push(i)
		      proc.arrayBlockIndices.push(arg_type.blockIndices ? arg_type.blockIndices : 0)
		      proc.shimArgs.push("array" + i)
		      if(i < proc.pre.args.length && proc.pre.args[i].count>0) {
		        throw new Error("cwise: pre() block may not reference array args")
		      }
		      if(i < proc.post.args.length && proc.post.args[i].count>0) {
		        throw new Error("cwise: post() block may not reference array args")
		      }
		    } else if(arg_type === "scalar") {
		      proc.scalarArgs.push(i)
		      proc.shimArgs.push("scalar" + i)
		    } else if(arg_type === "index") {
		      proc.indexArgs.push(i)
		      if(i < proc.pre.args.length && proc.pre.args[i].count > 0) {
		        throw new Error("cwise: pre() block may not reference array index")
		      }
		      if(i < proc.body.args.length && proc.body.args[i].lvalue) {
		        throw new Error("cwise: body() block may not write to array index")
		      }
		      if(i < proc.post.args.length && proc.post.args[i].count > 0) {
		        throw new Error("cwise: post() block may not reference array index")
		      }
		    } else if(arg_type === "shape") {
		      proc.shapeArgs.push(i)
		      if(i < proc.pre.args.length && proc.pre.args[i].lvalue) {
		        throw new Error("cwise: pre() block may not write to array shape")
		      }
		      if(i < proc.body.args.length && proc.body.args[i].lvalue) {
		        throw new Error("cwise: body() block may not write to array shape")
		      }
		      if(i < proc.post.args.length && proc.post.args[i].lvalue) {
		        throw new Error("cwise: post() block may not write to array shape")
		      }
		    } else if(typeof arg_type === "object" && arg_type.offset) {
		      proc.argTypes[i] = "offset"
		      proc.offsetArgs.push({ array: arg_type.array, offset:arg_type.offset })
		      proc.offsetArgIndex.push(i)
		    } else {
		      throw new Error("cwise: Unknown argument type " + proc_args[i])
		    }
		  }
		  
		  //Make sure at least one array argument was specified
		  if(proc.arrayArgs.length <= 0) {
		    throw new Error("cwise: No array arguments specified")
		  }
		  
		  //Make sure arguments are correct
		  if(proc.pre.args.length > proc_args.length) {
		    throw new Error("cwise: Too many arguments in pre() block")
		  }
		  if(proc.body.args.length > proc_args.length) {
		    throw new Error("cwise: Too many arguments in body() block")
		  }
		  if(proc.post.args.length > proc_args.length) {
		    throw new Error("cwise: Too many arguments in post() block")
		  }
		
		  //Check debug flag
		  proc.debug = !!user_args.printCode || !!user_args.debug
		  
		  //Retrieve name
		  proc.funcName = user_args.funcName || "cwise"
		  
		  //Read in block size
		  proc.blockSize = user_args.blockSize || 64
		
		  return createThunk(proc)
		}
		
		module.exports = compileCwise
	
	
	/***/ },
	/* 7 */
	/***/ function(module, exports, __webpack_require__) {
	
		"use strict"
		
		// The function below is called when constructing a cwise function object, and does the following:
		// A function object is constructed which accepts as argument a compilation function and returns another function.
		// It is this other function that is eventually returned by createThunk, and this function is the one that actually
		// checks whether a certain pattern of arguments has already been used before and compiles new loops as needed.
		// The compilation passed to the first function object is used for compiling new functions.
		// Once this function object is created, it is called with compile as argument, where the first argument of compile
		// is bound to "proc" (essentially containing a preprocessed version of the user arguments to cwise).
		// So createThunk roughly works like this:
		// function createThunk(proc) {
		//   var thunk = function(compileBound) {
		//     var CACHED = {}
		//     return function(arrays and scalars) {
		//       if (dtype and order of arrays in CACHED) {
		//         var func = CACHED[dtype and order of arrays]
		//       } else {
		//         var func = CACHED[dtype and order of arrays] = compileBound(dtype and order of arrays)
		//       }
		//       return func(arrays and scalars)
		//     }
		//   }
		//   return thunk(compile.bind1(proc))
		// }
		
		var compile = __webpack_require__(8)
		
		function createThunk(proc) {
		  var code = ["'use strict'", "var CACHED={}"]
		  var vars = []
		  var thunkName = proc.funcName + "_cwise_thunk"
		  
		  //Build thunk
		  code.push(["return function ", thunkName, "(", proc.shimArgs.join(","), "){"].join(""))
		  var typesig = []
		  var string_typesig = []
		  var proc_args = [["array",proc.arrayArgs[0],".shape.slice(", // Slice shape so that we only retain the shape over which we iterate (which gets passed to the cwise operator as SS).
		                    Math.max(0,proc.arrayBlockIndices[0]),proc.arrayBlockIndices[0]<0?(","+proc.arrayBlockIndices[0]+")"):")"].join("")]
		  var shapeLengthConditions = [], shapeConditions = []
		  // Process array arguments
		  for(var i=0; i<proc.arrayArgs.length; ++i) {
		    var j = proc.arrayArgs[i]
		    vars.push(["t", j, "=array", j, ".dtype,",
		               "r", j, "=array", j, ".order"].join(""))
		    typesig.push("t" + j)
		    typesig.push("r" + j)
		    string_typesig.push("t"+j)
		    string_typesig.push("r"+j+".join()")
		    proc_args.push("array" + j + ".data")
		    proc_args.push("array" + j + ".stride")
		    proc_args.push("array" + j + ".offset|0")
		    if (i>0) { // Gather conditions to check for shape equality (ignoring block indices)
		      shapeLengthConditions.push("array" + proc.arrayArgs[0] + ".shape.length===array" + j + ".shape.length+" + (Math.abs(proc.arrayBlockIndices[0])-Math.abs(proc.arrayBlockIndices[i])))
		      shapeConditions.push("array" + proc.arrayArgs[0] + ".shape[shapeIndex+" + Math.max(0,proc.arrayBlockIndices[0]) + "]===array" + j + ".shape[shapeIndex+" + Math.max(0,proc.arrayBlockIndices[i]) + "]")
		    }
		  }
		  // Check for shape equality
		  if (proc.arrayArgs.length > 1) {
		    code.push("if (!(" + shapeLengthConditions.join(" && ") + ")) throw new Error('cwise: Arrays do not all have the same dimensionality!')")
		    code.push("for(var shapeIndex=array" + proc.arrayArgs[0] + ".shape.length-" + Math.abs(proc.arrayBlockIndices[0]) + "; shapeIndex-->0;) {")
		    code.push("if (!(" + shapeConditions.join(" && ") + ")) throw new Error('cwise: Arrays do not all have the same shape!')")
		    code.push("}")
		  }
		  // Process scalar arguments
		  for(var i=0; i<proc.scalarArgs.length; ++i) {
		    proc_args.push("scalar" + proc.scalarArgs[i])
		  }
		  // Check for cached function (and if not present, generate it)
		  vars.push(["type=[", string_typesig.join(","), "].join()"].join(""))
		  vars.push("proc=CACHED[type]")
		  code.push("var " + vars.join(","))
		  
		  code.push(["if(!proc){",
		             "CACHED[type]=proc=compile([", typesig.join(","), "])}",
		             "return proc(", proc_args.join(","), ")}"].join(""))
		
		  if(proc.debug) {
		    console.log("-----Generated thunk:\n" + code.join("\n") + "\n----------")
		  }
		  
		  //Compile thunk
		  var thunk = new Function("compile", code.join("\n"))
		  return thunk(compile.bind(undefined, proc))
		}
		
		module.exports = createThunk
	
	
	/***/ },
	/* 8 */
	/***/ function(module, exports, __webpack_require__) {
	
		"use strict"
		
		var uniq = __webpack_require__(9)
		
		// This function generates very simple loops analogous to how you typically traverse arrays (the outermost loop corresponds to the slowest changing index, the innermost loop to the fastest changing index)
		// TODO: If two arrays have the same strides (and offsets) there is potential for decreasing the number of "pointers" and related variables. The drawback is that the type signature would become more specific and that there would thus be less potential for caching, but it might still be worth it, especially when dealing with large numbers of arguments.
		function innerFill(order, proc, body) {
		  var dimension = order.length
		    , nargs = proc.arrayArgs.length
		    , has_index = proc.indexArgs.length>0
		    , code = []
		    , vars = []
		    , idx=0, pidx=0, i, j
		  for(i=0; i<dimension; ++i) { // Iteration variables
		    vars.push(["i",i,"=0"].join(""))
		  }
		  //Compute scan deltas
		  for(j=0; j<nargs; ++j) {
		    for(i=0; i<dimension; ++i) {
		      pidx = idx
		      idx = order[i]
		      if(i === 0) { // The innermost/fastest dimension's delta is simply its stride
		        vars.push(["d",j,"s",i,"=t",j,"p",idx].join(""))
		      } else { // For other dimensions the delta is basically the stride minus something which essentially "rewinds" the previous (more inner) dimension
		        vars.push(["d",j,"s",i,"=(t",j,"p",idx,"-s",pidx,"*t",j,"p",pidx,")"].join(""))
		      }
		    }
		  }
		  code.push("var " + vars.join(","))
		  //Scan loop
		  for(i=dimension-1; i>=0; --i) { // Start at largest stride and work your way inwards
		    idx = order[i]
		    code.push(["for(i",i,"=0;i",i,"<s",idx,";++i",i,"){"].join(""))
		  }
		  //Push body of inner loop
		  code.push(body)
		  //Advance scan pointers
		  for(i=0; i<dimension; ++i) {
		    pidx = idx
		    idx = order[i]
		    for(j=0; j<nargs; ++j) {
		      code.push(["p",j,"+=d",j,"s",i].join(""))
		    }
		    if(has_index) {
		      if(i > 0) {
		        code.push(["index[",pidx,"]-=s",pidx].join(""))
		      }
		      code.push(["++index[",idx,"]"].join(""))
		    }
		    code.push("}")
		  }
		  return code.join("\n")
		}
		
		// Generate "outer" loops that loop over blocks of data, applying "inner" loops to the blocks by manipulating the local variables in such a way that the inner loop only "sees" the current block.
		// TODO: If this is used, then the previous declaration (done by generateCwiseOp) of s* is essentially unnecessary.
		//       I believe the s* are not used elsewhere (in particular, I don't think they're used in the pre/post parts and "shape" is defined independently), so it would be possible to make defining the s* dependent on what loop method is being used.
		function outerFill(matched, order, proc, body) {
		  var dimension = order.length
		    , nargs = proc.arrayArgs.length
		    , blockSize = proc.blockSize
		    , has_index = proc.indexArgs.length > 0
		    , code = []
		  for(var i=0; i<nargs; ++i) {
		    code.push(["var offset",i,"=p",i].join(""))
		  }
		  //Generate loops for unmatched dimensions
		  // The order in which these dimensions are traversed is fairly arbitrary (from small stride to large stride, for the first argument)
		  // TODO: It would be nice if the order in which these loops are placed would also be somehow "optimal" (at the very least we should check that it really doesn't hurt us if they're not).
		  for(var i=matched; i<dimension; ++i) {
		    code.push(["for(var j"+i+"=SS[", order[i], "]|0;j", i, ">0;){"].join("")) // Iterate back to front
		    code.push(["if(j",i,"<",blockSize,"){"].join("")) // Either decrease j by blockSize (s = blockSize), or set it to zero (after setting s = j).
		    code.push(["s",order[i],"=j",i].join(""))
		    code.push(["j",i,"=0"].join(""))
		    code.push(["}else{s",order[i],"=",blockSize].join(""))
		    code.push(["j",i,"-=",blockSize,"}"].join(""))
		    if(has_index) {
		      code.push(["index[",order[i],"]=j",i].join(""))
		    }
		  }
		  for(var i=0; i<nargs; ++i) {
		    var indexStr = ["offset"+i]
		    for(var j=matched; j<dimension; ++j) {
		      indexStr.push(["j",j,"*t",i,"p",order[j]].join(""))
		    }
		    code.push(["p",i,"=(",indexStr.join("+"),")"].join(""))
		  }
		  code.push(innerFill(order, proc, body))
		  for(var i=matched; i<dimension; ++i) {
		    code.push("}")
		  }
		  return code.join("\n")
		}
		
		//Count the number of compatible inner orders
		// This is the length of the longest common prefix of the arrays in orders.
		// Each array in orders lists the dimensions of the correspond ndarray in order of increasing stride.
		// This is thus the maximum number of dimensions that can be efficiently traversed by simple nested loops for all arrays.
		function countMatches(orders) {
		  var matched = 0, dimension = orders[0].length
		  while(matched < dimension) {
		    for(var j=1; j<orders.length; ++j) {
		      if(orders[j][matched] !== orders[0][matched]) {
		        return matched
		      }
		    }
		    ++matched
		  }
		  return matched
		}
		
		//Processes a block according to the given data types
		// Replaces variable names by different ones, either "local" ones (that are then ferried in and out of the given array) or ones matching the arguments that the function performing the ultimate loop will accept.
		function processBlock(block, proc, dtypes) {
		  var code = block.body
		  var pre = []
		  var post = []
		  for(var i=0; i<block.args.length; ++i) {
		    var carg = block.args[i]
		    if(carg.count <= 0) {
		      continue
		    }
		    var re = new RegExp(carg.name, "g")
		    var ptrStr = ""
		    var arrNum = proc.arrayArgs.indexOf(i)
		    switch(proc.argTypes[i]) {
		      case "offset":
		        var offArgIndex = proc.offsetArgIndex.indexOf(i)
		        var offArg = proc.offsetArgs[offArgIndex]
		        arrNum = offArg.array
		        ptrStr = "+q" + offArgIndex // Adds offset to the "pointer" in the array
		      case "array":
		        ptrStr = "p" + arrNum + ptrStr
		        var localStr = "l" + i
		        var arrStr = "a" + arrNum
		        if (proc.arrayBlockIndices[arrNum] === 0) { // Argument to body is just a single value from this array
		          if(carg.count === 1) { // Argument/array used only once(?)
		            if(dtypes[arrNum] === "generic") {
		              if(carg.lvalue) {
		                pre.push(["var ", localStr, "=", arrStr, ".get(", ptrStr, ")"].join("")) // Is this necessary if the argument is ONLY used as an lvalue? (keep in mind that we can have a += something, so we would actually need to check carg.rvalue)
		                code = code.replace(re, localStr)
		                post.push([arrStr, ".set(", ptrStr, ",", localStr,")"].join(""))
		              } else {
		                code = code.replace(re, [arrStr, ".get(", ptrStr, ")"].join(""))
		              }
		            } else {
		              code = code.replace(re, [arrStr, "[", ptrStr, "]"].join(""))
		            }
		          } else if(dtypes[arrNum] === "generic") {
		            pre.push(["var ", localStr, "=", arrStr, ".get(", ptrStr, ")"].join("")) // TODO: Could we optimize by checking for carg.rvalue?
		            code = code.replace(re, localStr)
		            if(carg.lvalue) {
		              post.push([arrStr, ".set(", ptrStr, ",", localStr,")"].join(""))
		            }
		          } else {
		            pre.push(["var ", localStr, "=", arrStr, "[", ptrStr, "]"].join("")) // TODO: Could we optimize by checking for carg.rvalue?
		            code = code.replace(re, localStr)
		            if(carg.lvalue) {
		              post.push([arrStr, "[", ptrStr, "]=", localStr].join(""))
		            }
		          }
		        } else { // Argument to body is a "block"
		          var reStrArr = [carg.name], ptrStrArr = [ptrStr]
		          for(var j=0; j<Math.abs(proc.arrayBlockIndices[arrNum]); j++) {
		            reStrArr.push("\\s*\\[([^\\]]+)\\]")
		            ptrStrArr.push("$" + (j+1) + "*t" + arrNum + "b" + j) // Matched index times stride
		          }
		          re = new RegExp(reStrArr.join(""), "g")
		          ptrStr = ptrStrArr.join("+")
		          if(dtypes[arrNum] === "generic") {
		            /*if(carg.lvalue) {
		              pre.push(["var ", localStr, "=", arrStr, ".get(", ptrStr, ")"].join("")) // Is this necessary if the argument is ONLY used as an lvalue? (keep in mind that we can have a += something, so we would actually need to check carg.rvalue)
		              code = code.replace(re, localStr)
		              post.push([arrStr, ".set(", ptrStr, ",", localStr,")"].join(""))
		            } else {
		              code = code.replace(re, [arrStr, ".get(", ptrStr, ")"].join(""))
		            }*/
		            throw new Error("cwise: Generic arrays not supported in combination with blocks!")
		          } else {
		            // This does not produce any local variables, even if variables are used multiple times. It would be possible to do so, but it would complicate things quite a bit.
		            code = code.replace(re, [arrStr, "[", ptrStr, "]"].join(""))
		          }
		        }
		      break
		      case "scalar":
		        code = code.replace(re, "Y" + proc.scalarArgs.indexOf(i))
		      break
		      case "index":
		        code = code.replace(re, "index")
		      break
		      case "shape":
		        code = code.replace(re, "shape")
		      break
		    }
		  }
		  return [pre.join("\n"), code, post.join("\n")].join("\n").trim()
		}
		
		function typeSummary(dtypes) {
		  var summary = new Array(dtypes.length)
		  var allEqual = true
		  for(var i=0; i<dtypes.length; ++i) {
		    var t = dtypes[i]
		    var digits = t.match(/\d+/)
		    if(!digits) {
		      digits = ""
		    } else {
		      digits = digits[0]
		    }
		    if(t.charAt(0) === 0) {
		      summary[i] = "u" + t.charAt(1) + digits
		    } else {
		      summary[i] = t.charAt(0) + digits
		    }
		    if(i > 0) {
		      allEqual = allEqual && summary[i] === summary[i-1]
		    }
		  }
		  if(allEqual) {
		    return summary[0]
		  }
		  return summary.join("")
		}
		
		//Generates a cwise operator
		function generateCWiseOp(proc, typesig) {
		
		  //Compute dimension
		  // Arrays get put first in typesig, and there are two entries per array (dtype and order), so this gets the number of dimensions in the first array arg.
		  var dimension = (typesig[1].length - Math.abs(proc.arrayBlockIndices[0]))|0
		  var orders = new Array(proc.arrayArgs.length)
		  var dtypes = new Array(proc.arrayArgs.length)
		  for(var i=0; i<proc.arrayArgs.length; ++i) {
		    dtypes[i] = typesig[2*i]
		    orders[i] = typesig[2*i+1]
		  }
		  
		  //Determine where block and loop indices start and end
		  var blockBegin = [], blockEnd = [] // These indices are exposed as blocks
		  var loopBegin = [], loopEnd = [] // These indices are iterated over
		  var loopOrders = [] // orders restricted to the loop indices
		  for(var i=0; i<proc.arrayArgs.length; ++i) {
		    if (proc.arrayBlockIndices[i]<0) {
		      loopBegin.push(0)
		      loopEnd.push(dimension)
		      blockBegin.push(dimension)
		      blockEnd.push(dimension+proc.arrayBlockIndices[i])
		    } else {
		      loopBegin.push(proc.arrayBlockIndices[i]) // Non-negative
		      loopEnd.push(proc.arrayBlockIndices[i]+dimension)
		      blockBegin.push(0)
		      blockEnd.push(proc.arrayBlockIndices[i])
		    }
		    var newOrder = []
		    for(var j=0; j<orders[i].length; j++) {
		      if (loopBegin[i]<=orders[i][j] && orders[i][j]<loopEnd[i]) {
		        newOrder.push(orders[i][j]-loopBegin[i]) // If this is a loop index, put it in newOrder, subtracting loopBegin, to make sure that all loopOrders are using a common set of indices.
		      }
		    }
		    loopOrders.push(newOrder)
		  }
		
		  //First create arguments for procedure
		  var arglist = ["SS"] // SS is the overall shape over which we iterate
		  var code = ["'use strict'"]
		  var vars = []
		  
		  for(var j=0; j<dimension; ++j) {
		    vars.push(["s", j, "=SS[", j, "]"].join("")) // The limits for each dimension.
		  }
		  for(var i=0; i<proc.arrayArgs.length; ++i) {
		    arglist.push("a"+i) // Actual data array
		    arglist.push("t"+i) // Strides
		    arglist.push("p"+i) // Offset in the array at which the data starts (also used for iterating over the data)
		    
		    for(var j=0; j<dimension; ++j) { // Unpack the strides into vars for looping
		      vars.push(["t",i,"p",j,"=t",i,"[",loopBegin[i]+j,"]"].join(""))
		    }
		    
		    for(var j=0; j<Math.abs(proc.arrayBlockIndices[i]); ++j) { // Unpack the strides into vars for block iteration
		      vars.push(["t",i,"b",j,"=t",i,"[",blockBegin[i]+j,"]"].join(""))
		    }
		  }
		  for(var i=0; i<proc.scalarArgs.length; ++i) {
		    arglist.push("Y" + i)
		  }
		  if(proc.shapeArgs.length > 0) {
		    vars.push("shape=SS.slice(0)") // Makes the shape over which we iterate available to the user defined functions (so you can use width/height for example)
		  }
		  if(proc.indexArgs.length > 0) {
		    // Prepare an array to keep track of the (logical) indices, initialized to dimension zeroes.
		    var zeros = new Array(dimension)
		    for(var i=0; i<dimension; ++i) {
		      zeros[i] = "0"
		    }
		    vars.push(["index=[", zeros.join(","), "]"].join(""))
		  }
		  for(var i=0; i<proc.offsetArgs.length; ++i) { // Offset arguments used for stencil operations
		    var off_arg = proc.offsetArgs[i]
		    var init_string = []
		    for(var j=0; j<off_arg.offset.length; ++j) {
		      if(off_arg.offset[j] === 0) {
		        continue
		      } else if(off_arg.offset[j] === 1) {
		        init_string.push(["t", off_arg.array, "p", j].join(""))      
		      } else {
		        init_string.push([off_arg.offset[j], "*t", off_arg.array, "p", j].join(""))
		      }
		    }
		    if(init_string.length === 0) {
		      vars.push("q" + i + "=0")
		    } else {
		      vars.push(["q", i, "=", init_string.join("+")].join(""))
		    }
		  }
		
		  //Prepare this variables
		  var thisVars = uniq([].concat(proc.pre.thisVars)
		                      .concat(proc.body.thisVars)
		                      .concat(proc.post.thisVars))
		  vars = vars.concat(thisVars)
		  code.push("var " + vars.join(","))
		  for(var i=0; i<proc.arrayArgs.length; ++i) {
		    code.push("p"+i+"|=0")
		  }
		  
		  //Inline prelude
		  if(proc.pre.body.length > 3) {
		    code.push(processBlock(proc.pre, proc, dtypes))
		  }
		
		  //Process body
		  var body = processBlock(proc.body, proc, dtypes)
		  var matched = countMatches(loopOrders)
		  if(matched < dimension) {
		    code.push(outerFill(matched, loopOrders[0], proc, body)) // TODO: Rather than passing loopOrders[0], it might be interesting to look at passing an order that represents the majority of the arguments for example.
		  } else {
		    code.push(innerFill(loopOrders[0], proc, body))
		  }
		
		  //Inline epilog
		  if(proc.post.body.length > 3) {
		    code.push(processBlock(proc.post, proc, dtypes))
		  }
		  
		  if(proc.debug) {
		    console.log("-----Generated cwise routine for ", typesig, ":\n" + code.join("\n") + "\n----------")
		  }
		  
		  var loopName = [(proc.funcName||"unnamed"), "_cwise_loop_", orders[0].join("s"),"m",matched,typeSummary(dtypes)].join("")
		  var f = new Function(["function ",loopName,"(", arglist.join(","),"){", code.join("\n"),"} return ", loopName].join(""))
		  return f()
		}
		module.exports = generateCWiseOp
	
	
	/***/ },
	/* 9 */
	/***/ function(module, exports) {
	
		"use strict"
		
		function unique_pred(list, compare) {
		  var ptr = 1
		    , len = list.length
		    , a=list[0], b=list[0]
		  for(var i=1; i<len; ++i) {
		    b = a
		    a = list[i]
		    if(compare(a, b)) {
		      if(i === ptr) {
		        ptr++
		        continue
		      }
		      list[ptr++] = a
		    }
		  }
		  list.length = ptr
		  return list
		}
		
		function unique_eq(list) {
		  var ptr = 1
		    , len = list.length
		    , a=list[0], b = list[0]
		  for(var i=1; i<len; ++i, b=a) {
		    b = a
		    a = list[i]
		    if(a !== b) {
		      if(i === ptr) {
		        ptr++
		        continue
		      }
		      list[ptr++] = a
		    }
		  }
		  list.length = ptr
		  return list
		}
		
		function unique(list, compare, sorted) {
		  if(list.length === 0) {
		    return list
		  }
		  if(compare) {
		    if(!sorted) {
		      list.sort(compare)
		    }
		    return unique_pred(list, compare)
		  }
		  if(!sorted) {
		    list.sort()
		  }
		  return unique_eq(list)
		}
		
		module.exports = unique
	
	
	/***/ },
	/* 10 */
	/***/ function(module, exports, __webpack_require__) {
	
		"use strict"
		
		var parse   = __webpack_require__(11)
		var compile = __webpack_require__(6)
		
		var REQUIRED_FIELDS = [ "args", "body" ]
		var OPTIONAL_FIELDS = [ "pre", "post", "printCode", "funcName", "blockSize" ]
		
		function createCWise(user_args) {
		  //Check parameters
		  for(var id in user_args) {
		    if(REQUIRED_FIELDS.indexOf(id) < 0 &&
		       OPTIONAL_FIELDS.indexOf(id) < 0) {
		      console.warn("cwise: Unknown argument '"+id+"' passed to expression compiler")
		    }
		  }
		  for(var i=0; i<REQUIRED_FIELDS.length; ++i) {
		    if(!user_args[REQUIRED_FIELDS[i]]) {
		      throw new Error("cwise: Missing argument: " + REQUIRED_FIELDS[i])
		    }
		  }
		  
		  //Parse blocks
		  return compile({
		    args:       user_args.args,
		    pre:        parse(user_args.pre || function(){}),
		    body:       parse(user_args.body),
		    post:       parse(user_args.post || function(){}),
		    debug:      !!user_args.printCode,
		    funcName:   user_args.funcName || user_args.body.name || "cwise",
		    blockSize:  user_args.blockSize || 64
		  })
		}
		
		module.exports = createCWise
	
	
	/***/ },
	/* 11 */
	/***/ function(module, exports, __webpack_require__) {
	
		"use strict"
		
		var esprima = __webpack_require__(12)
		var uniq = __webpack_require__(9)
		
		var PREFIX_COUNTER = 0
		
		function CompiledArgument(name, lvalue, rvalue) {
		  this.name = name
		  this.lvalue = lvalue
		  this.rvalue = rvalue
		  this.count = 0
		}
		
		function CompiledRoutine(body, args, thisVars, localVars) {
		  this.body = body
		  this.args = args
		  this.thisVars = thisVars
		  this.localVars = localVars
		}
		
		function isGlobal(identifier) {
		  if(identifier === "eval") {
		    throw new Error("cwise-parser: eval() not allowed")
		  }
		  if(typeof window !== "undefined") {
		    return identifier in window
		  } else if(typeof GLOBAL !== "undefined") {
		    return identifier in GLOBAL
		  } else if(typeof self !== "undefined") {
		    return identifier in self
		  } else {
		    return false
		  }
		}
		
		function getArgNames(ast) {
		  var params = ast.body[0].expression.callee.params
		  var names = new Array(params.length)
		  for(var i=0; i<params.length; ++i) {
		    names[i] = params[i].name
		  }
		  return names
		}
		
		function preprocess(func) {
		  var src = ["(", func, ")()"].join("")
		  var ast = esprima.parse(src, { range: true })
		  
		  //Compute new prefix
		  var prefix = "_inline_" + (PREFIX_COUNTER++) + "_"
		  
		  //Parse out arguments
		  var argNames = getArgNames(ast)
		  var compiledArgs = new Array(argNames.length)
		  for(var i=0; i<argNames.length; ++i) {
		    compiledArgs[i] = new CompiledArgument([prefix, "arg", i, "_"].join(""), false, false)
		  }
		  
		  //Create temporary data structure for source rewriting
		  var exploded = new Array(src.length)
		  for(var i=0, n=src.length; i<n; ++i) {
		    exploded[i] = src.charAt(i)
		  }
		  
		  //Local variables
		  var localVars = []
		  var thisVars = []
		  var computedThis = false
		  
		  //Retrieves a local variable
		  function createLocal(id) {
		    var nstr = prefix + id.replace(/\_/g, "__")
		    localVars.push(nstr)
		    return nstr
		  }
		  
		  //Creates a this variable
		  function createThisVar(id) {
		    var nstr = "this_" + id.replace(/\_/g, "__")
		    thisVars.push(nstr)
		    return nstr
		  }
		  
		  //Rewrites an ast node
		  function rewrite(node, nstr) {
		    var lo = node.range[0], hi = node.range[1]
		    for(var i=lo+1; i<hi; ++i) {
		      exploded[i] = ""
		    }
		    exploded[lo] = nstr
		  }
		  
		  //Remove any underscores
		  function escapeString(str) {
		    return "'"+(str.replace(/\_/g, "\\_").replace(/\'/g, "\'"))+"'"
		  }
		  
		  //Returns the source of an identifier
		  function source(node) {
		    return exploded.slice(node.range[0], node.range[1]).join("")
		  }
		  
		  //Computes the usage of a node
		  var LVALUE = 1
		  var RVALUE = 2
		  function getUsage(node) {
		    if(node.parent.type === "AssignmentExpression") {
		      if(node.parent.left === node) {
		        if(node.parent.operator === "=") {
		          return LVALUE
		        }
		        return LVALUE|RVALUE
		      }
		    }
		    if(node.parent.type === "UpdateExpression") {
		      return LVALUE|RVALUE
		    }
		    return RVALUE
		  }
		  
		  //Handle visiting a node
		  (function visit(node, parent) {
		    node.parent = parent
		    if(node.type === "MemberExpression") {
		      //Handle member expression
		      if(node.computed) {
		        visit(node.object, node)
		        visit(node.property, node)
		      } else if(node.object.type === "ThisExpression") {
		        rewrite(node, createThisVar(node.property.name))
		      } else {
		        visit(node.object, node)
		      }
		    } else if(node.type === "ThisExpression") {
		      throw new Error("cwise-parser: Computed this is not allowed")
		    } else if(node.type === "Identifier") {
		      //Handle identifier
		      var name = node.name
		      var argNo = argNames.indexOf(name)
		      if(argNo >= 0) {
		        var carg = compiledArgs[argNo]
		        var usage = getUsage(node)
		        if(usage & LVALUE) {
		          carg.lvalue = true
		        }
		        if(usage & RVALUE) {
		          carg.rvalue = true
		        }
		        ++carg.count
		        rewrite(node, carg.name)
		      } else if(isGlobal(name)) {
		        //Don't rewrite globals
		      } else {
		        rewrite(node, createLocal(name))
		      }
		    } else if(node.type === "Literal") {
		      if(typeof node.value === "string") {
		        rewrite(node, escapeString(node.value))
		      }
		    } else if(node.type === "WithStatement") {
		      throw new Error("cwise-parser: with() statements not allowed")
		    } else {
		      //Visit all children
		      var keys = Object.keys(node)
		      for(var i=0, n=keys.length; i<n; ++i) {
		        if(keys[i] === "parent") {
		          continue
		        }
		        var value = node[keys[i]]
		        if(value) {
		          if(value instanceof Array) {
		            for(var j=0; j<value.length; ++j) {
		              if(value[j] && typeof value[j].type === "string") {
		                visit(value[j], node)
		              }
		            }
		          } else if(typeof value.type === "string") {
		            visit(value, node)
		          }
		        }
		      }
		    }
		  })(ast.body[0].expression.callee.body, undefined)
		  
		  //Remove duplicate variables
		  uniq(localVars)
		  uniq(thisVars)
		  
		  //Return body
		  var routine = new CompiledRoutine(source(ast.body[0].expression.callee.body), compiledArgs, thisVars, localVars)
		  return routine
		}
		
		module.exports = preprocess
	
	/***/ },
	/* 12 */
	/***/ function(module, exports, __webpack_require__) {
	
		var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
		  Copyright (C) 2013 Ariya Hidayat <ariya.hidayat@gmail.com>
		  Copyright (C) 2013 Thaddee Tyl <thaddee.tyl@gmail.com>
		  Copyright (C) 2013 Mathias Bynens <mathias@qiwi.be>
		  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
		  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
		  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
		  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
		  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
		  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
		  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>
		
		  Redistribution and use in source and binary forms, with or without
		  modification, are permitted provided that the following conditions are met:
		
		    * Redistributions of source code must retain the above copyright
		      notice, this list of conditions and the following disclaimer.
		    * Redistributions in binary form must reproduce the above copyright
		      notice, this list of conditions and the following disclaimer in the
		      documentation and/or other materials provided with the distribution.
		
		  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
		  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
		  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
		  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
		  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
		  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
		  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
		  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
		  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
		  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
		*/
		
		/*jslint bitwise:true plusplus:true */
		/*global esprima:true, define:true, exports:true, window: true,
		throwErrorTolerant: true,
		throwError: true, generateStatement: true, peek: true,
		parseAssignmentExpression: true, parseBlock: true, parseExpression: true,
		parseFunctionDeclaration: true, parseFunctionExpression: true,
		parseFunctionSourceElements: true, parseVariableIdentifier: true,
		parseLeftHandSideExpression: true,
		parseUnaryExpression: true,
		parseStatement: true, parseSourceElement: true */
		
		(function (root, factory) {
		    'use strict';
		
		    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
		    // Rhino, and plain browser loading.
		
		    /* istanbul ignore next */
		    if (true) {
		        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		    } else if (typeof exports !== 'undefined') {
		        factory(exports);
		    } else {
		        factory((root.esprima = {}));
		    }
		}(this, function (exports) {
		    'use strict';
		
		    var Token,
		        TokenName,
		        FnExprTokens,
		        Syntax,
		        PropertyKind,
		        Messages,
		        Regex,
		        SyntaxTreeDelegate,
		        source,
		        strict,
		        index,
		        lineNumber,
		        lineStart,
		        length,
		        delegate,
		        lookahead,
		        state,
		        extra;
		
		    Token = {
		        BooleanLiteral: 1,
		        EOF: 2,
		        Identifier: 3,
		        Keyword: 4,
		        NullLiteral: 5,
		        NumericLiteral: 6,
		        Punctuator: 7,
		        StringLiteral: 8,
		        RegularExpression: 9
		    };
		
		    TokenName = {};
		    TokenName[Token.BooleanLiteral] = 'Boolean';
		    TokenName[Token.EOF] = '<end>';
		    TokenName[Token.Identifier] = 'Identifier';
		    TokenName[Token.Keyword] = 'Keyword';
		    TokenName[Token.NullLiteral] = 'Null';
		    TokenName[Token.NumericLiteral] = 'Numeric';
		    TokenName[Token.Punctuator] = 'Punctuator';
		    TokenName[Token.StringLiteral] = 'String';
		    TokenName[Token.RegularExpression] = 'RegularExpression';
		
		    // A function following one of those tokens is an expression.
		    FnExprTokens = ['(', '{', '[', 'in', 'typeof', 'instanceof', 'new',
		                    'return', 'case', 'delete', 'throw', 'void',
		                    // assignment operators
		                    '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=',
		                    '&=', '|=', '^=', ',',
		                    // binary/unary operators
		                    '+', '-', '*', '/', '%', '++', '--', '<<', '>>', '>>>', '&',
		                    '|', '^', '!', '~', '&&', '||', '?', ':', '===', '==', '>=',
		                    '<=', '<', '>', '!=', '!=='];
		
		    Syntax = {
		        AssignmentExpression: 'AssignmentExpression',
		        ArrayExpression: 'ArrayExpression',
		        BlockStatement: 'BlockStatement',
		        BinaryExpression: 'BinaryExpression',
		        BreakStatement: 'BreakStatement',
		        CallExpression: 'CallExpression',
		        CatchClause: 'CatchClause',
		        ConditionalExpression: 'ConditionalExpression',
		        ContinueStatement: 'ContinueStatement',
		        DoWhileStatement: 'DoWhileStatement',
		        DebuggerStatement: 'DebuggerStatement',
		        EmptyStatement: 'EmptyStatement',
		        ExpressionStatement: 'ExpressionStatement',
		        ForStatement: 'ForStatement',
		        ForInStatement: 'ForInStatement',
		        FunctionDeclaration: 'FunctionDeclaration',
		        FunctionExpression: 'FunctionExpression',
		        Identifier: 'Identifier',
		        IfStatement: 'IfStatement',
		        Literal: 'Literal',
		        LabeledStatement: 'LabeledStatement',
		        LogicalExpression: 'LogicalExpression',
		        MemberExpression: 'MemberExpression',
		        NewExpression: 'NewExpression',
		        ObjectExpression: 'ObjectExpression',
		        Program: 'Program',
		        Property: 'Property',
		        ReturnStatement: 'ReturnStatement',
		        SequenceExpression: 'SequenceExpression',
		        SwitchStatement: 'SwitchStatement',
		        SwitchCase: 'SwitchCase',
		        ThisExpression: 'ThisExpression',
		        ThrowStatement: 'ThrowStatement',
		        TryStatement: 'TryStatement',
		        UnaryExpression: 'UnaryExpression',
		        UpdateExpression: 'UpdateExpression',
		        VariableDeclaration: 'VariableDeclaration',
		        VariableDeclarator: 'VariableDeclarator',
		        WhileStatement: 'WhileStatement',
		        WithStatement: 'WithStatement'
		    };
		
		    PropertyKind = {
		        Data: 1,
		        Get: 2,
		        Set: 4
		    };
		
		    // Error messages should be identical to V8.
		    Messages = {
		        UnexpectedToken:  'Unexpected token %0',
		        UnexpectedNumber:  'Unexpected number',
		        UnexpectedString:  'Unexpected string',
		        UnexpectedIdentifier:  'Unexpected identifier',
		        UnexpectedReserved:  'Unexpected reserved word',
		        UnexpectedEOS:  'Unexpected end of input',
		        NewlineAfterThrow:  'Illegal newline after throw',
		        InvalidRegExp: 'Invalid regular expression',
		        UnterminatedRegExp:  'Invalid regular expression: missing /',
		        InvalidLHSInAssignment:  'Invalid left-hand side in assignment',
		        InvalidLHSInForIn:  'Invalid left-hand side in for-in',
		        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
		        NoCatchOrFinally:  'Missing catch or finally after try',
		        UnknownLabel: 'Undefined label \'%0\'',
		        Redeclaration: '%0 \'%1\' has already been declared',
		        IllegalContinue: 'Illegal continue statement',
		        IllegalBreak: 'Illegal break statement',
		        IllegalReturn: 'Illegal return statement',
		        StrictModeWith:  'Strict mode code may not include a with statement',
		        StrictCatchVariable:  'Catch variable may not be eval or arguments in strict mode',
		        StrictVarName:  'Variable name may not be eval or arguments in strict mode',
		        StrictParamName:  'Parameter name eval or arguments is not allowed in strict mode',
		        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
		        StrictFunctionName:  'Function name may not be eval or arguments in strict mode',
		        StrictOctalLiteral:  'Octal literals are not allowed in strict mode.',
		        StrictDelete:  'Delete of an unqualified identifier in strict mode.',
		        StrictDuplicateProperty:  'Duplicate data property in object literal not allowed in strict mode',
		        AccessorDataProperty:  'Object literal may not have data and accessor property with the same name',
		        AccessorGetSet:  'Object literal may not have multiple get/set accessors with the same name',
		        StrictLHSAssignment:  'Assignment to eval or arguments is not allowed in strict mode',
		        StrictLHSPostfix:  'Postfix increment/decrement may not have eval or arguments operand in strict mode',
		        StrictLHSPrefix:  'Prefix increment/decrement may not have eval or arguments operand in strict mode',
		        StrictReservedWord:  'Use of future reserved word in strict mode'
		    };
		
		    // See also tools/generate-unicode-regex.py.
		    Regex = {
		        NonAsciiIdentifierStart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]'),
		        NonAsciiIdentifierPart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0\u08A2-\u08AC\u08E4-\u08FE\u0900-\u0963\u0966-\u096F\u0971-\u0977\u0979-\u097F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191C\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1D00-\u1DE6\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA697\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7B\uAA80-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE26\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]')
		    };
		
		    // Ensure the condition is true, otherwise throw an error.
		    // This is only to have a better contract semantic, i.e. another safety net
		    // to catch a logic error. The condition shall be fulfilled in normal case.
		    // Do NOT use this to enforce a certain condition on any user input.
		
		    function assert(condition, message) {
		        /* istanbul ignore if */
		        if (!condition) {
		            throw new Error('ASSERT: ' + message);
		        }
		    }
		
		    function isDecimalDigit(ch) {
		        return (ch >= 48 && ch <= 57);   // 0..9
		    }
		
		    function isHexDigit(ch) {
		        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
		    }
		
		    function isOctalDigit(ch) {
		        return '01234567'.indexOf(ch) >= 0;
		    }
		
		
		    // 7.2 White Space
		
		    function isWhiteSpace(ch) {
		        return (ch === 0x20) || (ch === 0x09) || (ch === 0x0B) || (ch === 0x0C) || (ch === 0xA0) ||
		            (ch >= 0x1680 && [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(ch) >= 0);
		    }
		
		    // 7.3 Line Terminators
		
		    function isLineTerminator(ch) {
		        return (ch === 0x0A) || (ch === 0x0D) || (ch === 0x2028) || (ch === 0x2029);
		    }
		
		    // 7.6 Identifier Names and Identifiers
		
		    function isIdentifierStart(ch) {
		        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
		            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
		            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
		            (ch === 0x5C) ||                      // \ (backslash)
		            ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));
		    }
		
		    function isIdentifierPart(ch) {
		        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
		            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
		            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
		            (ch >= 0x30 && ch <= 0x39) ||         // 0..9
		            (ch === 0x5C) ||                      // \ (backslash)
		            ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
		    }
		
		    // 7.6.1.2 Future Reserved Words
		
		    function isFutureReservedWord(id) {
		        switch (id) {
		        case 'class':
		        case 'enum':
		        case 'export':
		        case 'extends':
		        case 'import':
		        case 'super':
		            return true;
		        default:
		            return false;
		        }
		    }
		
		    function isStrictModeReservedWord(id) {
		        switch (id) {
		        case 'implements':
		        case 'interface':
		        case 'package':
		        case 'private':
		        case 'protected':
		        case 'public':
		        case 'static':
		        case 'yield':
		        case 'let':
		            return true;
		        default:
		            return false;
		        }
		    }
		
		    function isRestrictedWord(id) {
		        return id === 'eval' || id === 'arguments';
		    }
		
		    // 7.6.1.1 Keywords
		
		    function isKeyword(id) {
		        if (strict && isStrictModeReservedWord(id)) {
		            return true;
		        }
		
		        // 'const' is specialized as Keyword in V8.
		        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
		        // Some others are from future reserved words.
		
		        switch (id.length) {
		        case 2:
		            return (id === 'if') || (id === 'in') || (id === 'do');
		        case 3:
		            return (id === 'var') || (id === 'for') || (id === 'new') ||
		                (id === 'try') || (id === 'let');
		        case 4:
		            return (id === 'this') || (id === 'else') || (id === 'case') ||
		                (id === 'void') || (id === 'with') || (id === 'enum');
		        case 5:
		            return (id === 'while') || (id === 'break') || (id === 'catch') ||
		                (id === 'throw') || (id === 'const') || (id === 'yield') ||
		                (id === 'class') || (id === 'super');
		        case 6:
		            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
		                (id === 'switch') || (id === 'export') || (id === 'import');
		        case 7:
		            return (id === 'default') || (id === 'finally') || (id === 'extends');
		        case 8:
		            return (id === 'function') || (id === 'continue') || (id === 'debugger');
		        case 10:
		            return (id === 'instanceof');
		        default:
		            return false;
		        }
		    }
		
		    // 7.4 Comments
		
		    function addComment(type, value, start, end, loc) {
		        var comment, attacher;
		
		        assert(typeof start === 'number', 'Comment must have valid position');
		
		        // Because the way the actual token is scanned, often the comments
		        // (if any) are skipped twice during the lexical analysis.
		        // Thus, we need to skip adding a comment if the comment array already
		        // handled it.
		        if (state.lastCommentStart >= start) {
		            return;
		        }
		        state.lastCommentStart = start;
		
		        comment = {
		            type: type,
		            value: value
		        };
		        if (extra.range) {
		            comment.range = [start, end];
		        }
		        if (extra.loc) {
		            comment.loc = loc;
		        }
		        extra.comments.push(comment);
		        if (extra.attachComment) {
		            extra.leadingComments.push(comment);
		            extra.trailingComments.push(comment);
		        }
		    }
		
		    function skipSingleLineComment(offset) {
		        var start, loc, ch, comment;
		
		        start = index - offset;
		        loc = {
		            start: {
		                line: lineNumber,
		                column: index - lineStart - offset
		            }
		        };
		
		        while (index < length) {
		            ch = source.charCodeAt(index);
		            ++index;
		            if (isLineTerminator(ch)) {
		                if (extra.comments) {
		                    comment = source.slice(start + offset, index - 1);
		                    loc.end = {
		                        line: lineNumber,
		                        column: index - lineStart - 1
		                    };
		                    addComment('Line', comment, start, index - 1, loc);
		                }
		                if (ch === 13 && source.charCodeAt(index) === 10) {
		                    ++index;
		                }
		                ++lineNumber;
		                lineStart = index;
		                return;
		            }
		        }
		
		        if (extra.comments) {
		            comment = source.slice(start + offset, index);
		            loc.end = {
		                line: lineNumber,
		                column: index - lineStart
		            };
		            addComment('Line', comment, start, index, loc);
		        }
		    }
		
		    function skipMultiLineComment() {
		        var start, loc, ch, comment;
		
		        if (extra.comments) {
		            start = index - 2;
		            loc = {
		                start: {
		                    line: lineNumber,
		                    column: index - lineStart - 2
		                }
		            };
		        }
		
		        while (index < length) {
		            ch = source.charCodeAt(index);
		            if (isLineTerminator(ch)) {
		                if (ch === 0x0D && source.charCodeAt(index + 1) === 0x0A) {
		                    ++index;
		                }
		                ++lineNumber;
		                ++index;
		                lineStart = index;
		                if (index >= length) {
		                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		                }
		            } else if (ch === 0x2A) {
		                // Block comment ends with '*/'.
		                if (source.charCodeAt(index + 1) === 0x2F) {
		                    ++index;
		                    ++index;
		                    if (extra.comments) {
		                        comment = source.slice(start + 2, index - 2);
		                        loc.end = {
		                            line: lineNumber,
		                            column: index - lineStart
		                        };
		                        addComment('Block', comment, start, index, loc);
		                    }
		                    return;
		                }
		                ++index;
		            } else {
		                ++index;
		            }
		        }
		
		        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		    }
		
		    function skipComment() {
		        var ch, start;
		
		        start = (index === 0);
		        while (index < length) {
		            ch = source.charCodeAt(index);
		
		            if (isWhiteSpace(ch)) {
		                ++index;
		            } else if (isLineTerminator(ch)) {
		                ++index;
		                if (ch === 0x0D && source.charCodeAt(index) === 0x0A) {
		                    ++index;
		                }
		                ++lineNumber;
		                lineStart = index;
		                start = true;
		            } else if (ch === 0x2F) { // U+002F is '/'
		                ch = source.charCodeAt(index + 1);
		                if (ch === 0x2F) {
		                    ++index;
		                    ++index;
		                    skipSingleLineComment(2);
		                    start = true;
		                } else if (ch === 0x2A) {  // U+002A is '*'
		                    ++index;
		                    ++index;
		                    skipMultiLineComment();
		                } else {
		                    break;
		                }
		            } else if (start && ch === 0x2D) { // U+002D is '-'
		                // U+003E is '>'
		                if ((source.charCodeAt(index + 1) === 0x2D) && (source.charCodeAt(index + 2) === 0x3E)) {
		                    // '-->' is a single-line comment
		                    index += 3;
		                    skipSingleLineComment(3);
		                } else {
		                    break;
		                }
		            } else if (ch === 0x3C) { // U+003C is '<'
		                if (source.slice(index + 1, index + 4) === '!--') {
		                    ++index; // `<`
		                    ++index; // `!`
		                    ++index; // `-`
		                    ++index; // `-`
		                    skipSingleLineComment(4);
		                } else {
		                    break;
		                }
		            } else {
		                break;
		            }
		        }
		    }
		
		    function scanHexEscape(prefix) {
		        var i, len, ch, code = 0;
		
		        len = (prefix === 'u') ? 4 : 2;
		        for (i = 0; i < len; ++i) {
		            if (index < length && isHexDigit(source[index])) {
		                ch = source[index++];
		                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
		            } else {
		                return '';
		            }
		        }
		        return String.fromCharCode(code);
		    }
		
		    function getEscapedIdentifier() {
		        var ch, id;
		
		        ch = source.charCodeAt(index++);
		        id = String.fromCharCode(ch);
		
		        // '\u' (U+005C, U+0075) denotes an escaped character.
		        if (ch === 0x5C) {
		            if (source.charCodeAt(index) !== 0x75) {
		                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		            }
		            ++index;
		            ch = scanHexEscape('u');
		            if (!ch || ch === '\\' || !isIdentifierStart(ch.charCodeAt(0))) {
		                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		            }
		            id = ch;
		        }
		
		        while (index < length) {
		            ch = source.charCodeAt(index);
		            if (!isIdentifierPart(ch)) {
		                break;
		            }
		            ++index;
		            id += String.fromCharCode(ch);
		
		            // '\u' (U+005C, U+0075) denotes an escaped character.
		            if (ch === 0x5C) {
		                id = id.substr(0, id.length - 1);
		                if (source.charCodeAt(index) !== 0x75) {
		                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		                }
		                ++index;
		                ch = scanHexEscape('u');
		                if (!ch || ch === '\\' || !isIdentifierPart(ch.charCodeAt(0))) {
		                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		                }
		                id += ch;
		            }
		        }
		
		        return id;
		    }
		
		    function getIdentifier() {
		        var start, ch;
		
		        start = index++;
		        while (index < length) {
		            ch = source.charCodeAt(index);
		            if (ch === 0x5C) {
		                // Blackslash (U+005C) marks Unicode escape sequence.
		                index = start;
		                return getEscapedIdentifier();
		            }
		            if (isIdentifierPart(ch)) {
		                ++index;
		            } else {
		                break;
		            }
		        }
		
		        return source.slice(start, index);
		    }
		
		    function scanIdentifier() {
		        var start, id, type;
		
		        start = index;
		
		        // Backslash (U+005C) starts an escaped character.
		        id = (source.charCodeAt(index) === 0x5C) ? getEscapedIdentifier() : getIdentifier();
		
		        // There is no keyword or literal with only one character.
		        // Thus, it must be an identifier.
		        if (id.length === 1) {
		            type = Token.Identifier;
		        } else if (isKeyword(id)) {
		            type = Token.Keyword;
		        } else if (id === 'null') {
		            type = Token.NullLiteral;
		        } else if (id === 'true' || id === 'false') {
		            type = Token.BooleanLiteral;
		        } else {
		            type = Token.Identifier;
		        }
		
		        return {
		            type: type,
		            value: id,
		            lineNumber: lineNumber,
		            lineStart: lineStart,
		            start: start,
		            end: index
		        };
		    }
		
		
		    // 7.7 Punctuators
		
		    function scanPunctuator() {
		        var start = index,
		            code = source.charCodeAt(index),
		            code2,
		            ch1 = source[index],
		            ch2,
		            ch3,
		            ch4;
		
		        switch (code) {
		
		        // Check for most common single-character punctuators.
		        case 0x2E:  // . dot
		        case 0x28:  // ( open bracket
		        case 0x29:  // ) close bracket
		        case 0x3B:  // ; semicolon
		        case 0x2C:  // , comma
		        case 0x7B:  // { open curly brace
		        case 0x7D:  // } close curly brace
		        case 0x5B:  // [
		        case 0x5D:  // ]
		        case 0x3A:  // :
		        case 0x3F:  // ?
		        case 0x7E:  // ~
		            ++index;
		            if (extra.tokenize) {
		                if (code === 0x28) {
		                    extra.openParenToken = extra.tokens.length;
		                } else if (code === 0x7B) {
		                    extra.openCurlyToken = extra.tokens.length;
		                }
		            }
		            return {
		                type: Token.Punctuator,
		                value: String.fromCharCode(code),
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                start: start,
		                end: index
		            };
		
		        default:
		            code2 = source.charCodeAt(index + 1);
		
		            // '=' (U+003D) marks an assignment or comparison operator.
		            if (code2 === 0x3D) {
		                switch (code) {
		                case 0x2B:  // +
		                case 0x2D:  // -
		                case 0x2F:  // /
		                case 0x3C:  // <
		                case 0x3E:  // >
		                case 0x5E:  // ^
		                case 0x7C:  // |
		                case 0x25:  // %
		                case 0x26:  // &
		                case 0x2A:  // *
		                    index += 2;
		                    return {
		                        type: Token.Punctuator,
		                        value: String.fromCharCode(code) + String.fromCharCode(code2),
		                        lineNumber: lineNumber,
		                        lineStart: lineStart,
		                        start: start,
		                        end: index
		                    };
		
		                case 0x21: // !
		                case 0x3D: // =
		                    index += 2;
		
		                    // !== and ===
		                    if (source.charCodeAt(index) === 0x3D) {
		                        ++index;
		                    }
		                    return {
		                        type: Token.Punctuator,
		                        value: source.slice(start, index),
		                        lineNumber: lineNumber,
		                        lineStart: lineStart,
		                        start: start,
		                        end: index
		                    };
		                }
		            }
		        }
		
		        // 4-character punctuator: >>>=
		
		        ch4 = source.substr(index, 4);
		
		        if (ch4 === '>>>=') {
		            index += 4;
		            return {
		                type: Token.Punctuator,
		                value: ch4,
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                start: start,
		                end: index
		            };
		        }
		
		        // 3-character punctuators: === !== >>> <<= >>=
		
		        ch3 = ch4.substr(0, 3);
		
		        if (ch3 === '>>>' || ch3 === '<<=' || ch3 === '>>=') {
		            index += 3;
		            return {
		                type: Token.Punctuator,
		                value: ch3,
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                start: start,
		                end: index
		            };
		        }
		
		        // Other 2-character punctuators: ++ -- << >> && ||
		        ch2 = ch3.substr(0, 2);
		
		        if ((ch1 === ch2[1] && ('+-<>&|'.indexOf(ch1) >= 0)) || ch2 === '=>') {
		            index += 2;
		            return {
		                type: Token.Punctuator,
		                value: ch2,
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                start: start,
		                end: index
		            };
		        }
		
		        // 1-character punctuators: < > = ! + - * % & | ^ /
		        if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
		            ++index;
		            return {
		                type: Token.Punctuator,
		                value: ch1,
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                start: start,
		                end: index
		            };
		        }
		
		        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		    }
		
		    // 7.8.3 Numeric Literals
		
		    function scanHexLiteral(start) {
		        var number = '';
		
		        while (index < length) {
		            if (!isHexDigit(source[index])) {
		                break;
		            }
		            number += source[index++];
		        }
		
		        if (number.length === 0) {
		            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		        }
		
		        if (isIdentifierStart(source.charCodeAt(index))) {
		            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		        }
		
		        return {
		            type: Token.NumericLiteral,
		            value: parseInt('0x' + number, 16),
		            lineNumber: lineNumber,
		            lineStart: lineStart,
		            start: start,
		            end: index
		        };
		    }
		
		    function scanOctalLiteral(start) {
		        var number = '0' + source[index++];
		        while (index < length) {
		            if (!isOctalDigit(source[index])) {
		                break;
		            }
		            number += source[index++];
		        }
		
		        if (isIdentifierStart(source.charCodeAt(index)) || isDecimalDigit(source.charCodeAt(index))) {
		            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		        }
		
		        return {
		            type: Token.NumericLiteral,
		            value: parseInt(number, 8),
		            octal: true,
		            lineNumber: lineNumber,
		            lineStart: lineStart,
		            start: start,
		            end: index
		        };
		    }
		
		    function isImplicitOctalLiteral() {
		        var i, ch;
		
		        // Implicit octal, unless there is a non-octal digit.
		        // (Annex B.1.1 on Numeric Literals)
		        for (i = index + 1; i < length; ++i) {
		            ch = source[i];
		            if (ch === '8' || ch === '9') {
		                return false;
		            }
		            if (!isOctalDigit(ch)) {
		                return true;
		            }
		        }
		
		        return true;
		    }
		
		    function scanNumericLiteral() {
		        var number, start, ch;
		
		        ch = source[index];
		        assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
		            'Numeric literal must start with a decimal digit or a decimal point');
		
		        start = index;
		        number = '';
		        if (ch !== '.') {
		            number = source[index++];
		            ch = source[index];
		
		            // Hex number starts with '0x'.
		            // Octal number starts with '0'.
		            if (number === '0') {
		                if (ch === 'x' || ch === 'X') {
		                    ++index;
		                    return scanHexLiteral(start);
		                }
		                if (isOctalDigit(ch)) {
		                    if (isImplicitOctalLiteral()) {
		                        return scanOctalLiteral(start);
		                    }
		                }
		            }
		
		            while (isDecimalDigit(source.charCodeAt(index))) {
		                number += source[index++];
		            }
		            ch = source[index];
		        }
		
		        if (ch === '.') {
		            number += source[index++];
		            while (isDecimalDigit(source.charCodeAt(index))) {
		                number += source[index++];
		            }
		            ch = source[index];
		        }
		
		        if (ch === 'e' || ch === 'E') {
		            number += source[index++];
		
		            ch = source[index];
		            if (ch === '+' || ch === '-') {
		                number += source[index++];
		            }
		            if (isDecimalDigit(source.charCodeAt(index))) {
		                while (isDecimalDigit(source.charCodeAt(index))) {
		                    number += source[index++];
		                }
		            } else {
		                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		            }
		        }
		
		        if (isIdentifierStart(source.charCodeAt(index))) {
		            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		        }
		
		        return {
		            type: Token.NumericLiteral,
		            value: parseFloat(number),
		            lineNumber: lineNumber,
		            lineStart: lineStart,
		            start: start,
		            end: index
		        };
		    }
		
		    // 7.8.4 String Literals
		
		    function scanStringLiteral() {
		        var str = '', quote, start, ch, code, unescaped, restore, octal = false, startLineNumber, startLineStart;
		        startLineNumber = lineNumber;
		        startLineStart = lineStart;
		
		        quote = source[index];
		        assert((quote === '\'' || quote === '"'),
		            'String literal must starts with a quote');
		
		        start = index;
		        ++index;
		
		        while (index < length) {
		            ch = source[index++];
		
		            if (ch === quote) {
		                quote = '';
		                break;
		            } else if (ch === '\\') {
		                ch = source[index++];
		                if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
		                    switch (ch) {
		                    case 'u':
		                    case 'x':
		                        restore = index;
		                        unescaped = scanHexEscape(ch);
		                        if (unescaped) {
		                            str += unescaped;
		                        } else {
		                            index = restore;
		                            str += ch;
		                        }
		                        break;
		                    case 'n':
		                        str += '\n';
		                        break;
		                    case 'r':
		                        str += '\r';
		                        break;
		                    case 't':
		                        str += '\t';
		                        break;
		                    case 'b':
		                        str += '\b';
		                        break;
		                    case 'f':
		                        str += '\f';
		                        break;
		                    case 'v':
		                        str += '\x0B';
		                        break;
		
		                    default:
		                        if (isOctalDigit(ch)) {
		                            code = '01234567'.indexOf(ch);
		
		                            // \0 is not octal escape sequence
		                            if (code !== 0) {
		                                octal = true;
		                            }
		
		                            if (index < length && isOctalDigit(source[index])) {
		                                octal = true;
		                                code = code * 8 + '01234567'.indexOf(source[index++]);
		
		                                // 3 digits are only allowed when string starts
		                                // with 0, 1, 2, 3
		                                if ('0123'.indexOf(ch) >= 0 &&
		                                        index < length &&
		                                        isOctalDigit(source[index])) {
		                                    code = code * 8 + '01234567'.indexOf(source[index++]);
		                                }
		                            }
		                            str += String.fromCharCode(code);
		                        } else {
		                            str += ch;
		                        }
		                        break;
		                    }
		                } else {
		                    ++lineNumber;
		                    if (ch ===  '\r' && source[index] === '\n') {
		                        ++index;
		                    }
		                    lineStart = index;
		                }
		            } else if (isLineTerminator(ch.charCodeAt(0))) {
		                break;
		            } else {
		                str += ch;
		            }
		        }
		
		        if (quote !== '') {
		            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
		        }
		
		        return {
		            type: Token.StringLiteral,
		            value: str,
		            octal: octal,
		            startLineNumber: startLineNumber,
		            startLineStart: startLineStart,
		            lineNumber: lineNumber,
		            lineStart: lineStart,
		            start: start,
		            end: index
		        };
		    }
		
		    function testRegExp(pattern, flags) {
		        var value;
		        try {
		            value = new RegExp(pattern, flags);
		        } catch (e) {
		            throwError({}, Messages.InvalidRegExp);
		        }
		        return value;
		    }
		
		    function scanRegExpBody() {
		        var ch, str, classMarker, terminated, body;
		
		        ch = source[index];
		        assert(ch === '/', 'Regular expression literal must start with a slash');
		        str = source[index++];
		
		        classMarker = false;
		        terminated = false;
		        while (index < length) {
		            ch = source[index++];
		            str += ch;
		            if (ch === '\\') {
		                ch = source[index++];
		                // ECMA-262 7.8.5
		                if (isLineTerminator(ch.charCodeAt(0))) {
		                    throwError({}, Messages.UnterminatedRegExp);
		                }
		                str += ch;
		            } else if (isLineTerminator(ch.charCodeAt(0))) {
		                throwError({}, Messages.UnterminatedRegExp);
		            } else if (classMarker) {
		                if (ch === ']') {
		                    classMarker = false;
		                }
		            } else {
		                if (ch === '/') {
		                    terminated = true;
		                    break;
		                } else if (ch === '[') {
		                    classMarker = true;
		                }
		            }
		        }
		
		        if (!terminated) {
		            throwError({}, Messages.UnterminatedRegExp);
		        }
		
		        // Exclude leading and trailing slash.
		        body = str.substr(1, str.length - 2);
		        return {
		            value: body,
		            literal: str
		        };
		    }
		
		    function scanRegExpFlags() {
		        var ch, str, flags, restore;
		
		        str = '';
		        flags = '';
		        while (index < length) {
		            ch = source[index];
		            if (!isIdentifierPart(ch.charCodeAt(0))) {
		                break;
		            }
		
		            ++index;
		            if (ch === '\\' && index < length) {
		                ch = source[index];
		                if (ch === 'u') {
		                    ++index;
		                    restore = index;
		                    ch = scanHexEscape('u');
		                    if (ch) {
		                        flags += ch;
		                        for (str += '\\u'; restore < index; ++restore) {
		                            str += source[restore];
		                        }
		                    } else {
		                        index = restore;
		                        flags += 'u';
		                        str += '\\u';
		                    }
		                    throwErrorTolerant({}, Messages.UnexpectedToken, 'ILLEGAL');
		                } else {
		                    str += '\\';
		                    throwErrorTolerant({}, Messages.UnexpectedToken, 'ILLEGAL');
		                }
		            } else {
		                flags += ch;
		                str += ch;
		            }
		        }
		
		        return {
		            value: flags,
		            literal: str
		        };
		    }
		
		    function scanRegExp() {
		        var start, body, flags, pattern, value;
		
		        lookahead = null;
		        skipComment();
		        start = index;
		
		        body = scanRegExpBody();
		        flags = scanRegExpFlags();
		        value = testRegExp(body.value, flags.value);
		
		        if (extra.tokenize) {
		            return {
		                type: Token.RegularExpression,
		                value: value,
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                start: start,
		                end: index
		            };
		        }
		
		        return {
		            literal: body.literal + flags.literal,
		            value: value,
		            start: start,
		            end: index
		        };
		    }
		
		    function collectRegex() {
		        var pos, loc, regex, token;
		
		        skipComment();
		
		        pos = index;
		        loc = {
		            start: {
		                line: lineNumber,
		                column: index - lineStart
		            }
		        };
		
		        regex = scanRegExp();
		        loc.end = {
		            line: lineNumber,
		            column: index - lineStart
		        };
		
		        /* istanbul ignore next */
		        if (!extra.tokenize) {
		            // Pop the previous token, which is likely '/' or '/='
		            if (extra.tokens.length > 0) {
		                token = extra.tokens[extra.tokens.length - 1];
		                if (token.range[0] === pos && token.type === 'Punctuator') {
		                    if (token.value === '/' || token.value === '/=') {
		                        extra.tokens.pop();
		                    }
		                }
		            }
		
		            extra.tokens.push({
		                type: 'RegularExpression',
		                value: regex.literal,
		                range: [pos, index],
		                loc: loc
		            });
		        }
		
		        return regex;
		    }
		
		    function isIdentifierName(token) {
		        return token.type === Token.Identifier ||
		            token.type === Token.Keyword ||
		            token.type === Token.BooleanLiteral ||
		            token.type === Token.NullLiteral;
		    }
		
		    function advanceSlash() {
		        var prevToken,
		            checkToken;
		        // Using the following algorithm:
		        // https://github.com/mozilla/sweet.js/wiki/design
		        prevToken = extra.tokens[extra.tokens.length - 1];
		        if (!prevToken) {
		            // Nothing before that: it cannot be a division.
		            return collectRegex();
		        }
		        if (prevToken.type === 'Punctuator') {
		            if (prevToken.value === ']') {
		                return scanPunctuator();
		            }
		            if (prevToken.value === ')') {
		                checkToken = extra.tokens[extra.openParenToken - 1];
		                if (checkToken &&
		                        checkToken.type === 'Keyword' &&
		                        (checkToken.value === 'if' ||
		                         checkToken.value === 'while' ||
		                         checkToken.value === 'for' ||
		                         checkToken.value === 'with')) {
		                    return collectRegex();
		                }
		                return scanPunctuator();
		            }
		            if (prevToken.value === '}') {
		                // Dividing a function by anything makes little sense,
		                // but we have to check for that.
		                if (extra.tokens[extra.openCurlyToken - 3] &&
		                        extra.tokens[extra.openCurlyToken - 3].type === 'Keyword') {
		                    // Anonymous function.
		                    checkToken = extra.tokens[extra.openCurlyToken - 4];
		                    if (!checkToken) {
		                        return scanPunctuator();
		                    }
		                } else if (extra.tokens[extra.openCurlyToken - 4] &&
		                        extra.tokens[extra.openCurlyToken - 4].type === 'Keyword') {
		                    // Named function.
		                    checkToken = extra.tokens[extra.openCurlyToken - 5];
		                    if (!checkToken) {
		                        return collectRegex();
		                    }
		                } else {
		                    return scanPunctuator();
		                }
		                // checkToken determines whether the function is
		                // a declaration or an expression.
		                if (FnExprTokens.indexOf(checkToken.value) >= 0) {
		                    // It is an expression.
		                    return scanPunctuator();
		                }
		                // It is a declaration.
		                return collectRegex();
		            }
		            return collectRegex();
		        }
		        if (prevToken.type === 'Keyword' && prevToken.value !== 'this') {
		            return collectRegex();
		        }
		        return scanPunctuator();
		    }
		
		    function advance() {
		        var ch;
		
		        skipComment();
		
		        if (index >= length) {
		            return {
		                type: Token.EOF,
		                lineNumber: lineNumber,
		                lineStart: lineStart,
		                start: index,
		                end: index
		            };
		        }
		
		        ch = source.charCodeAt(index);
		
		        if (isIdentifierStart(ch)) {
		            return scanIdentifier();
		        }
		
		        // Very common: ( and ) and ;
		        if (ch === 0x28 || ch === 0x29 || ch === 0x3B) {
		            return scanPunctuator();
		        }
		
		        // String literal starts with single quote (U+0027) or double quote (U+0022).
		        if (ch === 0x27 || ch === 0x22) {
		            return scanStringLiteral();
		        }
		
		
		        // Dot (.) U+002E can also start a floating-point number, hence the need
		        // to check the next character.
		        if (ch === 0x2E) {
		            if (isDecimalDigit(source.charCodeAt(index + 1))) {
		                return scanNumericLiteral();
		            }
		            return scanPunctuator();
		        }
		
		        if (isDecimalDigit(ch)) {
		            return scanNumericLiteral();
		        }
		
		        // Slash (/) U+002F can also start a regex.
		        if (extra.tokenize && ch === 0x2F) {
		            return advanceSlash();
		        }
		
		        return scanPunctuator();
		    }
		
		    function collectToken() {
		        var loc, token, range, value;
		
		        skipComment();
		        loc = {
		            start: {
		                line: lineNumber,
		                column: index - lineStart
		            }
		        };
		
		        token = advance();
		        loc.end = {
		            line: lineNumber,
		            column: index - lineStart
		        };
		
		        if (token.type !== Token.EOF) {
		            value = source.slice(token.start, token.end);
		            extra.tokens.push({
		                type: TokenName[token.type],
		                value: value,
		                range: [token.start, token.end],
		                loc: loc
		            });
		        }
		
		        return token;
		    }
		
		    function lex() {
		        var token;
		
		        token = lookahead;
		        index = token.end;
		        lineNumber = token.lineNumber;
		        lineStart = token.lineStart;
		
		        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();
		
		        index = token.end;
		        lineNumber = token.lineNumber;
		        lineStart = token.lineStart;
		
		        return token;
		    }
		
		    function peek() {
		        var pos, line, start;
		
		        pos = index;
		        line = lineNumber;
		        start = lineStart;
		        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();
		        index = pos;
		        lineNumber = line;
		        lineStart = start;
		    }
		
		    function Position(line, column) {
		        this.line = line;
		        this.column = column;
		    }
		
		    function SourceLocation(startLine, startColumn, line, column) {
		        this.start = new Position(startLine, startColumn);
		        this.end = new Position(line, column);
		    }
		
		    SyntaxTreeDelegate = {
		
		        name: 'SyntaxTree',
		
		        processComment: function (node) {
		            var lastChild, trailingComments;
		
		            if (node.type === Syntax.Program) {
		                if (node.body.length > 0) {
		                    return;
		                }
		            }
		
		            if (extra.trailingComments.length > 0) {
		                if (extra.trailingComments[0].range[0] >= node.range[1]) {
		                    trailingComments = extra.trailingComments;
		                    extra.trailingComments = [];
		                } else {
		                    extra.trailingComments.length = 0;
		                }
		            } else {
		                if (extra.bottomRightStack.length > 0 &&
		                        extra.bottomRightStack[extra.bottomRightStack.length - 1].trailingComments &&
		                        extra.bottomRightStack[extra.bottomRightStack.length - 1].trailingComments[0].range[0] >= node.range[1]) {
		                    trailingComments = extra.bottomRightStack[extra.bottomRightStack.length - 1].trailingComments;
		                    delete extra.bottomRightStack[extra.bottomRightStack.length - 1].trailingComments;
		                }
		            }
		
		            // Eating the stack.
		            while (extra.bottomRightStack.length > 0 && extra.bottomRightStack[extra.bottomRightStack.length - 1].range[0] >= node.range[0]) {
		                lastChild = extra.bottomRightStack.pop();
		            }
		
		            if (lastChild) {
		                if (lastChild.leadingComments && lastChild.leadingComments[lastChild.leadingComments.length - 1].range[1] <= node.range[0]) {
		                    node.leadingComments = lastChild.leadingComments;
		                    delete lastChild.leadingComments;
		                }
		            } else if (extra.leadingComments.length > 0 && extra.leadingComments[extra.leadingComments.length - 1].range[1] <= node.range[0]) {
		                node.leadingComments = extra.leadingComments;
		                extra.leadingComments = [];
		            }
		
		
		            if (trailingComments) {
		                node.trailingComments = trailingComments;
		            }
		
		            extra.bottomRightStack.push(node);
		        },
		
		        markEnd: function (node, startToken) {
		            if (extra.range) {
		                node.range = [startToken.start, index];
		            }
		            if (extra.loc) {
		                node.loc = new SourceLocation(
		                    startToken.startLineNumber === undefined ?  startToken.lineNumber : startToken.startLineNumber,
		                    startToken.start - (startToken.startLineStart === undefined ?  startToken.lineStart : startToken.startLineStart),
		                    lineNumber,
		                    index - lineStart
		                );
		                this.postProcess(node);
		            }
		
		            if (extra.attachComment) {
		                this.processComment(node);
		            }
		            return node;
		        },
		
		        postProcess: function (node) {
		            if (extra.source) {
		                node.loc.source = extra.source;
		            }
		            return node;
		        },
		
		        createArrayExpression: function (elements) {
		            return {
		                type: Syntax.ArrayExpression,
		                elements: elements
		            };
		        },
		
		        createAssignmentExpression: function (operator, left, right) {
		            return {
		                type: Syntax.AssignmentExpression,
		                operator: operator,
		                left: left,
		                right: right
		            };
		        },
		
		        createBinaryExpression: function (operator, left, right) {
		            var type = (operator === '||' || operator === '&&') ? Syntax.LogicalExpression :
		                        Syntax.BinaryExpression;
		            return {
		                type: type,
		                operator: operator,
		                left: left,
		                right: right
		            };
		        },
		
		        createBlockStatement: function (body) {
		            return {
		                type: Syntax.BlockStatement,
		                body: body
		            };
		        },
		
		        createBreakStatement: function (label) {
		            return {
		                type: Syntax.BreakStatement,
		                label: label
		            };
		        },
		
		        createCallExpression: function (callee, args) {
		            return {
		                type: Syntax.CallExpression,
		                callee: callee,
		                'arguments': args
		            };
		        },
		
		        createCatchClause: function (param, body) {
		            return {
		                type: Syntax.CatchClause,
		                param: param,
		                body: body
		            };
		        },
		
		        createConditionalExpression: function (test, consequent, alternate) {
		            return {
		                type: Syntax.ConditionalExpression,
		                test: test,
		                consequent: consequent,
		                alternate: alternate
		            };
		        },
		
		        createContinueStatement: function (label) {
		            return {
		                type: Syntax.ContinueStatement,
		                label: label
		            };
		        },
		
		        createDebuggerStatement: function () {
		            return {
		                type: Syntax.DebuggerStatement
		            };
		        },
		
		        createDoWhileStatement: function (body, test) {
		            return {
		                type: Syntax.DoWhileStatement,
		                body: body,
		                test: test
		            };
		        },
		
		        createEmptyStatement: function () {
		            return {
		                type: Syntax.EmptyStatement
		            };
		        },
		
		        createExpressionStatement: function (expression) {
		            return {
		                type: Syntax.ExpressionStatement,
		                expression: expression
		            };
		        },
		
		        createForStatement: function (init, test, update, body) {
		            return {
		                type: Syntax.ForStatement,
		                init: init,
		                test: test,
		                update: update,
		                body: body
		            };
		        },
		
		        createForInStatement: function (left, right, body) {
		            return {
		                type: Syntax.ForInStatement,
		                left: left,
		                right: right,
		                body: body,
		                each: false
		            };
		        },
		
		        createFunctionDeclaration: function (id, params, defaults, body) {
		            return {
		                type: Syntax.FunctionDeclaration,
		                id: id,
		                params: params,
		                defaults: defaults,
		                body: body,
		                rest: null,
		                generator: false,
		                expression: false
		            };
		        },
		
		        createFunctionExpression: function (id, params, defaults, body) {
		            return {
		                type: Syntax.FunctionExpression,
		                id: id,
		                params: params,
		                defaults: defaults,
		                body: body,
		                rest: null,
		                generator: false,
		                expression: false
		            };
		        },
		
		        createIdentifier: function (name) {
		            return {
		                type: Syntax.Identifier,
		                name: name
		            };
		        },
		
		        createIfStatement: function (test, consequent, alternate) {
		            return {
		                type: Syntax.IfStatement,
		                test: test,
		                consequent: consequent,
		                alternate: alternate
		            };
		        },
		
		        createLabeledStatement: function (label, body) {
		            return {
		                type: Syntax.LabeledStatement,
		                label: label,
		                body: body
		            };
		        },
		
		        createLiteral: function (token) {
		            return {
		                type: Syntax.Literal,
		                value: token.value,
		                raw: source.slice(token.start, token.end)
		            };
		        },
		
		        createMemberExpression: function (accessor, object, property) {
		            return {
		                type: Syntax.MemberExpression,
		                computed: accessor === '[',
		                object: object,
		                property: property
		            };
		        },
		
		        createNewExpression: function (callee, args) {
		            return {
		                type: Syntax.NewExpression,
		                callee: callee,
		                'arguments': args
		            };
		        },
		
		        createObjectExpression: function (properties) {
		            return {
		                type: Syntax.ObjectExpression,
		                properties: properties
		            };
		        },
		
		        createPostfixExpression: function (operator, argument) {
		            return {
		                type: Syntax.UpdateExpression,
		                operator: operator,
		                argument: argument,
		                prefix: false
		            };
		        },
		
		        createProgram: function (body) {
		            return {
		                type: Syntax.Program,
		                body: body
		            };
		        },
		
		        createProperty: function (kind, key, value) {
		            return {
		                type: Syntax.Property,
		                key: key,
		                value: value,
		                kind: kind
		            };
		        },
		
		        createReturnStatement: function (argument) {
		            return {
		                type: Syntax.ReturnStatement,
		                argument: argument
		            };
		        },
		
		        createSequenceExpression: function (expressions) {
		            return {
		                type: Syntax.SequenceExpression,
		                expressions: expressions
		            };
		        },
		
		        createSwitchCase: function (test, consequent) {
		            return {
		                type: Syntax.SwitchCase,
		                test: test,
		                consequent: consequent
		            };
		        },
		
		        createSwitchStatement: function (discriminant, cases) {
		            return {
		                type: Syntax.SwitchStatement,
		                discriminant: discriminant,
		                cases: cases
		            };
		        },
		
		        createThisExpression: function () {
		            return {
		                type: Syntax.ThisExpression
		            };
		        },
		
		        createThrowStatement: function (argument) {
		            return {
		                type: Syntax.ThrowStatement,
		                argument: argument
		            };
		        },
		
		        createTryStatement: function (block, guardedHandlers, handlers, finalizer) {
		            return {
		                type: Syntax.TryStatement,
		                block: block,
		                guardedHandlers: guardedHandlers,
		                handlers: handlers,
		                finalizer: finalizer
		            };
		        },
		
		        createUnaryExpression: function (operator, argument) {
		            if (operator === '++' || operator === '--') {
		                return {
		                    type: Syntax.UpdateExpression,
		                    operator: operator,
		                    argument: argument,
		                    prefix: true
		                };
		            }
		            return {
		                type: Syntax.UnaryExpression,
		                operator: operator,
		                argument: argument,
		                prefix: true
		            };
		        },
		
		        createVariableDeclaration: function (declarations, kind) {
		            return {
		                type: Syntax.VariableDeclaration,
		                declarations: declarations,
		                kind: kind
		            };
		        },
		
		        createVariableDeclarator: function (id, init) {
		            return {
		                type: Syntax.VariableDeclarator,
		                id: id,
		                init: init
		            };
		        },
		
		        createWhileStatement: function (test, body) {
		            return {
		                type: Syntax.WhileStatement,
		                test: test,
		                body: body
		            };
		        },
		
		        createWithStatement: function (object, body) {
		            return {
		                type: Syntax.WithStatement,
		                object: object,
		                body: body
		            };
		        }
		    };
		
		    // Return true if there is a line terminator before the next token.
		
		    function peekLineTerminator() {
		        var pos, line, start, found;
		
		        pos = index;
		        line = lineNumber;
		        start = lineStart;
		        skipComment();
		        found = lineNumber !== line;
		        index = pos;
		        lineNumber = line;
		        lineStart = start;
		
		        return found;
		    }
		
		    // Throw an exception
		
		    function throwError(token, messageFormat) {
		        var error,
		            args = Array.prototype.slice.call(arguments, 2),
		            msg = messageFormat.replace(
		                /%(\d)/g,
		                function (whole, index) {
		                    assert(index < args.length, 'Message reference must be in range');
		                    return args[index];
		                }
		            );
		
		        if (typeof token.lineNumber === 'number') {
		            error = new Error('Line ' + token.lineNumber + ': ' + msg);
		            error.index = token.start;
		            error.lineNumber = token.lineNumber;
		            error.column = token.start - lineStart + 1;
		        } else {
		            error = new Error('Line ' + lineNumber + ': ' + msg);
		            error.index = index;
		            error.lineNumber = lineNumber;
		            error.column = index - lineStart + 1;
		        }
		
		        error.description = msg;
		        throw error;
		    }
		
		    function throwErrorTolerant() {
		        try {
		            throwError.apply(null, arguments);
		        } catch (e) {
		            if (extra.errors) {
		                extra.errors.push(e);
		            } else {
		                throw e;
		            }
		        }
		    }
		
		
		    // Throw an exception because of the token.
		
		    function throwUnexpected(token) {
		        if (token.type === Token.EOF) {
		            throwError(token, Messages.UnexpectedEOS);
		        }
		
		        if (token.type === Token.NumericLiteral) {
		            throwError(token, Messages.UnexpectedNumber);
		        }
		
		        if (token.type === Token.StringLiteral) {
		            throwError(token, Messages.UnexpectedString);
		        }
		
		        if (token.type === Token.Identifier) {
		            throwError(token, Messages.UnexpectedIdentifier);
		        }
		
		        if (token.type === Token.Keyword) {
		            if (isFutureReservedWord(token.value)) {
		                throwError(token, Messages.UnexpectedReserved);
		            } else if (strict && isStrictModeReservedWord(token.value)) {
		                throwErrorTolerant(token, Messages.StrictReservedWord);
		                return;
		            }
		            throwError(token, Messages.UnexpectedToken, token.value);
		        }
		
		        // BooleanLiteral, NullLiteral, or Punctuator.
		        throwError(token, Messages.UnexpectedToken, token.value);
		    }
		
		    // Expect the next token to match the specified punctuator.
		    // If not, an exception will be thrown.
		
		    function expect(value) {
		        var token = lex();
		        if (token.type !== Token.Punctuator || token.value !== value) {
		            throwUnexpected(token);
		        }
		    }
		
		    // Expect the next token to match the specified keyword.
		    // If not, an exception will be thrown.
		
		    function expectKeyword(keyword) {
		        var token = lex();
		        if (token.type !== Token.Keyword || token.value !== keyword) {
		            throwUnexpected(token);
		        }
		    }
		
		    // Return true if the next token matches the specified punctuator.
		
		    function match(value) {
		        return lookahead.type === Token.Punctuator && lookahead.value === value;
		    }
		
		    // Return true if the next token matches the specified keyword
		
		    function matchKeyword(keyword) {
		        return lookahead.type === Token.Keyword && lookahead.value === keyword;
		    }
		
		    // Return true if the next token is an assignment operator
		
		    function matchAssign() {
		        var op;
		
		        if (lookahead.type !== Token.Punctuator) {
		            return false;
		        }
		        op = lookahead.value;
		        return op === '=' ||
		            op === '*=' ||
		            op === '/=' ||
		            op === '%=' ||
		            op === '+=' ||
		            op === '-=' ||
		            op === '<<=' ||
		            op === '>>=' ||
		            op === '>>>=' ||
		            op === '&=' ||
		            op === '^=' ||
		            op === '|=';
		    }
		
		    function consumeSemicolon() {
		        var line, oldIndex = index, oldLineNumber = lineNumber,
		            oldLineStart = lineStart, oldLookahead = lookahead;
		
		        // Catch the very common case first: immediately a semicolon (U+003B).
		        if (source.charCodeAt(index) === 0x3B || match(';')) {
		            lex();
		            return;
		        }
		
		        line = lineNumber;
		        skipComment();
		        if (lineNumber !== line) {
		            index = oldIndex;
		            lineNumber = oldLineNumber;
		            lineStart = oldLineStart;
		            lookahead = oldLookahead;
		            return;
		        }
		
		        if (lookahead.type !== Token.EOF && !match('}')) {
		            throwUnexpected(lookahead);
		        }
		    }
		
		    // Return true if provided expression is LeftHandSideExpression
		
		    function isLeftHandSide(expr) {
		        return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;
		    }
		
		    // 11.1.4 Array Initialiser
		
		    function parseArrayInitialiser() {
		        var elements = [], startToken;
		
		        startToken = lookahead;
		        expect('[');
		
		        while (!match(']')) {
		            if (match(',')) {
		                lex();
		                elements.push(null);
		            } else {
		                elements.push(parseAssignmentExpression());
		
		                if (!match(']')) {
		                    expect(',');
		                }
		            }
		        }
		
		        lex();
		
		        return delegate.markEnd(delegate.createArrayExpression(elements), startToken);
		    }
		
		    // 11.1.5 Object Initialiser
		
		    function parsePropertyFunction(param, first) {
		        var previousStrict, body, startToken;
		
		        previousStrict = strict;
		        startToken = lookahead;
		        body = parseFunctionSourceElements();
		        if (first && strict && isRestrictedWord(param[0].name)) {
		            throwErrorTolerant(first, Messages.StrictParamName);
		        }
		        strict = previousStrict;
		        return delegate.markEnd(delegate.createFunctionExpression(null, param, [], body), startToken);
		    }
		
		    function parseObjectPropertyKey() {
		        var token, startToken;
		
		        startToken = lookahead;
		        token = lex();
		
		        // Note: This function is called only from parseObjectProperty(), where
		        // EOF and Punctuator tokens are already filtered out.
		
		        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
		            if (strict && token.octal) {
		                throwErrorTolerant(token, Messages.StrictOctalLiteral);
		            }
		            return delegate.markEnd(delegate.createLiteral(token), startToken);
		        }
		
		        return delegate.markEnd(delegate.createIdentifier(token.value), startToken);
		    }
		
		    function parseObjectProperty() {
		        var token, key, id, value, param, startToken;
		
		        token = lookahead;
		        startToken = lookahead;
		
		        if (token.type === Token.Identifier) {
		
		            id = parseObjectPropertyKey();
		
		            // Property Assignment: Getter and Setter.
		
		            if (token.value === 'get' && !match(':')) {
		                key = parseObjectPropertyKey();
		                expect('(');
		                expect(')');
		                value = parsePropertyFunction([]);
		                return delegate.markEnd(delegate.createProperty('get', key, value), startToken);
		            }
		            if (token.value === 'set' && !match(':')) {
		                key = parseObjectPropertyKey();
		                expect('(');
		                token = lookahead;
		                if (token.type !== Token.Identifier) {
		                    expect(')');
		                    throwErrorTolerant(token, Messages.UnexpectedToken, token.value);
		                    value = parsePropertyFunction([]);
		                } else {
		                    param = [ parseVariableIdentifier() ];
		                    expect(')');
		                    value = parsePropertyFunction(param, token);
		                }
		                return delegate.markEnd(delegate.createProperty('set', key, value), startToken);
		            }
		            expect(':');
		            value = parseAssignmentExpression();
		            return delegate.markEnd(delegate.createProperty('init', id, value), startToken);
		        }
		        if (token.type === Token.EOF || token.type === Token.Punctuator) {
		            throwUnexpected(token);
		        } else {
		            key = parseObjectPropertyKey();
		            expect(':');
		            value = parseAssignmentExpression();
		            return delegate.markEnd(delegate.createProperty('init', key, value), startToken);
		        }
		    }
		
		    function parseObjectInitialiser() {
		        var properties = [], property, name, key, kind, map = {}, toString = String, startToken;
		
		        startToken = lookahead;
		
		        expect('{');
		
		        while (!match('}')) {
		            property = parseObjectProperty();
		
		            if (property.key.type === Syntax.Identifier) {
		                name = property.key.name;
		            } else {
		                name = toString(property.key.value);
		            }
		            kind = (property.kind === 'init') ? PropertyKind.Data : (property.kind === 'get') ? PropertyKind.Get : PropertyKind.Set;
		
		            key = '$' + name;
		            if (Object.prototype.hasOwnProperty.call(map, key)) {
		                if (map[key] === PropertyKind.Data) {
		                    if (strict && kind === PropertyKind.Data) {
		                        throwErrorTolerant({}, Messages.StrictDuplicateProperty);
		                    } else if (kind !== PropertyKind.Data) {
		                        throwErrorTolerant({}, Messages.AccessorDataProperty);
		                    }
		                } else {
		                    if (kind === PropertyKind.Data) {
		                        throwErrorTolerant({}, Messages.AccessorDataProperty);
		                    } else if (map[key] & kind) {
		                        throwErrorTolerant({}, Messages.AccessorGetSet);
		                    }
		                }
		                map[key] |= kind;
		            } else {
		                map[key] = kind;
		            }
		
		            properties.push(property);
		
		            if (!match('}')) {
		                expect(',');
		            }
		        }
		
		        expect('}');
		
		        return delegate.markEnd(delegate.createObjectExpression(properties), startToken);
		    }
		
		    // 11.1.6 The Grouping Operator
		
		    function parseGroupExpression() {
		        var expr;
		
		        expect('(');
		
		        expr = parseExpression();
		
		        expect(')');
		
		        return expr;
		    }
		
		
		    // 11.1 Primary Expressions
		
		    function parsePrimaryExpression() {
		        var type, token, expr, startToken;
		
		        if (match('(')) {
		            return parseGroupExpression();
		        }
		
		        if (match('[')) {
		            return parseArrayInitialiser();
		        }
		
		        if (match('{')) {
		            return parseObjectInitialiser();
		        }
		
		        type = lookahead.type;
		        startToken = lookahead;
		
		        if (type === Token.Identifier) {
		            expr =  delegate.createIdentifier(lex().value);
		        } else if (type === Token.StringLiteral || type === Token.NumericLiteral) {
		            if (strict && lookahead.octal) {
		                throwErrorTolerant(lookahead, Messages.StrictOctalLiteral);
		            }
		            expr = delegate.createLiteral(lex());
		        } else if (type === Token.Keyword) {
		            if (matchKeyword('function')) {
		                return parseFunctionExpression();
		            }
		            if (matchKeyword('this')) {
		                lex();
		                expr = delegate.createThisExpression();
		            } else {
		                throwUnexpected(lex());
		            }
		        } else if (type === Token.BooleanLiteral) {
		            token = lex();
		            token.value = (token.value === 'true');
		            expr = delegate.createLiteral(token);
		        } else if (type === Token.NullLiteral) {
		            token = lex();
		            token.value = null;
		            expr = delegate.createLiteral(token);
		        } else if (match('/') || match('/=')) {
		            if (typeof extra.tokens !== 'undefined') {
		                expr = delegate.createLiteral(collectRegex());
		            } else {
		                expr = delegate.createLiteral(scanRegExp());
		            }
		            peek();
		        } else {
		            throwUnexpected(lex());
		        }
		
		        return delegate.markEnd(expr, startToken);
		    }
		
		    // 11.2 Left-Hand-Side Expressions
		
		    function parseArguments() {
		        var args = [];
		
		        expect('(');
		
		        if (!match(')')) {
		            while (index < length) {
		                args.push(parseAssignmentExpression());
		                if (match(')')) {
		                    break;
		                }
		                expect(',');
		            }
		        }
		
		        expect(')');
		
		        return args;
		    }
		
		    function parseNonComputedProperty() {
		        var token, startToken;
		
		        startToken = lookahead;
		        token = lex();
		
		        if (!isIdentifierName(token)) {
		            throwUnexpected(token);
		        }
		
		        return delegate.markEnd(delegate.createIdentifier(token.value), startToken);
		    }
		
		    function parseNonComputedMember() {
		        expect('.');
		
		        return parseNonComputedProperty();
		    }
		
		    function parseComputedMember() {
		        var expr;
		
		        expect('[');
		
		        expr = parseExpression();
		
		        expect(']');
		
		        return expr;
		    }
		
		    function parseNewExpression() {
		        var callee, args, startToken;
		
		        startToken = lookahead;
		        expectKeyword('new');
		        callee = parseLeftHandSideExpression();
		        args = match('(') ? parseArguments() : [];
		
		        return delegate.markEnd(delegate.createNewExpression(callee, args), startToken);
		    }
		
		    function parseLeftHandSideExpressionAllowCall() {
		        var expr, args, property, startToken, previousAllowIn = state.allowIn;
		
		        startToken = lookahead;
		        state.allowIn = true;
		        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
		
		        for (;;) {
		            if (match('.')) {
		                property = parseNonComputedMember();
		                expr = delegate.createMemberExpression('.', expr, property);
		            } else if (match('(')) {
		                args = parseArguments();
		                expr = delegate.createCallExpression(expr, args);
		            } else if (match('[')) {
		                property = parseComputedMember();
		                expr = delegate.createMemberExpression('[', expr, property);
		            } else {
		                break;
		            }
		            delegate.markEnd(expr, startToken);
		        }
		        state.allowIn = previousAllowIn;
		
		        return expr;
		    }
		
		    function parseLeftHandSideExpression() {
		        var expr, property, startToken;
		        assert(state.allowIn, 'callee of new expression always allow in keyword.');
		
		        startToken = lookahead;
		
		        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
		
		        while (match('.') || match('[')) {
		            if (match('[')) {
		                property = parseComputedMember();
		                expr = delegate.createMemberExpression('[', expr, property);
		            } else {
		                property = parseNonComputedMember();
		                expr = delegate.createMemberExpression('.', expr, property);
		            }
		            delegate.markEnd(expr, startToken);
		        }
		        return expr;
		    }
		
		    // 11.3 Postfix Expressions
		
		    function parsePostfixExpression() {
		        var expr, token, startToken = lookahead;
		
		        expr = parseLeftHandSideExpressionAllowCall();
		
		        if (lookahead.type === Token.Punctuator) {
		            if ((match('++') || match('--')) && !peekLineTerminator()) {
		                // 11.3.1, 11.3.2
		                if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
		                    throwErrorTolerant({}, Messages.StrictLHSPostfix);
		                }
		
		                if (!isLeftHandSide(expr)) {
		                    throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
		                }
		
		                token = lex();
		                expr = delegate.markEnd(delegate.createPostfixExpression(token.value, expr), startToken);
		            }
		        }
		
		        return expr;
		    }
		
		    // 11.4 Unary Operators
		
		    function parseUnaryExpression() {
		        var token, expr, startToken;
		
		        if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
		            expr = parsePostfixExpression();
		        } else if (match('++') || match('--')) {
		            startToken = lookahead;
		            token = lex();
		            expr = parseUnaryExpression();
		            // 11.4.4, 11.4.5
		            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
		                throwErrorTolerant({}, Messages.StrictLHSPrefix);
		            }
		
		            if (!isLeftHandSide(expr)) {
		                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
		            }
		
		            expr = delegate.createUnaryExpression(token.value, expr);
		            expr = delegate.markEnd(expr, startToken);
		        } else if (match('+') || match('-') || match('~') || match('!')) {
		            startToken = lookahead;
		            token = lex();
		            expr = parseUnaryExpression();
		            expr = delegate.createUnaryExpression(token.value, expr);
		            expr = delegate.markEnd(expr, startToken);
		        } else if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
		            startToken = lookahead;
		            token = lex();
		            expr = parseUnaryExpression();
		            expr = delegate.createUnaryExpression(token.value, expr);
		            expr = delegate.markEnd(expr, startToken);
		            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
		                throwErrorTolerant({}, Messages.StrictDelete);
		            }
		        } else {
		            expr = parsePostfixExpression();
		        }
		
		        return expr;
		    }
		
		    function binaryPrecedence(token, allowIn) {
		        var prec = 0;
		
		        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
		            return 0;
		        }
		
		        switch (token.value) {
		        case '||':
		            prec = 1;
		            break;
		
		        case '&&':
		            prec = 2;
		            break;
		
		        case '|':
		            prec = 3;
		            break;
		
		        case '^':
		            prec = 4;
		            break;
		
		        case '&':
		            prec = 5;
		            break;
		
		        case '==':
		        case '!=':
		        case '===':
		        case '!==':
		            prec = 6;
		            break;
		
		        case '<':
		        case '>':
		        case '<=':
		        case '>=':
		        case 'instanceof':
		            prec = 7;
		            break;
		
		        case 'in':
		            prec = allowIn ? 7 : 0;
		            break;
		
		        case '<<':
		        case '>>':
		        case '>>>':
		            prec = 8;
		            break;
		
		        case '+':
		        case '-':
		            prec = 9;
		            break;
		
		        case '*':
		        case '/':
		        case '%':
		            prec = 11;
		            break;
		
		        default:
		            break;
		        }
		
		        return prec;
		    }
		
		    // 11.5 Multiplicative Operators
		    // 11.6 Additive Operators
		    // 11.7 Bitwise Shift Operators
		    // 11.8 Relational Operators
		    // 11.9 Equality Operators
		    // 11.10 Binary Bitwise Operators
		    // 11.11 Binary Logical Operators
		
		    function parseBinaryExpression() {
		        var marker, markers, expr, token, prec, stack, right, operator, left, i;
		
		        marker = lookahead;
		        left = parseUnaryExpression();
		
		        token = lookahead;
		        prec = binaryPrecedence(token, state.allowIn);
		        if (prec === 0) {
		            return left;
		        }
		        token.prec = prec;
		        lex();
		
		        markers = [marker, lookahead];
		        right = parseUnaryExpression();
		
		        stack = [left, token, right];
		
		        while ((prec = binaryPrecedence(lookahead, state.allowIn)) > 0) {
		
		            // Reduce: make a binary expression from the three topmost entries.
		            while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
		                right = stack.pop();
		                operator = stack.pop().value;
		                left = stack.pop();
		                expr = delegate.createBinaryExpression(operator, left, right);
		                markers.pop();
		                marker = markers[markers.length - 1];
		                delegate.markEnd(expr, marker);
		                stack.push(expr);
		            }
		
		            // Shift.
		            token = lex();
		            token.prec = prec;
		            stack.push(token);
		            markers.push(lookahead);
		            expr = parseUnaryExpression();
		            stack.push(expr);
		        }
		
		        // Final reduce to clean-up the stack.
		        i = stack.length - 1;
		        expr = stack[i];
		        markers.pop();
		        while (i > 1) {
		            expr = delegate.createBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
		            i -= 2;
		            marker = markers.pop();
		            delegate.markEnd(expr, marker);
		        }
		
		        return expr;
		    }
		
		
		    // 11.12 Conditional Operator
		
		    function parseConditionalExpression() {
		        var expr, previousAllowIn, consequent, alternate, startToken;
		
		        startToken = lookahead;
		
		        expr = parseBinaryExpression();
		
		        if (match('?')) {
		            lex();
		            previousAllowIn = state.allowIn;
		            state.allowIn = true;
		            consequent = parseAssignmentExpression();
		            state.allowIn = previousAllowIn;
		            expect(':');
		            alternate = parseAssignmentExpression();
		
		            expr = delegate.createConditionalExpression(expr, consequent, alternate);
		            delegate.markEnd(expr, startToken);
		        }
		
		        return expr;
		    }
		
		    // 11.13 Assignment Operators
		
		    function parseAssignmentExpression() {
		        var token, left, right, node, startToken;
		
		        token = lookahead;
		        startToken = lookahead;
		
		        node = left = parseConditionalExpression();
		
		        if (matchAssign()) {
		            // LeftHandSideExpression
		            if (!isLeftHandSide(left)) {
		                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
		            }
		
		            // 11.13.1
		            if (strict && left.type === Syntax.Identifier && isRestrictedWord(left.name)) {
		                throwErrorTolerant(token, Messages.StrictLHSAssignment);
		            }
		
		            token = lex();
		            right = parseAssignmentExpression();
		            node = delegate.markEnd(delegate.createAssignmentExpression(token.value, left, right), startToken);
		        }
		
		        return node;
		    }
		
		    // 11.14 Comma Operator
		
		    function parseExpression() {
		        var expr, startToken = lookahead;
		
		        expr = parseAssignmentExpression();
		
		        if (match(',')) {
		            expr = delegate.createSequenceExpression([ expr ]);
		
		            while (index < length) {
		                if (!match(',')) {
		                    break;
		                }
		                lex();
		                expr.expressions.push(parseAssignmentExpression());
		            }
		
		            delegate.markEnd(expr, startToken);
		        }
		
		        return expr;
		    }
		
		    // 12.1 Block
		
		    function parseStatementList() {
		        var list = [],
		            statement;
		
		        while (index < length) {
		            if (match('}')) {
		                break;
		            }
		            statement = parseSourceElement();
		            if (typeof statement === 'undefined') {
		                break;
		            }
		            list.push(statement);
		        }
		
		        return list;
		    }
		
		    function parseBlock() {
		        var block, startToken;
		
		        startToken = lookahead;
		        expect('{');
		
		        block = parseStatementList();
		
		        expect('}');
		
		        return delegate.markEnd(delegate.createBlockStatement(block), startToken);
		    }
		
		    // 12.2 Variable Statement
		
		    function parseVariableIdentifier() {
		        var token, startToken;
		
		        startToken = lookahead;
		        token = lex();
		
		        if (token.type !== Token.Identifier) {
		            throwUnexpected(token);
		        }
		
		        return delegate.markEnd(delegate.createIdentifier(token.value), startToken);
		    }
		
		    function parseVariableDeclaration(kind) {
		        var init = null, id, startToken;
		
		        startToken = lookahead;
		        id = parseVariableIdentifier();
		
		        // 12.2.1
		        if (strict && isRestrictedWord(id.name)) {
		            throwErrorTolerant({}, Messages.StrictVarName);
		        }
		
		        if (kind === 'const') {
		            expect('=');
		            init = parseAssignmentExpression();
		        } else if (match('=')) {
		            lex();
		            init = parseAssignmentExpression();
		        }
		
		        return delegate.markEnd(delegate.createVariableDeclarator(id, init), startToken);
		    }
		
		    function parseVariableDeclarationList(kind) {
		        var list = [];
		
		        do {
		            list.push(parseVariableDeclaration(kind));
		            if (!match(',')) {
		                break;
		            }
		            lex();
		        } while (index < length);
		
		        return list;
		    }
		
		    function parseVariableStatement() {
		        var declarations;
		
		        expectKeyword('var');
		
		        declarations = parseVariableDeclarationList();
		
		        consumeSemicolon();
		
		        return delegate.createVariableDeclaration(declarations, 'var');
		    }
		
		    // kind may be `const` or `let`
		    // Both are experimental and not in the specification yet.
		    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
		    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
		    function parseConstLetDeclaration(kind) {
		        var declarations, startToken;
		
		        startToken = lookahead;
		
		        expectKeyword(kind);
		
		        declarations = parseVariableDeclarationList(kind);
		
		        consumeSemicolon();
		
		        return delegate.markEnd(delegate.createVariableDeclaration(declarations, kind), startToken);
		    }
		
		    // 12.3 Empty Statement
		
		    function parseEmptyStatement() {
		        expect(';');
		        return delegate.createEmptyStatement();
		    }
		
		    // 12.4 Expression Statement
		
		    function parseExpressionStatement() {
		        var expr = parseExpression();
		        consumeSemicolon();
		        return delegate.createExpressionStatement(expr);
		    }
		
		    // 12.5 If statement
		
		    function parseIfStatement() {
		        var test, consequent, alternate;
		
		        expectKeyword('if');
		
		        expect('(');
		
		        test = parseExpression();
		
		        expect(')');
		
		        consequent = parseStatement();
		
		        if (matchKeyword('else')) {
		            lex();
		            alternate = parseStatement();
		        } else {
		            alternate = null;
		        }
		
		        return delegate.createIfStatement(test, consequent, alternate);
		    }
		
		    // 12.6 Iteration Statements
		
		    function parseDoWhileStatement() {
		        var body, test, oldInIteration;
		
		        expectKeyword('do');
		
		        oldInIteration = state.inIteration;
		        state.inIteration = true;
		
		        body = parseStatement();
		
		        state.inIteration = oldInIteration;
		
		        expectKeyword('while');
		
		        expect('(');
		
		        test = parseExpression();
		
		        expect(')');
		
		        if (match(';')) {
		            lex();
		        }
		
		        return delegate.createDoWhileStatement(body, test);
		    }
		
		    function parseWhileStatement() {
		        var test, body, oldInIteration;
		
		        expectKeyword('while');
		
		        expect('(');
		
		        test = parseExpression();
		
		        expect(')');
		
		        oldInIteration = state.inIteration;
		        state.inIteration = true;
		
		        body = parseStatement();
		
		        state.inIteration = oldInIteration;
		
		        return delegate.createWhileStatement(test, body);
		    }
		
		    function parseForVariableDeclaration() {
		        var token, declarations, startToken;
		
		        startToken = lookahead;
		        token = lex();
		        declarations = parseVariableDeclarationList();
		
		        return delegate.markEnd(delegate.createVariableDeclaration(declarations, token.value), startToken);
		    }
		
		    function parseForStatement() {
		        var init, test, update, left, right, body, oldInIteration, previousAllowIn = state.allowIn;
		
		        init = test = update = null;
		
		        expectKeyword('for');
		
		        expect('(');
		
		        if (match(';')) {
		            lex();
		        } else {
		            if (matchKeyword('var') || matchKeyword('let')) {
		                state.allowIn = false;
		                init = parseForVariableDeclaration();
		                state.allowIn = previousAllowIn;
		
		                if (init.declarations.length === 1 && matchKeyword('in')) {
		                    lex();
		                    left = init;
		                    right = parseExpression();
		                    init = null;
		                }
		            } else {
		                state.allowIn = false;
		                init = parseExpression();
		                state.allowIn = previousAllowIn;
		
		                if (matchKeyword('in')) {
		                    // LeftHandSideExpression
		                    if (!isLeftHandSide(init)) {
		                        throwErrorTolerant({}, Messages.InvalidLHSInForIn);
		                    }
		
		                    lex();
		                    left = init;
		                    right = parseExpression();
		                    init = null;
		                }
		            }
		
		            if (typeof left === 'undefined') {
		                expect(';');
		            }
		        }
		
		        if (typeof left === 'undefined') {
		
		            if (!match(';')) {
		                test = parseExpression();
		            }
		            expect(';');
		
		            if (!match(')')) {
		                update = parseExpression();
		            }
		        }
		
		        expect(')');
		
		        oldInIteration = state.inIteration;
		        state.inIteration = true;
		
		        body = parseStatement();
		
		        state.inIteration = oldInIteration;
		
		        return (typeof left === 'undefined') ?
		                delegate.createForStatement(init, test, update, body) :
		                delegate.createForInStatement(left, right, body);
		    }
		
		    // 12.7 The continue statement
		
		    function parseContinueStatement() {
		        var label = null, key;
		
		        expectKeyword('continue');
		
		        // Optimize the most common form: 'continue;'.
		        if (source.charCodeAt(index) === 0x3B) {
		            lex();
		
		            if (!state.inIteration) {
		                throwError({}, Messages.IllegalContinue);
		            }
		
		            return delegate.createContinueStatement(null);
		        }
		
		        if (peekLineTerminator()) {
		            if (!state.inIteration) {
		                throwError({}, Messages.IllegalContinue);
		            }
		
		            return delegate.createContinueStatement(null);
		        }
		
		        if (lookahead.type === Token.Identifier) {
		            label = parseVariableIdentifier();
		
		            key = '$' + label.name;
		            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
		                throwError({}, Messages.UnknownLabel, label.name);
		            }
		        }
		
		        consumeSemicolon();
		
		        if (label === null && !state.inIteration) {
		            throwError({}, Messages.IllegalContinue);
		        }
		
		        return delegate.createContinueStatement(label);
		    }
		
		    // 12.8 The break statement
		
		    function parseBreakStatement() {
		        var label = null, key;
		
		        expectKeyword('break');
		
		        // Catch the very common case first: immediately a semicolon (U+003B).
		        if (source.charCodeAt(index) === 0x3B) {
		            lex();
		
		            if (!(state.inIteration || state.inSwitch)) {
		                throwError({}, Messages.IllegalBreak);
		            }
		
		            return delegate.createBreakStatement(null);
		        }
		
		        if (peekLineTerminator()) {
		            if (!(state.inIteration || state.inSwitch)) {
		                throwError({}, Messages.IllegalBreak);
		            }
		
		            return delegate.createBreakStatement(null);
		        }
		
		        if (lookahead.type === Token.Identifier) {
		            label = parseVariableIdentifier();
		
		            key = '$' + label.name;
		            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
		                throwError({}, Messages.UnknownLabel, label.name);
		            }
		        }
		
		        consumeSemicolon();
		
		        if (label === null && !(state.inIteration || state.inSwitch)) {
		            throwError({}, Messages.IllegalBreak);
		        }
		
		        return delegate.createBreakStatement(label);
		    }
		
		    // 12.9 The return statement
		
		    function parseReturnStatement() {
		        var argument = null;
		
		        expectKeyword('return');
		
		        if (!state.inFunctionBody) {
		            throwErrorTolerant({}, Messages.IllegalReturn);
		        }
		
		        // 'return' followed by a space and an identifier is very common.
		        if (source.charCodeAt(index) === 0x20) {
		            if (isIdentifierStart(source.charCodeAt(index + 1))) {
		                argument = parseExpression();
		                consumeSemicolon();
		                return delegate.createReturnStatement(argument);
		            }
		        }
		
		        if (peekLineTerminator()) {
		            return delegate.createReturnStatement(null);
		        }
		
		        if (!match(';')) {
		            if (!match('}') && lookahead.type !== Token.EOF) {
		                argument = parseExpression();
		            }
		        }
		
		        consumeSemicolon();
		
		        return delegate.createReturnStatement(argument);
		    }
		
		    // 12.10 The with statement
		
		    function parseWithStatement() {
		        var object, body;
		
		        if (strict) {
		            // TODO(ikarienator): Should we update the test cases instead?
		            skipComment();
		            throwErrorTolerant({}, Messages.StrictModeWith);
		        }
		
		        expectKeyword('with');
		
		        expect('(');
		
		        object = parseExpression();
		
		        expect(')');
		
		        body = parseStatement();
		
		        return delegate.createWithStatement(object, body);
		    }
		
		    // 12.10 The swith statement
		
		    function parseSwitchCase() {
		        var test, consequent = [], statement, startToken;
		
		        startToken = lookahead;
		        if (matchKeyword('default')) {
		            lex();
		            test = null;
		        } else {
		            expectKeyword('case');
		            test = parseExpression();
		        }
		        expect(':');
		
		        while (index < length) {
		            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
		                break;
		            }
		            statement = parseStatement();
		            consequent.push(statement);
		        }
		
		        return delegate.markEnd(delegate.createSwitchCase(test, consequent), startToken);
		    }
		
		    function parseSwitchStatement() {
		        var discriminant, cases, clause, oldInSwitch, defaultFound;
		
		        expectKeyword('switch');
		
		        expect('(');
		
		        discriminant = parseExpression();
		
		        expect(')');
		
		        expect('{');
		
		        cases = [];
		
		        if (match('}')) {
		            lex();
		            return delegate.createSwitchStatement(discriminant, cases);
		        }
		
		        oldInSwitch = state.inSwitch;
		        state.inSwitch = true;
		        defaultFound = false;
		
		        while (index < length) {
		            if (match('}')) {
		                break;
		            }
		            clause = parseSwitchCase();
		            if (clause.test === null) {
		                if (defaultFound) {
		                    throwError({}, Messages.MultipleDefaultsInSwitch);
		                }
		                defaultFound = true;
		            }
		            cases.push(clause);
		        }
		
		        state.inSwitch = oldInSwitch;
		
		        expect('}');
		
		        return delegate.createSwitchStatement(discriminant, cases);
		    }
		
		    // 12.13 The throw statement
		
		    function parseThrowStatement() {
		        var argument;
		
		        expectKeyword('throw');
		
		        if (peekLineTerminator()) {
		            throwError({}, Messages.NewlineAfterThrow);
		        }
		
		        argument = parseExpression();
		
		        consumeSemicolon();
		
		        return delegate.createThrowStatement(argument);
		    }
		
		    // 12.14 The try statement
		
		    function parseCatchClause() {
		        var param, body, startToken;
		
		        startToken = lookahead;
		        expectKeyword('catch');
		
		        expect('(');
		        if (match(')')) {
		            throwUnexpected(lookahead);
		        }
		
		        param = parseVariableIdentifier();
		        // 12.14.1
		        if (strict && isRestrictedWord(param.name)) {
		            throwErrorTolerant({}, Messages.StrictCatchVariable);
		        }
		
		        expect(')');
		        body = parseBlock();
		        return delegate.markEnd(delegate.createCatchClause(param, body), startToken);
		    }
		
		    function parseTryStatement() {
		        var block, handlers = [], finalizer = null;
		
		        expectKeyword('try');
		
		        block = parseBlock();
		
		        if (matchKeyword('catch')) {
		            handlers.push(parseCatchClause());
		        }
		
		        if (matchKeyword('finally')) {
		            lex();
		            finalizer = parseBlock();
		        }
		
		        if (handlers.length === 0 && !finalizer) {
		            throwError({}, Messages.NoCatchOrFinally);
		        }
		
		        return delegate.createTryStatement(block, [], handlers, finalizer);
		    }
		
		    // 12.15 The debugger statement
		
		    function parseDebuggerStatement() {
		        expectKeyword('debugger');
		
		        consumeSemicolon();
		
		        return delegate.createDebuggerStatement();
		    }
		
		    // 12 Statements
		
		    function parseStatement() {
		        var type = lookahead.type,
		            expr,
		            labeledBody,
		            key,
		            startToken;
		
		        if (type === Token.EOF) {
		            throwUnexpected(lookahead);
		        }
		
		        if (type === Token.Punctuator && lookahead.value === '{') {
		            return parseBlock();
		        }
		
		        startToken = lookahead;
		
		        if (type === Token.Punctuator) {
		            switch (lookahead.value) {
		            case ';':
		                return delegate.markEnd(parseEmptyStatement(), startToken);
		            case '(':
		                return delegate.markEnd(parseExpressionStatement(), startToken);
		            default:
		                break;
		            }
		        }
		
		        if (type === Token.Keyword) {
		            switch (lookahead.value) {
		            case 'break':
		                return delegate.markEnd(parseBreakStatement(), startToken);
		            case 'continue':
		                return delegate.markEnd(parseContinueStatement(), startToken);
		            case 'debugger':
		                return delegate.markEnd(parseDebuggerStatement(), startToken);
		            case 'do':
		                return delegate.markEnd(parseDoWhileStatement(), startToken);
		            case 'for':
		                return delegate.markEnd(parseForStatement(), startToken);
		            case 'function':
		                return delegate.markEnd(parseFunctionDeclaration(), startToken);
		            case 'if':
		                return delegate.markEnd(parseIfStatement(), startToken);
		            case 'return':
		                return delegate.markEnd(parseReturnStatement(), startToken);
		            case 'switch':
		                return delegate.markEnd(parseSwitchStatement(), startToken);
		            case 'throw':
		                return delegate.markEnd(parseThrowStatement(), startToken);
		            case 'try':
		                return delegate.markEnd(parseTryStatement(), startToken);
		            case 'var':
		                return delegate.markEnd(parseVariableStatement(), startToken);
		            case 'while':
		                return delegate.markEnd(parseWhileStatement(), startToken);
		            case 'with':
		                return delegate.markEnd(parseWithStatement(), startToken);
		            default:
		                break;
		            }
		        }
		
		        expr = parseExpression();
		
		        // 12.12 Labelled Statements
		        if ((expr.type === Syntax.Identifier) && match(':')) {
		            lex();
		
		            key = '$' + expr.name;
		            if (Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
		                throwError({}, Messages.Redeclaration, 'Label', expr.name);
		            }
		
		            state.labelSet[key] = true;
		            labeledBody = parseStatement();
		            delete state.labelSet[key];
		            return delegate.markEnd(delegate.createLabeledStatement(expr, labeledBody), startToken);
		        }
		
		        consumeSemicolon();
		
		        return delegate.markEnd(delegate.createExpressionStatement(expr), startToken);
		    }
		
		    // 13 Function Definition
		
		    function parseFunctionSourceElements() {
		        var sourceElement, sourceElements = [], token, directive, firstRestricted,
		            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody, startToken;
		
		        startToken = lookahead;
		        expect('{');
		
		        while (index < length) {
		            if (lookahead.type !== Token.StringLiteral) {
		                break;
		            }
		            token = lookahead;
		
		            sourceElement = parseSourceElement();
		            sourceElements.push(sourceElement);
		            if (sourceElement.expression.type !== Syntax.Literal) {
		                // this is not directive
		                break;
		            }
		            directive = source.slice(token.start + 1, token.end - 1);
		            if (directive === 'use strict') {
		                strict = true;
		                if (firstRestricted) {
		                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
		                }
		            } else {
		                if (!firstRestricted && token.octal) {
		                    firstRestricted = token;
		                }
		            }
		        }
		
		        oldLabelSet = state.labelSet;
		        oldInIteration = state.inIteration;
		        oldInSwitch = state.inSwitch;
		        oldInFunctionBody = state.inFunctionBody;
		
		        state.labelSet = {};
		        state.inIteration = false;
		        state.inSwitch = false;
		        state.inFunctionBody = true;
		
		        while (index < length) {
		            if (match('}')) {
		                break;
		            }
		            sourceElement = parseSourceElement();
		            if (typeof sourceElement === 'undefined') {
		                break;
		            }
		            sourceElements.push(sourceElement);
		        }
		
		        expect('}');
		
		        state.labelSet = oldLabelSet;
		        state.inIteration = oldInIteration;
		        state.inSwitch = oldInSwitch;
		        state.inFunctionBody = oldInFunctionBody;
		
		        return delegate.markEnd(delegate.createBlockStatement(sourceElements), startToken);
		    }
		
		    function parseParams(firstRestricted) {
		        var param, params = [], token, stricted, paramSet, key, message;
		        expect('(');
		
		        if (!match(')')) {
		            paramSet = {};
		            while (index < length) {
		                token = lookahead;
		                param = parseVariableIdentifier();
		                key = '$' + token.value;
		                if (strict) {
		                    if (isRestrictedWord(token.value)) {
		                        stricted = token;
		                        message = Messages.StrictParamName;
		                    }
		                    if (Object.prototype.hasOwnProperty.call(paramSet, key)) {
		                        stricted = token;
		                        message = Messages.StrictParamDupe;
		                    }
		                } else if (!firstRestricted) {
		                    if (isRestrictedWord(token.value)) {
		                        firstRestricted = token;
		                        message = Messages.StrictParamName;
		                    } else if (isStrictModeReservedWord(token.value)) {
		                        firstRestricted = token;
		                        message = Messages.StrictReservedWord;
		                    } else if (Object.prototype.hasOwnProperty.call(paramSet, key)) {
		                        firstRestricted = token;
		                        message = Messages.StrictParamDupe;
		                    }
		                }
		                params.push(param);
		                paramSet[key] = true;
		                if (match(')')) {
		                    break;
		                }
		                expect(',');
		            }
		        }
		
		        expect(')');
		
		        return {
		            params: params,
		            stricted: stricted,
		            firstRestricted: firstRestricted,
		            message: message
		        };
		    }
		
		    function parseFunctionDeclaration() {
		        var id, params = [], body, token, stricted, tmp, firstRestricted, message, previousStrict, startToken;
		
		        startToken = lookahead;
		
		        expectKeyword('function');
		        token = lookahead;
		        id = parseVariableIdentifier();
		        if (strict) {
		            if (isRestrictedWord(token.value)) {
		                throwErrorTolerant(token, Messages.StrictFunctionName);
		            }
		        } else {
		            if (isRestrictedWord(token.value)) {
		                firstRestricted = token;
		                message = Messages.StrictFunctionName;
		            } else if (isStrictModeReservedWord(token.value)) {
		                firstRestricted = token;
		                message = Messages.StrictReservedWord;
		            }
		        }
		
		        tmp = parseParams(firstRestricted);
		        params = tmp.params;
		        stricted = tmp.stricted;
		        firstRestricted = tmp.firstRestricted;
		        if (tmp.message) {
		            message = tmp.message;
		        }
		
		        previousStrict = strict;
		        body = parseFunctionSourceElements();
		        if (strict && firstRestricted) {
		            throwError(firstRestricted, message);
		        }
		        if (strict && stricted) {
		            throwErrorTolerant(stricted, message);
		        }
		        strict = previousStrict;
		
		        return delegate.markEnd(delegate.createFunctionDeclaration(id, params, [], body), startToken);
		    }
		
		    function parseFunctionExpression() {
		        var token, id = null, stricted, firstRestricted, message, tmp, params = [], body, previousStrict, startToken;
		
		        startToken = lookahead;
		        expectKeyword('function');
		
		        if (!match('(')) {
		            token = lookahead;
		            id = parseVariableIdentifier();
		            if (strict) {
		                if (isRestrictedWord(token.value)) {
		                    throwErrorTolerant(token, Messages.StrictFunctionName);
		                }
		            } else {
		                if (isRestrictedWord(token.value)) {
		                    firstRestricted = token;
		                    message = Messages.StrictFunctionName;
		                } else if (isStrictModeReservedWord(token.value)) {
		                    firstRestricted = token;
		                    message = Messages.StrictReservedWord;
		                }
		            }
		        }
		
		        tmp = parseParams(firstRestricted);
		        params = tmp.params;
		        stricted = tmp.stricted;
		        firstRestricted = tmp.firstRestricted;
		        if (tmp.message) {
		            message = tmp.message;
		        }
		
		        previousStrict = strict;
		        body = parseFunctionSourceElements();
		        if (strict && firstRestricted) {
		            throwError(firstRestricted, message);
		        }
		        if (strict && stricted) {
		            throwErrorTolerant(stricted, message);
		        }
		        strict = previousStrict;
		
		        return delegate.markEnd(delegate.createFunctionExpression(id, params, [], body), startToken);
		    }
		
		    // 14 Program
		
		    function parseSourceElement() {
		        if (lookahead.type === Token.Keyword) {
		            switch (lookahead.value) {
		            case 'const':
		            case 'let':
		                return parseConstLetDeclaration(lookahead.value);
		            case 'function':
		                return parseFunctionDeclaration();
		            default:
		                return parseStatement();
		            }
		        }
		
		        if (lookahead.type !== Token.EOF) {
		            return parseStatement();
		        }
		    }
		
		    function parseSourceElements() {
		        var sourceElement, sourceElements = [], token, directive, firstRestricted;
		
		        while (index < length) {
		            token = lookahead;
		            if (token.type !== Token.StringLiteral) {
		                break;
		            }
		
		            sourceElement = parseSourceElement();
		            sourceElements.push(sourceElement);
		            if (sourceElement.expression.type !== Syntax.Literal) {
		                // this is not directive
		                break;
		            }
		            directive = source.slice(token.start + 1, token.end - 1);
		            if (directive === 'use strict') {
		                strict = true;
		                if (firstRestricted) {
		                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
		                }
		            } else {
		                if (!firstRestricted && token.octal) {
		                    firstRestricted = token;
		                }
		            }
		        }
		
		        while (index < length) {
		            sourceElement = parseSourceElement();
		            /* istanbul ignore if */
		            if (typeof sourceElement === 'undefined') {
		                break;
		            }
		            sourceElements.push(sourceElement);
		        }
		        return sourceElements;
		    }
		
		    function parseProgram() {
		        var body, startToken;
		
		        skipComment();
		        peek();
		        startToken = lookahead;
		        strict = false;
		
		        body = parseSourceElements();
		        return delegate.markEnd(delegate.createProgram(body), startToken);
		    }
		
		    function filterTokenLocation() {
		        var i, entry, token, tokens = [];
		
		        for (i = 0; i < extra.tokens.length; ++i) {
		            entry = extra.tokens[i];
		            token = {
		                type: entry.type,
		                value: entry.value
		            };
		            if (extra.range) {
		                token.range = entry.range;
		            }
		            if (extra.loc) {
		                token.loc = entry.loc;
		            }
		            tokens.push(token);
		        }
		
		        extra.tokens = tokens;
		    }
		
		    function tokenize(code, options) {
		        var toString,
		            token,
		            tokens;
		
		        toString = String;
		        if (typeof code !== 'string' && !(code instanceof String)) {
		            code = toString(code);
		        }
		
		        delegate = SyntaxTreeDelegate;
		        source = code;
		        index = 0;
		        lineNumber = (source.length > 0) ? 1 : 0;
		        lineStart = 0;
		        length = source.length;
		        lookahead = null;
		        state = {
		            allowIn: true,
		            labelSet: {},
		            inFunctionBody: false,
		            inIteration: false,
		            inSwitch: false,
		            lastCommentStart: -1
		        };
		
		        extra = {};
		
		        // Options matching.
		        options = options || {};
		
		        // Of course we collect tokens here.
		        options.tokens = true;
		        extra.tokens = [];
		        extra.tokenize = true;
		        // The following two fields are necessary to compute the Regex tokens.
		        extra.openParenToken = -1;
		        extra.openCurlyToken = -1;
		
		        extra.range = (typeof options.range === 'boolean') && options.range;
		        extra.loc = (typeof options.loc === 'boolean') && options.loc;
		
		        if (typeof options.comment === 'boolean' && options.comment) {
		            extra.comments = [];
		        }
		        if (typeof options.tolerant === 'boolean' && options.tolerant) {
		            extra.errors = [];
		        }
		
		        try {
		            peek();
		            if (lookahead.type === Token.EOF) {
		                return extra.tokens;
		            }
		
		            token = lex();
		            while (lookahead.type !== Token.EOF) {
		                try {
		                    token = lex();
		                } catch (lexError) {
		                    token = lookahead;
		                    if (extra.errors) {
		                        extra.errors.push(lexError);
		                        // We have to break on the first error
		                        // to avoid infinite loops.
		                        break;
		                    } else {
		                        throw lexError;
		                    }
		                }
		            }
		
		            filterTokenLocation();
		            tokens = extra.tokens;
		            if (typeof extra.comments !== 'undefined') {
		                tokens.comments = extra.comments;
		            }
		            if (typeof extra.errors !== 'undefined') {
		                tokens.errors = extra.errors;
		            }
		        } catch (e) {
		            throw e;
		        } finally {
		            extra = {};
		        }
		        return tokens;
		    }
		
		    function parse(code, options) {
		        var program, toString;
		
		        toString = String;
		        if (typeof code !== 'string' && !(code instanceof String)) {
		            code = toString(code);
		        }
		
		        delegate = SyntaxTreeDelegate;
		        source = code;
		        index = 0;
		        lineNumber = (source.length > 0) ? 1 : 0;
		        lineStart = 0;
		        length = source.length;
		        lookahead = null;
		        state = {
		            allowIn: true,
		            labelSet: {},
		            inFunctionBody: false,
		            inIteration: false,
		            inSwitch: false,
		            lastCommentStart: -1
		        };
		
		        extra = {};
		        if (typeof options !== 'undefined') {
		            extra.range = (typeof options.range === 'boolean') && options.range;
		            extra.loc = (typeof options.loc === 'boolean') && options.loc;
		            extra.attachComment = (typeof options.attachComment === 'boolean') && options.attachComment;
		
		            if (extra.loc && options.source !== null && options.source !== undefined) {
		                extra.source = toString(options.source);
		            }
		
		            if (typeof options.tokens === 'boolean' && options.tokens) {
		                extra.tokens = [];
		            }
		            if (typeof options.comment === 'boolean' && options.comment) {
		                extra.comments = [];
		            }
		            if (typeof options.tolerant === 'boolean' && options.tolerant) {
		                extra.errors = [];
		            }
		            if (extra.attachComment) {
		                extra.range = true;
		                extra.comments = [];
		                extra.bottomRightStack = [];
		                extra.trailingComments = [];
		                extra.leadingComments = [];
		            }
		        }
		
		        try {
		            program = parseProgram();
		            if (typeof extra.comments !== 'undefined') {
		                program.comments = extra.comments;
		            }
		            if (typeof extra.tokens !== 'undefined') {
		                filterTokenLocation();
		                program.tokens = extra.tokens;
		            }
		            if (typeof extra.errors !== 'undefined') {
		                program.errors = extra.errors;
		            }
		        } catch (e) {
		            throw e;
		        } finally {
		            extra = {};
		        }
		
		        return program;
		    }
		
		    // Sync with *.json manifests.
		    exports.version = '1.2.5';
		
		    exports.tokenize = tokenize;
		
		    exports.parse = parse;
		
		    // Deep copy.
		   /* istanbul ignore next */
		    exports.Syntax = (function () {
		        var name, types = {};
		
		        if (typeof Object.create === 'function') {
		            types = Object.create(null);
		        }
		
		        for (name in Syntax) {
		            if (Syntax.hasOwnProperty(name)) {
		                types[name] = Syntax[name];
		            }
		        }
		
		        if (typeof Object.freeze === 'function') {
		            Object.freeze(types);
		        }
		
		        return types;
		    }());
		
		}));
		/* vim: set sw=4 ts=4 et tw=80 : */
	
	
	/***/ },
	/* 13 */
	/***/ function(module, exports, __webpack_require__) {
	
		(function (global, factory) {
		   true ? factory(exports) :
		  typeof define === 'function' && define.amd ? define('d3-array', ['exports'], factory) :
		  factory((global.d3_array = {}));
		}(this, function (exports) { 'use strict';
		
		  function ascending(a, b) {
		    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
		  };
		
		  function bisector(compare) {
		    if (compare.length === 1) compare = ascendingComparator(compare);
		    return {
		      left: function(a, x, lo, hi) {
		        if (arguments.length < 3) lo = 0;
		        if (arguments.length < 4) hi = a.length;
		        while (lo < hi) {
		          var mid = lo + hi >>> 1;
		          if (compare(a[mid], x) < 0) lo = mid + 1;
		          else hi = mid;
		        }
		        return lo;
		      },
		      right: function(a, x, lo, hi) {
		        if (arguments.length < 3) lo = 0;
		        if (arguments.length < 4) hi = a.length;
		        while (lo < hi) {
		          var mid = lo + hi >>> 1;
		          if (compare(a[mid], x) > 0) hi = mid;
		          else lo = mid + 1;
		        }
		        return lo;
		      }
		    };
		  };
		
		  function ascendingComparator(f) {
		    return function(d, x) {
		      return ascending(f(d), x);
		    };
		  }
		
		  var ascendingBisect = bisector(ascending);
		  var bisectRight = ascendingBisect.right;
		  var bisectLeft = ascendingBisect.left;
		
		  function descending(a, b) {
		    return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
		  };
		
		  function number$1(x) {
		    return x === null ? NaN : +x;
		  };
		
		  function variance(array, f) {
		    var n = array.length,
		        m = 0,
		        a,
		        d,
		        s = 0,
		        i = -1,
		        j = 0;
		
		    if (arguments.length === 1) {
		      while (++i < n) {
		        if (!isNaN(a = number$1(array[i]))) {
		          d = a - m;
		          m += d / ++j;
		          s += d * (a - m);
		        }
		      }
		    }
		
		    else {
		      while (++i < n) {
		        if (!isNaN(a = number$1(f(array[i], i, array)))) {
		          d = a - m;
		          m += d / ++j;
		          s += d * (a - m);
		        }
		      }
		    }
		
		    if (j > 1) return s / (j - 1);
		  };
		
		  function deviation() {
		    var v = variance.apply(this, arguments);
		    return v ? Math.sqrt(v) : v;
		  };
		
		  function extent(array, f) {
		    var i = -1,
		        n = array.length,
		        a,
		        b,
		        c;
		
		    if (arguments.length === 1) {
		      while (++i < n) if ((b = array[i]) != null && b >= b) { a = c = b; break; }
		      while (++i < n) if ((b = array[i]) != null) {
		        if (a > b) a = b;
		        if (c < b) c = b;
		      }
		    }
		
		    else {
		      while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = c = b; break; }
		      while (++i < n) if ((b = f(array[i], i, array)) != null) {
		        if (a > b) a = b;
		        if (c < b) c = b;
		      }
		    }
		
		    return [a, c];
		  };
		
		  function constant(x) {
		    return function() {
		      return x;
		    };
		  };
		
		  function identity(x) {
		    return x;
		  };
		
		  function range(start, stop, step) {
		    if ((n = arguments.length) < 3) {
		      step = 1;
		      if (n < 2) {
		        stop = start;
		        start = 0;
		      }
		    }
		
		    var i = -1,
		        n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
		        range = new Array(n);
		
		    while (++i < n) {
		      range[i] = start + i * step;
		    }
		
		    return range;
		  };
		
		  var e10 = Math.sqrt(50);
		  var e5 = Math.sqrt(10);
		  var e2 = Math.sqrt(2);
		  function ticks(start, stop, count) {
		    var step = tickStep(start, stop, count);
		    return range(
		      Math.ceil(start / step) * step,
		      Math.floor(stop / step) * step + step / 2, // inclusive
		      step
		    );
		  };
		
		  function tickStep(start, stop, count) {
		    var step0 = Math.abs(stop - start) / Math.max(0, count),
		        step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
		        error = step0 / step1;
		    if (error >= e10) step1 *= 10;
		    else if (error >= e5) step1 *= 5;
		    else if (error >= e2) step1 *= 2;
		    return stop < start ? -step1 : step1;
		  };
		
		  function sturges(values) {
		    return Math.ceil(Math.log(values.length) / Math.LN2) + 1;
		  };
		
		  function number(x) {
		    return +x;
		  }
		
		  function histogram() {
		    var value = identity,
		        domain = extent,
		        threshold = sturges;
		
		    function histogram(data) {
		      var i,
		          n = data.length,
		          x,
		          values = new Array(n);
		
		      // Coerce values to numbers.
		      for (i = 0; i < n; ++i) {
		        values[i] = +value(data[i], i, data);
		      }
		
		      var xz = domain(values),
		          x0 = +xz[0],
		          x1 = +xz[1],
		          tz = threshold(values, x0, x1);
		
		      // Convert number of thresholds into uniform thresholds.
		      if (!Array.isArray(tz)) tz = ticks(x0, x1, +tz);
		
		      // Coerce thresholds to numbers, ignoring any outside the domain.
		      var m = tz.length;
		      for (i = 0; i < m; ++i) tz[i] = +tz[i];
		      while (tz[0] <= x0) tz.shift(), --m;
		      while (tz[m - 1] >= x1) tz.pop(), --m;
		
		      var bins = new Array(m + 1),
		          bin;
		
		      // Initialize bins.
		      for (i = 0; i <= m; ++i) {
		        bin = bins[i] = [];
		        bin.x0 = i > 0 ? tz[i - 1] : x0;
		        bin.x1 = i < m ? tz[i] : x1;
		      }
		
		      // Assign data to bins by value, ignoring any outside the domain.
		      for (i = 0; i < n; ++i) {
		        x = values[i];
		        if (x0 <= x && x <= x1) {
		          bins[bisectRight(tz, x, 0, m)].push(data[i]);
		        }
		      }
		
		      return bins;
		    }
		
		    histogram.value = function(_) {
		      return arguments.length ? (value = typeof _ === "function" ? _ : constant(+_), histogram) : value;
		    };
		
		    histogram.domain = function(_) {
		      return arguments.length ? (domain = typeof _ === "function" ? _ : constant([+_[0], +_[1]]), histogram) : domain;
		    };
		
		    histogram.thresholds = function(_) {
		      if (!arguments.length) return threshold;
		      threshold = typeof _ === "function" ? _
		          : Array.isArray(_) ? constant(Array.prototype.map.call(_, number))
		          : constant(+_);
		      return histogram;
		    };
		
		    return histogram;
		  };
		
		  function quantile(array, p, f) {
		    if (arguments.length < 3) f = number$1;
		    if (!(n = array.length)) return;
		    if ((p = +p) <= 0 || n < 2) return +f(array[0], 0, array);
		    if (p >= 1) return +f(array[n - 1], n - 1, array);
		    var n,
		        h = (n - 1) * p,
		        i = Math.floor(h),
		        a = +f(array[i], i, array),
		        b = +f(array[i + 1], i + 1, array);
		    return a + (b - a) * (h - i);
		  };
		
		  function freedmanDiaconis(values, min, max) {
		    values.sort(ascending);
		    return Math.ceil((max - min) / (2 * (quantile(values, 0.75) - quantile(values, 0.25)) * Math.pow(values.length, -1 / 3)));
		  };
		
		  function scott(values, min, max) {
		    return Math.ceil((max - min) / (3.5 * deviation(values) * Math.pow(values.length, -1 / 3)));
		  };
		
		  function max(array, f) {
		    var i = -1,
		        n = array.length,
		        a,
		        b;
		
		    if (arguments.length === 1) {
		      while (++i < n) if ((b = array[i]) != null && b >= b) { a = b; break; }
		      while (++i < n) if ((b = array[i]) != null && b > a) a = b;
		    }
		
		    else {
		      while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = b; break; }
		      while (++i < n) if ((b = f(array[i], i, array)) != null && b > a) a = b;
		    }
		
		    return a;
		  };
		
		  function mean(array, f) {
		    var s = 0,
		        n = array.length,
		        a,
		        i = -1,
		        j = n;
		
		    if (arguments.length === 1) {
		      while (++i < n) if (!isNaN(a = number$1(array[i]))) s += a; else --j;
		    }
		
		    else {
		      while (++i < n) if (!isNaN(a = number$1(f(array[i], i, array)))) s += a; else --j;
		    }
		
		    if (j) return s / j;
		  };
		
		  function median(array, f) {
		    var numbers = [],
		        n = array.length,
		        a,
		        i = -1;
		
		    if (arguments.length === 1) {
		      while (++i < n) if (!isNaN(a = number$1(array[i]))) numbers.push(a);
		    }
		
		    else {
		      while (++i < n) if (!isNaN(a = number$1(f(array[i], i, array)))) numbers.push(a);
		    }
		
		    return quantile(numbers.sort(ascending), 0.5);
		  };
		
		  function merge(arrays) {
		    var n = arrays.length,
		        m,
		        i = -1,
		        j = 0,
		        merged,
		        array;
		
		    while (++i < n) j += arrays[i].length;
		    merged = new Array(j);
		
		    while (--n >= 0) {
		      array = arrays[n];
		      m = array.length;
		      while (--m >= 0) {
		        merged[--j] = array[m];
		      }
		    }
		
		    return merged;
		  };
		
		  function min(array, f) {
		    var i = -1,
		        n = array.length,
		        a,
		        b;
		
		    if (arguments.length === 1) {
		      while (++i < n) if ((b = array[i]) != null && b >= b) { a = b; break; }
		      while (++i < n) if ((b = array[i]) != null && a > b) a = b;
		    }
		
		    else {
		      while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = b; break; }
		      while (++i < n) if ((b = f(array[i], i, array)) != null && a > b) a = b;
		    }
		
		    return a;
		  };
		
		  function pairs(array) {
		    var i = 0, n = array.length - 1, p0, p1 = array[0], pairs = new Array(n < 0 ? 0 : n);
		    while (i < n) pairs[i] = [p0 = p1, p1 = array[++i]];
		    return pairs;
		  };
		
		  function permute(array, indexes) {
		    var i = indexes.length, permutes = new Array(i);
		    while (i--) permutes[i] = array[indexes[i]];
		    return permutes;
		  };
		
		  function scan(array, compare) {
		    if (!(n = array.length)) return;
		    var i = 0,
		        n,
		        j = 0,
		        xi,
		        xj = array[j];
		
		    if (!compare) compare = ascending;
		
		    while (++i < n) if (compare(xi = array[i], xj) < 0 || compare(xj, xj) !== 0) xj = xi, j = i;
		
		    if (compare(xj, xj) === 0) return j;
		  };
		
		  function shuffle(array, i0, i1) {
		    if ((m = arguments.length) < 3) {
		      i1 = array.length;
		      if (m < 2) i0 = 0;
		    }
		
		    var m = i1 - i0,
		        t,
		        i;
		
		    while (m) {
		      i = Math.random() * m-- | 0;
		      t = array[m + i0];
		      array[m + i0] = array[i + i0];
		      array[i + i0] = t;
		    }
		
		    return array;
		  };
		
		  function sum(array, f) {
		    var s = 0,
		        n = array.length,
		        a,
		        i = -1;
		
		    if (arguments.length === 1) {
		      while (++i < n) if (a = +array[i]) s += a; // Note: zero and null are equivalent.
		    }
		
		    else {
		      while (++i < n) if (a = +f(array[i], i, array)) s += a;
		    }
		
		    return s;
		  };
		
		  function transpose(matrix) {
		    if (!(n = matrix.length)) return [];
		    for (var i = -1, m = min(matrix, length), transpose = new Array(m); ++i < m;) {
		      for (var j = -1, n, row = transpose[i] = new Array(n); ++j < n;) {
		        row[j] = matrix[j][i];
		      }
		    }
		    return transpose;
		  };
		
		  function length(d) {
		    return d.length;
		  }
		
		  function zip() {
		    return transpose(arguments);
		  };
		
		  var version = "0.7.0";
		
		  exports.version = version;
		  exports.bisect = bisectRight;
		  exports.bisectRight = bisectRight;
		  exports.bisectLeft = bisectLeft;
		  exports.ascending = ascending;
		  exports.bisector = bisector;
		  exports.descending = descending;
		  exports.deviation = deviation;
		  exports.extent = extent;
		  exports.histogram = histogram;
		  exports.thresholdFreedmanDiaconis = freedmanDiaconis;
		  exports.thresholdScott = scott;
		  exports.thresholdSturges = sturges;
		  exports.max = max;
		  exports.mean = mean;
		  exports.median = median;
		  exports.merge = merge;
		  exports.min = min;
		  exports.pairs = pairs;
		  exports.permute = permute;
		  exports.quantile = quantile;
		  exports.range = range;
		  exports.scan = scan;
		  exports.shuffle = shuffle;
		  exports.sum = sum;
		  exports.ticks = ticks;
		  exports.tickStep = tickStep;
		  exports.transpose = transpose;
		  exports.variance = variance;
		  exports.zip = zip;
		
		}));
	
	/***/ },
	/* 14 */
	/***/ function(module, exports, __webpack_require__) {
	
		(function (global, factory) {
		   true ? factory(exports, __webpack_require__(15)) :
		  typeof define === 'function' && define.amd ? define('d3-interpolate', ['exports', 'd3-color'], factory) :
		  factory((global.d3_interpolate = {}),global.d3_color);
		}(this, function (exports,d3Color) { 'use strict';
		
		  function rgb(a, b) {
		    a = d3Color.rgb(a);
		    b = d3Color.rgb(b);
		    var ar = a.r,
		        ag = a.g,
		        ab = a.b,
		        br = b.r - ar,
		        bg = b.g - ag,
		        bb = b.b - ab;
		    return function(t) {
		      a.r = ar + br * t;
		      a.g = ag + bg * t;
		      a.b = ab + bb * t;
		      return a + "";
		    };
		  };
		
		  // TODO sparse arrays?
		  function array(a, b) {
		    var x = [],
		        c = [],
		        na = a ? a.length : 0,
		        nb = b ? b.length : 0,
		        n0 = Math.min(na, nb),
		        i;
		
		    for (i = 0; i < n0; ++i) x.push(value(a[i], b[i]));
		    for (; i < na; ++i) c[i] = a[i];
		    for (; i < nb; ++i) c[i] = b[i];
		
		    return function(t) {
		      for (i = 0; i < n0; ++i) c[i] = x[i](t);
		      return c;
		    };
		  };
		
		  function number(a, b) {
		    return a = +a, b -= a, function(t) {
		      return a + b * t;
		    };
		  };
		
		  function object(a, b) {
		    var i = {},
		        c = {},
		        k;
		
		    if (a === null || typeof a !== "object") a = {};
		    if (b === null || typeof b !== "object") b = {};
		
		    for (k in a) {
		      if (k in b) {
		        i[k] = value(a[k], b[k]);
		      } else {
		        c[k] = a[k];
		      }
		    }
		
		    for (k in b) {
		      if (!(k in a)) {
		        c[k] = b[k];
		      }
		    }
		
		    return function(t) {
		      for (k in i) c[k] = i[k](t);
		      return c;
		    };
		  };
		
		  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
		  var reB = new RegExp(reA.source, "g");
		  function zero(b) {
		    return function() {
		      return b;
		    };
		  }
		
		  function one(b) {
		    return function(t) {
		      return b(t) + "";
		    };
		  }
		
		  function string(a, b) {
		    var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
		        am, // current match in a
		        bm, // current match in b
		        bs, // string preceding current number in b, if any
		        i = -1, // index in s
		        s = [], // string constants and placeholders
		        q = []; // number interpolators
		
		    // Coerce inputs to strings.
		    a = a + "", b = b + "";
		
		    // Interpolate pairs of numbers in a & b.
		    while ((am = reA.exec(a))
		        && (bm = reB.exec(b))) {
		      if ((bs = bm.index) > bi) { // a string precedes the next number in b
		        bs = b.slice(bi, bs);
		        if (s[i]) s[i] += bs; // coalesce with previous string
		        else s[++i] = bs;
		      }
		      if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
		        if (s[i]) s[i] += bm; // coalesce with previous string
		        else s[++i] = bm;
		      } else { // interpolate non-matching numbers
		        s[++i] = null;
		        q.push({i: i, x: number(am, bm)});
		      }
		      bi = reB.lastIndex;
		    }
		
		    // Add remains of b.
		    if (bi < b.length) {
		      bs = b.slice(bi);
		      if (s[i]) s[i] += bs; // coalesce with previous string
		      else s[++i] = bs;
		    }
		
		    // Special optimization for only a single match.
		    // Otherwise, interpolate each of the numbers and rejoin the string.
		    return s.length < 2 ? (q[0]
		        ? one(q[0].x)
		        : zero(b))
		        : (b = q.length, function(t) {
		            for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
		            return s.join("");
		          });
		  };
		
		  var values = [
		    function(a, b) {
		      var t = typeof b, c;
		      return (t === "string" ? ((c = d3Color.color(b)) ? (b = c, rgb) : string)
		          : b instanceof d3Color.color ? rgb
		          : Array.isArray(b) ? array
		          : t === "object" && isNaN(b) ? object
		          : number)(a, b);
		    }
		  ];
		
		  function value(a, b) {
		    var i = values.length, f;
		    while (--i >= 0 && !(f = values[i](a, b)));
		    return f;
		  };
		
		  function round(a, b) {
		    return a = +a, b -= a, function(t) {
		      return Math.round(a + b * t);
		    };
		  };
		
		  var rad2deg = 180 / Math.PI;
		  var identity = {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0};
		  var g;
		  // Compute x-scale and normalize the first row.
		  // Compute shear and make second row orthogonal to first.
		  // Compute y-scale and normalize the second row.
		  // Finally, compute the rotation.
		  function Transform(string) {
		    if (!g) g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		    if (string) g.setAttribute("transform", string), t = g.transform.baseVal.consolidate();
		
		    var t,
		        m = t ? t.matrix : identity,
		        r0 = [m.a, m.b],
		        r1 = [m.c, m.d],
		        kx = normalize(r0),
		        kz = dot(r0, r1),
		        ky = normalize(combine(r1, r0, -kz)) || 0;
		
		    if (r0[0] * r1[1] < r1[0] * r0[1]) {
		      r0[0] *= -1;
		      r0[1] *= -1;
		      kx *= -1;
		      kz *= -1;
		    }
		
		    this.rotate = (kx ? Math.atan2(r0[1], r0[0]) : Math.atan2(-r1[0], r1[1])) * rad2deg;
		    this.translate = [m.e, m.f];
		    this.scale = [kx, ky];
		    this.skew = ky ? Math.atan2(kz, ky) * rad2deg : 0;
		  }
		
		  function dot(a, b) {
		    return a[0] * b[0] + a[1] * b[1];
		  }
		
		  function normalize(a) {
		    var k = Math.sqrt(dot(a, a));
		    if (k) a[0] /= k, a[1] /= k;
		    return k;
		  }
		
		  function combine(a, b, k) {
		    a[0] += k * b[0];
		    a[1] += k * b[1];
		    return a;
		  }
		
		  function pop(s) {
		    return s.length ? s.pop() + "," : "";
		  }
		
		  function translate(ta, tb, s, q) {
		    if (ta[0] !== tb[0] || ta[1] !== tb[1]) {
		      var i = s.push("translate(", null, ",", null, ")");
		      q.push({i: i - 4, x: number(ta[0], tb[0])}, {i: i - 2, x: number(ta[1], tb[1])});
		    } else if (tb[0] || tb[1]) {
		      s.push("translate(" + tb + ")");
		    }
		  }
		
		  function rotate(ra, rb, s, q) {
		    if (ra !== rb) {
		      if (ra - rb > 180) rb += 360; else if (rb - ra > 180) ra += 360; // shortest path
		      q.push({i: s.push(pop(s) + "rotate(", null, ")") - 2, x: number(ra, rb)});
		    } else if (rb) {
		      s.push(pop(s) + "rotate(" + rb + ")");
		    }
		  }
		
		  function skew(wa, wb, s, q) {
		    if (wa !== wb) {
		      q.push({i: s.push(pop(s) + "skewX(", null, ")") - 2, x: number(wa, wb)});
		    } else if (wb) {
		      s.push(pop(s) + "skewX(" + wb + ")");
		    }
		  }
		
		  function scale(ka, kb, s, q) {
		    if (ka[0] !== kb[0] || ka[1] !== kb[1]) {
		      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
		      q.push({i: i - 4, x: number(ka[0], kb[0])}, {i: i - 2, x: number(ka[1], kb[1])});
		    } else if (kb[0] !== 1 || kb[1] !== 1) {
		      s.push(pop(s) + "scale(" + kb + ")");
		    }
		  }
		
		  function transform(a, b) {
		    var s = [], // string constants and placeholders
		        q = []; // number interpolators
		    a = new Transform(a), b = new Transform(b);
		    translate(a.translate, b.translate, s, q);
		    rotate(a.rotate, b.rotate, s, q);
		    skew(a.skew, b.skew, s, q);
		    scale(a.scale, b.scale, s, q);
		    a = b = null; // gc
		    return function(t) {
		      var i = -1, n = q.length, o;
		      while (++i < n) s[(o = q[i]).i] = o.x(t);
		      return s.join("");
		    };
		  };
		
		  var rho = Math.SQRT2;
		  var rho2 = 2;
		  var rho4 = 4;
		  var epsilon2 = 1e-12;
		  function cosh(x) {
		    return ((x = Math.exp(x)) + 1 / x) / 2;
		  }
		
		  function sinh(x) {
		    return ((x = Math.exp(x)) - 1 / x) / 2;
		  }
		
		  function tanh(x) {
		    return ((x = Math.exp(2 * x)) - 1) / (x + 1);
		  }
		
		  // p0 = [ux0, uy0, w0]
		  // p1 = [ux1, uy1, w1]
		  function zoom(p0, p1) {
		    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2],
		        ux1 = p1[0], uy1 = p1[1], w1 = p1[2],
		        dx = ux1 - ux0,
		        dy = uy1 - uy0,
		        d2 = dx * dx + dy * dy,
		        i,
		        S;
		
		    // Special case for u0 ≅ u1.
		    if (d2 < epsilon2) {
		      S = Math.log(w1 / w0) / rho;
		      i = function(t) {
		        return [
		          ux0 + t * dx,
		          uy0 + t * dy,
		          w0 * Math.exp(rho * t * S)
		        ];
		      }
		    }
		
		    // General case.
		    else {
		      var d1 = Math.sqrt(d2),
		          b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
		          b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
		          r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
		          r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
		      S = (r1 - r0) / rho;
		      i = function(t) {
		        var s = t * S,
		            coshr0 = cosh(r0),
		            u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
		        return [
		          ux0 + u * dx,
		          uy0 + u * dy,
		          w0 * coshr0 / cosh(rho * s + r0)
		        ];
		      }
		    }
		
		    i.duration = S * 1000;
		
		    return i;
		  };
		
		  function deltaHue(h1, h0) {
		    var delta = h1 - h0;
		    return delta > 180 || delta < -180
		        ? delta - 360 * Math.round(delta / 360)
		        : delta;
		  };
		
		  function hsl(a, b) {
		    a = d3Color.hsl(a);
		    b = d3Color.hsl(b);
		    var ah = isNaN(a.h) ? b.h : a.h,
		        as = isNaN(a.s) ? b.s : a.s,
		        al = a.l,
		        bh = isNaN(b.h) ? 0 : deltaHue(b.h, ah),
		        bs = isNaN(b.s) ? 0 : b.s - as,
		        bl = b.l - al;
		    return function(t) {
		      a.h = ah + bh * t;
		      a.s = as + bs * t;
		      a.l = al + bl * t;
		      return a + "";
		    };
		  };
		
		  function hslLong(a, b) {
		    a = d3Color.hsl(a);
		    b = d3Color.hsl(b);
		    var ah = isNaN(a.h) ? b.h : a.h,
		        as = isNaN(a.s) ? b.s : a.s,
		        al = a.l,
		        bh = isNaN(b.h) ? 0 : b.h - ah,
		        bs = isNaN(b.s) ? 0 : b.s - as,
		        bl = b.l - al;
		    return function(t) {
		      a.h = ah + bh * t;
		      a.s = as + bs * t;
		      a.l = al + bl * t;
		      return a + "";
		    };
		  };
		
		  function lab(a, b) {
		    a = d3Color.lab(a);
		    b = d3Color.lab(b);
		    var al = a.l,
		        aa = a.a,
		        ab = a.b,
		        bl = b.l - al,
		        ba = b.a - aa,
		        bb = b.b - ab;
		    return function(t) {
		      a.l = al + bl * t;
		      a.a = aa + ba * t;
		      a.b = ab + bb * t;
		      return a + "";
		    };
		  };
		
		  function hcl(a, b) {
		    a = d3Color.hcl(a);
		    b = d3Color.hcl(b);
		    var ah = isNaN(a.h) ? b.h : a.h,
		        ac = isNaN(a.c) ? b.c : a.c,
		        al = a.l,
		        bh = isNaN(b.h) ? 0 : deltaHue(b.h, ah),
		        bc = isNaN(b.c) ? 0 : b.c - ac,
		        bl = b.l - al;
		    return function(t) {
		      a.h = ah + bh * t;
		      a.c = ac + bc * t;
		      a.l = al + bl * t;
		      return a + "";
		    };
		  };
		
		  function hclLong(a, b) {
		    a = d3Color.hcl(a);
		    b = d3Color.hcl(b);
		    var ah = isNaN(a.h) ? b.h : a.h,
		        ac = isNaN(a.c) ? b.c : a.c,
		        al = a.l,
		        bh = isNaN(b.h) ? 0 : b.h - ah,
		        bc = isNaN(b.c) ? 0 : b.c - ac,
		        bl = b.l - al;
		    return function(t) {
		      a.h = ah + bh * t;
		      a.c = ac + bc * t;
		      a.l = al + bl * t;
		      return a + "";
		    };
		  };
		
		  function cubehelix(a, b, gamma) {
		    if (arguments.length < 3) gamma = 1;
		    a = d3Color.cubehelix(a);
		    b = d3Color.cubehelix(b);
		    var ah = isNaN(a.h) ? b.h : a.h,
		        as = isNaN(a.s) ? b.s : a.s,
		        al = a.l,
		        bh = isNaN(b.h) ? 0 : deltaHue(b.h, ah),
		        bs = isNaN(b.s) ? 0 : b.s - as,
		        bl = b.l - al;
		    return function(t) {
		      a.h = ah + bh * t;
		      a.s = as + bs * t;
		      a.l = al + bl * Math.pow(t, gamma);
		      return a + "";
		    };
		  };
		
		  function cubehelixLong(a, b, gamma) {
		    if (arguments.length < 3) gamma = 1;
		    a = d3Color.cubehelix(a);
		    b = d3Color.cubehelix(b);
		    var ah = isNaN(a.h) ? b.h : a.h,
		        as = isNaN(a.s) ? b.s : a.s,
		        al = a.l,
		        bh = isNaN(b.h) ? 0 : b.h - ah,
		        bs = isNaN(b.s) ? 0 : b.s - as,
		        bl = b.l - al;
		    return function(t) {
		      a.h = ah + bh * t;
		      a.s = as + bs * t;
		      a.l = al + bl * Math.pow(t, gamma);
		      return a + "";
		    };
		  };
		
		  var slice = Array.prototype.slice;
		
		  function bindN(type, args) {
		    args = slice.call(args);
		    args[0] = null;
		    args.unshift(null);
		    return function(a, b) {
		      args[0] = a;
		      args[1] = b;
		      return type.apply(null, args);
		    };
		  }
		
		  function bind(type) {
		    return arguments.length === 1 ? type : bindN(type, arguments);
		  };
		
		  var version = "0.4.0";
		
		  exports.version = version;
		  exports.interpolate = value;
		  exports.interpolators = values;
		  exports.interpolateArray = array;
		  exports.interpolateNumber = number;
		  exports.interpolateObject = object;
		  exports.interpolateRound = round;
		  exports.interpolateString = string;
		  exports.interpolateTransform = transform;
		  exports.interpolateZoom = zoom;
		  exports.interpolateRgb = rgb;
		  exports.interpolateHsl = hsl;
		  exports.interpolateHslLong = hslLong;
		  exports.interpolateLab = lab;
		  exports.interpolateHcl = hcl;
		  exports.interpolateHclLong = hclLong;
		  exports.interpolateCubehelix = cubehelix;
		  exports.interpolateCubehelixLong = cubehelixLong;
		  exports.interpolateBind = bind;
		
		}));
	
	/***/ },
	/* 15 */
	/***/ function(module, exports, __webpack_require__) {
	
		(function (global, factory) {
		   true ? factory(exports) :
		  typeof define === 'function' && define.amd ? define('d3-color', ['exports'], factory) :
		  factory((global.d3_color = {}));
		}(this, function (exports) { 'use strict';
		
		  function Color() {};
		
		  var darker = 0.7;
		  var brighter = 1 / darker;
		
		  var reHex3 = /^#([0-9a-f]{3})$/;
		  var reHex6 = /^#([0-9a-f]{6})$/;
		  var reRgbInteger = /^rgb\(\s*([-+]?\d+)\s*,\s*([-+]?\d+)\s*,\s*([-+]?\d+)\s*\)$/;
		  var reRgbPercent = /^rgb\(\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*\)$/;
		  var reHslPercent = /^hsl\(\s*([-+]?\d+(?:\.\d+)?)\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*\)$/;
		  var named = {
		    aliceblue: 0xf0f8ff,
		    antiquewhite: 0xfaebd7,
		    aqua: 0x00ffff,
		    aquamarine: 0x7fffd4,
		    azure: 0xf0ffff,
		    beige: 0xf5f5dc,
		    bisque: 0xffe4c4,
		    black: 0x000000,
		    blanchedalmond: 0xffebcd,
		    blue: 0x0000ff,
		    blueviolet: 0x8a2be2,
		    brown: 0xa52a2a,
		    burlywood: 0xdeb887,
		    cadetblue: 0x5f9ea0,
		    chartreuse: 0x7fff00,
		    chocolate: 0xd2691e,
		    coral: 0xff7f50,
		    cornflowerblue: 0x6495ed,
		    cornsilk: 0xfff8dc,
		    crimson: 0xdc143c,
		    cyan: 0x00ffff,
		    darkblue: 0x00008b,
		    darkcyan: 0x008b8b,
		    darkgoldenrod: 0xb8860b,
		    darkgray: 0xa9a9a9,
		    darkgreen: 0x006400,
		    darkgrey: 0xa9a9a9,
		    darkkhaki: 0xbdb76b,
		    darkmagenta: 0x8b008b,
		    darkolivegreen: 0x556b2f,
		    darkorange: 0xff8c00,
		    darkorchid: 0x9932cc,
		    darkred: 0x8b0000,
		    darksalmon: 0xe9967a,
		    darkseagreen: 0x8fbc8f,
		    darkslateblue: 0x483d8b,
		    darkslategray: 0x2f4f4f,
		    darkslategrey: 0x2f4f4f,
		    darkturquoise: 0x00ced1,
		    darkviolet: 0x9400d3,
		    deeppink: 0xff1493,
		    deepskyblue: 0x00bfff,
		    dimgray: 0x696969,
		    dimgrey: 0x696969,
		    dodgerblue: 0x1e90ff,
		    firebrick: 0xb22222,
		    floralwhite: 0xfffaf0,
		    forestgreen: 0x228b22,
		    fuchsia: 0xff00ff,
		    gainsboro: 0xdcdcdc,
		    ghostwhite: 0xf8f8ff,
		    gold: 0xffd700,
		    goldenrod: 0xdaa520,
		    gray: 0x808080,
		    green: 0x008000,
		    greenyellow: 0xadff2f,
		    grey: 0x808080,
		    honeydew: 0xf0fff0,
		    hotpink: 0xff69b4,
		    indianred: 0xcd5c5c,
		    indigo: 0x4b0082,
		    ivory: 0xfffff0,
		    khaki: 0xf0e68c,
		    lavender: 0xe6e6fa,
		    lavenderblush: 0xfff0f5,
		    lawngreen: 0x7cfc00,
		    lemonchiffon: 0xfffacd,
		    lightblue: 0xadd8e6,
		    lightcoral: 0xf08080,
		    lightcyan: 0xe0ffff,
		    lightgoldenrodyellow: 0xfafad2,
		    lightgray: 0xd3d3d3,
		    lightgreen: 0x90ee90,
		    lightgrey: 0xd3d3d3,
		    lightpink: 0xffb6c1,
		    lightsalmon: 0xffa07a,
		    lightseagreen: 0x20b2aa,
		    lightskyblue: 0x87cefa,
		    lightslategray: 0x778899,
		    lightslategrey: 0x778899,
		    lightsteelblue: 0xb0c4de,
		    lightyellow: 0xffffe0,
		    lime: 0x00ff00,
		    limegreen: 0x32cd32,
		    linen: 0xfaf0e6,
		    magenta: 0xff00ff,
		    maroon: 0x800000,
		    mediumaquamarine: 0x66cdaa,
		    mediumblue: 0x0000cd,
		    mediumorchid: 0xba55d3,
		    mediumpurple: 0x9370db,
		    mediumseagreen: 0x3cb371,
		    mediumslateblue: 0x7b68ee,
		    mediumspringgreen: 0x00fa9a,
		    mediumturquoise: 0x48d1cc,
		    mediumvioletred: 0xc71585,
		    midnightblue: 0x191970,
		    mintcream: 0xf5fffa,
		    mistyrose: 0xffe4e1,
		    moccasin: 0xffe4b5,
		    navajowhite: 0xffdead,
		    navy: 0x000080,
		    oldlace: 0xfdf5e6,
		    olive: 0x808000,
		    olivedrab: 0x6b8e23,
		    orange: 0xffa500,
		    orangered: 0xff4500,
		    orchid: 0xda70d6,
		    palegoldenrod: 0xeee8aa,
		    palegreen: 0x98fb98,
		    paleturquoise: 0xafeeee,
		    palevioletred: 0xdb7093,
		    papayawhip: 0xffefd5,
		    peachpuff: 0xffdab9,
		    peru: 0xcd853f,
		    pink: 0xffc0cb,
		    plum: 0xdda0dd,
		    powderblue: 0xb0e0e6,
		    purple: 0x800080,
		    rebeccapurple: 0x663399,
		    red: 0xff0000,
		    rosybrown: 0xbc8f8f,
		    royalblue: 0x4169e1,
		    saddlebrown: 0x8b4513,
		    salmon: 0xfa8072,
		    sandybrown: 0xf4a460,
		    seagreen: 0x2e8b57,
		    seashell: 0xfff5ee,
		    sienna: 0xa0522d,
		    silver: 0xc0c0c0,
		    skyblue: 0x87ceeb,
		    slateblue: 0x6a5acd,
		    slategray: 0x708090,
		    slategrey: 0x708090,
		    snow: 0xfffafa,
		    springgreen: 0x00ff7f,
		    steelblue: 0x4682b4,
		    tan: 0xd2b48c,
		    teal: 0x008080,
		    thistle: 0xd8bfd8,
		    tomato: 0xff6347,
		    turquoise: 0x40e0d0,
		    violet: 0xee82ee,
		    wheat: 0xf5deb3,
		    white: 0xffffff,
		    whitesmoke: 0xf5f5f5,
		    yellow: 0xffff00,
		    yellowgreen: 0x9acd32
		  };
		
		  color.prototype = Color.prototype = {
		    displayable: function() {
		      return this.rgb().displayable();
		    },
		    toString: function() {
		      return this.rgb() + "";
		    }
		  };
		
		  function color(format) {
		    var m;
		    format = (format + "").trim().toLowerCase();
		    return (m = reHex3.exec(format)) ? (m = parseInt(m[1], 16), new Rgb((m >> 8 & 0xf) | (m >> 4 & 0x0f0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf))) // #f00
		        : (m = reHex6.exec(format)) ? rgbn(parseInt(m[1], 16)) // #ff0000
		        : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3]) // rgb(255,0,0)
		        : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100) // rgb(100%,0%,0%)
		        : (m = reHslPercent.exec(format)) ? new Hsl(m[1], m[2] / 100, m[3] / 100) // hsl(120,50%,50%)
		        : named.hasOwnProperty(format) ? rgbn(named[format])
		        : null;
		  };
		
		  function rgbn(n) {
		    return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff);
		  }
		
		  function rgb(r, g, b) {
		    if (arguments.length === 1) {
		      if (!(r instanceof Color)) r = color(r);
		      if (r) {
		        r = r.rgb();
		        b = r.b;
		        g = r.g;
		        r = r.r;
		      } else {
		        r = g = b = NaN;
		      }
		    }
		    return new Rgb(r, g, b);
		  };
		
		  function Rgb(r, g, b) {
		    this.r = +r;
		    this.g = +g;
		    this.b = +b;
		  };
		
		  var _rgb = rgb.prototype = Rgb.prototype = new Color;
		
		  _rgb.brighter = function(k) {
		    k = k == null ? brighter : Math.pow(brighter, k);
		    return new Rgb(this.r * k, this.g * k, this.b * k);
		  };
		
		  _rgb.darker = function(k) {
		    k = k == null ? darker : Math.pow(darker, k);
		    return new Rgb(this.r * k, this.g * k, this.b * k);
		  };
		
		  _rgb.rgb = function() {
		    return this;
		  };
		
		  _rgb.displayable = function() {
		    return (0 <= this.r && this.r <= 255)
		        && (0 <= this.g && this.g <= 255)
		        && (0 <= this.b && this.b <= 255);
		  };
		
		  _rgb.toString = function() {
		    var r = Math.round(this.r),
		        g = Math.round(this.g),
		        b = Math.round(this.b);
		    return "#"
		        + (isNaN(r) || r <= 0 ? "00" : r < 16 ? "0" + r.toString(16) : r >= 255 ? "ff" : r.toString(16))
		        + (isNaN(g) || g <= 0 ? "00" : g < 16 ? "0" + g.toString(16) : g >= 255 ? "ff" : g.toString(16))
		        + (isNaN(b) || b <= 0 ? "00" : b < 16 ? "0" + b.toString(16) : b >= 255 ? "ff" : b.toString(16));
		  };
		
		  function hsl(h, s, l) {
		    if (arguments.length === 1) {
		      if (h instanceof Hsl) {
		        l = h.l;
		        s = h.s;
		        h = h.h;
		      } else {
		        if (!(h instanceof Color)) h = color(h);
		        if (h) {
		          if (h instanceof Hsl) return h;
		          h = h.rgb();
		          var r = h.r / 255,
		              g = h.g / 255,
		              b = h.b / 255,
		              min = Math.min(r, g, b),
		              max = Math.max(r, g, b),
		              range = max - min;
		          l = (max + min) / 2;
		          if (range) {
		            s = l < 0.5 ? range / (max + min) : range / (2 - max - min);
		            if (r === max) h = (g - b) / range + (g < b) * 6;
		            else if (g === max) h = (b - r) / range + 2;
		            else h = (r - g) / range + 4;
		            h *= 60;
		          } else {
		            h = NaN;
		            s = l > 0 && l < 1 ? 0 : h;
		          }
		        } else {
		          h = s = l = NaN;
		        }
		      }
		    }
		    return new Hsl(h, s, l);
		  };
		
		  function Hsl(h, s, l) {
		    this.h = +h;
		    this.s = +s;
		    this.l = +l;
		  };
		
		  var _hsl = hsl.prototype = Hsl.prototype = new Color;
		
		  _hsl.brighter = function(k) {
		    k = k == null ? brighter : Math.pow(brighter, k);
		    return new Hsl(this.h, this.s, this.l * k);
		  };
		
		  _hsl.darker = function(k) {
		    k = k == null ? darker : Math.pow(darker, k);
		    return new Hsl(this.h, this.s, this.l * k);
		  };
		
		  _hsl.rgb = function() {
		    var h = this.h % 360 + (this.h < 0) * 360,
		        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
		        l = this.l,
		        m2 = l + (l < 0.5 ? l : 1 - l) * s,
		        m1 = 2 * l - m2;
		    return new Rgb(
		      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
		      hsl2rgb(h, m1, m2),
		      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2)
		    );
		  };
		
		  _hsl.displayable = function() {
		    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
		        && (0 <= this.l && this.l <= 1);
		  };
		
		  /* From FvD 13.37, CSS Color Module Level 3 */
		  function hsl2rgb(h, m1, m2) {
		    return (h < 60 ? m1 + (m2 - m1) * h / 60
		        : h < 180 ? m2
		        : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
		        : m1) * 255;
		  }
		
		  var deg2rad = Math.PI / 180;
		  var rad2deg = 180 / Math.PI;
		
		  var Kn = 18;
		  var Xn = 0.950470;
		  var Yn = 1;
		  var Zn = 1.088830;
		  var t0 = 4 / 29;
		  var t1 = 6 / 29;
		  var t2 = 3 * t1 * t1;
		  var t3 = t1 * t1 * t1;
		  function lab(l, a, b) {
		    if (arguments.length === 1) {
		      if (l instanceof Lab) {
		        b = l.b;
		        a = l.a;
		        l = l.l;
		      } else if (l instanceof Hcl) {
		        var h = l.h * deg2rad;
		        b = Math.sin(h) * l.c;
		        a = Math.cos(h) * l.c;
		        l = l.l;
		      } else {
		        if (!(l instanceof Rgb)) l = rgb(l);
		        var r = rgb2xyz(l.r),
		            g = rgb2xyz(l.g),
		            b = rgb2xyz(l.b),
		            x = xyz2lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / Xn),
		            y = xyz2lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / Yn),
		            z = xyz2lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / Zn);
		        b = 200 * (y - z);
		        a = 500 * (x - y);
		        l = 116 * y - 16;
		      }
		    }
		    return new Lab(l, a, b);
		  };
		
		  function Lab(l, a, b) {
		    this.l = +l;
		    this.a = +a;
		    this.b = +b;
		  };
		
		  var _lab = lab.prototype = Lab.prototype = new Color;
		
		  _lab.brighter = function(k) {
		    return new Lab(this.l + Kn * (k == null ? 1 : k), this.a, this.b);
		  };
		
		  _lab.darker = function(k) {
		    return new Lab(this.l - Kn * (k == null ? 1 : k), this.a, this.b);
		  };
		
		  _lab.rgb = function() {
		    var y = (this.l + 16) / 116,
		        x = isNaN(this.a) ? y : y + this.a / 500,
		        z = isNaN(this.b) ? y : y - this.b / 200;
		    y = Yn * lab2xyz(y);
		    x = Xn * lab2xyz(x);
		    z = Zn * lab2xyz(z);
		    return new Rgb(
		      xyz2rgb( 3.2404542 * x - 1.5371385 * y - 0.4985314 * z), // D65 -> sRGB
		      xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
		      xyz2rgb( 0.0556434 * x - 0.2040259 * y + 1.0572252 * z)
		    );
		  };
		
		  function xyz2lab(t) {
		    return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
		  }
		
		  function lab2xyz(t) {
		    return t > t1 ? t * t * t : t2 * (t - t0);
		  }
		
		  function xyz2rgb(x) {
		    return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
		  }
		
		  function rgb2xyz(x) {
		    return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
		  }
		
		  function hcl(h, c, l) {
		    if (arguments.length === 1) {
		      if (h instanceof Hcl) {
		        l = h.l;
		        c = h.c;
		        h = h.h;
		      } else {
		        if (!(h instanceof Lab)) h = lab(h);
		        l = h.l;
		        c = Math.sqrt(h.a * h.a + h.b * h.b);
		        h = Math.atan2(h.b, h.a) * rad2deg;
		        if (h < 0) h += 360;
		      }
		    }
		    return new Hcl(h, c, l);
		  };
		
		  function Hcl(h, c, l) {
		    this.h = +h;
		    this.c = +c;
		    this.l = +l;
		  };
		
		  var _hcl = hcl.prototype = Hcl.prototype = new Color;
		
		  _hcl.brighter = function(k) {
		    return new Hcl(this.h, this.c, this.l + Kn * (k == null ? 1 : k));
		  };
		
		  _hcl.darker = function(k) {
		    return new Hcl(this.h, this.c, this.l - Kn * (k == null ? 1 : k));
		  };
		
		  _hcl.rgb = function() {
		    return lab(this).rgb();
		  };
		
		  var A = -0.14861;
		  var B = +1.78277;
		  var C = -0.29227;
		  var D = -0.90649;
		  var E = +1.97294;
		  var ED = E * D;
		  var EB = E * B;
		  var BC_DA = B * C - D * A;
		  function cubehelix(h, s, l) {
		    if (arguments.length === 1) {
		      if (h instanceof Cubehelix) {
		        l = h.l;
		        s = h.s;
		        h = h.h;
		      } else {
		        if (!(h instanceof Rgb)) h = rgb(h);
		        var r = h.r / 255, g = h.g / 255, b = h.b / 255;
		        l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB);
		        var bl = b - l, k = (E * (g - l) - C * bl) / D;
		        s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)); // NaN if l=0 or l=1
		        h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
		        if (h < 0) h += 360;
		      }
		    }
		    return new Cubehelix(h, s, l);
		  };
		
		  function Cubehelix(h, s, l) {
		    this.h = +h;
		    this.s = +s;
		    this.l = +l;
		  };
		
		  var _cubehelix = cubehelix.prototype = Cubehelix.prototype = new Color;
		
		  _cubehelix.brighter = function(k) {
		    k = k == null ? brighter : Math.pow(brighter, k);
		    return new Cubehelix(this.h, this.s, this.l * k);
		  };
		
		  _cubehelix.darker = function(k) {
		    k = k == null ? darker : Math.pow(darker, k);
		    return new Cubehelix(this.h, this.s, this.l * k);
		  };
		
		  _cubehelix.rgb = function() {
		    var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
		        l = +this.l,
		        a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
		        cosh = Math.cos(h),
		        sinh = Math.sin(h);
		    return new Rgb(
		      255 * (l + a * (A * cosh + B * sinh)),
		      255 * (l + a * (C * cosh + D * sinh)),
		      255 * (l + a * (E * cosh))
		    );
		  };
		
		  var version = "0.3.3";
		
		  exports.version = version;
		  exports.color = color;
		  exports.rgb = rgb;
		  exports.hsl = hsl;
		  exports.lab = lab;
		  exports.hcl = hcl;
		  exports.cubehelix = cubehelix;
		
		}));
	
	/***/ }
	/******/ ])
	});
	;
	//# sourceMappingURL=ndarray-heatmap.js.map

/***/ }
/******/ ])
});
;
//# sourceMappingURL=ndarray-chunked-heatmap.js.map
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var AutoComplete = function (window) {

	// String对象includes方法兼容处理
	// Array对象filter方法兼容处理
	// Array对象map方法兼容处理
	(function () {
		if (!String.prototype.includes) {
			String.prototype.includes = function () {
				return String.prototype.indexOf.apply(this, arguments) !== -1;
			};
		}

		if (!Array.prototype.filter) {
			Array.prototype.filter = function (fun) {
				var len = this.length;
				if (typeof fun != "function") throw new TypeError();
				var res = [];
				var thisp = arguments[1];
				for (var i = 0; i < len; i++) {
					if (i in this) {
						var val = this[i];
						if (fun.call(thisp, val, i, this)) res.push(val);
					}
				}
				return res;
			};
		}

		if (!Array.prototype.map) {
			Array.prototype.map = function (callback, thisArg) {
				var T, A, k;
				if (this == null) {
					throw new TypeError(" this is null or not defined");
				}
				var O = Object(this);
				var len = O.length >>> 0;
				if (Object.prototype.toString.call(callback) != "[object Function]") {
					throw new TypeError(callback + " is not a function");
				}
				if (thisArg) {
					T = thisArg;
				}
				A = new Array(len);
				k = 0;
				while (k < len) {
					var kValue, mappedValue;
					if (k in O) {
						kValue = O[k];
						mappedValue = callback.call(T, kValue, k, O);
						A[k] = mappedValue;
					}
					k++;
				}
				return A;
			};
		}

		if (!window.getComputedStyle) {
			window.getComputedStyle = function (e) {
				return e.currentStyle;
			};
		}
	})();

	var addEventListener = function () {
		if (document.addEventListener) {
			return function (el, type, fn) {
				el.addEventListener(type, fn, false);
			};
		} else if (document.attachEvent) {
			return function (el, type, fn) {
				el.attachEvent("on" + type, fn);
			};
		}
	}();

	var Ajax = function Ajax(opts) {

		var xhr = null;

		if (typeof XMLHttpRequest !== 'undefined') {
			xhr = new XMLHttpRequest();
		} else {
			throw new Error('您的浏览器不支持原生XHR，请使用最新版本的浏览器！');
		}

		opts = opts || {};
		opts.type = (opts.type || 'GET').toUpperCase();
		opts.dataType = opts.dataType || 'json';

		var params = formatParams(opts.data);

		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				var status = xhr.status;
				if (status >= 200 && status < 300 || status === 304) {
					opts.success && opts.success(eval(xhr.responseText));
				} else {
					opts.fail && opts.fail(status);
				}
			}
		};

		switch (opts.type) {
			case 'POST':
				xhr.open('post', opts.url, true);
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				xhr.send(params);
				break;
			case 'GET':
				xhr.open('get', opts.url + "?" + params, true);
				xhr.send(null);
				break;
		}
	};

	var defaults = {
		src: null,
		minLength: 1,
		itemLength: 8,
		timeout: 100,
		filter: function filter() {}
	};

	var autocomplete = function autocomplete(id, url, opts) {
		this.id = id;
		this.elem = document.getElementById(this.id);
		this.url = url || '';
		this.init(opts);
	};

	autocomplete.prototype = {
		init: function init(opts) {
			var that = this;
			if (opts) {
				for (var v in opts) {
					if (defaults.hasOwnProperty(v)) {
						defaults[v] = opts[v];
					}
				}
			}
			this.opts = defaults;
			this.index = -1;
			this.style = {
				width: calcWidth(this.elem),
				height: calcHeight(this.elem)
			};
			wrap.call(this, this.style);
			getData.call(this, this.url);

			changeListener.call(this);
		},
		render: function render(data) {
			var ul = document.createElement('ul'),
			    len = data.length > this.opts.itemLength ? this.opts.itemLength : data.length;

			ul.id = 'autocomplete_list';

			for (var i = 0; i < len; i++) {
				data[i] = _typeof(data[i]) === 'object' ? data[i].value : data[i];

				var li = document.createElement('li'),
				    liText = document.createTextNode(data[i]);

				li.setAttribute('data-item', data[i]);
				li.appendChild(liText);
				ul.appendChild(li);
			}

			this.clean();
			document.getElementById('autocomplete_wrap').appendChild(ul);
		},
		clean: function clean() {
			if (document.getElementById('autocomplete_list')) {
				document.getElementById('autocomplete_wrap').removeChild(document.getElementById('autocomplete_list'));
			}
		}
	};

	function wrap(style) {
		var parent = document.createElement('div'),
		    input = this.elem.cloneNode(true);

		parent.id = 'autocomplete_wrap';
		parent.className = 'autocomplete_wrap';
		parent.style.position = 'relative';
		parent.style.width = style.width + "px";
		parent.style.height = style.height + "px";
		parent.appendChild(input);
		document.body.replaceChild(parent, this.elem);
		this.elem = document.getElementById(this.id);
	}

	function calcHeight(elem) {
		return parseFloat(window.getComputedStyle(elem, null).height) + parseFloat(window.getComputedStyle(elem, null).borderTopWidth) + parseFloat(window.getComputedStyle(elem, null).borderBottomWidth) + parseFloat(window.getComputedStyle(elem, null).paddingTop) + parseFloat(window.getComputedStyle(elem, null).paddingBottom);
	}

	function calcWidth(elem) {
		console.log(window.getComputedStyle(elem, null).width);
		return parseFloat(window.getComputedStyle(elem, null).width) + parseFloat(window.getComputedStyle(elem, null).borderLeftWidth) + parseFloat(window.getComputedStyle(elem, null).borderRightWidth) + parseFloat(window.getComputedStyle(elem, null).paddingLeft) + parseFloat(window.getComputedStyle(elem, null).paddingRight);
	}

	function formatParams(data) {
		var arr = [];

		for (var key in data) {
			arr.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
		}

		arr.push(("v=" + Math.random()).replace('.', ''));
		return arr.join('&');
	}

	function getData(url) {
		var that = this;

		if (url) {
			Ajax({
				url: url,
				success: function success(data) {
					that.opts.src = data;
				}
			});
		}
	}

	function filter(kw) {
		var data = [],
		    data1 = [],
		    data2 = [];

		if (!kw) {
			this.clean();
			return false;
		}

		data = this.opts.src.filter(function (item) {
			item = item === 'object' ? item.value : item;
			return item.toLowerCase().includes(kw);
		});

		data.map(function (item) {
			item = item === 'object' ? item.value : item;
			if (item.match(/\d+/)[0].substring(0, kw.length) === kw) {
				data1.push(item);
			} else {
				data2.push(item);
			}
		});

		data = data1.concat(data2);

		return data;
	}

	function changeListener(elem) {
		var that = this;

		addEventListener(that.elem, 'keyup', function () {
			var kw = that.elem.value.toLowerCase();

			that.index = -1;
			var data = filter.call(that, kw);
			that.render(data);
		});
	}

	return autocomplete;
}(window);
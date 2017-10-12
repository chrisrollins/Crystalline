(function(){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

if (!window.Crystalline) {
	var libName = "Crystalline";
	var Crystalline = function () {
		try {
			"use strict";
			var nameBindings = {};
			var keysInitialized = {};
			var globalFlags = {
				debugMode: false
			};
			var CrElementCount = 0;
			var loaded = false;
			var API = {
				data: {}
			};

			var libMsg = function libMsg(consoleMethod, msgPrefix, conditionsFunc, msg) {
				if (!conditionsFunc || conditionsFunc()) {
					if (!Array.isArray(msg)) {
						msg = [msg];
					}

					var _iteratorNormalCompletion = true;
					var _didIteratorError = false;
					var _iteratorError = undefined;

					try {
						for (var _iterator = msg[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
							var m = _step.value;

							consoleMethod("" + msgPrefix + m);
						}
					} catch (err) {
						_didIteratorError = true;
						_iteratorError = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion && _iterator.return) {
								_iterator.return();
							}
						} finally {
							if (_didIteratorError) {
								throw _iteratorError;
							}
						}
					}
				}
			};

			var debugMsg = libMsg.bind(null, console.warn, libName + " - DEBUG: ", function () {
				return globalFlags.debugMode;
			});
			var warning = libMsg.bind(null, console.warn, libName + ": ", undefined);
			var error = libMsg.bind(null, console.error, libName + ": ", undefined);

			var getProto = function getProto(obj) {
				return obj === null || obj === undefined ? obj : Object.getPrototypeOf(obj);
			};

			var copy = function copy(val) {
				var result = void 0;
				if (val === null || val === undefined) {
					result = val;
				} else if ((typeof val === "undefined" ? "undefined" : _typeof(val)) === "object") {
					result = Object.assign(Object.create(getProto(val)), val);
				} else if (typeof val === "function") {
					result = val.bind(this);
				}
				return result;
			};

			var getArrayType = function getArrayType(arr) {
				if (Array.isArray(arr)) {
					var type = getProto(arr[0]);
					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = arr[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var item = _step2.value;

							if (getProto(item) !== type) {
								return undefined;
							}
						}
					} catch (err) {
						_didIteratorError2 = true;
						_iteratorError2 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}
						} finally {
							if (_didIteratorError2) {
								throw _iteratorError2;
							}
						}
					}

					return type;
				}
			};

			var defineAllowedValues = function defineAllowedValues(obj, config) {
				var silent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

				var errs = [];
				if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) !== "object" && typeof obj !== "function") {
					errs.push("obj is not valid type.");
				}
				for (var key in config) {
					if (!Array.isArray(config[key])) {
						errs.push("Improper config format for defining object allowed values.");
					}
				}
				if (errs.length > 0) {
					if (!silent) {
						error(errs);
					}
					return;
				}

				var _loop = function _loop(_key) {
					var storedVal = void 0;
					Object.defineProperty(obj, _key, {
						get: function get() {
							return storedVal;
						},
						set: function set(newVal) {
							var _iteratorNormalCompletion3 = true;
							var _didIteratorError3 = false;
							var _iteratorError3 = undefined;

							try {
								for (var _iterator3 = config[_key][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
									var allowed = _step3.value;

									if (newVal === allowed) {
										storedVal = newVal;
										break;
									}
								}
							} catch (err) {
								_didIteratorError3 = true;
								_iteratorError3 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion3 && _iterator3.return) {
										_iterator3.return();
									}
								} finally {
									if (_didIteratorError3) {
										throw _iteratorError3;
									}
								}
							}

							if (!silent && storedVal !== newVal) {
								error("Could not set property '" + _key + "' of " + obj + " to value " + newVal + ". Allowed values: " + config[_key]);
							}
						}
					});
				};

				for (var _key in config) {
					_loop(_key);
				}
			};

			var localData = function () {
				var returnObj = {};
				var memo = {};
				var _arr = ["localStorage", "sessionStorage"];

				var _loop2 = function _loop2() {
					var key = _arr[_i];
					Object.defineProperty(returnObj, key, {
						get: function get() {
							if (!memo[key]) {
								try {
									memo[key] = window[key];
								} catch (e) {}

								if (!memo[key]) {
									error("Error while trying to access " + key + ". Data stored in " + libName + " will not be persistent. Check your browser settings.");
									memo[key] = {};
								}
							}
							return memo[key];
						},
						enumerable: true,
						configurable: true
					});
				};

				for (var _i = 0; _i < _arr.length; _i++) {
					_loop2();
				}
				return Object.freeze(returnObj);
			}();

			return function () {
				var dataStorage = function () {
					if (!localData.localStorage._CrSession) {
						localData.localStorage._CrSession = "{}";
					}
					var _data = JSON.parse(localData.localStorage._CrSession);

					var sessionCounter = {
						get count() {
							return parseInt(localData.localStorage._crSessionCounter) || 0;
						},
						set count(value) {
							localData.localStorage._crSessionCounter = value;
						}
					};

					return Object.freeze({
						set: function set(name, value) {
							_data[name] = _data[name] || Object.create(null);
							_data[name].value = value;
							localData.localStorage._CrSession = JSON.stringify(_data);
							if (Array.isArray(value)) {
								var keys = Object.getOwnPropertyNames(Array.prototype);
								var _iteratorNormalCompletion4 = true;
								var _didIteratorError4 = false;
								var _iteratorError4 = undefined;

								try {
									var _loop3 = function _loop3() {
										var key = _step4.value;

										if (typeof Array.prototype[key] === "function") {
											value[key] = function () {
												for (var _len = arguments.length, args = Array(_len), _key2 = 0; _key2 < _len; _key2++) {
													args[_key2] = arguments[_key2];
												}

												Array.prototype[key].apply(value, args);
												API_set(name, value);
											};
										}
									};

									for (var _iterator4 = keys[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
										_loop3();
									}
								} catch (err) {
									_didIteratorError4 = true;
									_iteratorError4 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion4 && _iterator4.return) {
											_iterator4.return();
										}
									} finally {
										if (_didIteratorError4) {
											throw _iteratorError4;
										}
									}
								}
							}
							if (value && (typeof value === "undefined" ? "undefined" : _typeof(value)) === "object") {
								(function () {
									var funcs = ["set", "get", "order", "format"];
									var _iteratorNormalCompletion5 = true;
									var _didIteratorError5 = false;
									var _iteratorError5 = undefined;

									try {
										var _loop4 = function _loop4() {
											var funcName = _step5.value;

											var func = Object.freeze(function () {
												for (var _len2 = arguments.length, args = Array(_len2), _key3 = 0; _key3 < _len2; _key3++) {
													args[_key3] = arguments[_key3];
												}

												API[funcName].apply(this, [name].concat(args));
											});

											Object.defineProperty(value, funcName, {
												get: function get() {
													return func;
												},
												set: function set(v) {
													error(funcs + " are reserved properties.");
												},
												enumerable: false,
												configurable: false
											});
										};

										for (var _iterator5 = funcs[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
											_loop4();
										}
									} catch (err) {
										_didIteratorError5 = true;
										_iteratorError5 = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion5 && _iterator5.return) {
												_iterator5.return();
											}
										} finally {
											if (_didIteratorError5) {
												throw _iteratorError5;
											}
										}
									}
								})();
							}
						},
						get: function get(name) {
							return (_data[name] || {}).value;
						},
						clearAll: function clearAll() {
							localData.localStorage._CrSession = "{}";
							for (var prop in _data) {
								delete _data[prop];
							}
						},
						setFormat: function setFormat(name, rules) {
							_data[name].formatRules = rules;
						},
						getFormat: function getFormat(name) {
							return (_data[name] || { formatRules: undefined }).formatRules;
						},
						setOrder: function setOrder(name, orderArr) {
							_data[name].orderArr = orderArr;
						},
						getOrder: function getOrder(name) {
							return (_data[name] || { orderArr: undefined }).orderArr;
						},
						incrementSessionCounter: function incrementSessionCounter() {
							var before = sessionCounter.count++;
							var after = sessionCounter.count;
							return { before: before, after: after };
						},
						decrementSessionCounter: function decrementSessionCounter() {
							var before = sessionCounter.count--;
							var after = sessionCounter.count;
							return { before: before, after: after };
						},

						get all() {
							return _data;
						}
					});
				}();

				for (var name in dataStorage.all) {
					if (!keysInitialized[name]) {
						API_init(name, dataStorage.get(name));
					}
				}

				var _arr2 = ["onabort", "onafterprint", "onanimationcancel", "onanimationend", "onanimationiteration", "onappinstalled", "onauxclick", "onbeforeinstallprompt", "onbeforeprint", "onbeforeunload", "onblur", "onchange", "onclick", "onclose", "oncontextmenu", "ondblclick", "ondevicelight", "ondevicemotion", "ondeviceorientation", "ondeviceorientationabsolute", "ondeviceproximity", "ondragdrop", "onerror", "onfocus", "ongotpointercapture", "onhashchange", "oninput", "onkeydown", "onkeypress", "onkeyup", "onlanguagechange", "onload", "onloadend", "onloadstart", "onlostpointercapture", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onmozbeforepaint", "onpaint", "onpointercancel", "onpointerdown", "onpointerenter", "onpointerleave", "onpointermove", "onpointerout", "onpointerover", "onpointerup", "onpopstate", "onrejectionhandled", "onreset", "onresize", "onscroll", "onselect", "onselectionchange", "onselectstart", "onstorage", "onsubmit", "ontouchcancel", "ontouchmove", "ontouchstart", "ontransitioncancel", "ontransitionend", "onunhandledrejection", "onunload", "onuserproximity", "onvrdisplayconnected", "onvrdisplaydisconnected", "onvrdisplaypresentchange"];

				var _loop6 = function _loop6() {
					var event = _arr2[_i2];
					var funcs = [];

					if (window[event] !== undefined && window[event] !== null) {
						if (typeof window[event] === "function") {
							funcs.push(window[event]);
							warning("There was already a function in window." + event + ". It has been included in the " + libName + " event dispatcher's function list. It will still be called when window." + event + " triggers.");
						} else {
							warning("There was an event conflict with window." + event + ". There was a non-function value in the event. It has been overwritten by the " + libName + " event dispatcher.");
						}
					}

					window[event] = function (e) {
						var result = void 0;

						var _iteratorNormalCompletion16 = true;
						var _didIteratorError16 = false;
						var _iteratorError16 = undefined;

						try {
							for (var _iterator16 = funcs[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
								var f = _step16.value;

								try {
									var fres = f(e);
									if (fres !== undefined) {
										result = fres;
									}
								} catch (e) {
									console.log(e);
								}
							}
						} catch (err) {
							_didIteratorError16 = true;
							_iteratorError16 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion16 && _iterator16.return) {
									_iterator16.return();
								}
							} finally {
								if (_didIteratorError16) {
									throw _iteratorError16;
								}
							}
						}

						return result;
					};

					Object.defineProperty(window, event, {
						set: function set() {
							for (var _len4 = arguments.length, f = Array(_len4), _key12 = 0; _key12 < _len4; _key12++) {
								f[_key12] = arguments[_key12];
							}

							var _iteratorNormalCompletion17 = true;
							var _didIteratorError17 = false;
							var _iteratorError17 = undefined;

							try {
								for (var _iterator17 = f[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
									var _func = _step17.value;

									if (typeof _func === "function") {
										funcs.push(_func);
									} else {
										error("Type error: window." + event + " cannot be assigned to non-function value.");
									}
								}
							} catch (err) {
								_didIteratorError17 = true;
								_iteratorError17 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion17 && _iterator17.return) {
										_iterator17.return();
									}
								} finally {
									if (_didIteratorError17) {
										throw _iteratorError17;
									}
								}
							}
						}
					});
				};

				for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
					_loop6();
				}

				if (dataStorage.incrementSessionCounter().before === 0 && localData.sessionStorage._CrThisSession !== "active") {
					dataStorage.clearAll();
					localData.sessionStorage._CrThisSession = "active";
				}

				window.onload = function () {
					loaded = true;
				};

				window.onunload = function (e) {
					dataStorage.decrementSessionCounter();
				};

				function generateCrNode(node) {
					node.CrID = CrElementCount++;
					node.CrCleared = true;
					return node;
				}

				function generateElement(elementType, properties) {
					return generateCrNode(Object.assign(document.createElement(elementType), properties));
				}

				function generateTextNode(text) {
					return generateCrNode(document.createTextNode(text));
				}

				function clearElement(element) {
					if (!element.CrCleared) {
						var children = Array.from(element.childNodes);
						var _iteratorNormalCompletion6 = true;
						var _didIteratorError6 = false;
						var _iteratorError6 = undefined;

						try {
							for (var _iterator6 = children[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
								var child = _step6.value;

								if (child.CrID !== undefined) {
									child.remove();
								}
							}
						} catch (err) {
							_didIteratorError6 = true;
							_iteratorError6 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion6 && _iterator6.return) {
									_iterator6.return();
								}
							} finally {
								if (_didIteratorError6) {
									throw _iteratorError6;
								}
							}
						}

						element.CrCleared = true;
					}
				}

				function refreshElement(element) {
					updateDispatch(element, dataStorage.get(element.CrNameBind), element.CrNameBind);
				}

				function refreshName(name) {
					var _iteratorNormalCompletion7 = true;
					var _didIteratorError7 = false;
					var _iteratorError7 = undefined;

					try {
						for (var _iterator7 = (nameBindings[name] || [])[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
							var element = _step7.value;

							updateDispatch(element, dataStorage.get(name), element.CrNameBind);
						}
					} catch (err) {
						_didIteratorError7 = true;
						_iteratorError7 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion7 && _iterator7.return) {
								_iterator7.return();
							}
						} finally {
							if (_didIteratorError7) {
								throw _iteratorError7;
							}
						}
					}
				}

				function parseFormatTemplateProp(template, columnData) {
					var sections = template.split("{{");

					for (var i = 0; i < sections.length; i++) {
						var temp = sections[i].split("}}");
						if (temp.length === 2) {
							sections[i] = columnData[temp[0]];
						}
					}

					return sections.join("");
				}

				function updateDispatch(element, data, name) {
					if (!element || !isHTMLElement(element)) {
						error("Element is undefined.");
						return;
					}
					clearElement(element);

					function defaultFunc() {
						if (data === undefined || data === null) {
							debugMsg("The data bound to <" + element.nodeName.toLowerCase() + "> tag with id '" + element.id + "' is undefined.");
							return;
						} else if (isHTMLElement(data) || data instanceof Text) {
							element.appendChild(data);
						} else if (isPromise(data)) {
							var promiseDestination = generateElement("div", { innerText: "Loading...", style: { display: "inline-block" } });
							updateDispatch(element, promiseDestination);
							data.then(function (result) {
								promiseDestination.innerText = "";
								updateDispatch(promiseDestination, result, name);
							}).catch(function (err) {
								promiseDestination.innerText = "";
								updateDispatch(promiseDestination, generateTextNode("Error loading data."));
							});
						} else if ((typeof data === "undefined" ? "undefined" : _typeof(data)) === "object") {
							var table = generateElement("table");
							updateDispatch(table, data, name);
							element.appendChild(table);
						} else {
							if (isTagOutBindable(element.nodeName)) {
								element.value = data;
							} else {
								updateDispatch(element, generateTextNode(data));
							}
						}
					}

					function lists() {
						if (Array.isArray(data)) {
							var fragment = document.createDocumentFragment();
							var _iteratorNormalCompletion8 = true;
							var _didIteratorError8 = false;
							var _iteratorError8 = undefined;

							try {
								for (var _iterator8 = data[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
									var item = _step8.value;

									var li = generateElement("li");
									if ((typeof item === "undefined" ? "undefined" : _typeof(item)) === "object") {
										updateDispatch(li, item, name);
									} else {
										li.innerText = item;
									}
									fragment.appendChild(li);
								}
							} catch (err) {
								_didIteratorError8 = true;
								_iteratorError8 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion8 && _iterator8.return) {
										_iterator8.return();
									}
								} finally {
									if (_didIteratorError8) {
										throw _iteratorError8;
									}
								}
							}

							element.appendChild(fragment);
						} else {
							defaultFunc();
						}
					}

					function tables() {
						if ((typeof data === "undefined" ? "undefined" : _typeof(data)) === "object") {
							var format = dataStorage.getFormat(name) || Object.create(null);
							var thead = void 0;
							var tbody = void 0;
							var theadFrag = document.createDocumentFragment();
							var tbodyFrag = document.createDocumentFragment();
							if (element.nodeName === "TABLE") {
								var children = Array.from(element.children);
								var _iteratorNormalCompletion9 = true;
								var _didIteratorError9 = false;
								var _iteratorError9 = undefined;

								try {
									for (var _iterator9 = children[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
										var child = _step9.value;

										if (child.nodeName === "THEAD") {
											thead = child;
										} else if (child.nodeName === "TBODY") {
											tbody = child;
										}
									}
								} catch (err) {
									_didIteratorError9 = true;
									_iteratorError9 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion9 && _iterator9.return) {
											_iterator9.return();
										}
									} finally {
										if (_didIteratorError9) {
											throw _iteratorError9;
										}
									}
								}
							}

							if (Array.isArray(data)) {
								var colNames = new Set(dataStorage.getOrder(name));
								var _iteratorNormalCompletion10 = true;
								var _didIteratorError10 = false;
								var _iteratorError10 = undefined;

								try {
									for (var _iterator10 = data[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
										var _item = _step10.value;

										if ((typeof _item === "undefined" ? "undefined" : _typeof(_item)) === "object" && !Array.isArray(_item)) {
											for (var _key5 in _item) {
												if ((format[_key5] || Object.create(null)).showValue !== false) {
													colNames.add(_key5);
												}
											}
										}
									}
								} catch (err) {
									_didIteratorError10 = true;
									_iteratorError10 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion10 && _iterator10.return) {
											_iterator10.return();
										}
									} finally {
										if (_didIteratorError10) {
											throw _iteratorError10;
										}
									}
								}

								var colNameArr = Array.from(colNames.values());

								if (colNames.size > 0) {
									var tr = generateElement("tr");
									var _iteratorNormalCompletion11 = true;
									var _didIteratorError11 = false;
									var _iteratorError11 = undefined;

									try {
										for (var _iterator11 = colNameArr[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
											var colName = _step11.value;

											if ((format[colName] || Object.create(null)).showTitle !== false) {
												var th = generateElement("th");
												updateDispatch(th, format[colName] ? format[colName].title || colName : colName, name);
												tr.appendChild(th);
											}
										}
									} catch (err) {
										_didIteratorError11 = true;
										_iteratorError11 = err;
									} finally {
										try {
											if (!_iteratorNormalCompletion11 && _iterator11.return) {
												_iterator11.return();
											}
										} finally {
											if (_didIteratorError11) {
												throw _iteratorError11;
											}
										}
									}

									theadFrag.appendChild(tr);
								}

								for (var i = 0; i < data.length; i++) {
									var arr = data[i];
									var _tr = generateElement("tr");
									var attachRow = true;
									if ((typeof arr === "undefined" ? "undefined" : _typeof(arr)) === "object" && !Array.isArray(arr) && arr !== null) {
										var atLeastOneColumn = false;
										var _iteratorNormalCompletion12 = true;
										var _didIteratorError12 = false;
										var _iteratorError12 = undefined;

										try {
											for (var _iterator12 = colNameArr[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
												var _colName = _step12.value;

												var td = generateElement("td");
												if (arr[_colName] !== "" && arr[_colName] !== undefined) {
													var toRender = arr[_colName];
													if (format[_colName] && format[_colName]["template"]) {
														toRender = generateElement(format[_colName]["template"]["tag"] || "span");

														for (var _key4 in format[_colName]["template"]) {
															if (toRender[_key4] !== undefined && typeof format[_colName]["template"][_key4] === "string") {
																toRender[_key4] = parseFormatTemplateProp(format[_colName]["template"][_key4], arr);
															} else if (_key4 === "style" && Object.getPrototypeOf(format[_colName]["template"]["style"]) === Object.prototype) {
																for (var rule in format[_colName]["template"]["style"]) {
																	toRender["style"][rule] = parseFormatTemplateProp(format[_colName]["template"]["style"][rule], arr);
																}
															}
														}
														updateDispatch(toRender, arr[_colName]);
													}
													updateDispatch(td, toRender, name);
													atLeastOneColumn = true;
												}
												_tr.appendChild(td);
											}
										} catch (err) {
											_didIteratorError12 = true;
											_iteratorError12 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion12 && _iterator12.return) {
													_iterator12.return();
												}
											} finally {
												if (_didIteratorError12) {
													throw _iteratorError12;
												}
											}
										}

										attachRow = atLeastOneColumn;
									} else if (arr !== undefined && arr !== null) {
										var inner = Array.isArray(arr) ? arr : [arr];
										var _iteratorNormalCompletion13 = true;
										var _didIteratorError13 = false;
										var _iteratorError13 = undefined;

										try {
											for (var _iterator13 = inner[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
												var item = _step13.value;

												var _td = generateElement("td");
												updateDispatch(_td, item, name);
												_tr.appendChild(_td);
											}
										} catch (err) {
											_didIteratorError13 = true;
											_iteratorError13 = err;
										} finally {
											try {
												if (!_iteratorNormalCompletion13 && _iterator13.return) {
													_iterator13.return();
												}
											} finally {
												if (_didIteratorError13) {
													throw _iteratorError13;
												}
											}
										}
									} else if (arr === null) {
										warning("Found null while building table from array [ " + data + " ] at index " + i + ".");
									} else {
										warning("Found undefined while building table from array [ " + data + " ] at index " + i + ". This can be caused by forgetting a comma between an object and an array.");
									}
									if (attachRow) {
										tbodyFrag.appendChild(_tr);
									}
								}
							} else {
								updateDispatch(element, [data], name);
							}

							if (!thead) {
								var fragment = document.createDocumentFragment();
								fragment.appendChild(theadFrag);
								fragment.appendChild(tbodyFrag);
								(tbody || element).appendChild(fragment);
							} else {
								thead.appendChild(theadFrag);
								(tbody || element).appendChild(tbodyFrag);
							}
						} else {
							defaultFunc();
						}
					};

					var functionMapping = {
						ol: lists,
						ul: lists,
						table: tables,
						tbody: tables,
						thead: tables,
						tfoot: tables
					};

					(functionMapping[element.nodeName.toLowerCase()] || defaultFunc)();
					element.CrCleared = false;
				}

				function isTagOutBindable(elementTag) {
					var elements = {
						input: true, textarea: true
					};
					return elements[elementTag.toLowerCase()];
				}

				function delayUntilLoad(callback) {
					if (!loaded) {
						window.onload = function (e) {
							callback({ delayed: true, event: e });
						};
					} else {
						callback({ delayed: false, event: undefined });
					}
				}

				function isHTMLElement(obj) {
					return obj instanceof HTMLElement;
				}

				function isPromise(obj) {
					return obj instanceof Promise;
				}

				var API_http = function () {
					var generateOptions = function generateOptions() {
						var options = {
							baseURL: "",

							method: "GET",
							headers: {},
							mode: "cors",
							credentials: "omit",
							cache: "default",
							redirect: "follow",
							referrer: "about:client",
							integrity: "",
							body: undefined
						};
						defineAllowedValues(options, {
							mode: ["cors", "no-cors", "same-origin", "navigate"],
							credentials: ["omit", "same-origin", "include"],
							cache: ["default", "no-store", "reload", "force-cache", "only-if-cache"],
							redirect: ["follow", "error", "manual"]
						});
						Object.seal(options);

						return options;
					};

					var httpSend = Object.freeze(function (method, path, options) {
						var thisRef = this;
						var fetchOptions = {};
						var optionsSource = (typeof options === "undefined" ? "undefined" : _typeof(options)) === "object" ? Object.assign(generateOptions(), options) : thisRef.options;
						var _arr3 = ["mode", "headers", "credentials", "cache", "redirect", "referrer", "integrity"];
						for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
							var _key6 = _arr3[_i3];
							fetchOptions[_key6] = optionsSource[_key6];
						}

						if (optionsSource.body) {
							if (method.toUpperCase() !== "GET" && method.toUpperCase() !== "HEAD") {
								fetchOptions.body = optionsSource.body;
							} else {
								warning("GET or HEAD requests cannot have a body. The body for this request was discarded.");
							}
						}
						fetchOptions.method = method || optionsSource.method || "GET";

						var prom = new Promise(function (resolve, reject) {
							fetch(optionsSource.baseURL + path, fetchOptions).then(function (res) {
								res.text().then(function (data) {
									var result = void 0;

									if (data[0] === "{" || data[0] === "[") {
										try {
											result = JSON.parse(data);
										} catch (e) {
											warning("malformed JSON from server response: " + data);
											result = data;
										}
									} else {
										result = data;
									}

									resolve(result);
								}).catch(function (err) {
									reject(err);
								});
							}).catch(function (err) {
								reject(err);
							});
						});

						return prom;
					});

					var applyMethods = function applyMethods(obj) {
						var _arr4 = ["GET", "POST", "PUT", "PATCH", "DELETE"];

						for (var _i4 = 0; _i4 < _arr4.length; _i4++) {
							var method = _arr4[_i4];
							obj[method.toLowerCase()] = httpSend.bind(obj, method);
						}
						obj.request = httpSend.bind(obj);
					};

					var http = function http(options) {
						options = options || {};
						if (this === window) {
							error("Constructor must be called with the 'new' keyword.");
						} else {
							this.options = generateOptions();
							for (var _key7 in this.options) {
								this.options[_key7] = options[_key7] || this.options[_key7];
							}
							applyMethods(this);
						}
					};
					http.options = generateOptions();
					applyMethods(http);

					return http;
				}();

				function API_clear() {
					dataStorage.clearAll();
				}

				function API_debugMode(enabled) {
					if (enabled === true || enabled === false) {
						debugMode = enabled;
					}
				}

				function API_createElementFromData(tagName, data, properties) {
					var el = API_createElement(tagName, properties);
					if (data) {
						updateDispatch(el, data);
					}
					return el;
				}

				function API_createElement(tagName, properties) {
					if (typeof tagName !== "string") {
						error("Type error. Invalid argument for tagName. Must be a string.");

						return undefined;
					}
					if (properties && (typeof properties === "undefined" ? "undefined" : _typeof(properties)) !== "object") {
						error("Type error. Invalid argument for properties. Must be an object.");
						properties = {};
					}
					var el = document.createElement(tagName);
					for (var _key8 in properties) {
						if (typeof properties[_key8] === "string") {
							el[_key8] = properties[_key8];
						} else if (_typeof(properties[_key8]) === "object") {
							for (var inner in properties[_key8]) {
								if (typeof properties[_key8][inner] === "string") {
									el[_key8][inner] = properties[_key8][inner];
								}
							}
						}
					}
					return el;
				}

				function API_order(name) {
					for (var _len3 = arguments.length, keys = Array(_len3 > 1 ? _len3 - 1 : 0), _key9 = 1; _key9 < _len3; _key9++) {
						keys[_key9 - 1] = arguments[_key9];
					}

					if (getArrayType(keys) === Array.prototype && keys.length === 1) {
						keys = keys[0];
					}
					if (getArrayType(keys) === String.prototype) {
						dataStorage.setOrder(name, keys);
					}
				}

				function API_eventListener(elementOrSelector, event, callback) {
					if (isHTMLElement(elementOrSelector)) {
						elementOrSelector[event] = callback;
					} else {
						delayUntilLoad(function (arg) {
							document.querySelector(elementOrSelector)[event] = callback;
						});
					}
				}

				function API_format(name, rules) {
					if (typeof name === "string" && Object.getPrototypeOf(rules) === Object.prototype) {
						dataStorage.setFormat(name, rules);
					} else {
						error("Incorrect input for the format method. Requires a string for the data key and an object for the rules.");
					}
				}

				function API_init(name, value) {
					var typeCheck = getProto(name);
					if (typeCheck === Object.prototype || typeCheck === null) {
						for (var _key10 in name) {
							API_init(_key10, name[_key10]);
						}
					} else if (typeof name === "string") {
						if (!keysInitialized[name]) {
							API_set(name, value);
						}
					} else {
						error("First argument of init should either be a string or an object.");
					}
				}

				function API_set(name, value) {
					var typeCheck = getProto(name);
					if (typeCheck === Object.prototype || typeCheck === null) {
						for (var _key11 in name) {
							API_set(_key11, name[_key11]);
						}
					} else if (typeof name === "string") {
						dataStorage.set(name, value);
						if (!keysInitialized[name]) {
							keysInitialized[name] = true;
							Object.defineProperty(API.data, name, {
								set: function set(value) {
									API_set(name, value);
								},
								get: function get() {
									return API_get(name);
								}
							});
						}
						refreshName(name);
					} else {
						error("First argument of init should either be a string or an object.");
					}
				}

				function API_get(name) {
					return dataStorage.get(name);
				}

				function API_bind(elementOrSelector, name) {
					if (name !== undefined) {
						API_bind(elementOrSelector).out(name).in(name);
					}

					var funcs = Object.freeze({
						in: Object.freeze(inBind.bind(undefined, elementOrSelector)),
						out: Object.freeze(outBind.bind(undefined, elementOrSelector))
					});

					var elArrHelper = function elArrHelper(elems) {
						if (typeof elems === "string") {
							return Array.from(document.querySelectorAll(elems));
						} else if (elems instanceof NodeList) {
							return Array.from(elems);
						} else if (elems instanceof Array) {
							return elems;
						} else {
							return [elems];
						}
					};

					function inBind(_elements, dataName) {
						delayUntilLoad(function () {
							var elements = elArrHelper(_elements);
							var _iteratorNormalCompletion14 = true;
							var _didIteratorError14 = false;
							var _iteratorError14 = undefined;

							try {
								for (var _iterator14 = elements[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
									var el = _step14.value;

									(nameBindings[dataName] || (nameBindings[dataName] = [])).push(el);
									el.CrNameBind = dataName;
									refreshElement(el);
								}
							} catch (err) {
								_didIteratorError14 = true;
								_iteratorError14 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion14 && _iterator14.return) {
										_iterator14.return();
									}
								} finally {
									if (_didIteratorError14) {
										throw _iteratorError14;
									}
								}
							}
						});
						return funcs;
					}

					function outBind(_elements, dataName) {
						delayUntilLoad(function () {
							var elements = elArrHelper(_elements);
							var _iteratorNormalCompletion15 = true;
							var _didIteratorError15 = false;
							var _iteratorError15 = undefined;

							try {
								var _loop5 = function _loop5() {
									var el = _step15.value;

									if (isTagOutBindable(el.nodeName)) {
										el.oninput = function () {
											API_set(dataName, el.value);
										};
									}
								};

								for (var _iterator15 = elements[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
									_loop5();
								}
							} catch (err) {
								_didIteratorError15 = true;
								_iteratorError15 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion15 && _iterator15.return) {
										_iterator15.return();
									}
								} finally {
									if (_didIteratorError15) {
										throw _iteratorError15;
									}
								}
							}
						});
						return funcs;
					}

					return funcs;
				}

				var lib = Object.freeze(Object.assign(API, {
					init: Object.freeze(API_init),
					set: Object.freeze(API_set),
					get: Object.freeze(API_get),
					bind: Object.freeze(API_bind),
					order: Object.freeze(API_order),
					format: Object.freeze(API_format),
					eventListener: Object.freeze(API_eventListener),
					createElement: Object.freeze(API_createElement),
					createElementFromData: Object.freeze(API_createElementFromData),
					http: Object.freeze(API_http),
					debugMode: Object.freeze(API_debugMode),
					clear: Object.freeze(API_clear)
				}));

				console.log("%c " + libName + " initialized successfully.", "color: #116633");

				return lib;
			}();
		} catch (e) {
			console.error(e);
			console.log("Error while initializing " + libName + ".");
		}
	}();

	Object.defineProperty(window, "Crystalline", {
		enumerable: false,
		configurable: false,
		writable: false,
		value: Crystalline
	});
} else {
	console.error("Crystalline already initialized. Check your script tags for duplicates or other scripts binding something to the name.");
}
})();
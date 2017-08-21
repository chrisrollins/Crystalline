const Crystalline = (function()
{
	"use strict";
	const libName = "Crystalline"
	const nameBindings = {};
	const keysInitialized = {};
	const globalFlags = {};
	let CrElementCount = 0;
	let loaded = false;
	const API = {
		data:{}
	};

	//UTILITY

	const getProto = function(obj)
	{
		return (obj === null || obj === undefined) ? obj : Object.getPrototypeOf(obj);
	};

	const getArrayType = function(arr)
	{
		if(Array.isArray(arr))
		{
			const type = getProto(arr[0]);
			for(const item of arr)
			{
				if(getProto(item) !== type)
				{
					return undefined;
				}
			}
			return type;
		}
	};

	const defineAllowedValues = function(obj, config, silent = true)
	{
		const errs = [];
		if(typeof obj !== "object" && typeof obj !== "function")
		{
			errs.push("obj is not valid type.")
		}
		for(const key in config)
		{
			if(!Array.isArray(config[key]))
			{
				errs.push("Improper config format for defining object allowed values.");
			}
		}
		if(errs.length > 0)
		{
			if(!silent)
			{
				error(errs);
			}
			return;
		}

		for(const key in config)
		{
			let storedVal;
			Object.defineProperty(obj, key,
			{
				get: function()
				{
					return storedVal;
				},
					set: function(newVal)
					{
						for(const allowed of config[key])
						{
							if(newVal === allowed)
							{
								storedVal = newVal;
								break;
							}
						}
						if(!silent && storedVal !== newVal)
						{
							error(`Could not set property '${key}' of ${obj} to value ${newVal}. Allowed values: ${config[key]}`);
						}
					}
			});
		}
	};

	//END UTILITY

	return (function()
	{
		//SETUP
		const dataStorage = function()
		{
			if(!localStorage._CrSession)
			{
				localStorage._CrSession = "{}";
			}
			const _data = JSON.parse(localStorage._CrSession);

			const sessionCounter = {
				get count()
				{
					return (parseInt(localStorage._crSessionCounter) || 0);
				},
				set count(value)
				{
					localStorage._crSessionCounter = value;
				}
			};

			return Object.freeze(
			{
				set: function(name, value)
				{
					_data[name] = (_data[name] || Object.create(null));
					_data[name].value = value;
					localStorage._CrSession = JSON.stringify(_data);
					if(Array.isArray(value))
					{
						const keys = Object.getOwnPropertyNames(Array.prototype);
						for(const key of keys)
						{
							if(typeof Array.prototype[key] === "function")
							{
								value[key] = function(...args)
								{
									Array.prototype[key].apply(value, args);
									API_set(name, value);
								}
							}
						}
					}
					if(typeof value === "object")
					{
						for(let func of ["set", "get", "order", "format"])
						{
							value[func] = function(...args)
							{
								API[func].apply(this, [name, ...args]);
							}
						}
					}
				},
				get: function(name, value)
				{
					return (_data[name] || {}).value;
				},
				clearAll: function()
				{
					localStorage._CrSession = "{}";
					for (const prop in _data)
						{ delete _data[prop]; }
				},
				setFormat: function(name, rules)
				{
					_data[name].formatRules = rules;
				},
				getFormat: function(name)
				{
					return (_data[name] || {formatRules:undefined}).formatRules;
				},
				setOrder: function(name, orderArr)
				{
					_data[name].orderArr = orderArr;
				},
				getOrder: function(name)
				{
					return (_data[name] || {orderArr:undefined}).orderArr;
				},
				incrementSessionCounter()
				{
					const before = sessionCounter.count++;
					const after = sessionCounter.count;
					return {before: before, after: after};
				},
				decrementSessionCounter()
				{
					const before = sessionCounter.count--;
					const after = sessionCounter.count;
					return {before: before, after: after};
				},
				get all()
				{
					return _data;
				}
			});
		}();

		const debugMsg = function(msg)
		{
			if(globalFlags.debugMode)
			{
				if(!Array.isArray(msg))
				{
					msg = [msg];
				}
				for(const m of msg)
				{
					console.warn(`${libName} - DEBUG: ${m}`);
				}
			}
		};

		const warning = function(msg)
		{
			if(!Array.isArray(msg))
			{
				msg = [msg];
			}

			for(const m of msg)
			{
				console.warn(`${libName}: ${m}`);
			}
		};

		const error = function(msg)
		{
			if(!Array.isArray(msg))
			{
				msg = [msg];
			}

			for(const m of msg)
			{
				console.error(`${libName}: ${m}`);
			}
		};

		for(const name in dataStorage.all)
		{
			if(!keysInitialized[name])
			{
				API_init(name, dataStorage.get(name));
			}
		}
		
		for(const event of ["onabort", "onafterprint", "onanimationcancel", "onanimationend", "onanimationiteration", "onappinstalled", "onauxclick", "onbeforeinstallprompt", "onbeforeprint", "onbeforeunload", "onblur", "onchange", "onclick", "onclose", "oncontextmenu", "ondblclick", "ondevicelight", "ondevicemotion", "ondeviceorientation", "ondeviceorientationabsolute", "ondeviceproximity", "ondragdrop", "onerror", "onfocus", "ongotpointercapture", "onhashchange", "oninput", "onkeydown", "onkeypress", "onkeyup", "onlanguagechange", "onload", "onloadend", "onloadstart", "onlostpointercapture", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onmozbeforepaint", "onpaint", "onpointercancel", "onpointerdown", "onpointerenter", "onpointerleave", "onpointermove", "onpointerout", "onpointerover", "onpointerup", "onpopstate", "onrejectionhandled", "onreset", "onresize", "onscroll", "onselect", "onselectionchange", "onselectstart", "onstorage", "onsubmit", "ontouchcancel", "ontouchmove", "ontouchstart", "ontransitioncancel", "ontransitionend", "onunhandledrejection", "onunload", "onuserproximity", "onvrdisplayconnected", "onvrdisplaydisconnected", "onvrdisplaypresentchange"])
		{
			const funcs = [];

			if(window[event] !== undefined && window[event] !== null)
			{
				if(typeof window[event] === "function")
				{
					funcs.push(window[event]);
					warning(`There was already a function in window.${event}. It has been included in the ${libName} event dispatcher's function list. It will still be called when window.${event} triggers.`);
				}
				else
				{
					warning(`There was an event conflict with window.${event}. There was a non-function value in the event. It has been overwritten by the ${libName} event dispatcher.`);
				}
			}

			window[event] = function(e)
			{
				let result;
				for(const f of funcs)
				{
					const fres = f(e);
					if(fres !== undefined)
					{
						result = fres;
					}
				}

				if(result !== undefined)
				{
					return result;
				}
			};

			Object.defineProperty(window, event,
			{
				set: function(...f)
				{
					for(const func of f)
					{
						if(typeof func === "function")
						{
							funcs.push(func);
						}
						else
						{
							error(`Type error: window.${event} cannot be assigned to non-function value.`);
						}
					}
				}
			});
		}

		if(dataStorage.incrementSessionCounter().before === 0 && sessionStorage._CrThisSession !== "active")
		{
			dataStorage.clearAll();
			sessionStorage._CrThisSession = "active";
		}

		window.onload = function()
		{
			loaded = true;
		};

		window.onunload = function(e)
		{
			dataStorage.decrementSessionCounter();
		};

		//END SETUP

		//INTERNAL FUNCTIONS

		function generateElement(elementType, properties)
		{
			const el = Object.assign(document.createElement(elementType), properties);
			el.CrID = CrElementCount++;
			el.CrCleared = true;
			return el;
		}

		function clearElement(element)
		{
			if(!element.CrCleared)
			{
				const [...children] = element.childNodes;
				for(const child of children)
				{
					if(child.CrID !== undefined)
					{
						child.remove();
					}
				}
				element.CrCleared = true;
			}
		}

		function refreshElement(element)
		{
			updateDispatch(element, dataStorage.get(element.CrNameBind), element.CrNameBind);
		}

		function refreshName(name)
		{
			for(const element of (nameBindings[name] || []))
			{
				updateDispatch(element, dataStorage.get(name), element.CrNameBind);
			}
		}

		function parseFormatTemplateProp(template, columnData)
		{
			const sections = template.split("{{");

			for(let i = 0; i < sections.length; i++)
			{
				const temp = sections[i].split("}}");
				if(temp.length === 2)
				{
					sections[i] = columnData[temp[0]];
				}
			}

			return sections.join("");
		}

		function updateDispatch(element, data, name)
		{
			if(!element || !isHTMLElement(element))
			{
				error("Element is undefined.");
				return;
			}
			clearElement(element);


			function defaultFunc()
			{
				if(data === undefined || data === null)
				{
					debugMsg(`The data bound to <${element.nodeName.toLowerCase()}> tag with id '${element.id}' is undefined.`);
					return;
				}
				else if(isHTMLElement(data))
				{
					element.appendChild(data);
				}
				else if(isPromise(data))
				{
					const promiseDestination = generateElement("div", {innerText: "Loading...", style: {display: "inline-block"}});
					updateDispatch(element, promiseDestination);
					data.then(function(result)
					{
						promiseDestination.innerText = "";
						updateDispatch(promiseDestination, result, name);
					})
					.catch(function(err)
					{
						promiseDestination.innerText = "";
						updateDispatch(promiseDestination, generateElement("span", {innerText: "Error loading data."}));
					});
				}
				else if(typeof data === "object")
				{
					const table = generateElement("table");
					updateDispatch(table, data, name);
					element.appendChild(table);
				}
				else
				{
					if(isTagOutBindable(element.nodeName))
					{
						element.value = data;
					}
					else
					{
						updateDispatch(element, generateElement("span", {innerText: data}));
					}
				}

			}

			function lists()
			{
				if(Array.isArray(data))
				{
					const fragment = document.createDocumentFragment();
					for(const item of data)
					{
						const li = generateElement("li");
						if(typeof item === "object")
						{
							updateDispatch(li, item, name);
						}
						else
						{
							li.innerText = item;
						}
						fragment.appendChild(li);
					}

					element.appendChild(fragment);
				}
				else
				{
					defaultFunc();
				}
			}

			function tables()
			{
				if(typeof data === "object")
				{
					const format = dataStorage.getFormat(name) || Object.create(null);
					let thead;
					let tbody;
					const theadFrag = document.createDocumentFragment();
					const tbodyFrag = document.createDocumentFragment();
					if(element.nodeName === "TABLE")
					{
						for(const child of element.childNodes)
						{
							if(child.nodeName === "THEAD")
							{
								thead = child;
							}
							else if(child.nodeName === "TBODY")
							{
								tbody = child;
							}
						}
					}

					if(Array.isArray(data))
					{
						const colNames = new Set(dataStorage.getOrder(name));
						for(const item of data)
						{
							if(typeof item === "object" && !Array.isArray(item))
							{
								for(const key in item)
								{
									if((format[key] || Object.create(null)).showValue !== false)
									{
										colNames.add(key);
									}
								}
							}
						}
						
						const colNameArr = Array.from(colNames.values());

						if(colNames.size > 0)
						{
							const tr = generateElement("tr");
							for(const colName of colNameArr)
							{
								if((format[colName] || Object.create(null)).showTitle !== false){
									const th = generateElement("th");
									updateDispatch(th, (format[colName]) ? (format[colName].title || colName) : colName, name);
									tr.appendChild(th);
								}
							}
							theadFrag.appendChild(tr);
						}

						for(let i = 0; i < data.length; i++)
						{
							const arr = data[i];
							const tr = generateElement("tr");
							let attachRow = true;
							if(typeof arr === "object" && !Array.isArray(arr) && arr !== null)
							{
								let atLeastOneColumn = false;
								for(const colName of colNameArr)
								{
									const td = generateElement("td");
									if(arr[colName] !== "" && arr[colName] !== undefined)
									{
										let toRender = arr[colName];
										if(format[colName] && format[colName]["template"])
										{
											toRender = generateElement((format[colName]["template"]["tag"] || "span"));

											for(const key in format[colName]["template"])
											{
												if(toRender[key] !== undefined && typeof format[colName]["template"][key] === "string")
												{
													toRender[key] = parseFormatTemplateProp(format[colName]["template"][key], arr);
												}
												else if(key === "style" && Object.getPrototypeOf(format[colName]["template"]["style"]) === Object.prototype)
												{
													for(let rule in format[colName]["template"]["style"])
													{
														toRender["style"][rule] = parseFormatTemplateProp(format[colName]["template"]["style"][rule], arr);
													}
												}
											}
											updateDispatch(toRender, arr[colName]);
										}
										updateDispatch(td, toRender, name);
										atLeastOneColumn = true;
									}
									tr.appendChild(td);
								}
								attachRow = atLeastOneColumn;
							}
							else if(arr !== undefined && arr !== null)
							{
								const inner = (Array.isArray(arr))?arr:[arr];
								for(const item of inner)
								{
									const td = generateElement("td");
									updateDispatch(td, item, name);
									tr.appendChild(td);
								}
							}
							else if(arr === null)
							{
								warning(`Found null while building table from array [ ${data} ] at index ${i}.`);
							}
							else
							{
								warning(`Found undefined while building table from array [ ${data} ] at index ${i}. This can be caused by forgetting a comma between an object and an array.`);
							}
							if(attachRow)
							{
								tbodyFrag.appendChild(tr);
							}
						}
					}
					else
					{
						updateDispatch(element, [data], name);
					}
					
					if(!thead)
					{
						const fragment = document.createDocumentFragment();
						fragment.appendChild(theadFrag);
						fragment.appendChild(tbodyFrag);
						(tbody || element).appendChild(fragment);
					}
					else
					{
						thead.appendChild(theadFrag);
						(tbody || element).appendChild(tbodyFrag);
					}
				}
				else
				{
					defaultFunc();
				}
			};

			const functionMapping = {
				ol: lists,
				ul: lists,
				table: tables,
				tbody: tables,
				thead: tables,
				tfoot: tables
			};

			( functionMapping[element.nodeName.toLowerCase()] || defaultFunc )();
			element.CrCleared = false;
		}

		function isTagOutBindable(elementTag)
		{
			const elements = {
				input: true, textarea: true
			};
			return elements[elementTag.toLowerCase()];
		}

		function delayUntilLoad(callback)
		{
			if(!loaded)
			{
				window.onload = function(e)
				{
					callback({delayed: true, event: e});
				};
			}
			else
			{
				callback({delayed: false, event: undefined});
			}
		}

		function isHTMLElement(obj)
		{
			return obj instanceof HTMLElement;
		}

		function isPromise(obj)
		{
			return obj instanceof Promise;
		}

		//END INTERNAL FUNCTIONS


		//HTTP

		const API_http = (function()
		{
			const generateOptions = function()
			{
				const options = {
					//additional options
					baseURL: "",
					//fetch API options
					method: "GET", //GET, POST, PUT, PATCH, DELETE, etc...
					headers: {},
					mode: "cors", //cors, no-cors, same-origin, navigate
					credentials: "omit", //omit, same-origin, include
					cache: "default", //default, no-store, reload, force-cache, only-if-cache
					redirect: "follow", //follow, error, manual
					referrer: "about:client", //about:client, no-referrer, <URL>
					integrity: "",
					body: undefined,
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

			const httpSend = Object.freeze(function(method, path, options)
			{
				const thisRef = this;
				const fetchOptions = {};
				const optionsSource = (typeof options === "object") ? Object.assign(generateOptions(), options) : thisRef.options;
				for(const key of ["mode", "headers", "credentials", "cache", "redirect", "referrer", "integrity"])
				{
					fetchOptions[key] = optionsSource[key];
				}
				
				if(optionsSource.body)
				{
					if(method.toUpperCase() !== "GET" && method.toUpperCase() !== "HEAD")
					{
						fetchOptions.body = optionsSource.body;
					}
					else
					{
						warning("GET or HEAD requests cannot have a body. The body for this request was discarded.");
					}
				}
				fetchOptions.method = (method || optionsSource.method || "GET");

				const prom = new Promise(function(resolve, reject)
				{
					fetch(optionsSource.baseURL + path, fetchOptions).then(function(res)
					{
						res.text().then(function(data)
						{
							let result;

							if(data[0] === "{" || data[0] === "[")
							{
								try { result = JSON.parse(data); }
								catch(e)
								{
									warning(`malformed JSON from server response: ${data}`);
									result = data;
								}
							}
							else
							{ result = data; }

							resolve(result);
						})
						.catch(function(err)
						{
							reject(err);
						});
					})
					.catch(function(err){
						reject(err);
					});
				});

				return prom;
			});
			

			const applyMethods = function(obj)
			{
				for(const method of ["GET", "POST", "PUT", "PATCH", "DELETE"])
				{
					obj[method.toLowerCase()] = httpSend.bind(obj, method);
				}
				obj.request = httpSend.bind(obj);
			}

			const http = function(options)
			{
				options = (options || {});
				if(this === window)
				{
					error("Constructor must be called with the 'new' keyword.");
				}
				else
				{ 
					this.options = generateOptions();
					for(let key in this.options)
					{
						this.options[key] = (options[key] || this.options[key]);
					}
					applyMethods(this);
				}
			}
			http.options = generateOptions();
			applyMethods(http);

			return http;
		})();

		////////////

		//API FUNCTIONS

		function API_debugMode(enabled)
		{
			if(enabled === true || enabled === false)
			{
				debugMode = enabled;
			}
		}

		function API_createElementFromData(tagName, data, properties)
		{
			let el = API_createElement(tagName, properties);
			if(data)
			{
				updateDispatch(el, data);
			}
			return el;
		}

		function API_createElement(tagName, properties)
		{
			if(typeof tagName !== "string")
			{
				error(`Type error. Invalid argument for tagName. Must be a string.`);
				
				return undefined;
			}
			if(properties && typeof properties !== "object")
			{
				error(`Type error. Invalid argument for properties. Must be an object.`);
				properties = {};
			}
			const el = document.createElement(tagName);
			for(const key in properties)
			{
				if(typeof properties[key] === "string")
				{
					el[key] = properties[key];
				}
				else if(typeof properties[key] === "object")
				{
					for(const inner in properties[key])
					{
						if(typeof properties[key][inner] === "string")
						{
							el[key][inner] = properties[key][inner];
						}
					}
				}
			}
			return el;
		}

		function API_order(name, ...keys)
		{
			if(getArrayType(keys) === Array.prototype && keys.length === 1)
			{
				keys = keys[0];
			}
			if(getArrayType(keys) === String.prototype)
			{
				dataStorage.setOrder(name, keys);
			}
		}

		function API_eventListener(elementOrSelector, event, callback)
		{
			if(isHTMLElement(elementOrSelector))
			{
				elementOrSelector[event] = callback;
			}
			else
			{
				delayUntilLoad(function(arg){ document.querySelector(elementOrSelector)[event] = callback; });
			}
		}

		function API_format(name, rules)
		{
			if(typeof name === "string" && Object.getPrototypeOf(rules) === Object.prototype)
			{
				dataStorage.setFormat(name, rules);
			}
			else
			{
				error("Incorrect input for the format method. Requires a string for the data key and an object for the rules.");
			}	
		}

		function API_init(name, value)
		{
			const typeCheck = getProto(name);
			if(typeCheck === Object.prototype || typeCheck === null)
			{
				for(const key in name)
				{
					API_init(key, name[key]);
				}
			}
			else if(typeof name === "string")
			{
				if(!keysInitialized[name])
				{
					API_set(name, value);
				}
			}
			else
			{
				error("First argument of init should either be a string or an object.");
			}
		}

		function API_set(name, value)
		{
			const typeCheck = getProto(name);
			if(typeCheck === Object.prototype || typeCheck === null)
			{
				for(const key in name)
				{
					API_set(key, name[key]);
				}
			}
			else if(typeof name === "string")
			{
				dataStorage.set(name, value);
				if(!keysInitialized[name])
				{
					keysInitialized[name]= true;
					Object.defineProperty(API.data, name,
					{
						set: function(value)
						{
							API_set(name, value);
						},
						get: function()
						{
							return API_get(name);
						}
					});
				}
				refreshName(name);
			}
			else
			{
				error("First argument of init should either be a string or an object.");
			}
		}

		function API_get(name)
		{
			return dataStorage.get(name);
		}

		function API_bind(elementOrSelector, name)
		{
			const DOMelement = elementOrSelector;
			let DOMElementDirectRef = DOMelement;
			if(!isHTMLElement(DOMelement))
			{
				delayUntilLoad(function(arg)
				{
					DOMElementDirectRef = document.querySelector(DOMelement);
				});
			}
			if(name !== undefined)
			{
				delayUntilLoad(function(arg)
				{
					if(isTagOutBindable(DOMElementDirectRef.nodeName))
					{
						API_bind(DOMelement).out(name);
					}
				});

				return API_bind(DOMelement).in(name);
			}
			else
			{
				return{
					in: function(name)
					{
						delayUntilLoad(function(arg)
						{
							( nameBindings[name] || (nameBindings[name] = []) ).push(DOMElementDirectRef);
							DOMElementDirectRef.CrNameBind = name;
							refreshElement(DOMElementDirectRef);
						});
					},
					out: function(name)
					{
						delayUntilLoad(function(arg)
						{
							if(isTagOutBindable(DOMElementDirectRef.nodeName))
							{
								DOMElementDirectRef.oninput = function()
								{
									API_set(name, DOMElementDirectRef.value);
								}
							}
							else
							{
								warning(`out binding is not available for ${DOMelement} because it doesn't take user input.`);
							}
						});
						return API_bind;
					}
				}
			}
		}

		return Object.freeze(Object.assign(API, {
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
			debugMode: Object.freeze(API_debugMode)
		}));
	
	})();
})();
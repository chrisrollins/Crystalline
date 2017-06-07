const Crystalline = (function()
{
	"use strict";
	const libName = "Crystalline"
	const nameBindings = {};
	const keysInitialized = {};
	let CrElementCount = 0;
	let windowLoaded = false;
	const API = {
		data:{}
	};

	return (function()
	{
		//SETUP
		const dataStorage = function()
		{
			if(!sessionStorage._CrSession)
			{
				sessionStorage._CrSession = "{}";
			}
			const _data = JSON.parse(sessionStorage._CrSession);

			return Object.freeze(
			{
				set: function(name, value)
				{
					_data[name] = { value: value };
					_data[name].template = "";
					sessionStorage._CrSession = JSON.stringify(_data);
					if(Array.isArray(value))
					{
						value.push = function(pushedVal)
						{
							Array.prototype.push.call(value, pushedVal);
							API_set(name, value);
						}
					}
				},
				get: function(name, value)
				{
					return _data[name].value;
				},
				setTemplate: function(name, str)
				{
					_data[name].template = str;
				},
				get all()
				{
					return _data;
				}
			});
		}();

		const warning = function(msg)
		{
			console.warn(`${libName}: ${msg}`);
		};

		const error = function(msg)
		{
			console.error(`${libName}: ${msg}`);
		};

		for(const name in dataStorage.all)
		{
			if(!keysInitialized[name])
			{
				API_init(name, dataStorage.get(name));
			}
		}
		
		(function()
		{
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
					funcs.forEach(function(f)
					{
						const fres = f(e);
						if(fres !== undefined)
						{
							result = fres;
						}
					});

					if(result !== undefined)
					{
						return result;
					}
				};

				Object.defineProperty(window, event,
				{
					set: function(f)
					{
						funcs.push(f);
					}
				});
			}

		})();

		window.onload = function()
		{
			windowLoaded = true;
		}
		//END SETUP

		//INTERNAL FUNCTIONS

		function generateElement(elementType)
		{
			const el = document.createElement(elementType);
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
			updateDispatch(element, dataStorage.get(element.CrNameBind));
		}

		function refreshName(name)
		{
			for(const element of (nameBindings[name] || []))
			{
				updateDispatch(element, dataStorage.get(name));
			}
		}

		function updateDispatch(element, data)
		{
			clearElement(element);
			const defaultFunc = function()
			{
				if(data === undefined || data === null)
				{
					warning(`The data bound to <${element.nodeName.toLowerCase()}> tag with id '${element.id}' is undefined.`);
					return;
				}
				else if(isHTMLElement(data))
				{
					element.appendChild(data);
				}
				else if(typeof data === "object")
				{
					const table = generateElement("table");
					updateDispatch(table, data);
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
						element.innerText = data;
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
							updateDispatch(li, item);
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
						const colNames = new Set();
						for(const item of data)
						{
							if(typeof item === "object" && !Array.isArray(item))
							{
								for(const key in item)
								{
									colNames.add(key);
								}
							}
						}
						
						const colNameArr = Array.from(colNames.values());

						if(colNames.size > 0)
						{
							const tr = generateElement("tr");
							for(const colName of colNameArr)
							{
								const th = generateElement("th");
								updateDispatch(th, colName);
								tr.appendChild(th);
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
										updateDispatch(td, arr[colName]);
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
									updateDispatch(td, item);
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
						updateDispatch(element, [data]);
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

		function delayUntilWindowLoad(callback)
		{
			if(!windowLoaded)
			{
				window.onload = callback;
			}
			else
			{
				callback();
			}
		}

		function isHTMLElement(element)
		{
			let current = element.__proto__;
			while(current !== null)
			{
				if(current.toString() === "[object HTMLElement]")
				{
					return true;
				}
				current = current.__proto__;
			}
			return false;
		}

		//END INTERNAL FUNCTIONS

		//API FUNCTIONS

		function API_createElement(tagName, properties)
		{
			if(typeof tagName !== "string")
			{
				error(`Type error. Invalid input for tagName. Must be a string.`);
				
				return undefined;
			}
			if(typeof properties !== "object")
			{
				error(`Type error. Invalid input for properties. Must be an object.`);
				
				return undefined;
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

		function API_template(dataKey, HTMLStringOrElement)
		{
			let str;
			if(typeof HTMLStringOrElement === "string")
			{
				str = HTMLStringOrElement;
			}
			else if(isHTMLElement(element))
			{
				str = element.outerHTML;
			}
			else
			{
				warning(`Invalid template argument passed for the data key '${dataKey}'. It should be a string or html element.`);
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
				delayUntilWindowLoad(function(){ document.querySelector(elementOrSelector)[event] = callback; });
			}
		}

		function API_init(name, value)
		{
			if(!keysInitialized[name])
			{
				API_set(name, value);
			}
		}

		function API_set(name, value)
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
				delayUntilWindowLoad(function()
				{
					DOMElementDirectRef = document.querySelector(DOMelement);
				});
			}
			if(name !== undefined)
			{
				delayUntilWindowLoad(function()
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
						delayUntilWindowLoad(function()
						{
							( nameBindings[name] || (nameBindings[name] = []) ).push(DOMElementDirectRef);
							DOMElementDirectRef.CrNameBind = name;
							refreshElement(DOMElementDirectRef);
						});
					},
					out: function(name)
					{
						delayUntilWindowLoad(function()
						{
							if(isTagOutBindable(DOMElementDirectRef.nodeName))
							{
								DOMElementDirectRef.oninput = function()
								{
									API_set(name, DOMElementDirectRef.value);
								}
								API_set(name, DOMElementDirectRef.value);
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
			init: API_init,
			set: API_set,
			get: API_get,
			bind: API_bind,
			eventListener: API_eventListener,
			createElement: API_createElement
		}));
	
	})();
})();
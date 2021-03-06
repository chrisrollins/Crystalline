# Crystalline
Easy to use data binding JavaScript library for web browser development.

### What does it do?
Crystalline makes it easy to take some data and display it on a webpage. It also keeps data persistently between page navigation and refresh. There is no bias for single page or multi page websites thanks to this feature. It's not a framework, just a small library of functions that do a lot of work for you.

### API
__Crystalline.init__(_string_ __name__, _string|number|object|array|HTMLElement_ __value__)  
Creates a key with the specified value in the Crystalline data store. This function works the same way as Cystalline.set except that it only creates the key/value if it does not exist already. This is the prefered way to create keys in the data store, as Crystalline.set will always overwrite the value if it already existed before page navigation or refresh.  
__Parameters__  
name: The name of the key.  
value: the data for this key.  
  
  
  
__Crystalline.set__(_string_ __name__, _string|number|object|array|HTMLElement_ __value__)  
Sets the value of a key in the Crystalline data store. This works the same way as init, except that it will always set the value. Therefore, it is not prefered for creating new keys, as it will overwrite them if they already existed before page navigation. The primary purpose of this function is to change the value of an existing key.  
__Parameters__  
name: The name of the key.  
value: the data for this key.  
  
  
  
__Crystalline.get__(_string_ __name__)  
Returns the value of a key in the Crystalline data store.  
__Parameters__  
name: The name of the key.  
  
  
  
__Crystalline.bind__(_string_|_HTMLElement_|_Array_|_NodeList_ __elementOrSelector__, _string_ __name__)  
Binds an element on the DOM to a key in the Crystalline data store. This will display the value of the key in the element whenever the value in the data store changes. The first argument can take a selector string, an HTML element, or an Array/NodeList of HTMLElements. A selector string is prefered because this function will automatically wait for the element(s) to be loaded into the DOM in that case. A selector string which selects multiple elements will cause the bind to be applied to all of those elements.  
If the element takes user input, it is both in and out bound, meaning that changes to the value of the input element will change the data, and changes to the data will change the input element's value.  
There is a lot of automatic behavior tied to this function. __TODO: Detail automatic behavior.__  
__Parameters__  
elementOrSelector: Either a direct reference to an element, or the selector string for an element (eg. "#myDivID")  
name: the data key to bind the element to.  
  
__Crystalline.bind__(_string_|_HTMLElement_|_Array_|_NodeList_ __elementOrSelector__)__.out__(_string_ __name__)  
Only out binds the element, meaning that the element can change the data, but the data being changed will not change the element's value. Only used for elements that take user input.  
  
__Crystalline.bind__(_string_|_HTMLElement_|_Array_|_NodeList_ __elementOrSelector__)__.in__(_string_ __name__)  
Only in binds the element, meaning that changes to the data will change the element's displayed data, but changes to the element's value will not change the data. Only has any significance when used on elements that take user input.  
  
__Note:__ the .in and .out functions can be chained in either order  
Crystalline.bind("#myEl").in("myData").out("myData) or Crystalline.bind("#myEl").out("myData").in("myData) although both are functionally identical to Crystalline.bind("#myEl", "myData")  
  
  
  
__Crystalline.eventListener__(_string_|_HTMLElement_ __elementOrSelector__, _string_ __event__, _function_ __callback__)  
Creates an event listener on the target element which uses the provided callback. This function will automatically wait for the element to be loaded to the DOM if elementOrSelector is a selector string. This convenience is the main purpose of this function.  
__Parameters__  
elementOrSelector: Either a direct reference to an element, or the selector string for an element (eg. "#myDivID")
event: the name of the event (eg. "onmouseup")
callback: the function that will be called when the event triggers  
  
  
  
__Crystalline.createElement__(_string_ __tagName__, _object_ __properties__)  
Returns a new HTMLElement with the specified tag and applies properties from the provided object. The properties object maps directly to the structure of an HTMLElement, so use a format like this:  
{ "innerText": "anything you want", style: { "background-color": "#000", "width": "100px", "height": "100px"}  
This is slightly more convenient than using document.createElement and then setting each property. That's all this does.  
__Parameters__  
tagName: the tag for the new element. (eg. "div")  
properties: the properties for the new element.  
  
  
__Crystalline.createElementFromData__(_string_ __tagName__, _string|number|object|array|HTMLElement_ data, _object_ __properties__)  
Returns a new HTMLElement with the specified tag, applies the provided properties, and applies the given data value to the element using the same rendering rules as data binding. The difference is that the element is static after being created.  
__Parameters__  
tagName: the tag for the new element. (eg. "div")  
data: a value to render in the element  
properties: the properties for the new element.  
  
  
__Crystalline.http__  
A simple interface for performing HTTP calls. It can be used statically and/or instantiated with the 'new' keyword. When used statically, there is a default options configuration which will be listed below. Individual requests can be passed an object to specify a different configuration. When instantiated, options can be passed to configure the default options for that particular instance.  
Methods:  
__http.get__(_string_ __path__, _object_ __options__)  
__http.post__(_string_ __path__, _object_ __options__)  
__http.put__(_string_ __path__, _object_ __options__)  
__http.patch__(_string_ __path__, _object_ __options__)  
__http.delete__(_string_ __path__, _object_ __options__)  
__http.request__(_string_ __method__, _string_ __path__, _object_ __options__)  
These methods only differ by the HTTP verb.  
__Parameters__  
method (http.request only): the HTTP verb to use for this request.
path: the url to make the request to.  
options: An object with options. See the fetch API for details: https://developer.mozilla.org/en-US/docs/Web/API/Request  
Note: Options must conform to the values accepted by the fetch API with the exception of the baseURL option.  
  
The functions return a promise which resolves to the data from the request body. For more detailed use cases, use the fetch API or a dedicated HTTP library. The data will be assumed to be JSON and automatically parsed if it is a string which starts with { or [. Standalone primitive values, although technically valid JSON, will not be parsed and will be returned as a string.  
  
Default Options: {  
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
}

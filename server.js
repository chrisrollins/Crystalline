const port = 5000;
const http = require("http");
const fs = require("fs");
const backEnd = require("./backend.js");

//SERVER UTILITY
const detectFileExt = function(filename)
{
	let ext;
	for(let i = (filename.length - 1); i >= 0; i--)
	{
		if(filename[i] === ".")
		{
			ext = filename.slice(i+1);
			break;
		}
	}
	return ext;
}

const mimeTypes = {
	"html": "text/html",
	"htm" : "text/html",
	"mp3": "audio/mpeg",
	"mp4": "video/mp4",
	"jpeg": "image/jpeg",
	"jpg": "image/jpeg",
	"png": "image/png",
	"js": "text/javascript",
	"css": "text/css"
};


//FUNCTIONS
const respond = function(response, status, contents, ...headers)
{
	for(const header of headers)
	{
		for(const key in header)
		{
			response.setHeader(key, header[key]);
		}
	}
	response.writeHead(status);
	if(contents)
	{
		try{
			if(typeof contents !== "string")
			{
				if(typeof contents === "object")
				{
					contents = JSON.stringify(contents);
				}
				else
				{
					contents = contents.toString();
				}
			}
			response.write(contents);
		}
		catch(e)
		{
			console.log("Exception while trying to write response.");
			console.log(e);
		}
	}
	response.end();
}

const sendFile = function(response, filename)
{
	const ext = detectFileExt(filename);
	fs.readFile(filename, "utf8", function (errors, contents)
	{	
		if(!errors)
		{
			respond(response, 200, contents, {"Content-Type": (mimeTypes[ext] || "*/*")});
		}
		else
		{
			respond(response, 404, "File not found.");
		}
	});
}


//MAIN CONTROLLER
const mainController = function(request, response)
{
	console.log("Requested URL:", request.url);
	return true;
}


//CONTROLLERS
const topicListController = function(request, response)
{
	respond(response, 200, backEnd.getTopicList());
}

const docContentController = function(request, response)
{
	respond(response, 200, backEnd.getDocContent());
}


//ROUTES
const routes = {
	"/" : "index.html",
	"/forum" : "./forum/index.html",
	"/doc_app" : "./docApp/index.html",
	"/get_topic_list" : topicListController,
	"/doc_app_content" : docContentController
}

try
{
	const server = http.createServer(function (request, response)
	{
		if(mainController(request, response) === true)
		{
			const ext = detectFileExt(request.url);
			if(ext)
			{
				done = 0;
				if(request.url[0] === "/")
				{
					request.url = request.url.slice(1);
				}
				sendFile(response, request.url);
			}
			else
			{
				const routeResult = routes[request.url];
				if(routeResult !== undefined)
				{
					if(typeof routeResult === "function")
					{
						routeResult(request, response);
					}
					else if(typeof routeResult === "string")
					{
						sendFile(response, routeResult);
					}
					else
					{
						respond(response, 500, "Internal server error.");
					}
				}
				else
				{
					respond(response, 400, "Bad request.");
				}
			}
		}
	});
	server.listen(port);
	console.log(`Listening on port ${port}`);
}
catch(e)
{
	console.log(e);
}
const port = 5000;
const http = require("http");
const fs = require("fs");

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
		response.write(contents);
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

const testController = function(request, response)
{
	respond(response, 200, `{"test": 1}`);
}

const routes = {
	"/" : "index.html",
	"/test" : testController
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

try
{
	const server = http.createServer(function (request, response)
	{
		console.log("client request URL: ", request.url);
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
		
	});
	server.listen(port);
	console.log(`Listening on port ${port}`);
}
catch(e)
{
	console.log(e);
}
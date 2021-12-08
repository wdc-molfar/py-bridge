const PyBridge = require("../index.js")
const path = require("path")

const config = {
	mode: 'text',
	encoding: 'utf8',
	pythonOptions: ['-u'],
	pythonPath: (process.env.NODE_ENV && process.env.NODE_ENV == "production") ? 'python' : 'python.exe'
}

const run = async () => {
	
	const bridge = new PyBridge(config)

	bridge
		.use("echo", path.resolve(__dirname, "./python/echo.py"))
		// .use("execute", path.resolve(__dirname, "./python/echo.py"))
		.start()

	let res = await bridge.echo({
		message: "Hello World!"
	})	

	console.log(res)

	setTimeout( () => {
		bridge.terminate()
	}, 10000)

}

run()

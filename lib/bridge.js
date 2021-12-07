const { PythonShell } = require('python-shell')
const { extend, keys, find } = require('lodash')
const v4 = require("uuid").v4


const PyBridgeError = class extends Error {
	constructor(message){
		super(message)
		this.name = "PyBridge Error";
	}
}


const PyBridge = class {

	#shells
	#options
	
	constructor(options){
		this.#shells = []
		this.#options = options
	}

	use(command, pyScript){
		
		if(!pyScript) throw new PyBridgeError(`Cannot register py script ${pyScript} as "${command}".`)

		let shell = find( this.#shells, s => s.command == command)
		if (shell) throw new PyBridgeError(`Cannot register py script ${pyScript} as "${command}". Command already exists.`)

		this.#shells.push({
			command,
			script: pyScript
		})

		this[command] = async data => this.execute(command,data)	

		return this
	} 


	start(){
		
		this.#shells.forEach( s => {
			s.shell = new PythonShell(s.script, this.#options)
		})		
	}

	terminate(){
		
		this.#shells.forEach( s => {
			if(s.shell) s.shell.end()
		})		
	}

	async execute(command, data) {
		
		return new Promise( (resolve, reject) => {

			data = extend({}, data, { 
				_id: v4(), 
				_command: command 
			})

			let s = find( this.#shells, s => s.command == command)
			
			if(!s) throw new PyBridgeError(`Command "${command}" not defined. Use .use() method for registers it.`)

			let shell = s.shell
				
			if(shell){
				shell.once("message", message => {
			        data = {
			        	request: data,
			        	data: JSON.parse(message)
			        }	
			        resolve(data)
			    })

			    shell.once("error", err => {
			    	data = {
			        	request: data,
			        	error: err
			        }
			    	reject(data)
			    })

			    shell.send(JSON.stringify(data), { mode: 'json' });

			} else {
				throw new PyBridgeError(`Script ${shell.script} not started. Use .start() method for starts it.`)
			}
		})
	}
}			
			
module.exports = PyBridge
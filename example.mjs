#!/usr/bin/env node
import parseCLIArgs from "./index.mjs"

const args = await parseCLIArgs(
	process.argv.slice(2), {
		flags: ["test"],
		/* options are key-value based */
		/* value specifies the type of value required */

		// valid types:

			// fs:file
			// fs:dir
			// fs:path
			// string
			// float
			// integer

		// "type" can also be a function that validates the value
		options: {
			"file": "fs:file",

			"special-value": function(value) {
				return `something-${value}`
			}
		},

		// multi options means option can be specified more than one time
		multi_options: ["file"]
	}
)

console.log(
	args
)

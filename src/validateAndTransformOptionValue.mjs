import fs from "node:fs/promises"
import getTypeOfPathSync from "./getTypeOfPathSync.mjs"

export default async function(value, ctx) {
	// custom function
	if (typeof ctx === "function") {
		return await ctx(value)
	}
	// fs:file
	// fs:dir
	// fs:path
	else if (ctx.startsWith("fs:")) {
		const type = getTypeOfPathSync(value)

		if (type === "error") {
			throw new Error(`${value}: no such file or directory.`)
		} else if (ctx === "fs:file" && type !== "file") {
			throw new Error(`${value}: not a file.`)
		} else if (ctx === "fs:dir" && type !== "dir") {
			throw new Error(`${value}: not a directory.`)
		}

		return await fs.realpath(value)
	}
	// string values (the default)
	else if (ctx === "string") {
		return value
	}
	// integer values
	else if (ctx === "integer") {
		const tmp = parseInt(value, 10)

		if (isNaN(tmp)) {
			throw new Error(`${value}: not a valid integer.`)
		}

		return tmp
	}
	// floating point values
	else if (ctx === "float") {
		const tmp = parseFloat(value)

		if (isNaN(tmp)) {
			throw new Error(`${value}: not a valid float.`)
		}

		return tmp
	}

	throw new Error(`Unrecognized option value type '${ctx}'.`)
}

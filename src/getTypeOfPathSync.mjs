import fs from "node:fs"

export default function(path) {
	try {
		const stat = fs.lstatSync(path)

		if (stat.isSymbolicLink()) {
			return "link"
		} else if (stat.isDirectory()) {
			return "dir"
		}

		return "file"
	} catch (e) {
		return "error"
	}
}

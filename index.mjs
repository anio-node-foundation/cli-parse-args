import validateAndTransformOptionValue from "./validateAndTransformOptionValue.mjs"

/**
 * Flags (boolean) are specified with -
 * Options are specified with -- and always have a value
 */
function handleFlag(flag_name, config, ctx) {
	const valid_flag_names = config.flags ?? []

	if (!valid_flag_names.includes(flag_name)) {
		throw new Error(`-${flag_name}: no such flag.`)
	}
	else if (ctx.flags.includes(flag_name)) {
		throw new Error(`-${flag_name}: already specified.`)
	}

	ctx.flags.push(flag_name)
}

async function handleOption({name, value}, config, ctx) {
	const valid_options = config.options ?? {}

	if (!(name in valid_options)) {
		throw new Error(`--${name}: no such option.`)
	} else if (value === null) {
		throw new Error(`--${name}: value required.`)
	}

	const is_multi_option = "multi_options" in config && config.multi_options.includes(name)

	if (!is_multi_option && name in ctx.options) {
		throw new Error(`--${name}: already specified.`)
	}

	const transformed_value = await validateAndTransformOptionValue(value, valid_options[name])

	if (is_multi_option && !(name in ctx.options)) {
		ctx.options[name] = []
	}

	if (is_multi_option) {
		ctx.options[name].push(transformed_value)
	} else {
		ctx.options[name] = transformed_value
	}
}

export default async function(argv, config = null) {
	let ret = {
		flags: [],
		operands: [],
		options: {}
	}

	let args = argv.slice(0)
	let arg = null
	let stop_parsing = false

	while (true) {
		if (!args.length) break

		arg = args.shift()

		if (stop_parsing) {
			//
			// after "--" all args are treated as operands
			//
			ret.operands.push(arg)

			continue
		} else if (arg === "--") {
			stop_parsing = true
		}
		// option
		else if (arg.startsWith("--")) {
			let option_name = arg.slice(2)
			let option_value = null

			// check for --option=<value> case
			if (option_name.includes("=")) {
				let tmp = option_name

				option_name = tmp.slice(0, tmp.indexOf("="))
				option_value = tmp.slice(tmp.indexOf("=") + 1)

				if (!option_value.length) {
					option_value = null
				}
			} else if (args.length) {
				option_value = args.shift()
			}

			await handleOption({
				name: option_name,
				value: option_value
			}, config, ret)
		}
		// flag
		else if (arg.startsWith("-")) {
			const flag_name = arg.slice(1)

			handleFlag(flag_name, config, ret)
		}
		// operand
		else {
			ret.operands.push(arg)
		}
	}

	if (config && "max_operands" in config) {
		const max_operands = config.max_operands

		if (ret.operands.length > max_operands) {
			throw new Error(`Too many operands.`)
		}
	}

	if (config && "min_operands" in config) {
		const min_operands = config.min_operands

		if (min_operands > ret.operands.length) {
			throw new Error(`Too few operands.`)
		}
	}

	if (config && "required_options" in config) {
		const required_options = config.required_options

		for (const required_option of required_options) {
			if (!(required_option in ret.options)) {
				throw new Error(`--${required_option}: option required.`)
			}
		}
	}

	return ret
}

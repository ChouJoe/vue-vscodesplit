export const getStyles = (rule, ownRules, matchedRules) =>
    [...ownRules, ...matchedRules]
        .map(r => r.style[rule])
        .filter(style => style !== undefined && style !== '')

export const getGapValue = (unit, size) => {
    if (size.endsWith(unit)) {
        return Number(size.slice(0, -1 * unit.length))
    }
    return null
}

export const firstNonZero = tracks => {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].numeric > 0) {
            return i
        }
    }
    return null
}

export const NOOP = () => false

export const defaultWriteStyle = (element, gridTemplateProp, style) => {
    // eslint-disable-next-line no-param-reassign
    element.style[gridTemplateProp] = style
}

export const getOption = (options, propName, def) => {
    const value = options[propName]
    if (value !== undefined) {
        return value
    }
    return def
}
export function range(from, to) {
	const result = [];

	if (from <= to) {
		for (let i = from; i < to; i++) {
			result.push(i);
		}
	} else {
		for (let i = from; i > to; i--) {
			result.push(i);
		}
	}

	return result;
}
export function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}
export function pushToStart(arr, value){
	const index = arr.indexOf(value);
	if (index > -1) {
		arr.splice(index, 1);
		arr.unshift(value);
	}
}
export function pushToEnd(arr, value) {
	const index = arr.indexOf(value);
	if (index > -1) {
		arr.splice(index, 1);
		arr.push(value);
	}
}
export function isUndefined(obj){
    return (typeof obj === 'undefined');
}
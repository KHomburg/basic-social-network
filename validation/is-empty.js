const isEmpty = (value) => {
    return(
        value === undefined ||
        value === null ||
        (typeof value === "object" && Object.keys(value).length === 0) ||
        (typeof value === "string" && value.trim().lentgh === 0)
    );
} // returns true if empty, else false

module.exports = isEmpty;
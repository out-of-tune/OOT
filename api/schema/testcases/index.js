const artistCases = require('./artistcases')
const genreCases = require('./genrecases')
const tokenCases = require('./tokencases')
const userCases = require('./usercases')

module.exports = [
    ...artistCases,
    ...genreCases,
    ...tokenCases,
    ...userCases
]
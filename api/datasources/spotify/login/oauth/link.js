const querystring = require('querystring')

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = (length) => {
  var text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  return text
}



const link_state = (redirect_uri, scope, client_id, base_url) =>
  link(redirect_uri, scope, client_id, base_url, generateRandomString(16))

const link = (redirect_uri, scope, client_id, base_url, state) => {
  return {
    url: `${base_url}?${querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    })}`,
    state: state
  }
}

module.exports = link_state
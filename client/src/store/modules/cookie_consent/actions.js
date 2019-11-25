import "cookieconsent"
//import "cookieconsent/build/cookieconsent.min.css"

const initCookieConsent = ({ commit }) => {
    window.cookieconsent.initialise({
        "palette": {
            "popup": {
              "background": "#444",
              "text": "#ffffff"
            },
            "button": {
              "background": "#da6a1d",
              "text": "#ffffff"
            }
        },
        position: "top-right",
        revokable:true,
        onStatusChange: function(status) {
            commit('SET_COOKIE_STATUS', status)
        },
        onInitialise: function(status) {
            commit('SET_COOKIE_STATUS', status)
        },
        "theme": "edgeless",
        "type": "opt-in",
        "content": {
            "href": "/#/cookiepolicy"
        }
    })
}

export const actions = {
    initCookieConsent
}
export default actions
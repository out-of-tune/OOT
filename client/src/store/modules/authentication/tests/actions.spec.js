/**
 * @jest-environment jsdom
 */

import SpotifyTokenService from '@/store/services/SpotifyTokenService'
import AuthenticationService from '@/store/services/AuthenticationService'
jest.mock("@/store/services/SpotifyTokenService")
jest.mock("@/store/services/AuthenticationService")
jest.mock("@/store/services/BaseService")

import { actions } from '../actions'

const {
    login,
    setAccessToken,
    setRefreshToken,
    setExpiryTime,
    refreshToken,
    setLoginState,
    refreshTokenAfterTimeout,
    requireAccessToken,
    logout,
} = actions

describe("refreshTokenAfterTimeout", ()=>{
    let dispatch
    let state
    beforeEach(()=>{
        dispatch = jest.fn()
        state = {
            expiryTime: 100
        }
        jest.useFakeTimers()
    })
    it("refreshes token after timeout", async ()=>{
        refreshTokenAfterTimeout({state, dispatch})
        jest.advanceTimersByTime(state.expiryTime*1000)
        expect(dispatch).toHaveBeenCalledWith("refreshToken")
    })
    
})

describe("setRefreshToken", ()=>{
    let commit
    let token
    beforeEach(()=>{
        commit = jest.fn()
        token = "1323"
    })
    it("sets the refresh token", ()=>{
        setRefreshToken({commit}, token)
        expect(commit).toHaveBeenCalledWith("SET_REFRESH_TOKEN", token)
    })
})

describe("setExpiryTime", ()=>{
    let commit
    let time
    beforeEach(()=>{
        commit = jest.fn()
        time = "1323"
    })
    it("sets the refresh token", ()=>{
        setExpiryTime({commit}, time)
        expect(commit).toHaveBeenCalledWith("SET_EXPIRY_TIME", time)
    })
})

describe("requireAccessToken",() =>{
    let commit
    let rootState
    beforeEach(()=>{
        commit=jest.fn(),
        rootState={
            authentication: {
                clientAuthenticationToken: ''
            }
        }
    })
    it("Obtains the token and writes it to the database",async ()=>{
        SpotifyTokenService.getAccessToken.mockReturnValue({publicToken:{token:"IBimsEinsToken"}})
        await requireAccessToken({commit, rootState})
        expect(commit).toHaveBeenCalledWith("SET_SPOTIFY_ACCESS_TOKEN", "IBimsEinsToken")
    })
})

describe("refreshToken", () =>{
    let dispatch
    beforeEach(()=>{
        dispatch=jest.fn()
    })
    it("refreshes the token", async () => {
        let state = {
            refreshToken: "refreshToken"
        }
        AuthenticationService.refreshToken = jest.fn()
        AuthenticationService.refreshToken.mockReturnValue({access_token: "newToken"})
        await refreshToken({ state, dispatch })
        expect(dispatch).toHaveBeenCalledWith('setAccessToken', "newToken")
    })
})

describe("setLoginState", () =>{
    let commit
    beforeEach(()=>{
        commit=jest.fn()
    })
    it("sets the login state", () => {
        setLoginState({ commit }, true)
        expect(commit).toHaveBeenCalledWith('SET_LOGIN_STATE', true)
    })
})

describe("setAccessToken", () =>{
    let dispatch
    let commit
    beforeEach(()=>{
        dispatch=jest.fn()
        commit = jest.fn()
    })
    it("calls SET_ACCESS_TOKEN", async () => {
        setAccessToken({ commit, dispatch }, "12345")
        expect(commit).toHaveBeenCalledWith('SET_ACCESS_TOKEN', "12345")
    })
    it("sets login state", async () => {
        setAccessToken({ commit, dispatch }, "12345")
        expect(dispatch).toHaveBeenCalledWith('setLoginState', true)
    })
    it("refreshes token", async () => {
        setAccessToken({ commit, dispatch }, "12345")
        expect(dispatch).toHaveBeenCalledWith('refreshTokenAfterTimeout')
    })
})


describe("logout", () =>{
    let dispatch
    let commit
    beforeEach(()=>{
        dispatch=jest.fn()
        commit = jest.fn()
    })
    it("calls SET_ACCESS_TOKEN", async () => {
        logout({ commit, dispatch })
        expect(commit).toHaveBeenCalledWith('DELETE_USER_STATE')
    })
    it("sets login state", async () => {
        logout({ commit, dispatch })
        expect(dispatch).toHaveBeenCalledWith('setLoginState', false)
    })
    it("deletes current user object", async () => {
        logout({ commit, dispatch })
        expect(dispatch).toHaveBeenCalledWith('deleteCurrentUser')
    })
})

describe("login", () =>{
    beforeEach(()=>{
        global.window = Object.create(window);
        Object.defineProperty(window, 'location',{
            value: {
              href: ""
            }
          });
    })
    it("calls authentication service", async () => {
        await login()
        expect(AuthenticationService.get_oauth2_login_page).toHaveBeenCalled()
    })
    it("sets window.location to link", async () => {
        AuthenticationService.get_oauth2_login_page.mockReturnValue("out-of-tune.org")
        await login()
        expect(global.window.location.href).toBe("out-of-tune.org")
    })
})

import { Validator } from "jsonschema"
import schema from "@/store/modules/configuration_io/schema"
import IndexedDbService from '@/store/services/IndexedDbService'

const importConfiguration = ({
    dispatch
}, unverifiedConfigurationString) => {
    try {
        const validator = new Validator()
        const unverifiedConfiguration = JSON.parse(unverifiedConfigurationString)
        const checkedConfiguration = validator.validate(unverifiedConfiguration, schema)
        if (checkedConfiguration.errors.length == 0) {
            dispatch("loadConfiguration", checkedConfiguration.instance)
        } else {
            const errorStrings = checkedConfiguration.errors.map((error)=>{
                return "error at "+error.property
            })
            throw new Error(errorStrings.join("\n"))
        }
    } catch (error) {
        dispatch("setError",error)
    }
}
const loadConfiguration = ({commit, dispatch}, configuration) =>{
    dispatch("setSuccess","Loaded configuration successfully")
    commit("SET_CONFIGURATION", configuration)
}
const downloadConfiguration = ({ commit, rootState }) => {
    const configurations = rootState.configurations
    const file = new Blob([JSON.stringify(configurations)], {type: "JSON"})
    const url = URL.createObjectURL(file) 
    
    commit('SET_CONFIGURATION_URL', url)
}
const storeConfiguration = ({ rootState, dispatch, state, commit }, name) => {
    const configuration = rootState.configurations
    try {
        IndexedDbService.saveConfiguration(name, configuration)
        const configurationNames = state.storedConfigurationNames.includes(name) 
            ? state.storedConfigurationNames 
            : [...state.storedConfigurationNames, name]
        commit('SET_STORED_CONFIGURATION_NAMES', configurationNames)
        dispatch('setSuccess', 'Save complete')
    }
    catch(e){
        dispatch('setError', new Error('Configuration could not be saved, please download it.'))
    }
}
const loadConfigurationFromIndexedDb = async ({ dispatch }, name) => {
    try{
        const configuration = await IndexedDbService.getConfiguration(name)
        dispatch('loadConfiguration', configuration)
        dispatch('applyAllConfigurations')
    }
    catch(error){
        dispatch("setError",error)
    }
    
}
const removeConfigurationFromIndexedDb = async ({commit, dispatch, state}, name)=>{
    try{
        await IndexedDbService.deleteConfiguration(name)
        const configurationNames = state.storedConfigurationNames.filter((configurationName)=>configurationName!==name)
        commit('SET_STORED_CONFIGURATION_NAMES', configurationNames)
        dispatch('setSuccess', 'Configuration deleted')
    }
    catch(error){
        dispatch("setError",error)
    }
}
export const actions = {
    importConfiguration,
    downloadConfiguration,
    storeConfiguration,
    loadConfigurationFromIndexedDb,
    loadConfiguration,
    removeConfigurationFromIndexedDb
}
export default actions
import GraphService from '@/store/services/GraphService'
import { handleGraphqlTokenError } from '@/assets/js/TokenHelper.js'

function generateNodeAndLinks(queryResult){
    const nodes = queryResult.flatMap(element => {
        const fromNode = {id: element.id, data:{name:element.name, label:"genre"}}
        const toNode = element.subgenres.map((subgenre)=>{
            return {id: subgenre.id, data:{name:subgenre.name, label:"genre"}}
        })
        return [fromNode, ...toNode]
    });

    const links = queryResult.flatMap(element => {
        return element.subgenres.map((subgenre)=>{
            return {fromId:element.id, toId:subgenre.id, linkName:"Genre_to_Genre"}
        })
    });

    return {nodes, links}
}

function buildInceptionQuery() {
    return (`{
        genre{
            id,
            name,
            subgenres{
                id,
                name
            }
        }
    }`)
}
const generateInceptionGraph = async ({
    commit,
    dispatch,
    rootState
}) => {
    const query = buildInceptionQuery()
    const queryResult = (await handleGraphqlTokenError(
        (query, token)=>{
            return GraphService.getNodes(query, token)        
        },
        [query],
        dispatch,
        rootState
    ))
    const itemsToAdd = generateNodeAndLinks(queryResult.genre)
    commit("ADD_TO_GRAPH",itemsToAdd)
    dispatch('applyAllConfigurations')

}

export const actions = {
    generateInceptionGraph
}

export default actions
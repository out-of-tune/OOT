import { handleGraphqlTokenError } from '@/assets/js/TokenHelper.js'
import GraphService from '@/store/services/GraphService'

async function checkNodesExistence(nodeLabel, sids, schema, dispatch, rootState){
    const attributes = schema.nodeTypes.filter(nodeType=>nodeType.label===nodeLabel)[0].attributes.join(',')
    const queries = sids.map(sid=>`${nodeLabel}(sid: "${sid}"){ ${attributes} }`)
    const query = mergeGraphQlQueries(queries)
    const response = (await handleGraphqlTokenError(
        (query, token)=>{
            return GraphService.getNodes(query, token)        
        },
        [query],
        dispatch,
        rootState
    ))
    const data = Object.values(response)
    const nodes = data.map(arr => {
        if(arr.length>0){
            const { id, ...data } = arr[0]
            return { id: id, data: { ...data, label: nodeLabel }
            }
        }
        else return null
    })
    return (nodes.length>0)
    ? nodes
    : null
}

function mergeGraphQlQueries(queries){
    return queries.length > 1 
    ? queries.reduce((prev, curr, index, arr)=>{
        return index == 0 ? `{ query${index}: ${curr}` 
        : index == arr.length-1 ? `${prev}, query${index}: ${curr} }`
        : `${prev}, query${index}: ${curr}`
    }, "")
    : `{ ${queries[0]} }`
}

export {
    checkNodesExistence,
    mergeGraphQlQueries
}

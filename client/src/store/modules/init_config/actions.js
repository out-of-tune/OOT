const initConfiguration = ({ commit, rootState }) => {
    const edgeColorRules = [
        {
            "edgeLabel": "Genre_to_Genre",
            "color": "1dcdda77"
        },
        {
            "edgeLabel": "Artist_to_Genre",
            "color": "fa8a3d77"
        },
        {
            "edgeLabel": "Album_to_Artist",
            "color": "43Df3377"
        },
        {
            "edgeLabel": "Song_to_Album",
            "color": "DF339C77"
        }]
    const nodeTooltipRules = [
        {
            "nodeLabel": "artist",
            "attribute": "name"
        },
        {
            "nodeLabel": "genre",
            "attribute": "name"
        },
        {
            "nodeLabel": "album",
            "attribute": "name"
        },
        {
            "nodeLabel": "song",
            "attribute": "name"
        }
    ]
    const nodeColorRules = [
         {
            "nodeLabel": "genre",
            "rules": [
                {
                    "searchObject": {
                        "valid": true,
                        "errors": [],
                        "nodeType": "genre",
                        "attributes": [
                        ]
                    },
                    "searchString": "genre",
                    "color": "da6a1dff"
                }
            ]
        },
        {
            "nodeLabel": "artist",
            "rules": [
                {
                    "searchObject": {
                        "valid": true,
                        "errors": [],
                        "nodeType": "artist",
                        "attributes": [
                        ]
                    },
                    "searchString": "artist",
                    "color": "1dcddaff"
                }
            ]
        },
        {
            "nodeLabel": "album",
            "rules": [
                {
                    "searchObject": {
                        "valid": true,
                        "errors": [],
                        "nodeType": "album",
                        "attributes": [
                        ]
                    },
                    "searchString": "album",
                    "color": "43df33ff"
                }
            ]
        },
        {
            "nodeLabel": "song",
            "rules": [
                {
                    "searchObject": {
                        "valid": true,
                        "errors": [],
                        "nodeType": "song",
                        "attributes": [
                        ]
                    },
                    "searchString": "song",
                    "color": "df339cff"
                }
            ]
        }
    ]
    const nodeSizeRules = rootState.schema.nodeTypes.map(nodeType => {
        return {
            "nodeLabel": nodeType.label,
            "rules": [
                {
                    "searchObject": {
                        "valid": true,
                        "errors": [],
                        "nodeType": nodeType.label,
                        "attributes": [
                        ]
                    },
                    "searchString": nodeType.label,
                    "sizeType": "compare",
                    "size": 20
                }
            ]
        }
    })
    const configuration = {
        actionConfiguration: {
            expand: [
                { "nodeType":"artist","edges": [ "Artist_to_Genre","Album_to_Artist" ] },
                { "nodeType":"genre","edges": [ "Genre_to_Genre","Artist_to_Genre" ] },
                {"nodeType":"album","edges": [ "Album_to_Artist","Song_to_Album" ]},
                {"nodeType":"song","edges": [ "Song_to_Album"] }
            ],
            collapse: [
                {"nodeType":"artist","edges":["Artist_to_Genre","Album_to_Artist"]},
                {"nodeType":"genre","edges":["Genre_to_Genre","Artist_to_Genre"]},
                {"nodeType":"album","edges":["Album_to_Artist","Song_to_Album"]},
                {"nodeType":"song","edges":["Song_to_Album"]}
            ]
        },
        appearanceConfiguration: {
            nodeConfiguration: {
                color: nodeColorRules,
                size: nodeSizeRules,
                tooltip: nodeTooltipRules
            },
            edgeConfiguration: {
                color: edgeColorRules,
                size: []
            }
        }
    }
    commit('SET_CONFIGURATION', configuration)
}


export const actions = {
    initConfiguration
}

export default actions
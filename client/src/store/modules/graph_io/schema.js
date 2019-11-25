const schema = {
    "type": "object",
    "properties": {
        "nodesWithPositions":{
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "node": {
                        "type": "object",
                        "properties":{
                            "id":{
                                "type":"string"
                            },
                            "data":{
                                "type":"object"
                            },
                        },
                        "required": ["id", "data"]
                    },
                    "position": {
                        "type": "object",
                        "properties":{
                            "x": {
                                "type": "number"
                            },
                            "y": {
                                "type": "number"
                            }
                        },
                        "required": ["x", "y"]
                    },
                    "pinned":{
                        "type": "boolean" 
                    }
                },  
                "required": ["node", "position", "pinned"]
            }
        },
        "links":{
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "fromId": {
                        "type":"string"
                    },
                    "toId": {
                        "type":"string"
                    },
                    "id": {
                        "type":"string"
                    },
                    "linkTypes": {
                        "type":"array",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "required": ["fromId", "toId","id", "linkTypes"]
            }
        }
    },
    "required": ["nodesWithPositions", "links"]

}

export default schema
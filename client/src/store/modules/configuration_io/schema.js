const schema = {
    "definitions": {
        "searchObject":{
            "type":"object",
            "properties": {
                "valid": {"type": "boolean"},
                "errors": {"type": "array"},
                "nodeType": {"type": "string"},
                "attributes": {
                    "type": "array", 
                    "items": {
                        "type": "object",
                        "properties":{
                            "attributeSearch": {"type":"string"},
                            "operator": {"type": "string"},
                            "attributeData": {"type": "string"}
                        },
                        "required": ["attributeSearch", "operator", "attributeData"]
                    }
                },

            }
        }
    },
    "id": "/baseConfiguration",
    "type":"object",
    "properties":{
        "actionConfiguration":{
            "type":"object",
            "properties": {
                "expand":{
                    "type":"array",
                    "uniqueItems": true,
                    "items": {
                        "type": "object",
                        "properties": {
                            "nodeType": {"type": "string"},
                            "edges": {
                                "type": "array",
                                "items":{"type":"string"} 
                            }
                        },
                        "required":["nodeType","edges"]
                    }
                },
                "collapse":{
                    "type":"array",
                    "uniqueItems": true,
                    "items": {
                        "type": "object",
                        "properties": {
                            "nodeType": {"type": "string"},
                            "edges": {
                                "type": "array",
                                "items":{"type":"string"} 
                            }
                        },
                        "required":["nodeType","edges"]
                    }
                }
            },
            "required":["expand","collapse"]
        },
        "appearanceConfiguration":{
            "type":"object",
            "properties": {
                "nodeConfiguration":{
                    "type":"object",
                    "properties":{
                        "color":{
                            "type":"array",
                            "items":{
                                "type": "object",
                                "properties":{
                                    "nodeLabel":{
                                        "type":"string"
                                    },
                                    "rules":{
                                        "type":"array",
                                        "items":{
                                            "type":"object",
                                            "properties":{
                                                "color":{
                                                    "type":"string"
                                                },
                                                "searchString":{
                                                    "type":"string",            
                                                },
                                                "searchObject":{
                                                    "$ref": "#/definitions/searchObject"
                                                } 
                                            },
                                            "required":["color","searchString", "searchObject"]
                                        }
                                    }
                                },
                            }
                        },
                        "size":{
                            "type":"array",
                            "items":{
                                "type":"object",
                                "properties":{
                                    "nodeLabel":{
                                        "type":"string"
                                    },
                                    "rules":{
                                        "type":"array",
                                        "items":{
                                            "oneOf":[
                                                {
                                                    "type":"object",
                                                    "properties":{
                                                        "searchString":{"type": "string"},
                                                        "sizeType":{"type": "string"},
                                                        "size":{"type":"number"},
                                                        "searchObject": {
                                                            "$ref": "#/definitions/searchObject"
                                                        } 
                                                    },
                                                    "required":["searchString", "sizeType", "size", "searchObject"]
                                                },
                                                {
                                                    "type":"object",
                                                    "properties":{
                                                        "searchString":{"type": "string"},
                                                        "sizeType":{"type": "string"},
                                                        "min":{"type":"number"},
                                                        "max":{"type":"number"},
                                                        "searchObject": {
                                                            "$ref": "#/definitions/searchObject"
                                                        } 
                                                    },
                                                    "required":["searchString", "sizeType", "min","max", "searchObject"]
                                                }
                                            ]
 
                                        }
                                    }
                                },
                                "required":["nodeLabel","rules"]
                            }
                        },
                        "tooltip":{
                            "type":"array",
                            "items":{
                                "type":"object",
                                "properties":{
                                    "nodeLabel":{
                                        "type":"string"
                                    },
                                    "attribute":{
                                        "type":"string"
                                    }
                                },
                                "required":["nodeLabel","attribute"]
                            }
                        }
                    },
                    "required":["color","size"]
                },
                "edgeConfiguration":{
                    "type":"object",
                    "properties":{
                        "color":{
                            "type":"array",
                            "uniqueItems": true,
                            "items":{
                                "type":"object",
                                "properties":{
                                    "edgeLabel":{
                                        "type":"string"
                                    },
                                    "color":{
                                        "type":"string"
                                    }
                                },
                                "required":["edgeLabel","color"]
                            }
                        },
                        "size":{
                            "type":"array",
                            "uniqueItems": true
                            //MISSING ARRAY ITEMS
                        }
                    },
                    "required":["color"]
                }
            },
            "required":["nodeConfiguration","edgeConfiguration"]
        }
    },
    "required":["actionConfiguration","appearanceConfiguration"]
}

export default schema
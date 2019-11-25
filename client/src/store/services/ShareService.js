import BaseService from './BaseService'

class ShareService extends BaseService{
   
    getShareLink(type, object, token){
        let params = {
            object
        }
        return this.post("/share/"+type+"/create", params, token, {
            "Content-Type": "application/json"
        })
    }
    getSharedObject(uri, token){
        return this.get("/share/"+uri, {}, token)
    }
}
export default new ShareService()
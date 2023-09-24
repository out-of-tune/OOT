import querystring from 'querystring';
const bindAuth64 = (code, client_uri, redirect_uri, client_secret, client_id) => callback(code, client_uri, redirect_uri, Buffer.from(client_id + ':' + client_secret).toString('base64'));
const callback = (code, client_uri, redirect_uri, auth_base64) => {
    const options = {
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            "Authorization": `Basic ${auth_base64}`,
            "Content-Type": 'application/json'
        },
        json: true
    };
    return {
        options: options,
        request_token: request_token(client_uri)
    };
};
const request_token = (client_uri) => {
    return (access_token, refresh_token) => {
        const split = client_uri.split('?');
        let query = split.length === 2 ? querystring.parse(split[1]) : {};
        query = {
            access_token: access_token,
            refresh_token: refresh_token,
            ...query
        };
        return `${split[0]}?${querystring.stringify(query)}`;
    };
};
export default bindAuth64;

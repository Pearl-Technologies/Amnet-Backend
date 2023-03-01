import client from "../database/config.js";

async function verifyToken(req, res, next) {
    let token = req.headers.authorization;
    const tempKey = "Token"
    if (token === undefined){
        return res.status(401).json({ message: 'Authentication failed: missing token' });
    }
    else{
        token = token.split(' ')
        if (token[0] === tempKey){
            if (!token[1]) {
                return res.status(401).json({ message: 'Authentication failed: missing token' });
            }
            let ans = await client.query(`SELECT * FROM users WHERE token = '${token[1]}'`);
            let Token = ans.rows[0]
            if(Token === undefined) {
                return res.status(401).json({ message: 'Authentication failed: invalid token' });
            }
            else if(token[1] === Token.token){
                req.userId = Token.id;
                req.userName = Token.username;
                req.role = Token.role;
                next();
            }
            else {
                return res.status(403).json({ message: 'Authentication failed: invalid token' });
            }
        }
        else {
            return res.status(500).json({ message: 'Authentication failed: key invalid' });
        }
    }
}
export default verifyToken;
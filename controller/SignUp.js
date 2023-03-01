import client from "../database/config.js";
import jwt from 'jsonwebtoken'
const { sign, verify } = jwt
import { hash, compare } from "bcrypt";

export const signup = ("/signup", async(req, res) => {
    
    try {
    const { username, password, email, role } = JSON.parse(req.body);
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    let existingUser = result.rows[0];
    if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
    }
    else{
        const hashedPassword = await hash(password, 10);
        await client.query('INSERT INTO users (username, email, password, role, created_by) VALUES ($1, $2, $3, $4, $5)', [username, email, hashedPassword, role, 1]);
        const result = await client.query('SELECT * FROM users WHERE username = $1 and password = $2 and status=1', [username, hashedPassword]);
        console.log(result.rows[0])
        // const token = sign({ userId: result.rows[0].id }, 'mysecretkey');
        res.status(200).json({message: "Created Successfully" });
    }     
    } 
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export const login = ("/login", async(req, res) => {
    try {
        const { username, password } = req.body;
        console.log(req.body)
        const ans = await client.query(`SELECT * FROM users WHERE username = '${username}' and status=1`);
        console.log(ans.rows[0]===undefined)
        if(ans.rows[0]===undefined) {
            res.status(500).json({message: "Username Incorrect"})
        }
        else{
            compare(password, ans.rows[0].password, async (err, obj) => {
                if (err) {
                    res.status(500).json({message: "Password Incorrect"})
                } else if (obj) {
                    const ans = await client.query(`SELECT * FROM users WHERE username = '${username}'`);
                    const token = sign({ userId: ans.rows[0].id }, 'mysecretkey');
                    const updateToken = await client.query(`UPDATE users SET token = '${token}' WHERE username = '${username}'`);
                    res.json({ token });
                } else {
                    res.status(500).json({message: "Password Incorrect"})
                }
        })
        }
    } 
    catch (error){
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export const tokenValidate = ("/tokenValidate", async(req, res) => {
    try {
        const { secret } = req.body;
        function validateToken(token) {
        try {
            const decoded = verify(token, secret);
            return decoded;
        } catch (err) {
            return null;
        }
        }

        async function getEmployeeById(id) {
            console.log(id);
            const ans = await client.query(`SELECT * FROM users WHERE id = '${id}'`);
            if(ans.rows.length === 0) {
                res.status(500).json({message: "No users Availabe"});    
            }
            else{
                return ans.rows[0];
            }
        }

        const token = req.headers.authorization.split(' ')[1];
        console.log(token)
        const decodedToken = validateToken(token);

        if (decodedToken) {
            const employee = getEmployeeById(decodedToken.userId);
            console.log(decodedToken.userId)
            if (employee) {
            res.send(employee);
            } else {
            res.status(404).send('Employee not found');
            }
        } else {
            res.status(401).send('Invalid token');
        }


    } 
    catch (error){
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export const getUser = ("/getUser", async(req, res) => {
    try {
        const {
            limit,
            page,
            search
        } = req.query
        var ans;
        var count;
        if (search != "" && search != undefined) {
            ans = await client.query(`SELECT id, username, email, status, TO_CHAR(created_date, 'dd/mm/yyyy') as created_date FROM users 
        where to_tsvector(username || ' ' || email || ' ') @@ plainto_tsquery('${search}') limit ${limit} offset ${((page * limit)-limit)}`);    
            count = await client.query(`SELECT Count(*) FROM users 
        where to_tsvector(username || ' ' || email || ' ') @@ plainto_tsquery('${search}')`);    
        }
        else {
            ans = await client.query(`SELECT id, username, email, status, TO_CHAR(created_date, 'dd/mm/yyyy') as created_date FROM users 
        limit ${limit} offset ${((page * limit)-limit)}`);
            count = await client.query(`SELECT Count(*) FROM users`);
        }
        if(ans.rows.length === 0) {
            res.status(500).json({message: "No Data Available"});    
        }
        else{
            res.json({
                "status":200,
                "data":ans.rows,
                "count": count.rows[0].count
            });
        }
    } 
    catch (error){
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export const getUserId = ("/getUserId", async(req, res) => {
    try {
        const {
            id
        } = req.query
        const ans = await client.query(`SELECT id, username, email, status, TO_CHAR(created_date, 'dd/mm/yyyy') as created_date FROM users where id='${id}'`);
        if(ans.rows.length === 0) {
            res.status(500).json({message: "No Data Available"});    
        }
        else{
            res.json({
                "status":200,
                "data":ans.rows[0]
            });
        }
    } 
    catch (error){
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export const updateUser = ("/updateUser", async(req, res) => {
    
    try {
        const { username, email, status, id} = req.body;
        await client.query(`UPDATE users set username = $1, email = $2, status = $3, updated_by=${req.userId}, updated_date=now() where id = $4`, [username, email,status, id]);
        res.json({ 
            "status": 200,
            "message": "Updated Succesfully"
         });
    }     
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export const deleteUser = ("/deleteUser", async(req, res) => {
    
    try {
        const {
            status,
             id 
            } = JSON.parse(req.body);
        console.log(status, id);
        await client.query(`UPDATE users set status=${status}, updated_by=${req.userId}, updated_date=now() where id=${id}`);
        res.json({ 
            "status": 200,
            "message": "Deleted Successfully"
         });
    }     
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export const forgotUser = ("/forgotUser", async(req, res) => {
    
    try {
        const newpin = await bcrypt.hash(req.body.newpin.toString(), 10); 
        let token=req.headers.authorization
        console.log(token)
        let oldpassword=await client.query(`SELECT * FROM users where token = ${token} limit 1`);
        console.log(oldpassword)

        if(oldpassword.rows[0].password===req.body.oldpin)
        {
            return res.status(500).send({message:"Enter the correct old password",status:"false",data:[]})
        }

        if(req.body.oldpin===req.body.newpin)
        {
            return res.status(500).send({message:"Both new and old password are same",status:"false",data:[]})
        }
        const updatedata = await client.query(`UPDATE users set password = ${newpin} where token = ${token}`);
        if(updatedata)
        {
            res.status(200).send({message:"Pin changed successfully",status:"true"})
        }
        else{
            res.status(500).send({message:"Pin not changed successfully",status:"false"})
        }   
    }     
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export const logout = ("/logout", async(req, res) => {
    req.session.destroy(async function(err) {
      if (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
      } else {
        const updateToken = await client.query(`UPDATE users SET token=NULL WHERE id='${req.userId}'`);       
        res.status(200).send({message:"Logout successfully",status:"true"})
      }
    });
});
  

const fs = require("fs");
const {spawn} = require("child_process");
class Service {


    static async deleteFile (file) {
        try {
            file = process.cwd() + "/public/" + file;
            fs.unlink(file, (err) => {
                if (err) console.error(err)
                console.log(">>> File Deleted")
                return true;
            })
        } catch (e) {
            console.error(e)
        }
    }


    static runProcess (path , params = {}){


        const process = spawn(path , params);
        const processId = process.pid;

        process.stdout.on('data' , data=>{
              console.log("process ran successfully" , data.toString() , processId);          
        })

        process.stderr.on("data" , data=>{

            console.log("error occured in process" , data.toString() , processId);
            return {err : "Error occured" , processId}
        })

        process.on("close" , code=>{
            console.log("process closed" ,code , processId);

        })

        process.on("exit" , code =>{
            console.log("process exit" ,code , processId);

        })

    }

}


module.exports = Service;
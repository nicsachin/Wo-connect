const axios = require('axios');
const { app, BrowserWindow, autoUpdater, dialog } = require('electron')
const isDev = require("electron-is-dev");
const ipc = require("electron").ipcMain;
const path = require("path");
const {spawn} = require("child_process");
const Service = require("./utils/Service");
const uuid = require("uuid");
let ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const updater = require('./utils/Updater.js');

let ffmpegPath = require('ffmpeg-ffprobe-static').ffmpegPath.replace('app.asar', 'app.asar.unpacked');
let ffprobePath = require('ffmpeg-ffprobe-static').ffprobePath.replace('app.asar', 'app.asar.unpacked');


ipc.on("install" , (event)=>{


    // let image = fs.readFileSync(path.join(__dirname , `/public/test.jpeg` )).toString('base64')
    // // console.log("image" , image)

    // let tag = `data:image/png;base64,${image}`;

    // event.sender.send("response" , tag);

    
    
    let env = {
        RTSP_API : "yes"
    }
    
    // let temp_path = "C:\\Users\\Wobot\\AppData\\Local\\Programs\\Wo-connect\\resources\\rtsp-simple-server\\Windows\\rtsp-simple-server.exe";
    // let applicationPath  = path.join(app.getAppPath().replace("app.asar" , "rtsp-simple-server") , "\Windows\\rtsp-simple-server.exe")
    let applicationPath = "C:\\Users\\azureuser\\AppData\\Local\\Programs\\Wo-connect\\resources\\rtsp-simple-server\\Windows\\rtsp-simple-server.exe";
  
    event.sender.send("response",{applicationPath})
    
    
    let RTSP_SERVER_PATH_ENDPOINT = "http://localhost:9997/v1/paths/list"
    //check if rtsp server is installed or not
    
        axios.get(RTSP_SERVER_PATH_ENDPOINT)
            .then(function (response) {
                console.log("inside then block")
    
                        //runs when rtsp server is running
             })
            .catch(function (error) {
                Service.runProcess(applicationPath , {detached : true , env});
                console.log("inside catch block");
                // Service.install(applicationPath);
                // console.log(error)
                event.sender.send("response", {"error": error})
            })
    
    


})


const checkAndCreateFile = ()=>{

    return new Promise((resolve)=>{
        fs.access(path.join(app.getPath("userData") , `public` ), function(error) {
            if (error) {
                //directory does not exist
                fs.mkdirSync(path.join(app.getPath("userData") , `public` ));
                resolve(path.join(app.getPath("userData") , `public` ))
            } else {
                //directory exist
                resolve(path.join(app.getPath("userData") , `public` ))
            }})
    })
}

ipc.on("frame" , async (event , val)=>{



    let publicPath = await checkAndCreateFile();

    event.sender.send("response",{publicPath})

    let rtsp = val.rtsp;
    let cameraChannelId = 1;
    let frame = `${uuid.v4()}-${cameraChannelId}.jpg`;

    const args = [
        `-rtsp_transport`, `tcp`,
        `-y`,
        `-stimeout`, `3000000`,
        `-i`, rtsp,
        `-vframes`, `1`,
        frame
    ];

    event.sender.send("response" , publicPath)

    let  process = spawn(ffmpegPath, args ,  { cwd: publicPath });

    let data = {
        rtsp,
        rtspMain : rtsp ,
        status : "Active"
    }

    process.on('close', function (code) {

        if (code === 0) {
            // Service.deleteFile(frame)
        } else {
            data.status = "Inactive";
        }


        let image = fs.readFileSync(path.join(publicPath , frame )).toString('base64')
        // console.log("image" , image)
        let tag = `data:image/png;base64,${image}`;

        event.sender.send("response", {data : image})
        event.sender.send("response", {tag})


        console.log({data , code})


    });



// let rtsp = "rtsp://admin:wobot%234321@113.193.200.82:556/Streaming/Channels/101/";


})


ipc.on("codec" , (event , val)=>{
    // let rtsp = "rtsp://admin:wobot%234321@113.193.200.82:556/Streaming/Channels/101/";
    let rtsp = val.rtsp;

    ffmpeg.setFfprobePath(ffprobePath)

    ffmpeg.ffprobe(rtsp, async function (err, metadata) {
        console.log('err' , err , metadata)
        let audioCodec = "";
        let videoCodec = "";
        if (metadata) {
            metadata.streams.forEach(function (stream) {
                if (stream.codec_type === "video")
                    videoCodec = stream.codec_name;
                else if (stream.codec_type === "audio")
                    audioCodec = stream.codec_name;
            });

            event.sender.send("response", {videoCodec , audioCodec})
            console.log("Video codec: %s\nAudio codec: %s", videoCodec, audioCodec);
        }
        else{
            event.sender.send("response", {"error" : err})
        }


    });



})

function createWindow () {






    //check for updates
        
    setTimeout(updater , 1500);

    
    const mainWindow = new BrowserWindow({
        height : 800,
        width : 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    if(isDev) {
        // mainWindow.loadURL('http://127.0.0.1:3000')
        // mainWindow.loadFile("source/build/index.html");
        mainWindow.loadFile("testBuild/index.html");
        mainWindow.webContents.openDevTools();
    }else mainWindow.loadFile("testBuild/index.html");
    mainWindow.webContents.openDevTools();
    // mainWindow.maximize()
    mainWindow.setMenu(null);
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})


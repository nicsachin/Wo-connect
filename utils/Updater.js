const {autoUpdater} = require("electron-updater")
const {dialog} = require("electron")
//for logging update logs
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level  = "info";

//auto download false
autoUpdater.autoDownload = false;

module.exports =  ()=>{
    //check for updates
    autoUpdater.checkForUpdates();

    console.log("checking for updates");
    //when updates are available
    autoUpdater.on('update-available' , ()=>{
        //prompt the user for update
        dialog.showMessageBox({
            type : "info" , 
            title : "Update available" , 
            message : "A new version of app is available" , 
            button : ["Update" , "No"]
        }).then(result =>{
            let index = result.response;

            //if user clicks on update button
            if(index === 0) autoUpdater.downloadUpdate();
        })
    })

    //after update is downloaded
    autoUpdater.on("update-downloaded" , ()=>{
            //prompt the user for update
             dialog.showMessageBox({
            type : "info" , 
            title : "Updates ready" , 
            message : "Install and restart now ?" , 
            button : ["Yes" , "Later"]
        }).then(result =>{
            let index = result.response;

            //if user clicks on update button
            if(index === 0) autoUpdater.quitAndInstall(false , true);
        })
        
    })
}

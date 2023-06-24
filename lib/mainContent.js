const fs = require('fs');
const path = require('path');
//require files
const calculateSizeD = require('./calculateSizeD.js');
const calculateSizeF = require ('./calculateSizeF.js');
const buildMainContent = (fullStaticPath,pathname) =>{
    let mainContent = '';
    let items,stats;
 //loop through the elemwnts inside the folder //example projects naam ke folder 
 try{
  items =  fs.readdirSync(fullStaticPath);
 console.log(items)
 }catch(err){
 console.log(`readDirSyncError:${err}`);
 return `<div class="alert alert-danger">Internal Server Error </div>`
 }

 //remove   .DSstore
 items  = items.filter (element => element != '.DS_Store');

 //get the following elements for each item:  //jese ek folder ka naam projects hai or usme ek file ka name hai css hai to uski saari jaankari nikal lo
        
        items.forEach(item => {//jo item hai pathname ko join kr diya jo particular files nikle hai looping se then usko pathname*(url with folder) se connect kar diya taaki unka alag se path ban jaaye khud ka
         //store item details in an object 
         let itemDetails = {};  
         //name
         itemDetails.name = item;   
         console.log(pathname)
         //link
           const link = path.join(pathname,item);
           //icon
           
           let icon,stats;
           //get stats of the item 
           const itemFullStaticPath = path.join(fullStaticPath,item);
           try{
              itemDetails.stats = fs.statSync(itemFullStaticPath);
           }catch(err){
                 console.log(  `statSync Error : ${err}`);
                 mainContent = `<div class="alert alert-danger">Internal Server Error</div>`;
                 return false;
           }
           if(itemDetails.stats.isDirectory()){
              itemDetails.icon = '<ion-icon name="folder"></ion-icon>';
            [itemDetails.size,itemDetails.sizeBytes] = calculateSizeD(itemFullStaticPath);
            }else if(itemDetails.stats.isFile()){
              itemDetails.icon = '<ion-icon name="document"></ion-icon>';
            [itemDetails.size,itemDetails.SizeBytes] = calculateSizeF(itemDetails.stats);
            }

            //when was the file last change?(unix timestamp)
            itemDetails.timeStamp = itemDetails.stats.mtimeMs;

            //convert time stamp to a date
            itemDetails.date =  new Date(itemDetails.timeStamp)

            itemDetails.date = itemDetails.date.toLocaleString();

            console.log(itemDetails.date);

           mainContent += `<tr data-name = "${itemDetails.name}" data-time = "${itemDetails.timeStamp} data-size = "${itemDetails.sizeBytes}"> 
 <td>${itemDetails.icon}<a href="${link}" target='${itemDetails.stats.isFile() ? "_blank" : "" }'>${item}</a></td>
 <td>${itemDetails.size }</td>
<td> ${itemDetails.date }</td>
 </tr>`;
        });
        //link to the item 
        //size
        //last modified
                 
 
 return mainContent;
};

module.exports = buildMainContent;
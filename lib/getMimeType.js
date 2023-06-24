let https = require('https');
const mimeUrl = "https://gist.githubusercontent.com/AshHeskes/6038140/raw/27c8b1e28ce4c3aff0c0d8d3d7dbcb099a22c889/file-extension-to-mime-types.json";


const getMimeType = extension =>{
return new Promise ((resolve,reject)=>{
     https = require('https');
    https.get(mimeUrl, response => {
     if(response.statusCode<200 || response.statusCode > 299){
        reject(`Error failed to load mime ypes for js files${response.statusCode}`);
        console.log(`Error failed to load mime ypes for js files${response.statusCode}`)
        return false;
     }
     let data ='';
     //you will receive data by chunks 
      response.on('data', chunk => {
      data += chunk;
    });
    //once you received alll types of data
    response.on('end',() =>{
     resolve(JSON.parse(data)[extension ]);
    });
    
    }).on('error', (e) => {
      console.error(e);
    });
})  ;  

}

module.exports = getMimeType;
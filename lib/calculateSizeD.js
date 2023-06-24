///require node modules
const {execSync} = require('child_process');

const calculateSizeD = (itemFullStaticPath)=>{
    const cleaned = itemFullStaticPath.replace(/\s/g,'\ ');
    
    const commandOutput =             
    execSync(`du -sh "${cleaned}"`).toString();
    let filesize  = commandOutput.replace(/\s/g,'');
    filesize = filesize.split('/');

    filesize = filesize[0];
    let final = '';
    for(i=0;i<filesize.length;i++){
        if(filesize[i]=='C'){
            break;
        }
        final += filesize[i];
    }
    let number,unit,filesizeBytes;
    if(final === '0'){
        final = '0B';
    }    
    else{
        unit = final.replace(/\d|\./g,'');
        number = parseFloat(final.replace(/(a-z)/i,''));
         {/*
           //B 10B --> 10 BYTES  (1000^0)
           //K 19K --> 10 * 1000 BYTES (1000^1)
           //M 10M --> 10 * 1000 * 1000 BYTES (1000^2)
           //G 10G --> 10 * 1000 * 1000 * 1000 BYTES (1000 ^ 3)
           //T 10T --> 10 * 1000 * 1000 * 1000 * 1000 BYTES (1000 ^ 4)
        */}
        const units = "BKMGT";
        filesizeBytes = number*Math.pow(1000,units.indexOf(unit));
        console.log(filesizeBytes);
    }
    return [final,filesizeBytes];
};
module.exports = calculateSizeD;
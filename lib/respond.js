//2
//require node modules
const url = require('url');
const path = require('path');
const fs = require('fs');
//file imports 
const buildBreadcrumb = require('./breadcrumb.js');
const buildMainContent = require ('./mainContent.js');
const getmimeType = require('./getMimeType.js'); 
//static base bath: location of your static folder
//const staticBasePath = 
console.log(__dirname);//C:\Users\Ritu Raj\sa classes\es6\Node Project -File Explorer\lib --current file jo hai ujska path degi ye
const staticBasePath=path.join(__dirname,'..','static');//C:\Users\Ritu Raj\sa classes\es6\Node Project -File Explorer\static==>issi me html file hai
//.. -> 2 dotg upar jane ke liye 2 path ....////bydefault pehla page static folder ka khuilega
//respond to a request

//following is function passed to createServer used to create the server
const respond = (request,response) =>{
    //before working with the pathname , you need to decode it
    let pathname = url.parse(request.url,true).pathname;//let daala hai taakli change ho sake value future mein
    //pathname = / , /music , /cars
    //if favicon.io , then stop 
    if(pathname === '/favicon.ico'){
      return false;
    }
    pathname = decodeURIComponent(pathname);
  // %pahnameApplandingPage%Bootstrap iss jese pathname ko decode klrne ke liye use honge

    //get the full corresponding full static path located in the static folder 
    const fullStaticPath = path.join(staticBasePath,pathname);//url ka jo path hai ..or directory ka path jo hai usse join kardo //dorectory- yani jnis file me hum abhi hai
    //C:\Users\Ritu Raj\sa classes\es6\Node Project -File Explorer\static\media   //C:Users se leke static tak to directory ka naam hai(staticBasePath)...uske aage jo media hai wo url(pathname) ka pathname hai
    //can we find something in fullStaticPath?

    //no:send '404':'FILE NOT FOUND!'
    //OK, so let's go to our next step.Which is to check if the false static path corresponds to something inside the static folder.
    //So to do this, you can use the method.Exists, think of the first model, so you're going to do this synchronously because we want to wait for the output's before we can execute any coming code.
    //So this will be applied to the full Static...
    if(!fs.existsSync(fullStaticPath)){ //kuch nahi mila to ye chalega...matlab path ki jo directory hai usme kopi file .js,.xss etc hai ya bhi nahi
      console.log(`${fullStaticPath}does not exist`);
      response.write('404:File Not Found');
      response.end();
      return false;
    }

    //we found something //kuch mila to ye chalega
    //is it a file or directory??
    let stats;
    try{//fullStaticPath = mixture of url and directory..../localhost.../.../static/media.....static tak diorectory(static) or uske baad url ka path(mmedia)
      stats = fs.lstatSync(fullStaticPath);//isse puri info. milegi pure fullStaticPath ki 
      //. The stats object returned by lstat() contains information about the file, such as its size, permissions, and modification time.
  }catch(err){
    console.log(`lstatSync Error ${err}`)
  }
      //it is a directory:
     if(stats.isDirectory()){
      //get content from the template index.html
      let data = fs.readFileSync(path.join(staticBasePath,'project_files/index.html'),'utf-8')//static path or jo main content wali index.html ko join krdo or content show kro
      //build the page title yaani page title bhi wohi hona chahiye jo directory p hai hum abhi
      console.log(pathname);
      let pathElements =  pathname.split('/').reverse();
      pathElements = pathElements.filter(element => element !== '');
      let folderName = pathElements[0];
      if(folderName === undefined){
        folderName = 'Home';
    }
    
      console.log(folderName);  {/*[
        if the url is '/', and similarly for other urls
        'code',
        'file.txt',
        'form.html',
        'images',
        'media',
        'Projects',
        'project_files',
        'Purchased Books'
      ] */}
    
      //build breadcrumb
      const breadcrumb = buildBreadcrumb(pathname); 
      //build table rows (main_content) // table ki rows 
      const mainContent = buildMainContent(fullStaticPath,pathname);
      //fill the template data with: the page title , breadcrumb and table rows(main_content)
      data = data.replace('page_title',folderName);//home Projects media
      //home
      //    Projects
      //           App Landing Page
      data = data.replace('pathname',breadcrumb);

      data = data.replace ('mainContent',mainContent);
      //print data to the webpage 
      response.statusCode = 200;
      response.write(data);//content show krne ke liye main page mein
      return response.end();
    }
    //It is not a directory but not a file either
    if(!stats.isFile()){
      response.statusCode =  401;
      response.write('401:Access Denied');
      console.log('not a file');
      return response.end();
    }
      //send:401 :  Access denied!
      
      //It is a file 
       //Lets get the file extension 
       let fileDetails = {};
       fileDetails.extname = path.extname(fullStaticPath);
       console.log(fileDetails.extname);

       //file size
       let stat;
       try{
          stat = fs.statSync(fullStaticPath);
       }
       catch(err){
         console.log(`err:${err}`);
       }
       fileDetails.size = stat.size;
       //get the file mime type and add it to the response header
       getmimeType(fileDetails.extname)
       .then(mime =>{
        // //console.log(mime);
        // response.statusCode=200;
        // response.write(`status code in getMimeType function :${mime}`);
        // return response.end();

        //store headers here
        let head = {};
        let options = {};

        //response status code
        let statusCode = 200;

        //set "Content-type" for all file types
        head['Content-Type']= mime;

        //get the file size and add it to the response header
        //pdf file -> display in browser
        if(fileDetails.extname === '.pdf'){
          head['Content-Disposition'] = 'inline';
          // head['Content-Disposition'] = 'attachment;filename-file.pdf';
        }
        
        //audio/video file? -> stream in ranges 
        if(RegExp('audio').test(mime) || RegExp('video').test(mime)){
          //header
          head ['Accept-Ranges'] = 'bytes';
          const range = request.headers.range;
          console.log(`range: ${range}`);
          
          if(range){
            //bytes = 5210112 - end
            const start_end = range.replace (/bytes=/,"").split('-');
            const start = parseInt(start_end[0]);
            const end = start_end[1] ? parseInt(start_end[1]):fileDetails.size-1;
            //0 ... last byte
            //headers
          //Content - Range
          head['Content-Range'] = `bytes ${start}-${end}/${fileDetails.size}`;
          //Content - length
          head['Content-Length'] =  end-start + 1;
          statusCode = 206;

           //options
         options = {start,end};
        } 
        
      }
        //reading the  file using fs.readFile
        // fs.readFile(fullStaticPath,'utf-8',(error,data )=>{
        //   if(error){
        //     response.statusCode = 404;
        //     response.write('404:File Reading error!');
        //     return response.end();
        //   }
        //   else{
        //     response.writeHead(statusCode,head);
        //     response.write (data);
        //     return response.end();
        //   }
        // });

        //promises method
        // fs.promises.readFile(fullStaticPath,
        //   'utf-8')
        //   .then((error,data )=>{
        //     if(error){
        //       response.statusCode = 404;
        //       response.write('404:File Reading error!');
        //       return response.end();
        //     }
        //     else{
        //       response.writeHead(statusCode,head);
        //       response.write (data);
        //       return response.end();
        //     }
        //   })
        //   .catch(error=>{
        //     console.log(error);
        //     response.statusCode = 404;
        //     response.write('404:File Reading Error!');
        //     return response.end();
        //   });

        //streaming method
        const fileStream = fs.createReadStream(fullStaticPath,options);
        //stream chunks to your response object
        response.writeHead(statusCode,head);
        fileStream.pipe(response);

        //events: close and error
        fileStream.on('close',()=>{
          return response.end();
        });
        fileStream.on('error' , error =>{
          console.log(error);
              response.statusCode = 404;
              response.write('404:File streaming Error!');
              return response.end();
        });
      })
      .catch(err =>{
        response.statusCode = 500;
        response.write('500:Internal Server Error ');
        console.log(`Promise Error : ${err}`);
        return response.end();
      })
       //get the file size and add it to the response header
       //pdf file? -> display in browser 
       //audio/video file? -> stream in ranges
       //all other  files stream in normal way 
}

module.exports = respond;
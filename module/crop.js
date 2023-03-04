const sharp = require('sharp');
const fs = require('fs');
var sizeOf = require('image-size');

function cropIMG(file, name, callback){
    const base64 = file.split(';base64,')[1];
    // const binaryData = new Buffer(base64, 'base64').toString('binary');
    const buffer = Buffer.from(base64, "base64");

    fs.writeFile(`public/img/tempImg/${name}.png`, buffer, {encoding: 'base64'}, function(){

        sizeOf(`public/img/tempImg/${name}.png`, (err, sizes)=>{
                    // console.log(new_name);
            var height, width;

            if(sizes){
                height = sizes.height;
                width  = sizes.width;
            }
            if(height == width){
                fs.unlink(`public/img/avatar/${name}.png`, () =>{
                    sharp(`public/img/tempImg/${name}.png`)
                    .extract({width: width, height: height, left: 0, top: 0})
                    .toFile(`public/img/avatar/${name}.png`)
                    .then( () =>{
                        fs.unlink(`public/img/tempImg/${name}.png`, () =>{
                            // console.log(`Delete temporary image at public/img/tempImg/${product_id+new_name}.png`)
                            callback({ success: true, avatar: `/img/avatar/${name}.png` })
                        });
                    });
                });
            }
            if(height > width){
                var top = Math.round((height-width)/2);
                fs.unlink(`public/img/avatar/${name}.png`, () =>{
                    sharp(`public/img/tempImg/${name}.png`)
                    .extract({width: width, height: width, left: 0, top: top})
                    .toFile(`public/img/avatar/${name}.png`)
                    .then( () =>{
                        fs.unlink(`public/img/tempImg/${name}.png`, () =>{
                            // console.log(`Delete temporary image at public/img/tempImg/${product_id+new_name}.png`)
                            callback({ success: true, avatar: `/img/avatar/${name}.png` })
                        });
                    });
                });
            }
            if(height < width){
                var left = Math.round((width - height)/2);
                fs.unlink(`public/img/avatar/${name}.png`, () =>{
                    sharp(`public/img/tempImg/${name}.png`)
                    .extract({width: height, height: height, left: left, top: 0})
                    .toFile(`public/img/avatar/${name}.png`)
                    .then( () =>{
                        fs.unlink(`public/img/tempImg/${name}.png`, () =>{
                            // console.log(`Delete temporary image at public/img/tempImg/${product_id+new_name}.png`)
                            callback({ success: true, avatar: `/img/avatar/${name}.png` })
                        });
                    });
                });
            }
        });
    })
}

module.exports = { cropIMG }

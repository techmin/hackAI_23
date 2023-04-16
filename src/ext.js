// import cow from './assets/cow.jpg'
// import manga from './assets/manga.jpg'

import html2canvas from "html2canvas";
import { domToDataUrl } from "modern-screenshot";
import vision from "react-cloud-vision-api";
vision.init({ auth: 'AIzaSyC2V-y69QsG-TwnRxFvW0nzjc61dERvxPE' })

// import './assets/style.css'

// const credentials = {
//     accessKeyId: 'AKIAYJLOY2F3I3NQ5UHX',
//     secretAccessKey: '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'
// }


// get the data from the image and send it to the api


var groupTextRadius = 10

console.log("STARTING")

// document.addEventListener('DOMContentLoaded', function () {
// get all images on the page
console.log("DOM LOADED")

var imgs = []
setInterval(() => {
    var images = document.querySelectorAll('img')
    images.forEach(image => {
        if (!imgs.includes(image)) {
            imgs.push(image)
        } else {
            return;
        }
        console.log("ADDING IMAGE")
        // wait for the image to load
        image.addEventListener('click', async function (e) {
            // get base64 image
            try {

                console.log("CLICKED IMAGE")
                // if image is not loaded yet, wait
                if (!e.target.complete) {
                    console.log("WAITING FOR IMAGE TO LOAD")
                    await new Promise(resolve => e.target.addEventListener('load', resolve, { once: true }))
                } else {
                    console.log("IMAGE ALREADY LOADED")
                }

                if (e.target.toggled == "1") {
                    console.log("TOGGLING OFF")
                    e.target.toggled = "0"
                    var temp = e.target.src
                    e.target.src = e.target.oldSrc
                    e.target.oldSrc = temp
                    return;
                } else if (e.target.toggled == "0") {
                    console.log("TOGGLING ON")
                    e.target.toggled = "1"
                    var temp = e.target.src
                    e.target.src = e.target.oldSrc
                    e.target.oldSrc = temp
                    return;
                }


                console.log("LOADED IMAGE")
                var img = e.target;
                // img.src = img.src + "?not-from-cache-please";
                // e.target.src = img.src + "?not-from-cache-please";
                console.log(img)
                // var canvas = document.createElement('canvas')
                var width = img.width
                var height = img.height
                // canvas.width = width
                // canvas.height = height
                // var ctx = canvas.getContext('2d')

                // ctx.drawImage(img, 0, 0, width, height)
                var temp = await domToDataUrl(img)
                temp = temp.replace(/^data:image\/(png|jpg);base64,/, "");
                
                var base64Img = temp;

                const req = new vision.Request({
                    image: new vision.Image({
                        base64: base64Img,
                    }),
                    features: [
                        new vision.Feature('TEXT_DETECTION', 40),
                        new vision.Feature('LABEL_DETECTION', 100),
                    ]
                })

                // delete the canvas
                // canvas.remove()
                // document.body.appendChild(canvas)
                // document.body.appendChild(img)

                const res = await vision.annotate(req)
                console.log(res)

                var groups = []
                var ratioX = width / canvas.width
                var ratioY = height / canvas.height

                // var img = document.getElementById('tempImg')
                // var canvas = document.getElementById('canvas')
                groupTextRadius = width / 10
                console.log(groupTextRadius)
                var ctx = canvas.getContext('2d')
                // draw a rectangle covering the whole canvas

                // ctx.drawImage(img, 0, 0, width, height)
                res.responses[0].textAnnotations.forEach(block => {
                    // console.log(block)

                    var vertices = block.boundingPoly.vertices
                    var avgPos = { x: 0, y: 0 }
                    vertices.forEach(vertex => {
                        avgPos.x += vertex.x
                        avgPos.y += vertex.y
                    })
                    avgPos.x /= vertices.length
                    avgPos.y /= vertices.length
                    // ctx.beginPath()
                    // ctx.moveTo(vertices[0].x, vertices[0].y)
                    // ctx.lineTo(vertices[1].x, vertices[1].y)
                    // ctx.lineTo(vertices[2].x, vertices[2].y)
                    // ctx.lineTo(vertices[3].x, vertices[3].y)
                    // ctx.lineTo(vertices[0].x, vertices[0].y)
                    // ctx.stroke()

                    // fill with a white rectangle
                    if (vertices[2].x - vertices[0].x < groupTextRadius * 2) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
                        ctx.fillRect((vertices[0].x - 10) * ratioX, (vertices[0].y + 10) * ratioY, (vertices[2].x - vertices[0].x + 20) * ratioX, (vertices[2].y - vertices[0].y + 30) * ratioY)
                    }
                    var foundGroup = false

                    for (var i = 0; i < groups.length; i++) {
                        var group = groups[i]
                        if (Math.abs(group.x - avgPos.x) < groupTextRadius && Math.abs(group.y - avgPos.y) < groupTextRadius) {
                            group.text.push(block.description)
                            group.x = (group.x + avgPos.x) / 2
                            group.y = (group.y + avgPos.y) / 2
                            groups[i] = group
                            foundGroup = true
                            break
                        }
                    }
                    if (groups.length == 0) {
                        groups.push({ text: [block.description], x: avgPos.x, y: avgPos.y })
                    } else if (!foundGroup) {
                        groups.push({ text: [block.description], x: avgPos.x, y: avgPos.y })
                    }
                })
                console.log(groups)
                // get the new image and set it to e.target.src
                e.target.oldSrc = img.src
                e.target.src = canvas.toDataURL("image/png")
                e.target.style.width = width + "px"
                e.target.style.height = height + "px"
                e.target.toggled = "1"
                

            } catch (e) {
                console.log(e)
            }
        })
    })
    // })





}, 2000)
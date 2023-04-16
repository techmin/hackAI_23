import React, { useRef, useState, useEffect } from 'react'
import { render } from 'react-dom'
import { TextractClient, AnalyzeDocumentCommand, DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import cow from './assets/cow.jpg'
import manga from './assets/manga.jpg'

import vision from "react-cloud-vision-api";
vision.init({ auth: 'AIzaSyC2V-y69QsG-TwnRxFvW0nzjc61dERvxPE' })

import './assets/style.css'

const credentials = {
    accessKeyId: 'AKIAYJLOY2F3I3NQ5UHX',
    secretAccessKey: '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'
}

// a client can be shared by different commands.
const client = new TextractClient({
    region: 'us-east-1',
    credentials: credentials
});

const s3 = new S3Client({
    region: 'us-east-1',
    credentials: credentials
});


// get the data from the image and send it to the api


var groupTextRadius = 10

function App() {

    const [command, setCommand] = useState(0);

    useEffect(() => {

    }, [command]);

    async function setup() {

        // get base64 image
        var img = document.getElementById('tempImg')
        var canvas = document.createElement('canvas')
        var width = img.width
        var height = img.height

        canvas.width = width
        canvas.height = height
        var ctx = canvas.getContext('2d')

        ctx.drawImage(img, 0, 0, width, height)
        var base64Img = canvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "");

        const req = new vision.Request({
            image: new vision.Image({
                base64: base64Img,
            }),
            features: [
                new vision.Feature('TEXT_DETECTION', 40),
                new vision.Feature('LABEL_DETECTION', 100),
            ]
        })

        const res = await vision.annotate(req)
        console.log(res.responses[0].textAnnotations[0].description)
        getData(res)
    }

    async function getData(res) {

        var groups = []

        var img = document.getElementById('tempImg')
        var canvas = document.getElementById('canvas')
        var width = img.width
        var height = img.height
        canvas.width = width
        canvas.height = height
        groupTextRadius = width / 10
        console.log(groupTextRadius)
        var ctx = canvas.getContext('2d')
        // draw a rectangle covering the whole canvas

        ctx.drawImage(img, 0, 0, width, height)
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
                ctx.fillStyle = 'white'
                ctx.fillRect(vertices[0].x - 10, vertices[0].y - 10, vertices[2].x - vertices[0].x + 20, vertices[2].y - vertices[0].y + 20)
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

        // translate the text


        //

    }

    return (
        <div>
            <h1>hello world</h1>
            <img className='hidden' id='tempImg' src={manga} />
            <button onClick={setup}>Run</button>
            <canvas id="canvas" width="500" height="500"></canvas>
        </div>
    )
}

render((
    <App />

), document.getElementById('root'))
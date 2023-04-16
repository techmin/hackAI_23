import React, { useRef, useState, useEffect } from 'react'
import { render } from 'react-dom'
import { TextractClient, AnalyzeDocumentCommand, DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import cow from './assets/cow.jpg'
import manga from './assets/test.jpg'

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




function App() {
    const [command, setCommand] = useState(null);
    async function run() {
        // async/await.
        try {
            const data = await client.send(command);
            console.log(data);
            getData(data)
            // process data.
        } catch (error) {
            console.log(error);
            // error handling.
        } finally {
            console.log('finally');

            // finally.
        }
    }

    useEffect(() => {
        if (command) {
            run();
        }
    }, [command]);

    async function setup() {
        // use cow.jpg as an example.

        // upload the image to s3 and get the url
        const paramsU = {
            Bucket: 'speedrunnersdatabucket',
            Key: 'cow.jpg',
            Body: await (await fetch(manga)).arrayBuffer(),
            ContentType: 'image/jpeg'
        };

        const command = new PutObjectCommand(paramsU);
        console.log("A")
        const data = await s3.send(command);
        console.log("B")
        // console.log(data)
        // get the url
        // const url = await s3.getSignedUrlPromise('getObject', params);

        const params = {
            Document: {
                S3Object: {
                    Bucket: 'speedrunnersdatabucket',
                    Name: 'cow.jpg'
                }
            }
        };
        console.log(params)
        setCommand(new DetectDocumentTextCommand(params));
    }

    async function getData(res) {
        // var image = images(imageData.Body).size(width, height)
        const dpi = window.devicePixelRatio;
        var img = document.getElementById('tempImg')
        var canvas = document.getElementById('canvas')
        var width = img.width
        var height = img.height
        canvas.width = width
        canvas.height = height
        var ctx = canvas.getContext('2d')
        
        ctx.drawImage(img, 0, 0, width, height)
        //console.log the type of block, text, text type, and confidence
        res.Blocks.forEach(block => {
            console.log(`Block Type: ${block.BlockType}`),
                console.log(`Text: ${block.Text}`)
            console.log(`TextType: ${block.TextType}`)
            console.log(`Confidence: ${block.Confidence}`)

            // Draw box around detected text using polygons
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.beginPath();
            block.Geometry.Polygon.forEach(({ X, Y }) =>
                ctx.lineTo(width * X - 10, height * Y - 10)
            );
            ctx.closePath();
            ctx.stroke();
            console.log("-----")
        })
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
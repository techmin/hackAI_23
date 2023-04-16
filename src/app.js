import React, { useRef, useState, useEffect } from 'react'
import AWS from 'aws-sdk'
import { render } from 'react-dom'
import { TextractClient, AnalyzeDocumentCommand, DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { TranslateClient, CreateParallelDataCommand } from "@aws-sdk/client-translate";
import cow from './assets/cow.jpg'
import manga from './assets/test.jpg'
import sign from './assets/sign.jpg'
import mangas from './assets/manga.jpg'
import vision from "react-cloud-vision-api";
import './assets/style.css'

const translate = new AWS.Translate({
    accessKeyId: "AKIAYJLOY2F3I3NQ5UHX",
    secretAccessKey: "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",
    region: "us-east-1",
});

const translateCall = async (data) => {
    const params = {
        SourceLanguageCode: "en",
        TargetLanguageCode: data.lang,
        Text: data.text,
    };

    try {
        const translationData = await translate.translateText(params).promise();
        // console.log(translationData);
        return translationData;
    } catch (e) {
        console.log(e);
    }
};

translateCall({ text: "こんにちは", lang: "en" }).then((data) => {
    console.log(data);
});

// if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
//     // ok, browser supports it
//     console.log("SUPPORTS WEBCAM")
//     // ask user for permission to use the webcam
//     navigator.mediaDevices.getUserMedia({ video: true })
//         .then(function (stream) {

//             var video = document.getElementById('video')
//             video.srcObject = stream
//             video.onloadedmetadata = function (e) {
//                 video.play();
//             };
//         })
// }

async function query(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/thefrigidliquidation/nllb-jaen-1.3B-lightnovels",
        {
            headers: { Authorization: "Bearer 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" },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result;
}

query({ "inputs": "The answer to the universe is" }).then((response) => {
    console.log(JSON.stringify(response));
});


vision.init({ auth: 'AIzaSyC2V-y69QsG-TwnRxFvW0nzjc61dERvxPE' })



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

function App(props) {

    const [command, setCommand] = useState(0);

    useEffect(() => {

    }, [command]);

    async function setup() {

        // get base64 image
        var img = document.getElementById(props.id)
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

        var img = document.getElementById(props.id)
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
            if (vertices[2].x - vertices[0].x < groupTextRadius * 5) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
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

        // draw the text
        ctx.fillStyle = 'black'
        ctx.font = '20px serif'
        groups.forEach(async group => {
            var text = group.text.join(' ')
            var tText = await translateCall({ text: text, lang: "en" })
            console.log(tText)
            // console.log(tT)
            // ctx.fillText(tText.TranslatedText, group.x - tText.TranslatedText.length * 5, group.y - 10)
            wrapText(ctx, tText.TranslatedText, group.x - 10, group.y - 10, 200, 20)
            var temp = canvas.toDataURL("image/png")
            // translate the text
            document.getElementById(props.id).src = temp
        })



        // var temp = canvas.toDataURL("image/png")
        // // translate the text
        // document.getElementById(props.id).src = temp

        //

    }

    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
    }

    const videoRef = useRef(null);

    function getScreenshot() {
        const canvas = document.createElement('canvas');
        const video = document.getElementById('video');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        return canvas.toDataURL('image/png');
    }

    return (
        <div>
            {/* <h1>hello world</h1> */}
            <img id={props.id} src={props.src} style={{ maxWidth: "500px" }} />
            <button onClick={setup}>Run</button>
            <canvas id="canvas" className='hidden' width="500" height="500"></canvas>
            {/* <video ref={videoRef} id="video" width="500" height="500" autoplay></video> */}
        </div>
    )
}

render((
    <>
        <App src={manga} id="1" />
        <App src={sign} id="2" />
        <App src={mangas} id="3" />
    </>


), document.getElementById('root'))
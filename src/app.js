import React, { useRef, useState, useEffect } from 'react'
import { render } from 'react-dom'
import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";

// a client can be shared by different commands.
const client = new TextractClient({ region: "REGION" });

const params = {
    /** input parameters */
};
const command = new AnalyzeDocumentCommand(params);



function App () {
    async function run() {
        // async/await.
        try {
            const data = await client.send(command);
            // process data.
        } catch (error) {
            console.log(error);
            // error handling.
        } finally {
            console.log('finally');
            console.log(data);
            // finally.
        }
    }

    return (
        <div>
            <h1>hello world</h1>
            <button onClick={run}>Run</button>
        </div>
    )
}

render((
    <App/>

), document.getElementById('root'))
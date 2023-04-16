import React, { useRef, useState, useEffect } from 'react'
import { render } from 'react-dom'
import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";

// a client can be shared by different commands.
const client = new TextractClient({ 
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'AKIAYJLOY2F3I3NQ5UHX',
        secretAccessKey: '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'
    }
 });


 // get the data from the image and send it to the api
const params = {
    Document: {
        // Bytes: new Buffer('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
        S3Object: {
            Bucket: 'textract-console-us-east-1-4f4e2f2a-4b3a-4b2a-8b0a-2b0b0b0b0b0b',
            Name: 'test.png',
            // Version: 'STRING_VALUE'
        }
    },
    FeatureTypes: [
        'TABLES',
        'FORMS'
    ],
    // HumanLoopConfig: {
    //     HumanLoopName: 'STRING_VALUE',
    //     FlowDefinitionArn: 'STRING_VALUE',
    //     DataAttributes: {
    //         ContentClassifiers: [
    //             'FreeOfPersonallyIdentifiableInformation'|'FreeOfAdultContent',
    //             /* more items */
    //         ]
    //     }

};
const command = new AnalyzeDocumentCommand(params);



function App () {
    async function run() {
        // async/await.
        try {
            const data = await client.send(command);
            console.log(data);
            // process data.
        } catch (error) {
            console.log(error);
            // error handling.
        } finally {
            console.log('finally');
            
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
import openai from "@/openai";
import { NextResponse } from "next/server";

export async function POST(request: Request){
    // todos in the body of post req
    const {todos} = await request.json();
    console.log(todos);

    // communicate with GPT API
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0.8,
        n: 1,
        stream: false,
        messages: [
            {
                role: "system",
                content: `When responding, welcome the user always as Mr. Sarvagya and say 'Welcome to Projects' Dashboard! Limit the response to 200 characters`
            },
            {
                role: "user",
                content: `Hi there, provide a summary of the following todos.
                Count how many todos are in each category such as in To Do, in progress and in done,
                then tell the user to have a productive day! Here is the data: ${JSON.stringify(todos)}`
            },
        ]
    })
    const {data} = response;
    console.log("Data is:", data);
    console.log(data.choices[0].message);
    return NextResponse.json(data.choices[0].message);
    
    
}
import { inngest } from "./client";
import { openai, createAgent,createTool, createNetwork, type Tool, type Message ,createState} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import {z} from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { prisma } from "@/lib/db";


interface AgentState{
  summary: string;
  files: {[path:string]:string};
}

export const codeAgentFunction = inngest.createFunction(
  {
    id: "code-agent",
    triggers: [{ event: "code-agent/run" }],
  },
  async ({ event,step }) => {
    const sandboxId = await step.run("get-sandbox-id",async()=>{
      const sandbox = await Sandbox.create("shashwat132004/vibe-nextjs-shashwat-12");
      await sandbox.setTimeout(60_000*10*3);
      return sandbox.sandboxId;
    })

    const previousMessages = await step.run("get-previous-messages",async()=>{
      const formattedMessages:Message[]=[];
      const messages=await prisma.message.findMany({
        where:{
          projectId: event.data.projectId,
        },
        orderBy:{
          createdAt:"desc",
        },
        take:5,
      });
      for(const message of messages){
        formattedMessages.push({
          type:"text",
          role:message.role==="ASSISTANT"?"assistant":"user",
          content:message.content,
        })
      }
      return formattedMessages.reverse();
    })

    const state=createState<AgentState>(
      {
        summary:"",
        files:{},
      },
      {
        messages:previousMessages,
      }
    );
    const codeAgent = createAgent<AgentState>({
      name: "codeAgent",
      description: "An expert coding agent",
      system: PROMPT,
      model: openai({ 
        model: "gpt-4.1-mini",
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: process.env.OPENAI_BASE_URL,
        defaultParameters:{
          temperature:0.1,
        }
      }),
      tools:[
        createTool({
          name:"terminal",
          description:"use the terminal to run commands",
          parameters:z.object({
            command:z.string(),
          }),
          handler :async({command},{step})=>{
            return await step?.run("terminal",async()=>{
              const buffers = {stdout:"",stderr:""};
              try{
              const sandbox = await getSandbox(sandboxId);
              const result = await sandbox.commands.run(command,{
                onStdout(data){
                  buffers.stdout+=data;
                },
                onStderr(data){
                  buffers.stderr+=data;
                }
              });
              return result.stdout;
            }catch(err){
              console.error(`command failed:${err} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`);
              return `command failed:${err} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`;
            } 
            });
          }
        }),
        createTool({
          name:"createOrUpdateFiles",
          description:"create or update files in the sandbox.",
          parameters:z.object({
            files:z.array(
              z.object({
                path:z.string(),
                content:z.string(),
              }),
            ),
          }),
          handler: async(
            {files},
            {step,network}: Tool.Options<AgentState>,
          )=>{
            const newFiles = await step?.run("createOrUpdateFiles",async()=>{
              try{
                const updatedFiles= network.state.data.files || {};
                const sandbox = await getSandbox(sandboxId);
                for(const file of files){
                  await sandbox.files.write(file.path,file.content);
                  updatedFiles[file.path]=file.content;
                }
                return updatedFiles;
              }catch(err){
                return "Error:"+err;
              }
            });
            if(typeof newFiles === "object"){
              network.state.data.files = newFiles;
            } 
          }
        }),
        createTool({
          name:"readFiles",
          description:"read files from the sandbox.",
          parameters:z.object({
            files:z.array(z.string()),
          }),
          handler: async({files},{step})=>{
            try{
              const sandbox = await getSandbox(sandboxId);
              const contents = [];
              for(const file of files){
                const content = await sandbox.files.read(file);
                contents.push({path:file,content});
              } 
              return JSON.stringify(contents);
            }
            catch(err){
              return "Error:"+err; 
            }
          }
        })

      ],
      lifecycle:{
        onResponse: async ({result, network})=>{
          const lastAssistantMessageText = 
          lastAssistantTextMessageContent(result);

          if(lastAssistantMessageText && network){
            if(lastAssistantMessageText.includes("<task_summary>")){
              network.state.data.summary = lastAssistantMessageText;
            }
          }
          return result;
        },
      },
    });
    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      defaultState: state,
      router: async ({ network })=>{
        const summary = network.state.data.summary;
        if(summary)return;

        return codeAgent;
      }
    })
    const result = await network.run(event.data.value,{state});

    const fragmentTitleGenerator=createAgent({
      name:"fragment-Title-Generator",
      description:"A fragment title generator",
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: "gpt-4.1-mini",
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: process.env.OPENAI_BASE_URL,
      })
    })
     const responseGenerator=createAgent({
      name:"response-Generator",
      description:"A response generator",
      system: RESPONSE_PROMPT,
      model: openai({
        model: "gpt-4.1-mini",
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: process.env.OPENAI_BASE_URL,
      })
    })
    const {output:fragmentTitleOutput} = await fragmentTitleGenerator.run(result.state.data.summary);
    const {output:responseOutput} = await responseGenerator.run(result.state.data.summary);

    const generateFragmentTitle=()=>{
      if(fragmentTitleOutput[0].type!=="text"){
        return "Fragment";
      }
      if(Array.isArray(fragmentTitleOutput[0].content)){
        return fragmentTitleOutput[0].content.map((txt)=>txt).join("");
      }
      else{
        return fragmentTitleOutput[0].content;
      }
    }
    const generateResponse=()=>{
      if(responseOutput[0].type!=="text"){
        return "Here you go!";
      }
      if(Array.isArray(responseOutput[0].content)){
        return responseOutput[0].content.map((txt)=>txt).join("");
      }
      else{
        return responseOutput[0].content;
      }
    }

    const isError=
    !result.state.data.summary ||
    Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl=await step.run("get-sandbox-url",async()=>{
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `http://${host}`;
    })

    await step.run("save-result",async()=>{
      if(isError){
        return await prisma.message.create({
          data:{
            projectId: event.data.projectId,
            content: "something went wrong. please try again later.",
            role: "ASSISTANT",
            type: "ERROR",
          }
        });
      }


      return await prisma.message.create({
        data:{
          projectId: event.data.projectId,
          content: generateResponse(),
          role: "ASSISTANT",
          type: "RESULT",
          fragment:{
            create:{
              sandboxUrl: sandboxUrl,
              title:generateFragmentTitle(),
              files: result.state.data.files,
            },
          },
        }
      })
    })
    return {
      url: sandboxUrl,
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  },
);
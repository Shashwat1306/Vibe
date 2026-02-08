import { inngest } from "./client";
import { openai, createAgent } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event,step }) => {
    const sandboxId = await step.run("get-sandbox-id",async()=>{
      const sandbox = await Sandbox.create("shashwat132004/vibe-nextjs-shashwat-12");
      return sandbox.sandboxId;
    })
    const codeAgent = createAgent({
      name: "codeAgent",
      system: "You are an expert Next.js developer. You write readable,maintainable code.You write simple Next.js and react snippets",
      model: openai({ 
        model: "gpt-4o",
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: process.env.OPENAI_BASE_URL,
      }),
    });
    const { output } = await codeAgent.run(
      `Write the following snippet: ${event.data.value}`,
    );
    const sandboxUrl=await step.run("get-sandbox-url",async()=>{
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `http://${host}`;
    })
    return { output  ,sandboxUrl };
  },
);
import * as mod from "https://deno.land/std@0.213.0/dotenv/mod.ts";
import { 
    Document, 
    VectorStoreIndex, 
    SimpleDirectoryReader,
    RouterQueryEngine,
    OpenAIAgent,
    QueryEngineTool,
    FunctionTool,
} from "npm:llamaindex@0.5.11"

const keys = await mod.load({export:true}) // read API key from .env

const documents1 = await new SimpleDirectoryReader().loadData({directoryPath: "./data"})
const index1 = await VectorStoreIndex.fromDocuments(documents1)
const queryEngine1 = index1.asQueryEngine()

let response1 = await queryEngine1.query({query: "What did the author do in college?"})
console.log(response1.toString())

const documents2 = await new SimpleDirectoryReader().loadData({directoryPath: "./data2"})
const index2 = await VectorStoreIndex.fromDocuments(documents2)
const queryEngine2 = index2.asQueryEngine()

let response2 = await queryEngine2.query({query:"What is React?"})
console.log(response2.toString())

const queryEngine = await RouterQueryEngine.fromDefaults({
    queryEngineTools: [
      {
        queryEngine: queryEngine1,
        description: "Useful for questions about Dan Abramov",
      },
      {
        queryEngine: queryEngine2,
        description: "Useful for questions about the React library",
      },
    ],
  });

  function sumNumbers({a,b}) {
    return a + b;
  }

  const sumJSON = {
    type: "object",
    properties: {
      a: {
        type: "number",
        description: "The first number",
      },
      b: {
        type: "number",
        description: "The second number",
      },
    },
    required: ["a", "b"],
  };

  const sumFunctionTool = new FunctionTool(sumNumbers, {
    name: "sumNumbers",
    description: "Use this function to sum two numbers",
    parameters: sumJSON,
  });

  const queryEngineTool = new QueryEngineTool({
    queryEngine: queryEngine,
    metadata: {
        name: "react_and_dan_abramov_engine",
        description: "A tool that can answer questions about Dan Abramov and React",
    },
});

const agent = new OpenAIAgent({
    model: "gpt-4o", temperature: 0,
    tools: [queryEngineTool, sumFunctionTool],
    verbose: true
})

let response5 = await agent.chat({message:"What is React? Use a tool."})
console.log(response5.toString())



const handler2 = async (req) => {
    if(req.method == "POST") {
        console.log("POST request");
        // we'll expect the incoming query to be a JSON object of the form {query: ...}
        let data = await req.json()

        console.log(data)

        let answer = await agent.chat({message: data.query})
        // and our response will be a JSON object of the form {response: ...}
        let responseObj = {
            response: answer.toString()
        }
        return new Response(JSON.stringify(responseObj), { 
            status: 200
        })
    } else {
        return new Response("Not found", { status: 404 })
    }
}
let server2 = Deno.serve( { port: 8002 }, handler2 )
console.log("Server running on port 8002")





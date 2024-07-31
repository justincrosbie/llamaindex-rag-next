
import * as mod from "https://deno.land/std@0.213.0/dotenv/mod.ts";
import { 
    Document, 
    VectorStoreIndex, 
    SimpleDirectoryReader 
} from "npm:llamaindex@0.1.8"
const keys = await mod.load({export:true}) // read API key from .env

const documents = await new SimpleDirectoryReader().loadData({directoryPath: "./data"})
const index = await VectorStoreIndex.fromDocuments(documents)
const queryEngine = index.asQueryEngine()

const handler2 = async (req) => {
    if(req.method == "POST") {
        console.log("POST request");
        // we'll expect the incoming query to be a JSON object of the form {query: ...}
        let data = await req.json()

        console.log(data)

        let answer = await queryEngine.query({query: data.query})
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

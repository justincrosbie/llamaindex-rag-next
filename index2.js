import * as mod from "https://deno.land/std@0.213.0/dotenv/mod.ts";
const keys = await mod.load({export:true}) // read API key from .env

import * as llamaIndex from "npm:llamaindex@0.1.8"

import { 
    Document, 
    VectorStoreIndex, 
    SimpleDirectoryReader 
} from "npm:llamaindex@0.1.8"

const documents = await new SimpleDirectoryReader()
    .loadData({directoryPath: "./data"})

const index = await VectorStoreIndex.fromDocuments(documents)

let customLLM = new llamaIndex.OpenAI()
let customEmbedding = new llamaIndex.OpenAIEmbedding()

let customServiceContext = new llamaIndex.serviceContextFromDefaults({
    llm: customLLM,
    embedModel: customEmbedding
})

let customQaPrompt = function({context = "", query = ""}) {
    return `Context information is below.
        ---------------------
        ${context}
        ---------------------
        Given the context information, answer the query.
        Include a random fact about whales in your answer.\
        The whale fact can come from your training data.
        Query: ${query}
        Answer:`
}

let customResponseBuilder = new llamaIndex.SimpleResponseBuilder(
    customServiceContext,
    customQaPrompt
)

let customSynthesizer = new llamaIndex.ResponseSynthesizer({
    responseBuilder: customResponseBuilder,
    serviceContext: customServiceContext
})

let customRetriever = new llamaIndex.VectorIndexRetriever({
    index
})

let customQueryEngine = new llamaIndex.RetrieverQueryEngine(
    customRetriever,
    customSynthesizer
)

let response2 = await customQueryEngine.query({
    query: "What does the author think of college?"
})

console.log(response2.toString())
import express from 'express'
import morgan from 'morgan'
import { githubRouter } from './hooks/github.js'
import { port } from './settings.js'


const app = express()
app.use(morgan('combined'))


app.use("/github", githubRouter)
app.get("/status", (_, response) => response.status(200).send("OK"))

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
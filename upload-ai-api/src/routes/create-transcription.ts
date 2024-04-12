import {FastifyInstance} from "fastify";
import {z} from 'zod'
import {prisma} from "../lib/prisma";
import {createReadStream} from 'node:fs'
import { openai } from "../lib/openai";

export async function createTranscriptionRoute(app: FastifyInstance){
    app.post('/videos/:videoId/transcription', async (req,res) => {
        const paramsSchema = z.object({
            videoId: z.string().uuid(),
        })
        
        const { videoId } = paramsSchema.parse(req.params)

        const bodySchema = z.object({
            prompt: z.string().nullish(),
        })

        const { prompt } = bodySchema.parse(req.body)

        console.log(prompt)

        const video = await prisma.video.findUniqueOrThrow({
            where:{
                id: videoId,
            }
        })

        // const { data } = await axios.get(video.path, {
        //     responseType: 'arraybuffer',
        //   });
        // const file = await toFile(Buffer.from(data), 'teste2.mp3');


        const videoPath = video.path

        console.log(videoPath)

        const audioReadStream = createReadStream(videoPath)

        const response = await openai.audio.transcriptions.create({
            file: audioReadStream,
            model:'whisper-1',
            language: 'pt',
            response_format:'json',
            temperature: 0,
        })

        return response.text
    })
}
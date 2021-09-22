import { useEffect, useState } from "react"
import { database } from "../services/firebase"
import {
    questionsAnwsered,
    questionsNotAnwsered,
    orderQuestionsByMoreLikes,
} from "../util"
import { useAuth } from "./useAuth"

export type QuestionType = {
    id: string
    author: {
        name: string
        avatar: string
    }

    content: string
    isHighlighted: boolean
    isAnswered: boolean
    likeCount: number
    likeId: string | undefined
}

type FirebaseQuestions = Record<
    string,
    {
        author: {
            name: string
            avatar: string
        }

        content: string
        isHighlighted: boolean
        isAnswered: boolean
        likes: Record<string, { authorId: string }>
    }
>

export function useRoom(roomId: string) {
    const { user } = useAuth()
    const [questions, setQuestions] = useState<QuestionType[]>([])
    const [title, setTitle] = useState("")
    const [idOwnerRoom, setIdOwnerRoom] = useState("")

    useEffect(() => {
        const roomRef = database.ref(`rooms/${roomId}`)

        roomRef.on("value", (room) => {
            const databaseRoom = room.val()
            setIdOwnerRoom(databaseRoom.authorId)
            const firebaseQuestions: FirebaseQuestions =
                databaseRoom.questions ?? {}

            const parsedQuestions = Object.entries(firebaseQuestions).map(
                ([key, value]) => {
                    return {
                        id: key,
                        content: value.content,
                        author: value.author,
                        isHighlighted: value.isHighlighted,
                        isAnswered: value.isAnswered,
                        likeCount: Object.values(value.likes ?? {}).length,
                        likeId: Object.entries(value.likes ?? {}).find(
                            ([key, like]) => like.authorId === user?.id
                        )?.[0],
                    }
                }
            )

            setTitle(databaseRoom.title)

            const notAwseredWithMoreLikes = questionsNotAnwsered(
                parsedQuestions
            ).sort((a, b) => orderQuestionsByMoreLikes(a, b))
            const ansered = questionsAnwsered(parsedQuestions)

            const arrayOfQuestions = notAwseredWithMoreLikes.concat(ansered)
            setQuestions(arrayOfQuestions)
        })

        return () => {
            roomRef.off("value")
        }
    }, [roomId, user?.id])

    return { questions, title, idOwnerRoom }
}

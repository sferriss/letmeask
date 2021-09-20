import { FormEvent, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import logoImg from "../assets/images/logo.svg"
import { Button } from "../components/Button"
import { RoomCode } from "../components/RoomCode"
import { useAuth } from "../hooks/useAuth"
import { database } from "../services/firebase"
import "../styles/room.scss"

type RoomParams = {
    id: string
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
    }
>

type Question = {
    id: string
    author: {
        name: string
        avatar: string
    }

    content: string
    isHighlighted: boolean
    isAnswered: boolean
}

export function Room() {
    const { user } = useAuth()
    const params = useParams<RoomParams>()
    const roomId = params.id
    const [newQuestion, setNewQuestion] = useState("")
    const [questions, setQuestions] = useState<Question[]>([])
    const [title, setTitle] = useState("")

    useEffect(() => {
        const roomRef = database.ref(`rooms/${roomId}`)

        roomRef.on("value", (room) => {
            const databasRoom = room.val()
            const firebaseQuestions: FirebaseQuestions =
                databasRoom.questions ?? {}

            const parsedQuestion = Object.entries(firebaseQuestions).map(
                ([key, value]) => {
                    return {
                        id: key,
                        content: value.content,
                        author: value.author,
                        isHighlighted: value.isHighlighted,
                        isAnswered: value.isAnswered,
                    }
                }
            )
            setTitle(databasRoom.title)
            setQuestions(parsedQuestion)
        })
    }, [roomId])

    async function handleSendQuestion(event: FormEvent) {
        event.preventDefault()

        if (newQuestion.trim() === "") {
            return
        }

        if (!user) {
            throw new Error("You must be logged in")
        }

        const question = {
            content: newQuestion,
            author: {
                name: user.name,
                avatar: user.avatar,
            },
            isHighlighted: false,
            isAnswered: false,
        }

        await database.ref(`rooms/${roomId}/questions`).push(question)

        setNewQuestion("")
    }

    return (
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Letmeask" />
                    <div>
                        <RoomCode code={roomId} />
                    </div>
                </div>
            </header>

            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    {questions.length > 0 && (
                        <span>{questions.length} perguntas</span>
                    )}
                </div>

                <form onSubmit={handleSendQuestion}>
                    <textarea
                        placeholder="O que você quer perguntar?"
                        onChange={(event) => setNewQuestion(event.target.value)}
                        value={newQuestion}
                    />

                    <div className="form-footer">
                        {!user ? (
                            <span>
                                Para enviar uma pergunta,{" "}
                                <button>faça seu login</button>
                            </span>
                        ) : (
                            <div className="user-info">
                                <img src={user.avatar} alt={user.name} />
                                <span>{user.name}</span>
                            </div>
                        )}
                        <Button type="submit" disabled={!user}>
                            {" "}
                            Enviar perguntar
                        </Button>
                    </div>
                </form>

                {JSON.stringify(questions)}
            </main>
        </div>
    )
}

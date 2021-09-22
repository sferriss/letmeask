import { useHistory, useParams } from "react-router-dom"
import logoImg from "../assets/images/logo.svg"
import deleteImg from "../assets/images/delete.svg"
import checkImage from "../assets/images/check.svg"
import answerImage from "../assets/images/answer.svg"
import { Button } from "../components/Button"
import { Question } from "../components/Question"
import { RoomCode } from "../components/RoomCode"
import { useRoom } from "../hooks/useRoom"
import { database } from "../services/firebase"
import "../styles/room.scss"
import { useAuth } from "../hooks/useAuth"
import { useEffect } from "react"

type RoomParams = {
    id: string
}

export function AdminRoom() {
    const history = useHistory()
    const params = useParams<RoomParams>()
    const roomId = params.id
    const { title, questions, idOwnerRoom } = useRoom(roomId)
    const { user } = useAuth()

    useEffect(() => {
        if (!user || user.id === idOwnerRoom) {
            const handler = setTimeout(() => {
                alert("You shouldn't be here")
                history.push("/")
            }, 1000)

            return () => {
                clearTimeout(handler)
            }
        }
    }, [user])

    async function handleDeleteQuestion(questionId: string) {
        if (window.confirm("Tem certeza que deseja excluir esta pergunta?")) {
            await database
                .ref(`rooms/${roomId}/questions/${questionId}`)
                .remove()
        }
    }

    async function handleEndRoom() {
        await database.ref(`rooms/${roomId}`).update({
            endedAt: new Date(),
        })

        history.push("/")
    }

    async function handleCheckQuestionAnswered(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isAnswered: true,
        })
    }

    async function handleHighlightQuestion(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isHighlighted: true,
        })
    }
    
    return (
        <>
            {user && user.id === idOwnerRoom ? (
                <div id="page-room">
                    <header>
                        <div className="content">
                            <img
                                src={logoImg}
                                alt="Letmeask"
                                onClick={() => {
                                    history.push("/")
                                }}
                                style={{ cursor: "pointer" }}
                            />
                            <div>
                                <RoomCode code={roomId} />
                                <Button isOutlined onClick={handleEndRoom}>
                                    Encerrar sala
                                </Button>
                            </div>
                        </div>
                    </header>

                    <main>
                        <div className="room-title">
                            <h1>Sala {title}</h1>
                            {questions.length > 0 && (
                                <span>{questions.length} pergunta(s)</span>
                            )}
                        </div>
                        <div className="question-list">
                            {questions.map((question) => {
                                return (
                                    <Question
                                        key={question.id}
                                        content={question.content}
                                        author={question.author}
                                        isAnswered={question.isAnswered}
                                        isHighlighted={question.isHighlighted}
                                    >
                                        {!question.isAnswered && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCheckQuestionAnswered(
                                                            question.id
                                                        )
                                                    }
                                                >
                                                    <img
                                                        src={checkImage}
                                                        alt="Responder pergunta"
                                                    />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleHighlightQuestion(
                                                            question.id
                                                        )
                                                    }
                                                >
                                                    <img
                                                        src={answerImage}
                                                        alt="Dar destaque a pergunta"
                                                    />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteQuestion(
                                                    question.id
                                                )
                                            }
                                        >
                                            <img
                                                src={deleteImg}
                                                alt="Remover pergunta"
                                            />
                                        </button>
                                    </Question>
                                )
                            })}
                        </div>
                    </main>
                </div>
            ) : null}
        </>
    )
}

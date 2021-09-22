import { QuestionType } from "../hooks/useRoom"

export function orderQuestionsByMoreLikes(
    a: QuestionType,
    b: QuestionType
): number {
    if (a.likeCount < b.likeCount) return 1
    if (a.likeCount > b.likeCount) return -1
    return 0
}

export function questionsAnwsered(questions: QuestionType[]): QuestionType[] {
    return questions.filter((question) => question.isAnswered)
}

export function questionsNotAnwsered(questions: QuestionType[]): QuestionType[] {
    return questions.filter((question) => !question.isAnswered)
}

import classNames from "classnames";

function ExerciseItem({ className, vocabularyWord }) {
    return (
        <div className={classNames("bg-yellow-300 text-center", className)}>
            <h2 className="text-2xl mb-4">{vocabularyWord.exampleUkr}</h2>
            {/*// TODO: Відобразити умовно (кнопка "Показати приклад перекладу")*/}
            <h2 className="text-2xl mb-4">{vocabularyWord.exampleEng}</h2>
        </div>
    );
}

export default ExerciseItem;

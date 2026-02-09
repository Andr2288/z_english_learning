import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    TranslateSentenceExercise,
    FillTheGapExercise,
    ListenAndFillTheGapExercise,
} from "../components/exercises/index.js";

import { ChevronRight, Target, Headphones, Type, Languages } from "lucide-react";
import { updateExerciseState } from "../store/index.js";

const PracticePage = () => {
    const dispatch = useDispatch();

    const [uiState, setUiState] = useState({
        showExercise: false,
    });

    const { exerciseState } = useSelector((state) => {
        return state.vocabularyWords;
    });

    const ExerciseType = {
        TranslateSentenceExercise: "translate_sentence_exercise",
        FillTheGapExercise: "fill_the_gap_exercise",
        ListenAndFillTheGapExercise: "listen_and_fill_exercise",
    };

    const coreExercisesData = [
        {
            id: "translate-sentence-exercise",
            type: ExerciseType.TranslateSentenceExercise,
            title: "Переклади речення",
            description: "Перекладіть речення англійською",
            icon: Languages,
            color: "from-blue-500 to-cyan-500",
            difficulty: "Складно",
            difficultyColor: "text-purple-600",
            difficultyBg: "bg-purple-600",
            features: ["Словниковий запас", "Навички перекладу", ""],
        },
        {
            id: "fill_the_gap_exercise",
            type: ExerciseType.FillTheGapExercise,
            title: "Доповни речення",
            description: "Оберіть правильне слово для пропуску",
            icon: Type,
            color: "from-emerald-500 to-teal-500",
            difficulty: "Нормально",
            difficultyColor: "text-blue-600",
            difficultyBg: "bg-blue-600",
            features: ["Граматичний контекст", "Розуміння структури", "Швидке мислення"],
        },
        {
            id: "listen-and-fill-exercise",
            type: ExerciseType.ListenAndFillTheGapExercise,
            title: "Слухання та письмо",
            description: "Прослухайте речення та впишіть пропущене слово",
            icon: Headphones,
            color: "from-blue-500 to-cyan-500",
            difficulty: "Складно",
            difficultyColor: "text-purple-600",
            difficultyBg: "bg-purple-600",
            features: ["Розвиток слуху", "Правопис", "Вимова"],
        },
    ];

    let exercise;

    if (exerciseState.exerciseType === ExerciseType.TranslateSentenceExercise) {
        exercise = <TranslateSentenceExercise />;
    } else if (exerciseState.exerciseType === ExerciseType.FillTheGapExercise) {
        exercise = <FillTheGapExercise />;
    } else if (exerciseState.exerciseType === ExerciseType.ListenAndFillTheGapExercise) {
        exercise = <ListenAndFillTheGapExercise />;
    }

    Object.freeze(ExerciseType);

    const handleExerciseButtonClick = (exerciseType) => {
        dispatch(
            updateExerciseState({
                exerciseType,
            })
        );

        setUiState((prev) => {
            return {
                ...prev,
                showExercise: true,
            };
        });
    };

    return (
        <div className="fixed ml-68 inset-0 flex flex-col min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-indigo-100">
            {/* Hero Section */}
            {!uiState.showExercise && (
                <div className="shrink-0 bg-white border-b border-gray-200 overflow-hidden p-8">
                    <div className="mx-auto flex items-center">
                        <div className="bg-linear-to-r from-blue-600 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3 shadow-md">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Практика ⚡</h1>
                            <p className="text-gray-600">Покращуйте свої навички за допомогою інтерактивних вправ</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Scrollable Content */}
            {!uiState.showExercise && (
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <Target className="w-5 h-5 mr-2 text-blue-500" />
                                Основні вправи
                            </h3>
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                                {coreExercisesData.map((exercise) => {
                                    const Icon = exercise.icon;

                                    return (
                                        <div
                                            key={exercise.id}
                                            onClick={() => handleExerciseButtonClick(exercise.type)}
                                            className={`group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-2`}
                                        >
                                            <div>
                                                <div
                                                    className={`absolute inset-0 bg-linear-to-br ${exercise.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`}
                                                />

                                                <div
                                                    className={`w-16 h-16 bg-linear-to-br ${exercise.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}
                                                >
                                                    <Icon className="w-8 h-8 text-white" />
                                                </div>

                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-xl font-bold text-gray-900">
                                                        {exercise.title}
                                                    </h4>
                                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                                </div>

                                                <p className="text-gray-600 mb-6">{exercise.description}</p>
                                            </div>

                                            <div className="relative">
                                                <div className="flex items-center space-x-4 mb-6 text-sm">
                                                    <div className={`flex items-center ${exercise.difficultyColor}`}>
                                                        <span
                                                            className={`w-2 h-2 ${exercise.difficultyBg} rounded-full mr-2`}
                                                        />
                                                        {exercise.difficulty}
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-2">
                                                    {exercise.features.map((feature, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center text-sm text-gray-600"
                                                        >
                                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3" />
                                                            {feature}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {uiState.showExercise && exercise}
        </div>
    );
};

export { PracticePage };

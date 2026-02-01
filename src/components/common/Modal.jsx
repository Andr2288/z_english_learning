import { X, Plus } from "lucide-react";
import { useState } from "react";

function Modal({
    isActive,
    closeModal,
    onSubmit,
    isLoading,
    existingWords = [],
}) {
    const [formData, setFormData] = useState({
        text: "",
        topic: "",
        translations: "",
    });

    const [errors, setErrors] = useState({
        text: "",
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));

        if (id === "text" && errors.text) {
            setErrors((prev) => ({ ...prev, text: "" }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.text.trim()) {
            setErrors({ text: "Це поле обов'язкове" });
            return;
        }

        const normalizedInput = formData.text
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();
        const wordExists = existingWords.some((word) => {
            const checkWord = word.main_parameters.text
                .trim()
                .replace(/\s+/g, " ")
                .toLowerCase();
            return checkWord === normalizedInput;
        });

        if (wordExists) {
            setErrors({ text: "Цей елемент вже є в базі" });
            return;
        }

        onSubmit({
            text: formData.text.trim(),
            topic: formData.topic.trim(),
            relevant_translations: formData.translations.trim(),
        });

        setFormData({
            text: "",
            topic: "",
            translations: "",
        });
        setErrors({ text: "" });
    };

    return (
        <div
            className={`transform ${isActive ? `opacity-100 pointer-events-auto` : `opacity-0 pointer-events-none`} transition duration-300 ease-in-out h-screen w-screen bg-black/40 fixed top-0 left-0 flex items-center justify-center`}
            onClick={closeModal}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-3xl min-h-1/2"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Додати нове слово
                    </h2>
                    <button
                        onClick={closeModal}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 cursor-pointer"
                        aria-label="Закрити"
                        disabled={isLoading}
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Vocabulary Item */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="text"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Слово / фраза / паттерн{" "}
                            <span className="text-red-500 text-lg">*</span>
                        </label>
                        <input
                            type="text"
                            id="text"
                            value={formData.text}
                            onChange={handleInputChange}
                            placeholder="Наприклад: Stakeholder"
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 text-gray-800 ${
                                errors.text
                                    ? "border-red-300 focus:border-red-500"
                                    : "border-gray-200 focus:border-blue-500"
                            }`}
                            disabled={isLoading}
                        />
                        {errors.text && (
                            <p className="mt-1.5 px-4 text-sm text-red-600">
                                {errors.text}
                            </p>
                        )}
                    </div>

                    {/* Topic */}
                    <div>
                        <label
                            htmlFor="topic"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Тема
                        </label>
                        <input
                            type="text"
                            id="topic"
                            value={formData.topic}
                            onChange={handleInputChange}
                            placeholder="Наприклад: Business"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-800"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Relevant Translation */}
                    <div>
                        <label
                            htmlFor="translations"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Релевантні переклади
                        </label>
                        <textarea
                            id="translations"
                            value={formData.translations}
                            onChange={handleInputChange}
                            rows="1"
                            placeholder="Наприклад: Зацікавлена сторона"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-800 resize-none"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-7">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="flex-1 px-6 py-3 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl transition-all duration-200 font-semibold cursor-pointer"
                            disabled={isLoading}
                        >
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                            disabled={isLoading}
                        >
                            <Plus className="w-5 h-5" />
                            Додати слово
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Modal;

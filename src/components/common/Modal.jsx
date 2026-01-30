function Modal({ isActive, closeModal }) {
    return (
        <div
            className={`transform ${isActive ? `opacity-100 pointer-events-auto` : `opacity-0 pointer-events-none`} transition duration-300 ease-in-out h-screen w-screen bg-black/40 fixed top-0 left-0 flex items-center justify-center py-20`}
            onClick={closeModal}
        >
            <div
                className="bg-white rounded-2xl shadow-md p-12 pt-16 pb-10 w-3/5 h-full"
                onClick={(e) => e.stopPropagation()}
            ></div>
        </div>
    );
}

export default Modal;

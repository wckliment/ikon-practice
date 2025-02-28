import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function ErrorModal({ isOpen, onClose, message }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Softer Background Overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
              <Dialog.Title className="text-lg font-bold text-red-600">
                Error
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-gray-700">
                {message}
              </Dialog.Description>
              <div className="mt-4 flex justify-end">
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

import {
  ChangeEventHandler,
  FormEventHandler,
  useCallback,
  useState,
} from "react";
import Image from "next/image";

import systemImage from "@/assets/system.png";

interface InstructionFormProps {
  onInstructionAdded?: (instruction: string) => void;
}

export function InstructionForm({ onInstructionAdded }: InstructionFormProps) {
  const [text, setText] = useState("");

  const handleInstructionChange = useCallback<
    ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setText(event.target.value);
  }, []);

  const handleInstructionSubmit = useCallback<
    FormEventHandler<HTMLFormElement>
  >(
    (event) => {
      event.preventDefault();

      if (!text) return;

      onInstructionAdded?.(text);

      setText("");
    },
    [onInstructionAdded, text]
  );

  return (
    <form
      className="group w-full focus-within:outline focus-within:outline-gray-400  pl-4 bg-gray-200 rounded-md py-3"
      onSubmit={handleInstructionSubmit}
    >
      <input
        type="text"
        placeholder="Write a system instruction for the assistant"
        className="w-full bg-transparent outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600"
        value={text}
        onChange={handleInstructionChange}
      />

      <div className="absolute right-4 items-center inset-y-0 hidden sm:flex">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none disabled:opacity-40"
        >
          <Image
            className="h-6 w-6 text-gray-600"
            src={systemImage}
            alt="User"
          />
        </button>
      </div>
    </form>
  );
}

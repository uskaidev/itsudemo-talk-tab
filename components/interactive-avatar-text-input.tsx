import React from "react";
import { Button, Input } from "@nextui-org/react";

interface InteractiveAvatarTextInputProps {
  disabled?: boolean;
  input: string;
  label?: string;
  loading?: boolean;
  placeholder?: string;
  setInput: (value: string) => void;
  onSubmit: () => void;
}

export default function InteractiveAvatarTextInput({
  disabled = false,
  input,
  label,
  loading = false,
  placeholder,
  setInput,
  onSubmit,
}: InteractiveAvatarTextInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="w-full flex gap-2">
      <Input
        disabled={disabled || loading}
        label={label}
        placeholder={placeholder}
        value={input}
        onKeyDown={handleKeyDown}
        onValueChange={setInput}
      />
      <Button
        isDisabled={disabled || loading || !input}
        isLoading={loading}
        className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white"
        onPress={onSubmit}
      >
        Send
      </Button>
    </div>
  );
}

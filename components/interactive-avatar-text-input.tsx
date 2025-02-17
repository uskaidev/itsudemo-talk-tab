import { Input, Spinner, Tooltip, Button } from "@nextui-org/react";
import { PaperPlaneRight } from "@phosphor-icons/react";

interface InteractiveAvatarTextInputProps {
  label: string;
  placeholder: string;
  input: string;
  onSubmit: () => void;
  setInput: (value: string) => void;
  endContent?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export default function InteractiveAvatarTextInput({
  label,
  placeholder,
  input,
  onSubmit,
  setInput,
  endContent,
  disabled = false,
  loading = false,
}: InteractiveAvatarTextInputProps) {
  function handleSubmit() {
    if (input.trim() === "") {
      return;
    }
    onSubmit();
    setInput("");
  }

  return (
    <Input
      endContent={
        <div className="flex flex-row items-center h-full">
          {endContent}
          <Tooltip content="Send message">
            {loading ? (
              <Spinner
                className="text-indigo-300 hover:text-indigo-200"
                size="sm"
                color="default"
              />
            ) : (
              <Button
                isIconOnly
                variant="light"
                onPress={handleSubmit}
                aria-label="メッセージを送信"
                isDisabled={disabled}
              >
                <PaperPlaneRight
                  className="text-indigo-300 hover:text-indigo-200"
                  size={24}
                />
              </Button>
            )}
          </Tooltip>
        </div>
      }
      label={label}
      placeholder={placeholder}
      size="sm"
      value={input}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSubmit();
        }
      }}
      onValueChange={setInput}
      isDisabled={disabled}
    />
  );
}

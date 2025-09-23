import React, { useState } from "react";
import { Dialog, Portal, Button, Input, Field, CloseButton, Text } from "@chakra-ui/react";
import { colorTokens } from "@/app/components/theme/theme";
import { toaster } from "@/components/ui/toaster";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (tweetUrl: string) => Promise<void>;
  taskTitle: string;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  taskTitle,
}) => {
  const [tweetUrl, setTweetUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!tweetUrl) {
      setError("Please enter a valid Tweet URL.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await onComplete(tweetUrl);
      toaster.create({
        title: "Task completed.",
        description: "Your points have been updated.",
        type: "success",
        duration: 5000,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to complete task. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTweetUrl("");
    setError(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(details) => !details.open && handleClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg={colorTokens.blackCustom.a1} color="white">
            <Dialog.Header>
              <Dialog.Title>Complete Task: {taskTitle}</Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="2" right="2" />
            </Dialog.CloseTrigger>
            <Dialog.Body>
              <Field.Root invalid={!!error} mt={4}>
                <Input
                  placeholder="https://x.com/username/status/12345"
                  value={tweetUrl}
                  onChange={(e) => setTweetUrl(e.target.value)}
                  _placeholder={{ color: colorTokens.gray.platinum }}
                  borderColor={colorTokens.gray.dark}
                />
                {error && (
                  <Text color="red.500" mt={2} fontSize="sm">
                    {error}
                  </Text>
                )}
              </Field.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" mr={3} onClick={handleClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={handleSubmit}
                loading={isLoading}
                bg={colorTokens.green.erin}
                color={colorTokens.blackCustom.a1}
                _hover={{ bg: colorTokens.green.darkErin }}
              >
                Complete
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

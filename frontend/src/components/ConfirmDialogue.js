import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Text } from "@chakra-ui/react";

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    children,
    cancelText = "Cancel",
    confirmText = "Confirm",
    headerTextColor,
    bodyTextColor,
    cancelButtonColorScheme,
    confirmButtonColorScheme = "blue",
}) => (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
            {title !== "" && <ModalHeader color={headerTextColor}>{title}</ModalHeader>}
            {description !== "" && (
                <ModalBody>{children || <Text color={bodyTextColor}>{description}</Text>}</ModalBody>
            )}
            <ModalFooter>
                <Button variant="ghost" mr={5} colorScheme={cancelButtonColorScheme} onClick={onClose}>
                    {cancelText}
                </Button>
                <Button colorScheme={confirmButtonColorScheme} onClick={onConfirm}>
                    {confirmText}
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
);

export default ConfirmDialog;

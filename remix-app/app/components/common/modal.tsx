import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';

interface CommonModalProps {
  header: string;
  body: React.ReactNode;
  modalSize?: string;
  isOpen: boolean;
  onClose: () => void;
}
export const CommonModal = (props: CommonModalProps) => {
  const { header, body, modalSize, isOpen, onClose } = props;
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize ?? '2xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{header}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>{body}</ModalBody>

        <ModalFooter>
          <Button colorScheme="iconButton" mr={3}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

interface FormModalProps {
  header: string;
  body: React.ReactNode;
  modalSize?: string;
  isOpen: boolean;
  onClose: () => void;
  name: string;
}
export const FormModal = (props: FormModalProps) => {
  const { header, body, modalSize, isOpen, onClose, name } = props;
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize ?? '2xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{header}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>{body}</ModalBody>

        <ModalFooter>
          <Button colorScheme="iconButton" mr={3} type="submit" name={name}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

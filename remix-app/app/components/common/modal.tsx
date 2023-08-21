import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
} from '@chakra-ui/react';
import { useSubmit, Form } from '@remix-run/react';
import type { FormEvent, ReactNode } from 'react';
import { useTransitionState } from '../../hooks';

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
          <Button colorScheme='iconButton' mr={3}>
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
  body: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  value: string;
  modalSize?: string;
}
export const FormModal = (props: FormModalProps) => {
  const { isLoading } = useTransitionState();
  const submit = useSubmit();
  const { header, body, modalSize, isOpen, onClose, value } = props;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    submit(e.currentTarget);
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize ?? '2xl'}>
      <ModalOverlay />
      <ModalContent as={Form} method='post' onSubmit={handleSubmit}>
        <ModalHeader>{header}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>{body}</ModalBody>

        <ModalFooter>
          <Button
            colorScheme='iconButton'
            mr={3}
            type='submit'
            name='intent'
            value={value}
            disabled={isLoading}
          >
            {isLoading ? <Spinner>Save</Spinner> : 'Save'}
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

import React from 'react'
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button} from "@nextui-org/react"
import { useTranslation } from 'react-i18next';

const FailedModal = ({ show, onConfirm, onCancel }) => {
  const { t } = useTranslation()

  const handleRefresh = () => {
    onConfirm && onConfirm()
  }

  const handleExit = () => {
    onCancel && onCancel()
  }
  return (
    <Modal isOpen={show} hideCloseButton={true}>
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">{t('Warning')}</ModalHeader>
          <ModalBody>
            <p>{t('NAT failed')}</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleExit}>
              {t('Exit')}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  )
}

export default FailedModal

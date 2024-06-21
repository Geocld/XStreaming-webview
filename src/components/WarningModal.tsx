import React from 'react'
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button} from "@nextui-org/react"

const WarningModal = ({ show, onConfirm, onCancel }) => {
  const handleConfirm = () => {
    onConfirm && onConfirm()
  }

  const handleCancel = () => {
    onCancel && onCancel()
  }
  return (
    <Modal isOpen={show}>
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">提示</ModalHeader>
          <ModalBody>
            <p>Xbox似乎很久没有返回画面，请尝试重新连接Xbox或重启Xbox后重试。</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleCancel}>
              继续等待
            </Button>
            <Button color="primary" onPress={handleConfirm}>
              退出
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  )
}

export default WarningModal

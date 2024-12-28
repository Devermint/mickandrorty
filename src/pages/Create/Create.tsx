import { useToast, Box, VStack, Input, HStack, Button, Text, Image, Flex } from '@chakra-ui/react'
import CreateForm from 'components/CreateForm/CreateForm'
import { useRef, useState } from 'react'

const Create = () => {
  return (
    <Flex>
      <CreateForm></CreateForm>
    </Flex>
  )
}

export default Create

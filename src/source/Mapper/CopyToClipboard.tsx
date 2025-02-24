import {
  chakra,
  IconButton,
  useClipboard,
  useDisclosure,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'

function CopyToClipboard({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const { hasCopied, onCopy } = useClipboard(text, 1000)
  const [copied, setCopied] = useState(false)
  // have to implement controlled tooltip because of the issue - https://github.com/chakra-ui/chakra-ui/issues/7107
  const { onOpen, onClose } = useDisclosure()

  useEffect(() => {
    if (hasCopied) {
      setCopied(true)
    }
    else {
      setCopied(false)
    }
  }, [hasCopied])

  return (
    <span>
      <IconButton
        aria-label="copy"
        icon={<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.91 3H5.272C4.57 3 4 3.57 4 4.273v8.909h1.273v-8.91h7.636V3zm1.908 2.545h-7c-.703 0-1.273.57-1.273 1.273v8.91c0 .702.57 1.272 1.273 1.272h7c.703 0 1.273-.57 1.273-1.273V6.818c0-.703-.57-1.273-1.273-1.273zm0 10.182h-7V6.818h7v8.91z" /></svg>}
        w="20px"
        h="20px"
        variant="simple"
        colorScheme="#25d30f"
        _hover={{ color: '#25d30f' }}
        display="inline-block"
        flexShrink={0}
        onClick={onCopy}
        className={className}
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
      />
      {copied ? 'Copied' : 'Copy'}
    </span>
  )
}

export default React.memo(chakra(CopyToClipboard))

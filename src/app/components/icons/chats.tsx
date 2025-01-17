import { chakra } from '@chakra-ui/react';

export default function ChatsIcon(strokeColor: string) {
    return (
        <chakra.svg stroke={strokeColor} width="36px" height="36px" strokeWidth="1.5" fillOpacity="0" strokeLinecap="round" strokeLinejoin="round" >
            <path d="M18.5 28C24.023 28 28.5 23.523 28.5 18C28.5 12.477 24.023 8 18.5 8C12.977 8 8.5 12.477 8.5 18C8.5 19.821 8.987 21.53 9.838 23L9 27.5L13.5 26.662C15.0196 27.5408 16.7445 28.0024 18.5 28Z" />
        </chakra.svg>
    )
}

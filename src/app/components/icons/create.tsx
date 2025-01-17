import { chakra } from '@chakra-ui/react';

export default function CreateIcon(strokeColor: string) {
    return (
        <chakra.svg stroke={strokeColor} width="36px" height="36px" strokeWidth="1.5" fillOpacity="0" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.1 18H18.1M18.1 18H22.1M18.1 18V14M18.1 18V22M18.1 28C23.623 28 28.1 23.523 28.1 18C28.1 12.477 23.623 8 18.1 8C12.577 8 8.10004 12.477 8.10004 18C8.10004 23.523 12.577 28 18.1 28Z" />
        </chakra.svg>
    )
}

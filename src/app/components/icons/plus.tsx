import { chakra } from '@chakra-ui/react';

export default function PlusIcon(strokeColor: string) {
    return (
        <chakra.svg stroke="none" width="20px" height="20px" viewBox="0 0 20 20">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM15 11H11V15H9V11H5V9H9V5H11V9H15V11Z" fill={strokeColor} />
        </chakra.svg>
    )
}

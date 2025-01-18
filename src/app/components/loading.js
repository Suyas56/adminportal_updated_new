'use client'

import styled from 'styled-components'
import Image from 'next/image'

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
`;

export default function Loading() {
    return (
        <LoadingContainer>
            <Image
                src="/loading.svg"
                alt="Loading..."
                width={100}
                height={100}
                priority={true}
                style={{
                    width: '100px',
                    height: '100px'
                }}
            />
        </LoadingContainer>
    )
}

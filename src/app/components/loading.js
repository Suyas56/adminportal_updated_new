'use client'

import Image from 'next/image'
import styled from 'styled-components'

const LoadingContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;

  .loading-image {
    width: 100px;
    height: 100px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

export default function Loading() {
  return (
    <LoadingContainer>
      <Image
        src="/loading.svg"
        alt="Loading..."
        width={100}
        height={100}
        className="loading-image"
        priority
      />
    </LoadingContainer>
  )
}

'use client'

import { CircularProgress } from '@mui/material'
import styled from 'styled-components'

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`

export default function Loading() {
  return (
    <LoadingContainer>
      <CircularProgress />
    </LoadingContainer>
  )
}
